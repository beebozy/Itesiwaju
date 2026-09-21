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

  useEffect(() => {
    let result = cases;

    if (statusFilter !== "ALL") {
      result = result.filter((c) => c.status === statusFilter);
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
  }, [cases, statusFilter, searchQuery]);

  const handleCaseUpdated = (updated: WasteCase) => {
    setCases((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    setSelectedCase(null);
  };

  const handleCaseAssigned = (updated: WasteCase) => {
    setCases((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    setDispatchCase(null);
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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface p-4 rounded-xl border border-surface-border">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setStatusFilter(f.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  statusFilter === f.value
                    ? "bg-primary text-white"
                    : "text-gray-400 hover:text-white hover:bg-surface-border"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative min-w-[260px]">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search case #, street, or LGA..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-background border border-surface-border rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors"
            />
          </div>
        </div>

        {/* Case Table */}
        <div className="bg-surface rounded-xl border border-surface-border overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-surface-border bg-background/50 text-gray-400 uppercase tracking-wider font-bold">
                <th className="py-3.5 px-4">Case #</th>
                <th className="py-3.5 px-4">Evidence</th>
                <th className="py-3.5 px-4">Location & Ward</th>
                <th className="py-3.5 px-4">Reported</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {filteredCases.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500">
                    No cases match the selected filter criteria.
                  </td>
                </tr>
              ) : (
                filteredCases.map((c) => (
                  <tr
                    key={c.id}
                    className="hover:bg-background/40 transition-colors"
                  >
                    <td className="py-4 px-4 font-mono font-bold text-white">
                      {c.caseNumber}
                    </td>

                    <td className="py-4 px-4">
                      <div className="w-12 h-12 rounded-lg bg-background border border-surface-border overflow-hidden shrink-0">
                        {c.imageUrl ? (
                          <img
                            src={c.imageUrl}
                            alt="Evidence"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-600 text-[10px]">
                            None
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="font-semibold text-white">
                        {c.address || `${c.latitude}, ${c.longitude}`}
                      </div>
                      <div className="text-gray-400 flex items-center gap-1 mt-0.5 text-[11px]">
                        <MapPin className="w-3 h-3 text-primary shrink-0" />
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
                            className="px-2.5 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs font-bold hover:bg-primary/20 transition-colors flex items-center gap-1"
                          >
                            <Send className="w-3 h-3" />
                            Dispatch
                          </button>
                        )}

                        <button
                          onClick={() => setSelectedCase(c)}
                          className="px-2.5 py-1.5 rounded-lg bg-surface border border-surface-border text-gray-300 text-xs font-semibold hover:text-white hover:bg-surface-border transition-colors flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Details
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
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
