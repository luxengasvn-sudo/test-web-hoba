import { executeDirectQuery } from '@/lib/db-direct';
import AboutClientPage from './AboutClientPage';
import defaultAboutPage from '@/lib/defaultAboutPage.json';
import { DEFAULT_HOBA_LOGO } from '@/lib/constants';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const initialData: any = {};

  try {
    // 1. Fetch about config
    const aboutConfig = await executeDirectQuery({
      method: 'SELECT',
      table: 'website_config',
      filters: [{ col: 'key', val: 'aboutpage' }],
      isSingle: true
    });
    initialData.aboutConfig = aboutConfig?.value || defaultAboutPage;

    // 2. Fetch active members
    let resolvedMembers: any[] = [];
    const membersDb = await executeDirectQuery({
      method: 'SELECT',
      table: 'members',
      filters: [{ col: 'status', val: 'Active' }]
    });
    if (membersDb && membersDb.length > 0) {
      resolvedMembers = membersDb.map((d: any) => ({
        id: d.id,
        name: d.company_name,
        logo: d.logo_url || d.license_file_url || DEFAULT_HOBA_LOGO
      }));
    }

    // 3. Fetch featured members
    let loadedFeaturedMembers: any[] = [];
    const featuredConfig = await executeDirectQuery({
      method: 'SELECT',
      table: 'website_config',
      filters: [{ col: 'key', val: 'featured_members' }],
      isSingle: true
    });
    if (featuredConfig?.value && Array.isArray(featuredConfig.value)) {
      loadedFeaturedMembers = featuredConfig.value;
    }

    const val = initialData.aboutConfig;
    if (loadedFeaturedMembers && loadedFeaturedMembers.length > 0) {
      initialData.featuredMembers = loadedFeaturedMembers;
    } else if (val && val.featuredMembers && Array.isArray(val.featuredMembers)) {
      initialData.featuredMembers = val.featuredMembers;
    } else if (val && val.featuredMemberIds && Array.isArray(val.featuredMemberIds)) {
      const sorted = val.featuredMemberIds.map((id: string) => {
        return resolvedMembers.find((m: any) => m.id === id);
      }).filter(Boolean);
      initialData.featuredMembers = sorted.length > 0 ? sorted : resolvedMembers.slice(0, 6);
    } else {
      initialData.featuredMembers = resolvedMembers.slice(0, 6);
    }

  } catch (err) {
    console.error('[About SSR] Failed to pre-fetch database config:', err);
  }

  return <AboutClientPage initialData={initialData} />;
}
