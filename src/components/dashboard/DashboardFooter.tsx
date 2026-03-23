import { useState, useEffect } from "react";
import { Linkedin, ChevronDown, X } from "lucide-react";

const team = [
  { name: "Abdullah", role: "Hardware systems and Power optimization engineer", link: "https://www.linkedin.com/in/abdullah-ansari-691aa7333" },
  { name: "Hussain", role: "Electronics and robotics engineer", link: "https://www.linkedin.com/in/hussain-attar-2a362a305" },
  { name: "Mueez", role: "Data Analyst", link: "https://www.linkedin.com/in/mueez-hajwani-8a80562b6" },
  { name: "Irfan", role: "Machine learning Engineer", link: "https://www.linkedin.com/in/irfan-ali-shaikh-8130262b7" },
  { name: "Idris", role: "IoT and Backend Developer", link: "https://www.linkedin.com/in/idrislokhande" },
  { name: "Zaid", role: "UI/UX Designer", link: "https://www.linkedin.com/in/zaid-ashfak-pansare" },
  { name: "Danish", role: "Data processing engineer", link: "https://www.linkedin.com/in/danish-khan-9a5791348" },
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
        className="inline-flex items-center gap-2 text-base md:text-lg font-black tracking-[0.2em] text-emerald-400 hover:text-emerald-300 transition-all active:scale-95"
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
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300" 
            onClick={() => setOpen(false)} 
          />
          
          <div className="relative w-full max-w-4xl max-h-[90dvh] flex flex-col overflow-hidden rounded-[2rem] md:rounded-[3rem] border border-white/10 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950/50 shadow-2xl animate-in zoom-in-95 duration-300">
            
            <button
              onClick={() => setOpen(false)}
              className="absolute top-5 right-5 z-50 p-2 rounded-full bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all"
            >
              <X size={20} />
            </button>

            <div className="flex-grow overflow-y-auto scrollbar-hide p-6 pt-16 md:p-10 md:pt-10">
              <div className="text-center mb-8">
                <h2 className="text-2xl md:text-5xl font-black text-white tracking-[0.15em] mb-4 uppercase">
                  Team <span className="text-emerald-400">GEO</span>sense
                </h2>
                <p className="text-slate-400 text-xs md:text-sm max-w-xl mx-auto leading-relaxed uppercase tracking-wider">
                  A precision agriculture intelligence platform providing real-time 
                  environmental monitoring and air quality analytics.
                </p>
              </div>

              <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                {team.map((member, i) => (
                  <a
                    key={i}
                    href={member.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group bg-white/5 hover:bg-emerald-500/10 border border-white/5 hover:border-emerald-500/30 rounded-2xl p-4 transition-all duration-300 flex flex-col items-center text-center justify-between min-h-[170px]"
                  >
                    <div className="relative">
                      <img
                        src={`https://ui-avatars.com/api/?name=${member.name}&background=10b981&color=fff&bold=true`}
                        className="w-12 h-12 md:w-14 md:h-14 rounded-full mb-3 ring-2 ring-white/10 group-hover:ring-emerald-500/50 transition-all"
                        alt={member.name}
                      />
                      {/* ENLARGED LINKEDIN ICON CONTAINER */}
                      <div className="absolute -bottom-1 -right-1 bg-slate-900 rounded-full p-1.5 border border-white/10 group-hover:border-emerald-500/50 group-hover:scale-110 transition-transform">
                        <Linkedin size={14} className="text-emerald-400" />
                      </div>
                    </div>

                    <div>
                      <p className="text-white text-[13px] md:text-sm font-black uppercase tracking-tight">
                        {member.name}
                      </p>
                      <p className="text-[10px] md:text-xs text-emerald-400/80 font-bold leading-tight mt-1 line-clamp-2 uppercase">
                        {member.role}
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            <div className="h-1.5 w-full bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent shrink-0" />
          </div>
        </div>
      )}

      <p className="mt-4 text-[10px] md:text-xs font-bold text-slate-600 uppercase tracking-[0.2em]">
        © 2026 Team GeoSense, AIKTC • All Rights Reserved
      </p>
    </footer>
  );
};

export default DashboardFooter;
