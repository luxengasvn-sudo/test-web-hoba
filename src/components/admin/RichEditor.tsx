'use client';

import React, { useRef, useEffect, useState } from 'react';

interface RichEditorProps {
  value: string;
  onChange: (value: string) => void;
  onImageUpload: (file: File) => Promise<string>;
}

export default function RichEditor({ value, onChange, onImageUpload }: RichEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  // Sync internal HTML content only when value changes externally (avoids cursor jumping)
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const execCmd = (command: string, val: string = '') => {
    document.execCommand(command, false, val);
    handleInput();
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploading(true);
      try {
        const url = await onImageUpload(e.target.files[0]);
        // Format inline image block beautifully
        const imgHtml = `
          <div class="my-6 text-center content-image-wrapper">
            <img src="${url}" alt="Ảnh bài viết" style="max-height: 420px; display: inline-block; border-radius: 8px; max-width: 100%; border: 1px solid #e2e8f0; padding: 4px; background: white;" />
            <p style="font-size: 11px; color: #64748b; font-style: italic; margin-top: 6px; font-weight: 600;">Ảnh minh họa</p>
          </div>
          <p><br></p>
        `;
        editorRef.current?.focus();
        document.execCommand('insertHTML', false, imgHtml);
        handleInput();
      } catch (err) {
        alert('Lỗi tải ảnh lên: ' + (err as Error).message);
      } finally {
        setUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    }
  };

  const handleAddLink = () => {
    const url = prompt('Nhập địa chỉ URL của liên kết (ví dụ: https://google.com):');
    if (url) {
      execCmd('createLink', url);
    }
  };

  return (
    <div className="border border-outline-variant rounded-xl overflow-hidden bg-white shadow-sm flex flex-col text-xs font-medium">
      {/* Editor Toolbar */}
      <div className="flex flex-wrap gap-1 items-center p-2 bg-surface-container-low border-b border-outline-variant/30 select-none">
        <button
          type="button"
          onClick={() => execCmd('bold')}
          className="w-8 h-8 rounded hover:bg-surface-container flex items-center justify-center text-on-surface"
          title="Bôi đậm (Ctrl+B)"
        >
          <span className="material-symbols-outlined text-base font-bold">format_bold</span>
        </button>
        <button
          type="button"
          onClick={() => execCmd('italic')}
          className="w-8 h-8 rounded hover:bg-surface-container flex items-center justify-center text-on-surface"
          title="In nghiêng (Ctrl+I)"
        >
          <span className="material-symbols-outlined text-base">format_italic</span>
        </button>
        <button
          type="button"
          onClick={() => execCmd('underline')}
          className="w-8 h-8 rounded hover:bg-surface-container flex items-center justify-center text-on-surface"
          title="Gạch chân (Ctrl+U)"
        >
          <span className="material-symbols-outlined text-base">format_underlined</span>
        </button>

        <div className="w-[1px] h-5 bg-outline-variant/30 mx-1"></div>

        <button
          type="button"
          onClick={() => execCmd('formatBlock', 'H2')}
          className="px-2 h-8 rounded hover:bg-surface-container flex items-center justify-center text-on-surface font-bold text-[10px]"
          title="Tiêu đề H2"
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => execCmd('formatBlock', 'H3')}
          className="px-2 h-8 rounded hover:bg-surface-container flex items-center justify-center text-on-surface font-bold text-[10px]"
          title="Tiêu đề H3"
        >
          H3
        </button>
        <button
          type="button"
          onClick={() => execCmd('formatBlock', 'P')}
          className="px-2 h-8 rounded hover:bg-surface-container flex items-center justify-center text-on-surface text-[10px]"
          title="Văn bản thường"
        >
          Đoạn văn
        </button>

        <div className="w-[1px] h-5 bg-outline-variant/30 mx-1"></div>

        <button
          type="button"
          onClick={() => execCmd('insertUnorderedList')}
          className="w-8 h-8 rounded hover:bg-surface-container flex items-center justify-center text-on-surface"
          title="Danh sách dấu chấm"
        >
          <span className="material-symbols-outlined text-base">format_list_bulleted</span>
        </button>
        <button
          type="button"
          onClick={() => execCmd('insertOrderedList')}
          className="w-8 h-8 rounded hover:bg-surface-container flex items-center justify-center text-on-surface"
          title="Danh sách số"
        >
          <span className="material-symbols-outlined text-base">format_list_numbered</span>
        </button>

        <div className="w-[1px] h-5 bg-outline-variant/30 mx-1"></div>

        <button
          type="button"
          onClick={() => execCmd('justifyLeft')}
          className="w-8 h-8 rounded hover:bg-surface-container flex items-center justify-center text-on-surface"
          title="Căn trái"
        >
          <span className="material-symbols-outlined text-base">format_align_left</span>
        </button>
        <button
          type="button"
          onClick={() => execCmd('justifyCenter')}
          className="w-8 h-8 rounded hover:bg-surface-container flex items-center justify-center text-on-surface"
          title="Căn giữa"
        >
          <span className="material-symbols-outlined text-base">format_align_center</span>
        </button>
        <button
          type="button"
          onClick={() => execCmd('justifyRight')}
          className="w-8 h-8 rounded hover:bg-surface-container flex items-center justify-center text-on-surface"
          title="Căn phải"
        >
          <span className="material-symbols-outlined text-base">format_align_right</span>
        </button>

        <div className="w-[1px] h-5 bg-outline-variant/30 mx-1"></div>

        <button
          type="button"
          onClick={handleAddLink}
          className="w-8 h-8 rounded hover:bg-surface-container flex items-center justify-center text-on-surface"
          title="Thêm liên kết Link"
        >
          <span className="material-symbols-outlined text-base">link</span>
        </button>

        <button
          type="button"
          onClick={handleImageClick}
          disabled={uploading}
          className="px-3 h-8 rounded hover:bg-surface-container flex items-center justify-center text-secondary font-bold gap-1 cursor-pointer transition-colors"
          title="Tải lên và chèn hình ảnh"
        >
          <span className="material-symbols-outlined text-base">add_photo_alternate</span>
          {uploading ? 'Đang tải...' : 'Chèn hình ảnh'}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageChange}
          disabled={uploading}
        />
      </div>

      {/* Editor Canvas Area */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        className="min-h-[300px] p-4 outline-none prose max-w-none text-xs font-medium leading-relaxed overflow-y-auto max-h-[500px]"
        data-placeholder="Bắt đầu viết bài viết mới của bạn tại đây..."
      />
    </div>
  );
}
