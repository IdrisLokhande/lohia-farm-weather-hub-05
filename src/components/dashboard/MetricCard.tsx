import { Wind, Thermometer, Droplets, Gauge, Cloud } from "lucide-react";
import type { MetricCard as MetricCardType } from "@/lib/farmData";

const iconMap: Record<string, React.ElementType> = {
  wind: Wind,
  thermometer: Thermometer,
  droplets: Droplets,
  gauge: Gauge,
  cloud: Cloud,
};

const statusColors: Record<string, string> = {
  good: "bg-status-good text-primary-foreground",
  moderate: "bg-status-moderate text-primary-foreground",
  poor: "bg-status-poor text-primary-foreground",
};

const iconBgColors: Record<string, string> = {
  good: "bg-primary/15 text-primary",
  moderate: "bg-status-moderate/15 text-status-moderate",
  poor: "bg-status-poor/15 text-status-poor",
};

interface MetricCardProps {
  data: MetricCardType;
}

const MetricCard = ({ data }: MetricCardProps) => {
  const Icon = iconMap[data.icon] || Wind;

  return (
    <div className="glass-card rounded-xl p-5 transition-transform hover:scale-[1.02]">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={`rounded-lg p-2.5 ${iconBgColors[data.status]}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {data.label}
            </p>
            <p className="text-xs text-muted-foreground">Real-time monitoring</p>
          </div>
        </div>
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusColors[data.status]}`}
        >
          {data.statusLabel}
        </span>
      </div>
      <div className="mt-5">
        <span className="font-display text-4xl font-bold text-foreground">
          {data.value}
        </span>
        <span className="ml-2 text-lg text-muted-foreground">{data.unit}</span>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{data.description}</p>
    </div>
  );
};

export default MetricCard;
