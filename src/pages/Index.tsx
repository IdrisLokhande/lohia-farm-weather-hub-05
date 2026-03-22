import { useState, useEffect, useMemo, useTransition } from "react";
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
    dashBoardTitle: "GeoSense",
    liveMonitoring: "Live Monitoring",
    realTime: "Real-time monitoring",
    heroTitle: "Weather Station : Lohia Farm",
    heroDesc: "Precision Weather Monitoring",
    notConnected: "Not Connected through WeatherStation",
    systemStatus: "System Status",
    sensors: "Sensors",
    lupdate: "Last Update",
    uptime: "Uptime",
    live: "Live",
    online: "Online",
    asleep: "Device Asleep / Offline",
    majorPollutant: "Major Pollutant seems to be",
    min: "MIN",
    max: "MAX",
    aqi: "AQI",
    temp: "Temperature",
    humidity: "Humidity",
    lintensity: "Light Intensity",
    pressure: "Pressure",
    co2: "CO2",
    pm1: "PM1.0 (Fine Particles/Smoke)",
    pm25: "PM2.5 (Fine Particles/Smoke)",
    pm10: "PM10.0 (Coarse Dust)",
    none: "None",
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
    "1h": "1 Hour",
    "24h": "24 Hours",
    "7d": "7 Days",
    "30d": "1 Month",
    export: "Export",
    exporting: "Exporting...",
    todayData: "Today's Data",
    allData: "All Data",
    customRange: "Custom Range",
    selectDateRange: "Select Date Range",
    startDate: "Start Date",
    endDate: "End Date",
    downloadCsv: "Download CSV",
    noData: "No data found for the selected range.",
    errorFetching: "An error occurred while fetching the data.",
    selectDates: "Please select both start and end dates.",
  },
  hi: {
    dashBoardTitle: "जियोसेंस",
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
    asleep: "डिवाइस स्लीप/ऑफ़लाइन",
    majorPollutant: "मुख्य प्रदूषक है",
    min: "न्यूनतम",
    max: "अधिकतम",
    aqi: "एक्यूआई",
    temp: "तापमान",
    humidity: "आर्द्रता",
    lintensity: "प्रकाश की तीव्रता",
    pressure: "दबाव",
    co2: "सीओ२",
    pm1: "पीएम १.० (महीन कण/धुआं)",
    pm25: "पीएम २.५ (मध्यम धूल के कण)",
    pm10: "पीएम १०.० (धूल के मोटे कण)",
    none: "कोई नहीं",
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
    "1h": "१ घंटा",
    "24h": "२४ घंटे",
    "7d": "७ दिन",
    "30d": "१ महीना",
    export: "निर्यात करें",
    exporting: "निर्यात हो रहा है...",
    todayData: "आज का डेटा",
    allData: "सारा डेटा",
    customRange: "कस्टम रेंज",
    selectDateRange: "दिनांक सीमा चुनें",
    startDate: "प्रारंभ दिनांक",
    endDate: "अंतिम दिनांक",
    downloadCsv: "सीएसवी डाउनलोड करें",
    noData: "चयनित सीमा के लिए कोई डेटा नहीं मिला।",
    errorFetching: "डेटा प्राप्त करते समय एक त्रुटि हुई।",
    selectDates: "कृपया प्रारंभ और अंतिम दोनों तिथियां चुनें।",
  },
  mr: {
    dashBoardTitle: "जिओसेन्स",
    liveMonitoring: "थेट देखरेख",
    realTime: "रिअल-टाइम मॉनिटरिंग",
    heroTitle: "हवामान स्टेशन: लोहिया फार्म",
    heroDesc: "अचूक हवामान देखरेख",
    notConnected: "लोहिया फार्म वाय-फायशी कनेक्ट केलेले नाही",
    systemStatus: "सिस्टमची स्थिती",
    sensors: "सेन्सर्स",
    lupdate: "शेवटचे अद्यतन",
    uptime: "अपटाइम",
    live: "लाइव्ह",
    online: "ऑनलाइन",
    asleep: "डिव्हाइस झोपलेले / ऑफलाइन",
    majorPollutant: "मुख्य प्रदूषक आहे",
    min: "किमान",
    max: "कमाल",
    aqi: "एक्यूआय",
    temp: "तापमान",
    humidity: "आर्द्रता",
    lintensity: "प्रकाश तीव्रता",
    pressure: "दबाव",
    co2: "सीओ२",
    pm1: "पीएम १.० (अतिसूक्ष्म कण/धूर)",
    pm25: "पीएम २.५ (मध्यम धुळीचे कण)",
    pm10: "पीएम १०.० (धुळीचे मोठे कण)",
    none: "काहीही नाही",
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
    "1h": "१ तास",
    "24h": "२४ तास",
    "7d": "१ आठवडा",
    "30d": "१ महिना",
    export: "निर्यात करा",
    exporting: "निर्यात होत आहे...",
    todayData: "आजचा डेटा",
    allData: "सर्व डेटा",
    customRange: "सानुकूल श्रेणी",
    selectDateRange: "तारीख श्रेणी निवडा",
    startDate: "सुरुवात तारीख",
    endDate: "शेवटची तारीख",
    downloadCsv: "सी.एस.व्ही. डाउनलोड करा",
    noData: "निवडलेल्या श्रेणीसाठी कोणताही डेटा आढळला नाही.",
    errorFetching: "डेटा मिळवताना एक त्रुटी आली.",
    selectDates: "कृपया प्रारंभ आणि शेवटची तारीख दोन्ही निवडा.",
  },
};

