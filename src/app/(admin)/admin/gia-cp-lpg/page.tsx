'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import defaultLpgPrices from '@/lib/defaultLpgPrices.json';
import { supabase } from '@/lib/supabase';
import {
  LpgCpConfig,
  LpgCpRecord,
  LpgCpContentConfig,
  LpgCpFaqItem,
  DEFAULT_LPG_CP_CONTENT,
  getAverageCp,
  formatMonthLabel,
  formatDiff,
  getDiffClass,
  getDiffArrow,
} from '@/types/lpgCp';

export default function AdminGiaCpLpgPage() {
  const [config, setConfig] = useState<LpgCpConfig>(defaultLpgPrices as LpgCpConfig);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Active Tab: 'data' | 'content'
  const [activeTab, setActiveTab] = useState<'data' | 'content'>('data');

  // Content form state
  const [contentForm, setContentForm] = useState<Required<LpgCpContentConfig>>({
    heroBadge: DEFAULT_LPG_CP_CONTENT.heroBadge,
    heroTitle: DEFAULT_LPG_CP_CONTENT.heroTitle,
    heroDescription: DEFAULT_LPG_CP_CONTENT.heroDescription,
    pendingTitle: DEFAULT_LPG_CP_CONTENT.pendingTitle,
    pendingDescription: DEFAULT_LPG_CP_CONTENT.pendingDescription,
    calculatorNote: DEFAULT_LPG_CP_CONTENT.calculatorNote,
    faqs: DEFAULT_LPG_CP_CONTENT.faqs,
    sourceNote: DEFAULT_LPG_CP_CONTENT.sourceNote,
    disclaimerNote: DEFAULT_LPG_CP_CONTENT.disclaimerNote,
  });

  // Sync contentForm when config loads
  useEffect(() => {
    if (config.content) {
      setContentForm({
        heroBadge: config.content.heroBadge || DEFAULT_LPG_CP_CONTENT.heroBadge,
        heroTitle: config.content.heroTitle || DEFAULT_LPG_CP_CONTENT.heroTitle,
        heroDescription: config.content.heroDescription || DEFAULT_LPG_CP_CONTENT.heroDescription,
        pendingTitle: config.content.pendingTitle || DEFAULT_LPG_CP_CONTENT.pendingTitle,
        pendingDescription: config.content.pendingDescription || DEFAULT_LPG_CP_CONTENT.pendingDescription,
        calculatorNote: config.content.calculatorNote || DEFAULT_LPG_CP_CONTENT.calculatorNote,
        faqs:
          config.content.faqs && config.content.faqs.length > 0
            ? config.content.faqs
            : DEFAULT_LPG_CP_CONTENT.faqs,
        sourceNote: config.content.sourceNote || DEFAULT_LPG_CP_CONTENT.sourceNote,
        disclaimerNote: config.content.disclaimerNote || DEFAULT_LPG_CP_CONTENT.disclaimerNote,
      });
    }
  }, [config.content]);

  // Search & Filter
  const [searchYear, setSearchYear] = useState<string>('all');

  // Modal State for Add / Edit
  const [modalOpen, setModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<{
    month: string;
    propane: string;
    butane: string;
    isPending: boolean;
    note: string;
  }>({
    month: '',
    propane: '',
    butane: '',
    isPending: false,
    note: '',
  });

  // Delete Confirmation Modal
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);

  // File input ref for JSON import
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Show Toast helper
  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  // 1. Initial Load: Supabase / db-proxy / localStorage / defaultLpgPrices.json
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        // Try localStorage first for offline quick load
        const saved = localStorage.getItem('hoba_website_config_lpg_cp_data');
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (parsed && Array.isArray(parsed.records)) {
              setConfig(parsed);
            }
          } catch {
            // Ignore parse error
          }
        }

        // Fetch from Supabase or db-proxy API if online
        if (supabase) {
          const { data, error } = await supabase
            .from('website_config')
            .select('value')
            .eq('key', 'lpg_cp_data')
            .single();

          if (!error && data?.value) {
            const val = typeof data.value === 'string' ? JSON.parse(data.value) : data.value;
            if (val && Array.isArray(val.records)) {
              setConfig(val);
              localStorage.setItem('hoba_website_config_lpg_cp_data', JSON.stringify(val));
            }
          }
        } else {
          // Try db-proxy API route
          const res = await fetch('/api/db-proxy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              method: 'SELECT',
              table: 'website_config',
              filters: [{ col: 'key', val: 'lpg_cp_data' }],
              isSingle: true,
            }),
          });
          const json = await res.json();
          if (json?.data?.value) {
            const val = typeof json.data.value === 'string' ? JSON.parse(json.data.value) : json.data.value;
            if (val && Array.isArray(val.records)) {
              setConfig(val);
              localStorage.setItem('hoba_website_config_lpg_cp_data', JSON.stringify(val));
            }
          }
        }
      } catch (err) {
        console.warn('Lỗi khi tải dữ liệu CP LPG trong Admin:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // Save changes to storage & DB
  const saveConfig = async (newConfig: LpgCpConfig) => {
    setSaving(true);
    try {
      const updatedConfig = {
        ...newConfig,
        updatedAt: new Date().toISOString(),
      };
      setConfig(updatedConfig);

      // 1. Save to localStorage
      localStorage.setItem('hoba_website_config_lpg_cp_data', JSON.stringify(updatedConfig));

      // 2. Save to database via API or Supabase
      if (supabase) {
        await supabase.from('website_config').upsert({
          key: 'lpg_cp_data',
          value: updatedConfig,
          updated_at: new Date().toISOString(),
        });
      } else {
        await fetch('/api/db-proxy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            method: 'UPSERT',
            table: 'website_config',
            insertRows: [
              {
                key: 'lpg_cp_data',
                value: updatedConfig,
                updated_at: new Date().toISOString(),
              },
            ],
          }),
        });
      }

      // Notify other tabs/components
      window.dispatchEvent(new Event('hoba_lpg_cp_updated'));
      showToast('success', 'Đã lưu thay đổi dữ liệu CP LPG thành công!');
    } catch (err) {
      console.error('Lỗi khi lưu dữ liệu:', err);
      showToast('error', 'Lỗi khi lưu dữ liệu lên máy chủ. Đã lưu dự phòng cục bộ!');
    } finally {
      setSaving(false);
    }
  };

  // Sorted records chronologically
  const sortedRecords = useMemo(() => {
    return [...(config.records || [])].sort((a, b) => a.month.localeCompare(b.month));
  }, [config.records]);

  // Available years for dropdown
  const availableYears = useMemo(() => {
    const set = new Set<string>();
    sortedRecords.forEach((r) => {
      const yr = r.month.split('-')[0];
      if (yr) set.add(yr);
    });
    return Array.from(set).sort().reverse();
  }, [sortedRecords]);

  // Display records (reversed for table, newest first)
  const displayRecords = useMemo(() => {
    let list = [...sortedRecords].reverse();
    if (searchYear !== 'all') {
      list = list.filter((r) => r.month.startsWith(`${searchYear}-`));
    }
    return list;
  }, [sortedRecords, searchYear]);

  // Stats
  const totalMonths = sortedRecords.length;
  const latestRecord = sortedRecords[sortedRecords.length - 1];
  const publishedRecords = sortedRecords.filter((r) => !r.isPending && r.propane !== null && r.butane !== null);
  const latestPublished = publishedRecords[publishedRecords.length - 1];

  // Open Modal for Add
  const handleOpenAdd = () => {
    // Auto suggest next month after the latest
    let nextMonth = '2026-11';
    if (latestRecord) {
      const [yr, mo] = latestRecord.month.split('-').map(Number);
      if (mo === 12) {
        nextMonth = `${yr + 1}-01`;
      } else {
        const nextMo = mo + 1 < 10 ? `0${mo + 1}` : `${mo + 1}`;
        nextMonth = `${yr}-${nextMo}`;
      }
    }

    setFormData({
      month: nextMonth,
      propane: '',
      butane: '',
      isPending: false,
      note: '',
    });
    setEditingIndex(null);
    setModalOpen(true);
  };

  // Open Modal for Edit
  const handleOpenEdit = (rec: LpgCpRecord) => {
    const idx = sortedRecords.findIndex((r) => r.month === rec.month);
    setEditingIndex(idx);
    setFormData({
      month: rec.month,
      propane: rec.propane !== null ? rec.propane.toString() : '',
      butane: rec.butane !== null ? rec.butane.toString() : '',
      isPending: !!rec.isPending || rec.propane === null,
      note: rec.note || '',
    });
    setModalOpen(true);
  };

  // Save Modal Form
  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.month) {
      showToast('error', 'Vui lòng chọn Tháng/Năm');
      return;
    }

    const propaneVal = formData.isPending ? null : formData.propane !== '' ? parseFloat(formData.propane) : null;
    const butaneVal = formData.isPending ? null : formData.butane !== '' ? parseFloat(formData.butane) : null;

    if (!formData.isPending && (propaneVal === null || isNaN(propaneVal) || butaneVal === null || isNaN(butaneVal))) {
      showToast('error', 'Vui lòng nhập đầy đủ giá Propane và Butane hoặc tích vào "Đang chờ công bố"');
      return;
    }

    const newRecord: LpgCpRecord = {
      month: formData.month,
      propane: propaneVal,
      butane: butaneVal,
      isPending: formData.isPending,
      note: formData.note.trim() || undefined,
    };

    let updatedList = [...sortedRecords];

    if (editingIndex !== null) {
      // Update existing
      updatedList[editingIndex] = newRecord;
    } else {
      // Check duplicate month
      const existingIdx = updatedList.findIndex((r) => r.month === newRecord.month);
      if (existingIdx >= 0) {
        if (!confirm(`Tháng ${formatMonthLabel(newRecord.month)} đã tồn tại trong danh sách. Bạn có muốn ghi đè?`)) {
          return;
        }
        updatedList[existingIdx] = newRecord;
      } else {
        updatedList.push(newRecord);
      }
    }

    // Re-sort chronologically
    updatedList.sort((a, b) => a.month.localeCompare(b.month));

    const newConfig: LpgCpConfig = {
      ...config,
      records: updatedList,
    };

    saveConfig(newConfig);
    setModalOpen(false);
  };

  // Delete Record
  const handleConfirmDelete = () => {
    if (deleteIndex === null) return;
    const target = displayRecords[deleteIndex];
    if (!target) return;

    const updatedList = sortedRecords.filter((r) => r.month !== target.month);
    saveConfig({ ...config, records: updatedList });
    setDeleteIndex(null);
    showToast('success', `Đã xóa dữ liệu ${formatMonthLabel(target.month)}`);
  };

  // Quick toggle pending status
  const handleQuickTogglePending = (rec: LpgCpRecord) => {
    const updated = sortedRecords.map((r) => {
      if (r.month === rec.month) {
        return {
          ...r,
          isPending: !r.isPending,
        };
      }
      return r;
    });
    saveConfig({ ...config, records: updated });
  };

  // Export JSON backup
  const handleExportJson = () => {
    const jsonStr = JSON.stringify(config, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hoba_lpg_cp_data_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('success', 'Đã tải xuống tệp tin sao lưu JSON!');
  };

  // Import JSON backup
  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && Array.isArray(parsed.records)) {
          if (confirm(`Tìm thấy ${parsed.records.length} bản ghi trong tệp tin. Bạn có muốn nhập đè toàn bộ dữ liệu?`)) {
            saveConfig(parsed);
            showToast('success', 'Đã nhập thành công dữ liệu từ JSON!');
          }
        } else {
          showToast('error', 'Tệp tin JSON không đúng định dạng dữ liệu CP LPG');
        }
      } catch (err) {
        showToast('error', 'Lỗi khi đọc file JSON: ' + (err as Error).message);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Reset to default seed data
  const handleResetToDefault = () => {
    if (
      confirm(
        'Bạn có chắc chắn muốn khôi phục lại 22 tháng dữ liệu mẫu gốc từ hệ thống? Các số liệu chỉnh sửa thêm sẽ bị ghi đè.'
      )
    ) {
      saveConfig(defaultLpgPrices as LpgCpConfig);
      showToast('success', 'Đã khôi phục dữ liệu mẫu gốc ban đầu!');
    }
  };

  // Visibility Handlers
  const isPageEnabled = config.enabled !== false;
  const handleToggleEnabled = () => {
    const nextVal = !isPageEnabled;
    const newConfig: LpgCpConfig = {
      ...config,
      enabled: nextVal,
      updatedAt: new Date().toISOString(),
    };
    saveConfig(newConfig);
    showToast(
      'success',
      nextVal
        ? 'Đã BẬT hiển thị trang Giá CP LPG công khai!'
        : 'Đã ẨN trang Giá CP LPG và widget trang chủ đối với công chúng!'
    );
  };

  // Content Handlers
  const handleSaveContent = () => {
    const newConfig: LpgCpConfig = {
      ...config,
      content: contentForm,
      updatedAt: new Date().toISOString(),
    };
    saveConfig(newConfig);
    showToast('success', 'Đã lưu thành công nội dung trang Giá CP LPG!');
  };

  const handleResetContent = () => {
    if (confirm('Bạn có chắc chắn muốn khôi phục toàn bộ nội dung về mặc định ban đầu?')) {
      setContentForm(DEFAULT_LPG_CP_CONTENT);
      const newConfig: LpgCpConfig = {
        ...config,
        content: DEFAULT_LPG_CP_CONTENT,
        updatedAt: new Date().toISOString(),
      };
      saveConfig(newConfig);
      showToast('success', 'Đã khôi phục nội dung tĩnh mặc định!');
    }
  };

  const handleAddFaq = () => {
    setContentForm((prev) => ({
      ...prev,
      faqs: [
        ...prev.faqs,
        {
          id: `faq-${Date.now()}`,
          question: '',
          answer: '',
        },
      ],
    }));
  };

  const handleUpdateFaq = (index: number, field: 'question' | 'answer', val: string) => {
    setContentForm((prev) => {
      const updated = [...prev.faqs];
      updated[index] = { ...updated[index], [field]: val };
      return { ...prev, faqs: updated };
    });
  };

  const handleDeleteFaq = (index: number) => {
    setContentForm((prev) => ({
      ...prev,
      faqs: prev.faqs.filter((_, i) => i !== index),
    }));
  };

  const handleMoveFaq = (index: number, direction: 'up' | 'down') => {
    setContentForm((prev) => {
      const targetIdx = direction === 'up' ? index - 1 : index + 1;
      if (targetIdx < 0 || targetIdx >= prev.faqs.length) return prev;
      const updated = [...prev.faqs];
      const temp = updated[index];
      updated[index] = updated[targetIdx];
      updated[targetIdx] = temp;
      return { ...prev, faqs: updated };
    });
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-slate-500 font-medium">Đang tải dữ liệu Giá CP LPG...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 text-sm font-semibold transition-all ${
            toast.type === 'success'
              ? 'bg-emerald-600 text-white border border-emerald-500'
              : 'bg-rose-600 text-white border border-rose-500'
          }`}
        >
          <span className="material-symbols-outlined text-lg">
            {toast.type === 'success' ? 'check_circle' : 'error'}
          </span>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Top Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider">
              Dữ liệu Thị trường
            </span>
            <span className="text-xs text-slate-400">• Thử nghiệm Local</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-3xl">
              trending_up
            </span>
            Quản lý Giá CP LPG Saudi Aramco
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Cập nhật chỉ số giá Propane, Butane, công bố hàng tháng và thiết lập tỷ giá tham chiếu.
          </p>
        </div>

        {/* Action Group */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Quick Visibility Toggle Switch */}
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 shadow-2xs">
            <span
              className={`material-symbols-outlined text-lg ${
                isPageEnabled
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-slate-400 dark:text-slate-500'
              }`}
            >
              {isPageEnabled ? 'visibility' : 'visibility_off'}
            </span>
            <div className="flex flex-col text-left">
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200 leading-tight">
                {isPageEnabled ? 'Hiển thị công khai' : 'Đang ẩn với công chúng'}
              </span>
              <span className="text-[9px] text-slate-400 leading-tight">
                {isPageEnabled ? 'Trang & widget hoạt động' : 'Tự chuyển hướng về trang chủ'}
              </span>
            </div>
            <button
              type="button"
              onClick={handleToggleEnabled}
              disabled={saving}
              title={isPageEnabled ? 'Bấm để ẩn trang với công chúng' : 'Bấm để bật trang công khai'}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden disabled:opacity-50 ${
                isPageEnabled ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                  isPageEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <Link
            href={isPageEnabled ? '/gia-cp-lpg' : '/gia-cp-lpg?preview=true'}
            target="_blank"
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors ${
              isPageEnabled
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'
                : 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 hover:bg-amber-100'
            }`}
          >
            <span className="material-symbols-outlined text-sm">
              {isPageEnabled ? 'open_in_new' : 'preview'}
            </span>
            <span>{isPageEnabled ? 'Xem trang ngoài' : 'Xem trước (Preview)'}</span>
          </Link>

          {activeTab === 'data' ? (
            <button
              type="button"
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">add_circle</span>
              Thêm tháng mới
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSaveContent}
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-sm">save</span>
              <span>{saving ? 'Đang lưu...' : 'Lưu nội dung'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-px">
        <button
          type="button"
          onClick={() => setActiveTab('data')}
          className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'data'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <span className="material-symbols-outlined text-lg">calendar_month</span>
          <span>Dữ liệu giá hàng tháng</span>
          <span className="ml-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            {sortedRecords.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('content')}
          className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'content'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <span className="material-symbols-outlined text-lg">tune</span>
          <span>Nội dung & Cấu hình trang</span>
        </button>
      </div>

      {/* TAB 1: DATA VIEW */}
      {activeTab === 'data' && (
        <div className="space-y-6">
          {/* Stats & Quick Settings Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat 1: Total records */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Tổng số tháng</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{totalMonths}</span>
            <span className="text-xs text-slate-400 font-medium">bản ghi</span>
          </div>
        </div>

        {/* Stat 2: Latest Published */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Tháng đã công bố</span>
          <div className="mt-1">
            <span className="text-base font-bold text-emerald-700 dark:text-emerald-400">
              {latestPublished ? formatMonthLabel(latestPublished.month) : 'Chưa có'}
            </span>
            {latestPublished && (
              <span className="block text-xs text-slate-500">
                CP TB: {getAverageCp(latestPublished)?.toLocaleString('vi-VN')} USD/tấn
              </span>
            )}
          </div>
        </div>

        {/* Stat 3: Latest Pending */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Trạng thái tháng gần nhất</span>
          <div className="mt-1 flex items-center gap-2">
            {latestRecord?.isPending || latestRecord?.propane === null ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                {formatMonthLabel(latestRecord.month)} (Chờ công bố)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                Đã chốt giá
              </span>
            )}
          </div>
        </div>

        {/* Stat 4: Config Fx Rate */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Tỷ giá tham chiếu</span>
          <div className="mt-1 flex items-center gap-2">
            <input
              type="number"
              step="50"
              value={config.defaultFxRate}
              onChange={(e) => {
                const val = parseFloat(e.target.value) || 26300;
                setConfig((prev) => ({ ...prev, defaultFxRate: val }));
              }}
              onBlur={() => saveConfig(config)}
              className="w-24 px-2 py-1 text-sm font-mono font-bold rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
            />
            <span className="text-xs text-slate-500">VND/USD</span>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        {/* Table Filter & Sub-actions */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Lọc năm:</span>
            <select
              value={searchYear}
              onChange={(e) => setSearchYear(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs sm:text-sm font-semibold bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
            >
              <option value="all">Tất cả ({sortedRecords.length} tháng)</option>
              {availableYears.map((yr) => (
                <option key={yr} value={yr}>
                  Năm {yr}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            {/* Hidden file input */}
            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              onChange={handleImportJson}
              className="hidden"
            />

            <button
              type="button"
              onClick={handleExportJson}
              title="Xuất file JSON sao lưu"
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-sm">download</span>
              <span className="hidden sm:inline">Xuất JSON</span>
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="Nhập file JSON sao lưu"
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-sm">upload</span>
              <span className="hidden sm:inline">Nhập JSON</span>
            </button>

            <button
              type="button"
              onClick={handleResetToDefault}
              title="Khôi phục lại dữ liệu mẫu gốc"
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 text-xs font-medium flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-sm">restart_alt</span>
              <span className="hidden sm:inline">Khôi phục gốc</span>
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Tháng</th>
                <th className="py-3.5 px-4 text-right">Propane (USD/tấn)</th>
                <th className="py-3.5 px-4 text-right">Butane (USD/tấn)</th>
                <th className="py-3.5 px-4 text-right">CP Trung bình</th>
                <th className="py-3.5 px-4 text-right">So với tháng trước</th>
                <th className="py-3.5 px-4 text-center">Trạng thái</th>
                <th className="py-3.5 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {displayRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Không tìm thấy bản ghi nào.
                  </td>
                </tr>
              ) : (
                displayRecords.map((r, i) => {
                  const globalIdx = sortedRecords.findIndex((item) => item.month === r.month);
                  const prev = globalIdx > 0 ? sortedRecords[globalIdx - 1] : null;

                  const isRecPending = r.isPending || r.propane === null || r.butane === null;
                  const avgVal = getAverageCp(r);
                  const prevAvgVal = prev && !prev.isPending && prev.propane !== null ? getAverageCp(prev) : null;
                  const delta = avgVal !== null && prevAvgVal !== null ? avgVal - prevAvgVal : null;

                  return (
                    <tr
                      key={r.month}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                        {formatMonthLabel(r.month)}
                        <span className="text-[11px] block font-mono text-slate-400 font-normal">{r.month}</span>
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono font-semibold text-[#0e6b5c] dark:text-emerald-400">
                        {isRecPending ? '–' : r.propane?.toLocaleString('vi-VN')}
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono font-semibold text-[#b4540f] dark:text-amber-500">
                        {isRecPending ? '–' : r.butane?.toLocaleString('vi-VN')}
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 dark:text-white">
                        {isRecPending ? '–' : avgVal?.toLocaleString('vi-VN', { maximumFractionDigits: 1 })}
                      </td>

                      <td className={`py-3.5 px-4 text-right font-semibold ${getDiffClass(delta)}`}>
                        {delta === null ? (
                          <span className="text-slate-400 font-normal">–</span>
                        ) : (
                          <span>
                            {getDiffArrow(delta)}
                            {formatDiff(delta)}
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleQuickTogglePending(r)}
                          title="Bấm để chuyển đổi nhanh trạng thái"
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold transition-all ${
                            isRecPending
                              ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 hover:bg-amber-200'
                              : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isRecPending ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'
                            }`}
                          />
                          {isRecPending ? 'Chờ công bố' : 'Đã công bố'}
                        </button>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(r)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                            title="Chỉnh sửa"
                          >
                            <span className="material-symbols-outlined text-sm">edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteIndex(i)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                            title="Xóa"
                          >
                            <span className="material-symbols-outlined text-sm">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )}

      {/* TAB 2: CONTENT & CONFIGURATION */}
      {activeTab === 'content' && (
        <div className="space-y-6">
          {/* Action Bar for Content */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-xl">tune</span>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Cấu hình nội dung trang công khai</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Chỉnh sửa toàn bộ văn bản tĩnh, tiêu đề, FAQ và thông báo hiển thị trên /gia-cp-lpg</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={handleResetContent}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
              >
                Khôi phục mặc định
              </button>
              <button
                type="button"
                onClick={handleSaveContent}
                disabled={saving}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-sm">save</span>
                <span>{saving ? 'Đang lưu...' : 'Lưu nội dung'}</span>
              </button>
            </div>
          </div>

          {/* Section 1: Hero Banner */}
          <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400">web</span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">1. Phần đầu trang (Hero Banner)</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Nhãn tag nhỏ (Badge):
                </label>
                <input
                  type="text"
                  value={contentForm.heroBadge}
                  onChange={(e) => setContentForm((prev) => ({ ...prev, heroBadge: e.target.value }))}
                  placeholder="HOBA LPG • Dữ liệu Năng lượng"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Tiêu đề chính trang (H1):
                </label>
                <input
                  type="text"
                  value={contentForm.heroTitle}
                  onChange={(e) => setContentForm((prev) => ({ ...prev, heroTitle: e.target.value }))}
                  placeholder="Giá CP LPG thế giới Saudi Aramco"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-bold focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Đoạn văn giới thiệu tổng quan:
              </label>
              <textarea
                rows={3}
                value={contentForm.heroDescription}
                onChange={(e) => setContentForm((prev) => ({ ...prev, heroDescription: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500"
                placeholder="Mô tả ý nghĩa của giá CP Saudi Aramco đối với thị trường..."
              />
            </div>
          </div>

          {/* Section 2: Pending Notice */}
          <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="material-symbols-outlined text-amber-500">schedule</span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">2. Khung thông báo chờ công bố giá (Pending Notice)</h3>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Tiêu đề thông báo:
              </label>
              <input
                type="text"
                value={contentForm.pendingTitle}
                onChange={(e) => setContentForm((prev) => ({ ...prev, pendingTitle: e.target.value }))}
                placeholder="Đang chờ công bố giá chính thức"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-semibold focus:ring-2 focus:ring-emerald-500"
              />
              <p className="text-[11px] text-slate-400 mt-1">Hệ thống sẽ tự động ghép tên tháng phía trước, ví dụ: "Tháng 10/2026: Đang chờ công bố giá chính thức"</p>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Nội dung chi tiết thông báo:
              </label>
              <textarea
                rows={2}
                value={contentForm.pendingDescription}
                onChange={(e) => setContentForm((prev) => ({ ...prev, pendingDescription: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Section 3: Calculator note */}
          <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400">calculate</span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">3. Ghi chú & Công thức ước tính bình 12kg</h3>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Ghi chú dưới công cụ tính (Công thức, điều kiện tham khảo):
              </label>
              <textarea
                rows={3}
                value={contentForm.calculatorNote}
                onChange={(e) => setContentForm((prev) => ({ ...prev, calculatorNote: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Section 4: FAQ Accordion Editor */}
          <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400">help_outline</span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">4. Danh sách Câu hỏi thường gặp (FAQ)</h3>
              </div>
              <button
                type="button"
                onClick={handleAddFaq}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">add</span>
                Thêm câu hỏi mới
              </button>
            </div>

            <div className="space-y-4">
              {contentForm.faqs.map((faq, index) => (
                <div
                  key={faq.id || index}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 space-y-3 relative group"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                      <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 flex items-center justify-center text-[11px] font-black">
                        {index + 1}
                      </span>
                      Câu hỏi #{index + 1}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => handleMoveFaq(index, 'up')}
                        className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                        title="Di chuyển lên"
                      >
                        <span className="material-symbols-outlined text-lg">arrow_upward</span>
                      </button>
                      <button
                        type="button"
                        disabled={index === contentForm.faqs.length - 1}
                        onClick={() => handleMoveFaq(index, 'down')}
                        className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                        title="Di chuyển xuống"
                      >
                        <span className="material-symbols-outlined text-lg">arrow_downward</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteFaq(index)}
                        className="p-1 rounded text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                        title="Xóa câu hỏi này"
                      >
                        <span className="material-symbols-outlined text-lg">delete</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <input
                      type="text"
                      value={faq.question}
                      onChange={(e) => handleUpdateFaq(index, 'question', e.target.value)}
                      placeholder="Nhập tiêu đề câu hỏi..."
                      className="w-full px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm font-semibold focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <textarea
                      rows={3}
                      value={faq.answer}
                      onChange={(e) => handleUpdateFaq(index, 'answer', e.target.value)}
                      placeholder="Nhập nội dung giải đáp chi tiết..."
                      className="w-full px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 5: Footer Notes */}
          <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="material-symbols-outlined text-slate-500">article</span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">5. Nguồn số liệu & Miễn trừ trách nhiệm (Chân trang)</h3>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Ghi chú nguồn dữ liệu:
              </label>
              <input
                type="text"
                value={contentForm.sourceNote}
                onChange={(e) => setContentForm((prev) => ({ ...prev, sourceNote: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Cảnh báo miễn trừ trách nhiệm pháp lý:
              </label>
              <textarea
                rows={2}
                value={contentForm.disclaimerNote}
                onChange={(e) => setContentForm((prev) => ({ ...prev, disclaimerNote: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Bottom Sticky Save Bar */}
          <div className="sticky bottom-4 z-20 flex items-center justify-between gap-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl">
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Đừng quên nhấn <strong className="text-emerald-600 dark:text-emerald-400">Lưu nội dung</strong> để áp dụng các thay đổi lên trang người dùng.
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleResetContent}
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
              >
                Khôi phục gốc
              </button>
              <button
                type="button"
                onClick={handleSaveContent}
                disabled={saving}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition-colors cursor-pointer disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-base">save</span>
                <span>{saving ? 'Đang lưu...' : 'Lưu toàn bộ nội dung'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-600">
                  {editingIndex !== null ? 'edit_calendar' : 'add_circle'}
                </span>
                {editingIndex !== null ? 'Chỉnh sửa tháng giá CP' : 'Thêm tháng giá CP mới'}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-4">
              {/* Month Picker */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Tháng / Năm (YYYY-MM):
                </label>
                <input
                  type="month"
                  required
                  value={formData.month}
                  onChange={(e) => setFormData((prev) => ({ ...prev, month: e.target.value }))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                />
              </div>

              {/* Checkbox Pending */}
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-amber-900 dark:text-amber-200 block">
                    Đang chờ Saudi Aramco công bố
                  </span>
                  <span className="text-[11px] text-amber-700 dark:text-amber-300/80">
                    Bật tùy chọn này nếu tháng mới chưa có số liệu chính thức
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={formData.isPending}
                  onChange={(e) => setFormData((prev) => ({ ...prev, isPending: e.target.checked }))}
                  className="w-5 h-5 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
              </div>

              {/* Propane & Butane Inputs */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Propane C3 (USD/tấn):
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    disabled={formData.isPending}
                    required={!formData.isPending}
                    placeholder="VD: 625"
                    value={formData.propane}
                    onChange={(e) => setFormData((prev) => ({ ...prev, propane: e.target.value }))}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold disabled:opacity-40 disabled:cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Butane C4 (USD/tấn):
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    disabled={formData.isPending}
                    required={!formData.isPending}
                    placeholder="VD: 615"
                    value={formData.butane}
                    onChange={(e) => setFormData((prev) => ({ ...prev, butane: e.target.value }))}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold disabled:opacity-40 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Note Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Ghi chú (Tùy chọn):
                </label>
                <input
                  type="text"
                  placeholder="Ghi chú nguồn tin hoặc điều chỉnh..."
                  value={formData.note}
                  onChange={(e) => setFormData((prev) => ({ ...prev, note: e.target.value }))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                />
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs disabled:opacity-50"
                >
                  {saving ? 'Đang lưu...' : editingIndex !== null ? 'Cập nhật' : 'Thêm mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 text-center">
            <span className="material-symbols-outlined text-rose-500 text-4xl mb-2">warning</span>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">Xác nhận xóa dữ liệu?</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
              Bạn có chắc chắn muốn xóa bản ghi{' '}
              <b className="text-slate-800 dark:text-slate-200">
                {displayRecords[deleteIndex] && formatMonthLabel(displayRecords[deleteIndex].month)}
              </b>
              ? Thao tác này sẽ cập nhật ngay vào biểu đồ.
            </p>
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setDeleteIndex(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xs"
              >
                Xóa ngay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
