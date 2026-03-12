import useSWR from 'swr';

const fetcher = async (url: string) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) throw new Error("Offline");
    return await response.json();
  } catch (err) {
    throw err; // This triggers the error state in SWR
  } finally {
    clearTimeout(timeoutId);
  }
};

const isDev = true;
const point = isDev ? "http://localhost:8080/api/weather" : "http://192.168.4.1/api/weather";

export const useFarmData = () => {
  const { data, error, isLoading } = useSWR(point, fetcher, {
    refreshInterval: 10000,
    shouldRetryOnError: true,
    errorRetryInterval: 2000,
  });

  return {
    liveData: data, 
    error: !!error, // Renamed back to 'error' for Index.tsx consistency
    loading: isLoading
  };
};
