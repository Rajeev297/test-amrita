import { mockCoursesData, mockProgramsData } from "@/data/mockCourses";
import type { Course, Program } from "@/types";

export function getPrograms(): Program[] {
  return mockProgramsData;
}

export async function getCoursesBySemester(
  programId: string,
  semester: number
): Promise<Course[]> {
  await new Promise((resolve) => setTimeout(resolve, 600));

  const program = mockProgramsData.find((p) => p.id === programId);
  if (!program) return [];

  return mockCoursesData.filter(
    (course) => course.program === program.name && course.semester === semester
  );
}
