"use client";

import { Bell, Search, RefreshCw } from "lucide-react";

interface NavbarProps {
  title?: string;
  subtitle?: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function Navbar({
  title = "Operations Overview",
  subtitle = "Lagos State Municipal Solid Waste Coordination",
  onRefresh,
  isRefreshing,
}: NavbarProps) {
  return (
    <header className="h-20 bg-surface/70 backdrop-blur-md border-b border-surface-border px-8 flex items-center justify-between sticky top-0 z-30">
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">{title}</h1>
        <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
      </div>

      <div className="flex items-center gap-4">
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-lg bg-surface border border-surface-border text-gray-300 hover:text-white hover:bg-surface-border transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-primary" : ""}`} />
            Refresh
          </button>
        )}

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Live API Sync
        </div>
      </div>
    </header>
  );
}
