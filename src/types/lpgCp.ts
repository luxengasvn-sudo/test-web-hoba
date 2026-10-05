export interface LpgCpRecord {
  month: string;          // Định dạng "YYYY-MM" (ví dụ: "2026-10")
  propane: number | null; // USD/tấn
  butane: number | null;  // USD/tấn
  isPending?: boolean;    // true nếu đang chờ công bố chính thức
  note?: string;          // Ghi chú tùy chọn
}

export interface LpgCpConfig {
  defaultFxRate: number;  // Tỷ giá tham chiếu (mặc định 26.300 VND/USD)
  records: LpgCpRecord[]; // Danh sách các tháng
  updatedAt: string;      // ISO string thời điểm cập nhật
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
