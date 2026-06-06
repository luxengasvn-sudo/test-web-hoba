import { executeDirectQuery } from '@/lib/db-direct';
import HomeClientPage from './HomeClientPage';
import defaultHomePage from '@/lib/defaultHomePage.json';
import fs from 'fs';
import path from 'path';

function checkImageFallback(url: string, defaultUrl: string): string {
  if (!url) return defaultUrl;
  if (url.startsWith('/uploads/')) {
    const localPath = path.join(process.cwd(), 'public', url);
    if (!fs.existsSync(localPath)) {
      return defaultUrl;
    }
  }
  return url;
}

export const dynamic = 'force-dynamic';

export default async function Page() {
  const initialData: any = {};

  try {
    // 1. Fetch active members
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
        logo: checkImageFallback(d.logo_url || d.license_file_url, 'https://lh3.googleusercontent.com/aida-public/AB6AXuBwWtf74gYhtlAq1IS1hNQ5pLt7PUyB5KUTbLhgRYv6HnE6oV_u_57wH3tzf7Gu632sw0dDOEGwPcVE9yeyW9nsoSKIYu6zhAnbBNLs_DAMN586bdG_Go0iluqSQSqfzXCkhA6V7FX6c26NfP5RxfXr_v80Y2xIdgeLNu-T-w8aqpnVxVdfLNKXLMrB1VRrMgB_l_1ovROIijGMRTcnJSxHCl2NBnEkiom8SJaaYm29JQdL9cUuZ6FLXiVcFjMeMtcUCUUGAtXcCeg')
      }));
    }

    // 2. Fetch homepage config
    const homeConfig = await executeDirectQuery({
      method: 'SELECT',
      table: 'website_config',
      filters: [{ col: 'key', val: 'homepage' }],
      isSingle: true
    });
    const val = homeConfig?.value || {};

    initialData.headline = val.headline || defaultHomePage.headline;
    initialData.subtext = val.subtext || defaultHomePage.subtext;
    initialData.features = val.features || defaultHomePage.features;
    initialData.sections = val.sections || defaultHomePage.sections;
    initialData.heroImage = checkImageFallback(val.heroImage, defaultHomePage.heroImage);
    initialData.stats = val.stats || defaultHomePage.stats;
    initialData.coreServices = val.coreServices || defaultHomePage.coreServices;
    initialData.aboutTitle = val.aboutTitle || defaultHomePage.aboutTitle;
    initialData.aboutDesc = val.aboutDesc || defaultHomePage.aboutDesc;
    initialData.aboutImage = checkImageFallback(val.aboutImage, defaultHomePage.aboutImage);

    // 3. Fetch featured members configuration
    let loadedFeaturedMembers: any[] = [];
    const featuredData = await executeDirectQuery({
      method: 'SELECT',
      table: 'website_config',
      filters: [{ col: 'key', val: 'featured_members' }],
      isSingle: true
    });
    if (featuredData?.value && Array.isArray(featuredData.value)) {
      loadedFeaturedMembers = featuredData.value;
    }

    const defaultLogoPlaceholder = 'https://lh3.googleusercontent.com/aida-public/AB6AXuBwWtf74gYhtlAq1IS1hNQ5pLt7PUyB5KUTbLhgRYv6HnE6oV_u_57wH3tzf7Gu632sw0dDOEGwPcVE9yeyW9nsoSKIYu6zhAnbBNLs_DAMN586bdG_Go0iluqSQSqfzXCkhA6V7FX6c26NfP5RxfXr_v80Y2xIdgeLNu-T-w8aqpnVxVdfLNKXLMrB1VRrMgB_l_1ovROIijGMRTcnJSxHCl2NBnEkiom8SJaaYm29JQdL9cUuZ6FLXiVcFjMeMtcUCUUGAtXcCeg';

    if (loadedFeaturedMembers && loadedFeaturedMembers.length > 0) {
      initialData.featuredMembers = loadedFeaturedMembers.map((m: any) => ({
        ...m,
        logo: checkImageFallback(m.logo, defaultLogoPlaceholder)
      }));
    } else if (val && val.featuredMembers && Array.isArray(val.featuredMembers)) {
      initialData.featuredMembers = val.featuredMembers.map((m: any) => ({
        ...m,
        logo: checkImageFallback(m.logo, defaultLogoPlaceholder)
      }));
    } else if (val && val.featuredMemberIds && Array.isArray(val.featuredMemberIds)) {
      const sorted = val.featuredMemberIds.map((id: string) => {
        return resolvedMembers.find((m: any) => m.id === id);
      }).filter(Boolean);
      initialData.featuredMembers = sorted.length > 0 ? sorted : resolvedMembers.slice(0, 6);
    } else {
      initialData.featuredMembers = resolvedMembers.slice(0, 6);
    }

    // 4. Fetch events config
    const eventsConfig = await executeDirectQuery({
      method: 'SELECT',
      table: 'website_config',
      filters: [{ col: 'key', val: 'events' }],
      isSingle: true
    });
    initialData.liveEvents = (eventsConfig?.value && Array.isArray(eventsConfig.value)) ? eventsConfig.value : [];

    // 5. Fetch news (Published) ordered by date desc limit 3
    const newsData = await executeDirectQuery({
      method: 'SELECT',
      table: 'news',
      filters: [{ col: 'status', val: 'Published' }],
      orderCol: 'publish_date',
      orderAscending: false,
      limitCount: 3
    });
    if (newsData && newsData.length > 0) {
      initialData.liveArticles = newsData.map((d: any, idx: number) => {
        let formattedDate = d.publish_date;
        try {
          const dt = new Date(d.publish_date);
          formattedDate = `${dt.getDate()} Tháng ${dt.getMonth() + 1}, ${dt.getFullYear()}`;
        } catch (_) {}

        return {
          id: d.id,
          title: d.title,
          desc: d.description || '',
          date: formattedDate,
          badge: idx === 0 ? 'Tiêu điểm' : undefined,
          img: checkImageFallback(d.thumbnail_url, 'https://images.unsplash.com/photo-1542282088-fe8426682b8f'),
          slug: d.slug
        };
      });
    }

    // 6. Fetch documents ordered by date desc limit 3
    const docsData = await executeDirectQuery({
      method: 'SELECT',
      table: 'documents',
      orderCol: 'publish_date',
      orderAscending: false,
      limitCount: 3
    });
    if (docsData && docsData.length > 0) {
      initialData.liveDocs = docsData.map((d: any) => {
        let formattedDate = d.publish_date;
        try {
          const dt = new Date(d.publish_date);
          formattedDate = `${dt.getDate()}/${dt.getMonth() + 1}/${dt.getFullYear()}`;
        } catch (_) {}

        let type = 'pdf';
        let color = 'text-secondary';
        if (d.category === 'Thông tư') {
          type = 'info';
          color = 'text-green-600';
        } else if (d.category === 'Quyết định') {
          type = 'download';
          color = 'text-orange-500';
        }

        return {
          title: d.title,
          date: formattedDate,
          type: type,
          color: color
        };
      });
    }

  } catch (error) {
    console.error('[Home SSR] Failed to pre-fetch database config:', error);
  }

  return <HomeClientPage initialData={initialData} />;
}
