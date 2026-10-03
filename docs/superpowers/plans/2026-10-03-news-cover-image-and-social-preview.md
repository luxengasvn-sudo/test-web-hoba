# Kế hoạch tối ưu ảnh bìa tin tức & xem trước mạng xã hội (OpenGraph)

Cập nhật quy chế hiển thị ảnh bìa bài viết: Ảnh bìa chỉ dùng làm thumbnail danh sách bài viết, thẻ ngoài trang chủ, tin liên quan và thẻ xem trước mạng xã hội (OpenGraph cho Zalo, Facebook, v.v.). Trong nội dung chi tiết bài viết sẽ không tự động hiển thị lặp lại ảnh bìa, tác giả bài viết tự chèn ảnh vào vị trí mong muốn trong bài.

## User Review Required

> [!IMPORTANT]
> - Ảnh bìa (`thumbnail_url`) sẽ không còn xuất hiện dưới dạng một banner lớn ngay dưới tiêu đề trong trang đọc bài viết chi tiết.
> - Bố cục bài viết sẽ đi liền mạch từ Tiêu đề -> Ngày/Tác giả -> Sapo (đoạn tóm tắt) -> Nội dung.
> - Bổ sung hàm `generateMetadata` chuẩn OpenGraph cho từng bài viết để khi dán link lên Zalo / Facebook / Messenger sẽ hiển thị ảnh bìa, tiêu đề và mô tả chính xác.

---

## Danh sách công việc cần thực hiện

### Task 1: Gỡ bỏ banner ảnh bìa lặp lại trong trang đọc bài chi tiết
- **File cần sửa**: `src/app/(public)/tin-tuc/NewsClientPage.tsx`
- **Nội dung thay đổi**:
  - Trong component `NewsDetailPage`, xóa bỏ khối ảnh bìa `<div className="rounded-xl overflow-hidden shadow-sm aspect-video relative"><img ... /></div>` nằm giữa phần meta và phần đoạn trích (sapo).
  - Giữ nguyên hiển thị ảnh đại diện ở: thẻ bài viết trang chủ, danh sách tin tức, tin liên quan bên sidebar.

### Task 2: Bổ sung OpenGraph & Twitter Card SEO metadata cho trang tin tức chi tiết
- **File cần sửa**: `src/app/(public)/tin-tuc/[slug]/page.tsx`
- **Nội dung thay đổi**:
  - Viết hàm `generateMetadata({ params }: PageProps): Promise<Metadata>`:
    - Truy vấn bài viết theo `slug` từ CSDL qua `executeDirectQuery`.
    - Trả về metadata chuẩn gồm `title`, `description`, `openGraph` (title, description, images, type: 'article'), `twitter` (card: 'summary_large_image', images).
    - Có fallback an toàn nếu không tìm thấy bài viết hoặc bài chưa công khai.

### Task 3: Cập nhật nhãn và hướng dẫn rõ ràng trong trang quản trị Admin
- **File cần sửa**: `src/app/(admin)/admin/tin-tuc/page.tsx`
- **Nội dung thay đổi**:
  - Đổi nhãn ô ảnh bìa thành: `Ảnh đại diện (Thumbnail / Ảnh bìa mạng xã hội)`
  - Thêm dòng hướng dẫn giải thích rõ: *Ảnh này hiển thị ngoài trang chủ, danh sách bài viết và khi chia sẻ lên Zalo/Facebook; không lặp lại trong nội dung bài viết. Để chèn ảnh vào bài, hãy dùng nút 'Chèn hình ảnh' ở thanh công cụ bên dưới.*

### Task 4: Kiểm tra & Xác minh
- Chạy kiểm tra TypeScript `npx tsc --noEmit`.
- Xác minh bằng browser hoặc curl xem trang tin tức hiển thị sạch sẽ, không còn 2 ảnh trùng lặp.
