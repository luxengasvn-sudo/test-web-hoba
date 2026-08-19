'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import defaultDocuments from '@/lib/defaultDocuments.json';

export interface DocumentItem {
  code: string;
  title: string;
  category: 'Quyết định' | 'Thông tư' | 'Quy chuẩn' | 'Hướng dẫn';
  issuer: string;
  date: string;
  fileSize: string;
  description?: string;
  fileUrl?: string;
}

export default function DocumentsClientPage({ initialData }: { initialData?: any }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [documents, setDocuments] = useState<DocumentItem[]>(initialData?.documents || defaultDocuments as DocumentItem[]);
  const [loading, setLoading] = useState(!initialData?.documents);

  const categories = ['all', 'Quyết định', 'Thông tư', 'Quy chuẩn', 'Hướng dẫn'];

  const defaultDocs: DocumentItem[] = defaultDocuments as DocumentItem[];

  useEffect(() => {
    if (initialData?.documents) {
      setDocuments(initialData.documents);
      setLoading(false);
      return;
    }

    async function loadDocs() {
      setLoading(true);
      if (!supabase) {
        const saved = localStorage.getItem('hoba_website_documents');
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (!Array.isArray(parsed) || parsed.length === 0 || !parsed.some(d => d.code === '105/2025/NĐ-CP') || parsed.some(d => d.fileUrl === '#')) {
              setDocuments(defaultDocs);
              localStorage.setItem('hoba_website_documents', JSON.stringify(defaultDocs));
            } else {
              setDocuments(parsed);
            }
          } catch (e) {
            setDocuments(defaultDocs);
          }
        } else {
          setDocuments(defaultDocs);
          localStorage.setItem('hoba_website_documents', JSON.stringify(defaultDocs));
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
          const getCleanDocUrl = (code: string, fileUrl?: string) => {
            const c = (code || '').trim();
            if (c === '105/2025/NĐ-CP') return '/uploads/documents/ND-105-2025-ve-PCCC.pdf';
            if (c === '87/2018/NĐ-CP') return '/uploads/documents/ND-87-ve-Kinh-doanh-khi.pdf';
            if (c === '96/2016/NĐ-CP') return '/uploads/documents/ND-96-quy-dinh-ve-ANTT.pdf';
            if (c === '14/QĐ-UBND') return '/uploads/documents/14-Quyet-dinh-phe-duyet-dieu-le-HOBA-2025.pdf';
            if (c === '12/QC-HOBA') return '/uploads/documents/12-Quy-che-hoat-dong-noi-bo-2025.pdf';
            if (!fileUrl || fileUrl === '#' || fileUrl.includes('hobalpg.vn/uploads/documents/')) {
              const match = (defaultDocs as DocumentItem[]).find(def => def.code === c);
              if (match) return match.fileUrl || '#';
            }
            return fileUrl || '#';
          };

          const validItems = data.filter((d: any) => !d.title?.toLowerCase().includes('test') && !d.code?.toLowerCase().includes('test'));

          const mapped: DocumentItem[] = validItems.map((d: any) => ({
            code: d.code,
            title: d.title,
            category: d.category,
            issuer: d.issuer,
            date: d.publish_date,
            fileSize: d.file_size || '1.5 MB',
            description: d.description || '',
            fileUrl: getCleanDocUrl(d.code, d.file_url)
          }));

          const normalizeCode = (code: string) => {
            return (code || '')
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '')
              .replace(/đ/g, 'd')
              .replace(/Đ/g, 'D')
              .replace(/[^a-zA-Z0-9]/g, '')
              .toUpperCase();
          };

          const docMap = new Map<string, DocumentItem>();
          for (const def of defaultDocs) {
            docMap.set(normalizeCode(def.code), def);
          }
          for (const m of mapped) {
            const norm = normalizeCode(m.code);
            if (norm) {
              const existing = docMap.get(norm);
              if (existing && existing.description && (!m.description || m.description.length < existing.description.length)) {
                continue;
              }
              docMap.set(norm, m);
            }
          }

          setDocuments(Array.from(docMap.values()));
        } else {
          setDocuments(defaultDocs);
        }
      } catch (err) {
        console.error('Lỗi tải văn bản từ Supabase, chuyển sang fallback:', err);
        setDocuments(defaultDocs);
      } finally {
        setLoading(false);
      }
    }
    loadDocs();
  }, [initialData]);

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
                    <th className="p-4 md:p-5 w-28 text-center">Xem văn bản</th>
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
                          <a
                            href={doc.fileUrl || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-1 px-4 py-2 rounded-lg bg-primary hover:bg-[#002752] text-white transition-all font-bold text-xs shadow-sm active:scale-95"
                            title="Xem trực tuyến (PDF)"
                          >
                            <span className="material-symbols-outlined text-sm">visibility</span> Xem file
                          </a>
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
