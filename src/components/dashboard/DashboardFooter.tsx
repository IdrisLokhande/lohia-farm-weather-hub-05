import { Mail, MapPin, Phone } from "lucide-react";
import type { FarmData } from "@/lib/farmData";

interface DashboardFooterProps {
  contact: FarmData["contact"];
}

const DashboardFooter = ({ contact }: DashboardFooterProps) => {
  return (
    <footer className="border-t bg-card">
      <div className="container mx-auto px-4 py-8 md:px-6">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="flex items-center gap-3">
            <Phone className="h-4 w-4 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Phone</p>
              <p className="text-sm font-medium text-foreground">{contact.phone}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Mail className="h-4 w-4 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="text-sm font-medium text-foreground">{contact.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <MapPin className="h-4 w-4 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Address</p>
              <p className="text-sm font-medium text-foreground">{contact.address}</p>
            </div>
          </div>
        </div>
        <div className="mt-6 border-t pt-4 text-center text-xs text-muted-foreground">
          © 2026 Lohia Farm Environmental Intelligence System
        </div>
      </div>
    </footer>
  );
};

export default DashboardFooter;
