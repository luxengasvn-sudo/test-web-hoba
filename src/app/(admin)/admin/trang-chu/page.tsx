'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function AdminTrangChu() {
  const [headline, setHeadline] = useState('An toàn năng lượng - Phát triển bền vững');
  const [subtext, setSubtext] = useState('Hiệp hội Gas Việt Nam hướng tới tiêu chuẩn an toàn quốc tế.');
  const [showToast, setShowToast] = useState(false);
  const [heroImage, setHeroImage] = useState('https://lh3.googleusercontent.com/aida-public/AB6AXuC981IWi1G9KO6TlBAeTvoEdHnU475mZUvpzKUy14ifBcHuc4b2zuDgHQNPQ2pPa1hNnCLFGrjwaaqqGhFcVpcCxdIlQZV1p_Vb6d2wfxy59lin66jklDgq9NGYjR4dSi5aUJ7vP7rQGNc70B9WC-g9cGfWoyIgi8SpKmbuwy2b4E7XrzpBKz9l2Gyr2B2cvva27oEuWW85ETPFGIk24eGr6JkgaTYZVPHxuaRxATS-URlM6yT-Jnu0VnYiPfUXGOeqtIJtDpOw4a0');
  const [uploading, setUploading] = useState(false);
  const [aboutTitle, setAboutTitle] = useState('HIỆP HỘI KINH DOANH KHÍ HÓA LỎNG TP.HCM');
  const [aboutDesc, setAboutDesc] = useState('Hiệp hội Kinh doanh Khí hóa lỏng TP.HCM là tổ chức xã hội - nghề nghiệp tự nguyện của các doanh nghiệp, tổ chức và chuyên gia hoạt động trong lĩnh vực sản xuất, chiết nạp, lưu trữ, vận chuyển, kinh doanh và dịch vụ thương mại khí hóa lỏng (LPG) trên địa bàn Thành phố Hồ Chí Minh và các khu vực lân cận');
  const [aboutImage, setAboutImage] = useState('https://lh3.googleusercontent.com/aida-public/AB6AXuBqie_pC3yMckoN2RbI--_RMwqaycD-sE8uNjKGm1FYP4SuDo4Bk_DoW8FUfF5HZBFyE2S74tiVXbJg9vHPDi60KxsMnl9tK_9RvcEVcILr8J8xd5TjTAruNuf3db-Gwy4Kb5FvIKtk35uWDdSOWlVsvITLSEFRwOtiZ4946ZRBlOrGlV9a4b40tsttuO67wPg5hKgKI3TVz1c8T_rONHoB_-tlV2x6YjTCExPwRqjjfG4Qm2IJnhUprj3rNJr25ksTMbc-7ceVtUA');
  const [aboutUploading, setAboutUploading] = useState(false);

  // Collapsible configuration blocks state (default collapsed)
  const [expandedSections, setExpandedSections] = useState({
    hero: false,
    stats: false,
    about: false,
    services: false,
    news: false,
    members: false,
  });

  const toggleSectionExpand = (sectionKey: 'hero' | 'stats' | 'about' | 'services' | 'news' | 'members') => {
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
    const filePath = `homepage/${fileName}`;

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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploading(true);
      try {
        const url = await uploadImage(e.target.files[0]);
        setHeroImage(url);
      } catch (err) {
        alert('Lỗi tải ảnh lên: ' + (err as Error).message);
      } finally {
        setUploading(false);
      }
    }
  };

  const handleAboutImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAboutUploading(true);
      try {
        const url = await uploadImage(e.target.files[0]);
        setAboutImage(url);
      } catch (err) {
        alert('Lỗi tải ảnh lên: ' + (err as Error).message);
      } finally {
        setAboutUploading(false);
      }
    }
  };

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
    { id: 'hero', name: '1. Hero Banner', visible: true },
    { id: 'news', name: '2. News & Events', visible: true },
    { id: 'services', name: '3. Lĩnh vực hoạt động', visible: true },
    { id: 'stats', name: '4. Statistics Counter', visible: false },
    { id: 'members', name: '5. Hội viên tiêu biểu', visible: true },
  ]);

  const [features, setFeatures] = useState([
    { id: 'f1', title: 'Tiêu chuẩn an toàn', icon: 'verified_user', desc: 'Xây dựng và ban hành các quy chuẩn kỹ thuật về an toàn LPG.' },
    { id: 'f2', title: 'Đào tạo nhân lực', icon: 'school', desc: 'Tổ chức các khóa huấn luyện nghiệp vụ cho cán bộ trong ngành.' }
  ]);

  const [stats, setStats] = useState([
    { value: '150+', label: 'Hội viên liên kết', icon: 'groups' },
    { value: '20+', label: 'Năm hoạt động', icon: 'workspace_premium' },
    { value: '500+', label: 'Khóa đào tạo an toàn', icon: 'school' },
    { value: '10+', label: 'Đối tác chiến lược', icon: 'handshake' }
  ]);

  const [coreServices, setCoreServices] = useState([
    {
      title: 'Kết nối doanh nghiệp',
      desc: 'Mở rộng mạng lưới hợp tác, chia sẻ nguồn lực và tạo dựng các mối quan hệ kinh doanh chiến lược.',
      icon: 'handshake',
      bgIcon: 'diversity_3'
    },
    {
      title: 'Phân tích thị trường',
      desc: 'Cung cấp báo cáo phân tích giá gas quốc tế, xu hướng tiêu dùng và biến động chính sách.',
      icon: 'trending_up',
      bgIcon: 'query_stats'
    },
    {
      title: 'Tư vấn pháp lý',
      desc: 'Tư vấn và phổ biến các thông tư, quy định mới liên quan đến kinh doanh và an toàn khí hóa lỏng.',
      icon: 'gavel',
      bgIcon: 'balance'
    },
    {
      title: 'Đào tạo an toàn',
      desc: 'Huấn luyện kỹ thuật, an toàn PCCC và quản lý rủi ro cho đội ngũ kỹ thuật viên trạm chiết nạp.',
      icon: 'engineering',
      bgIcon: 'school'
    },
    {
      title: 'Sự kiện & Hội thảo',
      desc: 'Tổ chức các diễn đàn xúc tiến đầu tư và các buổi giao lưu ngành gas toàn quốc định kỳ.',
      icon: 'groups_2',
      bgIcon: 'event_seat'
    },
    {
      title: 'Hỗ trợ thủ tục',
      desc: 'Tư vấn tháo gỡ vướng mắc về giấy phép và các thủ tục hành chính chuyên ngành năng lượng.',
      icon: 'support_agent',
      bgIcon: 'health_and_safety'
    }
  ]);

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
      } else {
        const savedMembers = localStorage.getItem('hoba_website_members');
        if (savedMembers) {
          try {
            const parsed = JSON.parse(savedMembers);
            const active = parsed.filter((m: any) => m.status === 'Active');
            if (active.length > 0) {
              setActiveMembers(active.map((m: any) => ({ id: m.id, company_name: m.company_name })));
            }
          } catch (e) {}
        }
      }

      if (!supabase) {
        const saved = localStorage.getItem('hoba_website_config_homepage');
        if (saved) {
          try {
            const val = JSON.parse(saved);
            if (val.headline) setHeadline(val.headline);
            if (val.subtext) setSubtext(val.subtext);
            if (val.sections) setSections(val.sections);
            if (val.features) setFeatures(val.features);
            if (val.heroImage) setHeroImage(val.heroImage);
            if (val.stats) setStats(val.stats);
            if (val.coreServices) setCoreServices(val.coreServices);
            if (val.aboutTitle) setAboutTitle(val.aboutTitle);
            if (val.aboutDesc) setAboutDesc(val.aboutDesc);
            if (val.aboutImage) setAboutImage(val.aboutImage);
            if (val.featuredMembers && Array.isArray(val.featuredMembers)) {
              setFeaturedMembers(val.featuredMembers);
            } else if (val.featuredMemberIds && Array.isArray(val.featuredMemberIds)) {
              const mockLogos: Record<string, string> = {
                'sp1': 'https://lh3.googleusercontent.com/aida-public/AB6AXuCUSaADTHuO0LeW68laxKr1qy5yC1GTS_ZMkN3B3Bk8_GdXGeqGYbF0o9npgtS7B1SN9Q0rltt5aXIffVkM3BlPgVVzI8pArb-gKVO2tSlefjfbDUAlMaVWSsY4Eljq9-h-vBmck0v3SrFG9Mj-3v4ZjvKBtgZ4PzNjThhlqmt5XcMsoe9i24a1cqq-o4NItX0xwJ7eNBvZxigXmSDVsR6oQw5flyk3MYT4qmWEVd79cVskyyUgh0YrEvLEPsqb26TSmnVlXMPCh3I',
                'cg1': 'https://lh3.googleusercontent.com/aida-public/AB6AXuB-4CTXIocyVnnwyyHfAW2HBH3dLylJiYdJfzfRNk0sebpSDvYhL9ShY3uTaeX8Kca509b_k-2_UX7kcsoCDloaKRxN9FqWOSAIJ4zT4SUUrnCjxePkI5wOcmj63TodEipgcPO7KNuCorerGkEBENchfOaTXtDAFSwxE9sGyIGFf0GEK3QxcrGNWKxDi8WLTHLdj6X2NKVKo_i1y5GoL9X8w5iqqpca0J-qgEz159K6P6V7Wlw-gMDIqUJZ2ete1qlJtu3WQIUxMrU',
                'vg1': 'https://lh3.googleusercontent.com/aida-public/AB6AXuC7eTnvK5aYgdRpQ7r0JrThIhssN0j12GcjAzcrszxjSAtC1JzdscsKEliCTSujgiOjdIduDejriCsmUzgC_jBK4p0R8HAqKoKN5vfBScoDvHnjlazdSDRe3RS2RBm5E0sZPVn48gGk8Z4RYAi8__gyoBMqDSd2Tg_f88VrVSZn6DO26vy0EwdmJljaS9q11ROrep_qQfOz7Ny6V2XBa8ia5yjLujsw4TSYMRx7OF6mB13nu2XoEx9EiyUBJomlpAF9oX3C2n3a6x4',
                'pv1': 'https://lh3.googleusercontent.com/aida-public/AB6AXuBwWtf74gYhtlAq1IS1hNQ5pLt7PUyB5KUTbLhgRYv6HnE6oV_u_57wH3tzf7Gu632sw0dDOEGwPcVE9yeyW9nsoSKIYu6zhAnbBNLs_DAMN586bdG_Go0iluqSQSqfzXCkhA6V7FX6c26NfP5RxfXr_v80Y2xIdgeLNu-T-w8aqpnVxVdfLNKXLMrB1VRrMgB_l_1ovROIijGMRTcnJSxHCl2NBnEkiom8SJaaYm29JQdL9cUuZ6FLXiVcFjMeMtcUCUUGAtXcCeg',
                'bm1': 'https://lh3.googleusercontent.com/aida-public/AB6AXuD1p0v3-44vz10qrmIHA53j7oMkCHzMVTMi5RiGUaylSuVWs9pv-OCq2L2wYHeAumF4kaa_jC97eMHBp9ULCITYP3pv58yMcUnlbyEAb7TpNQekXTlPruB3TmkvQbLogChaztNMoyNxYFHv3c0LRXMwwZDUjCGrLDVqyIJ7kbw9mCF-zL9q7bJNwr67OTVgY8Tgjn_szspCSyNxiRZIm26DU799H-Na5x--fvXe_XpEaj0puYvKfuzKou2VM_UXG1K8cj-7Jx4DTTc',
                'vc1': 'https://lh3.googleusercontent.com/aida-public/AB6AXuBZpcPDOgvB4aa_20YveL9ydc5ZGz3e8LnSvzQG4FXaJIFdU5ZbWueUPLZQTBPsoLbIL4Drm32xlDbKpgHcxWlkpaVoHvMAni-zTPhV095xHNedL5LcAzMW8gF5jYyGhhtklq6tYZjQ_C-IBiADh13sRgUREZQswv22-z0qJdIrnMlFLXJQaoEY5vzwBzSA-S51cM39LVaVPYWR6orgIxst1DF5oFTdJDJi_GPNGACmXyJqPXQt6iktYG9_lWfwOMdSn80nyxUL0_o'
              };
              const initial = val.featuredMemberIds.map((id: string) => {
                const active = activeMembers.find(m => m.id === id);
                return {
                  id,
                  name: mockLogos[id] ? (id === 'sp1' ? 'Saigon Petro' : id === 'cg1' ? 'City Gas' : id === 'vg1' ? 'VT-GAS' : id === 'pv1' ? 'PETROVIETNAM GAS' : id === 'bm1' ? 'BINH MINH ENERGY' : 'VIPCO') : (active?.company_name || id),
                  logo: mockLogos[id] || active?.logo_url || active?.license_file_url || ''
                };
              });
              setFeaturedMembers(initial);
            }
          } catch (e) {}
        }
        return;
      }
      try {
        const { data, error } = await supabase
          .from('website_config')
          .select('value')
          .eq('key', 'homepage')
          .single();

        if (!error && data?.value) {
          const val = data.value;
          if (val.headline) setHeadline(val.headline);
          if (val.subtext) setSubtext(val.subtext);
          if (val.sections) setSections(val.sections);
          if (val.features) setFeatures(val.features);
          if (val.heroImage) setHeroImage(val.heroImage);
          if (val.stats) setStats(val.stats);
          if (val.coreServices) setCoreServices(val.coreServices);
          if (val.aboutTitle) setAboutTitle(val.aboutTitle);
          if (val.aboutDesc) setAboutDesc(val.aboutDesc);
          if (val.aboutImage) setAboutImage(val.aboutImage);
          if (val.featuredMembers && Array.isArray(val.featuredMembers)) {
            setFeaturedMembers(val.featuredMembers);
          } else if (val.featuredMemberIds && Array.isArray(val.featuredMemberIds)) {
            const mockLogos: Record<string, string> = {
              'sp1': 'https://lh3.googleusercontent.com/aida-public/AB6AXuCUSaADTHuO0LeW68laxKr1qy5yC1GTS_ZMkN3B3Bk8_GdXGeqGYbF0o9npgtS7B1SN9Q0rltt5aXIffVkM3BlPgVVzI8pArb-gKVO2tSlefjfbDUAlMaVWSsY4Eljq9-h-vBmck0v3SrFG9Mj-3v4ZjvKBtgZ4PzNjThhlqmt5XcMsoe9i24a1cqq-o4NItX0xwJ7eNBvZxigXmSDVsR6oQw5flyk3MYT4qmWEVd79cVskyyUgh0YrEvLEPsqb26TSmnVlXMPCh3I',
              'cg1': 'https://lh3.googleusercontent.com/aida-public/AB6AXuB-4CTXIocyVnnwyyHfAW2HBH3dLylJiYdJfzfRNk0sebpSDvYhL9ShY3uTaeX8Kca509b_k-2_UX7kcsoCDloaKRxN9FqWOSAIJ4zT4SUUrnCjxePkI5wOcmj63TodEipgcPO7KNuCorerGkEBENchfOaTXtDAFSwxE9sGyIGFf0GEK3QxcrGNWKxDi8WLTHLdj6X2NKVKo_i1y5GoL9X8w5iqqpca0J-qgEz159K6P6V7Wlw-gMDIqUJZ2ete1qlJtu3WQIUxMrU',
              'vg1': 'https://lh3.googleusercontent.com/aida-public/AB6AXuC7eTnvK5aYgdRpQ7r0JrThIhssN0j12GcjAzcrszxjSAtC1JzdscsKEliCTSujgiOjdIduDejriCsmUzgC_jBK4p0R8HAqKoKN5vfBScoDvHnjlazdSDRe3RS2RBm5E0sZPVn48gGk8Z4RYAi8__gyoBMqDSd2Tg_f88VrVSZn6DO26vy0EwdmJljaS9q11ROrep_qQfOz7Ny6V2XBa8ia5yjLujsw4TSYMRx7OF6mB13nu2XoEx9EiyUBJomlpAF9oX3C2n3a6x4',
              'pv1': 'https://lh3.googleusercontent.com/aida-public/AB6AXuBwWtf74gYhtlAq1IS1hNQ5pLt7PUyB5KUTbLhgRYv6HnE6oV_u_57wH3tzf7Gu632sw0dDOEGwPcVE9yeyW9nsoSKIYu6zhAnbBNLs_DAMN586bdG_Go0iluqSQSqfzXCkhA6V7FX6c26NfP5RxfXr_v80Y2xIdgeLNu-T-w8aqpnVxVdfLNKXLMrB1VRrMgB_l_1ovROIijGMRTcnJSxHCl2NBnEkiom8SJaaYm29JQdL9cUuZ6FLXiVcFjMeMtcUCUUGAtXcCeg',
              'bm1': 'https://lh3.googleusercontent.com/aida-public/AB6AXuD1p0v3-44vz10qrmIHA53j7oMkCHzMVTMi5RiGUaylSuVWs9pv-OCq2L2wYHeAumF4kaa_jC97eMHBp9ULCITYP3pv58yMcUnlbyEAb7TpNQekXTlPruB3TmkvQbLogChaztNMoyNxYFHv3c0LRXMwwZDUjCGrLDVqyIJ7kbw9mCF-zL9q7bJNwr67OTVgY8Tgjn_szspCSyNxiRZIm26DU799H-Na5x--fvXe_XpEaj0puYvKfuzKou2VM_UXG1K8cj-7Jx4DTTc',
              'vc1': 'https://lh3.googleusercontent.com/aida-public/AB6AXuBZpcPDOgvB4aa_20YveL9ydc5ZGz3e8LnSvzQG4FXaJIFdU5ZbWueUPLZQTBPsoLbIL4Drm32xlDbKpgHcxWlkpaVoHvMAni-zTPhV095xHNedL5LcAzMW8gF5jYyGhhtklq6tYZjQ_C-IBiADh13sRgUREZQswv22-z0qJdIrnMlFLXJQaoEY5vzwBzSA-S51cM39LVaVPYWR6orgIxst1DF5oFTdJDJi_GPNGACmXyJqPXQt6iktYG9_lWfwOMdSn80nyxUL0_o'
            };
            const initial = val.featuredMemberIds.map((id: string) => {
              const active = activeMembers.find(m => m.id === id);
              return {
                id,
                name: mockLogos[id] ? (id === 'sp1' ? 'Saigon Petro' : id === 'cg1' ? 'City Gas' : id === 'vg1' ? 'VT-GAS' : id === 'pv1' ? 'PETROVIETNAM GAS' : id === 'bm1' ? 'BINH MINH ENERGY' : 'VIPCO') : (active?.company_name || id),
                logo: mockLogos[id] || active?.logo_url || active?.license_file_url || ''
              };
            });
            setFeaturedMembers(initial);
          }
        }
      } catch (err) {
        console.error('Lỗi tải cấu hình trang chủ:', err);
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
            key: 'homepage',
            value: { headline, subtext, sections, features, heroImage, stats, coreServices, aboutTitle, aboutDesc, aboutImage, featuredMembers }
          });
        if (error) throw error;
      } catch (err) {
        alert('Lỗi lưu cấu hình: ' + (err as Error).message);
        return;
      }
    } else {
      localStorage.setItem('hoba_website_config_homepage', JSON.stringify({
        headline, subtext, sections, features, heroImage, stats, coreServices, aboutTitle, aboutDesc, aboutImage, featuredMembers
      }));
    }

    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 4000);
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

  const deleteFeature = (id: string) => {
    setFeatures(prev => prev.filter(f => f.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-outline-variant/20 pb-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-primary">Quản lý Trang chủ</h1>
          <p className="text-xs text-on-surface-variant mt-1">Sắp xếp các khối nội dung và cấu hình banner trang chủ.</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 border border-primary text-primary px-5 py-2.5 rounded-lg text-xs font-bold hover:bg-primary-container/10 transition-colors"
          >
            <span className="material-symbols-outlined text-sm">visibility</span> Xem Website
          </Link>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 bg-secondary text-white px-6 py-2.5 rounded-lg text-xs font-bold hover:bg-[#93000d] transition-all shadow-md"
          >
            <span className="material-symbols-outlined text-sm">save</span> Xuất bản thay đổi
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Section Management (Left/Main Column) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Hero Banner Section */}
          <div className="bg-white border border-outline-variant/30 rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6 border-b border-outline-variant/20 pb-2">
              <h3 className="text-sm font-bold text-primary flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">view_carousel</span> Cấu hình Hero Banner
              </h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-on-surface-variant font-medium">Hiển thị trên trang chủ:</span>
                  <button
                    onClick={() => toggleSection('hero')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                      sections.find(s => s.id === 'hero')?.visible ? 'bg-secondary' : 'bg-outline-variant'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        sections.find(s => s.id === 'hero')?.visible ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => toggleSectionExpand('hero')}
                  className="text-on-surface-variant hover:text-primary transition-all flex items-center gap-1 border border-outline-variant/30 px-2 py-1 rounded bg-[#fcf9f5]"
                >
                  <span className="material-symbols-outlined text-sm">
                    {expandedSections.hero ? 'expand_less' : 'expand_more'}
                  </span>
                  <span className="text-[10px] font-bold">
                    {expandedSections.hero ? 'Thu gọn' : 'Mở rộng'}
                  </span>
                </button>
              </div>
            </div>
            {expandedSections.hero && (
              <div className="space-y-6 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="font-bold text-on-surface-variant block">Tiêu đề chính (Headline)</label>
                    <input
                      className="w-full h-12 px-4 rounded border border-outline-variant/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                      type="text"
                      value={headline}
                      onChange={(e) => setHeadline(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="font-bold text-on-surface-variant block">Mô tả phụ</label>
                    <input
                      className="w-full h-12 px-4 rounded border border-outline-variant/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                      type="text"
                      value={subtext}
                      onChange={(e) => setSubtext(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="font-bold text-on-surface-variant block">Ảnh nền Banner</label>
                  <div className="flex gap-2">
                    <input
                      className="flex-1 h-10 px-4 rounded border border-outline-variant/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                      type="text"
                      value={heroImage}
                      onChange={(e) => setHeroImage(e.target.value)}
                      placeholder="Nhập URL hình ảnh..."
                    />
                    <label className="flex items-center justify-center gap-1 bg-primary text-white px-4 rounded cursor-pointer hover:bg-[#93000d] transition-all font-bold text-xs">
                      <span className="material-symbols-outlined text-sm">
                        {uploading ? 'sync' : 'upload'}
                      </span>
                      {uploading ? 'Đang tải lên...' : 'Tải lên ảnh'}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                        disabled={uploading}
                      />
                    </label>
                  </div>
                  <div className="relative h-48 rounded-lg overflow-hidden border border-outline-variant bg-surface-container-low flex flex-col items-center justify-center">
                    <img
                      className="absolute inset-0 w-full h-full object-cover"
                      alt="Industrial LPG terminal preview"
                      src={heroImage}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Stats Config Block */}
          <div className="bg-white border border-outline-variant/30 rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6 border-b border-outline-variant/20 pb-2">
              <h3 className="text-sm font-bold text-primary flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">bar_chart</span> Cấu hình Chỉ số thống kê (Stats Counter)
              </h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-on-surface-variant font-medium">Hiển thị trên trang chủ:</span>
                  <button
                    onClick={() => toggleSection('stats')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                      sections.find(s => s.id === 'stats')?.visible ? 'bg-secondary' : 'bg-outline-variant'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        sections.find(s => s.id === 'stats')?.visible ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => toggleSectionExpand('stats')}
                  className="text-on-surface-variant hover:text-primary transition-all flex items-center gap-1 border border-outline-variant/30 px-2 py-1 rounded bg-[#fcf9f5]"
                >
                  <span className="material-symbols-outlined text-sm">
                    {expandedSections.stats ? 'expand_less' : 'expand_more'}
                  </span>
                  <span className="text-[10px] font-bold">
                    {expandedSections.stats ? 'Thu gọn' : 'Mở rộng'}
                  </span>
                </button>
              </div>
            </div>
            {expandedSections.stats && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {stats.map((s, idx) => (
                  <div key={idx} className="p-4 border border-outline-variant/40 rounded-lg space-y-3 bg-surface-container-low flex flex-col justify-between">
                    <span className="font-bold text-primary">Chỉ số {idx + 1}</span>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="font-semibold block text-[10px] text-on-surface-variant mb-1">Giá trị (Value)</label>
                        <input
                          className="w-full h-8 px-2 border border-outline-variant rounded outline-none"
                          type="text"
                          value={s.value}
                          onChange={(e) => {
                            const val = e.target.value;
                            setStats(prev => prev.map((item, i) => i === idx ? { ...item, value: val } : item));
                          }}
                        />
                      </div>
                      <div>
                        <label className="font-semibold block text-[10px] text-on-surface-variant mb-1">Nhãn (Label)</label>
                        <input
                          className="w-full h-8 px-2 border border-outline-variant rounded outline-none"
                          type="text"
                          value={s.label}
                          onChange={(e) => {
                            const val = e.target.value;
                            setStats(prev => prev.map((item, i) => i === idx ? { ...item, label: val } : item));
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Lĩnh vực hoạt động */}
          <div className="bg-white border border-outline-variant/30 rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6 border-b border-outline-variant/20 pb-2">
              <h3 className="text-sm font-bold text-primary flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">factory</span> Khối Lĩnh vực hoạt động (Về chúng tôi)
              </h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-on-surface-variant font-medium">Hiển thị trên trang chủ:</span>
                  <button
                    onClick={() => toggleSection('services')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                      sections.find(s => s.id === 'services')?.visible ? 'bg-secondary' : 'bg-outline-variant'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        sections.find(s => s.id === 'services')?.visible ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                <button
                  onClick={() => {
                    setFeatures(prev => [
                      ...prev,
                      {
                        id: String(Date.now()),
                        title: 'Lĩnh vực mới',
                        desc: 'Mô tả tóm tắt cho lĩnh vực hoạt động mới...',
                        icon: 'verified_user'
                      }
                    ]);
                  }}
                  className="text-primary font-bold text-xs hover:underline flex items-center gap-1"
                >
                  + Thêm lĩnh vực
                </button>
                <button
                  type="button"
                  onClick={() => toggleSectionExpand('about')}
                  className="text-on-surface-variant hover:text-primary transition-all flex items-center gap-1 border border-outline-variant/30 px-2 py-1 rounded bg-[#fcf9f5]"
                >
                  <span className="material-symbols-outlined text-sm">
                    {expandedSections.about ? 'expand_less' : 'expand_more'}
                  </span>
                  <span className="text-[10px] font-bold">
                    {expandedSections.about ? 'Thu gọn' : 'Mở rộng'}
                  </span>
                </button>
              </div>
            </div>

            {expandedSections.about && (
              <>
                {/* Cấu hình chung Về chúng tôi */}
                <div className="mb-6 p-4 border border-outline-variant/30 rounded-xl bg-surface-container-low text-xs space-y-4">
                  <h4 className="font-bold text-primary text-[11px] uppercase tracking-wider border-b border-outline-variant/20 pb-1.5 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm">info</span> Cấu hình thông tin giới thiệu chung (Về chúng tôi)
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="font-bold text-on-surface-variant block text-[10px]">Tiêu đề phần giới thiệu</label>
                      <input
                        className="w-full h-10 px-3 rounded border border-outline-variant/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                        type="text"
                        value={aboutTitle}
                        onChange={(e) => setAboutTitle(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-on-surface-variant block text-[10px]">Ảnh minh họa Về chúng tôi</label>
                      <div className="flex gap-2">
                        <input
                          className="flex-1 h-9 px-3 rounded border border-outline-variant/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-[11px]"
                          type="text"
                          value={aboutImage}
                          onChange={(e) => setAboutImage(e.target.value)}
                          placeholder="Nhập URL hình ảnh..."
                        />
                        <label className="flex items-center justify-center gap-1 bg-primary text-white px-3 rounded cursor-pointer hover:bg-[#93000d] transition-all font-bold text-[10px] h-9 flex-shrink-0">
                          <span className="material-symbols-outlined text-sm">
                            {aboutUploading ? 'sync' : 'upload'}
                          </span>
                          {aboutUploading ? 'Đang tải...' : 'Tải lên'}
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleAboutImageUpload}
                            disabled={aboutUploading}
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2 space-y-1">
                      <label className="font-bold text-on-surface-variant block text-[10px]">Mô tả chi tiết</label>
                      <textarea
                        className="w-full min-h-[90px] p-3 rounded border border-outline-variant/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-y"
                        value={aboutDesc}
                        onChange={(e) => setAboutDesc(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-on-surface-variant block text-[10px]">Xem trước ảnh</label>
                      <div className="relative h-[90px] rounded-lg overflow-hidden border border-outline-variant/40 bg-surface flex items-center justify-center">
                        <img
                          className="w-full h-full object-cover"
                          alt="About section illustration preview"
                          src={aboutImage}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-outline-variant/20 pt-4 mb-4">
                  <h4 className="font-bold text-primary text-[11px] uppercase tracking-wider mb-1">Các gạch đầu dòng năng lực / lĩnh vực hoạt động</h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {features.map((f) => (
                    <div key={f.id} className="p-4 border border-outline-variant/40 rounded-xl space-y-4 bg-surface flex flex-col text-xs shadow-sm">
                      <div className="flex justify-between items-center border-b border-outline-variant/20 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-primary text-base">{f.icon || 'verified_user'}</span>
                          <span className="font-bold text-primary text-[10px] uppercase tracking-wider">Lĩnh vực hoạt động</span>
                        </div>
                        <button
                          onClick={() => deleteFeature(f.id)}
                          className="flex items-center gap-1 text-secondary hover:text-[#93000d] font-bold text-[10px]"
                        >
                          <span className="material-symbols-outlined text-sm">delete</span> Xóa
                        </button>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 gap-2">
                          <div className="space-y-1">
                            <label className="font-semibold block text-[10px] text-on-surface-variant">Tiêu đề lĩnh vực</label>
                            <input
                              className="w-full h-8 px-2 border border-outline-variant rounded outline-none focus:border-primary"
                              type="text"
                              value={f.title}
                              onChange={(e) => {
                                const val = e.target.value;
                                setFeatures(prev => prev.map(item => item.id === f.id ? { ...item, title: val } : item));
                              }}
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="font-semibold block text-[10px] text-on-surface-variant">Biểu tượng (Icon)</label>
                          <div className="flex gap-2">
                            <select
                              className="flex-1 h-8 px-1.5 border border-outline-variant rounded outline-none focus:border-primary text-[11px]"
                              value={['handshake', 'policy', 'history_edu', 'security', 'verified_user', 'school', 'engineering', 'groups', 'workspace_premium', 'support_agent'].includes(f.icon || '') ? (f.icon || 'verified_user') : 'custom'}
                              onChange={(e) => {
                                const val = e.target.value;
                                if (val !== 'custom') {
                                  setFeatures(prev => prev.map(item => item.id === f.id ? { ...item, icon: val } : item));
                                }
                              }}
                            >
                              <option value="handshake">Bắt tay (handshake)</option>
                              <option value="policy">Chính sách (policy)</option>
                              <option value="history_edu">Văn bản (history_edu)</option>
                              <option value="security">An toàn (security)</option>
                              <option value="verified_user">Xác thực (verified_user)</option>
                              <option value="school">Đào tạo (school)</option>
                              <option value="engineering">Kỹ thuật (engineering)</option>
                              <option value="groups">Hội viên (groups)</option>
                              <option value="workspace_premium">Thương hiệu (workspace_premium)</option>
                              <option value="support_agent">Hỗ trợ (support_agent)</option>
                              <option value="custom">Tùy biến...</option>
                            </select>
                            <input
                              className="w-24 h-8 px-2 border border-outline-variant rounded outline-none focus:border-primary"
                              type="text"
                              placeholder="Icon name..."
                              value={f.icon || ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                setFeatures(prev => prev.map(item => item.id === f.id ? { ...item, icon: val } : item));
                              }}
                            />
                          </div>
                          <span className="text-[9px] text-on-surface-variant block mt-0.5">Nhập tên icon Material Icons Google hoặc chọn từ danh sách.</span>
                        </div>

                        <div className="space-y-1">
                          <label className="font-semibold block text-[10px] text-on-surface-variant">Mô tả ngắn</label>
                          <textarea
                            className="w-full min-h-[50px] p-2 border border-outline-variant rounded outline-none focus:border-primary resize-y"
                            value={f.desc}
                            onChange={(e) => {
                              const val = e.target.value;
                              setFeatures(prev => prev.map(item => item.id === f.id ? { ...item, desc: val } : item));
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Core Services Block */}
          <div className="bg-white border border-outline-variant/30 rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6 border-b border-outline-variant/20 pb-2">
              <h3 className="text-sm font-bold text-primary flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">medical_services</span> Khối Lĩnh vực cốt lõi (Core Services)
              </h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-on-surface-variant font-medium">Hiển thị trên trang chủ:</span>
                  <button
                    onClick={() => toggleSection('services')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                      sections.find(s => s.id === 'services')?.visible ? 'bg-secondary' : 'bg-outline-variant'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        sections.find(s => s.id === 'services')?.visible ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => toggleSectionExpand('services')}
                  className="text-on-surface-variant hover:text-primary transition-all flex items-center gap-1 border border-outline-variant/30 px-2 py-1 rounded bg-[#fcf9f5]"
                >
                  <span className="material-symbols-outlined text-sm">
                    {expandedSections.services ? 'expand_less' : 'expand_more'}
                  </span>
                  <span className="text-[10px] font-bold">
                    {expandedSections.services ? 'Thu gọn' : 'Mở rộng'}
                  </span>
                </button>
              </div>
            </div>
            {expandedSections.services && (
              <div className="space-y-4 text-xs">
                {coreServices.map((cs, idx) => (
                  <div key={idx} className="p-4 border border-outline-variant/40 rounded-lg space-y-3 bg-surface-container-low">
                    <span className="font-bold text-primary">Dịch vụ {idx + 1}</span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="font-semibold block text-[10px] text-on-surface-variant">Tiêu đề</label>
                        <input
                          className="w-full h-9 px-3 border border-outline-variant rounded outline-none focus:border-primary"
                          type="text"
                          value={cs.title}
                          onChange={(e) => {
                            const val = e.target.value;
                            setCoreServices(prev => prev.map((item, i) => i === idx ? { ...item, title: val } : item));
                          }}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-semibold block text-[10px] text-on-surface-variant">Mô tả</label>
                        <input
                          className="w-full h-9 px-3 border border-outline-variant rounded outline-none focus:border-primary"
                          type="text"
                          value={cs.desc}
                          onChange={(e) => {
                            const val = e.target.value;
                            setCoreServices(prev => prev.map((item, i) => i === idx ? { ...item, desc: val } : item));
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Khối Tin tức & Sự kiện */}
          <div className="bg-white border border-outline-variant/30 rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6 border-b border-outline-variant/20 pb-2">
              <h3 className="text-sm font-bold text-primary flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">feed</span> Khối Tin tức, Văn bản & Sự kiện
              </h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-on-surface-variant font-medium">Hiển thị trên trang chủ:</span>
                  <button
                    onClick={() => toggleSection('news')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                      sections.find(s => s.id === 'news')?.visible ? 'bg-secondary' : 'bg-outline-variant'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        sections.find(s => s.id === 'news')?.visible ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => toggleSectionExpand('news')}
                  className="text-on-surface-variant hover:text-primary transition-all flex items-center gap-1 border border-outline-variant/30 px-2 py-1 rounded bg-[#fcf9f5]"
                >
                  <span className="material-symbols-outlined text-sm">
                    {expandedSections.news ? 'expand_less' : 'expand_more'}
                  </span>
                  <span className="text-[10px] font-bold">
                    {expandedSections.news ? 'Thu gọn' : 'Mở rộng'}
                  </span>
                </button>
              </div>
            </div>
            {expandedSections.news && (
              <div className="space-y-4 text-xs">
                <p className="text-on-surface-variant leading-relaxed">
                  Khối này hiển thị các tin tức tissue, danh mục văn bản mới và lịch trình các sự kiện / đào tạo sắp diễn ra của hiệp hội trên trang chủ.
                </p>
                <div className="flex flex-wrap gap-3 pt-2">
                  <Link
                    href="/admin/tin-tuc"
                    className="flex items-center gap-1.5 bg-primary-container/10 border border-primary/20 text-primary hover:bg-primary-container/20 px-4 py-2 rounded-lg font-bold transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">newspaper</span> Quản lý Tin tức
                  </Link>
                  <Link
                    href="/admin/su-kien"
                    className="flex items-center gap-1.5 bg-primary-container/10 border border-primary/20 text-primary hover:bg-primary-container/20 px-4 py-2 rounded-lg font-bold transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">event</span> Quản lý Sự kiện & Đào tạo
                  </Link>
                  <Link
                    href="/admin/van-ban"
                    className="flex items-center gap-1.5 bg-primary-container/10 border border-primary/20 text-primary hover:bg-primary-container/20 px-4 py-2 rounded-lg font-bold transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">description</span> Quản lý Văn bản
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Khối Hội viên tiêu biểu */}
          <div className="bg-white border border-outline-variant/30 rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6 border-b border-outline-variant/20 pb-2">
              <h3 className="text-sm font-bold text-primary flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">workspace_premium</span> Khối Hội viên tiêu biểu
              </h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-on-surface-variant font-medium">Hiển thị trên trang chủ:</span>
                  <button
                    onClick={() => toggleSection('members')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                      sections.find(s => s.id === 'members')?.visible ? 'bg-secondary' : 'bg-outline-variant'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        sections.find(s => s.id === 'members')?.visible ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
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

                <div className="flex flex-wrap gap-3 pt-4 border-t border-outline-variant/20">
                  <Link
                    href="/admin/hoi-vien"
                    className="flex items-center gap-1.5 bg-primary-container/10 border border-primary/20 text-primary hover:bg-primary-container/20 px-4 py-2 rounded-lg font-bold transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">groups</span> Quản lý Hội viên
                  </Link>
                  <Link
                    href="/admin/trang-hoi-vien"
                    className="flex items-center gap-1.5 bg-primary-container/10 border border-primary/20 text-primary hover:bg-primary-container/20 px-4 py-2 rounded-lg font-bold transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">web</span> Cấu hình trang Hội viên
                  </Link>
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
        </div>
      </div>

      {/* Floating Toast Notification */}
      {showToast && (
        <div className="fixed bottom-8 right-8 bg-inverse-surface text-inverse-on-surface px-6 py-4 rounded-xl shadow-2xl flex items-center gap-4 z-[100] animate-bounce">
          <span className="material-symbols-outlined text-primary-fixed-dim">check_circle</span>
          <span className="text-xs font-bold">Lưu cấu hình trang chủ thành công và đã đồng bộ lên môi trường live!</span>
        </div>
      )}
    </div>
  );
}
