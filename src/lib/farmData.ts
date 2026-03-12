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
  value: number | React.ReactNode;
  unit: string;
  status: "good" | "moderate" | "poor" | "offline";
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

export function getFarmData(): FarmData {
  return {
    airQuality: {
      label: "AIR QUALITY INDEX",
      value: 0,
      unit: "AQI",
      status: "offline",
      statusLabel: "",
      icon: "wind",
      description: "Cannot fetch data",
    },
    environment: {
      temperature: {
        label: "TEMPERATURE",
        value: 0.0,
        unit: "°C",
        status: "offline",
        statusLabel: "",
        icon: "thermometer",
        description: "Cannot fetch data",
      },
      humidity: {
        label: "HUMIDITY",
        value: 0,
        unit: "%",
        status: "offline",
        statusLabel: "",
        icon: "droplets",
        description: "Cannot fetch data",
      },
      pressure: {
        label: "PRESSURE",
        value: 0,
        unit: "hPa",
        status: "offline",
        statusLabel: "",
        icon: "gauge",
        description: "Cannot fetch data",
      },
    },
    co2: {
      label: "CO₂ LEVEL",
      value: 0,
      unit: "ppm",
      status: "offline",
      statusLabel: "",
      icon: "cloud",
      description: "Cannot fetch data",
    },
    systemStatus: {
      sensorsOnline: 0,
      totalSensors: 3,
      lastUpdate: "---",
      uptime: "---",
    },
    contact: {
      phone: "+91 98765 43210",
      email: "info@lohiafarm.com",
      address: "Lohia Farm, Rural District, India",
    },
  };
}
