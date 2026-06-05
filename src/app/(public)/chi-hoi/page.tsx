'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

interface Chapter {
  id: string;
  name: string;
  region: string; // 'Miền Bắc' | 'Miền Trung' | 'Miền Nam' | 'Chuyên môn'
  locations: string;
  memberCount: number;
  image_url: string;
  slogan?: string;
  description?: string;
}

interface Member {
  id: string;
  status: string;
  chapter_id?: string;
}

const MOCK_CHAPTERS: Chapter[] = [
  {
    id: 'hn-north',
    name: 'Chi hội LPG Hà Nội',
    region: 'Miền Bắc',
    locations: 'Hà Nội, Vĩnh Phúc, Bắc Ninh',
    memberCount: 42,
    image_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBTP1VwRhiXz7IslKk8lyrl_NZjrM0MYtWMLyaBrXhEX2DRZ9wIHjlle-92NsUhnYmQwD4yTguPqimc2ewjOD30dygdkHwHt7s9NXsMPSnzWvTyHO_1lM5j2kM_9BcFoN9m67VEakH0ReGkHCz2mX7R0kfbHFSyqSNrqYFcUsBMK0sm4skbO_7LO2Qs237Mbc_zUrwOxQ0lEHdDE-3w74hK182bzXXoJ9Nz4No0EMfJPJZ14JUTiBDxNw-onJOCwry6C0bNPzf9aJY',
    slogan: 'An toàn hàng đầu - Phát triển bền vững',
    description: 'Chi hội đại diện cho các doanh nghiệp LPG tại thủ đô Hà Nội và các tỉnh lân cận phía Bắc.'
  },
  {
    id: 'hp-north',
    name: 'Chi hội LPG Hải Phòng',
    region: 'Miền Bắc',
    locations: 'Hải Phòng, Quảng Ninh',
    memberCount: 28,
    image_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBTP1VwRhiXz7IslKk8lyrl_NZjrM0MYtWMLyaBrXhEX2DRZ9wIHjlle-92NsUhnYmQwD4yTguPqimc2ewjOD30dygdkHwHt7s9NXsMPSnzWvTyHO_1lM5j2kM_9BcFoN9m67VEakH0ReGkHCz2mX7R0kfbHFSyqSNrqYFcUsBMK0sm4skbO_7LO2Qs237Mbc_zUrwOxQ0lEHdDE-3w74hK182bzXXoJ9Nz4No0EMfJPJZ14JUTiBDxNw-onJOCwry6C0bNPzf9aJY',
    slogan: 'Vươn khơi bám biển - Kết nối năng lượng',
    description: 'Tập hợp các doanh nghiệp dịch vụ cảng biển, kho cảng LPG lớn tại khu vực Hải Phòng, Quảng Ninh.'
  },
  {
    id: 'tb-north',
    name: 'Chi hội LPG Tây Bắc',
    region: 'Miền Bắc',
    locations: 'Phú Thọ, Yên Bái, Lào Cai',
    memberCount: 15,
    image_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBTP1VwRhiXz7IslKk8lyrl_NZjrM0MYtWMLyaBrXhEX2DRZ9wIHjlle-92NsUhnYmQwD4yTguPqimc2ewjOD30dygdkHwHt7s9NXsMPSnzWvTyHO_1lM5j2kM_9BcFoN9m67VEakH0ReGkHCz2mX7R0kfbHFSyqSNrqYFcUsBMK0sm4skbO_7LO2Qs237Mbc_zUrwOxQ0lEHdDE-3w74hK182bzXXoJ9Nz4No0EMfJPJZ14JUTiBDxNw-onJOCwry6C0bNPzf9aJY',
    slogan: 'Năng lượng xanh cho bản làng',
    description: 'Đảm bảo cung ứng và an toàn sử dụng LPG tại các tỉnh vùng cao Tây Bắc.'
  },
  {
    id: 'hcm-south',
    name: 'Chi hội LPG TP. Hồ Chí Minh',
    region: 'Miền Nam',
    locations: 'TP.HCM, Bình Dương, Long An',
    memberCount: 85,
    image_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBTP1VwRhiXz7IslKk8lyrl_NZjrM0MYtWMLyaBrXhEX2DRZ9wIHjlle-92NsUhnYmQwD4yTguPqimc2ewjOD30dygdkHwHt7s9NXsMPSnzWvTyHO_1lM5j2kM_9BcFoN9m67VEakH0ReGkHCz2mX7R0kfbHFSyqSNrqYFcUsBMK0sm4skbO_7LO2Qs237Mbc_zUrwOxQ0lEHdDE-3w74hK182bzXXoJ9Nz4No0EMfJPJZ14JUTiBDxNw-onJOCwry6C0bNPzf9aJY',
    slogan: 'Gắn kết sức mạnh - Ngành Gas Phương Nam',
    description: 'Chi hội đại diện cho cộng đồng doanh nghiệp tại đầu tàu kinh tế phía Nam.'
  },
  {
    id: 'tnb-south',
    name: 'Chi hội LPG Tây Nam Bộ',
    region: 'Miền Nam',
    locations: 'Cần Thơ, Hậu Giang, Đồng Tháp',
    memberCount: 34,
    image_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBTP1VwRhiXz7IslKk8lyrl_NZjrM0MYtWMLyaBrXhEX2DRZ9wIHjlle-92NsUhnYmQwD4yTguPqimc2ewjOD30dygdkHwHt7s9NXsMPSnzWvTyHO_1lM5j2kM_9BcFoN9m67VEakH0ReGkHCz2mX7R0kfbHFSyqSNrqYFcUsBMK0sm4skbO_7LO2Qs237Mbc_zUrwOxQ0lEHdDE-3w74hK182bzXXoJ9Nz4No0EMfJPJZ14JUTiBDxNw-onJOCwry6C0bNPzf9aJY',
    slogan: 'Năng lượng sạch sông nước miền Tây',
    description: 'Kết nối mạng lưới phân phối gas an toàn dọc theo các tỉnh đồng bằng sông Cửu Long.'
  }
];

