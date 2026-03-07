import useSWR from 'swr';

const fetcher = async (url: string) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2000);
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

export const useFarmData = () => {
  const { data, error, isLoading } = useSWR("http://192.168.4.1/api/weather", fetcher, {
    refreshInterval: 3000,
    shouldRetryOnError: true,
    errorRetryInterval: 2000,
  });

  return {
    liveData: data, 
    error: !!error, // Renamed back to 'error' for Index.tsx consistency
    loading: isLoading
  };
};
