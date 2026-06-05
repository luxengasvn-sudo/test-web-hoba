import { supabase } from '@/lib/supabase';
import NewsPage, { NewsDetailPage } from '../page';
import { toSlug } from '@/lib/slug';

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
      // If there are no custom slugs defined, let's fallback to title slugs
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
  
  // Neu slug rong, la index, hoac chinh la route prefix thi hien thi trang danh sach tin tuc
  // de khac phuc loi client-side routing Next.js static export load 404 __next._tree.txt
  if (!slug || slug === 'tin-tuc' || slug === 'index') {
    return <NewsPage />;
  }
  
  return <NewsDetailPage slug={slug} />;
}
