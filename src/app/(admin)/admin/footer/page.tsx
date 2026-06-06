'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface GeneralConfig {
  siteName: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  workingHours: string;
  mapEmbedUrl?: string;
  footerDesc?: string;
  copyText?: string;
  facebookUrl?: string;
  quickLinks?: { label: string; path: string }[];
  categories?: { label: string; path: string }[];
  maintenanceMode: boolean;
  registrationOpen: boolean;
  logoUrl?: string;
  websiteUrl?: string;
  termsPath?: string;
  privacyPath?: string;
  socialLinks?: { icon: string; url: string }[];
}

const renderSocialIcon = (iconName: string) => {
  const name = iconName.toLowerCase().trim();
  if (name === 'facebook') {
    return (
      <svg className="w-3.5 h-3.5 fill-current text-white" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    );
  }
  if (name === 'youtube') {
    return (
      <svg className="w-3.5 h-3.5 fill-current text-white" viewBox="0 0 24 24">
        <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.517 0-9.388.508a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.871.508 9.388.508 9.388.508s7.517 0 9.388-.508a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    );
  }
  if (name === 'twitter' || name === 'x') {
    return (
      <svg className="w-3.5 h-3.5 fill-current text-white" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    );
  }
  if (name === 'zalo') {
    return (
      <span className="text-[9px] font-bold text-white tracking-tight leading-none">Zalo</span>
    );
  }
  return <span className="material-symbols-outlined text-sm text-white">{iconName}</span>;
};

