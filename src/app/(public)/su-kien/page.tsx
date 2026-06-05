'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { toSlug } from '@/lib/slug';
import defaultEvents from '@/lib/defaultEvents.json';

interface EventItem {
  id: string;
  day: string;
  month: string;
  title: string;
  time: string;
  location: string;
  isUpcoming?: boolean;
  description?: string;
  content?: string;
  image_url?: string;
  slug?: string;
}

export default function EventsPage({ preSelectedSlug }: { preSelectedSlug?: string }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState<'all' | 'upcoming' | 'past'>('all');
  const [events, setEvents] = useState<EventItem[]>(defaultEvents as EventItem[]);
  const [loading, setLoading] = useState(false);

  // Modal Registration & Detail View States
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isRegisterActive, setIsRegisterActive] = useState(false);
  
  // Registration Form States
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const localFallbackEvents: EventItem[] = [
    {
      id: '1',
      day: '20',
      month: 'Tháng 6',
      title: 'Hội thảo: An toàn trong vận hành & Kinh doanh LPG',
      time: '08:00 - 12:00',
      location: 'Hội trường Tòa nhà Thông tấn xã Việt Nam, Quận 3, TP.HCM',
      isUpcoming: true,
      description: 'Tập huấn và đối thoại tháo gỡ các quy định, thông tư mới về kỹ thuật chiết nạp, an toàn PCCC hệ thống bồn chứa gas công nghiệp.',
      image_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87',
      content: `
        <p>Hiệp hội Gas và Kinh doanh Khí hóa lỏng TP.HCM (HOBA) trân trọng kính mời các doanh nghiệp hội viên tham gia buổi Hội thảo chuyên sâu với chủ đề: <strong>"An toàn trong vận hành & Kinh doanh LPG"</strong>.</p>
        <h3>Mục đích Hội thảo:</h3>
        <ul>
          <li>Cập nhật các thông tư, quy định pháp luật mới ban hành về PCCC bồn chứa khí hóa lỏng.</li>
          <li>Chia sẻ các giải pháp số hóa giám sát an toàn trạm chiết nạp gas.</li>
          <li>Trao đổi kinh nghiệm thực tế về phòng ngừa rủi ro rò rỉ khí gas.</li>
        </ul>
        <div class="my-6 text-center content-image-wrapper">
          <img src="https://images.unsplash.com/photo-1513829096970-cf9989577dfc" alt="Conference room" style="max-height: 380px; display: inline-block; border-radius: 8px; max-width: 100%;" />
          <p style="font-size: 11px; color: #64748b; font-style: italic; margin-top: 6px;">Các đại biểu trao đổi tại Hội thảo trước đó</p>
        </div>
        <p>Hội thảo quy tụ hơn 100 chuyên gia kỹ thuật và đại diện các doanh nghiệp LPG hàng đầu khu vực miền Nam. Đây là cơ hội tuyệt vời để liên kết giao thương và chuẩn hóa quy trình an toàn của doanh nghiệp.</p>
      `
    },
    {
      id: '2',
      day: '05',
      month: 'Tháng 7',
      title: 'Lớp đào tạo: Quản lý kỹ thuật trạm nạp và van an toàn bồn chứa',
      time: '08:30 - 16:30',
      location: 'Trung tâm Huấn luyện Kỹ thuật PCCC TP.HCM, Quận 9',
      isUpcoming: true,
      description: 'Khóa huấn luyện nghiệp vụ và cấp chứng chỉ an toàn lao động vận hành thiết bị áp lực chuyên ngành khí hóa lỏng LPG.',
      image_url: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2',
      content: `
        <p>Nhằm nâng cao tay nghề và cập nhật kỹ năng xử lý tình huống khẩn cấp cho đội ngũ vận hành kỹ thuật, HOBA phối hợp cùng Cảnh sát PCCC TP.HCM khai giảng lớp học đặc biệt này.</p>
        <h3>Nội dung khóa học:</h3>
        <p>- Quy trình kiểm định van an toàn và đường ống dẫn áp lực cao.</p>
        <p>- Thực hành ứng phó sự cố rò rỉ LPG tại sa bàn mô phỏng trạm nạp.</p>
        <p>- Kiểm tra sát hạch lý thuyết và thực hành cấp chứng chỉ kỹ thuật viên chuyên nghiệp.</p>
      `
    },
    {
      id: '3',
      day: '12',
      month: 'Tháng 5',
      title: 'Đại hội thường niên HOBA lần thứ XI',
      time: '09:00 - 17:00',
      location: 'Khách sạn Rex Sài Gòn, Quận 1, TP.HCM',
      isUpcoming: false,
      description: 'Đại hội tổng kết hoạt động năm 2025, định hướng kế hoạch hợp tác liên kết và bầu cử ban chấp hành khóa mới nhiệm kỳ 2026-2030.',
      image_url: 'https://images.unsplash.com/photo-1511578314322-379afb476865',
      content: `<p>Đại hội đã diễn ra thành công tốt đẹp với sự đồng thuận cao của hơn 150 đại diện doanh nghiệp. Ban chấp hành khóa mới đã chính thức ra mắt và cam kết đồng hành cùng sự an toàn phát triển ngành gas.</p>`
    }
  ];

  useEffect(() => {
    async function loadEvents() {
      setLoading(true);
      let loadedEvents: EventItem[] = [];
      if (!supabase) {
        const saved = localStorage.getItem('hoba_website_config_events');
        if (saved) {
          try {
            loadedEvents = JSON.parse(saved);
          } catch (e) {
            loadedEvents = localFallbackEvents;
          }
        } else {
          loadedEvents = localFallbackEvents;
        }
      } else {
        try {
          const { data, error } = await supabase
            .from('website_config')
            .select('value')
            .eq('key', 'events')
            .single();

          if (!error && data?.value && Array.isArray(data.value)) {
            loadedEvents = data.value;
          } else {
            loadedEvents = localFallbackEvents;
          }
        } catch (err) {
          console.error('Lỗi tải sự kiện từ Supabase, chuyển sang fallback:', err);
          loadedEvents = localFallbackEvents;
        }
      }
      setEvents(loadedEvents);
      setLoading(false);

      // Deep link to open event modal if id/slug query parameter or prop exists
      try {
        const params = new URLSearchParams(window.location.search);
        const eventId = params.get('id');
        const eventSlug = preSelectedSlug || params.get('slug');
        if (eventId || eventSlug) {
          const match = loadedEvents.find(e => eventId ? e.id === eventId : (e.slug === eventSlug || toSlug(e.title) === eventSlug));
          if (match) {
            setSelectedEvent(match);
            setIsRegisterActive(params.get('register') === 'true');
            setIsDetailModalOpen(true);
          }
        }
      } catch (e) {
        console.error('Error handling event link:', e);
      }
    }
    loadEvents();
  }, [preSelectedSlug]);

  const filteredEvents = useMemo(() => {
    return events.filter((evt) => {
      const matchesSearch =
        evt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        evt.location.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesTab =
        selectedTab === 'all' ||
        (selectedTab === 'upcoming' && evt.isUpcoming) ||
        (selectedTab === 'past' && !evt.isUpcoming);

      return matchesSearch && matchesTab;
    });
  }, [searchQuery, selectedTab, events]);

  const handleOpenDetail = (event: EventItem, registerDirect: boolean = false) => {
    setSelectedEvent(event);
    setIsRegisterActive(registerDirect);
    setIsDetailModalOpen(true);
    setSubmitSuccess(false);
    setFullName('');
    setCompanyName('');
    setEmail('');
    setPhone('');

    // Update browser URL to match clean URL
    try {
      if (event.slug) {
        window.history.pushState({}, '', `/su-kien/${event.slug}`);
      } else {
        window.history.pushState({}, '', `/su-kien?id=${event.id}`);
      }
    } catch (_) {}
  };

  const handleCloseModal = () => {
    setIsDetailModalOpen(false);
    try {
      window.history.pushState({}, '', '/su-kien');
    } catch (_) {}
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    // Simulate API registration submission
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSubmitting(false);
    setSubmitSuccess(true);
  };

  return (
    <div className="flex flex-col w-full overflow-x-hidden">
      <title>Sự kiện & Đào tạo | HOBA LPG</title>
      <meta name="description" content="Lịch trình sự kiện, các khóa đào tạo an toàn kỹ thuật và hội thảo thường niên của Hiệp hội HOBA LPG." />
      {/* Hero Section */}
      <section className="relative h-[300px] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-primary/60 z-10"></div>
        <img
          alt="Events Background"
          className="absolute inset-0 w-full h-full object-cover"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCKsH5RYaymmBXwBYB4zyRhQroDyJz9EeXqIpkdYzvcWQakwnGtExjxW1twLP6-Wof89mA1uyf_iwqE4-MMSBVbWDe4pWEGUKOFXvOUmM8lu9XOVAKPo6JZh2p-o-AUk9E-lzTvSQ1RPPxPRbpUiLaq9mUcLLg52RWVcFO2WJVXjtMQg9EGzYOa_NfWzhWv1PTapeEkyt-eTpGT-gJQUJxoZm16sPHodja2eQ_NxuUYjnivworCpTrWW3R0rj_VrxjZko7l4VwBp_4"
        />
        <div className="relative z-20 max-w-container-max mx-auto px-margin-mobile md:px-gutter w-full text-white">
          <div className="flex items-center gap-2 text-xs mb-4 opacity-80">
            <Link href="/" className="hover:underline">Trang chủ</Link>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span>Sự kiện & Đào tạo</span>
          </div>
          <h1 className="text-4xl font-black mb-2">Sự kiện & Đào tạo</h1>
          <p className="text-sm opacity-80">Cập nhật lịch trình đào tạo kỹ thuật an toàn và các hoạt động hội thảo ngành LPG</p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 bg-surface">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-gutter">
          
          {/* Controls Bar */}
          <div className="bg-white p-6 rounded-xl border border-outline-variant/30 shadow-sm mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Tabs selection */}
            <div className="flex gap-2 p-1 bg-surface-container-low rounded-lg w-full md:w-auto">
              <button
                onClick={() => setSelectedTab('all')}
                className={`flex-1 md:flex-none px-5 py-2 rounded-md font-bold text-xs transition-all ${
                  selectedTab === 'all'
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-on-surface-variant hover:text-primary hover:bg-white/50'
                }`}
              >
                Tất cả sự kiện
              </button>
              <button
                onClick={() => setSelectedTab('upcoming')}
                className={`flex-1 md:flex-none px-5 py-2 rounded-md font-bold text-xs transition-all ${
                  selectedTab === 'upcoming'
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-on-surface-variant hover:text-primary hover:bg-white/50'
                }`}
              >
                Sắp diễn ra
              </button>
              <button
                onClick={() => setSelectedTab('past')}
                className={`flex-1 md:flex-none px-5 py-2 rounded-md font-bold text-xs transition-all ${
                  selectedTab === 'past'
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-on-surface-variant hover:text-primary hover:bg-white/50'
                }`}
              >
                Đã diễn ra
              </button>
            </div>

            {/* Search Input */}
            <div className="w-full md:w-72 relative">
              <input
                className="w-full h-10 pl-10 pr-4 rounded-lg border border-outline-variant bg-white focus:border-primary focus:ring-1 focus:ring-primary text-xs outline-none"
                placeholder="Tìm kiếm sự kiện, địa điểm..."
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-outline text-lg">search</span>
            </div>
          </div>

          {/* Events Grid */}
          {loading ? (
            <div className="text-center py-20 text-on-surface-variant text-sm font-medium">
              Đang tải danh sách sự kiện & đào tạo...
            </div>
          ) : filteredEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {filteredEvents.map((evt) => (
                <div
                  key={evt.id}
                  className="group flex flex-col bg-white rounded-2xl border border-outline-variant/30 hover:border-primary/20 hover:shadow-xl overflow-hidden transition-all duration-500 hover:-translate-y-1"
                >
                  {/* Card Thumbnail / Image & Date overlay */}
                  <div className="relative aspect-video overflow-hidden bg-surface-container">
                    <img
                      src={evt.image_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87'}
                      alt={evt.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    {/* Date overlay badge */}
                    <div
                      className={`absolute top-4 left-4 w-14 h-14 rounded-lg flex flex-col items-center justify-center text-white shadow-md ${
                        evt.isUpcoming ? 'bg-secondary' : 'bg-primary/90 border border-white/20'
                      }`}
                    >
                      <span className="text-lg font-black leading-tight">{evt.day}</span>
                      <span className="text-[7px] font-bold uppercase tracking-wider">{evt.month}</span>
                    </div>
                    {/* Status badge */}
                    <div className="absolute top-4 right-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest text-white backdrop-blur-md ${
                        evt.isUpcoming ? 'bg-secondary/90' : 'bg-black/50 border border-white/15'
                      }`}>
                        {evt.isUpcoming ? 'Sắp diễn ra' : 'Đã kết thúc'}
                      </span>
                    </div>
                  </div>

                  {/* Card content info */}
                  <div className="p-6 flex-grow flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <h3
                        onClick={() => handleOpenDetail(evt, false)}
                        className="text-base md:text-lg font-black text-primary leading-snug hover:text-secondary cursor-pointer transition-colors line-clamp-2"
                      >
                        {evt.title}
                      </h3>
                      {evt.description && (
                        <p className="text-xs text-on-surface-variant leading-relaxed line-clamp-3">
                          {evt.description}
                        </p>
                      )}
                      
                      <div className="pt-2 space-y-1.5 text-xs text-on-surface-variant font-semibold border-t border-outline-variant/20">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-sm text-secondary-fixed-dim">schedule</span>
                          <span>Thời gian: {evt.time}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="material-symbols-outlined text-sm text-secondary-fixed-dim mt-0.5">location_on</span>
                          <span className="line-clamp-1">Địa điểm: {evt.location}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 flex gap-3">
                      <button
                        onClick={() => handleOpenDetail(evt, false)}
                        className="flex-1 border border-primary text-primary hover:bg-primary/5 px-4 py-2.5 rounded-lg font-bold text-xs transition-all"
                      >
                        Chi tiết sự kiện
                      </button>
                      
                      {evt.isUpcoming ? (
                        <button
                          onClick={() => handleOpenDetail(evt, true)}
                          className="flex-1 bg-secondary hover:bg-[#93000d] text-white px-4 py-2.5 rounded-lg font-bold text-xs shadow-sm transition-all"
                        >
                          Đăng ký ngay
                        </button>
                      ) : (
                        <button
                          disabled
                          className="flex-1 border border-outline-variant text-outline-variant/60 px-4 py-2.5 rounded-lg font-bold text-xs cursor-not-allowed text-center"
                        >
                          Đã đóng nhận
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-on-surface-variant text-sm font-medium bg-white rounded-2xl border border-outline-variant/30 shadow-sm">
              Không có sự kiện nào khớp với bộ lọc hiện tại.
            </div>
          )}
        </div>
      </section>

      {/* Detail View & Registration Modal */}
      {isDetailModalOpen && selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleCloseModal}
          />
          
          {/* Modal Box */}
          <div className="relative bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl z-10 text-xs border border-outline-variant/35 flex flex-col">
            {/* Image Header banner */}
            <div className="relative h-60 w-full overflow-hidden flex-shrink-0 bg-surface-container">
              <img
                src={selectedEvent.image_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87'}
                alt="Banner Modal"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
              <button
                onClick={handleCloseModal}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black transition-colors border border-white/20"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
              
              {/* Overlay Event Title & Date info */}
              <div className="absolute bottom-4 left-6 right-6 text-white space-y-2">
                <span className={`inline-block px-2.5 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-widest ${
                  selectedEvent.isUpcoming ? 'bg-secondary' : 'bg-white/20 border border-white/20'
                }`}>
                  {selectedEvent.isUpcoming ? 'Sắp diễn ra' : 'Đã kết thúc'}
                </span>
                <h3 className="text-lg md:text-xl font-black leading-tight text-white shadow-sm">
                  {selectedEvent.title}
                </h3>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 md:p-8 space-y-6">
              {/* Event strip details */}
              <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-surface-container-low border border-outline-variant/30 font-semibold text-primary">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-base text-secondary">schedule</span>
                  <div>
                    <p className="text-[9px] text-on-surface-variant uppercase tracking-widest font-bold">Thời gian</p>
                    <p className="text-xs">{selectedEvent.day} {selectedEvent.month} ({selectedEvent.time})</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-base text-secondary">location_on</span>
                  <div>
                    <p className="text-[9px] text-on-surface-variant uppercase tracking-widest font-bold">Địa điểm</p>
                    <p className="text-xs line-clamp-1" title={selectedEvent.location}>{selectedEvent.location}</p>
                  </div>
                </div>
              </div>

              {/* Toggle switch between Event Intro Article and Registration Form */}
              {selectedEvent.isUpcoming && (
                <div className="flex border-b border-outline-variant/30">
                  <button
                    onClick={() => setIsRegisterActive(false)}
                    className={`flex-1 py-3 text-xs font-bold transition-all border-b-2 text-center uppercase tracking-wider ${
                      !isRegisterActive
                        ? 'border-primary text-primary font-black'
                        : 'border-transparent text-on-surface-variant hover:text-primary'
                    }`}
                  >
                    Bài viết giới thiệu
                  </button>
                  <button
                    onClick={() => setIsRegisterActive(true)}
                    className={`flex-1 py-3 text-xs font-bold transition-all border-b-2 text-center uppercase tracking-wider ${
                      isRegisterActive
                        ? 'border-primary text-primary font-black'
                        : 'border-transparent text-on-surface-variant hover:text-primary'
                    }`}
                  >
                    Đăng ký tham dự
                  </button>
                </div>
              )}

              {/* Tab 1: Detailed Event Article */}
              {!isRegisterActive && (
                <div className="space-y-4">
                  {selectedEvent.description && (
                    <p className="font-bold text-on-surface text-xs leading-relaxed border-l-4 border-secondary pl-3 italic">
                      "{selectedEvent.description}"
                    </p>
                  )}
                  {selectedEvent.content ? (
                    <div
                      className="rich-content-display text-on-surface-variant text-xs leading-relaxed space-y-3"
                      dangerouslySetInnerHTML={{ __html: selectedEvent.content }}
                    />
                  ) : (
                    <p className="text-on-surface-variant text-xs italic">
                      Chi tiết chương trình hội thảo đang được ban tổ chức HOBA cập nhật thêm...
                    </p>
                  )}
                  {selectedEvent.isUpcoming && (
                    <div className="pt-4 text-center">
                      <button
                        onClick={() => setIsRegisterActive(true)}
                        className="bg-primary hover:bg-secondary text-white px-8 py-3 rounded-full font-bold text-xs shadow-md transition-all uppercase tracking-wider"
                      >
                        Đăng ký tham gia ngay
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: Registration Form */}
              {isRegisterActive && selectedEvent.isUpcoming && (
                <div className="space-y-4">
                  {submitSuccess ? (
                    <div className="text-center py-8 space-y-4">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600">
                        <span className="material-symbols-outlined text-4xl">check_circle</span>
                      </div>
                      <h3 className="text-lg font-bold text-primary">Gửi đăng ký thành công!</h3>
                      <p className="text-on-surface-variant text-xs leading-relaxed max-w-sm mx-auto">
                        Cảm ơn bạn đã đăng ký tham gia sự kiện. Ban thư ký HOBA sẽ gửi email thông báo kèm tài liệu hội thảo và mã số check-in sớm nhất có thể.
                      </p>
                      <button
                        onClick={handleCloseModal}
                        className="px-6 py-2.5 bg-primary text-white font-bold rounded-lg hover:bg-secondary transition-all"
                      >
                        Hoàn tất
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleRegisterSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="font-bold text-on-surface-variant block">Họ và tên người đại diện *</label>
                          <input
                            required
                            className="w-full h-10 px-3 rounded border border-outline-variant focus:border-primary outline-none"
                            placeholder="Nhập họ tên người tham gia..."
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="font-bold text-on-surface-variant block">Tên đơn vị / Doanh nghiệp *</label>
                          <input
                            required
                            className="w-full h-10 px-3 rounded border border-outline-variant focus:border-primary outline-none"
                            placeholder="Nhập tên doanh nghiệp..."
                            type="text"
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="font-bold text-on-surface-variant block">Địa chỉ Email *</label>
                          <input
                            required
                            className="w-full h-10 px-3 rounded border border-outline-variant focus:border-primary outline-none"
                            placeholder="example@domain.com"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="font-bold text-on-surface-variant block">Số điện thoại liên hệ *</label>
                          <input
                            required
                            className="w-full h-10 px-3 rounded border border-outline-variant focus:border-primary outline-none"
                            placeholder="Nhập số điện thoại..."
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="pt-4 flex justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => setIsRegisterActive(false)}
                          className="px-5 py-2.5 rounded-lg border border-outline-variant font-bold hover:bg-surface-container transition-all"
                        >
                          Quay lại bài viết
                        </button>
                        <button
                          type="submit"
                          disabled={submitting}
                          className="px-6 py-2.5 bg-secondary text-white font-bold rounded-lg hover:bg-[#93000d] transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-md"
                        >
                          {submitting ? (
                            <>
                              <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
                              Đang đăng ký...
                            </>
                          ) : (
                            <>Xác nhận đăng ký tham dự</>
                          )}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
