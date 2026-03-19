import { useState, useEffect } from "react";
import { rtdb } from "@/lib/firebase"; 
import { ref, onValue, query, limitToLast } from "firebase/database";

export const useHistoricalData = () => {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Fetch the last 300 entries (enough to cover 1 hour at 15s intervals)
    const weatherRef = query(ref(rtdb, "weather"), limitToLast(300));

    const unsubscribe = onValue(weatherRef, (snapshot) => {
      if (!snapshot.exists()) {
        setHistory([]);
        setLoading(false);
        return;
      }

      const rawData: any[] = [];
      snapshot.forEach((child) => {
        const val = child.val();
        rawData.push({
          ...val,
          id: child.key, // Use the unique Firebase push ID as a React key
        });
      });

      // 2. Anchor to the latest point in your DB
      const latestPoint = rawData[rawData.length - 1];
      const anchorTime = latestPoint.timestamp;
      const oneHourInMs = 60 * 60 * 1000;

      // 3. Filter and Format
      let lastStoredTimestamp = 0;
      const filteredData = rawData
        .filter(point => {
          const isWithinHour = (anchorTime - point.timestamp) <= oneHourInMs;
          
          // THROTTLING: Only keep points at least 45 seconds apart 
          // This removes "noise" and prevents duplicate minute keys
          const isNewMinute = Math.abs(point.timestamp - lastStoredTimestamp) >= 45000;
          
          if (isWithinHour && isNewMinute) {
            lastStoredTimestamp = point.timestamp;
            return true;
          }
          return false;
        })
        .map(point => {
          const date = new Date(point.timestamp);
          return {
            ...point,
            // Display label (e.g., 08:01 PM)
            displayTime: date.toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            }),
            // High-res label for the Tooltip (e.g., 08:01:15 PM)
            fullTime: date.toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit',
              second: '2-digit'
            })
          };
        });

      setHistory(filteredData);
      setLoading(false);
    }, (error) => {
      console.error("RTDB Sync Error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { history, loading };
};
