'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import RichEditor from '@/components/admin/RichEditor';

interface EventAdmin {
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
}

export default function AdminEvents() {
  const [events, setEvents] = useState<EventAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);

  // Form States
  const [formTitle, setFormTitle] = useState('');
  const [formDay, setFormDay] = useState('');
  const [formMonth, setFormMonth] = useState('');
  const [formTime, setFormTime] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formIsUpcoming, setFormIsUpcoming] = useState(false);
  const [formDesc, setFormDesc] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('https://images.unsplash.com/photo-1540575467063-178a50c2df87');
  const [imageUploading, setImageUploading] = useState(false);

  const defaultEvents: EventAdmin[] = [
    { id: '1', day: '20', month: 'Tháng 6', title: 'An toàn trong kinh doanh LPG', time: '08:00', location: 'Online Zoom', isUpcoming: true, description: 'Tập huấn kỹ thuật an toàn phòng chống cháy nổ tại các trạm chiết nạp gas.', image_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87' },
    { id: '2', day: '05', month: 'Tháng 7', title: 'Xu hướng chuyển đổi năng lượng', time: '08:30', location: 'TP. Hồ Chí Minh', isUpcoming: false, description: 'Diễn đàn đối thoại về định hướng phát triển năng lượng xanh.', image_url: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2' }
  ];

  const loadEvents = async () => {
    setLoading(true);
    if (!supabase) {
      const saved = localStorage.getItem('hoba_website_config_events');
      if (saved) {
        try {
          setEvents(JSON.parse(saved));
        } catch (e) {
          setEvents(defaultEvents);
        }
      } else {
        setEvents(defaultEvents);
      }
      setLoading(false);
      return;
    }
    try {
      const { data, error } = await supabase
        .from('website_config')
        .select('value')
        .eq('key', 'events')
        .single();

      if (!error && data?.value && Array.isArray(data.value)) {
        setEvents(data.value);
      } else {
        setEvents(defaultEvents);
      }
    } catch (err) {
      console.error('Lỗi tải danh sách sự kiện:', err);
      setEvents(defaultEvents);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const saveEventsList = async (list: EventAdmin[]) => {
    setSaving(true);
    if (supabase) {
      try {
        const { error } = await supabase
          .from('website_config')
          .upsert({
            key: 'events',
            value: list
          });
        if (error) throw error;
      } catch (err) {
        alert('Lỗi lưu danh sách sự kiện: ' + (err as Error).message);
        setSaving(false);
        return;
      }
    } else {
      localStorage.setItem('hoba_website_config_events', JSON.stringify(list));
    }
    setSaving(false);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  const handleOpenAddModal = () => {
    setEditingEventId(null);
    setFormTitle('');
    setFormDay('20');
    setFormMonth('Tháng 6');
    setFormTime('08:00 - 12:00');
    setFormLocation('Hội trường');
    setFormIsUpcoming(true);
    setFormDesc('');
    setFormContent('');
    setFormImageUrl('https://images.unsplash.com/photo-1540575467063-178a50c2df87');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (e: EventAdmin) => {
    setEditingEventId(e.id);
    setFormTitle(e.title);
    setFormDay(e.day);
    setFormMonth(e.month);
    setFormTime(e.time);
    setFormLocation(e.location);
    setFormIsUpcoming(!!e.isUpcoming);
    setFormDesc(e.description || '');
    setFormContent(e.content || '');
    setFormImageUrl(e.image_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87');
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa sự kiện này?')) return;
    const updated = events.filter(e => e.id !== id);
    setEvents(updated);
    await saveEventsList(updated);
  };

  const uploadImage = async (file: File): Promise<string> => {
    if (!supabase) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(URL.createObjectURL(file));
        }, 1000);
      });
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `event-images/${fileName}`;

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

  const handleImageUploadChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageUploading(true);
      try {
        const url = await uploadImage(e.target.files[0]);
        setFormImageUrl(url);
      } catch (err) {
        alert('Lỗi tải hình ảnh lên: ' + (err as Error).message);
      } finally {
        setImageUploading(false);
      }
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle || !formDay || !formMonth) {
      alert('Vui lòng nhập đầy đủ Tiêu đề, Ngày và Tháng diễn ra.');
      return;
    }

    const updated = [...events];
    if (editingEventId) {
      const idx = updated.findIndex(item => item.id === editingEventId);
      if (idx !== -1) {
        updated[idx] = {
          id: editingEventId,
          title: formTitle,
          day: formDay,
          month: formMonth,
          time: formTime,
          location: formLocation,
          isUpcoming: formIsUpcoming,
          description: formDesc,
          content: formContent,
          image_url: formImageUrl
        };
      }
    } else {
      updated.push({
        id: String(Date.now()),
        title: formTitle,
        day: formDay,
        month: formMonth,
        time: formTime,
        location: formLocation,
        isUpcoming: formIsUpcoming,
        description: formDesc,
        content: formContent,
        image_url: formImageUrl
      });
    }

    setEvents(updated);
    setIsModalOpen(false);
    await saveEventsList(updated);
  };

  return (
    <div className="space-y-6 text-xs font-medium">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-outline-variant/20 pb-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-primary">Quản lý Sự kiện & Đào tạo</h2>
          <p className="text-xs text-on-surface-variant mt-1">Lập lịch trình sự kiện giao thương và viết bài viết chi tiết giới thiệu sự kiện.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleOpenAddModal}
            className="bg-primary text-white text-xs px-5 py-2.5 rounded-lg font-bold hover:bg-[#93000d] transition-all flex items-center gap-1.5 shadow-sm"
          >
            <span className="material-symbols-outlined text-sm">event</span> Thêm Sự kiện
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-xl border border-outline-variant/30 shadow-sm overflow-hidden text-xs">
        {loading ? (
          <div className="text-center p-12 text-on-surface-variant font-bold">Đang tải danh sách sự kiện...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low text-on-surface-variant font-bold border-b border-outline-variant/30">
                  <th className="p-4 w-16">Hình ảnh</th>
                  <th className="p-4">Tên sự kiện</th>
                  <th className="p-4 w-28 text-center">Ngày diễn ra</th>
                  <th className="p-4 w-36">Thời gian</th>
                  <th className="p-4 w-44">Địa điểm</th>
                  <th className="p-4 text-center w-28">Trạng thái</th>
                  <th className="p-4 text-center w-24">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {events.length > 0 ? (
                  events.map((e) => (
                    <tr key={e.id} className="hover:bg-surface-container-lowest/40 transition-colors">
                      <td className="p-3">
                        <img
                          src={e.image_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87'}
                          alt={e.title}
                          className="w-10 h-10 object-cover rounded-lg border border-outline-variant/50"
                        />
                      </td>
                      <td className="p-3 font-bold text-primary max-w-xs truncate">{e.title}</td>
                      <td className="p-3 text-center text-on-surface font-semibold">{e.day} {e.month}</td>
                      <td className="p-3 text-on-surface-variant">{e.time}</td>
                      <td className="p-3 text-on-surface-variant truncate max-w-[120px]" title={e.location}>{e.location}</td>
                      <td className="p-3 text-center">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          e.isUpcoming ? 'bg-red-100 text-red-700' : 'bg-outline-variant/30 text-on-surface-variant'
                        }`}>
                          {e.isUpcoming ? 'Sắp diễn ra' : 'Đã diễn ra'}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenEditModal(e)}
                            className="text-primary hover:text-secondary p-1.5 rounded transition-colors"
                            title="Chỉnh sửa chi tiết sự kiện"
                          >
                            <span className="material-symbols-outlined text-sm">edit</span>
                          </button>
                          <button
                            onClick={() => handleDelete(e.id)}
                            className="text-on-surface-variant hover:text-red-500 p-1.5 rounded transition-colors"
                            title="Xóa sự kiện"
                          >
                            <span className="material-symbols-outlined text-sm">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-on-surface-variant">Không có sự kiện nào. Hãy nhấn "Thêm Sự kiện".</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Write/Edit Detailed Event Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          
          <div className="relative bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 md:p-8 z-10 text-xs border border-outline-variant/40 flex flex-col space-y-4">
            <div className="flex justify-between items-center border-b border-outline-variant/30 pb-3 flex-shrink-0">
              <h3 className="text-base font-bold text-primary">
                {editingEventId ? 'Chỉnh sửa Chi tiết Sự kiện' : 'Thêm Sự kiện & Đào tạo mới'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-on-surface-variant hover:text-primary">
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Title */}
                <div className="space-y-1 md:col-span-2">
                  <label className="font-bold text-on-surface-variant block">Tên sự kiện / Lớp đào tạo *</label>
                  <input
                    required
                    className="w-full h-10 px-3 rounded border border-outline-variant/50 focus:border-primary outline-none"
                    placeholder="VD: Tập huấn Kỹ thuật an toàn chiết nạp gas 2026..."
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                  />
                </div>

                {/* Day */}
                <div className="space-y-1">
                  <label className="font-bold text-on-surface-variant block">Ngày diễn ra *</label>
                  <input
                    required
                    className="w-full h-10 px-3 rounded border border-outline-variant/50 focus:border-primary outline-none"
                    placeholder="VD: 20 (Nhập chữ số)"
                    type="text"
                    value={formDay}
                    onChange={(e) => setFormDay(e.target.value)}
                  />
                </div>

                {/* Month */}
                <div className="space-y-1">
                  <label className="font-bold text-on-surface-variant block">Tháng diễn ra *</label>
                  <input
                    required
                    className="w-full h-10 px-3 rounded border border-outline-variant/50 focus:border-primary outline-none"
                    placeholder="VD: Tháng 6"
                    type="text"
                    value={formMonth}
                    onChange={(e) => setFormMonth(e.target.value)}
                  />
                </div>

                {/* Time */}
                <div className="space-y-1">
                  <label className="font-bold text-on-surface-variant block">Giờ / Thời gian cụ thể</label>
                  <input
                    className="w-full h-10 px-3 rounded border border-outline-variant/50 focus:border-primary outline-none"
                    placeholder="VD: 08:30 - 11:30"
                    type="text"
                    value={formTime}
                    onChange={(e) => setFormTime(e.target.value)}
                  />
                </div>

                {/* Location */}
                <div className="space-y-1">
                  <label className="font-bold text-on-surface-variant block">Địa điểm tổ chức</label>
                  <input
                    className="w-full h-10 px-3 rounded border border-outline-variant/50 focus:border-primary outline-none"
                    placeholder="VD: Online Zoom hoặc Địa chỉ sảnh hội nghị"
                    type="text"
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                  />
                </div>

                {/* Event Image */}
                <div className="space-y-1 md:col-span-2">
                  <label className="font-bold text-on-surface-variant block">Hình ảnh đại diện sự kiện</label>
                  <div className="flex gap-2">
                    <input
                      className="flex-grow h-10 px-3 rounded border border-outline-variant/50 focus:border-primary outline-none text-[11px]"
                      placeholder="URL hình ảnh đại diện..."
                      type="text"
                      value={formImageUrl}
                      onChange={(e) => setFormImageUrl(e.target.value)}
                    />
                    <label className="flex items-center justify-center gap-1.5 bg-primary hover:bg-[#93000d] text-white px-4 rounded cursor-pointer font-bold text-[10px] h-10 flex-shrink-0 transition-all">
                      <span className="material-symbols-outlined text-sm">
                        {imageUploading ? 'sync' : 'upload'}
                      </span>
                      {imageUploading ? 'Đang tải...' : 'Tải lên ảnh'}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUploadChange}
                        disabled={imageUploading}
                      />
                    </label>
                  </div>
                  <div className="h-40 rounded-xl overflow-hidden border border-outline-variant bg-surface-container flex items-center justify-center mt-2">
                    <img src={formImageUrl} alt="Preview image" className="h-full w-full object-cover" />
                  </div>
                </div>

                {/* Status Counter */}
                <div className="flex items-center gap-2 p-2 bg-surface-container-low rounded-lg md:col-span-2">
                  <input
                    id="modal-upcoming-check"
                    type="checkbox"
                    className="w-4 h-4 text-primary focus:ring-primary accent-primary rounded cursor-pointer"
                    checked={formIsUpcoming}
                    onChange={(e) => setFormIsUpcoming(e.target.checked)}
                  />
                  <label htmlFor="modal-upcoming-check" className="font-bold text-primary select-none cursor-pointer">
                    Sắp diễn ra? (Nếu bỏ chọn, sự kiện sẽ chuyển sang mục Đã diễn ra/Đã kết thúc)
                  </label>
                </div>

                {/* Short description */}
                <div className="space-y-1 md:col-span-2">
                  <label className="font-bold text-on-surface-variant block">Mô tả ngắn sự kiện</label>
                  <textarea
                    className="w-full h-20 p-3 rounded border border-outline-variant/50 focus:border-primary outline-none resize-y"
                    placeholder="Mô tả tóm tắt về mục đích và nội dung cốt lõi của sự kiện..."
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                  />
                </div>

                {/* Full Article Content */}
                <div className="space-y-1 md:col-span-2">
                  <label className="font-bold text-on-surface-variant block">Bài viết giới thiệu sự kiện chi tiết (WYSIWYG)</label>
                  <RichEditor
                    value={formContent}
                    onChange={(val) => setFormContent(val)}
                    onImageUpload={uploadImage}
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 border-t border-outline-variant/30 pt-4 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-lg border border-outline-variant font-bold hover:bg-surface-container transition-all"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={imageUploading}
                  className="px-6 py-2.5 rounded-lg bg-secondary hover:bg-[#93000d] text-white font-bold transition-all shadow-md disabled:opacity-50"
                >
                  Xác nhận lưu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {showToast && (
        <div className="fixed bottom-8 right-8 bg-inverse-surface text-inverse-on-surface px-6 py-4 rounded-xl shadow-2xl flex items-center gap-4 z-[100] animate-bounce">
          <span className="material-symbols-outlined text-primary-fixed-dim">check_circle</span>
          <span className="text-xs font-bold">Cập nhật danh sách sự kiện thành công!</span>
        </div>
      )}
    </div>
  );
}
