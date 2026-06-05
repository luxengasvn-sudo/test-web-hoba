'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import RichEditor from '@/components/admin/RichEditor';

interface CustomPage {
  id: string;
  slug: string;
  title: string;
  description: string;
  content: string;
  thumbnail_url: string;
  status: 'Published' | 'Draft';
  created_at: string;
}

// Resilient Image preview components to prevent broken images
function TableImage({ src }: { src: string }) {
  const [error, setError] = useState(false);
  useEffect(() => {
    setError(false); // Reset error state when source changes
  }, [src]);

  if (error || !src) {
    return <span className="material-symbols-outlined text-outline text-lg">image</span>;
  }
  return (
    <img
      src={src}
      alt="Cover"
      className="w-full h-full object-cover"
      onError={() => setError(true)}
    />
  );
}

function PreviewImage({ src }: { src: string }) {
  const [error, setError] = useState(false);
  useEffect(() => {
    setError(false); // Reset error state when source changes
  }, [src]);

  if (error || !src) {
    return <span className="material-symbols-outlined text-outline text-xl">image</span>;
  }
  return (
    <img
      src={src}
      alt="Preview"
      className="w-full h-full object-cover"
      onError={() => setError(true)}
    />
  );
}

export default function AdminCustomPages() {
  const [pages, setPages] = useState<CustomPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingPageId, setEditingPageId] = useState<string | null>(null);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formThumbnail, setFormThumbnail] = useState('');
  const [formStatus, setFormStatus] = useState<'Published' | 'Draft'>('Draft');
  
  // Tracking if user manually edited the slug field
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);

  // Default mock pages for first initialization or offline fallback
  const defaultPages: CustomPage[] = [
    {
      id: 'dieu-khoan',
      title: 'Điều khoản sử dụng dịch vụ',
      slug: 'dieu-khoan-su-dung',
      description: 'Điều khoản sử dụng dịch vụ và trách nhiệm của hội viên khi tham gia hoạt động tại website Hiệp hội HOBA LPG.',
      content: `
        <h2>1. Quy định chung</h2>
        <p>Chào mừng bạn đến với Cổng thông tin điện tử của Hiệp hội Kinh doanh Khí hóa lỏng TP.HCM (HOBA LPG). Khi truy cập và sử dụng website này, bạn đồng ý tuân thủ các điều khoản quy định dưới đây.</p>
        <h2>2. Quyền sở hữu trí tuệ</h2>
        <p>Tất cả nội dung, tài liệu, bài viết kỹ thuật, thiết kế và logo trên website này đều thuộc quyền sở hữu của HOBA LPG hoặc đã được sự đồng ý của đối tác sở hữu bản quyền. Mọi hình thức sao chép, phân phối phi thương mại cần ghi rõ nguồn gốc HOBA LPG.</p>
        <h2>3. Trách nhiệm của hội viên</h2>
        <p>Hội viên có trách nhiệm bảo mật thông tin tài khoản (nếu có), cung cấp thông tin đăng ký chính xác, trung thực và tuân thủ các quy định pháp luật hiện hành về an toàn phòng cháy chữa cháy và chiết nạp LPG.</p>
      `,
      thumbnail_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDTnDaM8uzQn1_0DhmhC7KmeGLksQoODMcExU4UgxEcKMACoKgUXJW_2llmo7m-ViDB3xt2KW3AffPsNIEWvPC1uYoP833s0_aSIdyHJqgQJ3M7CeBBlXZb6AXaffkH0smJ-ud5Q1xRd87Fq9fBxQkp-UOoxSITgv85D-HFOp0IhgyruXjbG3lsDx9HPlbswwwJyQC1LeI0F7lTCuuNnRSBcWo3UUy-H2FP9vD9KSPm35z6PtDtTWMejNSdqXtYLoWrH28NsiAEQHc',
      status: 'Published',
      created_at: '2026-05-20'
    },
    {
      id: 'bao-mat',
      title: 'Chính sách bảo mật thông tin',
      slug: 'chinh-sach-bao-mat',
      description: 'Bảo vệ quyền riêng tư và thông tin doanh nghiệp thành viên là ưu tiên hàng đầu của Hiệp hội HOBA LPG.',
      content: `
        <h2>1. Thu thập thông tin</h2>
        <p>Chúng tôi chỉ thu thập các thông tin cần thiết phục vụ cho quá trình đăng ký hội viên, bao gồm tên doanh nghiệp, mã số thuế, địa chỉ văn phòng, thông tin liên lạc của đại diện doanh nghiệp.</p>
        <h2>2. Sử dụng thông tin</h2>
        <p>Thông tin thu thập chỉ được dùng trong nội bộ Ban thư ký Hiệp hội để quản lý danh sách hội viên, gửi thư mời hội thảo kỹ thuật, cập nhật thông tư nghị định hoặc phục vụ yêu cầu đồng bộ hiển thị Trang hội viên công khai (khi có sự đồng ý).</p>
        <h2>3. Cam kết bảo mật</h2>
        <p>HOBA LPG cam kết không bán, chia sẻ hay cung cấp thông tin doanh nghiệp cho bên thứ ba vì mục đích thương mại khi chưa có văn bản chấp thuận từ phía doanh nghiệp.</p>
      `,
      thumbnail_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDTnDaM8uzQn1_0DhmhC7KmeGLksQoODMcExU4UgxEcKMACoKgUXJW_2llmo7m-ViDB3xt2KW3AffPsNIEWvPC1uYoP833s0_aSIdyHJqgQJ3M7CeBBlXZb6AXaffkH0smJ-ud5Q1xRd87Fq9fBxQkp-UOoxSITgv85D-HFOp0IhgyruXjbG3lsDx9HPlbswwwJyQC1LeI0F7lTCuuNnRSBcWo3UUy-H2FP9vD9KSPm35z6PtDtTWMejNSdqXtYLoWrH28NsiAEQHc',
      status: 'Published',
      created_at: '2026-05-22'
    }
  ];

  // Vietnames slug generator
  const generateSlug = (text: string): string => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  };

  const fetchPages = async () => {
    setLoading(true);
    if (!supabase) {
      const saved = localStorage.getItem('hoba_website_custom_pages');
      if (saved) {
        try {
          setPages(JSON.parse(saved));
        } catch (e) {
          setPages(defaultPages);
        }
      } else {
        setPages(defaultPages);
        localStorage.setItem('hoba_website_custom_pages', JSON.stringify(defaultPages));
      }
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('website_config')
        .select('value')
        .eq('key', 'custom_pages')
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Row doesn't exist yet, insert mock data
          const { error: insertError } = await supabase
            .from('website_config')
            .insert({
              key: 'custom_pages',
              value: { pages: defaultPages }
            });
          if (!insertError) {
            setPages(defaultPages);
          }
        } else {
          throw error;
        }
      } else if (data?.value?.pages) {
        setPages(data.value.pages);
      } else {
        setPages([]);
      }
    } catch (err) {
      console.error('Lỗi khi tải trang độc lập, sử dụng fallback:', err);
      setPages(defaultPages);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  const savePagesToDb = async (updatedPages: CustomPage[]) => {
    if (!supabase) {
      localStorage.setItem('hoba_website_custom_pages', JSON.stringify(updatedPages));
      setPages(updatedPages);
      return true;
    }

    try {
      // Fetch current config first to merge safely
      const { data } = await supabase
        .from('website_config')
        .select('value')
        .eq('key', 'custom_pages')
        .single();

      const currentVal = data?.value || {};
      const finalVal = {
        ...currentVal,
        pages: updatedPages
      };

      const { error } = await supabase
        .from('website_config')
        .upsert({
          key: 'custom_pages',
          value: finalVal,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      setPages(updatedPages);
      return true;
    } catch (err) {
      alert('Không thể lưu cấu hình. Lỗi: ' + (err as Error).message);
      return false;
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa trang độc lập này? Thao tác này không thể hoàn tác.')) return;
    const updated = pages.filter(p => p.id !== id);
    const success = await savePagesToDb(updated);
    if (success) {
      alert('Đã xóa trang độc lập thành công!');
    }
  };

  const toggleStatus = async (id: string, currentStatus: 'Published' | 'Draft') => {
    const newStatus: 'Published' | 'Draft' = currentStatus === 'Published' ? 'Draft' : 'Published';
    const updated: CustomPage[] = pages.map(p => p.id === id ? { ...p, status: newStatus } : p);
    await savePagesToDb(updated);
  };

  // Image Upload Handler
  const uploadImage = async (file: File): Promise<string> => {
    if (!supabase) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
      });
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `page-assets/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('hoba-assets')
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('hoba-assets')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleCoverUploadChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCoverUploading(true);
      try {
        const url = await uploadImage(e.target.files[0]);
        setFormThumbnail(url);
      } catch (err) {
        alert('Lỗi tải ảnh đại diện lên: ' + (err as Error).message);
      } finally {
        setCoverUploading(false);
      }
    }
  };

  const handleRemoveCover = () => {
    setFormThumbnail('');
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFormTitle(val);
    // Auto generate slug if we are creating and slug field is not manually customized yet
    if (!editingPageId && !isSlugManuallyEdited) {
      setFormSlug(generateSlug(val));
    }
  };

  const handleSlugInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // Allow typing only lowercase letters, numbers, and dashes
    const sanitized = val
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'd')
      .replace(/[^a-z0-9-]/g, '');
    setFormSlug(sanitized);
    setIsSlugManuallyEdited(true);
  };

  const handleEdit = (item: CustomPage) => {
    setEditingPageId(item.id);
    setFormTitle(item.title);
    setFormSlug(item.slug);
    setFormDesc(item.description || '');
    setFormContent(item.content || '');
    setFormThumbnail(item.thumbnail_url || '');
    setFormStatus(item.status);
    setIsSlugManuallyEdited(true);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      alert('Vui lòng nhập tiêu đề trang.');
      return;
    }
    if (!formSlug.trim()) {
      alert('Vui lòng nhập đường dẫn URL (slug).');
      return;
    }
    if (!formContent.trim()) {
      alert('Vui lòng nhập nội dung chi tiết.');
      return;
    }

    // Check slug uniqueness
    const slugExists = pages.some(
      p => p.slug === formSlug.trim() && p.id !== editingPageId
    );
    if (slugExists) {
      alert('Đường dẫn URL (slug) này đã tồn tại trên một trang khác. Vui lòng nhập đường dẫn khác.');
      return;
    }

    setSubmitting(true);
    const publishDate = new Date().toISOString().split('T')[0];

    let updatedPages: CustomPage[] = [];

    if (editingPageId) {
      updatedPages = pages.map(p => p.id === editingPageId ? {
        ...p,
        title: formTitle.trim(),
        slug: formSlug.trim(),
        description: formDesc.trim(),
        content: formContent,
        thumbnail_url: formThumbnail,
        status: formStatus
      } : p);
    } else {
      const newPage: CustomPage = {
        id: 'page-' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
        title: formTitle.trim(),
        slug: formSlug.trim(),
        description: formDesc.trim(),
        content: formContent,
        thumbnail_url: formThumbnail,
        status: formStatus,
        created_at: publishDate
      };
      updatedPages = [newPage, ...pages];
    }

    const success = await savePagesToDb(updatedPages);
    setSubmitting(false);
    if (success) {
      setIsModalOpen(false);
      resetForm();
      alert(editingPageId ? 'Cập nhật trang độc lập thành công!' : 'Tạo mới trang độc lập thành công!');
    }
  };

  const resetForm = () => {
    setEditingPageId(null);
    setFormTitle('');
    setFormSlug('');
    setFormDesc('');
    setFormContent('');
    setFormThumbnail('');
    setFormStatus('Draft');
    setIsSlugManuallyEdited(false);
  };

  const filteredPages = pages.filter(p => {
    return (
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.slug.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-primary">Quản lý Trang độc lập (Custom Pages)</h2>
          <p className="text-xs text-on-surface-variant mt-1">
            Thiết lập các trang nội dung tĩnh độc lập như Điều khoản dịch vụ, Chính sách bảo mật, hay các trang giới thiệu con.
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="bg-primary text-white text-xs px-4 py-2.5 rounded-lg font-bold hover:bg-primary-container transition-all active:scale-95 flex items-center gap-1.5 shadow-sm"
        >
          <span className="material-symbols-outlined text-sm">add_circle</span> Tạo trang mới
        </button>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-xl border border-outline-variant/30 flex flex-col sm:flex-row gap-4 items-center justify-between shadow-sm">
        <div className="relative w-full sm:max-w-xs">
          <input
            className="w-full pl-9 pr-4 py-2 text-xs border border-outline-variant/50 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            placeholder="Tìm theo tiêu đề hoặc URL..."
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <span className="material-symbols-outlined absolute left-3 top-2 text-outline text-lg">search</span>
        </div>
      </div>

      {/* List Table */}
      <div className="bg-white rounded-xl border border-outline-variant/30 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-on-surface-variant font-medium">Đang tải danh sách các trang tùy chỉnh...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-surface-container-low text-on-surface-variant font-bold border-b border-outline-variant/30">
                  <th className="p-4 w-16 text-center">Bìa</th>
                  <th className="p-4">Tiêu đề & URL</th>
                  <th className="p-4">Mô tả ngắn</th>
                  <th className="p-4 w-28">Ngày tạo</th>
                  <th className="p-4 w-28">Trạng thái</th>
                  <th className="p-4 text-center w-40">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {filteredPages.length > 0 ? (
                  filteredPages.map((p) => (
                    <tr key={p.id} className="hover:bg-surface-container-lowest/40 transition-colors">
                      <td className="p-4 text-center">
                        <div className="w-10 h-10 rounded border border-outline-variant/30 bg-surface-container-low overflow-hidden mx-auto flex items-center justify-center">
                          <TableImage src={p.thumbnail_url} />
                        </div>
                      </td>
                      <td className="p-4 font-bold text-primary max-w-xs leading-relaxed">
                        <div className="flex flex-col gap-1">
                          <span>{p.title}</span>
                          <a
                            href={`/p?slug=${p.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] text-secondary font-medium hover:underline flex items-center gap-0.5"
                          >
                            <span className="material-symbols-outlined text-[10px]">link</span>
                            /p?slug={p.slug}
                          </a>
                        </div>
                      </td>
                      <td className="p-4 text-on-surface-variant font-medium max-w-sm truncate leading-relaxed">
                        {p.description || 'Không có mô tả.'}
                      </td>
                      <td className="p-4 text-on-surface-variant font-medium">{p.created_at}</td>
                      <td className="p-4">
                        <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                          p.status === 'Published'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {p.status === 'Published' ? 'Công khai' : 'Bản nháp'}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => toggleStatus(p.id, p.status)}
                            className={`px-2 py-1 rounded text-[9px] font-bold flex items-center gap-0.5 ${
                              p.status === 'Published'
                                ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                : 'bg-primary text-white hover:bg-primary-container'
                            }`}
                          >
                            <span className="material-symbols-outlined text-[10px]">
                              {p.status === 'Published' ? 'visibility_off' : 'visibility'}
                            </span>
                            {p.status === 'Published' ? 'Ẩn bản nháp' : 'Xuất bản'}
                          </button>
                          <button
                            onClick={() => handleEdit(p)}
                            className="text-on-surface-variant hover:text-primary px-1 py-1 rounded transition-colors"
                            title="Chỉnh sửa bài viết"
                          >
                            <span className="material-symbols-outlined text-sm">edit</span>
                          </button>
                          <button
                            onClick={() => handleDelete(p.id)}
                            className="text-on-surface-variant hover:text-red-500 px-1 py-1 rounded transition-colors"
                            title="Xóa bài viết"
                          >
                            <span className="material-symbols-outlined text-sm">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-on-surface-variant text-sm font-medium">
                      Không tìm thấy trang tùy chỉnh nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl border border-outline-variant/30 shadow-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto p-6 md:p-8 flex flex-col text-xs">
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-6 border-b border-outline-variant/20 pb-3">
              <h3 className="text-base font-black text-primary flex items-center gap-2">
                <span className="material-symbols-outlined">edit_document</span>
                {editingPageId ? 'Cập nhật Trang độc lập' : 'Tạo Trang độc lập mới'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-surface-container flex items-center justify-center text-outline transition-colors"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Row 1: Title and Slug */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="font-bold text-on-surface-variant">Tiêu đề trang *</label>
                  <input
                    value={formTitle}
                    onChange={handleTitleChange}
                    className="h-10 border border-outline-variant rounded-lg px-4 bg-surface text-on-surface text-xs focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                    placeholder="Nhập tiêu đề trang mới..."
                    required
                    type="text"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-bold text-on-surface-variant flex justify-between items-center">
                    <span>Đường dẫn URL (Slug) *</span>
                    <span className="text-[10px] text-on-surface-variant/70 normal-case font-normal italic">
                      Dạng: /p?slug=[slug]
                    </span>
                  </label>
                  <input
                    value={formSlug}
                    onChange={handleSlugInputChange}
                    className="h-10 border border-outline-variant rounded-lg px-4 bg-surface text-on-surface text-xs focus:border-primary focus:ring-1 focus:ring-primary outline-none font-mono"
                    placeholder="VD: dieu-khoan-su-dung"
                    required
                    type="text"
                  />
                </div>
              </div>

              {/* Row 2: Cover image and Status */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                {/* Thumbnail editing */}
                <div className="flex flex-col gap-2 md:col-span-2">
                  <label className="font-bold text-on-surface-variant">Ảnh đại diện (Banner/Bìa trang)</label>
                  <div className="flex items-center gap-4 bg-surface-container-low/30 p-3 rounded-lg border border-outline-variant/20">
                    <div className="w-20 h-16 rounded overflow-hidden border border-outline-variant/30 flex-shrink-0 bg-white flex items-center justify-center relative group">
                      <PreviewImage src={formThumbnail} />
                    </div>
                    <div className="flex-grow flex flex-col gap-1.5">
                      <div className="flex gap-2">
                        <input
                          value={formThumbnail}
                          onChange={(e) => setFormThumbnail(e.target.value)}
                          className="flex-grow h-9 border border-outline-variant rounded-lg px-3 bg-surface text-on-surface text-[11px] focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                          placeholder="Dán URL ảnh hoặc nhấn tải lên..."
                          type="text"
                        />
                        <label className="h-9 px-3 bg-secondary text-white text-[11px] font-bold rounded-lg flex items-center justify-center gap-1 hover:bg-[#93000d] cursor-pointer transition-colors active:scale-95">
                          <span className="material-symbols-outlined text-sm">cloud_upload</span>
                          {coverUploading ? 'Đang tải...' : 'Tải lên'}
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleCoverUploadChange}
                            disabled={coverUploading}
                          />
                        </label>
                        {formThumbnail && (
                          <button
                            type="button"
                            onClick={handleRemoveCover}
                            className="h-9 w-9 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg flex items-center justify-center border border-red-200 transition-colors active:scale-95"
                            title="Xóa ảnh đại diện"
                          >
                            <span className="material-symbols-outlined text-base">delete</span>
                          </button>
                        )}
                      </div>
                      <p className="text-[10px] text-on-surface-variant flex items-center justify-between">
                        <span>Hỗ trợ JPG, PNG, WEBP (Tối đa 5MB).</span>
                        {formThumbnail && (
                          <span className="text-red-500 font-bold hover:underline cursor-pointer" onClick={handleRemoveCover}>
                            Gỡ ảnh đại diện
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="font-bold text-on-surface-variant">Trạng thái phát hành</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="h-10 border border-outline-variant rounded-lg px-4 bg-white text-on-surface text-xs focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  >
                    <option value="Draft">Bản nháp (Chỉ admin xem)</option>
                    <option value="Published">Công khai (Tất cả mọi người)</option>
                  </select>
                </div>
              </div>

              {/* Row 3: Short Description */}
              <div className="flex flex-col gap-2">
                <label className="font-bold text-on-surface-variant">Mô tả ngắn (SEO Description)</label>
                <textarea
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="min-h-[60px] border border-outline-variant rounded-lg p-3 bg-surface text-on-surface text-xs focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-y"
                  placeholder="Mô tả ngắn gọn về nội dung trang, dùng để tối ưu hóa hiển thị khi tìm kiếm..."
                />
              </div>

              {/* Row 4: WYSIWYG Content Editor */}
              <div className="flex flex-col gap-2">
                <label className="font-bold text-on-surface-variant">Nội dung trang chi tiết *</label>
                <RichEditor
                  value={formContent}
                  onChange={setFormContent}
                  onImageUpload={uploadImage}
                />
              </div>

              {/* Modal Buttons */}
              <div className="flex justify-end gap-3 pt-5 border-t border-outline-variant/30 mt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-lg border border-outline-variant font-bold hover:bg-surface-container transition-colors active:scale-95"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-lg bg-primary text-white font-bold hover:bg-primary-container transition-all flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <span className="animate-spin inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full"></span>
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-sm">save</span>
                      Lưu trang
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
