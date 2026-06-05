'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface Chapter {
  id: string;
  name: string;
  region: string;
  locations: string;
  memberCount: number;
  image_url: string;
  slogan?: string;
  description?: string;
}

interface Leader {
  id?: string;
  chapter_id: string;
  name: string;
  role?: string;
  position?: string;
  company?: string;
  avatarUrl?: string;
  avatar_url?: string;
  order?: number;
  order_index?: number;
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
  association_role: string;
  chapter_role?: string;
  join_date: string;
  logo_url?: string;
  representative_avatar_url?: string;
  chapter_id?: string;
}

function ChapterDetailPageContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  useEffect(() => {
    if (!id) return;

    async function loadData() {
      setLoading(true);

      if (supabase) {
        try {
          const { data: chapterData } = await supabase
            .from('chapters')
            .select('*')
            .eq('id', id)
            .single();

          if (chapterData) {
            setChapter({
              id: chapterData.id,
              name: chapterData.name,
              region: chapterData.region,
              locations: chapterData.locations || '',
              memberCount: 0,
              image_url: chapterData.image_url || '',
              slogan: chapterData.slogan,
              description: chapterData.description,
            });
          }
        } catch (e) {}

        try {
          const { data: leadersData } = await supabase
            .from('chapter_leadership')
            .select('*')
            .eq('chapter_id', id)
            .order('order_index', { ascending: true });

          if (leadersData) {
            setLeaders(leadersData.map((l: any) => ({
              ...l,
              role: l.role || l.position || '',
              order: l.order ?? l.order_index ?? 0,
              avatarUrl: l.avatarUrl || l.avatar_url || '',
            })));
          }
        } catch (e) {}

        try {
          const { data: membersData } = await supabase
            .from('members')
            .select('*')
            .eq('chapter_id', id)
            .eq('status', 'Active');

          if (membersData) {
            setMembers(
              membersData.map((d: any) => ({
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
                association_role: d.association_role || 'Hội viên chính thức',
                chapter_role: d.chapter_role,
                join_date: d.join_date ? d.join_date.split('T')[0] : d.created_at?.split('T')[0],
                logo_url: d.logo_url || d.license_file_url,
                representative_avatar_url: d.representative_avatar_url || '',
                chapter_id: d.chapter_id,
              }))
            );
          }
        } catch (e) {}
      } else {
        const savedChaps = localStorage.getItem('hoba_chapters_list');
        if (savedChaps) {
          try {
            const allChaps: Chapter[] = JSON.parse(savedChaps);
            const found = allChaps.find(c => c.id === id);
            if (found) setChapter(found);
          } catch (e) {}
        }

        const savedLeaders = localStorage.getItem('hoba_chapter_leaders_list');
        if (savedLeaders) {
          try {
            const allLeaders: any[] = JSON.parse(savedLeaders);
            const chLeaders = allLeaders.filter(l => l.chapter_id === id);
            setLeaders(chLeaders.map(l => ({
              ...l,
              role: l.role || l.position || '',
              order: l.order ?? l.order_index ?? 0,
              avatarUrl: l.avatarUrl || l.avatar_url || '',
              company: l.company || '',
            })).sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));
          } catch (e) {}
        }

        const savedMembers = localStorage.getItem('hoba_website_members');
        if (savedMembers) {
          try {
            const allMembers: any[] = JSON.parse(savedMembers);
            const chMembers = allMembers.filter(m => m.chapter_id === id && m.status === 'Active');
            setMembers(
              chMembers.map((d: any) => ({
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
                association_role: d.association_role || 'Hội viên chính thức',
                chapter_role: d.chapter_role,
                join_date: d.join_date ? d.join_date.split('T')[0] : d.created_at?.split('T')[0] || '',
                logo_url: d.logo_url || d.license_file_url,
                representative_avatar_url: d.representative_avatar_url || '',
                chapter_id: d.chapter_id,
              }))
            );
          } catch (e) {}
        }
      }

      setLoading(false);
    }

    loadData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fcf9f5] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <span className="animate-spin inline-block w-10 h-10 border-4 border-[#00346f] border-t-transparent rounded-full"></span>
          <span className="text-sm text-on-surface-variant font-medium">Đang tải dữ liệu chi hội...</span>
        </div>
      </div>
    );
  }

  if (!chapter) {
    return (
      <div className="min-h-screen bg-[#fcf9f5] flex items-center justify-center">
        <div className="text-center space-y-4 p-8">
          <span className="material-symbols-outlined text-5xl text-outline">hub</span>
          <h1 className="text-xl font-black text-[#00346f]">Không tìm thấy Chi hội</h1>
          <p className="text-sm text-on-surface-variant">Chi hội này không tồn tại hoặc đã bị xóa.</p>
          <Link
            href="/chi-hoi"
            className="inline-flex items-center gap-2 bg-[#00346f] text-white px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-[#00346f]/90 transition-colors"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Quay lại danh sách Chi hội
          </Link>
        </div>
      </div>
    );
  }

  const defaultImage = 'https://lh3.googleusercontent.com/aida-public/AB6AXuBTP1VwRhiXz7IslKk8lyrl_NZjrM0MYtWMLyaBrXhEX2DRZ9wIHjlle-92NsUhnYmQwD4yTguPqimc2ewjOD30dygdkHwHt7s9NXsMPSnzWvTyHO_1lM5j2kM_9BcFoN9m67VEakH0ReGkHCz2mX7R0kfbHFSyqSNrqYFcUsBMK0sm4skbO_7LO2Qs237Mbc_zUrwOxQ0lEHdDE-3w74hK182bzXXoJ9Nz4No0EMfJPJZ14JUTiBDxNw-onJOCwry6C0bNPzf9aJY';
  const defaultAvatar = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=256';

  const regionColors: Record<string, string> = {
    'Miền Bắc': '#004a99',
    'Miền Trung': '#512d00',
    'Miền Nam': '#bb0013',
    'Chuyên môn': '#6b21a8',
  };
  const regionColor = regionColors[chapter.region] || '#00346f';

  return (
    <div className="bg-[#fcf9f5] min-h-screen text-[#1c1c1a] font-sans pb-16">
      <title>{`${chapter.name} | Chi hội HOBA`}</title>
      <meta name="description" content={chapter.description || `Thông tin chi tiết về ${chapter.name} trực thuộc Hiệp hội HOBA.`} />

      {/* Hero Banner */}
      <section className="relative h-[320px] md:h-[420px] flex items-end overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            alt={chapter.name}
            className="w-full h-full object-cover"
            src={chapter.image_url || defaultImage}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
        </div>

        <div className="relative z-10 max-w-container-max mx-auto px-margin-mobile md:px-gutter w-full pb-10">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-1.5 text-xs text-white/70 mb-4 font-medium">
            <Link href="/" className="hover:text-white transition-colors">Trang chủ</Link>
            <span className="material-symbols-outlined text-[12px]">chevron_right</span>
            <Link href="/chi-hoi" className="hover:text-white transition-colors">Chi hội</Link>
            <span className="material-symbols-outlined text-[12px]">chevron_right</span>
            <span className="text-white font-semibold">{chapter.name}</span>
          </nav>

          <div
            className="inline-block px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider text-white mb-3 shadow"
            style={{ backgroundColor: regionColor }}
          >
            {chapter.region}
          </div>
          <h1 className="text-2xl md:text-4xl font-black text-white mb-2 leading-tight">
            {chapter.name}
          </h1>
          {chapter.slogan && (
            <p className="text-sm text-white/80 font-medium italic">"{chapter.slogan}"</p>
          )}
        </div>
      </section>

      {/* Quick Stats Bar */}
      <div className="bg-[#00346f] text-white">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-gutter py-4 grid grid-cols-3 divide-x divide-white/20">
          <div className="flex flex-col items-center px-4">
            <span className="text-xl font-black">{members.length || chapter.memberCount || '—'}</span>
            <span className="text-[10px] uppercase tracking-wider opacity-80">Doanh nghiệp</span>
          </div>
          <div className="flex flex-col items-center px-4">
            <span className="text-xl font-black">{leaders.length || '—'}</span>
            <span className="text-[10px] uppercase tracking-wider opacity-80">Ban lãnh đạo</span>
          </div>
          <div className="flex flex-col items-center px-4">
            <span className="text-xl font-black text-center text-sm leading-tight">{chapter.region}</span>
            <span className="text-[10px] uppercase tracking-wider opacity-80">Khu vực</span>
          </div>
        </div>
      </div>

      <main className="max-w-container-max mx-auto px-margin-mobile md:px-gutter mt-10 space-y-12">

        {/* Description */}
        {chapter.description && (
          <section className="bg-white border border-outline-variant/30 rounded-xl p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="w-1 h-12 bg-[#bb0013] rounded flex-shrink-0 mt-1"></div>
              <div>
                <h2 className="text-base font-black text-[#00346f] mb-2">Giới thiệu Chi hội</h2>
                <p className="text-sm text-on-surface-variant leading-relaxed">{chapter.description}</p>
                {chapter.locations && (
                  <div className="flex items-center gap-2 mt-3 text-xs text-on-surface-variant">
                    <span className="material-symbols-outlined text-[#00346f] text-base">location_on</span>
                    <span>Địa bàn hoạt động: <strong className="text-[#00346f]">{chapter.locations}</strong></span>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Leadership */}
        {leaders.length > 0 && (
          <section>
            <h2 className="text-lg md:text-xl font-black text-[#00346f] border-l-4 border-[#bb0013] pl-3 uppercase tracking-wide mb-6">
              Ban lãnh đạo Chi hội
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {leaders.map((leader, idx) => (
                <div
                  key={leader.id || idx}
                  className="bg-white border border-outline-variant/30 rounded-xl overflow-hidden shadow-sm group hover:shadow-md transition-all flex flex-col"
                >
                  <div className="aspect-[4/5] relative bg-surface-container-low overflow-hidden">
                    <img
                      alt={leader.name}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      src={leader.avatarUrl || leader.avatar_url || defaultAvatar}
                    />
                  </div>
                  <div className="p-4 flex flex-col flex-grow">
                    <h3 className="font-extrabold text-sm text-[#00346f] leading-snug group-hover:text-[#bb0013] transition-colors">
                      {leader.name}
                    </h3>
                    <p className="text-[10px] font-bold text-[#bb0013] uppercase tracking-wider mt-1">
                      {leader.role || leader.position || ''}
                    </p>
                    {(leader.company) && (
                      <div className="mt-3 pt-3 border-t border-outline-variant/20">
                        <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest block mb-1">Đơn vị</span>
                        <p className="text-[11px] font-semibold text-on-surface leading-normal line-clamp-2">
                          {leader.company}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Members list */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg md:text-xl font-black text-[#00346f] border-l-4 border-[#512d00] pl-3 uppercase tracking-wide">
              Danh sách Hội viên ({members.length})
            </h2>
          </div>

          {members.length > 0 ? (
            <div className="bg-white border border-outline-variant/30 rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#00346f] text-white border-b border-white/10">
                      <th className="px-5 py-4 w-14 text-center text-[10px] uppercase tracking-wider font-bold">STT</th>
                      <th className="px-5 py-4 text-[10px] uppercase tracking-wider font-bold">Người đại diện</th>
                      <th className="px-5 py-4 text-[10px] uppercase tracking-wider font-bold">Tên doanh nghiệp</th>
                      <th className="px-5 py-4 text-[10px] uppercase tracking-wider font-bold">Chức vụ Chi hội</th>
                      <th className="px-5 py-4 text-[10px] uppercase tracking-wider font-bold">Loại hình</th>
                      <th className="px-5 py-4 text-right text-[10px] uppercase tracking-wider font-bold">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/20">
                    {members.map((m, idx) => (
                      <tr key={m.id} className="hover:bg-surface-container/30 transition-colors group">
                        <td className="px-5 py-3.5 text-on-surface-variant font-medium text-center">{idx + 1}</td>
                        <td className="px-5 py-3.5">
                          <div className="font-bold text-[#1c1c1a]">{m.representative_name}</div>
                          <div className="text-[10px] text-on-surface-variant mt-0.5">{m.representative_role}</div>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="font-bold text-[#00346f] cursor-pointer group-hover:underline" onClick={() => setSelectedMember(m)}>
                            {m.company_name}
                          </div>
                          <div className="text-[10px] text-on-surface-variant/80 mt-0.5">{m.address}</div>
                        </td>
                        <td className="px-5 py-3.5 text-on-surface-variant">{m.chapter_role || '—'}</td>
                        <td className="px-5 py-3.5">
                          <span className="inline-block px-2 py-0.5 bg-[#d7e2ff] text-[#001b3f] rounded text-[9px] font-bold uppercase">
                            {m.business_type}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <button
                            onClick={() => setSelectedMember(m)}
                            className="text-[#00346f] hover:text-[#bb0013] transition-colors font-bold text-xs"
                          >
                            Chi tiết
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-on-surface-variant text-sm font-medium bg-white rounded-xl border border-outline-variant/30">
              <span className="material-symbols-outlined text-4xl mb-2 block text-outline">groups</span>
              Chưa có thông tin hội viên cho chi hội này.
            </div>
          )}
        </section>

        {/* Back link */}
        <div className="pt-4 border-t border-outline-variant/20">
          <Link
            href="/chi-hoi"
            className="inline-flex items-center gap-2 text-[#00346f] font-bold text-xs hover:underline"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Quay lại danh sách Chi hội
          </Link>
        </div>

      </main>

      {/* Member Detail Modal */}
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
              <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-outline-variant/30">
                <div className="w-24 h-24 border border-outline-variant/60 rounded-lg flex items-center justify-center bg-white p-3 shrink-0">
                  <img
                    alt={selectedMember.company_name}
                    className="max-h-full max-w-full object-contain"
                    src={selectedMember.logo_url || defaultImage}
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                <div className="space-y-3 bg-[#fcf9f5] p-4 border border-outline-variant/30 rounded-lg">
                  <h5 className="font-bold text-[#00346f] border-b border-outline-variant/40 pb-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">person</span> Người đại diện liên hệ
                  </h5>
                  <div className="flex gap-4 items-start pt-1">
                    {selectedMember.representative_avatar_url && (
                      <div className="w-14 h-14 rounded-full overflow-hidden border border-outline-variant/40 bg-white shrink-0">
                        <img
                          src={selectedMember.representative_avatar_url}
                          alt="Representative"
                          className="w-full h-full object-cover"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                      </div>
                    )}
                    <div className="space-y-2 text-[11px] flex-grow">
                      <div><span className="text-on-surface-variant font-semibold">Họ tên:</span> {selectedMember.representative_name}</div>
                      <div><span className="text-on-surface-variant font-semibold">Chức danh:</span> {selectedMember.representative_role}</div>
                      <div><span className="text-on-surface-variant font-semibold">Điện thoại:</span> {selectedMember.representative_phone}</div>
                      <div><span className="text-on-surface-variant font-semibold">Email:</span> {selectedMember.representative_email}</div>
                    </div>
                  </div>
                </div>

                <div className="col-span-full space-y-3 bg-[#fcf9f5] p-4 border border-outline-variant/30 rounded-lg">
                  <h5 className="font-bold text-[#00346f] border-b border-outline-variant/40 pb-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">hub</span> Liên kết Hiệp hội
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-[11px] pt-1">
                    <div><span className="text-on-surface-variant font-semibold block mb-0.5">Chức vụ Hiệp hội</span> {selectedMember.association_role}</div>
                    <div><span className="text-on-surface-variant font-semibold block mb-0.5">Vai trò Chi hội</span> {selectedMember.chapter_role || '—'}</div>
                    <div><span className="text-on-surface-variant font-semibold block mb-0.5">Ngày gia nhập</span> {selectedMember.join_date}</div>
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

export default function ChapterDetailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#fcf9f5] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <span className="animate-spin inline-block w-10 h-10 border-4 border-[#00346f] border-t-transparent rounded-full"></span>
          <span className="text-sm text-on-surface-variant font-medium">Đang tải dữ liệu chi hội...</span>
        </div>
      </div>
    }>
      <ChapterDetailPageContent />
    </Suspense>
  );
}