export default function AdminFooter() {
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);

  // Default values
  const defaultQuickLinks = [
    { label: 'Giới thiệu hiệp hội', path: '/gioi-thieu' },
    { label: 'Danh sách hội viên', path: '/hoi-vien' },
    { label: 'Tin tức & Sự kiện', path: '/tin-tuc' },
    { label: 'Văn bản pháp quy', path: '/van-ban' }
  ];

  const defaultCategories = [
    { label: 'Đào tạo an toàn', path: '/tin-tuc?cat=dao-tao' },
    { label: 'Tư vấn pháp lý', path: '/tin-tuc?cat=phap-ly' },
    { label: 'Thị trường gas', path: '/tin-tuc?cat=thi-truong' },
    { label: 'Hướng dẫn hội viên', path: '/tin-tuc?cat=huong-dan' }
  ];

  const defaultSocialLinks = [
    { icon: 'facebook', url: 'https://facebook.com/hobagroup' },
    { icon: 'public', url: 'https://hoba.vn' },
    { icon: 'mail', url: 'mailto:info@hoba.vn' }
  ];

  // Config fields
  const [siteName, setSiteName] = useState('HOBA LPG');
  const [footerDesc, setFooterDesc] = useState('Hiệp hội Kinh doanh Khí hóa lỏng TP.HCM - Nơi kết nối, bảo vệ và định hướng phát triển bền vững cho cộng đồng doanh nghiệp LPG phía Nam.');
  const [copyText, setCopyText] = useState('© 2025 HOBA - Hiệp hội Kinh doanh Khí hóa lỏng TP.HCM. All rights reserved.');
  const [facebookUrl, setFacebookUrl] = useState('https://facebook.com/hobagroup');
  const [email, setEmail] = useState('info@hoba.vn');
  const [phone, setPhone] = useState('028 3831 6671');
  const [address, setAddress] = useState('18A Cộng Hòa, P.12, Q. Tân Bình, TP.HCM');
  const [workingHours, setWorkingHours] = useState('Thứ 2 - Thứ 6: 08:00 - 17:00\nThứ 7: 08:00 - 12:00');
  const [mapEmbedUrl, setMapEmbedUrl] = useState('');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [registrationOpen, setRegistrationOpen] = useState(true);

  // Added dynamic footer settings
  const [logoUrl, setLogoUrl] = useState('https://lh3.googleusercontent.com/aida-public/AB6AXuDGqQKdtsfpnEDKd7JAu8yQBX437NF9yre-G8AhC0L2jkhp6KVKASaL_r8TGZh_QRNtxoTKJXj2RXxkHdzbloP5qr9ddoI8OKoucsW0qAAsP4BTZGw_OuSxkWH_7yIFBmg6xnEcQ6TW4JHRFli25nYMjoLZ2HCRMhbnXTVG7sJKa0uboKFQS39PjtPXOEjGCHqrOCfHNMf3fKTvNlIsHiQw4bsKOCnLrOmA4gvrVMw8OI1QXoKnQvFoERk0EIu4ye4Mgt_9-lpAzjg');
  const [websiteUrl, setWebsiteUrl] = useState('https://hoba.vn');
  const [termsPath, setTermsPath] = useState('/dieu-khoan');
  const [privacyPath, setPrivacyPath] = useState('/chinh-sach');

  // Media states
  const [logoUploading, setLogoUploading] = useState(false);
  const [socialLinks, setSocialLinks] = useState<{ icon: string; url: string }[]>(defaultSocialLinks);

  // Link lists states
  const [quickLinks, setQuickLinks] = useState<{ label: string; path: string }[]>(defaultQuickLinks);
  const [categories, setCategories] = useState<{ label: string; path: string }[]>(defaultCategories);

  useEffect(() => {
    async function loadFooter() {
      if (!supabase) {
        const saved = localStorage.getItem('hoba_website_config_general');
        if (saved) {
          try {
            const val: GeneralConfig = JSON.parse(saved);
            applyConfig(val);
          } catch (e) {}
        }
        setLoading(false);
        return;
      }
      try {
        const { data, error } = await supabase
          .from('website_config')
          .select('value')
          .eq('key', 'general')
          .single();

        if (!error && data?.value) {
          applyConfig(data.value);
        }
      } catch (err) {
        console.error('Lỗi tải cấu hình footer:', err);
      } finally {
        setLoading(false);
      }
    }
    loadFooter();
  }, []);

  const applyConfig = (val: GeneralConfig) => {
    if (val.siteName) setSiteName(val.siteName);
    if (val.footerDesc) setFooterDesc(val.footerDesc);
    if (val.copyText) setCopyText(val.copyText);
    if (val.facebookUrl) setFacebookUrl(val.facebookUrl);
    if (val.contactEmail) setEmail(val.contactEmail);
    if (val.contactPhone) setPhone(val.contactPhone);
    if (val.address) setAddress(val.address);
    if (val.workingHours) setWorkingHours(val.workingHours);
    if (val.mapEmbedUrl) setMapEmbedUrl(val.mapEmbedUrl);
    if (val.maintenanceMode !== undefined) setMaintenanceMode(val.maintenanceMode);
    if (val.registrationOpen !== undefined) setRegistrationOpen(val.registrationOpen);
    if (val.quickLinks && Array.isArray(val.quickLinks)) setQuickLinks(val.quickLinks);
    if (val.categories && Array.isArray(val.categories)) setCategories(val.categories);
    if (val.logoUrl) setLogoUrl(val.logoUrl);
    if (val.websiteUrl) setWebsiteUrl(val.websiteUrl);
    if (val.termsPath) setTermsPath(val.termsPath);
    if (val.privacyPath) setPrivacyPath(val.privacyPath);

    if (val.socialLinks && Array.isArray(val.socialLinks)) {
      setSocialLinks(val.socialLinks);
    } else {
      const list = [];
      if (val.facebookUrl) list.push({ icon: 'facebook', url: val.facebookUrl });
      if (val.websiteUrl) list.push({ icon: 'public', url: val.websiteUrl });
      if (val.contactEmail) list.push({ icon: 'mail', url: `mailto:${val.contactEmail}` });
      setSocialLinks(list.length > 0 ? list : defaultSocialLinks);
    }
  };

  // Image Upload Logic
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
    const filePath = `footer-assets/${fileName}`;

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

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLogoUploading(true);
      try {
        const file = e.target.files[0];
        const url = await uploadImage(file);
        setLogoUrl(url);
      } catch (err) {
        alert('Lỗi tải hình ảnh logo lên: ' + (err as Error).message);
      } finally {
        setLogoUploading(false);
      }
    }
  };

  // Quick Links list actions
  const handleQuickLinkChange = (index: number, field: 'label' | 'path', value: string) => {
    const updated = [...quickLinks];
    updated[index] = { ...updated[index], [field]: value };
    setQuickLinks(updated);
  };

  const addQuickLink = () => {
    setQuickLinks([...quickLinks, { label: 'Liên kết mới', path: '#' }]);
  };

  const deleteQuickLink = (index: number) => {
    setQuickLinks(quickLinks.filter((_, i) => i !== index));
  };

  const moveQuickLink = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === quickLinks.length - 1) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const updated = [...quickLinks];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setQuickLinks(updated);
  };

  // Categories list actions
  const handleCategoryChange = (index: number, field: 'label' | 'path', value: string) => {
    const updated = [...categories];
    updated[index] = { ...updated[index], [field]: value };
    setCategories(updated);
  };

  const addCategory = () => {
    setCategories([...categories, { label: 'Chuyên mục mới', path: '#' }]);
  };

  const deleteCategory = (index: number) => {
    setCategories(categories.filter((_, i) => i !== index));
  };

  const moveCategory = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === categories.length - 1) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const updated = [...categories];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setCategories(updated);
  };

  // Social Links dynamic actions
  const handleSocialLinkChange = (index: number, field: 'icon' | 'url', value: string) => {
    const updated = [...socialLinks];
    updated[index] = { ...updated[index], [field]: value };
    setSocialLinks(updated);
  };

  const addSocialLink = () => {
    setSocialLinks([...socialLinks, { icon: 'facebook', url: '#' }]);
  };

  const deleteSocialLink = (index: number) => {
    setSocialLinks(socialLinks.filter((_, i) => i !== index));
  };

  const moveSocialLink = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === socialLinks.length - 1) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const updated = [...socialLinks];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setSocialLinks(updated);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const mergedConfig: GeneralConfig = {
      siteName,
      contactEmail: email,
      contactPhone: phone,
      address,
      workingHours,
      mapEmbedUrl,
      maintenanceMode,
      registrationOpen,
      footerDesc,
      copyText,
      facebookUrl,
      quickLinks,
      categories,
      logoUrl,
      websiteUrl,
      termsPath,
      privacyPath,
      socialLinks
    };

    if (supabase) {
      try {
        const { data } = await supabase
          .from('website_config')
          .select('value')
          .eq('key', 'general')
          .single();

        const currentVal = data?.value || {};
        const finalVal = {
          ...currentVal,
          ...mergedConfig
        };

        const { error } = await supabase
          .from('website_config')
          .upsert({
            key: 'general',
            value: finalVal
          });
        if (error) throw error;
      } catch (err) {
        alert('Lỗi lưu cấu hình footer: ' + (err as Error).message);
        setLoading(false);
        return;
      }
    } else {
      // Offline/Mock mode
      const saved = localStorage.getItem('hoba_website_config_general');
      const currentVal = saved ? JSON.parse(saved) : {};
      const finalVal = {
        ...currentVal,
        ...mergedConfig
      };
      localStorage.setItem('hoba_website_config_general', JSON.stringify(finalVal));
    }

    setLoading(false);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 4000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-[#00346f] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-xs font-medium">
      {/* Page Header */}
      <div className="flex justify-between items-center border-b border-outline-variant/20 pb-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-primary">Cấu hình Trang Footer</h2>
          <p className="text-xs text-on-surface-variant mt-1">
            Hiệu chỉnh nội dung chân trang dựa trên các khối/cột đang hiển thị ở trang web thực tế.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Responsive Grid representing the 4 column footer layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Block 1: Logo, Description & Social */}
          <div className="bg-white p-5 rounded-xl border border-outline-variant/30 shadow-sm flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-primary flex items-center gap-2 border-b border-outline-variant/20 pb-2">
                <span className="material-symbols-outlined text-base">info</span>
                Khối 1: Giới thiệu & Logo
              </h3>
              
              {/* Logo URL and Upload area */}
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-on-surface-variant uppercase text-[9px] tracking-wider">Hình ảnh Logo</label>
                <div className="flex gap-2">
                  <input
                    className="flex-grow h-9 border border-outline-variant/50 rounded-lg px-3 bg-surface text-xs outline-none focus:border-primary"
                    type="text"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    placeholder="https://..."
                  />
                  <label className="bg-primary hover:bg-primary/95 text-white font-bold text-xs px-3 py-2 rounded-lg flex items-center justify-center gap-1 shadow-sm cursor-pointer whitespace-nowrap active:scale-95 transition-all">
                    <span className="material-symbols-outlined text-sm">upload</span>
                    {logoUploading ? 'Đang tải...' : 'Tải lên'}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleLogoUpload}
                      disabled={logoUploading}
                    />
                  </label>
                </div>
                {logoUrl && (
                  <div className="mt-1 flex items-center justify-between p-2 bg-surface-container-low border border-outline-variant/20 rounded-md">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] text-on-surface-variant">Xem thử:</span>
                      <img src={logoUrl} alt="Logo preview" className="h-8 max-w-[100px] object-contain bg-white p-0.5 rounded border border-outline-variant/10" onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0.5'; }} />
                    </div>
                    <button 
                      type="button" 
                      onClick={() => setLogoUrl('')}
                      className="text-on-surface-variant hover:text-red-500 font-bold text-[9px] px-1"
                    >
                      Xóa
                    </button>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-on-surface-variant uppercase text-[9px] tracking-wider">Mô tả ngắn Hiệp hội</label>
                <textarea
                  className="border border-outline-variant/50 rounded-lg p-2.5 bg-surface text-xs outline-none focus:border-primary resize-y"
                  rows={4}
                  value={footerDesc}
                  onChange={(e) => setFooterDesc(e.target.value)}
                  placeholder="Nhập mô tả ngắn về hiệp hội để hiển thị ở chân trang..."
                />
              </div>

              {/* Dynamic Social links */}
              <div className="space-y-3 pt-3 border-t border-outline-variant/20">
                <div className="flex justify-between items-center mb-1">
                  <label className="font-bold text-primary uppercase text-[9px] tracking-wider flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">share</span>
                    Mạng xã hội
                  </label>
                  <button
                    type="button"
                    onClick={addSocialLink}
                    className="bg-primary/10 hover:bg-primary/20 text-primary font-bold text-[9px] px-2 py-1 rounded transition-colors flex items-center gap-0.5"
                  >
                    <span className="material-symbols-outlined text-[10px] font-bold">add</span>
                    Thêm MXH
                  </button>
                </div>
                
                <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                  {socialLinks.map((link, idx) => (
                    <div key={idx} className="bg-surface-container-low p-2 rounded-lg border border-outline-variant/20 space-y-1.5 animate-fade-in">
                      <div className="flex gap-2">
                        <select
                          value={['facebook', 'youtube', 'x', 'public', 'mail'].includes(link.icon) ? link.icon : 'custom'}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === 'custom') {
                              handleSocialLinkChange(idx, 'icon', 'share');
                            } else {
                              handleSocialLinkChange(idx, 'icon', val);
                            }
                          }}
                          className="h-8 border border-outline-variant bg-white rounded text-xs px-2 outline-none focus:border-primary w-24"
                        >
                          <option value="facebook">Facebook</option>
                          <option value="youtube">YouTube</option>
                          <option value="x">X (Twitter)</option>
                          <option value="public">Website</option>
                          <option value="mail">Email</option>
                          <option value="custom">Mã Icon</option>
                        </select>
                        
                        {!['facebook', 'youtube', 'x', 'public', 'mail'].includes(link.icon) && (
                          <input
                            type="text"
                            value={link.icon}
                            onChange={(e) => handleSocialLinkChange(idx, 'icon', e.target.value)}
                            placeholder="Tên icon (Material)"
                            className="w-24 h-8 px-2 border border-outline-variant bg-white rounded text-xs outline-none focus:border-primary flex-grow"
                          />
                        )}
                      </div>
                      
                      <div className="flex gap-1.5 items-center">
                        <input
                          type="text"
                          value={link.url}
                          onChange={(e) => handleSocialLinkChange(idx, 'url', e.target.value)}
                          placeholder="Đường dẫn liên kết"
                          className="flex-grow h-8 px-2 border border-outline-variant bg-white rounded text-xs outline-none focus:border-primary"
                        />
                        <div className="flex gap-0.5">
                          <button
                            type="button"
                            onClick={() => moveSocialLink(idx, 'up')}
                            disabled={idx === 0}
                            className="p-0.5 text-on-surface-variant hover:text-primary disabled:opacity-20"
                            title="Di chuyển lên"
                          >
                            <span className="material-symbols-outlined text-sm">arrow_upward</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => moveSocialLink(idx, 'down')}
                            disabled={idx === socialLinks.length - 1}
                            className="p-0.5 text-on-surface-variant hover:text-primary disabled:opacity-20"
                            title="Di chuyển xuống"
                          >
                            <span className="material-symbols-outlined text-sm">arrow_downward</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteSocialLink(idx)}
                            className="p-0.5 text-on-surface-variant hover:text-red-500"
                            title="Xóa"
                          >
                            <span className="material-symbols-outlined text-sm">delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {socialLinks.length === 0 && (
                    <p className="text-center text-on-surface-variant text-[10px] py-3 italic">Không có liên kết MXH.</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Block 2: Quick Links */}
          <div className="bg-white p-5 rounded-xl border border-outline-variant/30 shadow-sm flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-outline-variant/20 pb-2">
                <h3 className="text-sm font-bold text-primary flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">link</span>
                  Khối 2: Liên kết nhanh
                </h3>
                <button
                  type="button"
                  onClick={addQuickLink}
                  className="bg-primary/10 hover:bg-primary/20 text-primary font-bold text-[9px] px-2 py-1 rounded transition-colors flex items-center gap-0.5"
                >
                  <span className="material-symbols-outlined text-xs font-bold">add</span>
                  Thêm
                </button>
              </div>
              
              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                {quickLinks.map((link, idx) => (
                  <div key={idx} className="bg-surface-container-low p-2 rounded-lg border border-outline-variant/20 space-y-1">
                    <input
                      type="text"
                      value={link.label}
                      onChange={(e) => handleQuickLinkChange(idx, 'label', e.target.value)}
                      placeholder="Tên liên kết (VD: Giới thiệu)"
                      className="w-full h-8 px-2 border border-outline-variant/40 bg-white rounded text-xs outline-none focus:border-primary"
                    />
                    <input
                      type="text"
                      value={link.path}
                      onChange={(e) => handleQuickLinkChange(idx, 'path', e.target.value)}
                      placeholder="Đường dẫn (VD: /gioi-thieu)"
                      className="w-full h-8 px-2 border border-outline-variant/40 bg-white rounded text-xs outline-none focus:border-primary"
                    />
                    <div className="flex justify-end gap-1.5 pt-1 border-t border-outline-variant/10">
                      <button
                        type="button"
                        onClick={() => moveQuickLink(idx, 'up')}
                        disabled={idx === 0}
                        className="p-0.5 text-on-surface-variant hover:text-primary disabled:opacity-20"
                        title="Di chuyển lên"
                      >
                        <span className="material-symbols-outlined text-sm">arrow_upward</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => moveQuickLink(idx, 'down')}
                        disabled={idx === quickLinks.length - 1}
                        className="p-0.5 text-on-surface-variant hover:text-primary disabled:opacity-20"
                        title="Di chuyển xuống"
                      >
                        <span className="material-symbols-outlined text-sm">arrow_downward</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteQuickLink(idx)}
                        className="p-0.5 text-on-surface-variant hover:text-red-500"
                        title="Xóa"
                      >
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                    </div>
                  </div>
                ))}
                {quickLinks.length === 0 && (
                  <p className="text-center text-on-surface-variant text-[10px] py-4 italic">Trống. Hãy nhấn nút Thêm.</p>
                )}
              </div>
            </div>
          </div>

          {/* Block 3: Categories Links */}
          <div className="bg-white p-5 rounded-xl border border-outline-variant/30 shadow-sm flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-outline-variant/20 pb-2">
                <h3 className="text-sm font-bold text-primary flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">category</span>
                  Khối 3: Chuyên mục
                </h3>
                <button
                  type="button"
                  onClick={addCategory}
                  className="bg-primary/10 hover:bg-primary/20 text-primary font-bold text-[9px] px-2 py-1 rounded transition-colors flex items-center gap-0.5"
                >
                  <span className="material-symbols-outlined text-xs font-bold">add</span>
                  Thêm
                </button>
              </div>

              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                {categories.map((cat, idx) => (
                  <div key={idx} className="bg-surface-container-low p-2 rounded-lg border border-outline-variant/20 space-y-1">
                    <input
                      type="text"
                      value={cat.label}
                      onChange={(e) => handleCategoryChange(idx, 'label', e.target.value)}
                      placeholder="Tên chuyên mục (VD: Đào tạo)"
                      className="w-full h-8 px-2 border border-outline-variant/40 bg-white rounded text-xs outline-none focus:border-primary"
                    />
                    <input
                      type="text"
                      value={cat.path}
                      onChange={(e) => handleCategoryChange(idx, 'path', e.target.value)}
                      placeholder="Đường dẫn (VD: /tin-tuc?cat=dao-tao)"
                      className="w-full h-8 px-2 border border-outline-variant/40 bg-white rounded text-xs outline-none focus:border-primary"
                    />
                    <div className="flex justify-end gap-1.5 pt-1 border-t border-outline-variant/10">
                      <button
                        type="button"
                        onClick={() => moveCategory(idx, 'up')}
                        disabled={idx === 0}
                        className="p-0.5 text-on-surface-variant hover:text-primary disabled:opacity-20"
                        title="Di chuyển lên"
                      >
                        <span className="material-symbols-outlined text-sm">arrow_upward</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => moveCategory(idx, 'down')}
                        disabled={idx === categories.length - 1}
                        className="p-0.5 text-on-surface-variant hover:text-primary disabled:opacity-20"
                        title="Di chuyển xuống"
                      >
                        <span className="material-symbols-outlined text-sm">arrow_downward</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteCategory(idx)}
                        className="p-0.5 text-on-surface-variant hover:text-red-500"
                        title="Xóa"
                      >
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                    </div>
                  </div>
                ))}
                {categories.length === 0 && (
                  <p className="text-center text-on-surface-variant text-[10px] py-4 italic">Trống. Hãy nhấn nút Thêm.</p>
                )}
              </div>
            </div>
          </div>

          {/* Block 4: Contact details */}
          <div className="bg-white p-5 rounded-xl border border-outline-variant/30 shadow-sm flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-primary flex items-center gap-2 border-b border-outline-variant/20 pb-2">
                <span className="material-symbols-outlined text-base">corporate_fare</span>
                Khối 4: Văn phòng Hiệp hội
              </h3>
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-on-surface-variant uppercase text-[9px] tracking-wider">Địa chỉ Văn phòng</label>
                <textarea
                  className="border border-outline-variant/50 rounded-lg p-2.5 bg-surface text-xs outline-none focus:border-primary resize-y"
                  rows={3}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Nhập địa chỉ văn phòng..."
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-on-surface-variant uppercase text-[9px] tracking-wider">Điện thoại / Hotline</label>
                <input
                  className="h-9 border border-outline-variant/50 rounded-lg px-3 bg-surface text-xs outline-none focus:border-primary"
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Nhập số điện thoại..."
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-on-surface-variant uppercase text-[9px] tracking-wider">Email văn phòng</label>
                <input
                  className="h-9 border border-outline-variant/50 rounded-lg px-3 bg-surface text-xs outline-none focus:border-primary"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Nhập địa chỉ email..."
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-on-surface-variant uppercase text-[9px] tracking-wider">Thời gian làm việc</label>
                <textarea
                  className="border border-outline-variant/50 rounded-lg p-2.5 bg-surface text-xs outline-none focus:border-primary resize-y"
                  rows={2}
                  value={workingHours}
                  onChange={(e) => setWorkingHours(e.target.value)}
                  placeholder="Thứ 2 - Thứ 6: 08:00 - 17:00..."
                />
              </div>
            </div>
          </div>

        </div>

        {/* Footer Bottom Row */}
        <div className="bg-white p-5 rounded-xl border border-outline-variant/30 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-primary flex items-center gap-2 border-b border-outline-variant/20 pb-2 mb-2">
            <span className="material-symbols-outlined text-base">copyright</span>
            Dòng bản quyền & Đường dẫn chính sách (Copyright & Policies)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-on-surface-variant uppercase text-[9px] tracking-wider">Dòng chữ bản quyền (Copyright)</label>
              <input
                className="h-9 border border-outline-variant/50 rounded-lg px-3 bg-surface text-xs outline-none focus:border-primary"
                type="text"
                value={copyText}
                onChange={(e) => setCopyText(e.target.value)}
                placeholder="© 2025 HOBA..."
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-on-surface-variant uppercase text-[9px] tracking-wider">Điều khoản sử dụng (Path)</label>
              <input
                className="h-9 border border-outline-variant/50 rounded-lg px-3 bg-surface text-xs outline-none focus:border-primary"
                type="text"
                value={termsPath}
                onChange={(e) => setTermsPath(e.target.value)}
                placeholder="Mặc định: /dieu-khoan"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-on-surface-variant uppercase text-[9px] tracking-wider">Chính sách bảo mật (Path)</label>
              <input
                className="h-9 border border-outline-variant/50 rounded-lg px-3 bg-surface text-xs outline-none focus:border-primary"
                type="text"
                value={privacyPath}
                onChange={(e) => setPrivacyPath(e.target.value)}
                placeholder="Mặc định: /chinh-sach"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={loading}
            className="bg-secondary text-white px-8 py-3 rounded-lg font-bold hover:bg-[#93000d] shadow-md transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <span className="animate-spin inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full"></span>
                Đang lưu...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-sm">save</span>
                Lưu cấu hình Footer
              </>
            )}
          </button>
        </div>
      </form>

      {/* Live Preview Container */}
      <div className="mt-8 border border-outline-variant/30 rounded-xl overflow-hidden shadow-md">
        <div className="bg-surface-container-high px-5 py-2.5 border-b border-outline-variant/20 flex justify-between items-center">
          <h3 className="text-xs font-bold text-primary flex items-center gap-2 uppercase tracking-wider">
            <span className="material-symbols-outlined text-base">visibility</span>
            Giao diện Chân trang thực tế hiển thị trên Website (Live Preview)
          </h3>
          <span className="bg-secondary/15 text-secondary font-bold text-[8px] px-2 py-0.5 rounded-full uppercase tracking-wider">
            Cập nhật tức thời
          </span>
        </div>
        
        {/* Render actual dark footer style inside admin layout */}
        <div className="bg-[#00346f] text-white pt-12 pb-6 border-t border-white/10 text-left font-sans">
          <div className="max-w-[1200px] mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10 text-left">
              
              {/* Column 1 Preview */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center p-1 shadow-md">
                    {logoUrl ? (
                      <img 
                        alt="Logo Preview" 
                        className="w-full h-full object-contain" 
                        src={logoUrl} 
                        onError={(e) => { 
                          (e.target as HTMLImageElement).src = 'https://lh3.googleusercontent.com/aida-public/AB6AXuDGqQKdtsfpnEDKd7JAu8yQBX437NF9yre-G8AhC0L2jkhp6KVKASaL_r8TGZh_QRNtxoTKJXj2RXxkHdzbloP5qr9ddoI8OKoucsW0qAAsP4BTZGw_OuSxkWH_7yIFBmg6xnEcQ6TW4JHRFli25nYMjoLZ2HCRMhbnXTVG7sJKa0uboKFQS39PjtPXOEjGCHqrOCfHNMf3fKTvNlIsHiQw4bsKOCnLrOmA4gvrVMw8OI1QXoKnQvFoERk0EIu4ye4Mgt_9-lpAzjg'; 
                        }} 
                      />
                    ) : (
                      <span className="text-[10px] text-[#00346f] font-bold">HOBA</span>
                    )}
                  </div>
                  <div className="flex flex-col text-white">
                    <span className="text-sm font-bold tracking-tight">HOBA LPG</span>
                    <span className="text-[7px] opacity-70 uppercase tracking-widest leading-none mt-0.5">
                      HCMC LPG Business Association
                    </span>
                  </div>
                </div>
                <p className="text-[11px] opacity-75 leading-relaxed break-words">
                  {footerDesc || 'Chưa nhập mô tả...'}
                </p>
                <div className="flex gap-3">
                  {socialLinks.map((link, idx) => (
                    <a
                      key={idx}
                      className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-[#bb0013] transition-colors"
                      href={link.url || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={link.icon}
                    >
                      {renderSocialIcon(link.icon)}
                    </a>
                  ))}
                </div>
              </div>

              {/* Column 2 Preview */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider mb-4 relative pb-1.5 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-6 after:h-0.5 after:bg-[#bb0013]">
                  Liên kết nhanh
                </h4>
                <ul className="space-y-2 text-[11px] opacity-75">
                  {quickLinks.map((link, idx) => (
                    <li key={idx} className="hover:text-[#ffb4ab] transition-colors">
                      {link.label || 'Liên kết không có tên'}
                    </li>
                  ))}
                  {quickLinks.length === 0 && <li className="italic opacity-50">Không có liên kết</li>}
                </ul>
              </div>

              {/* Column 3 Preview */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider mb-4 relative pb-1.5 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-6 after:h-0.5 after:bg-[#bb0013]">
                  Chuyên mục
                </h4>
                <ul className="space-y-2 text-[11px] opacity-75">
                  {categories.map((cat, idx) => (
                    <li key={idx} className="hover:text-[#ffb4ab] transition-colors">
                      {cat.label || 'Chuyên mục không có tên'}
                    </li>
                  ))}
                  {categories.length === 0 && <li className="italic opacity-50">Không có chuyên mục</li>}
                </ul>
              </div>

              {/* Column 4 Preview */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider mb-4 relative pb-1.5 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-6 after:h-0.5 after:bg-[#bb0013]">
                  Văn phòng hiệp hội
                </h4>
                <ul className="space-y-3 text-[11px] opacity-75">
                  <li className="flex gap-2 items-start">
                    <span className="material-symbols-outlined text-[#ffb4ab] text-sm mt-0.5">location_on</span>
                    <span className="leading-tight">{address || 'Chưa có địa chỉ'}</span>
                  </li>
                  <li className="flex gap-2 items-center">
                    <span className="material-symbols-outlined text-[#ffb4ab] text-sm">call</span>
                    <span>{phone || 'Chưa có điện thoại'}</span>
                  </li>
                  <li className="flex gap-2 items-center">
                    <span className="material-symbols-outlined text-[#ffb4ab] text-sm">mail</span>
                    <span className="break-all">{email || 'Chưa có email'}</span>
                  </li>
                </ul>
              </div>

            </div>

            {/* Bottom copyright preview */}
            <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-2 text-center text-[10px] opacity-50">
              <p>{copyText || '© 2025 HOBA LPG'}</p>
              <div className="flex gap-4">
                <span className="hover:underline hover:text-white cursor-pointer">Điều khoản sử dụng</span>
                <span className="hover:underline hover:text-white cursor-pointer">Chính sách bảo mật</span>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Floating Toast Notification */}
      {showToast && (
        <div className="fixed bottom-8 right-8 bg-inverse-surface text-inverse-on-surface px-6 py-4 rounded-xl shadow-2xl flex items-center gap-4 z-[100] animate-bounce">
          <span className="material-symbols-outlined text-primary-fixed-dim">check_circle</span>
          <span className="text-xs font-bold">Cập nhật chân trang (Footer) thành công!</span>
        </div>
      )}
    </div>
  );
}
