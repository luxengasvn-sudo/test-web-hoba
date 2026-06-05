import CommitteeView from '@/components/public/CommitteeView';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Ban Kiểm tra | HOBA LPG',
  description: 'Ban Kiểm tra Hiệp hội Gas Việt Nam nhiệm kỳ VII (2022 - 2027) - Danh sách ban kiểm tra hiệp hội.',
};

export default function BanKiemTraPage() {
  return <CommitteeView type="ban-kiem-tra" />;
}
