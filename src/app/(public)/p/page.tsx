'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface CustomPage {
  id: string;
  slug: string;
  title: string;
  description: string;
  content: string;
  thumbnail_url: string;
  status: 'Published' | 'Draft';
  created_at: string;
}

function PublicCustomPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const slug = searchParams.get('slug');

  const [page, setPage] = useState<CustomPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [imgSrc, setImgSrc] = useState('');

  const fallbackBanner = 'https://lh3.googleusercontent.com/aida-public/AB6AXuDTnDaM8uzQn1_0DhmhC7KmeGLksQoODMcExU4UgxEcKMACoKgUXJW_2llmo7m-ViDB3xt2KW3AffPsNIEWvPC1uYoP833s0_aSIdyHJqgQJ3M7CeBBlXZb6AXaffkH0smJ-ud5Q1xRd87Fq9fBxQkp-UOoxSITgv85D-HFOp0IhgyruXjbG3lsDx9HPlbswwwJyQC1LeI0F7lTCuuNnRSBcWo3UUy-H2FP9vD9KSPm35z6PtDtTWMejNSdqXtYLoWrH28NsiAEQHc';

  useEffect(() => {
    async function loadPage() {
      setLoading(true);
      
      let customPages: CustomPage[] = [];

      if (!supabase) {
        const saved = localStorage.getItem('hoba_website_custom_pages');
        if (saved) {
          try {
            customPages = JSON.parse(saved);
          } catch (e) {}
        }
      } else {
        try {
          const { data, error } = await supabase
            .from('website_config')
            .select('value')
            .eq('key', 'custom_pages')
            .single();

          if (!error && data?.value?.pages) {
            customPages = data.value.pages;
          }
        } catch (err) {
          console.error('Lỗi khi tải dữ liệu trang độc lập từ Supabase, thử tải local:', err);
          const saved = localStorage.getItem('hoba_website_custom_pages');
          if (saved) {
            try {
              customPages = JSON.parse(saved);
            } catch (e) {}
          }
        }
      }

      const found = customPages.find(p => p.slug === slug);
      if (found && found.status === 'Published') {
        setPage(found);
        setImgSrc(found.thumbnail_url || fallbackBanner);
      } else {
        setPage(null);
      }
      setLoading(false);
    }

    if (slug) {
      loadPage();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="flex-grow pt-32 pb-16 bg-surface flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <div className="animate-spin inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
          <p className="text-xs text-on-surface-variant font-medium">Đang tải nội dung trang...</p>
        </div>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="flex-grow pt-32 pb-16 bg-surface flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-6 max-w-sm px-margin-mobile">
          <span className="material-symbols-outlined text-6xl text-outline-variant">error</span>
          <h2 className="text-xl font-black text-primary">Trang không tồn tại</h2>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            Đường liên kết bạn vừa truy cập không tồn tại, đã bị thay đổi địa chỉ hoặc tạm ẩn bởi ban quản trị.
          </p>
          <button
            onClick={() => router.push('/')}
            className="w-full py-3 bg-primary text-white font-bold text-xs rounded-lg hover:bg-primary-container transition-all active:scale-95 shadow-sm"
          >
            Quay lại Trang chủ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full overflow-x-hidden pt-20">
      <title>{`${page.title} | HOBA LPG`}</title>
      <meta name="description" content={page.description || `Đọc bài viết ${page.title} trên trang thông tin chính thức của Hiệp hội HOBA LPG.`} />
      
      <section className="relative h-[280px] w-full flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-primary/75 z-10"></div>
        <img
          className="absolute inset-0 w-full h-full object-cover"
          alt={page.title}
          src={imgSrc}
          onError={() => {
            setImgSrc(fallbackBanner);
          }}
        />
        <div className="relative z-20 max-w-container-max mx-auto px-margin-mobile md:px-gutter w-full text-white">
          <div className="flex items-center gap-2 text-xs mb-4 opacity-80">
            <Link href="/" className="hover:underline">Trang chủ</Link>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span>{page.title}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black mb-2 leading-tight">{page.title}</h1>
          {page.description && (
            <p className="text-xs md:text-sm max-w-2xl opacity-90 leading-relaxed font-medium line-clamp-2">
              {page.description}
            </p>
          )}
        </div>
      </section>

      <section className="py-12 md:py-16 bg-surface text-xs md:text-sm text-on-surface">
        <div className="max-w-4xl mx-auto px-margin-mobile md:px-gutter">
          <article className="bg-white p-6 md:p-10 rounded-2xl border border-outline-variant/30 shadow-sm space-y-6">
            <div className="border-b border-outline-variant/20 pb-4 flex justify-between items-center text-xs text-on-surface-variant font-semibold">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-base">calendar_month</span> Ngày cập nhật: {page.created_at}
              </span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-base">verified</span> Bản quyền Hiệp hội HOBA
              </span>
            </div>

            {page.description && (
              <p className="text-sm md:text-base font-bold text-on-background leading-relaxed border-l-4 border-secondary pl-4 bg-surface-container-low/40 p-4 rounded-r-xl">
                {page.description}
              </p>
            )}

            <div 
              className="news-detail-content text-xs md:text-sm text-on-surface-variant leading-relaxed font-medium"
              dangerouslySetInnerHTML={{ __html: page.content }} 
            />

            <div className="flex justify-between items-center gap-4 pt-6 border-t border-outline-variant/20 mt-8">
              <Link
                href="/"
                className="px-6 py-2.5 rounded-lg border-2 border-primary text-primary hover:bg-primary/5 font-bold text-xs flex items-center gap-2 transition-all active:scale-95"
              >
                <span className="material-symbols-outlined text-base">arrow_back</span>
                Về trang chủ
              </Link>
              <button 
                onClick={() => window.print()}
                className="px-4 py-2.5 rounded-lg bg-surface-container hover:bg-outline-variant/20 text-on-surface-variant font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 border border-outline-variant/20"
              >
                <span className="material-symbols-outlined text-base">print</span>
                In trang này
              </button>
            </div>
          </article>
        </div>
      </section>
    </div>
  );
}

export default function PublicCustomPage() {
  return (
    <Suspense fallback={
      <div className="flex-grow pt-32 pb-16 bg-surface flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <div className="animate-spin inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
          <p className="text-xs text-on-surface-variant font-medium">Đang tải...</p>
        </div>
      </div>
    }>
      <PublicCustomPageContent />
    </Suspense>
  );
}
