"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { CaseStatus, WasteCase } from "@/types";
import { CaseStatusBadge } from "./CaseStatusBadge";
import { updateCaseStatusApi, fetchCaseById } from "@/lib/api";
import {
  X,
  MapPin,
  Calendar,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ShieldAlert,
  Send,
  ExternalLink,
} from "lucide-react";

interface CaseDetailModalProps {
  wasteCase: WasteCase | null;
  onClose: () => void;
  onStatusUpdated: (updatedCase: WasteCase) => void;
  onOpenDispatch?: (wasteCase: WasteCase) => void;
}

const WORKFLOW_STEPS: { status: CaseStatus; label: string }[] = [
  { status: "REPORTED", label: "Reported" },
  { status: "UNDER_REVIEW", label: "Review" },
  { status: "VERIFIED", label: "Verified" },
  { status: "ASSIGNED", label: "Dispatched" },
  { status: "IN_PROGRESS", label: "In Progress" },
  { status: "RESOLVED", label: "Resolved" },
  { status: "CLOSED", label: "Audited" },
];

const STATUS_ORDER: Record<CaseStatus, number> = {
  REPORTED: 0,
  UNDER_REVIEW: 1,
  VERIFIED: 2,
  ASSIGNED: 3,
  ACCEPTED: 3,
  IN_PROGRESS: 4,
  RESOLVED: 5,
  CLOSED: 6,
  REJECTED: -1,
  DUPLICATE: -1,
  REOPENED: 1,
};

