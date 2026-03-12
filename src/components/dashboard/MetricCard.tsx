import React from "react";
import { Wind, Thermometer, Droplets, Gauge, Cloud, AlertCircle, HelpCircle, Check } from "lucide-react";
import type { MetricCard as MetricCardType } from "@/lib/farmData";

const iconMap: Record<string, React.ElementType> = {
  wind: Wind,
  thermometer: Thermometer,
  droplets: Droplets,
  gauge: Gauge,
  cloud: Cloud,
};

// Colors for the status badge background and text
const statusColors: Record<string, string> = {
  good: "bg-status-good text-primary-foreground",
  moderate: "bg-status-moderate text-primary-foreground",
  poor: "bg-status-poor text-primary-foreground",
  offline: null
};

// Colors for the icon background (subtle tint)
const iconBgColors: Record<string, string> = {
  good: "bg-primary/15 text-primary",
  moderate: "bg-status-moderate/15 text-status-moderate",
  poor: "bg-status-poor/15 text-status-poor"
};

interface MetricCardProps {
  data: MetricCardType;
}

const MetricCard = ({ data }: MetricCardProps) => {
  const Icon = iconMap[data.icon] || Wind;

  // Logic to determine which symbol to show based on the data status
  const getStatusSymbol = (status: string) => {
    switch (status) {
      case "good":
	return <Check className="h-3 w-3 stroke-[4]" />;
      case "poor":
        return <AlertCircle className="h-3 w-3 stroke-[3]" />;
      case "moderate":
        return <span className="text-xs">~</span>;
      default:
        return null; // Keep 'offline' status clean
    }
  };

  const symbol = getStatusSymbol(data.status);

  return (
    <div className="glass-card relative overflow-hidden rounded-xl p-5 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {/* The Icon Container */}
          <div className={`rounded-lg p-2.5 transition-colors ${iconBgColors[data.status]}`}>
            <Icon className="h-5 w-5" />
          </div>
          
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              {data.label}
            </p>
            <p className="text-[12px] text-muted-foreground/80">Real-time monitoring</p>
          </div>
        </div>

        {/* The Status Badge with Symbols (! or ~) */}
        <span
          className={`
             inline-flex items-center justify-center gap-1.5 
             rounded-full px-2 py-1 
             text-[10px] font-black uppercase tracking-wider 
             shadow-sm transition-all duration-300
             ${statusColors[data.status]} 
             ${data.status === "poor" ? "animate-pulse ring-2 ring-destructive/20" : ""}
          `}
        >
          {symbol && (
            <span className="text-xs font-black brightness-125">
              {symbol}
            </span>
          )}
          <span>{data.statusLabel}</span>
        </span>
      </div>

      {/* Main Value Display */}
      <div className="mt-5 flex items-baseline">
        <span className="font-display text-4xl font-bold tracking-tight text-foreground">
          {data.value}
        </span>
        <span className="ml-2 text-lg font-medium text-muted-foreground">
          {data.unit}
        </span>
      </div>

      {/* Contextual Description */}
      <p className={`mt-2 text-sm leading-relaxed ${
        data.status === 'poor' ? 'text-status-poor font-medium' : 'text-muted-foreground'
      }`}>
        {data.description}
      </p>

      {/* Optional: Subtle background glow for 'Poor' status */}
      {data.status === 'poor' && (
        <div className="absolute -bottom-4 -right-4 h-16 w-16 rounded-full bg-status-poor/10 blur-2xl" />
      )}
    </div>
  );
};

export default MetricCard;
