import { AnalyticsOverview } from "@/types";
import {
  FileText,
  Search,
  CheckCircle2,
  Truck,
  Sparkles,
  Archive,
} from "lucide-react";

interface StatCardsProps {
  overview: AnalyticsOverview;
}

export function StatCards({ overview }: StatCardsProps) {
  const { totalCases, casesByStatus } = overview;

  const stats = [
    {
      title: "Total Incidents",
      value: totalCases,
      change: "City-wide reports logged",
      icon: FileText,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
    },
    {
      title: "Awaiting Review",
      value: (casesByStatus.reported || 0) + (casesByStatus.underReview || 0),
      change: `${casesByStatus.reported || 0} fresh / ${casesByStatus.underReview || 0} in review`,
      icon: Search,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
    },
    {
      title: "Verified by LAWMA",
      value: casesByStatus.verified || 0,
      change: "Ready for PSP assignment",
      icon: CheckCircle2,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
    },
    {
      title: "Active Field Operations",
      value:
        (casesByStatus.assigned || 0) +
        (casesByStatus.accepted || 0) +
        (casesByStatus.inProgress || 0),
      change: `${casesByStatus.inProgress || 0} clearing in progress`,
      icon: Truck,
      color: "text-purple-400",
      bg: "bg-purple-500/10",
      border: "border-purple-500/20",
    },
    {
      title: "Photo-Verified Cleanups",
      value: (casesByStatus.resolved || 0) + (casesByStatus.closed || 0),
      change: "100% proof-of-work verified",
      icon: Sparkles,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {stats.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.title}
            className={`p-5 rounded-xl bg-surface border ${item.border} flex flex-col justify-between transition-all hover:scale-[1.01]`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-400">
                {item.title}
              </span>
              <div className={`p-2 rounded-lg ${item.bg}`}>
                <Icon className={`w-4 h-4 ${item.color}`} />
              </div>
            </div>

            <div className="mt-4">
              <div className="text-3xl font-extrabold text-white tracking-tight">
                {item.value}
              </div>
              <div className="text-[11px] text-gray-400 font-medium mt-1">
                {item.change}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
