"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { CaseStatusBadge } from "@/components/cases/CaseStatusBadge";
import { CaseDetailModal } from "@/components/cases/CaseDetailModal";
import { AssignModal } from "@/components/dispatch/AssignModal";
import { fetchAllCases } from "@/lib/api";
import { CaseStatus, WasteCase } from "@/types";
import {
  Search,
  Filter,
  MapPin,
  Clock,
  Send,
  Eye,
  CheckCircle2,
} from "lucide-react";

const STATUS_FILTERS: { label: string; value: string }[] = [
  { label: "All Cases", value: "ALL" },
  { label: "Reported", value: "REPORTED" },
  { label: "Under Review", value: "UNDER_REVIEW" },
  { label: "Verified", value: "VERIFIED" },
  { label: "Assigned", value: "ASSIGNED" },
  { label: "Resolved", value: "RESOLVED" },
  { label: "Closed", value: "CLOSED" },
];

export default function CasesPage() {
  const [cases, setCases] = useState<WasteCase[]>([]);
  const [filteredCases, setFilteredCases] = useState<WasteCase[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedCase, setSelectedCase] = useState<WasteCase | null>(null);
  const [dispatchCase, setDispatchCase] = useState<WasteCase | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [selectedLga, setSelectedLga] = useState<string>("ALL");
  const [hoveredImage, setHoveredImage] = useState<string | null>(null);

  const loadCases = async () => {
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
    loadCases();
  }, []);

  const availableLgas = Array.from(
    new Set(cases.map((c) => c.lga).filter(Boolean))
  ) as string[];

  useEffect(() => {
    let result = cases;

    if (statusFilter !== "ALL") {
      result = result.filter((c) => c.status === statusFilter);
    }

    if (selectedLga !== "ALL") {
      result = result.filter((c) => c.lga === selectedLga);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.caseNumber.toLowerCase().includes(q) ||
          (c.address && c.address.toLowerCase().includes(q)) ||
          (c.ward && c.ward.toLowerCase().includes(q)) ||
          (c.lga && c.lga.toLowerCase().includes(q)) ||
          (c.description && c.description.toLowerCase().includes(q))
      );
    }

    setFilteredCases(result);
  }, [cases, statusFilter, selectedLga, searchQuery]);

  const handleCaseUpdated = (updated: WasteCase) => {
    setCases((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    setSelectedCase(null);
  };

  const handleCaseAssigned = (updated: WasteCase) => {
    setCases((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    setDispatchCase(null);
  };

  const getStatusCount = (value: string) => {
    if (value === "ALL") return cases.length;
    return cases.filter((c) => c.status === value).length;
  };

  return (
    <div className="flex-1 flex flex-col">
      <Navbar
        title="Incident Case Management"
        subtitle="Review, audit, verify, and track city-wide waste incident records"
        onRefresh={loadCases}
        isRefreshing={isLoading}
      />

      <main className="p-8 space-y-6 max-w-7xl">
        {/* Filter and Search Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-surface p-4 rounded-2xl border border-surface-border shadow-sm">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
            {STATUS_FILTERS.map((f) => {
              const count = getStatusCount(f.value);
              const isActive = statusFilter === f.value;
              return (
                <button
                  key={f.value}
                  onClick={() => setStatusFilter(f.value)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    isActive
                      ? "bg-primary text-white shadow-sm shadow-primary/20"
                      : "text-gray-400 hover:text-white hover:bg-surface-border/60"
                  }`}
                >
                  <span>{f.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-background/80 text-gray-400 border border-surface-border"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Right Filters: LGA Selector & Search Input */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* LGA Selector */}
            <div className="relative">
              <select
                value={selectedLga}
                onChange={(e) => setSelectedLga(e.target.value)}
                className="bg-background border border-surface-border text-gray-300 text-xs rounded-xl px-3 py-2 pr-8 focus:outline-none focus:border-primary transition appearance-none cursor-pointer font-medium"
              >
                <option value="ALL">All LGAs</option>
                {availableLgas.map((lga) => (
                  <option key={lga} value={lga}>
                    {lga}
                  </option>
                ))}
              </select>
              <Filter className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Search Input */}
            <div className="relative min-w-[240px]">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search case #, street, or LGA..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-background border border-surface-border rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-primary transition"
              />
            </div>
          </div>
        </div>

        {/* Case Table */}
        <div className="bg-surface rounded-2xl border border-surface-border overflow-hidden shadow-lg">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-surface-border bg-background/60 text-gray-400 uppercase tracking-wider font-bold text-[11px]">
                <th className="py-3.5 px-4">Case #</th>
                <th className="py-3.5 px-4">Evidence</th>
                <th className="py-3.5 px-4">Location & Ward</th>
                <th className="py-3.5 px-4">Reported</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border/60">
              {isLoading ? (
                // Shimmer Skeleton Loader
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="py-4 px-4">
                      <div className="h-4 w-24 bg-surface-border rounded" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="w-12 h-12 rounded-xl bg-surface-border" />
                    </td>
                    <td className="py-4 px-4 space-y-2">
                      <div className="h-4 w-40 bg-surface-border rounded" />
                      <div className="h-3 w-28 bg-surface-border rounded" />
                    </td>
                    <td className="py-4 px-4 space-y-1.5">
                      <div className="h-3.5 w-20 bg-surface-border rounded" />
                      <div className="h-2.5 w-14 bg-surface-border rounded" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-6 w-24 bg-surface-border rounded-full" />
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="h-7 w-16 bg-surface-border rounded-lg inline-block" />
                    </td>
                  </tr>
                ))
              ) : filteredCases.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-surface-border/40 flex items-center justify-center text-gray-400">
                        <Search className="w-5 h-5" />
                      </div>
                      <p className="text-sm font-semibold text-gray-300">No incident records found</p>
                      <p className="text-xs text-gray-500">
                        Try adjusting your status filter, LGA selection, or search query.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCases.map((c) => (
                  <tr
                    key={c.id}
                    className="hover:bg-background/40 transition-colors group"
                  >
                    <td className="py-4 px-4 font-mono font-bold text-white">
                      <span className="text-primary/90 group-hover:text-primary transition-colors">
                        {c.caseNumber}
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      <div
                        className="w-12 h-12 rounded-xl bg-background border border-surface-border overflow-hidden shrink-0 relative cursor-pointer group/img"
                        onClick={() => c.imageUrl && setHoveredImage(c.imageUrl)}
                      >
                        {c.imageUrl ? (
                          <>
                            <img
                              src={c.imageUrl}
                              alt="Evidence"
                              className="w-full h-full object-cover transition-transform duration-200 group-hover/img:scale-110"
                            />
                            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center text-white">
                              <Eye className="w-3.5 h-3.5" />
                            </div>
                          </>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-600 text-[10px] font-medium">
                            None
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="font-semibold text-white group-hover:text-emerald-300 transition-colors">
                        {c.address || `${c.latitude}, ${c.longitude}`}
                      </div>
                      <div className="text-gray-400 flex items-center gap-1.5 mt-1 text-[11px]">
                        <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span>{c.ward || "Central Ward"}, {c.lga || "Ikeja"}</span>
                      </div>
                    </td>

                    <td className="py-4 px-4 text-gray-300">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-gray-500" />
                        <span>{new Date(c.reportedAt).toLocaleDateString()}</span>
                      </div>
                      <div className="text-[10px] text-gray-500 mt-0.5">
                        {new Date(c.reportedAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <CaseStatusBadge status={c.status} />
                    </td>

                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {c.status === "VERIFIED" && (
                          <button
                            onClick={() => setDispatchCase(c)}
                            className="px-3 py-1.5 rounded-xl bg-primary/15 border border-primary/30 text-primary text-xs font-bold hover:bg-primary/25 transition-all flex items-center gap-1.5 shadow-sm"
                          >
                            <Send className="w-3.5 h-3.5" />
                            Dispatch
                          </button>
                        )}

                        <button
                          onClick={() => setSelectedCase(c)}
                          className="px-3 py-1.5 rounded-xl bg-surface border border-surface-border text-gray-300 text-xs font-semibold hover:text-white hover:bg-surface-border transition-all flex items-center gap-1.5 shadow-sm"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Review
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Hover / Magnification Lightbox Overlay */}
        {hoveredImage && (
          <div
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-6"
            onClick={() => setHoveredImage(null)}
          >
            <div
              className="relative max-w-2xl max-h-[85vh] bg-surface rounded-2xl overflow-hidden border border-surface-border shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={hoveredImage}
                alt="Enlarged Evidence"
                className="w-full h-auto max-h-[75vh] object-contain"
              />
              <div className="p-4 bg-background/90 border-t border-surface-border flex items-center justify-between text-xs text-gray-300">
                <span className="font-semibold text-white">Geotagged Photographic Proof</span>
                <button
                  onClick={() => setHoveredImage(null)}
                  className="px-3 py-1 bg-surface-border rounded-lg text-white font-bold hover:bg-gray-700 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
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
