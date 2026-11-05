# HOBA News Editor & Admin Management Package

Trọn bộ mã nguồn của Trình soạn thảo tin tức (Rich Text Editor) và Trang quản lý tin tức Admin được trích xuất từ dự án HOBA.

## Cấu trúc thư mục

```text
hoba-news-editor/
├── components/
│   └── RichEditor.tsx         # Component trình soạn thảo WYSIWYG độc lập (Custom Rich Text Editor)
├── admin-news-page/
│   └── page.tsx               # Giao diện trang quản trị tin tức, danh sách, modal tạo/sửa bài viết
├── lib/
│   ├── slug.ts                # Hàm tạo slug URL chuẩn tiếng Việt không dấu
│   └── categories.ts          # Định nghĩa & xử lý danh mục tin tức
└── README.md                  # Tài liệu hướng dẫn tích hợp
```

---

## 1. Thành phần độc lập: RichEditor (`components/RichEditor.tsx`)

Component `RichEditor` hoàn toàn **không phụ thuộc thư viện bên ngoài** (không cần TipTap, Quill, CKEditor hay TinyMCE). Toàn bộ icon dùng SVG trực tiếp, xử lý định dạng qua `contentEditable` & API DOM chuẩn.

### Tính năng tích hợp:
- **Định dạng cơ bản:** Đậm, Nghiêng, Gạch chân, Gạch ngang, Xóa định dạng.
- **Tiêu đề & Kiểu khối:** H1, H2, H3, H4, H5, H6, Đoạn văn (Paragraph), Trích dẫn (Blockquote).
- **Cỡ chữ:** Nhỏ (13px), Mặc định (15px), Lớn (18px), Rất lớn (24px).
- **Màu sắc chữ:** Bảng chọn màu chuẩn và mã màu tùy chỉnh.
- **Danh sách & Căn lề:** Danh sách chấm, số, căn trái, căn giữa, căn phải, căn đều hai bên.
- **Chèn Bảng (Table):** Tạo bảng với số hàng/cột tùy chọn, hỗ trợ thêm hàng, thêm cột, xóa bảng.
- **Chèn Liên kết (Link):** Modal chèn link với tùy chọn mở tab mới (`target="_blank"`).
- **Chèn Ảnh & Upload:** Nút tải ảnh lên với thanh tiến trình tải (`onImageUpload`), kéo thả hoặc chọn từ máy tính.
- **Hỗ trợ Undo / Redo.**

### Cách sử dụng standalone trong React / Next.js:

```tsx
'use client';

import React, { useState } from 'react';
import RichEditor from '@/components/admin/RichEditor'; // điều chỉnh đường dẫn tương ứng

export default function MyEditorPage() {
  const [content, setContent] = useState('<p>Nội dung mẫu...</p>');

  // Hàm xử lý upload ảnh (trả về URL ảnh sau khi upload)
  const handleImageUpload = async (file: File): Promise<string> => {
    // Ví dụ: upload lên Cloudinary, S3, Supabase Storage hoặc server của bạn
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/upload', { method: 'POST', body: formData });
    const data = await res.json();
    return data.url;
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-xl font-bold mb-4">Soạn thảo nội dung</h1>
      <RichEditor
        value={content}
        onChange={setContent}
        onImageUpload={handleImageUpload}
      />
    </div>
  );
}
```

---

## 2. Trang Quản lý Tin tức (`admin-news-page/page.tsx`)

Trang quản trị toàn diện cho bài viết:
- Danh sách tin tức có tìm kiếm, lọc theo danh mục, phân trang.
- Modal tạo mới và chỉnh sửa bài viết.
- Tự động sinh `slug` thân thiện từ tiêu đề bài viết qua `lib/slug.ts`.
- Upload ảnh đại diện và ảnh trong nội dung bài viết.
- Quản lý danh mục tin tức động qua `lib/categories.ts`.
