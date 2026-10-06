# Thiết kế kỹ thuật: Quản lý Chuyên mục Tin tức & Bài viết Tùy chỉnh (Custom News Categories)

- **Ngày tạo**: 2026-10-06
- **Trạng thái**: Đã phê duyệt (Approved)
- **Dự án**: HOBA LPG Website (hiep-hoi-v2)

---

## 1. Tổng quan & Mục tiêu

Hiện tại, chuyên mục tin tức của hệ thống đang bị gắn cố định trong mã nguồn (hardcoded gồm 3 mục: *Hoạt động hiệp hội, Bản tin chuyên ngành, Kỹ thuật - An toàn*). Quản trị viên không thể bổ sung thêm chuyên mục mới hoặc đổi tên theo nhu cầu thực tế của Hiệp hội.

Mục tiêu của thiết kế này là biến chuyên mục tin tức thành một thực thể dữ liệu linh hoạt, cho phép:
1. Quản trị viên (Admin) tự do thêm mới, sửa tên, chỉnh thứ tự hiển thị hoặc xóa chuyên mục (có kiểm tra an toàn dữ liệu).
2. Tự động đồng bộ các bài viết khi đổi tên chuyên mục.
3. Form viết bài mới / sửa bài viết tự động nạp danh sách chuyên mục động.
4. Giao diện công khai (`/tin-tuc`) hiển thị tab lọc chuyên mục động theo thứ tự do Admin quy định, hỗ trợ chia sẻ đường dẫn theo chuyên mục.

---

## 2. Kiến trúc Cơ sở dữ liệu (Database Schema)

### 2.1. Bảng mới: `news_categories`

Tạo bảng `news_categories` trong PostgreSQL / Supabase:

```sql
CREATE TABLE IF NOT EXISTS news_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  slug VARCHAR(255) NOT NULL UNIQUE,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Chỉ mục hỗ trợ sắp xếp và tra cứu nhanh
CREATE INDEX IF NOT EXISTS idx_news_categories_order ON news_categories(display_order ASC);
CREATE INDEX IF NOT EXISTS idx_news_categories_slug ON news_categories(slug);
```

### 2.2. Dữ liệu mồi ban đầu (Seed Data)

Khi khởi tạo bảng, hệ thống tự động nạp 3 danh mục mặc định để tương thích 100% với các bài viết hiện tại:
1. `Hoạt động hiệp hội` (slug: `hoat-dong-hiep-hoi`, order: 1)
2. `Bản tin chuyên ngành` (slug: `ban-tin-chuyen-nganh`, order: 2)
3. `Kỹ thuật - An toàn` (slug: `ky-thuat-an-toan`, order: 3)

### 2.3. Quy tắc toàn vẹn dữ liệu (Data Integrity Rules)

1. **Đổi tên chuyên mục**:
   * Khi đổi tên từ `A` sang `B`, hệ thống thực thi cập nhật đồng bộ các bài viết trong bảng `news`:
     ```sql
     UPDATE news SET category = $newName WHERE category = $oldName;
     ```
   * Đảm bảo mọi bài viết cũ tự động hiển thị theo tên chuyên mục mới.
2. **Xóa chuyên mục**:
   * Trước khi xóa, hệ thống kiểm tra số lượng bài viết đang dùng chuyên mục đó (`SELECT COUNT(*) FROM news WHERE category = $name`).
   * Nếu `COUNT > 0`: **Khóa nút xóa**, hiển thị thông báo yêu cầu người dùng đổi chuyên mục cho các bài viết trước khi thực hiện xóa.
   * Nếu `COUNT == 0`: Cho phép xóa chuyên mục an toàn khỏi bảng `news_categories`.

---

## 3. Thiết kế Giao diện Quản trị (Admin UI/UX)

Tệp ảnh hưởng: `src/app/(admin)/admin/tin-tuc/page.tsx`

### 3.1. Nút hành động tại Header
* Bổ sung nút **"Quản lý chuyên mục"** bên cạnh nút `+ Viết bài mới`.
* Icon: `category` hoặc `folder_open`.
* Kiểu dáng: Nút viền outline màu thương hiệu `border border-primary text-primary hover:bg-primary/5`.

### 3.2. Modal "Quản lý Chuyên mục"
Giao diện Modal gồm 2 khối:

1. **Khối Form Thêm mới / Cập nhật**:
   * **Tên chuyên mục**: Ô nhập văn bản bắt buộc.
   * **Đường dẫn (Slug)**: Tự động chuyển đổi từ Tên (sử dụng hàm `toSlug()`), cho phép chỉnh sửa tay.
   * **Thứ tự hiển thị**: Ô nhập số nguyên (mặc định tăng dần).
   * **Nút bấm**:
     * Trạng thái tạo mới: Nút `Thêm chuyên mục`.
     * Trạng thái chỉnh sửa: Nút `Lưu thay đổi` và nút `Hủy`.
