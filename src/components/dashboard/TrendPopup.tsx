import React, { useState, useEffect, useCallback, memo, useRef } from "react";
import { createPortal } from "react-dom";
import { X, TrendingUp } from "lucide-react";
import TrendChart from "./TrendChart";
import { WeatherPhysics } from "@/lib/weather-physics";
import { rtdb } from "@/lib/firebase";
import { ref, get, query, orderByChild, startAt } from "firebase/database";

interface TrendPopupProps {
  activeMetric: string | null;
  metricUnit: string;
  onClose: () => void;
  history: any[];
  isDark: boolean;
  t: any;
  loading?: boolean;
}

const TrendPopup = ({
  activeMetric,
  metricUnit,
  onClose,
  history,
  isDark,
  t,
  loading,
}: TrendPopupProps) => {
  const [timeRange, setTimeRange] = useState("1h");
  const [chartData, setChartData] = useState<any[]>([]);
  const [isFetchingRange, setIsFetchingRange] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const getChartMinWidth = (range: string) => {
    switch (range) {
      case "24h": return "1600px"; 
      case "7d": return "3800px";  
      case "30d": return "8000px"; 
      default: return "100%";      
    }
  };

  useEffect(() => {
    if (scrollContainerRef.current && !isFetchingRange && chartData.length > 0) {
      const container = scrollContainerRef.current;
      container.scrollTo({ left: container.scrollWidth, behavior: 'instant' });
    }
  }, [chartData, isFetchingRange]);

  const processRawData = useCallback((rawData: any[], metric: string) => {
    if (!rawData || rawData.length === 0 || !metric) return [];
    return rawData.map(point => {
      if (point.isGapMarker) return point;
      let val = 0;
      if (metric === "airQuality") {
        val = WeatherPhysics.calculateIndiaAQI(Number(point.pm25 || 0), Number(point.pm10 || 0));
      } else {
        let firebaseKey = metric === "lintensity" ? "lux" : metric;
        val = Number(point[firebaseKey] || 0);
      }
      return { id: point.id, timestamp: point.timestamp, value: val };
    });
  }, []);

  useEffect(() => {
    if (activeMetric) {
      document.body.style.overflow = 'hidden';
      setTimeRange("1h");
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [activeMetric]);

  useEffect(() => {
    if (activeMetric && timeRange === "1h") {
      const now = Date.now();
      const oneHourAgo = now - 3600000;
      const filteredHistory = history.filter(point => Number(point.timestamp) >= oneHourAgo);
      setChartData(processRawData(filteredHistory, activeMetric));
    }
  }, [activeMetric, history, timeRange, processRawData]);

  const handleTimeRangeChange = async (newRange: string) => {
    if (newRange === timeRange) return;
    setTimeRange(newRange);
    const now = Date.now();
    if (newRange === "1h") {
      const oneHourAgo = now - 3600000;
      const filtered = history.filter(p => Number(p.timestamp) >= oneHourAgo);
      setChartData(processRawData(filtered, activeMetric!));
      return;
    }
    setIsFetchingRange(true);
    try {
      let startTime = now - (newRange === "24h" ? 86400000 : newRange === "7d" ? 604800000 : 2592000000);
      
      // IMPROVED: Higher density sampling for 7d and 30d
      let samplingInterval = newRange === "24h" ? 300000 : 
                             newRange === "7d" ? 900000 : // 15 mins
                             3600000; // 1 hour (much better than 4)

      const weatherRef = ref(rtdb, "weather");
      const dbQuery = query(weatherRef, orderByChild("timestamp"), startAt(Number(startTime)));
      const snapshot = await get(dbQuery);
      if (!snapshot.exists()) { setChartData([]); return; }
      const rawData: any[] = [];
      snapshot.forEach(child => {
        const val = child.val();
        const ts = Number(val.timestamp);
        if (ts >= startTime && ts <= now) rawData.push({ ...val, id: child.key, timestamp: ts });
      });
      rawData.sort((a, b) => a.timestamp - b.timestamp);
      let lastTs = 0;
      const sampled = rawData.filter(p => {
        if (p.timestamp - lastTs >= samplingInterval) { lastTs = p.timestamp; return true; }
        return false;
      });
      const final: any[] = [];
      // RELAXED: gapThreshold is now 3.5x interval to avoid stuttering lines
      const gapThreshold = samplingInterval * 3.5;
      for (let i = 0; i < sampled.length; i++) {
        final.push(sampled[i]);
        if (i < sampled.length - 1 && (sampled[i+1].timestamp - sampled[i].timestamp) > gapThreshold) {
          final.push({ timestamp: sampled[i].timestamp + (sampled[i+1].timestamp - sampled[i].timestamp) / 2, value: null, isGapMarker: true, gapStart: sampled[i].timestamp, gapEnd: sampled[i+1].timestamp, id: `gap-${sampled[i].timestamp}` });
        }
      }
      setChartData(processRawData(final, activeMetric!));
    } catch (e) { setChartData([]); } finally { setIsFetchingRange(false); }
  };

  if (!activeMetric) return null;
  const displayTitle = activeMetric === "airQuality" ? t.aqi : (t[activeMetric] || t.temp);

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-8 isolate overflow-hidden">
      <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose} />
      
      <style>{`
        @media (max-height: 545px) {
          .trend-card-scrollable {
            overflow-y: auto !important;
            display: block !important;
          }
          .trend-card-scrollable > div { margin-bottom: 0.5rem; }
        }
        .trend-card-scrollable::-webkit-scrollbar { display: none; }
        .trend-card-scrollable { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <div className={`trend-card-scrollable relative w-full max-w-4xl h-fit max-h-[90vh] flex flex-col rounded-[2.5rem] border shadow-2xl overflow-y-auto overflow-x-hidden scrollbar-none ${isDark ? "bg-slate-900/95 border-white/10" : "bg-white/95 border-black/10"}`} onClick={(e) => e.stopPropagation()}>
        
        <div className="shrink-0 p-6 md:p-8 pb-0 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${isDark ? "bg-emerald-500/10 text-emerald-400" : "bg-emerald-600/10 text-emerald-700"}`}><TrendingUp size={18} /></div>
            <div>
              <h2 className={`text-base md:text-xl font-black uppercase tracking-wider ${isDark ? "text-white" : "text-emerald-950"}`}>{displayTitle}</h2>
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] opacity-40">{t[timeRange]}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:opacity-50 transition-all"><X size={22} /></button>
        </div>

        <div className="shrink-0 h-[220px] md:h-[280px] px-2 md:px-6 flex flex-col overflow-hidden">
          {loading || isFetchingRange ? (
            <div className="flex-1 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" /></div>
          ) : chartData.length > 0 ? (
            <div ref={scrollContainerRef} className="h-full overflow-x-auto overflow-y-hidden pt-4 pb-2 scrollbar-none cursor-grab active:cursor-grabbing">
              <div style={{ minWidth: getChartMinWidth(timeRange), height: '100%' }}>
                <TrendChart title={displayTitle} data={chartData} color={isDark ? "#10b981" : "#059669"} unit={metricUnit} range={timeRange} t={t} />
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center opacity-40 min-h-[120px]">
               <p className="font-black text-[10px] uppercase tracking-[0.3em]">No Data Recorded</p>
            </div>
          )}
        </div>

        <div className="shrink-0 p-6 md:p-8 pt-2 flex justify-center">
          <div className={`grid grid-cols-4 md:flex items-center w-full md:w-auto rounded-2xl p-1 gap-1 ${isDark ? "bg-slate-800/60" : "bg-emerald-100/60"}`}>
            {["1h", "24h", "7d", "30d"].map(range => (
              <button key={range} onClick={() => handleTimeRangeChange(range)} className={`px-1 md:px-6 py-2 rounded-xl text-[9px] md:text-[10px] font-black uppercase transition-all whitespace-nowrap ${timeRange === range ? "bg-emerald-500 text-white shadow-lg" : `opacity-40 hover:opacity-100 ${isDark ? "text-slate-200" : "text-emerald-950"}`}`}>
                {t[range]}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default memo(TrendPopup);
