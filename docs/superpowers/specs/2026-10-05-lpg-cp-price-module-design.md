# Thiết kế Tính năng Giá CP LPG Saudi Aramco & Module Quản trị Admin

**Ngày lập:** 05/10/2026  
**Trạng thái:** Đã duyệt thiết kế (Approved)  
**Mục tiêu:** Xây dựng trang hiển thị giá CP LPG thế giới Saudi Aramco (`/gia-cp-lpg`) và trang quản trị nội bộ (`/admin/gia-cp-lpg`) để cập nhật giá, vẽ biểu đồ có bộ lọc theo năm, tính toán tác động giá gas bình 12kg, chạy kiểm thử local trên hệ thống Next.js hiện tại của HOBA LPG.

---

## 1. Tổng quan & Yêu cầu nghiệp vụ

- **Nguồn dữ liệu gốc:** Giá hợp đồng (CP - Contract Price) do Saudi Aramco công bố hàng tháng cho Propane (C3) và Butane (C4).
- **Phạm vi hiển thị công khai (`/gia-cp-lpg`):**
  - Thông tin giới thiệu & mốc tham chiếu cho thị trường Việt Nam.
  - 3 Thẻ chỉ số nổi bật: Propane, Butane, CP Trung bình (với biến động so với tháng trước MoM).
  - Cảnh báo "Chờ công bố chính thức" nếu tháng hiện tại chưa có số liệu.
  - Bộ lọc chọn theo năm: Các năm cụ thể (2026, 2025, 2024...), 12 tháng gần nhất, 24 tháng gần nhất, Tất cả các năm.
  - Biểu đồ đường (SVG tương tác) biểu diễn xu hướng giá C3 và C4, kèm tooltip chi tiết khi hover/touch.
  - Bảng dữ liệu thống kê chi tiết theo các tháng trong khoảng thời gian đã chọn.
  - Công cụ tính toán ước tính tác động giá nhập khẩu lên bình gas dân dụng 12kg theo tỷ giá thời gian thực.
  - Mục Hỏi - Đáp (FAQ) thường gặp về giá CP Aramco.
- **Phạm vi trang quản trị Admin (`/admin/gia-cp-lpg`):**
  - Tích hợp vào Menu Sidebar của Admin (icon `trending_up` / `analytics`).
  - Danh sách bảng tổng hợp các tháng đã nhập (sắp xếp giảm dần theo thời gian).
  - Thêm mới tháng (Chọn YYYY-MM, nhập giá Propane, Butane, cờ trạng thái "Chờ công bố").
  - Chỉnh sửa và xóa từng tháng có xác nhận.
  - Chỉnh sửa Tỷ giá mặc định USD/VND.
  - Công cụ sao lưu & kiểm thử: Xuất dữ liệu JSON (Export), Nhập dữ liệu JSON (Import), Khôi phục dữ liệu mẫu gốc (Reset).
- **Phạm vi triển khai:**
  - Chạy thử nghiệm local trên `http://localhost:3010`.
  - Chưa gắn link vào Header / Navigation menu công khai ngoài trang chủ cho đến khi nghiệm thu chính thức.

---

## 2. Kiến trúc & Mô hình dữ liệu

### 2.1. Cấu trúc dữ liệu (`LpgCpConfig`)
Lưu trữ trong bảng `website_config` của Postgres/Supabase với `key = 'lpg_cp_data'`, hỗ trợ fallback `localStorage` (`hoba_website_config_lpg_cp_data`) và file dữ liệu mặc định (`src/lib/defaultLpgPrices.json`).

```typescript
export interface LpgCpRecord {
  month: string;          // "YYYY-MM" (ví dụ: "2026-10")
  propane: number | null; // USD/tấn
  butane: number | null;  // USD/tấn
  isPending?: boolean;    // true nếu đang chờ công bố
  note?: string;          // ghi chú tùy chọn
}

export interface LpgCpConfig {
  defaultFxRate: number;  // Tỷ giá tham chiếu (mặc định 26.300 VND/USD)
  records: LpgCpRecord[]; // Danh sách các tháng
  updatedAt: string;      // ISO String thời điểm cập nhật cuối
}
```

### 2.2. Dữ liệu ban đầu (Seed Data)
Bao gồm 22 tháng từ `2025-01` đến `2026-10` trích xuất từ file gốc `gia-cp-lpg-hoba.html`:
- 2025: 12 tháng từ 2025-01 (625, 615) đến 2025-12 (495, 485).
- 2026: 9 tháng đã công bố từ 2026-01 đến 2026-09 (625, 660), và tháng 2026-10 ở trạng thái `isPending = true` (null, null).

### 2.3. Công thức tính toán
- **CP Trung bình:**
  $$\text{CP}_{\text{avg}} = \frac{\text{Propane} + \text{Butane}}{2}$$
- **Chênh lệch so với tháng trước (MoM):**
  $$\Delta \text{CP} = \text{CP}_{\text{avg}}(M) - \text{CP}_{\text{avg}}(M-1)$$
