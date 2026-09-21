"use client";

import { useState } from "react";
import { CaseStatus, WasteCase } from "@/types";
import { CaseStatusBadge } from "./CaseStatusBadge";
import { updateCaseStatusApi } from "@/lib/api";
import {
  X,
  MapPin,
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

export function CaseDetailModal({
  wasteCase,
  onClose,
  onStatusUpdated,
  onOpenDispatch,
}: CaseDetailModalProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!wasteCase) return null;

  const handleStatusChange = async (newStatus: CaseStatus) => {
    setIsUpdating(true);
    setErrorMsg(null);
    try {
      await updateCaseStatusApi(wasteCase.id, newStatus);
      const updated = { ...wasteCase, status: newStatus, updatedAt: new Date().toISOString() };
      onStatusUpdated(updated);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to update case status");
    } finally {
      setIsUpdating(false);
    }
  };

  const mapUrl = wasteCase.latitude && wasteCase.longitude
    ? `https://www.google.com/maps?q=${wasteCase.latitude},${wasteCase.longitude}`
    : null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-surface border border-surface-border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-surface-border flex items-center justify-between bg-background/50">
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm font-bold text-white">
              {wasteCase.caseNumber}
            </span>
            <CaseStatusBadge status={wasteCase.status} />
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-surface-border transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {errorMsg && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400 font-medium flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Photo & Geotag Preview */}
          <div className="rounded-xl overflow-hidden border border-surface-border bg-background relative aspect-video flex items-center justify-center">
            {wasteCase.imageUrl ? (
              <img
                src={wasteCase.imageUrl}
                alt="Incident Evidence"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-xs text-gray-500 flex flex-col items-center gap-1">
                <ShieldAlert className="w-6 h-6" />
                <span>No photo evidence attached</span>
              </div>
            )}

            <div className="absolute bottom-3 left-3 right-3 p-2.5 rounded-lg bg-black/80 backdrop-blur-md border border-white/10 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-300">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="truncate">
                  {wasteCase.address || `${wasteCase.latitude}, ${wasteCase.longitude}`}
                </span>
              </div>
              {mapUrl && (
                <a
                  href={mapUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary hover:text-primary-hover flex items-center gap-1 text-[11px] font-bold shrink-0 ml-2"
                >
                  Maps <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>

          {/* Incident Details Grid */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="p-3 rounded-lg bg-background/50 border border-surface-border space-y-1">
              <span className="text-gray-400 font-medium">Local Government (LGA)</span>
              <div className="font-bold text-white text-sm">
                {wasteCase.lga || "Ikeja"}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-background/50 border border-surface-border space-y-1">
              <span className="text-gray-400 font-medium">Ward Jurisdiction</span>
              <div className="font-bold text-white text-sm">
                {wasteCase.ward || "Central Ward"}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-background/50 border border-surface-border space-y-1">
              <span className="text-gray-400 font-medium">Timestamp Reported</span>
              <div className="font-semibold text-gray-200 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-gray-400" />
                {new Date(wasteCase.reportedAt).toLocaleString()}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-background/50 border border-surface-border space-y-1">
              <span className="text-gray-400 font-medium">Privacy Status</span>
              <div className="font-semibold text-gray-200 uppercase">
                {wasteCase.privacyLevel}
              </div>
            </div>
          </div>

          {/* Citizen Description */}
          {wasteCase.description && (
            <div className="space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Citizen Note
              </span>
              <p className="p-3.5 rounded-lg bg-background/70 border border-surface-border text-xs text-gray-300 leading-relaxed">
                "{wasteCase.description}"
              </p>
            </div>
          )}
        </div>

        {/* Footer with State Transition Actions */}
        <div className="p-4 border-t border-surface-border bg-background/50 flex items-center justify-between">
          <div className="text-xs text-gray-400">
            Available state transition actions:
          </div>

          <div className="flex items-center gap-2">
            {wasteCase.status === "REPORTED" && (
              <button
                onClick={() => handleStatusChange("UNDER_REVIEW")}
                disabled={isUpdating}
                className="px-3.5 py-2 rounded-lg bg-amber-500 text-black text-xs font-bold hover:bg-amber-400 transition-colors disabled:opacity-50 flex items-center gap-1.5"
              >
                Start Agency Review
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            {wasteCase.status === "UNDER_REVIEW" && (
              <>
                <button
                  onClick={() => handleStatusChange("REJECTED")}
                  disabled={isUpdating}
                  className="px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold hover:bg-red-500/20 transition-colors disabled:opacity-50 flex items-center gap-1.5"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  Reject Report
                </button>
                <button
                  onClick={() => handleStatusChange("VERIFIED")}
                  disabled={isUpdating}
                  className="px-3.5 py-2 rounded-lg bg-primary text-white text-xs font-bold hover:bg-primary-hover transition-colors disabled:opacity-50 flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Verify Case
                </button>
              </>
            )}

            {wasteCase.status === "VERIFIED" && onOpenDispatch && (
              <button
                onClick={() => onOpenDispatch(wasteCase)}
                className="px-4 py-2 rounded-lg bg-primary text-white text-xs font-bold hover:bg-primary-hover transition-colors flex items-center gap-1.5 shadow-sm shadow-primary/20"
              >
                <Send className="w-3.5 h-3.5" />
                Dispatch to PSP Operator
              </button>
            )}

            {wasteCase.status === "RESOLVED" && (
              <button
                onClick={() => handleStatusChange("CLOSED")}
                disabled={isUpdating}
                className="px-3.5 py-2 rounded-lg bg-emerald-500 text-white text-xs font-bold hover:bg-emerald-600 transition-colors disabled:opacity-50 flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Audit & Close Case
              </button>
            )}

            <button
              onClick={onClose}
              className="px-3 py-2 rounded-lg bg-surface border border-surface-border text-gray-300 text-xs font-semibold hover:bg-surface-border transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