2. **Khối Danh sách chuyên mục (Table)**:
   * Cột hiển thị:
     * **Tên chuyên mục** (kèm huy hiệu).
     * **Đường dẫn (Slug)**.
     * **Thứ tự**.
     * **Số lượng bài viết** (hiển thị số bài thực tế đang thuộc chuyên mục).
     * **Thao tác**:
       * Nút **Chỉnh sửa** (icon `edit`): Đẩy dữ liệu lên form để sửa.
       * Nút **Xóa** (icon `delete`):
         * Nếu `Số bài viết > 0`: Nút bị vô hiệu hóa (`disabled`, mờ màu), di chuột hiển thị tooltip giải thích.
         * Nếu `Số bài viết == 0`: Bấm để xác nhận và xóa.

### 3.3. Form Viết / Sửa bài viết (News Form Modal)
* Trường chọn **Chuyên mục**:
  * Thay thế danh sách hardcoded bằng danh sách động lấy từ bảng `news_categories`.
  * Nếu bài viết cũ có tên chuyên mục chưa nằm trong danh sách (dữ liệu đặc biệt), form vẫn giữ nguyên giá trị đó dưới dạng một tùy chọn tạm thời để tránh mất mát dữ liệu.
* Thêm nút text nhỏ `"Quản lý chuyên mục"` cạnh nhãn để mở nhanh modal khi cần.

---

## 4. Thiết kế Giao diện Người dùng (Public UI/UX)

Tệp ảnh hưởng: 
* `src/app/(public)/tin-tuc/page.tsx` (Server Component)
* `src/app/(public)/tin-tuc/NewsClientPage.tsx` (Client Component)
* `src/app/(public)/tin-tuc/[slug]/page.tsx` (Chi tiết bài viết)

### 4.1. Thanh Tabs Lọc Chuyên mục
* Nạp danh sách từ bảng `news_categories`, sắp xếp theo `display_order ASC`.
* Tab `Tất cả` luôn cố định ở vị trí đầu tiên.
* Các tab tiếp theo được render động theo danh mục thực tế.

### 4.2. Hỗ trợ Query Params URL
* Khi người dùng nhấp vào tab chuyên mục hoặc truy cập từ liên kết bên ngoài có định dạng `?cat=slug-chuyen-muc` (hoặc `?cat=Tên`), hệ thống tự động nhận diện và kích hoạt tab lọc tương ứng.

### 4.3. Huy hiệu Chuyên mục trên Thẻ bài viết & Trang chi tiết
* Mở rộng kiểu dữ liệu `NewsItem.category` từ enum cố định (`'Hoạt động hiệp hội' | ...`) thành `string`.
* Thẻ bài viết tự động hiển thị tên chuyên mục thực tế của bài viết.

### 4.4. Cơ chế Dự phòng khi mất kết nối (Offline/Error Fallback)
* Nếu không truy vấn được Supabase hoặc mạng gặp sự cố:
  * Hệ thống tự động fallback về 3 chuyên mục mặc định (*Hoạt động hiệp hội, Bản tin chuyên ngành, Kỹ thuật - An toàn*).
  * Đảm bảo website công khai không bao giờ bị gián đoạn hoạt động hay trắng trang.

---

## 5. Kế hoạch Kiểm thử & Xác minh (Verification Plan)

1. **Kiểm tra CSDL**:
   * Chạy script tạo bảng `news_categories` và nạp seed data thành công.
   * Xác nhận tính duy nhất (UNIQUE) của `name` và `slug`.
2. **Kiểm tra Quản trị Admin**:
   * Thêm chuyên mục mới (ví dụ: *"Đào tạo & Phát triển"*).
   * Tạo bài viết mới gán chuyên mục mới -> Lưu thành công.
   * Thử xóa chuyên mục đang có bài viết -> Xác nhận nút xóa bị khóa và có thông báo.
   * Đổi tên chuyên mục -> Xác nhận các bài viết cũ được cập nhật theo tên mới.
   * Xóa một chuyên mục không có bài viết -> Xóa thành công.
3. **Kiểm tra Giao diện Public**:
   * Truy cập `/tin-tuc`, kiểm tra tab chuyên mục mới xuất hiện đúng thứ tự.
   * Bấm vào tab chuyên mục mới -> Bộ lọc hiển thị đúng các bài viết thuộc chuyên mục đó.
   * Kiểm tra liên kết chia sẻ `/tin-tuc?cat=...` hoạt động mượt mà.
