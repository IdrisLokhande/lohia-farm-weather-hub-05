import { Activity, Clock, Wifi } from "lucide-react";
import type { FarmData } from "@/lib/farmData";

interface SystemStatusProps {
  status: FarmData["systemStatus"];
  isLight: boolean;
  t: any;
}

const SystemStatus = ({ status, isLight, t }: SystemStatusProps) => {
  const allOnline = status.sensorsOnline === status.totalSensors;

  return (
    <div className="w-full">
      <div className="space-y-4">        
        {/* SENSORS ROW */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-lg text-muted-foreground shrink-0">
            <Wifi className="h-4 w-4" />
            <span className="font-medium">{t.sensors}</span>
          </div>
          <span className={`text-lg font-bold text-right whitespace-nowrap ${allOnline ? "text-emerald-500" : "text-amber-500"}`}>
            {status.sensorsOnline}/{status.totalSensors} <span className="hidden xxs:inline">{t.online}</span>
          </span>
        </div>

        {/* LAST UPDATE ROW */}
        <div className={`flex items-center justify-between gap-3 border-t ${isLight ? "border-black/20" : "border-white/10"} pt-3`}>
          <div className="flex items-center gap-2 text-lg text-muted-foreground shrink-0">
            <Clock className="h-4 w-4" />
            <span className="font-medium">{t.lupdate}</span>
          </div>
          {/* Logic: No truncate on larger screens (md:max-w-none) */}
          <span className="text-lg font-semibold text-right text-foreground truncate max-w-[130px] min-[575px]:max-w-none min-[575px]:overflow-visible min-[575px]:whitespace-nowrap">
            {status.lastUpdate}
          </span>
        </div>

        {/* UPTIME ROW */}
        <div className={`flex items-center justify-between gap-3 border-t ${isLight ? "border-black/20" : "border-white/10"} pt-3`}>
          <div className="flex items-center gap-2 text-lg text-muted-foreground shrink-0">
            <Activity className="h-4 w-4" />
            <span className="font-medium">{t.uptime}</span>
          </div>
          <span className="text-lg font-semibold text-right text-emerald-500 md:whitespace-nowrap">
            {status.uptime}
          </span>
        </div>

      </div>
    </div>
  );
};

export default SystemStatus;
