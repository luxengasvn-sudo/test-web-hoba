import { executeDirectQuery } from '@/lib/db-direct';
import ChaptersClientPage from './ChaptersClientPage';

export const dynamic = 'force-dynamic';

export default async function Page() {
  let initialChapters = [];
  let initialMembers = [];
  
  try {
    // Fetch chapters data directly from PostgreSQL on the server
    initialChapters = await executeDirectQuery({
      method: 'SELECT',
      table: 'chapters'
    });

    // Fetch active members data directly from PostgreSQL on the server
    initialMembers = await executeDirectQuery({
      method: 'SELECT',
      table: 'members',
      filters: [{ col: 'status', val: 'Active' }]
    });
  } catch (error) {
    console.error('[Chapters SSR] Failed to fetch server-side database data:', error);
  }

  return (
    <ChaptersClientPage 
      initialChapters={initialChapters} 
      initialMembers={initialMembers} 
    />
  );
}
