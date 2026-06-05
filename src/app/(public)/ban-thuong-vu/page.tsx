import CommitteeView from '@/components/public/CommitteeView';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Ban Thường vụ | HOBA LPG',
  description: 'Ban Thường vụ Hiệp hội Gas Việt Nam nhiệm kỳ VII (2022 - 2027) - Cơ quan thường trực chỉ đạo mọi hoạt động của Hiệp hội.',
};

export default function BanThuongVuPage() {
  return <CommitteeView type="ban-thuong-vu" />;
}
