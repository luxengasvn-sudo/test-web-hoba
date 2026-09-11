import { executeDirectQuery } from '@/lib/db-direct';
import CustomClientPage, { CustomPage } from '../CustomClientPage';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
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
        const s = slug.toLowerCase().trim();
        const found = pages.find((p) => {
          const ps = (p.slug || '').toLowerCase().trim();
          const pid = (p.id || '').toLowerCase().trim();
          return (
            ps === s ||
            pid === s ||
            (s === 'dieu-khoan' && ps.includes('dieu-khoan')) ||
            (s === 'chinh-sach' && ps.includes('chinh-sach'))
          );
        });
        if (found && found.status === 'Published') {
          initialData.page = found;
        }
      }
    } catch (error) {
      console.error('[Custom Page SSR] Failed to pre-fetch custom page:', error);
    }
  }

  return <CustomClientPage initialData={initialData} slugProp={slug} />;
}
