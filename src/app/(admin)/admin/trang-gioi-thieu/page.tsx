'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function AdminTrangGioiThieu() {
  const [overview, setOverview] = useState(
    'Hiệp hội Gas đô thị và Công nghiệp TP.HCM (HOBA) là tổ chức xã hội – nghề nghiệp tự nguyện của các doanh nghiệp hoạt động trong lĩnh vực sản xuất, kinh doanh, kinh doanh LPG và các sản phẩm, dịch vụ liên quan trên địa bàn Thành phố Hồ Chí Minh.'
  );

  const [milestones, setMilestones] = useState([
    { id: 'm1', date: '12/4/2025', title: 'Hiệp hội Kinh doanh khí hóa lỏng (gas) tỉnh Bình Dương', desc: 'Mốc thời gian thành lập đầu tiên.', icon: 'flag' },
    { id: 'm2', date: 'Tháng 11', title: 'HIỆP HỘI KHÍ HÓA LỎNG THÀNH PHỐ HỒ CHÍ MINH', desc: 'Mốc thời gian đổi tên chính thức.', icon: 'groups' }
  ]);

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

  const [showToast, setShowToast] = useState(false);
  const [heroImage, setHeroImage] = useState('https://lh3.googleusercontent.com/aida-public/AB6AXuCeZY8qdtczKmDT8VWnqLO1d2HQnkLJzPIAfexewwIjyrQK8F7-4mBaOrm4ZgQC3M-Ds7uNERwunFsK0tdzC_FNnhKGj3MDNQGdMmsGYiu3P88aKaxZ1ef_ZLyAz8WHtV_9OVzgd3cqoYhJAmqCGevUYZzhz9TnTOXDvZN5-Q-Va8Pm7y0BEtl2KMdZbYGKcuqlQ91wD8LWNDUb4p6WIxArZwc7p5TahTv0JMoEPbkCDBfB6xf8pe3cgmU-vGVEAza1fjGbgfB3Y3I');
  const [heroTitle, setHeroTitle] = useState('Giới thiệu HOBA');
  const [heroDesc, setHeroDesc] = useState('Hiệp hội Gas đô thị và Công nghiệp TP.HCM (HOBA) — Kết nối doanh nghiệp, đồng hành phát triển vì ngành LPG an toàn và bền vững.');
  const [overviewImage, setOverviewImage] = useState('https://lh3.googleusercontent.com/aida-public/AB6AXuA81hf5thmvBeYX2uBrxECeHNkAaZYnQEa5EMiRa7lwAzBGz3sI199whSRpFljMrgqBb13QPBj8m2g4cvIOwwp2C1Stt0_xzB4gl1vg4cKslAmhHN-WsTrN8xPZPkENHCkFPXncKXPnko9exmy70Q0joojrdU-7ZfGs_f95dk2mfS5sgzOhe4jST1ZHwBUmt9pUzlRmUl0bdhBlQnUA2yMAuFINhU4E_Wljat6wjQkLcFnrOtFAgI_ncw2i-VOpMpdtKxbP7sgqEhw');
  const [heroUploading, setHeroUploading] = useState(false);
  const [overviewUploading, setOverviewUploading] = useState(false);

  const [whyJoinReasons, setWhyJoinReasons] = useState([
    { title: 'Kết nối cộng đồng', desc: 'Mở rộng mạng lưới, kết nối với các đối tác hàng đầu trong ngành.', icon: 'hub' },
    { title: 'Cập nhật chính sách', desc: 'Nắm bắt kịp thời các quy định pháp luật và thông tin thị trường mới nhất.', icon: 'description' },
    { title: 'Nâng cao năng lực', desc: 'Tham gia các khóa đào tạo chuyên sâu và hội thảo nâng cao tay nghề.', icon: 'school' },
    { title: 'Hợp tác bền vững', desc: 'Tăng cường hợp tác, hỗ trợ lẫn nhau trong kinh doanh và xử lý rủi ro.', icon: 'handshake' }
  ]);

  const mockActiveMembers = [
    { id: 'sp1', company_name: 'Saigon Petro' },
    { id: 'cg1', company_name: 'City Gas' },
    { id: 'vg1', company_name: 'VT-Gas' },
    { id: 'pv1', company_name: 'PV GAS South' },
    { id: 'bm1', company_name: 'Binh Minh Energy' },
    { id: 'vc1', company_name: 'VIPCO' }
  ];
  const [activeMembers, setActiveMembers] = useState<any[]>(mockActiveMembers);
  const [featuredMembers, setFeaturedMembers] = useState<any[]>([
    { id: 'sp1', name: 'Saigon Petro', logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCUSaADTHuO0LeW68laxKr1qy5yC1GTS_ZMkN3B3Bk8_GdXGeqGYbF0o9npgtS7B1SN9Q0rltt5aXIffVkM3BlPgVVzI8pArb-gKVO2tSlefjfbDUAlMaVWSsY4Eljq9-h-vBmck0v3SrFG9Mj-3v4ZjvKBtgZ4PzNjThhlqmt5XcMsoe9i24a1cqq-o4NItX0xwJ7eNBvZxigXmSDVsR6oQw5flyk3MYT4qmWEVd79cVskyyUgh0YrEvLEPsqb26TSmnVlXMPCh3I' },
    { id: 'cg1', name: 'City Gas', logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB-4CTXIocyVnnwyyHfAW2HBH3dLylJiYdJfzfRNk0sebpSDvYhL9ShY3uTaeX8Kca509b_k-2_UX7kcsoCDloaKRxN9FqWOSAIJ4zT4SUUrnCjxePkI5wOcmj63TodEipgcPO7KNuCorerGkEBENchfOaTXtDAFSwxE9sGyIGFf0GEK3QxcrGNWKxDi8WLTHLdj6X2NKVKo_i1y5GoL9X8w5iqqpca0J-qgEz159K6P6V7Wlw-gMDIqUJZ2ete1qlJtu3WQIUxMrU' },
    { id: 'vg1', name: 'VT-GAS', logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC7eTnvK5aYgdRpQ7r0JrThIhssN0j12GcjAzcrszxjSAtC1JzdscsKEliCTSujgiOjdIduDejriCsmUzgC_jBK4p0R8HAqKoKN5vfBScoDvHnjlazdSDRe3RS2RBm5E0sZPVn48gGk8Z4RYAi8__gyoBMqDSd2Tg_f88VrVSZn6DO26vy0EwdmJljaS9q11ROrep_qQfOz7Ny6V2XBa8ia5yjLujsw4TSYMRx7OF6mB13nu2XoEx9EiyUBJomlpAF9oX3C2n3a6x4' },
    { id: 'pv1', name: 'PETROVIETNAM GAS', logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBwWtf74gYhtlAq1IS1hNQ5pLt7PUyB5KUTbLhgRYv6HnE6oV_u_57wH3tzf7Gu632sw0dDOEGwPcVE9yeyW9nsoSKIYu6zhAnbBNLs_DAMN586bdG_Go0iluqSQSqfzXCkhA6V7FX6c26NfP5RxfXr_v80Y2xIdgeLNu-T-w8aqpnVxVdfLNKXLMrB1VRrMgB_l_1ovROIijGMRTcnJSxHCl2NBnEkiom8SJaaYm29JQdL9cUuZ6FLXiVcFjMeMtcUCUUGAtXcCeg' },
    { id: 'bm1', name: 'BINH MINH ENERGY', logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD1p0v3-44vz10qrmIHA53j7oMkCHzMVTMi5RiGUaylSuVWs9pv-OCq2L2wYHeAumF4kaa_jC97eMHBp9ULCITYP3pv58yMcUnlbyEAb7TpNQekXTlPruB3TmkvQbLogChaztNMoyNxYFHv3c0LRXMwwZDUjCGrLDVqyIJ7kbw9mCF-zL9q7bJNwr67OTVgY8Tgjn_szspCSyNxiRZIm26DU799H-Na5x--fvXe_XpEaj0puYvKfuzKou2VM_UXG1K8cj-7Jx4DTTc' },
    { id: 'vc1', name: 'VIPCO', logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBZpcPDOgvB4aa_20YveL9ydc5ZGz3e8LnSvzQG4FXaJIFdU5ZbWueUPLZQTBPsoLbIL4Drm32xlDbKpgHcxWlkpaVoHvMAni-zTPhV095xHNedL5LcAzMW8gF5jYyGhhtklq6tYZjQ_C-IBiADh13sRgUREZQswv22-z0qJdIrnMlFLXJQaoEY5vzwBzSA-S51cM39LVaVPYWR6orgIxst1DF5oFTdJDJi_GPNGACmXyJqPXQt6iktYG9_lWfwOMdSn80nyxUL0_o' }
  ]);

  // Custom typical member states
  const [customName, setCustomName] = useState('');
  const [customLogo, setCustomLogo] = useState('');
  const [customUploading, setCustomUploading] = useState(false);
  const [editingMemberIndex, setEditingMemberIndex] = useState<number | null>(null);
  const [editCustomName, setEditCustomName] = useState('');
  const [editCustomLogo, setEditCustomLogo] = useState('');
  const [editCustomUploading, setEditCustomUploading] = useState(false);
  const [sections, setSections] = useState([
    { id: 'hero', name: '1. Banner trang Giới thiệu', visible: true },
    { id: 'overview', name: '2. Tổng quan về HOBA', visible: true },
    { id: 'values', name: '3. Sứ mệnh - Tầm nhìn - Giá trị', visible: true },
    { id: 'timeline', name: '4. Lịch sử phát triển / Timeline', visible: true },
    { id: 'org', name: '5. Cơ cấu tổ chức', visible: true },
    { id: 'whyjoin', name: '6. Vì sao tham gia HOBA?', visible: true },
    { id: 'members', name: '7. Hội viên tiêu biểu', visible: true },
  ]);

  // Collapsible configuration blocks state (default collapsed)
  const [expandedSections, setExpandedSections] = useState({
    hero: false,
    overview: false,
    timeline: false,
    values: false,
    org: false,
    whyjoin: false,
    members: false,
  });

  const toggleSectionExpand = (sectionKey: 'hero' | 'overview' | 'timeline' | 'values' | 'org' | 'whyjoin' | 'members') => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  const uploadImage = async (file: File): Promise<string> => {
    if (!supabase) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(URL.createObjectURL(file));
        }, 1000);
      });
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `aboutpage/${fileName}`;

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

  const handleHeroUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setHeroUploading(true);
      try {
        const url = await uploadImage(e.target.files[0]);
        setHeroImage(url);
      } catch (err) {
        alert('Lỗi tải ảnh lên: ' + (err as Error).message);
      } finally {
        setHeroUploading(false);
      }
    }
  };

  const handleOverviewUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setOverviewUploading(true);
      try {
        const url = await uploadImage(e.target.files[0]);
        setOverviewImage(url);
      } catch (err) {
        alert('Lỗi tải ảnh lên: ' + (err as Error).message);
      } finally {
        setOverviewUploading(false);
      }
    }
  };

  const toggleSection = (id: string) => {
    setSections(prev =>
      prev.map(sec => (sec.id === id ? { ...sec, visible: !sec.visible } : sec))
    );
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    setSections(prev => {
      const next = [...prev];
      const temp = next[index];
      next[index] = next[index - 1];
      next[index - 1] = temp;
      return next;
    });
  };

  const moveDown = (index: number) => {
    if (index === sections.length - 1) return;
    setSections(prev => {
      const next = [...prev];
      const temp = next[index];
      next[index] = next[index + 1];
      next[index + 1] = temp;
      return next;
    });
  };

  useEffect(() => {
    async function loadData() {
      // Fetch active members
      if (supabase) {
        try {
          const { data } = await supabase
            .from('members')
            .select('id, company_name')
            .eq('status', 'Active');
          if (data && data.length > 0) {
            setActiveMembers(data);
          }
        } catch (e) {}
      }

      if (!supabase) {
        const saved = localStorage.getItem('hoba_website_config_aboutpage');
        if (saved) {
          try {
            const val = JSON.parse(saved);
            if (val.overview) setOverview(val.overview);
            if (val.milestones) setMilestones(val.milestones);
            if (val.values) setValues(val.values);
            if (val.orgStructure) setOrgStructure(val.orgStructure);
            if (val.heroImage) setHeroImage(val.heroImage);
            if (val.heroTitle) setHeroTitle(val.heroTitle);
            if (val.heroDesc) setHeroDesc(val.heroDesc);
            if (val.overviewImage) setOverviewImage(val.overviewImage);
            if (val.whyJoinReasons) setWhyJoinReasons(val.whyJoinReasons);
            if (val.featuredMembers && Array.isArray(val.featuredMembers)) {
              setFeaturedMembers(val.featuredMembers);
            } else if (val.featuredMemberIds && Array.isArray(val.featuredMemberIds)) {
              const mockLogos: Record<string, string> = {
                'sp1': 'https://lh3.googleusercontent.com/aida-public/AB6AXuBtDGTvdJ19cl1DQ6D7LXKmSKBBDM3QA1PXK1G6sPwNWYnjcsOFxgcr_csrc7eO9T2-HDyx4CoYu_8jilw90lGs-Gkv8Z4UxkyUkXMSH4P9cTSblMxAT998NsFL3fPHEYtpPUCvt3LS76HaPjX0tBgShkXRlfxtZ44vp8lXHZeCta-iXZKVlqSQxn6PH1BDE8eVJJwgce8Z4IgJmyJA7P5XBbwQBwuZpeOAuDcWVkUpV5zfI_BA7ckRd_YCZtprpFrW9S5RTsLiY8Y',
                'cg1': 'https://lh3.googleusercontent.com/aida-public/AB6AXuC0CYI2i9y9FBRcVafla8k_uA6-q6YUwCQ1nsIqp9GJraKX1HrdJo8DjcF3_DAH6DFiQjT8p17ol4-fZshaUWWGgddF4FbW__HrifyVlzuSnj2RNTq671M2AffFgAirU-9SR3X6qSQOGvJ2UUASF2JCLzEQ0R8scEuEByatNXkGCfdLzKhExXKRcapKdAvO0UJ8C1dc0C3i5dKKkhuqrNmefu1ateTTzShv8BgPIdFnPyvkppj4EFzWUr3nr7nJLaPQCHZ-VzPKXr8',
                'vg1': 'https://lh3.googleusercontent.com/aida-public/AB6AXuC7eTnvK5aYgdRpQ7r0JrThIhssN0j12GcjAzcrszxjSAtC1JzdscsKEliCTSujgiOjdIduDejriCsmUzgC_jBK4p0R8HAqKoKN5vfBScoDvHnjlazdSDRe3RS2RBm5E0sZPVn48gGk8Z4RYAi8__gyoBMqDSd2Tg_f88VrVSZn6DO26vy0EwdmJljaS9q11ROrep_qQfOz7Ny6V2XBa8ia5yjLujsw4TSYMRx7OF6mB13nu2XoEx9EiyUBJomlpAF9oX3C2n3a6x4',
                'pv1': 'https://lh3.googleusercontent.com/aida-public/AB6AXuBwWtf74gYhtlAq1IS1hNQ5pLt7PUyB5KUTbLhgRYv6HnE6oV_u_57wH3tzf7Gu632sw0dDOEGwPcVE9yeyW9nsoSKIYu6zhAnbBNLs_DAMN586bdG_Go0iluqSQSqfzXCkhA6V7FX6c26NfP5RxfXr_v80Y2xIdgeLNu-T-w8aqpnVxVdfLNKXLMrB1VRrMgB_l_1ovROIijGMRTcnJSxHCl2NBnEkiom8SJaaYm29JQdL9cUuZ6FLXiVcFjMeMtcUCUUGAtXcCeg',
                'bm1': 'https://lh3.googleusercontent.com/aida-public/AB6AXuD1p0v3-44vz10qrmIHA53j7oMkCHzMVTMi5RiGUaylSuVWs9pv-OCq2L2wYHeAumF4kaa_jC97eMHBp9ULCITYP3pv58yMcUnlbyEAb7TpNQekXTlPruB3TmkvQbLogChaztNMoyNxYFHv3c0LRXMwwZDUjCGrLDVqyIJ7kbw9mCF-zL9q7bJNwr67OTVgY8Tgjn_szspCSyNxiRZIm26DU799H-Na5x--fvXe_XpEaj0puYvKfuzKou2VM_UXG1K8cj-7Jx4DTTc',
                'vc1': 'https://lh3.googleusercontent.com/aida-public/AB6AXuBZpcPDOgvB4aa_20YveL9ydc5ZGz3e8LnSvzQG4FXaJIFdU5ZbWueUPLZQTBPsoLbIL4Drm32xlDbKpgHcxWlkpaVoHvMAni-zTPhV095xHNedL5LcAzMW8gF5jYyGhhtklq6tYZjQ_C-IBiADh13sRgUREZQswv22-z0qJdIrnMlFLXJQaoEY5vzwBzSA-S51cM39LVaVPYWR6orgIxst1DF5oFTdJDJi_GPNGACmXyJqPXQt6iktYG9_lWfwOMdSn80nyxUL0_o'
              };
              const initial = val.featuredMemberIds.map((id: string) => {
                const active = activeMembers.find(m => m.id === id);
                return {
                  id,
                  name: mockLogos[id] ? (id === 'sp1' ? 'SAIGON PETRO' : id === 'cg1' ? 'CITY GAS' : id === 'vg1' ? 'VT-GAS' : id === 'pv1' ? 'PETROVIETNAM GAS' : id === 'bm1' ? 'BINH MINH ENERGY' : 'VIPCO') : (active?.company_name || id),
                  logo: mockLogos[id] || active?.logo_url || active?.license_file_url || ''
                };
              });
              setFeaturedMembers(initial);
            }
            if (val.sections) setSections(val.sections);
          } catch (e) {}
        }
        return;
      }
      try {
        const { data, error } = await supabase
          .from('website_config')
          .select('value')
          .eq('key', 'aboutpage')
          .single();

        if (!error && data?.value) {
          const val = data.value;
          if (val.overview) setOverview(val.overview);
          if (val.milestones) setMilestones(val.milestones);
          if (val.values) setValues(val.values);
          if (val.orgStructure) setOrgStructure(val.orgStructure);
          if (val.heroImage) setHeroImage(val.heroImage);
          if (val.heroTitle) setHeroTitle(val.heroTitle);
          if (val.heroDesc) setHeroDesc(val.heroDesc);
          if (val.overviewImage) setOverviewImage(val.overviewImage);
          if (val.whyJoinReasons) setWhyJoinReasons(val.whyJoinReasons);
          if (val.featuredMembers && Array.isArray(val.featuredMembers)) {
            setFeaturedMembers(val.featuredMembers);
          } else if (val.featuredMemberIds && Array.isArray(val.featuredMemberIds)) {
            const mockLogos: Record<string, string> = {
              'sp1': 'https://lh3.googleusercontent.com/aida-public/AB6AXuBtDGTvdJ19cl1DQ6D7LXKmSKBBDM3QA1PXK1G6sPwNWYnjcsOFxgcr_csrc7eO9T2-HDyx4CoYu_8jilw90lGs-Gkv8Z4UxkyUkXMSH4P9cTSblMxAT998NsFL3fPHEYtpPUCvt3LS76HaPjX0tBgShkXRlfxtZ44vp8lXHZeCta-iXZKVlqSQxn6PH1BDE8eVJJwgce8Z4IgJmyJA7P5XBbwQBwuZpeOAuDcWVkUpV5zfI_BA7ckRd_YCZtprpFrW9S5RTsLiY8Y',
              'cg1': 'https://lh3.googleusercontent.com/aida-public/AB6AXuC0CYI2i9y9FBRcVafla8k_uA6-q6YUwCQ1nsIqp9GJraKX1HrdJo8DjcF3_DAH6DFiQjT8p17ol4-fZshaUWWGgddF4FbW__HrifyVlzuSnj2RNTq671M2AffFgAirU-9SR3X6qSQOGvJ2UUASF2JCLzEQ0R8scEuEByatNXkGCfdLzKhExXKRcapKdAvO0UJ8C1dc0C3i5dKKkhuqrNmefu1ateTTzShv8BgPIdFnPyvkppj4EFzWUr3nr7nJLaPQCHZ-VzPKXr8',
              'vg1': 'https://lh3.googleusercontent.com/aida-public/AB6AXuC7eTnvK5aYgdRpQ7r0JrThIhssN0j12GcjAzcrszxjSAtC1JzdscsKEliCTSujgiOjdIduDejriCsmUzgC_jBK4p0R8HAqKoKN5vfBScoDvHnjlazdSDRe3RS2RBm5E0sZPVn48gGk8Z4RYAi8__gyoBMqDSd2Tg_f88VrVSZn6DO26vy0EwdmJljaS9q11ROrep_qQfOz7Ny6V2XBa8ia5yjLujsw4TSYMRx7OF6mB13nu2XoEx9EiyUBJomlpAF9oX3C2n3a6x4',
              'pv1': 'https://lh3.googleusercontent.com/aida-public/AB6AXuBwWtf74gYhtlAq1IS1hNQ5pLt7PUyB5KUTbLhgRYv6HnE6oV_u_57wH3tzf7Gu632sw0dDOEGwPcVE9yeyW9nsoSKIYu6zhAnbBNLs_DAMN586bdG_Go0iluqSQSqfzXCkhA6V7FX6c26NfP5RxfXr_v80Y2xIdgeLNu-T-w8aqpnVxVdfLNKXLMrB1VRrMgB_l_1ovROIijGMRTcnJSxHCl2NBnEkiom8SJaaYm29JQdL9cUuZ6FLXiVcFjMeMtcUCUUGAtXcCeg',
              'bm1': 'https://lh3.googleusercontent.com/aida-public/AB6AXuD1p0v3-44vz10qrmIHA53j7oMkCHzMVTMi5RiGUaylSuVWs9pv-OCq2L2wYHeAumF4kaa_jC97eMHBp9ULCITYP3pv58yMcUnlbyEAb7TpNQekXTlPruB3TmkvQbLogChaztNMoyNxYFHv3c0LRXMwwZDUjCGrLDVqyIJ7kbw9mCF-zL9q7bJNwr67OTVgY8Tgjn_szspCSyNxiRZIm26DU799H-Na5x--fvXe_XpEaj0puYvKfuzKou2VM_UXG1K8cj-7Jx4DTTc',
              'vc1': 'https://lh3.googleusercontent.com/aida-public/AB6AXuBZpcPDOgvB4aa_20YveL9ydc5ZGz3e8LnSvzQG4FXaJIFdU5ZbWueUPLZQTBPsoLbIL4Drm32xlDbKpgHcxWlkpaVoHvMAni-zTPhV095xHNedL5LcAzMW8gF5jYyGhhtklq6tYZjQ_C-IBiADh13sRgUREZQswv22-z0qJdIrnMlFLXJQaoEY5vzwBzSA-S51cM39LVaVPYWR6orgIxst1DF5oFTdJDJi_GPNGACmXyJqPXQt6iktYG9_lWfwOMdSn80nyxUL0_o'
            };
            const initial = val.featuredMemberIds.map((id: string) => {
              const active = activeMembers.find(m => m.id === id);
              return {
                id,
                name: mockLogos[id] ? (id === 'sp1' ? 'SAIGON PETRO' : id === 'cg1' ? 'CITY GAS' : id === 'vg1' ? 'VT-GAS' : id === 'pv1' ? 'PETROVIETNAM GAS' : id === 'bm1' ? 'BINH MINH ENERGY' : 'VIPCO') : (active?.company_name || id),
                logo: mockLogos[id] || active?.logo_url || active?.license_file_url || ''
              };
            });
            setFeaturedMembers(initial);
          }
          if (val.sections) setSections(val.sections);
        }
      } catch (err) {
        console.error('Lỗi tải cấu hình trang giới thiệu:', err);
      }
    }
    loadData();
  }, []);

  const handleSave = async () => {
    if (supabase) {
      try {
        const { error } = await supabase
          .from('website_config')
          .upsert({
            key: 'aboutpage',
            value: { overview, milestones, values, orgStructure, heroImage, heroTitle, heroDesc, overviewImage, whyJoinReasons, featuredMembers, sections }
          });
        if (error) throw error;
      } catch (err) {
        alert('Lỗi lưu cấu hình: ' + (err as Error).message);
        return;
      }
    } else {
      localStorage.setItem('hoba_website_config_aboutpage', JSON.stringify({
        overview, milestones, values, orgStructure, heroImage, heroTitle, heroDesc, overviewImage, whyJoinReasons, featuredMembers, sections
      }));
    }

    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 4000);
  };

  const handleAddMilestone = () => {
    setMilestones(prev => [
      ...prev,
      { id: String(Date.now()), date: '2026', title: 'Cột mốc mới', desc: 'Chi tiết cột mốc hoạt động.', icon: 'flag' }
    ]);
  };

  const handleDeleteMilestone = (id: string) => {
    setMilestones(prev => prev.filter(m => m.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-outline-variant/20 pb-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-primary">Quản lý Trang Giới thiệu</h1>
          <p className="text-xs text-on-surface-variant mt-1">Cập nhật nội dung giới thiệu chung, tầm nhìn sứ mệnh và lịch sử hiệp hội.</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/gioi-thieu"
            className="flex items-center gap-2 border border-primary text-primary px-5 py-2.5 rounded-lg text-xs font-bold hover:bg-primary-container/10 transition-colors"
          >
            <span className="material-symbols-outlined text-sm">visibility</span> Xem Website
          </Link>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 bg-secondary text-white px-6 py-2.5 rounded-lg text-xs font-bold hover:bg-[#93000d] transition-all shadow-md"
          >
            <span className="material-symbols-outlined text-sm">save</span> Lưu thay đổi
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Editor Panel */}
        <div className="lg:col-span-8 space-y-6">
          {/* Banner Hero configuration */}
          <div className="bg-white border border-outline-variant/30 rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4 border-b border-outline-variant/20 pb-2">
              <h3 className="text-sm font-bold text-primary flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">view_carousel</span> Cấu hình Banner trang Giới thiệu
              </h3>
              <button
                type="button"
                onClick={() => toggleSectionExpand('hero')}
                className="text-on-surface-variant hover:text-primary transition-all flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">
                  {expandedSections.hero ? 'expand_less' : 'expand_more'}
                </span>
                <span className="text-[10px] font-bold">
                  {expandedSections.hero ? 'Thu gọn' : 'Mở rộng'}
                </span>
              </button>
            </div>
            {expandedSections.hero && (
              <div className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-on-surface-variant block">Tiêu đề Banner</label>
                  <input
                    className="w-full h-9 px-3 rounded border border-outline-variant/50 focus:border-primary outline-none text-[11px]"
                    type="text"
                    value={heroTitle}
                    onChange={(e) => setHeroTitle(e.target.value)}
                    placeholder="Nhập tiêu đề banner..."
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-on-surface-variant block">Mô tả Banner</label>
                  <textarea
                    className="w-full h-20 p-3 rounded-lg border border-outline-variant/50 focus:border-primary outline-none text-[11px] resize-y"
                    value={heroDesc}
                    onChange={(e) => setHeroDesc(e.target.value)}
                    placeholder="Nhập mô tả banner..."
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-on-surface-variant block">Ảnh nền Banner</label>
                  <div className="flex gap-2">
                    <input
                      className="flex-1 h-9 px-3 rounded border border-outline-variant/50 focus:border-primary outline-none text-[11px]"
                      type="text"
                      value={heroImage}
                      onChange={(e) => setHeroImage(e.target.value)}
                      placeholder="Nhập URL hình ảnh..."
                    />
                    <label className="flex items-center justify-center gap-1 bg-primary text-white px-3 rounded cursor-pointer hover:bg-[#93000d] transition-all font-bold text-[10px] h-9">
                      <span className="material-symbols-outlined text-sm">
                        {heroUploading ? 'sync' : 'upload'}
                      </span>
                      {heroUploading ? 'Đang tải...' : 'Tải lên ảnh'}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleHeroUpload}
                        disabled={heroUploading}
                      />
                    </label>
                  </div>
                  <div className="relative h-40 rounded-lg overflow-hidden border border-outline-variant bg-surface flex items-center justify-center">
                    <div className="absolute inset-0 bg-primary/60 z-10"></div>
                    <img
                      className="absolute inset-0 w-full h-full object-cover"
                      alt="Banner preview"
                      src={heroImage}
                    />
                    <div className="relative z-20 text-center text-white p-4 max-w-md">
                      <h4 className="text-sm font-black">{heroTitle}</h4>
                      <p className="text-[10px] opacity-90 line-clamp-2 mt-1">{heroDesc}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Overview text editor */}
          <div className="bg-white border border-outline-variant/30 rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4 border-b border-outline-variant/20 pb-2">
              <h3 className="text-sm font-bold text-primary flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">description</span> Tổng quan hiệp hội
              </h3>
              <button
                type="button"
                onClick={() => toggleSectionExpand('overview')}
                className="text-on-surface-variant hover:text-primary transition-all flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">
                  {expandedSections.overview ? 'expand_less' : 'expand_more'}
                </span>
                <span className="text-[10px] font-bold">
                  {expandedSections.overview ? 'Thu gọn' : 'Mở rộng'}
                </span>
              </button>
            </div>
            {expandedSections.overview && (
              <div className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-on-surface-variant block">Nội dung giới thiệu chính</label>
                  <textarea
                    className="w-full h-32 p-3 rounded-lg border border-outline-variant/50 focus:border-primary outline-none resize-y"
                    value={overview}
                    onChange={(e) => setOverview(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-on-surface-variant block">Ảnh minh họa giới thiệu</label>
                  <div className="flex gap-2">
                    <input
                      className="flex-1 h-9 px-3 rounded border border-outline-variant/50 focus:border-primary outline-none text-[11px]"
                      type="text"
                      value={overviewImage}
                      onChange={(e) => setOverviewImage(e.target.value)}
                      placeholder="Nhập URL hình ảnh..."
                    />
                    <label className="flex items-center justify-center gap-1 bg-primary text-white px-3 rounded cursor-pointer hover:bg-[#93000d] transition-all font-bold text-[10px] h-9">
                      <span className="material-symbols-outlined text-sm">
                        {overviewUploading ? 'sync' : 'upload'}
                      </span>
                      {overviewUploading ? 'Đang tải...' : 'Tải lên ảnh'}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleOverviewUpload}
                        disabled={overviewUploading}
                      />
                    </label>
                  </div>
                  <div className="relative h-40 rounded-lg overflow-hidden border border-outline-variant bg-surface flex items-center justify-center">
                    <img
                      className="w-full h-full object-cover"
                      alt="Overview illustration preview"
                      src={overviewImage}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Timeline Management */}
          <div className="bg-white border border-outline-variant/30 rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4 border-b border-outline-variant/20 pb-2">
              <h3 className="text-sm font-bold text-primary flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">timeline</span> Cột mốc lịch sử phát triển
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleAddMilestone}
                  className="text-primary font-bold text-xs hover:underline flex items-center gap-1"
                >
                  + Thêm cộc mốc
                </button>
                <button
                  type="button"
                  onClick={() => toggleSectionExpand('timeline')}
                  className="text-on-surface-variant hover:text-primary transition-all flex items-center gap-1 border border-outline-variant/30 px-2 py-1 rounded bg-[#fcf9f5]"
                >
                  <span className="material-symbols-outlined text-sm">
                    {expandedSections.timeline ? 'expand_less' : 'expand_more'}
                  </span>
                  <span className="text-[10px] font-bold">
                    {expandedSections.timeline ? 'Thu gọn' : 'Mở rộng'}
                  </span>
                </button>
              </div>
            </div>
            {expandedSections.timeline && (
              <div className="space-y-4">
                {milestones.map((m) => (
                  <div key={m.id} className="p-4 border border-outline-variant/40 rounded-xl space-y-3 bg-surface text-xs shadow-sm">
                    <div className="flex justify-between items-center border-b border-outline-variant/20 pb-1.5">
                      <span className="font-bold text-primary text-[10px] uppercase tracking-wider">Cột mốc lịch sử</span>
                      <button
                        onClick={() => handleDeleteMilestone(m.id)}
                        className="flex items-center gap-1 text-secondary hover:text-[#93000d] font-bold text-[10px]"
                      >
                        <span className="material-symbols-outlined text-sm">delete</span> Xóa
                      </button>
                    </div>
                    <div className="grid grid-cols-4 gap-3">
                      <div className="space-y-1">
                        <label className="font-semibold block text-[10px] text-on-surface-variant">Thời gian</label>
                        <input
                          className="w-full h-8 px-2 border border-outline-variant rounded outline-none focus:border-primary"
                          type="text"
                          value={m.date}
                          onChange={(e) => {
                            const val = e.target.value;
                            setMilestones(prev => prev.map(item => item.id === m.id ? { ...item, date: val } : item));
                          }}
                        />
                      </div>
                      <div className="col-span-2 space-y-1">
                        <label className="font-semibold block text-[10px] text-on-surface-variant">Tiêu đề</label>
                        <input
                          className="w-full h-8 px-2 border border-outline-variant rounded outline-none focus:border-primary"
                          type="text"
                          value={m.title}
                          onChange={(e) => {
                            const val = e.target.value;
                            setMilestones(prev => prev.map(item => item.id === m.id ? { ...item, title: val } : item));
                          }}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-semibold block text-[10px] text-on-surface-variant">Biểu tượng (Icon)</label>
                        <div className="flex gap-1">
                          <select
                            className="flex-1 h-8 px-1 border border-outline-variant rounded outline-none text-[11px] focus:border-primary bg-white min-w-0"
                            value={['flag', 'groups', 'workspace_premium', 'school', 'handshake', 'campaign', 'verified_user', 'policy', 'security'].includes(m.icon || 'flag') ? (m.icon || 'flag') : 'custom'}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val !== 'custom') {
                                setMilestones(prev => prev.map(item => item.id === m.id ? { ...item, icon: val } : item));
                              }
                            }}
                          >
                            <option value="flag">Cột mốc (flag)</option>
                            <option value="groups">Cộng đồng (groups)</option>
                            <option value="workspace_premium">Danh hiệu (workspace_premium)</option>
                            <option value="school">Đào tạo (school)</option>
                            <option value="handshake">Hợp tác (handshake)</option>
                            <option value="campaign">Truyền thông (campaign)</option>
                            <option value="verified_user">Uy tín (verified_user)</option>
                            <option value="policy">Chính sách (policy)</option>
                            <option value="security">An toàn (security)</option>
                            <option value="custom">Tùy biến...</option>
                          </select>
                          <input
                            className="w-12 h-8 px-1 border border-outline-variant rounded outline-none focus:border-primary text-center"
                            type="text"
                            placeholder="Custom..."
                            value={m.icon || 'flag'}
                            onChange={(e) => {
                              const val = e.target.value;
                              setMilestones(prev => prev.map(item => item.id === m.id ? { ...item, icon: val } : item));
                            }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="font-semibold block text-[10px] text-on-surface-variant">Mô tả cột mốc</label>
                      <textarea
                        className="w-full min-h-[45px] p-2 border border-outline-variant rounded outline-none focus:border-primary resize-y"
                        value={m.desc}
                        onChange={(e) => {
                          const val = e.target.value;
                          setMilestones(prev => prev.map(item => item.id === m.id ? { ...item, desc: val } : item));
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Values Config Block */}
          <div className="bg-white border border-outline-variant/30 rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6 border-b border-outline-variant/20 pb-2">
              <h3 className="text-sm font-bold text-primary flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">workspace_premium</span> Tầm nhìn - Sứ mệnh - Giá trị cốt lõi
              </h3>
              <button
                type="button"
                onClick={() => toggleSectionExpand('values')}
                className="text-on-surface-variant hover:text-primary transition-all flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">
                  {expandedSections.values ? 'expand_less' : 'expand_more'}
                </span>
                <span className="text-[10px] font-bold">
                  {expandedSections.values ? 'Thu gọn' : 'Mở rộng'}
                </span>
              </button>
            </div>
            {expandedSections.values && (
              <div className="space-y-4 text-xs">
                {values.map((v, idx) => (
                  <div key={idx} className="p-4 border border-outline-variant/40 rounded-lg space-y-3 bg-surface-container-low">
                    <span className="font-bold text-primary">{v.title}</span>
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="font-semibold block text-[10px] text-on-surface-variant">Tiêu đề</label>
                          <input
                            className="w-full h-8 px-2 border border-outline-variant rounded outline-none focus:border-primary"
                            type="text"
                            value={v.title}
                            onChange={(e) => {
                              const val = e.target.value;
                              setValues(prev => prev.map((item, i) => i === idx ? { ...item, title: val } : item));
                            }}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="font-semibold block text-[10px] text-on-surface-variant">Biểu tượng (Icon)</label>
                          <div className="flex gap-1.5">
                            <select
                              className="flex-1 h-8 px-1 border border-outline-variant rounded outline-none text-[11px] focus:border-primary"
                              value={['ads_click', 'visibility', 'diamond', 'flag', 'groups', 'lightbulb', 'verified_user', 'policy', 'security'].includes(v.icon) ? v.icon : 'custom'}
                              onChange={(e) => {
                                const val = e.target.value;
                                if (val !== 'custom') {
                                  setValues(prev => prev.map((item, i) => i === idx ? { ...item, icon: val } : item));
                                }
                              }}
                            >
                              <option value="ads_click">Sứ mệnh (ads_click)</option>
                              <option value="visibility">Tầm nhìn (visibility)</option>
                              <option value="diamond">Giá trị cốt lõi (diamond)</option>
                              <option value="flag">Cột mốc (flag)</option>
                              <option value="groups">Cộng đồng (groups)</option>
                              <option value="lightbulb">Sáng tạo (lightbulb)</option>
                              <option value="verified_user">Uy tín (verified_user)</option>
                              <option value="policy">Chính sách (policy)</option>
                              <option value="security">An toàn (security)</option>
                              <option value="custom">Tùy biến...</option>
                            </select>
                            <input
                              className="w-20 h-8 px-2 border border-outline-variant rounded outline-none focus:border-primary"
                              type="text"
                              placeholder="Custom..."
                              value={v.icon}
                              onChange={(e) => {
                                const val = e.target.value;
                                setValues(prev => prev.map((item, i) => i === idx ? { ...item, icon: val } : item));
                              }}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="font-semibold block text-[10px] text-on-surface-variant">Mô tả</label>
                        <textarea
                          className="w-full h-16 p-2 border border-outline-variant rounded outline-none focus:border-primary resize-y"
                          value={v.desc}
                          onChange={(e) => {
                            const val = e.target.value;
                            setValues(prev => prev.map((item, i) => i === idx ? { ...item, desc: val } : item));
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Org Structure Config Block */}
          <div className="bg-white border border-outline-variant/30 rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6 border-b border-outline-variant/20 pb-2">
              <h3 className="text-sm font-bold text-primary flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">corporate_fare</span> Cơ cấu tổ chức
              </h3>
              <button
                type="button"
                onClick={() => toggleSectionExpand('org')}
                className="text-on-surface-variant hover:text-primary transition-all flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">
                  {expandedSections.org ? 'expand_less' : 'expand_more'}
                </span>
                <span className="text-[10px] font-bold">
                  {expandedSections.org ? 'Thu gọn' : 'Mở rộng'}
                </span>
              </button>
            </div>
            {expandedSections.org && (
              <div className="space-y-4 text-xs">
                {orgStructure.map((org, idx) => (
                  <div key={idx} className="p-4 border border-outline-variant/40 rounded-lg space-y-3 bg-surface-container-low">
                    <span className="font-bold text-primary">Bộ phận {idx + 1}</span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="font-semibold block text-[10px] text-on-surface-variant">Tên bộ phận</label>
                        <input
                          className="w-full h-9 px-3 border border-outline-variant rounded outline-none focus:border-primary"
                          type="text"
                          value={org.title}
                          onChange={(e) => {
                            const val = e.target.value;
                            setOrgStructure(prev => prev.map((item, i) => i === idx ? { ...item, title: val } : item));
                          }}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-semibold block text-[10px] text-on-surface-variant">Mô tả</label>
                        <input
                          className="w-full h-9 px-3 border border-outline-variant rounded outline-none focus:border-primary"
                          type="text"
                          value={org.desc}
                          onChange={(e) => {
                            const val = e.target.value;
                            setOrgStructure(prev => prev.map((item, i) => i === idx ? { ...item, desc: val } : item));
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Why Join HOBA Config Block */}
          <div className="bg-white border border-outline-variant/30 rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6 border-b border-outline-variant/20 pb-2">
              <h3 className="text-sm font-bold text-primary flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">help_outline</span> Khối: Vì sao doanh nghiệp tham gia HOBA?
              </h3>
              <button
                type="button"
                onClick={() => toggleSectionExpand('whyjoin')}
                className="text-on-surface-variant hover:text-primary transition-all flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">
                  {expandedSections.whyjoin ? 'expand_less' : 'expand_more'}
                </span>
                <span className="text-[10px] font-bold">
                  {expandedSections.whyjoin ? 'Thu gọn' : 'Mở rộng'}
                </span>
              </button>
            </div>
            {expandedSections.whyjoin && (
              <div className="space-y-4 text-xs">
                {whyJoinReasons.map((reason, idx) => (
                  <div key={idx} className="p-4 border border-outline-variant/40 rounded-lg space-y-3 bg-surface-container-low">
                    <span className="font-bold text-primary">Lý do {idx + 1}</span>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="font-semibold block text-[10px] text-on-surface-variant">Tiêu đề</label>
                        <input
                          className="w-full h-8 px-2 border border-outline-variant rounded outline-none focus:border-primary"
                          type="text"
                          value={reason.title}
                          onChange={(e) => {
                            const val = e.target.value;
                            setWhyJoinReasons(prev => prev.map((item, i) => i === idx ? { ...item, title: val } : item));
                          }}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-semibold block text-[10px] text-on-surface-variant">Biểu tượng (Icon)</label>
                        <div className="flex gap-1.5">
                          <select
                            className="flex-1 h-8 px-1 border border-outline-variant rounded outline-none text-[11px] focus:border-primary bg-white min-w-0"
                            value={['hub', 'description', 'school', 'handshake', 'groups', 'verified_user', 'policy', 'security'].includes(reason.icon) ? reason.icon : 'custom'}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val !== 'custom') {
                                setWhyJoinReasons(prev => prev.map((item, i) => i === idx ? { ...item, icon: val } : item));
                              }
                            }}
                          >
                            <option value="hub">Kết nối (hub)</option>
                            <option value="description">Chính sách (description)</option>
                            <option value="school">Năng lực (school)</option>
                            <option value="handshake">Hợp tác (handshake)</option>
                            <option value="groups">Cộng đồng (groups)</option>
                            <option value="verified_user">Uy tín (verified_user)</option>
                            <option value="policy">Chính sách (policy)</option>
                            <option value="security">An toàn (security)</option>
                            <option value="custom">Tùy biến...</option>
                          </select>
                          <input
                            className="w-16 h-8 px-2 border border-outline-variant rounded outline-none focus:border-primary text-center"
                            type="text"
                            placeholder="Custom..."
                            value={reason.icon}
                            onChange={(e) => {
                              const val = e.target.value;
                              setWhyJoinReasons(prev => prev.map((item, i) => i === idx ? { ...item, icon: val } : item));
                            }}
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="font-semibold block text-[10px] text-on-surface-variant">Mô tả chi tiết</label>
                        <input
                          className="w-full h-8 px-2 border border-outline-variant rounded outline-none focus:border-primary"
                          type="text"
                          value={reason.desc}
                          onChange={(e) => {
                            const val = e.target.value;
                            setWhyJoinReasons(prev => prev.map((item, i) => i === idx ? { ...item, desc: val } : item));
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Featured Members Config Block */}
          <div className="bg-white border border-outline-variant/30 rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4 border-b border-outline-variant/20 pb-2">
              <h3 className="text-sm font-bold text-primary flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">star</span> Khối: Hội viên tiêu biểu
              </h3>
              <button
                type="button"
                onClick={() => toggleSectionExpand('members')}
                className="text-on-surface-variant hover:text-primary transition-all flex items-center gap-1 border border-outline-variant/30 px-2 py-1 rounded bg-[#fcf9f5]"
              >
                <span className="material-symbols-outlined text-sm">
                  {expandedSections.members ? 'expand_less' : 'expand_more'}
                </span>
                <span className="text-[10px] font-bold">
                  {expandedSections.members ? 'Thu gọn' : 'Mở rộng'}
                </span>
              </button>
            </div>
            {expandedSections.members && (
              <div className="space-y-4 text-xs">
                <div className="p-5 border border-amber-200 bg-amber-50 rounded-xl text-amber-900 space-y-3">
                  <div className="flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-amber-600">info</span>
                    <div>
                      <h4 className="font-bold text-amber-950 text-xs">Hội viên tiêu biểu đã được quản lý riêng!</h4>
                      <p className="mt-1 leading-relaxed text-[11px]">
                        Danh sách hội viên tiêu biểu hiện tại đã được tách ra để quản lý tập trung và dùng chung cho cả Trang chủ lẫn Trang giới thiệu. Bạn không cần cấu hình danh sách này riêng lẻ cho từng trang nữa.
                      </p>
                    </div>
                  </div>
                  <div className="pt-1.5">
                    <Link
                      href="/admin/hoi-vien-tieu-bieu"
                      className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg text-[10px] font-bold transition-all shadow-sm"
                    >
                      <span className="material-symbols-outlined text-sm">open_in_new</span> Đi tới quản lý Hội viên tiêu biểu
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Structure Order (Right Column) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 border border-outline-variant/30 rounded-xl shadow-sm">
            <h4 className="text-sm font-bold text-primary mb-4 border-b border-outline-variant/20 pb-2">Thứ tự hiển thị trang</h4>
            <div className="space-y-3">
              {sections.map((sec, idx) => (
                <div
                  key={sec.id}
                  className={`flex items-center justify-between p-3 rounded-lg border border-outline-variant/40 shadow-sm text-xs ${
                    sec.visible ? 'bg-white opacity-100' : 'bg-surface-container opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-on-surface-variant cursor-grab active:cursor-grabbing">drag_handle</span>
                    <span className="font-bold text-on-surface">{sec.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => moveUp(idx)}
                      disabled={idx === 0}
                      className={`text-on-surface-variant hover:text-primary ${idx === 0 ? 'opacity-20 cursor-not-allowed' : ''}`}
                      title="Di chuyển lên"
                    >
                      <span className="material-symbols-outlined text-lg">keyboard_arrow_up</span>
                    </button>
                    <button
                      onClick={() => moveDown(idx)}
                      disabled={idx === sections.length - 1}
                      className={`text-on-surface-variant hover:text-primary ${idx === sections.length - 1 ? 'opacity-20 cursor-not-allowed' : ''}`}
                      title="Di chuyển xuống"
                    >
                      <span className="material-symbols-outlined text-lg">keyboard_arrow_down</span>
                    </button>
                    <button
                      onClick={() => toggleSection(sec.id)}
                      className="text-primary hover:text-secondary ml-1"
                      title={sec.visible ? "Ẩn khối" : "Hiện khối"}
                    >
                      <span className="material-symbols-outlined text-lg">
                        {sec.visible ? 'visibility' : 'visibility_off'}
                      </span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 border border-outline-variant/30 rounded-xl shadow-sm text-xs space-y-4">
            <h4 className="font-bold text-primary border-b border-outline-variant/20 pb-2">Hướng dẫn xuất bản</h4>
            <p className="text-on-surface-variant leading-relaxed">
              Các thông tin sau khi được cập nhật sẽ hiển thị trực tiếp trên trang **Giới thiệu** phía công chúng. Vui lòng kiểm duyệt kỹ chính tả và tính pháp lý của mốc thời gian trước khi ấn xuất bản.
            </p>
          </div>
        </div>
      </div>

      {/* Floating Toast Notification */}
      {showToast && (
        <div className="fixed bottom-8 right-8 bg-inverse-surface text-inverse-on-surface px-6 py-4 rounded-xl shadow-2xl flex items-center gap-4 z-[100] animate-bounce">
          <span className="material-symbols-outlined text-primary-fixed-dim">check_circle</span>
          <span className="text-xs font-bold">Cập nhật trang giới thiệu thành công!</span>
        </div>
      )}
    </div>
  );
}
