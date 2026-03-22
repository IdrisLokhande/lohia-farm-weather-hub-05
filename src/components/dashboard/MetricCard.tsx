import React, { useMemo, useState, memo } from "react";
import { Wind, Thermometer, Droplets, Gauge, Sun, Cloud, AlertCircle, Check, TrendingUp, MoreHorizontal, X } from "lucide-react";
import type { MetricCard as MetricCardType } from "@/lib/farmData";

const ICON_MAP: Record<string, React.ElementType> = {
  wind: Wind,
  thermometer: Thermometer,
  droplets: Droplets,
  gauge: Gauge,
  cloud: Cloud,
  sun: Sun,
};

const STATUS_COLORS: Record<string, string> = {
  good: "bg-emerald-600 text-white shadow-sm",
  moderate: "bg-amber-500 text-white shadow-sm",
  poor: "bg-rose-500 text-white shadow-sm",
  offline: "bg-slate-500 text-white"
};

const ICON_BG_COLORS: Record<string, string> = {
  good: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  moderate: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  poor: "bg-rose-500/10 text-rose-700 dark:text-rose-400"
};

interface MetricCardProps {
  data: MetricCardType & { pmBreakdown?: { l: string, v: number | string }[] };
  enableShadow: boolean;
  t: any;
  onShowTrend: () => void;
}

const MetricCard = memo(({ data, enableShadow, t, onShowTrend }: MetricCardProps) => {
  const [showBreakdown, setShowBreakdown] = useState(false);

  if (!data) return null;

  const Icon = ICON_MAP[data.icon] || Wind;
  const isAQI = data.icon === 'wind' || data.label?.toLowerCase().includes('aqi');

  const symbol = useMemo(() => {
    switch (data.status) {
      case "good": return <Check className="h-3.5 w-3.5 stroke-[4]" />;
      case "poor": return <AlertCircle className="h-3.5 w-3.5 stroke-[3]" />;
      case "moderate": return <span className="text-sm font-bold">~</span>;
      default: return null;
    }
  }, [data.status]);

  // OPTIMIZATION: Specific transitions and slightly lower blur to save GPU memory
  const containerClasses = useMemo(() => `
    relative overflow-hidden rounded-2xl p-4 min-[790px]:p-6 
    transition-[transform, opacity] duration-200
    backdrop-blur-md border flex flex-col h-full
    ${!enableShadow 
      ? "bg-slate-900/60 border-white/10 ring-1 ring-inset ring-white/10 shadow-none" 
      : "bg-white/75 border-black/[0.08] ring-1 ring-inset ring-black/[0.05] shadow-lg shadow-emerald-900/5"
    }
  `, [enableShadow]);

  return (
    <div className={containerClasses}>
      <div className={`absolute top-0 left-0 right-0 h-[1px] z-30 opacity-40
        ${!enableShadow 
          ? "bg-gradient-to-r from-transparent via-white/30 to-transparent" 
          : "bg-gradient-to-r from-transparent via-black/10 to-transparent"
        }`} 
      />

      {/* HEADER SECTION */}
      <div className="flex flex-wrap items-start justify-between gap-y-3 relative z-20">
        <div className="flex items-center gap-3 min-[790px]:gap-4 min-w-0 flex-1">
          <div className={`rounded-xl p-2 min-[790px]:p-2.5 border border-emerald-500/10 shrink-0 ${ICON_BG_COLORS[data.status] || ""}`}>
            <Icon className="h-5 w-5 min-[790px]:h-6 min-[790px]:w-6" />
          </div>
          
          <div className="flex items-center gap-3 min-w-0">
            <p className="text-[18px] min-[790px]:text-[22px] font-black uppercase tracking-widest text-emerald-950 dark:text-slate-100 leading-tight truncate">
              {data.label}
            </p>

            {isAQI && data.pmBreakdown && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setShowBreakdown(!showBreakdown);
                }}
                className={`flex-shrink-0 p-1.5 rounded-lg transition-colors
                  ${showBreakdown 
                    ? 'bg-emerald-500 text-white' 
                    : 'bg-black/5 dark:bg-white/10 text-slate-400 hover:text-emerald-500'
                  }`}
              >
                {showBreakdown ? <X size={16} /> : <MoreHorizontal size={18} />}
              </button>
            )}
          </div>
        </div>

        <span className={`inline-flex items-center justify-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] min-[790px]:text-[13px] font-black uppercase tracking-tighter shrink-0 ${STATUS_COLORS[data.status] || ""}`}>
          {symbol && <span className="brightness-110">{symbol}</span>}
          <span>{data.statusLabel}</span>
        </span>
      </div>

      {/* MAIN VALUE / BREAKDOWN */}
      <div className="mt-4 min-[790px]:mt-6 mb-1 relative z-20 min-h-[60px] flex items-center">
        {!showBreakdown ? (
          <div className="flex items-baseline w-full justify-between">
            <div className="text-3xl min-[790px]:text-5xl font-black tracking-widest text-emerald-950 dark:text-white truncate">
              {data.value}
            </div>
            <span className="text-sm min-[790px]:text-xl font-bold text-emerald-800/80 dark:text-emerald-500/60 tracking-widest shrink-0">
              {data.unit}
            </span>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2 w-full animate-in fade-in zoom-in-95 duration-200">
            {data.pmBreakdown?.map((pm, idx) => (
              <div key={idx} className="bg-black/5 dark:bg-white/5 p-2 rounded-lg border border-black/5 dark:border-white/5">
                <p className="text-[9px] font-black uppercase opacity-50 tracking-tighter mb-1 truncate">{pm.l}</p>
                <p className="text-lg font-black text-emerald-950 dark:text-emerald-400 leading-none">{pm.v}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex-1" />

      {/* STATS ROW */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-black/5 dark:border-white/5 pt-4 mt-2 relative z-20">
        <div className="flex items-center gap-1.5">
          <span className="uppercase text-[11px] font-black text-emerald-900/60 dark:text-slate-400 tracking-widest">{t.min}</span>
          <span className="text-base text-emerald-950 dark:text-slate-200 font-black tracking-widest">{data.min ?? '--'}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="uppercase text-[11px] font-black text-emerald-900/60 dark:text-slate-400 tracking-widest">{t.max}</span>
          <span className="text-base text-emerald-950 dark:text-slate-200 font-black tracking-widest">{data.max ?? '--'}</span>
        </div>
      </div>

      {/* FOOTER & ACTION */}
      <div className="mt-4 relative z-20">
        <p className={`text-[13px] pr-12 leading-tight antialiased ${
          data.status === 'poor' ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-emerald-900/70 dark:text-slate-400'
        }`}>
          {data.description}
        </p>

        <button 
          onClick={(e) => { e.stopPropagation(); onShowTrend(); }}
          className="absolute bottom-0 right-0 p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition-all border border-emerald-500/5 group"
        >
          <TrendingUp size={18} className="group-hover:scale-110 group-hover:-translate-y-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
});

export default MetricCard;
