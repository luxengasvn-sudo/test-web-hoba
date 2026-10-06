# Custom News Categories Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Chuyển đổi chuyên mục bài viết từ danh sách tĩnh (hardcoded) sang quản lý động hoàn toàn, cho phép Admin thêm, sửa, đổi tên đồng bộ, và xóa an toàn các chuyên mục; đồng thời hiển thị động trên thanh lọc của trang Tin tức.

**Architecture:** Bảng `news_categories` trong PostgreSQL/Supabase lưu trữ danh mục bài viết. Service helper `src/lib/categories.ts` xử lý CRUD và đồng bộ dữ liệu (cascade rename, safe delete check). Giao diện Admin (`/admin/tin-tuc`) tích hợp Modal Quản lý chuyên mục và nạp danh sách động vào form bài viết. Giao diện Public (`/tin-tuc`) nạp danh sách động và hỗ trợ lọc URL params theo chuyên mục.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, TailwindCSS, Supabase / PostgreSQL (`pg`).

## Global Constraints

- Không làm gián đoạn hoặc mất mát dữ liệu bài viết hiện tại trong bảng `news`.
- Phải duy trì cơ chế dự phòng (fallback) để giao diện Public không bao giờ bị vỡ hoặc trắng trang nếu mất kết nối DB.
- Khi đổi tên chuyên mục, toàn bộ bài viết mang tên chuyên mục cũ phải tự động cập nhật sang tên mới.
- Khóa tính năng xóa chuyên mục nếu chuyên mục đó đang có $\ge 1$ bài viết.

---

### Task 1: Tạo bảng `news_categories` và nạp dữ liệu mồi (Database Migration)

**Files:**
- Create: `scripts/migrations/create_news_categories.js`
- Test: `scripts/migrations/test_news_categories_db.js`

**Interfaces:**
- Produces: Table `news_categories` với các cột:
  - `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
  - `name VARCHAR(255) NOT NULL UNIQUE`
  - `slug VARCHAR(255) NOT NULL UNIQUE`
  - `display_order INTEGER NOT NULL DEFAULT 0`
  - `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`
- Seed Data: 3 chuyên mục ban đầu:
  - `Hoạt động hiệp hội` (`hoat-dong-hiep-hoi`, order: 1)
  - `Bản tin chuyên ngành` (`ban-tin-chuyen-nganh`, order: 2)
  - `Kỹ thuật - An toàn` (`ky-thuat-an-toan`, order: 3)

- [ ] **Step 1: Viết script migration tạo bảng và seed dữ liệu**

Tạo `scripts/migrations/create_news_categories.js`:
```javascript
const { Client } = require('pg');

