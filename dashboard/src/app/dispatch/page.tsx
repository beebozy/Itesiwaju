"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { CaseStatusBadge } from "@/components/cases/CaseStatusBadge";
import { AssignModal } from "@/components/dispatch/AssignModal";
import { fetchAllCases } from "@/lib/api";
import { WasteCase } from "@/types";
import {
  Send,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";

export default function DispatchPage() {
  const [cases, setCases] = useState<WasteCase[]>([]);
  const [dispatchCase, setDispatchCase] = useState<WasteCase | null>(null);
  const [tab, setTab] = useState<"READY" | "ACTIVE">("READY");
  const [isLoading, setIsLoading] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await fetchAllCases();
      setCases(data);
    } catch (err) {
      console.error("Failed to load cases:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const verifiedCases = cases.filter((c) => c.status === "VERIFIED");
  const activeDispatches = cases.filter((c) =>
    ["ASSIGNED", "ACCEPTED", "IN_PROGRESS"].includes(c.status)
  );

  const handleCaseAssigned = (updated: WasteCase) => {
    setCases((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    setDispatchCase(null);
  };

  const displayedList = tab === "READY" ? verifiedCases : activeDispatches;

  return (
    <div className="flex-1 flex flex-col">
      <Navbar
        title="PSP Operator Dispatch Center"
        subtitle="Route verified waste dumpsites to licensed private contractors and monitor SLA timers"
        onRefresh={loadData}
        isRefreshing={isLoading}
      />

      <main className="p-8 space-y-6 max-w-7xl">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-xl bg-surface border border-emerald-500/20">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-400">
                Awaiting Dispatch
              </span>
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                <Send className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-extrabold text-white">
                {verifiedCases.length}
              </div>
              <div className="text-xs text-gray-400 mt-0.5">
                Verified incidents ready for truck assignment
              </div>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-surface border border-purple-500/20">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-400">
                Active in Field
              </span>
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                <Truck className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-extrabold text-white">
                {activeDispatches.length}
              </div>
              <div className="text-xs text-gray-400 mt-0.5">
                Trucks currently clearing routes
              </div>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-surface border border-surface-border">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-400">
                SLA Compliance
              </span>
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-extrabold text-white">96.4%</div>
              <div className="text-xs text-gray-400 mt-0.5">
                Dispatches cleared within 24h window
              </div>
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center gap-2 border-b border-surface-border pb-3">
          <button
            onClick={() => setTab("READY")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-2 ${
              tab === "READY"
                ? "bg-primary text-white"
                : "text-gray-400 hover:text-white hover:bg-surface"
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            Ready for Assignment ({verifiedCases.length})
          </button>
          <button
            onClick={() => setTab("ACTIVE")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-2 ${
              tab === "ACTIVE"
                ? "bg-purple-500 text-white"
                : "text-gray-400 hover:text-white hover:bg-surface"
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            Active Field Operations ({activeDispatches.length})
          </button>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {displayedList.length === 0 ? (
            <div className="col-span-full py-16 text-center text-gray-500 bg-surface rounded-xl border border-surface-border">
              {tab === "READY"
                ? "No verified cases awaiting dispatch."
                : "No active dispatches currently in progress."}
            </div>
          ) : (
            displayedList.map((c) => (
              <div
                key={c.id}
                className="bg-surface rounded-xl border border-surface-border overflow-hidden flex flex-col justify-between hover:border-gray-600 transition-all shadow-sm"
              >
                <div>
                  {/* Photo header */}
                  <div className="aspect-video bg-background relative overflow-hidden">
                    {c.imageUrl ? (
                      <img
                        src={c.imageUrl}
                        alt="Incident"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-gray-600">
                        No image
                      </div>
                    )}
                    <div className="absolute top-3 left-3">
                      <CaseStatusBadge status={c.status} />
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-white">
                        {c.caseNumber}
                      </span>
                      <span className="text-[11px] text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(c.reportedAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="text-sm font-semibold text-white truncate">
                        {c.address || `${c.ward}, ${c.lga}`}
                      </div>
                      <div className="text-xs text-primary flex items-center gap-1">
                        <MapPin className="w-3 h-3 shrink-0" />
                        <span>Ward: {c.ward || "Central"} | LGA: {c.lga || "Ikeja"}</span>
                      </div>
                    </div>

                    {c.description && (
                      <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                        "{c.description}"
                      </p>
                    )}
                  </div>
                </div>

                <div className="p-4 border-t border-surface-border bg-background/50 flex items-center justify-between">
                  <div className="text-[11px] text-gray-400">
                    Priority: <strong className="text-amber-400">High</strong>
                  </div>

                  {c.status === "VERIFIED" ? (
                    <button
                      onClick={() => setDispatchCase(c)}
                      className="px-3.5 py-1.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm shadow-primary/20"
                    >
                      <Send className="w-3 h-3" />
                      Assign PSP
                    </button>
                  ) : (
                    <span className="text-xs text-purple-400 font-semibold flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5" />
                      Assigned to Fleet
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Dispatch Modal */}
      <AssignModal
        wasteCase={dispatchCase}
        onClose={() => setDispatchCase(null)}
        onAssigned={handleCaseAssigned}
      />
    </div>
  );
}
