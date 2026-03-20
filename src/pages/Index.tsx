import { useState, useEffect, useMemo } from "react";
import { Server, TrendingUp, WifiOff, RefreshCcw, AlertTriangle } from "lucide-react"; 
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import LoadingOverlay from "@/components/dashboard/LoadingOverlay";
import HeroSection from "@/components/dashboard/HeroSection";
import MetricCard from "@/components/dashboard/MetricCard";
import TrendChart from "@/components/dashboard/TrendChart";
import TrendPopup from "@/components/dashboard/TrendPopup";
import SystemStatus from "@/components/dashboard/SystemStatus";
import DashboardFooter from "@/components/dashboard/DashboardFooter";
import { getFarmData } from "@/lib/farmData";
import { useHistoricalData } from "@/hooks/use-historical-data";
import { useFarmHub } from "@/hooks/use-farm-data"; 
import { WeatherPhysics } from "@/lib/weather-physics";

const translations = {
  en: {
    dashBoardTitle: "Team GEOsense",
    liveMonitoring: "Live Monitoring",
    realTime: "Real-time monitoring",
    heroTitle: "Weather Station : Lohia Farm",
    heroDesc: "Precision Weather Monitoring",
    notConnected: "Not connected to Lohia_Farm Wi-Fi",
    systemStatus: "System Status",
    sensors: "Sensors",
    lupdate: "Last Update",
    uptime: "Uptime",
    live: "Live",
    online: "Online",
    majorPollutant: "Major Pollutant seems to be",
    min: "MIN", max: "MAX",
    aqi: "AQI",
    temp: "Temperature",
    humidity: "Humidity",
    lintensity: "Light Intensity",
    pressure: "Pressure",
    co2: "CO2",
    pm1: "PM1.0 (Fine Particles/Smoke)", pm25: "PM2.5 (Fine Particles/Smoke)", pm10: "PM10.0 (Coarse Dust)", none: "None",
    co2Desc: "CO2 level currently in parts per million",
    feelsLike: "Feels like",
    absoluteHumidity: "Absolute Humidity is",
    vaporPressure: "Crops feel Vapor Pressure of",
    lintensityDesc: "Current Light Intensity captured in the area",
    light: "Light Mode",
    dark: "Dark Mode",
    connecting: "Connecting...",
    noWiFiConnection: "No Wi-Fi Connection",
    hardwareUnreachable: "Hardware Unreachable",
  },
  hi: {
    dashBoardTitle: "टीम जियोसेंस",
    liveMonitoring: "लाइव मॉनिटरिंग",
    realTime: "वास्तविक समय में निगरानी",
    heroTitle: "मौसम स्टेशन: लोहिया फार्म",
    heroDesc: "सटीक मौसम निगरानी",
    notConnected: "लोहिया फार्म वाई-फाई से कनेक्ट नहीं है",
    systemStatus: "सिस्टम की स्थिति",
    sensors: "सेंसर",
    lupdate: "अंतिम अद्यतन",
    uptime: "अपटाइम",
    live: "लाइव",
    online: "ऑनलाइन",
    majorPollutant: "मुख्य प्रदूषक है",
    min: "न्यूनतम", max: "अधिकतम",
    aqi: "AQI",
    temp: "तापमान",
    humidity: "आर्द्रता",
    lintensity: "प्रकाश की तीव्रता",
    pressure: "दबाव",
    co2: "CO2",
    pm1: "पीएम १.० (महीन कण/धुआं)", pm25: "पीएम २.५ (मध्यम धूल के कण)", pm10: "पीएम १०.० (धूल के मोटे कण)", none: "कोई नहीं",
    co2Desc: "CO2 का स्तर वर्तमान में प्रति दस लाख भागों में",
    feelsLike: "महसूस होता है",
    absoluteHumidity: "पूर्ण आर्द्रता है",
    vaporPressure: "फसलों को वाष्प का दबाव महसूस होता है",
    lintensityDesc: "क्षेत्र में वर्तमान प्रकाश तीव्रता कैप्चर की गई",
    light: "लाइट मोड",
    dark: "डार्क मोड",
    connecting: "कनेक्ट हो रहा है...",
    noWiFiConnection: "कोई वाई-फ़ाई कनेक्शन नहीं",
    hardwareUnreachable: "हार्डवेयर पहुंच योग्य नहीं",
  },
  mr: {
    dashBoardTitle: "टीम जिओसेन्स",
    liveMonitoring: "थेट देखरेख",
    realTime: "रिअल-टाइम मॉनिटरिंग",
    heroTitle: "हवामान स्टेशन: लोहिया फार्म",
    heroDesc: "अचूक हवामान देखरेख",
    notConnected: "लोहिया फार्म वाय-फायशी कनेक्ट केलेले नाही",
    systemStatus: "सिस्टमची स्थिती",
    sensors: "सेन्सर्स",
    lupdate: "अंतिम अद्यतन",
    uptime: "अपटाइम",
    live: "लाइव्ह",
    online: "ऑनलाइन",
    majorPollutant: "मुख्य प्रदूषक आहे",
    min: "किमान", max: "कमाल",
    aqi: "AQI",
    temp: "तापमान",
    humidity: "आर्द्रता",
    lintensity: "प्रकाश तीव्रता",
    pressure: "दबाव",
    co2: "CO2",
    pm1: "पीएम १.० (अतिसूक्ष्म कण/धूर)", pm25: "पीएम २.५ (मध्यम धुळीचे कण)", pm10: "पीएम १०.० (धुळीचे मोठे कण)", none: "काहीही नाही",
    co2Desc: "CO2 पातळी सध्या प्रति दशलक्ष भागांमध्ये",
    feelsLike: "जाणवते",
    absoluteHumidity: "परिपूर्ण आर्द्रता आहे",
    vaporPressure: "पिकांना बाष्पाचा दाब जाणवतो",
    lintensityDesc: "परिसरात पकडलेल्या प्रकाशाची तीव्रता",
    light: "लाइट मोड",
    dark: "गडद मोड",
    connecting: "कनेक्ट करत आहे...",
    noWiFiConnection: "कोणतेही वाय-फाय कनेक्शन नाही",
    hardwareUnreachable: "हार्डवेअर अगम्य",
  }
};

