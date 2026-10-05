'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  LpgCpConfig,
  LpgCpRecord,
  DEFAULT_LPG_CP_CONTENT,
  getAverageCp,
  formatMonthLabel,
  formatDiff,
  getDiffClass,
  getDiffArrow,
  calculate12kgImpact,
} from '@/types/lpgCp';

interface Props {
  initialConfig: LpgCpConfig;
  isPreview?: boolean;
}

export default function LpgCpClientPage({ initialConfig, isPreview = false }: Props) {
  const [config, setConfig] = useState<LpgCpConfig>(initialConfig);

  // Sync with localStorage if updated in admin offline
  useEffect(() => {
    try {
      const saved = localStorage.getItem('hoba_website_config_lpg_cp_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed.records)) {
          setConfig(parsed);
        }
      }
    } catch {
      // Ignore localStorage error
    }
  }, []);

  const records = useMemo(() => {
    return [...(config.records || [])].sort((a, b) => a.month.localeCompare(b.month));
  }, [config.records]);

  // Dynamic content configuration with fallback to defaults
  const content = useMemo(() => {
    return {
      heroBadge: config.content?.heroBadge || DEFAULT_LPG_CP_CONTENT.heroBadge,
      heroTitle: config.content?.heroTitle || DEFAULT_LPG_CP_CONTENT.heroTitle,
      heroDescription: config.content?.heroDescription || DEFAULT_LPG_CP_CONTENT.heroDescription,
      pendingTitle: config.content?.pendingTitle || DEFAULT_LPG_CP_CONTENT.pendingTitle,
      pendingDescription: config.content?.pendingDescription || DEFAULT_LPG_CP_CONTENT.pendingDescription,
      calculatorNote: config.content?.calculatorNote || DEFAULT_LPG_CP_CONTENT.calculatorNote,
      faqs:
        config.content?.faqs && config.content.faqs.length > 0
          ? config.content.faqs
          : DEFAULT_LPG_CP_CONTENT.faqs,
      sourceNote: config.content?.sourceNote || DEFAULT_LPG_CP_CONTENT.sourceNote,
      disclaimerNote: config.content?.disclaimerNote || DEFAULT_LPG_CP_CONTENT.disclaimerNote,
    };
  }, [config.content]);

  // Extract available years
  const availableYears = useMemo(() => {
    const set = new Set<string>();
    records.forEach((r) => {
      const year = r.month.split('-')[0];
      if (year) set.add(year);
    });
    return Array.from(set).sort().reverse();
  }, [records]);

  // Year / Time range filter
  // Options: '12m' (default) | '24m' | 'all' | YYYY (e.g. '2026', '2025')
  const [selectedFilter, setSelectedFilter] = useState<string>('12m');

  // Filtered records for chart and table
  const filteredRecords = useMemo(() => {
    if (selectedFilter === 'all') return records;
    if (selectedFilter === '12m') return records.slice(-12);
    if (selectedFilter === '24m') return records.slice(-24);
    // Filter by specific year
    return records.filter((r) => r.month.startsWith(`${selectedFilter}-`));
  }, [records, selectedFilter]);

  // Published records (for summary cards & statistics)
  const publishedRecords = useMemo(() => {
    return records.filter((r) => !r.isPending && r.propane !== null && r.butane !== null);
  }, [records]);

  const latestPublished = publishedRecords[publishedRecords.length - 1];
  const prevPublished = publishedRecords[publishedRecords.length - 2];

  // Latest overall record (could be pending)
  const latestOverall = records[records.length - 1];
  const isPending = latestOverall?.isPending || latestOverall?.propane === null;

  // Latest published metrics
  const latestC3 = latestPublished?.propane ?? 0;
  const latestC4 = latestPublished?.butane ?? 0;
  const latestAvg = latestPublished ? getAverageCp(latestPublished) ?? 0 : 0;

  const prevC3 = prevPublished?.propane ?? latestC3;
  const prevC4 = prevPublished?.butane ?? latestC4;
  const prevAvg = prevPublished ? getAverageCp(prevPublished) ?? latestAvg : latestAvg;

  const diffC3 = latestC3 - prevC3;
  const diffC4 = latestC4 - prevC4;
  const diffAvg = latestAvg - prevAvg;

  // Calculator State
  const defaultImpactDelta = diffAvg !== 0 ? Math.round(diffAvg * 10) / 10 : 10;
  const [calcDelta, setCalcDelta] = useState<number>(defaultImpactDelta);
  const [calcFx, setCalcFx] = useState<number>(config.defaultFxRate || 26300);

  // Sync calculator delta when diffAvg changes
  useEffect(() => {
    if (diffAvg !== 0) {
      setCalcDelta(Math.round(diffAvg * 10) / 10);
    }
  }, [diffAvg]);

  // SVG Chart Dimensions & Calculation
  const chartPubRecords = useMemo(() => {
    return filteredRecords.filter((r) => !r.isPending && r.propane !== null && r.butane !== null);
  }, [filteredRecords]);

  const svgRef = useRef<SVGSVGElement | null>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const W = 800;
  const H = 340;
  const L = 55;
  const R = 25;
  const T = 25;
  const B = 45;

  const { mn, mx, yTicks } = useMemo(() => {
    if (chartPubRecords.length === 0) return { mn: 400, mx: 900, yTicks: [400, 500, 600, 700, 800, 900] };
    const allVals = chartPubRecords.flatMap((r) => [r.propane!, r.butane!]);
    const minVal = Math.min(...allVals);
    const maxVal = Math.max(...allVals);
    const calculatedMn = Math.max(0, Math.floor(minVal / 50) * 50 - 50);
    const calculatedMx = Math.ceil(maxVal / 50) * 50 + 50;

    const ticks: number[] = [];
    const step = calculatedMx - calculatedMn > 400 ? 100 : 50;
    for (let v = calculatedMn; v <= calculatedMx; v += step) {
      ticks.push(v);
    }
    return { mn: calculatedMn, mx: calculatedMx, yTicks: ticks };
  }, [chartPubRecords]);

  const n = chartPubRecords.length;

  const getX = (i: number) => {
    if (n <= 1) return L + (W - L - R) / 2;
    return L + ((W - L - R) * i) / (n - 1);
  };

  const getY = (v: number) => {
    if (mx === mn) return T + (H - T - B) / 2;
    return T + (H - T - B) * (1 - (v - mn) / (mx - mn));
  };

  // Polyline points
  const pointsC3 = chartPubRecords.map((r, i) => `${getX(i)},${getY(r.propane!)}`).join(' ');
  const pointsC4 = chartPubRecords.map((r, i) => `${getX(i)},${getY(r.butane!)}`).join(' ');

  // Handle Chart mouse / touch interaction for Tooltip
  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!svgRef.current || n === 0) return;
    const rect = svgRef.current.getBoundingClientRect();
    const clientX = e.clientX;
    const svgX = ((clientX - rect.left) / rect.width) * W;

    let closestIdx = 0;
    let minDistance = Infinity;
    for (let i = 0; i < n; i++) {
      const dist = Math.abs(getX(i) - svgX);
      if (dist < minDistance) {
        minDistance = dist;
        closestIdx = i;
      }
    }
    setHoverIndex(closestIdx);
  };

  const handlePointerLeave = () => {
    setHoverIndex(null);
  };

  // Hovered item details
  const activeRecord = hoverIndex !== null && chartPubRecords[hoverIndex] ? chartPubRecords[hoverIndex] : null;
  const activePrevRecord = useMemo(() => {
    if (!activeRecord) return null;
    const idx = records.findIndex((r) => r.month === activeRecord.month);
    return idx > 0 ? records[idx - 1] : null;
  }, [activeRecord, records]);

  // Calculator Result
  const impact12kg = calculate12kgImpact(calcDelta, calcFx);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans pb-16">
      {/* Admin Preview Notice Bar */}
      {isPreview && config.enabled === false && (
        <div className="bg-amber-400 dark:bg-amber-500 text-slate-950 px-4 py-2.5 shadow-md sticky top-0 z-50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 max-w-5xl mx-auto w-full text-xs sm:text-sm font-bold">
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined text-lg shrink-0">visibility_off</span>
              <span>Chế độ Xem trước (Admin Preview): Trang hiện đang ẨN với công chúng. Khách truy cập bên ngoài sẽ tự động được chuyển hướng về Trang chủ.</span>
            </span>
            <Link
              href="/admin/gia-cp-lpg"
              className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shrink-0 transition-colors inline-flex items-center gap-1 w-fit shadow-xs"
            >
              <span className="material-symbols-outlined text-sm">settings</span>
              <span>Vào Quản trị để Bật</span>
            </Link>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-emerald-900 to-slate-900 text-white pt-10 pb-16 px-4 sm:px-6 lg:px-8 border-b border-emerald-800/40">
        <div className="max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-4">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            {content.heroBadge}
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-3">
            {content.heroTitle}
          </h1>
          <p className="text-slate-300 text-base sm:text-lg max-w-3xl leading-relaxed whitespace-pre-line">
            {content.heroDescription}
          </p>
        </div>
      </section>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        {/* Top 3 Summary Cards */}
        {latestPublished && (
          <div className="mb-6">
            {/* Mobile Header: Kỳ công bố & Đơn vị */}
            <div className="sm:hidden flex items-center justify-between mb-2 px-0.5">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/15 dark:bg-slate-800/80 backdrop-blur-md border border-white/20 dark:border-slate-700 text-white shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-bold tracking-tight">
                  Kỳ công bố: {formatMonthLabel(latestPublished.month)}
                </span>
              </div>
              <span className="text-[11px] text-slate-300 font-medium">
                Đơn vị: USD/tấn
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:gap-4">
              {/* Card 1: Propane (C3) */}
              <div className="bg-white dark:bg-slate-900 rounded-xl p-2.5 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:shadow-md transition-all flex flex-col justify-between">
                <div className="absolute top-0 left-0 w-1 sm:w-1.5 h-full bg-[#0e6b5c]" />
                <div>
                  <div className="flex items-center justify-between mb-1 pl-1 sm:pl-1.5">
                    <span className="text-[11px] sm:text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-tight truncate">
                      <span className="hidden sm:inline">Propane (C3)</span>
                      <span className="sm:hidden">Propane C3</span>
                    </span>
                    <span className="hidden sm:inline-block text-xs px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 font-medium">
                      {formatMonthLabel(latestPublished.month)}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1 my-1 sm:my-2 pl-1 sm:pl-1.5">
                    <span className="text-lg sm:text-3xl lg:text-4xl font-black text-[#0e6b5c] dark:text-emerald-400 font-mono tracking-tight leading-tight">
                      {latestC3.toLocaleString('vi-VN')}
                    </span>
                    <span className="text-[10px] sm:text-sm font-semibold text-slate-400 dark:text-slate-500">
                      <span className="sm:hidden">USD</span>
                      <span className="hidden sm:inline">USD/tấn</span>
                    </span>
                  </div>
                </div>
                <div className={`text-[10px] sm:text-xs font-semibold flex items-center gap-0.5 sm:gap-1 pl-1 sm:pl-1.5 ${getDiffClass(diffC3)}`}>
                  <span className="text-xs sm:text-sm">{getDiffArrow(diffC3)}</span>
                  <span className="font-mono">{formatDiff(diffC3)}</span>
                  <span className="sm:hidden font-medium">USD/t</span>
                  <span className="hidden sm:inline">USD/tấn</span>
                  <span className="hidden lg:inline text-slate-500 dark:text-slate-400 font-normal">so với tháng trước</span>
                </div>
              </div>

              {/* Card 2: Butane (C4) */}
              <div className="bg-white dark:bg-slate-900 rounded-xl p-2.5 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:shadow-md transition-all flex flex-col justify-between">
                <div className="absolute top-0 left-0 w-1 sm:w-1.5 h-full bg-[#b4540f]" />
                <div>
                  <div className="flex items-center justify-between mb-1 pl-1 sm:pl-1.5">
                    <span className="text-[11px] sm:text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-tight truncate">
                      <span className="hidden sm:inline">Butane (C4)</span>
                      <span className="sm:hidden">Butane C4</span>
                    </span>
                    <span className="hidden sm:inline-block text-xs px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 font-medium">
                      {formatMonthLabel(latestPublished.month)}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1 my-1 sm:my-2 pl-1 sm:pl-1.5">
                    <span className="text-lg sm:text-3xl lg:text-4xl font-black text-[#b4540f] dark:text-amber-500 font-mono tracking-tight leading-tight">
                      {latestC4.toLocaleString('vi-VN')}
                    </span>
                    <span className="text-[10px] sm:text-sm font-semibold text-slate-400 dark:text-slate-500">
                      <span className="sm:hidden">USD</span>
                      <span className="hidden sm:inline">USD/tấn</span>
                    </span>
                  </div>
                </div>
                <div className={`text-[10px] sm:text-xs font-semibold flex items-center gap-0.5 sm:gap-1 pl-1 sm:pl-1.5 ${getDiffClass(diffC4)}`}>
                  <span className="text-xs sm:text-sm">{getDiffArrow(diffC4)}</span>
                  <span className="font-mono">{formatDiff(diffC4)}</span>
                  <span className="sm:hidden font-medium">USD/t</span>
                  <span className="hidden sm:inline">USD/tấn</span>
                  <span className="hidden lg:inline text-slate-500 dark:text-slate-400 font-normal">so với tháng trước</span>
                </div>
              </div>

              {/* Card 3: CP Trung bình */}
              <div className="bg-white dark:bg-slate-900 rounded-xl p-2.5 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:shadow-md transition-all flex flex-col justify-between">
                <div className="absolute top-0 left-0 w-1 sm:w-1.5 h-full bg-indigo-600" />
                <div>
                  <div className="flex items-center justify-between mb-1 pl-1 sm:pl-1.5 gap-1.5">
                    <span className="text-[11px] sm:text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-tight truncate" title="CP Trung bình (C3+C4)/2">
                      <span className="hidden sm:inline">CP Trung bình</span>
                      <span className="sm:hidden">CP T.Bình</span>
                    </span>
                    <span className="hidden sm:inline-block text-xs px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-300 font-medium shrink-0">
                      {formatMonthLabel(latestPublished.month)}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1 my-1 sm:my-2 pl-1 sm:pl-1.5">
                    <span className="text-lg sm:text-3xl lg:text-4xl font-black text-indigo-700 dark:text-indigo-400 font-mono tracking-tight leading-tight">
                      {latestAvg.toLocaleString('vi-VN', { maximumFractionDigits: 1 })}
                    </span>
                    <span className="text-[10px] sm:text-sm font-semibold text-slate-400 dark:text-slate-500">
                      <span className="sm:hidden">USD</span>
                      <span className="hidden sm:inline">USD/tấn</span>
                    </span>
                  </div>
                </div>
                <div className={`text-[10px] sm:text-xs font-semibold flex items-center gap-0.5 sm:gap-1 pl-1 sm:pl-1.5 ${getDiffClass(diffAvg)}`}>
                  <span className="text-xs sm:text-sm">{getDiffArrow(diffAvg)}</span>
                  <span className="font-mono">{formatDiff(diffAvg)}</span>
                  <span className="sm:hidden font-medium">USD/t</span>
                  <span className="hidden sm:inline">USD/tấn</span>
                  <span className="hidden lg:inline text-slate-500 dark:text-slate-400 font-normal">so với tháng trước</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pending Notice Banner */}
        {isPending && latestOverall && (
          <div className="mb-6 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-start gap-3 shadow-xs">
            <span className="material-symbols-outlined text-amber-600 dark:text-amber-400 text-2xl shrink-0 mt-0.5">
              schedule
            </span>
            <div>
              <p className="font-semibold text-amber-900 dark:text-amber-200 text-sm sm:text-base">
                {formatMonthLabel(latestOverall.month)}: {content.pendingTitle}
              </p>
              <p className="text-amber-700 dark:text-amber-300/80 text-xs sm:text-sm mt-0.5 whitespace-pre-line">
                {content.pendingDescription}
              </p>
            </div>
          </div>
        )}

        {/* Section: Interactive Chart */}
        <section className="bg-white dark:bg-slate-900 rounded-xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-xs mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-3 sm:gap-4">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400">query_stats</span>
                Biểu đồ diễn biến giá CP Saudi Aramco
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Rê chuột hoặc chạm vào điểm trên biểu đồ để xem chi tiết từng tháng
              </p>
            </div>

            {/* Actions: Legend & Time Range Dropdown */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              {/* Legend */}
              <div className="flex items-center gap-4 text-xs font-semibold text-slate-600 dark:text-slate-300">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-3.5 h-1.5 rounded-full bg-[#0e6b5c]"></span>
                  Propane (C3)
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-3.5 h-1.5 rounded-full bg-[#b4540f]"></span>
                  Butane (C4)
                </span>
              </div>

              {/* Time Range Dropdown */}
              <div className="relative w-full sm:w-auto min-w-[220px]">
                <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-emerald-600 dark:text-emerald-400 text-lg">
                  calendar_month
                </span>
                <select
                  id="time-range-filter"
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e.target.value)}
                  className="w-full appearance-none pl-9 pr-9 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500 shadow-2xs cursor-pointer transition-colors hover:border-slate-400 dark:hover:border-slate-600"
                >
                  <optgroup label="Khung thời gian phổ biến">
                    <option value="12m">12 tháng gần nhất (Mặc định)</option>
                    <option value="24m">24 tháng gần nhất</option>
                    <option value="all">Tất cả các năm ({records.length} tháng)</option>
                  </optgroup>
                  <optgroup label="Xem theo từng năm">
                    {availableYears.map((yr) => (
                      <option key={yr} value={yr}>
                        Năm {yr}
                      </option>
                    ))}
                  </optgroup>
                </select>
                <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-base">
                  unfold_more
                </span>
              </div>
            </div>
          </div>

          {/* SVG Chart Container */}
          <div className="relative mt-4">
            {chartPubRecords.length === 0 ? (
              <div className="py-16 text-center text-slate-500 dark:text-slate-400 text-sm">
                Không có dữ liệu trong khoảng thời gian đã chọn.
              </div>
            ) : (
              <svg
                ref={svgRef}
                viewBox={`0 0 ${W} ${H}`}
                className="w-full h-auto select-none touch-none"
                onPointerMove={handlePointerMove}
                onPointerLeave={handlePointerLeave}
              >
                <defs>
                  <linearGradient id="c3Grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0e6b5c" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#0e6b5c" stopOpacity="0" />
                  </linearGradient>
                </defs>

                {/* Y-Axis Grid Lines & Labels */}
                {yTicks.map((v) => (
                  <g key={`y-${v}`}>
                    <line
                      x1={L}
                      x2={W - R}
                      y1={getY(v)}
                      y2={getY(v)}
                      stroke="currentColor"
                      className="text-slate-200 dark:text-slate-800"
                      strokeDasharray="3 3"
                    />
                    <text
                      x={L - 8}
                      y={getY(v) + 4}
                      textAnchor="end"
                      className="text-[11px] fill-slate-400 dark:fill-slate-500 font-mono"
                    >
                      ${v}
                    </text>
                  </g>
                ))}

                {/* X-Axis Labels */}
                {chartPubRecords.map((r, i) => {
                  const showLabel = n <= 12 || i % Math.ceil(n / 10) === 0 || i === n - 1;
                  if (!showLabel) return null;
                  return (
                    <text
                      key={`x-${r.month}`}
                      x={getX(i)}
                      y={H - 12}
                      textAnchor="middle"
                      className="text-[11px] fill-slate-500 dark:fill-slate-400 font-medium"
                    >
                      {formatMonthLabel(r.month, true)}
                    </text>
                  );
                })}

                {/* Polylines */}
                <polyline
                  fill="none"
                  stroke="#0e6b5c"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={pointsC3}
                />
                <polyline
                  fill="none"
                  stroke="#b4540f"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={pointsC4}
                />

                {/* Data Points */}
                {chartPubRecords.map((r, i) => (
                  <g key={`pts-${r.month}`}>
                    <circle
                      cx={getX(i)}
                      cy={getY(r.propane!)}
                      r={hoverIndex === i ? 5.5 : 3.5}
                      fill="#0e6b5c"
                      stroke="#ffffff"
                      strokeWidth={hoverIndex === i ? 2 : 1}
                      className="transition-all"
                    />
                    <circle
                      cx={getX(i)}
                      cy={getY(r.butane!)}
                      r={hoverIndex === i ? 5.5 : 3.5}
                      fill="#b4540f"
                      stroke="#ffffff"
                      strokeWidth={hoverIndex === i ? 2 : 1}
                      className="transition-all"
                    />
                  </g>
                ))}

                {/* Hover Vertical Guide Line */}
                {hoverIndex !== null && (
                  <line
                    x1={getX(hoverIndex)}
                    x2={getX(hoverIndex)}
                    y1={T}
                    y2={H - B + 5}
                    stroke="#94a3b8"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                    className="opacity-75"
                  />
                )}
              </svg>
            )}

            {/* Interactive Tooltip Card */}
            {hoverIndex !== null && activeRecord && (
              <div
                className="absolute z-20 pointer-events-none bg-slate-900/95 dark:bg-slate-950/95 text-white p-3 rounded-lg shadow-xl border border-slate-700/80 backdrop-blur-xs text-xs min-w-[210px]"
                style={{
                  left: `${Math.min(Math.max(10, (getX(hoverIndex) / W) * 100), 75)}%`,
                  top: '15px',
                  transform: 'translateX(-50%)',
                }}
              >
                <div className="font-bold text-slate-200 border-b border-slate-800 pb-1.5 mb-2 flex items-center justify-between">
                  <span>{formatMonthLabel(activeRecord.month)}</span>
                  <span className="text-[10px] text-emerald-400 font-mono">USD/tấn</span>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-300">
                      <span className="w-2 h-2 rounded-full bg-[#0e6b5c]"></span>
                      Propane (C3):
                    </span>
                    <span className="font-bold text-emerald-400">
                      {activeRecord.propane?.toLocaleString('vi-VN')} $
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-300">
                      <span className="w-2 h-2 rounded-full bg-[#b4540f]"></span>
                      Butane (C4):
                    </span>
                    <span className="font-bold text-amber-400">
                      {activeRecord.butane?.toLocaleString('vi-VN')} $
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-t border-slate-800/80 pt-1 mt-1 text-slate-200 font-semibold">
                    <span>CP Trung bình:</span>
                    <span>{getAverageCp(activeRecord)?.toLocaleString('vi-VN', { maximumFractionDigits: 1 })} $</span>
                  </div>
                  {activePrevRecord && activePrevRecord.propane !== null && activePrevRecord.butane !== null && (
                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                      <span>So với tháng trước:</span>
                      <span
                        className={
                          (getAverageCp(activeRecord) || 0) - (getAverageCp(activePrevRecord) || 0) > 0
                            ? 'text-rose-400 font-semibold'
                            : 'text-emerald-400 font-semibold'
                        }
                      >
                        {formatDiff((getAverageCp(activeRecord) || 0) - (getAverageCp(activePrevRecord) || 0))} $
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Section: Data Table */}
        <section className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400">table_chart</span>
              Bảng số liệu chi tiết
            </h2>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Hiển thị {filteredRecords.length} tháng ({selectedFilter === 'all' ? 'Tất cả' : selectedFilter})
            </span>
          </div>

          {/* Mobile View: Clean Card List (hiển thị trọn vẹn 100% không bị cắt tràn) */}
          <div className="md:hidden space-y-3">
            {[...filteredRecords].reverse().map((r) => {
              const globalIdx = records.findIndex((item) => item.month === r.month);
              const prev = globalIdx > 0 ? records[globalIdx - 1] : null;

              if (r.isPending || r.propane === null || r.butane === null) {
                return (
                  <div
                    key={`m-${r.month}`}
                    className="p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-sm text-slate-800 dark:text-slate-200">
                        {formatMonthLabel(r.month)}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-200/80 dark:bg-amber-900 text-amber-900 dark:text-amber-200 font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                        Chờ công bố
                      </span>
                    </div>
                    <p className="text-xs text-amber-800 dark:text-amber-300 italic">
                      Đang chờ công bố chính thức từ Saudi Aramco
                    </p>
                  </div>
                );
              }

              const avgVal = getAverageCp(r);
              const prevAvgVal = prev && !prev.isPending && prev.propane !== null ? getAverageCp(prev) : null;
              const delta = avgVal !== null && prevAvgVal !== null ? avgVal - prevAvgVal : null;

              return (
                <div
                  key={`m-${r.month}`}
                  className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                >
                  {/* Card Header: Month + MoM Diff */}
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200/70 dark:border-slate-700/60">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                      {formatMonthLabel(r.month)}
                    </span>
                    <div className={`text-xs font-bold flex items-center gap-1 ${getDiffClass(delta)}`}>
                      {delta === null ? (
                        <span className="text-slate-400 font-normal">Chưa có mốc so sánh</span>
                      ) : delta === 0 ? (
                        <span className="text-slate-500 font-medium">±0 USD/tấn</span>
                      ) : (
                        <span>
                          {getDiffArrow(delta)}
                          {formatDiff(delta)} USD/tấn
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 3 Metric Columns */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    {/* C3 */}
                    <div className="bg-white dark:bg-slate-900/80 p-2 rounded-lg border border-slate-200/60 dark:border-slate-800">
                      <div className="text-[10px] font-bold text-[#0e6b5c] dark:text-emerald-400 uppercase tracking-tight">
                        Propane (C3)
                      </div>
                      <div className="text-base font-black text-[#0e6b5c] dark:text-emerald-400 font-mono mt-0.5">
                        {r.propane.toLocaleString('vi-VN')}
                      </div>
                      <div className="text-[9px] text-slate-400 font-medium">USD/tấn</div>
                    </div>

                    {/* C4 */}
                    <div className="bg-white dark:bg-slate-900/80 p-2 rounded-lg border border-slate-200/60 dark:border-slate-800">
                      <div className="text-[10px] font-bold text-[#b4540f] dark:text-amber-500 uppercase tracking-tight">
                        Butane (C4)
                      </div>
                      <div className="text-base font-black text-[#b4540f] dark:text-amber-500 font-mono mt-0.5">
                        {r.butane.toLocaleString('vi-VN')}
                      </div>
                      <div className="text-[9px] text-slate-400 font-medium">USD/tấn</div>
                    </div>

                    {/* CP TB */}
                    <div className="bg-white dark:bg-slate-900/80 p-2 rounded-lg border border-slate-200/60 dark:border-slate-800">
                      <div className="text-[10px] font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-tight">
                        CP Trung bình
                      </div>
                      <div className="text-base font-black text-slate-900 dark:text-white font-mono mt-0.5">
                        {avgVal?.toLocaleString('vi-VN', { maximumFractionDigits: 1 })}
                      </div>
                      <div className="text-[9px] text-slate-400 font-medium">USD/tấn</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop View: Full Table */}
          <div className="hidden md:block overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
            <table className="w-full min-w-[580px] text-sm text-left border-collapse">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Tháng</th>
                  <th className="py-3 px-4 text-right">Propane (USD/tấn)</th>
                  <th className="py-3 px-4 text-right">Butane (USD/tấn)</th>
                  <th className="py-3 px-4 text-right">CP Trung bình</th>
                  <th className="py-3 px-4 text-right">So với tháng trước (TB)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {[...filteredRecords].reverse().map((r) => {
                  const globalIdx = records.findIndex((item) => item.month === r.month);
                  const prev = globalIdx > 0 ? records[globalIdx - 1] : null;

                  if (r.isPending || r.propane === null || r.butane === null) {
                    return (
                      <tr key={r.month} className="bg-amber-50/50 dark:bg-amber-950/20 text-slate-500 italic">
                        <td className="py-3 px-4 font-bold text-slate-700 dark:text-slate-300">
                          {formatMonthLabel(r.month)}
                        </td>
                        <td colSpan={4} className="py-3 px-4 text-left text-amber-700 dark:text-amber-400">
                          <span className="inline-flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                            Đang chờ công bố chính thức từ Saudi Aramco
                          </span>
                        </td>
                      </tr>
                    );
                  }

                  const avgVal = getAverageCp(r);
                  const prevAvgVal = prev && !prev.isPending && prev.propane !== null ? getAverageCp(prev) : null;
                  const delta = avgVal !== null && prevAvgVal !== null ? avgVal - prevAvgVal : null;

                  return (
                    <tr
                      key={r.month}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors text-slate-700 dark:text-slate-200"
                    >
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                        {formatMonthLabel(r.month)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-[#0e6b5c] dark:text-emerald-400">
                        {r.propane.toLocaleString('vi-VN')}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-[#b4540f] dark:text-amber-500">
                        {r.butane.toLocaleString('vi-VN')}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 dark:text-slate-100">
                        {avgVal?.toLocaleString('vi-VN', { maximumFractionDigits: 1 })}
                      </td>
                      <td className={`py-3 px-4 text-right font-semibold ${getDiffClass(delta)}`}>
                        {delta === null ? (
                          <span className="text-slate-400 font-normal">–</span>
                        ) : delta === 0 ? (
                          <span className="text-slate-400 font-normal">±0 USD/tấn</span>
                        ) : (
                          <span>
                            {getDiffArrow(delta)}
                            {formatDiff(delta)}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* Section: Calculator 12kg Cylinder Impact */}
        <section className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs mb-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-2xl">calculate</span>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              Ước tính tác động tới giá gas bình 12kg
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-5">
            Công cụ mô phỏng biến động giá nhập khẩu quy đổi ra mỗi bình gas dân dụng 12kg theo tỷ giá hiện hành.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="calc-delta"
                className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-1.5"
              >
                CP thay đổi (USD/tấn, âm nếu giảm):
              </label>
              <div className="relative">
                <input
                  id="calc-delta"
                  type="number"
                  step="0.5"
                  value={calcDelta}
                  onChange={(e) => setCalcDelta(parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-semibold focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
                <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-medium">USD/tấn</span>
              </div>
            </div>

            <div>
              <label
                htmlFor="calc-fx"
                className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-1.5"
              >
                Tỷ giá tham chiếu (VND/USD):
              </label>
              <div className="relative">
                <input
                  id="calc-fx"
                  type="number"
                  step="50"
                  value={calcFx}
                  onChange={(e) => setCalcFx(parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-semibold focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
                <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-medium">VND/USD</span>
              </div>
            </div>
          </div>

          {/* Result Box */}
          <div className="mt-5 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-sm sm:text-base font-semibold text-slate-700 dark:text-slate-200">
              Giá nhập khẩu tác động ước tính:
            </div>
            <div className="text-lg sm:text-2xl font-black flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded-lg ${
                  impact12kg > 0
                    ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                    : impact12kg < 0
                    ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                {getDiffArrow(impact12kg)}
                {formatDiff(impact12kg)} đồng / bình 12kg
              </span>
            </div>
          </div>

          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-3 leading-relaxed whitespace-pre-line">
            {content.calculatorNote}
          </p>
        </section>

        {/* Section: FAQ Accordion */}
        <section className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs mb-8">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400">help_outline</span>
            Câu hỏi thường gặp về giá CP LPG
          </h2>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {content.faqs.map((faq, idx) => (
              <details key={faq.id || idx} className="py-3.5 group" open={idx === 0}>
                <summary className="font-semibold text-sm sm:text-base cursor-pointer text-slate-800 dark:text-slate-200 hover:text-emerald-700 dark:hover:text-emerald-400 flex items-center justify-between list-none">
                  <span>{faq.question}</span>
                  <span className="material-symbols-outlined text-slate-400 group-open:rotate-180 transition-transform">
                    expand_more
                  </span>
                </summary>
                <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed pl-2 border-l-2 border-emerald-500 whitespace-pre-line">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </section>

        {/* Source Footer Note */}
        <div className="text-center text-xs text-slate-500 dark:text-slate-400 pt-2 pb-6 border-t border-slate-200 dark:border-slate-800/80">
          <p>{content.sourceNote}</p>
          <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">
            {content.disclaimerNote}
          </p>
        </div>
      </main>
    </div>
  );
}
