import { executeDirectQuery } from '@/lib/db-direct';
import CustomClientPage, { CustomPage } from '../p/CustomClientPage';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const slug = 'chinh-sach-bao-mat';
  const initialData: any = {};

  try {
    const data = await executeDirectQuery({
      method: 'SELECT',
      table: 'website_config',
      filters: [{ col: 'key', val: 'custom_pages' }],
      isSingle: true
    });

    if (data?.value?.pages) {
      const pages: CustomPage[] = data.value.pages;
      const found = pages.find((p) => p.slug === slug || p.id === 'bao-mat' || p.slug.includes('chinh-sach'));
      if (found && found.status === 'Published') {
        initialData.page = found;
      }
    }
  } catch (error) {
    console.error('[Privacy Page SSR] Failed to pre-fetch privacy page:', error);
  }

  return <CustomClientPage initialData={initialData} slugProp={slug} />;
}
