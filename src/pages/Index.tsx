import { useState, useEffect, useMemo } from "react";
import { Server, TrendingUp, WifiOff, RefreshCcw, AlertTriangle } from "lucide-react"; 
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import HeroSection from "@/components/dashboard/HeroSection";
import MetricCard from "@/components/dashboard/MetricCard";
import TrendChart from "@/components/dashboard/TrendChart";
import SystemStatus from "@/components/dashboard/SystemStatus";
import DashboardFooter from "@/components/dashboard/DashboardFooter";
import { getFarmData } from "@/lib/farmData";
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
  const [lang, setLang] = useState('en'); // 'en', 'hi', or 'mr'
  const t = translations[lang];  

  const formatValue = (val) => {
    return new Intl.NumberFormat(lang === 'en' ? 'en-US' : (lang === 'hi' ? 'hi-IN' : 'mr-IN'), {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
      numberingSystem: lang === 'en' ? 'latn' : 'deva',
    }).format(val);
  };

  // 1. Call the unified hook (Replacing useFarmData and useHealthCheck)
  const { liveData, systemStatus, isOffline, loading } = useFarmHub();

  // 2. Memoize the combined data object
  const data = useMemo(() => {
    const baseData = getFarmData();
    
    // 1. Translation mappings
    baseData.co2.label = t.co2;
    baseData.airQuality.label = t.aqi;
    baseData.environment.temperature.label = t.temp;
    baseData.environment.humidity.label = t.humidity;
    baseData.environment.pressure.label = t.pressure;
    baseData.environment.lintensity.label = t.lintensity;

    // 2. Map System Status from the unified hook
    if (systemStatus) {
      baseData.systemStatus = {
        ...systemStatus,
        lastUpdate: t[systemStatus.lastUpdate] || systemStatus.lastUpdate
      };
    }

    // 3. Map Environmental Data from the liveData feed
    if (liveData && !isOffline) {
      // CO2 Mapping
      const currentCO2 = Number(liveData.co2 || 0);
      baseData.co2.value = formatValue(currentCO2);
      baseData.co2.description = t.co2Desc;
      baseData.co2.status = currentCO2 <= 800 ? "good" : (currentCO2 <= 1200 ? "moderate" : "poor");

      // RESPONSIVE TRIPLE AQI VALUES
      const a1 = Number(liveData.pm1 || 0);
      const a25 = Number(liveData.pm25 || 0);
      const a10 = Number(liveData.pm10 || 0);
      const maxVal = Math.max(a1, a25, a10);
      let major = maxVal === a1 ? t.pm1 : (maxVal === a25 ? t.pm25 : t.pm10);

      baseData.airQuality.value = (
        /* We use inline-flex here so the block only takes as much space as needed.
           This allows the MetricCard's internal unit <span> to sit right next to it.
        */
        <div className="inline-flex items-baseline gap-3 xs:gap-4 lg:gap-6">
          {/* PM 1.0 */}
          <div className="flex flex-col">
            <span className="text-lg xs:text-xl sm:text-2xl min-[790px]:text-3xl xl:text-4xl font-black leading-none whitespace-nowrap">
              {formatValue(a1)}
            </span>
            <span className="mt-1 text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-emerald-900/50 dark:text-slate-500">
              PM1.0
            </span>
          </div>

          {/* PM 2.5 */}
          <div className="flex flex-col">
            <span className="text-lg xs:text-xl sm:text-2xl min-[790px]:text-3xl xl:text-4xl font-black leading-none whitespace-nowrap">
              {formatValue(a25)}
            </span>
            <span className="mt-1 text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-emerald-900/50 dark:text-slate-500">
              PM2.5
            </span>
          </div>

          {/* PM 10.0 */}
          <div className="flex flex-col">
            <span className="text-lg xs:text-xl sm:text-2xl min-[790px]:text-3xl xl:text-4xl font-black leading-none whitespace-nowrap">
              {formatValue(a10)}
            </span>
            <span className="mt-1 text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-emerald-900/50 dark:text-slate-500">
              PM10.0
            </span>
          </div>
        </div>
      );
      baseData.airQuality.description = `${t.majorPollutant} ${major}`;

      // Environmental Sensors with Physics and Thresholds
      const curTemp = Number(liveData.temperature || 0);
      const curHum = Number(liveData.humidity || 0);
      const curPress = Number(liveData.pressure || 0);
      const curLux = Number(liveData.lux || 0);

      baseData.environment.temperature.value = formatValue(curTemp);
      baseData.environment.temperature.status = (curTemp > 18 && curTemp < 30) ? "good" : "moderate";
      baseData.environment.temperature.description = `${t.feelsLike} ${WeatherPhysics.getFeelsLike(curTemp, curHum).toFixed(1)} °C`;

      baseData.environment.humidity.value = formatValue(curHum);
      baseData.environment.humidity.status = (curHum > 40 && curHum < 70) ? "good" : "moderate";
      baseData.environment.humidity.description = `${t.absoluteHumidity} ${WeatherPhysics.getAbsoluteHumidity(curTemp, curHum).toFixed(1)} g/m³`;

      baseData.environment.pressure.value = formatValue(curPress);
      baseData.environment.pressure.description = `${t.vaporPressure} ${WeatherPhysics.getVaporPressure(curTemp, curHum).toFixed(1)} hPa`;

      baseData.environment.lintensity.value = formatValue(curLux);
      baseData.environment.lintensity.status = curLux > 500 ? "good" : (curLux > 100 ? "moderate" : "poor");
      baseData.environment.lintensity.description = t.lintensityDesc;

    } else {
      const sensors = [
        baseData.environment.temperature,
        baseData.environment.humidity,
        baseData.environment.pressure,
        baseData.environment.lintensity,
        baseData.co2,
        baseData.airQuality
      ];
      sensors.forEach(s => s.status = "offline");
    }
    return baseData;
  }, [liveData, systemStatus, lang, t]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  return (
    <div 
      className={`min-h-screen w-full transition-all duration-700 ease-in-out selection:bg-emerald-500/30 overflow-x-hidden
        ${isDark 
          ? "bg-[#020617] bg-[radial-gradient(circle_at_top_left,_#064e3b_0%,_transparent_35%),_radial-gradient(circle_at_bottom_right,_#022c22_0%,_transparent_30%)]" 
          : "bg-[#fffaf5] bg-[radial-gradient(ellipse_at_center,_transparent_40%,_#ffedd5_75%,_#fed7aa_100%)]"
        }`}
    >
      <DashboardHeader 
        isDark={isDark}
        onToggleTheme={() => setIsDark(!isDark)}
        lang={lang}
        onLanguageChange={setLang}
        t={t} 
      />

      {/* Connection Alert triggered by the unified isOffline state */}
      {isOffline && (
        <div className="bg-destructive/90 backdrop-blur-md text-white py-2 px-4 text-center flex items-center justify-center gap-2 border-b border-white/10 sticky top-0 z-50 transition-all">
          <WifiOff size={16} className="animate-pulse" />
          <span className="font-bold uppercase tracking-widest text-[10px] md:text-xs">
            {t.notConnected}
          </span>
        </div>
      )}

      <HeroSection lang={lang} t={t} />

      <main className="container mx-auto px-4 py-6 md:px-6 relative z-10">
        <div className="grid gap-4 sm:grid-cols-2 min-[1220px]:grid-cols-3 grid-auto-rows-fr">
          <MetricCard data={data.environment.humidity} enableShadow={!isDark} t={t}/>
          <MetricCard data={data.environment.pressure} enableShadow={!isDark} t={t}/>
          <MetricCard data={data.environment.temperature} enableShadow={!isDark} t={t}/>
          <MetricCard data={data.environment.lintensity} enableShadow={!isDark} t={t}/>
          <MetricCard data={data.airQuality} enableShadow={!isDark} t={t}/>
          <MetricCard data={data.co2} enableShadow={!isDark} t={t}/>
        </div>
      <section className="mt-12 mx-auto w-full max-w-2xl">
  <div className={`glass-card p-5 xs:p-6 md:p-10 rounded-[2rem] border relative overflow-hidden backdrop-blur-xl shadow-lg transition-all duration-700
    ${isDark 
      ? 'bg-white/5 border-white/10' 
      : 'bg-white/85 border-black/10'}`}
  >
    <div className={`absolute -top-24 -left-24 w-48 h-48 blur-[80px] rounded-full pointer-events-none transition-colors duration-700
      ${isDark ? 'bg-emerald-500/10' : 'bg-blue-500/30'}`} 
    />
    
    {/* Header: Added flex-wrap and items-start to handle the height increase from the wrapped text */}
    <div className="mb-6 xs:mb-8 flex flex-wrap items-start justify-between gap-4 relative z-10">
      <div className="flex items-center gap-3 opacity-95">
        <Server className={`h-5 w-5 shrink-0 ${isDark ? 'text-emerald-500' : 'text-blue-700'}`} />
        <h3 className={`text-[13px] font-black uppercase tracking-[0.3em] leading-[1.4] -mr-[0.3em]
          /* Wrap trigger for 360px */
          max-[360px]:max-w-[min-content] max-[360px]:leading-[1.2]
          ${isDark ? 'text-muted-foreground' : 'text-blue-950'}`}>
          {t.systemStatus}
        </h3>
      </div>

      {!isOffline && liveData && (
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

      <DashboardFooter />
    </div>
  );
};

export default Index;
