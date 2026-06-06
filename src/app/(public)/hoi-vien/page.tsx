import { executeDirectQuery } from '@/lib/db-direct';
import MembersClientPage from './MembersClientPage';
import defaultMembers from '@/lib/defaultMembers.json';
import defaultChapters from '@/lib/defaultChapters.json';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const initialData: any = {};

  try {
    // 1. Fetch page layout configs
    const pageConfig = await executeDirectQuery({
      method: 'SELECT',
      table: 'website_config',
      filters: [{ col: 'key', val: 'memberspage' }],
      isSingle: true
    });
    initialData.pageConfig = pageConfig?.value || {};

    // Normalize associationRoles if needed
    const val = initialData.pageConfig;
    if (val && val.associationRoles && Array.isArray(val.associationRoles)) {
      initialData.associationRoles = val.associationRoles.map((r: any) => {
        if (typeof r === 'object' && r !== null) return r;
        const defaults = { bg: '#e7e5e4', text: '#1c1c1a' };
        if (r === 'Chủ tịch') { defaults.bg = '#bb0013'; defaults.text = '#ffffff'; }
        else if (r === 'Phó Chủ tịch') { defaults.bg = '#00346f'; defaults.text = '#ffffff'; }
        else if (r === 'Ban kiểm tra') { defaults.bg = '#d97706'; defaults.text = '#ffffff'; }
        else if (r.includes('Thường vụ')) { defaults.bg = '#0284c7'; defaults.text = '#ffffff'; }
        else if (r.includes('Chấp hành') || r === 'Ủy viên BCH') { defaults.bg = '#d7e2ff'; defaults.text = '#001b3f'; }
        return { name: r, color: defaults.bg, textColor: defaults.text };
      });
    }

    // 2. Fetch chapters list
    let chaptersMap: Record<string, string> = {};
    const chaptersData = await executeDirectQuery({
      method: 'SELECT',
      table: 'chapters'
    });
    if (chaptersData && chaptersData.length > 0) {
      initialData.chapterList = chaptersData.map((c: any) => {
        chaptersMap[c.id] = c.name;
        return {
          id: c.id,
          name: c.name,
          region: c.region,
          locations: c.locations || '',
          memberCount: c.member_count_override || 0,
          image_url: c.image_url || 'https://lh3.googleusercontent.com/aida-public/AB6AXuBTP1VwRhiXz7IslKk8lyrl_NZjrM0MYtWMLyaBrXhEX2DRZ9wIHjlle-92NsUhnYmQwD4yTguPqimc2ewjOD30dygdkHwHt7s9NXsMPSnzWvTyHO_1lM5j2kM_9BcFoN9m67VEakH0ReGkHCz2mX7R0kfbHFSyqSNrqYFcUsBMK0sm4skbO_7LO2Qs237Mbc_zUrwOxQ0lEHdDE-3w74hK182bzXXoJ9Nz4No0EMfJPJZ14JUTiBDxNw-onJOCwry6C0bNPzf9aJY',
          slogan: c.slogan,
          description: c.description
        };
      });
    } else {
      initialData.chapterList = defaultChapters;
    }

    // 3. Fetch active members list
    const membersData = await executeDirectQuery({
      method: 'SELECT',
      table: 'members',
      filters: [{ col: 'status', val: 'Active' }]
    });

    if (membersData && membersData.length > 0) {
      initialData.memberList = membersData.map((d: any) => {
        return {
          id: d.id,
          company_name: d.company_name,
          tax_code: d.tax_code,
          address: d.address,
          phone: d.phone,
          email: d.email,
          business_type: d.business_type,
          representative_name: d.representative_name,
          representative_role: d.representative_role,
          representative_email: d.representative_email,
          representative_phone: d.representative_phone,
          status: d.status,
          created_at: d.created_at,
          chapter_id: d.chapter_id,
          chapter_name: d.chapter_id ? (chaptersMap[d.chapter_id] || 'Chi hội liên kết') : undefined,
          association_role: d.association_role || 'Hội viên chính thức',
          chapter_role: d.chapter_role,
          join_date: d.join_date ? d.join_date.split('T')[0] : d.created_at.split('T')[0],
          logo_url: d.logo_url || d.license_file_url,
          representative_avatar_url: d.representative_avatar_url || ''
        };
      });
    } else {
      initialData.memberList = defaultMembers;
    }

  } catch (err) {
    console.error('[Members SSR] Failed to pre-fetch database config:', err);
  }

  return <MembersClientPage initialData={initialData} />;
}
