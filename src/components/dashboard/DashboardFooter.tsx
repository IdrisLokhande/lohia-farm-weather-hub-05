import { useState, useEffect } from "react";
import { createPortal } from "react-dom"; // For screen-centering fix
import { Linkedin, ChevronDown, X } from "lucide-react";

const team = [
  { name: "Abdullah", role: "Hardware systems and Power optimization engineer", link: "https://www.linkedin.com/..." },
  { name: "Hussain", role: "Electronics and robotics engineer", link: "https://www.linkedin.com/..." },
  { name: "Mueez", role: "Data Analyst", link: "https://www.linkedin.com/..." },
  { name: "Irfan", role: "Machine learning Engineer", link: "https://www.linkedin.com/..." },
  { name: "Idris", role: "IoT and Backend Developer", link: "https://www.linkedin.com/in/idrislokhande" },
  { name: "Zaid", role: "UI/UX Designer", link: "https://www.linkedin.com/..." },
  { name: "Danish", role: "Data processing engineer", link: "https://www.linkedin.com/..." },
  { name: "Rehan", role: "Frontend Developer", link: "https://www.linkedin.com/..." }
];

const DashboardFooter = () => {
  const [open, setOpen] = useState(false);

  // FIX: Body Scroll Lock Logic
  useEffect(() => {
    if (open) {
      const scrollY = window.scrollY;
      document.body.style.top = `-${scrollY}px`;
      document.body.classList.add('no-scroll');
    } else {
      const scrollY = document.body.style.top;
      document.body.classList.remove('no-scroll');
      document.body.style.top = '';
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      }
    }
    return () => {
      document.body.classList.remove('no-scroll');
      document.body.style.top = '';
    };
  }, [open]);

  // Define the Modal JSX
  const modalContent = (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[9999] p-4 optimize-gpu md:p-6"
      onClick={() => setOpen(false)}
    >
      <div 
        className="w-full max-w-5xl max-h-[90dvh] overflow-y-auto rounded-[2.5rem] border border-white/10 
          bg-gradient-to-br from-[#020617] to-[#064e3b] 
          backdrop-blur-xl shadow-2xl p-6 md:p-10 relative scrollbar-hide animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => setOpen(false)}
          className="absolute top-4 right-4 md:top-6 md:right-6 text-slate-400 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl md:text-4xl font-black text-center text-white tracking-widest mb-4 uppercase">
          TEAM GEOsense
        </h2>

        <p className="text-slate-300 text-center max-w-2xl mx-auto mb-8 text-xs md:text-sm leading-relaxed font-medium">
          GEOsense is a precision agriculture weather intelligence platform
          providing real-time environmental monitoring including temperature,
          humidity, pressure, CO₂ levels and air quality analytics.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {team.map((member, i) => (
            <a
              key={i}
              href={member.link}
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-white/5 hover:bg-emerald-500/10 border border-white/10 
                rounded-2xl p-5 transition-all duration-300 shadow-md hover:shadow-emerald-500/20 flex flex-col items-center text-center"
            >
              <div className="relative mb-3">
                <img
                  src={`https://ui-avatars.com/api/?name=${member.name}&background=10b981&color=fff&bold=true`}
                  alt={member.name}
                  className="w-14 h-14 md:w-16 md:h-16 rounded-full group-hover:scale-110 transition-transform duration-300 border-2 border-emerald-500/20"
                />
              </div>

              <p className="text-white text-sm md:text-base font-bold mb-1">
                {member.name}
              </p>

              <p className="text-[10px] md:text-xs text-emerald-400 mb-3 uppercase tracking-tighter font-black leading-tight h-8 flex items-center justify-center">
                {member.role}
              </p>

              <Linkedin
                size={16}
                className="text-blue-400 group-hover:text-blue-300 transition-colors"
              />
            </a>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <footer className="mt-12 mb-8 text-center relative px-4">
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-2 text-base md:text-lg font-black tracking-[0.2em] text-emerald-400 hover:text-emerald-300 transition uppercase"
      >
        ABOUT US
        <ChevronDown
          size={18}
          className={`transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* Portal Modal */}
      {open && createPortal(modalContent, document.body)}

      <p className="mt-6 text-[10px] md:text-xs text-slate-500 uppercase tracking-[0.3em] font-bold">
        © 2026 GEOsense • Precision Agriculture
      </p>
    </footer>
  );
};

export default DashboardFooter;
