import React, { useMemo } from "react";
import { Wind, Thermometer, Droplets, Gauge, Sun, Cloud, AlertCircle, Check, TrendingUp } from "lucide-react";
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
  good: "bg-emerald-600 text-white shadow-md",
  moderate: "bg-amber-500 text-white shadow-md",
  poor: "bg-rose-500 text-white shadow-md",
  offline: "bg-slate-500 text-white"
};

const ICON_BG_COLORS: Record<string, string> = {
  good: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  moderate: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  poor: "bg-rose-500/10 text-rose-700 dark:text-rose-400"
};

interface MetricCardProps {
  data: MetricCardType;
  enableShadow: boolean;
  t: any;
  onShowTrend: () => void; // New Prop
}

const MetricCard = ({ data, enableShadow, t, onShowTrend }: MetricCardProps) => {
  const Icon = ICON_MAP[data.icon] || Wind;

  const symbol = useMemo(() => {
    switch (data.status) {
      case "good": return <Check className="h-3.5 w-3.5 stroke-[4]" />;
      case "poor": return <AlertCircle className="h-3.5 w-3.5 stroke-[3]" />;
      case "moderate": return <span className="text-sm font-bold">~</span>;
      default: return null;
    }
  }, [data.status]);

  const containerClasses = useMemo(() => `
    relative overflow-hidden rounded-2xl p-4 min-[790px]:p-6 transition-all duration-300
    backdrop-blur-xl border flex flex-col h-full
    ${!enableShadow 
      ? "bg-slate-900/60 border-white/10 ring-1 ring-inset ring-white/10 shadow-none" 
      : "bg-white/70 border-black/[0.08] ring-1 ring-inset ring-black/[0.05] shadow-xl shadow-emerald-900/5"
    }
  `, [enableShadow]);

  const isComplexValue = typeof data.value !== 'string' && typeof data.value !== 'number';

  return (
    <div className={containerClasses}>
      {/* Top Gloss Luster */}
      <div className={`absolute top-0 left-0 right-0 h-[1px] z-30
        ${!enableShadow 
          ? "bg-gradient-to-r from-transparent via-white/20 to-transparent" 
          : "bg-gradient-to-r from-transparent via-black/10 to-transparent"
        }`} 
      />

      {/* 1. Header Section */}
      <div className="flex flex-wrap items-start justify-between gap-y-3 relative z-20">
        <div className="flex items-center gap-3 min-[790px]:gap-4 min-w-0">
          <div className={`rounded-xl p-2 min-[790px]:p-2.5 border border-emerald-200/50 dark:border-white/5 shrink-0 ${ICON_BG_COLORS[data.status] || ""}`}>
            <Icon className="h-5 w-5 min-[790px]:h-6 min-[790px]:w-6" />
          </div>
          
          <div className="min-w-0">
            <p className="text-base min-[790px]:text-[19px] font-black uppercase tracking-widest text-emerald-950 dark:text-slate-100 leading-tight truncate -mr-[0.3em]">
              {data.label}
            </p>
            <p className="text-[11px] min-[790px]:text-[14px] font-bold text-emerald-900/80 dark:text-slate-400 uppercase tracking-widest truncate">
              {t.realTime}
            </p>
          </div>
        </div>

        <span className={`inline-flex items-center justify-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] min-[790px]:text-[13px] font-black uppercase tracking-tighter shrink-0 ${STATUS_COLORS[data.status] || ""}`}>
          {symbol && <span className="brightness-110">{symbol}</span>}
          <span>{data.statusLabel}</span>
        </span>
      </div>

      {/* 2. Main Value Display */}
      <div className="mt-4 min-[790px]:mt-6 mb-1 flex items-baseline relative z-20 min-w-0 justify-between">
        <div className={`font-black tracking-widest text-emerald-950 dark:text-white
          ${isComplexValue ? 'flex-1' : 'text-3xl min-[790px]:text-5xl truncate'}
        `}>
          {data.value}
        </div>
        
        <span className="ml-1.5 min-[790px]:ml-2.5 text-sm min-[790px]:text-xl font-bold text-emerald-800/80 dark:text-emerald-500/60 tracking-widest shrink-0 self-baseline">
          {data.unit}
        </span>
      </div>

      {/* 3. The Invisible Spacer */}
      <div className="flex-1" />

      {/* 4. Min/Max Row */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-black/5 dark:border-white/5 pt-4 mt-2 relative z-20">
        <div className="flex items-center gap-1.5">
          <span className="uppercase text-[11px] min-[790px]:text-[13px] font-black text-emerald-900/70 dark:text-slate-400 tracking-widest">
            {t.min}
          </span>
          <div className="flex items-baseline gap-0.5">
            <span className="text-base min-[790px]:text-[18.5px] text-emerald-950 dark:text-slate-200 font-black tracking-widest">
              {data.min ?? '--'}
            </span>
            <span className="text-[11px] min-[790px]:text-[14px] font-bold text-emerald-900/70 dark:text-slate-500 tracking-widest">
              {data.unit}
            </span>
          </div>
        </div>
        
        <div className="hidden xs:block h-4 w-[1px] bg-black/5 dark:bg-white/10" />
        
        <div className="flex items-center gap-1.5">
          <span className="uppercase text-[11px] min-[790px]:text-[13px] font-black text-emerald-900/70 dark:text-slate-400 tracking-widest">
            {t.max}
          </span>
          <div className="flex items-baseline gap-0.5">
            <span className="text-base min-[790px]:text-[18.5px] text-emerald-950 dark:text-slate-200 font-black tracking-widest">
              {data.max ?? '--'}
            </span>
            <span className="text-[11px] min-[790px]:text-[14px] font-bold text-emerald-900/70 dark:text-slate-500 tracking-widest">
              {data.unit}
            </span>
          </div>
        </div>
      </div>

      {/* 5. Description & Trend Button Container */}
      <div className="mt-4 relative z-20">
        <p className={`text-[13px] min-[790px]:text-[16px] pr-14 leading-tight min-[790px]:leading-snug antialiased tracking-normal min-[790px]:tracking-widest ${
          data.status === 'poor' ? 'text-rose-700 dark:text-rose-400 font-bold' : 'text-emerald-950/80 dark:text-slate-400'
        }`}>
          {data.description}
        </p>

        {/* TREND ACTION BUTTON */}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onShowTrend();
          }}
          className={`absolute bottom-0 right-0 p-2.5 rounded-xl transition-all duration-300 group
            ${!enableShadow 
              ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-white/5" 
              : "bg-emerald-600/10 text-emerald-700 hover:bg-emerald-600/20 border border-black/5"
            }`}
          title="View Trends"
        >
          <TrendingUp className="h-4 w-4 min-[790px]:h-5 min-[790px]:w-5 transition-transform group-hover:scale-110 group-hover:-translate-y-0.5" />
        </button>
      </div>

      {/* Shadow Luster */}
      <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-black/[0.03] rounded-full blur-2xl pointer-events-none z-0 dark:hidden" />
    </div>
  );
};

export default MetricCard;
