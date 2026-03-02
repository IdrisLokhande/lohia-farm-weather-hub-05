import { Leaf, Moon, Sun } from "lucide-react";

interface DashboardHeaderProps {
  isDark: boolean;
  onToggleTheme: () => void;
}

const DashboardHeader = ({ isDark, onToggleTheme }: DashboardHeaderProps) => {
  return (
    <header className="sticky top-0 z-50 glass-card border-b">
      <div className="container mx-auto flex items-center justify-between px-4 py-3 md:px-6">
        <div className="flex items-center gap-2">
          <Leaf className="h-6 w-6 text-primary" />
          <span className="font-display text-xl font-bold text-foreground">
            Lohia Farm
          </span>
        </div>
        <button
          onClick={onToggleTheme}
          className="flex items-center gap-2 rounded-lg bg-secondary px-3 py-2 text-sm font-medium text-secondary-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          aria-label="Toggle theme"
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          {isDark ? "Light Mode" : "Dark Mode"}
        </button>
      </div>
    </header>
  );
};

export default DashboardHeader;
