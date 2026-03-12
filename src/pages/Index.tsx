import { useState, useEffect, useMemo } from "react";
import { Server, TrendingUp, WifiOff, RefreshCcw, AlertTriangle } from "lucide-react"; 
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import HeroSection from "@/components/dashboard/HeroSection";
import MetricCard from "@/components/dashboard/MetricCard";
import TrendChart from "@/components/dashboard/TrendChart";
import SystemStatus from "@/components/dashboard/SystemStatus";
import DashboardFooter from "@/components/dashboard/DashboardFooter";
import { getFarmData } from "@/lib/farmData";
import { useFarmData } from "@/hooks/use-farm-data"; 
import { useHealthCheck } from "@/hooks/use-health-check";
import { WeatherPhysics } from "@/lib/weather-physics";

const Index = () => {
  const [isDark, setIsDark] = useState(true);
  
  // 1. Call BOTH hooks at the top level
  const { liveData, error: farmError } = useFarmData(); 
  const { status: liveHealth, isOffline: healthError } = useHealthCheck();

  // 2. Memoize the combined data object
  const data = useMemo(() => {
    const baseData = getFarmData();

    // 3. Map System Status from the liveHealth hook
    baseData.systemStatus = liveHealth;

    // 4. Map Environmental Data from the liveData hook
    if (liveData && !healthError) {
      // 1. Map CO2 with Partial Pressure description
      if (liveData.co2) {
        const currentCO2 = Number(liveData.co2 || 0);
        const currentTotPressure = Number(liveData.pressure || 0);
        baseData.co2.value = currentCO2;
        baseData.co2.description = `Crops feel CO2 Partial Pressure of ${WeatherPhysics.getCO2PartialPressure(currentCO2, currentTotPressure).toFixed(1)} hPa`;

	if (currentCO2 >= 400 && currentCO2 <= 800) {
	  baseData.co2.status = "good";
	}else if (currentCO2 > 800 && currentCO2 <= 1200) {
	  baseData.co2.status = "moderate";
	}else {
	  baseData.co2.status = "poor";
	}
      }

      // 2. Map Triple AQI Values
      if (liveData.aqi2_5 || liveData.aqi5_0 || liveData.aqi10_0) {
        const a25 = Number(liveData.aqi2_5 || 0);
        const a50 = Number(liveData.aqi5_0 || 0);
        const a100 = Number(liveData.aqi10_0 || 0);

        // Calculate Major Pollutant string
        const maxVal = Math.max(a25, a50, a100);
        let major = "None";
        if (maxVal === a25) major = "PM2.5 (Fine Particles/Smoke)";
        else if (maxVal === a50) major = "PM5.0 (Mid-range Dust)";
        else if (maxVal === a100) major = "PM10.0 (Coarse Dust)";

        // Inject the ReactNode into the value field
        baseData.airQuality.value = (
          <div className="flex items-center gap-4 py-0">
            <div className="flex flex-col">
              <span className="text-3xl font-bold leading-none">{a25}</span>
              <span className="mt-0.5 text-[12px] font-medium uppercase tracking-tighter text-muted-foreground">PM2.5</span>
            </div>
            <div className="h-6 w-[1px] bg-border/50" /> 
            <div className="flex flex-col">
              <span className="text-3xl font-bold leading-none">{a50}</span>
              <span className="mt-0.5 text-[12px] font-medium uppercase tracking-tighter text-muted-foreground">PM5.0</span>
            </div>
            <div className="h-6 w-[1px] bg-border/50" />
            <div className="flex flex-col">
              <span className="text-3xl font-bold leading-none">{a100}</span>
              <span className="mt-0.5 text-[12px] font-medium uppercase tracking-tighter text-muted-foreground">PM10.0</span>
            </div>
          </div>
        );

        baseData.airQuality.description = `Major Pollutant seems to be ${major}`;
      }
    
      const currentTemp = Number(liveData.temp || 0);
      const currentHumidity = Number(liveData.humidity || 0);	
      const currentTotPressure = Number(liveData.pressure || 0);

      baseData.environment.temperature.value = currentTemp;
      baseData.environment.humidity.value = currentHumidity;
      baseData.environment.pressure.value = currentTotPressure;
      
      // Update descriptions
      baseData.environment.temperature.description = `Feels like ${WeatherPhysics.getFeelsLike(currentTemp, currentHumidity).toFixed(1)} °C`;
      baseData.environment.humidity.description = `Absolute Humidity is ${WeatherPhysics.getAbsoluteHumidity(currentTemp, currentHumidity).toFixed(1)} g/m³`;
      baseData.environment.pressure.description = `Crops feel Vapor Pressure of ${WeatherPhysics.getVaporPressure(currentTemp, currentHumidity).toFixed(1)} hPa`;

      /*
      // Set statuses to active
      baseData.environment.temperature.status = "good";
      baseData.environment.humidity.status = "good";
      baseData.environment.pressure.status = "good";
      */
    } else {
      // Mark sensors as offline if the weather data feed fails
      const sensors = [
        baseData.environment.temperature,
        baseData.environment.humidity,
        baseData.environment.pressure,
        baseData.co2,
        baseData.airQuality
      ];
      sensors.forEach(s => s.status = "offline");
    }

    return baseData;
  }, [liveData, liveHealth]); // Re-calcs if either hook fetches new data

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  return (
  <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
    {/* 1. Header stays at the absolute top */}
    <DashboardHeader isDark={isDark} onToggleTheme={() => setIsDark(!isDark)} />
    
    {/* 2. Alert now sits neatly below the header */}
    {healthError && (
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

          <div className="glass-card mx-auto w-full max-w-2xl p-4 md:p-6 relative mt-10 rounded-xl overflow-hidden">
	    <div className="mb-4 flex items-center gap-2">
              <Server className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-base md:text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                System Status
              </h3>
            </div>
            {!farmError && liveData && (
              <div className="absolute top-2 right-2 md:top-4 md:right-4 text-[10px] md:text-xs text-emerald-500 font-medium flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                <RefreshCcw size={15} className="animate-spin" /> Live
              </div>
            )}
            <div className="space-y-4">
              <SystemStatus status={data.systemStatus} />
            </div>
          </div>

      </main>

      <DashboardFooter contact={data.contact} />
    </div>
  );
};

export default Index;
