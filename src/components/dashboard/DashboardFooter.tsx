import { useState } from "react";
import { Linkedin, ChevronDown } from "lucide-react";


const team = [
  { name: "Abdullah", role: "Hardware systems and Power optimization engineer", link: "https://www.linkedin.com/in/abdullah-ansari-691aa7333?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app" },
  { name: "Hussain", role: "Electronics and robotics engineer", link: "https://www.linkedin.com/in/hussain-attar-2a362a305?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app" },
  { name: "Mueez", role: "Data Analyst", link: "https://www.linkedin.com/in/mueez-hajwani-8a80562b6?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app" },
  { name: "Irfan", role: "Machine learning Engineer", link: "https://www.linkedin.com/in/irfan-ali-shaikh-8130262b7?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app" },
  { name: "Idris", role: "IoT and Backend Developer", link: "https://www.linkedin.com/in/idrislokhande?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app" },
  { name: "Zaid", role: "UI/UX Designer", link: "https://www.linkedin.com/in/zaid-ashfak-pansare?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app" },
  { name: "Danish", role: "Data processing engineer", link: "https://www.linkedin.com/in/danish-khan-9a5791348?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app" },
  { name: "Rehan", role: "Frontend Developer", link: "https://www.linkedin.com/in/rehan-shaikh-4aa937379" }
];

const DashboardFooter = () => {
  const [open, setOpen] = useState(false);

  return (
    <footer className="mt-12 text-center relative">

      {/* ABOUT US DROPDOWN BUTTON */}
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-2 text-lg font-bold tracking-widest text-emerald-400 hover:text-emerald-300 transition"
      >
        ABOUT US
        <ChevronDown
          size={18}
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* MODAL */}
      {open && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50">

          <div className="w-[94%] max-w-4xl rounded-3xl border border-white/10 
            bg-gradient-to-br from-[#020617]/95 to-[#064e3b]/80 
            backdrop-blur-xl shadow-2xl p-8 relative">

            {/* CLOSE BUTTON */}
            <button
              onClick={() => setOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white text-lg"
            >
              ✕
            </button>

            {/* TITLE */}
            <h2 className="text-4xl font-black text-center text-white tracking-widest mb-6">
              TEAM GEOsense
            </h2>

            {/* PROJECT DESCRIPTION */}
            <p className="text-slate-300 text-center max-w-2xl mx-auto mb-8 text-sm">
              GEOsense is a precision agriculture weather intelligence platform
              providing real-time environmental monitoring including temperature,
              humidity, pressure, CO₂ levels and air quality analytics.
            </p>

            {/* MEMBER CARDS GRID */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

              {team.map((member, i) => (
                <a
                  key={i}
                  href={member.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-white/5 hover:bg-white/10 border border-white/10 
                  rounded-2xl p-4 transition duration-300 shadow-md hover:shadow-emerald-500/20"
                >
                  <img
                    src={`https://ui-avatars.com/api/?name=${member.name}&background=random`}
                    className="w-16 h-16 rounded-full mx-auto mb-3 group-hover:scale-105 transition"
                  />

                  <p className="text-white text-sm font-semibold">
                    {member.name}
                  </p>

                  <p className="text-xs text-emerald-400 mb-2">
                    {member.role}
                  </p>

                  <Linkedin
                    size={18}
                    className="mx-auto text-blue-400 group-hover:text-blue-300"
                  />
                </a>
              ))}

            </div>

          </div>

        </div>
      )}

      {/* COPYRIGHT */}
      <p className="mt-4 text-xs text-slate-500">
        © 2026 GEOsense
      </p>

    </footer>
  );
};

export default DashboardFooter;