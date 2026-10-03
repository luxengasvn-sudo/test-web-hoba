# Nâng Cấp Bộ Soạn Thảo Văn Bản (RichEditor) & Quy Trình Kiểm Thử 3 Lần An Toàn

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bổ sung các tính năng soạn thảo chuyên nghiệp cho `RichEditor` (chọn size chữ, thẻ H1 chuẩn hóa, bảng chọn màu nhận diện HOBA + màu tùy chỉnh, modal chèn link mở tab mới) và tiến hành quy trình kiểm thử 3 lần nghiêm ngặt, đảm bảo dữ liệu thực tế trên `hobalpg.vn` được bảo toàn nguyên vẹn 100%.

**Architecture:** Nâng cấp component `RichEditor.tsx` dạng React Client Component sử dụng Selection API / Range / `document.execCommand` an toàn, bổ sung CSS styles trong `globals.css` để hiển thị đồng nhất ở mọi trang (Tin tức, Sự kiện, Trang tùy chỉnh), đồng thời thực hiện kiểm thử tự động / thủ công qua browser agent trên 1 bài nháp tạm và xóa sạch sau khi xác nhận.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Supabase Storage (`hoba-assets`), Browser Subagent testing.

## Global Constraints

- **Bảo toàn dữ liệu 100%:** Tuyệt đối không sửa đổi, cập nhật đè hoặc xóa bất kỳ bài viết, sự kiện, trang tĩnh hay dữ liệu hội viên hiện có trên database/hệ thống.
- **Dọn dẹp sau kiểm thử:** Bất kỳ bài viết nháp (Draft) nào được tạo ra trong quá trình test 3 lần đều phải được xóa sạch hoàn toàn ngay sau khi nghiệm thu.
- **Tương thích ngược:** Giữ nguyên interface `RichEditorProps` (`value`, `onChange`, `onImageUpload`) để không gây lỗi tại các trang cha đang sử dụng.

---

### Task 1: Nâng cấp Component RichEditor (`src/components/admin/RichEditor.tsx`)

**Files:**
- Modify: `d:\Antigravity\hiep-hoi-v2\src\components\admin\RichEditor.tsx`

**Interfaces:**
- Giữ nguyên `RichEditorProps`:
  ```typescript
  interface RichEditorProps {
    value: string;
    onChange: (value: string) => void;
    onImageUpload: (file: File) => Promise<string>;
  }
  ```
- Thêm state điều khiển:
  - Font size: hỗ trợ các cỡ `12px`, `14px`, `16px`, `18px`, `20px`, `24px`.
  - Color picker: Popover chọn màu thương hiệu HOBA (`#1c1c1a`, `#00346f`, `#bb0013`, `#16a34a`, `#d97706`, `#64748b`) + Native `<input type="color" />`.
  - Link Modal: Popover nhập URL, text hiển thị, và checkbox "Mở tab mới".
  - Thẻ H1: Nút H1 định dạng `formatBlock -> H1`.

- [ ] **Step 1: Viết logic xử lý Font Size, Color và Link an toàn cho Selection**
- [ ] **Step 2: Cập nhật Toolbar giao diện của RichEditor với đầy đủ các nút mới**
- [ ] **Step 3: Đảm bảo luồng Upload ảnh lên Supabase Storage giữ nguyên hoạt động**

---

### Task 2: Cập nhật CSS định dạng nội dung (`src/app/globals.css`)

**Files:**
- Modify: `d:\Antigravity\hiep-hoi-v2\src\app\globals.css`

- [ ] **Step 1: Thêm quy tắc CSS cho thẻ `.news-detail-content h1`**
  ```css
  .news-detail-content h1 {
    font-size: 1.875rem;
    font-weight: 800;
    color: var(--color-primary);
    margin-top: 1.75rem;
    margin-bottom: 0.875rem;
  }
  ```
- [ ] **Step 2: Bổ sung class `.rich-content-display` hoặc liên kết đồng bộ với `.news-detail-content` để trang sự kiện cũng hiển thị chuẩn H1, H2, H3, Link**
- [ ] **Step 3: Chạy `npm run build` để xác nhận không có lỗi biên dịch hoặc xung đột CSS**

---

### Task 3: Quy trình Kiểm Thử 3 Lần & Bảo Toàn Dữ Liệu Website

- [ ] **Chuẩn bị: Kiểm tra danh sách dữ liệu hiện tại trước khi test (chụp snapshot/đếm số lượng bản ghi để đối chiếu)**
- [ ] **Lần test 1: Kiểm tra Kích thước chữ (Font Size) & Bộ thẻ Tiêu đề (H1, H2, H3, P)**
  - Thao tác: Bôi đen văn bản, đổi lần lượt các cỡ chữ 14px -> 20px -> 12px; chuyển đổi các tiêu đề H1, H2, H3, P.
  - Kỳ vọng: Văn bản thay đổi kích thước và tiêu đề hiển thị đúng thuộc tính trực quan trong khung soạn thảo.
- [ ] **Lần test 2: Kiểm tra Đổi màu chữ (Color Palette & Custom Color) & Nút chèn Link (Mở tab mới)**
  - Thao tác: Đổi màu chữ sang màu xanh HOBA `#00346f` và màu đỏ `#bb0013`. Chèn một liên kết kèm tick chọn "Mở trong tab mới".
  - Kỳ vọng: Thẻ HTML sinh ra có đúng mã màu và thẻ `<a>` có thuộc tính `target="_blank"` và `rel="noopener noreferrer"`.
- [ ] **Lần test 3: Kiểm tra Tải ảnh lên (Image Upload) & Lưu bài nháp -> Kiểm tra hiển thị -> Xóa bài nháp**
  - Thao tác: Bấm nút Chèn hình ảnh, kiểm tra render ảnh minh họa; lưu bài viết ở trạng thái Bản nháp (Draft).
  - Nghiệm thu: Sau khi xác nhận bài nháp hoạt động tốt, tiến hành xóa ngay bài nháp thử nghiệm.
  - Đối chiếu: Kiểm tra lại danh sách dữ liệu để khẳng định 100% dữ liệu gốc của website `hobalpg.vn` không thay đổi.
