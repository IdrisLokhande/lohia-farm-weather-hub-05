import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Download, Calendar, Database, Clock, X, ChevronDown, Loader2 } from "lucide-react";
import { rtdb } from "@/lib/firebase";
import { ref, get, query, orderByChild, startAt, endAt } from "firebase/database";
import { cleanDataArray } from "@/Median and Data chnages/dataCleaner";

interface DataDownloaderProps {
  isDark?: boolean;
  t: any;
}

const DataDownloader = ({ isDark = true, t }: DataDownloaderProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const generateCSV = (data: any[], fileName: string) => {
    // Mapping all 12-13 key parameters you track
    const headers = [
      "Date",
      "Time",
      "Temperature (°C)",
      "Humidity (%)",
      "Pressure (hPa)",
      "Light Intensity (Lux)",
      "CO2 (ppm)",
      "PM1.0 (µg/m³)",
      "PM2.5 (µg/m³)",
      "PM10.0 (µg/m³)",
      "Uptime",
      "Sensors Online",
    ];

    const rows = data.map(row => {
      const dateObj = row.timestamp ? new Date(row.timestamp) : new Date();
      return [
        dateObj.toLocaleDateString(),
        dateObj.toLocaleTimeString(),
        row.temperature ?? "N/A",
        row.humidity ?? "N/A",
        row.pressure ?? "N/A",
        row.lux ?? "N/A",
        row.co2 ?? "N/A",
        row.pm1 ?? "N/A",
        row.pm25 ?? "N/A",
        row.pm10 ?? "N/A",
        row.uptime ?? "0h 0m",
        row.sensorsOnline ?? "0",
      ].join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${fileName}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const fetchAndDownload = async (mode: "today" | "all" | "custom") => {
    setLoading(true);
    setIsOpen(false);

    try {
      let dbQuery;
      const weatherRef = ref(rtdb, "weather");

      if (mode === "all") {
        dbQuery = weatherRef;
      } else if (mode === "today") {
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        dbQuery = query(weatherRef, orderByChild("timestamp"), startAt(startOfToday.getTime()));
      } else if (mode === "custom") {
        if (!startDate || !endDate) {
          alert(t.selectDates);
          setLoading(false);
          return;
        }
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        dbQuery = query(
          weatherRef,
          orderByChild("timestamp"),
          startAt(start.getTime()),
          endAt(end.getTime())
        );
        setShowModal(false);
      }

      const snapshot = await get(dbQuery!);

      if (!snapshot.exists()) {
        alert(t.noData);
        setLoading(false);
        return;
      }

      const dataEntries: any[] = [];
      snapshot.forEach(child => {
        dataEntries.push(child.val());
      });

      // Clean the raw data to replace 0/NaN values with historical medians
      const cleanedDataEntries = cleanDataArray(dataEntries);
      generateCSV(cleanedDataEntries, `lohia_farm_data_${mode}_${new Date().getTime()}`);
    } catch (error) {
      console.error("Data export error:", error);
      alert(t.errorFetching);
    }

    setLoading(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={loading}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full border backdrop-blur-md transition-all text-xs font-bold uppercase tracking-widest ${
          isDark
            ? "bg-white/5 border-white/10 text-slate-200 hover:bg-white/10"
            : "bg-black/5 border-black/10 text-emerald-950 hover:bg-black/10"
        }`}
      >
        {loading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
        <span className="hidden sm:inline">{loading ? t.exporting : t.export}</span>
        <ChevronDown size={14} className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div
          className={`absolute right-0 mt-2 w-48 rounded-xl border backdrop-blur-xl shadow-2xl z-50 overflow-hidden ${
            isDark
              ? "bg-slate-900/95 border-white/10 text-slate-200"
              : "bg-white/95 border-black/10 text-emerald-950"
          }`}
        >
          <div className="flex flex-col p-1">
            <button
              onClick={() => fetchAndDownload("today")}
              className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors ${isDark ? "hover:bg-white/10" : "hover:bg-black/5"}`}
            >
              <Clock size={14} className="opacity-70" /> {t.todayData}
            </button>
            <button
              onClick={() => fetchAndDownload("all")}
              className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors ${isDark ? "hover:bg-white/10" : "hover:bg-black/5"}`}
            >
              <Database size={14} className="opacity-70" /> {t.allData}
            </button>
            <button
              onClick={() => {
                setIsOpen(false);
                setShowModal(true);
              }}
              className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors ${isDark ? "hover:bg-white/10" : "hover:bg-black/5"}`}
            >
              <Calendar size={14} className="opacity-70" /> {t.customRange}
            </button>
          </div>
        </div>
      )}

      {/* Custom Range Modal */}
      {showModal &&
        createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/50 backdrop-blur-sm p-4">
            <div
              className={`w-full max-w-lg p-6 sm:p-8 rounded-2xl border shadow-2xl ${isDark ? "bg-slate-900 border-white/10 text-white" : "bg-white border-black/10 text-emerald-950"}`}
            >
              <div className="flex justify-between items-center mb-6 sm:mb-8">
                <h3 className="font-black uppercase tracking-widest text-xs sm:text-sm">
                  {t.selectDateRange}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="opacity-50 hover:opacity-100 transition-opacity"
                  title="Close"
                  aria-label="Close date range modal"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4 sm:space-y-6">
                <div>
                  <label
                    htmlFor="start-date"
                    className="block text-[9px] sm:text-[10px] font-bold uppercase tracking-widest opacity-70 mb-1 sm:mb-1.5"
                  >
                    {t.startDate}
                  </label>
                  <input
                    type="date"
                    id="start-date"
                    placeholder="YYYY-MM-DD"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${isDark ? "bg-slate-950 border-white/10 [color-scheme:dark]" : "bg-slate-50 border-black/10"}`}
                  />
                </div>
                <div>
                  <label
                    htmlFor="end-date"
                    className="block text-[9px] sm:text-[10px] font-bold uppercase tracking-widest opacity-70 mb-1 sm:mb-1.5"
                  >
                    {t.endDate}
                  </label>
                  <input
                    type="date"
                    id="end-date"
                    placeholder="YYYY-MM-DD"
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${isDark ? "bg-slate-950 border-white/10 [color-scheme:dark]" : "bg-slate-50 border-black/10"}`}
                  />
                </div>
              </div>

              <button
                onClick={() => fetchAndDownload("custom")}
                disabled={loading}
                className={`w-full mt-6 sm:mt-8 py-3 rounded-lg text-sm font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2 ${isDark ? "bg-emerald-500 text-slate-950 hover:bg-emerald-400" : "bg-emerald-600 text-white hover:bg-emerald-700"}`}
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                {t.downloadCsv}
              </button>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default DataDownloader;
