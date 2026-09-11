# HỒ SƠ LƯU TRỮ TOÀN BỘ NỘI DUNG WEBSITE HOBALPG.VN

- **Thời gian sao lưu**: 11/09/2026 13:13 (Giờ Việt Nam)
- **Địa chỉ website**: [https://hobalpg.vn/](https://hobalpg.vn/)
- **Cơ sở dữ liệu nguồn**: PostgreSQL (`tinhgon.xyz:30013/hoba_test`)
- **Tổng dung lượng**: ~29.77 MB (92 tệp tin)

---

## 1. Cấu trúc thư mục sao lưu (`backup_hobalpg_vn/`)

```
backup_hobalpg_vn/
├── database/                    # Toàn bộ dữ liệu CSDL (JSON & SQL Dump độc lập)
│   ├── database_full.json       # Tất cả các bảng hợp nhất dạng JSON
│   ├── database_full_restore.sql# Script SQL tạo lại dữ liệu với các lệnh INSERT
│   ├── website_config.json      # Cấu hình giao diện: Hero, Giới thiệu, Ban bệ, Sự kiện, Chính sách
│   ├── news.json                # Toàn bộ bài viết tin tức (nội dung chi tiết, slug, ảnh bìa)
│   ├── documents.json           # Toàn bộ tài liệu, văn bản, nghị định kèm link tệp tin
│   ├── members.json             # Danh sách 63 doanh nghiệp hội viên (MST, đại diện, logo, địa chỉ)
│   ├── chapters.json            # Dữ liệu danh mục chi hội
│   ├── chapter_leadership.json  # Ban lãnh đạo chi hội
│   ├── contact_messages.json    # Tin nhắn liên hệ gửi từ khách truy cập
│   ├── admin_users.json         # Danh sách tài khoản quản trị
│   └── uploaded_files_metadata.json # Metadata danh sách tệp đính kèm
│
├── media/                       # TẤT CẢ TỆP TIN ĐÍNH KÈM, ẢNH & TÀI LIỆU PDF (43 tệp)
│   ├── aboutpage/               # Ảnh phần giới thiệu lịch sử, cơ cấu hiệp hội
│   ├── committees/              # Ảnh chân dung Ban Chấp hành, Ban Thường vụ, Ban Kiểm tra
│   ├── documents/               # 8 file PDF văn bản pháp luật, PCCC, ANTT, điều lệ hiệp hội
│   ├── event-images/            # Hình ảnh đại hội và sự kiện
│   ├── featured-members/        # Logo các hội viên tiêu biểu
│   ├── homepage/                # Ảnh banner chính, ảnh slide hero trang chủ
│   ├── member-assets/           # Logo các doanh nghiệp thành viên
│   ├── memberspage/             # Banner trang danh sách hội viên
│   ├── news-images/             # Ảnh minh họa các bài viết tin tức
│   └── site-assets/             # Logo HOBA LPG, icon hệ thống
│
├── pages_html/                  # Toàn bộ mã nguồn HTML đã render của 18 trang
│   ├── home.html                # Trang chủ (/)
│   ├── gioi-thieu.html          # Giới thiệu chung (/gioi-thieu)
│   ├── ban-chap-hanh.html       # Ban Chấp hành (/ban-chap-hanh)
│   ├── ban-thuong-vu.html       # Ban Thường vụ (/ban-thuong-vu)
│   ├── ban-kiem-tra.html        # Ban Kiểm tra (/ban-kiem-tra)
│   ├── hoi-vien.html            # Danh sách hội viên (/hoi-vien)
│   ├── hoi-vien-chi-hoi-detail.html # Danh sách hội viên theo chi hội
│   ├── chi-hoi.html             # Chi hội trực thuộc (/chi-hoi)
│   ├── dang-ky.html             # Đăng ký gia nhập (/dang-ky)
│   ├── tin-tuc.html             # Danh mục tin tức (/tin-tuc)
│   ├── tin-tuc--trien-lam-cong-nghe-ho-tro-2026.html # Chi tiết bài viết 1
│   ├── tin-tuc--phat-huy-vai-tro-hiep-hoi.html       # Chi tiết bài viết 2
│   ├── su-kien.html             # Danh mục sự kiện (/su-kien)
│   ├── su-kien--dai-hoi-bat-thuong.html              # Chi tiết sự kiện đại hội
│   ├── van-ban.html             # Kho văn bản quy phạm (/van-ban)
│   ├── lien-he.html             # Trang liên hệ (/lien-he)
│   ├── dieu-khoan-su-dung.html  # Điều khoản sử dụng dịch vụ
│   └── chinh-sach-bao-mat.html  # Chính sách bảo mật
│
├── pages_markdown/              # 18 tệp văn bản Markdown thuần (dễ đọc, dễ copy chữ)
│   └── [tương ứng 1-1 với từng trang web để sao chép nhanh khi biên tập]
│
├── MANIFEST.json                # Tệp kiểm kê kỹ thuật của bản sao lưu
└── README.md                    # Tài liệu tổng quan này
```

---

## 2. Thống kê chi tiết nội dung đã lưu

| Hạng mục | Số lượng | Mô tả chi tiết |
| :--- | :--- | :--- |
| **Trang HTML nguyên bản** | 18 trang | Chụp lại toàn bộ DOM & mã HTML hiển thị trên web thực tế |
| **Trang Markdown văn bản** | 18 trang | Bóc tách text, tiêu đề, đoạn văn để đọc và tái sử dụng |
| **Hội viên doanh nghiệp** | 63 đơn vị | Đầy đủ tên công ty, mã số thuế, đại diện, điện thoại, địa chỉ, logo |
| **Cấu hình giao diện** | 12 khối | Hero slider, giới thiệu, ban bệ, sự kiện, quyền lợi hội viên, liên kết nhanh |
| **Bài viết tin tức** | 2 bài hoàn chỉnh | Tiêu đề, ngày đăng, tác giả, ảnh đại diện, toàn văn HTML |
| **Văn bản & Nghị định** | 4 văn bản chính | Quyết định điều lệ, NĐ 105 PCCC, NĐ 87 KD Khí, NĐ 96 ANTT kèm PDF |
| **Tệp tin Media / Tải lên** | 43 tệp | Bao gồm toàn bộ file PDF gốc, ảnh JPEG/PNG chất lượng cao |

---

## 3. Hướng dẫn sử dụng khi chỉnh sửa website

1. **Khôi phục cơ sở dữ liệu nếu có sự cố**:
   - Chạy lệnh: `psql -d <ten_csdl> -f backup_hobalpg_vn/database/database_full_restore.sql`
   - Hoặc đọc các tệp JSON trong `database/` để import chọn lọc qua API / CMS.
2. **Lấy hình ảnh & tài liệu gốc**:
   - Tất cả hình ảnh và file PDF đã được giải nén sẵn trong `backup_hobalpg_vn/media/`. Bạn có thể sao chép trực tiếp vào `public/uploads/` nếu cần.
3. **Tra cứu và sao chép nội dung văn bản**:
   - Mở các tệp trong `backup_hobalpg_vn/pages_markdown/` bằng bất kỳ trình soạn thảo văn bản nào để lấy lại nội dung gốc của từng trang một cách nhanh nhất.
