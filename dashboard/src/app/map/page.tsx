"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { CaseStatusBadge } from "@/components/cases/CaseStatusBadge";
import { CaseDetailModal } from "@/components/cases/CaseDetailModal";
import { fetchAllCases } from "@/lib/api";
import { WasteCase } from "@/types";
import { MapPin, Navigation, ExternalLink, ShieldCheck, Layers } from "lucide-react";

export default function MapPage() {
  const [cases, setCases] = useState<WasteCase[]>([]);
  const [selectedCase, setSelectedCase] = useState<WasteCase | null>(null);
  const [activeLga, setActiveLga] = useState<string>("ALL");
  const [isLoading, setIsLoading] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await fetchAllCases();
      setCases(data);
    } catch (err) {
      console.error("Failed to load map cases:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredCases =
    activeLga === "ALL" ? cases : cases.filter((c) => c.lga === activeLga);

  const lgas = ["ALL", "Ikeja", "Surulere", "Lagos Mainland", "Eti-Osa"];

  return (
    <div className="flex-1 flex flex-col">
      <Navbar
        title="Lagos City Incident Map"
        subtitle="Geographic distribution of citizen waste reports and operational coverage zones"
        onRefresh={loadData}
        isRefreshing={isLoading}
      />

      <main className="p-8 space-y-6 max-w-7xl">
        {/* LGA Filter Pills */}
        <div className="flex items-center justify-between bg-surface p-4 rounded-xl border border-surface-border">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-primary shrink-0" />
            <span className="text-xs font-bold text-gray-300">Filter by LGA:</span>
            <div className="flex items-center gap-1.5 ml-2">
              {lgas.map((lga) => (
                <button
                  key={lga}
                  onClick={() => setActiveLga(lga)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                    activeLga === lga
                      ? "bg-primary text-white"
                      : "text-gray-400 hover:text-white hover:bg-surface-border"
                  }`}
                >
                  {lga === "ALL" ? "All Lagos LGAs" : lga}
                </button>
              ))}
            </div>
          </div>

          <div className="text-xs text-gray-400">
            Showing <strong className="text-white">{filteredCases.length}</strong> geocoded incidents
          </div>
        </div>

        {/* Map Layout Split: Simulated GIS Canvas + Hotspot Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Visual Interactive Map Canvas */}
          <div className="lg:col-span-2 rounded-2xl bg-surface border border-surface-border overflow-hidden relative min-h-[520px] flex flex-col justify-between p-6 shadow-md">
            {/* Map Header Overlay */}
            <div className="flex items-center justify-between z-10">
              <div className="p-3 bg-background/80 backdrop-blur-md rounded-xl border border-surface-border text-xs flex items-center gap-2">
                <Navigation className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-white">Lagos Metropolitan Grid</span>
                <span className="text-gray-400 text-[11px]">| 6.5244° N, 3.3792° E</span>
              </div>

              <div className="p-2 bg-background/80 backdrop-blur-md rounded-xl border border-surface-border flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  <span className="text-gray-300 text-[11px]">Reported</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-gray-300 text-[11px]">Verified</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                  <span className="text-gray-300 text-[11px]">Dispatched</span>
                </div>
              </div>
            </div>

            {/* Simulated Map Visual Grid with interactive Pins */}
            <div className="absolute inset-0 bg-[#080d1a] flex items-center justify-center overflow-hidden">
              {/* Lagos grid pattern */}
              <div
                className="absolute inset-0 opacity-15"
                style={{
                  backgroundImage: `radial-gradient(#10B981 1px, transparent 1px), radial-gradient(#3B82F6 1px, transparent 1px)`,
                  backgroundSize: `40px 40px`,
                  backgroundPosition: `0 0, 20px 20px`,
                }}
              />

              {/* Pin representations plotted across Lagos */}
              {filteredCases.map((c, idx) => {
                const offsets = [
                  { top: "35%", left: "45%" },
                  { top: "52%", left: "38%" },
                  { top: "60%", left: "55%" },
                  { top: "72%", left: "70%" },
                  { top: "25%", left: "48%" },
                  { top: "42%", left: "62%" },
                  { top: "58%", left: "28%" },
                ];
                const pos = offsets[idx % offsets.length];

                const getPinColor = (status: string) => {
                  switch (status) {
                    case "REPORTED":
                    case "UNDER_REVIEW":
                      return {
                        ring: "bg-blue-500",
                        border: "border-blue-400",
                        text: "text-blue-400",
                        shadow: "shadow-blue-500/30",
                      };
                    case "VERIFIED":
                      return {
                        ring: "bg-emerald-500",
                        border: "border-emerald-400",
                        text: "text-emerald-400",
                        shadow: "shadow-emerald-500/30",
                      };
                    case "ASSIGNED":
                    case "IN_PROGRESS":
                      return {
                        ring: "bg-purple-500",
                        border: "border-purple-400",
                        text: "text-purple-400",
                        shadow: "shadow-purple-500/30",
                      };
                    case "RESOLVED":
                    case "CLOSED":
                      return {
                        ring: "bg-teal-500",
                        border: "border-teal-400",
                        text: "text-teal-400",
                        shadow: "shadow-teal-500/30",
                      };
                    default:
                      return {
                        ring: "bg-primary",
                        border: "border-primary",
                        text: "text-primary",
                        shadow: "shadow-primary/30",
                      };
                  }
                };

                const pinTheme = getPinColor(c.status);

                return (
                  <div
                    key={c.id}
                    onClick={() => setSelectedCase(c)}
                    style={{ top: pos.top, left: pos.left }}
                    className="absolute cursor-pointer -translate-x-1/2 -translate-y-1/2 group z-20"
                  >
                    <div className="relative flex items-center justify-center">
                      <span
                        className={`animate-ping absolute inline-flex h-8 w-8 rounded-full ${pinTheme.ring} opacity-30`}
                      />
                      <div
                        className={`w-9 h-9 rounded-full bg-surface border-2 ${pinTheme.border} flex items-center justify-center ${pinTheme.text} shadow-lg ${pinTheme.shadow} group-hover:scale-125 transition-transform duration-200`}
                      >
                        <MapPin className="w-4 h-4" />
                      </div>
                    </div>

                    {/* Tooltip on hover */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex flex-col bg-surface/95 backdrop-blur-md border border-surface-border p-3 rounded-xl shadow-2xl min-w-[200px] text-xs pointer-events-none z-30 animate-in fade-in zoom-in-95">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-mono font-bold text-white text-[11px]">
                          {c.caseNumber}
                        </span>
                        <CaseStatusBadge status={c.status} size="sm" />
                      </div>
                      <span className="text-gray-300 font-medium truncate">
                        {c.address || `${c.ward || "Lagos Ward"}, ${c.lga || "Ikeja"}`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Map Footer Note */}
            <div className="z-10 p-3 bg-background/80 backdrop-blur-md rounded-xl border border-surface-border text-xs flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-300">
                <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
                <span>Real-time GPS coordinate clustering enabled for Lagos pilot LGAs</span>
              </div>
            </div>
          </div>

          {/* Side List of Location Markers */}
          <div className="bg-surface rounded-2xl border border-surface-border p-5 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-white">Geotagged Incidents</h3>
              <p className="text-xs text-gray-400">
                Click any incident to open full evidence modal and dispatch options.
              </p>

              <div className="space-y-2.5 max-h-[440px] overflow-y-auto pr-1">
                {filteredCases.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => setSelectedCase(c)}
                    className="p-3 bg-background/60 hover:bg-background rounded-xl border border-surface-border hover:border-primary/50 cursor-pointer transition-all space-y-2 group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        {c.imageUrl ? (
                          <div className="w-9 h-9 rounded-lg bg-surface border border-surface-border overflow-hidden shrink-0">
                            <img
                              src={c.imageUrl}
                              alt="Evidence"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-9 h-9 rounded-lg bg-surface border border-surface-border flex items-center justify-center text-gray-600 text-[10px] shrink-0">
                            <MapPin className="w-4 h-4" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <span className="font-mono font-bold text-xs text-white group-hover:text-primary transition-colors block truncate">
                            {c.caseNumber}
                          </span>
                          <div className="text-[11px] font-medium text-gray-300 truncate">
                            {c.address || `${c.latitude}, ${c.longitude}`}
                          </div>
                        </div>
                      </div>
                      <CaseStatusBadge status={c.status} size="sm" />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-gray-400 pt-1 border-t border-surface-border/40">
                      <span>LGA: {c.lga || "Ikeja"}</span>
                      {c.latitude && c.longitude && (
                        <a
                          href={`https://www.google.com/maps?q=${c.latitude},${c.longitude}`}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-primary hover:underline flex items-center gap-1 font-medium"
                        >
                          Google Maps <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Case Details Modal */}
      <CaseDetailModal
        wasteCase={selectedCase}
        onClose={() => setSelectedCase(null)}
        onStatusUpdated={(updated) => {
          setCases((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
          setSelectedCase(null);
        }}
      />
    </div>
  );
}
