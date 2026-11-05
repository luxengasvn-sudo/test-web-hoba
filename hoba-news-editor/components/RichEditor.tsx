'use client';

import React, { useRef, useEffect, useState } from 'react';

export interface RichEditorProps {
  value: string;
  onChange: (value: string) => void;
  onImageUpload?: (file: File) => Promise<string>;
}

export default function RichEditor({ value, onChange, onImageUpload }: RichEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const colorMenuRef = useRef<HTMLDivElement>(null);

  const [uploading, setUploading] = useState(false);
  const [selectedFontSize, setSelectedFontSize] = useState('default');
  const [isColorMenuOpen, setIsColorMenuOpen] = useState(false);
  const [currentColor, setCurrentColor] = useState('#1e3a8a');

  // Link Modal States
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [linkNewTab, setLinkNewTab] = useState(true);
  const savedRangeRef = useRef<Range | null>(null);

  // Sync internal HTML content only when value changes externally
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || '';
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
        if (e.shiftKey) return;

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

  // Helper convert base64 to File
  const dataURLtoFile = (dataurl: string, filename: string): File | null => {
    try {
      const arr = dataurl.split(',');
      const mimeMatch = arr[0].match(/:(.*?);/);
      const mime = mimeMatch ? mimeMatch[1] : 'image/png';
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      return new File([u8arr], filename, { type: mime });
    } catch (_) {
      return null;
    }
  };

  // Paste handler: Clean external Word/Docs styles & upload pasted images
  const handlePaste = async (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const html = e.clipboardData.getData('text/html');
    const text = e.clipboardData.getData('text/plain');

    if (html) {
      try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        const allElements = doc.body.querySelectorAll('*');
        allElements.forEach((el) => {
          if (el instanceof HTMLElement) {
            el.style.fontFamily = '';
            if (el.style.color === 'rgb(0, 0, 0)' || el.style.color === '#000000' || el.style.color === '#000') {
              el.style.color = '';
            }
            if (el.style.backgroundColor === 'transparent' || el.style.backgroundColor === 'rgb(255, 255, 255)' || el.style.backgroundColor === '#ffffff') {
              el.style.backgroundColor = '';
            }
            if (el.style.lineHeight === '1.38') el.style.lineHeight = '';
            if (el.style.whiteSpace === 'pre-wrap') el.style.whiteSpace = '';
            if (!el.getAttribute('style')?.trim()) el.removeAttribute('style');
          }
        });

        const spans = Array.from(doc.body.querySelectorAll('span'));
        spans.forEach((span) => {
          if (span.id?.startsWith('docs-internal-guid')) span.removeAttribute('id');
          if (!span.getAttribute('style') && !span.className && !span.id) {
            span.replaceWith(...Array.from(span.childNodes));
          }
        });

        const base64Images = Array.from(doc.body.querySelectorAll('img')).filter(
          (img) => img.src && img.src.startsWith('data:image/')
        );

        if (base64Images.length > 0 && onImageUpload) {
          setUploading(true);
          for (let i = 0; i < base64Images.length; i++) {
            const imgEl = base64Images[i];
            const file = dataURLtoFile(imgEl.src, `pasted-image-${Date.now()}-${i}.png`);
            if (file) {
              try {
                const uploadedUrl = await onImageUpload(file);
                imgEl.src = uploadedUrl;
                imgEl.style.maxHeight = '420px';
                imgEl.style.display = 'inline-block';
                imgEl.style.borderRadius = '8px';
                imgEl.style.maxWidth = '100%';
              } catch (err) {
                console.error('Failed to auto-upload pasted image:', err);
                imgEl.remove();
              }
            } else {
              imgEl.remove();
            }
          }
          setUploading(false);
        }

        document.execCommand('insertHTML', false, doc.body.innerHTML);
      } catch (err) {
        document.execCommand('insertText', false, text);
      }
    } else if (text) {
      const escaped = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const formatted = escaped
        .split(/\r?\n\r?\n/)
        .map((p) => `<p>${p.replace(/\r?\n/g, '<br>')}</p>`)
        .join('');
      document.execCommand('insertHTML', false, formatted);
    }

    handleInput();
  };

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

  const handleApplyColor = (color: string) => {
    setCurrentColor(color);
    editorRef.current?.focus();
    document.execCommand('foreColor', false, color);
    handleInput();
    setIsColorMenuOpen(false);
  };

  const colorPresets = [
    { name: 'Đen than', color: '#1f2937' },
    { name: 'Xanh dương', color: '#1d4ed8' },
    { name: 'Đỏ nổi bật', color: '#dc2626' },
    { name: 'Xanh lá', color: '#16a34a' },
    { name: 'Cam hổ phách', color: '#d97706' },
    { name: 'Xám ghi', color: '#6b7280' },
  ];

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
    if (e && e.preventDefault) e.preventDefault();
    if (!linkUrl.trim()) return;

    let finalUrl = linkUrl.trim();
    if (!/^https?:\/\//i.test(finalUrl) && !finalUrl.startsWith('/') && !finalUrl.startsWith('#')) {
      finalUrl = 'https://' + finalUrl;
    }

    const displayText = linkText.trim() || finalUrl;
    const linkEl = document.createElement('a');
    linkEl.href = finalUrl;
    if (linkNewTab) {
      linkEl.target = '_blank';
      linkEl.rel = 'noopener noreferrer';
    }
    linkEl.style.color = '#2563eb';
    linkEl.style.textDecoration = 'underline';
    linkEl.style.fontWeight = '600';
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

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploading(true);
      try {
        let url = '';
        if (onImageUpload) {
          url = await onImageUpload(e.target.files[0]);
        } else {
          url = await new Promise((res) => {
            const r = new FileReader();
            r.onload = () => res(r.result as string);
            r.readAsDataURL(e.target.files![0]);
          });
        }

        const imgHtml = `
          <div style="margin: 20px 0; text-align: center;">
            <img src="${url}" alt="Ảnh bài viết" style="max-height: 420px; display: inline-block; border-radius: 8px; max-width: 100%; border: 1px solid #e5e7eb; padding: 4px; background: white;" />
            <p style="font-size: 12px; color: #6b7280; font-style: italic; margin-top: 6px;">Ảnh minh họa</p>
          </div>
          <p><br></p>
        `;
        editorRef.current?.focus();
        document.execCommand('insertHTML', false, imgHtml);
        handleInput();
      } catch (err: any) {
        alert('Lỗi tải ảnh lên: ' + (err.message || err));
      } finally {
        setUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="relative border border-gray-300 rounded-xl overflow-hidden bg-white shadow-sm flex flex-col text-xs font-medium">
      {/* Thanh Toolbar */}
      <div className="flex flex-wrap gap-1 items-center p-2 bg-gray-50 border-b border-gray-200 select-none">
        {/* Cỡ chữ */}
        <select
          value={selectedFontSize}
          onChange={(e) => handleFontSizeChange(e.target.value)}
          className="h-8 px-2 py-1 bg-white border border-gray-300 rounded hover:border-blue-500 text-xs text-gray-700 outline-none cursor-pointer"
        >
          <option value="default">Cỡ chữ</option>
          <option value="12px">12px - Nhỏ</option>
          <option value="14px">14px - Vừa</option>
          <option value="16px">16px - Chuẩn</option>
          <option value="18px">18px - Lớn</option>
          <option value="20px">20px - Rất lớn</option>
          <option value="24px">24px - Tiêu đề</option>
        </select>

        <div className="w-[1px] h-5 bg-gray-300 mx-1"></div>

        {/* B, I, U */}
        <button
          type="button"
          onClick={() => execCmd('bold')}
          className="w-8 h-8 rounded hover:bg-gray-200 flex items-center justify-center text-gray-700 font-bold"
          title="In đậm (Ctrl+B)"
        >
          B
        </button>
        <button
          type="button"
          onClick={() => execCmd('italic')}
          className="w-8 h-8 rounded hover:bg-gray-200 flex items-center justify-center text-gray-700 italic font-serif"
          title="In nghiêng (Ctrl+I)"
        >
          I
        </button>
        <button
          type="button"
          onClick={() => execCmd('underline')}
          className="w-8 h-8 rounded hover:bg-gray-200 flex items-center justify-center text-gray-700 underline"
          title="Gạch chân (Ctrl+U)"
        >
          U
        </button>

        {/* Màu chữ */}
        <div className="relative" ref={colorMenuRef}>
          <button
            type="button"
            onClick={() => setIsColorMenuOpen(!isColorMenuOpen)}
            className="h-8 px-2 rounded hover:bg-gray-200 flex items-center gap-1.5 text-gray-700 border border-gray-300"
            title="Đổi màu chữ"
          >
            <span className="font-bold">Màu</span>
            <div className="w-3.5 h-3.5 rounded border border-gray-400" style={{ backgroundColor: currentColor }} />
          </button>

          {isColorMenuOpen && (
            <div className="absolute left-0 top-full mt-1.5 p-3 bg-white rounded-xl shadow-xl border border-gray-200 z-50 w-52 flex flex-col gap-2">
              <span className="text-[11px] font-bold text-gray-500 uppercase">Màu có sẵn</span>
              <div className="grid grid-cols-3 gap-1.5">
                {colorPresets.map((p) => (
                  <button
                    key={p.color}
                    type="button"
                    onClick={() => handleApplyColor(p.color)}
                    className="flex items-center gap-1.5 p-1 rounded border border-gray-200 hover:border-blue-500 text-left"
                  >
                    <span className="w-3.5 h-3.5 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                    <span className="text-[10px] truncate text-gray-700">{p.name}</span>
                  </button>
                ))}
              </div>
              <div className="border-t border-gray-200 pt-2 flex items-center justify-between">
                <span className="text-[11px] font-medium text-gray-600">Tùy chọn:</span>
                <input
                  type="color"
                  value={currentColor}
                  onChange={(e) => handleApplyColor(e.target.value)}
                  className="w-6 h-6 rounded cursor-pointer border border-gray-300"
                />
              </div>
            </div>
          )}
        </div>

        <div className="w-[1px] h-5 bg-gray-300 mx-1"></div>

        {/* Headings */}
        <button
          type="button"
          onClick={() => execCmd('formatBlock', 'H1')}
          className="px-2 h-8 rounded hover:bg-gray-200 text-gray-800 font-bold"
          title="Tiêu đề H1"
        >
          H1
        </button>
        <button
          type="button"
          onClick={() => execCmd('formatBlock', 'H2')}
          className="px-2 h-8 rounded hover:bg-gray-200 text-gray-800 font-bold"
          title="Tiêu đề H2"
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => execCmd('formatBlock', 'H3')}
          className="px-2 h-8 rounded hover:bg-gray-200 text-gray-800 font-bold"
          title="Tiêu đề H3"
        >
          H3
        </button>
        <button
          type="button"
          onClick={() => execCmd('formatBlock', 'P')}
          className="px-2 h-8 rounded hover:bg-gray-200 text-gray-600"
          title="Đoạn văn"
        >
          Đoạn
        </button>
        <button
          type="button"
          onClick={() => execCmd('formatBlock', 'blockquote')}
          className="px-2 h-8 rounded hover:bg-gray-200 text-gray-700 italic border border-gray-200"
          title="Trích dẫn"
        >
          "Trích dẫn"
        </button>

        <div className="w-[1px] h-5 bg-gray-300 mx-1"></div>

        {/* List */}
        <button
          type="button"
          onClick={() => execCmd('insertUnorderedList')}
          className="w-8 h-8 rounded hover:bg-gray-200 text-gray-700"
          title="Danh sách dấu chấm"
        >
          • List
        </button>
        <button
          type="button"
          onClick={() => execCmd('insertOrderedList')}
          className="w-8 h-8 rounded hover:bg-gray-200 text-gray-700"
          title="Danh sách số"
        >
          1. List
        </button>

        <div className="w-[1px] h-5 bg-gray-300 mx-1"></div>

        {/* Align */}
        <button
          type="button"
          onClick={() => execCmd('justifyLeft')}
          className="px-1.5 h-8 rounded hover:bg-gray-200 text-gray-700"
          title="Căn trái"
        >
          Trái
        </button>
        <button
          type="button"
          onClick={() => execCmd('justifyCenter')}
          className="px-1.5 h-8 rounded hover:bg-gray-200 text-gray-700"
          title="Căn giữa"
        >
          Giữa
        </button>
        <button
          type="button"
          onClick={() => execCmd('justifyRight')}
          className="px-1.5 h-8 rounded hover:bg-gray-200 text-gray-700"
          title="Căn phải"
        >
          Phải
        </button>

        <div className="w-[1px] h-5 bg-gray-300 mx-1"></div>

        {/* Link & Image */}
        <button
          type="button"
          onClick={handleOpenLinkModal}
          className="px-2.5 h-8 rounded hover:bg-gray-200 text-blue-600 font-bold flex items-center gap-1 border border-blue-200 bg-blue-50"
          title="Chèn Link"
        >
          🔗 Link
        </button>

        <button
          type="button"
          onClick={handleImageClick}
          disabled={uploading}
          className="px-3 h-8 rounded bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center gap-1 cursor-pointer"
          title="Chèn ảnh"
        >
          📷 {uploading ? 'Đang tải...' : 'Chèn ảnh'}
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

      {/* Editor Canvas */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        className="min-h-[320px] p-4 outline-none text-sm leading-relaxed overflow-y-auto max-h-[550px] bg-white text-gray-900"
      />

      {/* Loading Overlay */}
      {uploading && (
        <div className="absolute inset-0 bg-white/80 z-20 flex flex-col items-center justify-center gap-2">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-bold text-blue-600">Đang tối ưu và tải ảnh lên...</span>
        </div>
      )}

      {/* Modal Chèn Link */}
      {isLinkModalOpen && (
        <div className="fixed inset-0 z-[999] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-300 w-full max-w-md p-6 flex flex-col gap-4">
            <h3 className="font-bold text-base text-gray-900">Chèn liên kết (Link)</h3>
            <form onSubmit={handleInsertLink} className="flex flex-col gap-3 text-xs">
              <div className="flex flex-col gap-1">
                <label className="font-bold text-gray-700">Chữ hiển thị</label>
                <input
                  type="text"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  placeholder="Nhập chữ hiển thị..."
                  className="h-9 px-3 border border-gray-300 rounded-lg outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-gray-700">Địa chỉ URL *</label>
                <input
                  type="text"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://example.com"
                  required
                  autoFocus
                  className="h-9 px-3 border border-gray-300 rounded-lg outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="linkNewTab"
                  checked={linkNewTab}
                  onChange={(e) => setLinkNewTab(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 cursor-pointer"
                />
                <label htmlFor="linkNewTab" className="cursor-pointer text-gray-700">
                  Mở trong tab mới
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsLinkModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 font-bold text-gray-700"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold"
                >
                  Chèn link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
