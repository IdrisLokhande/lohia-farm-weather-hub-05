import { Activity, Clock, Wifi, WifiOff } from "lucide-react";
import type { FarmData } from "@/lib/farmData";

interface SystemStatusProps {
  status: FarmData["systemStatus"];
  isLight: boolean;
  t: any;
  isVisualOffline: boolean;
}

const SystemStatus = ({ status, isLight, t, isVisualOffline }: SystemStatusProps) => {
  const allOnline = status.sensorsOnline === status.totalSensors;

  const lastUpdateColor = isVisualOffline 
    ? (isLight ? "text-slate-700" : "text-slate-400") 
    : "text-foreground";

  const uptimeColor = isVisualOffline 
    ? (isLight ? "text-emerald-700" : "text-emerald-300/90") 
    : "text-emerald-500";

  return (
    <div className="w-full px-1">
      {/* Fixed 150px lane for labels. 1fr takes the remaining space for values. */}
      <div className="grid grid-cols-[150px_1fr] gap-y-4 items-center">        
        
        {/* SENSORS ROW */}
        <div className="flex items-center gap-2 text-lg text-muted-foreground min-w-0">
          {isVisualOffline ? <WifiOff className="h-4 w-4 text-rose-500" /> : <Wifi className="h-4 w-4" />}
          <span className="font-medium whitespace-nowrap">{t.sensors}</span>
        </div>
        <div className="flex justify-end min-w-0 overflow-hidden">
          <span className={`text-lg font-bold text-right transition-all duration-500 truncate ${
            isVisualOffline 
              ? "text-rose-500 w-full" 
              : allOnline ? "text-emerald-500" : "text-amber-500"
          }`}>
            {isVisualOffline ? t.notConnected : `${status.sensorsOnline}/${status.totalSensors} ${t.online}`}
          </span>
        </div>

        {/* LAST UPDATE ROW */}
        <div className={`flex items-center gap-2 text-lg text-muted-foreground border-t ${isLight ? "border-black/20" : "border-white/10"} pt-3 min-w-0`}>
          <Clock className="h-4 w-4" />
          <span className="font-medium whitespace-nowrap">{t.lupdate}</span>
        </div>
        <div className={`flex justify-end text-lg font-semibold text-right border-t ${isLight ? "border-black/20" : "border-white/10"} pt-3 ${lastUpdateColor} min-w-0 overflow-hidden`}>
          {/* Show date-only on mobile, full string only when there's enough room (>= 500px) */}
          <span className="inline min-[500px]:hidden truncate">
            {status.lastUpdate?.split(',')[0]}
          </span>
          <span className="hidden min-[500px]:inline whitespace-nowrap">
            {status.lastUpdate}
          </span>
        </div>

        {/* UPTIME ROW */}
        <div className={`flex items-center gap-2 text-lg text-muted-foreground border-t ${isLight ? "border-black/20" : "border-white/10"} pt-3 min-w-0`}>
          <Activity className="h-4 w-4" />
          <span className="font-medium whitespace-nowrap">{t.uptime}</span>
        </div>
        <div className={`flex justify-end border-t ${isLight ? "border-black/20" : "border-white/10"} pt-3 min-w-0 overflow-hidden`}>
          <span className={`text-lg font-semibold text-right whitespace-nowrap truncate ${uptimeColor}`}>
            {status.uptime}
          </span>
        </div>

      </div>
    </div>
  );
};

export default SystemStatus;
