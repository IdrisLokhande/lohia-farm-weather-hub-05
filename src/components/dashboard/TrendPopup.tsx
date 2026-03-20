import React, { useState, useEffect, useCallback } from "react";
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

  // Effect to reset the state to default ("1h") ONLY when the popup is opened.
  useEffect(() => {
    if (activeMetric) {
      setTimeRange("1h"); // Reset to 1h when popup reopens
    }
  }, [activeMetric]);

  // Effect to update chart data when the time range changes or when live data arrives for the 1h view.
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
      let samplingInterval = 45000; // Default

      switch (newRange) {
        case "24h":
          startTime = now - 24 * 60 * 60 * 1000;
          samplingInterval = 5 * 60 * 1000; // 5 minutes
          break;
        case "7d":
          startTime = now - 7 * 24 * 60 * 60 * 1000;
          samplingInterval = 30 * 60 * 1000; // 30 minutes
          break;
        case "30d":
          startTime = now - 30 * 24 * 60 * 60 * 1000;
          samplingInterval = 2 * 60 * 60 * 1000; // 2 hours
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

      // Sample the data to prevent chart overload
      let lastStoredTimestamp = 0;
      const sampledData = rawData.filter(point => {
        if (point.timestamp - lastStoredTimestamp >= samplingInterval) {
          lastStoredTimestamp = point.timestamp;
          return true;
        }
        return false;
      });
      // Always include the last point for accuracy
      if (
        rawData.length > 0 &&
        (!sampledData.length ||
          sampledData[sampledData.length - 1]?.id !== rawData[rawData.length - 1]?.id)
      ) {
        sampledData.push(rawData[rawData.length - 1]);
      }

      const processed = processRawData(sampledData, activeMetric!);
      setChartData(processed);
    } catch (error) {
      console.error("Error fetching data for range:", error);
      setChartData([]);
    } finally {
      setIsFetchingRange(false);
    }
  };

  if (!activeMetric) return null;

  // 1. Define the Title variable first
  // This handles the "temperature" vs "temp" mismatch in your translations
  let displayTitle = t[activeMetric] || t.temp;
  if (activeMetric === "airQuality") {
    displayTitle = t.aqi;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
      <div
        className="absolute inset-0 bg-slate-950/40 backdrop-blur-md animate-in fade-in duration-500"
        onClick={onClose}
      />

      <div
        className={`relative w-full max-w-4xl overflow-hidden rounded-[2.5rem] border shadow-2xl transition-all animate-in zoom-in-95 duration-300 ${
          isDark
            ? "bg-slate-900/90 border-white/10 ring-1 ring-white/5"
            : "bg-white/85 border-black/10 ring-1 ring-inset ring-black/5"
        }`}
      >
        <div className="flex items-center justify-between p-6 md:p-10 pb-0">
          <div className="flex items-center gap-4">
            <div
              className={`p-3 rounded-2xl ${isDark ? "bg-emerald-500/10 text-emerald-400" : "bg-emerald-600/10 text-emerald-700"}`}
            >
              <TrendingUp size={28} />
            </div>
            <div>
              <h2
                className={`text-2xl md:text-3xl font-black uppercase tracking-[0.2em] ${isDark ? "text-white" : "text-emerald-950"}`}
              >
                {displayTitle}
              </h2>
              <div className="flex items-center gap-2 mt-1 opacity-60">
                <Clock size={14} className={isDark ? "text-slate-400" : "text-emerald-900"} />
                <p
                  className={`text-xs font-bold uppercase tracking-widest ${isDark ? "text-slate-400" : "text-emerald-900"}`}
                >
                  Real-time Analytics (Last {t[timeRange] || "1 Hour"})
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 md:gap-6">
            {/* Time Range Selector */}
            <div
              className={`flex rounded-full p-1 transition-all ${isDark ? "bg-slate-800/70" : "bg-emerald-100/70"}`}
            >
              {["1h", "24h", "7d", "30d"].map(range => (
                <button
                  key={range}
                  onClick={() => handleTimeRangeChange(range)}
                  className={`px-3 py-1.5 text-[11px] md:text-xs rounded-full transition-all font-black uppercase tracking-widest ${
                    timeRange === range
                      ? `shadow-md ${isDark ? "bg-slate-600 text-white" : "bg-white text-emerald-800"}`
                      : `opacity-60 hover:opacity-100 ${isDark ? "text-slate-300" : "text-emerald-900"}`
                  }`}
                >
                  {t[range]}
                </button>
              ))}
            </div>

            <button
              onClick={onClose}
              className={`group p-2 rounded-full transition-all ${isDark ? "hover:bg-white/10 text-white" : "hover:bg-black/5 text-emerald-950"}`}
            >
              <X size={32} className="transition-transform group-hover:rotate-90" />
            </button>
          </div>
        </div>

        <div className="p-6 md:p-10">
          {loading || isFetchingRange ? (
            <div className="h-[250px] flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
            </div>
          ) : chartData.length > 0 ? (
            <TrendChart
              title={displayTitle}
              data={chartData}
              color={isDark ? "#10b981" : "#059669"}
              unit={metricUnit}
            />
          ) : (
            <div className="h-[250px] flex flex-col items-center justify-center text-center space-y-3">
              <p className="font-bold text-muted-foreground uppercase tracking-widest">
                No data found
              </p>
              <p className="text-xs opacity-50">Check if the ESP32 is logging to "weather"</p>
            </div>
          )}
        </div>

        <div className={`h-2 w-full ${isDark ? "bg-emerald-500/20" : "bg-emerald-600/10"}`} />
      </div>
    </div>
  );
};

export default TrendPopup;
