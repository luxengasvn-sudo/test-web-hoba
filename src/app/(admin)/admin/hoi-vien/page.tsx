'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase, deleteFileFromStorage } from '@/lib/supabase';

interface MemberAdmin {
  id: string;
  name: string;
  taxCode: string;
  type: string;
  email: string;
  phone: string;
  address: string;
  representativeName: string;
  representativeRole: string;
  representativeEmail: string;
  representativePhone: string;
  status: 'Active' | 'Pending' | 'Suspended';
  date: string;
  
  // Extended fields
  chapterId?: string;
  associationRole: string;
  chapterRole?: string;
  joinDate: string;
  logoUrl?: string;
  representativeAvatarUrl?: string;
  licenseFileUrl?: string;
  safetyFileUrl?: string;
}

interface ChapterListOption {
  id: string;
  name: string;
}

const MOCK_CHAPTER_OPTIONS: ChapterListOption[] = [
  { id: 'hn-north', name: 'Chi hội LPG Hà Nội' },
  { id: 'hp-north', name: 'Chi hội LPG Hải Phòng' },
  { id: 'tb-north', name: 'Chi hội LPG Tây Bắc' },
  { id: 'hcm-south', name: 'Chi hội LPG TP. Hồ Chí Minh' },
  { id: 'tnb-south', name: 'Chi hội LPG Tây Nam Bộ' }
];

// Resilient Image preview components to prevent broken images
function TableImage({ src }: { src: string | undefined }) {
  const [error, setError] = useState(false);
  useEffect(() => {
    setError(false);
  }, [src]);

  if (error || !src) {
    return <span className="material-symbols-outlined text-outline text-[16px]">image</span>;
  }
  return (
    <img
      src={src}
      alt="Logo"
      className="w-8 h-8 rounded border object-contain bg-white shrink-0"
      onError={() => setError(true)}
    />
  );
}

