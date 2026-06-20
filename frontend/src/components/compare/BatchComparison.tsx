"use client";

import type { CurriculumDiff, DiffCourse } from "@/types/curriculum";

interface BatchComparisonProps {
  diff: CurriculumDiff;
}

const categoryColors: Record<string, string> = {
  Core: "bg-brand-50 text-brand-600",
  Elective: "bg-purple-50 text-purple-700",
  Lab: "bg-emerald-50 text-emerald-700",
  Audit: "bg-slate-100 text-slate-600",
};

export function BatchComparison({ diff }: BatchComparisonProps) {
  const hasChanges =
    diff.added.length > 0 || diff.removed.length > 0 || diff.changed.length > 0;

  if (!hasChanges) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-center">
        <p className="text-slate-500">
          No changes between {diff.batch_year_old} and {diff.batch_year_new} curricula.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {diff.added.length > 0 && (
        <section>
          <h3 className="mb-3 text-lg font-semibold text-emerald-700">
            Added Courses ({diff.batch_year_new})
          </h3>
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Code</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Credits</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Semester</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {diff.added.map((c: DiffCourse) => (
                  <tr key={`${c.course_code}-${c.semester}`} className="hover:bg-emerald-50/50">
                    <td className="px-4 py-3 font-mono text-xs font-medium text-slate-900">{c.course_code}</td>
                    <td className="px-4 py-3 text-slate-700">{c.course_name}</td>
                    <td className="px-4 py-3 text-slate-600">{c.credits}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${categoryColors[c.category] || "bg-slate-100 text-slate-600"}`}>
                        {c.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{c.semester}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {diff.removed.length > 0 && (
        <section>
          <h3 className="mb-3 text-lg font-semibold text-red-700">
            Removed Courses ({diff.batch_year_old})
          </h3>
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Code</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Credits</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Semester</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {diff.removed.map((c: DiffCourse) => (
                  <tr key={`${c.course_code}-${c.semester}`} className="hover:bg-red-50/50">
                    <td className="px-4 py-3 font-mono text-xs font-medium text-slate-900">{c.course_code}</td>
                    <td className="px-4 py-3 text-slate-700">{c.course_name}</td>
                    <td className="px-4 py-3 text-slate-600">{c.credits}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${categoryColors[c.category] || "bg-slate-100 text-slate-600"}`}>
                        {c.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{c.semester}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {diff.changed.length > 0 && (
        <section>
          <h3 className="mb-3 text-lg font-semibold text-amber-700">
            Changed Courses
          </h3>
          <div className="space-y-3">
            {diff.changed.map((c) => (
              <div key={`${c.course_code}-${c.semester}`} className="rounded-xl border border-amber-200 bg-amber-50/30 p-4">
                <p className="font-medium text-slate-900">
                  {c.course_code} — Semester {c.semester}
                </p>
                <div className="mt-2 space-y-1 text-sm text-slate-600">
                  {Object.entries(c.changes).map(([field, vals]) => (
                    <div key={field} className="flex items-center gap-2">
                      <span className="font-medium capitalize">{field}:</span>
                      <span className="text-red-600 line-through">{String(vals.old)}</span>
                      <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                      </svg>
                      <span className="text-emerald-600">{String(vals.new)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
