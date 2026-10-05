import { Metadata } from 'next';
import { executeDirectQuery } from '@/lib/db-direct';
import LpgCpClientPage from './LpgCpClientPage';
import defaultLpgPrices from '@/lib/defaultLpgPrices.json';
import { LpgCpConfig } from '@/types/lpgCp';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Giá CP LPG thế giới Saudi Aramco hàng tháng | HOBA LPG',
  description:
    'Bảng giá CP LPG (propane, butane) Saudi Aramco cập nhật hàng tháng, so sánh với tháng trước, biểu đồ xu hướng theo năm và công cụ ước tính tác động tới giá gas bình 12kg.',
  openGraph: {
    title: 'Giá CP LPG thế giới Saudi Aramco hàng tháng | HOBA LPG',
    description:
      'Bảng giá CP LPG (propane, butane) Saudi Aramco cập nhật hàng tháng, so sánh với tháng trước, biểu đồ xu hướng theo năm và công cụ ước tính tác động tới giá gas bình 12kg.',
  },
};

export default async function Page() {
  let initialConfig: LpgCpConfig = defaultLpgPrices as LpgCpConfig;

  try {
    const res = await executeDirectQuery({
      method: 'SELECT',
      table: 'website_config',
      filters: [{ col: 'key', val: 'lpg_cp_data' }],
      isSingle: true,
    });

    if (res?.value) {
      const parsed = typeof res.value === 'string' ? JSON.parse(res.value) : res.value;
      if (parsed && Array.isArray(parsed.records)) {
        initialConfig = parsed;
      }
    }
  } catch (err) {
    console.warn('[LPG CP] Fallback to defaultLpgPrices.json due to query failure:', err);
  }

  return <LpgCpClientPage initialConfig={initialConfig} />;
}
