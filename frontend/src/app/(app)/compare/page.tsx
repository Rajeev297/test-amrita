"use client";

import { useState, useMemo } from "react";
import { SectionHeader, EmptyState } from "@/components/common";
import { mockCoursesData, mockProgramsData } from "@/data/mockCourses";
import { BatchComparison } from "@/components/compare/BatchComparison";
import { ProgramComparison } from "@/components/compare/ProgramComparison";
import type { CurriculumDiff, DiffCourse } from "@/types/curriculum";

type CompareMode = "batch" | "program";

export default function ComparePage() {
  const [mode, setMode] = useState<CompareMode>("batch");
  const [selectedProgram, setSelectedProgram] = useState("cse");
  const [batchYearOld, setBatchYearOld] = useState(2023);
  const [batchYearNew, setBatchYearNew] = useState(2024);

  const [programA, setProgramA] = useState("cse");
  const [programB, setProgramB] = useState("ece");
  const [compareSemester, setCompareSemester] = useState(1);

  const programs = useMemo(() => mockProgramsData, []);

  const batchDiff = useMemo((): CurriculumDiff | null => {
    const prog = programs.find((p) => p.id === selectedProgram);
    if (!prog) return null;

    return {
      batch_year_old: batchYearOld,
      batch_year_new: batchYearNew,
      program_id: prog.id === "cse" ? 1 : 2,
      added: [] as DiffCourse[],
      removed: [] as DiffCourse[],
      changed: [],
    };
  }, [selectedProgram, batchYearOld, batchYearNew, programs]);

  const programCompareData = useMemo(() => {
    const progAObj = programs.find((p) => p.id === programA);
    const progBObj = programs.find((p) => p.id === programB);
    if (!progAObj || !progBObj) return null;

    return {
      programA: {
        name: progAObj.name,
        courses: mockCoursesData.filter(
          (c) => c.program === progAObj.name && c.semester === compareSemester
        ),
      },
      programB: {
        name: progBObj.name,
        courses: mockCoursesData.filter(
          (c) => c.program === progBObj.name && c.semester === compareSemester
        ),
      },
      semester: compareSemester,
    };
  }, [programA, programB, compareSemester, programs]);

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Compare Curricula"
        subtitle="Side-by-side comparison of batch curricula or programs"
      />

      <div className="flex gap-2 rounded-xl border border-slate-200 bg-white p-1 w-fit">
        <button
          type="button"
          onClick={() => setMode("batch")}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            mode === "batch"
              ? "bg-brand-500 text-white"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Batch Comparison
        </button>
        <button
          type="button"
          onClick={() => setMode("program")}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            mode === "program"
              ? "bg-brand-500 text-white"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Program Comparison
        </button>
      </div>

      {mode === "batch" ? (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Program</label>
              <select
                value={selectedProgram}
                onChange={(e) => setSelectedProgram(e.target.value)}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
              >
                {programs.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Old Batch</label>
              <select
                value={batchYearOld}
                onChange={(e) => setBatchYearOld(Number(e.target.value))}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
              >
                {[2023, 2024].map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">New Batch</label>
              <select
                value={batchYearNew}
                onChange={(e) => setBatchYearNew(Number(e.target.value))}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
              >
                {[2023, 2024].map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          {batchDiff && <BatchComparison diff={batchDiff} />}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Program A</label>
              <select
                value={programA}
                onChange={(e) => setProgramA(e.target.value)}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
              >
                {programs.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Program B</label>
              <select
                value={programB}
                onChange={(e) => setProgramB(e.target.value)}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
              >
                {programs.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Semester</label>
              <select
                value={compareSemester}
                onChange={(e) => setCompareSemester(Number(e.target.value))}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
              >
                {Array.from({ length: 8 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>Semester {i + 1}</option>
                ))}
              </select>
            </div>
          </div>

          {programCompareData ? (
            <ProgramComparison
              programA={programCompareData.programA}
              programB={programCompareData.programB}
              semester={programCompareData.semester}
            />
          ) : (
            <EmptyState title="No data" message="Select programs to compare." />
          )}
        </div>
      )}
    </div>
  );
}
