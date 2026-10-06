'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import RichEditor from '@/components/admin/RichEditor';
import { toSlug, getUniqueNewsSlug } from '@/lib/slug';
import {
  NewsCategory,
  getNewsCategories,
  createNewsCategory,
  updateNewsCategory,
  deleteNewsCategory,
  DEFAULT_NEWS_CATEGORIES
} from '@/lib/categories';

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
  slug?: string;
}

export default function AdminNews() {
  const [search, setSearch] = useState('');
  const [news, setNews] = useState<NewsAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingNewsId, setEditingNewsId] = useState<string | null>(null);

  // Category States
  const [categories, setCategories] = useState<NewsCategory[]>(DEFAULT_NEWS_CATEGORIES);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [catFormName, setCatFormName] = useState('');
  const [catFormSlug, setCatFormSlug] = useState('');
  const [isCatSlugAuto, setIsCatSlugAuto] = useState(true);
  const [catFormOrder, setCatFormOrder] = useState<number>(1);
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editingCatOldName, setEditingCatOldName] = useState<string>('');
  const [catSubmitting, setCatSubmitting] = useState(false);

  // Upload States
  const [coverUploading, setCoverUploading] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState('Hoạt động hiệp hội');
  const [formStatus, setFormStatus] = useState<'Published' | 'Draft'>('Draft');
  const [formDesc, setFormDesc] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formThumbnail, setFormThumbnail] = useState('https://lh3.googleusercontent.com/aida-public/AB6AXuBkw8wvVWBfbwPAeTKo8PMx2ultvC2Z07ci7u1EwmQRYIQdG3HLOkRvCkxHVZOCjaMCsm0lBKJLhIvMnScV5kwaPGcvpaRn8DHx8DnKPT3bUjoaRUfnOBf1zjyc1KSikF9jdjDb0Cm4ygtWq0lQDyOHPhX0g_XTxUg6i1Gzup--EfAS-Bpffvf-nmOq1kdYy65xI3RVbwcmX-Qu2RynlZO6GizLjYQNwZWcs4vyR-ZcfhJQh_08c1-vttg7HGLtmD77bj7i32XzqE4');
  const [formFeatured, setFormFeatured] = useState(false);
  const [formSlug, setFormSlug] = useState('');
  const [isSlugAuto, setIsSlugAuto] = useState(true);
  const [deleteConfirmNews, setDeleteConfirmNews] = useState<NewsAdmin | null>(null);
  const [deleting, setDeleting] = useState(false);

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
          is_featured: d.is_featured,
          slug: d.slug
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

  const fetchCategories = async () => {
    setLoadingCategories(true);
    try {
      const cats = await getNewsCategories();
      setCategories(cats);
    } catch (err) {
      console.error('Lỗi khi tải danh mục bài viết:', err);
    } finally {
      setLoadingCategories(false);
    }
  };

  useEffect(() => {
    fetchNews();
    fetchCategories();
  }, []);

  const resetCatForm = () => {
    setEditingCatId(null);
    setEditingCatOldName('');
    setCatFormName('');
    setCatFormSlug('');
    setIsCatSlugAuto(true);
    const maxOrder = categories.length > 0 ? Math.max(...categories.map(c => c.display_order || 0)) : 0;
    setCatFormOrder(maxOrder + 1);
  };

  const handleEditCategory = (cat: NewsCategory) => {
    setEditingCatId(cat.id);
    setEditingCatOldName(cat.name);
    setCatFormName(cat.name);
    setCatFormSlug(cat.slug);
    setIsCatSlugAuto(false);
    setCatFormOrder(cat.display_order || 1);
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catFormName.trim()) {
      alert('Vui lòng nhập tên chuyên mục.');
      return;
    }
    const finalSlug = catFormSlug.trim() || toSlug(catFormName);
    setCatSubmitting(true);
    try {
      if (editingCatId) {
        await updateNewsCategory(editingCatId, editingCatOldName, {
          name: catFormName.trim(),
          slug: finalSlug,
          display_order: Number(catFormOrder) || 1
        });
      } else {
        await createNewsCategory({
          name: catFormName.trim(),
          slug: finalSlug,
          display_order: Number(catFormOrder) || 1
        });
      }
      await fetchCategories();
      await fetchNews();
      resetCatForm();
    } catch (err: any) {
      alert('Lỗi khi lưu chuyên mục: ' + (err.message || err));
    } finally {
      setCatSubmitting(false);
    }
  };

  const handleDeleteCategory = async (cat: NewsCategory) => {
    const articleCount = news.filter(n => n.category === cat.name).length;
    if (articleCount > 0) {
      alert(`Không thể xóa chuyên mục "${cat.name}" vì đang có ${articleCount} bài viết. Vui lòng chuyển các bài viết sang chuyên mục khác trước khi xóa.`);
      return;
    }

    if (!confirm(`Bạn có chắc chắn muốn xóa chuyên mục "${cat.name}" không?`)) {
      return;
    }

    setCatSubmitting(true);
    try {
      const res = await deleteNewsCategory(cat.id, cat.name);
      if (!res.success) {
        alert(res.error || 'Không thể xóa chuyên mục.');
      } else {
        await fetchCategories();
        if (editingCatId === cat.id) {
          resetCatForm();
        }
      }
    } catch (err: any) {
      alert('Lỗi khi xóa: ' + (err.message || err));
    } finally {
      setCatSubmitting(false);
    }
  };

  const handleDelete = (newsItem: NewsAdmin) => {
    setDeleteConfirmNews(newsItem);
  };

  const handleExecuteDelete = async () => {
    if (!deleteConfirmNews) return;
    const id = deleteConfirmNews.id;
    setDeleting(true);

    try {
      if (supabase) {
        const { error } = await supabase.from('news').delete().eq('id', id);
        if (error) throw error;
      }
      setNews(prev => prev.filter(n => n.id !== id));
      if (editingNewsId === id) {
        setIsModalOpen(false);
        resetForm();
      }
      setDeleteConfirmNews(null);
      await fetchNews();
    } catch (err) {
      alert('Không thể xóa bài viết. Lỗi: ' + (err as Error).message);
    } finally {
      setDeleting(false);
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
    setFormSlug(item.slug || '');
    setIsSlugAuto(!item.slug);
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

    try {
      const uniqueSlug = await getUniqueNewsSlug(formTitle, formSlug, editingNewsId);

      if (!supabase) {
        // Mock insert or update
        if (editingNewsId) {
          setNews(prev => prev.map(n => n.id === editingNewsId ? {
            ...n,
            title: formTitle,
            slug: uniqueSlug,
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
            slug: uniqueSlug,
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

      if (editingNewsId) {
        const { error } = await supabase
          .from('news')
          .update({
            title: formTitle,
            slug: uniqueSlug,
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
            slug: uniqueSlug,
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
      alert('Lỗi khi lưu bài viết: ' + (err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setEditingNewsId(null);
    setFormTitle('');
    setFormSlug('');
    setIsSlugAuto(true);
    setFormCategory(categories.length > 0 ? categories[0].name : 'Hoạt động hiệp hội');
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
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              resetCatForm();
              setIsCategoryModalOpen(true);
            }}
            className="border border-primary text-primary hover:bg-primary/5 text-xs px-3.5 py-2.5 rounded-lg font-bold transition-all active:scale-95 flex items-center gap-1.5 shadow-xs"
          >
            <span className="material-symbols-outlined text-sm">category</span> Quản lý chuyên mục
          </button>
          <button
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
            className="bg-primary text-white text-xs px-4 py-2.5 rounded-lg font-bold hover:bg-primary-container transition-all active:scale-95 flex items-center gap-1.5 shadow-xs"
          >
            <span className="material-symbols-outlined text-sm">edit_note</span> Viết bài mới
          </button>
        </div>
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
                            onClick={() => handleDelete(n)}
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
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormTitle(val);
                    if (isSlugAuto) {
                      setFormSlug(toSlug(val));
                    }
                  }}
                  className="h-10 border border-outline-variant rounded-lg px-4 bg-surface text-on-surface text-xs focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  placeholder="Nhập tiêu đề tin tức..."
                  required
                  type="text"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-bold text-on-surface-variant flex items-center justify-between">
                  <span>Đường dẫn thân thiện (Slug) *</span>
                  <button
                    type="button"
                    onClick={() => {
                      setFormSlug(toSlug(formTitle));
                      setIsSlugAuto(true);
                    }}
                    className="text-[10px] text-primary hover:underline"
                  >
                    Tự động tạo từ tiêu đề
                  </button>
                </label>
                <input
                  value={formSlug}
                  onChange={(e) => {
                    setFormSlug(e.target.value);
                    setIsSlugAuto(false);
                  }}
                  className="h-10 border border-outline-variant rounded-lg px-4 bg-surface text-on-surface text-xs focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  placeholder="vi-du: duong-dan-than-thien"
                  required
                  type="text"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-on-surface-variant">Chuyên mục</label>
                    <button
                      type="button"
                      onClick={() => {
                        resetCatForm();
                        setIsCategoryModalOpen(true);
                      }}
                      className="text-[10px] text-primary hover:underline flex items-center gap-0.5"
                    >
                      <span className="material-symbols-outlined text-[12px]">tune</span> Quản lý chuyên mục
                    </button>
                  </div>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="h-10 border border-outline-variant rounded-lg px-4 bg-white text-on-surface text-xs focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                    {formCategory && !categories.some(c => c.name === formCategory) && (
                      <option value={formCategory}>{formCategory}</option>
                    )}
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

              {/* Upload Image Section */}
              <div className="flex flex-col gap-2">
                <label className="font-bold text-on-surface-variant flex items-center justify-between">
                  <span>Ảnh đại diện (Thumbnail / Ảnh bìa mạng xã hội)</span>
                  <span className="text-[10px] font-normal text-outline">Chỉ hiện ở bìa, danh sách & social</span>
                </label>
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
                    <p className="text-[10px] text-on-surface-variant leading-relaxed">
                      💡 <strong>Lưu ý:</strong> Ảnh này chỉ dùng làm ảnh đại diện trên trang chủ, trang danh sách và khi chia sẻ lên Zalo/Facebook (không tự động hiển thị trong nội dung bài viết). Để chèn ảnh vào bài, hãy dùng nút <strong>"Chèn hình ảnh"</strong> ở thanh công cụ soạn thảo bên dưới.
                    </p>
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

              <div className="flex items-center justify-between gap-3 pt-4 border-t border-outline-variant/30">
                {editingNewsId ? (
                  <button
                    type="button"
                    onClick={() => {
                      const current = news.find(n => n.id === editingNewsId);
                      if (current) setDeleteConfirmNews(current);
                    }}
                    className="px-4 py-2.5 rounded-lg border border-red-200 text-red-600 font-bold hover:bg-red-50 hover:border-red-300 transition-colors flex items-center gap-1.5 text-xs active:scale-95"
                  >
                    <span className="material-symbols-outlined text-sm">delete</span>
                    Xóa bài viết này
                  </button>
                ) : (
                  <div></div>
                )}

                <div className="flex items-center gap-3">
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
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {deleteConfirmNews && (
        <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-outline-variant/60 w-full max-w-md p-6 flex flex-col gap-4">
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-xl">delete_forever</span>
              </div>
              <div>
                <h3 className="text-base font-bold text-on-surface">Xác nhận xóa bài viết?</h3>
                <p className="text-xs text-on-surface-variant mt-0.5">Thao tác này không thể hoàn tác.</p>
              </div>
            </div>

            <div className="bg-surface-container-low p-3.5 rounded-xl border border-outline-variant/40">
              <span className="text-[10px] font-bold text-outline uppercase tracking-wider block mb-1">
                Bài viết sẽ bị xóa:
              </span>
              <p className="text-xs font-bold text-primary line-clamp-2">{deleteConfirmNews.title}</p>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmNews(null)}
                disabled={deleting}
                className="px-4 py-2 rounded-lg border border-outline-variant hover:bg-surface-container font-bold text-on-surface text-xs transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleExecuteDelete}
                disabled={deleting}
                className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-all shadow-xs flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
              >
                {deleting ? (
                  <>
                    <span className="animate-spin inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full"></span>
                    Đang xóa...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-sm">delete</span>
                    Xác nhận xóa
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Category Manager Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl border border-outline-variant/30 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 flex flex-col text-xs">
            <div className="flex justify-between items-center mb-6 border-b border-outline-variant/30 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-lg">category</span>
                </div>
                <div>
                  <h3 className="text-base font-black text-primary">Quản lý Chuyên mục Bài viết</h3>
                  <p className="text-[11px] text-on-surface-variant">Thêm mới, sửa tên và quản lý các danh mục tin tức của hiệp hội</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsCategoryModalOpen(false);
                  resetCatForm();
                }}
                className="w-8 h-8 rounded-full hover:bg-surface-container flex items-center justify-center text-outline transition-colors"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            {/* Form Section */}
            <form onSubmit={handleCategorySubmit} className="bg-surface-container-lowest/50 border border-outline-variant/30 p-4 rounded-xl space-y-4 mb-6">
              <h4 className="font-bold text-primary flex items-center gap-1.5 text-xs">
                <span className="material-symbols-outlined text-sm">
                  {editingCatId ? 'edit' : 'add_circle'}
                </span>
                {editingCatId ? 'Chỉnh sửa chuyên mục' : 'Thêm chuyên mục mới'}
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                <div className="md:col-span-5 flex flex-col gap-1.5">
                  <label className="font-bold text-on-surface-variant text-[11px]">Tên chuyên mục *</label>
                  <input
                    value={catFormName}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCatFormName(val);
                      if (isCatSlugAuto) {
                        setCatFormSlug(toSlug(val));
                      }
                    }}
                    placeholder="VD: Đào tạo an toàn"
                    required
                    type="text"
                    className="h-9 border border-outline-variant rounded-lg px-3 bg-white text-on-surface text-xs focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>

                <div className="md:col-span-4 flex flex-col gap-1.5">
                  <label className="font-bold text-on-surface-variant text-[11px] flex justify-between">
                    <span>Slug</span>
                    <button
                      type="button"
                      onClick={() => {
                        setCatFormSlug(toSlug(catFormName));
                        setIsCatSlugAuto(true);
                      }}
                      className="text-[9px] text-primary hover:underline"
                    >
                      Tự động
                    </button>
                  </label>
                  <input
                    value={catFormSlug}
                    onChange={(e) => {
                      setCatFormSlug(e.target.value);
                      setIsCatSlugAuto(false);
                    }}
                    placeholder="VD: dao-tao-an-toan"
                    required
                    type="text"
                    className="h-9 border border-outline-variant rounded-lg px-3 bg-white text-on-surface text-xs focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>

                <div className="md:col-span-3 flex flex-col gap-1.5">
                  <label className="font-bold text-on-surface-variant text-[11px]">Thứ tự</label>
                  <input
                    value={catFormOrder}
                    onChange={(e) => setCatFormOrder(parseInt(e.target.value) || 0)}
                    min={1}
                    type="number"
                    className="h-9 border border-outline-variant rounded-lg px-3 bg-white text-on-surface text-xs focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                {editingCatId && (
                  <button
                    type="button"
                    onClick={resetCatForm}
                    className="px-3 py-1.5 rounded-lg border border-outline-variant text-on-surface font-semibold text-xs hover:bg-surface-container transition-colors"
                  >
                    Hủy chỉnh sửa
                  </button>
                )}
                <button
                  type="submit"
                  disabled={catSubmitting}
                  className="bg-primary text-white font-bold text-xs px-4 py-1.5 rounded-lg hover:bg-primary-container transition-all shadow-xs flex items-center gap-1 active:scale-95 disabled:opacity-50"
                >
                  {catSubmitting ? (
                    'Đang lưu...'
                  ) : editingCatId ? (
                    <>
                      <span className="material-symbols-outlined text-sm">save</span> Cập nhật
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-sm">add</span> Thêm mới
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Categories List Section */}
            <div className="space-y-3">
              <h4 className="font-bold text-primary flex items-center gap-1.5 text-xs">
                <span className="material-symbols-outlined text-sm">format_list_bulleted</span> Danh sách chuyên mục ({categories.length})
              </h4>

              <div className="border border-outline-variant/30 rounded-xl overflow-hidden shadow-xs">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-surface-container-low text-on-surface-variant font-bold border-b border-outline-variant/30 text-[11px]">
                      <th className="p-3 w-16 text-center">Thứ tự</th>
                      <th className="p-3">Tên chuyên mục</th>
                      <th className="p-3">Slug (Đường dẫn)</th>
                      <th className="p-3 w-28 text-center">Bài viết</th>
                      <th className="p-3 w-24 text-center">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/20">
                    {loadingCategories ? (
                      <tr>
                        <td colSpan={5} className="p-6 text-center text-on-surface-variant">
                          Đang tải danh mục...
                        </td>
                      </tr>
                    ) : categories.length > 0 ? (
                      categories.map((c) => {
                        const count = news.filter((n) => n.category === c.name).length;
                        const isEditingThis = editingCatId === c.id;

                        return (
                          <tr
                            key={c.id}
                            className={`transition-colors ${
                              isEditingThis ? 'bg-primary/5' : 'hover:bg-surface-container-lowest/50'
                            }`}
                          >
                            <td className="p-3 text-center font-bold text-outline">
                              {c.display_order}
                            </td>
                            <td className="p-3 font-bold text-primary">
                              {c.name}
                            </td>
                            <td className="p-3 font-mono text-[11px] text-on-surface-variant">
                              {c.slug}
                            </td>
                            <td className="p-3 text-center">
                              <span
                                className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                                  count > 0
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'bg-gray-100 text-gray-600'
                                }`}
                              >
                                {count} bài
                              </span>
                            </td>
                            <td className="p-3 text-center">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleEditCategory(c)}
                                  className="text-on-surface-variant hover:text-primary p-1 rounded transition-colors"
                                  title="Chỉnh sửa"
                                >
                                  <span className="material-symbols-outlined text-base">edit</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteCategory(c)}
                                  disabled={count > 0}
                                  className={`p-1 rounded transition-colors ${
                                    count > 0
                                      ? 'text-outline/40 cursor-not-allowed'
                                      : 'text-on-surface-variant hover:text-red-500'
                                  }`}
                                  title={
                                    count > 0
                                      ? `Không thể xóa vì đang có ${count} bài viết`
                                      : 'Xóa chuyên mục'
                                  }
                                >
                                  <span className="material-symbols-outlined text-base">delete</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={5} className="p-6 text-center text-on-surface-variant">
                          Chưa có chuyên mục nào.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end pt-5 border-t border-outline-variant/30 mt-6">
              <button
                type="button"
                onClick={() => {
                  setIsCategoryModalOpen(false);
                  resetCatForm();
                }}
                className="px-4 py-2 bg-surface-container hover:bg-surface-container-high text-on-surface font-bold rounded-lg transition-colors text-xs"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