export function CaseDetailModal({
  wasteCase,
  onClose,
  onStatusUpdated,
  onOpenDispatch,
}: CaseDetailModalProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [evidenceList, setEvidenceList] = useState<any[]>([]);
  const [activePhotoTab, setActivePhotoTab] = useState<"BEFORE" | "AFTER">("BEFORE");
  const [isImageExpanded, setIsImageExpanded] = useState(false);

  useEffect(() => {
    if (wasteCase?.id) {
      fetchCaseById(wasteCase.id).then((data) => {
        if (data?.evidence && data.evidence.length > 0) {
          setEvidenceList(data.evidence);
        } else if (wasteCase.imageUrl) {
          setEvidenceList([
            { id: "1", mediaUrl: wasteCase.imageUrl, type: "REPORT_PHOTO" },
          ]);
        }
      });
    }
  }, [wasteCase?.id, wasteCase?.imageUrl]);

  if (!wasteCase) return null;

  const currentStepIndex = STATUS_ORDER[wasteCase.status] ?? 0;

  const beforePhoto =
    evidenceList.find((e) => e.type === "REPORT_PHOTO")?.mediaUrl ||
    wasteCase.imageUrl ||
    (wasteCase as any)?.mediaUrl ||
    evidenceList[0]?.mediaUrl ||
    null;

  const afterPhoto =
    evidenceList.find((e) => e.type === "RESOLUTION_PHOTO")?.mediaUrl ||
    (evidenceList.length > 1 ? evidenceList[1].mediaUrl : null);

  const displayPhotoUrl =
    activePhotoTab === "AFTER" && afterPhoto ? afterPhoto : beforePhoto;

  const handleStatusChange = async (newStatus: CaseStatus) => {
    setIsUpdating(true);
    setErrorMsg(null);
    try {
      await updateCaseStatusApi(wasteCase.id, newStatus);
      const updated = {
        ...wasteCase,
        status: newStatus,
        updatedAt: new Date().toISOString(),
      };
      onStatusUpdated(updated);
    } catch (err: any) {
      const msg = err.message || "Failed to update case status";
      setErrorMsg(msg);
      const updated = {
        ...wasteCase,
        status: newStatus,
        updatedAt: new Date().toISOString(),
      };
      onStatusUpdated(updated);
    } finally {
      setIsUpdating(false);
    }
  };

  const mapUrl =
    wasteCase.latitude && wasteCase.longitude
      ? `https://www.google.com/maps?q=${wasteCase.latitude},${wasteCase.longitude}`
      : null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-surface border border-surface-border rounded-3xl w-full max-w-2xl max-h-[92vh] overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-surface-border flex items-center justify-between bg-background/60">
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm font-bold text-white tracking-wider">
              {wasteCase.caseNumber}
            </span>
            <CaseStatusBadge status={wasteCase.status} />
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-gray-400 hover:text-white hover:bg-surface-border transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {errorMsg && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400 font-medium flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
              <Link
                href="/login"
                className="px-2.5 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg font-bold text-[11px] whitespace-nowrap transition"
              >
                Sign In →
              </Link>
            </div>
          )}

          {/* Workflow Audit Tracker Timeline */}
          {currentStepIndex >= 0 && (
            <div className="p-4 bg-background/60 rounded-2xl border border-surface-border/80">
              <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">
                Operational Audit Progression
              </div>
              <div className="flex items-center justify-between relative">
                {/* Connecting background track */}
                <div className="absolute top-3 left-4 right-4 h-0.5 bg-surface-border -z-0" />

                {WORKFLOW_STEPS.map((step, idx) => {
                  const isCompleted = idx < currentStepIndex;
                  const isCurrent = idx === currentStepIndex;
                  return (
                    <div
                      key={step.status}
                      className="flex flex-col items-center gap-1.5 z-10"
                    >
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                          isCompleted
                            ? "bg-primary text-white"
                            : isCurrent
                            ? "bg-primary text-white ring-4 ring-primary/20 shadow-md shadow-primary/30"
                            : "bg-surface border border-surface-border text-gray-500"
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        ) : (
                          idx + 1
                        )}
                      </div>
                      <span
                        className={`text-[10px] font-medium tracking-tight whitespace-nowrap ${
                          isCurrent
                            ? "text-white font-bold"
                            : isCompleted
                            ? "text-gray-300"
                            : "text-gray-600"
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Photo Evidence with Before / After Tabs if resolved */}
          <div className="space-y-2">
            {afterPhoto && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActivePhotoTab("BEFORE")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                    activePhotoTab === "BEFORE"
                      ? "bg-primary text-white"
                      : "bg-surface text-gray-400 hover:text-white"
                  }`}
                >
                  Citizen Report Photo
                </button>
                <button
                  onClick={() => setActivePhotoTab("AFTER")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                    activePhotoTab === "AFTER"
                      ? "bg-emerald-500 text-white"
                      : "bg-surface text-gray-400 hover:text-white"
                  }`}
                >
                  PSP Resolution Photo
                </button>
              </div>
            )}

            <div
              className="rounded-2xl overflow-hidden border border-surface-border bg-background relative aspect-video flex items-center justify-center cursor-pointer group"
              onClick={() => displayPhotoUrl && setIsImageExpanded(true)}
            >
              {displayPhotoUrl ? (
                <>
                  <img
                    src={displayPhotoUrl}
                    alt="Incident Evidence"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <span className="px-3 py-1.5 rounded-xl bg-black/70 backdrop-blur-sm text-xs font-bold text-white border border-white/10">
                      Click to Enlarge
                    </span>
                  </div>
                </>
              ) : (
                <div className="text-xs text-gray-500 flex flex-col items-center gap-1.5">
                  <ShieldAlert className="w-6 h-6 text-gray-600" />
                  <span>No photo evidence attached</span>
                </div>
              )}

              <div className="absolute bottom-3 left-3 right-3 p-2.5 rounded-xl bg-black/85 backdrop-blur-md border border-white/10 text-xs flex items-center justify-between pointer-events-auto">
                <div className="flex items-center gap-2 text-gray-300 min-w-0">
                  <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="truncate font-medium">
                    {wasteCase.address ||
                      `${wasteCase.latitude}, ${wasteCase.longitude}`}
                  </span>
                </div>
                {mapUrl && (
                  <a
                    href={mapUrl}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-primary hover:text-primary-hover flex items-center gap-1 text-[11px] font-bold shrink-0 ml-2"
                  >
                    Google Maps <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Incident Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-background/50 border border-surface-border space-y-1">
              <span className="text-gray-400 font-medium text-[11px]">
                LGA
              </span>
              <div className="font-bold text-white truncate">
                {wasteCase.lga || "Ikeja"}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-background/50 border border-surface-border space-y-1">
              <span className="text-gray-400 font-medium text-[11px]">
                Ward Jurisdiction
              </span>
              <div className="font-bold text-white truncate">
                {wasteCase.ward || "Central Ward"}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-background/50 border border-surface-border space-y-1">
              <span className="text-gray-400 font-medium text-[11px]">
                Reported Time
              </span>
              <div className="font-semibold text-gray-200 flex items-center gap-1 truncate text-[11px]">
                <Clock className="w-3 h-3 text-gray-400 shrink-0" />
                {new Date(wasteCase.reportedAt).toLocaleDateString()}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-background/50 border border-surface-border space-y-1">
              <span className="text-gray-400 font-medium text-[11px]">
                Privacy Level
              </span>
              <div className="font-semibold text-gray-200 uppercase text-[11px]">
                {wasteCase.privacyLevel}
              </div>
            </div>
          </div>

          {/* Citizen Description */}
          {wasteCase.description && (
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                Citizen Narrative Note
              </span>
              <p className="p-3.5 rounded-xl bg-background/70 border border-surface-border text-xs text-gray-300 leading-relaxed italic">
                "{wasteCase.description}"
              </p>
            </div>
          )}
        </div>

        {/* Footer with State Transition Actions */}
        <div className="p-4 border-t border-surface-border bg-background/60 flex items-center justify-between">
          <div className="text-xs text-gray-400">
            Authorized action:
          </div>

          <div className="flex items-center gap-2">
            {wasteCase.status === "REPORTED" && (
              <button
                onClick={() => handleStatusChange("UNDER_REVIEW")}
                disabled={isUpdating}
                className="px-3.5 py-2 rounded-xl bg-amber-500 text-black text-xs font-bold hover:bg-amber-400 transition-all disabled:opacity-50 flex items-center gap-1.5 shadow-sm"
              >
                Start Review
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            {wasteCase.status === "UNDER_REVIEW" && (
              <>
                <button
                  onClick={() => handleStatusChange("REJECTED")}
                  disabled={isUpdating}
                  className="px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold hover:bg-red-500/20 transition-all disabled:opacity-50 flex items-center gap-1.5"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  Reject Report
                </button>
                <button
                  onClick={() => handleStatusChange("VERIFIED")}
                  disabled={isUpdating}
                  className="px-3.5 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-hover transition-all disabled:opacity-50 flex items-center gap-1.5 shadow-sm shadow-primary/20"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Verify Case
                </button>
              </>
            )}

            {wasteCase.status === "VERIFIED" && onOpenDispatch && (
              <button
                onClick={() => onOpenDispatch(wasteCase)}
                className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-hover transition-all flex items-center gap-1.5 shadow-sm shadow-primary/20"
              >
                <Send className="w-3.5 h-3.5" />
                Dispatch to PSP
              </button>
            )}

            {wasteCase.status === "RESOLVED" && (
              <button
                onClick={() => handleStatusChange("CLOSED")}
                disabled={isUpdating}
                className="px-3.5 py-2 rounded-xl bg-emerald-500 text-white text-xs font-bold hover:bg-emerald-600 transition-all disabled:opacity-50 flex items-center gap-1.5 shadow-sm shadow-emerald-500/20"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Audit & Close Case
              </button>
            )}

            <button
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl bg-surface border border-surface-border text-gray-300 text-xs font-semibold hover:bg-surface-border transition-all"
            >
              Done
            </button>
          </div>
        </div>

        {/* Full Image Modal */}
        {isImageExpanded && displayPhotoUrl && (
          <div
            className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-md flex items-center justify-center p-6"
            onClick={() => setIsImageExpanded(false)}
          >
            <div
              className="relative max-w-3xl max-h-[85vh] bg-surface rounded-2xl overflow-hidden border border-surface-border shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={displayPhotoUrl}
                alt="Enlarged Evidence"
                className="w-full h-auto max-h-[75vh] object-contain"
              />
              <div className="p-4 bg-background/90 border-t border-surface-border flex items-center justify-between text-xs text-gray-300">
                <span className="font-semibold text-white">
                  {activePhotoTab === "AFTER"
                    ? "PSP Resolution Verification Photo"
                    : "Citizen Geotagged Evidence Photo"}
                </span>
                <button
                  onClick={() => setIsImageExpanded(false)}
                  className="px-3 py-1 bg-surface-border rounded-lg text-white font-bold hover:bg-gray-700 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
