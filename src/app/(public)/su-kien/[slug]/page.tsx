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
  params: {
    slug: string;
  };
}

export default function EventSlugPage({ params }: PageProps) {
  return <EventsPage preSelectedSlug={params.slug} />;
}
