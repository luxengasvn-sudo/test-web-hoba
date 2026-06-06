import { createClient } from '@supabase/supabase-js';
import { compressImage } from './imageCompressor';

// Helper to get absolute API url on server-side, or relative on client-side
const getApiUrl = (endpoint: string) => {
  if (typeof window !== 'undefined') {
    return endpoint;
  }
  const port = process.env.PORT || '3000';
  return `http://127.0.0.1:${port}${endpoint}`;
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const isValidUrl = (url: string) => {
  try {
    new URL(url);
    return true;
  } catch (_) {
    return false;
  }
};

const rawSupabase = supabaseUrl && isValidUrl(supabaseUrl) && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

class MockSupabaseBuilder {
  private table: string;
  private method: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' | 'UPSERT' = 'SELECT';
  private selects: string = '*';
  private filters: Array<{ col: string; val: any }> = [];
  private orderCol?: string;
  private orderAscending?: boolean;
  private limitCount?: number;
  private isSingle: boolean = false;
  private insertRows: any[] = [];
  private updatePayload: any = {};

  constructor(table: string) {
    this.table = table;
  }

  select(selects: string = '*') {
    this.selects = selects;
    if (this.method !== 'INSERT' && this.method !== 'UPDATE' && this.method !== 'DELETE' && this.method !== 'UPSERT') {
      this.method = 'SELECT';
    }
    return this;
  }

  insert(rows: any | any[]) {
    this.method = 'INSERT';
    this.insertRows = Array.isArray(rows) ? rows : [rows];
    return this;
  }

  update(payload: any) {
    this.method = 'UPDATE';
    this.updatePayload = payload;
    return this;
  }

  delete() {
    this.method = 'DELETE';
    return this;
  }

  upsert(rows: any | any[], options?: any) {
    this.method = 'UPSERT';
    this.insertRows = Array.isArray(rows) ? rows : [rows];
    return this;
  }

  eq(col: string, val: any) {
    this.filters.push({ col, val });
    return this;
  }

  order(col: string, options?: { ascending?: boolean }) {
    this.orderCol = col;
    this.orderAscending = options?.ascending !== false;
    return this;
  }

  limit(count: number) {
    this.limitCount = count;
    return this;
  }

  single() {
    this.isSingle = true;
    return this;
  }

  maybeSingle() {
    this.isSingle = true;
    return this;
  }

  // Promise-like thenable interface
  async then(onfulfilled?: (value: any) => any, onrejected?: (reason: any) => any) {
    try {
      let data: any;

      if (typeof window === 'undefined') {
        // Server-side execution: Call database directly bypassing localhost HTTP network calls
        const { executeDirectQuery } = await import('./db-direct');
        data = await executeDirectQuery({
          method: this.method,
          table: this.table,
          selects: this.selects,
          filters: this.filters,
          orderCol: this.orderCol,
          orderAscending: this.orderAscending,
          limitCount: this.limitCount,
          isSingle: this.isSingle,
          insertRows: this.insertRows,
          updatePayload: this.updatePayload,
        });
      } else {
        // Client-side execution: Use DB HTTP proxy endpoint
        const apiUrl = getApiUrl('/api/db-proxy');
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            method: this.method,
            table: this.table,
            selects: this.selects,
            filters: this.filters,
            orderCol: this.orderCol,
            orderAscending: this.orderAscending,
            limitCount: this.limitCount,
            isSingle: this.isSingle,
            insertRows: this.insertRows,
            updatePayload: this.updatePayload,
          }),
        });

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(errText || `HTTP ${response.status}`);
        }

        data = await response.json();
      }

      const result = { data, error: null };
      if (onfulfilled) {
        return onfulfilled(result);
      }
      return result;
    } catch (err: any) {
      console.error(`[MockSupabase] Error query on table "${this.table}":`, err);
      const result = { data: null, error: { message: err.message || err } };
      if (onfulfilled) {
        return onfulfilled(result);
      }
      return result;
    }
  }
}

