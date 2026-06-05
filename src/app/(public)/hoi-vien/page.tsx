'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import defaultMembers from '@/lib/defaultMembers.json';
import defaultChapters from '@/lib/defaultChapters.json';

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
  
  // Extended fields
  chapter_id?: string;
  chapter_name?: string;
  association_role: string; // 'Ủy viên BCH' | 'Hội viên chính thức' | 'Hội viên liên kết'
  chapter_role?: string;
  join_date: string;
  logo_url?: string;
  representative_avatar_url?: string;
}

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

const MOCK_CHAPTERS: Chapter[] = [
  {
    id: 'hn-north',
    name: 'Chi hội LPG Hà Nội',
    region: 'Miền Bắc',
    locations: 'Hà Nội, Vĩnh Phúc, Bắc Ninh',
    memberCount: 42,
    image_url: 'https://lh3.googleusercontent.com/aida/AP1WRLuK2dctwyDl268C2MGfbO9NNMTHYs82AQL9124WuoEY1ROkEAIK9wuGKdfSHAFoSkVErt430XlTvCY4s0BFdAGaZmdJGMdas1JE7L2TR23KxWbJVtbk9BSQalImZ9zQVvJK3pJjGJ9tWzEXhjBtJq8WGZcw_abh0ffIRWdwZrOoBFfh9M4bucRL3MjP92HfVfAMkXr5SxhPbn-a0Qw45SNsvf8u5WQsFhSMUm12qXJwKeFB1l-M6PuAFw',
    slogan: 'An toàn hàng đầu - Phát triển bền vững',
    description: 'Chi hội đại diện cho các doanh nghiệp LPG tại thủ đô Hà Nội và các tỉnh lân cận phía Bắc.'
  },
  {
    id: 'hp-north',
    name: 'Chi hội LPG Hải Phòng',
    region: 'Miền Bắc',
    locations: 'Hải Phòng, Quảng Ninh',
    memberCount: 28,
    image_url: 'https://lh3.googleusercontent.com/aida/AP1WRLuYGy0yf5ZCa5whGAyqDwkU942jqx8cJ-6x_B6rQWuor6AfLqa6NnBpjFnTvMc-WCUzPKG9WlT2EIkkZV644akuOcJEKJdORejpZ6Yua-Llq-FoE1keqWQ_mravjcKmzFgRwJG9vpPUWoj5bXecrlT_9ic7ffGgJuML_HBOsnYi7GQ9_KpxMeHSpuNNVVYyRLimN5LnLkkVD350Sg3PNqmqMcsOOkjs7AV0LZsGwp1grDUdcOAaL_z6Ths',
    slogan: 'Vươn khơi bám biển - Kết nối năng lượng',
    description: 'Tập hợp các doanh nghiệp dịch vụ cảng biển, kho cảng LPG lớn tại khu vực Hải Phòng, Quảng Ninh.'
  },
  {
    id: 'tb-north',
    name: 'Chi hội LPG Tây Bắc',
    region: 'Miền Bắc',
    locations: 'Phú Thọ, Yên Bái, Lào Cai',
    memberCount: 15,
    image_url: 'https://lh3.googleusercontent.com/aida/AP1WRLsGfcRyIguCU2ihFup81yruFEfMF7zXtVbVJbw3e8nJrvLl7qHjl2k2V6-4g9ZFnTaOlkyH1PDeD-pt8lAFLIhEw4-x1VS_huxHTtc7m--imHUYpa0NYediG_38VXsvqMMENnGMuQnUt4GnPtFwtJ_pRulCg0vER4a2eyD2DnCsKD7qkebGsX0m20A0Qs3LKTbOXFcMxo70K0Fv6tqGjYBGHPOXBZRG_DPJG2tNQeOPA55KiLvq77qtLuY',
    slogan: 'Năng lượng xanh cho bản làng',
    description: 'Đảm bảo cung ứng và an toàn sử dụng LPG tại các tỉnh vùng cao Tây Bắc.'
  },
  {
    id: 'hcm-south',
    name: 'Chi hội LPG TP. Hồ Chí Minh',
    region: 'Miền Nam',
    locations: 'TP.HCM, Bình Dương, Long An',
    memberCount: 85,
    image_url: 'https://lh3.googleusercontent.com/aida/AP1WRLujv1MPmXdkM9cc3-Ix07QZtCnC2SnxcdISO_5gH9aDialxW55eNPi9dbLIcFpkIdZt7J57P5TiCEJ3ehlx_YCeUAn9oSRDDX2BtAR03imA-pB-l9t6IP1doAPYvccXyapC37o2F9QAvDjnpsUnyn68-2vKHKWsRLGD5m-xPoPBLki-NjcF2ygWF6xVrYFFoUHIAQVz_ICw19rYylfJBFs9c2_EAvn1wccryyT5BfXnVZ1e-ygZQukakQ',
    slogan: 'Gắn kết sức mạnh - Ngành Gas Phương Nam',
    description: 'Chi hội lớn nhất cả nước quy tụ các doanh nghiệp tại đầu tàu kinh tế phía Nam.'
  },
  {
    id: 'tnb-south',
    name: 'Chi hội LPG Tây Nam Bộ',
    region: 'Miền Nam',
    locations: 'Cần Thơ, Hậu Giang, Đồng Tháp',
    memberCount: 34,
    image_url: 'https://lh3.googleusercontent.com/aida/AP1WRLuqop1YVhOegilkvJH4pqVauz48vAnSFYZ3M6jba4GSbeXvFVAUIyRsyllUyjTae-kXv0bp6IFnE0y4ekbbv6ZMzTCrkqolbku34WnOeabBkhzasp5qLcYOC8hT7HqyJnzKKwao7wnMfc9gzeKmExYbd7m9jO0UG-0R1QN8R1WZs97QYzlYYhRNZvHFu45fhKuBqTWZlW-OFjkF6W_FfH5lI7cCkj02NRIl3Hr1emab8W3nW9aCV0RsRQ',
    slogan: 'Năng lượng sạch sông nước miền Tây',
    description: 'Kết nối mạng lưới phân phối gas an toàn dọc theo các tỉnh đồng bằng sông Cửu Long.'
  }
];

