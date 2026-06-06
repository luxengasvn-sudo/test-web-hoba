import { executeDirectQuery } from '@/lib/db-direct';
import EventsClientPage from './EventsClientPage';
import defaultEvents from '@/lib/defaultEvents.json';

export const dynamic = 'force-dynamic';

interface PageProps {
  preSelectedSlug?: string;
}

export default async function Page({ preSelectedSlug }: PageProps) {
  const initialData: any = {};

  try {
    const eventsConfig = await executeDirectQuery({
      method: 'SELECT',
      table: 'website_config',
      filters: [{ col: 'key', val: 'events' }],
      isSingle: true
    });
    initialData.events = (eventsConfig?.value && Array.isArray(eventsConfig.value)) ? eventsConfig.value : defaultEvents;
  } catch (err) {
    console.error('[Events SSR] Failed to pre-fetch events config:', err);
    initialData.events = defaultEvents;
  }

  return <EventsClientPage preSelectedSlug={preSelectedSlug} initialData={initialData} />;
}
