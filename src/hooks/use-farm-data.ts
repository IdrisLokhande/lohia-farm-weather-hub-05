import { useState, useEffect } from "react";
import { ref, onValue, query, limitToLast } from "firebase/database";
import { rtdb } from "@/lib/firebase"; 
import type { FarmData } from "@/lib/farmData";

/**
 * Formats a Unix timestamp into a localized string: "Mar 23, 06:15 AM"
 */
const formatFullTimestamp = (timestamp: any, lang: string) => {
  // If the timestamp is the default string, null, or 0, return placeholder
  if (!timestamp || timestamp === "---" || timestamp === 0) return "---";
  
  try {
    // Convert to Number to ensure it's not a string-wrapped unix timestamp
    const numericTimestamp = Number(timestamp);
    const dateValue = new Date(numericTimestamp);
    
    // Safety check for Invalid Date
    if (isNaN(dateValue.getTime())) {
      console.error("useFarmHub: Invalid timestamp received", timestamp);
      return "---";
    }

    return new Intl.DateTimeFormat(
      lang === 'en' ? 'en-US' : (lang === 'hi' ? 'hi-IN' : 'mr-IN'), 
      {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        numberingSystem: lang === 'en' ? 'latn' : 'deva'
      }
    ).format(dateValue);
  } catch (e) {
    console.error("useFarmHub: Formatting error", e);
    return "---";
  }
};

export const useFarmHub = (lang: string = 'en') => {
  const [data, setData] = useState<{
    live: any | null;
    system: FarmData["systemStatus"] | null;
  }>({ live: null, system: null });

  const [isFirebaseConnected, setIsFirebaseConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const connectedRef = ref(rtdb, ".info/connected");
    const unsubConnect = onValue(connectedRef, (snap) => {
      setIsFirebaseConnected(snap.val() === true);
    });

    const weatherRef = query(ref(rtdb, 'weather'), limitToLast(1));

    const unsubData = onValue(weatherRef, (snapshot) => {
      if (snapshot.exists()) {
        const rawPayload = snapshot.val();
        const [hash, values] = Object.entries(rawPayload)[0] as [string, any];

        // Format the clock string immediately upon data arrival
        const clockTime = formatFullTimestamp(values.timestamp, lang);

        setData({
          live: { id: hash, ...values },
          system: {
            lastUpdate: clockTime, 
            uptime: values.uptime || "---",
            sensorsOnline: values.sensorsOnline || 0,
            totalSensors: values.totalSensors || "-"
          }
        });
      }
      setLoading(false);
    }, (err) => {
      setLoading(false);
    });

    return () => {
      unsubConnect();
      unsubData();
    };
  }, [lang]); 

  return {
    liveData: data.live,
    systemStatus: data.system,
    isOffline: !isFirebaseConnected,
    loading: loading && !data.live
  };
};
