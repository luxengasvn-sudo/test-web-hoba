import CommitteeView from '@/components/public/CommitteeView';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Ban Chấp hành | HOBA LPG',
  description: 'Ban Chấp hành Hiệp hội Gas Việt Nam nhiệm kỳ VII (2022 - 2027) - Danh sách lãnh đạo và thành viên ban chấp hành.',
};

export default function BanChapHanhPage() {
  return <CommitteeView type="ban-chap-hanh" />;
}