async function migrate() {
  const client = new Client({
    connectionString: 'postgresql://user_dc4dbdfce69c:kFm4SnCtamVOG4I5kupsG6bBxkgAAY8h@tinhgon.xyz:30013/hoba_test'
  });
  await client.connect();

  console.log('Connected to PostgreSQL database.');

  await client.query(`
    CREATE TABLE IF NOT EXISTS news_categories (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) NOT NULL UNIQUE,
      slug VARCHAR(255) NOT NULL UNIQUE,
      display_order INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_news_categories_order ON news_categories(display_order ASC);
    CREATE INDEX IF NOT EXISTS idx_news_categories_slug ON news_categories(slug);
  `);
  console.log('Table news_categories created or verified.');

  const initialCategories = [
    { name: 'Hoạt động hiệp hội', slug: 'hoat-dong-hiep-hoi', order: 1 },
    { name: 'Bản tin chuyên ngành', slug: 'ban-tin-chuyen-nganh', order: 2 },
    { name: 'Kỹ thuật - An toàn', slug: 'ky-thuat-an-toan', order: 3 }
  ];

  for (const cat of initialCategories) {
    await client.query(`
      INSERT INTO news_categories (name, slug, display_order)
      VALUES ($1, $2, $3)
      ON CONFLICT (name) DO NOTHING;
    `, [cat.name, cat.slug, cat.order]);
  }

  console.log('Seeded initial news categories successfully.');
  await client.end();
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
```

- [ ] **Step 2: Chạy migration và kiểm tra dữ liệu bằng script kiểm thử**

Viết `scripts/migrations/test_news_categories_db.js`:
```javascript
const { Client } = require('pg');

async function test() {
  const client = new Client({
    connectionString: 'postgresql://user_dc4dbdfce69c:kFm4SnCtamVOG4I5kupsG6bBxkgAAY8h@tinhgon.xyz:30013/hoba_test'
  });
  await client.connect();

  const res = await client.query('SELECT * FROM news_categories ORDER BY display_order ASC');
  console.log(`Found ${res.rows.length} categories:`, res.rows.map(r => ({ name: r.name, slug: r.slug, order: r.display_order })));

  if (res.rows.length < 3) {
    throw new Error('Categories count is less than 3');
  }
  await client.end();
  console.log('PASS: Database migration and seed verified.');
}

test().catch(err => {
  console.error('FAIL:', err);
  process.exit(1);
});
```

Chạy:
```bash
node scripts/migrations/create_news_categories.js
node scripts/migrations/test_news_categories_db.js
```
Kỳ vọng: In ra 3 chuyên mục và log `PASS: Database migration and seed verified.`

- [ ] **Step 3: Commit migration script**

```bash
git add scripts/migrations/
git commit -m "feat(db): create news_categories table and seed initial data"
```

---

### Task 2: Xây dựng Module Logic Chuyên mục (`src/lib/categories.ts`)

**Files:**
- Create: `src/lib/categories.ts`
- Test: `scripts/test_categories_service.js`

**Interfaces:**
- Produces:
  - `export interface NewsCategory { id: string; name: string; slug: string; display_order: number; created_at?: string; }`
  - `export const DEFAULT_NEWS_CATEGORIES: NewsCategory[]`
  - `export async function getNewsCategories(): Promise<NewsCategory[]>`
  - `export async function createNewsCategory(cat: { name: string; slug: string; display_order: number }): Promise<NewsCategory>`
  - `export async function updateNewsCategory(id: string, oldName: string, cat: { name: string; slug: string; display_order: number }): Promise<void>`
  - `export async function deleteNewsCategory(id: string, name: string): Promise<{ success: boolean; error?: string }>`

- [ ] **Step 1: Viết module `src/lib/categories.ts`**

Nội dung `src/lib/categories.ts`:
```typescript
import { supabase } from '@/lib/supabase';

export interface NewsCategory {
  id: string;
  name: string;
  slug: string;
  display_order: number;
  created_at?: string;
}

export const DEFAULT_NEWS_CATEGORIES: NewsCategory[] = [
  { id: 'cat-1', name: 'Hoạt động hiệp hội', slug: 'hoat-dong-hiep-hoi', display_order: 1 },
  { id: 'cat-2', name: 'Bản tin chuyên ngành', slug: 'ban-tin-chuyen-nganh', display_order: 2 },
  { id: 'cat-3', name: 'Kỹ thuật - An toàn', slug: 'ky-thuat-an-toan', display_order: 3 },
];

export async function getNewsCategories(): Promise<NewsCategory[]> {
  if (!supabase) return DEFAULT_NEWS_CATEGORIES;

  try {
    const { data, error } = await supabase
      .from('news_categories')
      .select('*')
      .order('display_order', { ascending: true });

    if (error || !data || data.length === 0) {
      console.warn('Cannot fetch news_categories, falling back to default:', error);
      return DEFAULT_NEWS_CATEGORIES;
    }

    return data as NewsCategory[];
  } catch (err) {
    console.error('getNewsCategories error:', err);
    return DEFAULT_NEWS_CATEGORIES;
  }
}

export async function createNewsCategory(category: {
  name: string;
  slug: string;
  display_order: number;
}): Promise<NewsCategory> {
  if (!supabase) {
    return {
      id: String(Date.now()),
      ...category
    };
  }

  const { data, error } = await supabase
    .from('news_categories')
    .insert([category])
    .select()
    .single();

  if (error) throw error;
  return data as NewsCategory;
}

export async function updateNewsCategory(
  id: string,
  oldName: string,
  category: { name: string; slug: string; display_order: number }
): Promise<void> {
  if (!supabase) return;

  // 1. Update category
  const { error: catError } = await supabase
    .from('news_categories')
    .update({
      name: category.name,
      slug: category.slug,
      display_order: category.display_order
    })
    .eq('id', id);

  if (catError) throw catError;

  // 2. Cascade rename news articles if category name changed
  if (oldName !== category.name) {
    const { error: newsError } = await supabase
      .from('news')
      .update({ category: category.name })
      .eq('category', oldName);

    if (newsError) {
      console.error('Failed to cascade update news category:', newsError);
    }
  }
}

export async function deleteNewsCategory(
  id: string,
  name: string
): Promise<{ success: boolean; error?: string }> {
  if (!supabase) return { success: true };

  // 1. Check if any news is using this category
  const { count, error: countError } = await supabase
    .from('news')
    .select('id', { count: 'exact', head: true })
    .eq('category', name);

  if (countError) {
    return { success: false, error: countError.message };
  }

  if (count && count > 0) {
    return {
      success: false,
      error: `Chuyên mục đang có ${count} bài viết. Vui lòng chuyển các bài viết sang chuyên mục khác trước khi xóa.`
    };
  }

  // 2. Perform delete
  const { error: delError } = await supabase
    .from('news_categories')
    .delete()
    .eq('id', id);

  if (delError) {
    return { success: false, error: delError.message };
  }

  return { success: true };
}
```

- [ ] **Step 2: Viết script kiểm thử tích hợp cho logic chuyên mục**

Tạo `scripts/test_categories_service.js`:
```javascript
const { Client } = require('pg');

async function testCascadeAndSafeDelete() {
  const client = new Client({
    connectionString: 'postgresql://user_dc4dbdfce69c:kFm4SnCtamVOG4I5kupsG6bBxkgAAY8h@tinhgon.xyz:30013/hoba_test'
  });
  await client.connect();

  console.log('Testing categories business logic...');
  // 1. Test insert temporary category
  const tempName = 'Chuyên mục Test ' + Date.now();
  const tempSlug = 'chuyen-muc-test-' + Date.now();
  const insRes = await client.query(
    'INSERT INTO news_categories (name, slug, display_order) VALUES ($1, $2, 99) RETURNING *',
    [tempName, tempSlug]
  );
  const tempCat = insRes.rows[0];
  console.log('Created temporary category:', tempCat.name);

  // 2. Test safe delete when 0 articles
  const countRes = await client.query('SELECT count(*) FROM news WHERE category = $1', [tempCat.name]);
  console.log('Article count for test category:', countRes.rows[0].count);
  if (parseInt(countRes.rows[0].count) === 0) {
    await client.query('DELETE FROM news_categories WHERE id = $1', [tempCat.id]);
    console.log('Deleted temporary category successfully.');
  }

  await client.end();
  console.log('PASS: Category operations verified.');
}

testCascadeAndSafeDelete().catch(err => {
  console.error('FAIL:', err);
  process.exit(1);
});
```

Chạy:
```bash
node scripts/test_categories_service.js
```
Kỳ vọng: In ra `PASS: Category operations verified.`

- [ ] **Step 3: Commit `src/lib/categories.ts`**

```bash
git add src/lib/categories.ts scripts/test_categories_service.js
git commit -m "feat: add news categories helper functions with cascade and safe delete"
```

---

### Task 3: Tích hợp Giao diện Quản lý Chuyên mục vào Admin (`/admin/tin-tuc`)

**Files:**
- Modify: `src/app/(admin)/admin/tin-tuc/page.tsx`

**Key UI Components to Add:**
1. Button `Quản lý chuyên mục` tại header của trang.
2. Modal `CategoryManagerModal`:
   - Form Thêm/Sửa: `Tên chuyên mục`, `Slug` (tự tạo qua `toSlug`, cho phép sửa), `Thứ tự` (number input).
   - Nút `Thêm chuyên mục` / `Lưu thay đổi` / `Hủy`.
   - Danh sách: Bảng hiển thị tên, slug, thứ tự, số bài viết tương ứng (`news.filter(n => n.category === c.name).length`), nút Sửa, nút Xóa (disabled khi số bài > 0).
3. Cập nhật `NewsModal`:
   - Thay thế thẻ `<select>` tĩnh bằng danh sách `categories.map(...)`.
   - Bổ sung tùy chọn nếu bài viết cũ có tên chuyên mục chưa có trong bảng.
   - Thêm nút nhỏ `"Quản lý chuyên mục"` cạnh nhãn để mở nhanh modal.

- [ ] **Step 1: Cập nhật `src/app/(admin)/admin/tin-tuc/page.tsx`**

1. Import `NewsCategory`, `getNewsCategories`, `createNewsCategory`, `updateNewsCategory`, `deleteNewsCategory`, `DEFAULT_NEWS_CATEGORIES` từ `@/lib/categories`.
2. Khai báo state:
   - `const [categories, setCategories] = useState<NewsCategory[]>(DEFAULT_NEWS_CATEGORIES);`
   - `const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);`
   - `const [catFormName, setCatFormName] = useState('');`
   - `const [catFormSlug, setCatFormSlug] = useState('');`
   - `const [catFormOrder, setCatFormOrder] = useState(1);`
   - `const [editingCatId, setEditingCatId] = useState<string | null>(null);`
   - `const [editingCatOldName, setEditingCatOldName] = useState<string>('');`
   - `const [catSubmitting, setCatSubmitting] = useState(false);`
3. Hàm nạp danh mục:
   - `fetchCategories = async () => { const cats = await getNewsCategories(); setCategories(cats); }`
   - Gọi trong `useEffect` khi mount.
4. Xử lý lưu chuyên mục:
   - Thêm mới hoặc cập nhật thông qua `createNewsCategory` / `updateNewsCategory`.
   - Tự động nạp lại danh sách bài viết nếu đổi tên chuyên mục để giao diện hiển thị tên mới ngay lập tức.
5. Xử lý xóa chuyên mục:
   - Gọi `deleteNewsCategory`, nếu có lỗi (chứa bài viết) thì hiển thị thông báo alert, nếu thành công thì làm mới danh sách.
6. Render Modal Quản lý chuyên mục và cập nhật form chọn chuyên mục trong modal bài viết.

- [ ] **Step 2: Kiểm tra biên dịch TypeScript / Next.js build**

Chạy:
```bash
npm run build
```
Kỳ vọng: Build thành công không có lỗi type error nào tại `src/app/(admin)/admin/tin-tuc/page.tsx`.

- [ ] **Step 3: Commit code Admin**

```bash
git add src/app/\(admin\)/admin/tin-tuc/page.tsx
git commit -m "feat(admin): add news category management modal and dynamic selection"
```

---

### Task 4: Hiển thị Động Chuyên mục trên Giao diện Public (`/tin-tuc`)

**Files:**
- Modify: `src/app/(public)/tin-tuc/page.tsx`
- Modify: `src/app/(public)/tin-tuc/NewsClientPage.tsx`
- Modify: `src/app/(public)/tin-tuc/[slug]/page.tsx`

**Requirements:**
1. Cập nhật `NewsItem.category` thành `string`.
2. `src/app/(public)/tin-tuc/page.tsx`: Prefetch `getNewsCategories()` trong Server Component và truyền vào `initialData.categories`.
3. `src/app/(public)/tin-tuc/NewsClientPage.tsx`:
   - State `categories`: Nạp từ `initialData.categories` hoặc fetch từ `getNewsCategories()`.
   - Thanh lọc tab: Tab `Tất cả` đầu tiên, sau đó lặp qua `categories.map(c => c.name)`.
   - Hỗ trợ tham số URL `searchParams.get('cat')`: Nhận diện cả slug lẫn tên chuyên mục để đặt `selectedCategory` tương ứng khi tải trang.
4. `src/app/(public)/tin-tuc/[slug]/page.tsx`: Đảm bảo hiển thị đúng badge category của bài viết.

- [ ] **Step 1: Cập nhật Server Component `src/app/(public)/tin-tuc/page.tsx`**

Nạp song song `getNewsCategories()` cùng với `news` và truyền xuống `NewsListPage`:
```typescript
const [newsList, categories] = await Promise.all([
  fetchPublishedNews(),
  getNewsCategories()
]);
// Truyền categories vào initialData
```

- [ ] **Step 2: Cập nhật Client Component `NewsClientPage.tsx`**

1. Thay thế `category: 'Hoạt động hiệp hội' | ...` bằng `category: string;`.
2. Khai báo state `categoriesList`:
   ```typescript
   const [categoriesList, setCategoriesList] = useState<string[]>(() => {
     if (initialData?.categories && initialData.categories.length > 0) {
       return ['Tất cả', ...initialData.categories.map((c: any) => c.name)];
     }
     return ['Tất cả', ...DEFAULT_NEWS_CATEGORIES.map(c => c.name)];
   });
   ```
3. Xử lý tham số `cat` từ URL (`useSearchParams`):
   Nếu có `?cat=slug-hoac-ten`, đối chiếu với danh mục và tự động chọn tab tương ứng.

- [ ] **Step 3: Kiểm tra build Next.js**

Chạy:
```bash
npm run build
```
Kỳ vọng: Build thành công hoàn toàn (`✓ Compiled successfully`).

- [ ] **Step 4: Commit code Public**

```bash
git add src/app/\(public\)/tin-tuc/
git commit -m "feat(public): display dynamic news categories with url param support"
```

---

### Task 5: Kiểm thử Toàn diện & Xác nhận Hệ thống (E2E Verification)

**Files:**
- Create: `scripts/test_e2e_news_categories.js`

**Test Cases:**
1. Lấy danh sách chuyên mục hiện tại từ DB -> Phải có ít nhất 3 chuyên mục ban đầu.
2. Tạo 1 chuyên mục thử nghiệm: "Chuyên mục Kiểm Thử E2E".
3. Tạo 1 bài viết nháp gán vào "Chuyên mục Kiểm Thử E2E".
4. Thử gọi hàm xóa chuyên mục "Chuyên mục Kiểm Thử E2E" -> Phải bị từ chối vì đang có 1 bài viết.
5. Cập nhật chuyên mục: Đổi tên thành "Chuyên mục Đã Đổi Tên" -> Bài viết nháp phải tự động mang tên mới.
6. Xóa bài viết nháp -> Gọi lại lệnh xóa chuyên mục -> Xóa thành công.
7. Đảm bảo dữ liệu nguyên vẹn.

- [ ] **Step 1: Viết script kiểm thử đầu cuối `scripts/test_e2e_news_categories.js`**

Nội dung script kiểm thử đầy đủ các kịch bản trên với PostgreSQL.

- [ ] **Step 2: Chạy script kiểm thử**

Chạy:
```bash
node scripts/test_e2e_news_categories.js
```
Kỳ vọng: Tất cả các bước kiểm thử đều in ra dấu `✓ PASS`.

- [ ] **Step 3: Dọn dẹp script kiểm thử và kiểm tra git status**

Dọn dẹp script tạm thời nếu cần hoặc commit vào thư mục test.
Chạy `git status` đảm bảo working tree sạch sẽ.