const MOCK_MEMBERS: Member[] = [
  {
    id: 'sp-1',
    company_name: 'Tập đoàn Dầu khí Việt Nam (PVN)',
    tax_code: '0100150619',
    address: 'Hà Nội',
    phone: '024 3825 2154',
    email: 'info@pvn.vn',
    business_type: 'Sản xuất & Chiết nạp',
    representative_name: 'Ông Lê Mạnh Hùng',
    representative_role: 'Chủ tịch HĐTV',
    representative_email: 'hunglm@pvn.vn',
    representative_phone: '0901234567',
    status: 'Active',
    created_at: '2010-05-15T00:00:00Z',
    association_role: 'Ủy viên BCH',
    chapter_role: 'Cố vấn cấp cao',
    join_date: '2010-05-15',
    chapter_id: 'hn-north',
    chapter_name: 'Chi hội LPG Hà Nội',
    logo_url: 'https://lh3.googleusercontent.com/aida/AP1WRLuglnRl5gmLyf0yjPoBdSC55tsB1431C7PLAhByHJVSmfc-pEM_kLYCH5FY5AAfDjwss6QWVzKUKkSR6rCueIUgRCFe_TddGJN36KmXzLR1Nr7MyRiVAQbse1HGRVjt4lJcaAsQsnkAGZDYlnVw4U_30oEJj0bzoVqmeNAX59YFSNgos2T-7c5ApJ1jgUUe2QDFJs-JUHY6s5atCg6nJEgEsq4kkl9q-pHqxRCCuCwuvOcMwEjzTfZLjQ'
  },
  {
    id: 'sp-2',
    company_name: 'Tổng công ty Khí Việt Nam (PV GAS)',
    tax_code: '0300793715',
    address: 'TP. Hồ Chí Minh',
    phone: '028 3781 6777',
    email: 'info@pvgas.com.vn',
    business_type: 'Sản xuất & Chiết nạp',
    representative_name: 'Ông Phạm Văn Phong',
    representative_role: 'Tổng Giám đốc',
    representative_email: 'phongpv@pvgas.com.vn',
    representative_phone: '0902345678',
    status: 'Active',
    created_at: '2012-08-20T00:00:00Z',
    association_role: 'Ủy viên BCH',
    chapter_role: 'Phó Chi hội trưởng',
    join_date: '2012-08-20',
    chapter_id: 'hcm-south',
    chapter_name: 'Chi hội LPG TP. Hồ Chí Minh',
    logo_url: 'https://lh3.googleusercontent.com/aida/AP1WRLsrvuqEz7oz2O5tGh2bVuN4HGfXYIBEFhnbBIL2L7xfye-tLFvAUY62q_XFq4k6sjT7vMpZgARFc1S9ABLKn62XZKj5MKmVH9ItDJ_mxhCv-1T-bC7toM33XqgIo0muzSMtFhuWykWkyBEOIoqDJJtnILjaXNoiv_HJ84JRb2txju76QrTVQhim5FvolwGYK2UFlBzqvoB-deG60jIf3c1yJJslceHSVhFzO8EXWSrQr8aMiWxElXt0wRY'
  },
  {
    id: 'sp-3',
    company_name: 'Petrolimex Gas',
    tax_code: '0101234567',
    address: 'Hà Nội',
    phone: '024 3864 5321',
    email: 'info@pgas.petrolimex.com.vn',
    business_type: 'Phân phối & Bán lẻ',
    representative_name: 'Ông Nguyễn Phúc Tuệ',
    representative_role: 'Phó Tổng Giám đốc',
    representative_email: 'tuenp@petrolimex.com.vn',
    representative_phone: '0903456789',
    status: 'Active',
    created_at: '2015-11-12T00:00:00Z',
    association_role: 'Hội viên chính thức',
    chapter_role: 'Thường trực Chi hội',
    join_date: '2015-11-12',
    chapter_id: 'hn-north',
    chapter_name: 'Chi hội LPG Hà Nội',
    logo_url: 'https://lh3.googleusercontent.com/aida/AP1WRLsrvuqEz7oz2O5tGh2bVuN4HGfXYIBEFhnbBIL2L7xfye-tLFvAUY62q_XFq4k6sjT7vMpZgARFc1S9ABLKn62XZKj5MKmVH9ItDJ_mxhCv-1T-bC7toM33XqgIo0muzSMtFhuWykWkyBEOIoqDJJtnILjaXNoiv_HJ84JRb2txju76QrTVQhim5FvolwGYK2UFlBzqvoB-deG60jIf3c1yJJslceHSVhFzO8EXWSrQr8aMiWxElXt0wRY'
  },
  {
    id: 'sp-4',
    company_name: 'Công ty CP Kinh doanh Khí Miền Nam',
    tax_code: '0305097236',
    address: 'TP. Hồ Chí Minh',
    phone: '028 3910 0108',
    email: 'info@pgs.com.vn',
    business_type: 'Phân phối & Bán lẻ',
    representative_name: 'Bà Đặng Thị Hồng',
    representative_role: 'Giám đốc Điều hành',
    representative_email: 'hongdt@pgs.com.vn',
    representative_phone: '0904567890',
    status: 'Active',
    created_at: '2018-01-05T00:00:00Z',
    association_role: 'Hội viên chính thức',
    chapter_role: 'Trưởng ban Kiểm tra',
    join_date: '2018-01-05',
    chapter_id: 'hcm-south',
    chapter_name: 'Chi hội LPG TP. Hồ Chí Minh',
    logo_url: 'https://lh3.googleusercontent.com/aida/AP1WRLuQtIcc0SHzaEdGQArWmAn-lF1ep63z1uw6jwQE1EyUARi9INmMvLbOEDElJTUD_Inf__fGyeDkP0gmWDNhZ01XPhNZ_h7W_ol7l8HEapJxa_EAOdpD-4I9b0L4FENs2vbUwZ5AgAA9vYQM3jw9iVIIMdyHZdEMYpBYtweEZhKecv743bFxPBz39ddWdwrOkL8vWOxxURZmNn4C3gfa_rne8QvX1GDazH4PDIPPHTgSqv-aw8HrdZiamA'
  },
  {
    id: 'sp-5',
    company_name: 'CTCP Thiết bị Năng lượng Hoàng Gia',
    tax_code: '0402123456',
    address: 'Đà Nẵng',
    phone: '0236 381 2345',
    email: 'info@hoanggiagas.com',
    business_type: 'Dịch vụ kỹ thuật',
    representative_name: 'Ông Trần Quốc Vinh',
    representative_role: 'Chủ tịch HĐQT',
    representative_email: 'vinhtq@hoanggiagas.com',
    representative_phone: '0905678901',
    status: 'Active',
    created_at: '2021-03-22T00:00:00Z',
    association_role: 'Hội viên liên kết',
    chapter_role: 'Chi hội trưởng',
    join_date: '2021-03-22',
    logo_url: 'https://lh3.googleusercontent.com/aida/AP1WRLsB8WON4bt39iOnnH-k32h6Aey4NpauL5rMqNyDNCOcuATqee-ij9dvDFfOzV1G5q-Tt3CU4cMLhtDmuKtbPWK2C30H6QskdXx0iKhhDxT1xX3ZPPG1LoccOI0QSppjQUX3lkdr-os7AALqX3ubezyKUro7PvUwdJS1319wOgNRGadGM3Fa8VZAz1glzrQPSBuZPPC0yYXVUOPNUJpS_NonfmFMh4a_noSCJjyfL1NSOB7hQ0Qx93y97yg'
  }
];

