'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface MenuItem {
  label: string;
  path: string;
  children?: MenuItem[];
}

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState<'general' | 'menu'>('general');
  const [loading, setLoading] = useState(true);
  const [logoUploading, setLogoUploading] = useState(false);
  const [faviconUploading, setFaviconUploading] = useState(false);
  const [config, setConfig] = useState({
    siteName: 'HOBA LPG - Hiệp hội Kinh doanh Khí hóa lỏng TP.HCM',
    logoTitle: 'HOBA LPG',
    logoSubtitle: 'HCMC LPG BUSINESS ASSOCIATION',
    contactEmail: 'info@hoba.vn',
    contactPhone: '028 3831 6671',
    address: '18A Cộng Hòa, P.12, Q. Tân Bình, TP.HCM',
    workingHours: 'Thứ 2 - Thứ 6: 08:00 - 17:00\nThứ 7: 08:00 - 12:00',
    mapEmbedUrl: '',
    maintenanceMode: false,
    registrationOpen: true,
    logoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDGqQKdtsfpnEDKd7JAu8yQBX437NF9yre-G8AhC0L2jkhp6KVKASaL_r8TGZh_QRNtxoTKJXj2RXxkHdzbloP5qr9ddoI8OKoucsW0qAAsP4BTZGw_OuSxkWH_7yIFBmg6xnEcQ6TW4JHRFli25nYMjoLZ2HCRMhbnXTVG7sJKa0uboKFQS39PjtPXOEjGCHqrOCfHNMf3fKTvNlIsHiQw4bsKOCnLrOmA4gvrVMw8OI1QXoKnQvFoERk0EIu4ye4Mgt_9-lpAzjg',
    faviconUrl: '/favicon.ico'
  });

  const [menuItems, setMenuItems] = useState<MenuItem[]>([
    { label: 'Trang chủ', path: '/' },
    { label: 'Giới thiệu', path: '/gioi-thieu' },
    { label: 'Hội viên', path: '/hoi-vien' },
    { label: 'Tin tức', path: '/tin-tuc' },
    { label: 'Sự kiện', path: '/su-kien' },
    { label: 'Văn bản', path: '/van-ban' },
    { label: 'Liên hệ', path: '/lien-he' },
  ]);

  const handleToggle = (field: 'maintenanceMode' | 'registrationOpen') => {
    setConfig(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleExportBackup = () => {
    const data: Record<string, string | null> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('hoba_') || key.startsWith('hoba_website_'))) {
        data[key] = localStorage.getItem(key);
      }
    }
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `hoba_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string);
          if (data && typeof data === 'object') {
            let count = 0;
            Object.keys(data).forEach((key) => {
              if (key.startsWith('hoba_') || key.startsWith('hoba_website_')) {
                localStorage.setItem(key, data[key]);
                count++;
              }
            });
            alert(`Nhập cấu hình thành công! Đã khôi phục ${count} danh mục cấu hình. Vui lòng F5 để áp dụng.`);
            window.location.reload();
          } else {
            alert('Tệp tin không đúng định dạng sao lưu cấu hình HOBA.');
          }
        } catch (err) {
          alert('Lỗi nhập cấu hình: ' + (err as Error).message);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setConfig(prev => ({ ...prev, [name]: value }));
  };

  // Image Upload Helper
  const uploadImage = async (file: File): Promise<string> => {
    if (!supabase) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
      });
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `site-assets/${fileName}`;

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

  const handleLogoUploadChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLogoUploading(true);
      try {
        const url = await uploadImage(e.target.files[0]);
        setConfig(prev => ({ ...prev, logoUrl: url }));
      } catch (err) {
        alert('Lỗi tải ảnh logo: ' + (err as Error).message);
      } finally {
        setLogoUploading(false);
      }
    }
  };

  const handleFaviconUploadChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFaviconUploading(true);
      try {
        const url = await uploadImage(e.target.files[0]);
        setConfig(prev => ({ ...prev, faviconUrl: url }));
      } catch (err) {
        alert('Lỗi tải ảnh favicon: ' + (err as Error).message);
      } finally {
        setFaviconUploading(false);
      }
    }
  };

  useEffect(() => {
    async function loadConfig() {
      if (!supabase) {
        const saved = localStorage.getItem('hoba_website_config_general');
        if (saved) {
          try {
            const val = JSON.parse(saved);
            setConfig(prev => ({ ...prev, ...val }));
            if (val.menuItems && Array.isArray(val.menuItems)) {
              setMenuItems(val.menuItems);
            }
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
          setConfig(prev => ({ ...prev, ...data.value }));
          if (data.value.menuItems && Array.isArray(data.value.menuItems)) {
            setMenuItems(data.value.menuItems);
          }
        }
      } catch (err) {
        console.error('Lỗi tải cấu hình hệ thống:', err);
      } finally {
        setLoading(false);
      }
    }
    loadConfig();
  }, []);

  // Menu Handlers
  const handleAddItem = () => {
    setMenuItems(prev => [...prev, { label: '', path: '', children: [] }]);
  };

  const handleItemChange = (index: number, key: 'label' | 'path', value: string) => {
    setMenuItems(prev => prev.map((item, idx) => idx === index ? { ...item, [key]: value } : item));
  };

  const handleDeleteItem = (index: number) => {
    if (menuItems.length === 1) {
      alert('Menu điều hướng phải có ít nhất 1 liên kết!');
      return;
    }
    setMenuItems(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleMoveItem = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === menuItems.length - 1) return;
    
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const newItems = [...menuItems];
    const temp = newItems[index];
    newItems[index] = newItems[targetIdx];
    newItems[targetIdx] = temp;
    setMenuItems(newItems);
  };

  const handleAddSubItem = (parentIndex: number) => {
    setMenuItems(prev => prev.map((item, idx) => {
      if (idx === parentIndex) {
        return {
          ...item,
          children: [...(item.children || []), { label: '', path: '' }]
        };
      }
      return item;
    }));
  };

  const handleSubItemChange = (parentIndex: number, childIndex: number, key: 'label' | 'path', value: string) => {
    setMenuItems(prev => prev.map((item, idx) => {
      if (idx === parentIndex) {
        const updatedChildren = (item.children || []).map((subItem, sIdx) =>
          sIdx === childIndex ? { ...subItem, [key]: value } : subItem
        );
        return { ...item, children: updatedChildren };
      }
      return item;
    }));
  };

  const handleDeleteSubItem = (parentIndex: number, childIndex: number) => {
    setMenuItems(prev => prev.map((item, idx) => {
      if (idx === parentIndex) {
        const updatedChildren = (item.children || []).filter((_, sIdx) => sIdx !== childIndex);
        return { ...item, children: updatedChildren };
      }
      return item;
    }));
  };

  const handleMoveSubItem = (parentIndex: number, childIndex: number, direction: 'up' | 'down') => {
    setMenuItems(prev => prev.map((item, idx) => {
      if (idx === parentIndex) {
        const children = [...(item.children || [])];
        if (direction === 'up' && childIndex === 0) return item;
        if (direction === 'down' && childIndex === children.length - 1) return item;

        const targetIdx = direction === 'up' ? childIndex - 1 : childIndex + 1;
        const temp = children[childIndex];
        children[childIndex] = children[targetIdx];
        children[targetIdx] = temp;

        return { ...item, children };
      }
      return item;
    }));
  };

  const handleQuickAdd = (label: string, path: string) => {
    if (menuItems.some(item => item.path === path)) return;
    setMenuItems(prev => [...prev, { label, path, children: [] }]);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    // Map and filter items cleanly, allowing empty path if it has children
    const validMenuItems = menuItems
      .map(item => {
        const hasChildren = item.children && item.children.length > 0;
        if (hasChildren) {
          const children = (item.children || []).filter(sub => sub.label.trim() !== '' && sub.path.trim() !== '');
          return { ...item, children };
        }
        return item;
      })
      .filter(item => {
        const hasChildren = item.children && item.children.length > 0;
        if (hasChildren) {
          return item.label.trim() !== '';
        }
        return item.label.trim() !== '' && item.path.trim() !== '';
      });

    if (validMenuItems.length === 0) {
      alert('Danh sách menu điều hướng không được bỏ trống hoặc điền thiếu!');
      return;
    }

    const payload = {
      ...config,
      menuItems: validMenuItems
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
          ...payload
        };

        const { error } = await supabase
          .from('website_config')
          .upsert({
            key: 'general',
            value: finalVal
          });
        if (error) throw error;
      } catch (err) {
        alert('Lỗi khi lưu cấu hình: ' + (err as Error).message);
        return;
      }
    } else {
      const saved = localStorage.getItem('hoba_website_config_general');
      const currentVal = saved ? JSON.parse(saved) : {};
      const finalVal = {
        ...currentVal,
        ...payload
      };
      localStorage.setItem('hoba_website_config_general', JSON.stringify(finalVal));
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('hoba_logo_updated'));
    }

    alert('Đã cập nhật cấu hình và danh sách menu thành công!');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-[#00346f] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-xs text-[#1c1c1a]">
      {/* Page Header */}
      <div className="border-b border-outline-variant/30 pb-4">
        <h2 className="text-lg md:text-xl font-black text-[#00346f]">Cấu hình Hệ thống</h2>
        <p className="text-on-surface-variant mt-1 text-[11px]">Quản lý cấu hình chung, tải lên Logo, thông tin liên hệ và thiết lập menu điều hướng.</p>
      </div>

      {/* Tabs Menu */}
      <div className="flex gap-2 p-1 bg-surface-container-low/60 rounded-lg w-fit border">
        <button
          type="button"
          onClick={() => setActiveTab('general')}
          className={`px-5 py-2 rounded-md font-bold text-xs transition-all flex items-center gap-1.5 ${
            activeTab === 'general'
              ? 'bg-[#00346f] text-white shadow-sm'
              : 'text-on-surface-variant hover:text-[#00346f] hover:bg-white/50'
          }`}
        >
          <span className="material-symbols-outlined text-sm">settings</span> Cấu hình chung
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('menu')}
          className={`px-5 py-2 rounded-md font-bold text-xs transition-all flex items-center gap-1.5 ${
            activeTab === 'menu'
              ? 'bg-[#00346f] text-white shadow-sm'
              : 'text-on-surface-variant hover:text-[#00346f] hover:bg-white/50'
          }`}
        >
          <span className="material-symbols-outlined text-sm">menu_open</span> Menu điều hướng
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6 max-w-2xl">
        {activeTab === 'general' && (
          <div className="space-y-6">
            {/* General Info Card */}
            <div className="bg-white p-6 rounded-xl border border-outline-variant/30 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-primary flex items-center gap-2 border-b border-outline-variant/20 pb-2 mb-2">
                <span className="material-symbols-outlined">settings_applications</span> Thông tin chung
              </h3>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase">Tiêu đề Website</label>
                <input
                  name="siteName"
                  value={config.siteName}
                  onChange={handleInputChange}
                  className="h-10 border border-outline-variant rounded-lg px-4 bg-surface text-xs text-on-surface outline-none focus:border-primary focus:ring-0"
                  type="text"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase">Chữ hiển thị chính bên Logo (Ví dụ: HOBA LPG)</label>
                  <input
                    name="logoTitle"
                    value={config.logoTitle || ''}
                    onChange={handleInputChange}
                    className="h-10 border border-outline-variant rounded-lg px-4 bg-surface text-xs text-on-surface outline-none focus:border-primary focus:ring-0"
                    type="text"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase">Chữ hiển thị phụ bên Logo (Ví dụ: HCMC LPG BUSINESS ASSOCIATION)</label>
                  <input
                    name="logoSubtitle"
                    value={config.logoSubtitle || ''}
                    onChange={handleInputChange}
                    className="h-10 border border-outline-variant rounded-lg px-4 bg-surface text-xs text-on-surface outline-none focus:border-primary focus:ring-0"
                    type="text"
                  />
                </div>
              </div>

              {/* Logo Uploader widget */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase">Logo Website (Ảnh màu)</label>
                <div className="flex items-center gap-4 bg-surface-container-low/30 p-3 rounded-lg border border-outline-variant/20">
                  <div className="w-16 h-16 rounded border border-outline-variant/30 bg-white flex items-center justify-center shrink-0">
                    {config.logoUrl ? (
                      <img src={config.logoUrl} alt="Logo Preview" className="w-full h-full object-contain p-1" />
                    ) : (
                      <span className="material-symbols-outlined text-outline text-lg">image</span>
                    )}
                  </div>
                  <div className="flex-grow flex flex-col gap-1.5">
                    <div className="flex gap-2">
                      <input
                        name="logoUrl"
                        value={config.logoUrl || ''}
                        onChange={handleInputChange}
                        className="flex-grow h-9 border border-outline-variant rounded px-3 bg-white text-[10px] outline-none focus:border-primary focus:ring-0"
                        placeholder="Dán URL ảnh hoặc chọn file tải lên..."
                        type="text"
                      />
                      <label className="h-9 px-4 bg-[#00346f] text-white text-[10px] font-bold rounded flex items-center justify-center gap-1 hover:bg-[#00346f]/90 cursor-pointer transition-colors active:scale-95">
                        <span className="material-symbols-outlined text-xs">cloud_upload</span>
                        {logoUploading ? 'Đang tải...' : 'Tải lên'}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleLogoUploadChange}
                          disabled={logoUploading}
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Favicon Uploader widget */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase">Favicon Website (Biểu tượng thanh địa chỉ)</label>
                <div className="flex items-center gap-4 bg-surface-container-low/30 p-3 rounded-lg border border-outline-variant/20">
                  <div className="w-16 h-16 rounded border border-outline-variant/30 bg-white flex items-center justify-center shrink-0">
                    {config.faviconUrl ? (
                      <img src={config.faviconUrl} alt="Favicon Preview" className="w-8 h-8 object-contain p-1" />
                    ) : (
                      <span className="material-symbols-outlined text-outline text-lg">image</span>
                    )}
                  </div>
                  <div className="flex-grow flex flex-col gap-1.5">
                    <div className="flex gap-2">
                      <input
                        name="faviconUrl"
                        value={config.faviconUrl || ''}
                        onChange={handleInputChange}
                        className="flex-grow h-9 border border-outline-variant rounded px-3 bg-white text-[10px] outline-none focus:border-primary focus:ring-0"
                        placeholder="Dán URL ảnh hoặc chọn file tải lên..."
                        type="text"
                      />
                      <label className="h-9 px-4 bg-[#00346f] text-white text-[10px] font-bold rounded flex items-center justify-center gap-1 hover:bg-[#00346f]/90 cursor-pointer transition-colors active:scale-95">
                        <span className="material-symbols-outlined text-xs">cloud_upload</span>
                        {faviconUploading ? 'Đang tải...' : 'Tải lên'}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleFaviconUploadChange}
                          disabled={faviconUploading}
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase">Email liên hệ</label>
                  <input
                    name="contactEmail"
                    value={config.contactEmail}
                    onChange={handleInputChange}
                    className="h-10 border border-outline-variant rounded-lg px-4 bg-surface text-xs text-on-surface outline-none focus:border-primary focus:ring-0"
                    type="email"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase">Hotline liên hệ</label>
                  <input
                    name="contactPhone"
                    value={config.contactPhone}
                    onChange={handleInputChange}
                    className="h-10 border border-outline-variant rounded-lg px-4 bg-surface text-xs text-on-surface outline-none focus:border-primary focus:ring-0"
                    type="text"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase">Địa chỉ văn phòng</label>
                <input
                  name="address"
                  value={config.address}
                  onChange={handleInputChange}
                  className="h-10 border border-outline-variant rounded-lg px-4 bg-surface text-xs text-on-surface outline-none focus:border-primary focus:ring-0"
                  type="text"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase">Thời gian làm việc</label>
                <textarea
                  name="workingHours"
                  value={config.workingHours}
                  onChange={handleInputChange}
                  rows={2}
                  className="border border-outline-variant rounded-lg p-3 bg-surface text-xs text-on-surface outline-none focus:border-primary focus:ring-0 resize-y"
                  placeholder="VD: Thứ 2 - Thứ 6: 08:00 - 17:00&#10;Thứ 7: 08:00 - 12:00"
                />
              </div>
              <div className="flex flex-col gap-1.5 bg-surface-container-low p-4 rounded-xl border border-outline-variant/30">
                <label className="text-[10px] font-bold text-[#00346f] uppercase">Link nhúng bản đồ Google Maps (Tùy chọn)</label>
                <input
                  name="mapEmbedUrl"
                  value={config.mapEmbedUrl || ''}
                  onChange={handleInputChange}
                  className="h-10 border border-outline-variant rounded-lg px-4 bg-white text-xs text-on-surface outline-none focus:border-primary focus:ring-0"
                  type="text"
                  placeholder="VD: https://www.google.com/maps/embed?pb=..."
                />
                <span className="text-[9px] text-on-surface-variant mt-1 block leading-relaxed">
                  Mặc định hệ thống tự định vị theo trường Địa chỉ ở trên. Bạn có thể dán mã nhúng <code>&lt;iframe&gt;</code> từ Google Maps vào đây để ghi đè.
                </span>
              </div>
            </div>

            {/* Feature Toggles Card */}
            <div className="bg-white p-6 rounded-xl border border-outline-variant/30 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-primary flex items-center gap-2 border-b border-outline-variant/20 pb-2 mb-2">
                <span className="material-symbols-outlined">toggle_on</span> Trạng thái hoạt động
              </h3>
              <div className="flex items-center justify-between p-3 bg-surface-container-low rounded-lg">
                <div>
                  <h4 className="text-xs font-bold text-[#00346f]">Mở đăng ký hội viên trực tuyến</h4>
                  <p className="text-[10px] text-on-surface-variant mt-0.5">Cho phép doanh nghiệp nộp hồ sơ đăng ký qua website.</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggle('registrationOpen')}
                  className={`w-12 h-6 rounded-full p-1 transition-colors ${config.registrationOpen ? 'bg-[#00346f]' : 'bg-gray-300'}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full transition-transform ${config.registrationOpen ? 'translate-x-6' : ''}`}></div>
                </button>
              </div>
              <div className="flex items-center justify-between p-3 bg-surface-container-low rounded-lg">
                <div>
                  <h4 className="text-xs font-bold text-[#00346f]">Chế độ bảo trì hệ thống</h4>
                  <p className="text-[10px] text-on-surface-variant mt-0.5">Chuyển website sang chế độ bảo trì, khóa các chức năng công khai.</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggle('maintenanceMode')}
                  className={`w-12 h-6 rounded-full p-1 transition-colors ${config.maintenanceMode ? 'bg-[#00346f]' : 'bg-gray-300'}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full transition-transform ${config.maintenanceMode ? 'translate-x-6' : ''}`}></div>
                </button>
              </div>
            </div>

            {/* Backup & Restore Card */}
            <div className="bg-white p-6 rounded-xl border border-outline-variant/30 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-primary flex items-center gap-2 border-b border-outline-variant/20 pb-2 mb-2">
                <span className="material-symbols-outlined">backup</span> Sao lưu & Khôi phục (Chế độ Offline)
              </h3>
              <p className="text-[10px] text-on-surface-variant leading-relaxed">
                Khi sử dụng chế độ Offline (không kết nối Supabase), tất cả dữ liệu, cấu hình giao diện, logo và hội viên được lưu trữ trong trình duyệt (Local Storage) của bạn. 
                Sử dụng chức năng này để chuyển dữ liệu từ máy của bạn (Localhost) lên trang web trực tuyến (Vercel) hoặc sao lưu dự phòng.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleExportBackup}
                  className="flex-grow bg-[#00346f] text-white py-2.5 px-4 rounded-lg font-bold hover:bg-[#00346f]/90 transition-colors flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">download</span> Xuất File Sao Lưu
                </button>
                <label className="flex-grow bg-white border border-outline-variant/50 hover:bg-surface-container-low text-on-surface py-2.5 px-4 rounded-lg font-bold transition-colors flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer text-center select-none text-xs">
                  <span className="material-symbols-outlined text-sm">upload</span> Nhập File Sao Lưu
                  <input
                    type="file"
                    accept=".json"
                    className="hidden"
                    onChange={handleImportBackup}
                  />
                </label>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'menu' && (
          <div className="bg-white p-6 rounded-xl border border-outline-variant/30 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-outline-variant/20 pb-2 mb-2">
              <h3 className="text-sm font-bold text-primary flex items-center gap-2">
                <span className="material-symbols-outlined">menu_open</span> Danh sách liên kết điều hướng
              </h3>
              <button
                type="button"
                onClick={handleAddItem}
                className="bg-[#00346f] text-white text-[10px] px-3 py-1.5 rounded-lg hover:bg-[#00346f]/90 flex items-center gap-1 font-bold active:scale-95 transition-transform"
              >
                <span className="material-symbols-outlined text-[12px]">add</span> Thêm mục menu
              </button>
            </div>

            <div className="space-y-3">
              {menuItems.map((item, idx) => (
                <div key={idx} className="space-y-3 border border-outline-variant/30 rounded-lg p-3 bg-surface-container-low/30 hover:bg-surface-container-low/60 transition-colors">
                  <div className="flex flex-col sm:flex-row gap-3 items-center">
                    <div className="flex-grow flex gap-3 w-full">
                      <div className="flex-1 flex flex-col gap-1">
                        <span className="text-[9px] font-bold text-on-surface-variant uppercase">Tên hiển thị (Label)</span>
                        <input
                          value={item.label}
                          onChange={(e) => handleItemChange(idx, 'label', e.target.value)}
                          className="h-8 border border-outline-variant rounded px-2.5 bg-white text-xs outline-none focus:border-primary w-full font-bold"
                          type="text"
                          placeholder="Trang chủ"
                        />
                      </div>
                      <div className="flex-[2] flex flex-col gap-1">
                        <span className="text-[9px] font-bold text-on-surface-variant uppercase">
                          Đường dẫn / URL (Path) {item.children && item.children.length > 0 && <span className="text-gray-400 font-normal">(Bỏ qua nếu có menu con)</span>}
                        </span>
                        <input
                          value={item.path}
                          onChange={(e) => handleItemChange(idx, 'path', e.target.value)}
                          className="h-8 border border-outline-variant rounded px-2.5 bg-white text-xs outline-none focus:border-primary w-full"
                          type="text"
                          placeholder="VD: /gioi-thieu hoặc #"
                        />
                      </div>
                    </div>
                    {/* Action controls */}
                    <div className="flex gap-1.5 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() => handleAddSubItem(idx)}
                        className="h-8 px-3 rounded border border-outline-variant bg-white text-[#00346f] hover:bg-[#00346f] hover:text-white flex items-center gap-1 font-bold text-[10px] transition-colors"
                        title="Thêm liên kết con"
                      >
                        <span className="material-symbols-outlined text-sm">add_link</span>
                        Con
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveItem(idx, 'up')}
                        disabled={idx === 0}
                        className="w-8 h-8 rounded border border-outline-variant flex items-center justify-center text-on-surface hover:bg-white hover:text-primary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Di chuyển lên"
                      >
                        <span className="material-symbols-outlined text-base">arrow_upward</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveItem(idx, 'down')}
                        disabled={idx === menuItems.length - 1}
                        className="w-8 h-8 rounded border border-outline-variant flex items-center justify-center text-on-surface hover:bg-white hover:text-primary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Di chuyển xuống"
                      >
                        <span className="material-symbols-outlined text-base">arrow_downward</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteItem(idx)}
                        className="w-8 h-8 rounded border border-red-200 text-[#bb0013] hover:bg-red-50 flex items-center justify-center transition-colors"
                        title="Xóa"
                      >
                        <span className="material-symbols-outlined text-base">delete</span>
                      </button>
                    </div>
                  </div>

                  {/* Render children sub-items */}
                  {item.children && item.children.length > 0 && (
                    <div className="pl-6 border-l-2 border-outline-variant/40 space-y-2 mt-2 bg-surface-container-low/20 p-2 rounded-r-lg">
                      <div className="text-[9px] font-bold text-[#00346f] uppercase mb-1">Các liên kết con (Dropdown Items)</div>
                      {item.children.map((subItem, sIdx) => (
                        <div key={sIdx} className="flex flex-col sm:flex-row gap-2 items-center bg-white p-2 rounded border border-outline-variant/20 shadow-sm">
                          <div className="flex-grow flex gap-2 w-full">
                            <div className="flex-1 flex flex-col gap-1">
                              <span className="text-[8px] font-bold text-gray-500 uppercase">Tên hiển thị</span>
                              <input
                                value={subItem.label}
                                onChange={(e) => handleSubItemChange(idx, sIdx, 'label', e.target.value)}
                                className="h-7 border border-outline-variant rounded px-2 bg-white text-[11px] outline-none w-full"
                                type="text"
                                placeholder="VD: Sơ đồ tổ chức"
                              />
                            </div>
                            <div className="flex-[2] flex flex-col gap-1">
                              <span className="text-[8px] font-bold text-gray-500 uppercase">Đường dẫn / URL</span>
                              <input
                                value={subItem.path}
                                onChange={(e) => handleSubItemChange(idx, sIdx, 'path', e.target.value)}
                                className="h-7 border border-outline-variant rounded px-2 bg-white text-[11px] outline-none w-full"
                                type="text"
                                placeholder="VD: /gioi-thieu#co-cau"
                              />
                            </div>
                          </div>
                          <div className="flex gap-1 self-end sm:self-center">
                            <button
                              type="button"
                              onClick={() => handleMoveSubItem(idx, sIdx, 'up')}
                              disabled={sIdx === 0}
                              className="w-7 h-7 rounded border border-outline-variant/50 flex items-center justify-center text-on-surface hover:bg-gray-50 disabled:opacity-30"
                              title="Lên"
                            >
                              <span className="material-symbols-outlined text-xs">arrow_upward</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveSubItem(idx, sIdx, 'down')}
                              disabled={sIdx === (item.children?.length || 0) - 1}
                              className="w-7 h-7 rounded border border-outline-variant/50 flex items-center justify-center text-on-surface hover:bg-gray-50 disabled:opacity-30"
                              title="Xuống"
                            >
                              <span className="material-symbols-outlined text-xs">arrow_downward</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteSubItem(idx, sIdx)}
                              className="w-7 h-7 rounded border border-red-200 text-[#bb0013] hover:bg-red-50 flex items-center justify-center"
                              title="Xóa con"
                            >
                              <span className="material-symbols-outlined text-xs">delete</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Quick helper for predefined pages */}
            <div className="bg-[#fcf9f5] p-4 rounded-lg border border-outline-variant/30 space-y-2 mt-4">
              <h4 className="text-[9px] font-bold text-[#00346f] uppercase">Gợi ý liên kết nhanh</h4>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: 'Trang chủ', path: '/' },
                  { label: 'Giới thiệu', path: '/gioi-thieu' },
                  { label: 'Hội viên', path: '/hoi-vien' },
                  { label: 'Tin tức', path: '/tin-tuc' },
                  { label: 'Sự kiện', path: '/su-kien' },
                  { label: 'Văn bản', path: '/van-ban' },
                  { label: 'Liên hệ', path: '/lien-he' }
                ].map((item, index) => {
                  const exists = menuItems.some(existing => existing.path === item.path);
                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleQuickAdd(item.label, item.path)}
                      disabled={exists}
                      className={`text-[9px] font-bold px-3 py-1.5 rounded transition-colors ${
                        exists ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed' : 'bg-white border hover:border-[#00346f] hover:text-[#00346f]'
                      }`}
                    >
                      + {item.label} {exists && '(Đã có)'}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Save configuration button */}
        <div className="flex justify-end pt-4 border-t border-outline-variant/20">
          <button
            type="submit"
            className="bg-[#bb0013] hover:bg-[#93000d] text-white text-xs px-8 py-3 rounded-lg font-bold shadow-md transition-all active:scale-95 flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">save</span> Lưu cấu hình
          </button>
        </div>
      </form>
    </div>
  );
}