// Client-side Image Compression Helper for mock storage upload
const compressIfNeeded = async (path: string, file: any): Promise<any> => {
  if (typeof window === 'undefined') return file;
  if ((file instanceof File || file instanceof Blob) && file.type && file.type.startsWith('image/')) {
    try {
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
      
      return await compressImage(file as File, { maxWidth, maxHeight, quality: 0.75 });
    } catch (err) {
      console.error('Error compressing image in mock storage, using original:', err);
    }
  }
  return file;
};

const mockStorage = {
  from: (bucketName: string) => {
    return {
      upload: async (path: string, file: any, options?: any) => {
        try {
          const finalFile = await compressIfNeeded(path, file);
          const formData = new FormData();
          formData.append('file', finalFile);
          formData.append('path', path);
          formData.append('bucket', bucketName);

          const apiUrl = getApiUrl('/api/storage-proxy');
          const response = await fetch(apiUrl, {
            method: 'POST',
            body: formData,
          });

          if (!response.ok) {
            const errText = await response.text();
            throw new Error(errText || `Upload error HTTP ${response.status}`);
          }

          const resData = await response.json();
          return { data: { path: resData.path }, error: null };
        } catch (err: any) {
          console.error('[MockStorage] Upload error:', err);
          return { data: null, error: { message: err.message || err } };
        }
      },
      update: async (path: string, file: any, options?: any) => {
        try {
          const finalFile = await compressIfNeeded(path, file);
          const formData = new FormData();
          formData.append('file', finalFile);
          formData.append('path', path);
          formData.append('bucket', bucketName);

          const apiUrl = getApiUrl('/api/storage-proxy');
          const response = await fetch(apiUrl, {
            method: 'POST',
            body: formData,
          });

          if (!response.ok) {
            const errText = await response.text();
            throw new Error(errText || `Update error HTTP ${response.status}`);
          }

          const resData = await response.json();
          return { data: { path: resData.path }, error: null };
        } catch (err: any) {
          console.error('[MockStorage] Update error:', err);
          return { data: null, error: { message: err.message || err } };
        }
      },
      getPublicUrl: (path: string) => {
        // Return relative path pointing to Next.js static uploads folder
        return {
          data: {
            publicUrl: `/uploads/${path}`
          }
        };
      },
      remove: async (paths: string[]) => {
        try {
          const apiUrl = getApiUrl('/api/storage-proxy');
          const response = await fetch(apiUrl, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ paths, bucket: bucketName }),
          });

          if (!response.ok) {
            const errText = await response.text();
            throw new Error(errText || `Remove error HTTP ${response.status}`);
          }

          return { data: paths, error: null };
        } catch (err: any) {
          console.error('[MockStorage] Remove error:', err);
          return { data: null, error: { message: err.message || err } };
        }
      }
    };
  }
};

if (rawSupabase) {
  const originalFrom = rawSupabase.storage.from.bind(rawSupabase.storage);
  rawSupabase.storage.from = (id: string) => {
    const fileApi = originalFrom(id);
    const originalUpload = fileApi.upload.bind(fileApi);
    fileApi.upload = async (path: string, file: any, options?: any) => {
      try {
        const finalFile = await compressIfNeeded(path, file);
        return originalUpload(path, finalFile, options);
      } catch (err) {
        console.error('[Supabase Storage] Error compressing before upload, uploading raw instead:', err);
        return originalUpload(path, file, options);
      }
    };

    const originalUpdate = fileApi.update.bind(fileApi);
    fileApi.update = async (path: string, file: any, options?: any) => {
      try {
        const finalFile = await compressIfNeeded(path, file);
        return originalUpdate(path, finalFile, options);
      } catch (err) {
        console.error('[Supabase Storage] Error compressing before update, updating raw instead:', err);
        return originalUpdate(path, file, options);
      }
    };
    return fileApi;
  };
}

export const supabase: any = {
  from: (table: string) => new MockSupabaseBuilder(table),
  storage: rawSupabase ? rawSupabase.storage : mockStorage,
};
