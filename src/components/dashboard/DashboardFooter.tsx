import { useState, useEffect } from "react";
import { Linkedin, ChevronDown, X } from "lucide-react";

const team = [
  { name: "Abdullah", role: "Hardware Systems and Power Optimization Engineer", link: "https://www.linkedin.com/in/abdullah-ansari-691aa7333" },
  { name: "Hussain", role: "Electronics and Robotics Engineer", link: "https://www.linkedin.com/in/hussain-attar-2a362a305" },
  { name: "Mueez", role: "Data Analyst", link: "https://www.linkedin.com/in/mueez-hajwani-8a80562b6" },
  { name: "Irfan", role: "Machine Learning Engineer", link: "https://www.linkedin.com/in/irfan-ali-shaikh-8130262b7" },
  { name: "Idris", role: "IoT and Backend Developer", link: "https://www.linkedin.com/in/idrislokhande" },
  { name: "Zaid", role: "UI/UX Designer", link: "https://www.linkedin.com/in/zaid-ashfak-pansare" },
  { name: "Danish", role: "Data Processing Engineer", link: "https://www.linkedin.com/in/danish-khan-9a5791348" },
  { name: "Rehan", role: "Frontend Developer", link: "https://www.linkedin.com/in/rehan-shaikh-4aa937379" }
];

const DashboardFooter = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
  }, [open]);

  return (
    <footer className="mt-12 mb-8 text-center relative px-4">
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-base md:text-lg font-black tracking-[0.2em] text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all active:scale-95 border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]"
      >
        ABOUT US
        <ChevronDown
          size={18}
          className={`transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 md:p-6 isolate">
          <div 
            className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-500" 
            onClick={() => setOpen(false)} 
          />
          
          <div className="relative w-full max-w-5xl max-h-[90dvh] flex flex-col overflow-hidden rounded-[2.5rem] md:rounded-[3.5rem] border border-white/10 bg-slate-950 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-emerald-950/20 pointer-events-none" />
            
            <button
              onClick={() => setOpen(false)}
              className="absolute top-6 right-6 z-50 p-2.5 rounded-full bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all border border-white/5"
            >
              <X size={20} />
            </button>

            <div className="flex-grow overflow-y-auto scrollbar-hide p-6 pt-16 md:p-12 relative">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-5xl font-black text-white tracking-[0.15em] mb-4 uppercase">
                  Team <span className="text-emerald-500">GEO</span>sense
                </h2>
                <div className="h-1 w-12 bg-emerald-500 mx-auto mb-6 rounded-full" />
                <p className="text-slate-300 text-xs md:text-sm max-w-xl mx-auto leading-relaxed uppercase tracking-widest font-bold opacity-70">
                  Precision agriculture intelligence platform • AIKTC Team
                </p>
              </div>

              <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-4">
                {team.map((member, i) => (
                  <div
                    key={i}
                    className="group relative bg-white/[0.02] border border-white/5 rounded-2xl p-6 transition-all duration-300 flex flex-col items-center text-center h-full cursor-default"
                  >
                    {/* The Clickable Profile Part */}
                    <a 
                      href={member.link} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="flex flex-col items-center group/link cursor-pointer"
                    >
                      {/* Avatar with Ring Reaction */}
                      <div className="relative mb-5 transition-transform duration-300 group-hover/link:scale-105">
                        <img
                          src={`https://ui-avatars.com/api/?name=${member.name}&background=10b981&color=fff&bold=true`}
                          className="w-14 h-14 rounded-full ring-2 ring-white/10 group-hover/link:ring-emerald-500 transition-all duration-300 shadow-xl"
                          alt={member.name}
                        />
                        <div className="absolute -bottom-1 -right-1 bg-slate-950 rounded-full p-1.5 border border-white/10 group-hover/link:border-emerald-500 group-hover/link:scale-110 transition-all">
                          <Linkedin size={12} className="text-emerald-400 group-hover/link:text-emerald-300" />
                        </div>
                      </div>

                      {/* Name - Now perfectly aligned */}
                      <p className="text-white text-[13px] md:text-sm font-black uppercase tracking-wider mb-2 group-hover/link:text-emerald-400 transition-colors">
                        {member.name}
                      </p>
                    </a>

                    {/* Role - Remains outside the link or non-pointer if preferred, but usually roles are informative only */}
                    <div className="h-10 flex items-start justify-center flex-shrink-0">
                      <p className="text-[10px] text-slate-500 font-bold leading-tight uppercase line-clamp-2">
                        {member.role}
                      </p>
                    </div>

                    {/* Uniform Outline that only shows when the profile is hovered */}
                    <div className="absolute inset-0 rounded-2xl border border-emerald-500/0 group-hover:border-emerald-500/30 group-hover:ring-1 group-hover:ring-emerald-500/30 transition-all pointer-events-none" />
                  </div>
                ))}
              </div>
            </div>

            <div className="h-2 w-full bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-30 shrink-0" />
          </div>
        </div>
      )}

      <p className="mt-8 text-[11px] font-black text-slate-600 uppercase tracking-[0.3em] opacity-80">
        © 2026 Team GeoSense <span className="mx-2 text-emerald-500/30">|</span> AIKTC
      </p>
    </footer>
  );
};

export default DashboardFooter;
