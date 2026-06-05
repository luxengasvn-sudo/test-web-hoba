'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

interface DocumentItem {
  code: string;
  title: string;
  category: 'Quyết định' | 'Thông tư' | 'Quy chuẩn' | 'Hướng dẫn';
  issuer: string;
  date: string;
  fileSize: string;
  description?: string;
  fileUrl?: string;
}

export default function DocumentsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);

  const categories = ['all', 'Quyết định', 'Thông tư', 'Quy chuẩn', 'Hướng dẫn'];

  const defaultDocs: DocumentItem[] = [
    {
      code: 'QCVN 08:2026/BCT',
      title: 'Quy chuẩn kỹ thuật quốc gia về an toàn trạm nạp khí hóa lỏng (LPG)',
      category: 'Quy chuẩn',
      issuer: 'Bộ Công Thương',
      date: '2026-04-20',
      fileSize: '2.4 MB',
      description: 'Quy chuẩn bắt buộc quy định về khoảng cách an toàn, hệ thống bồn chứa, van an toàn và hệ thống PCCC của trạm nạp gas.',
      fileUrl: '#'
    },
    {
      code: 'Thông tư 12/2026/BXD',
      title: 'Quy định về an toàn phòng cháy chữa cháy đối với hệ thống gas đô thị',
      category: 'Thông tư',
      issuer: 'Bộ Xây dựng',
      date: '2026-03-15',
      fileSize: '1.8 MB',
      description: 'Hướng dẫn thiết kế, lắp đặt, kiểm định và vận hành hệ thống cấp khí hóa lỏng nhà cao tầng và khu đô thị.',
      fileUrl: '#'
    },
    {
      code: 'Nghị định 87/2026/NĐ-CP',
      title: 'Quy định về điều kiện kinh doanh khí gas và các biện pháp bảo đảm an toàn',
      category: 'Quyết định',
      issuer: 'Chính phủ',
      date: '2026-02-01',
      fileSize: '3.1 MB',
      description: 'Nghị định quy định chi tiết các thủ tục hành chính, giấy phép kinh doanh và điều kiện an toàn phòng nổ đối với kho LPG.',
      fileUrl: '#'
    },
    {
      code: 'HD-04/2025/HOBA',
      title: 'Hướng dẫn kiểm tra, bảo dưỡng định kỳ hệ thống van an toàn bồn chứa',
      category: 'Hướng dẫn',
      issuer: 'Hiệp hội HOBA',
      date: '2025-12-10',
      fileSize: '1.2 MB',
      description: 'Tài liệu hướng dẫn kỹ thuật chuyên sâu do các kỹ sư HOBA soạn thảo phục vụ tập huấn kỹ thuật viên trạm gas.',
      fileUrl: '#'
    }
  ];

  useEffect(() => {
    async function loadDocs() {
      setLoading(true);
      if (!supabase) {
        const saved = localStorage.getItem('hoba_website_documents');
        if (saved) {
          try {
            setDocuments(JSON.parse(saved));
          } catch (e) {
            setDocuments(defaultDocs);
          }
        } else {
          setDocuments(defaultDocs);
        }
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('documents')
          .select('*')
          .order('publish_date', { ascending: false });

        if (error) throw error;

        if (data && data.length > 0) {
          const mapped: DocumentItem[] = data.map((d: any) => ({
            code: d.code,
            title: d.title,
            category: d.category,
            issuer: d.issuer,
            date: d.publish_date,
            fileSize: d.file_size || '1.5 MB',
            description: d.description || '',
            fileUrl: d.file_url || '#'
          }));
          setDocuments(mapped);
        } else {
          setDocuments([]);
        }
      } catch (err) {
        console.error('Lỗi tải văn bản từ Supabase, chuyển sang fallback:', err);
        setDocuments(defaultDocs);
      } finally {
        setLoading(false);
      }
    }
    loadDocs();
  }, []);

  const handleDownload = async (fileUrl: string, title: string, code: string, fileSize: string) => {
    if (!fileUrl || fileUrl === '#') {
      alert(`Mô phỏng tải xuống tài liệu: ${title} (${code})`);
      return;
    }

    if (fileUrl.startsWith('indexeddb:')) {
      const key = fileUrl.replace('indexeddb:', '');
      try {
        const { getFile } = await import('@/lib/indexedDB');
        const blob = await getFile(key);
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          const fileName = (blob as any).name || `${code.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
          link.download = fileName;
          link.click();
          setTimeout(() => URL.revokeObjectURL(url), 100);
          return;
        }
      } catch (e) {
        console.error('IndexedDB load error:', e);
      }
    }

    if (fileUrl.startsWith('blob:')) {
      try {
        const res = await fetch(fileUrl);
        if (res.ok) {
          window.open(fileUrl, '_blank');
          return;
        }
      } catch (err) {
        // Blob expired
      }

      const mockContent = `Tài liệu: ${title}\nSố hiệu: ${code}\nDung lượng: ${fileSize}\n\n[Chế độ Mock Data] Đây là tập tin mô phỏng của tài liệu pháp lý đã tải lên hệ thống.`;
      const blob = new Blob([mockContent], { type: 'text/plain;charset=utf-8' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${code.replace(/[^a-zA-Z0-9]/g, '_')}_mock.txt`;
      link.click();
      return;
    }

    window.open(fileUrl, '_blank');
  };

  const filteredDocs = useMemo(() => {
    return documents.filter((doc) => {
      const matchesSearch =
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        doc.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (doc.description && doc.description.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory, documents]);

  return (
    <div className="flex flex-col w-full overflow-x-hidden text-xs">
      <title>Văn bản pháp lý | HOBA LPG</title>
      <meta name="description" content="Tra cứu văn bản pháp quy, nghị định, thông tư ban hành của nhà nước và các hướng dẫn kỹ thuật an toàn của Hiệp hội HOBA LPG." />
      {/* Hero Section */}
      <section className="relative h-[300px] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-primary/60 z-10"></div>
        <img
          alt="Documents Background"
          className="absolute inset-0 w-full h-full object-cover"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCeZY8qdtczKmDT8VWnqLO1d2HQnkLJzPIAfexewwIjyrQK8F7-4mBaOrm4ZgQC3M-Ds7uNERwunFsK0tdzC_FNnhKGj3MDNQGdMmsGYiu3P88aKaxZ1ef_ZLyAz8WHtV_9OVzgd3cqoYhJAmqCGevUYZzhz9TnTOXDvZN5-Q-Va8Pm7y0BEtl2KMdZbYGKcuqlQ91wD8LWNDUb4p6WIxArZwc7p5TahTv0JMoEPbkCDBfB6xf8pe3cgmU-vGVEAza1fjGbgfB3Y3I"
        />
        <div className="relative z-20 max-w-container-max mx-auto px-margin-mobile md:px-gutter w-full text-white">
          <div className="flex items-center gap-2 text-xs mb-4 opacity-80">
            <Link href="/" className="hover:underline">Trang chủ</Link>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span>Văn bản pháp lý</span>
          </div>
          <h1 className="text-4xl font-black mb-2 text-white">Văn bản pháp lý</h1>
          <p className="text-sm opacity-80">Tra cứu nhanh chóng các thông tư, quy định pháp luật và hướng dẫn kỹ thuật ngành LPG</p>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="py-12 bg-surface">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-gutter">
          {/* Filter Bar */}
          <div className="bg-white p-6 rounded-xl border border-outline-variant/30 shadow-sm mb-8 flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <input
                className="w-full h-12 pl-12 pr-4 rounded-lg border border-outline-variant bg-white focus:border-primary text-xs outline-none"
                placeholder="Tìm theo số hiệu, tiêu đề, nội dung tóm tắt..."
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <span className="material-symbols-outlined absolute left-4 top-3 text-outline">search</span>
            </div>
            <select
              className="h-12 px-4 rounded-lg border border-outline-variant bg-white text-xs outline-none min-w-[200px]"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">Tất cả loại văn bản</option>
              {categories.slice(1).map((cat, idx) => (
                <option key={idx} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Table Container */}
          <div className="bg-white rounded-xl border border-outline-variant/30 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-surface-container-low text-on-surface-variant font-bold border-b border-outline-variant/30">
                    <th className="p-4 md:p-5 w-40">Số hiệu / Ký hiệu</th>
                    <th className="p-4 md:p-5">Tên & Mô tả văn bản</th>
                    <th className="p-4 md:p-5 w-32">Loại văn bản</th>
                    <th className="p-4 md:p-5 w-40">Cơ quan ban hành</th>
                    <th className="p-4 md:p-5 w-32">Ngày ban hành</th>
                    <th className="p-4 md:p-5 w-24 text-center">Tải về</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="p-12 text-center text-on-surface-variant text-sm font-medium">
                        Đang tải văn bản pháp lý...
                      </td>
                    </tr>
                  ) : filteredDocs.length > 0 ? (
                    filteredDocs.map((doc, idx) => (
                      <tr key={idx} className="hover:bg-surface-container-lowest/50 transition-colors">
                        <td className="p-4 md:p-5 font-bold text-primary">{doc.code}</td>
                        <td className="p-4 md:p-5 leading-relaxed max-w-sm md:max-w-md">
                          <div className="font-semibold text-on-background">{doc.title}</div>
                          {doc.description && (
                            <div className="text-[10px] text-on-surface-variant mt-1.5 italic line-clamp-2">
                              {doc.description}
                            </div>
                          )}
                        </td>
                        <td className="p-4 md:p-5">
                          <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                            doc.category === 'Quy chuẩn'
                              ? 'bg-red-100 text-red-700'
                              : doc.category === 'Thông tư'
                              ? 'bg-blue-100 text-blue-700'
                              : doc.category === 'Quyết định'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-orange-100 text-orange-700'
                          }`}>
                            {doc.category}
                          </span>
                        </td>
                        <td className="p-4 md:p-5 text-on-surface-variant font-medium">{doc.issuer}</td>
                        <td className="p-4 md:p-5 text-on-surface-variant font-medium">{doc.date}</td>
                        <td className="p-4 md:p-5 text-center">
                          <button
                            onClick={() => handleDownload(doc.fileUrl || '#', doc.title, doc.code, doc.fileSize)}
                            className="text-secondary hover:text-[#93000d] flex items-center justify-center gap-1 mx-auto font-bold"
                            title={`Tải xuống file: ${doc.fileSize}`}
                          >
                            <span className="material-symbols-outlined text-lg">download</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="p-12 text-center text-on-surface-variant text-sm font-medium">
                        Không tìm thấy văn bản nào khớp với từ khóa tìm kiếm.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
