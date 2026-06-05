'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

interface FeaturedMember {
  id: string;
  name: string;
  logo: string;
}

export default function AdminFeaturedMembers() {
  const [members, setMembers] = useState<FeaturedMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // Add Form States
  const [customName, setCustomName] = useState('');
  const [customLogo, setCustomLogo] = useState('');
  const [customUploading, setCustomUploading] = useState(false);

  // Edit Inline States
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editLogo, setEditLogo] = useState('');
  const [editUploading, setEditUploading] = useState(false);

  const defaultFeatured: FeaturedMember[] = [
    { id: 'sp1', name: 'Saigon Petro', logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCUSaADTHuO0LeW68laxKr1qy5yC1GTS_ZMkN3B3Bk8_GdXGeqGYbF0o9npgtS7B1SN9Q0rltt5aXIffVkM3BlPgVVzI8pArb-gKVO2tSlefjfbDUAlMaVWSsY4Eljq9-h-vBmck0v3SrFG9Mj-3v4ZjvKBtgZ4PzNjThhlqmt5XcMsoe9i24a1cqq-o4NItX0xwJ7eNBvZxigXmSDVsR6oQw5flyk3MYT4qmWEVd79cVskyyUgh0YrEvLEPsqb26TSmnVlXMPCh3I' },
    { id: 'cg1', name: 'City Gas', logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB-4CTXIocyVnnwyyHfAW2HBH3dLylJiYdJfzfRNk0sebpSDvYhL9ShY3uTaeX8Kca509b_k-2_UX7kcsoCDloaKRxN9FqWOSAIJ4zT4SUUrnCjxePkI5wOcmj63TodEipgcPO7KNuCorerGkEBENchfOaTXtDAFSwxE9sGyIGFf0GEK3QxcrGNWKxDi8WLTHLdj6X2NKVKo_i1y5GoL9X8w5iqqpca0J-qgEz159K6P6V7Wlw-gMDIqUJZ2ete1qlJtu3WQIUxMrU' },
    { id: 'vg1', name: 'VT-GAS', logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC7eTnvK5aYgdRpQ7r0JrThIhssN0j12GcjAzcrszxjSAtC1JzdscsKEliCTSujgiOjdIduDejriCsmUzgC_jBK4p0R8HAqKoKN5vfBScoDvHnjlazdSDRe3RS2RBm5E0sZPVn48gGk8Z4RYAi8__gyoBMqDSd2Tg_f88VrVSZn6DO26vy0EwdmJljaS9q11ROrep_qQfOz7Ny6V2XBa8ia5yjLujsw4TSYMRx7OF6mB13nu2XoEx9EiyUBJomlpAF9oX3C2n3a6x4' },
    { id: 'pv1', name: 'PETROVIETNAM GAS', logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBwWtf74gYhtlAq1IS1hNQ5pLt7PUyB5KUTbLhgRYv6HnE6oV_u_57wH3tzf7Gu632sw0dDOEGwPcVE9yeyW9nsoSKIYu6zhAnbBNLs_DAMN586bdG_Go0iluqSQSqfzXCkhA6V7FX6c26NfP5RxfXr_v80Y2xIdgeLNu-T-w8aqpnVxVdfLNKXLMrB1VRrMgB_l_1ovROIijGMRTcnJSxHCl2NBnEkiom8SJaaYm29JQdL9cUuZ6FLXiVcFjMeMtcUCUUGAtXcCeg' },
    { id: 'bm1', name: 'BINH MINH ENERGY', logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD1p0v3-44vz10qrmIHA53j7oMkCHzMVTMi5RiGUaylSuVWs9pv-OCq2L2wYHeAumF4kaa_jC97eMHBp9ULCITYP3pv58yMcUnlbyEAb7TpNQekXTlPruB3TmkvQbLogChaztNMoyNxYFHv3c0LRXMwwZDUjCGrLDVqyIJ7kbw9mCF-zL9q7bJNwr67OTVgY8Tgjn_szspCSyNxiRZIm26DU799H-Na5x--fvXe_XpEaj0puYvKfuzKou2VM_UXG1K8cj-7Jx4DTTc' },
    { id: 'vc1', name: 'VIPCO', logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBZpcPDOgvB4aa_20YveL9ydc5ZGz3e8LnSvzQG4FXaJIFdU5ZbWueUPLZQTBPsoLbIL4Drm32xlDbKpgHcxWlkpaVoHvMAni-zTPhV095xHNedL5LcAzMW8gF5jYyGhhtklq6tYZjQ_C-IBiADh13sRgUREZQswv22-z0qJdIrnMlFLXJQaoEY5vzwBzSA-S51cM39LVaVPYWR6orgIxst1DF5oFTdJDJi_GPNGACmXyJqPXQt6iktYG9_lWfwOMdSn80nyxUL0_o' }
  ];

  const loadData = async () => {
    setLoading(true);
    if (!supabase) {
      const saved = localStorage.getItem('hoba_website_config_featured_members');
      if (saved) {
        try {
          setMembers(JSON.parse(saved));
        } catch (e) {
          setMembers(defaultFeatured);
        }
      } else {
        // Try fallback to homepage featuredMembers if any
        const homeSaved = localStorage.getItem('hoba_website_config_homepage');
        if (homeSaved) {
          try {
            const val = JSON.parse(homeSaved);
            if (val.featuredMembers && Array.isArray(val.featuredMembers)) {
              setMembers(val.featuredMembers);
            } else {
              setMembers(defaultFeatured);
            }
          } catch (_) {
            setMembers(defaultFeatured);
          }
        } else {
          setMembers(defaultFeatured);
        }
      }
      setLoading(false);
      return;
    }

    try {
      // Prioritize key = 'featured_members'
      const { data, error } = await supabase
        .from('website_config')
        .select('value')
        .eq('key', 'featured_members')
        .single();

      if (!error && data?.value && Array.isArray(data.value)) {
        setMembers(data.value);
      } else {
        // Try read from key = 'homepage' as fallback
        const { data: homeData } = await supabase
          .from('website_config')
          .select('value')
          .eq('key', 'homepage')
          .single();
        if (homeData?.value?.featuredMembers && Array.isArray(homeData.value.featuredMembers)) {
          setMembers(homeData.value.featuredMembers);
        } else {
          setMembers(defaultFeatured);
        }
      }
    } catch (err) {
      console.error('Lỗi tải danh sách hội viên tiêu biểu:', err);
      setMembers(defaultFeatured);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async (listToSave: FeaturedMember[]) => {
    setSaving(true);
    if (supabase) {
      try {
        const { error } = await supabase
          .from('website_config')
          .upsert({
            key: 'featured_members',
            value: listToSave
          });
        if (error) throw error;
      } catch (err) {
        alert('Lỗi lưu cấu hình lên cơ sở dữ liệu: ' + (err as Error).message);
        setSaving(false);
        return;
      }
    } else {
      localStorage.setItem('hoba_website_config_featured_members', JSON.stringify(listToSave));
    }
    setSaving(false);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const uploadImage = async (file: File): Promise<string> => {
    if (!supabase) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (e) => reject(e);
      });
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `featured-members/${fileName}`;

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

  const handleAddMember = async () => {
    if (!customName.trim()) {
      alert('Vui lòng nhập tên doanh nghiệp!');
      return;
    }

    const updated = [
      ...members,
      {
        id: String(Date.now()),
        name: customName.trim(),
        logo: customLogo.trim()
      }
    ];

    setMembers(updated);
    setCustomName('');
    setCustomLogo('');
    await handleSave(updated);
  };

  const handleUpdateMember = async () => {
    if (editingIndex === null) return;
    if (!editName.trim()) {
      alert('Tên doanh nghiệp không được để trống!');
      return;
    }

    const updated = [...members];
    updated[editingIndex] = {
      ...updated[editingIndex],
      name: editName.trim(),
      logo: editLogo.trim()
    };

    setMembers(updated);
    setEditingIndex(null);
    await handleSave(updated);
  };

  const handleDeleteMember = async (index: number) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa hội viên tiêu biểu "${members[index].name}"?`)) return;

    const updated = members.filter((_, i) => i !== index);
    setMembers(updated);
    if (editingIndex === index) {
      setEditingIndex(null);
    }
    await handleSave(updated);
  };

  const moveUp = async (index: number) => {
    if (index === 0) return;
    const updated = [...members];
    const temp = updated[index];
    updated[index] = updated[index - 1];
    updated[index - 1] = temp;
    setMembers(updated);
    await handleSave(updated);
  };

  const moveDown = async (index: number) => {
    if (index === members.length - 1) return;
    const updated = [...members];
    const temp = updated[index];
    updated[index] = updated[index + 1];
    updated[index + 1] = temp;
    setMembers(updated);
    await handleSave(updated);
  };

  return (
    <div className="space-y-6 text-xs font-medium">
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-outline-variant/20 pb-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-primary">Quản lý Hội viên tiêu biểu</h2>
          <p className="text-xs text-on-surface-variant mt-1">Đăng danh sách đối tác logo hiển thị nổi bật trên Trang chủ và trang Giới thiệu.</p>
        </div>
      </div>

      {/* Main Form Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form add and Edit */}
        <div className="lg:col-span-5 space-y-6">
          {/* Add form */}
          <div className="bg-white border border-outline-variant/30 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-primary flex items-center gap-2 border-b border-outline-variant/20 pb-2">
              <span className="material-symbols-outlined text-lg">add_circle</span> Thêm Hội viên tiêu biểu mới
            </h3>
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="font-bold text-on-surface-variant block">Tên doanh nghiệp / Hội viên *</label>
                <input
                  type="text"
                  placeholder="Ví dụ: SAIGON PETRO, VT-GAS..."
                  className="w-full h-10 px-3 rounded border border-outline-variant/50 focus:border-primary outline-none"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-on-surface-variant block">Link Logo hoặc tải lên</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="URL hình ảnh logo..."
                    className="flex-grow h-10 px-3 rounded border border-outline-variant/50 focus:border-primary outline-none"
                    value={customLogo}
                    onChange={(e) => setCustomLogo(e.target.value)}
                  />
                  <label className="flex items-center justify-center gap-1.5 bg-primary hover:bg-[#93000d] text-white px-4 rounded cursor-pointer font-bold text-[10px] h-10 flex-shrink-0 transition-all select-none">
                    <span className="material-symbols-outlined text-sm">
                      {customUploading ? 'sync' : 'upload'}
                    </span>
                    {customUploading ? 'Đang tải...' : 'Tải ảnh'}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={customUploading}
                      onChange={async (e) => {
                        if (e.target.files && e.target.files[0]) {
                          setCustomUploading(true);
                          try {
                            const url = await uploadImage(e.target.files[0]);
                            setCustomLogo(url);
                          } catch (err) {
                            alert('Lỗi tải ảnh lên: ' + (err as Error).message);
                          } finally {
                            setCustomUploading(false);
                          }
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              {customLogo && (
                <div className="p-3 border border-outline-variant bg-surface-container-low/30 rounded-xl flex items-center justify-center h-28 w-40 mx-auto">
                  <img src={customLogo} alt="Logo preview" className="max-w-full max-h-full object-contain" />
                </div>
              )}

              <button
                type="button"
                onClick={handleAddMember}
                className="w-full py-2.5 bg-primary text-white rounded-lg font-bold text-xs hover:bg-[#93000d] transition-all flex items-center justify-center gap-1.5 shadow-sm"
              >
                <span className="material-symbols-outlined text-sm">add</span> Thêm vào danh sách
              </button>
            </div>
          </div>

          {/* Edit form */}
          {editingIndex !== null && (
            <div className="bg-white border-2 border-secondary/50 rounded-xl p-5 shadow-md space-y-4">
              <h3 className="text-sm font-bold text-secondary flex items-center gap-2 border-b border-outline-variant/20 pb-2">
                <span className="material-symbols-outlined text-lg">edit</span> Chỉnh sửa Hội viên tiêu biểu
              </h3>
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="font-bold text-on-surface-variant block">Tên doanh nghiệp / Hội viên *</label>
                  <input
                    type="text"
                    className="w-full h-10 px-3 rounded border border-outline-variant/50 focus:border-secondary outline-none"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-on-surface-variant block">Link Logo hoặc tải lên</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      className="flex-grow h-10 px-3 rounded border border-outline-variant/50 focus:border-secondary outline-none"
                      value={editLogo}
                      onChange={(e) => setEditLogo(e.target.value)}
                    />
                    <label className="flex items-center justify-center gap-1.5 bg-secondary hover:bg-[#93000d] text-white px-4 rounded cursor-pointer font-bold text-[10px] h-10 flex-shrink-0 transition-all select-none">
                      <span className="material-symbols-outlined text-sm">
                        {editUploading ? 'sync' : 'upload'}
                      </span>
                      {editUploading ? 'Đang tải...' : 'Tải ảnh'}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={editUploading}
                        onChange={async (e) => {
                          if (e.target.files && e.target.files[0]) {
                            setEditUploading(true);
                            try {
                              const url = await uploadImage(e.target.files[0]);
                              setEditLogo(url);
                            } catch (err) {
                              alert('Lỗi tải ảnh lên: ' + (err as Error).message);
                            } finally {
                              setEditUploading(false);
                            }
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>

                {editLogo && (
                  <div className="p-3 border border-outline-variant bg-surface-container-low/30 rounded-xl flex items-center justify-center h-28 w-40 mx-auto">
                    <img src={editLogo} alt="Logo preview" className="max-w-full max-h-full object-contain" />
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleUpdateMember}
                    className="flex-1 py-2.5 bg-secondary text-white rounded-lg font-bold text-xs hover:bg-[#93000d] transition-all"
                  >
                    Lưu thay đổi
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingIndex(null)}
                    className="flex-1 py-2.5 border border-outline-variant text-on-surface-variant hover:bg-surface-container rounded-lg font-bold text-xs transition-all"
                  >
                    Hủy bỏ
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: List of items */}
        <div className="lg:col-span-7">
          <div className="bg-white border border-outline-variant/30 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-primary flex items-center justify-between border-b border-outline-variant/20 pb-2">
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">list_alt</span> Danh sách hiển thị ({members.length})
              </span>
              {saving && <span className="text-[10px] font-medium text-secondary animate-pulse">Đang tự động lưu...</span>}
            </h3>

            {loading ? (
              <div className="text-center p-12 text-on-surface-variant font-bold">Đang tải dữ liệu hội viên tiêu biểu...</div>
            ) : (
              <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                {members.map((member, index) => {
                  if (!member) return null;
                  return (
                    <div key={member.id || index} className="flex justify-between items-center p-3 border border-outline-variant/40 rounded-xl bg-surface-container-lowest/60 hover:bg-surface flex-row gap-4 transition-all">
                      <div className="flex items-center gap-3">
                        <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[9px] shrink-0">
                          {index + 1}
                        </span>
                        <div className="w-12 h-12 border border-outline-variant/35 rounded-lg overflow-hidden flex items-center justify-center bg-white p-1 shrink-0">
                          {member.logo ? (
                            <img src={member.logo} alt={member.name} className="max-w-full max-h-full object-contain" />
                          ) : (
                            <span className="material-symbols-outlined text-outline text-lg">image</span>
                          )}
                        </div>
                        <span className="font-semibold text-on-surface text-[12px]">{member.name}</span>
                      </div>
                      
                      <div className="flex gap-1 shrink-0">
                        <button
                          onClick={() => {
                            setEditingIndex(index);
                            setEditName(member.name);
                            setEditLogo(member.logo || '');
                          }}
                          className="w-7 h-7 rounded-full flex items-center justify-center text-primary hover:bg-primary-container/20 transition-colors"
                          title="Sửa thông tin"
                        >
                          <span className="material-symbols-outlined text-sm">edit</span>
                        </button>
                        <button
                          onClick={() => moveUp(index)}
                          disabled={index === 0}
                          className="w-7 h-7 rounded-full flex items-center justify-center text-on-surface-variant hover:text-primary disabled:opacity-30 hover:bg-surface-container transition-all"
                          title="Di chuyển lên"
                        >
                          <span className="material-symbols-outlined text-sm">arrow_upward</span>
                        </button>
                        <button
                          onClick={() => moveDown(index)}
                          disabled={index === members.length - 1}
                          className="w-7 h-7 rounded-full flex items-center justify-center text-on-surface-variant hover:text-primary disabled:opacity-30 hover:bg-surface-container transition-all"
                          title="Di chuyển xuống"
                        >
                          <span className="material-symbols-outlined text-sm">arrow_downward</span>
                        </button>
                        <button
                          onClick={() => handleDeleteMember(index)}
                          className="w-7 h-7 rounded-full flex items-center justify-center text-secondary hover:text-[#93000d] hover:bg-secondary-container/20 transition-all"
                          title="Xóa bỏ"
                        >
                          <span className="material-symbols-outlined text-sm">delete</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
                {members.length === 0 && (
                  <p className="text-[11px] text-on-surface-variant italic text-center py-12 bg-surface-container-low/20 rounded-xl border border-dashed border-outline-variant/40">Chưa có hội viên tiêu biểu nào được thêm.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Toast Notification */}
      {showToast && (
        <div className="fixed bottom-8 right-8 bg-inverse-surface text-inverse-on-surface px-6 py-4 rounded-xl shadow-2xl flex items-center gap-4 z-[100] animate-bounce">
          <span className="material-symbols-outlined text-primary-fixed-dim">check_circle</span>
          <span className="text-xs font-bold">Cập nhật và lưu danh sách Hội viên tiêu biểu thành công!</span>
        </div>
      )}
    </div>
  );
}
