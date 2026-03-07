import { useState, useEffect } from "react";
import { TrendingUp, WifiOff, RefreshCcw, AlertTriangle } from "lucide-react"; 
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import HeroSection from "@/components/dashboard/HeroSection";
import MetricCard from "@/components/dashboard/MetricCard";
import TrendChart from "@/components/dashboard/TrendChart";
import SystemStatus from "@/components/dashboard/SystemStatus";
import DashboardFooter from "@/components/dashboard/DashboardFooter";
import { getFarmData } from "@/lib/farmData";
import { useFarmData } from "@/hooks/use-farm-data"; 

const Index = () => {
  const [isDark, setIsDark] = useState(true);
  const { liveData, error } = useFarmData(); 

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  // 1. Get base labels/icons from your lib
  const data = getFarmData();

  // 2. Update Metric values IF we are online
  if (liveData) {
    data.environment.temperature.value = liveData.temp;
    data.environment.humidity.value = liveData.humidity;
    data.systemStatus.status = "online";
  } else {
    data.systemStatus.status = "offline";
  }

  // 3. Reusable Placeholder for the charts
  const OfflinePlaceholder = ({ title }: { title: string }) => (
    <div className="flex flex-col items-center justify-center h-[300px] border-2 border-dashed rounded-xl bg-muted/20 p-6 text-center">
      <WifiOff className="text-destructive/50 mb-3" size={40} />
      <h4 className="font-bold text-foreground tracking-tight">{title} Unavailable</h4>
      <p className="text-sm text-muted-foreground max-w-[220px] mt-2">
        Connect to <span className="font-bold text-primary italic">Lohia_Farm</span> Wi-Fi for live data.
      </p>
    </div>
  );

  return (
  <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
    {/* 1. Header stays at the absolute top */}
    <DashboardHeader isDark={isDark} onToggleTheme={() => setIsDark(!isDark)} />
    
    {/* 2. Alert now sits neatly below the header */}
    {error && (
      <div className="bg-destructive text-destructive-foreground py-2 px-4 text-center flex items-center justify-center gap-2 border-b border-white/10 shadow-sm animate-in slide-in-from-top-1">
        <WifiOff size={14} className="opacity-90" />
        <span className="font-bold uppercase tracking-widest text-[10px] md:text-xs">
          Not connected to Lohia_Farm Wi-Fi
        </span>
      </div>
    )}

    <HeroSection />

      <main className="container mx-auto px-4 py-8 md:px-6">
        {/* Metric Cards (Top Row) */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <MetricCard data={data.airQuality} />
          <MetricCard data={data.environment.temperature} />
          <MetricCard data={data.co2} />
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <MetricCard data={data.environment.humidity} />
          <MetricCard data={data.environment.pressure} />
        </div>

        <div className="mt-10">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h2 className="font-display text-xl font-bold">24-Hour Analytics</h2>
            </div>
            {!error && liveData && (
              <div className="text-xs text-emerald-500 font-medium flex items-center gap-1.5 bg-emerald-500/10 px-2 py-1 rounded-full">
                <RefreshCcw size={12} className="animate-spin" /> Live
              </div>
            )}
          </div>

          {/* Charts Row */}
          <div className="grid gap-4 md:grid-cols-2">
            {liveData?.trends ? (
              <TrendChart title="Air Quality Index" data={liveData.trends.aqi} color="hsl(var(--chart-1))" unit=" AQI" />
            ) : (
              <OfflinePlaceholder title="AQI Trend" />
            )}

            {liveData?.trends ? (
              <TrendChart title="Temperature" data={liveData.trends.temperature} color="hsl(var(--chart-2))" unit="°C" />
            ) : (
              <OfflinePlaceholder title="Temperature Trend" />
            )}
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {liveData?.trends ? (
              <TrendChart title="CO₂ Concentration" data={liveData.trends.co2} color="hsl(var(--chart-3))" unit=" ppm" />
            ) : (
              <OfflinePlaceholder title="CO₂ Trend" />
            )}
            <SystemStatus status={data.systemStatus} />
          </div>
        </div>
      </main>

      <DashboardFooter contact={data.contact} />
    </div>
  );
};

export default Index;
