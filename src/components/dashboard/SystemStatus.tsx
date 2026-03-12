import { Activity, Clock, Wifi } from "lucide-react";
import type { FarmData } from "@/lib/farmData";

interface SystemStatusProps {
  status: FarmData["systemStatus"];
}

const SystemStatus = ({ status }: SystemStatusProps) => {
  const allOnline = status.sensorsOnline === status.totalSensors;

  return (
    <div className="w-full">
      <div className="space-y-4">
        
        {/* SENSORS ROW */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground shrink-0">
            <Wifi className="h-4 w-4" />
            <span className="font-medium">Sensors</span>
          </div>
          <span className={`text-sm font-bold text-right whitespace-nowrap ${allOnline ? "text-emerald-500" : "text-amber-500"}`}>
            {status.sensorsOnline}/{status.totalSensors} <span className="hidden xs:inline">Online</span>
          </span>
        </div>

        {/* LAST UPDATE ROW */}
        <div className="flex items-center justify-between gap-3 border-t border-white/5 pt-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground shrink-0">
            <Clock className="h-4 w-4" />
            <span className="font-medium">Updated</span>
          </div>
          {/* Logic: No truncate on larger screens (md:max-w-none) */}
          <span className="text-sm font-semibold text-right text-foreground truncate max-w-[100px] min-[350px]:max-w-none min-[350px]:overflow-visible min-[350px]:whitespace-nowrap">
            {status.lastUpdate}
          </span>
        </div>

        {/* UPTIME ROW */}
        <div className="flex items-center justify-between gap-3 border-t border-white/5 pt-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground shrink-0">
            <Activity className="h-4 w-4" />
            <span className="font-medium">Uptime</span>
          </div>
          <span className="text-sm font-semibold text-right text-emerald-500 md:whitespace-nowrap">
            {status.uptime}
          </span>
        </div>

      </div>
    </div>
  );
};

export default SystemStatus;
