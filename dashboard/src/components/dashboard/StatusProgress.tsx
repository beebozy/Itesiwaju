import { AnalyticsOverview } from "@/types";

interface StatusProgressProps {
  overview: AnalyticsOverview;
}

export function StatusProgress({ overview }: StatusProgressProps) {
  const { totalCases, casesByStatus } = overview;
  const safeTotal = totalCases > 0 ? totalCases : 1;

  const items = [
    { label: "Reported", count: casesByStatus.reported || 0, color: "bg-blue-500" },
    { label: "Under Review", count: casesByStatus.underReview || 0, color: "bg-amber-500" },
    { label: "Verified", count: casesByStatus.verified || 0, color: "bg-emerald-500" },
    { label: "Assigned / In Progress", count: (casesByStatus.assigned || 0) + (casesByStatus.accepted || 0) + (casesByStatus.inProgress || 0), color: "bg-purple-500" },
    { label: "Resolved", count: casesByStatus.resolved || 0, color: "bg-teal-400" },
  ];

  return (
    <div className="bg-surface rounded-xl border border-surface-border p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-white">Case Pipeline Distribution</h3>
          <p className="text-xs text-gray-400">Current state of active municipal sanitation tickets</p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded bg-surface-border text-gray-300">
          {totalCases} Total Active
        </span>
      </div>

      {/* Multi-segment progress bar */}
      <div className="w-full h-3 rounded-full bg-background flex overflow-hidden gap-0.5 p-0.5">
        {items.map((item) => {
          const widthPercent = Math.max((item.count / safeTotal) * 100, item.count > 0 ? 3 : 0);
          if (item.count === 0) return null;
          return (
            <div
              key={item.label}
              style={{ width: `${widthPercent}%` }}
              className={`h-full rounded-sm ${item.color}`}
              title={`${item.label}: ${item.count}`}
            />
          );
        })}
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2 text-xs">
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
            <span className="text-gray-400 truncate">{item.label}</span>
            <span className="font-bold text-white ml-auto">{item.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