function PreviewImage({ src, isAvatar = false }: { src: string | undefined; isAvatar?: boolean }) {
  const [error, setError] = useState(false);
  useEffect(() => {
    setError(false);
  }, [src]);

  if (error || !src) {
    return (
      <span className="material-symbols-outlined text-outline text-xl">
        {isAvatar ? 'person' : 'image'}
      </span>
    );
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

const getRoleColor = (roleName: string, configuredRoles: any[]) => {
  const normalizedRole = (roleName || '').trim().toLowerCase();
  
  // 1. Try exact match first
  let config = configuredRoles.find(r => {
    const name = typeof r === 'object' && r !== null ? r.name : r;
    return (name || '').trim().toLowerCase() === normalizedRole;
  });
  
  // 2. Try loose/partial match if exact match fails
  if (!config) {
    config = configuredRoles.find(r => {
      const name = typeof r === 'object' && r !== null ? r.name : r;
      const normalizedConfigName = (name || '').trim().toLowerCase();
      return normalizedConfigName.includes(normalizedRole) || normalizedRole.includes(normalizedConfigName);
    });
  }
  
  if (config && typeof config === 'object' && config.color) {
    return { bg: config.color, text: config.textColor || '#ffffff' };
  }
  
  // Fallbacks
  if (normalizedRole === 'chủ tịch' || normalizedRole.includes('chủ tịch')) return { bg: '#bb0013', text: '#ffffff' };
  if (normalizedRole === 'phó chủ tịch' || normalizedRole.includes('phó chủ tịch')) return { bg: '#00346f', text: '#ffffff' };
  if (normalizedRole === 'ban kiểm tra' || normalizedRole.includes('kiểm tra')) return { bg: '#d97706', text: '#ffffff' };
  if (normalizedRole.includes('thường vụ')) return { bg: '#0284c7', text: '#ffffff' };
  if (normalizedRole.includes('chấp hành') || normalizedRole === 'ủy viên bch' || normalizedRole.includes('bch')) return { bg: '#d7e2ff', text: '#001b3f' };
  return { bg: '#e7e5e4', text: '#1c1c1a' };
};

// Utility: strip base64 data URIs from localStorage members to free up space
function cleanupBase64FromLocalStorage() {
  try {
    const saved = localStorage.getItem('hoba_website_members');
    if (!saved) return;
    const data = JSON.parse(saved);
    let changed = false;
    const cleaned = data.map((m: any) => {
      const copy = { ...m };
      if (copy.logo_url?.startsWith('data:')) { copy.logo_url = null; changed = true; }
      if (copy.representative_avatar_url?.startsWith('data:')) { copy.representative_avatar_url = null; changed = true; }
      if (copy.license_file_url?.startsWith('data:')) { copy.license_file_url = null; changed = true; }
      if (copy.safety_file_url?.startsWith('data:')) { copy.safety_file_url = null; changed = true; }
      return copy;
    });
    if (changed) {
      localStorage.setItem('hoba_website_members', JSON.stringify(cleaned));
      console.log('Cleaned up base64 images from localStorage to free quota.');
    }
  } catch (e) {}
}

export default function AdminMembers() {
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
  const [members, setMembers] = useState<MemberAdmin[]>([]);
  const [chapters, setChapters] = useState<ChapterListOption[]>(MOCK_CHAPTER_OPTIONS);
  const [associationRoles, setAssociationRoles] = useState<any[]>([
    'Chủ tịch',
    'Phó Chủ tịch',
    'Ban kiểm tra',
    'Ủy viên Ban Thường vụ',
    'Ủy viên Ban Chấp hành',
    'Hội viên chính thức',
    'Hội viên liên kết'
  ]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editMemberId, setEditMemberId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [isRolesEditorOpen, setIsRolesEditorOpen] = useState(false);
  const [editingRolesList, setEditingRolesList] = useState<any[]>([]);

  // Form State
  const [formName, setFormName] = useState('');
  const [formTaxCode, setFormTaxCode] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formBusinessType, setFormBusinessType] = useState('Phân phối & Bán lẻ');
  const [formRepName, setFormRepName] = useState('');
  const [formRepRole, setFormRepRole] = useState('Đại diện pháp luật');
  const [formRepEmail, setFormRepEmail] = useState('');
  const [formRepPhone, setFormRepPhone] = useState('');
  
  // Extended Form Fields
  const [formChapterId, setFormChapterId] = useState('');
  const [formAssociationRole, setFormAssociationRole] = useState('Hội viên chính thức');
  const [formChapterRole, setFormChapterRole] = useState('');
  const [formJoinDate, setFormJoinDate] = useState(new Date().toISOString().split('T')[0]);
  const [formLogoUrl, setFormLogoUrl] = useState('');
  const [formRepAvatarUrl, setFormRepAvatarUrl] = useState('');
  const [formLicenseFileUrl, setFormLicenseFileUrl] = useState('');
  const [formSafetyFileUrl, setFormSafetyFileUrl] = useState('');

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
    const filePath = `member-assets/${fileName}`;

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

  const handleImageUploadChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    setField: (url: string) => void
  ) => {
    if (e.target.files && e.target.files[0]) {
      try {
        const url = await uploadImage(e.target.files[0]);
        setField(url);
      } catch (err) {
        alert('Lỗi tải ảnh lên: ' + (err as Error).message);
      }
    }
  };

  const defaultMembers: MemberAdmin[] = [
    { 
      id: '1', 
      name: 'Saigon Petro', 
      taxCode: '0300621215', 
      type: 'Phân phối & Bán lẻ', 
      email: 'info@saigonpetro.vn', 
      phone: '028 3831 6671',
      address: '444-446 Cách Mạng Tháng Tám, P.11, Q.3, TP.HCM',
      representativeName: 'Nguyễn Văn A',
      representativeRole: 'Giám đốc',
      representativeEmail: 'ceo@saigonpetro.vn',
      representativePhone: '0901234567',
      status: 'Active', 
      date: '2010-05-15',
      associationRole: 'Ủy viên BCH',
      chapterRole: 'Cố vấn cấp cao',
      joinDate: '2010-05-15',
      chapterId: 'hn-north',
      logoUrl: 'https://lh3.googleusercontent.com/aida/AP1WRLuglnRl5gmLyf0yjPoBdSC55tsB1431C7PLAhByHJVSmfc-pEM_kLYCH5FY5AAfDjwss6QWVzKUKkSR6rCueIUgRCFe_TddGJN36KmXzLR1Nr7MyRiVAQbse1HGRVjt4lJcaAsQsnkAGZDYlnVw4U_30oEJj0bzoVqmeNAX59YFSNgos2T-7c5ApJ1jgUUe2QDFJs-JUHY6s5atCg6nJEgEsq4kkl9q-pHqxRCCuCwuvOcMwEjzTfZLjQ'
    },
    { 
      id: '2', 
      name: 'City Gas', 
      taxCode: '0102654318', 
      type: 'Phân phối & Bán lẻ', 
      email: 'office@citygas.com', 
      phone: '028 3910 0108',
      address: 'TP. Hồ Chí Minh',
      representativeName: 'Bà Đặng Thị Hồng',
      representativeRole: 'Giám đốc Điều hành',
      representativeEmail: 'hongdt@pgs.com.vn',
      representativePhone: '0904567890',
      status: 'Active', 
      date: '2026-05-25',
      associationRole: 'Hội viên chính thức',
      joinDate: '2026-05-25'
    }
  ];

  const fetchChapters = async () => {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('chapters').select('id, name');
        if (!error && data && data.length > 0) {
          setChapters(data);
        }
      } catch (e) {}
    }
  };

  const fetchRoles = async () => {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('website_config')
          .select('value')
          .eq('key', 'memberspage')
          .single();
        if (!error && data?.value?.associationRoles) {
          setAssociationRoles(data.value.associationRoles);
        }
      } catch (e) {}
    } else {
      const saved = localStorage.getItem('hoba_website_config_memberspage');
      if (saved) {
        try {
          const val = JSON.parse(saved);
          if (val.associationRoles && Array.isArray(val.associationRoles)) {
            setAssociationRoles(val.associationRoles);
          }
        } catch (e) {}
      }
    }
  };

  const handleOpenRolesEditor = () => {
    const converted = associationRoles.map(opt => {
      if (typeof opt === 'object' && opt !== null) {
        return { name: opt.name, color: opt.color || '#00346f', textColor: opt.textColor || '#ffffff' };
      }
      const defaults = getRoleColor(opt, []);
      return { name: opt, color: defaults.bg, textColor: defaults.text };
    });
    setEditingRolesList(converted);
    setIsRolesEditorOpen(true);
  };

  const handleAddRoleInEditor = () => {
    setEditingRolesList(prev => [...prev, { name: 'Chức danh mới', color: '#00346f', textColor: '#ffffff' }]);
  };

  const handleRemoveRoleInEditor = (index: number) => {
    setEditingRolesList(prev => prev.filter((_, i) => i !== index));
  };

  const handleRoleNameChangeInEditor = (index: number, value: string) => {
    setEditingRolesList(prev => prev.map((item: any, i) => i === index ? { ...item, name: value } : item));
  };

  const handleRoleColorChangeInEditor = (index: number, value: string) => {
    setEditingRolesList(prev => prev.map((item: any, i) => i === index ? { ...item, color: value } : item));
  };

  const handleRoleTextColorChangeInEditor = (index: number, value: string) => {
    setEditingRolesList(prev => prev.map((item: any, i) => i === index ? { ...item, textColor: value } : item));
  };

  const handleSaveRolesInEditor = async () => {
    const cleanList = editingRolesList
      .map((r: any) => ({
        name: r.name.trim(),
        color: r.color,
        textColor: r.textColor || '#ffffff'
      }))
      .filter(r => r.name);

    if (cleanList.length === 0) {
      alert('Danh sách chức vụ không được trống.');
      return;
    }

    setAssociationRoles(cleanList);
    
    if (supabase) {
      try {
        const { data } = await supabase.from('website_config').select('value').eq('key', 'memberspage').single();
        const currentVal = data?.value || {};
        const updatedVal = {
          ...currentVal,
          associationRoles: cleanList
        };
        await supabase.from('website_config').upsert({ key: 'memberspage', value: updatedVal });
      } catch (e) {
        console.error('Error saving roles to database:', e);
      }
    } else {
      const saved = localStorage.getItem('hoba_website_config_memberspage');
      let currentVal = {};
      if (saved) {
        try { currentVal = JSON.parse(saved); } catch (e) {}
      }
      const updatedVal = {
        ...currentVal,
        associationRoles: cleanList
      };
      localStorage.setItem('hoba_website_config_memberspage', JSON.stringify(updatedVal));
    }

    setIsRolesEditorOpen(false);
  };

  const fetchMembers = async () => {
    setLoading(true);
    await fetchChapters();
    await fetchRoles();

    if (!supabase) {
      const saved = localStorage.getItem('hoba_website_members');
      if (saved) {
        try {
          const data = JSON.parse(saved);
          const formatted: MemberAdmin[] = data.map((d: any) => ({
            id: d.id,
            name: d.company_name,
            taxCode: d.tax_code,
            type: d.business_type,
            email: d.email,
            phone: d.phone,
            address: d.address,
            representativeName: d.representative_name,
            representativeRole: d.representative_role,
            representativeEmail: d.representative_email,
            representativePhone: d.representative_phone,
            status: d.status,
            date: d.created_at ? d.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
            chapterId: d.chapter_id || '',
            associationRole: d.association_role || 'Hội viên chính thức',
            chapterRole: d.chapter_role || '',
            joinDate: d.join_date ? d.join_date.split('T')[0] : (d.created_at ? d.created_at.split('T')[0] : new Date().toISOString().split('T')[0]),
            logoUrl: d.logo_url || '',
            representativeAvatarUrl: d.representative_avatar_url || '',
            licenseFileUrl: d.license_file_url || '',
            safetyFileUrl: d.safety_file_url || ''
          }));
          setMembers(formatted);
        } catch (e) {
          setMembers(defaultMembers);
        }
      } else {
        const dbFormat = defaultMembers.map(m => ({
          id: m.id,
          company_name: m.name,
          tax_code: m.taxCode,
          business_type: m.type,
          email: m.email,
          phone: m.phone,
          address: m.address,
          representative_name: m.representativeName,
          representative_role: m.representativeRole,
          representative_email: m.representativeEmail,
          representative_phone: m.representativePhone,
          status: m.status,
          created_at: new Date(m.date).toISOString(),
          chapter_id: m.chapterId || null,
          association_role: m.associationRole,
          chapter_role: m.chapterRole || null,
          join_date: m.joinDate,
          logo_url: m.logoUrl || null,
          representative_avatar_url: m.representativeAvatarUrl || null,
          license_file_url: null,
          safety_file_url: null
        }));
        localStorage.setItem('hoba_website_members', JSON.stringify(dbFormat));
        setMembers(defaultMembers);
      }
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        const formatted: MemberAdmin[] = data.map((d: any) => ({
          id: d.id,
          name: d.company_name,
          taxCode: d.tax_code,
          type: d.business_type,
          email: d.email,
          phone: d.phone,
          address: d.address,
          representativeName: d.representative_name,
          representativeRole: d.representative_role,
          representativeEmail: d.representative_email,
          representativePhone: d.representative_phone,
          status: d.status,
          date: d.created_at ? d.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
          chapterId: d.chapter_id || '',
          associationRole: d.association_role || 'Hội viên chính thức',
          chapterRole: d.chapter_role || '',
          joinDate: d.join_date ? d.join_date.split('T')[0] : (d.created_at ? d.created_at.split('T')[0] : new Date().toISOString().split('T')[0]),
          logoUrl: d.logo_url || '',
          representativeAvatarUrl: d.representative_avatar_url || '',
          licenseFileUrl: d.license_file_url || '',
          safetyFileUrl: d.safety_file_url || ''
        }));
        setMembers(formatted);
      } else {
        setMembers([]);
      }
    } catch (err) {
      console.error('Lỗi tải danh sách hội viên, chuyển sang fallback:', err);
      setMembers(defaultMembers);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Proactively clean up any stored base64 images to prevent quota issues
    if (!supabase) {
      cleanupBase64FromLocalStorage();
    }
    fetchMembers();
  }, []);

  const handleStatusChange = async (id: string, newStatus: 'Active' | 'Pending' | 'Suspended') => {
    if (!supabase) {
      const saved = localStorage.getItem('hoba_website_members');
      if (saved) {
        try {
          const list = JSON.parse(saved);
          const updated = list.map((m: any) => m.id === id ? { ...m, status: newStatus } : m);
          localStorage.setItem('hoba_website_members', JSON.stringify(updated));
        } catch (e) {}
      }
      setMembers(prev => prev.map(m => m.id === id ? { ...m, status: newStatus } : m));
      return;
    }

    try {
      const { error } = await supabase
        .from('members')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;
      setMembers(prev => prev.map(m => m.id === id ? { ...m, status: newStatus } : m));
    } catch (err) {
      alert('Lỗi: ' + (err as Error).message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa hội viên này khỏi hệ thống?')) return;

    const targetMember = members.find(m => m.id === id);

    if (!supabase) {
      const saved = localStorage.getItem('hoba_website_members');
      if (saved) {
        try {
          const list = JSON.parse(saved);
          const updated = list.filter((m: any) => m.id !== id);
          localStorage.setItem('hoba_website_members', JSON.stringify(updated));
        } catch (e) {}
      }
      if (targetMember) {
        if (targetMember.logoUrl) deleteFileFromStorage(targetMember.logoUrl);
        if (targetMember.representativeAvatarUrl) deleteFileFromStorage(targetMember.representativeAvatarUrl);
        if (targetMember.licenseFileUrl) deleteFileFromStorage(targetMember.licenseFileUrl);
        if (targetMember.safetyFileUrl) deleteFileFromStorage(targetMember.safetyFileUrl);
      }
      setMembers(prev => prev.filter(m => m.id !== id));
      return;
    }

    try {
      const { error } = await supabase.from('members').delete().eq('id', id);
      if (error) throw error;
      
      if (targetMember) {
        if (targetMember.logoUrl) deleteFileFromStorage(targetMember.logoUrl);
        if (targetMember.representativeAvatarUrl) deleteFileFromStorage(targetMember.representativeAvatarUrl);
        if (targetMember.licenseFileUrl) deleteFileFromStorage(targetMember.licenseFileUrl);
        if (targetMember.safetyFileUrl) deleteFileFromStorage(targetMember.safetyFileUrl);
      }
      setMembers(prev => prev.filter(m => m.id !== id));
    } catch (err) {
      alert('Không thể xóa hội viên. Lỗi: ' + (err as Error).message);
    }
  };

  const handleOpenEdit = (m: MemberAdmin) => {
    setEditMemberId(m.id);
    setIsEditMode(true);
    setFormName(m.name);
    setFormTaxCode(m.taxCode);
    setFormAddress(m.address);
    setFormPhone(m.phone);
    setFormBusinessType(m.type);
    setFormRepName(m.representativeName);
    setFormRepRole(m.representativeRole);
    setFormRepEmail(m.representativeEmail);
    setFormRepPhone(m.representativePhone);
    setFormChapterId(m.chapterId || '');
    setFormAssociationRole(m.associationRole);
    setFormChapterRole(m.chapterRole || '');
    setFormJoinDate(m.joinDate);
    setFormLogoUrl(m.logoUrl || '');
    setFormRepAvatarUrl(m.representativeAvatarUrl || '');
    setFormLicenseFileUrl(m.licenseFileUrl || '');
    setFormSafetyFileUrl(m.safetyFileUrl || '');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formTaxCode || !formAddress || !formPhone || !formRepName || !formRepEmail || !formRepPhone) {
      alert('Vui lòng nhập đầy đủ thông tin bắt buộc.');
      return;
    }

    setSubmitting(true);
    const currentDate = new Date().toISOString().split('T')[0];

    const payload = {
      company_name: formName,
      tax_code: formTaxCode,
      address: formAddress,
      phone: formPhone,
      email: formRepEmail,
      business_type: formBusinessType,
      representative_name: formRepName,
      representative_role: formRepRole,
      representative_email: formRepEmail,
      representative_phone: formRepPhone,
      chapter_id: formChapterId || null,
      association_role: formAssociationRole,
      chapter_role: formChapterRole || null,
      join_date: formJoinDate,
      logo_url: formLogoUrl || null,
      representative_avatar_url: formRepAvatarUrl || null,
      license_file_url: formLicenseFileUrl || null,
      safety_file_url: formSafetyFileUrl || null
    };

    if (!supabase) {
      const saved = localStorage.getItem('hoba_website_members');
      let currentList: any[] = [];
      if (saved) {
        try {
          currentList = JSON.parse(saved);
        } catch (e) {}
      }

      if (isEditMode && editMemberId) {
        const targetMember = members.find(m => m.id === editMemberId);
        if (targetMember) {
          if (targetMember.logoUrl && targetMember.logoUrl !== formLogoUrl) {
            deleteFileFromStorage(targetMember.logoUrl);
          }
          if (targetMember.representativeAvatarUrl && targetMember.representativeAvatarUrl !== formRepAvatarUrl) {
            deleteFileFromStorage(targetMember.representativeAvatarUrl);
          }
          if (targetMember.licenseFileUrl && targetMember.licenseFileUrl !== formLicenseFileUrl) {
            deleteFileFromStorage(targetMember.licenseFileUrl);
          }
          if (targetMember.safetyFileUrl && targetMember.safetyFileUrl !== formSafetyFileUrl) {
            deleteFileFromStorage(targetMember.safetyFileUrl);
          }
        }
        currentList = currentList.map((m: any) => {
          if (m.id === editMemberId) {
            return {
              ...m,
              ...payload
            };
          }
          return m;
        });
      } else {
        const newId = String(Date.now());
        const newDbMem = {
          id: newId,
          ...payload,
          status: 'Pending',
          created_at: new Date().toISOString()
        };
        currentList = [newDbMem, ...currentList];
      }

      // Save to localStorage with quota-safe fallback
      const saveToLocalStorage = (list: any[]) => {
        try {
          localStorage.setItem('hoba_website_members', JSON.stringify(list));
        } catch (quotaErr) {
          // If quota exceeded, strip large base64 image data and retry
          const stripped = list.map((m: any) => {
            const copy = { ...m };
            // Remove base64 data URIs (they start with "data:") to free up space
            if (copy.logo_url && copy.logo_url.startsWith('data:')) copy.logo_url = null;
            if (copy.representative_avatar_url && copy.representative_avatar_url.startsWith('data:')) copy.representative_avatar_url = null;
            if (copy.license_file_url && copy.license_file_url.startsWith('data:')) copy.license_file_url = null;
            if (copy.safety_file_url && copy.safety_file_url.startsWith('data:')) copy.safety_file_url = null;
            return copy;
          });
          try {
            localStorage.setItem('hoba_website_members', JSON.stringify(stripped));
            alert('⚠️ Lưu thành công (đã bỏ ảnh base64 do localStorage đầy). Vui lòng kết nối Supabase để lưu ảnh lâu dài.');
          } catch (e2) {
            alert('❌ localStorage đầy không thể lưu dữ liệu. Vui lòng kết nối Supabase hoặc xóa bớt dữ liệu cũ.');
          }
        }
      };

      saveToLocalStorage(currentList);
      await fetchMembers();
      resetForm();
      setIsModalOpen(false);
      setSubmitting(false);
      return;
    }

    try {
      if (isEditMode && editMemberId) {
        const targetMember = members.find(m => m.id === editMemberId);
        if (targetMember) {
          if (targetMember.logoUrl && targetMember.logoUrl !== formLogoUrl) {
            deleteFileFromStorage(targetMember.logoUrl);
          }
          if (targetMember.representativeAvatarUrl && targetMember.representativeAvatarUrl !== formRepAvatarUrl) {
            deleteFileFromStorage(targetMember.representativeAvatarUrl);
          }
          if (targetMember.licenseFileUrl && targetMember.licenseFileUrl !== formLicenseFileUrl) {
            deleteFileFromStorage(targetMember.licenseFileUrl);
          }
          if (targetMember.safetyFileUrl && targetMember.safetyFileUrl !== formSafetyFileUrl) {
            deleteFileFromStorage(targetMember.safetyFileUrl);
          }
        }
        const { error } = await supabase
          .from('members')
          .update(payload)
          .eq('id', editMemberId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('members')
          .insert([{ ...payload, status: 'Pending' }]);
        if (error) throw error;
      }

      await fetchMembers();
      resetForm();
      setIsModalOpen(false);
    } catch (err) {
      alert('Lỗi lưu hội viên: ' + (err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setIsEditMode(false);
    setEditMemberId(null);
    setFormName('');
    setFormTaxCode('');
    setFormAddress('');
    setFormPhone('');
    setFormBusinessType('Phân phối & Bán lẻ');
    setFormRepName('');
    setFormRepRole('Đại diện pháp luật');
    setFormRepEmail('');
    setFormRepPhone('');
    setFormChapterId('');
    setFormAssociationRole('Hội viên chính thức');
    setFormChapterRole('');
    setFormJoinDate(new Date().toISOString().split('T')[0]);
    setFormLogoUrl('');
    setFormRepAvatarUrl('');
    setFormLicenseFileUrl('');
    setFormSafetyFileUrl('');
  };

  const handleDownload = async (fileUrl: string | undefined, fieldName: string) => {
    if (!fileUrl || fileUrl === '#' || fileUrl === '') {
      alert(`Doanh nghiệp chưa tải lên tài liệu ${fieldName}.`);
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
          const fileExtension = blob.type === 'application/pdf' ? 'pdf' : 'bin';
          const fileName = (blob as any).name || `${formName.replace(/[^a-zA-Z0-9]/g, '_')}_${fieldName}.${fileExtension}`;
          link.download = fileName;
          link.click();
          setTimeout(() => URL.revokeObjectURL(url), 100);
          return;
        }
      } catch (e) {
        console.error('IndexedDB load error:', e);
      }
    }

    window.open(fileUrl, '_blank');
  };

  const filteredMembers = members.filter(m => {
    const q = search.toLowerCase();
    const matchesSearch = m.name.toLowerCase().includes(q) ||
                          m.taxCode.includes(q) ||
                          (m.representativeName || '').toLowerCase().includes(q);
    const matchesStatus = filter === 'all' || m.status === filter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 text-xs bg-[#fcf9f5] p-6 rounded-xl border border-outline-variant/30 text-[#1c1c1a]">
      {/* Top Navigation Tabs */}
      <div className="flex border-b border-outline-variant/60 mb-6 gap-2">
        <div className="px-5 py-2.5 rounded-t-lg font-bold text-xs flex items-center gap-2 bg-[#00346f] text-white shadow-sm border border-b-transparent border-outline-variant/30 select-none">
          <span className="material-symbols-outlined text-base">group</span>
          Quản lý Hội viên (Danh sách)
        </div>
        <Link
          href="/admin/trang-hoi-vien"
          className="px-5 py-2.5 rounded-t-lg font-semibold text-xs flex items-center gap-2 text-on-surface-variant hover:bg-surface-container-low hover:text-[#00346f] transition-all border border-transparent"
        >
          <span className="material-symbols-outlined text-base">design_services</span>
          Thiết kế Giao diện &amp; Quản lý Chi hội
        </Link>
      </div>

      {/* Page Header */}
      <div className="flex justify-between items-center border-b border-outline-variant/30 pb-4">
        <div>
          <h2 className="text-lg md:text-xl font-black text-[#00346f]">Quản lý danh sách Hội viên</h2>
          <p className="text-on-surface-variant mt-1 text-[11px]">Xét duyệt và bổ nhiệm chi hội, chức vụ cho các doanh nghiệp hội viên.</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="bg-[#00346f] text-white px-4 py-2.5 rounded-lg font-bold hover:bg-[#00346f]/90 transition-all flex items-center gap-1.5"
        >
          <span className="material-symbols-outlined text-sm">person_add</span> Thêm Hội viên
        </button>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-xl border border-outline-variant/30 flex flex-col sm:flex-row gap-4 items-center justify-between shadow-sm">
        <div className="relative w-full sm:max-w-xs">
          <input
            className="w-full pl-9 pr-4 py-2 border border-outline-variant/60 rounded-lg focus:border-primary focus:ring-0 outline-none text-xs"
            placeholder="Tìm theo tên, mã số thuế..."
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <span className="material-symbols-outlined absolute left-3 top-2 text-outline text-base">search</span>
        </div>
        <div className="flex gap-2">
          {['all', 'Active', 'Pending', 'Suspended'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-colors ${
                filter === status
                  ? 'bg-[#00346f] text-white'
                  : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              {status === 'all' ? 'Tất cả' : status === 'Active' ? 'Hoạt động' : status === 'Pending' ? 'Chờ duyệt' : 'Đang khóa'}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-outline-variant/30 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-on-surface-variant font-medium">Đang tải dữ liệu hội viên...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-surface-container-low text-on-surface-variant font-bold border-b border-outline-variant/30">
                  <th className="p-4">Doanh nghiệp</th>
                  <th className="p-4">Người đại diện</th>
                  <th className="p-4">MST</th>
                  <th className="p-4">Chức vụ BCH</th>
                  <th className="p-4">Chi hội liên kết</th>
                  <th className="p-4">Chức vụ Chi hội</th>
                  <th className="p-4">Trạng thái</th>
                  <th className="p-4 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {filteredMembers.length > 0 ? (
                  filteredMembers.map((m) => {
                    const chapterObj = chapters.find(c => c.id === m.chapterId);
                    return (
                      <tr key={m.id} className="hover:bg-surface-container-lowest/40 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <TableImage src={m.logoUrl} />
                            <div>
                              <div className="font-bold text-[#00346f]">{m.name}</div>
                              <div className="text-[10px] text-on-surface-variant mt-0.5">{m.type}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="font-semibold text-[#1c1c1a]">{m.representativeName || '—'}</div>
                          <div className="text-[10px] text-on-surface-variant mt-0.5">{m.representativeRole || ''}</div>
                        </td>
                        <td className="p-4 text-on-surface-variant font-medium">{m.taxCode}</td>
                        <td className="p-4">
                          {(() => {
                            const roleColor = getRoleColor(m.associationRole, associationRoles);
                            return (
                              <span 
                                className="inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase"
                                style={{ backgroundColor: roleColor.bg, color: roleColor.text }}
                              >
                                {m.associationRole}
                              </span>
                            );
                          })()}
                        </td>
                        <td className="p-4 text-on-surface-variant font-medium">{chapterObj?.name || '-'}</td>
                        <td className="p-4 text-on-surface-variant font-medium">{m.chapterRole || '-'}</td>
                        <td className="p-4">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                              m.status === 'Active'
                                ? 'bg-green-100 text-green-700'
                                : m.status === 'Pending'
                                ? 'bg-orange-100 text-orange-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {m.status === 'Active' ? 'Hoạt động' : m.status === 'Pending' ? 'Chờ duyệt' : 'Khóa'}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2 justify-center items-center">
                            <button
                              onClick={() => handleOpenEdit(m)}
                              className="text-primary hover:text-secondary-container px-1 py-1 rounded transition-colors"
                              title="Chỉnh sửa chi tiết"
                            >
                              <span className="material-symbols-outlined text-sm">edit</span>
                            </button>
                            {m.status === 'Pending' && (
                              <button
                                onClick={() => handleStatusChange(m.id, 'Active')}
                                className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-[9px] font-bold flex items-center gap-0.5"
                              >
                                <span className="material-symbols-outlined text-[10px]">check</span> Duyệt
                              </button>
                            )}
                            {m.status === 'Active' ? (
                              <button
                                onClick={() => handleStatusChange(m.id, 'Suspended')}
                                className="border border-red-500 hover:bg-red-50 text-red-500 px-2 py-1 rounded text-[9px] font-bold flex items-center gap-0.5"
                              >
                                <span className="material-symbols-outlined text-[10px]">block</span> Khóa
                              </button>
                            ) : (
                              m.status === 'Suspended' && (
                                <button
                                  onClick={() => handleStatusChange(m.id, 'Active')}
                                  className="border border-green-500 hover:bg-green-50 text-green-500 px-2 py-1 rounded text-[9px] font-bold flex items-center gap-0.5"
                                >
                                  <span className="material-symbols-outlined text-[10px]">lock_open</span> Mở
                                </button>
                              )
                            )}
                            <button
                              onClick={() => handleDelete(m.id)}
                              className="text-on-surface-variant hover:text-red-500 px-1 py-1 rounded transition-colors"
                              title="Xóa hội viên"
                            >
                              <span className="material-symbols-outlined text-sm">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="p-12 text-center text-on-surface-variant text-sm font-medium">
                      Không tìm thấy hội viên nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl border border-outline-variant/30 shadow-2xl max-w-2xl w-full max-h-[95vh] overflow-y-auto p-6 md:p-8 flex flex-col text-xs text-[#1c1c1a]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-black text-primary flex items-center gap-2">
                <span className="material-symbols-outlined">{isEditMode ? 'edit_note' : 'person_add'}</span>
                {isEditMode ? 'Chỉnh sửa thông tin Hội viên' : 'Thêm Hội viên mới'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-surface-container flex items-center justify-center text-outline transition-colors"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <h4 className="font-bold text-[#00346f] border-b border-outline-variant/20 pb-1 uppercase tracking-wider text-[10px]">1. Thông tin doanh nghiệp</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="font-bold text-on-surface-variant">Tên doanh nghiệp *</label>
                  <input
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="h-10 border border-outline-variant rounded-lg px-4 bg-surface text-on-surface text-xs focus:border-primary focus:ring-0 outline-none"
                    placeholder="Công ty Cổ phần Gas Saigon"
                    required
                    type="text"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-bold text-on-surface-variant">Mã số thuế *</label>
                  <input
                    value={formTaxCode}
                    onChange={(e) => setFormTaxCode(e.target.value)}
                    className="h-10 border border-outline-variant rounded-lg px-4 bg-surface text-on-surface text-xs focus:border-primary focus:ring-0 outline-none"
                    placeholder="0301472589"
                    required
                    type="text"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 flex flex-col gap-2">
                  <label className="font-bold text-on-surface-variant">Địa chỉ trụ sở *</label>
                  <input
                    value={formAddress}
                    onChange={(e) => setFormAddress(e.target.value)}
                    className="h-10 border border-outline-variant rounded-lg px-4 bg-surface text-on-surface text-xs focus:border-primary focus:ring-0 outline-none"
                    placeholder="Số 456 Nguyễn Huệ, Quận 1, TP.HCM"
                    required
                    type="text"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-bold text-on-surface-variant">Lĩnh vực hoạt động</label>
                  <select
                    value={formBusinessType}
                    onChange={(e) => setFormBusinessType(e.target.value)}
                    className="h-10 border border-outline-variant rounded-lg px-4 bg-white text-on-surface text-xs focus:border-primary focus:ring-0 outline-none"
                  >
                    <option value="Sản xuất & Chiết nạp">Sản xuất & Chiết nạp</option>
                    <option value="Vận chuyển LPG">Vận chuyển LPG</option>
                    <option value="Phân phối & Bán lẻ">Phân phối & Bán lẻ</option>
                    <option value="Dịch vụ kỹ thuật">Dịch vụ kỹ thuật</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="font-bold text-on-surface-variant">Số điện thoại doanh nghiệp *</label>
                  <input
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="h-10 border border-outline-variant rounded-lg px-4 bg-surface text-on-surface text-xs focus:border-primary focus:ring-0 outline-none"
                    placeholder="028 3822 1122"
                    required
                    type="text"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-bold text-on-surface-variant">Logo doanh nghiệp (ảnh màu)</label>
                  <div className="flex items-center gap-3 bg-surface-container-low/30 p-2 rounded-lg border border-outline-variant/20">
                    <div className="w-12 h-12 rounded overflow-hidden border border-outline-variant/30 bg-white flex items-center justify-center shrink-0">
                      <PreviewImage src={formLogoUrl} />
                    </div>
                    <div className="flex-grow flex flex-col gap-1">
                      <div className="flex gap-2">
                        <input
                          value={formLogoUrl}
                          onChange={(e) => setFormLogoUrl(e.target.value)}
                          className="flex-grow h-8 border border-outline-variant rounded-lg px-3 bg-surface text-on-surface text-[10px] focus:border-primary focus:ring-0 outline-none"
                          placeholder="Dán URL hoặc tải lên..."
                          type="text"
                        />
                        <label className="h-8 px-3 bg-secondary text-white text-[10px] font-bold rounded-lg flex items-center justify-center gap-1 hover:bg-[#93000d] cursor-pointer transition-colors active:scale-95">
                          <span className="material-symbols-outlined text-[12px]">cloud_upload</span>
                          Tải lên
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleImageUploadChange(e, setFormLogoUrl)}
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <h4 className="font-bold text-[#00346f] border-b border-outline-variant/20 pb-1 uppercase tracking-wider text-[10px] pt-2">2. Người đại diện liên hệ</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="font-bold text-on-surface-variant">Họ tên người đại diện *</label>
                  <input
                    value={formRepName}
                    onChange={(e) => setFormRepName(e.target.value)}
                    className="h-10 border border-outline-variant rounded-lg px-4 bg-surface text-on-surface text-xs focus:border-primary focus:ring-0 outline-none"
                    placeholder="Nguyễn Văn A"
                    required
                    type="text"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-bold text-on-surface-variant">Chức danh trong doanh nghiệp *</label>
                  <input
                    value={formRepRole}
                    onChange={(e) => setFormRepRole(e.target.value)}
                    className="h-10 border border-outline-variant rounded-lg px-4 bg-surface text-on-surface text-xs focus:border-primary focus:ring-0 outline-none"
                    placeholder="Tổng Giám Đốc"
                    required
                    type="text"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="font-bold text-on-surface-variant">Email người đại diện *</label>
                  <input
                    value={formRepEmail}
                    onChange={(e) => setFormRepEmail(e.target.value)}
                    className="h-10 border border-outline-variant rounded-lg px-4 bg-surface text-on-surface text-xs focus:border-primary focus:ring-0 outline-none"
                    placeholder="rep@company.com"
                    required
                    type="email"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-bold text-on-surface-variant">Điện thoại di động đại diện *</label>
                  <input
                    value={formRepPhone}
                    onChange={(e) => setFormRepPhone(e.target.value)}
                    className="h-10 border border-outline-variant rounded-lg px-4 bg-surface text-on-surface text-xs focus:border-primary focus:ring-0 outline-none"
                    placeholder="0901234567"
                    required
                    type="text"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-bold text-on-surface-variant">Ảnh đại diện người đại diện (ảnh người)</label>
                  <div className="flex items-center gap-3 bg-surface-container-low/30 p-2 rounded-lg border border-outline-variant/20">
                    <div className="w-12 h-12 rounded-full overflow-hidden border border-outline-variant/30 bg-white flex items-center justify-center shrink-0">
                      <PreviewImage src={formRepAvatarUrl} isAvatar={true} />
                    </div>
                    <div className="flex-grow flex flex-col gap-1">
                      <div className="flex gap-2">
                        <input
                          value={formRepAvatarUrl}
                          onChange={(e) => setFormRepAvatarUrl(e.target.value)}
                          className="flex-grow h-8 border border-outline-variant rounded-lg px-3 bg-surface text-on-surface text-[10px] focus:border-primary focus:ring-0 outline-none"
                          placeholder="Dán URL hoặc tải lên..."
                          type="text"
                        />
                        <label className="h-8 px-3 bg-secondary text-white text-[10px] font-bold rounded-lg flex items-center justify-center gap-1 hover:bg-[#93000d] cursor-pointer transition-colors active:scale-95">
                          <span className="material-symbols-outlined text-[12px]">cloud_upload</span>
                          Tải lên
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleImageUploadChange(e, setFormRepAvatarUrl)}
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <h4 className="font-bold text-[#00346f] border-b border-outline-variant/20 pb-1 uppercase tracking-wider text-[10px] pt-2">3. Phân bổ Hiệp hội & Chi hội</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="font-bold text-on-surface-variant">Chi hội liên kết trực thuộc</label>
                  <select
                    value={formChapterId}
                    onChange={(e) => setFormChapterId(e.target.value)}
                    className="h-10 border border-outline-variant rounded-lg px-4 bg-white text-on-surface text-xs focus:border-primary focus:ring-0 outline-none"
                  >
                    <option value="">Không tham gia chi hội vùng (Hội viên tự do)</option>
                    {chapters.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <label className="font-bold text-on-surface-variant">Chức vụ trong Hiệp hội (BCH)</label>
                    <button
                      type="button"
                      onClick={handleOpenRolesEditor}
                      className="text-[10px] text-[#00346f] hover:text-[#bb0013] font-bold flex items-center gap-0.5"
                    >
                      <span className="material-symbols-outlined text-xs">settings</span>
                      Thiết lập chức vụ
                    </button>
                  </div>
                  <select
                    value={formAssociationRole}
                    onChange={(e) => setFormAssociationRole(e.target.value)}
                    className="h-10 border border-outline-variant rounded-lg px-4 bg-white text-on-surface text-xs focus:border-primary focus:ring-0 outline-none"
                  >
                    {(() => {
                      const roleNames = associationRoles.map(r => typeof r === 'object' && r !== null ? r.name : r);
                      const options = Array.from(new Set(roleNames));
                      if (formAssociationRole && !options.includes(formAssociationRole)) {
                        options.push(formAssociationRole);
                      }
                      return options.map((roleName) => (
                        <option key={roleName} value={roleName}>{roleName}</option>
                      ));
                    })()}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="font-bold text-on-surface-variant">Chức vụ trong Chi hội (nếu có)</label>
                  <input
                    value={formChapterRole}
                    onChange={(e) => setFormChapterRole(e.target.value)}
                    className="h-10 border border-outline-variant rounded-lg px-4 bg-surface text-on-surface text-xs focus:border-primary focus:ring-0 outline-none"
                    placeholder="e.g. Chi hội trưởng, Phó chi hội"
                    type="text"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-bold text-on-surface-variant">Ngày tham gia Hiệp hội *</label>
                  <input
                    value={formJoinDate}
                    onChange={(e) => setFormJoinDate(e.target.value)}
                    className="h-10 border border-outline-variant rounded-lg px-4 bg-surface text-on-surface text-xs focus:border-primary focus:ring-0 outline-none"
                    type="date"
                    required
                  />
                </div>
              </div>

              <h4 className="font-bold text-[#00346f] border-b border-outline-variant/20 pb-1 uppercase tracking-wider text-[10px] pt-2">4. Hồ sơ pháp lý đính kèm</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2 bg-surface-container-low/30 p-3 rounded-lg border border-outline-variant/20">
                  <span className="font-bold text-on-surface-variant">Giấy phép đăng ký kinh doanh</span>
                  {formLicenseFileUrl ? (
                    <button
                      type="button"
                      onClick={() => handleDownload(formLicenseFileUrl, 'Giay_Phep_DKKD')}
                      className="mt-1 h-9 px-4 bg-[#00346f] text-white text-[10px] font-bold rounded-lg flex items-center justify-center gap-1.5 hover:bg-[#bb0013] transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-sm">download</span> Tải Giấy phép DKKD
                    </button>
                  ) : (
                    <span className="text-[10px] text-outline italic mt-2">Chưa đính kèm tài liệu</span>
                  )}
                </div>
                <div className="flex flex-col gap-2 bg-surface-container-low/30 p-3 rounded-lg border border-outline-variant/20">
                  <span className="font-bold text-on-surface-variant">Chứng chỉ an toàn LPG</span>
                  {formSafetyFileUrl ? (
                    <button
                      type="button"
                      onClick={() => handleDownload(formSafetyFileUrl, 'Chung_Chi_An_Toan')}
                      className="mt-1 h-9 px-4 bg-[#00346f] text-white text-[10px] font-bold rounded-lg flex items-center justify-center gap-1.5 hover:bg-[#bb0013] transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-sm">download</span> Tải Chứng chỉ an toàn
                    </button>
                  ) : (
                    <span className="text-[10px] text-outline italic mt-2">Chưa đính kèm tài liệu</span>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-outline-variant/30">
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
                  className="px-6 py-2.5 rounded-lg bg-[#00346f] text-white font-bold hover:bg-[#00346f]/90 transition-all flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <span className="animate-spin inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full"></span>
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-sm">{isEditMode ? 'save' : 'person_add'}</span>
                      {isEditMode ? 'Lưu thay đổi' : 'Tạo hội viên'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isRolesEditorOpen && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl border border-outline-variant/30 shadow-2xl max-w-md w-full p-6 flex flex-col text-xs text-[#1c1c1a] space-y-4">
            <div className="flex justify-between items-center border-b border-outline-variant/20 pb-3">
              <h3 className="text-sm font-black text-[#00346f] flex items-center gap-1.5">
                <span className="material-symbols-outlined">badge</span>
                Thiết lập Chức vụ Hiệp hội
              </h3>
              <button
                type="button"
                onClick={() => setIsRolesEditorOpen(false)}
                className="w-7 h-7 rounded-full hover:bg-surface-container flex items-center justify-center text-outline transition-colors"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>

            <div className="max-h-[50vh] overflow-y-auto space-y-2 pr-1 no-scrollbar">
              {editingRolesList.map((role, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-surface-container-low/20 p-2 rounded-lg border border-outline-variant/10">
                  <input
                    type="text"
                    value={role.name}
                    onChange={(e) => handleRoleNameChangeInEditor(idx, e.target.value)}
                    className="flex-grow h-8 border border-outline-variant rounded px-2 bg-white text-xs font-semibold focus:border-primary outline-none min-w-[100px]"
                    placeholder="Tên chức vụ..."
                  />
                  
                  {/* Background Color Picker */}
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-[10px] text-on-surface-variant font-bold">Nền</span>
                    <div className="relative w-7 h-7 rounded border border-outline-variant/60 bg-white flex items-center justify-center cursor-pointer overflow-hidden">
                      <input
                        type="color"
                        value={role.color}
                        onChange={(e) => handleRoleColorChangeInEditor(idx, e.target.value)}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full scale-150"
                      />
                      <div 
                        className="w-4 h-4 rounded-full border border-outline-variant/20 shadow-sm"
                        style={{ backgroundColor: role.color }}
                      />
                    </div>
                  </div>

                  {/* Text Color Picker */}
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-[10px] text-on-surface-variant font-bold">Chữ</span>
                    <div className="relative w-7 h-7 rounded border border-outline-variant/60 bg-white flex items-center justify-center cursor-pointer overflow-hidden">
                      <input
                        type="color"
                        value={role.textColor || '#ffffff'}
                        onChange={(e) => handleRoleTextColorChangeInEditor(idx, e.target.value)}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full scale-150"
                      />
                      <div 
                        className="w-4 h-4 rounded-full border border-outline-variant/20 shadow-sm flex items-center justify-center font-black text-[9px]"
                        style={{ backgroundColor: role.color, color: role.textColor || '#ffffff' }}
                      >
                        A
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveRoleInEditor(idx)}
                    className="w-7 h-7 rounded border border-red-200 hover:bg-red-50 text-red-500 flex items-center justify-center transition-colors shrink-0"
                    title="Xóa chức danh này"
                  >
                    <span className="material-symbols-outlined text-sm">delete</span>
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={handleAddRoleInEditor}
              className="w-full h-8 border-2 border-dashed border-outline-variant hover:border-[#00346f] hover:text-[#00346f] text-on-surface-variant font-bold rounded-lg flex items-center justify-center gap-1 transition-all"
            >
              <span className="material-symbols-outlined text-xs">add</span> Thêm chức danh mới
            </button>

            <div className="flex justify-end gap-2 pt-3 border-t border-outline-variant/20">
              <button
                type="button"
                onClick={() => setIsRolesEditorOpen(false)}
                className="h-9 px-4 rounded-lg border border-outline-variant font-bold hover:bg-surface-container transition-colors"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSaveRolesInEditor}
                className="h-9 px-5 rounded-lg bg-[#bb0013] text-white font-bold hover:bg-[#bb0013]/90 transition-all active:scale-95 shadow-sm"
              >
                Lưu cấu hình
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
