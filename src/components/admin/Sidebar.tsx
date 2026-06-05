'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function Sidebar() {
  const pathname = usePathname();
  const [logoUrl, setLogoUrl] = useState('https://lh3.googleusercontent.com/aida-fixed/AB6AXuDGqQKdtsfpnEDKd7JAu8yQBX437NF9yre-G8AhC0L2jkhp6KVKASaL_r8TGZh_QRNtxoTKJXj2RXxkHdzbloP5qr9ddoI8OKoucsW0qAAsP4BTZGw_OuSxkWH_7yIFBmg6xnEcQ6TW4JHRFli25nYMjoLZ2HCRMhbnXTVG7sJKa0uboKFQS39PjtPXOEjGCHqrOCfHNMf3fKTvNlIsHiQw4bsKOCnLrOmA4gvrVMw8OI1QXoKnQvFoERk0EIu4ye4Mgt_9-lpAzjg');
  const [logoTitle, setLogoTitle] = useState('HOBA LPG');
  const [userRole, setUserRole] = useState<'super_admin' | 'editor'>('editor');

  useEffect(() => {
    // Read session to set user role
    const sessionStr = localStorage.getItem('hoba_admin_session');
    if (sessionStr) {
      try {
        if (sessionStr === 'true') {
          setUserRole('super_admin');
        } else {
          const session = JSON.parse(sessionStr);
          if (session && typeof session === 'object' && session.role) {
            setUserRole(session.role);
          } else {
            setUserRole('super_admin'); // default safety
          }
        }
      } catch (e) {
        setUserRole('super_admin');
      }
    } else {
      // Default to super_admin if no session is set (it will be caught by guard anyway)
      setUserRole('super_admin');
    }


    async function loadLogo() {
      if (!supabase) {
        const saved = localStorage.getItem('hoba_website_config_general');
        if (saved) {
          try {
            const val = JSON.parse(saved);
            if (val.logoUrl) {
              setLogoUrl(val.logoUrl);
            }
            if (val.logoTitle) {
              setLogoTitle(val.logoTitle);
            }
          } catch (e) {}
        }
        return;
      }

      try {
        const { data, error } = await supabase
          .from('website_config')
          .select('value')
          .eq('key', 'general')
          .single();

        if (!error && data?.value) {
          if (data.value.logoUrl) {
            setLogoUrl(data.value.logoUrl);
          }
          if (data.value.logoTitle) {
            setLogoTitle(data.value.logoTitle);
          }
        }
      } catch (err) {
        console.error('Lỗi khi tải logo trong Sidebar:', err);
      }
    }
    loadLogo();

    // Listen for storage events (offline mode synchronization)
    const handleStorageChange = () => {
      const saved = localStorage.getItem('hoba_website_config_general');
      if (saved) {
        try {
          const val = JSON.parse(saved);
          if (val.logoUrl) {
            setLogoUrl(val.logoUrl);
          }
          if (val.logoTitle) {
            setLogoTitle(val.logoTitle);
          }
        } catch (e) {}
      }
    };
    window.addEventListener('storage', handleStorageChange);
    
    // Custom event to update instantly across components on the same page
    window.addEventListener('hoba_logo_updated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('hoba_logo_updated', handleStorageChange);
    };
  }, []);

  const primaryNav = [
    { label: 'Dashboard', path: '/admin/', icon: 'dashboard' },
    { label: 'Hội viên (Danh sách)', path: '/admin/hoi-vien/', icon: 'group' },
    { label: 'Văn bản pháp lý', path: '/admin/van-ban/', icon: 'description' },
    { label: 'Tin tức & Bài viết', path: '/admin/tin-tuc/', icon: 'newspaper' },
    ...(userRole === 'super_admin' ? [
      { label: 'Trang độc lập', path: '/admin/trang-tuy-chinh/', icon: 'pages' },
      { label: 'Quản lý Tài khoản', path: '/admin/tai-khoan/', icon: 'manage_accounts' },
      { label: 'Cấu hình Website', path: '/admin/cau-hinh/', icon: 'settings' }
    ] : [])
  ];

  const contentNav = [
    ...(userRole === 'super_admin' ? [
      { label: 'Quản lý Trang chủ', path: '/admin/trang-chu/', icon: 'view_carousel' },
      { label: 'Quản lý Giới thiệu', path: '/admin/trang-gioi-thieu/', icon: 'info' },
      { label: 'Hội viên tiêu biểu', path: '/admin/hoi-vien-tieu-bieu/', icon: 'star' },
      { label: 'Ban lãnh đạo Hiệp hội', path: '/admin/ban-lanh-dao/', icon: 'diversity_3' },
      { label: 'Thiết kế Trang Hội viên', path: '/admin/trang-hoi-vien/', icon: 'person_search' },
      { label: 'Quản lý Đăng ký', path: '/admin/trang-dang-ky/', icon: 'app_registration' }
    ] : [
      { label: 'Quản lý Chi hội', path: '/admin/trang-hoi-vien/', icon: 'hub' }
    ]),
    { label: 'Quản lý Sự kiện', path: '/admin/su-kien/', icon: 'event' },
    ...(userRole === 'super_admin' ? [
      { label: 'Quản lý Thư viện', path: '/admin/thu-vien/', icon: 'photo_library' },
      { label: 'Quản lý Footer', path: '/admin/footer/', icon: 'bottom_navigation' }
    ] : []),
    { label: 'Quản lý Liên hệ', path: '/admin/lien-he/', icon: 'contact_mail' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('hoba_admin_session');
    window.location.reload();
  };

  const isActive = (path: string) => {
    const cleanPath = path.replace('/index.html', '');
    const cleanPathname = pathname.replace('/index.html', '');
    if (cleanPath === '/admin') {
      return cleanPathname === '/admin';
    }
    return cleanPathname.startsWith(cleanPath);
  };

  return (
    <aside className="h-screen w-64 fixed left-0 top-0 bg-primary text-white flex flex-col py-6 shadow-sm z-50 overflow-y-auto no-scrollbar">
      {/* Brand Header */}
      <div className="px-6 mb-8">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-white rounded flex items-center justify-center p-1">
            <img
              alt="Logo"
              className="w-full h-full object-contain animate-fade-in"
              src={logoUrl}
            />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-base leading-none">{logoTitle}</span>
            <span className="text-[8px] opacity-70 mt-1">Admin Portal</span>
          </div>
        </Link>
      </div>

      {/* Main Stats/Directories group */}
      <div className="flex flex-col gap-1 px-3">
        {primaryNav.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className={`rounded-lg px-4 py-2.5 flex items-center gap-3 transition-all ${
              isActive(item.path)
                ? 'bg-tertiary text-on-tertiary font-bold shadow-sm'
                : 'text-white/80 hover:bg-white/10'
            }`}
          >
            <span className="material-symbols-outlined text-lg">{item.icon}</span>
            <span className="text-xs font-semibold">{item.label}</span>
          </Link>
        ))}
      </div>

      {/* Page Content Manager Group */}
      <div className="mt-6 flex flex-col gap-1 px-3">
        <h3 className="text-[9px] font-bold text-white/40 uppercase tracking-widest px-4 mb-2">Quản lý giao diện</h3>
        {contentNav.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className={`rounded-lg px-4 py-2.5 flex items-center gap-3 transition-all ${
              isActive(item.path)
                ? 'bg-tertiary text-on-tertiary font-bold shadow-sm'
                : 'text-white/80 hover:bg-white/10'
            }`}
          >
            <span className="material-symbols-outlined text-lg">{item.icon}</span>
            <span className="text-xs font-semibold">{item.label}</span>
          </Link>
        ))}
      </div>

      {/* Sticky footer buttons */}
      <div className="mt-auto pt-6 px-3 border-t border-white/10 flex flex-col gap-1">
        <Link
          href="/"
          className="text-white/80 hover:bg-white/10 rounded-lg px-4 py-2 flex items-center gap-3 transition-colors text-xs font-semibold"
        >
          <span className="material-symbols-outlined text-lg">open_in_new</span>
          <span>Xem Website</span>
        </Link>
        <button
          onClick={handleLogout}
          className="text-red-200/80 hover:bg-red-500/10 rounded-lg px-4 py-2 flex items-center gap-3 transition-colors text-xs font-semibold cursor-pointer w-full text-left"
        >
          <span className="material-symbols-outlined text-lg text-red-400">logout</span>
          <span className="text-red-200">Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
}

