'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import defaultCommitteeBanChapHanh from '@/lib/defaultCommitteeBanChapHanh.json';
import defaultCommitteeBanThuongVu from '@/lib/defaultCommitteeBanThuongVu.json';
import defaultCommitteeBanKiemTra from '@/lib/defaultCommitteeBanKiemTra.json';

const DEFAULT_COMMITTEES = {
  'ban-chap-hanh': defaultCommitteeBanChapHanh,
  'ban-thuong-vu': defaultCommitteeBanThuongVu,
  'ban-kiem-tra': defaultCommitteeBanKiemTra
};

const formatDate = (date: any): string => {
  if (!date) return '';
  try {
    if (date instanceof Date) {
      return date.toISOString().split('T')[0];
    }
    if (typeof date === 'object' && typeof date.toISOString === 'function') {
      return date.toISOString().split('T')[0];
    }
    return String(date).split('T')[0];
  } catch (e) {
    return '';
  }
};

interface LeaderMember {
  name: string;
  role: string;
  company: string;
  avatarUrl?: string;
  isVerified?: boolean;
  memberId?: string;
}

interface Member {
  id: string;
  company_name: string;
  tax_code: string;
  address: string;
  phone: string;
  email: string;
  business_type: string;
  representative_name: string;
  representative_role: string;
  representative_email: string;
  representative_phone: string;
  status: string;
  created_at: string;
  chapter_id?: string;
  chapter_name?: string;
  association_role: string;
  chapter_role?: string;
  join_date: string;
  logo_url?: string;
  representative_avatar_url?: string;
}

interface CommitteeConfig {
  term: string;
  title: string;
  subtitle: string;
  chairman: LeaderMember;
  viceChairmen: LeaderMember[];
  members: LeaderMember[];
  chairmanSectionTitle?: string;
  viceChairmanSectionTitle?: string;
  memberSectionTitle?: string;
  showChairman?: boolean;
  showViceChairmen?: boolean;
  showMembers?: boolean;
}

interface CommitteeViewProps {
  type: 'ban-chap-hanh' | 'ban-kiem-tra' | 'ban-thuong-vu';
  initialConfig?: CommitteeConfig;
  initialMembers?: any[];
  initialChapters?: any[];
}

