import { executeDirectQuery } from '@/lib/db-direct';
import RegisterClientPage from './RegisterClientPage';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const initialData: any = {};

  try {
    const regData = await executeDirectQuery({
      method: 'SELECT',
      table: 'website_config',
      filters: [{ col: 'key', val: 'registerpage' }],
      isSingle: true
    });
    if (regData?.value) {
      initialData.registerPageConfig = regData.value;
    }

    const genData = await executeDirectQuery({
      method: 'SELECT',
      table: 'website_config',
      filters: [{ col: 'key', val: 'general' }],
      isSingle: true
    });
    if (genData?.value && genData.value.registrationOpen !== undefined) {
      initialData.registrationOpen = genData.value.registrationOpen;
    }
  } catch (error) {
    console.error('[Register SSR] Failed to pre-fetch registration configurations:', error);
  }

  return <RegisterClientPage initialData={initialData} />;
}
