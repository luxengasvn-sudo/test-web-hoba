import { executeDirectQuery } from '@/lib/db-direct';
import CustomClientPage, { CustomPage } from './CustomClientPage';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{
    slug?: string;
  }>;
}

export default async function Page({ searchParams }: PageProps) {
  const { slug } = await searchParams;
  const initialData: any = {};

  if (slug) {
    try {
      const data = await executeDirectQuery({
        method: 'SELECT',
        table: 'website_config',
        filters: [{ col: 'key', val: 'custom_pages' }],
        isSingle: true
      });

      if (data?.value?.pages) {
        const pages: CustomPage[] = data.value.pages;
        const found = pages.find((p) => p.slug === slug);
        if (found && found.status === 'Published') {
          initialData.page = found;
        }
      }
    } catch (error) {
      console.error('[Custom Page SSR] Failed to pre-fetch custom page:', error);
    }
  }

  return <CustomClientPage initialData={initialData} />;
}