const getDefaultTitle = (section: 'chairman' | 'viceChairman' | 'member', type: 'ban-chap-hanh' | 'ban-kiem-tra' | 'ban-thuong-vu') => {
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

export default function CommitteeView({
  type,
  initialConfig,
  initialMembers,
  initialChapters
}: CommitteeViewProps) {
  const [loading, setLoading] = useState(!initialConfig);
  const [config, setConfig] = useState<CommitteeConfig | null>(initialConfig || DEFAULT_COMMITTEES[type] as any);

  const resolveInitialMembers = () => {
    if (!initialMembers) return [];
    const chaptersMap: Record<string, string> = {};
    if (initialChapters) {
      initialChapters.forEach((c: any) => {
        chaptersMap[c.id] = c.name;
      });
    }
    return initialMembers.map((d: any) => ({
      id: d.id,
      company_name: d.company_name,
      tax_code: d.tax_code,
      address: d.address,
      phone: d.phone,
      email: d.email,
      business_type: d.business_type,
      representative_name: d.representative_name,
      representative_role: d.representative_role,
      representative_email: d.representative_email,
      representative_phone: d.representative_phone,
      status: d.status,
      created_at: d.created_at,
      chapter_id: d.chapter_id,
      chapter_name: d.chapter_id ? (chaptersMap[d.chapter_id] || 'Chi hội liên kết') : undefined,
      association_role: d.association_role || 'Hội viên chính thức',
      chapter_role: d.chapter_role,
      join_date: formatDate(d.join_date || d.created_at),
      logo_url: d.logo_url || d.license_file_url,
      representative_avatar_url: d.representative_avatar_url || ''
    }));
  };

  const [activeMembers, setActiveMembers] = useState<Member[]>(resolveInitialMembers());
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  useEffect(() => {
    if (initialMembers && initialChapters) {
      setActiveMembers(resolveInitialMembers());
      return;
    }

    async function loadMembersData() {
      let chaptersMap: Record<string, string> = {};
      if (supabase) {
        try {
          const { data: chaptersData } = await supabase
            .from('chapters')
            .select('*');
          if (chaptersData) {
            chaptersData.forEach((c: any) => {
              chaptersMap[c.id] = c.name;
            });
          }
        } catch (e) {
          console.error('Error fetching chapters in CommitteeView:', e);
        }
      }

      if (supabase) {
        try {
          const { data: membersData, error: memError } = await supabase
            .from('members')
            .select('*')
            .eq('status', 'Active');
          
          if (!memError && membersData && membersData.length > 0) {
            const mappedList: Member[] = membersData.map((d: any) => {
              return {
                id: d.id,
                company_name: d.company_name,
                tax_code: d.tax_code,
                address: d.address,
                phone: d.phone,
                email: d.email,
                business_type: d.business_type,
                representative_name: d.representative_name,
                representative_role: d.representative_role,
                representative_email: d.representative_email,
                representative_phone: d.representative_phone,
                status: d.status,
                created_at: d.created_at,
                chapter_id: d.chapter_id,
                chapter_name: d.chapter_id ? (chaptersMap[d.chapter_id] || 'Chi hội liên kết') : undefined,
                association_role: d.association_role || 'Hội viên chính thức',
                chapter_role: d.chapter_role,
                join_date: formatDate(d.join_date || d.created_at),
                logo_url: d.logo_url || d.license_file_url,
                representative_avatar_url: d.representative_avatar_url || ''
              };
            });
            setActiveMembers(mappedList);
          }
        } catch (e) {
          console.error('Error loading members from Supabase in CommitteeView:', e);
        }
      } else {
        const saved = localStorage.getItem('hoba_website_members');
        if (saved) {
          try {
            const data = JSON.parse(saved);
            const activeData = data.filter((d: any) => d.status === 'Active');
            const mappedList: Member[] = activeData.map((d: any) => {
              return {
                id: d.id,
                company_name: d.company_name,
                tax_code: d.tax_code,
                address: d.address,
                phone: d.phone,
                email: d.email,
                business_type: d.business_type,
                representative_name: d.representative_name,
                representative_role: d.representative_role,
                representative_email: d.representative_email,
                representative_phone: d.representative_phone,
                status: d.status,
                created_at: d.created_at || new Date().toISOString(),
                chapter_id: d.chapter_id || undefined,
                chapter_name: d.chapter_id ? (chaptersMap[d.chapter_id] || 'Chi hội liên kết') : undefined,
                association_role: d.association_role || 'Hội viên chính thức',
                chapter_role: d.chapter_role || undefined,
                join_date: formatDate(d.join_date || d.created_at || new Date()),
                logo_url: d.logo_url || d.license_file_url || undefined,
                representative_avatar_url: d.representative_avatar_url || ''
              };
            });
            setActiveMembers(mappedList);
          } catch (e) {
            console.error('Error parsing members from localStorage in CommitteeView:', e);
          }
        }
      }
    }
    loadMembersData();
  }, [initialMembers, initialChapters]);

  const handleShowMemberDetail = async (memberId?: string) => {
    if (!memberId) return;
    
    const found = activeMembers.find(m => m.id === memberId);
    if (found) {
      setSelectedMember(found);
      return;
    }

    if (supabase) {
      try {
        const { data: memberData } = await supabase
          .from('members')
          .select('*')
          .eq('id', memberId)
          .single();
        
        if (memberData) {
          let chapterName = 'Chi hội liên kết';
          if (memberData.chapter_id) {
            const { data: chapterData } = await supabase
              .from('chapters')
              .select('name')
              .eq('id', memberData.chapter_id)
              .single();
            if (chapterData) {
              chapterName = chapterData.name;
            }
          }

          const resolvedMember: Member = {
            id: memberData.id,
            company_name: memberData.company_name,
            tax_code: memberData.tax_code,
            address: memberData.address,
            phone: memberData.phone,
            email: memberData.email,
            business_type: memberData.business_type,
            representative_name: memberData.representative_name,
            representative_role: memberData.representative_role,
            representative_email: memberData.representative_email,
            representative_phone: memberData.representative_phone,
            status: memberData.status,
            created_at: memberData.created_at,
            chapter_id: memberData.chapter_id,
            chapter_name: chapterName,
            association_role: memberData.association_role || 'Hội viên chính thức',
            chapter_role: memberData.chapter_role,
            join_date: formatDate(memberData.join_date || memberData.created_at),
            logo_url: memberData.logo_url || memberData.license_file_url,
            representative_avatar_url: memberData.representative_avatar_url || ''
          };
          setSelectedMember(resolvedMember);
          return;
        }
      } catch (e) {
        console.error('Error fetching single member details:', e);
      }
    }

    const saved = localStorage.getItem('hoba_website_members');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        const memberData = data.find((d: any) => d.id === memberId);
        if (memberData) {
          const resolvedMember: Member = {
            id: memberData.id,
            company_name: memberData.company_name,
            tax_code: memberData.tax_code,
            address: memberData.address,
            phone: memberData.phone,
            email: memberData.email,
            business_type: memberData.business_type,
            representative_name: memberData.representative_name,
            representative_role: memberData.representative_role,
            representative_email: memberData.representative_email,
            representative_phone: memberData.representative_phone,
            status: memberData.status,
            created_at: memberData.created_at || new Date().toISOString(),
            chapter_id: memberData.chapter_id || undefined,
            chapter_name: memberData.chapter_id ? 'Chi hội liên kết' : undefined,
            association_role: memberData.association_role || 'Hội viên chính thức',
            chapter_role: memberData.chapter_role || undefined,
            join_date: formatDate(memberData.join_date || memberData.created_at || new Date()),
            logo_url: memberData.logo_url || memberData.license_file_url || undefined,
            representative_avatar_url: memberData.representative_avatar_url || ''
          };
          setSelectedMember(resolvedMember);
        }
      } catch (e) {
        console.error('Error parsing member from localStorage fallback:', e);
      }
    }
  };

  const getBreadcrumbTitle = () => {
    switch (type) {
      case 'ban-chap-hanh':
        return 'Ban Chấp hành';
      case 'ban-kiem-tra':
        return 'Ban Kiểm tra';
      case 'ban-thuong-vu':
        return 'Ban Thường vụ';
    }
  };

  useEffect(() => {
    if (initialConfig) {
      setConfig(initialConfig);
      setLoading(false);
      return;
    }

    async function loadCommitteeData() {
      const storageKey = `hoba_website_committee_${type}`;
      let dataVal: any = null;

      const saved = typeof window !== 'undefined' ? localStorage.getItem(storageKey) : null;
      if (saved) {
        try {
          dataVal = JSON.parse(saved);
        } catch (e) {
          console.error('Error parsing committee config from localStorage:', e);
        }
      }

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
          console.error('Error fetching committee config from Supabase:', err);
        }
      }

      if (dataVal) {
        setConfig(dataVal);
      }
      setLoading(false);
    }

    loadCommitteeData();
  }, [type, initialConfig]);

  if (loading) {
    return (
      <div className="flex-grow flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <span className="material-symbols-outlined text-4xl text-primary animate-spin">sync</span>
          <span className="text-xs text-on-surface-variant font-medium">Đang tải dữ liệu...</span>
        </div>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="flex-grow flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <span className="material-symbols-outlined text-5xl text-error">error_outline</span>
          <h2 className="text-lg font-bold text-primary">Không tìm thấy dữ liệu cấu hình</h2>
          <p className="text-xs text-on-surface-variant max-w-sm mx-auto">
            Vui lòng cấu hình trang này trong trang quản trị Admin hoặc kiểm tra lại seeder dữ liệu.
          </p>
          <Link href="/" className="inline-block bg-primary text-white text-xs font-bold px-5 py-2.5 rounded-lg">
            Quay lại trang chủ
          </Link>
        </div>
      </div>
    );
  }

  const defaultAvatar = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=256';

  // Build the effective members list for the table:
  // If chairman or vice-chairmen sections are hidden, merge them into the members table
  const effectiveMembers = (() => {
    const list: typeof config.members = [...(config.members || [])];

    // If vice-chairmen block is hidden, prepend all vice-chairmen to members list
    if (config.showViceChairmen === false && config.viceChairmen && config.viceChairmen.length > 0) {
      const vcs = config.viceChairmen.map(vc => ({ ...vc }));
      list.unshift(...vcs);
    }

    // If chairman block is hidden, prepend chairman at the very top
    if (config.showChairman === false && config.chairman && config.chairman.name) {
      list.unshift({ ...config.chairman });
    }

    return list;
  })();

  return (
    <div className="flex flex-col w-full overflow-x-hidden pb-16">
      {/* Hero Section */}
      <section className="relative bg-primary py-12 md:py-20 text-white overflow-hidden bg-[radial-gradient(rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:20px_20px]">
        <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/95 to-primary-container/80 z-0"></div>
        
        <div className="relative z-10 max-w-container-max mx-auto px-margin-mobile md:px-gutter w-full">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-xs mb-6 opacity-80 font-medium">
            <Link href="/" className="hover:underline transition-colors">Trang chủ</Link>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="opacity-75">Ban lãnh đạo</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="font-semibold text-secondary-fixed">{getBreadcrumbTitle()}</span>
          </div>

          {/* Term Badge */}
          {config.term && (
            <span className="inline-block text-[10px] tracking-[0.2em] font-extrabold text-on-tertiary-container bg-tertiary-container/30 px-3.5 py-1.5 rounded-full border border-tertiary-container/30 uppercase mb-4 shadow-sm">
              {config.term}
            </span>
          )}

          {/* Title & Subtitle */}
          <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-4 max-w-4xl text-white">
            {config.title}
          </h1>
          {config.subtitle && (
            <p className="text-sm md:text-base max-w-2xl text-on-primary-container leading-relaxed font-medium opacity-90">
              {config.subtitle}
            </p>
          )}
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-container-max mx-auto px-margin-mobile md:px-gutter w-full mt-12 md:mt-16 space-y-16">
        
        {/* Chairman (Chủ tịch / Trưởng ban) Card */}
        {config.showChairman !== false && config.chairman && config.chairman.name && (
          <div className="space-y-6">
            <h2 className="text-xl md:text-2xl font-black text-primary border-l-4 border-secondary pl-3 uppercase tracking-wide">
              {config.chairmanSectionTitle || getDefaultTitle('chairman', type)}
            </h2>
            <div className="max-w-3xl bg-white border border-outline-variant/30 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.02)] overflow-hidden flex flex-col md:flex-row items-center md:items-stretch group hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all duration-300">
              
              {/* Avatar Column */}
              <div className="w-full md:w-72 relative min-h-[300px] md:min-h-auto overflow-hidden bg-surface-container-low flex-shrink-0">
                <img
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  alt={config.chairman.name}
                  src={config.chairman.avatarUrl || defaultAvatar}
                />
              </div>

              {/* Info Column */}
              <div className="p-8 flex flex-col justify-center flex-grow text-left space-y-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl md:text-2xl font-extrabold text-primary tracking-tight">
                      {config.chairman.name}
                    </h3>
                    {config.chairman.isVerified !== false && (
                      <span className="material-symbols-outlined text-blue-500 fill-icon text-2xl select-none" title="Đã xác thực">
                        verified
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-bold text-secondary uppercase tracking-wider">
                    {config.chairman.role || 'Chủ tịch'}
                  </p>
                </div>
                
                <div className="w-12 h-1 bg-surface-variant rounded"></div>

                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase block tracking-wider">Đơn vị công tác</span>
                  {config.chairman.memberId ? (
                    <button
                      onClick={() => handleShowMemberDetail(config.chairman.memberId)}
                      className="text-sm font-semibold text-secondary hover:text-primary hover:underline leading-relaxed block text-left"
                    >
                      {config.chairman.company}
                    </button>
                  ) : (
                    <p className="text-sm font-semibold text-on-surface leading-relaxed">
                      {config.chairman.company}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Vice-Chairmen (Phó chủ tịch / Phó ban) Grid */}
        {config.showViceChairmen !== false && config.viceChairmen && config.viceChairmen.length > 0 && (
          <div className="space-y-6 pt-4">
            <h2 className="text-xl md:text-2xl font-black text-primary border-l-4 border-secondary pl-3 uppercase tracking-wide">
              {config.viceChairmanSectionTitle || getDefaultTitle('viceChairman', type)}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {config.viceChairmen.map((vc, idx) => (
                <div 
                  key={idx} 
                  className="bg-white border border-outline-variant/30 rounded-xl overflow-hidden shadow-sm flex flex-col group hover:shadow-md hover:border-primary/20 transition-all duration-300"
                >
                  {/* Portrait Area */}
                  <div className="aspect-[4/5] relative bg-surface-container-low overflow-hidden">
                    <img
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      alt={vc.name}
                      src={vc.avatarUrl || defaultAvatar}
                    />
                  </div>

                  {/* Info Area */}
                  <div className="p-5 flex flex-col flex-grow justify-between space-y-4">
                    <div className="space-y-1">
                      <h4 className="font-extrabold text-base text-primary leading-tight group-hover:text-secondary transition-colors">
                        {vc.name}
                      </h4>
                      <p className="text-xs font-bold text-secondary uppercase tracking-wider">
                        {vc.role || 'Phó Chủ tịch'}
                      </p>
                    </div>

                    <div className="space-y-1 border-t border-outline-variant/20 pt-3">
                      <span className="text-[9px] font-bold text-on-surface-variant uppercase block tracking-widest">Đơn vị công tác</span>
                      {vc.memberId ? (
                        <button
                          onClick={() => handleShowMemberDetail(vc.memberId)}
                          className="text-[11px] font-semibold text-secondary hover:text-primary hover:underline leading-normal line-clamp-3 block font-sans text-left"
                        >
                          {vc.company}
                        </button>
                      ) : (
                        <p className="text-[11px] font-semibold text-on-surface leading-normal line-clamp-3">
                          {vc.company}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Committee Members (Ủy viên) Table */}
        {config.showMembers !== false && effectiveMembers.length > 0 && (
          <div className="space-y-6 pt-4">
            <h2 className="text-xl md:text-2xl font-black text-primary border-l-4 border-secondary pl-3 uppercase tracking-wide">
              {config.memberSectionTitle || getDefaultTitle('member', type)}
            </h2>
            
            {/* Desktop View Table */}
            <div className="hidden md:block bg-white border border-outline-variant/30 rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-primary text-white border-b border-outline-variant/20">
                      <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider w-16 text-center">STT</th>
                      <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider">Họ và tên</th>
                      <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider">Chức vụ tại Hiệp hội</th>
                      <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider">Đơn vị công tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/20 text-xs">
                    {effectiveMembers.map((member, idx) => (
                      <tr 
                        key={idx} 
                        className="hover:bg-surface-container-low transition-colors duration-200 odd:bg-white even:bg-surface-container-lowest"
                      >
                        <td className="py-4 px-6 font-bold text-on-surface-variant text-center">{idx + 1}</td>
                        <td className="py-4 px-6 font-extrabold text-primary text-sm">{member.name}</td>
                        <td className="py-4 px-6 font-bold text-secondary">{member.role || 'Ủy viên'}</td>
                        <td className="py-4 px-6 font-semibold text-on-surface">
                          {member.memberId ? (
                            <button
                              onClick={() => handleShowMemberDetail(member.memberId)}
                              className="text-secondary hover:text-primary hover:underline font-semibold text-left"
                            >
                              {member.company}
                            </button>
                          ) : (
                            member.company
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile View List */}
            <div className="block md:hidden bg-white border border-outline-variant/30 rounded-xl shadow-sm overflow-hidden divide-y divide-outline-variant/20">
              {effectiveMembers.map((member, idx) => (
                <div 
                  key={idx} 
                  className="flex items-center gap-3 p-4 hover:bg-surface-container-low transition-colors duration-200 odd:bg-white even:bg-surface-container-lowest"
                >
                  {/* STT Badge */}
                  <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0 font-sans">
                    {idx + 1}
                  </div>
                  {/* Member Details */}
                  <div className="flex-grow min-w-0 text-left space-y-1">
                    {/* Name (1 row, truncate) */}
                    <div className="font-extrabold text-primary text-sm truncate" title={member.name}>
                      {member.name}
                    </div>
                    {/* Role (1 row, truncate) */}
                    <div className="font-bold text-secondary text-xs truncate" title={member.role || 'Ủy viên'}>
                      {member.role || 'Ủy viên'}
                    </div>
                    {/* Company (1 row, truncate) */}
                    <div className="font-semibold text-on-surface text-xs truncate" title={member.company}>
                      {member.memberId ? (
                        <button
                          onClick={() => handleShowMemberDetail(member.memberId)}
                          className="text-secondary hover:text-primary hover:underline font-semibold text-left truncate block w-full"
                        >
                          {member.company}
                        </button>
                      ) : (
                        member.company
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </section>

      {/* Member Details Modal */}
      {selectedMember && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl border border-outline-variant/30 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 flex flex-col text-xs text-[#1c1c1a]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-black text-[#00346f] uppercase tracking-wide">Thông tin chi tiết Hội viên</h3>
              <button
                onClick={() => setSelectedMember(null)}
                className="w-8 h-8 rounded-full hover:bg-surface-container flex items-center justify-center text-outline transition-colors"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <div className="space-y-6">
              {/* Basic Info Header */}
              <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-outline-variant/30">
                <div className="w-24 h-24 border border-outline-variant/60 rounded-lg flex items-center justify-center bg-white p-3 shrink-0">
                  <img
                    alt={selectedMember.company_name}
                    className="max-h-full max-w-full object-contain"
                    src={selectedMember.logo_url || 'https://lh3.googleusercontent.com/aida-public/AB6AXuBer5UmMRZAfoqcbQdDj2YlNi-He_BCVlNf4MgqxLxNKyZhxs2rlXnTNAqZbaOiTeyYlL1dKFi1854zNIHtNCJ8NS1MBXIakzRkGoKnJ59PX-0GsHP55Ri6sRjzQsXO2dIJnVzIye1cxWosv32otDlO2WjVzzPiZYwCg1VZr-P6fXh0Pyct1ti4yt_rYCByE5K-BrVK8F49XzS9PTCmIby_i9yBXXhfu3YST4hjjv-5pa86OAaD9cRPlLwHbGb9RlGHs3XTrUWzulE'}
                  />
                </div>
                <div className="text-center sm:text-left space-y-2">
                  <h4 className="text-base font-black text-[#00346f] leading-snug">{selectedMember.company_name}</h4>
                  <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                    <span className="bg-red-50 text-[#bb0013] px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                      {selectedMember.business_type}
                    </span>
                    <span className="bg-[#d7e2ff] text-[#001b3f] px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                      {selectedMember.association_role}
                    </span>
                  </div>
                </div>
              </div>

              {/* Grid content */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Doanh nghiệp */}
                <div className="space-y-3 bg-[#fcf9f5] p-4 border border-outline-variant/30 rounded-lg">
                  <h5 className="font-bold text-[#00346f] border-b border-outline-variant/40 pb-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">domain</span> Thông tin doanh nghiệp
                  </h5>
                  <div className="space-y-2 text-[11px]">
                    <div><span className="text-on-surface-variant font-semibold">Mã số thuế:</span> {selectedMember.tax_code}</div>
                    <div><span className="text-on-surface-variant font-semibold">Địa chỉ:</span> {selectedMember.address}</div>
                    <div><span className="text-on-surface-variant font-semibold">Điện thoại:</span> {selectedMember.phone}</div>
                    <div><span className="text-on-surface-variant font-semibold">Email:</span> {selectedMember.email}</div>
                  </div>
                </div>

                {/* Người đại diện */}
                <div className="space-y-3 bg-[#fcf9f5] p-4 border border-outline-variant/30 rounded-lg">
                  <h5 className="font-bold text-[#00346f] border-b border-outline-variant/40 pb-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">person</span> Người đại diện liên hệ
                  </h5>
                  <div className="flex gap-4 items-start pt-1">
                    {selectedMember.representative_avatar_url && (
                      <div className="w-16 h-16 rounded-full overflow-hidden border border-outline-variant/40 bg-white shrink-0">
                        <img 
                          src={selectedMember.representative_avatar_url} 
                          alt="Representative" 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                    <div className="space-y-2 text-[11px] flex-grow">
                      <div><span className="text-on-surface-variant font-semibold">Họ tên:</span> {selectedMember.representative_name}</div>
                      <div><span className="text-on-surface-variant font-semibold">Chức danh:</span> {selectedMember.representative_role}</div>
                      <div><span className="text-on-surface-variant font-semibold">Điện thoại liên hệ:</span> {selectedMember.representative_phone}</div>
                      <div><span className="text-on-surface-variant font-semibold">Email cá nhân:</span> {selectedMember.representative_email}</div>
                    </div>
                  </div>
                </div>

                {/* Chi hội */}
                <div className="col-span-full space-y-3 bg-[#fcf9f5] p-4 border border-outline-variant/30 rounded-lg">
                  <h5 className="font-bold text-[#00346f] border-b border-outline-variant/40 pb-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">hub</span> Liên kết Hiệp hội
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[11px] pt-1">
                    <div><span className="text-on-surface-variant font-semibold block mb-0.5">Ngày gia nhập Hiệp hội</span> {selectedMember.join_date}</div>
                    <div><span className="text-on-surface-variant font-semibold block mb-0.5">Chức vụ Hiệp hội</span> {selectedMember.association_role}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-outline-variant/30 flex justify-end">
              <button
                onClick={() => setSelectedMember(null)}
                className="bg-[#00346f] hover:bg-[#00346f]/90 text-white font-bold px-6 py-2.5 rounded-lg text-xs"
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
