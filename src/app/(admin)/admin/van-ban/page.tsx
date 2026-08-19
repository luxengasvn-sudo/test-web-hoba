'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import defaultDocuments from '@/lib/defaultDocuments.json';

interface DocumentAdmin {
  id: string;
  code: string;
  title: string;
  category: string;
  issuer: string;
  date: string;
  fileSize: string;
  description?: string;
  fileUrl?: string;
}

export default function AdminDocuments() {
  const [search, setSearch] = useState('');
  const [docs, setDocs] = useState<DocumentAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingDocId, setEditingDocId] = useState<string | null>(null);

  // Form State
  const [formCode, setFormCode] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState('Quy chuẩn');
  const [formIssuer, setFormIssuer] = useState('Bộ Công Thương');
  const [formDate, setFormDate] = useState('');
  const [formFileSize, setFormFileSize] = useState('1.5 MB');
  const [formDesc, setFormDesc] = useState('');
  const [formFileUrl, setFormFileUrl] = useState('#');
  const [fileUploading, setFileUploading] = useState(false);

  const defaultDocs: DocumentAdmin[] = defaultDocuments.map((d, idx) => ({
    id: String(idx + 1),
    code: d.code,
    title: d.title,
    category: d.category,
    issuer: d.issuer,
    date: d.date,
    fileSize: d.fileSize,
    description: d.description,
    fileUrl: d.fileUrl
  }));

  const getCleanDocUrl = (code: string, fileUrl?: string) => {
    const c = (code || '').trim();
    if (c === '105/2025/NĐ-CP') return '/uploads/documents/ND-105-2025-ve-PCCC.pdf';
    if (c === '87/2018/NĐ-CP') return '/uploads/documents/ND-87-ve-Kinh-doanh-khi.pdf';
    if (c === '96/2016/NĐ-CP') return '/uploads/documents/ND-96-quy-dinh-ve-ANTT.pdf';
    if (c === '14/QĐ-UBND') return '/uploads/documents/14-Quyet-dinh-phe-duyet-dieu-le-HOBA-2025.pdf';
    if (c === '12/QC-HOBA') return '/uploads/documents/12-Quy-che-hoat-dong-noi-bo-2025.pdf';
    if (!fileUrl || fileUrl === '#' || fileUrl.includes('hobalpg.vn/uploads/documents/')) {
      const match = defaultDocs.find(def => def.code === c);
      if (match) return match.fileUrl || '#';
    }
    return fileUrl || '#';
  };

  const fetchDocs = async () => {
    setLoading(true);
    if (!supabase) {
      const saved = localStorage.getItem('hoba_website_documents');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (!Array.isArray(parsed) || parsed.length === 0 || !parsed.some(d => d.code === '105/2025/NĐ-CP') || parsed.some(d => d.fileUrl === '#')) {
            setDocs(defaultDocs);
            localStorage.setItem('hoba_website_documents', JSON.stringify(defaultDocs));
          } else {
            setDocs(parsed);
          }
        } catch (e) {
          setDocs(defaultDocs);
        }
      } else {
        setDocs(defaultDocs);
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
        const validItems = data.filter((d: any) => !d.title?.toLowerCase().includes('test') && !d.code?.toLowerCase().includes('test'));

        const formatted: DocumentAdmin[] = validItems.map((d: any) => ({
          id: d.id,
          code: d.code,
          title: d.title,
          category: d.category,
          issuer: d.issuer,
          date: d.publish_date,
          fileSize: d.file_size || '1.0 MB',
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

        const docMap = new Map<string, DocumentAdmin>();
        for (const def of defaultDocs) {
          docMap.set(normalizeCode(def.code), def);
        }
        for (const m of formatted) {
          const norm = normalizeCode(m.code);
          if (norm) {
            const existing = docMap.get(norm);
            if (existing && existing.description && (!m.description || m.description.length < existing.description.length)) {
              continue;
            }
            docMap.set(norm, m);
          }
        }

        setDocs(Array.from(docMap.values()));
      } else {
        setDocs(defaultDocs);
      }
    } catch (err) {
      console.error('Lỗi khi tải văn bản pháp lý từ Supabase, chuyển sang fallback:', err);
      setDocs(defaultDocs);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa văn bản pháp lý này?')) return;

    if (!supabase) {
      const updated = docs.filter(d => d.id !== id);
      setDocs(updated);
      localStorage.setItem('hoba_website_documents', JSON.stringify(updated));
      return;
    }

    try {
      const { error } = await supabase.from('documents').delete().eq('id', id);
      if (error) throw error;
      setDocs(prev => prev.filter(d => d.id !== id));
    } catch (err) {
      alert('Không thể xóa văn bản. Lỗi: ' + (err as Error).message);
    }
  };

  const uploadFile = async (file: File): Promise<{ url: string; sizeStr: string }> => {
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(1);
    const sizeStr = `${sizeInMB} MB`;

    if (!supabase) {
      const fileId = `file_${Math.random().toString(36).substring(2, 15)}`;
      const key = `doc_file_${fileId}`;
      try {
        const { saveFile } = await import('@/lib/indexedDB');
        await saveFile(key, file);
      } catch (e) {
        console.error('IndexedDB save error:', e);
      }
      return {
        url: `indexeddb:${key}`,
        sizeStr: sizeStr
      };
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `documents/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('hoba-assets')
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('hoba-assets')
      .getPublicUrl(filePath);

    return {
      url: publicUrl,
      sizeStr: sizeStr
    };
  };

  const handleFileUploadChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFileUploading(true);
      try {
        const res = await uploadFile(e.target.files[0]);
        setFormFileUrl(res.url);
        setFormFileSize(res.sizeStr);
      } catch (err) {
        alert('Lỗi tải văn bản lên: ' + (err as Error).message);
      } finally {
        setFileUploading(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCode || !formTitle || !formIssuer || !formDate) {
      alert('Vui lòng nhập đầy đủ thông tin bắt buộc.');
      return;
    }

    setSubmitting(true);

    if (!supabase) {
      const updatedDocs = [...docs];
      if (editingDocId) {
        const idx = updatedDocs.findIndex(d => d.id === editingDocId);
        if (idx !== -1) {
          updatedDocs[idx] = {
            id: editingDocId,
            code: formCode,
            title: formTitle,
            category: formCategory,
            issuer: formIssuer,
            date: formDate,
            fileSize: formFileSize,
            description: formDesc,
            fileUrl: formFileUrl
          };
        }
      } else {
        const newDoc: DocumentAdmin = {
          id: String(Date.now()),
          code: formCode,
          title: formTitle,
          category: formCategory,
          issuer: formIssuer,
          date: formDate,
          fileSize: formFileSize,
          description: formDesc,
          fileUrl: formFileUrl
        };
        updatedDocs.unshift(newDoc);
      }
      setDocs(updatedDocs);
      localStorage.setItem('hoba_website_documents', JSON.stringify(updatedDocs));
      resetForm();
      setIsModalOpen(false);
      setSubmitting(false);
      return;
    }

    try {
      if (editingDocId) {
        const { error } = await supabase
          .from('documents')
          .update({
            code: formCode,
            title: formTitle,
            category: formCategory,
            issuer: formIssuer,
            publish_date: formDate,
            file_size: formFileSize,
            description: formDesc,
            file_url: formFileUrl
          })
          .eq('id', editingDocId);

        if (error) throw error;
      } else {
        const { error } = await supabase.from('documents').insert([
          {
            code: formCode,
            title: formTitle,
            category: formCategory,
            issuer: formIssuer,
            publish_date: formDate,
            file_size: formFileSize,
            description: formDesc,
            file_url: formFileUrl
          }
        ]);

        if (error) throw error;
      }
      await fetchDocs();
      resetForm();
      setIsModalOpen(false);
    } catch (err) {
      alert('Lỗi khi lưu văn bản lên Supabase: ' + (err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setEditingDocId(null);
    setFormCode('');
    setFormTitle('');
    setFormCategory('Quy chuẩn');
    setFormIssuer('Bộ Công Thương');
    setFormDate('');
    setFormFileSize('1.5 MB');
    setFormDesc('');
    setFormFileUrl('#');
  };

  const handleOpenEdit = (doc: DocumentAdmin) => {
    setEditingDocId(doc.id);
    setFormCode(doc.code);
    setFormTitle(doc.title);
    setFormCategory(doc.category);
    setFormIssuer(doc.issuer);
    setFormDate(doc.date);
    setFormFileSize(doc.fileSize);
    setFormDesc(doc.description || '');
    setFormFileUrl(doc.fileUrl || '#');
    setIsModalOpen(true);
  };

  const handleDownload = async (fileUrl: string, title: string, code: string, fileSize: string) => {
    if (!fileUrl || fileUrl === '#') {
      alert(`Tài liệu đang được cập nhật: ${title} (${code})`);
      return;
    }

    const safeFileName = `${code.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;

    if (fileUrl.startsWith('indexeddb:')) {
      const key = fileUrl.replace('indexeddb:', '');
      try {
        const { getFile } = await import('@/lib/indexedDB');
        const blob = await getFile(key);
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = (blob as any).name || safeFileName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          setTimeout(() => URL.revokeObjectURL(url), 1000);
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
          const blob = await res.blob();
          const blobUrl = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = blobUrl;
          link.download = safeFileName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
          return;
        }
      } catch (err) {
        // Blob expired
      }
    }

    // Direct fetch blob download for static / public URLs to ensure file is saved to disk
    try {
      const res = await fetch(fileUrl);
      if (res.ok) {
        const blob = await res.blob();
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = safeFileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
        return;
      }
    } catch (err) {
      console.warn('Direct fetch download error:', err);
    }

    // Fallback: create download anchor
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = safeFileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredDocs = docs.filter(doc => {
    return (
      doc.title.toLowerCase().includes(search.toLowerCase()) ||
      doc.code.toLowerCase().includes(search.toLowerCase()) ||
      (doc.description && doc.description.toLowerCase().includes(search.toLowerCase()))
    );
  });

  return (
    <div className="space-y-6 text-xs font-medium">
      {/* Page Header */}
      <div className="flex justify-between items-center border-b border-outline-variant/20 pb-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-primary">Quản lý Văn bản pháp lý</h2>
          <p className="text-xs text-on-surface-variant mt-1">Cập nhật, đăng tải file và viết mô tả sơ bộ cho các quy chuẩn an toàn LPG.</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="bg-primary text-white text-xs px-5 py-2.5 rounded-lg font-bold hover:bg-[#93000d] transition-all flex items-center gap-1.5 shadow-sm"
        >
          <span className="material-symbols-outlined text-sm">cloud_upload</span> Đăng tải Văn bản
        </button>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-xl border border-outline-variant/30 flex flex-col sm:flex-row gap-4 items-center justify-between shadow-sm">
        <div className="relative w-full sm:max-w-xs">
          <input
            className="w-full pl-9 pr-4 py-2 text-xs border border-outline-variant/50 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            placeholder="Tìm theo tiêu đề, số hiệu, mô tả..."
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
          <div className="p-12 text-center text-xs text-on-surface-variant font-medium">Đang tải dữ liệu văn bản...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-surface-container-low text-on-surface-variant font-bold border-b border-outline-variant/30">
                  <th className="p-4 w-40">Số hiệu / Ký hiệu</th>
                  <th className="p-4">Tên & Mô tả văn bản</th>
                  <th className="p-4 w-28">Loại văn bản</th>
                  <th className="p-4 w-40">Cơ quan ban hành</th>
                  <th className="p-4 w-28">Ngày ban hành</th>
                  <th className="p-4 w-20 text-center">Xem file</th>
                  <th className="p-4 text-center w-20">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {filteredDocs.length > 0 ? (
                  filteredDocs.map((doc) => (
                    <tr key={doc.id} className="hover:bg-surface-container-lowest/40 transition-colors">
                      <td className="p-4 font-bold text-primary">{doc.code}</td>
                      <td className="p-4 leading-relaxed max-w-sm md:max-w-md">
                        <div className="font-semibold text-on-background">{doc.title}</div>
                        {doc.description && (
                          <div className="text-[10px] text-on-surface-variant mt-1 line-clamp-2 italic">
                            {doc.description}
                          </div>
                        )}
                      </td>
                      <td className="p-4">
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
                      <td className="p-4 text-on-surface-variant font-medium">{doc.issuer}</td>
                      <td className="p-4 text-on-surface-variant font-medium">{doc.date}</td>
                      <td className="p-4 text-center">
                        <a
                          href={doc.fileUrl || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:text-[#002752] inline-flex items-center justify-center p-1.5 rounded transition-all hover:bg-surface-container"
                          title="Xem trực tuyến (PDF)"
                        >
                          <span className="material-symbols-outlined text-base">visibility</span>
                        </a>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-1.5 justify-center">
                          <button
                            onClick={() => handleOpenEdit(doc)}
                            className="text-primary hover:text-secondary px-1 py-1 rounded transition-colors"
                            title="Chỉnh sửa văn bản"
                          >
                            <span className="material-symbols-outlined text-sm">edit</span>
                          </button>
                          <button
                            onClick={() => handleDelete(doc.id)}
                            className="text-on-surface-variant hover:text-red-500 px-1 py-1 rounded transition-colors"
                            title="Xóa văn bản"
                          >
                            <span className="material-symbols-outlined text-sm">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="p-12 text-center text-on-surface-variant text-sm font-medium">
                      Không tìm thấy văn bản nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modern custom Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl border border-outline-variant/30 shadow-2xl max-w-xl w-full p-6 md:p-8 flex flex-col text-xs">
            <div className="flex justify-between items-center mb-6 border-b border-outline-variant/30 pb-3">
              <h3 className="text-base font-black text-primary flex items-center gap-2">
                <span className="material-symbols-outlined">description</span> {editingDocId ? 'Chỉnh sửa văn bản pháp lý' : 'Đăng tải văn bản pháp lý'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-surface-container flex items-center justify-center text-outline transition-colors"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Code */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-on-surface-variant">Số hiệu / Ký hiệu *</label>
                  <input
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    className="h-10 border border-outline-variant/50 rounded-lg px-4 bg-surface text-on-surface text-xs focus:border-primary outline-none"
                    placeholder="QCVN 08:2026/BCT"
                    required
                    type="text"
                  />
                </div>

                {/* Category */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-on-surface-variant">Loại văn bản</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="h-10 border border-outline-variant/50 rounded-lg px-4 bg-white text-on-surface text-xs focus:border-primary outline-none"
                  >
                    <option value="Quy chuẩn">Quy chuẩn</option>
                    <option value="Thông tư">Thông tư</option>
                    <option value="Quyết định">Quyết định</option>
                    <option value="Hướng dẫn">Hướng dẫn</option>
                  </select>
                </div>
              </div>

              {/* Title */}
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-on-surface-variant">Tên văn bản pháp lý *</label>
                <input
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="h-10 border border-outline-variant/50 rounded-lg px-4 bg-surface text-on-surface text-xs focus:border-primary outline-none"
                  placeholder="Quy chuẩn kỹ thuật quốc gia về an toàn trạm nạp gas..."
                  required
                  type="text"
                />
              </div>

              {/* Issuer */}
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-on-surface-variant">Cơ quan ban hành *</label>
                <input
                  value={formIssuer}
                  onChange={(e) => setFormIssuer(e.target.value)}
                  className="h-10 border border-outline-variant/50 rounded-lg px-4 bg-surface text-on-surface text-xs focus:border-primary outline-none"
                  placeholder="Bộ Công Thương"
                  required
                  type="text"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Date */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-on-surface-variant">Ngày ban hành *</label>
                  <input
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="h-10 border border-outline-variant/50 rounded-lg px-4 bg-surface text-on-surface text-xs focus:border-primary outline-none"
                    required
                    type="date"
                  />
                </div>

                {/* File size (auto-filled on file upload) */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-on-surface-variant">Dung lượng file</label>
                  <input
                    value={formFileSize}
                    onChange={(e) => setFormFileSize(e.target.value)}
                    className="h-10 border border-outline-variant/50 rounded-lg px-4 bg-surface text-on-surface text-xs focus:border-primary outline-none"
                    placeholder="2.4 MB"
                    type="text"
                  />
                </div>
              </div>

              {/* File Upload Trigger */}
              <div className="flex flex-col gap-1.5 bg-surface-container-low p-4 rounded-xl border border-outline-variant/30">
                <label className="font-bold text-primary">Tập tin đính kèm (PDF, DOC, DOCX, ZIP...)</label>
                <div className="flex gap-2 items-center mt-1">
                  <input
                    type="text"
                    readOnly
                    value={formFileUrl}
                    className="flex-grow h-10 px-3 border border-outline-variant/50 rounded-lg bg-surface text-on-surface-variant outline-none truncate"
                    placeholder="Chưa tải tài liệu nào lên..."
                  />
                  <label className="flex items-center justify-center gap-1.5 bg-primary hover:bg-[#93000d] text-white px-4 rounded cursor-pointer font-bold text-[10px] h-10 flex-shrink-0 transition-all select-none">
                    <span className="material-symbols-outlined text-sm">
                      {fileUploading ? 'sync' : 'upload'}
                    </span>
                    {fileUploading ? 'Đang tải...' : 'Upload File'}
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar"
                      className="hidden"
                      onChange={handleFileUploadChange}
                      disabled={fileUploading}
                    />
                  </label>
                </div>
                <span className="text-[9px] text-on-surface-variant mt-1 block">Tập tin sẽ được tải lên Supabase Storage và tự động đo dung lượng file.</span>
              </div>

              {/* Brief Description */}
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-on-surface-variant">Mô tả sơ bộ văn bản</label>
                <textarea
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="h-20 border border-outline-variant/50 rounded-lg p-3 bg-surface text-on-surface text-xs focus:border-primary outline-none resize-y"
                  placeholder="Mô tả sơ lược nội dung văn bản pháp lý..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/30">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-lg border border-outline-variant font-bold hover:bg-surface-container transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting || fileUploading}
                  className="px-6 py-2.5 rounded-lg bg-secondary text-white font-bold hover:bg-[#93000d] transition-all flex items-center gap-1.5 active:scale-95 disabled:opacity-50 shadow-md"
                >
                  {submitting ? (
                    <>
                      <span className="animate-spin inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full"></span>
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-sm">cloud_upload</span>
                      {editingDocId ? 'Cập nhật ngay' : 'Đăng tải ngay'}
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