const Index = () => {
  const [isDark, setIsDark] = useState(true);
  const [lang, setLang] = useState("en");
  const [activeTrend, setActiveTrend] = useState<{ key: string; unit: string } | null>(null);
  const [heartbeatOffline, setHeartbeatOffline] = useState(false);
  const [isPending, startTransition] = useTransition();

  const t = translations[lang];

  // 1. Data Hooks (SWR handles the 'stale' data persistence here)
  const { liveData, systemStatus, isOffline, loading: liveLoading } = useFarmHub(lang);
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

  const formatValue = (val, isInt = false) => {
    return new Intl.NumberFormat(lang === "en" ? "en-US" : lang === "hi" ? "hi-IN" : "mr-IN", {
      minimumFractionDigits: isInt ? 0 : 1,
      maximumFractionDigits: isInt ? 0 : 1,
      numberingSystem: lang === "en" ? "latn" : "deva",
    }).format(val);
  };

  // 3. Memoized Data Object
  const data = useMemo(() => {
    const baseData = getFarmData();
    const twentyFourHoursAgo = Date.now() - 24 * 60 * 60 * 1000;

    const getBounds = (metricKey: string) => {
      const firebaseKey = metricKey === "lintensity" ? "lux" : metricKey;
      const values = history
        .filter(h => new Date(h.timestamp).getTime() >= twentyFourHoursAgo)
        .map(h => Number(h[firebaseKey]))
        .filter(v => !isNaN(v) && v !== 0);

      return values.length === 0
        ? { min: "--", max: "--" }
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
        { key: "temperature", target: baseData.environment.temperature, val: liveData.temperature },
        { key: "humidity", target: baseData.environment.humidity, val: liveData.humidity },
        { key: "pressure", target: baseData.environment.pressure, val: liveData.pressure },
        { key: "lintensity", target: baseData.environment.lintensity, val: liveData.lux },
        { key: "co2", target: baseData.co2, val: liveData.co2 },
      ];

      metrics.forEach(m => {
        const bounds = getBounds(m.key);
        m.target.value = formatValue(Number(m.val || 0));
        m.target.min = bounds.min;
        m.target.max = bounds.max;
      });

      // Recalculate Physics (stale data still allows feels-like calc)
      const curTemp = Number(liveData.temperature || 0);
      const curHum = Number(liveData.humidity || 0);
      const curPre = Number(liveData.pressure || 0);
      const curLux = Number(liveData.lux || 0);
      const a1 = Number(liveData.pm1 || 0),
        a25 = Number(liveData.pm25 || 0),
        a10 = Number(liveData.pm10 || 0);
      const max = Math.max(a1, a25, a10);
      const majorPollutant = max == a1 ? t.pm1 : max == a25 ? t.pm25 : max == a10 ? t.pm10 : t.none;
      const finalAQI = WeatherPhysics.calculateIndiaAQI(a25, a10);
      const curCO2 = Number(liveData.co2 || 0); 
      const feelsLikeTemp = WeatherPhysics.getFeelsLike(curTemp, curHum);
      const vaporPressure = WeatherPhysics.getVaporPressure(curTemp, curHum);
      const absoluteHumidity = WeatherPhysics.getAbsoluteHumidity(curTemp, curHum);

      if (!isNaN(feelsLikeTemp)) {
        baseData.environment.temperature.description = `${t.feelsLike} ${feelsLikeTemp.toFixed(1)} °C`;
      }
      if (!isNaN(vaporPressure)) {
        baseData.environment.pressure.description = `${t.vaporPressure} ${vaporPressure.toFixed(1)} hPa`;
      } 
      if (!isNaN(absoluteHumidity)) {
        baseData.environment.humidity.description = `${t.absoluteHumidity} ${absoluteHumidity.toFixed(1)} g/m³`;
      } 
      baseData.environment.lintensity.description = `${t.lintensityDesc}`;
      baseData.co2.description = `${t.co2Desc}`;
      baseData.airQuality.description = `${t.majorPollutant} ${majorPollutant}`; 

      // AQI
      // We map every point in history to its calculated India AQI value
      const aqiHistory = history.map(point =>
        WeatherPhysics.calculateIndiaAQI(Number(point.pm25 || 0), Number(point.pm10 || 0))
      );

      // Calculate Min/Max from the new AQI array
      const minAQI = Math.min(...aqiHistory, finalAQI);
      const maxAQI = Math.max(...aqiHistory, finalAQI);

      /*
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
      */

      baseData.airQuality = {
        ...baseData.airQuality,
        value: formatValue(finalAQI, true),
        unit: "AQI",
        min: formatValue(minAQI, true),
        max: formatValue(maxAQI, true),
        // 2. THIS IS THE KEY: The component looks for this specific property
        pmBreakdown: [
          { l: "PM1.0", v: formatValue(a1) },
          { l: "PM2.5", v: formatValue(a25) },
          { l: "PM10.0", v: formatValue(a10) },
        ],
      };
    }

    if (systemStatus) {
      // Explicitly assigning properties for robustness instead of spreading.
      baseData.systemStatus = {
        uptime: systemStatus.uptime,
        sensorsOnline: systemStatus.sensorsOnline,
        totalSensors: systemStatus.totalSensors,
        lastUpdate: isVisualOffline ? t.notConnected : systemStatus.lastUpdate,
      };
    }

    return baseData;
  }, [liveData, history, systemStatus, lang, t, isVisualOffline]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);

    requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      // A 1px scroll is more effective at "waking up" the compositor than 0,0
      window.scrollBy(0, 1);
      window.scrollBy(0, -1);
    });
    });
  }, [isDark]);

  useEffect(() => {
  if (activeTrend) {
    // 1. Lock the scroll natively
    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight = 'var(--scrollbar-gutter, 0px)';
    document.documentElement.classList.add('is-locked');
  } else {
    // 2. Use requestAnimationFrame to ensure the unlock happens smoothly
    // after the modal state is cleared
    requestAnimationFrame(() => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
      document.documentElement.classList.remove('is-locked');

      // 3. THE KICK: Force the browser to re-rasterize off-screen cards
      // without actually moving the scroll position.
      window.scrollBy(0, 0);
    });
  }

  return () => {
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
    document.documentElement.classList.remove('is-locked');
  };
  }, [activeTrend]);

  return (
  /* PARENT: This container dictates the total height of the document */
  <div className="relative min-h-screen w-full overflow-x-hidden selection:bg-emerald-500/30">
    
    {/* 1. ABSOLUTE BACKGROUND LAYER 
        By using absolute instead of fixed, the blur is calculated once against 
        the background and stays 'attached' to it during scroll. */}
    <div 
      className={`absolute inset-0 -z-10 transition-colors duration-700 pointer-events-none ${
        isDark 
          ? "bg-[#020617] bg-[radial-gradient(circle_at_top_left,#064e3b_0%,_transparent_35%),_radial-gradient(circle_at_bottom_right,#022c22_0%,_transparent_30%)]" 
          : "bg-[#fffaf5] bg-[radial-gradient(ellipse_at_center,transparent_40%,#ffedd5_75%,_#fed7aa_100%)]"
      }`}
      style={{ height: '100%' }} // Ensures the gradient follows the content to the bottom
    />

    {/* 2. HEADER & NAVIGATION */}
    <DashboardHeader
      isDark={isDark}
      onToggleTheme={() => {
        startTransition(() => {
          setIsDark(!isDark);
        });
      }}
      lang={lang}
      onLanguageChange={setLang}
      t={t}
    />

    {/* 3. STICKY ALERT BANNER */}
    {isVisualOffline && heartbeatOffline && (
      <div className="bg-destructive/90 backdrop-blur-md text-white py-2 px-4 text-center flex items-center justify-center gap-2 border-b border-white/10 sticky top-0 z-50 transition-all">
        <WifiOff size={16} className="animate-pulse" />
        <span className="font-bold uppercase tracking-widest text-[12px] md:text-[14px]">
          {t.asleep}
        </span>
      </div>
    )}

    {/* 4. LOADING & HERO */}
    {isInitialSync && <LoadingOverlay isDark={isDark} />}
    <HeroSection lang={lang} t={t} />

    {/* 5. MAIN CONTENT AREA */}
    <main className="container mx-auto px-4 py-6 md:px-6 relative z-10">
      
      {/* Metric Cards Grid */}
      <div className="grid gap-4 min-[850px]:grid-cols-2 min-[1300px]:grid-cols-3 grid-auto-rows-fr">
        {["humidity", "pressure", "temperature", "lintensity", "airQuality", "co2"].map((key) => (
          <div key={key} className="card-grid-item">
            <MetricCard
              data={key === "airQuality" || key === "co2" ? data[key] : data.environment[key]}
              enableShadow={!isDark}
              t={t}
              onShowTrend={() => {
                const metricData = key === "airQuality" || key === "co2" ? data[key] : data.environment[key];
                setActiveTrend({ key, unit: metricData.unit || "" });
              }}
            />
          </div>
        ))}
      </div>

      {/* System Status Section */}
      <section className="mt-12 mx-auto w-full max-w-2xl">
        <div
          className={`glass-card p-5 xs:p-6 md:p-10 rounded-[2rem] border relative overflow-hidden backdrop-blur-xl shadow-lg transition-all duration-700
          ${isDark ? "bg-white/5 border-white/10" : "bg-white/85 border-black/10"}`}
        >
          {/* Status Glow */}
          <div
            className={`absolute -top-20 -left-20 w-40 h-40 blur-[60px] rounded-full pointer-events-none transition-colors duration-700
            ${isDark ? "bg-emerald-500/10" : "bg-blue-500/20"}`}
          />

          <div className="mb-6 xs:mb-8 flex flex-wrap items-start justify-between gap-4 relative z-10">
            <div className="flex items-center gap-3 opacity-95">
              <Server
                className={`h-5 w-5 shrink-0 ${isDark ? "text-emerald-500" : "text-blue-700"}`}
              />
              <h3 className={`text-[13px] font-black uppercase tracking-[0.3em] leading-[1.4] -mr-[0.3em] ${isDark ? "text-muted-foreground" : "text-blue-950"}`}>
                {t.systemStatus}
              </h3>
            </div>

            {!isVisualOffline && liveData && (
              <div className={`text-[10px] font-bold flex items-center gap-2 px-3 xs:px-4 py-1.5 rounded-full border backdrop-blur-sm transition-all shrink-0
                ${isDark ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" : "text-blue-800 bg-blue-100/60 border-blue-400/30"}`}
              >
                <span className="relative flex h-2 w-2">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isDark ? "bg-emerald-400" : "bg-blue-400"}`}></span>
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${isDark ? "bg-emerald-500" : "bg-blue-700"}`}></span>
                </span>
                <span className="tracking-widest uppercase">{t.live}</span>
              </div>
            )}
          </div>

          <div className={`relative z-10 ${!isDark ? "text-blue-950 font-bold" : ""}`}>
            <SystemStatus status={data.systemStatus} isLight={!isDark} t={t} />
          </div>
        </div>
      </section>
    </main>

    {/* 6. OVERLAYS & FOOTER */}
    <DashboardFooter />

    <TrendPopup
      activeMetric={activeTrend?.key ?? null}
      onClose={() => setActiveTrend(null)}
      metricUnit={activeTrend?.unit ?? ""}
      history={history}
      isDark={isDark}
      t={t}
      loading={historyLoading}
    />
  </div>
  );

};

export default Index;
