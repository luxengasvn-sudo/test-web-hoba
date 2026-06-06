'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [totalMembers, setTotalMembers] = useState(0);
  const [pendingMembers, setPendingMembers] = useState(0);
  const [totalNews, setTotalNews] = useState(0);
  const [totalDocs, setTotalDocs] = useState(0);

  const [logoUrl, setLogoUrl] = useState('https://lh3.googleusercontent.com/aida-public/AB6AXuDGqQKdtsfpnEDKd7JAu8yQBX437NF9yre-G8AhC0L2jkhp6KVKASaL_r8TGZh_QRNtxoTKJXj2RXxkHdzbloP5qr9ddoI8OKoucsW0qAAsP4BTZGw_OuSxkWH_7yIFBmg6xnEcQ6TW4JHRFli25nYMjoLZ2HCRMhbnXTVG7sJKa0uboKFQS39PjtPXOEjGCHqrOCfHNMf3fKTvNlIsHiQw4bsKOCnLrOmA4gvrVMw8OI1QXoKnQvFoERk0EIu4ye4Mgt_9-lpAzjg');
  const [logoUploading, setLogoUploading] = useState(false);

  useEffect(() => {
    async function initDashboard() {
      // 1. Load logo
      if (!supabase) {
        const saved = localStorage.getItem('hoba_website_config_general');
        if (saved) {
          try {
            const val = JSON.parse(saved);
            if (val.logoUrl) setLogoUrl(val.logoUrl);
          } catch (e) {}
        }
      } else {
        try {
          const { data } = await supabase
            .from('website_config')
            .select('value')
            .eq('key', 'general')
            .single();
          if (data?.value?.logoUrl) {
            setLogoUrl(data.value.logoUrl);
          }
        } catch (e) {}
      }

      // 2. Load stats
      if (supabase) {
        try {
          const [membersRes, pendingRes, newsRes, docsRes] = await Promise.all([
            supabase.from('members').select('*', { count: 'exact', head: true }),
            supabase.from('members').select('*', { count: 'exact', head: true }).eq('status', 'Pending'),
            supabase.from('news').select('*', { count: 'exact', head: true }),
            supabase.from('documents').select('*', { count: 'exact', head: true })
          ]);
          
          if (!membersRes.error && membersRes.count !== null) setTotalMembers(membersRes.count);
          if (!pendingRes.error && pendingRes.count !== null) setPendingMembers(pendingRes.count);
          if (!newsRes.error && newsRes.count !== null) setTotalNews(newsRes.count);
          if (!docsRes.error && docsRes.count !== null) setTotalDocs(docsRes.count);
        } catch (e) {
          console.error('Lỗi khi tải thống kê từ Supabase:', e);
        }
      }

      setLoading(false);
    }
    
    initDashboard();

    const handleStorageChange = () => {
      const saved = localStorage.getItem('hoba_website_config_general');
      if (saved) {
        try {
          const val = JSON.parse(saved);
          if (val.logoUrl) setLogoUrl(val.logoUrl);
        } catch (e) {}
      }
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('hoba_logo_updated', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('hoba_logo_updated', handleStorageChange);
    };
  }, []);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLogoUploading(true);
      try {
        const file = e.target.files[0];
        let url = '';
        if (!supabase) {
          url = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = error => reject(error);
          });
        } else {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
          const filePath = `site-assets/${fileName}`;
          const { error: uploadError } = await supabase.storage
            .from('hoba-assets')
            .upload(filePath, file);
          if (uploadError) throw uploadError;
          const { data: { publicUrl } } = supabase.storage
            .from('hoba-assets')
            .getPublicUrl(filePath);
          url = publicUrl;
        }

        // Save immediately to database/localStorage
        if (supabase) {
          const { data } = await supabase
            .from('website_config')
            .select('value')
            .eq('key', 'general')
            .single();
          const currentVal = data?.value || {};
          const finalVal = { ...currentVal, logoUrl: url };
          const { error } = await supabase
            .from('website_config')
            .upsert({ key: 'general', value: finalVal });
          if (error) throw error;
        } else {
          const saved = localStorage.getItem('hoba_website_config_general');
          const currentVal = saved ? JSON.parse(saved) : {};
          const finalVal = { ...currentVal, logoUrl: url };
          localStorage.setItem('hoba_website_config_general', JSON.stringify(finalVal));
        }

        setLogoUrl(url);

        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('hoba_logo_updated'));
        }

        alert('Cập nhật Logo website thành công!');
      } catch (err) {
        alert('Lỗi cập nhật Logo: ' + (err as Error).message);
      } finally {
        setLogoUploading(false);
      }
    }
  };

  const stats = [
    {
      label: 'Tổng Hội viên',
      value: String(totalMembers),
      change: 'Động',
      desc: 'Doanh nghiệp đăng ký hệ thống',
      icon: 'group',
      color: 'bg-primary-container text-on-primary-container'
    },
    {
      label: 'Hội viên chờ duyệt',
      value: String(pendingMembers),
      change: pendingMembers > 0 ? 'Cần duyệt' : 'Đã duyệt hết',
      desc: 'Hồ sơ đang đợi kiểm duyệt',
      icon: 'rule',
      color: pendingMembers > 0 ? 'bg-secondary-container text-on-secondary-container animate-pulse' : 'bg-tertiary-container text-on-tertiary-container'
    },
    {
      label: 'Bài viết đã đăng',
      value: String(totalNews),
      change: 'Động',
      desc: 'Tin chuyên ngành & sự kiện',
      icon: 'newspaper',
      color: 'bg-surface-tint text-white'
    },
    {
      label: 'Văn bản pháp lý',
      value: String(totalDocs),
      change: 'Động',
      desc: 'Nghị định & quy chuẩn LPG',
      icon: 'description',
      color: 'bg-primary text-white'
    }
  ];

  const chartData = [
    { month: 'T1', value: '40%' },
    { month: 'T3', value: '55%' },
    { month: 'T5', value: '50%' },
    { month: 'T7', value: '75%' },
    { month: 'T9', value: '85%' },
    { month: 'T11', value: '100%' }
  ];

  const activities = [
    {
      text: 'Đăng ký hội viên mới: ',
      highlight: 'Công ty Alpha Gas Solutions',
      time: '2 giờ trước',
      dotColor: 'bg-secondary'
    },
    {
      text: 'Đã phê duyệt tài liệu kỹ thuật ',
      highlight: 'QCVN 08:2026/BCT',
      time: '5 giờ trước',
      dotColor: 'bg-primary'
    },
    {
      text: 'Hệ thống ghi nhận lượt truy cập tăng đột biến ở tin tức.',
      time: 'Hôm qua',
      dotColor: 'bg-tertiary-container'
    },
    {
      text: 'Đã xếp lịch hội thảo: ',
      highlight: 'Huấn luyện kỹ thuật nạp gas an toàn',
      time: '2 ngày trước',
      dotColor: 'bg-outline'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-[#00346f] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-primary">Tổng quan quản trị</h2>
        <p className="text-xs text-on-surface-variant mt-1">Trạng thái hệ thống và chỉ số hiệp hội cập nhật hôm nay.</p>
      </div>

      {/* Bento Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className="bg-white p-6 border border-outline-variant/30 rounded-xl shadow-sm hover:shadow-md transition-all group"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${stat.color}`}>
                <span className="material-symbols-outlined text-2xl">{stat.icon}</span>
              </div>
              <span className="text-[10px] bg-secondary-fixed text-on-secondary-fixed-variant font-bold px-2 py-0.5 rounded">
                {stat.change}
              </span>
            </div>
            <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">{stat.label}</p>
            <h3 className="text-2xl font-black text-primary mt-1">{stat.value}</h3>
            <p className="text-[10px] text-outline italic mt-1">{stat.desc}</p>
          </div>
        ))}
      </div>

      {/* Growth & Activity Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Growth chart */}
        <div className="lg:col-span-2 bg-white p-8 border border-outline-variant/30 rounded-xl flex flex-col justify-between">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h4 className="text-sm font-bold text-primary">Tốc độ tăng trưởng hội viên</h4>
              <p className="text-[11px] text-on-surface-variant">Thống kê số lượng hội viên mới qua các quý</p>
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1 text-[10px] font-bold rounded border border-outline-variant/50 hover:bg-surface-container transition-colors">6 Tháng</button>
              <button className="px-3 py-1 text-[10px] font-bold rounded bg-primary text-white">1 Năm</button>
            </div>
          </div>

          {/* Simple HTML custom chart bars */}
          <div className="h-60 flex items-end justify-between gap-4 px-4 pb-8 border-b border-outline-variant/20 relative">
            <div className="absolute inset-x-0 top-0 h-[1px] bg-outline-variant/10"></div>
            <div className="absolute inset-x-0 top-1/4 h-[1px] bg-outline-variant/10"></div>
            <div className="absolute inset-x-0 top-1/2 h-[1px] bg-outline-variant/10"></div>
            <div className="absolute inset-x-0 top-3/4 h-[1px] bg-outline-variant/10"></div>

            {chartData.map((bar, idx) => (
              <div
                key={idx}
                className="flex-grow bg-primary-container/30 hover:bg-primary transition-colors rounded-t relative group cursor-pointer"
                style={{ height: bar.value }}
              >
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-primary text-white text-[9px] py-0.5 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                  {bar.value}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between mt-4 px-2 text-[10px] font-bold text-outline">
            {chartData.map((bar, idx) => (
              <span key={idx}>{bar.month}</span>
            ))}
          </div>
        </div>

        {/* Right column stack: Logo Uploader & Recent Activities */}
        <div className="space-y-6">
          {/* Direct Logo Uploader Card */}
          <div className="bg-white p-6 border border-outline-variant/30 rounded-xl shadow-sm space-y-4">
            <h4 className="text-sm font-bold text-primary flex items-center gap-2 border-b border-outline-variant/20 pb-2">
              <span className="material-symbols-outlined text-base">branding_watermark</span>
              Logo Website Hiệp hội
            </h4>
            <div className="flex items-center gap-4 py-1">
              <div className="w-16 h-16 rounded border border-outline-variant/30 bg-white flex items-center justify-center p-1.5 shrink-0 shadow-inner">
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt="Logo Preview"
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <span className="material-symbols-outlined text-outline text-lg">image</span>
                )}
              </div>
              <div className="flex-grow flex flex-col gap-1.5">
                <label className="bg-[#00346f] hover:bg-[#00346f]/90 text-white text-[10px] font-bold py-2 px-3 rounded flex items-center justify-center gap-1 cursor-pointer transition-colors active:scale-95 w-fit shadow-sm">
                  <span className="material-symbols-outlined text-xs">cloud_upload</span>
                  {logoUploading ? 'Đang tải...' : 'Thay đổi Logo'}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleLogoUpload}
                    disabled={logoUploading}
                  />
                </label>
                <p className="text-[9px] text-on-surface-variant leading-normal">Tải lên logo để hiển thị đồng bộ trên Header & Footer website.</p>
              </div>
            </div>
          </div>

          {/* Recent Activities */}
          <div className="bg-white p-6 border border-outline-variant/30 rounded-xl flex flex-col justify-between shadow-sm">
            <div>
              <h4 className="text-sm font-bold text-primary mb-6 border-b border-outline-variant/20 pb-2">Hoạt động gần đây</h4>
              <div className="space-y-5">
                {activities.map((act, idx) => (
                  <div key={idx} className="flex gap-3 items-start text-xs">
                    <div className={`w-2 h-2 rounded-full ${act.dotColor || 'bg-primary'} mt-1 flex-shrink-0`}></div>
                    <div>
                      <p className="text-on-surface leading-relaxed">
                        {act.text}
                        {act.highlight && <span className="font-bold">{act.highlight}</span>}
                      </p>
                      <p className="text-[10px] text-outline mt-0.5">{act.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* System Health */}
            <div className="mt-8 p-3 rounded-lg bg-surface-container-low border border-outline-variant/20 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-[10px] font-bold text-on-surface-variant">Hệ thống máy chủ ổn định</span>
              </div>
              <span className="material-symbols-outlined text-lg text-outline">security</span>
            </div>
          </div>
        </div>
      </div>

      {/* Industrial Safety banner */}
      <section className="relative rounded-xl overflow-hidden h-40 group shadow-sm">
        <img
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          alt="Safety facility"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuA0epjt4jHlAwZXMkOTECe3O5TtboSouvkBg0LkmS9UTakVTL8ilvgyR9yCLlYOA3Y4SIfyqun3MSg5aPf9amyLVFeRbI0Numz0XvdgU760wcXN1-jCFocY0yVqMnwSZ8U4gVatmQe5Lm6y27cYBrRVkEGtarzsBdjUqrVkuohwA3z12VHkHEYtuZ2k-jTl4-d7buzYHhBJNdaFSNJlcE8yT2c_Ap-9ZUkUuDmDmuvrtimxRGQMKQBnURfC-i9wq7WO7FkJO7u4idI"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/70 to-transparent flex flex-col justify-center px-12 text-white">
          <h3 className="text-base md:text-lg font-bold max-w-md">Tuân thủ tiêu chuẩn an toàn LPG quốc gia</h3>
          <p className="text-xs text-white/70 mt-1 max-w-sm">Kiểm duyệt các hồ sơ an toàn kỹ thuật và trạm nạp của hội viên.</p>
          <div className="mt-4">
            <button className="bg-secondary text-white text-xs px-5 py-2 rounded font-bold hover:bg-[#93000d] transition-all">
              Kiểm tra hồ sơ
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
