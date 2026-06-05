'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import RichEditor from '@/components/admin/RichEditor';

interface NewsAdmin {
  id: string;
  title: string;
  category: string;
  status: 'Published' | 'Draft';
  date: string;
  description?: string;
  content?: string;
  thumbnail_url?: string;
  is_featured?: boolean;
}

export default function AdminNews() {
  const [search, setSearch] = useState('');
  const [news, setNews] = useState<NewsAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingNewsId, setEditingNewsId] = useState<string | null>(null);

  // Upload States
  const [coverUploading, setCoverUploading] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState('Hoạt động hiệp hội');
  const [formStatus, setFormStatus] = useState<'Published' | 'Draft'>('Draft');
  const [formDesc, setFormDesc] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formThumbnail, setFormThumbnail] = useState('https://lh3.googleusercontent.com/aida-public/AB6AXuBkw8wvVWBfbwPAeTKo8PMx2ultvC2Z07ci7u1EwmQRYIQdG3HLOkRvCkxHVZOCjaMCsm0lBKJLhIvMnScV5kwaPGcvpaRn8DHx8DnKPT3bUjoaRUfnOBf1zjyc1KSikF9jdjDb0Cm4ygtWq0lQDyOHPhX0g_XTxUg6i1Gzup--EfAS-Bpffvf-nmOq1kdYy65xI3RVbwcmX-Qu2RynlZO6GizLjYQNwZWcs4vyR-ZcfhJQh_08c1-vttg7HGLtmD77bj7i32XzqE4');
  const [formFeatured, setFormFeatured] = useState(false);

  const defaultNews: NewsAdmin[] = [
    {
      id: '1',
      title: 'Cập nhật xu hướng thị trường LPG khu vực phía Nam 2026',
      category: 'Bản tin chuyên ngành',
      status: 'Published',
      date: '2026-05-10',
      description: 'Phân tích chuyên sâu về biến động cung cầu, giá gas thế giới và tác động đến các trạm chiết nạp.',
      thumbnail_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDTnDaM8uzQn1_0DhmhC7KmeGLksQoODMcExU4UgxEcKMACoKgUXJW_2llmo7m-ViDB3xt2KW3AffPsNIEWvPC1uYoP833s0_aSIdyHJqgQJ3M7CeBBlXZb6AXaffkH0smJ-ud5Q1xRd87Fq9fBxQkp-UOoxSITgv85D-HFOp0IhgyruXjbG3lsDx9HPlbswwwJyQC1LeI0F7lTCuuNnRSBcWo3UUy-H2FP9vD9KSPm35z6PtDtTWMejNSdqXtYLoWrH28NsiAEQHc',
      is_featured: true
    },
    {
      id: '2',
      title: 'Tăng cường tiêu chuẩn an toàn trong hệ thống chiết nạp',
      category: 'Kỹ thuật - An toàn',
      status: 'Published',
      date: '2026-05-06',
      description: 'Hướng dẫn kiểm tra định kỳ hệ thống van an toàn bồn chứa LPG.',
      thumbnail_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCd2LKfPS_qVXIaFpb-YI8xVvamEFKJwsAWDR_F6_kMft_JUW1eji4905tchFl4JT3GENT7J4hmma4MEUcrBFLNin0zDrmnAit0SlkhGARJt5rbTmYD1n-_I6Mk37Z8Sr1EqM8Ldzg-6dMzSpy1wrTCyeuEZDczV-zDSpSukz371vL7lRlt3ephKeZgrc7LdnYCTjQHYVkmkUIUCeSowvxd1vn3SbgkU30srqfp_HKJPDSkcBNy-PNSId3_gsU4BJTTeL2qz5pVGz4',
      is_featured: false
    },
    {
      id: '3',
      title: 'HOBA tổ chức hội thảo kết nối 150+ doanh nghiệp gas',
      category: 'Hoạt động hiệp hội',
      status: 'Published',
      date: '2026-04-28',
      description: 'Diễn đàn thường niên xúc tiến thương mại và kỹ thuật ngành gas.',
      thumbnail_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDpq3p2BNGjKIzkbtZzJx6XE4QhBg8rX3SLG7kaZe3xIzwjK4UxrkRz0wGNIgs6vhQs6MGUuQLR6Ip4XEAzCdspTirigwb78XhgaSeci66qanxZLWWKsJS3QVhzuWtumYfio8watxGy2eSI_gCk4mYA2weVkRk3vPFme3OWZ7SVwBXiJS_bA4gDQhTX6mNnm0SnlIFp843ZQ1aAqLJHEQEZxzmaicFKorrJFu4R-Po8M4tuSkTztog70nwDnGdwJo7GrXS8V5CJ0qs',
      is_featured: false
    },
    {
      id: '4',
      title: 'Bản tin an toàn phòng cháy chữa cháy Quý I/2026',
      category: 'Kỹ thuật - An toàn',
      status: 'Draft',
      date: '2026-04-15',
      description: 'Cập nhật nghị định mới về kiểm định an toàn kỹ thuật bồn chứa LPG.',
      thumbnail_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA0epjt4jHlAwZXMkOTECe3O5TtboSouvkBg0LkmS9UTakVTL8ilvgyR9yCLlYOA3Y4SIfyqun3MSg5aPf9amyLVFeRbI0Numz0XvdgU760wcXN1-jCFocY0yVqMnwSZ8U4gVatmQe5Lm6y27cYBrRVkEGtarzsBdjUqrVkuohwA3z12VHkHEYtuZ2k-jTl4-d7buzYHhBJNdaFSNJlcE8yT2c_Ap-9ZUkUuDmDmuvrtimxRGQMKQBnURfC-i9wq7WO7FkJO7u4idI',
      is_featured: false
    }
  ];

  const fetchNews = async () => {
    setLoading(true);
    if (!supabase) {
      setNews(defaultNews);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .order('publish_date', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        const formatted: NewsAdmin[] = data.map((d: any) => ({
          id: d.id,
          title: d.title,
          category: d.category,
          status: d.status,
          date: d.publish_date,
          description: d.description,
          content: d.content,
          thumbnail_url: d.thumbnail_url,
          is_featured: d.is_featured
        }));
        setNews(formatted);
      } else {
        setNews([]);
      }
    } catch (err) {
      console.error('Lỗi khi tải tin tức từ Supabase, chuyển sang fallback:', err);
      setNews(defaultNews);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa bài viết này?')) return;

    if (!supabase) {
      setNews(prev => prev.filter(n => n.id !== id));
      return;
    }

    try {
      const { error } = await supabase.from('news').delete().eq('id', id);
      if (error) throw error;
      setNews(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      alert('Không thể xóa bài viết. Lỗi: ' + (err as Error).message);
    }
  };

  const toggleStatus = async (id: string, currentStatus: 'Published' | 'Draft') => {
    const newStatus = currentStatus === 'Published' ? 'Draft' : 'Published';

    if (!supabase) {
      setNews(prev => prev.map(n => n.id === id ? { ...n, status: newStatus } : n));
      return;
    }

    try {
      const { error } = await supabase
        .from('news')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;
      setNews(prev => prev.map(n => n.id === id ? { ...n, status: newStatus } : n));
    } catch (err) {
      alert('Không thể cập nhật trạng thái bài viết. Lỗi: ' + (err as Error).message);
    }
  };

  // Upload Helper
  const uploadImage = async (file: File): Promise<string> => {
    if (!supabase) {
      // Mock upload
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(URL.createObjectURL(file));
        }, 1000);
      });
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `news-images/${fileName}`;

    // Upload to 'hoba-assets' bucket
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
        alert('Lỗi khi tải ảnh bìa lên: ' + (err as Error).message);
      } finally {
        setCoverUploading(false);
      }
    }
  };



  const handleEdit = (item: NewsAdmin) => {
    setEditingNewsId(item.id);
    setFormTitle(item.title);
    setFormCategory(item.category);
    setFormStatus(item.status);
    setFormDesc(item.description || '');
    setFormContent(item.content || '');
    setFormThumbnail(item.thumbnail_url || 'https://lh3.googleusercontent.com/aida-public/AB6AXuBkw8wvVWBfbwPAeTKo8PMx2ultvC2Z07ci7u1EwmQRYIQdG3HLOkRvCkxHVZOCjaMCsm0lBKJLhIvMnScV5kwaPGcvpaRn8DHx8DnKPT3bUjoaRUfnOBf1zjyc1KSikF9jdjDb0Cm4ygtWq0lQDyOHPhX0g_XTxUg6i1Gzup--EfAS-Bpffvf-nmOq1kdYy65xI3RVbwcmX-Qu2RynlZO6GizLjYQNwZWcs4vyR-ZcfhJQh_08c1-vttg7HGLtmD77bj7i32XzqE4');
    setFormFeatured(item.is_featured || false);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle || !formDesc || !formContent) {
      alert('Vui lòng điền đầy đủ các thông tin bắt buộc.');
      return;
    }

    setSubmitting(true);
    const publishDate = new Date().toISOString().split('T')[0];

    if (!supabase) {
      // Mock insert or update
      if (editingNewsId) {
        setNews(prev => prev.map(n => n.id === editingNewsId ? {
          ...n,
          title: formTitle,
          category: formCategory,
          status: formStatus,
          description: formDesc,
          content: formContent,
          thumbnail_url: formThumbnail,
          is_featured: formFeatured
        } : n));
      } else {
        const newArt: NewsAdmin = {
          id: String(Date.now()),
          title: formTitle,
          category: formCategory,
          status: formStatus,
          date: publishDate,
          description: formDesc,
          content: formContent,
          thumbnail_url: formThumbnail,
          is_featured: formFeatured
        };
        setNews(prev => [newArt, ...prev]);
      }
      resetForm();
      setIsModalOpen(false);
      setSubmitting(false);
      return;
    }

    try {
      if (editingNewsId) {
        const { error } = await supabase
          .from('news')
          .update({
            title: formTitle,
            description: formDesc,
            content: formContent,
            category: formCategory,
            status: formStatus,
            thumbnail_url: formThumbnail,
            is_featured: formFeatured
          })
          .eq('id', editingNewsId);

        if (error) throw error;
      } else {
        const { error } = await supabase.from('news').insert([
          {
            title: formTitle,
            description: formDesc,
            content: formContent,
            category: formCategory,
            status: formStatus,
            thumbnail_url: formThumbnail,
            publish_date: publishDate,
            is_featured: formFeatured
          }
        ]);

        if (error) throw error;
      }
      await fetchNews();
      resetForm();
      setIsModalOpen(false);
    } catch (err) {
      alert('Lỗi khi lưu bài viết lên Supabase: ' + (err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setEditingNewsId(null);
    setFormTitle('');
    setFormCategory('Hoạt động hiệp hội');
    setFormStatus('Draft');
    setFormDesc('');
    setFormContent('');
    setFormThumbnail('https://lh3.googleusercontent.com/aida-public/AB6AXuBkw8wvVWBfbwPAeTKo8PMx2ultvC2Z07ci7u1EwmQRYIQdG3HLOkRvCkxHVZOCjaMCsm0lBKJLhIvMnScV5kwaPGcvpaRn8DHx8DnKPT3bUjoaRUfnOBf1zjyc1KSikF9jdjDb0Cm4ygtWq0lQDyOHPhX0g_XTxUg6i1Gzup--EfAS-Bpffvf-nmOq1kdYy65xI3RVbwcmX-Qu2RynlZO6GizLjYQNwZWcs4vyR-ZcfhJQh_08c1-vttg7HGLtmD77bj7i32XzqE4');
    setFormFeatured(false);
  };

  const filteredNews = news.filter(n => {
    return n.title.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-primary">Quản lý Bài viết & Tin tức</h2>
          <p className="text-xs text-on-surface-variant mt-1">Đăng tải thông tin hoạt động và bài viết chuyên ngành cho hiệp hội HOBA.</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="bg-primary text-white text-xs px-4 py-2.5 rounded-lg font-bold hover:bg-primary-container transition-all active:scale-95 flex items-center gap-1.5"
        >
          <span className="material-symbols-outlined text-sm">edit_note</span> Viết bài mới
        </button>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-xl border border-outline-variant/30 flex flex-col sm:flex-row gap-4 items-center justify-between shadow-sm">
        <div className="relative w-full sm:max-w-xs">
          <input
            className="w-full pl-9 pr-4 py-2 text-xs border border-outline-variant/50 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            placeholder="Tìm bài viết..."
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <span className="material-symbols-outlined absolute left-3 top-2 text-outline text-lg">search</span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-outline-variant/30 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-on-surface-variant font-medium">Đang tải dữ liệu tin tức...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-surface-container-low text-on-surface-variant font-bold border-b border-outline-variant/30">
                  <th className="p-4">Tiêu đề bài viết</th>
                  <th className="p-4 w-40">Chuyên mục</th>
                  <th className="p-4 w-28">Ngày tạo</th>
                  <th className="p-4 w-28">Trạng thái</th>
                  <th className="p-4 text-center w-36">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {filteredNews.length > 0 ? (
                  filteredNews.map((n) => (
                    <tr key={n.id} className="hover:bg-surface-container-lowest/40 transition-colors">
                      <td className="p-4 font-bold text-primary max-w-sm md:max-w-md leading-relaxed">
                        <div className="flex flex-col gap-1">
                          <span>{n.title}</span>
                          {n.is_featured && (
                            <span className="inline-block w-fit bg-orange-100 text-orange-700 text-[8px] font-black uppercase px-1.5 py-0.5 rounded">
                              Tiêu điểm
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-on-surface-variant font-medium">{n.category}</td>
                      <td className="p-4 text-on-surface-variant font-medium">{n.date}</td>
                      <td className="p-4">
                        <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                          n.status === 'Published'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {n.status === 'Published' ? 'Công khai' : 'Bản nháp'}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => toggleStatus(n.id, n.status)}
                            className={`px-2 py-1 rounded text-[9px] font-bold flex items-center gap-0.5 ${
                              n.status === 'Published'
                                ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                : 'bg-primary text-white hover:bg-primary-container'
                            }`}
                          >
                            <span className="material-symbols-outlined text-[10px]">
                              {n.status === 'Published' ? 'visibility_off' : 'visibility'}
                            </span>
                            {n.status === 'Published' ? 'Hạ bài' : 'Đăng bài'}
                          </button>
                          <button
                            onClick={() => handleEdit(n)}
                            className="text-on-surface-variant hover:text-primary px-1 py-1 rounded transition-colors"
                            title="Chỉnh sửa bài viết"
                          >
                            <span className="material-symbols-outlined text-sm">edit</span>
                          </button>
                          <button
                            onClick={() => handleDelete(n.id)}
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
                    <td colSpan={5} className="p-12 text-center text-on-surface-variant text-sm font-medium">
                      Không tìm thấy bài viết nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modern custom Modal Form instead of Prompt */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl border border-outline-variant/30 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 flex flex-col text-xs">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-base font-black text-primary flex items-center gap-2">
                <span className="material-symbols-outlined">edit_document</span> {editingNewsId ? 'Chỉnh sửa bài viết' : 'Viết bài mới'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-surface-container flex items-center justify-center text-outline transition-colors"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="flex flex-col gap-2">
                <label className="font-bold text-on-surface-variant">Tiêu đề bài viết *</label>
                <input
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="h-10 border border-outline-variant rounded-lg px-4 bg-surface text-on-surface text-xs focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  placeholder="Nhập tiêu đề tin tức..."
                  required
                  type="text"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="font-bold text-on-surface-variant">Chuyên mục</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="h-10 border border-outline-variant rounded-lg px-4 bg-white text-on-surface text-xs focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  >
                    <option value="Hoạt động hiệp hội">Hoạt động hiệp hội</option>
                    <option value="Bản tin chuyên ngành">Bản tin chuyên ngành</option>
                    <option value="Kỹ thuật - An toàn">Kỹ thuật - An toàn</option>
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-bold text-on-surface-variant">Trạng thái phát hành</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="h-10 border border-outline-variant rounded-lg px-4 bg-white text-on-surface text-xs focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  >
                    <option value="Draft">Bản nháp</option>
                    <option value="Published">Công khai</option>
                  </select>
                </div>
              </div>

              {/* Upload Image Section (New feature!) */}
              <div className="flex flex-col gap-2">
                <label className="font-bold text-on-surface-variant">Ảnh đại diện (Ảnh bìa)</label>
                <div className="flex items-center gap-4">
                  {formThumbnail && (
                    <div className="w-20 h-16 rounded overflow-hidden border border-outline-variant/30 flex-shrink-0 bg-surface-container-low">
                      <img src={formThumbnail} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex-grow flex flex-col gap-1.5">
                    <div className="flex gap-2">
                      <input
                        value={formThumbnail}
                        onChange={(e) => setFormThumbnail(e.target.value)}
                        className="flex-grow h-10 border border-outline-variant rounded-lg px-4 bg-surface text-on-surface text-xs focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                        placeholder="Dán URL ảnh hoặc tải lên..."
                        type="text"
                      />
                      <label className="h-10 px-4 bg-secondary text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1 hover:bg-[#93000d] cursor-pointer transition-colors active:scale-95">
                        <span className="material-symbols-outlined text-base">cloud_upload</span>
                        {coverUploading ? 'Đang tải...' : 'Tải lên'}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleCoverUploadChange}
                          disabled={coverUploading}
                        />
                      </label>
                    </div>
                    <p className="text-[10px] text-on-surface-variant">Hỗ trợ định dạng JPG, PNG, WEBP (Tối đa 5MB).</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 py-1">
                <input
                  id="featured-checkbox"
                  type="checkbox"
                  checked={formFeatured}
                  onChange={(e) => setFormFeatured(e.target.checked)}
                  className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary"
                />
                <label htmlFor="featured-checkbox" className="font-bold text-on-surface-variant cursor-pointer">
                  Đặt làm bài viết tiêu điểm (Hiển thị nổi bật)
                </label>
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-bold text-on-surface-variant">Mô tả ngắn *</label>
                <textarea
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="min-h-[80px] border border-outline-variant rounded-lg p-3 bg-surface text-on-surface text-xs focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-y"
                  placeholder="Mô tả ngắn về nội dung bài viết..."
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-bold text-on-surface-variant">Nội dung chi tiết *</label>
                <RichEditor
                  value={formContent}
                  onChange={setFormContent}
                  onImageUpload={uploadImage}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/30">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-lg border border-outline-variant font-bold hover:bg-surface-container transition-colors"
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
                      {editingNewsId ? 'Đang lưu...' : 'Đang đăng...'}
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-sm">{editingNewsId ? 'save' : 'send'}</span>
                      {editingNewsId ? 'Lưu thay đổi' : 'Đăng bài viết'}
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
