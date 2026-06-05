'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  date: string;
  read: boolean;
}

interface GeneralConfig {
  siteName: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  workingHours: string;
  mapEmbedUrl?: string;
  maintenanceMode: boolean;
  registrationOpen: boolean;
}

export default function AdminContact() {
  const [activeTab, setActiveTab] = useState<'messages' | 'config'>('messages');
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingConfig, setSavingConfig] = useState(false);

  // General Contact Settings State
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

  const defaultMessages: ContactMessage[] = [
    { id: '1', name: 'Nguyễn Văn Hùng', email: 'hung.nguyen@gasco.com', phone: '0912 345 678', message: 'Tôi muốn liên hệ để đăng ký khóa huấn luyện PCCC cho 10 kỹ thuật viên trạm chiết nạp gas.', date: '2026-05-30', read: false },
    { id: '2', name: 'Trần Thị Mai', email: 'mai.tran@gmail.com', phone: '0987 654 321', message: 'Hiệp hội có thể gửi cho tôi tài liệu QCVN 08:2026/BCT bản in được không?', date: '2026-05-28', read: true }
  ];

  const fetchMessages = async () => {
    setLoading(true);
    if (!supabase) {
      const saved = localStorage.getItem('hoba_website_contacts');
      if (saved) {
        try {
          setMessages(JSON.parse(saved));
        } catch (e) {
          setMessages(defaultMessages);
        }
      } else {
        setMessages(defaultMessages);
      }
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        const formatted: ContactMessage[] = data.map((d: any) => ({
          id: d.id,
          name: d.name,
          email: d.email,
          phone: d.phone,
          message: d.message,
          date: d.created_at ? d.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
          read: d.is_read
        }));
        setMessages(formatted);
      } else {
        setMessages([]);
      }
    } catch (err) {
      console.error('Lỗi khi tải tin nhắn liên hệ từ Supabase, chuyển sang fallback:', err);
      setMessages(defaultMessages);
    } finally {
      setLoading(false);
    }
  };

  const loadConfig = async () => {
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
      console.error('Lỗi tải cấu hình hệ thống:', err);
    }
  };

  useEffect(() => {
    fetchMessages();
    loadConfig();
  }, []);

  const toggleRead = async (id: string, currentRead: boolean) => {
    const newRead = !currentRead;

    if (!supabase) {
      const updated = messages.map(m => m.id === id ? { ...m, read: newRead } : m);
      setMessages(updated);
      localStorage.setItem('hoba_website_contacts', JSON.stringify(updated));
      return;
    }

    try {
      const { error } = await supabase
        .from('contact_messages')
        .update({ is_read: newRead })
        .eq('id', id);

      if (error) throw error;
      setMessages(prev => prev.map(m => m.id === id ? { ...m, read: newRead } : m));
    } catch (err) {
      alert('Không thể cập nhật trạng thái tin nhắn. Lỗi: ' + (err as Error).message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa tin nhắn liên hệ này?')) return;

    if (!supabase) {
      const updated = messages.filter(m => m.id !== id);
      setMessages(updated);
      localStorage.setItem('hoba_website_contacts', JSON.stringify(updated));
      return;
    }

    try {
      const { error } = await supabase.from('contact_messages').delete().eq('id', id);
      if (error) throw error;
      setMessages(prev => prev.filter(m => m.id !== id));
    } catch (err) {
      alert('Không thể xóa tin nhắn liên hệ. Lỗi: ' + (err as Error).message);
    }
  };

  const handleConfigInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setConfig(prev => ({ ...prev, [name]: value }));
  };

  const handleConfigSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingConfig(true);

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
          ...config
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
        setSavingConfig(false);
        return;
      }
    } else {
      const saved = localStorage.getItem('hoba_website_config_general');
      const currentVal = saved ? JSON.parse(saved) : {};
      const finalVal = {
        ...currentVal,
        ...config
      };
      localStorage.setItem('hoba_website_config_general', JSON.stringify(finalVal));
    }

    setSavingConfig(false);
    alert('Đã cập nhật cấu hình thông tin liên hệ thành công!');
  };

  const totalCount = messages.length;
  const unreadCount = messages.filter(m => !m.read).length;

  return (
    <div className="space-y-6 text-xs font-medium">
      {/* Page Header */}
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-primary">Quản lý Liên hệ</h2>
        <p className="text-xs text-on-surface-variant mt-1">Quản lý hộp thư phản hồi của khách hàng và cập nhật thông tin liên hệ hiển thị trên website.</p>
      </div>

      {/* Tabs Switcher */}
      <div className="flex border-b border-outline-variant/30 gap-6 text-xs mb-4">
        <button
          onClick={() => setActiveTab('messages')}
          className={`pb-2.5 font-bold uppercase border-b-2 transition-all ${
            activeTab === 'messages'
              ? 'border-primary text-primary'
              : 'border-transparent text-on-surface-variant hover:text-primary'
          }`}
        >
          Hộp thư phản hồi ({unreadCount} chưa đọc)
        </button>
        <button
          onClick={() => setActiveTab('config')}
          className={`pb-2.5 font-bold uppercase border-b-2 transition-all ${
            activeTab === 'config'
              ? 'border-primary text-primary'
              : 'border-transparent text-on-surface-variant hover:text-primary'
          }`}
        >
          Cấu hình thông tin liên hệ
        </button>
      </div>

      {activeTab === 'messages' ? (
        <>
          {/* Stats Counter Dashboard */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-xl border border-outline-variant/30 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">Tổng số phản hồi</p>
                <p className="text-2xl font-black text-primary mt-1">{totalCount}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-lg">forum</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-outline-variant/30 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">Chưa xử lý (Chưa đọc)</p>
                <p className="text-2xl font-black text-secondary mt-1">{unreadCount}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
                <span className="material-symbols-outlined text-lg">mark_email_unread</span>
              </div>
            </div>
          </div>

          {/* Messages List */}
          <div className="bg-white rounded-xl border border-outline-variant/30 shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-12 text-center text-xs text-on-surface-variant font-medium">Đang tải tin nhắn liên hệ...</div>
            ) : (
              <div className="divide-y divide-outline-variant/20">
                {messages.length > 0 ? (
                  messages.map((m) => (
                    <div key={m.id} className={`p-6 flex flex-col gap-3 transition-colors ${m.read ? 'bg-white' : 'bg-secondary/5'}`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-primary text-sm flex items-center gap-2">
                            {m.name}
                            {!m.read && <span className="w-2.5 h-2.5 bg-secondary rounded-full" title="Tin nhắn chưa đọc"></span>}
                          </h4>
                          <p className="text-[10px] text-on-surface-variant mt-1.5 font-medium">
                            Email: {m.email} &nbsp;|&nbsp; SĐT: {m.phone} &nbsp;|&nbsp; Ngày gửi: {m.date}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => toggleRead(m.id, m.read)}
                            className="border border-outline-variant/50 hover:bg-surface-container px-3 py-1 rounded font-bold text-[10px] bg-white transition-colors"
                          >
                            {m.read ? 'Đánh dấu chưa đọc' : 'Đánh dấu đã đọc'}
                          </button>
                          <button
                            onClick={() => handleDelete(m.id)}
                            className="text-on-surface-variant hover:text-red-500 p-1 rounded hover:bg-surface-container-low transition-colors"
                            title="Xóa tin nhắn"
                          >
                            <span className="material-symbols-outlined text-base">delete</span>
                          </button>
                        </div>
                      </div>
                      <p className="text-on-surface leading-relaxed whitespace-pre-line text-xs font-semibold">
                        {m.message}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="p-12 text-center text-sm text-on-surface-variant font-medium">
                    Không có tin nhắn liên hệ nào.
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      ) : (
        /* Edit Contact Settings Tab */
        <form onSubmit={handleConfigSubmit} className="space-y-6 max-w-2xl">
          <div className="bg-white p-6 rounded-xl border border-outline-variant/30 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-primary flex items-center gap-2 border-b border-outline-variant/20 pb-2 mb-2">
              <span className="material-symbols-outlined">contact_support</span> Thông tin liên hệ công khai
            </h3>

            {/* Site Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-on-surface-variant uppercase">Tên / Tiêu đề Hiệp hội</label>
              <input
                name="siteName"
                value={config.siteName}
                onChange={handleConfigInputChange}
                className="h-10 border border-outline-variant/50 rounded-lg px-4 bg-surface text-xs text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                type="text"
                placeholder="VD: HOBA LPG - Hiệp hội Kinh doanh Khí hóa lỏng TP.HCM"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase">Hộp thư điện tử (Email)</label>
                <input
                  name="contactEmail"
                  value={config.contactEmail}
                  onChange={handleConfigInputChange}
                  className="h-10 border border-outline-variant/50 rounded-lg px-4 bg-surface text-xs text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  type="email"
                  placeholder="VD: info@hoba.vn"
                />
              </div>

              {/* Hotline */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase">Hotline liên hệ (Số điện thoại)</label>
                <input
                  name="contactPhone"
                  value={config.contactPhone}
                  onChange={handleConfigInputChange}
                  className="h-10 border border-outline-variant/50 rounded-lg px-4 bg-surface text-xs text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  type="text"
                  placeholder="VD: 028 3831 6671"
                />
              </div>
            </div>

            {/* Address */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-on-surface-variant uppercase">Địa chỉ văn phòng chính</label>
              <input
                name="address"
                value={config.address}
                onChange={handleConfigInputChange}
                className="h-10 border border-outline-variant/50 rounded-lg px-4 bg-surface text-xs text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                type="text"
                placeholder="VD: 18A Cộng Hòa, P.12, Q. Tân Bình, TP.HCM"
              />
            </div>

            {/* Working hours */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-on-surface-variant uppercase">Thời gian làm việc</label>
              <textarea
                name="workingHours"
                value={config.workingHours}
                onChange={handleConfigInputChange}
                rows={3}
                className="border border-outline-variant/50 rounded-lg p-3 bg-surface text-xs text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-y"
                placeholder="VD: Thứ 2 - Thứ 6: 08:00 - 17:00&#10;Thứ 7: 08:00 - 12:00"
              />
            </div>

            {/* Google Maps Link */}
            <div className="flex flex-col gap-1.5 bg-surface-container-low p-4 rounded-xl border border-outline-variant/30">
              <label className="text-[10px] font-bold text-primary uppercase">Link nhúng bản đồ Google Maps (Tùy chọn)</label>
              <input
                name="mapEmbedUrl"
                value={config.mapEmbedUrl || ''}
                onChange={handleConfigInputChange}
                className="h-10 border border-outline-variant/50 rounded-lg px-4 bg-white text-xs text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                type="text"
                placeholder="VD: https://www.google.com/maps/embed?pb=..."
              />
              <span className="text-[9px] text-on-surface-variant mt-1 block leading-relaxed">
                <strong>Hướng dẫn:</strong> Mặc định hệ thống tự định vị theo trường Địa chỉ ở trên. Nếu muốn tùy chỉnh bản đồ chính xác hơn, bạn có thể vào Google Maps &rarr; Chia sẻ &rarr; Nhúng bản đồ &rarr; Sao chép đoạn mã <code>&lt;iframe src=&quot;...&quot;&gt;&lt;/iframe&gt;</code> rồi dán vào đây (hệ thống sẽ tự bóc tách đường dẫn).
              </span>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={savingConfig}
              className="bg-secondary text-white text-xs px-8 py-3 rounded-lg font-bold hover:bg-[#93000d] shadow-md transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50"
            >
              {savingConfig ? (
                <>
                  <span className="animate-spin inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full"></span>
                  Đang lưu...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-sm">save</span>
                  Lưu thiết lập liên hệ
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