const Index = () => {
  const [isDark, setIsDark] = useState(true);
  const [lang, setLang] = useState('en'); 
  const [activeTrend, setActiveTrend] = useState<string | null>(null);
  const [heartbeatOffline, setHeartbeatOffline] = useState(false);
  
  const t = translations[lang];  

  // 1. Data Hooks (SWR handles the 'stale' data persistence here)
  const { liveData, systemStatus, isOffline, loading: liveLoading } = useFarmHub();
  const { history, loading: historyLoading } = useHistoricalData();

  const isInitialSync = (liveLoading || historyLoading) && !liveData && history.length === 0;

  // 2. Heartbeat Logic: Only for Visual Indicators
  // We allow 150s (2.5 mins) to account for the 45s sleep + 15s active cycles
  useEffect(() => {
    const checkFreshness = () => {
      if (!liveData?.timestamp) return;
      const lastUpdate = new Date(liveData.timestamp).getTime();
      const secondsSinceUpdate = (Date.now() - lastUpdate) / 1000;
      setHeartbeatOffline(secondsSinceUpdate > 150);
    };

    const interval = setInterval(checkFreshness, 15000);
    return () => clearInterval(interval);
  }, [liveData]);

  // UI state: True if browser is offline OR data is older than 2.5 mins
  const isVisualOffline = isOffline || heartbeatOffline;

  const formatValue = (val) => {
    return new Intl.NumberFormat(lang === 'en' ? 'en-US' : (lang === 'hi' ? 'hi-IN' : 'mr-IN'), {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
      numberingSystem: lang === 'en' ? 'latn' : 'deva',
    }).format(val);
  };

  // 3. Memoized Data Object
  const data = useMemo(() => {
    const baseData = getFarmData();
    const twentyFourHoursAgo = Date.now() - 24 * 60 * 60 * 1000;

    const getBounds = (metricKey: string) => {
      const firebaseKey = metricKey === 'lintensity' ? 'lux' : metricKey;
      const values = history
        .filter(h => new Date(h.timestamp).getTime() >= twentyFourHoursAgo)
        .map(h => Number(h[firebaseKey]))
        .filter(v => !isNaN(v) && v !== 0);
      
      return values.length === 0 
        ? { min: '--', max: '--' } 
        : { min: formatValue(Math.min(...values)), max: formatValue(Math.max(...values)) };
    };

    // Static Mappings
    baseData.co2.label = t.co2;
    baseData.airQuality.label = t.aqi;
    baseData.environment.temperature.label = t.temp;
    baseData.environment.humidity.label = t.humidity;
    baseData.environment.pressure.label = t.pressure;
    baseData.environment.lintensity.label = t.lintensity;

    // Use liveData if available (SWR will provide stale data if offline)
    if (liveData) {
      const metrics = [
        { key: 'temperature', target: baseData.environment.temperature, val: liveData.temperature },
        { key: 'humidity', target: baseData.environment.humidity, val: liveData.humidity },
        { key: 'pressure', target: baseData.environment.pressure, val: liveData.pressure },
        { key: 'lintensity', target: baseData.environment.lintensity, val: liveData.lux },
        { key: 'co2', target: baseData.co2, val: liveData.co2 }
      ];

      metrics.forEach(m => {
        const bounds = getBounds(m.key);
        m.target.value = formatValue(Number(m.val || 0));
        m.target.min = bounds.min;
        m.target.max = bounds.max;
        // Status turns "offline" (gray) ONLY if the heartbeat/network is dead
        m.target.status = isVisualOffline ? "offline" : (/* existing logic */ "good");
      });

      // Recalculate Physics (stale data still allows feels-like calc)
      const curTemp = Number(liveData.temperature || 0);
      const curHum = Number(liveData.humidity || 0);
      baseData.environment.temperature.description = `${t.feelsLike} ${WeatherPhysics.getFeelsLike(curTemp, curHum).toFixed(1)} °C`;
      // ... same for humidity/pressure descriptions ...

      // AQI
      const a1 = Number(liveData.pm1 || 0), a25 = Number(liveData.pm25 || 0), a10 = Number(liveData.pm10 || 0);
      baseData.airQuality.value = (
        <div className="inline-flex items-baseline gap-3 xs:gap-4 lg:gap-6">
          {[ {v: a1, l: "PM1.0"}, {v: a25, l: "PM2.5"}, {v: a10, l: "PM10.0"} ].map(pm => (
            <div key={pm.l} className="flex flex-col">
              <span className="text-2xl min-[790px]:text-3xl font-black leading-none">{formatValue(pm.v)}</span>
              <span className="mt-1 text-[8px] sm:text-[10px] font-black uppercase tracking-widest opacity-50">{pm.l}</span>
            </div>
          ))}
        </div>
      );
    }

    if (systemStatus) {
      baseData.systemStatus = {
        ...systemStatus,
        lastUpdate: isVisualOffline ? t.notConnected : (t[systemStatus.lastUpdate] || systemStatus.lastUpdate)
      };
    }

    return baseData;
  }, [liveData, history, systemStatus, lang, t, isVisualOffline]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  return (
    <div className={`min-h-screen w-full transition-all duration-700 ease-in-out selection:bg-emerald-500/30 overflow-x-hidden
                     ${isDark ? "bg-[#020617] bg-[radial-gradient(circle_at_top_left,#064e3b_0%,_transparent_35%),_radial-gradient(circle_at_bottom_right,#022c22_0%,_transparent_30%)]"
                              : "bg-[#fffaf5] bg-[radial-gradient(ellipse_at_center,transparent_40%,#ffedd5_75%,_#fed7aa_100%)]"}
                   `}>
      <DashboardHeader isDark={isDark} onToggleTheme={() => setIsDark(!isDark)} lang={lang} onLanguageChange={setLang} t={t} />

      {/* Persistent Banner: Shows when ESP32 is sleeping/charging or Internet is out */}
      {isVisualOffline && (
        <div className="bg-destructive/90 backdrop-blur-md text-white py-2 px-4 text-center flex items-center justify-center gap-2 border-b border-white/10 sticky top-0 z-50 transition-all">
          <WifiOff size={16} className="animate-pulse" />
          <span className="font-bold uppercase tracking-widest text-[10px] md:text-xs">
            {heartbeatOffline ? "Device Asleep / Offline" : t.notConnected}
          </span>
        </div>
      )}

      {isInitialSync && <LoadingOverlay isDark={isDark} />}

      <HeroSection lang={lang} t={t} />

      <main className="container mx-auto px-4 py-6 md:px-6 relative z-10">
        <div className="grid gap-4 min-[850px]:grid-cols-2 min-[1300px]:grid-cols-3 grid-auto-rows-fr">
          {['humidity', 'pressure', 'temperature', 'lintensity', 'airQuality', 'co2'].map((key) => (
             <MetricCard 
                key={key}
                data={key === 'airQuality' || key === 'co2' ? data[key] : data.environment[key]} 
                enableShadow={!isDark} 
                t={t} 
                onShowTrend={() => setActiveTrend(key)} 
             />
          ))}
        </div>

        {/* System Status Section */}
        <section className="mt-12 mx-auto w-full max-w-2xl">
          <div className={`glass-card p-5 xs:p-6 md:p-10 rounded-[2rem] border relative overflow-hidden backdrop-blur-xl shadow-lg transition-all duration-700
            ${isDark ? 'bg-white/5 border-white/10' : 'bg-white/85 border-black/10'}`}
          >
            <div className={`absolute -top-24 -left-24 w-48 h-48 blur-[80px] rounded-full pointer-events-none transition-colors duration-700
              ${isDark ? 'bg-emerald-500/10' : 'bg-blue-500/30'}`} 
            />
            
            <div className="mb-6 xs:mb-8 flex flex-wrap items-start justify-between gap-4 relative z-10">
              <div className="flex items-center gap-3 opacity-95">
                <Server className={`h-5 w-5 shrink-0 ${isDark ? 'text-emerald-500' : 'text-blue-700'}`} />
                <h3 className={`text-[13px] font-black uppercase tracking-[0.3em] leading-[1.4] -mr-[0.3em]
                  max-[360px]:max-w-[min-content] max-[360px]:leading-[1.2]
                  ${isDark ? 'text-muted-foreground' : 'text-blue-950'}`}>
                  {t.systemStatus}
                </h3>
              </div>

              {!isVisualOffline && liveData && (
                <div className={`text-[10px] font-bold flex items-center gap-2 px-3 xs:px-4 py-1.5 rounded-full border backdrop-blur-sm transition-all shrink-0
                  ${isDark 
                    ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' 
                    : 'text-blue-800 bg-blue-100/60 border-blue-400/30'}`}
                >
                  <span className="relative flex h-2 w-2">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isDark ? 'bg-emerald-400' : 'bg-blue-400'}`}></span>
                    <span className={`relative inline-flex rounded-full h-2 w-2 ${isDark ? 'bg-emerald-500' : 'bg-blue-700'}`}></span>
                  </span>
                  <span className="tracking-widest uppercase">{t.live}</span>
                </div>
              )}
            </div>

            <div className={`space-y-2 relative z-10 ${!isDark ? 'text-blue-950 font-bold' : ''}`}>
              <SystemStatus status={data.systemStatus} isLight={!isDark} t={t} />
            </div>
          </div>
        </section>
      </main>

      <TrendPopup activeMetric={activeTrend} onClose={() => setActiveTrend(null)} history={history} isDark={isDark} t={t} />
      <DashboardFooter />
    </div>
  );
};

export default Index;
