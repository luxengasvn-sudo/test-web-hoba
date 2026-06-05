import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const isValidUrl = (url: string) => {
  return url.startsWith('http://') || url.startsWith('https://');
};

const rawSupabase = supabaseUrl && isValidUrl(supabaseUrl) && supabaseAnonKey && !supabaseAnonKey.includes('anon_key_here')
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Wrap client to intercept storage uploads and compress images client-side to save hosting cost/space
if (rawSupabase) {
  const originalFrom = rawSupabase.storage.from.bind(rawSupabase.storage);
  
  rawSupabase.storage.from = (id: string) => {
    const fileApi = originalFrom(id);
    
    // Intercept upload
    const originalUpload = fileApi.upload.bind(fileApi);
    fileApi.upload = async (path: string, file: any, options?: any) => {
      if ((file instanceof File || file instanceof Blob) && file.type && file.type.startsWith('image/')) {
        try {
          const { compressImage } = await import('./imageCompressor');
          // Adjust dimensions based on path or bucket to maximize compression
          let maxWidth = 1200;
          let maxHeight = 1200;
          
          const lowerPath = path.toLowerCase();
          if (
            lowerPath.includes('logo') || 
            lowerPath.includes('avatar') || 
            lowerPath.includes('featured') ||
            lowerPath.includes('tieu-bieu')
          ) {
            maxWidth = 400;
            maxHeight = 400;
          }
          
          const compressedFile = await compressImage(file as File, { maxWidth, maxHeight, quality: 0.75 });
          return originalUpload(path, compressedFile, options);
        } catch (err) {
          console.error('Error compressing image before upload, uploading raw instead:', err);
        }
      }
      return originalUpload(path, file, options);
    };

    // Intercept update
    const originalUpdate = fileApi.update.bind(fileApi);
    fileApi.update = async (path: string, file: any, options?: any) => {
      if ((file instanceof File || file instanceof Blob) && file.type && file.type.startsWith('image/')) {
        try {
          const { compressImage } = await import('./imageCompressor');
          let maxWidth = 1200;
          let maxHeight = 1200;
          
          const lowerPath = path.toLowerCase();
          if (
            lowerPath.includes('logo') || 
            lowerPath.includes('avatar') || 
            lowerPath.includes('featured') ||
            lowerPath.includes('tieu-bieu')
          ) {
            maxWidth = 400;
            maxHeight = 400;
          }
          
          const compressedFile = await compressImage(file as File, { maxWidth, maxHeight, quality: 0.75 });
          return originalUpdate(path, compressedFile, options);
        } catch (err) {
          console.error('Error compressing image before update, updating raw instead:', err);
        }
      }
      return originalUpdate(path, file, options);
    };

    return fileApi;
  };
}

export const supabase = rawSupabase;

if (!supabase) {
  console.warn(
    "Supabase credentials missing or invalid! Website is running in Mock Data fallback mode. " +
    "Please configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local"
  );
}
