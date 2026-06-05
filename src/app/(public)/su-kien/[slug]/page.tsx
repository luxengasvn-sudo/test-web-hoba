import { supabase } from '@/lib/supabase';
import EventsPage from '../page';

export async function generateStaticParams() {
  if (!supabase) return [{ slug: 'su-kien-hoba' }];

  try {
    const { data, error } = await supabase
      .from('website_config')
      .select('value')
      .eq('key', 'events')
      .single();

    if (error || !data?.value || !Array.isArray(data.value)) {
      return [{ slug: 'su-kien-hoba' }];
    }

    const paths = data.value
      .filter((item: any) => item.slug)
      .map((item: any) => ({
        slug: item.slug,
      }));

    if (paths.length === 0) {
      return [{ slug: 'su-kien-hoba' }];
    }

    return paths;
  } catch (err) {
    console.error('Failed to generate static params for events:', err);
    return [{ slug: 'su-kien-hoba' }];
  }
}

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function EventSlugPage({ params }: PageProps) {
  const { slug } = await params;
  
  // Neu slug rong, la index, hoac chinh la route prefix thi hien thi trang danh sach su kien
  // de khac phuc loi client-side routing Next.js static export load 404 __next._tree.txt
  if (!slug || slug === 'su-kien' || slug === 'index') {
    return <EventsPage />;
  }
  
  return <EventsPage preSelectedSlug={slug} />;
}
