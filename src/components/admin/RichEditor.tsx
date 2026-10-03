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
  const colorMenuRef = useRef<HTMLDivElement>(null);

  const [uploading, setUploading] = useState(false);
  const [selectedFontSize, setSelectedFontSize] = useState('default');
  const [isColorMenuOpen, setIsColorMenuOpen] = useState(false);
  const [currentColor, setCurrentColor] = useState('#00346f');

  // Link Modal States
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [linkNewTab, setLinkNewTab] = useState(true);
  const savedRangeRef = useRef<Range | null>(null);

  // Sync internal HTML content only when value changes externally (avoids cursor jumping)
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  // Click outside to close color menu
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (colorMenuRef.current && !colorMenuRef.current.contains(e.target as Node)) {
        setIsColorMenuOpen(false);
      }
    };
    if (isColorMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isColorMenuOpen]);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const execCmd = (command: string, val: string = '') => {
    editorRef.current?.focus();
    if (command === 'formatBlock' && val.toLowerCase().includes('p')) {
      const selection = window.getSelection();
      let node: HTMLElement | null = selection?.anchorNode as HTMLElement;
      if (node && node.nodeType !== Node.ELEMENT_NODE) node = node.parentElement;
      while (node && node !== editorRef.current && node.tagName !== 'BLOCKQUOTE') {
        node = node.parentElement;
      }
      if (node && node.tagName === 'BLOCKQUOTE') {
        const p = document.createElement('p');
        p.innerHTML = node.innerHTML || '<br>';
        node.parentNode?.replaceChild(p, node);
        handleInput();
        return;
      }
    }

    if (command === 'formatBlock') {
      const tag = val.startsWith('<') ? val : `<${val.toLowerCase()}>`;
      document.execCommand('formatBlock', false, tag);
    } else {
      document.execCommand(command, false, val);
    }
    handleInput();
  };

  // Keyboard handler: Exit blockquote cleanly on Enter
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter') {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;

      const anchorNode = selection.anchorNode;
      if (!anchorNode) return;

      let currentElement: HTMLElement | null =
        anchorNode.nodeType === Node.ELEMENT_NODE
          ? (anchorNode as HTMLElement)
          : anchorNode.parentElement;

      while (currentElement && currentElement !== editorRef.current && currentElement.tagName !== 'BLOCKQUOTE') {
        currentElement = currentElement.parentElement;
      }

      if (currentElement && currentElement.tagName === 'BLOCKQUOTE') {
        if (e.shiftKey) {
          // Shift + Enter: allow soft line break inside blockquote
          return;
        }

        // Enter: Exit blockquote and create a new paragraph below it
        e.preventDefault();

        const p = document.createElement('p');
        p.innerHTML = '<br>';

        if (currentElement.nextSibling) {
          currentElement.parentNode?.insertBefore(p, currentElement.nextSibling);
        } else {
          currentElement.parentNode?.appendChild(p);
        }

        const newRange = document.createRange();
        newRange.setStart(p, 0);
        newRange.collapse(true);
        selection.removeAllRanges();
        selection.addRange(newRange);

        handleInput();
      }
    }
  };

  // Paste handler: Clean external inline styles (Google Docs, Word, etc.) to keep website typography
  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const html = e.clipboardData.getData('text/html');
    const text = e.clipboardData.getData('text/plain');

    if (html) {
      try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        // 1. Remove Google Docs / Word inline font family, redundant colors & backgrounds
        const allElements = doc.body.querySelectorAll('*');
        allElements.forEach((el) => {
          if (el instanceof HTMLElement) {
            el.style.fontFamily = '';
            // Remove hardcoded black colors from pasted documents
            if (
              el.style.color === 'rgb(0, 0, 0)' ||
              el.style.color === '#000000' ||
              el.style.color === '#000'
            ) {
              el.style.color = '';
            }
            // Remove hardcoded white or transparent backgrounds
            if (
              el.style.backgroundColor === 'transparent' ||
              el.style.backgroundColor === 'rgb(255, 255, 255)' ||
              el.style.backgroundColor === '#ffffff' ||
              el.style.backgroundColor === '#fff'
            ) {
              el.style.backgroundColor = '';
            }
            if (el.style.lineHeight === '1.38') {
              el.style.lineHeight = '';
            }
            if (el.style.whiteSpace === 'pre-wrap') {
              el.style.whiteSpace = '';
            }
            // If style attribute is empty, remove it
            if (!el.getAttribute('style')?.trim()) {
              el.removeAttribute('style');
            }
          }
        });

        // 2. Unwrap redundant span tags that have no meaningful style or attributes
        const spans = Array.from(doc.body.querySelectorAll('span'));
        spans.forEach((span) => {
          if (span.id?.startsWith('docs-internal-guid')) {
            span.removeAttribute('id');
          }
          if (!span.getAttribute('style') && !span.className && !span.id) {
            span.replaceWith(...Array.from(span.childNodes));
          }
        });

        const cleanedHtml = doc.body.innerHTML;
        document.execCommand('insertHTML', false, cleanedHtml);
      } catch (err) {
        console.error('Lỗi khi lọc nội dung dán:', err);
        document.execCommand('insertText', false, text);
      }
    } else if (text) {
      const escaped = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
      const formatted = escaped
        .split(/\r?\n\r?\n/)
        .map((p) => `<p>${p.replace(/\r?\n/g, '<br>')}</p>`)
        .join('');
      document.execCommand('insertHTML', false, formatted);
    }

    handleInput();
  };

  // Font Size Handler
  const handleFontSizeChange = (size: string) => {
    if (!size || size === 'default') return;
    editorRef.current?.focus();
    document.execCommand('fontSize', false, '7');
    if (editorRef.current) {
      const fontElements = editorRef.current.querySelectorAll('font[size="7"]');
      fontElements.forEach((el) => {
        el.removeAttribute('size');
        (el as HTMLElement).style.fontSize = size;
      });
    }
    handleInput();
    setSelectedFontSize('default');
  };

  // Text Color Handler
  const handleApplyColor = (color: string) => {
    setCurrentColor(color);
    editorRef.current?.focus();
    document.execCommand('foreColor', false, color);
    handleInput();
    setIsColorMenuOpen(false);
  };

  // Color Palette Presets (Matching HOBA branding & modern accents)
  const colorPresets = [
    { name: 'Mặc định (Đen than)', color: '#1c1c1a' },
    { name: 'Xanh HOBA (Chính)', color: '#00346f' },
    { name: 'Đỏ HOBA (Nhấn)', color: '#bb0013' },
    { name: 'Xanh lá (Thành công)', color: '#16a34a' },
    { name: 'Cam vàng (Cảnh báo)', color: '#d97706' },
    { name: 'Xám ghi (Phụ)', color: '#64748b' },
  ];

  // Link Dialog Handlers
  const handleOpenLinkModal = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0 && !selection.isCollapsed) {
      savedRangeRef.current = selection.getRangeAt(0).cloneRange();
      setLinkText(selection.toString());
    } else {
      savedRangeRef.current = null;
      setLinkText('');
    }
    setLinkUrl('');
    setLinkNewTab(true);
    setIsLinkModalOpen(true);
  };

  const handleInsertLink = (e?: React.FormEvent) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    if (!linkUrl.trim()) {
      alert('Vui lòng nhập địa chỉ URL');
      return;
    }

    let finalUrl = linkUrl.trim();
    if (
      !/^https?:\/\//i.test(finalUrl) &&
      !finalUrl.startsWith('/') &&
      !finalUrl.startsWith('#') &&
      !finalUrl.startsWith('mailto:') &&
      !finalUrl.startsWith('tel:')
    ) {
      finalUrl = 'https://' + finalUrl;
    }

    const displayText = linkText.trim() || finalUrl;
    
    // Create robust link node
    const linkEl = document.createElement('a');
    linkEl.href = finalUrl;
    if (linkNewTab) {
      linkEl.target = '_blank';
      linkEl.rel = 'noopener noreferrer';
    }
    linkEl.style.color = '#bb0013';
    linkEl.style.textDecoration = 'underline';
    linkEl.style.fontWeight = '700';
    linkEl.textContent = displayText;

    if (savedRangeRef.current) {
      savedRangeRef.current.deleteContents();
      savedRangeRef.current.insertNode(linkEl);
    } else if (editorRef.current) {
      editorRef.current.appendChild(document.createTextNode(' '));
      editorRef.current.appendChild(linkEl);
      editorRef.current.appendChild(document.createTextNode(' '));
    }

    handleInput();
    setIsLinkModalOpen(false);
  };

  // Image Upload Handlers
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

  return (
    <div className="relative border border-outline-variant rounded-xl overflow-hidden bg-white shadow-sm flex flex-col text-xs font-medium">
      {/* Editor Toolbar */}
      <div className="flex flex-wrap gap-1 items-center p-2 bg-surface-container-low border-b border-outline-variant/30 select-none">
        
        {/* Font Size Selector */}
        <div className="flex items-center">
          <select
            value={selectedFontSize}
            onChange={(e) => handleFontSizeChange(e.target.value)}
            className="h-8 px-2 py-1 bg-white border border-outline-variant/50 rounded hover:border-primary text-[11px] font-semibold text-on-surface focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
            title="Kích thước chữ"
          >
            <option value="default">Cỡ chữ</option>
            <option value="12px">12px - Nhỏ</option>
            <option value="14px">14px - Vừa</option>
            <option value="16px">16px - Chuẩn</option>
            <option value="18px">18px - Lớn</option>
            <option value="20px">20px - Rất lớn</option>
            <option value="24px">24px - Tiêu đề phụ</option>
          </select>
        </div>

        <div className="w-[1px] h-5 bg-outline-variant/30 mx-1"></div>

        {/* Text Styling: Bold, Italic, Underline */}
        <button
          type="button"
          onClick={() => execCmd('bold')}
          className="w-8 h-8 rounded hover:bg-surface-container flex items-center justify-center text-on-surface transition-colors"
          title="Bôi đậm (Ctrl+B)"
        >
          <span className="material-symbols-outlined text-base font-bold">format_bold</span>
        </button>
        <button
          type="button"
          onClick={() => execCmd('italic')}
          className="w-8 h-8 rounded hover:bg-surface-container flex items-center justify-center text-on-surface transition-colors"
          title="In nghiêng (Ctrl+I)"
        >
          <span className="material-symbols-outlined text-base">format_italic</span>
        </button>
        <button
          type="button"
          onClick={() => execCmd('underline')}
          className="w-8 h-8 rounded hover:bg-surface-container flex items-center justify-center text-on-surface transition-colors"
          title="Gạch chân (Ctrl+U)"
        >
          <span className="material-symbols-outlined text-base">format_underlined</span>
        </button>

        {/* Color Picker Button & Popover */}
        <div className="relative" ref={colorMenuRef}>
          <button
            type="button"
            onClick={() => setIsColorMenuOpen(!isColorMenuOpen)}
            className="h-8 px-2 rounded hover:bg-surface-container flex items-center gap-1 text-on-surface transition-colors border border-transparent hover:border-outline-variant/40"
            title="Đổi màu chữ"
          >
            <span className="material-symbols-outlined text-base" style={{ color: currentColor }}>
              format_color_text
            </span>
            <div
              className="w-3.5 h-1.5 rounded-sm border border-outline-variant/50"
              style={{ backgroundColor: currentColor }}
            />
            <span className="material-symbols-outlined text-[14px] text-outline">arrow_drop_down</span>
          </button>

          {isColorMenuOpen && (
            <div className="absolute left-0 top-full mt-1.5 p-3 bg-white rounded-xl shadow-xl border border-outline-variant/60 z-50 w-56 flex flex-col gap-2.5 animate-in fade-in zoom-in-95 duration-100">
              <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                Màu sắc nhận diện
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                {colorPresets.map((p) => (
                  <button
                    key={p.color}
                    type="button"
                    onClick={() => handleApplyColor(p.color)}
                    className="flex items-center gap-1.5 p-1.5 rounded-lg border border-outline-variant/30 hover:border-primary hover:bg-surface-container-low transition-all text-left group"
                    title={p.name}
                  >
                    <span
                      className="w-4 h-4 rounded-full border border-black/10 shrink-0 shadow-xs"
                      style={{ backgroundColor: p.color }}
                    />
                    <span className="text-[10px] font-semibold text-on-surface truncate group-hover:text-primary">
                      {p.name.split(' ')[0]}
                    </span>
                  </button>
                ))}
              </div>

              <div className="border-t border-outline-variant/30 pt-2 flex items-center justify-between">
                <label className="text-[11px] font-bold text-on-surface flex items-center gap-1.5 cursor-pointer">
                  <span className="material-symbols-outlined text-sm text-primary">palette</span>
                  Màu tùy chọn:
                </label>
                <input
                  type="color"
                  value={currentColor}
                  onChange={(e) => handleApplyColor(e.target.value)}
                  className="w-7 h-7 rounded border border-outline-variant/60 cursor-pointer p-0 bg-transparent"
                  title="Chọn màu bất kỳ"
                />
              </div>
            </div>
          )}
        </div>

        <div className="w-[1px] h-5 bg-outline-variant/30 mx-1"></div>

        {/* Headings: H1, H2, H3, Paragraph */}
        <button
          type="button"
          onClick={() => execCmd('formatBlock', 'H1')}
          className="px-2 h-8 rounded hover:bg-surface-container flex items-center justify-center text-primary font-black text-[11px] hover:text-secondary transition-colors"
          title="Tiêu đề lớn H1"
        >
          H1
        </button>
        <button
          type="button"
          onClick={() => execCmd('formatBlock', 'H2')}
          className="px-2 h-8 rounded hover:bg-surface-container flex items-center justify-center text-on-surface font-bold text-[11px] hover:text-primary transition-colors"
          title="Tiêu đề H2"
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => execCmd('formatBlock', 'H3')}
          className="px-2 h-8 rounded hover:bg-surface-container flex items-center justify-center text-on-surface font-bold text-[11px] hover:text-primary transition-colors"
          title="Tiêu đề H3"
        >
          H3
        </button>
        <button
          type="button"
          onClick={() => execCmd('formatBlock', 'P')}
          className="px-2 h-8 rounded hover:bg-surface-container flex items-center justify-center text-on-surface text-[10px] transition-colors"
          title="Văn bản thường (Đoạn văn)"
        >
          Đoạn văn
        </button>
        <button
          type="button"
          onClick={() => execCmd('formatBlock', 'blockquote')}
          className="px-2 h-8 rounded hover:bg-surface-container flex items-center justify-center text-on-surface text-[10px] gap-0.5 hover:text-secondary transition-colors font-semibold"
          title="Đóng khung trích dẫn nổi bật (Blockquote)"
        >
          <span className="material-symbols-outlined text-[15px]">format_quote</span>
          Trích dẫn
        </button>

        <div className="w-[1px] h-5 bg-outline-variant/30 mx-1"></div>

        {/* Lists */}
        <button
          type="button"
          onClick={() => execCmd('insertUnorderedList')}
          className="w-8 h-8 rounded hover:bg-surface-container flex items-center justify-center text-on-surface transition-colors"
          title="Danh sách dấu chấm"
        >
          <span className="material-symbols-outlined text-base">format_list_bulleted</span>
        </button>
        <button
          type="button"
          onClick={() => execCmd('insertOrderedList')}
          className="w-8 h-8 rounded hover:bg-surface-container flex items-center justify-center text-on-surface transition-colors"
          title="Danh sách số"
        >
          <span className="material-symbols-outlined text-base">format_list_numbered</span>
        </button>

        <div className="w-[1px] h-5 bg-outline-variant/30 mx-1"></div>

        {/* Alignment */}
        <button
          type="button"
          onClick={() => execCmd('justifyLeft')}
          className="w-8 h-8 rounded hover:bg-surface-container flex items-center justify-center text-on-surface transition-colors"
          title="Căn trái"
        >
          <span className="material-symbols-outlined text-base">format_align_left</span>
        </button>
        <button
          type="button"
          onClick={() => execCmd('justifyCenter')}
          className="w-8 h-8 rounded hover:bg-surface-container flex items-center justify-center text-on-surface transition-colors"
          title="Căn giữa"
        >
          <span className="material-symbols-outlined text-base">format_align_center</span>
        </button>
        <button
          type="button"
          onClick={() => execCmd('justifyRight')}
          className="w-8 h-8 rounded hover:bg-surface-container flex items-center justify-center text-on-surface transition-colors"
          title="Căn phải"
        >
          <span className="material-symbols-outlined text-base">format_align_right</span>
        </button>

        <div className="w-[1px] h-5 bg-outline-variant/30 mx-1"></div>

        {/* Insert Link Button */}
        <button
          type="button"
          onClick={handleOpenLinkModal}
          className="px-2 h-8 rounded hover:bg-surface-container flex items-center justify-center text-on-surface gap-1 transition-colors"
          title="Chèn liên kết đường dẫn (Link)"
        >
          <span className="material-symbols-outlined text-base">link</span>
          <span className="text-[11px] font-bold">Link</span>
        </button>

        {/* Insert Image Button */}
        <button
          type="button"
          onClick={handleImageClick}
          disabled={uploading}
          className="px-3 h-8 rounded bg-secondary/10 hover:bg-secondary/20 flex items-center justify-center text-secondary font-bold gap-1 cursor-pointer transition-colors"
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
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        className="rich-editor-canvas min-h-[300px] p-4 outline-none text-xs font-medium leading-relaxed overflow-y-auto max-h-[500px]"
        data-placeholder="Bắt đầu viết bài viết mới của bạn tại đây..."
      />

      {/* Link Inserter Modal */}
      {isLinkModalOpen && (
        <div className="fixed inset-0 z-[999] bg-black/50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-outline-variant/60 w-full max-w-md p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/30">
              <div className="flex items-center gap-2 text-primary font-bold text-base">
                <span className="material-symbols-outlined">add_link</span>
                <h3>Chèn liên kết (Link)</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsLinkModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-surface-container flex items-center justify-center text-outline hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <form onSubmit={handleInsertLink} className="flex flex-col gap-4 text-xs font-medium">
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-on-surface">Đoạn văn hiển thị (Text)</label>
                <input
                  type="text"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  placeholder="Nhập chữ hiển thị (nếu để trống sẽ dùng URL)..."
                  className="h-10 px-3 border border-outline-variant/60 rounded-lg bg-surface text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-on-surface">
                  Địa chỉ liên kết URL <span className="text-secondary">*</span>
                </label>
                <input
                  type="text"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://example.com hoặc /tin-tuc/..."
                  required
                  autoFocus
                  className="h-10 px-3 border border-outline-variant/60 rounded-lg bg-surface text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none font-mono text-[11px]"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="linkNewTabCheck"
                  checked={linkNewTab}
                  onChange={(e) => setLinkNewTab(e.target.checked)}
                  className="w-4 h-4 rounded text-primary focus:ring-primary cursor-pointer accent-primary"
                />
                <label htmlFor="linkNewTabCheck" className="cursor-pointer select-none text-on-surface font-semibold">
                  Mở liên kết trong tab mới (khuyên dùng để giữ chân khách)
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-outline-variant/30">
                <button
                  type="button"
                  onClick={() => setIsLinkModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-outline-variant hover:bg-surface-container font-bold text-on-surface transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={() => handleInsertLink()}
                  className="px-5 py-2 rounded-lg bg-primary hover:bg-primary/90 text-white font-bold transition-all shadow-xs flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-base">check</span>
                  Chèn liên kết
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
