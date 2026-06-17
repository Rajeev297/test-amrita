"use client";

import { useState, useEffect } from "react";
import { SectionHeader, EmptyState } from "@/components/common";
import { SemesterFilterBar } from "@/components/courses/SemesterFilterBar";
import { CourseTable } from "@/components/courses/CourseTable";
import { CourseCardMobile } from "@/components/courses/CourseCardMobile";
import { CourseTableSkeleton } from "@/components/courses/CourseTableSkeleton";
import { CourseTableFooter } from "@/components/courses/CourseTableFooter";
import { getPrograms, getCoursesBySemester } from "@/services/courseService";
import type { Course, Program } from "@/types";

export default function CoursesPage() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [selectedProgram, setSelectedProgram] = useState("");
  const [selectedSemester, setSelectedSemester] = useState(1);
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

  const totalCredits = courses.reduce((sum, c) => sum + c.credits, 0);

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

      {loading ? (
        <CourseTableSkeleton />
      ) : courses.length === 0 ? (
        <EmptyState
          title="No courses found"
          message="No courses match the selected program and semester."
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
        </>
      )}
    </div>
  );
}
