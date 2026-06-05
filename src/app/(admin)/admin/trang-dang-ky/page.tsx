'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface RegisterPageConfig {
  title: string;
  subtitle: string;
  hotline: string;
  step1Label: string;
  step2Label: string;
  step3Label: string;
  step4Label: string;
  agreementText: string;
}

export default function AdminTrangDangKy() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);
  
  // General & Registration Settings states
  const [registrationOpen, setRegistrationOpen] = useState(true);
  const [config, setConfig] = useState<RegisterPageConfig>({
    title: 'Đăng Ký Hội Viên Doanh Nghiệp',
    subtitle: 'Gia nhập cộng đồng LPG Việt Nam để nâng cao tiêu chuẩn an toàn và kết nối cơ hội kinh doanh bền vững.',
    hotline: '1900 1234',
    step1Label: 'Doanh nghiệp',
    step2Label: 'Người đại diện',
    step3Label: 'Hồ sơ pháp lý',
    step4Label: 'Xác nhận',
    agreementText: 'Tôi cam kết các thông tin cung cấp là chính xác và hoàn toàn chịu trách nhiệm trước pháp luật cũng như các quy định của Hội.'
  });

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      
      // Load registration page config
      if (!supabase) {
        const savedRegister = localStorage.getItem('hoba_website_config_register');
        if (savedRegister) {
          try {
            setConfig(prev => ({ ...prev, ...JSON.parse(savedRegister) }));
          } catch (e) {}
        }
        
        const savedGeneral = localStorage.getItem('hoba_website_config_general');
        if (savedGeneral) {
          try {
            const gen = JSON.parse(savedGeneral);
            if (gen.registrationOpen !== undefined) {
              setRegistrationOpen(gen.registrationOpen);
            }
          } catch (e) {}
        }
        setLoading(false);
        return;
      }

      try {
        // Load dynamic config for the registration page
        const { data: regData } = await supabase
          .from('website_config')
          .select('value')
          .eq('key', 'registerpage')
          .single();

        if (regData?.value) {
          setConfig(prev => ({ ...prev, ...regData.value }));
        }

        // Load dynamic config for registration open status
        const { data: genData } = await supabase
          .from('website_config')
          .select('value')
          .eq('key', 'general')
          .single();

        if (genData?.value) {
          if (genData.value.registrationOpen !== undefined) {
            setRegistrationOpen(genData.value.registrationOpen);
          }
        }
      } catch (err) {
        console.error('Lỗi khi tải cấu hình trang đăng ký:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setConfig(prev => ({ ...prev, [name]: value }));
  };

  const handleToggleRegistration = async () => {
    const nextVal = !registrationOpen;
    setRegistrationOpen(nextVal);
    
    // Save registration open status to general config immediately
    if (supabase) {
      try {
        const { data } = await supabase
          .from('website_config')
          .select('value')
          .eq('key', 'general')
          .single();
        const currentVal = data?.value || {};
        const finalVal = { ...currentVal, registrationOpen: nextVal };
        await supabase
          .from('website_config')
          .upsert({ key: 'general', value: finalVal });
      } catch (e) {}
    } else {
      const saved = localStorage.getItem('hoba_website_config_general');
      const currentVal = saved ? JSON.parse(saved) : {};
      const finalVal = { ...currentVal, registrationOpen: nextVal };
      localStorage.setItem('hoba_website_config_general', JSON.stringify(finalVal));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    if (supabase) {
      try {
        const { error } = await supabase
          .from('website_config')
          .upsert({
            key: 'registerpage',
            value: config
          });
        if (error) throw error;
      } catch (err) {
        alert('Lỗi lưu cấu hình trang đăng ký: ' + (err as Error).message);
        setSaving(false);
        return;
      }
    } else {
      localStorage.setItem('hoba_website_config_register', JSON.stringify(config));
    }

    setSaving(false);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <div className="space-y-6 text-xs text-[#1c1c1a]">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-4 right-4 z-50 bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-fade-in font-bold text-xs">
          <span className="material-symbols-outlined text-sm">check_circle</span>
          Đã lưu cấu hình trang Đăng ký thành công!
        </div>
      )}

      {/* Page Header */}
      <div className="border-b border-outline-variant/30 pb-4">
        <h2 className="text-lg md:text-xl font-black text-[#00346f]">Quản lý Trang Đăng Ký</h2>
        <p className="text-on-surface-variant mt-1 text-[11px]">
          Điều chỉnh tiêu đề, hướng dẫn biểu mẫu, hotline hỗ trợ, tên các bước và điều khoản cam kết đăng ký.
        </p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-on-surface-variant font-medium">Đang tải dữ liệu cấu hình...</div>
      ) : (
        <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-[1200px]">
          {/* Main content inputs */}
          <div className="lg:col-span-2 space-y-6">
            {/* General texts card */}
            <div className="bg-white p-6 rounded-xl border border-outline-variant/30 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-[#00346f] flex items-center gap-2 border-b border-outline-variant/20 pb-2 mb-2">
                <span className="material-symbols-outlined text-base font-bold">edit_note</span>
                Tiêu đề & Hướng dẫn chính
              </h3>
              
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase">Tiêu đề chính trang đăng ký</label>
                <input
                  name="title"
                  value={config.title}
                  onChange={handleInputChange}
                  className="h-10 border border-outline-variant rounded-lg px-4 bg-surface text-xs text-on-surface outline-none focus:border-[#00346f] focus:ring-0"
                  type="text"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase">Mô tả phụ/Hướng dẫn</label>
                <textarea
                  name="subtitle"
                  value={config.subtitle}
                  onChange={handleInputChange}
                  rows={3}
                  className="border border-outline-variant rounded-lg p-3 bg-surface text-xs text-on-surface outline-none focus:border-[#00346f] focus:ring-0 resize-y"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase">Hotline hỗ trợ kỹ thuật</label>
                <input
                  name="hotline"
                  value={config.hotline}
                  onChange={handleInputChange}
                  className="h-10 border border-outline-variant rounded-lg px-4 bg-surface text-xs text-on-surface outline-none focus:border-[#00346f] focus:ring-0"
                  type="text"
                  required
                />
              </div>
            </div>

            {/* Stepper Steps Names */}
            <div className="bg-white p-6 rounded-xl border border-outline-variant/30 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-[#00346f] flex items-center gap-2 border-b border-outline-variant/20 pb-2 mb-2">
                <span className="material-symbols-outlined text-base font-bold">format_list_numbered</span>
                Tên các bước đăng ký (4 Bước)
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase">Tên Bước 1 (Thông tin doanh nghiệp)</label>
                  <input
                    name="step1Label"
                    value={config.step1Label}
                    onChange={handleInputChange}
                    className="h-10 border border-outline-variant rounded-lg px-4 bg-surface text-xs text-on-surface outline-none focus:border-[#00346f] focus:ring-0"
                    type="text"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase">Tên Bước 2 (Người đại diện)</label>
                  <input
                    name="step2Label"
                    value={config.step2Label}
                    onChange={handleInputChange}
                    className="h-10 border border-outline-variant rounded-lg px-4 bg-surface text-xs text-on-surface outline-none focus:border-[#00346f] focus:ring-0"
                    type="text"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase">Tên Bước 3 (Hồ sơ pháp lý)</label>
                  <input
                    name="step3Label"
                    value={config.step3Label}
                    onChange={handleInputChange}
                    className="h-10 border border-outline-variant rounded-lg px-4 bg-surface text-xs text-on-surface outline-none focus:border-[#00346f] focus:ring-0"
                    type="text"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase">Tên Bước 4 (Xác nhận & Gửi)</label>
                  <input
                    name="step4Label"
                    value={config.step4Label}
                    onChange={handleInputChange}
                    className="h-10 border border-outline-variant rounded-lg px-4 bg-surface text-xs text-on-surface outline-none focus:border-[#00346f] focus:ring-0"
                    type="text"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Agreement Terms */}
            <div className="bg-white p-6 rounded-xl border border-outline-variant/30 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-[#00346f] flex items-center gap-2 border-b border-outline-variant/20 pb-2 mb-2">
                <span className="material-symbols-outlined text-base font-bold">gavel</span>
                Cam kết pháp lý & Điều khoản cuối form
              </h3>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase">Nội dung văn bản cam kết checkbox</label>
                <textarea
                  name="agreementText"
                  value={config.agreementText}
                  onChange={handleInputChange}
                  rows={3}
                  className="border border-outline-variant rounded-lg p-3 bg-surface text-xs text-on-surface outline-none focus:border-[#00346f] focus:ring-0 resize-y"
                  required
                />
              </div>
            </div>
          </div>

          {/* Right sidebar action panels */}
          <div className="space-y-6">
            {/* Status switcher card */}
            <div className="bg-white p-6 rounded-xl border border-outline-variant/30 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-primary flex items-center gap-2 border-b border-outline-variant/20 pb-2 mb-2">
                <span className="material-symbols-outlined text-base font-bold">toggle_on</span>
                Trạng thái đăng ký
              </h3>
              <div className="flex items-center justify-between p-3 bg-surface-container-low rounded-lg border border-outline-variant/20">
                <div>
                  <h4 className="text-xs font-bold text-[#00346f]">Cho phép đăng ký online</h4>
                  <p className="text-[9px] text-on-surface-variant mt-0.5">Tắt để khoá đăng ký tạm thời.</p>
                </div>
                <button
                  type="button"
                  onClick={handleToggleRegistration}
                  className={`w-11 h-6 rounded-full p-1 transition-colors flex items-center ${registrationOpen ? 'bg-[#00346f]' : 'bg-gray-300'}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-200 ${registrationOpen ? 'translate-x-5' : 'translate-x-0'}`}></div>
                </button>
              </div>
            </div>

            {/* Quick action save & preview */}
            <div className="bg-primary text-white p-6 rounded-xl flex flex-col justify-between shadow-lg">
              <div>
                <h4 className="text-sm font-bold mb-2">Đăng tải thay đổi</h4>
                <p className="text-[10px] text-white/80 leading-relaxed mb-6">
                  Hãy kiểm tra kỹ câu chữ trước khi xuất bản. Mọi cập nhật sẽ có tác dụng tức thì đối với biểu mẫu đăng ký hội viên ngoài trang chủ.
                </p>
              </div>
              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full bg-[#bb0013] hover:bg-[#93000d] text-white font-bold py-3 rounded-lg shadow transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-sm">publish</span>
                  {saving ? 'Đang lưu...' : 'Lưu & Xuất bản'}
                </button>
                <a
                  href="/dang-ky"
                  target="_blank"
                  className="w-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2 text-center"
                >
                  <span className="material-symbols-outlined text-sm">open_in_new</span>
                  Xem thử Form Đăng ký
                </a>
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
