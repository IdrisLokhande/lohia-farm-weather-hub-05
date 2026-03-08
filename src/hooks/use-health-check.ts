import useSWR from 'swr';
import type { FarmData } from "@/lib/farmData";
import { useState, useEffect } from 'react';

const fetcher = async (url: string) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second limit

  try {
    const response = await fetch(url, { signal: controller.signal });
    return await response.json();
  } catch (err) {
    throw new Error("Timeout"); // This immediately triggers 'error' in SWR
  } finally {
    clearTimeout(timeoutId);
  }
};

const isDev = true;
const point = isDev ? "http://localhost:8080/api/status" : "http://192.168.4.1/api/status";

export const useHealthCheck = () => {
  // 1. Track browser-level online status
  const [isBrowserOnline, setIsBrowserOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleStatusChange = () => setIsBrowserOnline(navigator.onLine);
    window.addEventListener('online', handleStatusChange);
    window.addEventListener('offline', handleStatusChange);
    return () => {
      window.removeEventListener('online', handleStatusChange);
      window.removeEventListener('offline', handleStatusChange);
    };
  }, []);

  const { data, error, isLoading } = useSWR<FarmData["systemStatus"]>(
    isBrowserOnline ? point : null, // Stop fetching if Wi-Fi is off
    fetcher,
    { 
      refreshInterval: 3000,
      shouldRetryOnError: true,
      revalidateOnConnect: true,
      errorRetryCount: 3,       // Give it a few tries before pausing
      onSuccess: () => console.log("Status Synced"),
      onError: (err) => console.log("Status Failed:", err.name)
    }
  );

  // 2. Determine the "True" status message
  let displayUpdate = "Connecting...";
  if (!isBrowserOnline) displayUpdate = "No Wi-Fi Connection";
  else if (error) displayUpdate = "Hardware Unreachable";
  else if (data) displayUpdate = data.lastUpdate;

  return {
    status: data || {
      sensorsOnline: 0,
      totalSensors: 3,
      lastUpdate: displayUpdate,
      uptime: "---"
    },
    isOffline: !isBrowserOnline || !!error,
    isLoading: isLoading && isBrowserOnline
  };
};
