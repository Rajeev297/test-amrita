"use client";

import type { Course } from "@/types";
import { CourseCategoryBadge } from "@/components/courses/CourseCategoryBadge";

interface ProgramComparisonProps {
  programA: { name: string; courses: Course[] };
  programB: { name: string; courses: Course[] };
  semester: number;
}

export function ProgramComparison({ programA, programB }: ProgramComparisonProps) {
  const allCodes = new Set([
    ...programA.courses.map((c) => c.code),
    ...programB.courses.map((c) => c.code),
  ]);

  const rows = Array.from(allCodes).sort().map((code) => {
    const a = programA.courses.find((c) => c.code === code);
    const b = programB.courses.find((c) => c.code === code);
    return { code, a, b };
  });

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Course Code</th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">
              {programA.name}
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">
              {programB.name}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {rows.map(({ code, a, b }) => (
            <tr key={code} className="hover:bg-slate-50/50">
              <td className="whitespace-nowrap px-4 py-3 font-mono text-xs font-medium text-slate-900">
                {code}
              </td>
              <td className="px-4 py-3">
                {a ? (
                  <div>
                    <p className="text-slate-700">{a.title}</p>
                    <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-500">
                      <span>{a.credits} credits</span>
                      <CourseCategoryBadge category={a.category} />
                    </div>
                  </div>
                ) : (
                  <span className="text-slate-300">&mdash;</span>
                )}
              </td>
              <td className="px-4 py-3">
                {b ? (
                  <div>
                    <p className="text-slate-700">{b.title}</p>
                    <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-500">
                      <span>{b.credits} credits</span>
                      <CourseCategoryBadge category={b.category} />
                    </div>
                  </div>
                ) : (
                  <span className="text-slate-300">&mdash;</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
