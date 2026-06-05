'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface MediaItem {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'video';
  size: string;
}

export default function AdminLibrary() {
  const [media, setMedia] = useState<MediaItem[]>([
    { id: '1', name: 'corporate-meeting.jpg', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBqie_pC3yMckoN2RbI--_RMwqaycD-sE8uNjKGm1FYP4SuDo4Bk_DoW8FUfF5HZBFyE2S74tiVXbJg9vHPDi60KxsMnl9tK_9RvcEVcILr8J8xd5TjTAruNuf3db-Gwy4Kb5FvIKtk35uWDdSOWlVsvITLSEFRwOtiZ4946ZRBlOrGlV9a4b40tsttuO67wPg5hKgKI3TVz1c8T_rONHoB_-tlV2x6YjTCExPwRqjjfG4Qm2IJnhUprj3rNJr25ksTMbc-7ceVtUA', type: 'image', size: '420 KB' },
    { id: '2', name: 'lpg-terminal.jpg', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC981IWi1G9KO6TlBAeTvoEdHnU475mZUvpzKUy14ifBcHuc4b2zuDgHQNPQ2pPa1hNnCLFGrjwaaqqGhFcVpcCxdIlQZV1p_Vb6d2wfxy59lin66jklDgq9NGYjR4dSi5aUJ7vP7rQGNc70B9WC-g9cGfWoyIgi8SpKmbuwy2b4E7XrzpBKz9l2Gyr2B2cvva27oEuWW85ETPFGIk24eGr6JkgaTYZVPHxuaRxATS-URlM6yT-Jnu0VnYiPfUXGOeqtIJtDpOw4a0', type: 'image', size: '890 KB' }
  ]);

  useEffect(() => {
    async function loadLibrary() {
      if (!supabase) {
        const saved = localStorage.getItem('hoba_website_config_library');
        if (saved) {
          try {
            setMedia(JSON.parse(saved));
          } catch (e) {}
        }
        return;
      }
      try {
        const { data, error } = await supabase
          .from('website_config')
          .select('value')
          .eq('key', 'library')
          .single();

        if (!error && data?.value && Array.isArray(data.value)) {
          setMedia(data.value);
        }
      } catch (err) {
        console.error('Lỗi tải thư viện truyền thông:', err);
      }
    }
    loadLibrary();
  }, []);

  const saveLibraryToDb = async (updatedMedia: MediaItem[]) => {
    if (supabase) {
      try {
        const { error } = await supabase
          .from('website_config')
          .upsert({
            key: 'library',
            value: updatedMedia
          });
        if (error) throw error;
      } catch (err) {
        alert('Lỗi lưu thư viện lên database: ' + (err as Error).message);
      }
    } else {
      localStorage.setItem('hoba_website_config_library', JSON.stringify(updatedMedia));
    }
  };

  const [uploading, setUploading] = useState(false);

  const uploadFile = async (file: File): Promise<string> => {
    if (!supabase) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(URL.createObjectURL(file));
        }, 1000);
      });
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `library/${fileName}`;

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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploading(true);
      try {
        const url = await uploadFile(file);
        
        const sizeInKB = Math.round(file.size / 1024);
        const sizeStr = sizeInKB > 1024 
          ? `${(sizeInKB / 1024).toFixed(1)} MB` 
          : `${sizeInKB} KB`;

        const newMedia: MediaItem = {
          id: String(Date.now()),
          name: file.name,
          url: url,
          type: file.type.startsWith('video') ? 'video' : 'image',
          size: sizeStr
        };

        const updated = [newMedia, ...media];
        setMedia(updated);
        await saveLibraryToDb(updated);
      } catch (err) {
        alert('Lỗi tải tệp lên: ' + (err as Error).message);
      } finally {
        setUploading(false);
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa tệp truyền thông này khỏi thư viện?')) return;
    const updated = media.filter(m => m.id !== id);
    setMedia(updated);
    await saveLibraryToDb(updated);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center border-b border-outline-variant/20 pb-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-primary">Thư viện Truyền thông</h2>
          <p className="text-xs text-on-surface-variant mt-1">Quản lý hình ảnh và video lưu trữ sử dụng cho các bài viết, sự kiện.</p>
        </div>
        <label
          className="bg-primary text-white text-xs px-4 py-2.5 rounded-lg font-bold hover:bg-[#93000d] transition-all cursor-pointer flex items-center gap-1.5"
        >
          <span className="material-symbols-outlined text-sm">
            {uploading ? 'sync' : 'upload_file'}
          </span>
          {uploading ? 'Đang tải lên...' : 'Tải lên Tệp'}
          <input
            type="file"
            accept="image/*,video/*"
            className="hidden"
            onChange={handleFileUpload}
            disabled={uploading}
          />
        </label>
      </div>

      {/* Media Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {media.length > 0 ? (
          media.map((m) => (
            <div key={m.id} className="bg-white border border-outline-variant/30 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group relative">
              <div className="h-32 bg-surface-container-low flex items-center justify-center overflow-hidden">
                <img src={m.url} alt={m.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              </div>
              <div className="p-3 text-xs flex justify-between items-center border-t border-outline-variant/20">
                <div className="truncate flex-1 pr-2">
                  <p className="font-bold text-on-background truncate">{m.name}</p>
                  <p className="text-[10px] text-on-surface-variant mt-0.5">{m.size}</p>
                </div>
                <button
                  onClick={() => handleDelete(m.id)}
                  className="text-on-surface-variant hover:text-red-500 transition-colors"
                  title="Xóa tệp"
                >
                  <span className="material-symbols-outlined text-base">delete</span>
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-4 p-12 text-center text-on-surface-variant">Thư viện trống. Hãy tải lên ảnh đầu tiên!</div>
        )}
      </div>
    </div>
  );
}
