# Kế hoạch Triển khai Website Hiệp Hội V2 (Boba) - Tích hợp PostgreSQL Mắt Bão

Kế hoạch này trình bày lộ trình xây dựng phiên bản V2 cho Website **Boba** (Hiệp hội Kinh doanh Khí hóa lỏng TP.HCM) với dữ liệu động 100%, kết nối cơ sở dữ liệu PostgreSQL (Mắt Bão) độc lập, giữ nguyên 100% giao diện (UI) hiện tại và khắc phục các lỗi từ phiên bản cũ.

## User Review Required

> [!WARNING]
> Mọi thay đổi sẽ được thực hiện độc lập tại workspace này (`D:\Antigravity\hiep-hoi-v2`).
> Không chạm hay sửa đổi bất kỳ tệp tin nào của dự án **Ngọc Gas**.

---

## Các hạng mục triển khai chính

### 1. Cơ sở dữ liệu PostgreSQL (Mắt Bão) & API Layer
Thiết lập kết nối PostgreSQL qua file `.env`. Xây dựng các bảng CSDL:
- Bảng `settings`: Quản lý thông tin cấu hình, logo, hotline, địa chỉ, email, mạng xã hội, bản đồ.
- Bảng `members`: Quản lý danh sách hội viên (tên, logo, thông tin liên hệ, trạng thái hoạt động).
- Bảng `news`: Quản lý tin tức, phân loại danh mục, ảnh đại diện, bài viết nổi bật.
- Bảng `documents`: Quản lý văn bản pháp quy, số hiệu, ngày ban hành, đường dẫn file PDF/DOC.
- Bảng `events`: Quản lý sự kiện, đào tạo, lịch trình và thư viện ảnh sự kiện.
- Bảng `admin_users`: Tài khoản đăng nhập trang quản trị.

### 2. Đồng bộ hóa cấu hình (Unified Settings Hydration)
- Triển khai cơ chế cấu hình 3 lớp. Toàn bộ các trường Hotline, Địa chỉ, Email, Bản đồ Google Maps, Logo, Favicon ở Header/Footer và trang chủ sẽ đọc từ DB.

### 3. Động hóa các trang giao diện công cộng (Public Pages)
- **Trang Hội viên (`/hoi-vien`)**: Đọc từ bảng `members`, hỗ trợ tìm kiếm và lọc theo khu vực/lĩnh vực hoạt động.
- **Trang Tin tức (`/tin-tuc`)**: Lấy danh sách tin từ DB, phân loại danh mục.
- **Trang Văn bản pháp lý (`/van-ban`)**: Bảng tìm kiếm tài liệu có tải file PDF.
- **Form Liên hệ & Đăng ký**: Lưu dữ liệu trực tiếp vào database PostgreSQL để Admin phê duyệt.

### 4. Xây dựng Admin Dashboard (CRUD)
- Giao diện Admin quản trị chuyên nghiệp kết nối API PostgreSQL:
  - CRUD Tin tức (Tích hợp Editor).
  - Phê duyệt và Quản lý hội viên.
  - Quản lý tệp văn bản pháp lý.
  - Cập nhật thông tin hệ thống (Settings) tự động lưu.
  - Thư viện ảnh uploads chung.

---

## Proposed Changes

### [Backend & Database]

#### [NEW] [.env](file:///D:/Antigravity/hiep-hoi-v2/.env)
#### [NEW] [src/lib/db.ts](file:///D:/Antigravity/hiep-hoi-v2/src/lib/db.ts)
- Kết nối PostgreSQL sử dụng connection pool qua thư viện `pg`.

#### [NEW] [src/lib/settings.ts](file:///D:/Antigravity/hiep-hoi-v2/src/lib/settings.ts)
- Trình quản lý cấu hình 3 lớp (`getAllSettings`).

---

### [Public Components & Pages]

#### [MODIFY] [Header.tsx](file:///D:/Antigravity/hiep-hoi-v2/src/components/Header.tsx)
- Đọc động logo, hotline, email từ settings.

#### [MODIFY] [Footer.tsx](file:///D:/Antigravity/hiep-hoi-v2/src/components/Footer.tsx)
- Đọc động thông tin bản quyền, địa chỉ, bản đồ Google Maps, hotline và liên kết mạng xã hội.

#### [MODIFY] [Trang chủ (page.tsx)](file:///D:/Antigravity/hiep-hoi-v2/src/app/page.tsx)
- Hiển thị danh sách tin tức nổi bật và hội viên tiêu biểu lấy từ DB.

#### [MODIFY] [Trang Hội viên (page.tsx)](file:///D:/Antigravity/hiep-hoi-v2/src/app/hoi-vien/page.tsx)
- Tải dữ liệu hội viên từ DB và thực hiện tìm kiếm/lọc phía Server-side hoặc Client-side.

#### [MODIFY] [Trang Văn bản pháp lý (page.tsx)](file:///D:/Antigravity/hiep-hoi-v2/src/app/van-ban/page.tsx)
- Tra cứu danh sách văn bản và tải xuống.

#### [MODIFY] [Trang Tin tức (page.tsx)](file:///D:/Antigravity/hiep-hoi-v2/src/app/tin-tuc/page.tsx)
- Render danh sách bài viết từ DB.

---

### [Admin Pages]

#### [NEW] [src/app/admin/login/page.tsx](file:///D:/Antigravity/hiep-hoi-v2/src/app/admin/login/page.tsx)
- Đăng nhập bảo mật quản trị viên.

#### [MODIFY] [Trang Admin chính (page.tsx)](file:///D:/Antigravity/hiep-hoi-v2/src/app/admin/page.tsx)
- CRUD Tin tức, Quản lý tài liệu pháp lý, Phê duyệt Hội viên và Trang cấu hình hệ thống.

---

## Kế hoạch Kiểm thử & Xác minh

### Kiểm thử cục bộ
1. Chạy `npm install pg @types/pg` để cài thư viện kết nối PostgreSQL.
2. Thiết lập cơ sở dữ liệu thử nghiệm PostgreSQL.
3. Chạy `npm run dev -- -p 3010` để khởi động dự án ở Port 3010.
4. Đảm bảo toàn bộ giao diện chạy chuẩn responsive và không phát sinh lỗi biên dịch (`npm run build` kết quả Exit Code 0).

### Xác minh thủ công
- Kiểm tra tính đúng đắn khi thay đổi logo, hotline tại Admin xem có tự động đổi ở Header/Footer hay không.
- Test form đăng ký hội viên ngoài trang chủ có hiển thị trong admin để phê duyệt hay không.
