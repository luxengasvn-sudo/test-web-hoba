'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

interface GeneralConfig {
  siteName: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  workingHours?: string;
  mapEmbedUrl?: string;
  maintenanceMode: boolean;
  registrationOpen: boolean;
}

export default function ContactPage() {
  // Form State
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formMessage, setFormMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // General Configuration State
  const [config, setConfig] = useState<GeneralConfig>({
    siteName: 'HOBA LPG',
    contactEmail: 'info@hoba.vn',
    contactPhone: '028 3831 6671',
    address: '18A Cộng Hòa, P.12, Q. Tân Bình, TP.HCM',
    workingHours: 'Thứ 2 - Thứ 6: 08:00 - 17:00\nThứ 7: 08:00 - 12:00',
    mapEmbedUrl: '',
    maintenanceMode: false,
    registrationOpen: true,
  });

  useEffect(() => {
    async function loadConfig() {
      if (!supabase) {
        const saved = localStorage.getItem('hoba_website_config_general');
        if (saved) {
          try {
            setConfig(JSON.parse(saved));
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
          setConfig(data.value);
        }
      } catch (err) {
        console.error('Lỗi khi tải thông tin liên hệ cấu hình:', err);
      }
    }
    loadConfig();
  }, []);

  const getMapSrc = () => {
    const raw = config.mapEmbedUrl;
    if (!raw || raw.trim() === '') {
      return `https://maps.google.com/maps?q=${encodeURIComponent(config.address)}&t=&z=16&ie=UTF8&iwloc=&output=embed`;
    }
    
    // Parse the src link if the user pasted the entire <iframe> HTML snippet
    if (raw.includes('src="')) {
      const match = raw.match(/src="([^"]+)"/);
      if (match && match[1]) return match[1];
    }
    return raw;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formEmail || !formPhone || !formMessage) {
      alert('Vui lòng điền đầy đủ các thông tin bắt buộc.');
      return;
    }

    setIsSubmitting(true);

    if (!supabase) {
      // Offline fallback: save message to localStorage
      const savedContacts = localStorage.getItem('hoba_website_contacts');
      let contacts = [];
      if (savedContacts) {
        try {
          contacts = JSON.parse(savedContacts);
        } catch (err) {}
      }

      const newMsg = {
        id: String(Date.now()),
        name: formName,
        email: formEmail,
        phone: formPhone,
        message: formMessage,
        date: new Date().toISOString().split('T')[0],
        read: false
      };

      contacts.unshift(newMsg);
      localStorage.setItem('hoba_website_contacts', JSON.stringify(contacts));

      setToastMessage('Cảm ơn bạn! Tin nhắn liên hệ đã được gửi thành công (Mock Mode).');
      setShowToast(true);
      resetForm();
      setIsSubmitting(false);

      setTimeout(() => {
        setShowToast(false);
      }, 4000);
      return;
    }

    try {
      const { error } = await supabase.from('contact_messages').insert([
        {
          name: formName,
          email: formEmail,
          phone: formPhone,
          message: formMessage,
          is_read: false
        }
      ]);

      if (error) throw error;

      setToastMessage('Cảm ơn bạn! Tin nhắn liên hệ đã được gửi thành công.');
      setShowToast(true);
      resetForm();

      setTimeout(() => {
        setShowToast(false);
      }, 4000);
    } catch (err) {
      alert('Gửi tin nhắn thất bại. Lỗi: ' + (err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormName('');
    setFormEmail('');
    setFormPhone('');
    setFormMessage('');
  };

  return (
    <div className="flex flex-col w-full overflow-x-hidden text-xs">
      <title>Liên hệ | HOBA LPG</title>
      <meta name="description" content="Liên hệ với Hiệp hội Gas và Kinh doanh Khí hóa lỏng TP.HCM (HOBA) - Địa chỉ văn phòng, hotline, email và bản đồ hướng dẫn chỉ đường." />
      {/* Hero Banner Section */}
      <section className="relative h-[300px] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-primary/70 z-10"></div>
        <img
          alt="Contact Background"
          className="absolute inset-0 w-full h-full object-cover"
          src="https://images.unsplash.com/photo-1423662055902-3f9e9987f600"
        />
        <div className="relative z-20 max-w-container-max mx-auto px-margin-mobile md:px-gutter w-full text-white">
          <div className="flex items-center gap-2 text-xs mb-4 opacity-80">
            <Link href="/" className="hover:underline">Trang chủ</Link>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span>Liên hệ</span>
          </div>
          <h1 className="text-4xl font-black mb-2 text-white">Liên hệ với chúng tôi</h1>
          <p className="text-sm opacity-80">HOBA luôn sẵn sàng lắng nghe ý kiến đóng góp và hỗ trợ giải đáp mọi thắc mắc của bạn</p>
        </div>
      </section>

      {/* Main Section */}
      <section className="py-16 bg-surface">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-gutter">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
            
            {/* Left side: Contact Info Cards */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white p-6 rounded-xl border border-outline-variant/30 shadow-sm space-y-6">
                <div>
                  <h3 className="text-base font-black text-primary border-b border-outline-variant/30 pb-3 mb-4">
                    Thông tin liên hệ
                  </h3>
                  <p className="text-on-surface-variant leading-relaxed">
                    Bạn có thể gửi phản hồi trực tiếp qua biểu mẫu, hoặc liên hệ trực tiếp với văn phòng Hiệp hội HOBA LPG theo các thông tin dưới đây.
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Address Card */}
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                      <span className="material-symbols-outlined">location_on</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-on-background text-xs">Văn phòng chính</h4>
                      <p className="text-on-surface-variant mt-1 leading-relaxed">{config.address}</p>
                    </div>
                  </div>

                  {/* Phone Card */}
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                      <span className="material-symbols-outlined">call</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-on-background text-xs">Điện thoại liên hệ</h4>
                      <p className="text-on-surface-variant mt-1 font-semibold hover:text-secondary transition-colors">
                        <a href={`tel:${config.contactPhone.replace(/\s+/g, '')}`}>{config.contactPhone}</a>
                      </p>
                    </div>
                  </div>

                  {/* Email Card */}
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                      <span className="material-symbols-outlined">mail</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-on-background text-xs">Hộp thư điện tử</h4>
                      <p className="text-on-surface-variant mt-1 font-semibold hover:text-secondary transition-colors">
                        <a href={`mailto:${config.contactEmail}`}>{config.contactEmail}</a>
                      </p>
                    </div>
                  </div>

                  {/* Working Hours Card */}
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                      <span className="material-symbols-outlined">schedule</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-on-background text-xs">Thời gian làm việc</h4>
                      <p className="text-on-surface-variant mt-1 leading-relaxed whitespace-pre-line">
                        {config.workingHours || "Thứ 2 - Thứ 6: 08:00 - 17:00\nThứ 7: 08:00 - 12:00"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side: Contact Form */}
            <div className="lg:col-span-3">
              <div className="bg-white p-6 md:p-8 rounded-xl border border-outline-variant/30 shadow-sm">
                <h3 className="text-base font-black text-primary border-b border-outline-variant/30 pb-3 mb-6">
                  Gửi tin nhắn cho HOBA
                </h3>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Name */}
                    <div className="flex flex-col gap-1.5">
                      <label className="font-bold text-on-surface-variant">Họ và tên *</label>
                      <input
                        required
                        type="text"
                        placeholder="VD: Nguyễn Văn A"
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        className="h-11 border border-outline-variant rounded-lg px-4 bg-surface text-on-surface outline-none focus:border-primary text-xs transition-colors"
                      />
                    </div>

                    {/* Phone */}
                    <div className="flex flex-col gap-1.5">
                      <label className="font-bold text-on-surface-variant">Số điện thoại *</label>
                      <input
                        required
                        type="tel"
                        placeholder="VD: 0912 345 678"
                        value={formPhone}
                        onChange={(e) => setFormPhone(e.target.value)}
                        className="h-11 border border-outline-variant rounded-lg px-4 bg-surface text-on-surface outline-none focus:border-primary text-xs transition-colors"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex flex-col gap-1.5">
                    <label className="font-bold text-on-surface-variant">Địa chỉ Email *</label>
                    <input
                      required
                      type="email"
                      placeholder="VD: nguyenvana@gmail.com"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      className="h-11 border border-outline-variant rounded-lg px-4 bg-surface text-on-surface outline-none focus:border-primary text-xs transition-colors"
                    />
                  </div>

                  {/* Message */}
                  <div className="flex flex-col gap-1.5">
                    <label className="font-bold text-on-surface-variant">Nội dung tin nhắn *</label>
                    <textarea
                      required
                      rows={5}
                      placeholder="Nhập nội dung yêu cầu hỗ trợ hoặc phản hồi của bạn..."
                      value={formMessage}
                      onChange={(e) => setFormMessage(e.target.value)}
                      className="border border-outline-variant rounded-lg p-4 bg-surface text-on-surface outline-none focus:border-primary text-xs transition-colors resize-y min-h-[120px]"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-secondary hover:bg-primary text-white text-xs px-6 py-3 rounded-lg font-bold shadow-md hover:shadow-lg active:scale-95 transition-all select-none duration-150 uppercase tracking-wider flex items-center gap-2 justify-center w-full sm:w-auto"
                    >
                      {isSubmitting ? (
                        <>
                          <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
                          Đang gửi yêu cầu...
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-sm">send</span>
                          Gửi tin nhắn liên hệ
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
            
          </div>

          {/* Bottom: Embedded Google Map */}
          <div className="mt-12">
            <div className="bg-white p-4 rounded-xl border border-outline-variant/30 shadow-sm overflow-hidden">
              <h3 className="text-base font-black text-primary border-b border-outline-variant/30 pb-3 mb-4">
                Bản đồ chỉ đường
              </h3>
              <div className="w-full h-[400px] rounded-lg overflow-hidden border border-outline-variant/50 relative">
                <iframe
                  title="HOBA Address Map"
                  src={getMapSrc()}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
            </div>
          </div>
          
        </div>
      </section>

      {/* Floating Toast Notification */}
      {showToast && (
        <div className="fixed bottom-8 right-8 bg-inverse-surface text-inverse-on-surface px-6 py-4 rounded-xl shadow-2xl flex items-center gap-4 z-[100] max-w-sm border border-outline-variant/30 transition-all duration-300">
          <span className="material-symbols-outlined text-green-400">check_circle</span>
          <div className="flex-1">
            <p className="text-xs font-bold">{toastMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
}
