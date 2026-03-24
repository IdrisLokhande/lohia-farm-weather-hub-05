import { Moon, Sun } from "lucide-react";
import geoSenseLogo from "@/assets/geosenseLogo.png";
import DataDownloader from "./DataDownloader";

interface DashboardHeaderProps {
  isDark: boolean;
  lang: string;
  onToggleTheme: () => void;
  onLanguageChange: (l: string) => void;
  t: any;
}

const DashboardHeader = ({
  isDark,
  lang,
  onToggleTheme,
  onLanguageChange,
  t,
}: DashboardHeaderProps) => {
  return (
    <header className="sticky top-0 z-[51] glass-card border-b">
      <div className="container mx-auto flex items-center justify-between px-4 py-3 md:px-6">
        {/* Left Side: Logo & Title */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {/* Logo scales up to 65px ONLY at 530px+ */}
          <div className="relative flex h-[53px] w-[53px] min-[530px]:h-[65px] min-[530px]:w-[65px] shrink-0 items-center justify-center rounded-full border-2 border-primary bg-primary/10 p-1.5 shadow-sm overflow-hidden transition-all duration-300">
            <img
              src={geoSenseLogo}
              alt="Logo"
              className="absolute min-w-[135%] min-h-[135%] object-contain"
            />
          </div>

          {/* Title Truncation Logic:
              - Below 375px (xxs): Strictly truncated at 80px to prevent button collision.
              - Above 375px (xxs): max-w-none allows full title visibility.
          */}
          <span
            className="font-sans text-lg min-[530px]:text-xl font-bold text-foreground 
            [font-family:'Noto_Sans_Devanagari',sans-serif] [font-variant-ligatures:common-ligatures] 
            [text-rendering:optimizeLegibility] truncate pl-1 md:pl-2 transition-all"
          >
            {t.dashBoardTitle}
          </span>
        </div>

        {/* Right Side: Responsive Stack */}
        <div className="flex flex-col items-end gap-2 xs:flex-row xs:items-center xs:gap-4">
          {/* Download Data Button */}
          <DataDownloader isDark={isDark} t={t} />

          {/* Language Toggle Container */}
          <div className="flex bg-muted rounded-md p-1 gap-1">
            {["en", "hi", "mr"].map(l => (
              <button
                key={l}
                onClick={() => onLanguageChange(l)}
                className={`px-2 py-1 text-[10px] md:text-xs rounded-sm transition-all ${
                  lang === l ? "bg-background shadow-sm font-bold" : "opacity-70 hover:opacity-100"
                }`}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Theme Toggle Button */}
          <button
            onClick={onToggleTheme}
            className="flex items-center gap-2 rounded-lg bg-secondary px-3 py-1.5 md:py-2 text-xs md:text-sm font-medium text-secondary-foreground transition-colors min-w-[100px] xs:min-w-[110px] md:min-w-[130px] justify-center hover:bg-accent hover:text-accent-foreground"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            <span className="whitespace-nowrap">{isDark ? t.light : t.dark}</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
