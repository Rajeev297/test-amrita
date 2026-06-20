"use client";

import { useState, useEffect, useMemo } from "react";
import { SectionHeader, EmptyState } from "@/components/common";
import { Card } from "@/components/common/Card";
import { DistributionChart } from "@/components/charts/DistributionChart";
import { getPrograms, getCoursesBySemester } from "@/services/courseService";
import type { Course, Program } from "@/types";
import type { SemesterBreakdown, CategoryBreakdown } from "@/types/curriculum";

export default function DistributionPage() {
  const [programs] = useState<Program[]>(getPrograms);
  const [selectedProgram, setSelectedProgram] = useState("cse");
  const [semesterData, setSemesterData] = useState<Map<number, Course[]>>(new Map());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const promises = Array.from({ length: 8 }, (_, i) =>
      getCoursesBySemester(selectedProgram, i + 1).catch(() => [] as Course[])
    );
    Promise.all(promises).then((results) => {
      const map = new Map<number, Course[]>();
      results.forEach((courses, idx) => {
        if (courses.length > 0) map.set(idx + 1, courses);
      });
      setSemesterData(map);
    }).finally(() => setLoading(false));
  }, [selectedProgram]);

  const breakdown: SemesterBreakdown[] = useMemo(() => {
    const result: SemesterBreakdown[] = [];
    for (const [sem, courses] of semesterData) {
      const catMap = new Map<string, { count: number; credits: number }>();
      for (const c of courses) {
        const entry = catMap.get(c.category) || { count: 0, credits: 0 };
        entry.count += 1;
        entry.credits += c.credits;
        catMap.set(c.category, entry);
      }
      const categories: CategoryBreakdown[] = Array.from(catMap.entries()).map(([cat, data]) => ({
        category: cat,
        count: data.count,
        total_credits: data.credits,
      }));
      result.push({
        semester: sem,
        total_courses: courses.length,
        total_credits: courses.reduce((s, c) => s + c.credits, 0),
        categories,
      });
    }
    return result.sort((a, b) => a.semester - b.semester);
  }, [semesterData]);

  const totals = useMemo(() => {
    const cats = new Map<string, { count: number; credits: number }>();
    for (const sem of breakdown) {
      for (const cat of sem.categories) {
        const prev = cats.get(cat.category) || { count: 0, credits: 0 };
        prev.count += cat.count;
        prev.credits += cat.total_credits;
        cats.set(cat.category, prev);
      }
    }
    return Array.from(cats.entries()).map(([cat, data]) => ({ category: cat, ...data }));
  }, [breakdown]);

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Credit & Workload Distribution"
        subtitle="Visual summary of course distribution across semesters by category"
      />

      <div className="flex flex-col gap-4 sm:flex-row">
        <select
          value={selectedProgram}
          onChange={(e) => setSelectedProgram(e.target.value)}
          className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 sm:w-72"
          aria-label="Select program"
        >
          {programs.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-slate-100" />
          ))}
        </div>
      ) : breakdown.length === 0 ? (
        <EmptyState
          title="No data available"
          message="No curriculum data found for this program."
        />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {totals.map((t) => (
              <Card key={t.category} className="text-center">
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                  {t.category}
                </p>
                <p className="mt-1 text-2xl font-bold text-slate-900">
                  {t.credits}
                </p>
                <p className="text-xs text-slate-400">{t.count} courses</p>
              </Card>
            ))}
            <Card className="text-center">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                Total
              </p>
              <p className="mt-1 text-2xl font-bold text-slate-900">
                {breakdown.reduce((s, sem) => s + sem.total_credits, 0)}
              </p>
              <p className="text-xs text-slate-400">
                {breakdown.reduce((s, sem) => s + sem.total_courses, 0)} courses
              </p>
            </Card>
          </div>

          <Card>
            <h3 className="mb-4 text-lg font-semibold text-slate-900">
              Per-Semester Distribution
            </h3>
            <DistributionChart data={breakdown} />
          </Card>
        </>
      )}
    </div>
  );
}
