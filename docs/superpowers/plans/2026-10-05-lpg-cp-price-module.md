# Kế hoạch Triển khai Module Giá CP LPG Saudi Aramco & Quản trị Admin

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Xây dựng trang hiển thị giá CP LPG thế giới Saudi Aramco (`/gia-cp-lpg`) và module quản trị nội bộ (`/admin/gia-cp-lpg`) để cập nhật giá hàng tháng, vẽ biểu đồ tương tác có bộ lọc theo năm, tính toán tác động lên bình 12kg và chạy kiểm thử local.

**Architecture:** Sử dụng Next.js App Router (React 19, TypeScript, Tailwind CSS v4). Lưu trữ dữ liệu trong bảng `website_config` (khóa `lpg_cp_data`) thông qua `db-proxy` / Supabase / PostgreSQL kết hợp `localStorage` fallback khi offline. Biểu đồ đường SVG tương tác native có tooltip responsive và bộ lọc năm linh hoạt.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS v4, Postgres (`pg`) / Supabase, SVG Data Visualization.

## Global Constraints

- Chạy test local tại cổng mặc định của dự án (`http://localhost:3010`), chưa gắn liên kết lên thanh điều hướng công khai chính ngoài trang chủ.
- Menu quản trị Admin thêm mục "Giá CP LPG" vào `Sidebar.tsx` với icon `trending_up`.
- Giữ nguyên cấu trúc dữ liệu chuẩn Aramco gồm Propane (C3), Butane (C4) USD/tấn; tự động tính CP Trung bình, chênh lệch MoM và giá quy đổi bình 12kg.
- Đầy đủ 22 tháng dữ liệu lịch sử mẫu từ tháng 01/2025 đến 10/2026 từ file gốc `gia-cp-lpg-hoba.html`.

---

### Task 1: Định nghĩa Kiểu dữ liệu & Dữ liệu Mặc định Ban đầu

**Files:**
- Create: `src/types/lpgCp.ts`
- Create: `src/lib/defaultLpgPrices.json`
- Test: `scripts/test_lpg_calculations.js`

**Interfaces:**
- Produces:
  - `LpgCpRecord`: `{ month: string; propane: number | null; butane: number | null; isPending?: boolean; note?: string }`
  - `LpgCpConfig`: `{ defaultFxRate: number; records: LpgCpRecord[]; updatedAt: string }`
  - Helper functions: `calculateAvgCp(r)`, `calculateMoM(curr, prev)`, `calculate12kgImpact(deltaCp, fxRate)`

- [ ] **Step 1: Tạo file dữ liệu mẫu `defaultLpgPrices.json`**
Trích xuất toàn bộ 22 tháng từ file gốc vào `src/lib/defaultLpgPrices.json`:
```json
{
  "defaultFxRate": 26300,
  "updatedAt": "2026-10-01T00:00:00.000Z",
  "records": [
    { "month": "2025-01", "propane": 625, "butane": 615, "isPending": false },
    { "month": "2025-02", "propane": 635, "butane": 625, "isPending": false },
    { "month": "2025-03", "propane": 615, "butane": 605, "isPending": false },
    { "month": "2025-04", "propane": 615, "butane": 605, "isPending": false },
    { "month": "2025-05", "propane": 610, "butane": 590, "isPending": false },
    { "month": "2025-06", "propane": 600, "butane": 570, "isPending": false },
    { "month": "2025-07", "propane": 575, "butane": 545, "isPending": false },
    { "month": "2025-08", "propane": 520, "butane": 490, "isPending": false },
    { "month": "2025-09", "propane": 520, "butane": 490, "isPending": false },
    { "month": "2025-10", "propane": 495, "butane": 475, "isPending": false },
    { "month": "2025-11", "propane": 475, "butane": 460, "isPending": false },
    { "month": "2025-12", "propane": 495, "butane": 485, "isPending": false },
    { "month": "2026-01", "propane": 525, "butane": 520, "isPending": false },
    { "month": "2026-02", "propane": 545, "butane": 540, "isPending": false },
    { "month": "2026-03", "propane": 545, "butane": 540, "isPending": false },
    { "month": "2026-04", "propane": 750, "butane": 800, "isPending": false },
    { "month": "2026-05", "propane": 750, "butane": 800, "isPending": false },
    { "month": "2026-06", "propane": 760, "butane": 820, "isPending": false },
    { "month": "2026-07", "propane": 580, "butane": 600, "isPending": false },
    { "month": "2026-08", "propane": 620, "butane": 640, "isPending": false },
    { "month": "2026-09", "propane": 625, "butane": 660, "isPending": false },
    { "month": "2026-10", "propane": null, "butane": null, "isPending": true }
  ]
}
```

