"use client";

import { useState, useEffect } from "react";
import { SectionHeader, EmptyState } from "@/components/common";
import { SemesterFilterBar } from "@/components/courses/SemesterFilterBar";
import { CourseTable } from "@/components/courses/CourseTable";
import { CourseCardMobile } from "@/components/courses/CourseCardMobile";
import { CourseTableSkeleton } from "@/components/courses/CourseTableSkeleton";
import { CourseTableFooter } from "@/components/courses/CourseTableFooter";
import { SourceLabel } from "@/components/source/SourceLabel";
import { getPrograms, getCoursesBySemester } from "@/services/courseService";
import type { Course, Program } from "@/types";

export default function CoursesPage() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [selectedProgram, setSelectedProgram] = useState("");
  const [selectedSemester, setSelectedSemester] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadedPrograms = getPrograms();
    setPrograms(loadedPrograms);
    if (loadedPrograms.length > 0) {
      setSelectedProgram(loadedPrograms[0].id);
    }
  }, []);

  useEffect(() => {
    if (!selectedProgram) return;

    setLoading(true);
    getCoursesBySemester(selectedProgram, selectedSemester)
      .then((data) => {
        setCourses(data);
      })
      .catch(() => {
        setCourses([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [selectedProgram, selectedSemester]);

  const filteredCourses = categoryFilter === "all"
    ? courses
    : courses.filter((c) => c.category === categoryFilter);

  const totalCredits = filteredCourses.reduce((sum, c) => sum + c.credits, 0);

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Courses"
        subtitle="View courses by program and semester"
      />

      <SemesterFilterBar
        programs={programs}
        selectedProgram={selectedProgram}
        selectedSemester={selectedSemester}
        onProgramChange={(id) => setSelectedProgram(id)}
        onSemesterChange={(sem) => setSelectedSemester(sem)}
      />

      <div className="flex flex-wrap items-center gap-3">
        <label className="text-xs font-medium text-slate-500">Category:</label>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-700"
        >
          <option value="all">All Categories</option>
          <option value="Core">Core</option>
          <option value="Elective">Elective</option>
          <option value="Lab">Lab</option>
          <option value="Audit">Audit</option>
        </select>
        {categoryFilter !== "all" && (
          <button
            type="button"
            onClick={() => setCategoryFilter("all")}
            className="text-xs text-brand-500 hover:text-brand-600"
          >
            Clear
          </button>
        )}
        <span className="ml-auto text-xs text-slate-400">
          {filteredCourses.length} course{filteredCourses.length !== 1 ? "s" : ""}
        </span>
      </div>

      {loading ? (
        <CourseTableSkeleton />
      ) : filteredCourses.length === 0 ? (
        <EmptyState
          title="No courses found"
          message={categoryFilter !== "all"
            ? `No ${categoryFilter} courses in this semester.`
            : "No courses match the selected program and semester."}
        />
      ) : (
        <>
          <div className="hidden md:block">
            <CourseTable courses={filteredCourses} />
          </div>
          <div className="space-y-4 md:hidden">
            {filteredCourses.map((course) => (
              <CourseCardMobile key={course.id} course={course} />
            ))}
          </div>
          <CourseTableFooter
            totalCredits={totalCredits}
            courseCount={filteredCourses.length}
          />
          <SourceLabel
            source={{ batch_year: 2024, program_id: 1, program_name: "Amrita Vishwa Vidyapeetham", source_url: "https://amrita.edu/curriculum" }}
          />
        </>
      )}
    </div>
  );
}
