import { CaseStatus } from "@/types";

interface CaseStatusBadgeProps {
  status: CaseStatus;
  size?: "sm" | "md";
}

const statusConfig: Record<
  CaseStatus,
  { label: string; bg: string; text: string; dot: string }
> = {
  REPORTED: {
    label: "Reported",
    bg: "bg-blue-500/10",
    text: "text-blue-400 border-blue-500/20",
    dot: "bg-blue-400",
  },
  UNDER_REVIEW: {
    label: "Under Review",
    bg: "bg-amber-500/10",
    text: "text-amber-400 border-amber-500/20",
    dot: "bg-amber-400",
  },
  VERIFIED: {
    label: "Verified",
    bg: "bg-emerald-500/10",
    text: "text-emerald-400 border-emerald-500/20",
    dot: "bg-emerald-400",
  },
  ASSIGNED: {
    label: "Assigned to PSP",
    bg: "bg-purple-500/10",
    text: "text-purple-400 border-purple-500/20",
    dot: "bg-purple-400",
  },
  ACCEPTED: {
    label: "PSP Accepted",
    bg: "bg-indigo-500/10",
    text: "text-indigo-400 border-indigo-500/20",
    dot: "bg-indigo-400",
  },
  IN_PROGRESS: {
    label: "In Progress",
    bg: "bg-cyan-500/10",
    text: "text-cyan-400 border-cyan-500/20",
    dot: "bg-cyan-400",
  },
  RESOLVED: {
    label: "Resolved",
    bg: "bg-emerald-500/10",
    text: "text-emerald-400 border-emerald-500/20",
    dot: "bg-emerald-400",
  },
  CLOSED: {
    label: "Closed & Audited",
    bg: "bg-gray-500/10",
    text: "text-gray-400 border-gray-500/20",
    dot: "bg-gray-400",
  },
  REJECTED: {
    label: "Rejected",
    bg: "bg-red-500/10",
    text: "text-red-400 border-red-500/20",
    dot: "bg-red-400",
  },
  DUPLICATE: {
    label: "Duplicate",
    bg: "bg-zinc-500/10",
    text: "text-zinc-400 border-zinc-500/20",
    dot: "bg-zinc-400",
  },
  REOPENED: {
    label: "Reopened",
    bg: "bg-orange-500/10",
    text: "text-orange-400 border-orange-500/20",
    dot: "bg-orange-400",
  },
};

export function CaseStatusBadge({ status, size = "sm" }: CaseStatusBadgeProps) {
  const config = statusConfig[status] || {
    label: status,
    bg: "bg-gray-500/10",
    text: "text-gray-400 border-gray-500/20",
    dot: "bg-gray-400",
  };

  const isLive = status === "REPORTED" || status === "UNDER_REVIEW" || status === "IN_PROGRESS";
  const sizeClasses =
    size === "sm" ? "px-2.5 py-0.5 text-[11px]" : "px-3 py-1 text-xs font-semibold";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${config.bg} ${config.text} ${sizeClasses} font-medium tracking-wide shadow-sm`}
    >
      <span className="relative flex h-1.5 w-1.5">
        {isLive && (
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full ${config.dot} opacity-75`}
          />
        )}
        <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${config.dot}`} />
      </span>
      {config.label}
    </span>
  );
}
