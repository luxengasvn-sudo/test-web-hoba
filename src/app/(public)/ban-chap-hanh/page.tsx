import { executeDirectQuery } from '@/lib/db-direct';
import CommitteeView from '@/components/public/CommitteeView';
import defaultCommitteeBanChapHanh from '@/lib/defaultCommitteeBanChapHanh.json';

export const dynamic = 'force-dynamic';

export default async function BanChapHanhPage() {
  let initialConfig = defaultCommitteeBanChapHanh;
  let initialMembers = [];
  let initialChapters = [];

  try {
    const configDb = await executeDirectQuery({
      method: 'SELECT',
      table: 'website_config',
      filters: [{ col: 'key', val: 'hoba_website_committee_ban-chap-hanh' }],
      isSingle: true
    });
    if (configDb?.value) {
      initialConfig = typeof configDb.value === 'string' ? JSON.parse(configDb.value) : configDb.value;
    }

    initialMembers = await executeDirectQuery({
      method: 'SELECT',
      table: 'members',
      filters: [{ col: 'status', val: 'Active' }]
    });

    initialChapters = await executeDirectQuery({
      method: 'SELECT',
      table: 'chapters'
    });
  } catch (error) {
    console.error('[BanChapHanh SSR] Failed to pre-fetch:', error);
  }

  return (
    <CommitteeView
      type="ban-chap-hanh"
      initialConfig={initialConfig}
      initialMembers={initialMembers}
      initialChapters={initialChapters}
    />
  );
}
