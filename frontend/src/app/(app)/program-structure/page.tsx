"use client";

import { useState, useEffect, useMemo } from "react";
import { SectionHeader, EmptyState } from "@/components/common";
import { CourseTable } from "@/components/courses/CourseTable";
import { CourseCardMobile } from "@/components/courses/CourseCardMobile";
import { CourseTableSkeleton } from "@/components/courses/CourseTableSkeleton";
import { getPrograms, getCoursesBySemester } from "@/services/courseService";
import type { Course, Program } from "@/types";

export default function ProgramStructurePage() {
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

  const totalCredits = useMemo(() => {
    let total = 0;
    semesterData.forEach((courses) => {
      total += courses.reduce((s, c) => s + c.credits, 0);
    });
    return total;
  }, [semesterData]);

  const totalCourses = useMemo(() => {
    let total = 0;
    semesterData.forEach((courses) => {
      total += courses.length;
    });
    return total;
  }, [semesterData]);

  if (loading) {
    return (
      <div className="space-y-6">
        <SectionHeader
          title="Program Structure"
          subtitle="Complete curriculum overview across all semesters"
        />
        <div className="flex gap-4">
          <div className="h-10 w-72 animate-pulse rounded-lg bg-slate-200" />
        </div>
        {Array.from({ length: 3 }).map((_, i) => (
          <CourseTableSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Program Structure"
        subtitle="Complete curriculum overview across all semesters"
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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

        <div className="flex gap-4 text-sm text-slate-600">
          <span><strong className="text-slate-900">{totalCourses}</strong> courses</span>
          <span><strong className="text-slate-900">{totalCredits}</strong> total credits</span>
        </div>
      </div>

      {semesterData.size === 0 ? (
        <EmptyState title="No data" message="No curriculum data available for this program." />
      ) : (
        Array.from(semesterData.entries()).map(([sem, courses]) => (
          <section key={sem}>
            <h2 className="mb-3 text-xl font-bold text-slate-900">
              Semester {sem}
              <span className="ml-2 text-sm font-normal text-slate-400">
                {courses.length} courses &middot; {courses.reduce((s, c) => s + c.credits, 0)} credits
              </span>
            </h2>
            <div className="hidden md:block">
              <CourseTable courses={courses} />
            </div>
            <div className="space-y-4 md:hidden">
              {courses.map((course) => (
                <CourseCardMobile key={course.id} course={course} />
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
