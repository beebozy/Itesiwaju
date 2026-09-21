"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { StatCards } from "@/components/dashboard/StatCards";
import { StatusProgress } from "@/components/dashboard/StatusProgress";
import { CaseStatusBadge } from "@/components/cases/CaseStatusBadge";
import { CaseDetailModal } from "@/components/cases/CaseDetailModal";
import { AssignModal } from "@/components/dispatch/AssignModal";
import { fetchAnalyticsOverview, fetchAllCases } from "@/lib/api";
import { AnalyticsOverview, WasteCase } from "@/types";
import Link from "next/link";
import {
  ArrowRight,
  MapPin,
  Clock,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
} from "lucide-react";

export default function OverviewPage() {
  const [overview, setOverview] = useState<AnalyticsOverview>({
    totalCases: 24,
    casesByStatus: {
      reported: 6,
      underReview: 4,
      verified: 5,
      assigned: 3,
      accepted: 2,
      inProgress: 2,
      resolved: 2,
      closed: 0,
      rejected: 0,
      duplicate: 0,
      reopened: 0,
    },
  });
  const [cases, setCases] = useState<WasteCase[]>([]);
  const [selectedCase, setSelectedCase] = useState<WasteCase | null>(null);
  const [dispatchCase, setDispatchCase] = useState<WasteCase | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadData = async () => {
    setIsRefreshing(true);
    try {
      const [analyticsData, casesData] = await Promise.all([
        fetchAnalyticsOverview(),
        fetchAllCases(),
      ]);
      setOverview(analyticsData);
      setCases(casesData);
    } catch (err) {
      console.error("Error loading dashboard data:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCaseUpdated = (updated: WasteCase) => {
    setCases((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    setSelectedCase(null);
  };

  const handleCaseAssigned = (updated: WasteCase) => {
    setCases((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    setDispatchCase(null);
  };

  const recentCases = cases.slice(0, 5);

  return (
    <div className="flex-1 flex flex-col">
      <Navbar
        title="Lagos Waste Management Operations"
        subtitle="Real-time incident intake, proof-of-work verification, and contractor dispatch"
        onRefresh={loadData}
        isRefreshing={isRefreshing}
      />

      <main className="p-8 space-y-8 max-w-7xl">
        {/* KPI Stat Cards */}
        <StatCards overview={overview} />

        {/* Pipeline Distribution Bar */}
        <StatusProgress overview={overview} />

        {/* Two-Column Grid: Recent Incidents & Quick Action Hub */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Incident Feed */}
          <div className="lg:col-span-2 bg-surface rounded-xl border border-surface-border p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">
                  Incoming Incident Stream
                </h3>
                <p className="text-xs text-gray-400">
                  Citizen reports requiring review, verification, or operator routing
                </p>
              </div>

              <Link
                href="/cases"
                className="text-xs font-semibold text-primary hover:text-primary-hover flex items-center gap-1"
              >
                View all cases <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-surface-border">
              {recentCases.map((c) => (
                <div
                  key={c.id}
                  onClick={() => setSelectedCase(c)}
                  className="py-3.5 flex items-center justify-between hover:bg-background/40 px-2 rounded-lg cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-4">
                    {/* Thumbnail preview */}
                    <div className="w-12 h-12 rounded-lg bg-background border border-surface-border overflow-hidden shrink-0">
                      {c.imageUrl ? (
                        <img
                          src={c.imageUrl}
                          alt="Report thumbnail"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-500 text-[10px]">
                          Photo
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-white">
                          {c.caseNumber}
                        </span>
                        <CaseStatusBadge status={c.status} size="sm" />
                      </div>
                      <div className="text-xs text-gray-300 flex items-center gap-1.5">
                        <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                        <span className="truncate max-w-[280px]">
                          {c.address || `${c.ward}, ${c.lga}`}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                      <div className="text-[11px] text-gray-400 flex items-center justify-end gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(c.reportedAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                      <div className="text-[10px] text-primary font-medium">
                        {c.ward || "Lagos"}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-500" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions & SLA Guidance */}
          <div className="space-y-6">
            <div className="bg-surface rounded-xl border border-surface-border p-6 space-y-4">
              <h3 className="text-sm font-bold text-white">Dispatch Action Hub</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Cases with verified dumpsites must be dispatched to licensed PSP operators within 4 hours.
              </p>

              <div className="space-y-2 pt-2">
                <Link
                  href="/cases?status=VERIFIED"
                  className="w-full flex items-center justify-between p-3 rounded-lg bg-background border border-surface-border text-xs font-semibold text-white hover:border-primary transition-colors"
                >
                  <span>Ready for Dispatch ({overview.casesByStatus.verified || 0})</span>
                  <ArrowRight className="w-4 h-4 text-primary" />
                </Link>

                <Link
                  href="/cases?status=REPORTED"
                  className="w-full flex items-center justify-between p-3 rounded-lg bg-background border border-surface-border text-xs font-semibold text-white hover:border-amber-500 transition-colors"
                >
                  <span>Awaiting Review ({overview.casesByStatus.reported || 0})</span>
                  <ArrowRight className="w-4 h-4 text-amber-400" />
                </Link>

                <Link
                  href="/map"
                  className="w-full flex items-center justify-between p-3 rounded-lg bg-background border border-surface-border text-xs font-semibold text-white hover:border-blue-500 transition-colors"
                >
                  <span>Live Lagos Hotspot Map</span>
                  <ExternalLink className="w-4 h-4 text-blue-400" />
                </Link>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
                <span>Zero Ghost Cleanups</span>
              </div>
              <p className="text-gray-300 text-[11px] leading-relaxed">
                Itesiwaju ensures contractors only receive validation once timestamped photographic proof matches the original GPS coordinate location.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Case Details Modal */}
      <CaseDetailModal
        wasteCase={selectedCase}
        onClose={() => setSelectedCase(null)}
        onStatusUpdated={handleCaseUpdated}
        onOpenDispatch={(c) => {
          setSelectedCase(null);
          setDispatchCase(c);
        }}
      />

      {/* PSP Dispatch Modal */}
      <AssignModal
        wasteCase={dispatchCase}
        onClose={() => setDispatchCase(null)}
        onAssigned={handleCaseAssigned}
      />
    </div>
  );
}
