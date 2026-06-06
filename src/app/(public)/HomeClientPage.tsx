'use client';

import { useState, useEffect, Fragment } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import defaultHomePage from '@/lib/defaultHomePage.json';

export default function HomeClientPage({
  initialData = {}
}: {
  initialData?: any;
}) {
  const [stats, setStats] = useState(initialData.stats || defaultHomePage.stats);
  const [coreServices, setCoreServices] = useState(initialData.coreServices || defaultHomePage.coreServices);
  const [heroImage, setHeroImage] = useState(initialData.heroImage || defaultHomePage.heroImage);

  const mockActiveMembers = [
    { name: 'Saigon Petro', logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCUSaADTHuO0LeW68laxKr1qy5yC1GTS_ZMkN3B3Bk8_GdXGeqGYbF0o9npgtS7B1SN9Q0rltt5aXIffVkM3BlPgVVzI8pArb-gKVO2tSlefjfbDUAlMaVWSsY4Eljq9-h-vBmck0v3SrFG9Mj-3v4ZjvKBtgZ4PzNjThhlqmt5XcMsoe9i24a1cqq-o4NItX0xwJ7eNBvZxigXmSDVsR6oQw5flyk3MYT4qmWEVd79cVskyyUgh0YrEvLEPsqb26TSmnVlXMPCh3I' },
    { name: 'City Gas', logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB-4CTXIocyVnnwyyHfAW2HBH3dLylJiYdJfzfRNk0sebpSDvYhL9ShY3uTaeX8Kca509b_k-2_UX7kcsoCDloaKRxN9FqWOSAIJ4zT4SUUrnCjxePkI5wOcmj63TodEipgcPO7KNuCorerGkEBENchfOaTXtDAFSwxE9sGyIGFf0GEK3QxcrGNWKxDi8WLTHLdj6X2NKVKo_i1y5GoL9X8w5iqqpca0J-qgEz159K6P6V7Wlw-gMDIqUJZ2ete1qlJtu3WQIUxMrU' },
    { name: 'VT-GAS', logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC7eTnvK5aYgdRpQ7r0JrThIhssN0j12GcjAzcrszxjSAtC1JzdscsKEliCTSujgiOjdIduDejriCsmUzgC_jBK4p0R8HAqKoKN5vfBScoDvHnjlazdSDRe3RS2RBm5E0sZPVn48gGk8Z4RYAi8__gyoBMqDSd2Tg_f88VrVSZn6DO26vy0EwdmJljaS9q11ROrep_qQfOz7Ny6V2XBa8ia5yjLujsw4TSYMRx7OF6mB13nu2XoEx9EiyUBJomlpAF9oX3C2n3a6x4' },
    { name: 'PETROVIETNAM GAS', logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBwWtf74gYhtlAq1IS1hNQ5pLt7PUyB5KUTbLhgRYv6HnE6oV_u_57wH3tzf7Gu632sw0dDOEGwPcVE9yeyW9nsoSKIYu6zhAnbBNLs_DAMN586bdG_Go0iluqSQSqfzXCkhA6V7FX6c26NfP5RxfXr_v80Y2xIdgeLNu-T-w8aqpnVxVdfLNKXLMrB1VRrMgB_l_1ovROIijGMRTcnJSxHCl2NBnEkiom8SJaaYm29JQdL9cUuZ6FLXiVcFjMeMtcUCUUGAtXcCeg' },
    { name: 'BINH MINH ENERGY', logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD1p0v3-44vz10qrmIHA53j7oMkCHzMVTMi5RiGUaylSuVWs9pv-OCq2L2wYHeAumF4kaa_jC97eMHBp9ULCITYP3pv58yMcUnlbyEAb7TpNQekXTlPruB3TmkvQbLogChaztNMoyNxYFHv3c0LRXMwwZDUjCGrLDVqyIJ7kbw9mCF-zL9q7bJNwr67OTVgY8Tgjn_szspCSyNxiRZIm26DU799H-Na5x--fvXe_XpEaj0puYvKfuzKou2VM_UXG1K8cj-7Jx4DTTc' },
    { name: 'VIPCO', logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBZpcPDOgvB4aa_20YveL9ydc5ZGz3e8LnSvzQG4FXaJIFdU5ZbWueUPLZQTBPsoLbIL4Drm32xlDbKpgHcxWlkpaVoHvMAni-zTPhV095xHNedL5LcAzMW8gF5jYyGhhtklq6tYZjQ_C-IBiADh13sRgUREZQswv22-z0qJdIrnMlFLXJQaoEY5vzwBzSA-S51cM39LVaVPYWR6orgIxst1DF5oFTdJDJi_GPNGACmXyJqPXQt6iktYG9_lWfwOMdSn80nyxUL0_o' }
  ];
  const [featuredMembers, setFeaturedMembers] = useState<any[]>(initialData.featuredMembers || defaultHomePage.featuredMembers);

  const initialArticles = [
    {
      id: '1',
      title: 'Cập nhật xu hướng thị trường LPG khu vực phía Nam 2026',
      desc: 'Phân tích chuyên sâu về biến động cung cầu, giá gas thế giới và tác động đến các trạm chiết nạp.',
      date: '10 Tháng 05, 2026',
      badge: 'Tiêu điểm',
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDTnDaM8uzQn1_0DhmhC7KmeGLksQoODMcExU4UgxEcKMACoKgUXJW_2llmo7m-ViDB3xt2KW3AffPsNIEWvPC1uYoP833s0_aSIdyHJqgQJ3M7CeBBlXZb6AXaffkH0smJ-ud5Q1xRd87Fq9fBxQkp-UOoxSITgv85D-HFOp0IhgyruXjbG3lsDx9HPlbswwwJyQC1LeI0F7lTCuuNnRSBcWo3UUy-H2FP9vD9KSPm35z6PtDtTWMejNSdqXtYLoWrH28NsiAEQHc'
    },
    {
      id: '2',
      title: 'Tăng cường tiêu chuẩn an toàn trong hệ thống chiết nạp',
      desc: 'Hướng dẫn mới nhất về quy trình PCCC bồn chứa khí hóa lỏng.',
      date: '06 Tháng 05, 2026',
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCd2LKfPS_qVXIaFpb-YI8xVvamEFKJwsAWDR_F6_kMft_JUW1eji4905tchFl4JT3GENT7J4hmma4MEUcrBFLNin0zDrmnAit0SlkhGARJt5rbTmYD1n-_I6Mk37Z8Sr1EqM8Ldzg-6dMzSpy1wrTCyeuEZDczV-zDSpSukz371vL7lRlt3ephKeZgrc7LdnYCTjQHYVkmkUIUCeSowvxd1vn3SbgkU30srqfp_HKJPDSkcBNy-PNSId3_gsU4BJTTeL2qz5pVGz4'
    },
    {
      id: '3',
      title: 'HOBA tổ chức hội thảo kết nối 150+ doanh nghiệp gas',
      desc: 'Diễn đàn thường niên xúc tiến thương mại ngành gas toàn quốc.',
      date: '28 Tháng 04, 2026',
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDpq3p2BNGjKIzkbtZzJx6XE4QhBg8rX3SLG7kaZe3xIzwjK4UxrkRz0wGNIgs6vhQs6MGUuQLR6Ip4XEAzCdspTirigwb78XhgaSeci66qanxZLWWKsJS3QVhzuWtumYfio8watxGy2eSI_gCk4mYA2weVkRk3vPFme3OWZ7SVwBXiJS_bA4gDQhTX6mNnm0SnlIFp843ZQ1aAqLJHEQEZxzmaicFKorrJFu4R-Po8M4tuSkTztog70nwDnGdwJo7GrXS8V5CJ0qs'
    }
  ];

  const initialDocs = [
    { title: 'Quy chuẩn an toàn LPG 2026', date: '20/04/2026', type: 'pdf', color: 'text-secondary' },
    { title: 'Thông báo đại hội lần XI', date: '18/04/2026', type: 'info', color: 'text-green-600' },
    { title: 'Hướng dẫn kiểm định bồn áp lực', date: '15/04/2026', type: 'download', color: 'text-orange-500' }
  ];

  const [liveArticles, setLiveArticles] = useState<any[]>(initialData.liveArticles || initialArticles);
  const [liveDocs, setLiveDocs] = useState(initialData.liveDocs || initialDocs);

  const [headline, setHeadline] = useState(initialData.headline || defaultHomePage.headline);
  const [subtext, setSubtext] = useState(initialData.subtext || defaultHomePage.subtext);
  const [aboutTitle, setAboutTitle] = useState(initialData.aboutTitle || defaultHomePage.aboutTitle);
  const [aboutDesc, setAboutDesc] = useState(initialData.aboutDesc || defaultHomePage.aboutDesc);
  const [aboutImage, setAboutImage] = useState(initialData.aboutImage || defaultHomePage.aboutImage);
  const [features, setFeatures] = useState(initialData.features || defaultHomePage.features);
  const [sections, setSections] = useState(initialData.sections || defaultHomePage.sections);

  const [liveEvents, setLiveEvents] = useState<any[]>(initialData.liveEvents || []);

  useEffect(() => {
    async function loadHomeData() {
      if (initialData && Object.keys(initialData).length > 0) {
        return;
      }
      // Helper to fetch with timeout and retry
      async function fetchWithRetry(queryFn: () => any, label: string, retryCount = 0): Promise<any> {
        const ms = 8000;
        try {
          return await Promise.race([
            Promise.resolve(queryFn()),
            new Promise<any>((_, reject) => setTimeout(() => reject(new Error(`Timeout fetching ${label}`)), ms))
          ]);
        } catch (err) {
          console.warn(`Lỗi khi tải ${label} (lần thử ${retryCount + 1}):`, err);
          if (retryCount < 2) {
            await new Promise(resolve => setTimeout(resolve, 1500));
            return fetchWithRetry(queryFn, label, retryCount + 1);
          }
          throw err;
        }
      }

      // 1. Fetch active members first (or load from localStorage as fallback)
      let resolvedMembers: any[] = [];
      if (supabase) {
        try {
          const { data: membersDb, error } = await fetchWithRetry(() => 
            supabase!.from('members').select('*').eq('status', 'Active'),
            'members'
          );
          if (error) throw error;
          if (membersDb && membersDb.length > 0) {
            resolvedMembers = membersDb.map((d: any) => ({
              id: d.id,
              name: d.company_name,
              logo: d.logo_url || d.license_file_url || 'https://lh3.googleusercontent.com/aida-public/AB6AXuBwWtf74gYhtlAq1IS1hNQ5pLt7PUyB5KUTbLhgRYv6HnE6oV_u_57wH3tzf7Gu632sw0dDOEGwPcVE9yeyW9nsoSKIYu6zhAnbBNLs_DAMN586bdG_Go0iluqSQSqfzXCkhA6V7FX6c26NfP5RxfXr_v80Y2xIdgeLNu-T-w8aqpnVxVdfLNKXLMrB1VRrMgB_l_1ovROIijGMRTcnJSxHCl2NBnEkiom8SJaaYm29JQdL9cUuZ6FLXiVcFjMeMtcUCUUGAtXcCeg'
            }));
          }
        } catch (e) {
          console.error('Failed to load members from Supabase, checking localStorage:', e);
        }
      }
      
      if (resolvedMembers.length === 0) {
        const savedMembers = localStorage.getItem('hoba_website_members');
        if (savedMembers) {
          try {
            const parsed = JSON.parse(savedMembers);
            const active = parsed.filter((m: any) => m.status === 'Active');
            if (active.length > 0) {
              resolvedMembers = active.map((d: any) => ({
                id: d.id,
                name: d.company_name,
                logo: d.logo_url || d.license_file_url || 'https://lh3.googleusercontent.com/aida-public/AB6AXuBwWtf74gYhtlAq1IS1hNQ5pLt7PUyB5KUTbLhgRYv6HnE6oV_u_57wH3tzf7Gu632sw0dDOEGwPcVE9yeyW9nsoSKIYu6zhAnbBNLs_DAMN586bdG_Go0iluqSQSqfzXCkhA6V7FX6c26NfP5RxfXr_v80Y2xIdgeLNu-T-w8aqpnVxVdfLNKXLMrB1VRrMgB_l_1ovROIijGMRTcnJSxHCl2NBnEkiom8SJaaYm29JQdL9cUuZ6FLXiVcFjMeMtcUCUUGAtXcCeg'
              }));
            }
          } catch (e) {}
        }
      }
      if (resolvedMembers.length === 0) {
        resolvedMembers = mockActiveMembers;
      }

      // Fetch featured members from the dedicated configuration
      let loadedFeaturedMembers: any[] = [];
      if (!supabase) {
        const savedFeatured = localStorage.getItem('hoba_website_config_featured_members');
        if (savedFeatured) {
          try {
            loadedFeaturedMembers = JSON.parse(savedFeatured);
          } catch (_) {}
        }
      }

      if (!supabase) {
        const saved = localStorage.getItem('hoba_website_config_homepage');
        let val: any = null;
        if (saved) {
          try {
            val = JSON.parse(saved);
            if (val.headline) setHeadline(val.headline);
            if (val.subtext) setSubtext(val.subtext);
            if (val.features) setFeatures(val.features);
            if (val.sections) setSections(val.sections);
            if (val.heroImage) setHeroImage(val.heroImage);
            if (val.stats) setStats(val.stats);
            if (val.coreServices) setCoreServices(val.coreServices);
            if (val.aboutTitle) setAboutTitle(val.aboutTitle);
            if (val.aboutDesc) setAboutDesc(val.aboutDesc);
            if (val.aboutImage) setAboutImage(val.aboutImage);
          } catch (e) {}
        }
        
        if (loadedFeaturedMembers && loadedFeaturedMembers.length > 0) {
          setFeaturedMembers(loadedFeaturedMembers);
        } else if (val && val.featuredMembers && Array.isArray(val.featuredMembers)) {
          setFeaturedMembers(val.featuredMembers);
        } else if (val && val.featuredMemberIds && Array.isArray(val.featuredMemberIds)) {
          const sorted = val.featuredMemberIds.map((id: string) => {
            return resolvedMembers.find((m: any) => m.id === id);
          }).filter(Boolean);
          if (sorted.length > 0) {
            setFeaturedMembers(sorted);
          } else {
            setFeaturedMembers(resolvedMembers.slice(0, 6));
          }
        } else {
          setFeaturedMembers(resolvedMembers.slice(0, 6));
        }

        const savedEvents = localStorage.getItem('hoba_website_config_events');
        if (savedEvents) {
          try {
            setLiveEvents(JSON.parse(savedEvents));
          } catch (e) {}
        }
        return;
      }

      // If Supabase is present, run all subsequent queries concurrently
      let val: any = null;
      const tasks = [
        (async () => {
          try {
            const { data: featuredData, error } = await fetchWithRetry(() =>
              supabase!.from('website_config').select('value').eq('key', 'featured_members').single(),
              'featured_members'
            );
            if (error) throw error;
            if (featuredData?.value && Array.isArray(featuredData.value)) {
              loadedFeaturedMembers = featuredData.value;
            }
          } catch (e) {
            console.error('Failed to load featured members config from Supabase:', e);
          }
        })(),

        (async () => {
          try {
            const { data: homeConfig, error } = await fetchWithRetry(() =>
              supabase!.from('website_config').select('value').eq('key', 'homepage').single(),
              'homepage'
            );
            if (error) throw error;
            if (homeConfig?.value) {
              val = homeConfig.value;
              if (val.headline) setHeadline(val.headline);
              if (val.subtext) setSubtext(val.subtext);
              if (val.features) setFeatures(val.features);
              if (val.sections) setSections(val.sections);
              if (val.heroImage) setHeroImage(val.heroImage);
              if (val.stats) setStats(val.stats);
              if (val.coreServices) setCoreServices(val.coreServices);
              if (val.aboutTitle) setAboutTitle(val.aboutTitle);
              if (val.aboutDesc) setAboutDesc(val.aboutDesc);
              if (val.aboutImage) setAboutImage(val.aboutImage);
            }
          } catch (e) {
            console.error('Failed to load homepage config from Supabase:', e);
          }
        })(),

        (async () => {
          try {
            const { data: eventsConfig, error } = await fetchWithRetry(() =>
              supabase!.from('website_config').select('value').eq('key', 'events').single(),
              'events'
            );
            if (error) throw error;
            if (eventsConfig?.value && Array.isArray(eventsConfig.value)) {
              setLiveEvents(eventsConfig.value);
            }
          } catch (e) {
            console.error('Failed to load events config from Supabase:', e);
          }
        })(),

        (async () => {
          try {
            const { data: newsData, error } = await fetchWithRetry(() =>
              supabase!.from('news').select('*').eq('status', 'Published').order('publish_date', { ascending: false }).limit(3),
              'news'
            );
            if (error) throw error;
            if (newsData && newsData.length > 0) {
              const mappedArticles = newsData.map((d: any, idx: number) => {
                let formattedDate = d.publish_date;
                try {
                  const dt = new Date(d.publish_date);
                  formattedDate = `${dt.getDate()} Tháng ${dt.getMonth() + 1}, ${dt.getFullYear()}`;
                } catch (_) {}

                return {
                  id: d.id,
                  title: d.title,
                  desc: d.description || '',
                  date: formattedDate,
                  badge: idx === 0 ? 'Tiêu điểm' : undefined,
                  img: d.thumbnail_url || 'https://images.unsplash.com/photo-1542282088-fe8426682b8f',
                  slug: d.slug
                };
              });
              setLiveArticles(mappedArticles);
            }
          } catch (e) {
            console.error('Failed to load news from Supabase:', e);
          }
        })(),

        (async () => {
          try {
            const { data: docsData, error } = await fetchWithRetry(() =>
              supabase!.from('documents').select('*').order('publish_date', { ascending: false }).limit(3),
              'documents'
            );
            if (error) throw error;
            if (docsData && docsData.length > 0) {
              const mappedDocs = docsData.map((d: any) => {
                let formattedDate = d.publish_date;
                try {
                  const dt = new Date(d.publish_date);
                  formattedDate = `${dt.getDate()}/${dt.getMonth() + 1}/${dt.getFullYear()}`;
                } catch (_) {}

                let type = 'pdf';
                let color = 'text-secondary';
                if (d.category === 'Thông tư') {
                  type = 'info';
                  color = 'text-green-600';
                } else if (d.category === 'Quyết định') {
                  type = 'download';
                  color = 'text-orange-500';
                }

                return {
                  title: d.title,
                  date: formattedDate,
                  type: type,
                  color: color
                };
              });
              setLiveDocs(mappedDocs);
            }
          } catch (e) {
            console.error('Failed to load documents from Supabase:', e);
          }
        })()
      ];

      await Promise.all(tasks);

      // Resolve featured members representation based on resolves
      if (loadedFeaturedMembers && loadedFeaturedMembers.length > 0) {
        setFeaturedMembers(loadedFeaturedMembers);
      } else if (val && val.featuredMembers && Array.isArray(val.featuredMembers)) {
        setFeaturedMembers(val.featuredMembers);
      } else if (val && val.featuredMemberIds && Array.isArray(val.featuredMemberIds)) {
        const sorted = val.featuredMemberIds.map((id: string) => {
          return resolvedMembers.find((m: any) => m.id === id);
        }).filter(Boolean);
        if (sorted.length > 0) {
          setFeaturedMembers(sorted);
        } else {
          setFeaturedMembers(resolvedMembers.slice(0, 6));
        }
      } else {
        setFeaturedMembers(resolvedMembers.slice(0, 6));
      }
    }
    loadHomeData();
  }, []);

  const renderHero = () => (
    <section className="relative min-h-[85vh] flex items-center pt-20 pb-16 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img
          alt="Industrial LPG Terminal at Dusk"
          className="w-full h-full object-cover"
          src={heroImage}
        />
        <div className="absolute inset-0 hero-overlay"></div>
      </div>
      <div className="relative z-10 max-w-container-max mx-auto px-margin-mobile md:px-gutter w-full">
        <div className="max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-card border-white/20 text-white text-[10px] font-bold uppercase tracking-[0.15em] mb-2">
            <span className="w-1.5 h-1.5 bg-secondary rounded-full animate-pulse"></span>
            Tiên phong kiến tạo ngành khí hóa lỏng TP.HCM
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-black text-white leading-[1.1] tracking-tight whitespace-pre-line">
            {headline}
          </h1>
          <p className="text-base md:text-lg text-white/80 max-w-xl leading-relaxed font-medium">
            {subtext}
          </p>
          <div className="flex flex-wrap gap-4 pt-4">
            <Link
              href="/gioi-thieu"
              className="bg-secondary text-white px-8 py-4 rounded-full font-bold text-base hover:shadow-[0_0_30px_rgba(187,0,19,0.3)] hover:-translate-y-0.5 transition-all flex items-center gap-2"
            >
              Khám phá HOBA <span className="material-symbols-outlined text-xl">arrow_forward</span>
            </Link>
            <Link
              href="/dang-ky"
              className="px-8 py-4 rounded-full font-bold text-base text-white border-2 border-white/40 hover:bg-white/10 transition-all backdrop-blur-sm"
            >
              Dành cho Hội viên
            </Link>
          </div>
        </div>
      </div>
      {/* Visual Element */}
      <div className="absolute bottom-0 right-0 w-1/4 h-1/2 hidden xl:block z-0 pointer-events-none opacity-20">
        <svg className="w-full h-full" viewBox="0 0 400 400">
          <circle cx="400" cy="400" fill="none" r="300" stroke="white" strokeDasharray="10 10" strokeWidth="1"></circle>
          <circle cx="400" cy="400" fill="none" r="250" stroke="white" strokeDasharray="5 5" strokeWidth="1"></circle>
        </svg>
      </div>
    </section>
  );

  const renderStats = () => (
    <section className="py-12 bg-primary text-white border-t border-white/10">
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-gutter">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat: any, idx: number) => (
            <div key={idx} className="flex flex-col items-center text-center p-4">
              <span className="material-symbols-outlined text-4xl text-secondary-fixed-dim mb-2">{stat.icon}</span>
              <span className="text-3xl md:text-4xl font-extrabold text-white">{stat.value}</span>
              <span className="text-xs text-white/70 uppercase tracking-wider mt-1">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );

  const renderServices = () => (
    <Fragment>
      {/* Corporate About Section */}
      <section className="py-16 md:py-24 bg-surface overflow-hidden">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-gutter">
          <div className="grid lg:grid-cols-2 gap-12 md:gap-16 items-center">
            <div className="relative">
              <div className="relative z-10 rounded-[1.5rem] overflow-hidden shadow-xl">
                <img
                  alt="Corporate Meeting"
                  className="w-full aspect-[4/3] object-cover hover:scale-105 transition-transform duration-700"
                  src={aboutImage}
                />
              </div>
              <div className="absolute -top-6 -left-6 w-24 h-24 bg-secondary-container/10 rounded-full blur-2xl"></div>
              <div className="absolute -bottom-8 -right-8 bg-primary p-8 rounded-2xl shadow-xl max-w-[280px] hidden lg:block border border-white/10">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                    <span className="material-symbols-outlined text-white text-xl">track_changes</span>
                  </div>
                  <h4 className="text-white font-bold text-sm uppercase tracking-wider">Sứ mệnh</h4>
                </div>
                <p className="text-white/80 text-[10px] leading-relaxed">
                  Đồng hành cùng sự phát triển chuyên nghiệp, minh bạch và an toàn của hệ sinh thái kinh doanh khí hóa lỏng tại Việt Nam.
                </p>
              </div>
            </div>
            <div className="space-y-6">
              <div className="space-y-3">
                <h3 className="text-secondary font-bold uppercase tracking-[0.2em] text-xs">Về chúng tôi</h3>
                <h2 className="text-primary text-3xl md:text-4xl lg:text-5xl font-black leading-tight section-title-line whitespace-pre-line">
                  {aboutTitle}
                </h2>
              </div>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                {aboutDesc}
              </p>
              <div className="grid sm:grid-cols-2 gap-x-6 gap-y-4 pt-2">
                {features.map((f: any) => (
                  <div key={f.id} className="flex gap-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-secondary-container/10 flex items-center justify-center text-secondary">
                      <span className="material-symbols-outlined text-xl">{f.icon || 'verified_user'}</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-primary text-sm mb-0.5">{f.title}</h4>
                      <p className="text-[11px] text-on-surface-variant leading-relaxed">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="pt-4">
                <Link
                  href="/gioi-thieu"
                  className="bg-primary hover:bg-secondary text-white px-8 py-3.5 rounded-full font-bold text-xs transition-all shadow-lg flex items-center gap-2 inline-flex"
                >
                  Tìm hiểu thêm về tổ chức <span className="material-symbols-outlined text-lg">chevron_right</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Business Areas Section */}
      <section className="py-16 md:py-20 bg-surface-container-low">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-gutter">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
            <h3 className="text-secondary font-bold uppercase tracking-[0.2em] text-xs">Năng lực cốt lõi</h3>
            <h2 className="text-primary text-3xl md:text-4xl font-black section-title-line section-title-line-center">LĨNH VỰC HOẠT ĐỘNG</h2>
            <p className="text-on-surface-variant text-sm">Hệ sinh thái hỗ trợ toàn diện để doanh nghiệp hội viên phát triển bền vững.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coreServices.map((service: any, idx: number) => (
              <div
                key={idx}
                className="group relative overflow-hidden bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-500 border border-outline-variant/30 hover:-translate-y-1 p-6"
              >
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-primary-container/10 rounded-xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500 mb-6">
                    <span className="material-symbols-outlined text-2xl">{service.icon}</span>
                  </div>
                  <h3 className="text-lg font-bold text-primary mb-3">{service.title}</h3>
                  <p className="text-xs text-on-surface-variant leading-relaxed mb-5">{service.desc}</p>
                  <Link
                    href="/gioi-thieu"
                    className="inline-flex items-center gap-1.5 text-secondary font-bold text-xs group-hover:gap-3 transition-all"
                  >
                    Chi tiết <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </Link>
                </div>
                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                  <span className="material-symbols-outlined text-7xl">{service.bgIcon}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Fragment>
  );

  const renderMembers = () => (
    <section className="py-16 bg-white">
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-gutter">
        <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-4">
          <h2 className="text-primary text-base font-black uppercase tracking-widest">HỘI VIÊN TIÊU BIỂU</h2>
          <div className="h-0.5 flex-grow mx-8 bg-outline-variant/30 hidden md:block"></div>
          <div className="flex gap-3">
            <button className="w-10 h-10 rounded-full border border-outline-variant/50 flex items-center justify-center hover:bg-primary hover:text-white transition-all">
              <span className="material-symbols-outlined text-xl">chevron_left</span>
            </button>
            <button className="w-10 h-10 rounded-full border border-outline-variant/50 flex items-center justify-center hover:bg-primary hover:text-white transition-all">
              <span className="material-symbols-outlined text-xl">chevron_right</span>
            </button>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 items-center">
          {featuredMembers.map((member: any, idx: number) => {
            if (!member) return null;
            return (
              <div
                key={idx}
                className="bg-white p-4 rounded-xl flex items-center justify-center h-32 shadow-sm border border-outline-variant/20 hover:shadow-md transition-all cursor-pointer"
              >
                {member.textOnly ? (
                  <span
                    className={`font-black text-xl ${
                      member.isRed
                        ? 'text-secondary'
                        : member.isOrange
                        ? 'text-on-tertiary-container'
                        : 'text-primary'
                    }`}
                  >
                    {member.name}
                  </span>
                ) : (
                  <img
                    alt={member.name}
                    className="max-w-full max-h-full object-contain transition-all duration-300"
                    src={member.logo}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );

  const renderNews = () => (
    <Fragment>
      {/* News & Documents Section */}
      <section className="py-16 md:py-20 bg-surface-container-low border-t border-outline-variant/50">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-gutter">
          <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
            <div className="space-y-2">
              <h3 className="text-secondary font-bold uppercase tracking-[0.2em] text-xs">Điểm tin HOBA</h3>
              <h2 className="text-primary text-3xl font-black section-title-line">TIN TỨC & VĂN BẢN</h2>
            </div>
            <Link
              href="/van-ban"
              className="group flex items-center gap-2 text-primary font-bold text-xs hover:text-secondary transition-colors"
            >
              Xem toàn bộ kho tài liệu{' '}
              <span className="material-symbols-outlined text-xl transition-transform group-hover:translate-x-1.5">
                arrow_right_alt
              </span>
            </Link>
          </div>
          <div className="grid lg:grid-cols-12 gap-8 md:gap-10">
            {/* News Feed */}
            <div className="lg:col-span-8 space-y-8">
              {liveArticles[0] && (
                <article className="group grid md:grid-cols-2 gap-6 items-center bg-white rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-500">
                  <a href={liveArticles[0].slug ? `/tin-tuc/${liveArticles[0].slug}` : `/tin-tuc?id=${liveArticles[0].id}`} className="relative h-full min-h-[220px] md:min-h-[260px] overflow-hidden cursor-pointer">
                    <img
                      alt={liveArticles[0].title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      src={liveArticles[0].img}
                    />
                    {liveArticles[0].badge && (
                      <div className="absolute top-4 left-4 bg-secondary text-white px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest">
                        {liveArticles[0].badge}
                      </div>
                    )}
                  </a>
                  <div className="p-4 space-y-4">
                    <span className="text-[10px] font-bold uppercase text-secondary tracking-widest">{liveArticles[0].date}</span>
                    <a href={liveArticles[0].slug ? `/tin-tuc/${liveArticles[0].slug}` : `/tin-tuc?id=${liveArticles[0].id}`}>
                      <h3 className="text-lg font-black text-primary hover:text-secondary transition-colors leading-tight line-clamp-2 cursor-pointer mt-1">
                        {liveArticles[0].title}
                      </h3>
                    </a>
                    <p className="text-xs text-on-surface-variant leading-relaxed line-clamp-3">
                      {liveArticles[0].desc}
                    </p>
                    <a
                      href={liveArticles[0].slug ? `/tin-tuc/${liveArticles[0].slug}` : `/tin-tuc?id=${liveArticles[0].id}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:text-secondary transition-colors"
                    >
                      Đọc tiếp <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </a>
                  </div>
                </article>
              )}
              <div className="grid sm:grid-cols-2 gap-6">
                {liveArticles.slice(1).map((article: any, idx: number) => (
                  <article key={idx} className="group space-y-3 bg-white p-4 rounded-2xl border border-outline-variant/10 hover:shadow-md transition-shadow">
                    <a href={article.slug ? `/tin-tuc/${article.slug}` : `/tin-tuc?id=${article.id}`}>
                      <div className="rounded-xl overflow-hidden aspect-video shadow-sm cursor-pointer">
                        <img
                          alt={article.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          src={article.img}
                        />
                      </div>
                    </a>
                    <div className="flex items-center gap-2 text-on-surface-variant text-[10px] font-bold uppercase">
                      <span className="material-symbols-outlined text-sm">calendar_month</span> {article.date}
                    </div>
                    <a href={article.slug ? `/tin-tuc/${article.slug}` : `/tin-tuc?id=${article.id}`}>
                      <h4 className="text-sm font-bold text-primary group-hover:text-secondary transition-colors line-clamp-2 cursor-pointer">
                        {article.title}
                      </h4>
                    </a>
                    <a
                      href={article.slug ? `/tin-tuc/${article.slug}` : `/tin-tuc?id=${article.id}`}
                      className="text-primary font-bold text-[11px] flex items-center gap-1.5 hover:gap-2.5 transition-all"
                    >
                      Xem tin <span className="material-symbols-outlined text-base">arrow_right_alt</span>
                    </a>
                  </article>
                ))}
              </div>
            </div>
            {/* Documents List */}
            <div className="lg:col-span-4 bg-white/60 backdrop-blur-sm p-6 md:p-8 rounded-2xl h-fit sticky top-24 border border-outline-variant/30">
              <h3 className="text-lg font-bold text-primary mb-6 border-b border-primary/10 pb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-xl">description</span> Văn bản mới
              </h3>
              <div className="space-y-4">
                {liveDocs.map((doc: any, idx: number) => (
                  <div key={idx} className="group bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-all">
                    <div className="flex gap-3">
                      <div className={doc.color}>
                        <span className="material-symbols-outlined text-3xl">
                          {doc.type === 'pdf' ? 'picture_as_pdf' : doc.type === 'info' ? 'notification_important' : 'menu_book'}
                        </span>
                      </div>
                      <div className="flex-grow">
                        <h4 className="font-bold text-primary text-xs mb-0.5 line-clamp-1">{doc.title}</h4>
                        <p className="text-[9px] text-on-surface-variant uppercase tracking-widest mb-2">Ngày: {doc.date}</p>
                        <Link href="/van-ban" className="text-[10px] font-bold text-secondary flex items-center gap-1 hover:underline cursor-pointer">
                          <span className="material-symbols-outlined text-xs">download</span> Tải tài liệu
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Link
                href="/van-ban"
                className="w-full mt-8 py-3 border-2 border-primary text-primary font-bold text-xs rounded-xl hover:bg-primary hover:text-white transition-all inline-block text-center"
              >
                Xem toàn bộ văn bản
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Event & Training Section */}
      <section className="py-16 md:py-20 bg-primary text-white overflow-hidden">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-gutter">
          <div className="grid lg:grid-cols-2 gap-12 md:gap-20 items-center">
            <div className="space-y-6">
              <div className="space-y-3">
                <h3 className="text-secondary-fixed-dim font-bold uppercase tracking-[0.2em] text-xs">Hành trình kết nối</h3>
                <h2 className="text-white text-3xl md:text-5xl font-black leading-tight">SỰ KIỆN <br /> & ĐÀO TẠO</h2>
              </div>
              <p className="text-sm md:text-base text-white/70 font-medium">Đăng ký tham gia để không bỏ lỡ các cơ hội hợp tác và kiến thức chuyên môn mới nhất.</p>
              <div className="space-y-3">
                {liveEvents.map((event: any, idx: number) => (
                  <a href={event.slug ? `/su-kien/${event.slug}` : `/su-kien?id=${event.id}`} key={idx} className="group flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer text-left block">
                    <div className={`flex-shrink-0 w-16 h-16 rounded-xl flex flex-col items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform ${event.isUpcoming ? 'bg-secondary' : 'bg-white/10 border border-white/20'}`}>
                      <span className="text-xl font-black">{event.day}</span>
                      <span className="text-[8px] font-bold uppercase">{event.month}</span>
                    </div>
                    <div className="flex-grow">
                      <h4 className="text-base font-bold mb-0.5">{event.title}</h4>
                      <div className="flex gap-3 text-white/60 text-xs">
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">schedule</span> {event.time}
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">location_on</span> {event.location}
                        </span>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-sm opacity-0 group-hover:opacity-100 transition-opacity">arrow_forward_ios</span>
                  </a>
                ))}
              </div>
              <a href="/su-kien" className="text-white font-bold text-xs underline underline-offset-4 hover:text-secondary transition-colors inline-block">
                Xem lịch sự kiện chi tiết
              </a>
            </div>
            <div className="relative">
              <div className="aspect-[4/5] max-h-[500px] rounded-3xl overflow-hidden shadow-xl relative">
                <img
                  alt="Event Speaker"
                  className="w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCKsH5RYaymmBXwBYB4zyRhQroDyJz9EeXqIpkdYzvcWQakwnGtExjxW1twLP6-Wof89mA1uyf_iwqE4-MMSBVbWDe4pWEGUKOFXvOUmM8lu9XOVAKPo6JZh2p-o-AUk9E-lzTvSQ1RPPxPRbpUiLaq9mUcLLg52RWVcFO2WJVXjtMQg9EGzYOa_NfWzhWv1PTapeEkyt-eTpGT-gJQUJxoZm16sPHodja2eQ_NxuUYjnivworCpTrWW3R0rj_VrxjZko7l4VwBp_4"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-transparent"></div>
                <div className="absolute bottom-6 left-6 right-6 p-6 glass-card rounded-xl border-white/10">
                  <span className="inline-block bg-secondary text-white text-[9px] font-bold uppercase px-2 py-0.5 rounded-full mb-2">Sắp diễn ra</span>
                  <h4 className="text-lg font-bold mb-1">Diễn đàn an toàn LPG 2026</h4>
                  <p className="text-xs text-white/70 mb-4 line-clamp-2">Sự kiện lớn nhất năm thu hút hơn 300 chuyên gia và lãnh đạo doanh nghiệp.</p>
                  <button className="w-full py-2.5 bg-white text-primary font-bold text-xs rounded-lg hover:bg-secondary hover:text-white transition-all">Đăng ký ngay</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Fragment>
  );

  return (
    <div className="flex flex-col w-full overflow-x-hidden">
      <title>HOBA LPG - Hiệp hội Kinh doanh Khí hóa lỏng TP.HCM</title>
      <meta name="description" content="Hiệp hội Gas đô thị và Công nghiệp TP.HCM (HOBA) — Ngôi nhà chung của cộng đồng doanh nghiệp LPG, cam kết đồng hành cùng sự an toàn, chuyên nghiệp và thịnh vượng." />
      {sections.map((sec: any) => {
        if (!sec.visible) return null;
        switch (sec.id) {
          case 'hero':
            return <Fragment key="hero">{renderHero()}</Fragment>;
          case 'stats':
            return <Fragment key="stats">{renderStats()}</Fragment>;
          case 'services':
            return <Fragment key="services">{renderServices()}</Fragment>;
          case 'members':
            return <Fragment key="members">{renderMembers()}</Fragment>;
          case 'news':
            return <Fragment key="news">{renderNews()}</Fragment>;
          default:
            return null;
        }
      })}

      {/* Powerful Call to Action */}
      <section className="relative py-20 md:py-24 overflow-hidden bg-primary">
        <div className="absolute inset-0 z-0">
          <img
            alt="CTA Background"
            className="w-full h-full object-cover opacity-20 scale-110"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDtrEUOeUejLtAHvY9pwxtY6G6FIV_7vg7nLmKtnOr-Kab1h9ajfDd-Gl2m5LT6aZTPM8wS8mhAoeNHcUtwLBTFiPVuaEZv6Ts9BAtkfJydo1ee_3vRgk4ndaEk4GtVoO3X142CwBXZz4wILHQOV3kSdMeT4ogQP-09QOUdHnhPSUsGmvBfoOjViaB9jpDG5PmQsy0SSgqbVHnIlspb80IJazWJMxWXFB6pTmhL8rVmbyRUBtzDm8oxiis8RjSy-tdTM78j9mw1H80"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-primary/80 to-primary"></div>
        </div>
        <div className="relative z-10 max-w-container-max mx-auto px-margin-mobile md:px-gutter text-center">
          <div className="w-20 h-20 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center mx-auto mb-8 border border-white/20">
            <span className="material-symbols-outlined text-4xl text-white">diversity_3</span>
          </div>
          <h2 className="text-2xl md:text-3xl lg:text-5xl font-black text-white mb-4 leading-tight max-w-3xl mx-auto">
            SẴN SÀNG ĐỒNG HÀNH CÙNG <br /> CỘNG ĐỒNG LPG TP.HCM?
          </h2>
          <p className="text-xs md:text-sm text-white/70 mb-10 max-w-xl mx-auto font-medium">
            Gia nhập HOBA để xây dựng một thị trường an toàn, minh bạch và dẫn đầu xu hướng năng lượng sạch.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/dang-ky"
              className="bg-secondary text-white px-8 py-3 rounded-full font-bold text-xs hover:bg-[#93000d] transition-all hover:scale-105 shadow-lg"
            >
              Gia nhập ngay
            </Link>
            <Link
              href="/gioi-thieu"
              className="border-2 border-white/40 text-white px-8 py-3 rounded-full font-bold text-xs hover:bg-white/10 transition-all"
            >
              Liên hệ văn phòng
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
