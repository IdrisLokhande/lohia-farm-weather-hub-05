import { useState, useEffect } from "react";
import { TrendingUp } from "lucide-react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import HeroSection from "@/components/dashboard/HeroSection";
import MetricCard from "@/components/dashboard/MetricCard";
import TrendChart from "@/components/dashboard/TrendChart";
import SystemStatus from "@/components/dashboard/SystemStatus";
import DashboardFooter from "@/components/dashboard/DashboardFooter";
import { getFarmData } from "@/lib/farmData";

const Index = () => {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  // TODO: Replace with API fetch call
  // useEffect(() => { fetchFarmData().then(setData); }, []);
  const data = getFarmData();

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader isDark={isDark} onToggleTheme={() => setIsDark(!isDark)} />
      <HeroSection />

      <main className="container mx-auto px-4 py-8 md:px-6">
        {/* Metric Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <MetricCard data={data.airQuality} />
          <MetricCard data={data.environment.temperature} />
          <MetricCard data={data.co2} />
        </div>

        {/* Environment sub-cards */}
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <MetricCard data={data.environment.humidity} />
          <MetricCard data={data.environment.pressure} />
        </div>

        {/* 24-Hour Analytics */}
        <div className="mt-10">
          <div className="mb-5 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h2 className="font-display text-xl font-bold text-foreground">
              24-Hour Analytics
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <TrendChart
              title="Air Quality Index Trend"
              data={data.trends.aqi}
              color="hsl(var(--chart-1))"
              unit=" AQI"
            />
            <TrendChart
              title="Temperature Trend"
              data={data.trends.temperature}
              color="hsl(var(--chart-2))"
              unit="°C"
            />
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <TrendChart
              title="CO₂ Concentration Trend"
              data={data.trends.co2}
              color="hsl(var(--chart-3))"
              unit=" ppm"
            />
            <SystemStatus status={data.systemStatus} />
          </div>
        </div>
      </main>

      <DashboardFooter contact={data.contact} />
    </div>
  );
};

export default Index;
