"use client";

import type { SemesterBreakdown } from "@/types/curriculum";

interface DistributionChartProps {
  data: SemesterBreakdown[];
}

const categoryColors: Record<string, string> = {
  Core: "bg-brand-500",
  Elective: "bg-purple-500",
  Lab: "bg-emerald-500",
  Audit: "bg-slate-400",
};

export function DistributionChart({ data }: DistributionChartProps) {
  if (!data.length) return null;

  const maxCredits = Math.max(...data.map((s) => s.total_credits));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        {Object.entries(categoryColors).map(([cat, cls]) => (
          <div key={cat} className="flex items-center gap-1.5 text-xs text-slate-600">
            <span className={`inline-block h-3 w-3 rounded ${cls}`} />
            <span>{cat}</span>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        {data.map((sem) => (
          <div key={sem.semester}>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="font-medium text-slate-700">
                Semester {sem.semester}
              </span>
              <span className="text-slate-500">
                {sem.total_credits} credits ({sem.total_courses} courses)
              </span>
            </div>

            <div className="flex h-6 overflow-hidden rounded-lg bg-slate-100">
              {sem.categories.map((cat) => {
                const pct = maxCredits > 0 ? (cat.total_credits / maxCredits) * 100 : 0;
                if (pct < 1) return null;
                return (
                  <div
                    key={cat.category}
                    className={`${categoryColors[cat.category] || "bg-slate-400"} flex items-center justify-center text-xs font-medium text-white transition-all`}
                    style={{ width: `${pct}%`, minWidth: cat.total_credits > 0 ? "fit-content" : undefined }}
                    title={`${cat.category}: ${cat.total_credits} credits (${cat.count} courses)`}
                  >
                    {pct > 8 && (
                      <span className="px-1 truncate">{cat.total_credits}</span>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-slate-400">
              {sem.categories.map((cat) => (
                <span key={cat.category}>
                  {cat.category}: {cat.count} courses, {cat.total_credits} credits
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
