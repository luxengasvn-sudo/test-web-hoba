export interface LpgCpRecord {
  month: string;          // Định dạng "YYYY-MM" (ví dụ: "2026-10")
  propane: number | null; // USD/tấn
  butane: number | null;  // USD/tấn
  isPending?: boolean;    // true nếu đang chờ công bố chính thức
  note?: string;          // Ghi chú tùy chọn
}

export interface LpgCpFaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface LpgCpContentConfig {
  heroBadge?: string;
  heroTitle?: string;
  heroDescription?: string;
  pendingTitle?: string;
  pendingDescription?: string;
  calculatorNote?: string;
  faqs?: LpgCpFaqItem[];
  sourceNote?: string;
  disclaimerNote?: string;
}

export const DEFAULT_LPG_CP_CONTENT: Required<LpgCpContentConfig> = {
  heroBadge: 'HOBA LPG • Dữ liệu Năng lượng',
  heroTitle: 'Giá CP LPG thế giới Saudi Aramco',
  heroDescription:
    'Giá hợp đồng propane và butane do tập đoàn năng lượng Saudi Aramco công bố hàng tháng, đóng vai trò là mốc tham chiếu quốc tế chính để định giá LPG nhập khẩu vào thị trường Việt Nam.',
  pendingTitle: 'Đang chờ công bố giá chính thức',
  pendingDescription:
    'Saudi Aramco thường công bố giá vào ngày cuối cùng của tháng hoặc ngày đầu tháng mới. HOBA LPG sẽ cập nhật ngay sau khi có số liệu xác nhận.',
  calculatorNote:
    '* Công thức tham khảo tiêu chuẩn: thay đổi CP × 1,05 × 1,10 × tỷ giá / 1000 × 12. Mức ước tính chưa bao gồm chi phí premium, cước vận chuyển, chiết nạp, chi phí kho bãi và chính sách giá riêng của từng doanh nghiệp phân phối.',
  faqs: [
    {
      id: 'faq-1',
      question: 'CP là gì?',
      answer:
        'CP (Contract Price) là giá hợp đồng LPG do tập đoàn dầu khí quốc gia Saudi Aramco công bố hàng tháng cho propane (C3) và butane (C4), áp dụng cho các lô hàng bốc từ các cảng tại Ả Rập Xê Út. Toàn bộ thị trường châu Á và Việt Nam sử dụng mức này làm cơ sở định giá nhập khẩu.',
    },
    {
      id: 'faq-2',
      question: 'CP trung bình được tính như thế nào?',
      answer:
        'LPG dân dụng và công nghiệp thường được phối trộn theo tỷ lệ propane và butane (phổ biến là 50:50). Do đó, giá CP trung bình được tính bằng công thức: (Giá Propane + Giá Butane) / 2 để làm mốc theo dõi biến động chung giữa các tháng.',
    },
    {
      id: 'faq-3',
      question: 'Vì sao giá gas bán lẻ trong nước không thay đổi đúng bằng mức CP?',
      answer:
        'Giá bán lẻ bình gas tới tay người tiêu dùng phụ thuộc vào nhiều yếu tố cấu thành khác: phụ phí hợp đồng (premium), tỷ giá USD/VND tại thời điểm thanh toán, thuế nhập khẩu, cước vận tải biển, chi phí chiết nạp, kiểm định an toàn vỏ bình, chi phí lưu kho phân phối và chính sách kinh doanh của từng thương nhân. CP thế giới là cấu phần có biên độ dao động mạnh nhất.',
    },
    {
      id: 'faq-4',
      question: 'Khi nào Saudi Aramco công bố số liệu tháng mới?',
      answer:
        'Saudi Aramco thường chốt và công bố giá CP vào chiều tối ngày cuối cùng của tháng hiện tại (hoặc sáng sớm ngày đầu tiên của tháng mới theo giờ Việt Nam). HOBA LPG lập tức cập nhật dữ liệu khi có xác nhận từ các nguồn tin cậy.',
    },
  ],
  sourceNote: 'Nguồn số liệu: Saudi Aramco, tổng hợp từ bảng CP của TotalEnergies Việt Nam và bản tin OPIS.',
  disclaimerNote:
    'Số liệu mang tính chất tham khảo cho hội viên và cộng đồng doanh nghiệp ngành LPG, không cấu thành tư vấn giá hay cam kết thương mại.',
};

export interface LpgCpConfig {
  enabled?: boolean;      // true: hiển thị công khai (mặc định), false: ẩn với công chúng
  defaultFxRate: number;  // Tỷ giá tham chiếu (mặc định 26.300 VND/USD)
  records: LpgCpRecord[]; // Danh sách các tháng
  updatedAt: string;      // ISO string thời điểm cập nhật
  content?: LpgCpContentConfig; // Cấu hình nội dung tĩnh có thể chỉnh sửa
}

/**
 * Tính giá CP trung bình = (Propane + Butane) / 2
 */
export function getAverageCp(record: LpgCpRecord): number | null {
  if (record.propane === null || record.butane === null) return null;
  return (record.propane + record.butane) / 2;
}

/**
 * Định dạng nhãn tháng hiển thị:
 * formatMonthLabel("2026-10") => "Tháng 10/2026"
 * formatMonthLabel("2026-10", true) => "T10/26"
 */
export function formatMonthLabel(monthStr: string, short = false): string {
  if (!monthStr || !monthStr.includes('-')) return monthStr || '';
  const [year, month] = monthStr.split('-');
  const monthNum = parseInt(month, 10);
  if (short) {
    return `T${monthNum}/${year.slice(2)}`;
  }
  return `Tháng ${monthNum}/${year}`;
}

/**
 * Định dạng số chênh lệch kèm dấu +/-
 */
export function formatDiff(val: number | null): string {
  if (val === null || val === undefined) return '';
  const sign = val > 0 ? '+' : val < 0 ? '−' : '';
  return sign + Math.abs(val).toLocaleString('vi-VN', { maximumFractionDigits: 1 });
}

/**
 * Trả về class CSS thể hiện trạng thái tăng (up - đỏ trong chứng khoán/năng lượng hoặc cảnh báo), giảm (down - xanh), đứng yên (flat)
 * Lưu ý theo văn bản gốc: tăng = up (đỏ), giảm = down (xanh lá), bằng = flat (xám)
 */
export function getDiffClass(val: number | null): string {
  if (val === null || val === undefined || val === 0) return 'text-slate-500';
  return val > 0 ? 'text-rose-600' : 'text-emerald-600';
}

/**
 * Trả về ký tự mũi tên tăng/giảm
 */
export function getDiffArrow(val: number | null): string {
  if (val === null || val === undefined || val === 0) return '';
  return val > 0 ? '▲ ' : '▼ ';
}

/**
 * Ước tính tác động tới giá gas bình 12kg:
 * Công thức tham khảo: thay đổi CP × 1,05 × 1,10 × tỷ giá / 1000 * 12
 * Làm tròn đến 100 đồng
 */
export function calculate12kgImpact(deltaCp: number, fxRate: number): number {
  const val = (deltaCp * 1.05 * 1.10 * fxRate / 1000) * 12;
  return Math.round(val / 100) * 100;
}
