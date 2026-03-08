import { Activity, Clock, Server, Wifi } from "lucide-react";
import type { FarmData } from "@/lib/farmData";

interface SystemStatusProps {
  status: FarmData["systemStatus"];
}

const SystemStatus = ({ status }: SystemStatusProps) => {
  const allOnline = status.sensorsOnline === status.totalSensors;

  return (
    <div className="glass-card rounded-xl p-5">
      <div className="mb-4 flex items-center gap-2">
        <Server className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          System Status
        </h3>
      </div>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground shrink-0">
            <Wifi className="h-4 w-4" />
            Sensors
          </div>
          <span className={`text-sm font-semibold text-right ${allOnline ? "text-status-good" : "text-status-moderate"}`}>
            {status.sensorsOnline}/{status.totalSensors} Online
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground shrink-0">
            <Clock className="h-4 w-4" />
            Last Update
          </div>
          <span className="text-sm font-semibold text-right text-foreground">{status.lastUpdate}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground shrink-0">
            <Activity className="h-4 w-4" />
            Uptime
          </div>
          <span className="text-sm font-semibold text-right text-status-good">{status.uptime}</span>
        </div>
      </div>
    </div>
  );
};

export default SystemStatus;
