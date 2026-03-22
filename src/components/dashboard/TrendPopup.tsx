import React, { useState, useEffect, useCallback, memo } from "react";
import { createPortal } from "react-dom";
import { X, TrendingUp, Clock } from "lucide-react";
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

  const processRawData = useCallback((rawData: any[], metric: string) => {
    if (!rawData || rawData.length === 0 || !metric) return [];
    return rawData.map(point => {
      let val = 0;
      if (metric === "airQuality") {
        val = WeatherPhysics.calculateIndiaAQI(Number(point.pm25 || 0), Number(point.pm10 || 0));
      } else {
        let firebaseKey = metric;
        if (metric === "lintensity") firebaseKey = "lux";
        val = Number(point[firebaseKey] || 0);
      }
      return {
        id: point.id,
        timestamp: point.timestamp,
        displayTime: new Date(point.timestamp).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        fullTime: new Date(point.timestamp).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
        value: val,
      };
    });
  }, []);

  // UPDATED: Non-Destructive Scroll Lock
  useEffect(() => {
  if (activeMetric) {
    // 1. Lock the scroll to prevent background movement while viewing trends
    document.body.style.overflow = 'hidden';
    
    // 2. Standard state reset for the popup
    setTimeRange("1h");
  } else {
    // 3. Simple cleanup when closing
    document.body.style.overflow = '';
  }

  // 4. Critical: Cleanup on unmount (if user navigates away while popup is open)
  return () => {
    document.body.style.overflow = '';
  };
  }, [activeMetric]);  

  useEffect(() => {
    if (activeMetric && timeRange === "1h") {
      const liveData = processRawData(history, activeMetric);
      setChartData(liveData);
    }
  }, [activeMetric, history, timeRange, processRawData]);

  const handleTimeRangeChange = async (newRange: string) => {
    if (newRange === timeRange) return;
    setTimeRange(newRange);

    if (newRange === "1h") {
      const initialData = processRawData(history, activeMetric!);
      setChartData(initialData);
      return;
    }

    setIsFetchingRange(true);
    try {
      const now = Date.now();
      let startTime = now;
      let samplingInterval = 45000;

      switch (newRange) {
        case "24h":
          startTime = now - 24 * 60 * 60 * 1000;
          samplingInterval = 5 * 60 * 1000;
          break;
        case "7d":
          startTime = now - 7 * 24 * 60 * 60 * 1000;
          samplingInterval = 30 * 60 * 1000;
          break;
        case "30d":
          startTime = now - 30 * 24 * 60 * 60 * 1000;
          samplingInterval = 2 * 60 * 60 * 1000;
          break;
      }

      const weatherRef = ref(rtdb, "weather");
      const dbQuery = query(weatherRef, orderByChild("timestamp"), startAt(startTime));
      const snapshot = await get(dbQuery);

      if (!snapshot.exists()) {
        setChartData([]);
        return;
      }

      const rawData: any[] = [];
      snapshot.forEach(child => {
        rawData.push({ ...child.val(), id: child.key });
      });

      let lastStoredTimestamp = 0;
      const sampledData = rawData.filter(point => {
        if (point.timestamp - lastStoredTimestamp >= samplingInterval) {
          lastStoredTimestamp = point.timestamp;
          return true;
        }
        return false;
      });

      if (rawData.length > 0 && (!sampledData.length || sampledData[sampledData.length - 1]?.id !== rawData[rawData.length - 1]?.id)) {
        sampledData.push(rawData[rawData.length - 1]);
      }

      const processed = processRawData(sampledData, activeMetric!);
      setChartData(processed);
    } catch (error) {
      console.error("Error fetching data:", error);
      setChartData([]);
    } finally {
      setIsFetchingRange(false);
    }
  };

  if (!activeMetric) return null;

  let displayTitle = t[activeMetric] || t.temp;
  if (activeMetric === "airQuality") displayTitle = t.aqi;

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-6 isolate overflow-hidden">
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-500"
        onClick={onClose}
      />

      <div
        className={`relative w-full max-w-4xl max-h-[90dvh] flex flex-col overflow-hidden
          rounded-[2.5rem] border shadow-2xl transition-all animate-in zoom-in-95 duration-300 
          ${isDark
            ? "bg-slate-900/95 border-white/10 ring-1 ring-white/5"
            : "bg-white/90 border-black/10 ring-1 ring-inset ring-black/5"
          }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`sticky top-0 z-20 p-6 md:p-10 pb-4 backdrop-blur-md ${isDark ? "bg-slate-900/50" : "bg-white/50"}`}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
              <div className={`p-3 rounded-2xl ${isDark ? "bg-emerald-500/10 text-emerald-400" : "bg-emerald-600/10 text-emerald-700"}`}>
                <TrendingUp size={28} />
              </div>
              <div>
                <h2 className={`text-xl md:text-3xl font-black uppercase tracking-[0.2em] ${isDark ? "text-white" : "text-emerald-950"}`}>
                  {displayTitle}
                </h2>
                <div className="flex items-center gap-2 mt-1 opacity-60 justify-center md:justify-start">
                  <Clock size={14} className={isDark ? "text-slate-400" : "text-emerald-900"} />
                  <p className={`text-xs font-bold uppercase tracking-widest ${isDark ? "text-slate-400" : "text-emerald-900"}`}>
                    Analytics ({t[timeRange] || "1 Hour"})
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className={`absolute top-6 right-6 md:static group p-2 rounded-full transition-all ${isDark ? "hover:bg-white/10 text-white" : "hover:bg-black/5 text-emerald-950"}`}
            >
              <X size={32} className="transition-transform group-hover:rotate-90" />
            </button>
          </div>
        </div>

        <div className="flex-grow overflow-y-auto scrollbar-hide px-6 md:px-10 pb-6">
          {loading || isFetchingRange ? (
            <div className="min-h-[250px] flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
            </div>
          ) : chartData.length > 0 ? (
            <div className="w-full">
              <TrendChart
                title={displayTitle}
                data={chartData}
                color={isDark ? "#10b981" : "#059669"}
                unit={metricUnit}
              />
            </div>
          ) : (
            <div className="min-h-[250px] flex flex-col items-center justify-center text-center space-y-3">
              <p className="font-bold text-muted-foreground uppercase tracking-widest text-sm">No data found</p>
            </div>
          )}

          <div className="flex md:hidden justify-center mt-6">
            <div className={`flex rounded-full p-1 w-full justify-center ${isDark ? "bg-slate-800/70" : "bg-emerald-100/70"}`}>
              {["1h", "24h", "7d", "30d"].map(range => (
                <button
                  key={range}
                  onClick={() => handleTimeRangeChange(range)}
                  className={`flex-1 px-3 py-1.5 text-[11px] rounded-full font-black uppercase tracking-widest transition-all ${
                    timeRange === range
                      ? `shadow-md ${isDark ? "bg-slate-600 text-white" : "bg-white text-emerald-800"}`
                      : `opacity-60 ${isDark ? "text-slate-300" : "text-emerald-900"}`
                  }`}
                >
                  {t[range]}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="hidden md:flex justify-end p-6 pt-0">
          <div className={`flex rounded-full p-1 ${isDark ? "bg-slate-800/70" : "bg-emerald-100/70"}`}>
            {["1h", "24h", "7d", "30d"].map(range => (
              <button
                key={range}
                onClick={() => handleTimeRangeChange(range)}
                className={`px-4 py-2 text-xs rounded-full font-black uppercase transition-all ${
                  timeRange === range ? "bg-white text-emerald-800 shadow-sm" : "opacity-50"
                }`}
              >
                {t[range]}
              </button>
            ))}
          </div>
        </div>

        <div className={`h-2 w-full shrink-0 ${isDark ? "bg-emerald-500/20" : "bg-emerald-600/10"}`} />
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

// EXPORT WITH MEMO
export default memo(TrendPopup);
