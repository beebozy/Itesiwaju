import { AnalyticsOverview } from "@/types";
import {
  FileText,
  Search,
  CheckCircle2,
  Truck,
  Sparkles,
  TrendingUp,
  Activity,
  ArrowUpRight,
} from "lucide-react";

interface StatCardsProps {
  overview: AnalyticsOverview;
}

export function StatCards({ overview }: StatCardsProps) {
  const { totalCases, casesByStatus } = overview;

  const awaitingReview = (casesByStatus.reported || 0) + (casesByStatus.underReview || 0);
  const activeOps =
    (casesByStatus.assigned || 0) +
    (casesByStatus.accepted || 0) +
    (casesByStatus.inProgress || 0);
  const completedCleanups = (casesByStatus.resolved || 0) + (casesByStatus.closed || 0);
  const resolutionRate =
    totalCases > 0 ? Math.round((completedCleanups / totalCases) * 100) : 0;

  const stats = [
    {
      title: "Total Incidents",
      value: totalCases,
      change: "City-wide reports logged",
      trend: "+14% vs last week",
      icon: FileText,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20 hover:border-blue-400/40",
      glow: "hover:shadow-blue-500/5",
    },
    {
      title: "Awaiting Review",
      value: awaitingReview,
      change: `${casesByStatus.reported || 0} fresh / ${casesByStatus.underReview || 0} in triage`,
      trend: awaitingReview > 0 ? "Requires action" : "Inbox cleared",
      icon: Search,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20 hover:border-amber-400/40",
      glow: "hover:shadow-amber-500/5",
    },
    {
      title: "Verified by LAWMA",
      value: casesByStatus.verified || 0,
      change: "Ready for PSP assignment",
      trend: "Dispatched promptly",
      icon: CheckCircle2,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20 hover:border-emerald-400/40",
      glow: "hover:shadow-emerald-500/5",
    },
    {
      title: "Active Field Operations",
      value: activeOps,
      change: `${casesByStatus.inProgress || 0} clearing in progress`,
      trend: "Live PSP tracking",
      icon: Truck,
      color: "text-purple-400",
      bg: "bg-purple-500/10",
      border: "border-purple-500/20 hover:border-purple-400/40",
      glow: "hover:shadow-purple-500/5",
    },
    {
      title: "Cleanups Verified",
      value: completedCleanups,
      change: `${resolutionRate}% city resolution rate`,
      trend: "100% photo-verified",
      icon: Sparkles,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20 hover:border-emerald-400/40",
      glow: "hover:shadow-emerald-500/5",
      isRate: true,
      rateValue: resolutionRate,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {stats.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.title}
            className={`p-5 rounded-2xl bg-surface/90 backdrop-blur-sm border ${item.border} ${item.glow} flex flex-col justify-between transition-all duration-200 hover:scale-[1.01] hover:shadow-xl relative overflow-hidden`}
          >
            {/* Top Row: Title + Icon */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                {item.title}
              </span>
              <div className={`p-2 rounded-xl ${item.bg} border border-white/5`}>
                <Icon className={`w-4 h-4 ${item.color}`} />
              </div>
            </div>

            {/* Middle Row: Big Metric */}
            <div className="mt-4 flex items-end justify-between">
              <div>
                <div className="text-3xl font-extrabold text-white tracking-tight">
                  {item.value}
                </div>
                <div className="text-[11px] text-gray-400 font-medium mt-1">
                  {item.change}
                </div>
              </div>

              {/* Progress Ring for Cleanups */}
              {item.isRate && (
                <div className="relative w-11 h-11 flex items-center justify-center shrink-0">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <circle
                      cx="18"
                      cy="18"
                      r="14"
                      className="stroke-gray-800"
                      strokeWidth="3"
                      fill="none"
                    />
                    <circle
                      cx="18"
                      cy="18"
                      r="14"
                      className="stroke-emerald-400 transition-all duration-700"
                      strokeWidth="3"
                      strokeDasharray="88"
                      strokeDashoffset={88 - (88 * (item.rateValue || 0)) / 100}
                      strokeLinecap="round"
                      fill="none"
                    />
                  </svg>
                  <span className="absolute text-[9px] font-bold text-emerald-400">
                    {item.rateValue}%
                  </span>
                </div>
              )}
            </div>

            {/* Bottom Row: Micro Trend Badge */}
            <div className="mt-3 pt-3 border-t border-surface-border/60 flex items-center justify-between text-[10px]">
              <span className="text-gray-500 font-medium flex items-center gap-1">
                <Activity className="w-3 h-3 text-gray-400" />
                {item.trend}
              </span>
              <ArrowUpRight className="w-3 h-3 text-gray-500 opacity-60" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
