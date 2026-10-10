import { executeDirectQuery } from '@/lib/db-direct';
import NewsClientPage from './NewsClientPage';
import { toSlug } from '@/lib/slug';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{
    id?: string;
    slug?: string;
    cat?: string;
  }>;
}

export default async function Page({ searchParams }: PageProps) {
  const { id, slug } = await searchParams;
  const initialData: any = {};

  try {
    // 1. Fetch published news (summary only for listing - no heavy content column)
    const newsDb = await executeDirectQuery({
      method: 'SELECT',
      table: 'news',
      selects: 'id, title, slug, description, category, publish_date, thumbnail_url, is_featured',
      filters: [{ col: 'status', val: 'Published' }],
      orderCol: 'publish_date',
      orderAscending: false
    });

    // 2. Fetch categories
    const categoriesDb = await executeDirectQuery({
      method: 'SELECT',
      table: 'news_categories',
      orderCol: 'display_order',
      orderAscending: true
    });
    initialData.categories = categoriesDb || [];

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
          category: d.category,
          date: formattedDate,
          img: d.thumbnail_url || 'https://images.unsplash.com/photo-1542282088-fe8426682b8f',
          isFeatured: d.is_featured
        };
      });
    }

    // 2. Fetch top 3 documents for sidebar
    const docsDb = await executeDirectQuery({
      method: 'SELECT',
      table: 'documents',
      orderCol: 'publish_date',
      orderAscending: false,
      limitCount: 3
    });

    let formattedDocs: any[] = [];
    if (docsDb && docsDb.length > 0) {
      formattedDocs = docsDb.map((d: any) => {
        let formattedDate = d.publish_date;
        try {
          const dt = new Date(d.publish_date);
          formattedDate = `${dt.getDate()}/${dt.getMonth() + 1}/${dt.getFullYear()}`;
        } catch (_) {}
        return {
          title: d.title,
          date: formattedDate
        };
      });
    }

    initialData.newsList = formattedNews;
    initialData.sidebarDocs = formattedDocs;

    // 3. Resolve single article & recent news if id or slug is present
    if (id || slug) {
      const singleDb = await executeDirectQuery({
        method: 'SELECT',
        table: 'news',
        selects: 'id, title, slug, description, content, category, publish_date, thumbnail_url, is_featured',
        filters: id ? [{ col: 'id', val: id }] : [{ col: 'slug', val: slug }],
        isSingle: true
      });

      if (singleDb) {
        let formattedDate = singleDb.publish_date;
        try {
          const dt = new Date(singleDb.publish_date);
          formattedDate = `${dt.getDate()} Tháng ${dt.getMonth() + 1}, ${dt.getFullYear()}`;
        } catch (_) {}

        initialData.article = {
          id: singleDb.id,
          title: singleDb.title,
          slug: singleDb.slug,
          desc: singleDb.description || '',
          content: singleDb.content || '',
          category: singleDb.category,
          date: formattedDate,
          img: singleDb.thumbnail_url || 'https://images.unsplash.com/photo-1542282088-fe8426682b8f',
          isFeatured: singleDb.is_featured
        };
        initialData.recentNews = formattedNews.filter((n: any) => n.id !== singleDb.id).slice(0, 3);
      }
    }

  } catch (error) {
    console.error('[News SSR] Failed to pre-fetch database config:', error);
  }

  return <NewsClientPage initialData={initialData} />;
}
