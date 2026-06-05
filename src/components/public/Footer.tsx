'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

const renderSocialIcon = (iconName: string) => {
  const name = iconName.toLowerCase().trim();
  if (name === 'facebook') {
    return (
      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    );
  }
  if (name === 'youtube') {
    return (
      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
        <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.517 0-9.388.508a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.871.508 9.388.508 9.388.508s7.517 0 9.388-.508a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    );
  }
  if (name === 'twitter' || name === 'x') {
    return (
      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    );
  }
  if (name === 'zalo') {
    return (
      <span className="text-[10px] font-bold tracking-tight">Zalo</span>
    );
  }
  return <span className="material-symbols-outlined text-lg">{iconName}</span>;
};

export default function Footer() {
  const [address, setAddress] = useState('18A Cộng Hòa, P.12, Q. Tân Bình, TP.HCM');
  const [phone, setPhone] = useState('028 3831 6671');
  const [email, setEmail] = useState('info@hoba.vn');
  const [copyText, setCopyText] = useState('© 2025 HOBA - Hiệp hội Kinh doanh Khí hóa lỏng TP.HCM. All rights reserved.');
  const [facebookUrl, setFacebookUrl] = useState('https://facebook.com/hobagroup');
  const [footerDesc, setFooterDesc] = useState('Hiệp hội Kinh doanh Khí hóa lỏng TP.HCM - Nơi kết nối, bảo vệ và định hướng phát triển bền vững cho cộng đồng doanh nghiệp LPG phía Nam.');
  const [logoUrl, setLogoUrl] = useState('https://lh3.googleusercontent.com/aida-public/AB6AXuDGqQKdtsfpnEDKd7JAu8yQBX437NF9yre-G8AhC0L2jkhp6KVKASaL_r8TGZh_QRNtxoTKJXj2RXxkHdzbloP5qr9ddoI8OKoucsW0qAAsP4BTZGw_OuSxkWH_7yIFBmg6xnEcQ6TW4JHRFli25nYMjoLZ2HCRMhbnXTVG7sJKa0uboKFQS39PjtPXOEjGCHqrOCfHNMf3fKTvNlIsHiQw4bsKOCnLrOmA4gvrVMw8OI1QXoKnQvFoERk0EIu4ye4Mgt_9-lpAzjg');
  const [logoTitle, setLogoTitle] = useState('HOBA LPG');
  const [logoSubtitle, setLogoSubtitle] = useState('HCMC LPG Business Association');
  const [websiteUrl, setWebsiteUrl] = useState('https://hoba.vn');
  const [termsPath, setTermsPath] = useState('/dieu-khoan');
  const [privacyPath, setPrivacyPath] = useState('/chinh-sach');
  const [socialLinks, setSocialLinks] = useState<{ icon: string; url: string }[]>([]);

  const defaultQuickLinks = [
    { label: 'Giới thiệu hiệp hội', path: '/gioi-thieu' },
    { label: 'Danh sách hội viên', path: '/hoi-vien' },
    { label: 'Tin tức & Sự kiện', path: '/tin-tuc' },
    { label: 'Văn bản pháp quy', path: '/van-ban' },
  ];

  const defaultCategories = [
    { label: 'Đào tạo an toàn', path: '/tin-tuc?cat=dao-tao' },
    { label: 'Tư vấn pháp lý', path: '/tin-tuc?cat=phap-ly' },
    { label: 'Thị trường gas', path: '/tin-tuc?cat=thi-truong' },
    { label: 'Hướng dẫn hội viên', path: '/tin-tuc?cat=huong-dan' },
  ];

  const [quickLinks, setQuickLinks] = useState(defaultQuickLinks);
  const [categories, setCategories] = useState(defaultCategories);

  useEffect(() => {
    async function loadFooterData() {
      if (!supabase) {
        const saved = localStorage.getItem('hoba_website_config_general');
        if (saved) {
          try {
            const val = JSON.parse(saved);
            applyConfig(val);
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
          applyConfig(data.value);
        }
      } catch (e) {}
    }
    loadFooterData();
  }, []);

  const applyConfig = (val: any) => {
    if (val.address) setAddress(val.address);
    if (val.contactPhone) setPhone(val.contactPhone);
    if (val.contactEmail) setEmail(val.contactEmail);
    if (val.copyText) setCopyText(val.copyText);
    if (val.facebookUrl) setFacebookUrl(val.facebookUrl);
    if (val.footerDesc) setFooterDesc(val.footerDesc);
    if (val.quickLinks && Array.isArray(val.quickLinks)) setQuickLinks(val.quickLinks);
    if (val.categories && Array.isArray(val.categories)) setCategories(val.categories);
    if (val.logoUrl) setLogoUrl(val.logoUrl);
    if (val.logoTitle) setLogoTitle(val.logoTitle);
    if (val.logoSubtitle) setLogoSubtitle(val.logoSubtitle);
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
      setSocialLinks(list.length > 0 ? list : [
        { icon: 'facebook', url: 'https://facebook.com/hobagroup' },
        { icon: 'public', url: 'https://hoba.vn' },
        { icon: 'mail', url: `mailto:${val.contactEmail || 'info@hoba.vn'}` }
      ]);
    }
  };

  return (
    <footer className="bg-primary text-white pt-16 pb-8 border-t border-white/10 mt-auto">
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-gutter">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Logo & Description */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center p-1 shadow-lg transform group-hover:scale-105 transition-all">
                <img
                  alt="HOBA LPG Logo"
                  className="w-full h-full object-contain"
                  src={logoUrl}
                />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold tracking-tight">{logoTitle}</span>
                {logoSubtitle && (
                  <span className="text-[8px] opacity-70 uppercase tracking-widest">
                    {logoSubtitle}
                  </span>
                )}
              </div>
            </Link>
            <p className="text-xs opacity-75 leading-relaxed">
              {footerDesc}
            </p>
            <div className="flex gap-4">
              {socialLinks.map((link, idx) => (
                <a
                  key={idx}
                  className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-secondary hover:border-secondary transition-all animate-fade-in"
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={link.icon}
                >
                  {renderSocialIcon(link.icon)}
                </a>
              ))}
              {socialLinks.length === 0 && (
                <>
                  <a
                    className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-secondary hover:border-secondary transition-all"
                    href={facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Facebook"
                  >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </a>
                  <a
                    className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-secondary hover:border-secondary transition-all"
                    href={websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Website"
                  >
                    <span className="material-symbols-outlined text-lg">public</span>
                  </a>
                  <a
                    className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-secondary hover:border-secondary transition-all"
                    href={`mailto:${email}`}
                    aria-label="Email"
                  >
                    <span className="material-symbols-outlined text-lg">mail</span>
                  </a>
                </>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider mb-6 relative pb-2 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-8 after:h-0.5 after:bg-secondary">
              Liên kết nhanh
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((link, idx) => {
                const isBypass = link.path.startsWith('/tin-tuc') || link.path.startsWith('/su-kien');
                return (
                  <li key={idx}>
                    {isBypass ? (
                      <a
                        href={link.path}
                        className="text-xs opacity-75 hover:opacity-100 hover:text-secondary-fixed-dim transition-colors"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={link.path}
                        className="text-xs opacity-75 hover:opacity-100 hover:text-secondary-fixed-dim transition-colors"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider mb-6 relative pb-2 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-8 after:h-0.5 after:bg-secondary">
              Chuyên mục
            </h4>
            <ul className="space-y-3">
              {categories.map((cat, idx) => {
                const isBypass = cat.path.startsWith('/tin-tuc') || cat.path.startsWith('/su-kien');
                return (
                  <li key={idx}>
                    {isBypass ? (
                      <a
                        href={cat.path}
                        className="text-xs opacity-75 hover:opacity-100 hover:text-secondary-fixed-dim transition-colors"
                      >
                        {cat.label}
                      </a>
                    ) : (
                      <Link
                        href={cat.path}
                        className="text-xs opacity-75 hover:opacity-100 hover:text-secondary-fixed-dim transition-colors"
                      >
                        {cat.label}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Office Contact Info */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider mb-6 relative pb-2 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-8 after:h-0.5 after:bg-secondary">
              Văn phòng hiệp hội
            </h4>
            <ul className="space-y-4">
              <li className="flex gap-3 items-start">
                <span className="material-symbols-outlined text-secondary text-lg">location_on</span>
                <span className="text-xs opacity-75 leading-relaxed">
                  {address}
                </span>
              </li>
              <li className="flex gap-3 items-center">
                <span className="material-symbols-outlined text-secondary text-lg">call</span>
                <a
                  className="text-xs opacity-75 hover:opacity-100 hover:text-secondary-fixed-dim transition-colors"
                  href={`tel:${phone.replace(/\s+/g, '')}`}
                >
                  {phone}
                </a>
              </li>
              <li className="flex gap-3 items-center">
                <span className="material-symbols-outlined text-secondary text-lg">mail</span>
                <a
                  className="text-xs opacity-75 hover:opacity-100 hover:text-secondary-fixed-dim transition-colors"
                  href={`mailto:${email}`}
                >
                  {email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
          <p className="text-[10px] opacity-50">
            {copyText}
          </p>
          <div className="flex gap-6">
            <Link href={termsPath} className="text-[10px] opacity-50 hover:opacity-80">
              Điều khoản sử dụng
            </Link>
            <Link href={privacyPath} className="text-[10px] opacity-50 hover:opacity-80">
              Chính sách bảo mật
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
