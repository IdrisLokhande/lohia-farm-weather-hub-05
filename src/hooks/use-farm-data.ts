import { useState, useEffect, useRef } from "react";
import { ref, onValue } from "firebase/database"; // Removed query and limitToLast
import { rtdb } from "@/lib/firebase";
import type { FarmData } from "@/lib/farmData";
import { WeatherPhysics } from "@/lib/weather-physics";

const formatFullTimestamp = (timestamp: any, lang: string) => {
  if (!timestamp || timestamp === "---" || timestamp === 0) return "---";
  try {
    const numericTimestamp = Number(timestamp);
    const dateValue = new Date(numericTimestamp);
    if (isNaN(dateValue.getTime())) return "---";
    return new Intl.DateTimeFormat(lang === "en" ? "en-US" : lang === "hi" ? "hi-IN" : "mr-IN", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      numberingSystem: lang === "en" ? "latn" : "deva",
    }).format(dateValue);
  } catch (e) {
    return "---";
  }
};

export const useFarmHub = (lang: string = "en") => {
  // historyBuffer stores EVERY valid point found in the database for median calculation
  const historyBuffer = useRef<Record<string, number[]>>({
    temperature: [],
    humidity: [],
    pm1: [],
    pm25: [],
    pm10: [],
    lux: [],
    co2: [],
    pressure: [],
  });

  const [data, setData] = useState<{
    live: any | null;
    system: FarmData["systemStatus"] | null;
  }>({ live: null, system: null });

  const [isFirebaseConnected, setIsFirebaseConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  const getMedian = (arr: number[]) => {
    if (arr.length === 0) return 0;
    const sorted = [...arr].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  };

  useEffect(() => {
    const connectedRef = ref(rtdb, ".info/connected");
    const unsubConnect = onValue(connectedRef, snap => {
      setIsFirebaseConnected(snap.val() === true);
    });

    // We removed the 'query' and 'limitToLast' here to fetch the entire folder
    const weatherRef = ref(rtdb, "weather");

    const unsubData = onValue(
      weatherRef,
      snapshot => {
        try {
          if (!snapshot.exists()) {
            setLoading(false);
            return;
          }

          const rawPayload = snapshot.val();
          const entries = Object.entries(rawPayload || {});

          // Reset buffers to recalculate the median from the full dataset
          Object.keys(historyBuffer.current).forEach(key => (historyBuffer.current[key] = []));

          let latestRecord: any = null;
          let finalHash = "";
          let lastTimestamp = 0;

          // 1. Process the entire database history
          entries.forEach(([hash, values]: [string, any]) => {
            const v = values as any;
            const fields = [
              "temperature",
              "humidity",
              "pm1",
              "pm25",
              "pm10",
              "lux",
              "co2",
              "pressure",
            ];

            fields.forEach(field => {
              const val = Number(v[field]);
              // Only add to median calculation if the sensor was actually working (val > 0)
              if (val > 0 && !isNaN(val)) {
                historyBuffer.current[field].push(val);
              }
            });

            // Track the latest record by checking timestamps or the loop order
            // Firebase entries are usually ordered by key (push ID), which is chronological
            latestRecord = { ...v };
            finalHash = hash;
            lastTimestamp = v.timestamp;
          });

          if (!latestRecord) {
            setLoading(false);
            return;
          }

          // 2. Clean the LATEST record using the median of the WHOLE history
          const cleanedLive = { ...latestRecord };
          const fields = [
            "temperature",
            "humidity",
            "pm1",
            "pm25",
            "pm10",
            "lux",
            "co2",
            "pressure",
          ];

          fields.forEach(field => {
            const val = Number(cleanedLive[field]);
            let isDirty = val <= 0 || isNaN(val);

            // Add specific outlier checks for unrealistic sensor readings
            if (field === "humidity" && val === 100) {
              isDirty = true;
            }
            if (field === "temperature" && val === 125) {
              isDirty = true;
            }
            if (field === "co2" && val >= 3000) {
              isDirty = true;
            }

            if (isDirty) {
              cleanedLive[field] = Math.round(getMedian(historyBuffer.current[field]) * 100) / 100;
            }
          });

          // 3. AQI calculation
          cleanedLive.aqi = WeatherPhysics.calculateIndiaAQI(cleanedLive.pm25, cleanedLive.pm10);

          setData({
            live: { id: finalHash, ...cleanedLive },
            system: {
              lastUpdate: formatFullTimestamp(lastTimestamp, lang),
              uptime: cleanedLive.uptime || "---",
              sensorsOnline: cleanedLive.sensorsOnline || 0,
              totalSensors: cleanedLive.totalSensors || "-",
            },
          });
          setLoading(false);
        } catch (error) {
          console.error("Error in useFarmHub:", error);
          setLoading(false);
        }
      },
      err => {
        console.error("Firebase Read Error:", err);
        setLoading(false);
      }
    );

    return () => {
      unsubConnect();
      unsubData();
    };
  }, [lang]);

  return {
    liveData: data.live,
    systemStatus: data.system,
    isOffline: !isFirebaseConnected,
    loading: loading,
  };
};
