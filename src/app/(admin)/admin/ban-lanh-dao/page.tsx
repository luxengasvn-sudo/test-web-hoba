'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

interface LeaderMember {
  id?: string;
  name: string;
  role: string;
  company: string;
  avatarUrl?: string;
  isVerified?: boolean;
  memberId?: string;
}

interface CommitteeConfig {
  term: string;
  title: string;
  subtitle: string;
  chairman: LeaderMember;
  viceChairmen: LeaderMember[];
  members: LeaderMember[];
}

type CommitteeType = 'ban-chap-hanh' | 'ban-kiem-tra' | 'ban-thuong-vu';

// Searchable member select component
function MemberSearchSelect({
  value,
  members,
  onChange,
  placeholder = '-- Tự do / Không liên kết --',
}: {
  value: string;
  members: any[];
  onChange: (id: string) => void;
  placeholder?: string;
}) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);

  const selected = members.find(m => m.id === value);
  const filtered = members.filter(m => {
    const q = query.toLowerCase();
    return (
      (m.company_name || '').toLowerCase().includes(q) ||
      (m.representative_name || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="relative">
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="w-full h-8 px-2 border border-outline-variant rounded outline-none text-[10px] focus:border-primary bg-white font-sans flex items-center justify-between gap-1 text-left"
      >
        <span className="truncate text-[10px] font-medium text-[#1c1c1a]">
          {selected ? `${selected.company_name} (${selected.representative_name})` : placeholder}
        </span>
        <span className="material-symbols-outlined text-[14px] text-outline shrink-0">
          {open ? 'expand_less' : 'expand_more'}
        </span>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-outline-variant/60 rounded-lg shadow-xl overflow-hidden">
          {/* Search input */}
          <div className="px-2 py-2 border-b border-outline-variant/30 flex items-center gap-1.5 bg-surface-container-low">
            <span className="material-symbols-outlined text-[14px] text-outline">search</span>
            <input
              autoFocus
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Tìm theo tên / công ty..."
              className="flex-1 text-[10px] outline-none bg-transparent placeholder:text-outline font-medium"
            />
            {query && (
              <button type="button" onClick={() => setQuery('')} className="text-outline hover:text-primary">
                <span className="material-symbols-outlined text-[13px]">close</span>
              </button>
            )}
          </div>

          {/* Options list */}
          <ul className="max-h-48 overflow-y-auto divide-y divide-outline-variant/20">
            {/* Empty option */}
            <li>
              <button
                type="button"
                onClick={() => { onChange(''); setOpen(false); setQuery(''); }}
                className={`w-full text-left px-3 py-2 text-[10px] hover:bg-surface-container-low transition-colors ${!value ? 'font-bold text-primary bg-primary-container/10' : 'text-on-surface-variant italic'}`}
              >
                {placeholder}
              </button>
            </li>
            {filtered.length === 0 && (
              <li className="px-3 py-3 text-[10px] text-on-surface-variant italic text-center">
                Không tìm thấy hội viên
              </li>
            )}
            {filtered.map(m => (
              <li key={m.id}>
                <button
                  type="button"
                  onClick={() => { onChange(m.id); setOpen(false); setQuery(''); }}
                  className={`w-full text-left px-3 py-2 text-[10px] hover:bg-surface-container-low transition-colors ${value === m.id ? 'font-bold text-primary bg-primary-container/10' : ''}`}
                >
                  <div className="font-semibold text-[#1c1c1a] truncate">{m.company_name}</div>
                  <div className="text-on-surface-variant truncate">{m.representative_name}</div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Backdrop to close */}
      {open && (
        <div className="fixed inset-0 z-40" onClick={() => { setOpen(false); setQuery(''); }} />
      )}
    </div>
  );
}

export default function AdminBanLanhDao() {
  const [activeType, setActiveType] = useState<CommitteeType>('ban-chap-hanh');
  const [term, setTerm] = useState('');
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [chairman, setChairman] = useState<LeaderMember>({
    name: '',
    role: '',
    company: '',
    avatarUrl: '',
    isVerified: true
  });
  const [viceChairmen, setViceChairmen] = useState<LeaderMember[]>([]);
  const [members, setMembers] = useState<LeaderMember[]>([]);

  const [chairmanSectionTitle, setChairmanSectionTitle] = useState('');
  const [viceChairmanSectionTitle, setViceChairmanSectionTitle] = useState('');
  const [memberSectionTitle, setMemberSectionTitle] = useState('');
  const [activeMembers, setActiveMembers] = useState<any[]>([]);

  const [showChairman, setShowChairman] = useState(true);
  const [showViceChairmen, setShowViceChairmen] = useState(true);
  const [showMembers, setShowMembers] = useState(true);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [chairmanUploading, setChairmanUploading] = useState(false);
  const [vcUploadingIdx, setVcUploadingIdx] = useState<number | null>(null);

  const getDefaultTitle = (section: 'chairman' | 'viceChairman' | 'member', type: CommitteeType) => {
    if (type === 'ban-kiem-tra') {
      switch (section) {
        case 'chairman': return 'Trưởng ban Kiểm tra';
        case 'viceChairman': return 'Phó Trưởng ban Kiểm tra';
        case 'member': return 'Ủy viên Ban Kiểm tra';
      }
    }
    if (type === 'ban-thuong-vu') {
      switch (section) {
        case 'chairman': return 'Chủ tịch Ban Thường vụ';
        case 'viceChairman': return 'Phó Chủ tịch Ban Thường vụ';
        case 'member': return 'Ủy viên Ban Thường vụ';
      }
    }
    switch (section) {
      case 'chairman': return 'Chủ tịch Hiệp hội';
      case 'viceChairman': return 'Phó Chủ tịch & Ban Thường trực';
      case 'member': return 'Danh sách Ủy viên';
    }
  };

  // Load committee data based on activeType
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const storageKey = `hoba_website_committee_${activeType}`;
      let dataVal: any = null;

      // 1. Try to load from LocalStorage first (as cache/offline data)
      const saved = typeof window !== 'undefined' ? localStorage.getItem(storageKey) : null;
      if (saved) {
        try {
          dataVal = JSON.parse(saved);
        } catch (e) {
          console.error('Error parsing config from localStorage:', e);
        }
      }

      // 2. Try to fetch from Supabase if available
      if (supabase) {
        try {
          const { data, error } = await supabase
            .from('website_config')
            .select('value')
            .eq('key', storageKey)
            .single();
          if (!error && data?.value) {
            if (typeof data.value === 'string') {
              dataVal = JSON.parse(data.value);
            } else {
              dataVal = data.value;
            }
          }
        } catch (err) {
          console.error('Error fetching config from Supabase:', err);
        }
      }

      if (dataVal) {
        setTerm(dataVal.term || '');
        setTitle(dataVal.title || '');
        setSubtitle(dataVal.subtitle || '');
        setChairman(dataVal.chairman || { name: '', role: '', company: '', avatarUrl: '', isVerified: true });
        
        setChairmanSectionTitle(dataVal.chairmanSectionTitle || getDefaultTitle('chairman', activeType));
        setViceChairmanSectionTitle(dataVal.viceChairmanSectionTitle || getDefaultTitle('viceChairman', activeType));
        setMemberSectionTitle(dataVal.memberSectionTitle || getDefaultTitle('member', activeType));

        setShowChairman(dataVal.showChairman !== false);
        setShowViceChairmen(dataVal.showViceChairmen !== false);
        setShowMembers(dataVal.showMembers !== false);

        // Add random temporary ids for React key rendering and list management
        const formattedViceChairmen = (dataVal.viceChairmen || []).map((vc: any) => ({
          ...vc,
          id: vc.id || Math.random().toString(36).substring(2, 9)
        }));
        setViceChairmen(formattedViceChairmen);

        const formattedMembers = (dataVal.members || []).map((m: any) => ({
          ...m,
          id: m.id || Math.random().toString(36).substring(2, 9)
        }));
        setMembers(formattedMembers);
      } else {
        // Reset to empty if no data is found at all
        setTerm('');
        setTitle('');
        setSubtitle('');
        setChairman({ name: '', role: '', company: '', avatarUrl: '', isVerified: true });
        setViceChairmen([]);
        setMembers([]);
        setChairmanSectionTitle(getDefaultTitle('chairman', activeType));
        setViceChairmanSectionTitle(getDefaultTitle('viceChairman', activeType));
        setMemberSectionTitle(getDefaultTitle('member', activeType));
        setShowChairman(true);
        setShowViceChairmen(true);
        setShowMembers(true);
      }
      setLoading(false);
    }
    loadData();
  }, [activeType]);

  // General Image upload helper
  const handleImageUpload = async (file: File): Promise<string> => {
    if (!supabase) {
      // Offline fallback: Convert to persistent Base64 string for localStorage storage
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(reader.result as string);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    }

    // Online path: Upload to Supabase Storage Bucket
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `committees/${activeType}/${fileName}`;

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

  // Upload Chairman Avatar
  const handleChairmanUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setChairmanUploading(true);
      try {
        const url = await handleImageUpload(e.target.files[0]);
        setChairman(prev => ({ ...prev, avatarUrl: url }));
      } catch (err) {
        alert('Lỗi tải ảnh lên: ' + (err as Error).message);
      } finally {
        setChairmanUploading(false);
      }
    }
  };

  // Upload Vice Chairman Avatar
  const handleVcUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    if (e.target.files && e.target.files[0]) {
      setVcUploadingIdx(index);
      try {
        const url = await handleImageUpload(e.target.files[0]);
        setViceChairmen(prev => prev.map((vc, i) => i === index ? { ...vc, avatarUrl: url } : vc));
      } catch (err) {
        alert('Lỗi tải ảnh lên: ' + (err as Error).message);
      } finally {
        setVcUploadingIdx(null);
      }
    }
  };

  // Vice Chairmen Actions
  const handleAddViceChairman = () => {
    setViceChairmen(prev => [
      ...prev,
      {
        id: Math.random().toString(36).substring(2, 9),
        name: 'Thành viên mới',
        role: 'Phó Chủ tịch',
        company: 'Đơn vị công tác',
        avatarUrl: ''
      }
    ]);
  };

  const handleDeleteViceChairman = (id: string) => {
    setViceChairmen(prev => prev.filter(vc => vc.id !== id));
  };

  const moveVcUp = (index: number) => {
    if (index === 0) return;
    setViceChairmen(prev => {
      const next = [...prev];
      const temp = next[index];
      next[index] = next[index - 1];
      next[index - 1] = temp;
      return next;
    });
  };

  const moveVcDown = (index: number) => {
    if (index === viceChairmen.length - 1) return;
    setViceChairmen(prev => {
      const next = [...prev];
      const temp = next[index];
      next[index] = next[index + 1];
      next[index + 1] = temp;
      return next;
    });
  };

  // Members Actions
  const handleAddMember = () => {
    setMembers(prev => [
      ...prev,
      {
        id: Math.random().toString(36).substring(2, 9),
        name: 'Hội viên mới',
        role: 'Ủy viên',
        company: 'Đơn vị công tác'
      }
    ]);
  };

  const handleDeleteMember = (id: string) => {
    setMembers(prev => prev.filter(m => m.id !== id));
  };

  const moveMemberUp = (index: number) => {
    if (index === 0) return;
    setMembers(prev => {
      const next = [...prev];
      const temp = next[index];
      next[index] = next[index - 1];
      next[index - 1] = temp;
      return next;
    });
  };

  const moveMemberDown = (index: number) => {
    if (index === members.length - 1) return;
    setMembers(prev => {
      const next = [...prev];
      const temp = next[index];
      next[index] = next[index + 1];
      next[index + 1] = temp;
      return next;
    });
  };

  // Load active members list
  useEffect(() => {
    async function loadActiveMembers() {
      let list: any[] = [];
      if (supabase) {
        try {
          const { data, error } = await supabase
            .from('members')
            .select('id, company_name, representative_name, representative_role, representative_avatar_url, license_file_url')
            .eq('status', 'Active');
          if (!error && data) {
            list = data;
          }
        } catch (e) {
          console.error('Error fetching members in admin:', e);
        }
      }

      if (list.length === 0) {
        // Fallback to localStorage
        const saved = localStorage.getItem('hoba_website_members');
        if (saved) {
          try {
            list = JSON.parse(saved).filter((m: any) => m.status === 'Active');
          } catch (e) {}
        }
      }
      setActiveMembers(list);
    }
    loadActiveMembers();
  }, []);

  const handleSelectChairmanMember = (memberId: string) => {
    if (!memberId) {
      setChairman(prev => ({ ...prev, memberId: undefined }));
      return;
    }
    const member = activeMembers.find(m => m.id === memberId);
    if (member) {
      setChairman(prev => ({
        ...prev,
        memberId,
        name: member.representative_name || prev.name,
        company: member.company_name || prev.company,
        avatarUrl: member.representative_avatar_url || member.license_file_url || prev.avatarUrl
      }));
    }
  };

  const handleSelectVcMember = (memberId: string, index: number) => {
    if (!memberId) {
      setViceChairmen(prev => prev.map((vc, i) => i === index ? { ...vc, memberId: undefined } : vc));
      return;
    }
    const member = activeMembers.find(m => m.id === memberId);
    if (member) {
      setViceChairmen(prev => prev.map((vc, i) => i === index ? {
        ...vc,
        memberId,
        name: member.representative_name || vc.name,
        company: member.company_name || vc.company,
        avatarUrl: member.representative_avatar_url || member.license_file_url || vc.avatarUrl
      } : vc));
    }
  };

  const handleSelectTableMember = (memberId: string, index: number) => {
    if (!memberId) {
      setMembers(prev => prev.map((m, i) => i === index ? { ...m, memberId: undefined } : m));
      return;
    }
    const member = activeMembers.find(m => m.id === memberId);
    if (member) {
      setMembers(prev => prev.map((m, i) => i === index ? {
        ...m,
        memberId,
        name: member.representative_name || m.name,
        company: member.company_name || m.company,
        role: member.representative_role || m.role || 'Ủy viên'
      } : m));
    }
  };

  // Save Settings
  const handleSave = async () => {
    setSaving(true);
    const storageKey = `hoba_website_committee_${activeType}`;

    // Clean up IDs before saving to keep database JSON clean
    const cleanedViceChairmen = viceChairmen.map(({ id, ...rest }) => rest);
    const cleanedMembers = members.map(({ id, ...rest }) => rest);

    const payload = {
      term,
      title,
      subtitle,
      chairman,
      viceChairmen: cleanedViceChairmen,
      members: cleanedMembers,
      chairmanSectionTitle,
      viceChairmanSectionTitle,
      memberSectionTitle,
      showChairman,
      showViceChairmen,
      showMembers
    };

    if (supabase) {
      try {
        const { error } = await supabase
          .from('website_config')
          .upsert({
            key: storageKey,
            value: payload
          });
        if (error) throw error;
      } catch (err) {
        alert('Lỗi lưu dữ liệu lên database: ' + (err as Error).message);
        setSaving(false);
        return;
      }
    }

    // Always fallback to localStorage so that offline edits work smoothly too
    localStorage.setItem(storageKey, JSON.stringify(payload));

    setSaving(false);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 4000);
  };

  return (
    <div className="space-y-6 pb-12 relative">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-[100] bg-green-600 text-white px-5 py-3.5 rounded-xl shadow-xl flex items-center gap-3 border border-green-500/20 animate-fade-in text-xs font-bold font-sans">
          <span className="material-symbols-outlined text-lg">check_circle</span>
          <span>Đã lưu cấu hình ban lãnh đạo thành công!</span>
        </div>
      )}

      {/* Header bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-outline-variant/20 pb-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-primary">Cấu hình Ban lãnh đạo Hiệp hội</h1>
          <p className="text-xs text-on-surface-variant mt-1">
            Quản trị chung các trang Ban Chấp hành, Ban Kiểm tra, và Ban Thường vụ trên cùng một form.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={`/${activeType}`}
            target="_blank"
            className="flex items-center gap-2 border border-primary text-primary px-4 py-2.5 rounded-lg text-xs font-bold hover:bg-primary-container/10 transition-colors"
          >
            <span className="material-symbols-outlined text-sm">visibility</span> Xem trang công khai
          </Link>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-secondary text-white px-5 py-2.5 rounded-lg text-xs font-bold hover:bg-[#93000d] disabled:bg-secondary-dim transition-all shadow-md"
          >
            <span className="material-symbols-outlined text-sm">
              {saving ? 'sync' : 'save'}
            </span>
            {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </div>
      </div>

      {/* Selector Tabs */}
      <div className="flex border-b border-outline-variant/30">
        <button
          onClick={() => setActiveType('ban-chap-hanh')}
          className={`px-6 py-3.5 font-bold text-xs border-b-2 transition-all flex items-center gap-2 ${
            activeType === 'ban-chap-hanh'
              ? 'border-secondary text-secondary bg-surface-container-low'
              : 'border-transparent text-on-surface-variant hover:text-primary'
          }`}
        >
          <span className="material-symbols-outlined text-sm">groups</span>
          Ban Chấp hành
        </button>
        <button
          onClick={() => setActiveType('ban-kiem-tra')}
          className={`px-6 py-3.5 font-bold text-xs border-b-2 transition-all flex items-center gap-2 ${
            activeType === 'ban-kiem-tra'
              ? 'border-secondary text-secondary bg-surface-container-low'
              : 'border-transparent text-on-surface-variant hover:text-primary'
          }`}
        >
          <span className="material-symbols-outlined text-sm">policy</span>
          Ban Kiểm tra
        </button>
        <button
          onClick={() => setActiveType('ban-thuong-vu')}
          className={`px-6 py-3.5 font-bold text-xs border-b-2 transition-all flex items-center gap-2 ${
            activeType === 'ban-thuong-vu'
              ? 'border-secondary text-secondary bg-surface-container-low'
              : 'border-transparent text-on-surface-variant hover:text-primary'
          }`}
        >
          <span className="material-symbols-outlined text-sm">shield</span>
          Ban Thường vụ
        </button>
      </div>

      {loading ? (
        <div className="bg-white border border-outline-variant/30 rounded-xl p-12 text-center shadow-sm">
          <div className="flex flex-col items-center gap-2">
            <span className="material-symbols-outlined text-3xl text-primary animate-spin">sync</span>
            <span className="text-xs text-on-surface-variant">Đang tải dữ liệu ban lãnh đạo...</span>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Form Fields */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Section 1: Thông tin chung */}
            <div className="bg-white border border-outline-variant/30 rounded-xl p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-primary flex items-center gap-2 border-b border-outline-variant/20 pb-2">
                <span className="material-symbols-outlined text-lg">info</span> 1. Thông tin chung của Ban
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="space-y-1 md:col-span-1">
                  <label className="font-bold text-on-surface-variant">Nhiệm kỳ</label>
                  <input
                    type="text"
                    value={term}
                    onChange={(e) => setTerm(e.target.value)}
                    placeholder="VD: NHIỆM KỲ VII (2022 - 2027)"
                    className="w-full h-9 px-3 rounded border border-outline-variant/50 focus:border-primary outline-none text-[11px]"
                  />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="font-bold text-on-surface-variant">Tiêu đề Ban</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Nhập tiêu đề trang hiển thị..."
                    className="w-full h-9 px-3 rounded border border-outline-variant/50 focus:border-primary outline-none text-[11px]"
                  />
                </div>
              </div>

              <div className="space-y-1 text-xs">
                <label className="font-bold text-on-surface-variant">Mô tả phụ / Slogan</label>
                <textarea
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="Nhập mô tả tóm tắt vai trò của ban..."
                  className="w-full h-16 p-3 rounded border border-outline-variant/50 focus:border-primary outline-none text-[11px] resize-none"
                />
              </div>

              <div className="border-t border-outline-variant/20 pt-4 space-y-2">
                <label className="font-bold text-xs text-on-surface-variant block">Ẩn / Hiện các khối nội dung ngoài Web</label>
                <div className="flex flex-wrap gap-6 text-xs font-semibold text-on-surface">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={showChairman}
                      onChange={(e) => setShowChairman(e.target.checked)}
                      className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary"
                    />
                    <span>Khối Chủ tịch / Trưởng ban</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={showViceChairmen}
                      onChange={(e) => setShowViceChairmen(e.target.checked)}
                      className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary"
                    />
                    <span>Khối Phó Chủ tịch / Phó ban</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={showMembers}
                      onChange={(e) => setShowMembers(e.target.checked)}
                      className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary"
                    />
                    <span>Khối Ủy viên / Thành viên</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Section 2: Chủ tịch */}
            <div className="bg-white border border-outline-variant/30 rounded-xl p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-primary flex items-center gap-2 border-b border-outline-variant/20 pb-2">
                <span className="material-symbols-outlined text-lg">person</span> 2. Thông tin Chủ tịch / Trưởng ban
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="font-bold text-on-surface-variant">Tiêu đề khối hiển thị (ngoài Web)</label>
                    <input
                      type="text"
                      value={chairmanSectionTitle}
                      onChange={(e) => setChairmanSectionTitle(e.target.value)}
                      placeholder="VD: Chủ tịch Hiệp hội / Trưởng ban Kiểm tra"
                      className="w-full h-9 px-3 rounded border border-outline-variant/50 focus:border-primary outline-none text-[11px] font-bold text-primary"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-on-surface-variant">Liên kết Hội viên (Tự động điền)</label>
                    <MemberSearchSelect
                      value={chairman.memberId || ''}
                      members={activeMembers}
                      onChange={handleSelectChairmanMember}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-on-surface-variant">Họ và tên</label>
                    <input
                      type="text"
                      value={chairman.name}
                      onChange={(e) => setChairman(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Nhập họ tên Chủ tịch..."
                      className="w-full h-9 px-3 rounded border border-outline-variant/50 focus:border-primary outline-none text-[11px]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-on-surface-variant">Chức vụ trong Hiệp hội</label>
                    <input
                      type="text"
                      value={chairman.role}
                      onChange={(e) => setChairman(prev => ({ ...prev, role: e.target.value }))}
                      placeholder="VD: Chủ tịch Hiệp hội"
                      className="w-full h-9 px-3 rounded border border-outline-variant/50 focus:border-primary outline-none text-[11px]"
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      id="chairmanVerified"
                      checked={chairman.isVerified !== false}
                      onChange={(e) => setChairman(prev => ({ ...prev, isVerified: e.target.checked }))}
                      className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary"
                    />
                    <label htmlFor="chairmanVerified" className="font-semibold text-on-surface select-none">
                      Hiển thị tích xanh xác thực (verified)
                    </label>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="font-bold text-on-surface-variant">Đơn vị công tác</label>
                    <input
                      type="text"
                      value={chairman.company}
                      onChange={(e) => setChairman(prev => ({ ...prev, company: e.target.value }))}
                      placeholder="VD: Chủ tịch HĐQT - Công ty A"
                      className="w-full h-9 px-3 rounded border border-outline-variant/50 focus:border-primary outline-none text-[11px]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-on-surface-variant">Ảnh đại diện (Portrait)</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={chairman.avatarUrl || ''}
                        onChange={(e) => setChairman(prev => ({ ...prev, avatarUrl: e.target.value }))}
                        placeholder="Nhập URL ảnh hoặc tải lên..."
                        className="flex-grow h-9 px-3 rounded border border-outline-variant/50 focus:border-primary outline-none text-[11px]"
                      />
                      <label className="flex items-center justify-center gap-1 bg-primary hover:bg-[#002752] text-white px-3.5 rounded cursor-pointer transition-colors font-bold text-[10px] h-9">
                        <span className="material-symbols-outlined text-sm">
                          {chairmanUploading ? 'sync' : 'upload'}
                        </span>
                        {chairmanUploading ? 'Đang tải...' : 'Tải lên'}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleChairmanUpload}
                          disabled={chairmanUploading}
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Chairman Photo Preview */}
              {chairman.avatarUrl && (
                <div className="pt-2 text-xs">
                  <span className="font-bold text-on-surface-variant block mb-1">Xem trước ảnh:</span>
                  <div className="w-24 h-24 rounded-lg overflow-hidden border border-outline-variant/40 bg-surface">
                    <img src={chairman.avatarUrl} alt="Chairman Avatar" className="w-full h-full object-cover" />
                  </div>
                </div>
              )}
            </div>

            {/* Section 3: Phó chủ tịch */}
            <div className="bg-white border border-outline-variant/30 rounded-xl p-6 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-outline-variant/20 pb-2">
                <h3 className="text-sm font-bold text-primary flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">group</span> 3. Phó Chủ tịch & Ban Thường trực
                </h3>
                <button
                  type="button"
                  onClick={handleAddViceChairman}
                  className="bg-primary/10 hover:bg-primary/20 text-primary text-[10px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">add</span> Thêm Phó Chủ tịch
                </button>
              </div>

              <div className="space-y-1 text-xs">
                <label className="font-bold text-on-surface-variant">Tiêu đề khối hiển thị (ngoài Web)</label>
                <input
                  type="text"
                  value={viceChairmanSectionTitle}
                  onChange={(e) => setViceChairmanSectionTitle(e.target.value)}
                  placeholder="VD: Phó Chủ tịch & Ban Thường trực"
                  className="w-full h-9 px-3 rounded border border-outline-variant/50 focus:border-primary outline-none text-[11px] font-bold text-primary"
                />
              </div>

              {viceChairmen.length === 0 ? (
                <p className="text-xs text-on-surface-variant italic py-2">Chưa cấu hình Phó chủ tịch nào.</p>
              ) : (
                <div className="space-y-4">
                  {viceChairmen.map((vc, idx) => (
                    <div
                      key={vc.id}
                      className="p-4 border border-outline-variant/40 rounded-xl space-y-3 bg-surface-container-low text-xs relative group shadow-sm"
                    >
                      {/* Action buttons */}
                      <div className="flex justify-between items-center border-b border-outline-variant/20 pb-1.5">
                        <span className="font-bold text-primary uppercase text-[9px] tracking-wider">
                          Phó Chủ tịch #{idx + 1}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => moveVcUp(idx)}
                            disabled={idx === 0}
                            className="text-on-surface-variant hover:text-primary disabled:opacity-30"
                            title="Di chuyển lên"
                          >
                            <span className="material-symbols-outlined text-base">arrow_upward</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => moveVcDown(idx)}
                            disabled={idx === viceChairmen.length - 1}
                            className="text-on-surface-variant hover:text-primary disabled:opacity-30"
                            title="Di chuyển xuống"
                          >
                            <span className="material-symbols-outlined text-base">arrow_downward</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteViceChairman(vc.id!)}
                            className="text-secondary hover:text-[#93000d] font-bold text-[10px] flex items-center gap-0.5 ml-2"
                            title="Xóa Phó Chủ tịch"
                          >
                            <span className="material-symbols-outlined text-sm">delete</span> Xóa
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <div className="space-y-1">
                          <label className="font-semibold block text-[10px] text-on-surface-variant">Liên kết Hội viên</label>
                          <MemberSearchSelect
                            value={vc.memberId || ''}
                            members={activeMembers}
                            onChange={(id) => handleSelectVcMember(id, idx)}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="font-semibold block text-[10px] text-on-surface-variant">Họ và tên</label>
                          <input
                            type="text"
                            value={vc.name}
                            onChange={(e) => {
                              const val = e.target.value;
                              setViceChairmen(prev => prev.map(item => item.id === vc.id ? { ...item, name: val } : item));
                            }}
                            className="w-full h-8 px-2 border border-outline-variant rounded outline-none focus:border-primary"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="font-semibold block text-[10px] text-on-surface-variant">Chức vụ trong Hiệp hội</label>
                          <input
                            type="text"
                            value={vc.role}
                            onChange={(e) => {
                              const val = e.target.value;
                              setViceChairmen(prev => prev.map(item => item.id === vc.id ? { ...item, role: val } : item));
                            }}
                            className="w-full h-8 px-2 border border-outline-variant rounded outline-none focus:border-primary"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="font-semibold block text-[10px] text-on-surface-variant">Ảnh chân dung</label>
                          <div className="flex gap-1.5">
                            <input
                              type="text"
                              value={vc.avatarUrl || ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                setViceChairmen(prev => prev.map(item => item.id === vc.id ? { ...item, avatarUrl: val } : item));
                              }}
                              placeholder="URL..."
                              className="flex-grow h-8 px-2 border border-outline-variant rounded outline-none focus:border-primary text-[10px]"
                            />
                            <label className="flex items-center justify-center bg-primary hover:bg-[#002752] text-white px-2 rounded cursor-pointer text-[10px] font-bold h-8">
                              <span className="material-symbols-outlined text-sm">
                                {vcUploadingIdx === idx ? 'sync' : 'upload'}
                              </span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => handleVcUpload(e, idx)}
                                disabled={vcUploadingIdx === idx}
                              />
                            </label>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="font-semibold block text-[10px] text-on-surface-variant">Đơn vị công tác</label>
                        <input
                          type="text"
                          value={vc.company}
                          onChange={(e) => {
                            const val = e.target.value;
                            setViceChairmen(prev => prev.map(item => item.id === vc.id ? { ...item, company: val } : item));
                          }}
                          className="w-full h-8 px-2 border border-outline-variant rounded outline-none focus:border-primary"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Section 4: Danh sách ủy viên */}
            <div className="bg-white border border-outline-variant/30 rounded-xl p-6 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-outline-variant/20 pb-2">
                <h3 className="text-sm font-bold text-primary flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">format_list_numbered</span> 4. Danh sách các Ủy viên
                </h3>
                <button
                  type="button"
                  onClick={handleAddMember}
                  className="bg-primary/10 hover:bg-primary/20 text-primary text-[10px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">add</span> Thêm Ủy viên
                </button>
              </div>

              <div className="space-y-1 text-xs">
                <label className="font-bold text-on-surface-variant">Tiêu đề khối hiển thị (ngoài Web)</label>
                <input
                  type="text"
                  value={memberSectionTitle}
                  onChange={(e) => setMemberSectionTitle(e.target.value)}
                  placeholder="VD: Danh sách Ủy viên"
                  className="w-full h-9 px-3 rounded border border-outline-variant/50 focus:border-primary outline-none text-[11px] font-bold text-primary"
                />
              </div>

              {members.length === 0 ? (
                <p className="text-xs text-on-surface-variant italic py-2">Chưa cấu hình Ủy viên nào.</p>
              ) : (
                <div className="border border-outline-variant/20 rounded-lg overflow-hidden shadow-sm">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-surface-container-high border-b border-outline-variant/20">
                        <th className="py-2.5 px-3 font-bold w-12 text-center text-on-surface-variant">STT</th>
                        <th className="py-2.5 px-3 font-bold text-on-surface-variant">Liên kết Hội viên</th>
                        <th className="py-2.5 px-3 font-bold text-on-surface-variant">Họ và tên</th>
                        <th className="py-2.5 px-3 font-bold text-on-surface-variant">Chức vụ tại Hiệp hội</th>
                        <th className="py-2.5 px-3 font-bold text-on-surface-variant">Đơn vị công tác</th>
                        <th className="py-2.5 px-3 font-bold w-24 text-center text-on-surface-variant">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/20">
                      {members.map((member, idx) => (
                        <tr key={member.id} className="hover:bg-surface-container-low transition-colors">
                          <td className="py-2 px-3 text-center font-bold text-on-surface-variant">{idx + 1}</td>
                          <td className="py-2 px-2">
                            <MemberSearchSelect
                              value={member.memberId || ''}
                              members={activeMembers}
                              onChange={(id) => handleSelectTableMember(id, idx)}
                            />
                          </td>
                          <td className="py-2 px-2">
                            <input
                              type="text"
                              value={member.name}
                              onChange={(e) => {
                                const val = e.target.value;
                                setMembers(prev => prev.map(item => item.id === member.id ? { ...item, name: val } : item));
                              }}
                              className="w-full h-8 px-2 border border-outline-variant/40 rounded outline-none focus:border-primary text-xs"
                            />
                          </td>
                          <td className="py-2 px-2">
                            <input
                              type="text"
                              value={member.role}
                              onChange={(e) => {
                                const val = e.target.value;
                                setMembers(prev => prev.map(item => item.id === member.id ? { ...item, role: val } : item));
                              }}
                              className="w-full h-8 px-2 border border-outline-variant/40 rounded outline-none focus:border-primary text-xs"
                            />
                          </td>
                          <td className="py-2 px-2">
                            <input
                              type="text"
                              value={member.company}
                              onChange={(e) => {
                                const val = e.target.value;
                                setMembers(prev => prev.map(item => item.id === member.id ? { ...item, company: val } : item));
                              }}
                              className="w-full h-8 px-2 border border-outline-variant/40 rounded outline-none focus:border-primary text-xs"
                            />
                          </td>
                          <td className="py-2 px-3 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => moveMemberUp(idx)}
                                disabled={idx === 0}
                                className="text-on-surface-variant hover:text-primary disabled:opacity-30"
                              >
                                <span className="material-symbols-outlined text-base">arrow_upward</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => moveMemberDown(idx)}
                                disabled={idx === members.length - 1}
                                className="text-on-surface-variant hover:text-primary disabled:opacity-30"
                              >
                                <span className="material-symbols-outlined text-base">arrow_downward</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteMember(member.id!)}
                                className="text-secondary hover:text-[#93000d] ml-1"
                              >
                                <span className="material-symbols-outlined text-base">delete</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>

          {/* Right Sidebar - Preview & Instructions */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white border border-outline-variant/30 rounded-xl p-5 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5 border-b border-outline-variant/20 pb-2">
                <span className="material-symbols-outlined text-base">lightbulb</span> Hướng dẫn cấu hình
              </h3>
              
              <ul className="text-[11px] text-on-surface-variant space-y-3 leading-relaxed list-disc pl-4 font-medium">
                <li>
                  <strong className="text-primary">Đồng bộ tự động:</strong> Khi bạn chọn Tab ở trên, form sẽ tự nạp dữ liệu cũ của ban lãnh đạo tương ứng để bạn sửa đổi.
                </li>
                <li>
                  <strong className="text-primary">Tải ảnh đại diện:</strong> Hệ thống hỗ trợ dán URL ảnh trực tiếp từ Unsplash/Google, hoặc bấm nút <strong className="text-secondary">Tải lên</strong> để tải tệp ảnh từ máy tính.
                </li>
                <li>
                  <strong className="text-primary">Sắp xếp thứ tự:</strong> Sử dụng các nút mũi tên lên/xuống để sắp xếp thứ tự của Phó Chủ tịch và các Ủy viên.
                </li>
                <li>
                  <strong className="text-primary">Chế độ offline:</strong> Khi chạy dưới local hoặc không có Supabase, ảnh tải lên được mã hóa Base64 và lưu trực tiếp trong LocalStorage. Dữ liệu sẽ không bị mất khi tải lại trang.
                </li>
              </ul>
            </div>

            <div className="bg-white border border-outline-variant/30 rounded-xl p-5 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5 border-b border-outline-variant/20 pb-2">
                <span className="material-symbols-outlined text-base">preview</span> Xem nhanh Giao diện Ban
              </h3>
              
              <div className="space-y-3 text-xs border border-outline-variant/30 rounded-lg p-3.5 bg-surface-container-low font-sans">
                <div>
                  <span className="text-[9px] font-bold text-secondary uppercase block mb-1">Tiêu đề thiết lập:</span>
                  <div className="font-extrabold text-primary text-sm line-clamp-1">{title || '(Chưa điền tiêu đề)'}</div>
                  <div className="text-[10px] text-on-surface-variant mt-0.5">{term || '(Chưa điền nhiệm kỳ)'}</div>
                </div>

                <div className="border-t border-outline-variant/20 pt-2.5">
                  <span className="text-[9px] font-bold text-secondary uppercase block mb-1.5">Chủ tịch:</span>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full overflow-hidden border border-outline-variant/40 bg-surface flex-shrink-0">
                      <img src={chairman.avatarUrl || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=256'} alt="avatar" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <div className="font-bold text-primary text-[11px] line-clamp-1">{chairman.name || '(Chưa điền tên)'}</div>
                      <div className="text-[9px] text-on-surface-variant line-clamp-1">{chairman.company || '(Chưa điền đơn vị)'}</div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-outline-variant/20 pt-2.5 flex justify-between text-[10px]">
                  <div>
                    <span className="font-semibold text-on-surface-variant">Phó Chủ tịch:</span>
                    <span className="font-bold text-primary ml-1">{viceChairmen.length} thành viên</span>
                  </div>
                  <div>
                    <span className="font-semibold text-on-surface-variant">Ủy viên:</span>
                    <span className="font-bold text-primary ml-1">{members.length} người</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
