import { useState, useEffect } from "react";
import { ref, onValue, query, limitToLast } from "firebase/database";
import { db } from "@/lib/firebase"; 
import type { FarmData } from "@/lib/farmData";

/**
 * Formats a Unix timestamp into a localized clock string: "06:15 AM" or "०६:१५"
 */
const formatClockTime = (timestamp: number, lang: string) => {
  if (!timestamp) return "---";
  return new Intl.DateTimeFormat(
    lang === 'en' ? 'en-US' : (lang === 'hi' ? 'hi-IN' : 'mr-IN'), 
    {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      numberingSystem: lang === 'en' ? 'latn' : 'deva'
    }
  ).format(new Date(timestamp));
};

export const useFarmHub = (lang: string = 'en') => {
  const [data, setData] = useState<{
    live: any | null;
    system: FarmData["systemStatus"] | null;
  }>({ live: null, system: null });

  const [isFirebaseConnected, setIsFirebaseConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Monitor the Socket
    const connectedRef = ref(db, ".info/connected");
    const unsubConnect = onValue(connectedRef, (snap) => {
      setIsFirebaseConnected(snap.val() === true);
    });

    // 2. Subscribe to your data node
    const weatherRef = query(ref(db, 'weather'), limitToLast(1));

    const unsubData = onValue(weatherRef, (snapshot) => {
      if (snapshot.exists()) {
        const rawPayload = snapshot.val();
        const [hash, values] = Object.entries(rawPayload)[0] as [string, any];

        // LOGIC CHANGE: 
        // We use the timestamp for the 'Last Updated' clock.
        // We use the 'uptime' string directly as it is stored in your DB.
        const clockTime = values.timestamp ? formatClockTime(values.timestamp, lang) : "---";

        setData({
          live: { id: hash, ...values },
          system: {
            lastUpdate: clockTime, 
            uptime: values.uptime || "---",
            sensorsOnline: values.sensorsOnline || 0,
            totalSensors: values.totalSensors || 3
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