- **Tác động giá bình gas 12kg:**
  $$\text{Tác động (VND/bình 12kg)} = \Delta \text{CP} \times 1.05 \times 1.10 \times \text{Tỷ giá} \times \frac{12}{1000}$$
  (Làm tròn đến 100đ).

---

## 3. Thiết kế Giao diện & Tương tác

### 3.1. Trang công khai: `/gia-cp-lpg`
- **File:** `src/app/(public)/gia-cp-lpg/page.tsx` & `LpgCpClientPage.tsx`.
- **Phong cách thị giác:** Tông màu chủ đạo HOBA LPG (Deep Emerald `#0e6b5c` cho Propane, Warm Ochre `#b4540f` cho Butane, nền xám thanh lịch `#f2f6f4`, Dark mode `#0d1a17`).
- **Thành phần:**
  1. **Header & Hero Banner:** Nhận diện thương hiệu HOBA LPG và tiêu đề báo cáo thị trường.
  2. **Thẻ thống kê hiện tại (Summary Cards):** 3 cột thẻ nổi bật hiển thị giá mới nhất và mũi tên tăng/giảm xanh/đỏ.
  3. **Bộ lọc năm & phạm vi:** Hàng nút bấm chọn năm linh hoạt (`Tất cả`, `12 tháng gần nhất`, `2026`, `2025`...).
  4. **Biểu đồ SVG tương tác cao cấp:**
     - Tự động co giãn theo kích thước màn hình (Responsive ViewBox).
     - Đường trục ngang thể hiện mốc giá ($400, $500, $600, $700, $800...).
     - Đường trục dọc thể hiện các tháng.
     - Vùng cảm ứng (overlay) bắt sự kiện `mousemove`/`touchmove` hiển thị Tooltip nổi tại điểm trỏ với đầy đủ chỉ số.
  5. **Bảng số liệu chi tiết:** Bảng phân trang/danh sách gọn gàng, định dạng số chuẩn tiếng Việt (`toLocaleString("vi-VN")`).
  6. **Máy tính giá bình 12kg:** 2 ô nhập liệu cho phép tùy biến mức thay đổi CP và tỷ giá để xem ngay kết quả.
  7. **Hỏi đáp thường gặp:** 4 câu hỏi FAQ về khái niệm CP, phương thức tính và chu kỳ công bố.

### 3.2. Trang quản trị: `/admin/gia-cp-lpg`
- **File:** `src/app/(admin)/admin/gia-cp-lpg/page.tsx`.
- **Sidebar Admin:** Bổ sung mục "Giá CP LPG" vào `src/components/admin/Sidebar.tsx` với icon `trending_up`.
- **Thành phần:**
  1. **Bảng điều khiển đầu trang:** Thống kê số lượng bản ghi, tháng mới nhất đã cập nhật, trạng thái công bố.
  2. **Nút tác vụ chính:** "Thêm tháng mới", "Xuất JSON", "Nhập JSON", "Khôi phục dữ liệu gốc", "Lưu thay đổi".
  3. **Modal Thêm / Sửa bản ghi:**
     - Tháng (`<input type="month">`).
     - Giá Propane (USD/tấn).
     - Giá Butane (USD/tấn).
     - Checkbox "Chờ công bố" (khi bật, tự động vô hiệu hóa nhập giá).
  4. **Bảng quản lý:** Cột Tháng, Propane, Butane, CP Trung bình, Trạng thái (Huy hiệu xanh/vàng), Thao tác (Sửa, Xóa).
  5. **Cấu hình Tỷ giá:** Ô nhập Tỷ giá mặc định USD/VND có lưu vào cấu hình.

---

## 4. Kế hoạch xác minh & Kiểm thử
1. **Kiểm thử dữ liệu:** Xác nhận dữ liệu 22 tháng ban đầu tải chính xác từ `defaultLpgPrices.json` và lưu trữ vào `website_config`.
2. **Kiểm thử bộ lọc năm:** Kiểm tra chọn từng năm (2026, 2025, Tất cả) -> Biểu đồ và bảng dữ liệu phản hồi đúng số bản ghi.
3. **Kiểm thử Tooltip biểu đồ:** Di chuột trên máy tính và chạm trên màn hình di động hiển thị đúng giá trị tháng trỏ vào.
4. **Kiểm thử máy tính 12kg:** Thay đổi số liệu chênh lệch CP và tỷ giá -> Kết quả tính toán VND/bình cập nhật tức thì.
5. **Kiểm thử Quản trị Admin:**
   - Thêm một tháng mới (ví dụ `2026-11`) -> Lưu thành công -> Kiểm tra trang `/gia-cp-lpg` xuất hiện tháng mới.
   - Sửa tháng `2026-10` từ Chờ công bố sang có giá (ví dụ Propane: 630, Butane: 650) -> Trang công khai mất banner chờ và cập nhật biểu đồ.
   - Xóa một tháng -> Xác nhận xóa và kiểm tra danh sách cập nhật.
   - Xuất file JSON và Khôi phục dữ liệu gốc.
6. **Kiểm tra tương thích:** Không ảnh hưởng đến các trang hiện có và giao diện chạy mượt mà trên cả desktop lẫn mobile.