- [ ] **Step 2: Tạo `src/types/lpgCp.ts`**
Định nghĩa type và các hàm tiện ích tính toán toán học/hiển thị:
```typescript
export interface LpgCpRecord {
  month: string;          // YYYY-MM
  propane: number | null;
  butane: number | null;
  isPending?: boolean;
  note?: string;
}

export interface LpgCpConfig {
  defaultFxRate: number;
  records: LpgCpRecord[];
  updatedAt: string;
}

export function getAverageCp(record: LpgCpRecord): number | null {
  if (record.propane === null || record.butane === null) return null;
  return (record.propane + record.butane) / 2;
}

export function formatMonthLabel(monthStr: string, short = false): string {
  const [year, month] = monthStr.split('-');
  if (short) return `T${parseInt(month, 10)}/${year.slice(2)}`;
  return `Tháng ${parseInt(month, 10)}/${year}`;
}

export function calculate12kgImpact(deltaCp: number, fxRate: number): number {
  // Công thức: thay đổi CP × 1,05 × 1,10 × tỷ giá / 1000 * 12
  const val = deltaCp * 1.05 * 1.10 * fxRate / 1000 * 12;
  return Math.round(val / 100) * 100;
}
```

- [ ] **Step 3: Viết script test tính toán `scripts/test_lpg_calculations.js`**
Xác minh hàm tính CP trung bình, độ chênh lệch MoM và công thức 12kg:
`node scripts/test_lpg_calculations.js`
Kỳ vọng: Test PASS.

- [ ] **Step 4: Commit**
`git add src/types/lpgCp.ts src/lib/defaultLpgPrices.json scripts/test_lpg_calculations.js`
`git commit -m "feat(lpg-cp): add types, default seed data and calculation utils"`

---

### Task 2: Xây dựng Trang Công khai `/gia-cp-lpg`

**Files:**
- Create: `src/app/(public)/gia-cp-lpg/page.tsx`
- Create: `src/app/(public)/gia-cp-lpg/LpgCpClientPage.tsx`
- Consumes: `src/types/lpgCp.ts`, `src/lib/defaultLpgPrices.json`

- [ ] **Step 1: Tạo Server Page `src/app/(public)/gia-cp-lpg/page.tsx`**
Khai báo metadata chuẩn SEO:
- Title: "Giá CP LPG thế giới Saudi Aramco hàng tháng | HOBA LPG"
- Description: "Bảng giá CP LPG (propane, butane) Saudi Aramco cập nhật hàng tháng, biểu đồ xu hướng theo năm và công cụ ước tính tác động tới giá gas bình 12kg."
- Fetch dữ liệu ban đầu từ `website_config` (key `lpg_cp_data`) hoặc fallback `defaultLpgPrices.json`.

- [ ] **Step 2: Xây dựng Client Component `LpgCpClientPage.tsx`**
Triển khai:
1. **Header & Mô tả:** Tiêu đề, nhãn tổ chức HOBA LPG.
2. **Top 3 Cards Thống kê tháng mới nhất:**
   - Propane (C3): Giá USD/tấn, mức tăng/giảm MoM.
   - Butane (C4): Giá USD/tấn, mức tăng/giảm MoM.
   - CP Trung bình: Giá USD/tấn, mức tăng/giảm MoM.
