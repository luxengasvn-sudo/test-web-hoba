'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface HeaderMenuItem {
  label: string;
  path: string;
  children?: HeaderMenuItem[];
}

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const pathname = usePathname();
  
  const [navItems, setNavItems] = useState<HeaderMenuItem[]>([
    { label: 'Trang chủ', path: '/', children: [] },
    {
      label: 'Giới thiệu',
      path: '/gioi-thieu',
      children: [
        { label: 'Giới thiệu chung', path: '/gioi-thieu' },
        { label: 'Sơ đồ tổ chức', path: '/gioi-thieu#co-cau' },
        { label: 'Ban Chấp hành', path: '/ban-chap-hanh' },
        { label: 'Ban Thường vụ', path: '/ban-thuong-vu' },
        { label: 'Ban Kiểm tra', path: '/ban-kiem-tra' }
      ]
    },
    {
      label: 'Hội viên',
      path: '/hoi-vien',
      children: [
        { label: 'Danh sách Hội viên', path: '/hoi-vien' },
        { label: 'Danh sách Chi hội', path: '/chi-hoi' },
        { label: 'Đăng ký Hội viên', path: '/dang-ky' }
      ]
    },
    { label: 'Tin tức', path: '/tin-tuc', children: [] },
    { label: 'Sự kiện', path: '/su-kien', children: [] },
    { label: 'Văn bản', path: '/van-ban', children: [] },
    { label: 'Liên hệ', path: '/lien-he', children: [] },
  ]);
  const [logoUrl, setLogoUrl] = useState('https://lh3.googleusercontent.com/aida-public/AB6AXuDGqQKdtsfpnEDKd7JAu8yQBX437NF9yre-G8AhC0L2jkhp6KVKASaL_r8TGZh_QRNtxoTKJXj2RXxkHdzbloP5qr9ddoI8OKoucsW0qAAsP4BTZGw_OuSxkWH_7yIFBmg6xnEcQ6TW4JHRFli25nYMjoLZ2HCRMhbnXTVG7sJKa0uboKFQS39PjtPXOEjGCHqrOCfHNMf3fKTvNlIsHiQw4bsKOCnLrOmA4gvrVMw8OI1QXoKnQvFoERk0EIu4ye4Mgt_9-lpAzjg');
  const [logoTitle, setLogoTitle] = useState('HOBA LPG');
  const [logoSubtitle, setLogoSubtitle] = useState('HCMC LPG Business Association');
  const [contactEmail, setContactEmail] = useState('info@hoba.vn');
  const [contactPhone, setContactPhone] = useState('028 3831 6671');

  // Safeguard: Redirect if the server served the public layout for an admin path
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (path === '/admin' || path.startsWith('/admin/')) {
        let target = path;
        if (target.endsWith('/')) {
          target = target + 'index.html';
        } else if (!target.endsWith('index.html')) {
          target = target + '/index.html';
        }
        window.location.replace(target + window.location.search + window.location.hash);
      }
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    async function loadMenu() {
      if (!supabase) {
        const saved = localStorage.getItem('hoba_website_config_general');
        if (saved) {
          try {
            const val = JSON.parse(saved);
            if (val.menuItems && Array.isArray(val.menuItems) && val.menuItems.length > 0) {
              setNavItems(val.menuItems);
            }
            if (val.logoUrl) {
              setLogoUrl(val.logoUrl);
            }
            if (val.logoTitle) {
              setLogoTitle(val.logoTitle);
            }
            if (val.logoSubtitle) {
              setLogoSubtitle(val.logoSubtitle);
            }
            if (val.contactEmail) {
              setContactEmail(val.contactEmail);
            }
            if (val.contactPhone) {
              setContactPhone(val.contactPhone);
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
          if (data.value.menuItems && Array.isArray(data.value.menuItems) && data.value.menuItems.length > 0) {
            setNavItems(data.value.menuItems);
          }
          if (data.value.logoUrl) {
            setLogoUrl(data.value.logoUrl);
          }
          if (data.value.logoTitle) {
            setLogoTitle(data.value.logoTitle);
          }
          if (data.value.logoSubtitle) {
            setLogoSubtitle(data.value.logoSubtitle);
          }
          if (data.value.contactEmail) {
            setContactEmail(data.value.contactEmail);
          }
          if (data.value.contactPhone) {
            setContactPhone(data.value.contactPhone);
          }
        }
      } catch (err) {
        console.error('Lỗi khi tải menu điều hướng:', err);
      }
    }
    loadMenu();
  }, []);

  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(path);
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 h-20 flex items-center transition-all duration-300 ${
          isScrolled
            ? 'bg-primary/95 backdrop-blur-md shadow-md text-white'
            : pathname === '/'
            ? 'bg-transparent text-white'
            : 'bg-primary text-white border-b border-white/10'
        }`}
      >
        <div className="max-w-container-max mx-auto w-full px-margin-mobile md:px-gutter flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center p-1 shadow-lg transform group-hover:scale-105 transition-all">
                <img
                  alt="HOBA LPG Logo"
                  className="w-full h-full object-contain"
                  src={logoUrl}
                />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold tracking-tight">{logoTitle}</span>
                {logoSubtitle && (
                  <span className="text-[8px] opacity-70 uppercase tracking-widest hidden md:block">
                    {logoSubtitle}
                  </span>
                )}
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden xl:flex items-center gap-6 h-full">
            {navItems.map((item) => {
              const hasChildren = item.children && item.children.length > 0;
              if (hasChildren) {
                return (
                  <div key={item.label} className="relative group flex items-center h-full cursor-pointer py-1">
                    <button
                      type="button"
                      className="flex items-center gap-0.5 transition-colors font-semibold text-xs uppercase tracking-wide border-b-2 border-transparent text-white/80 group-hover:text-secondary-fixed-dim"
                    >
                      {item.label}
                      <span className="material-symbols-outlined text-[14px] transition-transform group-hover:rotate-180">expand_more</span>
                    </button>
                    {/* Dropdown panel */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-0 w-52 bg-[#00244f] border border-white/10 rounded-lg shadow-xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                      {item.children?.map((subItem) => (
                        <Link
                          key={subItem.path}
                          href={subItem.path}
                          className="block px-4 py-2.5 text-xs font-semibold text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                        >
                          {subItem.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              }
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`transition-colors font-semibold text-xs uppercase tracking-wide py-1 border-b-2 hover:text-secondary-fixed-dim ${
                    isActive(item.path)
                      ? 'border-secondary-container text-white'
                      : 'border-transparent text-white/80'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Quick Contact & Action */}
          <div className="flex items-center gap-3">
            <div className="hidden lg:flex flex-col text-right mr-3 border-r border-white/20 pr-3">
              <a
                className="text-white hover:text-secondary-fixed-dim text-[11px] font-bold transition-all flex items-center justify-end gap-1"
                href={`tel:${contactPhone.replace(/\s+/g, '')}`}
              >
                <span className="material-symbols-outlined text-xs">call</span> {contactPhone}
              </a>
              <span className="text-white/60 text-[9px]">{contactEmail}</span>
            </div>
            <Link
              href="/dang-ky"
              className="bg-secondary hover:bg-white hover:text-primary text-white px-5 py-2.5 rounded-full font-bold text-xs shadow-xl transition-all active:scale-95 duration-200 uppercase tracking-wider"
            >
              Gia nhập ngay
            </Link>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="xl:hidden text-white p-2 flex items-center justify-center"
              aria-label="Toggle Mobile Menu"
            >
              <span className="material-symbols-outlined text-2xl">
                {isMobileMenuOpen ? 'close' : 'menu'}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Sidebar */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 xl:hidden flex">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/60 transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          {/* Menu Drawer */}
          <div className="relative w-80 max-w-sm bg-primary text-white h-full flex flex-col p-6 shadow-2xl z-10 transition-transform">
            <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white rounded flex items-center justify-center p-1">
                  <img
                    alt="Logo"
                    className="w-full h-full object-contain"
                    src={logoUrl}
                  />
                </div>
                <span className="font-bold text-lg">HOBA LPG</span>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-white/80 hover:text-white"
              >
                <span className="material-symbols-outlined text-2xl">close</span>
              </button>
            </div>

            <nav className="flex flex-col gap-2.5 flex-1 overflow-y-auto no-scrollbar">
              {navItems.map((item) => {
                const hasChildren = item.children && item.children.length > 0;
                const isExpanded = expandedItems.includes(item.label);
                
                const toggleExpand = () => {
                  setExpandedItems(prev =>
                    isExpanded
                      ? prev.filter(label => label !== item.label)
                      : [...prev, item.label]
                  );
                };

                if (hasChildren) {
                  return (
                    <div key={item.label} className="flex flex-col">
                      <button
                        type="button"
                        onClick={toggleExpand}
                        className="flex items-center justify-between text-base font-medium py-2.5 px-3 rounded-lg hover:bg-white/10 text-white/80 w-full text-left"
                      >
                        <span>{item.label}</span>
                        <span className={`material-symbols-outlined transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>expand_more</span>
                      </button>
                      {isExpanded && (
                        <div className="pl-4 flex flex-col gap-2.5 mt-1.5 border-l border-white/10 ml-3.5">
                          {item.children?.map((subItem) => (
                            <Link
                              key={subItem.path}
                              href={subItem.path}
                              onClick={() => setIsMobileMenuOpen(false)}
                              className={`text-sm font-medium py-2 px-3 rounded-md transition-colors ${
                                isActive(subItem.path)
                                  ? 'bg-secondary text-white font-bold'
                                  : 'hover:bg-white/5 text-white/70'
                              }`}
                            >
                              {subItem.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`text-base font-medium py-2.5 px-3 rounded-lg transition-colors ${
                      isActive(item.path)
                        ? 'bg-secondary text-white font-bold'
                        : 'hover:bg-white/10 text-white/80'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="border-t border-white/10 pt-4 space-y-3">
              <div className="flex items-center gap-2 text-xs text-white/70">
                <span className="material-symbols-outlined text-sm">call</span>
                <span>Hotline: {contactPhone}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-white/70">
                <span className="material-symbols-outlined text-sm">mail</span>
                <span>Email: {contactEmail}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
