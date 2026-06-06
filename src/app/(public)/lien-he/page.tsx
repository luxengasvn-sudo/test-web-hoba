import { executeDirectQuery } from '@/lib/db-direct';
import ContactClientPage from './ContactClientPage';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const initialData: any = {};

  try {
    const data = await executeDirectQuery({
      method: 'SELECT',
      table: 'website_config',
      filters: [{ col: 'key', val: 'general' }],
      isSingle: true
    });

    if (data?.value) {
      initialData.config = data.value;
    }
  } catch (error) {
    console.error('[Contact SSR] Failed to pre-fetch contact config:', error);
  }

  return <ContactClientPage initialData={initialData} />;
}
