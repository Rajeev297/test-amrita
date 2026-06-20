"use client";

import { useState, useEffect } from "react";
import { SectionHeader, EmptyState } from "@/components/common";
import { CourseTable } from "@/components/courses/CourseTable";
import { CourseCardMobile } from "@/components/courses/CourseCardMobile";
import { CourseTableSkeleton } from "@/components/courses/CourseTableSkeleton";
import { CourseTableFooter } from "@/components/courses/CourseTableFooter";
import { getPrograms, getCoursesBySemester } from "@/services/courseService";
import { SourceLabel } from "@/components/source/SourceLabel";
import type { Course, Program } from "@/types";

export default function FirstSemesterPage() {
  const [programs] = useState<Program[]>(getPrograms);
  const [selectedProgram, setSelectedProgram] = useState("cse");
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    getCoursesBySemester(selectedProgram, 1)
      .then(setCourses)
      .catch(() => setCourses([]))
      .finally(() => setLoading(false));
  }, [selectedProgram]);

  const totalCredits = courses.reduce((sum, c) => sum + c.credits, 0);

  return (
    <div className="space-y-6">
      <SectionHeader
        title="First Semester Curriculum"
        subtitle="Prepare before classes begin — view your first semester courses"
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
        <CourseTableSkeleton />
      ) : courses.length === 0 ? (
        <EmptyState
          title="No courses found"
          message="No first-semester courses available for this program."
        />
      ) : (
        <>
          <div className="hidden md:block">
            <CourseTable courses={courses} />
          </div>
          <div className="space-y-4 md:hidden">
            {courses.map((course) => (
              <CourseCardMobile key={course.id} course={course} />
            ))}
          </div>
          <CourseTableFooter
            totalCredits={totalCredits}
            courseCount={courses.length}
          />
          <SourceLabel
            source={{ batch_year: 2024, program_id: 1, program_name: selectedProgram === "cse" ? "B.Tech CSE" : "B.Tech ECE", source_url: "https://amrita.edu/curriculum" }}
          />
        </>
      )}
    </div>
  );
}
