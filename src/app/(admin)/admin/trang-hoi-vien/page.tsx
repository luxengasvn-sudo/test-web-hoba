'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase, deleteFileFromStorage } from '@/lib/supabase';

interface ChapterAdmin {
  id: string;
  name: string;
  region: string; // 'Miền Bắc' | 'Miền Trung' | 'Miền Nam' | 'Chuyên môn'
  locations: string;
  slogan: string;
  description: string;
  mission_text: string;
  mission_icon: string;
  vision_text: string;
  vision_icon: string;
  image_url: string;
}

interface LeaderAdmin {
  id: string;
  chapter_id: string;
  name: string;
  position: string;
  avatar_url: string;
  order_index: number;
}

interface RoleConfig {
  name: string;
  color: string;
  textColor: string;
}

const MOCK_CHAPTERS: ChapterAdmin[] = [
  {
    id: 'hn-north',
    name: 'Chi hội LPG Hà Nội',
    region: 'Miền Bắc',
    locations: 'Hà Nội, Vĩnh Phúc, Bắc Ninh',
    slogan: 'Nâng cao chất lượng - Hướng tới tương lai',
    description: 'Quy tụ các doanh nghiệp gas lớn nhất tại địa bàn Hà Nội và phụ cận để xây dựng chuỗi cung ứng LPG bền vững.',
    mission_text: 'Thúc đẩy chuẩn hóa kỹ thuật và hỗ trợ trao đổi giải pháp thiết bị an toàn phòng cháy chữa cháy.',
    mission_icon: 'security',
    vision_text: 'Xây dựng mạng lưới an toàn và số hóa toàn bộ hệ thống quản lý chiết nạp khu vực Hà Nội.',
    vision_icon: 'rocket_launch',
    image_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBTP1VwRhiXz7IslKk8lyrl_NZjrM0MYtWMLyaBrXhEX2DRZ9wIHjlle-92NsUhnYmQwD4yTguPqimc2ewjOD30dygdkHwHt7s9NXsMPSnzWvTyHO_1lM5j2kM_9BcFoN9m67VEakH0ReGkHCz2mX7R0kfbHFSyqSNrqYFcUsBMK0sm4skbO_7LO2Qs237Mbc_zUrwOxQ0lEHdDE-3w74hK182bzXXoJ9Nz4No0EMfJPJZ14JUTiBDxNw-onJOCwry6C0bNPzf9aJY'
  },
  {
    id: 'hcm-south',
    name: 'Chi hội LPG TP. Hồ Chí Minh',
    region: 'Miền Nam',
    locations: 'TP.HCM, Bình Dương, Long An',
    slogan: 'Gắn kết sức mạnh - Ngành Gas Phương Nam',
    description: 'Đại diện cho cộng đồng doanh nghiệp LPG tại khu vực kinh tế trọng điểm phía Nam, hướng tới tiêu chuẩn an toàn quốc tế và sự phát triển bền vững.',
    mission_text: 'Thúc đẩy an toàn trong vận hành và sử dụng LPG thông qua các chương trình đào tạo và phổ biến quy chuẩn kỹ thuật.',
    mission_icon: 'rocket_launch',
    vision_text: 'Trở thành chi hội kiểu mẫu về sự gắn kết, đổi mới sáng tạo và chuyển đổi số trong ngành năng lượng tại Việt Nam.',
    vision_icon: 'visibility',
    image_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBTP1VwRhiXz7IslKk8lyrl_NZjrM0MYtWMLyaBrXhEX2DRZ9wIHjlle-92NsUhnYmQwD4yTguPqimc2ewjOD30dygdkHwHt7s9NXsMPSnzWvTyHO_1lM5j2kM_9BcFoN9m67VEakH0ReGkHCz2mX7R0kfbHFSyqSNrqYFcUsBMK0sm4skbO_7LO2Qs237Mbc_zUrwOxQ0lEHdDE-3w74hK182bzXXoJ9Nz4No0EMfJPJZ14JUTiBDxNw-onJOCwry6C0bNPzf9aJY'
  }
];

const MOCK_LEADERS: LeaderAdmin[] = [
  { id: '1', chapter_id: 'hcm-south', name: 'Nguyễn Văn An', position: 'Chủ tịch Chi hội', avatar_url: 'https://lh3.googleusercontent.com/aida/AP1WRLtHP72y8fqlWgt_3QxyeDd8DqGtlLdTmLWuhdR4FzO9I4U_5T-9P_uyJwSR-kbz8N5pRSpjeORcJRDjuWWh5XkEuC8bJBM5QqK9KrnZjPQiuaGY8vA-fYpbYk__QXh78ARMgOJ77J73aoGD4w82Q2SHJqN6L9WbBVL5uRzxYQucApY2EIjpOpd7-eyBC-OGn_QwPKdLBeuhpZCp8enAccK5RYB4XBKB-C6q90BrZFCRBjn84Nb9MKWtKyE', order_index: 1 },
  { id: '2', chapter_id: 'hcm-south', name: 'Trần Thị Bích', position: 'Phó Chủ tịch Thường trực', avatar_url: 'https://lh3.googleusercontent.com/aida/AP1WRLuV35_gpdDpjPo2KcT2Pri512nhhn2M178haJdKAO0DRID-3ZJPOsSHthfboUcJ2ZKZOFFRgjoGY9jBoY8DFW9kWVY3hS4THAENs0Vpwy_twwzNfL2xpOQHn5JkMUzEExJMKBGDQkh8f10azN-VFEk4JTXrC6gZW3wJ6XbSPzLiYohxSeE65Lr_lOrc0iWkDAaFJpxQRvhoR60kg6sQ2rr3_vp1auAn4Zsv3Nb7XnrMOFMiCJ56D6Mj-w', order_index: 2 },
  { id: '3', chapter_id: 'hn-north', name: 'Ông Hoàng Quốc Việt', position: 'Chủ tịch Chi hội', avatar_url: 'https://lh3.googleusercontent.com/aida/AP1WRLtHP72y8fqlWgt_3QxyeDd8DqGtlLdTmLWuhdR4FzO9I4U_5T-9P_uyJwSR-kbz8N5pRSpjeORcJRDjuWWh5XkEuC8bJBM5QqK9KrnZjPQiuaGY8vA-fYpbYk__QXh78ARMgOJ77J73aoGD4w82Q2SHJqN6L9WbBVL5uRzxYQucApY2EIjpOpd7-eyBC-OGn_QwPKdLBeuhpZCp8enAccK5RYB4XBKB-C6q90BrZFCRBjn84Nb9MKWtKyE', order_index: 1 }
];

