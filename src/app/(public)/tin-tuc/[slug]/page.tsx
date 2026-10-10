import type { Metadata } from 'next';
import { executeDirectQuery } from '@/lib/db-direct';
import { supabase } from '@/lib/supabase';
import NewsClientPage, { NewsDetailPage } from '../NewsClientPage';
import { toSlug } from '@/lib/slug';

export const dynamic = 'force-dynamic';

export async function generateStaticParams() {
  if (!supabase) return [{ slug: 'tin-tuc-hoba' }];

  try {
    const { data, error } = await supabase
      .from('news')
      .select('slug')
      .eq('status', 'Published');

    if (error || !data) {
      console.warn('Error fetching slugs directly, falling back to title-based slugs:', error);
      const { data: fallbackData } = await supabase
        .from('news')
        .select('title')
        .eq('status', 'Published');
      
      if (fallbackData && fallbackData.length > 0) {
        return fallbackData.map((item: any) => ({
          slug: toSlug(item.title),
        }));
      }
      return [{ slug: 'tin-tuc-hoba' }];
    }

    const paths = data
      .filter((item: any) => item.slug)
      .map((item: any) => ({
        slug: item.slug,
      }));

    if (paths.length === 0) {
      const { data: fallbackData } = await supabase
        .from('news')
        .select('title')
        .eq('status', 'Published');
      
      if (fallbackData && fallbackData.length > 0) {
        return fallbackData.map((item: any) => ({
          slug: toSlug(item.title),
        }));
      }
      return [{ slug: 'tin-tuc-hoba' }];
    }

    return paths;
  } catch (err) {
    console.error('Failed to generate static params for news:', err);
    return [{ slug: 'tin-tuc-hoba' }];
  }
}

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  if (!slug || slug === 'tin-tuc' || slug === 'index') {
    return {
      title: 'Tin tức & Hoạt động | HOBA LPG',
      description: 'Cập nhật tin tức, sự kiện và bản tin chuyên ngành khí hóa lỏng từ Hiệp hội HOBA LPG.',
    };
  }

  try {
    let article = await executeDirectQuery({
      method: 'SELECT',
      table: 'news',
      selects: 'title, description, thumbnail_url, slug',
      filters: [{ col: 'slug', val: slug }],
      isSingle: true
    });

    if (!article) {
      const allNews = await executeDirectQuery({
        method: 'SELECT',
        table: 'news',
        selects: 'title, description, thumbnail_url, slug',
        filters: [{ col: 'status', val: 'Published' }],
        limitCount: 50
      });
      if (allNews && allNews.length > 0) {
        article = allNews.find((n: any) => n.slug === slug || toSlug(n.title) === slug);
      }
    }

    if (article) {
      const title = `${article.title} | HOBA LPG`;
      const description = article.description || 'Tin tức từ Hiệp hội Kinh doanh Khí hóa lỏng TP.HCM (HOBA LPG)';
      const imageUrl = article.thumbnail_url || 'https://images.unsplash.com/photo-1542282088-fe8426682b8f';

      return {
        title,
        description,
        openGraph: {
          title: article.title,
          description,
          type: 'article',
          images: [
            {
              url: imageUrl,
              width: 1200,
              height: 630,
              alt: article.title,
            },
          ],
        },
        twitter: {
          card: 'summary_large_image',
          title: article.title,
          description,
          images: [imageUrl],
        },
      };
    }
  } catch (error) {
    console.error('Failed to generate metadata for news slug:', error);
  }

  return {
    title: 'Tin tức | HOBA LPG',
    description: 'Cổng thông tin Hiệp hội Kinh doanh Khí hóa lỏng TP.HCM (HOBA LPG)',
  };
}

export default async function NewsSlugPage({ params }: PageProps) {
  const { slug } = await params;
  
  if (!slug || slug === 'tin-tuc' || slug === 'index') {
    return <NewsClientPage />;
  }

  const initialData: any = {};

  try {
    // 1. Fetch the requested article directly (including content)
    let articleDb = await executeDirectQuery({
      method: 'SELECT',
      table: 'news',
      selects: 'id, title, slug, description, content, category, publish_date, thumbnail_url, is_featured',
      filters: [{ col: 'slug', val: slug }],
      isSingle: true
    });

    if (!articleDb) {
      // Fallback in case slug is based on transliterated title
      const allNews = await executeDirectQuery({
        method: 'SELECT',
        table: 'news',
        selects: 'id, title, slug, description, content, category, publish_date, thumbnail_url, is_featured',
        filters: [{ col: 'status', val: 'Published' }],
        limitCount: 50
      });
      if (allNews && allNews.length > 0) {
        articleDb = allNews.find((n: any) => n.slug === slug || toSlug(n.title) === slug);
      }
    }

    if (articleDb) {
      let formattedDate = articleDb.publish_date;
      try {
        const dt = new Date(articleDb.publish_date);
        formattedDate = `${dt.getDate()} Tháng ${dt.getMonth() + 1}, ${dt.getFullYear()}`;
      } catch (_) {}

      initialData.article = {
        id: articleDb.id,
        title: articleDb.title,
        slug: articleDb.slug,
        desc: articleDb.description || '',
        content: articleDb.content || '',
        category: articleDb.category,
        date: formattedDate,
        img: articleDb.thumbnail_url || 'https://images.unsplash.com/photo-1542282088-fe8426682b8f',
        isFeatured: articleDb.is_featured
      };

      // 2. Fetch recent news for sidebar: ONLY summary fields (WITHOUT content)
      const recentDb = await executeDirectQuery({
        method: 'SELECT',
        table: 'news',
        selects: 'id, title, slug, description, category, publish_date, thumbnail_url',
        filters: [{ col: 'status', val: 'Published' }],
        orderCol: 'publish_date',
        orderAscending: false,
        limitCount: 4
      });

      if (recentDb && recentDb.length > 0) {
        initialData.recentNews = recentDb
          .filter((n: any) => n.id !== articleDb.id)
          .slice(0, 3)
          .map((d: any) => {
            let rDate = d.publish_date;
            try {
              const dt = new Date(d.publish_date);
              rDate = `${dt.getDate()} Tháng ${dt.getMonth() + 1}, ${dt.getFullYear()}`;
            } catch (_) {}
            return {
              id: d.id,
              title: d.title,
              slug: d.slug,
              desc: d.description || '',
              category: d.category,
              date: rDate,
              img: d.thumbnail_url || 'https://images.unsplash.com/photo-1542282088-fe8426682b8f'
            };
          });
      }
    }
  } catch (error) {
    console.error('[News Detail SSR] Failed to pre-fetch database config:', error);
  }
  
  return <NewsDetailPage slug={slug} initialData={initialData} />;
}
