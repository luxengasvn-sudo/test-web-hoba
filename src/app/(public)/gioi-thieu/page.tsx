'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function AboutPage() {
  const [values, setValues] = useState([
    {
      title: 'Sứ mệnh',
      desc: 'Kết nối – Đồng hành – Phát triển ngành LPG an toàn, bền vững và hiệu quả.',
      icon: 'ads_click'
    },
    {
      title: 'Tầm nhìn',
      desc: 'Trở thành tổ chức uy tín, đại diện cho cộng đồng doanh nghiệp LPG hàng đầu Việt Nam.',
      icon: 'visibility'
    },
    {
      title: 'Giá trị cốt lõi',
      desc: 'Minh bạch – Hợp tác – Chuyên nghiệp – Trách nhiệm cộng đồng.',
      icon: 'diamond'
    }
  ]);

  const [overview, setOverview] = useState(
    'Hiệp hội Gas đô thị và Công nghiệp TP.HCM (HOBA) là tổ chức xã hội – nghề nghiệp tự nguyện của các doanh nghiệp hoạt động trong lĩnh vực sản xuất, kinh doanh, kinh doanh LPG và các sản phẩm, dịch vụ liên quan trên địa bàn Thành phố Hồ Chí Minh. HOBA là cầu nối giữa cộng đồng doanh nghiệp với cơ quan quản lý và các bên liên quan, góp phần xây dựng môi trường kinh doanh minh bạch, an toàn và bền vững cho ngành LPG.'
  );

  const [timeline, setTimeline] = useState([
    {
      date: '12/4/2025',
      title: 'Hiệp hội Kinh doanh khí hóa lỏng (gas) tỉnh Bình Dương',
      desc: 'Mốc thời gian thành lập đầu tiên.',
      icon: 'flag'
    },
    {
      date: 'Tháng 11',
      title: 'HIỆP HỘI KHÍ HÓA LỎNG THÀNH PHỐ HỒ CHÍ MINH',
      desc: 'Mốc thời gian đổi tên chính thức và chuyển đổi mô hình hoạt động.',
      icon: 'groups'
    }
  ]);

  const [orgStructure, setOrgStructure] = useState([
    {
      title: 'Ban chấp hành',
      desc: 'Định hướng chiến lược, điều hành hoạt động của hiệp hội.',
      icon: 'account_balance'
    },
    {
      title: 'Văn phòng hiệp hội',
      desc: 'Tham mưu, quản lý, triển khai các hoạt động thường xuyên.',
      icon: 'corporate_fare'
    },
    {
      title: 'Ban chuyên môn',
      desc: 'Các tiểu ban: An toàn, Pháp lý, Đào tạo, Truyền thông.',
      icon: 'settings_suggest'
    },
    {
      title: 'Hội viên doanh nghiệp',
      desc: 'Các doanh nghiệp sản xuất, kinh doanh LPG trên địa bàn.',
      icon: 'domain_verification'
    }
  ]);

  const [heroImage, setHeroImage] = useState('https://lh3.googleusercontent.com/aida-public/AB6AXuCeZY8qdtczKmDT8VWnqLO1d2HQnkLJzPIAfexewwIjyrQK8F7-4mBaOrm4ZgQC3M-Ds7uNERwunFsK0tdzC_FNnhKGj3MDNQGdMmsGYiu3P88aKaxZ1ef_ZLyAz8WHtV_9OVzgd3cqoYhJAmqCGevUYZzhz9TnTOXDvZN5-Q-Va8Pm7y0BEtl2KMdZbYGKcuqlQ91wD8LWNDUb4p6WIxArZwc7p5TahTv0JMoEPbkCDBfB6xf8pe3cgmU-vGVEAza1fjGbgfB3Y3I');
  const [heroTitle, setHeroTitle] = useState('Giới thiệu HOBA');
  const [heroDesc, setHeroDesc] = useState('Hiệp hội Gas đô thị và Công nghiệp TP.HCM (HOBA) — Kết nối doanh nghiệp, đồng hành phát triển vì ngành LPG an toàn và bền vững.');
  const [overviewImage, setOverviewImage] = useState('https://lh3.googleusercontent.com/aida-public/AB6AXuA81hf5thmvBeYX2uBrxECeHNkAaZYnQEa5EMiRa7lwAzBGz3sI199whSRpFljMrgqBb13QPBj8m2g4cvIOwwp2C1Stt0_xzB4gl1vg4cKslAmhHN-WsTrN8xPZPkENHCkFPXncKXPnko9exmy70Q0joojrdU-7ZfGs_f95dk2mfS5sgzOhe4jST1ZHwBUmt9pUzlRmUl0bdhBlQnUA2yMAuFINhU4E_Wljat6wjQkLcFnrOtFAgI_ncw2i-VOpMpdtKxbP7sgqEhw');

  const [whyJoinReasons, setWhyJoinReasons] = useState([
    { title: 'Kết nối cộng đồng', desc: 'Mở rộng mạng lưới, kết nối với các đối tác hàng đầu trong ngành.', icon: 'hub' },
    { title: 'Cập nhật chính sách', desc: 'Nắm bắt kịp thời các quy định pháp luật và thông tin thị trường mới nhất.', icon: 'description' },
    { title: 'Nâng cao năng lực', desc: 'Tham gia các khóa đào tạo chuyên sâu và hội thảo nâng cao tay nghề.', icon: 'school' },
    { title: 'Hợp tác bền vững', desc: 'Tăng cường hợp tác, hỗ trợ lẫn nhau trong kinh doanh và xử lý rủi ro.', icon: 'handshake' }
  ]);

  const mockActiveMembers = [
    { id: 'sp1', company_name: 'SAIGON PETRO', logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBtDGTvdJ19cl1DQ6D7LXKmSKBBDM3QA1PXK1G6sPwNWYnjcsOFxgcr_csrc7eO9T2-HDyx4CoYu_8jilw90lGs-Gkv8Z4UxkyUkXMSH4P9cTSblMxAT998NsFL3fPHEYtpPUCvt3LS76HaPjX0tBgShkXRlfxtZ44vp8lXHZeCta-iXZKVlqSQxn6PH1BDE8eVJJwgce8Z4IgJmyJA7P5XBbwQBwuZpeOAuDcWVkUpV5zfI_BA7ckRd_YCZtprpFrW9S5RTsLiY8Y' },
    { id: 'cg1', company_name: 'CITY GAS', logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC0CYI2i9y9FBRcVafla8k_uA6-q6YUwCQ1nsIqp9GJraKX1HrdJo8DjcF3_DAH6DFiQjT8p17ol4-fZshaUWWGgddF4FbW__HrifyVlzuSnj2RNTq671M2AffFgAirU-9SR3X6qSQOGvJ2UUASF2JCLzEQ0R8scEuEByatNXkGCfdLzKhExXKRcapKdAvO0UJ8C1dc0C3i5dKKkhuqrNmefu1ateTTzShv8BgPIdFnPyvkppj4EFzWUr3nr7nJLaPQCHZ-VzPKXr8' },
    { id: 'vg1', company_name: 'VT-GAS', logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC7eTnvK5aYgdRpQ7r0JrThIhssN0j12GcjAzcrszxjSAtC1JzdscsKEliCTSujgiOjdIduDejriCsmUzgC_jBK4p0R8HAqKoKN5vfBScoDvHnjlazdSDRe3RS2RBm5E0sZPVn48gGk8Z4RYAi8__gyoBMqDSd2Tg_f88VrVSZn6DO26vy0EwdmJljaS9q11ROrep_qQfOz7Ny6V2XBa8ia5yjLujsw4TSYMRx7OF6mB13nu2XoEx9EiyUBJomlpAF9oX3C2n3a6x4' },
    { id: 'pv1', company_name: 'PETROVIETNAM GAS', logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBwWtf74gYhtlAq1IS1hNQ5pLt7PUyB5KUTbLhgRYv6HnE6oV_u_57wH3tzf7Gu632sw0dDOEGwPcVE9yeyW9nsoSKIYu6zhAnbBNLs_DAMN586bdG_Go0iluqSQSqfzXCkhA6V7FX6c26NfP5RxfXr_v80Y2xIdgeLNu-T-w8aqpnVxVdfLNKXLMrB1VRrMgB_l_1ovROIijGMRTcnJSxHCl2NBnEkiom8SJaaYm29JQdL9cUuZ6FLXiVcFjMeMtcUCUUGAtXcCeg' },
    { id: 'bm1', company_name: 'BINH MINH ENERGY', logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD1p0v3-44vz10qrmIHA53j7oMkCHzMVTMi5RiGUaylSuVWs9pv-OCq2L2wYHeAumF4kaa_jC97eMHBp9ULCITYP3pv58yMcUnlbyEAb7TpNQekXTlPruB3TmkvQbLogChaztNMoyNxYFHv3c0LRXMwwZDUjCGrLDVqyIJ7kbw9mCF-zL9q7bJNwr67OTVgY8Tgjn_szspCSyNxiRZIm26DU799H-Na5x--fvXe_XpEaj0puYvKfuzKou2VM_UXG1K8cj-7Jx4DTTc' },
    { id: 'vc1', company_name: 'VIPCO', logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBZpcPDOgvB4aa_20YveL9ydc5ZGz3e8LnSvzQG4FXaJIFdU5ZbWueUPLZQTBPsoLbIL4Drm32xlDbKpgHcxWlkpaVoHvMAni-zTPhV095xHNedL5LcAzMW8gF5jYyGhhtklq6tYZjQ_C-IBiADh13sRgUREZQswv22-z0qJdIrnMlFLXJQaoEY5vzwBzSA-S51cM39LVaVPYWR6orgIxst1DF5oFTdJDJi_GPNGACmXyJqPXQt6iktYG9_lWfwOMdSn80nyxUL0_o' }
  ];

  const [featuredMembers, setFeaturedMembers] = useState<any[]>([
    { name: 'PETROVIETNAM GAS', logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBwWtf74gYhtlAq1IS1hNQ5pLt7PUyB5KUTbLhgRYv6HnE6oV_u_57wH3tzf7Gu632sw0dDOEGwPcVE9yeyW9nsoSKIYu6zhAnbBNLs_DAMN586bdG_Go0iluqSQSqfzXCkhA6V7FX6c26NfP5RxfXr_v80Y2xIdgeLNu-T-w8aqpnVxVdfLNKXLMrB1VRrMgB_l_1ovROIijGMRTcnJSxHCl2NBnEkiom8SJaaYm29JQdL9cUuZ6FLXiVcFjMeMtcUCUUGAtXcCeg' },
    { name: 'SAIGON PETRO', logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBtDGTvdJ19cl1DQ6D7LXKmSKBBDM3QA1PXK1G6sPwNWYnjcsOFxgcr_csrc7eO9T2-HDyx4CoYu_8jilw90lGs-Gkv8Z4UxkyUkXMSH4P9cTSblMxAT998NsFL3fPHEYtpPUCvt3LS76HaPjX0tBgShkXRlfxtZ44vp8lXHZeCta-iXZKVlqSQxn6PH1BDE8eVJJwgce8Z4IgJmyJA7P5XBbwQBwuZpeOAuDcWVkUpV5zfI_BA7ckRd_YCZtprpFrW9S5RTsLiY8Y' },
    { name: 'CITY GAS', logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC0CYI2i9y9FBRcVafla8k_uA6-q6YUwCQ1nsIqp9GJraKX1HrdJo8DjcF3_DAH6DFiQjT8p17ol4-fZshaUWWGgddF4FbW__HrifyVlzuSnj2RNTq671M2AffFgAirU-9SR3X6qSQOGvJ2UUASF2JCLzEQ0R8scEuEByatNXkGCfdLzKhExXKRcapKdAvO0UJ8C1dc0C3i5dKKkhuqrNmefu1ateTTzShv8BgPIdFnPyvkppj4EFzWUr3nr7nJLaPQCHZ-VzPKXr8' },
    { name: 'VIP GAS', logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBtD7KPj-wpnAJbjv9HGB6i7HVdkeuLYCkhNuh9gx83bpbn8JCLDzg6A8EGpsG4gEBIGFsgomCgqi8h9HIYhIvEWff9EaMmYAp6OB90lDQCBYJNf-qeb9Ghz-Lu0i6bszNFF2ncQ9P-7M9mXA0Z_eC-36E90W92Y8NTuji9OjMbKuJrCB91aHdgS0v34nquMqpwKHx6fWzQaSeJgm9A2wJ2GUvG6zsJvJ6r5wOJs6YuWKv5E-uqXQisx-vmGenWsUuww5Miy8AVhAw' },
    { name: 'BINH MINH ENERGY', logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD1p0v3-44vz10qrmIHA53j7oMkCHzMVTMi5RiGUaylSuVWs9pv-OCq2L2wYHeAumF4kaa_jC97eMHBp9ULCITYP3pv58yMcUnlbyEAb7TpNQekXTlPruB3TmkvQbLogChaztNMoyNxYFHv3c0LRXMwwZDUjCGrLDVqyIJ7kbw9mCF-zL9q7bJNwr67OTVgY8Tgjn_szspCSyNxiRZIm26DU799H-Na5x--fvXe_XpEaj0puYvKfuzKou2VM_UXG1K8cj-7Jx4DTTc' },
    { name: 'VIPCO', logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBZpcPDOgvB4aa_20YveL9ydc5ZGz3e8LnSvzQG4FXaJIFdU5ZbWueUPLZQTBPsoLbIL4Drm32xlDbKpgHcxWlkpaVoHvMAni-zTPhV095xHNedL5LcAzMW8gF5jYyGhhtklq6tYZjQ_C-IBiADh13sRgUREZQswv22-z0qJdIrnMlFLXJQaoEY5vzwBzSA-S51cM39LVaVPYWR6orgIxst1DF5oFTdJDJi_GPNGACmXyJqPXQt6iktYG9_lWfwOMdSn80nyxUL0_o' }
  ]);

  const [sections, setSections] = useState([
    { id: 'hero', name: '1. Banner trang Giới thiệu', visible: true },
    { id: 'overview', name: '2. Tổng quan về HOBA', visible: true },
    { id: 'values', name: '3. Sứ mệnh - Tầm nhìn - Giá trị', visible: true },
    { id: 'timeline', name: '4. Lịch sử phát triển / Timeline', visible: true },
    { id: 'org', name: '5. Cơ cấu tổ chức', visible: true },
    { id: 'whyjoin', name: '6. Vì sao tham gia HOBA?', visible: true },
    { id: 'members', name: '7. Hội viên tiêu biểu', visible: true },
  ]);

  useEffect(() => {
    async function loadAboutData() {
      const saved = !supabase ? localStorage.getItem('hoba_website_config_aboutpage') : null;
      let val: any = null;
      if (saved) {
        try {
          val = JSON.parse(saved);
        } catch (e) {}
      }

      if (supabase && !val) {
        try {
          const { data, error } = await supabase
            .from('website_config')
            .select('value')
            .eq('key', 'aboutpage')
            .single();
          if (!error && data?.value) {
            val = data.value;
          }
        } catch (err) {
          console.error('Lỗi khi tải dữ liệu giới thiệu từ Supabase:', err);
        }
      }

      if (val) {
        if (val.overview) setOverview(val.overview);
        if (val.milestones) setTimeline(val.milestones);
        if (val.values) setValues(val.values);
        if (val.orgStructure) setOrgStructure(val.orgStructure);
        if (val.heroImage) setHeroImage(val.heroImage);
        if (val.heroTitle) setHeroTitle(val.heroTitle);
        if (val.heroDesc) setHeroDesc(val.heroDesc);
        if (val.overviewImage) setOverviewImage(val.overviewImage);
        if (val.whyJoinReasons) setWhyJoinReasons(val.whyJoinReasons);
        if (val.sections) setSections(val.sections);

        // Fetch active members to resolve featured members
        let resolvedMembers: any[] = [];
        if (supabase) {
          try {
            const { data: membersDb } = await supabase
              .from('members')
              .select('*')
              .eq('status', 'Active');
            if (membersDb && membersDb.length > 0) {
              resolvedMembers = membersDb.map(d => ({
                id: d.id,
                name: d.company_name,
                logo: d.license_file_url || 'https://lh3.googleusercontent.com/aida-public/AB6AXuBwWtf74gYhtlAq1IS1hNQ5pLt7PUyB5KUTbLhgRYv6HnE6oV_u_57wH3tzf7Gu632sw0dDOEGwPcVE9yeyW9nsoSKIYu6zhAnbBNLs_DAMN586bdG_Go0iluqSQSqfzXCkhA6V7FX6c26NfP5RxfXr_v80Y2xIdgeLNu-T-w8aqpnVxVdfLNKXLMrB1VRrMgB_l_1ovROIijGMRTcnJSxHCl2NBnEkiom8SJaaYm29JQdL9cUuZ6FLXiVcFjMeMtcUCUUGAtXcCeg'
              }));
            }
          } catch (e) {}
        }

        if (resolvedMembers.length === 0) {
          resolvedMembers = mockActiveMembers.map(m => ({ id: m.id, name: m.company_name, logo: m.logo }));
        }

        // Fetch featured members from the dedicated configuration first
        let loadedFeaturedMembers: any[] = [];
        if (!supabase) {
          const savedFeatured = localStorage.getItem('hoba_website_config_featured_members');
          if (savedFeatured) {
            try {
              loadedFeaturedMembers = JSON.parse(savedFeatured);
            } catch (_) {}
          }
        } else {
          try {
            const { data: featuredData } = await supabase
              .from('website_config')
              .select('value')
              .eq('key', 'featured_members')
              .single();
            if (featuredData?.value && Array.isArray(featuredData.value)) {
              loadedFeaturedMembers = featuredData.value;
            }
          } catch (_) {}
        }

        if (loadedFeaturedMembers && loadedFeaturedMembers.length > 0) {
          setFeaturedMembers(loadedFeaturedMembers);
        } else if (val) {
          if (val.featuredMembers && Array.isArray(val.featuredMembers)) {
            setFeaturedMembers(val.featuredMembers);
          } else if (val.featuredMemberIds && Array.isArray(val.featuredMemberIds)) {
            const sorted = val.featuredMemberIds.map((id: string) => {
              return resolvedMembers.find((m: any) => m.id === id);
            }).filter(Boolean);
            if (sorted.length > 0) {
              setFeaturedMembers(sorted);
            }
          }
        }
      }
    }
    loadAboutData();
  }, []);

  const renderSection = (secId: string) => {
    switch (secId) {
      case 'hero':
        return (
          <section key="hero" className="relative h-[400px] w-full flex items-center overflow-hidden">
            <div className="absolute inset-0 bg-primary/60 z-10"></div>
            <img
              className="absolute inset-0 w-full h-full object-cover"
              alt="A panoramic view of an industrial gas facility"
              src={heroImage}
            />
            <div className="relative z-20 max-w-container-max mx-auto px-margin-mobile md:px-gutter w-full text-white">
              <div className="flex items-center gap-2 text-xs mb-4 opacity-80">
                <Link href="/" className="hover:underline">Trang chủ</Link>
                <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                <span>Giới thiệu</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black mb-4">{heroTitle}</h1>
              <p className="text-base md:text-lg max-w-2xl opacity-90 leading-relaxed font-medium">
                {heroDesc}
              </p>
            </div>
          </section>
        );
      case 'overview':
        return (
          <section key="overview" className="py-16 md:py-24 bg-white">
            <div className="max-w-container-max mx-auto px-margin-mobile md:px-gutter">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div className="relative rounded-xl overflow-hidden shadow-sm group">
                  <img
                    className="w-full aspect-video object-cover transition-transform duration-500 group-hover:scale-105"
                    alt="A professional conference room meeting"
                    src={overviewImage}
                  />
                  <div className="absolute inset-0 border border-primary/10 rounded-xl pointer-events-none"></div>
                </div>
                <div className="space-y-6">
                  <h2 className="text-2xl md:text-3xl font-bold text-primary border-l-4 border-secondary pl-4">Tổng quan về HOBA</h2>
                  <div className="text-sm text-on-surface-variant space-y-4 leading-relaxed whitespace-pre-line">
                    <p>
                      {overview}
                    </p>
                  </div>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                    <li className="flex items-center gap-3">
                      <span className="material-symbols-outlined filled-icon text-primary bg-primary-fixed p-2 rounded-full">handshake</span>
                      <span className="text-xs font-bold">Kết nối doanh nghiệp</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="material-symbols-outlined filled-icon text-primary bg-primary-fixed p-2 rounded-full">campaign</span>
                      <span className="text-xs font-bold">Đại diện tiếng nói ngành</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="material-symbols-outlined filled-icon text-primary bg-primary-fixed p-2 rounded-full">share</span>
                      <span className="text-xs font-bold">Chia sẻ thông tin</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="material-symbols-outlined filled-icon text-primary bg-primary-fixed p-2 rounded-full">verified_user</span>
                      <span className="text-xs font-bold">Thúc đẩy an toàn</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>
        );
      case 'values':
        return (
          <section key="values" className="py-16 md:py-24 bg-surface-container-low">
            <div className="max-w-container-max mx-auto px-margin-mobile md:px-gutter text-center">
              <h2 className="text-2xl md:text-3xl font-bold text-primary mb-12">Sứ mệnh – Tầm nhìn – Giá trị cốt lõi</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {values.map((val, idx) => (
                  <div key={idx} className="p-8 bg-white border border-outline-variant/50 rounded-xl hover:shadow-lg transition-all group">
                    <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-secondary-container transition-colors">
                      <span className="material-symbols-outlined text-3xl">{val.icon}</span>
                    </div>
                    <h3 className="text-lg font-bold text-primary mb-4">{val.title}</h3>
                    <p className="text-xs text-on-surface-variant leading-relaxed">{val.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );
      case 'timeline':
        return (
          <section key="timeline" className="py-16 md:py-24 bg-white overflow-hidden">
            <div className="max-w-container-max mx-auto px-margin-mobile md:px-gutter">
              <div className="text-center mb-16">
                <h2 className="text-2xl md:text-3xl font-bold text-primary">Quá trình hình thành & phát triển</h2>
              </div>
              {/* Desktop Timeline */}
              <div className="relative hidden md:block mb-12 overflow-x-auto no-scrollbar py-4">
                <div className="flex flex-row justify-center items-start gap-12 relative z-10 min-w-max px-8 font-sans">
                  {timeline.map((item, idx) => (
                    <div key={idx} className="flex flex-col items-center text-center w-64 relative group">
                      {/* Connector line between steps */}
                      {idx < timeline.length - 1 && (
                        <div className="absolute top-6 left-[60%] right-[-60%] h-0.5 border-t-2 border-dashed border-outline-variant z-0 pointer-events-none"></div>
                      )}
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ring-4 ring-white mb-6 z-10 relative ${idx === 0 ? 'bg-primary text-white' : 'bg-white border-2 border-primary text-primary'}`}>
                        <span className="material-symbols-outlined">{item.icon || 'flag'}</span>
                      </div>
                      <span className="text-xl font-bold text-primary mb-2">{item.date}</span>
                      <h4 className="text-xs font-bold mb-2 max-w-xs">{item.title}</h4>
                      <p className="text-xs text-on-surface-variant px-4">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
              {/* Mobile Vertical Timeline */}
              <div className="md:hidden space-y-8 border-l-2 border-dashed border-outline-variant ml-6 pl-8 relative">
                {timeline.map((item, idx) => (
                  <div key={idx} className="relative pl-2">
                    <div className={`absolute -left-[54px] top-0.5 w-10 h-10 rounded-full flex items-center justify-center ring-4 ring-white ${idx === 0 ? 'bg-primary text-white' : 'bg-white border-2 border-primary text-primary'}`}>
                      <span className="material-symbols-outlined text-base">{item.icon || 'flag'}</span>
                    </div>
                    <span className="text-lg font-bold text-primary">{item.date}</span>
                    <h4 className="text-xs font-bold mt-1">{item.title}</h4>
                    <p className="text-xs text-on-surface-variant mt-2">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );
      case 'org':
        return (
          <section key="org" className="py-16 md:py-24 bg-surface-container-low">
            <div className="max-w-container-max mx-auto px-margin-mobile md:px-gutter text-center">
              <h2 className="text-2xl md:text-3xl font-bold text-primary mb-12">Cơ cấu tổ chức</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {orgStructure.map((org, idx) => (
                  <div key={idx} className="p-6 border border-outline-variant bg-white rounded-xl hover:border-primary transition-colors">
                    <span className="material-symbols-outlined text-4xl text-primary mb-4">{org.icon}</span>
                    <h4 className="text-xs font-bold text-on-surface mb-2">{org.title}</h4>
                    <p className="text-[11px] text-on-surface-variant leading-relaxed">{org.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );
      case 'whyjoin':
        return (
          <section key="whyjoin" className="py-16 md:py-24 bg-primary text-white">
            <div className="max-w-container-max mx-auto px-margin-mobile md:px-gutter">
              <div className="text-center mb-12">
                <h2 className="text-2xl md:text-3xl font-bold mb-4">Vì sao doanh nghiệp tham gia HOBA?</h2>
                <p className="text-sm opacity-80 max-w-2xl mx-auto">Gia nhập cộng đồng để cùng kiến tạo giá trị và phát triển vững mạnh hơn.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {whyJoinReasons.map((reason, idx) => (
                  <div key={idx} className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20 hover:bg-white/20 transition-all">
                    <span className="material-symbols-outlined text-4xl mb-4">{reason.icon || 'hub'}</span>
                    <h4 className="text-base font-bold mb-2">{reason.title}</h4>
                    <p className="text-xs opacity-80 leading-relaxed">{reason.desc}</p>
                  </div>
                ))}
              </div>
              <div className="mt-12 text-center">
                <Link
                  href="/dang-ky"
                  className="bg-secondary text-white px-10 py-4 rounded-xl font-bold text-base shadow-lg hover:shadow-xl transition-all inline-flex items-center gap-2"
                >
                  Đăng ký hội viên ngay <span className="material-symbols-outlined">arrow_forward</span>
                </Link>
              </div>
            </div>
          </section>
        );
      case 'members':
        return (
          <section key="members" className="py-16 bg-white">
            <div className="max-w-container-max mx-auto px-margin-mobile md:px-gutter text-center">
              <h2 className="text-2xl font-bold text-primary mb-12">Hội viên tiêu biểu</h2>
              <div className="flex gap-6 overflow-x-auto no-scrollbar py-4 items-center justify-start">
                {featuredMembers.map((member, idx) => {
                  if (!member) return null;
                  return (
                    <div
                      key={idx}
                      title={member.name}
                      className="flex-shrink-0 w-44 bg-white p-3 rounded-xl flex items-center justify-center h-28 shadow-sm border border-outline-variant/20 hover:shadow-md transition-shadow cursor-pointer"
                    >
                      {member.textOnly ? (
                        <span
                          className={`font-black text-lg ${
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
                          className="w-full h-full object-contain filter grayscale hover:grayscale-0 transition-all duration-300"
                          alt={member.name}
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
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col w-full overflow-x-hidden">
      <title>Giới thiệu | HOBA LPG</title>
      <meta name="description" content="Hiệp hội Gas đô thị và Công nghiệp TP.HCM (HOBA) — Sứ mệnh, tầm nhìn, giá trị cốt lõi, cơ cấu tổ chức và quá trình phát triển." />
      {sections.filter(sec => sec.visible).map(sec => renderSection(sec.id))}
    </div>
  );
}
