import { useState, useEffect } from "react";
import { Linkedin, ChevronDown, X } from "lucide-react";

/*
IMPORTANT:
Put images inside:

public/team/

Example:
public/team/Abdullah.png
*/

const team = [
  {
    name: "Abdullah",
    role: "Hardware Systems Engineer",
    link: "https://www.linkedin.com/in/abdullah-ansari-691aa7333",
  },
  {
    name: "Hussain",
    role: "Electronics & Robotics Engineer",
    link: "https://www.linkedin.com/in/hussain-attar-2a362a305",
  },
  {
    name: "Mueez",
    role: "Data Analyst",
    link: "https://www.linkedin.com/in/mueez-hajwani-8a80562b6",
  },
  {
    name: "Irfan",
    role: "Machine Learning Engineer",
    link: "https://www.linkedin.com/in/irfan-ali-shaikh-8130262b7",
  },
  {
    name: "Idris",
    role: "IoT & Backend Developer",
    link: "https://www.linkedin.com/in/idrislokhande",
  },
  {
    name: "Zaid",
    role: "UI/UX Designer",
    link: "https://www.linkedin.com/in/zaid-ashfak-pansare",
  },
  {
    name: "Danish",
    role: "Data Processing Engineer",
    link: "https://www.linkedin.com/in/danish-khan-9a5791348",
  },
  {
    name: "Rehan",
    role: "Frontend Developer",
    link: "https://www.linkedin.com/in/rehan-shaikh-4aa937379",
  },
];

const DashboardFooter = () => {
  const [open, setOpen] = useState(false);

  /* ESC KEY CLOSE */
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    if (open) {
      document.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "unset";
    };
  }, [open]);

  return (
    <footer className="mt-12 mb-8 text-center relative px-4">

      {/* ABOUT BUTTON */}
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-base md:text-lg font-black tracking-[0.2em] text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all border border-emerald-500/20"
      >
        ABOUT US
        <ChevronDown
          size={18}
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* MODAL */}
      {open && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">

          {/* BACKDROP */}
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={() => setOpen(false)}
          />

          {/* MODAL BOX */}
          <div className="relative w-[95%] max-w-5xl rounded-3xl border border-white/10 bg-slate-950 shadow-2xl p-10 animate-fadeIn">

            {/* CLOSE BUTTON */}
            <button
              onClick={() => setOpen(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-white"
            >
              <X size={22} />
            </button>

            {/* HEADER */}
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-widest mb-10 uppercase">
              Team <span className="text-emerald-500">GEO</span>sense
            </h2>

            {/* TEAM GRID */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">

              {team.map((member, i) => (
                <a
                  key={i}
                  href={member.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group rounded-2xl border border-white/5 bg-white/[0.02] p-6 text-center transition hover:-translate-y-1 hover:shadow-[0_0_25px_rgba(16,185,129,0.3)]"
                >
                  {/* AVATAR */}
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full overflow-hidden ring-2 ring-white/10 group-hover:ring-emerald-500 transition">

                    <img
  src={`/team/${member.name}.png`}
  alt={member.name}
  className="w-full h-full object-cover"
/>

                  </div>

                  {/* NAME */}
                  <p className="text-white text-sm font-bold uppercase tracking-wide group-hover:text-emerald-400 transition">
                    {member.name}
                  </p>

                  {/* ROLE */}
                  <p className="text-xs text-slate-500 mt-1">
                    {member.role}
                  </p>

                  {/* LINKEDIN ICON */}
                  <Linkedin
                    size={16}
                    className="mx-auto mt-3 text-emerald-400"
                  />

                </a>
              ))}

            </div>

          </div>

        </div>
      )}

      {/* FOOTER TEXT */}
      <p className="mt-8 text-[11px] font-black text-slate-600 uppercase tracking-[0.3em]">
        © 2026 Team GeoSense
      </p>
    </footer>
  );
};

export default DashboardFooter;