3. **Banner cảnh báo chờ công bố:** Hiện khi tháng hiện tại có `isPending === true`.
4. **Bộ lọc Năm:** Nút chọn `Tất cả các năm`, `12 tháng gần nhất`, `Năm 2026`, `Năm 2025`...
5. **Biểu đồ SVG tương tác:**
   - Vẽ đường Propane (#0e6b5c) và Butane (#b4540f).
   - Điểm tròn trên mỗi tháng có giá.
   - Hover / Touch Tooltip động hiển thị: Tháng, Propane, Butane, CP TB, Biến động MoM.
6. **Bảng số liệu chi tiết:**
   - Cột Tháng, Propane, Butane, CP Trung bình, So với tháng trước.
   - Tô màu xanh lá (giảm) / đỏ (tăng) / xám (bằng nhau).
7. **Máy tính tác động bình 12kg:**
   - Input `CP thay đổi (USD/tấn)` và `Tỷ giá (VND/USD)`.
   - Kết quả: "Giá nhập thay đổi khoảng ... đồng/bình 12kg (ước tính)".
8. **Khối FAQ (Hỏi - Đáp):**
   - 4 câu hỏi thường gặp với thẻ `<details>` và `<summary>`.

- [ ] **Step 3: Kiểm tra hiển thị trang trên trình duyệt**
Truy cập `http://localhost:3010/gia-cp-lpg`, kiểm tra giao diện, bộ lọc năm, tooltip biểu đồ và máy tính giá bình 12kg.

- [ ] **Step 4: Commit**
`git add src/app/(public)/gia-cp-lpg/page.tsx src/app/(public)/gia-cp-lpg/LpgCpClientPage.tsx`
`git commit -m "feat(lpg-cp): implement public page with interactive chart and year filter"`

---

### Task 3: Xây dựng Module Quản trị Admin `/admin/gia-cp-lpg`

**Files:**
- Create: `src/app/(admin)/admin/gia-cp-lpg/page.tsx`
- Modify: `src/components/admin/Sidebar.tsx`
- Consumes: `src/types/lpgCp.ts`, `src/lib/defaultLpgPrices.json`, `src/app/api/db-proxy/route.ts`

- [ ] **Step 1: Cập nhật Sidebar Admin `src/components/admin/Sidebar.tsx`**
Bổ sung mục menu:
- `label: 'Giá CP LPG'`
- `href: '/admin/gia-cp-lpg'`
- `icon: 'trending_up'`

- [ ] **Step 2: Xây dựng trang Admin `src/app/(admin)/admin/gia-cp-lpg/page.tsx`**
Triển khai:
1. **Thanh điều hướng trên cùng & Thống kê nhanh:**
   - Tổng số tháng, Tháng mới nhất, Tỷ giá hiện hành.
   - Nút "Thêm tháng mới", "Lưu thay đổi", "Xuất file JSON", "Nhập file JSON", "Khôi phục dữ liệu gốc".
2. **Modal Thêm / Chỉnh sửa tháng:**
   - Ô chọn Tháng (`type="month"`).
   - Ô nhập Propane & Butane (USD/tấn).
   - Checkbox "Đang chờ công bố" (khi tích, disable ô nhập số).
   - Ô ghi chú (tùy chọn).
3. **Bảng quản lý danh sách các tháng:**
   - Sắp xếp mới nhất ở trên cùng.
   - Hiển thị Tháng, Propane, Butane, CP Trung bình, Trạng thái (badge xanh/vàng).
   - Thao tác: Sửa, Xóa.
4. **Cấu hình Tỷ giá:**
   - Ô nhập Tỷ giá mặc định (VND/USD).
5. **Logic đồng bộ dữ liệu:**
   - Lưu vào `website_config` (key `lpg_cp_data`) qua `db-proxy`.
   - Lưu vào `localStorage` (`hoba_website_config_lpg_cp_data`) để dự phòng offline.
   - Hiển thị thông báo Toast thành công/thất bại.

- [ ] **Step 3: Kiểm tra trang admin trên trình duyệt**
Truy cập `http://localhost:3010/admin/gia-cp-lpg`, kiểm tra thêm, sửa, xóa, đổi tỷ giá, xuất/nhập JSON.

- [ ] **Step 4: Commit**
`git add src/components/admin/Sidebar.tsx src/app/(admin)/admin/gia-cp-lpg/page.tsx`
`git commit -m "feat(lpg-cp): implement admin management module and sidebar menu item"`

---

### Task 4: Kiểm thử E2E & Xác thực Nghiệp vụ

**Files:**
- Test / Verify: Toàn bộ luồng hoạt động giữa `/admin/gia-cp-lpg` và `/gia-cp-lpg`.

- [ ] **Step 1: Thêm tháng mới trong Admin và xác nhận hiển thị ngoài trang công khai**
- [ ] **Step 2: Đổi trạng thái từ "Chờ công bố" sang "Đã công bố" và kiểm tra banner biến mất**
- [ ] **Step 3: Thử bộ lọc các năm khác nhau (2026, 2025, 12 tháng, Tất cả) trên biểu đồ**
- [ ] **Step 4: Kiểm tra độ phản hồi Responsive trên kích thước màn hình Mobile (375px) và Desktop (1440px)**
- [ ] **Step 5: Kiểm tra tính toán máy tính 12kg với các giá trị khác nhau**
- [ ] **Step 6: Commit hoàn thiện**
`git commit -m "chore(lpg-cp): complete end-to-end verification and visual polish"`
