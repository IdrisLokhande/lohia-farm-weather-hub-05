// ============================================================
// DUMMY DATA FOR LOHIA FARM WEATHER DASHBOARD
// Replace this with API fetch calls when integrating with backend.
//
// Example API integration:
//   const response = await fetch('/api/weather-data');
//   const data = await response.json();
//   return data;
// ============================================================

export interface MetricCard {
  label: string;
  value: number;
  unit: string;
  status: "good" | "moderate" | "poor";
  statusLabel: string;
  icon: string;
  description: string;
}

export interface TrendPoint {
  time: string;
  value: number;
}

export interface FarmData {
  airQuality: MetricCard;
  environment: {
    temperature: MetricCard;
    humidity: MetricCard;
    pressure: MetricCard;
  };
  co2: MetricCard;
  trends: {
    aqi: TrendPoint[];
    temperature: TrendPoint[];
    co2: TrendPoint[];
  };
  systemStatus: {
    sensorsOnline: number;
    totalSensors: number;
    lastUpdate: string;
    uptime: string;
  };
  contact: {
    phone: string;
    email: string;
    address: string;
  };
}

// TODO: Replace this function with an API call
// e.g., export async function fetchFarmData(): Promise<FarmData> {
//   const res = await fetch('https://your-api.com/farm/lohia/data');
//   return res.json();
// }
export function getFarmData(): FarmData {
  return {
    airQuality: {
      label: "AIR QUALITY INDEX",
      value: 42,
      unit: "AQI",
      status: "good",
      statusLabel: "Optimal",
      icon: "wind",
      description: "PM2.5: 12 µg/m³ · PM10: 28 µg/m³",
    },
    environment: {
      temperature: {
        label: "TEMPERATURE",
        value: 28.5,
        unit: "°C",
        status: "good",
        statusLabel: "Normal",
        icon: "thermometer",
        description: "Feels like 30°C",
      },
      humidity: {
        label: "HUMIDITY",
        value: 68,
        unit: "%",
        status: "good",
        statusLabel: "Optimal",
        icon: "droplets",
        description: "Dew point: 22°C",
      },
      pressure: {
        label: "PRESSURE",
        value: 1013,
        unit: "hPa",
        status: "good",
        statusLabel: "Stable",
        icon: "gauge",
        description: "Trend: Steady",
      },
    },
    co2: {
      label: "CO₂ LEVEL",
      value: 405,
      unit: "ppm",
      status: "moderate",
      statusLabel: "Moderate",
      icon: "cloud",
      description: "Above outdoor baseline",
    },
    trends: {
      aqi: Array.from({ length: 24 }, (_, i) => ({
        time: `${i}:00`,
        value: 30 + Math.sin(i * 0.5) * 15 + Math.random() * 10,
      })),
      temperature: Array.from({ length: 24 }, (_, i) => ({
        time: `${i}:00`,
        value: 22 + Math.sin((i - 6) * 0.26) * 8 + Math.random() * 2,
      })),
      co2: Array.from({ length: 24 }, (_, i) => ({
        time: `${i}:00`,
        value: 380 + Math.sin(i * 0.3) * 30 + Math.random() * 15,
      })),
    },
    systemStatus: {
      sensorsOnline: 8,
      totalSensors: 8,
      lastUpdate: "2 seconds ago",
      uptime: "99.97%",
    },
    contact: {
      phone: "+91 98765 43210",
      email: "info@lohiafarm.com",
      address: "Lohia Farm, Rural District, India",
    },
  };
}
