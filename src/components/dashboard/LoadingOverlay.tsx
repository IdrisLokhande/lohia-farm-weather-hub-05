import { Loader2 } from "lucide-react";

const LoadingOverlay = ({ isDark }: { isDark: boolean }) => {
  return (
    <div className={`fixed inset-0 z-[100] flex flex-col items-center justify-center backdrop-blur-md transition-all duration-500
      ${isDark ? "bg-[#020617]/80" : "bg-[#fffaf5]/80"}`}
    >
      <div className="relative">
        {/* Luster Effect Spinner */}
        <Loader2 className={`h-12 w-12 animate-spin 
          ${isDark ? "text-emerald-500" : "text-blue-700"}`} 
        />
        <div className={`absolute inset-0 blur-xl opacity-50 animate-pulse
          ${isDark ? "bg-emerald-500" : "bg-blue-400"}`} 
        />
      </div>
      
      <p className={`mt-4 text-[10px] font-black uppercase tracking-[0.4em] animate-pulse
        ${isDark ? "text-emerald-500/60" : "text-blue-900/60"}`}>
        Synchronizing Lohia Farm
      </p>
    </div>
  );
};

export default LoadingOverlay;
