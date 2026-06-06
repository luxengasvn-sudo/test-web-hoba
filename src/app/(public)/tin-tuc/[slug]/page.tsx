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

export default async function NewsSlugPage({ params }: PageProps) {
  const { slug } = await params;
  
  if (!slug || slug === 'tin-tuc' || slug === 'index') {
    return <NewsClientPage />;
  }

  const initialData: any = {};

  try {
    // Fetch published news to resolve slug and find recent news
    const newsDb = await executeDirectQuery({
      method: 'SELECT',
      table: 'news',
      filters: [{ col: 'status', val: 'Published' }],
      orderCol: 'publish_date',
      orderAscending: false
    });

    let formattedNews: any[] = [];
    if (newsDb && newsDb.length > 0) {
      formattedNews = newsDb.map((d: any) => {
        let formattedDate = d.publish_date;
        try {
          const dt = new Date(d.publish_date);
          formattedDate = `${dt.getDate()} Tháng ${dt.getMonth() + 1}, ${dt.getFullYear()}`;
        } catch (_) {}

        return {
          id: d.id,
          title: d.title,
          slug: d.slug,
          desc: d.description || '',
          content: d.content || '',
          category: d.category,
          date: formattedDate,
          img: d.thumbnail_url || 'https://images.unsplash.com/photo-1542282088-fe8426682b8f',
          isFeatured: d.is_featured
        };
      });
    }

    const article = formattedNews.find((n: any) => 
      n.slug === slug || toSlug(n.title) === slug
    );

    if (article) {
      initialData.article = article;
      initialData.recentNews = formattedNews.filter((n: any) => n.id !== article.id).slice(0, 3);
    }
  } catch (error) {
    console.error('[News Detail SSR] Failed to pre-fetch database config:', error);
  }
  
  return <NewsDetailPage slug={slug} initialData={initialData} />;
}
