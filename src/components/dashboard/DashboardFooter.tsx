import { Mail, MapPin, Phone } from "lucide-react";
import type { FarmData } from "@/lib/farmData";

const DashboardFooter = () => {
  return (
	<footer className="mt-4 border-t bg-card">
  		<div className="container mx-auto px-4 py-3 md:px-6 text-center text-xs font-medium tracking-tight">
    			© 2026 Team GEOsense, AIKTC — Lohia Farm Precision Weather Monitoring System. All Rights Reserved.
  		</div>
	</footer>
  );
};

export default DashboardFooter;
