# PROMPT DÀNH CHO CODEX / AI ASSISTANT ĐỂ TẠO TRÌNH SOẠN THẢO TIN TỨC

*Copy toàn bộ nội dung trong khung dưới đây dán vào Codex để tạo phần soạn thảo tin tức cho dự án mới:*

```markdown
Hãy tạo một mô-đun Soạn thảo Tin tức (News Editor) hoàn chỉnh cho dự án React / Next.js (hỗ trợ Tailwind CSS) với các yêu cầu sau:

### 1. Kiến trúc thành phần:
Tạo 3 file chính độc lập, không phụ thuộc thư viện rich text bên ngoài (không dùng TipTap/Quill/CKEditor, dùng native contentEditable + document.execCommand):
- `components/RichEditor.tsx`: Trình soạn thảo văn bản phong phú (WYSIWYG editor).
- `components/NewsEditorForm.tsx`: Form quản lý bài viết tin tức đầy đủ tính năng.
- `lib/slug.ts`: Hàm tạo slug thân thiện chuẩn tiếng Việt có dấu.

### 2. Chi tiết `components/RichEditor.tsx`:
- **Định dạng:** Cỡ chữ (12px, 14px, 16px, 18px, 20px, 24px), In đậm, In nghiêng, Gạch chân, Màu chữ tùy chọn + bảng màu chuẩn.
- **Tiêu đề & Kiểu khối:** H1, H2, H3, Đoạn văn (P), Trích dẫn nổi bật (Blockquote - có phím tắt Enter để thoát khối mượt mà).
- **Căn lề & Danh sách:** Trái, Giữa, Phải; Danh sách dấu chấm, danh sách số.
- **Chèn Liên kết (Link):** Modal chèn link với ô URL, chữ hiển thị, tùy chọn mở tab mới (target="_blank").
- **Xử lý Paste:** Tự động lọc sạch style rác khi dán từ Google Docs / Word; tự động bóc tách ảnh base64 và gọi hàm `onImageUpload` để upload lên server.
- **Upload Ảnh:** Nút chọn ảnh từ máy, gọi callback `onImageUpload(file: File): Promise<string>` và chèn khung ảnh đẹp có chú thích.

### 3. Chi tiết `components/NewsEditorForm.tsx`:
- Quản lý State bài viết:
  - `title`: Tiêu đề bài viết.
  - `slug`: Đường dẫn URL (tự động cập nhật từ tiêu đề bằng `toSlug()`, có nút bật/tắt tạo tự động).
  - `category`: Chọn chuyên mục (nhận mảng danh mục qua props).
  - `status`: 'Published' (Công khai) hoặc 'Draft' (Bản nháp).
  - `thumbnail_url`: Ảnh đại diện / ảnh chia sẻ Zalo/FB (nhập URL hoặc upload ảnh trực tiếp).
  - `is_featured`: Checkbox đánh dấu bài viết nổi bật.
  - `description`: Textarea mô tả ngắn tóm tắt bài viết.
  - `content`: Tích hợp `<RichEditor />`.
- Nhận các props:
  - `initialData?: Partial<NewsFormData>` (dùng cho cả Tạo mới và Sửa bài viết).
  - `categories?: string[]`.
  - `onSave: (data: NewsFormData) => Promise<void> | void`.
  - `onCancel?: () => void`.
  - `onImageUpload?: (file: File) => Promise<string>`.
  - `isSubmitting?: boolean`.

### 4. Chi tiết `lib/slug.ts`:
Hàm `toSlug(str: string): string` chuyển đổi tiếng Việt có dấu thành chuỗi không dấu, thay khoảng trắng bằng dấu gạch ngang `-`, loại bỏ ký tự đặc biệt, chuẩn hóa chữ thường.
```
