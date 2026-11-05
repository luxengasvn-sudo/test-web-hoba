'use client';

import React, { useState } from 'react';
import RichEditor from './RichEditor';
import { toSlug } from '../lib/slug';

export interface NewsFormData {
  id?: string;
  title: string;
  slug: string;
  category: string;
  status: 'Published' | 'Draft';
  thumbnail_url?: string;
  is_featured?: boolean;
  description: string;
  content: string;
}

interface NewsEditorFormProps {
  initialData?: Partial<NewsFormData>;
  categories?: string[];
  isSubmitting?: boolean;
  onSave: (data: NewsFormData) => Promise<void> | void;
  onCancel?: () => void;
  onImageUpload?: (file: File) => Promise<string>;
}

export default function NewsEditorForm({
  initialData,
  categories = ['Tin hiệp hội', 'Thị trường Gas', 'Sự kiện & Hội thảo', 'Thông báo'],
  isSubmitting = false,
  onSave,
  onCancel,
  onImageUpload,
}: NewsEditorFormProps) {
  const [formTitle, setFormTitle] = useState(initialData?.title || '');
  const [formSlug, setFormSlug] = useState(initialData?.slug || '');
  const [isSlugAuto, setIsSlugAuto] = useState(!initialData?.slug);
  const [formCategory, setFormCategory] = useState(initialData?.category || categories[0] || 'Tin hiệp hội');
  const [formStatus, setFormStatus] = useState<'Published' | 'Draft'>(initialData?.status || 'Published');
  const [formDesc, setFormDesc] = useState(initialData?.description || '');
  const [formContent, setFormContent] = useState(initialData?.content || '');
  const [formThumbnail, setFormThumbnail] = useState(initialData?.thumbnail_url || '');
  const [formFeatured, setFormFeatured] = useState(initialData?.is_featured || false);
  const [coverUploading, setCoverUploading] = useState(false);

  // Fallback upload nếu không truyền onImageUpload
  const defaultUpload = async (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.readAsDataURL(file);
    });
  };

  const handleUpload = onImageUpload || defaultUpload;

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCoverUploading(true);
      try {
        const url = await handleUpload(e.target.files[0]);
        setFormThumbnail(url);
      } catch (err: any) {
        alert('Lỗi tải ảnh bìa: ' + (err.message || err));
      } finally {
        setCoverUploading(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      alert('Vui lòng nhập tiêu đề bài viết.');
      return;
    }
    const finalSlug = formSlug.trim() || toSlug(formTitle);
    await onSave({
      id: initialData?.id,
      title: formTitle.trim(),
      slug: finalSlug,
      category: formCategory,
      status: formStatus,
      thumbnail_url: formThumbnail,
      is_featured: formFeatured,
      description: formDesc.trim(),
      content: formContent,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 bg-white p-6 rounded-xl border border-gray-200 shadow-sm max-w-4xl mx-auto text-xs">
      {/* Tiêu đề */}
      <div className="flex flex-col gap-2">
        <label className="font-bold text-gray-700 text-sm">Tiêu đề bài viết *</label>
        <input
          value={formTitle}
          onChange={(e) => {
            const val = e.target.value;
            setFormTitle(val);
            if (isSlugAuto) {
              setFormSlug(toSlug(val));
            }
          }}
          className="h-11 border border-gray-300 rounded-lg px-4 bg-white text-gray-900 text-sm focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none"
          placeholder="Nhập tiêu đề tin tức..."
          required
          type="text"
        />
      </div>

      {/* Đường dẫn thân thiện (Slug) */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="font-bold text-gray-700">Đường dẫn thân thiện (Slug) *</label>
          <button
            type="button"
            onClick={() => {
              setFormSlug(toSlug(formTitle));
              setIsSlugAuto(true);
            }}
            className="text-[11px] text-blue-600 hover:underline font-medium"
          >
            Tự động tạo từ tiêu đề
          </button>
        </div>
        <input
          value={formSlug}
          onChange={(e) => {
            setFormSlug(e.target.value);
            setIsSlugAuto(false);
          }}
          className="h-10 border border-gray-300 rounded-lg px-4 bg-gray-50 text-gray-800 text-xs focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none font-mono"
          placeholder="vi-du-duong-dan-than-thien"
          required
          type="text"
        />
      </div>

      {/* Chuyên mục & Trạng thái */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <label className="font-bold text-gray-700">Chuyên mục</label>
          <select
            value={formCategory}
            onChange={(e) => setFormCategory(e.target.value)}
            className="h-10 border border-gray-300 rounded-lg px-3 bg-white text-gray-800 text-xs focus:border-blue-600 outline-none"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-bold text-gray-700">Trạng thái phát hành</label>
          <select
            value={formStatus}
            onChange={(e) => setFormStatus(e.target.value as 'Published' | 'Draft')}
            className="h-10 border border-gray-300 rounded-lg px-3 bg-white text-gray-800 text-xs focus:border-blue-600 outline-none"
          >
            <option value="Draft">Bản nháp</option>
            <option value="Published">Công khai</option>
          </select>
        </div>
      </div>

      {/* Ảnh đại diện / Thumbnail */}
      <div className="flex flex-col gap-2">
        <label className="font-bold text-gray-700">Ảnh đại diện (Thumbnail / Ảnh bìa mạng xã hội)</label>
        <div className="flex items-center gap-4">
          {formThumbnail && (
            <div className="w-20 h-16 rounded overflow-hidden border border-gray-300 flex-shrink-0 bg-gray-100">
              <img src={formThumbnail} alt="Preview" className="w-full h-full object-cover" />
            </div>
          )}
          <div className="flex-grow flex flex-col gap-1.5">
            <div className="flex gap-2">
              <input
                value={formThumbnail}
                onChange={(e) => setFormThumbnail(e.target.value)}
                className="flex-grow h-10 border border-gray-300 rounded-lg px-4 bg-white text-gray-800 text-xs focus:border-blue-600 outline-none"
                placeholder="Dán link ảnh hoặc tải lên..."
                type="text"
              />
              <label className="h-10 px-4 bg-blue-700 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1 hover:bg-blue-800 cursor-pointer transition-colors">
                <span>{coverUploading ? 'Đang tải...' : 'Tải lên'}</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleCoverUpload}
                  disabled={coverUploading}
                />
              </label>
            </div>
            <p className="text-[11px] text-gray-500">
              💡 Ảnh này dùng làm ảnh đại diện trên danh sách và chia sẻ Zalo/Facebook.
            </p>
          </div>
        </div>
      </div>

      {/* Bài viết nổi bật */}
      <div className="flex items-center gap-2 py-1">
        <input
          id="featured-checkbox"
          type="checkbox"
          checked={formFeatured}
          onChange={(e) => setFormFeatured(e.target.checked)}
          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <label htmlFor="featured-checkbox" className="font-bold text-gray-700 cursor-pointer">
          Đặt làm bài viết tiêu điểm (Hiển thị nổi bật)
        </label>
      </div>

      {/* Mô tả ngắn */}
      <div className="flex flex-col gap-2">
        <label className="font-bold text-gray-700">Mô tả ngắn *</label>
        <textarea
          value={formDesc}
          onChange={(e) => setFormDesc(e.target.value)}
          className="min-h-[80px] border border-gray-300 rounded-lg p-3 bg-white text-gray-800 text-xs focus:border-blue-600 outline-none resize-y"
          placeholder="Mô tả tóm tắt nội dung bài viết..."
          required
        />
      </div>

      {/* Nội dung chi tiết - RichEditor */}
      <div className="flex flex-col gap-2">
        <label className="font-bold text-gray-700 text-sm">Nội dung chi tiết *</label>
        <RichEditor
          value={formContent}
          onChange={setFormContent}
          onImageUpload={handleUpload}
        />
      </div>

      {/* Nút hành động */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 rounded-lg border border-gray-300 font-bold text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Hủy bỏ
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2.5 rounded-lg bg-blue-700 text-white font-bold hover:bg-blue-800 transition-all flex items-center gap-2 disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <span className="animate-spin inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full"></span>
              <span>Đang lưu...</span>
            </>
          ) : (
            <span>{initialData?.id ? 'Lưu thay đổi' : 'Đăng bài viết'}</span>
          )}
        </button>
      </div>
    </form>
  );
}
