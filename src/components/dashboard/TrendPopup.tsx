import React from "react";
import { X, TrendingUp, Clock } from "lucide-react";
import TrendChart from "./TrendChart";

interface TrendPopupProps {
  activeMetric: string | null;
  onClose: () => void;
  history: any[];
  isDark: boolean;
  t: any;
  loading?: boolean;
}

const TrendPopup = ({ activeMetric, onClose, history, isDark, t, loading }: TrendPopupProps) => {
  if (!activeMetric) return null;

  // 1. Define the Title variable first
  // This handles the "temperature" vs "temp" mismatch in your translations
  const displayTitle = t[activeMetric] || t['temp'];

  // 2. Map the data for the chart
  const chartData = history.map(point => {
    let firebaseKey = activeMetric;
    
    // If UI sends 'lintensity', fetch 'lux' from Firebase
    if (activeMetric === 'lintensity') firebaseKey = 'lux';
    
    return {
      displayTime: point.displayTime, // Matches X-Axis labels
      fullTime: point.fullTime,       // Matches Tooltip precision
      value: Number(point[firebaseKey] || 0)
    };
  });

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
      <div 
        className="absolute inset-0 bg-slate-950/40 backdrop-blur-md animate-in fade-in duration-500" 
        onClick={onClose} 
      />

      <div className={`relative w-full max-w-4xl overflow-hidden rounded-[2.5rem] border shadow-2xl transition-all animate-in zoom-in-95 duration-300 ${
        isDark 
          ? "bg-slate-900/90 border-white/10 ring-1 ring-white/5" 
          : "bg-white/85 border-black/10 ring-1 ring-inset ring-black/5"
      }`}>
        
        <div className="flex items-start justify-between p-6 md:p-10 pb-0">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-2xl ${isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-600/10 text-emerald-700'}`}>
              <TrendingUp size={28} />
            </div>
            <div>
              <h2 className={`text-2xl md:text-3xl font-black uppercase tracking-[0.2em] ${isDark ? 'text-white' : 'text-emerald-950'}`}>
                {displayTitle}
              </h2>
              <div className="flex items-center gap-2 mt-1 opacity-60">
                <Clock size={14} className={isDark ? "text-slate-400" : "text-emerald-900"} />
                <p className={`text-xs font-bold uppercase tracking-widest ${isDark ? "text-slate-400" : "text-emerald-900"}`}>
                  Real-time Analytics (Last 1hr)
                </p>
              </div>
            </div>
          </div>
          
          <button 
            onClick={onClose}
            className={`group p-2 rounded-full transition-all ${
              isDark ? "hover:bg-white/10 text-white" : "hover:bg-black/5 text-emerald-950"
            }`}
          >
            <X size={32} className="transition-transform group-hover:rotate-90" />
          </button>
        </div>

        <div className="p-6 md:p-10">
          {loading ? (
            <div className="h-[250px] flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
            </div>
          ) : chartData.length > 0 ? (
            <TrendChart 
              title={displayTitle} 
              data={chartData} 
              color={isDark ? "#10b981" : "#059669"}
              unit="" 
            />
          ) : (
            <div className="h-[250px] flex flex-col items-center justify-center text-center space-y-3">
               <p className="font-bold text-muted-foreground uppercase tracking-widest">No data found</p>
               <p className="text-xs opacity-50">Check if the ESP32 is logging to "weather"</p>
            </div>
          )}
        </div>
        
        <div className={`h-2 w-full ${isDark ? 'bg-emerald-500/20' : 'bg-emerald-600/10'}`} />
      </div>
    </div>
  );
};

export default TrendPopup;