export default function ChaptersPage() {
  const [chapterList, setChapterList] = useState<Chapter[]>(MOCK_CHAPTERS);
  const [memberList, setMemberList] = useState<Member[]>([]);
  const [chapterSearch, setChapterSearch] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('all');

  // Fetch Chapters and Members data
  useEffect(() => {
    async function loadChaptersData() {
      let chaptersMap: Record<string, string> = {};
      if (supabase) {
        try {
          const { data: chaptersData, error: chError } = await supabase
            .from('chapters')
            .select('*');
          if (!chError && chaptersData && chaptersData.length > 0) {
            const formattedChapters: Chapter[] = chaptersData.map((c: any) => {
              chaptersMap[c.id] = c.name;
              return {
                id: c.id,
                name: c.name,
                region: c.region,
                locations: c.locations || '',
                memberCount: 0,
                image_url: c.image_url || 'https://lh3.googleusercontent.com/aida-public/AB6AXuBTP1VwRhiXz7IslKk8lyrl_NZjrM0MYtWMLyaBrXhEX2DRZ9wIHjlle-92NsUhnYmQwD4yTguPqimc2ewjOD30dygdkHwHt7s9NXsMPSnzWvTyHO_1lM5j2kM_9BcFoN9m67VEakH0ReGkHCz2mX7R0kfbHFSyqSNrqYFcUsBMK0sm4skbO_7LO2Qs237Mbc_zUrwOxQ0lEHdDE-3w74hK182bzXXoJ9Nz4No0EMfJPJZ14JUTiBDxNw-onJOCwry6C0bNPzf9aJY',
                slogan: c.slogan || '',
                description: c.description || ''
              };
            });
            setChapterList(formattedChapters);
          }

          const { data: membersData, error: memError } = await supabase
            .from('members')
            .select('id, status, chapter_id')
            .eq('status', 'Active');
          if (!memError && membersData) {
            setMemberList(membersData);
          }
        } catch (e) {
          console.error('Error fetching chapters data:', e);
        }
      } else {
        const savedChaps = localStorage.getItem('hoba_chapters_list');
        if (savedChaps) {
          try { setChapterList(JSON.parse(savedChaps)); } catch (e) {}
        }
        const savedMembers = localStorage.getItem('hoba_website_members');
        if (savedMembers) {
          try { setMemberList(JSON.parse(savedMembers)); } catch (e) {}
        }
      }
    }
    loadChaptersData();
  }, []);

  // Compute final chapters with actual live member counts
  const finalChapters = useMemo(() => {
    return chapterList.map(ch => {
      const actualCount = memberList.filter(m => m.chapter_id === ch.id && m.status === 'Active').length;
      return {
        ...ch,
        memberCount: actualCount || ch.memberCount || 0
      };
    });
  }, [chapterList, memberList]);

  // Filtered Chapters based on Region and Search input
  const filteredChapters = useMemo(() => {
    return finalChapters.filter((c) => {
      const matchesSearch = c.name.toLowerCase().includes(chapterSearch.toLowerCase()) ||
                            c.locations.toLowerCase().includes(chapterSearch.toLowerCase());
      const matchesRegion = selectedRegion === 'all' || c.region === selectedRegion;
      return matchesSearch && matchesRegion;
    });
  }, [finalChapters, chapterSearch, selectedRegion]);

  return (
    <div className="bg-[#fcf9f5] min-h-screen text-[#1c1c1a] font-sans pb-16">
      
      {/* 1. Hero banner */}
      <section className="relative h-[25vh] md:h-[35vh] flex items-center justify-center overflow-hidden bg-primary pt-20">
        <div className="absolute inset-0 z-0">
          <img
            alt="Chapters Banner Background"
            className="w-full h-full object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBTP1VwRhiXz7IslKk8lyrl_NZjrM0MYtWMLyaBrXhEX2DRZ9wIHjlle-92NsUhnYmQwD4yTguPqimc2ewjOD30dygdkHwHt7s9NXsMPSnzWvTyHO_1lM5j2kM_9BcFoN9m67VEakH0ReGkHCz2mX7R0kfbHFSyqSNrqYFcUsBMK0sm4skbO_7LO2Qs237Mbc_zUrwOxQ0lEHdDE-3w74hK182bzXXoJ9Nz4No0EMfJPJZ14JUTiBDxNw-onJOCwry6C0bNPzf9aJY"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary/65"></div>
        </div>
        <div className="relative z-10 max-w-container-max mx-auto px-margin-mobile md:px-gutter w-full text-center">
          <h1 className="text-xl md:text-3xl lg:text-4xl font-black text-white uppercase tracking-tight mb-2">
            Chi hội Địa phương
          </h1>
          <p className="text-xs md:text-sm text-white/80 max-w-xl mx-auto font-medium">
            Mạng lưới kết nối các doanh nghiệp kinh doanh LPG trên khắp các vùng miền toàn quốc.
          </p>
        </div>
      </section>

      {/* 2. Main Content area */}
      <main className="max-w-container-max mx-auto px-margin-mobile md:px-gutter mt-8">
        
        {/* Filters and search toolbar */}
        <div className="bg-white border border-outline-variant/30 rounded-xl p-4 md:p-6 shadow-sm mb-8 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          <div className="md:col-span-6 flex flex-col gap-1">
            <label className="text-[10px] uppercase font-bold tracking-wider text-on-surface-variant">Tìm kiếm</label>
            <div className="relative w-full">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-base">search</span>
              <input
                className="w-full pl-9 pr-4 py-2 border border-outline-variant/70 bg-white rounded-lg focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all text-xs"
                placeholder="Tìm chi hội theo tên hoặc địa bàn..."
                type="text"
                value={chapterSearch}
                onChange={(e) => setChapterSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="md:col-span-6 flex flex-col gap-1">
            <label className="text-[10px] uppercase font-bold tracking-wider text-on-surface-variant">Khu vực địa lý</label>
            <div className="flex gap-2">
              {['all', 'Miền Bắc', 'Miền Trung', 'Miền Nam'].map((region) => (
                <button
                  key={region}
                  onClick={() => setSelectedRegion(region)}
                  className={`flex-grow h-9 text-xs font-bold rounded-lg border transition-all active:scale-95 ${
                    selectedRegion === region
                      ? 'bg-[#00346f] border-[#00346f] text-white'
                      : 'border-outline-variant hover:bg-surface-container bg-white text-on-surface-variant'
                  }`}
                >
                  {region === 'all' ? 'Tất cả' : region}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Chapters list grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredChapters.length > 0 ? (
            filteredChapters.map((c) => (
              <div key={c.id} className="bg-white border border-outline-variant rounded-xl overflow-hidden group shadow-sm hover:shadow-md transition-all flex flex-col">
                <div className="h-48 overflow-hidden relative bg-surface-container-low">
                  <img
                    alt={c.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    src={c.image_url}
                  />
                  <div className="absolute top-4 left-4 bg-[#bb0013] text-white px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider shadow">
                    {c.region}
                  </div>
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-base font-black text-[#00346f] mb-2 group-hover:text-[#bb0013] transition-colors">{c.name}</h3>
                  <p className="text-xs text-on-surface-variant/80 line-clamp-2 leading-relaxed mb-4">
                    {c.description || 'Chi hội thành viên trực thuộc Hiệp hội Kinh doanh Khí hóa lỏng.'}
                  </p>
                  
                  <div className="space-y-2 mb-6 flex-grow text-xs text-on-surface-variant">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#00346f] text-base">location_on</span>
                      <span>{c.locations}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#00346f] text-base">groups</span>
                      <span>{c.memberCount} Doanh nghiệp thành viên</span>
                    </div>
                  </div>

                  <Link
                    className="flex items-center justify-center gap-2 w-full py-2.5 border border-[#00346f] text-[#00346f] font-bold rounded-lg hover:bg-[#00346f] hover:text-white transition-all text-xs active:scale-95 shadow-sm"
                    href={`/hoi-vien/chi-hoi?id=${c.id}`}
                  >
                    Xem chi tiết <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-12 text-center text-on-surface-variant text-sm font-medium bg-white rounded-xl border border-outline-variant/30">
              Không tìm thấy chi hội nào khớp với bộ lọc.
            </div>
          )}
        </div>


      </main>
    </div>
  );
}
