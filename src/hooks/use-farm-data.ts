import { useState, useEffect } from "react";

export interface LiveFarmData {
  temp: number;
  humidity: number;
  signal: string;
}

export const useFarmData = () => {
  const [liveData, setLiveData] = useState<LiveFarmData | null>(null);
  const [error, setError] = useState(false);

  const fetchData = async () => {
    // 1. Set a short timeout so it doesn't "hang"
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000); 

    try {
      const response = await fetch("http://192.168.4.1/api/weather", {
        signal: controller.signal 
      });
      
      if (!response.ok) throw new Error("Hardware Error");
      
      const json = await response.json();
      setLiveData(json);
      setError(false);
    } catch (err) {
      // If we can't reach the ESP32, show the error immediately
      setError(true);
      setLiveData(null); 
    } finally {
      clearTimeout(timeoutId);
    }
  };

  useEffect(() => {
    // Run immediately on load
    fetchData();

    // Check every 3 seconds for a snappier feel
    const interval = setInterval(fetchData, 3000); 
    
    return () => clearInterval(interval);
  }, []);

  return { liveData, error };
};
