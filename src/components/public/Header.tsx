'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface HeaderMenuItem {
  label: string;
  path: string;
  children?: HeaderMenuItem[];
}

function ensureLpgSubmenu(items: HeaderMenuItem[]): HeaderMenuItem[] {
  return items.map((item) => {
    if (item.path === '/tin-tuc' || item.label === 'Tin tức') {
      const existingChildren = item.children || [];
      const hasLpg = existingChildren.some((c) => c.path === '/gia-cp-lpg');
      if (!hasLpg) {
        const children = existingChildren.length > 0
          ? [...existingChildren]
          : [{ label: 'Tin tức & Hoạt động', path: '/tin-tuc' }];
        children.push({ label: 'Giá CP LPG Saudi Aramco', path: '/gia-cp-lpg' });
        return {
          ...item,
          children,
        };
      }
    }
    return item;
  });
}

export default function Header({
  initialConfig,
  initialLpgCpEnabled = false,
}: {
  initialConfig?: any;
  initialLpgCpEnabled?: boolean;
}) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const pathname = usePathname();
  
  const [navItems, setNavItems] = useState<HeaderMenuItem[]>(() => {
    if (initialConfig?.menuItems && Array.isArray(initialConfig.menuItems) && initialConfig.menuItems.length > 0) {
      return ensureLpgSubmenu(initialConfig.menuItems);
    }
    return [
      { label: 'Trang chủ', path: '/', children: [] },
      {
        label: 'Giới thiệu',
        path: '/gioi-thieu',
        children: [
          { label: 'Giới thiệu chung', path: '/gioi-thieu' },
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
      {
        label: 'Tin tức',
        path: '/tin-tuc',
        children: [
          { label: 'Tin tức & Hoạt động', path: '/tin-tuc' },
          { label: 'Giá CP LPG Saudi Aramco', path: '/gia-cp-lpg' }
        ]
      },
      { label: 'Sự kiện', path: '/su-kien', children: [] },
      { label: 'Văn bản', path: '/van-ban', children: [] },
      { label: 'Liên hệ', path: '/lien-he', children: [] },
    ];
  });
  const [logoUrl, setLogoUrl] = useState(() => initialConfig?.logoUrl || 'https://lh3.googleusercontent.com/aida-public/AB6AXuDGqQKdtsfpnEDKd7JAu8yQBX437NF9yre-G8AhC0L2jkhp6KVKASaL_r8TGZh_QRNtxoTKJXj2RXxkHdzbloP5qr9ddoI8OKoucsW0qAAsP4BTZGw_OuSxkWH_7yIFBmg6xnEcQ6TW4JHRFli25nYMjoLZ2HCRMhbnXTVG7sJKa0uboKFQS39PjtPXOEjGCHqrOCfHNMf3fKTvNlIsHiQw4bsKOCnLrOmA4gvrVMw8OI1QXoKnQvFoERk0EIu4ye4Mgt_9-lpAzjg');
  const [logoTitle, setLogoTitle] = useState(() => initialConfig?.logoTitle || 'HOBA LPG');
  const [logoSubtitle, setLogoSubtitle] = useState(() => initialConfig?.logoSubtitle || 'HCMC LPG Business Association');
  const [contactEmail, setContactEmail] = useState(() => initialConfig?.contactEmail || 'info@hobalpg.vn');
  const [contactPhone, setContactPhone] = useState(() => initialConfig?.contactPhone || '028 3831 66710');

  // LPG CP Feature Visibility State (Hidden by default unless explicitly enabled)
  const [lpgCpEnabled, setLpgCpEnabled] = useState<boolean>(() => {
    return initialLpgCpEnabled === true;
  });

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
    const handleLpgStatus = () => {
      try {
        const saved = localStorage.getItem('hoba_website_config_lpg_cp_data');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && typeof parsed.enabled === 'boolean') {
            setLpgCpEnabled(parsed.enabled);
            return;
          }
        }
      } catch (_) {}
    };

    handleLpgStatus();

    async function checkRemoteLpgStatus() {
      if (!supabase) return;
      try {
        const { data, error } = await supabase
          .from('website_config')
          .select('value')
          .eq('key', 'lpg_cp_data')
          .single();
        if (!error && data?.value) {
          const parsed = typeof data.value === 'string' ? JSON.parse(data.value) : data.value;
          if (parsed && typeof parsed.enabled === 'boolean') {
            setLpgCpEnabled(parsed.enabled);
          }
        }
      } catch (_) {}
    }
    checkRemoteLpgStatus();

    window.addEventListener('storage', handleLpgStatus);
    window.addEventListener('hoba_lpg_cp_updated', handleLpgStatus);
    return () => {
      window.removeEventListener('storage', handleLpgStatus);
      window.removeEventListener('hoba_lpg_cp_updated', handleLpgStatus);
    };
  }, []);

  useEffect(() => {
    if (initialConfig) return;
    async function loadMenu() {
      if (!supabase) {
        const saved = localStorage.getItem('hoba_website_config_general');
        if (saved) {
          try {
            const val = JSON.parse(saved);
            if (val.menuItems && Array.isArray(val.menuItems) && val.menuItems.length > 0) {
              setNavItems(ensureLpgSubmenu(val.menuItems));
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
            setNavItems(ensureLpgSubmenu(data.value.menuItems));
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

  const displayNavItems = useMemo(() => {
    return navItems.map((item) => {
      if (!item.children || item.children.length === 0) {
        return item;
      }

      // Filter children: if lpgCpEnabled is false, hide /gia-cp-lpg
      const filteredChildren = item.children.filter((sub) => {
        if (sub.path === '/gia-cp-lpg' && !lpgCpEnabled) {
          return false;
        }
        return true;
      });

      // Special rule: If only 1 child remains and its path matches the parent (or points to the parent page like /tin-tuc),
      // collapse it so it renders as a clean single link rather than a redundant 1-item dropdown!
      if (filteredChildren.length === 1 && filteredChildren[0].path === item.path) {
        return {
          ...item,
          children: [],
        };
      }

      return {
        ...item,
        children: filteredChildren,
      };
    });
  }, [navItems, lpgCpEnabled]);

  const isActive = (path: string) => {
    if (typeof window === 'undefined') {
      if (path === '/') return pathname === '/';
      return pathname.startsWith(path.split('?')[0]);
    }
    if (path.includes('?')) {
      const [targetBasePath, targetQuery] = path.split('?');
      if (pathname !== targetBasePath) return false;
      const targetParams = new URLSearchParams(targetQuery);
      const currentParams = new URLSearchParams(window.location.search);
      for (const [k, v] of targetParams.entries()) {
        if (currentParams.get(k) !== v) return false;
      }
      return true;
    }
    if (path === '/') {
      return pathname === '/';
    }
    return pathname === path || pathname.startsWith(path + '/');
  };

  const handleNavClick = (targetPath: string, e?: React.MouseEvent) => {
    if (pathname === '/tin-tuc' && targetPath.startsWith('/tin-tuc')) {
      const currentSearch = typeof window !== 'undefined' ? window.location.search : '';
      if (currentSearch.includes('id=') || currentSearch.includes('slug=')) {
        return;
      }
      e?.preventDefault();
      window.history.replaceState(null, '', targetPath);
      window.dispatchEvent(new PopStateEvent('popstate'));
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  useEffect(() => {
    if (pathname && isMobileMenuOpen) {
      displayNavItems.forEach((item) => {
        if (item.children && item.children.length > 0) {
          const isCurrentActive = item.path === '/' ? pathname === '/' : pathname.startsWith(item.path);
          if (isCurrentActive) {
            setExpandedItems((prev) => (prev.includes(item.label) ? prev : [...prev, item.label]));
          }
        }
      });
    }
  }, [pathname, isMobileMenuOpen, displayNavItems]);

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
          <div className="flex items-center shrink-0">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center overflow-hidden p-0 shadow-lg transform group-hover:scale-105 transition-all shrink-0">
                <img
                  alt="HOBA LPG Logo"
                  className="w-full h-full object-contain"
                  src={logoUrl}
                />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold tracking-tight whitespace-nowrap">{logoTitle}</span>
                {logoSubtitle && (
                  <span className="text-[8px] opacity-70 uppercase tracking-widest hidden md:block whitespace-nowrap">
                    {logoSubtitle}
                  </span>
                )}
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden xl:flex items-center gap-4 2xl:gap-6 h-full shrink-0">
            {displayNavItems.map((item) => {
              const hasChildren = item.children && item.children.length > 0;
              if (hasChildren) {
                return (
                  <div key={item.label} className="relative group flex items-center h-full cursor-pointer py-1">
                    <Link
                      href={item.path}
                      onClick={(e) => handleNavClick(item.path, e)}
                      className={`flex items-center gap-1 transition-colors font-semibold text-xs uppercase tracking-wide py-1 border-b-2 whitespace-nowrap hover:text-secondary-fixed-dim ${
                        isActive(item.path)
                          ? 'border-secondary-container text-white'
                          : 'border-transparent text-white/80'
                      }`}
                    >
                      {item.label}
                      <svg
                        className="w-3.5 h-3.5 transition-transform duration-200 group-hover:rotate-180 opacity-80 shrink-0"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                      </svg>
                    </Link>
                    {/* Dropdown panel */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-0 w-52 bg-[#00244f] border border-white/10 rounded-lg shadow-xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                      {item.children?.map((subItem) => (
                        <Link
                          key={subItem.path}
                          href={subItem.path}
                          onClick={(e) => handleNavClick(subItem.path, e)}
                          className="block px-4 py-2.5 text-xs font-semibold text-white/80 hover:text-white hover:bg-white/10 transition-colors whitespace-nowrap"
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
                  onClick={(e) => handleNavClick(item.path, e)}
                  className={`transition-colors font-semibold text-xs uppercase tracking-wide py-1 border-b-2 whitespace-nowrap hover:text-secondary-fixed-dim ${
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
          <div className="flex items-center gap-3 shrink-0">
            <div className="hidden lg:flex flex-col text-right mr-3 border-r border-white/20 pr-3 shrink-0">
              <a
                className="text-white hover:text-secondary-fixed-dim text-[11px] font-bold transition-all flex items-center justify-end gap-1.5 whitespace-nowrap"
                href={`tel:${contactPhone.replace(/\s+/g, '')}`}
              >
                <svg className="w-3.5 h-3.5 shrink-0 opacity-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {contactPhone}
              </a>
              <span className="text-white/60 text-[9px] whitespace-nowrap">{contactEmail}</span>
            </div>
            <Link
              href="/dang-ky"
              className="bg-secondary hover:bg-white hover:text-primary text-white px-5 py-2.5 rounded-full font-bold text-xs shadow-xl transition-all active:scale-95 duration-200 uppercase tracking-wider whitespace-nowrap shrink-0"
            >
              Gia nhập ngay
            </Link>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="xl:hidden text-white p-2 flex items-center justify-center shrink-0 cursor-pointer"
              aria-label="Toggle Mobile Menu"
            >
              {isMobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Sidebar */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[60] xl:hidden flex">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/60 transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          {/* Menu Drawer */}
          <div className="relative w-80 max-w-sm bg-primary text-white h-full flex flex-col p-6 shadow-2xl z-10 transition-transform">
            <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center overflow-hidden p-0 shadow-sm">
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
                className="text-white/80 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors cursor-pointer touch-manipulation"
                aria-label="Đóng menu"
              >
                <span className="material-symbols-outlined text-2xl">close</span>
              </button>
            </div>

            <nav className="flex flex-col gap-2.5 flex-1 overflow-y-auto no-scrollbar">
              {displayNavItems.map((item) => {
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
                  const hasDirectMainChild = item.children?.some(c => c.path === item.path);
                  return (
                    <div key={item.label} className="flex flex-col">
                      <button
                        type="button"
                        onClick={toggleExpand}
                        className={`flex items-center justify-between text-base font-medium py-2.5 px-3 rounded-lg w-full text-left transition-colors cursor-pointer touch-manipulation ${
                          isActive(item.path) ? 'text-white font-bold bg-white/10' : 'text-white/80 hover:bg-white/5'
                        }`}
                      >
                        <span>{item.label}</span>
                        <span className={`material-symbols-outlined transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                          expand_more
                        </span>
                      </button>
                      {isExpanded && (
                        <div className="pl-4 flex flex-col gap-2 mt-1.5 border-l border-white/10 ml-3.5">
                          {!hasDirectMainChild && (
                            <Link
                              href={item.path}
                              onClick={(e) => {
                                setIsMobileMenuOpen(false);
                                handleNavClick(item.path, e);
                              }}
                              className={`text-sm font-medium py-2 px-3 rounded-md transition-colors touch-manipulation ${
                                pathname === item.path && typeof window !== 'undefined' && !window.location.search
                                  ? 'bg-secondary text-white font-bold'
                                  : 'hover:bg-white/5 text-white/70'
                              }`}
                            >
                              Tất cả {item.label.toLowerCase()}
                            </Link>
                          )}
                          {item.children?.map((subItem) => (
                            <Link
                              key={subItem.path}
                              href={subItem.path}
                              onClick={(e) => {
                                setIsMobileMenuOpen(false);
                                handleNavClick(subItem.path, e);
                              }}
                              className={`text-sm font-medium py-2 px-3 rounded-md transition-colors touch-manipulation ${
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
                    onClick={(e) => {
                      setIsMobileMenuOpen(false);
                      handleNavClick(item.path, e);
                    }}
                    className={`text-base font-medium py-2.5 px-3 rounded-lg transition-colors cursor-pointer touch-manipulation ${
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