const getRoleColor = (roleName: string, configuredRoles: any[]) => {
  const config = configuredRoles.find(r => 
    typeof r === 'object' && r !== null ? r.name === roleName : r === roleName
  );
  if (config && typeof config === 'object' && config.color) {
    return { bg: config.color, text: config.textColor || '#ffffff' };
  }
  
  // Fallbacks
  const normalized = (roleName || '').trim();
  if (normalized === 'Chủ tịch') return { bg: '#bb0013', text: '#ffffff' };
  if (normalized === 'Phó Chủ tịch') return { bg: '#00346f', text: '#ffffff' };
  if (normalized === 'Ban kiểm tra') return { bg: '#d97706', text: '#ffffff' };
  if (normalized.includes('Thường vụ')) return { bg: '#0284c7', text: '#ffffff' };
  if (normalized.includes('Chấp hành') || normalized === 'Ủy viên BCH') return { bg: '#d7e2ff', text: '#001b3f' };
  return { bg: '#e7e5e4', text: '#1c1c1a' };
};

export default function MembersPage() {
  const [activeTab, setActiveTab] = useState<'members' | 'chapters'>('members');
  
  // Search & Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [chapterSearch, setChapterSearch] = useState('');

  const [associationRoles, setAssociationRoles] = useState<any[]>([
    { name: 'Chủ tịch', color: '#bb0013', textColor: '#ffffff' },
    { name: 'Phó Chủ tịch', color: '#00346f', textColor: '#ffffff' },
    { name: 'Ban kiểm tra', color: '#d97706', textColor: '#ffffff' },
    { name: 'Ủy viên Ban Thường vụ', color: '#0284c7', textColor: '#ffffff' },
    { name: 'Ủy viên Ban Chấp hành', color: '#d7e2ff', textColor: '#001b3f' },
    { name: 'Hội viên chính thức', color: '#e7e5e4', textColor: '#1c1c1a' },
    { name: 'Hội viên liên kết', color: '#e7e5e4', textColor: '#1c1c1a' }
  ]);

  // Detailed Modal State
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  // Layout Dynamic States
  const [headline, setHeadline] = useState('Danh sách Hội viên Hiệp hội');
  const [subtext, setSubtext] = useState('Nơi quy tụ các doanh nghiệp hàng đầu trong lĩnh vực Khí dầu mỏ hóa lỏng (LPG) tại Việt Nam, cam kết vì sự phát triển bền vững và an toàn năng lượng.');
  const [heroImage, setHeroImage] = useState('https://lh3.googleusercontent.com/aida-public/AB6AXuBTP1VwRhiXz7IslKk8lyrl_NZjrM0MYtWMLyaBrXhEX2DRZ9wIHjlle-92NsUhnYmQwD4yTguPqimc2ewjOD30dygdkHwHt7s9NXsMPSnzWvTyHO_1lM5j2kM_9BcFoN9m67VEakH0ReGkHCz2mX7R0kfbHFSyqSNrqYFcUsBMK0sm4skbO_7LO2Qs237Mbc_zUrwOxQ0lEHdDE-3w74hK182bzXXoJ9Nz4No0EMfJPJZ14JUTiBDxNw-onJOCwry6C0bNPzf9aJY');

  // Interactive Section Reordering State
  const [sections, setSections] = useState([
    { id: 'hero', name: '1. Banner chính', visible: true },
    { id: 'tabs', name: '2. Danh sách Hội viên', visible: true },
    { id: 'stats', name: '3. Thống kê tổng hợp', visible: true },
    { id: 'benefits', name: '4. Quyền lợi hội viên', visible: true },
    { id: 'steps', name: '5. Quy trình gia nhập', visible: true }
  ]);

  const [stats, setStats] = useState([
    { value: '64', label: 'Doanh nghiệp Hội viên', icon: 'groups' },
    { value: '63', label: 'Tỉnh thành phủ sóng', icon: 'location_on' },
    { value: '100%', label: 'Cam kết an toàn', icon: 'verified' },
    { value: '2025', label: 'Năm thành lập', icon: 'calendar_today' },
  ]);

  const [benefits, setBenefits] = useState([
    { title: 'Kết nối doanh nghiệp', desc: 'Kết nối với cộng đồng hội viên và đối tác chiến lược trong ngành LPG toàn quốc.', icon: 'hub' },
    { title: 'Cập nhật chính sách', desc: 'Cập nhật nhanh chóng chính sách, quy định pháp luật mới nhất liên quan đến khí hóa lỏng.', icon: 'update' },
    { title: 'Đào tạo chuyên môn', desc: 'Tham gia các khóa đào tạo, hội thảo chuyên đề kỹ thuật và quản lý chất lượng cao.', icon: 'school' },
    { title: 'Xúc tiến hợp tác', desc: 'Cơ hội hợp tác, mở rộng thị trường và phát triển các liên kết kinh doanh bền vững.', icon: 'rocket_launch' },
    { title: 'Hỗ trợ pháp lý', desc: 'Tư vấn, hỗ trợ pháp lý và bảo vệ quyền lợi hợp pháp của hội viên trong kinh doanh.', icon: 'gavel' },
    { title: 'Nâng cao uy tín', desc: 'Tăng uy tín và hình ảnh thương hiệu thông qua các hoạt động cộng đồng của Hiệp hội.', icon: 'verified' },
  ]);

  const [steps, setSteps] = useState([
    { title: 'Đăng ký hồ sơ', desc: 'Doanh nghiệp điền thông tin và nộp hồ sơ đăng ký online.', icon: 'description', step: '01' },
    { title: 'Xét duyệt', desc: 'Ban chấp hành xem xét, thẩm định và phê duyệt hồ sơ.', icon: 'fact_check', step: '02' },
    { title: 'Kết nối - Kích hoạt', desc: 'Kích hoạt quyền hội viên và bắt đầu các hoạt động kết nối.', icon: 'handshake', step: '03' },
    { title: 'Tham gia cộng đồng', desc: 'Hưởng đầy đủ quyền lợi và tham gia các sự kiện của Hiệp hội.', icon: 'celebration', step: '04' },
  ]);

  const [memberList, setMemberList] = useState<Member[]>(defaultMembers as Member[]);
  const [chapterList, setChapterList] = useState<Chapter[]>(defaultChapters as Chapter[]);

  // Fetch Live Data from Supabase
  useEffect(() => {
    const normalizeSections = (rawSections: any[]) => {
      const temp = [...rawSections];
      const hasStats = temp.some((s: any) => s.id === 'stats');
      if (!hasStats) {
        const tabsIdx = temp.findIndex((s: any) => s.id === 'tabs');
        if (tabsIdx !== -1) {
          temp.splice(tabsIdx + 1, 0, { id: 'stats', name: 'Thống kê tổng hợp', visible: true });
        } else {
          temp.push({ id: 'stats', name: 'Thống kê tổng hợp', visible: true });
        }
      }
      return temp.map((s, idx) => {
        let cleanName = s.name.replace(/^\d+\.\s*/, '');
        return {
          ...s,
          name: `${idx + 1}. ${cleanName}`
        };
      });
    };

    async function loadMembersData() {
      // 1. Fetch layout configs
      if (supabase) {
        try {
          const { data: pageConfig } = await supabase
            .from('website_config')
            .select('value')
            .eq('key', 'memberspage')
            .single();
          if (pageConfig?.value) {
            const val = pageConfig.value;
            if (val.headline) setHeadline(val.headline);
            if (val.subtext) setSubtext(val.subtext);
            if (val.heroImage) setHeroImage(val.heroImage);
            if (val.stats) setStats(val.stats);
            if (val.benefits) setBenefits(val.benefits);
            if (val.steps) setSteps(val.steps);
            if (val.sections) setSections(normalizeSections(val.sections));
            if (val.associationRoles && Array.isArray(val.associationRoles)) {
              const normalized = val.associationRoles.map((r: any) => {
                if (typeof r === 'object' && r !== null) return r;
                const defaults = { bg: '#e7e5e4', text: '#1c1c1a' };
                if (r === 'Chủ tịch') { defaults.bg = '#bb0013'; defaults.text = '#ffffff'; }
                else if (r === 'Phó Chủ tịch') { defaults.bg = '#00346f'; defaults.text = '#ffffff'; }
                else if (r === 'Ban kiểm tra') { defaults.bg = '#d97706'; defaults.text = '#ffffff'; }
                else if (r.includes('Thường vụ')) { defaults.bg = '#0284c7'; defaults.text = '#ffffff'; }
                else if (r.includes('Chấp hành') || r === 'Ủy viên BCH') { defaults.bg = '#d7e2ff'; defaults.text = '#001b3f'; }
                return { name: r, color: defaults.bg, textColor: defaults.text };
              });
              setAssociationRoles(normalized);
            }
          }
        } catch (e) {}
      } else {
        const saved = localStorage.getItem('hoba_website_config_memberspage');
        if (saved) {
          try {
            const val = JSON.parse(saved);
            if (val.headline) setHeadline(val.headline);
            if (val.subtext) setSubtext(val.subtext);
            if (val.heroImage) setHeroImage(val.heroImage);
            if (val.stats) setStats(val.stats);
            if (val.benefits) setBenefits(val.benefits);
            if (val.steps) setSteps(val.steps);
            if (val.sections) setSections(normalizeSections(val.sections));
            if (val.associationRoles && Array.isArray(val.associationRoles)) {
              const normalized = val.associationRoles.map((r: any) => {
                if (typeof r === 'object' && r !== null) return r;
                const defaults = { bg: '#e7e5e4', text: '#1c1c1a' };
                if (r === 'Chủ tịch') { defaults.bg = '#bb0013'; defaults.text = '#ffffff'; }
                else if (r === 'Phó Chủ tịch') { defaults.bg = '#00346f'; defaults.text = '#ffffff'; }
                else if (r === 'Ban kiểm tra') { defaults.bg = '#d97706'; defaults.text = '#ffffff'; }
                else if (r.includes('Thường vụ')) { defaults.bg = '#0284c7'; defaults.text = '#ffffff'; }
                else if (r.includes('Chấp hành') || r === 'Ủy viên BCH') { defaults.bg = '#d7e2ff'; defaults.text = '#001b3f'; }
                return { name: r, color: defaults.bg, textColor: defaults.text };
              });
              setAssociationRoles(normalized);
            }
          } catch (e) {}
        }
      }

      // 2. Fetch chapters list
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
                memberCount: c.member_count_override || 0,
                image_url: c.image_url || 'https://lh3.googleusercontent.com/aida-public/AB6AXuBTP1VwRhiXz7IslKk8lyrl_NZjrM0MYtWMLyaBrXhEX2DRZ9wIHjlle-92NsUhnYmQwD4yTguPqimc2ewjOD30dygdkHwHt7s9NXsMPSnzWvTyHO_1lM5j2kM_9BcFoN9m67VEakH0ReGkHCz2mX7R0kfbHFSyqSNrqYFcUsBMK0sm4skbO_7LO2Qs237Mbc_zUrwOxQ0lEHdDE-3w74hK182bzXXoJ9Nz4No0EMfJPJZ14JUTiBDxNw-onJOCwry6C0bNPzf9aJY',
                slogan: c.slogan,
                description: c.description
              };
            });
            setChapterList(formattedChapters);
          }
        } catch (e) {}
      }

      // 3. Fetch members list
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
                join_date: d.join_date ? d.join_date.split('T')[0] : d.created_at.split('T')[0],
                logo_url: d.logo_url || d.license_file_url,
                representative_avatar_url: d.representative_avatar_url || ''
              };
            });
            setMemberList(mappedList);
          }
        } catch (e) {}
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
                join_date: d.join_date ? d.join_date.split('T')[0] : (d.created_at ? d.created_at.split('T')[0] : new Date().toISOString().split('T')[0]),
                logo_url: d.logo_url || d.license_file_url || undefined,
                representative_avatar_url: d.representative_avatar_url || ''
              };
            });
            setMemberList(mappedList);
          } catch (e) {}
        } else {
          // Initialize localStorage if empty
          const dbFormat = MOCK_MEMBERS.map(m => ({
            id: m.id,
            company_name: m.company_name,
            tax_code: m.tax_code,
            address: m.address,
            phone: m.phone,
            email: m.email,
            business_type: m.business_type,
            representative_name: m.representative_name,
            representative_role: m.representative_role,
            representative_email: m.representative_email,
            representative_phone: m.representative_phone,
            status: m.status,
            created_at: m.created_at || new Date().toISOString(),
            chapter_id: m.chapter_id || null,
            association_role: m.association_role,
            chapter_role: m.chapter_role || null,
            join_date: m.join_date,
            logo_url: m.logo_url || null,
            representative_avatar_url: m.representative_avatar_url || null
          }));
          localStorage.setItem('hoba_website_members', JSON.stringify(dbFormat));
          setMemberList(MOCK_MEMBERS);
        }
      }
    }
    loadMembersData();
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      if (tabParam === 'chapters' || tabParam === 'chi-hoi') {
        setActiveTab('chapters');
      } else {
        setActiveTab('members');
      }
      
      if (memberList.length > 0) {
        const id = params.get('id');
        if (id) {
          const found = memberList.find(m => m.id === id);
          if (found) {
            setSelectedMember(found);
          }
        }
      }
    }
  }, [memberList, typeof window !== 'undefined' ? window.location.search : '']);

  // Sync member count for chapters locally if not overriden
  const finalChapters = useMemo(() => {
    return chapterList.map(ch => {
      const actualCount = memberList.filter(m => m.chapter_id === ch.id).length;
      return {
        ...ch,
        memberCount: ch.memberCount || actualCount || Math.floor(Math.random() * 20) + 10
      };
    });
  }, [chapterList, memberList]);

  // Filtered & Sorted Members
  const filteredMembers = useMemo(() => {
    const getRolePriority = (roleName: string): number => {
      const normalized = (roleName || '').trim().toLowerCase();
      if (normalized.includes('chủ tịch') && !normalized.includes('phó')) return 1;
      if (normalized.includes('phó chủ tịch')) return 2;
      if (normalized.includes('thường vụ')) return 3;
      if (normalized.includes('chấp hành') || normalized.includes('bch')) return 4;
      if (normalized.includes('kiểm tra')) return 5;
      if (normalized.includes('chính thức')) return 6;
      if (normalized.includes('liên kết')) return 7;
      return 99;
    };

    const filtered = memberList.filter((m) => {
      const nameMatch = m.company_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         m.representative_name.toLowerCase().includes(searchQuery.toLowerCase());
      const roleMatch = selectedRole === 'all' || m.association_role === selectedRole;
      
      let regionMatch = true;
      if (selectedRegion !== 'all') {
        regionMatch = false;
        if (selectedRegion === 'Miền Bắc' && (m.address.includes('Hà Nội') || m.address.includes('Bắc Ninh') || m.address.includes('Hải Phòng') || m.chapter_name?.includes('Hà Nội') || m.chapter_name?.includes('Hải Phòng') || m.chapter_name?.includes('Tây Bắc'))) {
          regionMatch = true;
        } else if (selectedRegion === 'Miền Nam' && (m.address.includes('Hồ Chí Minh') || m.address.includes('Bình Dương') || m.address.includes('Đồng Nai') || m.chapter_name?.includes('TP. HCM') || m.chapter_name?.includes('Tây Nam Bộ'))) {
          regionMatch = true;
        } else if (selectedRegion === 'Miền Trung' && (m.address.includes('Đà Nẵng') || m.address.includes('Huế') || m.address.includes('Khánh Hòa'))) {
          regionMatch = true;
        }
      }
      
      return nameMatch && roleMatch && regionMatch;
    });

    // Sort by role priority first, then alphabetically by company name
    return [...filtered].sort((a, b) => {
      const pA = getRolePriority(a.association_role);
      const pB = getRolePriority(b.association_role);
      if (pA !== pB) {
        return pA - pB;
      }
      return a.company_name.localeCompare(b.company_name, 'vi');
    });
  }, [searchQuery, selectedRole, selectedRegion, memberList]);

  // Filtered Chapters
  const filteredChapters = useMemo(() => {
    return finalChapters.filter(c => {
      return c.name.toLowerCase().includes(chapterSearch.toLowerCase()) || 
             c.locations.toLowerCase().includes(chapterSearch.toLowerCase());
    });
  }, [chapterSearch, finalChapters]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedRole('all');
    setSelectedRegion('all');
  };

  return (
    <div className="flex flex-col w-full overflow-x-hidden bg-[#fcf9f5] text-[#1c1c1a]">
      <title>Danh sách Hội viên | HOBA LPG</title>
      <meta name="description" content="Danh sách hội viên chính thức của Hiệp hội Gas và Kinh doanh Khí hóa lỏng (HOBA)." />
      {/* Sections rendering loop */}
      {sections.map((section) => {
        if (!section.visible) return null;

        switch (section.id) {
          case 'hero':
            return (
              <section key="hero" className="relative h-[400px] flex items-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                  <img
                    alt="LPG Industry Background"
                    className="w-full h-full object-cover brightness-50"
                    src={heroImage}
                  />
                </div>
                <div className="relative z-10 w-full max-w-container-max mx-auto px-margin-mobile md:px-gutter text-white">
                  <div className="max-w-3xl">
                    <h1 className="text-3xl md:text-5xl font-black mb-4 leading-tight">{headline}</h1>
                    <p className="text-sm md:text-base mb-8 text-slate-200/90 leading-relaxed max-w-2xl">{subtext}</p>
                    <div className="flex gap-4">
                      <button
                        onClick={() => {
                          const el = document.getElementById('main-content');
                          el?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="bg-[#004a99] text-white px-8 py-3 rounded-lg font-bold flex items-center gap-2 hover:bg-[#00346f] transition-all"
                      >
                        Khám phá ngay <span className="material-symbols-outlined">arrow_downward</span>
                      </button>
                      <Link
                        href="/dang-ky"
                        className="border-2 border-white text-white px-8 py-3 rounded-lg font-bold hover:bg-white/10 transition-colors"
                      >
                        Gia nhập Hiệp hội
                      </Link>
                    </div>
                  </div>
                </div>
              </section>
            );

          case 'tabs':
            return (
              <div key="tabs" id="main-content" className="max-w-container-max mx-auto px-margin-mobile md:px-gutter w-full mt-12">

                {/* Tab 1: All Members Table List */}
                {activeTab === 'members' && (
                  <div className="space-y-6">
                    {/* Search & Filter Controls */}
                    <div className="bg-white border border-outline-variant/40 rounded-xl p-6 shadow-sm">
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                        <div className="md:col-span-5 flex flex-col gap-2">
                          <label className="text-xs font-bold text-on-surface-variant">Tìm kiếm doanh nghiệp</label>
                          <div className="relative">
                            <span className="material-symbols-outlined absolute left-3 top-2.5 text-outline text-lg">search</span>
                            <input
                              className="w-full h-10 pl-10 pr-4 rounded-lg border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary bg-white outline-none transition-all text-xs"
                              placeholder="Nhập tên doanh nghiệp hoặc đại diện..."
                              type="text"
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="md:col-span-3 flex flex-col gap-2">
                          <label className="text-xs font-bold text-on-surface-variant">Chức vụ Hiệp hội</label>
                          <select
                            className="w-full h-10 px-3 rounded-lg border border-outline-variant bg-white outline-none text-xs"
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value)}
                          >
                            <option value="all">Tất cả chức vụ</option>
                            {(() => {
                              const roleNames = associationRoles.map(r => typeof r === 'object' && r !== null ? r.name : r);
                              const options = Array.from(new Set(roleNames));
                              memberList.forEach(m => {
                                if (m.association_role && !options.includes(m.association_role)) {
                                  options.push(m.association_role);
                                }
                              });
                              return options.map((roleName) => (
                                <option key={roleName} value={roleName}>{roleName}</option>
                              ));
                            })()}
                          </select>
                        </div>
                        <div className="md:col-span-3 flex flex-col gap-2">
                          <label className="text-xs font-bold text-on-surface-variant">Khu vực</label>
                          <select
                            className="w-full h-10 px-3 rounded-lg border border-outline-variant bg-white outline-none text-xs"
                            value={selectedRegion}
                            onChange={(e) => setSelectedRegion(e.target.value)}
                          >
                            <option value="all">Tất cả khu vực</option>
                            <option value="Miền Bắc">Miền Bắc</option>
                            <option value="Miền Trung">Miền Trung</option>
                            <option value="Miền Nam">Miền Nam</option>
                          </select>
                        </div>
                        <div className="md:col-span-1">
                          <button
                            onClick={resetFilters}
                            className="w-full h-10 bg-surface-container border border-outline-variant rounded-lg flex items-center justify-center hover:bg-surface-variant transition-colors"
                            title="Xóa bộ lọc"
                          >
                            <span className="material-symbols-outlined text-lg">filter_list_off</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Member Table */}
                    <div className="bg-white border border-outline-variant/30 rounded-xl overflow-hidden shadow-sm">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="bg-surface-container-high border-b border-outline-variant/40 text-on-surface-variant font-bold">
                              <th className="px-6 py-4 w-16">STT</th>
                              <th className="px-6 py-4">Người đại diện</th>
                              <th className="px-6 py-4">Chức danh tại Công ty</th>
                              <th className="px-6 py-4">Tên doanh nghiệp</th>
                              <th className="px-6 py-4">Chức vụ Hiệp hội</th>
                              <th className="px-6 py-4">Chi hội</th>
                              <th className="px-6 py-4 text-right">Thao tác</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-outline-variant/20">
                            {filteredMembers.length > 0 ? (
                              filteredMembers.map((m, idx) => (
                                <tr key={m.id} className="hover:bg-surface-container/30 transition-colors group">
                                  <td className="px-6 py-4 text-on-surface-variant font-medium">{idx + 1}</td>
                                  <td className="px-6 py-4 font-bold">{m.representative_name}</td>
                                  <td className="px-6 py-4 text-on-surface-variant">{m.representative_role}</td>
                                  <td className="px-6 py-4">
                                    <div className="font-bold text-[#00346f] group-hover:underline cursor-pointer" onClick={() => setSelectedMember(m)}>
                                      {m.company_name}
                                    </div>
                                    <div className="text-[10px] text-on-surface-variant/80 mt-0.5">Trụ sở: {m.address}</div>
                                  </td>
                                  <td className="px-6 py-4">
                                    {(() => {
                                      const roleColor = getRoleColor(m.association_role, associationRoles);
                                      return (
                                        <span 
                                          className="inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase"
                                          style={{ backgroundColor: roleColor.bg, color: roleColor.text }}
                                        >
                                          {m.association_role}
                                        </span>
                                      );
                                    })()}
                                  </td>
                                  <td className="px-6 py-4 text-on-surface-variant font-medium">{m.chapter_name || '-'}</td>
                                  <td className="px-6 py-4 text-right">
                                    <button
                                      onClick={() => setSelectedMember(m)}
                                      className="text-[#00346f] hover:text-[#bb0013] transition-colors font-bold"
                                    >
                                      Chi tiết
                                    </button>
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={8} className="px-6 py-12 text-center text-on-surface-variant text-sm font-medium">
                                  Không tìm thấy hội viên nào khớp với bộ lọc.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 2: Local Chapters List */}
                {activeTab === 'chapters' && (
                  <div className="space-y-16">
                    {/* Search chapter */}
                    <div className="flex justify-end">
                      <div className="relative w-full md:w-80">
                        <span className="material-symbols-outlined absolute left-3 top-2 text-outline text-lg">search</span>
                        <input
                          className="w-full pl-9 pr-4 py-2 border border-outline-variant bg-white rounded-lg focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all text-xs"
                          placeholder="Tìm kiếm chi hội..."
                          type="text"
                          value={chapterSearch}
                          onChange={(e) => setChapterSearch(e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Chapters Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredChapters.length > 0 ? (
                        filteredChapters.map((c) => (
                          <div key={c.id} className="bg-white border border-outline-variant rounded-xl overflow-hidden group shadow-sm hover:shadow-md transition-all flex flex-col">
                            <div className="h-48 overflow-hidden relative">
                              <img
                                alt={c.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                src={c.image_url}
                              />
                              <div className="absolute top-4 left-4 bg-[#bb0013] text-white px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider">
                                {c.region}
                              </div>
                            </div>
                            <div className="p-6 flex flex-col flex-grow">
                              <h3 className="text-base font-black text-[#00346f] mb-2 group-hover:text-[#bb0013] transition-colors">{c.name}</h3>
                              <p className="text-xs text-on-surface-variant/80 line-clamp-2 leading-relaxed mb-4">{c.description || 'Chi hội trực thuộc Hiệp hội Gas Việt Nam.'}</p>
                              
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
                                className="flex items-center justify-center gap-2 w-full py-2.5 border border-[#00346f] text-[#00346f] font-bold rounded-lg hover:bg-[#00346f] hover:text-white transition-all text-xs"
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




                  </div>
                )}
              </div>
            );

          case 'stats':
            return (
              <section key="stats" className="py-12 bg-[#00346f] text-white rounded-xl shadow-md overflow-hidden relative max-w-container-max mx-auto px-margin-mobile md:px-gutter w-full my-8">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none"></div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center relative z-10">
                  {stats.map((stat, idx) => (
                    <div key={idx} className="space-y-2">
                      <span className="material-symbols-outlined text-3xl text-amber-400">{stat.icon}</span>
                      <div className="text-2xl md:text-3xl font-black">{stat.value}</div>
                      <div className="text-[10px] font-bold opacity-80 uppercase tracking-wider">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </section>
            );

          case 'benefits':
            return (
              <section key="benefits" className="py-16 bg-white border-t border-outline-variant/30 mt-16 w-full">
                <div className="max-w-container-max mx-auto px-margin-mobile md:px-gutter">
                  <div className="text-center mb-12">
                    <h2 className="text-xl md:text-2xl font-black text-[#00346f] mb-2">Quyền lợi hội viên</h2>
                    <div className="w-16 h-0.5 bg-[#bb0013] mx-auto"></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {benefits.map((benefit, idx) => (
                      <div key={idx} className="p-6 border border-outline-variant/40 rounded-xl hover:shadow-md transition-shadow bg-[#fcf9f5] text-center">
                        <div className="w-12 h-12 bg-white border border-outline-variant rounded-full flex items-center justify-center mx-auto mb-4 text-[#00346f]">
                          <span className="material-symbols-outlined text-2xl">{benefit.icon}</span>
                        </div>
                        <h3 className="text-xs font-bold mb-2 text-[#00346f]">{benefit.title}</h3>
                        <p className="text-on-surface-variant text-[11px] leading-relaxed">{benefit.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            );

          case 'steps':
            return (
              <section key="steps" className="py-16 max-w-container-max mx-auto px-margin-mobile md:px-gutter w-full">
                <div className="text-center mb-12">
                  <h2 className="text-xl md:text-2xl font-black text-[#00346f] mb-2">Quy trình gia nhập hội viên</h2>
                  <div className="w-16 h-0.5 bg-[#bb0013] mx-auto"></div>
                </div>
                <div className="relative flex flex-col md:flex-row justify-between items-start gap-8">
                  <div className="hidden md:block absolute top-8 left-0 w-full h-0.5 border-t border-dashed border-outline-variant/80 z-0"></div>
                  {steps.map((step, idx) => (
                    <div key={idx} className="relative z-10 flex flex-col items-center text-center flex-1">
                      <div className="w-16 h-16 bg-[#00346f] text-white rounded-full flex items-center justify-center mb-4 shadow-sm border-2 border-white">
                        <span className="material-symbols-outlined text-2xl">{step.icon}</span>
                      </div>
                      <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 bg-[#bb0013] text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                        {step.step}
                      </div>
                      <h4 className="text-xs font-bold mb-1">{step.title}</h4>
                      <p className="text-on-surface-variant text-[11px] leading-relaxed px-2">{step.desc}</p>
                    </div>
                  ))}
                </div>
              </section>
            );

          default:
            return null;
        }
      })}

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
                    {(() => {
                      const roleColor = getRoleColor(selectedMember.association_role, associationRoles);
                      return (
                        <span 
                          className="px-2 py-0.5 rounded text-[10px] font-bold uppercase"
                          style={{ backgroundColor: roleColor.bg, color: roleColor.text }}
                        >
                          {selectedMember.association_role}
                        </span>
                      );
                    })()}
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