export default function AdminTrangHoiVien() {
  const [activeTab, setActiveTab] = useState<'general' | 'chapters'>('general');
  const [userRole, setUserRole] = useState<'super_admin' | 'editor'>('super_admin');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('Cập nhật cấu hình thành công!');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Collapsible sections
  const [expandedSections, setExpandedSections] = useState({
    banner: true,
    ordering: false,
    stats: false,
    benefits: false,
    steps: false,
    roles: false
  });

  const toggleSectionExpand = (sectionKey: 'banner' | 'ordering' | 'stats' | 'benefits' | 'steps' | 'roles') => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  // General configuration states
  const [headline, setHeadline] = useState('Danh sách Hội viên Hiệp hội');
  const [subtext, setSubtext] = useState('Nơi quy tụ các doanh nghiệp hàng đầu trong lĩnh vực Khí dầu mỏ hóa lỏng (LPG) tại Việt Nam, cam kết vì sự phát triển bền vững và an toàn năng lượng.');
  const [heroImage, setHeroImage] = useState('https://lh3.googleusercontent.com/aida-public/AB6AXuBTP1VwRhiXz7IslKk8lyrl_NZjrM0MYtWMLyaBrXhEX2DRZ9wIHjlle-92NsUhnYmQwD4yTguPqimc2ewjOD30dygdkHwHt7s9NXsMPSnzWvTyHO_1lM5j2kM_9BcFoN9m67VEakH0ReGkHCz2mX7R0kfbHFSyqSNrqYFcUsBMK0sm4skbO_7LO2Qs237Mbc_zUrwOxQ0lEHdDE-3w74hK182bzXXoJ9Nz4No0EMfJPJZ14JUTiBDxNw-onJOCwry6C0bNPzf9aJY');

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
    { value: '2025', label: 'Năm thành lập', icon: 'calendar_today' }
  ]);

  const [benefits, setBenefits] = useState([
    { title: 'Kết nối doanh nghiệp', desc: 'Kết nối với cộng đồng hội viên và đối tác chiến lược trong ngành LPG toàn quốc.', icon: 'hub' },
    { title: 'Cập nhật chính sách', desc: 'Cập nhật nhanh chóng chính sách, quy định pháp luật mới nhất liên quan đến khí hóa lỏng.', icon: 'update' },
    { title: 'Đào tạo chuyên môn', desc: 'Tham gia các khóa đào tạo, hội thảo chuyên đề kỹ thuật và quản lý chất lượng cao.', icon: 'school' },
    { title: 'Xúc tiến hợp tác', desc: 'Cơ hội hợp tác, mở rộng thị trường và phát triển các liên kết kinh doanh bền vững.', icon: 'rocket_launch' }
  ]);

  const [steps, setSteps] = useState([
    { title: 'Đăng ký hồ sơ', desc: 'Doanh nghiệp điền thông tin và nộp hồ sơ đăng ký online.', icon: 'description', step: '01' },
    { title: 'Xét duyệt', desc: 'Ban chấp hành xem xét, thẩm định và phê duyệt hồ sơ.', icon: 'fact_check', step: '02' },
    { title: 'Kết nối - Kích hoạt', desc: 'Kích hoạt quyền hội viên và bắt đầu các hoạt động kết nối.', icon: 'handshake', step: '03' },
    { title: 'Tham gia cộng đồng', desc: 'Hưởng đầy đủ quyền lợi và tham gia các sự kiện của Hiệp hội.', icon: 'celebration', step: '04' }
  ]);

  const [associationRoles, setAssociationRoles] = useState<RoleConfig[]>([
    { name: 'Chủ tịch', color: '#bb0013', textColor: '#ffffff' },
    { name: 'Phó Chủ tịch', color: '#00346f', textColor: '#ffffff' },
    { name: 'Ban kiểm tra', color: '#d97706', textColor: '#ffffff' },
    { name: 'Ủy viên Ban Thường vụ', color: '#0284c7', textColor: '#ffffff' },
    { name: 'Ủy viên Ban Chấp hành', color: '#d7e2ff', textColor: '#001b3f' },
    { name: 'Hội viên chính thức', color: '#e7e5e4', textColor: '#1c1c1a' },
    { name: 'Hội viên liên kết', color: '#f5f5f4', textColor: '#444443' }
  ]);

  // Chapters & Leaders states
  const [chapters, setChapters] = useState<ChapterAdmin[]>(MOCK_CHAPTERS);
  const [leaders, setLeaders] = useState<LeaderAdmin[]>(MOCK_LEADERS);

  // Modals state
  const [editingChapter, setEditingChapter] = useState<ChapterAdmin | null>(null);
  const [isChapterModalOpen, setIsChapterModalOpen] = useState(false);
  const [isNewChapter, setIsNewChapter] = useState(false);

  // Chapter Form fields
  const [chName, setChName] = useState('');
  const [chRegion, setChRegion] = useState('Miền Bắc');
  const [chLocations, setChLocations] = useState('');
  const [chSlogan, setChSlogan] = useState('');
  const [chDesc, setChDesc] = useState('');
  const [chImage, setChImage] = useState('');
  const [chMission, setChMission] = useState('');
  const [chMissionIcon, setChMissionIcon] = useState('rocket_launch');
  const [chVision, setChVision] = useState('');
  const [chVisionIcon, setChVisionIcon] = useState('visibility');

  // Chapter leadership lists
  const [chapterLeaders, setChapterLeaders] = useState<LeaderAdmin[]>([]);
  const [isLeaderModalOpen, setIsLeaderModalOpen] = useState(false);
  const [isNewLeader, setIsNewLeader] = useState(false);
  const [editingLeaderId, setEditingLeaderId] = useState<string | null>(null);

  // Leader Form states
  const [lName, setLName] = useState('');
  const [lPos, setLPos] = useState('');
  const [lAvatar, setLAvatar] = useState('');
  const [lOrder, setLOrder] = useState<number>(1);

  // Image Upload helper
  const uploadImage = async (file: File): Promise<string> => {
    if (!supabase) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(URL.createObjectURL(file));
        }, 800);
      });
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `memberspage/${fileName}`;

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

  const handleHeroImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploading(true);
      try {
        const url = await uploadImage(e.target.files[0]);
        setHeroImage(url);
      } catch (err) {
        alert('Tải ảnh thất bại: ' + (err as Error).message);
      } finally {
        setUploading(false);
      }
    }
  };

  const handleChapterImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploading(true);
      try {
        const url = await uploadImage(e.target.files[0]);
        setChImage(url);
      } catch (err) {
        alert('Tải ảnh thất bại: ' + (err as Error).message);
      } finally {
        setUploading(false);
      }
    }
  };

  const handleLeaderAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploading(true);
      try {
        const url = await uploadImage(e.target.files[0]);
        setLAvatar(url);
      } catch (err) {
        alert('Tải ảnh thất bại: ' + (err as Error).message);
      } finally {
        setUploading(false);
      }
    }
  };

  // Load configuration and databases on mount
  const loadData = async () => {
    // 1. General customizer config
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('website_config')
          .select('value')
          .eq('key', 'memberspage')
          .single();

        if (!error && data?.value) {
          const val = data.value;
          if (val.headline) setHeadline(val.headline);
          if (val.subtext) setSubtext(val.subtext);
          if (val.heroImage) setHeroImage(val.heroImage);
          if (val.stats) setStats(val.stats);
          if (val.benefits) setBenefits(val.benefits);
          if (val.steps) setSteps(val.steps);
          if (val.sections) setSections(val.sections);
          if (val.associationRoles) {
            // Map legacy string array of roles to objects if necessary
            const formattedRoles = val.associationRoles.map((r: any) => {
              if (typeof r === 'object' && r !== null) return r;
              return { name: r, color: '#00346f', textColor: '#ffffff' };
            });
            setAssociationRoles(formattedRoles);
          }
        }
      } catch (e) {
        console.error('Lỗi load config memberspage:', e);
      }
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
          if (val.sections) setSections(val.sections);
          if (val.associationRoles) {
            const formattedRoles = val.associationRoles.map((r: any) => {
              if (typeof r === 'object' && r !== null) return r;
              return { name: r, color: '#00346f', textColor: '#ffffff' };
            });
            setAssociationRoles(formattedRoles);
          }
        } catch (err) {}
      }
    }

    // 2. Chapters and Chapter Leadership
    if (supabase) {
      try {
        const { data: chapData, error: chapErr } = await supabase.from('chapters').select('*');
        if (!chapErr && Array.isArray(chapData)) {
          setChapters(chapData.filter(Boolean));
        }
        const { data: leadData, error: leadErr } = await supabase
          .from('chapter_leadership')
          .select('*')
          .order('order_index', { ascending: true });
        if (!leadErr && Array.isArray(leadData)) {
          setLeaders(leadData.filter(Boolean));
        }
      } catch (e) {
        console.error('Lỗi load chapters:', e);
      }
    } else {
      const savedChaps = localStorage.getItem('hoba_chapters_list');
      if (savedChaps) {
        try {
          const parsed = JSON.parse(savedChaps);
          if (Array.isArray(parsed)) {
            setChapters(parsed.filter(Boolean));
          }
        } catch (e) {}
      }
      const savedLeads = localStorage.getItem('hoba_chapter_leaders_list');
      if (savedLeads) {
        try {
          const parsed = JSON.parse(savedLeads);
          if (Array.isArray(parsed)) {
            setLeaders(parsed.filter(Boolean));
          }
        } catch (e) {}
      }
    }
  };

  useEffect(() => {
    // Read session to set user role
    const sessionStr = localStorage.getItem('hoba_admin_session');
    if (sessionStr) {
      try {
        const session = JSON.parse(sessionStr);
        if (session && typeof session === 'object' && session.role) {
          setUserRole(session.role);
          if (session.role === 'editor') {
            setActiveTab('chapters');
          }
        }
      } catch (e) {}
    }
    loadData();
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 4000);
  };

  // Save General layout configs
  const handleSaveGeneral = async () => {
    setLoading(true);
    const configVal = {
      headline,
      subtext,
      heroImage,
      stats,
      benefits,
      steps,
      sections,
      associationRoles
    };

    if (supabase) {
      try {
        const { error } = await supabase.from('website_config').upsert({
          key: 'memberspage',
          value: configVal
        });
        if (error) throw error;
      } catch (err) {
        alert('Lỗi lưu cấu hình: ' + (err as Error).message);
        setLoading(false);
        return;
      }
    } else {
      localStorage.setItem('hoba_website_config_memberspage', JSON.stringify(configVal));
    }
    setLoading(false);
    triggerToast('Cập nhật cấu hình chung thành công!');
  };

  // Sections sorting and toggle
  const normalizeSections = (rawSections: any[]) => {
    const temp = [...rawSections];
    return temp.map((s, idx) => {
      const cleanName = s.name.replace(/^\d+\.\s*/, '');
      return {
        ...s,
        name: `${idx + 1}. ${cleanName}`
      };
    });
  };

  const toggleSection = (id: string) => {
    setSections(prev => {
      const next = prev.map(sec => sec.id === id ? { ...sec, visible: !sec.visible } : sec);
      return normalizeSections(next);
    });
  };

  const moveSectionUp = (index: number) => {
    if (index === 0) return;
    setSections(prev => {
      const next = [...prev];
      const temp = next[index];
      next[index] = next[index - 1];
      next[index - 1] = temp;
      return normalizeSections(next);
    });
  };

  const moveSectionDown = (index: number) => {
    if (index === sections.length - 1) return;
    setSections(prev => {
      const next = [...prev];
      const temp = next[index];
      next[index] = next[index + 1];
      next[index + 1] = temp;
      return normalizeSections(next);
    });
  };

  // Stats updates
  const handleStatChange = (index: number, key: string, value: string) => {
    setStats(prev => prev.map((item, i) => i === index ? { ...item, [key]: value } : item));
  };

  // Benefits handlers
  const handleBenefitChange = (index: number, key: string, value: string) => {
    setBenefits(prev => prev.map((item, i) => i === index ? { ...item, [key]: value } : item));
  };

  const addBenefit = () => {
    setBenefits(prev => [...prev, { title: 'Quyền lợi mới', desc: 'Mô tả quyền lợi...', icon: 'verified' }]);
  };

  const deleteBenefit = (index: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa quyền lợi này?')) return;
    setBenefits(prev => prev.filter((_, i) => i !== index));
  };

  const moveBenefitUp = (index: number) => {
    if (index === 0) return;
    setBenefits(prev => {
      const next = [...prev];
      const temp = next[index];
      next[index] = next[index - 1];
      next[index - 1] = temp;
      return next;
    });
  };

  const moveBenefitDown = (index: number) => {
    if (index === benefits.length - 1) return;
    setBenefits(prev => {
      const next = [...prev];
      const temp = next[index];
      next[index] = next[index + 1];
      next[index + 1] = temp;
      return next;
    });
  };

  // Joining Steps handlers
  const handleStepChange = (index: number, key: string, value: string) => {
    setSteps(prev => prev.map((item, i) => i === index ? { ...item, [key]: value } : item));
  };

  const addStep = () => {
    setSteps(prev => {
      const nextStepNum = String(prev.length + 1).padStart(2, '0');
      return [...prev, { title: 'Bước mới', desc: 'Mô tả bước...', icon: 'description', step: nextStepNum }];
    });
  };

  const deleteStep = (index: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa bước này?')) return;
    setSteps(prev => {
      const filtered = prev.filter((_, i) => i !== index);
      return filtered.map((item, i) => ({ ...item, step: String(i + 1).padStart(2, '0') }));
    });
  };

  const moveStepUp = (index: number) => {
    if (index === 0) return;
    setSteps(prev => {
      const next = [...prev];
      const temp = next[index];
      next[index] = next[index - 1];
      next[index - 1] = temp;
      return next.map((item, i) => ({ ...item, step: String(i + 1).padStart(2, '0') }));
    });
  };

  const moveStepDown = (index: number) => {
    if (index === steps.length - 1) return;
    setSteps(prev => {
      const next = [...prev];
      const temp = next[index];
      next[index] = next[index + 1];
      next[index + 1] = temp;
      return next.map((item, i) => ({ ...item, step: String(i + 1).padStart(2, '0') }));
    });
  };

  // Roles Config Handlers
  const handleRoleNameChange = (index: number, val: string) => {
    setAssociationRoles(prev => prev.map((item, i) => i === index ? { ...item, name: val } : item));
  };

  const handleRoleColorChange = (index: number, val: string) => {
    setAssociationRoles(prev => prev.map((item, i) => i === index ? { ...item, color: val } : item));
  };

  const handleRoleTextColorChange = (index: number, val: string) => {
    setAssociationRoles(prev => prev.map((item, i) => i === index ? { ...item, textColor: val } : item));
  };

  const addRole = () => {
    setAssociationRoles(prev => [...prev, { name: 'Chức danh mới', color: '#00346f', textColor: '#ffffff' }]);
  };

  const deleteRole = (index: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa chức vụ này?')) return;
    setAssociationRoles(prev => prev.filter((_, i) => i !== index));
  };

  // Chapter Actions
  const handleOpenAddChapter = () => {
    setIsNewChapter(true);
    setEditingChapter(null);
    setChName('');
    setChRegion('Miền Bắc');
    setChLocations('');
    setChSlogan('');
    setChDesc('');
    setChImage('https://lh3.googleusercontent.com/aida-public/AB6AXuBTP1VwRhiXz7IslKk8lyrl_NZjrM0MYtWMLyaBrXhEX2DRZ9wIHjlle-92NsUhnYmQwD4yTguPqimc2ewjOD30dygdkHwHt7s9NXsMPSnzWvTyHO_1lM5j2kM_9BcFoN9m67VEakH0ReGkHCz2mX7R0kfbHFSyqSNrqYFcUsBMK0sm4skbO_7LO2Qs237Mbc_zUrwOxQ0lEHdDE-3w74hK182bzXXoJ9Nz4No0EMfJPJZ14JUTiBDxNw-onJOCwry6C0bNPzf9aJY');
    setChMission('');
    setChMissionIcon('rocket_launch');
    setChVision('');
    setChVisionIcon('visibility');
    setChapterLeaders([]);
    setIsChapterModalOpen(true);
  };

  const handleOpenEditChapter = (c: ChapterAdmin) => {
    if (!c) return;
    setIsNewChapter(false);
    setEditingChapter(c);
    setChName(c.name || '');
    setChRegion(c.region || 'Miền Bắc');
    setChLocations(c.locations || '');
    setChSlogan(c.slogan || '');
    setChDesc(c.description || '');
    setChImage(c.image_url || '');
    setChMission(c.mission_text || '');
    setChMissionIcon(c.mission_icon || 'rocket_launch');
    setChVision(c.vision_text || '');
    setChVisionIcon(c.vision_icon || 'visibility');

    const filteredLeads = leaders.filter(l => l && l.chapter_id === c.id);
    setChapterLeaders(filteredLeads);
    setIsChapterModalOpen(true);
  };

  const handleDeleteChapter = async (chapId: string) => {
    if (!chapId) return;
    if (!confirm('Bạn có chắc chắn muốn xóa chi hội này và toàn bộ ban lãnh đạo trực thuộc?')) return;
    
    const targetChap = chapters.find(c => c && c.id === chapId);
    const targetLeads = leaders.filter(l => l && l.chapter_id === chapId);

    if (supabase) {
      try {
        const { error } = await supabase.from('chapters').delete().eq('id', chapId);
        if (error) throw error;
      } catch (err) {
        alert('Lỗi: ' + (err as Error).message);
        return;
      }
    }

    if (targetChap && targetChap.image_url) {
      deleteFileFromStorage(targetChap.image_url);
    }
    targetLeads.forEach(l => {
      if (l && l.avatar_url) {
        deleteFileFromStorage(l.avatar_url);
      }
    });

    const updatedChaps = chapters.filter(c => c && c.id !== chapId);
    const updatedLeads = leaders.filter(l => l && l.chapter_id !== chapId);
    setChapters(updatedChaps);
    setLeaders(updatedLeads);
    if (!supabase) {
      localStorage.setItem('hoba_chapters_list', JSON.stringify(updatedChaps));
      localStorage.setItem('hoba_chapter_leaders_list', JSON.stringify(updatedLeads));
    }
    triggerToast('Đã xóa chi hội thành công!');
  };

  const handleSaveChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chName || !chLocations) {
      alert('Vui lòng điền tên và địa bàn hoạt động của chi hội.');
      return;
    }

    setLoading(true);
    const chapterId = isNewChapter ? (supabase ? undefined : `c-${Date.now()}`) : editingChapter?.id;
    const payload = {
      name: chName,
      region: chRegion,
      locations: chLocations,
      slogan: chSlogan,
      description: chDesc,
      mission_text: chMission,
      mission_icon: chMissionIcon,
      vision_text: chVision,
      vision_icon: chVisionIcon,
      image_url: chImage
    };

    let savedChap: ChapterAdmin;

    if (supabase) {
      try {
        if (isNewChapter) {
          const { data, error } = await supabase.from('chapters').insert([payload]).select().single();
          if (error) throw error;
          savedChap = data;
        } else {
          if (editingChapter?.image_url && editingChapter.image_url !== chImage) {
            deleteFileFromStorage(editingChapter.image_url);
          }
          const { data, error } = await supabase.from('chapters').update(payload).eq('id', chapterId).select().single();
          if (error) throw error;
          savedChap = data;
        }
      } catch (err) {
        alert('Lỗi khi lưu chi hội: ' + (err as Error).message);
        setLoading(false);
        return;
      }
    } else {
      if (!isNewChapter && editingChapter?.image_url && editingChapter.image_url !== chImage) {
        deleteFileFromStorage(editingChapter.image_url);
      }
      savedChap = {
        id: chapterId as string,
        ...payload
      };
    }

    if (!savedChap) {
      alert('Không nhận được thông tin phản hồi từ máy chủ.');
      setLoading(false);
      return;
    }

    let nextChaps = [...chapters].filter(Boolean);
    if (isNewChapter) {
      nextChaps.push(savedChap);
    } else {
      nextChaps = nextChaps.map(c => c && c.id === savedChap.id ? savedChap : c);
    }
    setChapters(nextChaps);

    // Save Chapter Leadership
    let nextLeaders = leaders.filter(l => l && l.chapter_id !== savedChap.id);
    if (supabase) {
      try {
        await supabase.from('chapter_leadership').delete().eq('chapter_id', savedChap.id);
        if (chapterLeaders.length > 0) {
          const dbLeaders = chapterLeaders.filter(Boolean).map(cl => ({
            chapter_id: savedChap.id,
            name: cl.name,
            position: cl.position,
            avatar_url: cl.avatar_url,
            order_index: cl.order_index
          }));
          const { data: insertedL, error: leadErr } = await supabase.from('chapter_leadership').insert(dbLeaders).select();
          if (leadErr) throw leadErr;
          if (insertedL) {
            nextLeaders = [...nextLeaders, ...insertedL.filter(Boolean)];
          }
        }
      } catch (err) {
        alert('Lỗi lưu ban lãnh đạo: ' + (err as Error).message);
      }
    } else {
      const localLeaders = chapterLeaders.filter(Boolean).map((cl, i) => ({
        id: cl.id.startsWith('temp-') ? `l-${savedChap.id}-${i}-${Date.now()}` : cl.id,
        chapter_id: savedChap.id,
        name: cl.name,
        position: cl.position,
        avatar_url: cl.avatar_url,
        order_index: cl.order_index
      }));
      nextLeaders = [...nextLeaders, ...localLeaders];
      localStorage.setItem('hoba_chapters_list', JSON.stringify(nextChaps));
      localStorage.setItem('hoba_chapter_leaders_list', JSON.stringify(nextLeaders));
    }

    setLeaders(nextLeaders);
    setLoading(false);
    setIsChapterModalOpen(false);
    triggerToast(isNewChapter ? 'Đã thêm chi hội thành công!' : 'Đã cập nhật chi hội thành công!');
  };

  // Chapter Leadership Form handlers
  const handleOpenAddLeader = () => {
    setIsNewLeader(true);
    setEditingLeaderId(null);
    setLName('');
    setLPos('');
    setLAvatar('https://lh3.googleusercontent.com/aida/AP1WRLtHP72y8fqlWgt_3QxyeDd8DqGtlLdTmLWuhdR4FzO9I4U_5T-9P_uyJwSR-kbz8N5pRSpjeORcJRDjuWWh5XkEuC8bJBM5QqK9KrnZjPQiuaGY8vA-fYpbYk__QXh78ARMgOJ77J73aoGD4w82Q2SHJqN6L9WbBVL5uRzxYQucApY2EIjpOpd7-eyBC-OGn_QwPKdLBeuhpZCp8enAccK5RYB4XBKB-C6q90BrZFCRBjn84Nb9MKWtKyE');
    setLOrder(chapterLeaders.length + 1);
    setIsLeaderModalOpen(true);
  };

  const handleOpenEditLeader = (l: LeaderAdmin) => {
    setIsNewLeader(false);
    setEditingLeaderId(l.id);
    setLName(l.name);
    setLPos(l.position);
    setLAvatar(l.avatar_url);
    setLOrder(l.order_index);
    setIsLeaderModalOpen(true);
  };

  const handleDeleteLeader = (leaderId: string) => {
    const leader = chapterLeaders.find(l => l.id === leaderId);
    if (leader && leader.avatar_url) {
      deleteFileFromStorage(leader.avatar_url);
    }
    setChapterLeaders(prev => prev.filter(l => l.id !== leaderId));
  };

  const handleSaveLeader = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lName || !lPos) {
      alert('Vui lòng nhập tên và chức vụ lãnh đạo.');
      return;
    }

    const payload: LeaderAdmin = {
      id: isNewLeader ? `temp-${Date.now()}` : editingLeaderId!,
      chapter_id: editingChapter?.id || '',
      name: lName,
      position: lPos,
      avatar_url: lAvatar,
      order_index: Number(lOrder)
    };

    let nextList = [...chapterLeaders];
    if (isNewLeader) {
      nextList.push(payload);
    } else {
      const oldLeader = chapterLeaders.find(l => l.id === editingLeaderId);
      if (oldLeader && oldLeader.avatar_url && oldLeader.avatar_url !== lAvatar) {
        deleteFileFromStorage(oldLeader.avatar_url);
      }
      nextList = nextList.map(l => l.id === editingLeaderId ? payload : l);
    }
    nextList.sort((a, b) => a.order_index - b.order_index);
    setChapterLeaders(nextList);
    setIsLeaderModalOpen(false);
  };

  return (
    <div className="space-y-6 text-xs bg-[#fcf9f5] p-6 rounded-xl border border-outline-variant/30 text-[#1c1c1a]">
      {/* Header Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-outline-variant/30 pb-4">
        <div>
          <h1 className="text-lg md:text-xl font-black text-[#00346f]">
            {userRole === 'super_admin' ? 'Quản lý Trang Hội viên & Chi hội' : 'Quản lý danh sách Chi hội'}
          </h1>
          <p className="text-on-surface-variant mt-1 text-[11px]">
            {userRole === 'super_admin' 
              ? 'Thiết lập các cấu hình hiển thị, chi hội và chức vụ liên kết.' 
              : 'Thêm, sửa, xóa các chi hội và ban lãnh đạo chi hội trực thuộc.'}
          </p>
        </div>
        <div className="flex gap-2.5">
          <Link
            href="/hoi-vien"
            target="_blank"
            className="flex items-center gap-2 border border-[#00346f] text-[#00346f] px-5 py-2.5 rounded-lg font-bold hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-sm">visibility</span>
            Xem Website
          </Link>
          {activeTab === 'general' && userRole === 'super_admin' && (
            <button
              onClick={handleSaveGeneral}
              disabled={loading}
              className="flex items-center gap-2 bg-[#bb0013] text-white px-6 py-2.5 rounded-lg font-bold hover:bg-[#bb0013]/90 transition-all shadow-md disabled:opacity-50"
            >
              {loading ? 'Đang lưu...' : 'Xuất bản thay đổi'}
            </button>
          )}
        </div>
      </div>

      {/* Tabs Menu */}
      {userRole === 'super_admin' && (
        <div className="flex border-b border-outline-variant/60">
          <button
            onClick={() => setActiveTab('general')}
            className={`pb-3 px-4 font-bold transition-all border-b-2 ${activeTab === 'general' ? 'text-[#00346f] border-[#00346f]' : 'text-on-surface-variant/80 border-transparent hover:text-[#00346f]'}`}
          >
            Cấu hình chung
          </button>
          <button
            onClick={() => setActiveTab('chapters')}
            className={`pb-3 px-4 font-bold transition-all border-b-2 ${activeTab === 'chapters' ? 'text-[#00346f] border-[#00346f]' : 'text-on-surface-variant/80 border-transparent hover:text-[#00346f]'}`}
          >
            Quản lý Chi hội ({chapters.length})
          </button>
        </div>
      )}

      {/* General Configuration Content */}
      {activeTab === 'general' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn">
          {/* Main Customizers (Left column) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* 1. Banner panel */}
            <div className="bg-white border border-outline-variant/30 rounded-xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-4 border-b border-outline-variant/20 pb-2">
                <h3 className="text-xs font-bold text-[#00346f] flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">view_carousel</span>
                  Cấu hình Banner
                </h3>
                <button
                  type="button"
                  onClick={() => toggleSectionExpand('banner')}
                  className="text-on-surface-variant hover:text-[#00346f] transition-all flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-sm">
                    {expandedSections.banner ? 'expand_less' : 'expand_more'}
                  </span>
                  <span className="text-[10px] font-bold">
                    {expandedSections.banner ? 'Thu gọn' : 'Mở rộng'}
                  </span>
                </button>
              </div>

              {expandedSections.banner && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="font-bold text-on-surface-variant">Tiêu đề chính (Headline)</label>
                      <input
                        className="w-full h-10 px-3 rounded border border-outline-variant/60 focus:border-primary outline-none"
                        type="text"
                        value={headline}
                        onChange={(e) => setHeadline(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-on-surface-variant">Mô tả phụ</label>
                      <input
                        className="w-full h-10 px-3 rounded border border-outline-variant/60 focus:border-primary outline-none"
                        type="text"
                        value={subtext}
                        onChange={(e) => setSubtext(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="font-bold text-on-surface-variant block">Ảnh nền banner</label>
                    <div className="flex gap-2">
                      <input
                        className="flex-1 h-9 px-3 rounded border border-outline-variant/60 focus:border-primary outline-none"
                        type="text"
                        value={heroImage}
                        onChange={(e) => setHeroImage(e.target.value)}
                      />
                      <label className="flex items-center justify-center gap-1 bg-[#00346f] text-white px-4 rounded cursor-pointer hover:bg-[#00346f]/90 transition-all font-bold text-xs">
                        <span className="material-symbols-outlined text-sm">
                          {uploading ? 'sync' : 'upload'}
                        </span>
                        Upload
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleHeroImageUpload}
                        />
                      </label>
                    </div>
                    <div className="relative h-32 rounded-lg overflow-hidden border border-outline-variant bg-surface-container-low shadow-inner">
                      <img
                        className="absolute inset-0 w-full h-full object-cover"
                        alt="Banner Preview"
                        src={heroImage}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 2. Stats Counters Panel */}
            <div className="bg-white border border-outline-variant/30 rounded-xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-4 border-b border-outline-variant/20 pb-2">
                <h3 className="text-xs font-bold text-[#00346f] flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">analytics</span>
                  Chỉ số thống kê tổng hợp (4 ô)
                </h3>
                <button
                  type="button"
                  onClick={() => toggleSectionExpand('stats')}
                  className="text-on-surface-variant hover:text-[#00346f] transition-all flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-sm">
                    {expandedSections.stats ? 'expand_less' : 'expand_more'}
                  </span>
                  <span className="text-[10px] font-bold">
                    {expandedSections.stats ? 'Thu gọn' : 'Mở rộng'}
                  </span>
                </button>
              </div>

              {expandedSections.stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {stats.map((item, idx) => (
                    <div key={idx} className="p-3 border border-outline-variant/40 rounded-lg bg-surface-container-low/20 space-y-2">
                      <div className="flex items-center justify-between border-b border-outline-variant/20 pb-1.5 mb-1">
                        <span className="font-bold text-[#00346f]">Ô thống kê số {idx + 1}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="space-y-0.5">
                          <span className="text-[10px] text-on-surface-variant font-bold">Chỉ số</span>
                          <input
                            type="text"
                            value={item.value}
                            onChange={(e) => handleStatChange(idx, 'value', e.target.value)}
                            className="w-full h-8 border border-outline-variant rounded px-2 outline-none font-black text-center text-[#bb0013]"
                          />
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-[10px] text-on-surface-variant font-bold">Nhãn hiển thị</span>
                          <input
                            type="text"
                            value={item.label}
                            onChange={(e) => handleStatChange(idx, 'label', e.target.value)}
                            className="w-full h-8 border border-outline-variant rounded px-2 outline-none"
                          />
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-[10px] text-on-surface-variant font-bold">Material Icon</span>
                          <input
                            type="text"
                            value={item.icon}
                            onChange={(e) => handleStatChange(idx, 'icon', e.target.value)}
                            className="w-full h-8 border border-outline-variant rounded px-2 outline-none text-center"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 3. Benefits checklist panel */}
            <div className="bg-white border border-outline-variant/30 rounded-xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-4 border-b border-outline-variant/20 pb-2">
                <h3 className="text-xs font-bold text-[#00346f] flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">workspace_premium</span>
                  Quyền lợi của Hội viên
                </h3>
                <button
                  type="button"
                  onClick={() => toggleSectionExpand('benefits')}
                  className="text-on-surface-variant hover:text-[#00346f] transition-all flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-sm">
                    {expandedSections.benefits ? 'expand_less' : 'expand_more'}
                  </span>
                  <span className="text-[10px] font-bold">
                    {expandedSections.benefits ? 'Thu gọn' : 'Mở rộng'}
                  </span>
                </button>
              </div>

              {expandedSections.benefits && (
                <div className="space-y-3">
                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 no-scrollbar">
                    {benefits.map((item, idx) => (
                      <div key={idx} className="flex gap-2 items-center bg-surface-container-low/10 p-2.5 border border-outline-variant/20 rounded-lg">
                        <div className="flex flex-col gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => moveBenefitUp(idx)}
                            disabled={idx === 0}
                            className="text-outline hover:text-[#00346f] disabled:opacity-30"
                          >
                            <span className="material-symbols-outlined text-sm">arrow_drop_up</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => moveBenefitDown(idx)}
                            disabled={idx === benefits.length - 1}
                            className="text-outline hover:text-[#00346f] disabled:opacity-30"
                          >
                            <span className="material-symbols-outlined text-sm">arrow_drop_down</span>
                          </button>
                        </div>
                        <input
                          type="text"
                          value={item.icon}
                          onChange={(e) => handleBenefitChange(idx, 'icon', e.target.value)}
                          className="w-12 h-8 border border-outline-variant rounded text-center shrink-0"
                          title="Material Icon name"
                        />
                        <div className="flex-grow space-y-1.5">
                          <input
                            type="text"
                            value={item.title}
                            onChange={(e) => handleBenefitChange(idx, 'title', e.target.value)}
                            className="w-full h-8 border border-outline-variant rounded px-2 outline-none font-bold text-xs"
                            placeholder="Tiêu đề quyền lợi..."
                          />
                          <input
                            type="text"
                            value={item.desc}
                            onChange={(e) => handleBenefitChange(idx, 'desc', e.target.value)}
                            className="w-full h-8 border border-outline-variant rounded px-2 outline-none text-[11px]"
                            placeholder="Mô tả quyền lợi..."
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => deleteBenefit(idx)}
                          className="w-7 h-7 rounded hover:bg-red-50 text-red-500 border border-red-200 flex items-center justify-center shrink-0 transition-colors"
                        >
                          <span className="material-symbols-outlined text-sm">delete</span>
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={addBenefit}
                    className="w-full h-8 border-2 border-dashed border-outline-variant text-on-surface-variant font-bold hover:border-[#00346f] hover:text-[#00346f] rounded-lg flex items-center justify-center gap-1 transition-all"
                  >
                    <span className="material-symbols-outlined text-sm">add</span> Thêm quyền lợi mới
                  </button>
                </div>
              )}
            </div>

            {/* 4. Joining Steps Panel */}
            <div className="bg-white border border-outline-variant/30 rounded-xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-4 border-b border-outline-variant/20 pb-2">
                <h3 className="text-xs font-bold text-[#00346f] flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">assignment</span>
                  Quy trình gia nhập Hiệp hội
                </h3>
                <button
                  type="button"
                  onClick={() => toggleSectionExpand('steps')}
                  className="text-on-surface-variant hover:text-[#00346f] transition-all flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-sm">
                    {expandedSections.steps ? 'expand_less' : 'expand_more'}
                  </span>
                  <span className="text-[10px] font-bold">
                    {expandedSections.steps ? 'Thu gọn' : 'Mở rộng'}
                  </span>
                </button>
              </div>

              {expandedSections.steps && (
                <div className="space-y-3">
                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 no-scrollbar">
                    {steps.map((item, idx) => (
                      <div key={idx} className="flex gap-2 items-center bg-surface-container-low/10 p-2.5 border border-outline-variant/20 rounded-lg">
                        <div className="flex flex-col gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => moveStepUp(idx)}
                            disabled={idx === 0}
                            className="text-outline hover:text-[#00346f] disabled:opacity-30"
                          >
                            <span className="material-symbols-outlined text-sm">arrow_drop_up</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => moveStepDown(idx)}
                            disabled={idx === steps.length - 1}
                            className="text-outline hover:text-[#00346f] disabled:opacity-30"
                          >
                            <span className="material-symbols-outlined text-sm">arrow_drop_down</span>
                          </button>
                        </div>
                        <div className="flex flex-col shrink-0 items-center justify-center bg-[#00346f]/10 text-[#00346f] font-black rounded-lg w-10 h-10 border border-[#00346f]/20">
                          <span className="text-[9px]">BƯỚC</span>
                          <span className="text-xs leading-none">{item.step}</span>
                        </div>
                        <input
                          type="text"
                          value={item.icon}
                          onChange={(e) => handleStepChange(idx, 'icon', e.target.value)}
                          className="w-12 h-8 border border-outline-variant rounded text-center shrink-0"
                          title="Material Icon name"
                        />
                        <div className="flex-grow space-y-1.5">
                          <input
                            type="text"
                            value={item.title}
                            onChange={(e) => handleStepChange(idx, 'title', e.target.value)}
                            className="w-full h-8 border border-outline-variant rounded px-2 outline-none font-bold text-xs"
                            placeholder="Tiêu đề quy trình..."
                          />
                          <input
                            type="text"
                            value={item.desc}
                            onChange={(e) => handleStepChange(idx, 'desc', e.target.value)}
                            className="w-full h-8 border border-outline-variant rounded px-2 outline-none text-[11px]"
                            placeholder="Mô tả quy trình..."
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => deleteStep(idx)}
                          className="w-7 h-7 rounded hover:bg-red-50 text-red-500 border border-red-200 flex items-center justify-center shrink-0 transition-colors"
                        >
                          <span className="material-symbols-outlined text-sm">delete</span>
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={addStep}
                    className="w-full h-8 border-2 border-dashed border-outline-variant text-on-surface-variant font-bold hover:border-[#00346f] hover:text-[#00346f] rounded-lg flex items-center justify-center gap-1 transition-all"
                  >
                    <span className="material-symbols-outlined text-sm">add</span> Thêm bước quy trình mới
                  </button>
                </div>
              )}
            </div>

            {/* 5. Chức vụ Hiệp hội & Màu sắc panel */}
            <div className="bg-white border border-outline-variant/30 rounded-xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-4 border-b border-outline-variant/20 pb-2">
                <h3 className="text-xs font-bold text-[#00346f] flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">badge</span>
                  Màu sắc & Chức danh Hiệp hội
                </h3>
                <button
                  type="button"
                  onClick={() => toggleSectionExpand('roles')}
                  className="text-on-surface-variant hover:text-[#00346f] transition-all flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-sm">
                    {expandedSections.roles ? 'expand_less' : 'expand_more'}
                  </span>
                  <span className="text-[10px] font-bold">
                    {expandedSections.roles ? 'Thu gọn' : 'Mở rộng'}
                  </span>
                </button>
              </div>

              {expandedSections.roles && (
                <div className="space-y-3">
                  <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1 no-scrollbar">
                    {associationRoles.map((role, idx) => (
                      <div key={idx} className="flex gap-2 items-center bg-surface-container-low/10 p-2 border border-outline-variant/20 rounded-lg">
                        <input
                          type="text"
                          value={role.name}
                          onChange={(e) => handleRoleNameChange(idx, e.target.value)}
                          className="flex-grow h-8 border border-outline-variant rounded px-2 outline-none font-bold text-xs"
                          placeholder="Chức danh..."
                        />
                        
                        {/* Background Color Picker */}
                        <div className="flex items-center gap-1 shrink-0">
                          <span className="text-[10px] text-on-surface-variant font-bold">Nền</span>
                          <div className="relative w-8 h-8 rounded border border-outline-variant/60 bg-white flex items-center justify-center cursor-pointer overflow-hidden">
                            <input
                              type="color"
                              value={role.color}
                              onChange={(e) => handleRoleColorChange(idx, e.target.value)}
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
                          <div className="relative w-8 h-8 rounded border border-outline-variant/60 bg-white flex items-center justify-center cursor-pointer overflow-hidden">
                            <input
                              type="color"
                              value={role.textColor || '#ffffff'}
                              onChange={(e) => handleRoleTextColorChange(idx, e.target.value)}
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
                          onClick={() => deleteRole(idx)}
                          className="w-7 h-7 rounded hover:bg-red-50 text-red-500 border border-red-200 flex items-center justify-center shrink-0 transition-colors"
                        >
                          <span className="material-symbols-outlined text-sm">delete</span>
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={addRole}
                    className="w-full h-8 border-2 border-dashed border-outline-variant text-on-surface-variant font-bold hover:border-[#00346f] hover:text-[#00346f] rounded-lg flex items-center justify-center gap-1 transition-all"
                  >
                    <span className="material-symbols-outlined text-sm">add</span> Thêm chức vụ mới
                  </button>
                </div>
              )}
            </div>

          </div>

          {/* Section Visibility Ordering (Right column) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white border border-outline-variant/30 rounded-xl p-6 shadow-sm sticky top-6">
              <div className="flex justify-between items-center mb-3 border-b border-outline-variant/20 pb-2">
                <h3 className="text-xs font-bold text-[#00346f] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base">rule</span>
                  Sắp xếp & Ẩn hiện phần
                </h3>
              </div>
              <p className="text-[10px] text-on-surface-variant mb-4">Nhấp vào nút để ẩn hiện các phần trên trang và dùng mũi tên để sắp xếp thứ tự hiển thị từ trên xuống.</p>

              <div className="space-y-2">
                {sections.map((item, idx) => (
                  <div key={item.id} className={`flex items-center justify-between p-2.5 border rounded-lg transition-all ${item.visible ? 'bg-surface border-outline-variant/30 shadow-sm' : 'bg-surface-container-low/20 border-dashed border-outline-variant/20 opacity-55'}`}>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleSection(item.id)}
                        className={`w-6 h-6 rounded flex items-center justify-center text-xs ${item.visible ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-200 text-gray-400 hover:bg-gray-300'}`}
                        title={item.visible ? 'Bấm để ẩn phần này' : 'Bấm để hiện phần này'}
                      >
                        <span className="material-symbols-outlined text-sm">{item.visible ? 'visibility' : 'visibility_off'}</span>
                      </button>
                      <span className={`font-bold ${item.visible ? 'text-on-surface' : 'text-on-surface-variant/80'}`}>{item.name}</span>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => moveSectionUp(idx)}
                        disabled={idx === 0}
                        className="w-6 h-6 text-outline hover:text-[#00346f] hover:bg-surface-container rounded disabled:opacity-20 flex items-center justify-center"
                      >
                        <span className="material-symbols-outlined text-sm">arrow_upward</span>
                      </button>
                      <button
                        onClick={() => moveSectionDown(idx)}
                        disabled={idx === sections.length - 1}
                        className="w-6 h-6 text-outline hover:text-[#00346f] hover:bg-surface-container rounded disabled:opacity-20 flex items-center justify-center"
                      >
                        <span className="material-symbols-outlined text-sm">arrow_downward</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chapters Management Content */}
      {activeTab === 'chapters' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex justify-between items-center pb-2 border-b border-outline-variant/20">
            <h3 className="text-sm font-bold text-[#00346f] flex items-center gap-2">
              <span className="material-symbols-outlined text-base">lan</span>
              Danh sách Chi hội Địa phương
            </h3>
            <button
              onClick={handleOpenAddChapter}
              className="flex items-center gap-1.5 bg-[#00346f] text-white px-4 py-2 rounded-lg font-bold hover:bg-[#00346f]/90 transition-all active:scale-95 text-xs shadow-md"
            >
              <span className="material-symbols-outlined text-xs">add</span> Thêm Chi hội
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {chapters.filter(Boolean).map((chap) => {
              const chapterLeadersCount = leaders.filter(l => l && l.chapter_id === chap.id).length;
              return (
                <div key={chap.id} className="bg-white border border-outline-variant/30 rounded-xl overflow-hidden shadow-sm flex flex-col hover:shadow-md transition-shadow">
                  <div className="h-28 relative bg-surface-container-low">
                    {chap.image_url ? (
                      <img src={chap.image_url} alt={chap.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-outline-variant">
                        <span className="material-symbols-outlined text-4xl">domain</span>
                      </div>
                    )}
                    <div className="absolute top-2.5 left-2.5 bg-secondary text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded shadow">
                      {chap.region}
                    </div>
                  </div>
                  <div className="p-4 flex-grow flex flex-col justify-between space-y-3 bg-[#ffffff]">
                    <div>
                      <h4 className="font-bold text-[#00346f] text-xs line-clamp-1">{chap.name}</h4>
                      <p className="text-[10px] text-on-surface-variant font-medium mt-0.5 flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">location_on</span>
                        {chap.locations}
                      </p>
                      <p className="text-[11px] text-on-surface-variant/80 italic mt-2 line-clamp-2">
                        &quot;{chap.slogan || 'Cam kết chất lượng vì an toàn năng lượng.'}&quot;
                      </p>
                    </div>
                    <div className="flex justify-between items-center border-t border-outline-variant/20 pt-3">
                      <span className="text-[10px] text-[#00346f] font-bold flex items-center gap-1 bg-[#00346f]/5 px-2 py-1 rounded">
                        <span className="material-symbols-outlined text-xs">badge</span>
                        {chapterLeadersCount} nhân sự BCH
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleOpenEditChapter(chap)}
                          className="w-7 h-7 rounded border border-outline-variant/60 hover:bg-surface-container text-[#00346f] flex items-center justify-center transition-colors"
                          title="Chỉnh sửa chi hội"
                        >
                          <span className="material-symbols-outlined text-sm">edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteChapter(chap.id)}
                          className="w-7 h-7 rounded border border-red-200 hover:bg-red-50 text-red-500 flex items-center justify-center transition-colors"
                          title="Xóa chi hội"
                        >
                          <span className="material-symbols-outlined text-sm">delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Chapters Edit/Create Dialog */}
      {isChapterModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-xl border border-outline-variant/30 shadow-2xl max-w-4xl w-full p-6 text-xs text-[#1c1c1a] space-y-4 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-outline-variant/20 pb-3">
              <h3 className="text-sm font-black text-[#00346f] flex items-center gap-2">
                <span className="material-symbols-outlined">domain</span>
                {isNewChapter ? 'Tạo Chi hội Địa phương mới' : `Chỉnh sửa ${chName}`}
              </h3>
              <button
                onClick={() => setIsChapterModalOpen(false)}
                className="w-7 h-7 rounded-full hover:bg-surface-container flex items-center justify-center text-outline transition-colors"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveChapter} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Form Details */}
              <div className="lg:col-span-7 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2 space-y-1">
                    <label className="font-bold text-on-surface-variant">Tên Chi hội *</label>
                    <input
                      type="text"
                      required
                      value={chName}
                      onChange={(e) => setChName(e.target.value)}
                      placeholder="Chi hội LPG Đông Nam Bộ"
                      className="w-full h-9 border border-outline-variant rounded px-3 focus:border-primary outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-on-surface-variant">Khu vực *</label>
                    <select
                      value={chRegion}
                      onChange={(e) => setChRegion(e.target.value)}
                      className="w-full h-9 border border-outline-variant rounded px-3 focus:border-primary outline-none bg-white font-bold"
                    >
                      <option value="Miền Bắc">Miền Bắc</option>
                      <option value="Miền Trung">Miền Trung</option>
                      <option value="Miền Nam">Miền Nam</option>
                      <option value="Chuyên môn">Chuyên môn</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-on-surface-variant">Địa bàn / Tỉnh thành phụ trách *</label>
                  <input
                    type="text"
                    required
                    value={chLocations}
                    onChange={(e) => setChLocations(e.target.value)}
                    placeholder="Bình Dương, Đồng Nai, Bà Rịa - Vũng Tàu"
                    className="w-full h-9 border border-outline-variant rounded px-3 focus:border-primary outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-on-surface-variant">Slogan Chi hội</label>
                  <input
                    type="text"
                    value={chSlogan}
                    onChange={(e) => setChSlogan(e.target.value)}
                    placeholder="Đoàn kết - An toàn - Phát triển bền vững"
                    className="w-full h-9 border border-outline-variant rounded px-3 focus:border-primary outline-none italic"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-on-surface-variant">Mô tả giới thiệu chi hội</label>
                  <textarea
                    value={chDesc}
                    onChange={(e) => setChDesc(e.target.value)}
                    placeholder="Mô tả tóm tắt tôn chỉ, lịch sử và ban hội viên sáng lập của chi hội..."
                    className="w-full h-20 border border-outline-variant rounded p-3 focus:border-primary outline-none resize-none"
                  />
                </div>

                {/* Sứ mệnh & Tầm nhìn grids */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 border border-outline-variant/40 rounded-lg space-y-2">
                    <span className="font-bold text-[#00346f] flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">security</span> Sứ mệnh
                    </span>
                    <div className="space-y-1.5">
                      <div className="flex gap-1.5 items-center">
                        <span className="text-[10px] text-on-surface-variant font-bold">Icon:</span>
                        <input
                          type="text"
                          value={chMissionIcon}
                          onChange={(e) => setChMissionIcon(e.target.value)}
                          className="flex-grow h-7 border border-outline-variant rounded px-2 outline-none text-center"
                        />
                      </div>
                      <textarea
                        value={chMission}
                        onChange={(e) => setChMission(e.target.value)}
                        placeholder="Nhiệm vụ của chi hội..."
                        className="w-full h-12 border border-outline-variant rounded p-1.5 outline-none resize-none"
                      />
                    </div>
                  </div>

                  <div className="p-3 border border-outline-variant/40 rounded-lg space-y-2">
                    <span className="font-bold text-[#00346f] flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">visibility</span> Tầm nhìn
                    </span>
                    <div className="space-y-1.5">
                      <div className="flex gap-1.5 items-center">
                        <span className="text-[10px] text-on-surface-variant font-bold">Icon:</span>
                        <input
                          type="text"
                          value={chVisionIcon}
                          onChange={(e) => setChVisionIcon(e.target.value)}
                          className="flex-grow h-7 border border-outline-variant rounded px-2 outline-none text-center"
                        />
                      </div>
                      <textarea
                        value={chVision}
                        onChange={(e) => setChVision(e.target.value)}
                        placeholder="Định hướng phát triển tương lai..."
                        className="w-full h-12 border border-outline-variant rounded p-1.5 outline-none resize-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="font-bold text-on-surface-variant block">Ảnh bìa / Ảnh đại diện chi hội</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={chImage}
                      onChange={(e) => setChImage(e.target.value)}
                      className="flex-grow h-9 px-3 rounded border border-outline-variant/60 focus:border-primary outline-none"
                    />
                    <label className="flex items-center justify-center gap-1 bg-[#00346f] text-white px-4 rounded cursor-pointer hover:bg-[#00346f]/90 transition-all font-bold text-xs">
                      <span className="material-symbols-outlined text-sm">
                        {uploading ? 'sync' : 'upload'}
                      </span>
                      Upload
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleChapterImageUpload}
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Right Column: Chapter Leadership Customizer */}
              <div className="lg:col-span-5 flex flex-col space-y-3 bg-surface-container-low/10 p-4 rounded-xl border border-outline-variant/20">
                <div className="flex justify-between items-center border-b border-outline-variant/20 pb-2">
                  <span className="font-bold text-[#00346f] flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">groups</span>
                    Ban Lãnh đạo Chi hội ({chapterLeaders.length})
                  </span>
                  <button
                    type="button"
                    onClick={handleOpenAddLeader}
                    className="text-[10px] bg-[#00346f]/10 text-[#00346f] px-2.5 py-1.5 rounded-lg hover:bg-[#00346f] hover:text-white transition-all font-black flex items-center gap-0.5"
                  >
                    <span className="material-symbols-outlined text-xs font-bold">add</span>
                    Thêm nhân sự
                  </button>
                </div>

                <div className="space-y-2 flex-grow overflow-y-auto max-h-[350px] pr-1 no-scrollbar">
                  {chapterLeaders.filter(Boolean).length === 0 ? (
                    <div className="text-center py-10 text-outline-variant italic">Chưa cấu hình ban lãnh đạo chi hội.</div>
                  ) : (
                    chapterLeaders.filter(Boolean).map((lead) => (
                      <div key={lead.id} className="flex items-center justify-between p-2 bg-white border border-outline-variant/20 rounded-lg hover:shadow-sm">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={lead.avatar_url}
                            alt={lead.name}
                            className="w-9 h-9 rounded-full object-cover border border-outline-variant/20"
                          />
                          <div>
                            <h5 className="font-bold text-on-surface leading-tight text-xs">{lead.name}</h5>
                            <p className="text-[10px] text-on-surface-variant font-medium mt-0.5">{lead.position}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-[9px] bg-secondary/10 text-secondary font-black px-1.5 py-0.5 rounded" title="Thứ tự hiển thị">
                            #{lead.order_index}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleOpenEditLeader(lead)}
                            className="w-6 h-6 hover:bg-surface-container rounded flex items-center justify-center text-outline"
                          >
                            <span className="material-symbols-outlined text-sm">edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteLeader(lead.id)}
                            className="w-6 h-6 hover:bg-red-50 text-red-500 rounded flex items-center justify-center"
                          >
                            <span className="material-symbols-outlined text-sm">delete</span>
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Submit controls */}
                <div className="flex justify-end gap-2.5 pt-4 border-t border-outline-variant/20 mt-auto">
                  <button
                    type="button"
                    onClick={() => setIsChapterModalOpen(false)}
                    className="h-9 px-4 rounded-lg border border-outline-variant font-bold hover:bg-surface-container transition-colors"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="h-9 px-5 rounded-lg bg-[#bb0013] text-white font-bold hover:bg-[#bb0013]/90 transition-all flex items-center gap-1 shadow-sm active:scale-95"
                  >
                    <span className="material-symbols-outlined text-sm">save</span>
                    Lưu chi hội
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Chapter Leadership Modal (Modal within Modal) */}
      {isLeaderModalOpen && (
        <div className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl border border-outline-variant/30 shadow-2xl max-w-sm w-full p-6 flex flex-col text-xs text-[#1c1c1a] space-y-4">
            <div className="flex justify-between items-center border-b border-outline-variant/20 pb-3">
              <h4 className="text-xs font-black text-[#00346f] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">person</span>
                {isNewLeader ? 'Thêm Nhân sự Lãnh đạo' : `Sửa nhân sự ${lName}`}
              </h4>
              <button
                type="button"
                onClick={() => setIsLeaderModalOpen(false)}
                className="w-6 h-6 rounded-full hover:bg-surface-container flex items-center justify-center text-outline"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveLeader} className="space-y-3.5">
              <div className="space-y-1">
                <label className="font-bold text-on-surface-variant">Họ và tên *</label>
                <input
                  type="text"
                  required
                  value={lName}
                  onChange={(e) => setLName(e.target.value)}
                  placeholder="e.g. Ông Nguyễn Văn A"
                  className="w-full h-8 border border-outline-variant rounded px-2 focus:border-primary outline-none font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-on-surface-variant">Chức danh / Chức vụ *</label>
                <input
                  type="text"
                  required
                  value={lPos}
                  onChange={(e) => setLPos(e.target.value)}
                  placeholder="e.g. Chi hội trưởng, Chủ tịch chi hội"
                  className="w-full h-8 border border-outline-variant rounded px-2 focus:border-primary outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2 space-y-1">
                  <label className="font-bold text-on-surface-variant">Thứ tự sắp xếp *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={lOrder}
                    onChange={(e) => setLOrder(Number(e.target.value))}
                    className="w-full h-8 border border-outline-variant rounded px-2 focus:border-primary outline-none text-center font-bold"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="font-bold text-on-surface-variant block">Hình ảnh đại diện (avatar)</label>
                <div className="flex items-center gap-3 bg-surface-container-low/20 p-2 rounded-lg border border-outline-variant/10">
                  <img
                    src={lAvatar}
                    alt="Preview"
                    className="w-10 h-10 rounded-full object-cover border border-outline-variant/30 shrink-0 bg-white"
                  />
                  <div className="flex-grow flex flex-col gap-1.5">
                    <input
                      type="text"
                      value={lAvatar}
                      onChange={(e) => setLAvatar(e.target.value)}
                      placeholder="Dán URL hình ảnh..."
                      className="w-full h-7 border border-outline-variant rounded px-2 outline-none text-[10px]"
                    />
                    <label className="h-6 bg-secondary text-white text-[9px] font-black rounded flex items-center justify-center gap-1 hover:bg-[#93000d] cursor-pointer transition-all active:scale-95 shadow">
                      <span className="material-symbols-outlined text-[11px] font-bold">
                        {uploading ? 'sync' : 'cloud_upload'}
                      </span>
                      Tải lên hình ảnh
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleLeaderAvatarUpload}
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-outline-variant/20">
                <button
                  type="button"
                  onClick={() => setIsLeaderModalOpen(false)}
                  className="h-8 px-3 rounded border border-outline-variant font-bold hover:bg-surface-container"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="h-8 px-4 rounded bg-[#00346f] text-white font-bold hover:bg-[#00346f]/90 transition-all shadow"
                >
                  Xác nhận
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dynamic Toast notifications */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-green-800 text-white px-5 py-3 rounded-lg shadow-xl flex items-center gap-2 border border-green-700 animate-slideUp">
          <span className="material-symbols-outlined text-base">check_circle</span>
          <span className="font-bold text-xs">{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
