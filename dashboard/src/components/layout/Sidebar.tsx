"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ClipboardList,
  Send,
  MapPin,
  ShieldCheck,
  Building2,
  FileCheck2,
} from "lucide-react";

const navigation = [
  { name: "Overview", href: "/", icon: LayoutDashboard },
  { name: "Incident Cases", href: "/cases", icon: ClipboardList },
  { name: "PSP Dispatch", href: "/dispatch", icon: Send },
  { name: "City Map", href: "/map", icon: MapPin },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-surface border-r border-surface-border flex flex-col justify-between shrink-0 h-screen sticky top-0">
      <div>
        {/* Brand header */}
        <div className="p-6 border-b border-surface-border flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center font-bold text-white text-lg">
            I
          </div>
          <div>
            <div className="font-extrabold text-white tracking-wider flex items-center gap-1.5 text-base">
              ITESIWAJU
              <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded font-bold uppercase">
                Agency
              </span>
            </div>
            <div className="text-xs text-gray-400 font-medium">
              LAWMA Operations Portal
            </div>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="p-4 space-y-1.5">
          <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-gray-500">
            Control Center
          </div>
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-primary text-white shadow-sm shadow-primary/20"
                    : "text-gray-400 hover:text-white hover:bg-surface-border/50"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-gray-400"}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Authority compliance card */}
        <div className="px-4 py-2">
          <div className="p-4 bg-background/50 rounded-xl border border-surface-border text-xs space-y-2">
            <div className="flex items-center gap-2 text-primary font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>SLA Enforcement</span>
            </div>
            <p className="text-gray-400 text-[11px] leading-relaxed">
              Mandatory before-and-after photographic evidence is required for every contractor billing cycle.
            </p>
          </div>
        </div>
      </div>

      {/* Footer / User info */}
      <div className="p-4 border-t border-surface-border">
        <div className="flex items-center gap-3 p-2 bg-background/60 rounded-lg">
          <div className="w-8 h-8 rounded-full bg-surface-border flex items-center justify-center font-bold text-xs text-gray-300">
            LA
          </div>
          <div className="overflow-hidden">
            <div className="text-xs font-bold text-white truncate">
              LAWMA Supervisor
            </div>
            <div className="text-[11px] text-gray-400 truncate">
              HQ Control Room #4
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
