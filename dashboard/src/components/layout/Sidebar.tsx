"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ClipboardList,
  Send,
  MapPin,
  ShieldCheck,
  Building2,
  FileCheck2,
  LogIn,
  LogOut,
} from "lucide-react";
import { getStoredToken, getStoredUser, logoutAgency } from "@/lib/api";

const navigation = [
  { name: "Overview", href: "/", icon: LayoutDashboard },
  { name: "Incident Cases", href: "/cases", icon: ClipboardList },
  { name: "PSP Dispatch", href: "/dispatch", icon: Send },
  { name: "City Map", href: "/map", icon: MapPin },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [hasToken, setHasToken] = useState<boolean>(false);

  useEffect(() => {
    const token = getStoredToken();
    const storedUser = getStoredUser();
    setHasToken(!!token);
    setUser(storedUser);
  }, [pathname]);

  const handleLogout = () => {
    logoutAgency();
    setUser(null);
    setHasToken(false);
    router.push("/login");
  };

  const getCleanDisplayName = (name?: string) => {
    if (!name) return "Lawma Admin";
    if (name.trim().toLowerCase() === "lawma test operator") return "Lawma Admin";
    const cleaned = name.replace(/^agency\s+/i, "").trim();
    if (!cleaned || cleaned.toLowerCase() === "operator") return "Lawma Admin";
    return cleaned;
  };

  const getCleanRole = (role?: string) => {
    if (!role) return "ADMIN";
    if (role === "AGENCY_OPERATOR") return "LAWMA ADMIN";
    return role.replace(/^AGENCY_/, "");
  };

  const displayName = getCleanDisplayName(user?.fullName);
  const displayRole = getCleanRole(user?.role);

  return (
    <aside className="w-64 bg-surface border-r border-surface-border flex flex-col justify-between shrink-0 h-screen sticky top-0">
      <div>
        {/* Brand header */}
        <div className="p-6 border-b border-surface-border flex items-center gap-3">
          <img
            src="/logo.png"
            alt="Itesiwaju Logo"
            className="w-9 h-9 rounded-xl object-contain shadow-md shadow-emerald-500/10 border border-emerald-500/20"
          />
          <div>
            <div className="font-extrabold text-white tracking-wider flex items-center gap-1.5 text-base">
              ITESIWAJU
              <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded font-bold uppercase">
                Admin
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
        {hasToken ? (
          <div className="flex items-center justify-between p-2 bg-background/60 rounded-lg">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center font-bold text-xs text-primary shrink-0">
                {displayName ? displayName[0].toUpperCase() : "A"}
              </div>
              <div className="overflow-hidden">
                <div className="text-xs font-bold text-white truncate">
                  {displayName}
                </div>
                <div className="text-[10px] text-primary font-semibold tracking-wide uppercase truncate">
                  {displayRole}
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-1.5 text-gray-400 hover:text-white hover:bg-surface-border rounded transition shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            className="flex items-center justify-center gap-2 w-full py-2.5 px-3 bg-primary/15 hover:bg-primary/25 border border-primary/30 text-primary rounded-lg text-xs font-bold transition"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In to Dispatch</span>
          </Link>
        )}
      </div>
    </aside>
  );
}

