import type { Course, Program } from "@/types";

export const mockCourses: Course[] = [
  {
    id: "1",
    code: "CS101",
    title: "Introduction to Computer Science",
    lectureHours: 3,
    tutorialHours: 1,
    practicalHours: 0,
    credits: 4,
    description: "Fundamentals of computer science and programming.",
    department: "CSE",
    program: "B.Tech CSE",
    semester: 1,
    category: "Core",
  },
  {
    id: "2",
    code: "CS102",
    title: "Data Structures",
    lectureHours: 3,
    tutorialHours: 1,
    practicalHours: 0,
    credits: 4,
    description: "Linear and non-linear data structures.",
    department: "CSE",
    program: "B.Tech CSE",
    semester: 2,
    category: "Core",
  },
  {
    id: "3",
    code: "MA101",
    title: "Calculus I",
    lectureHours: 3,
    tutorialHours: 0,
    practicalHours: 0,
    credits: 3,
    description: "Single-variable calculus.",
    department: "Mathematics",
    program: "B.Tech CSE",
    semester: 1,
    category: "Core",
  },
];

export const mockPrograms: Program[] = [
  {
    id: "1",
    name: "B.Tech Computer Science and Engineering",
    code: "CSE",
    duration: 8,
  },
  {
    id: "2",
    name: "B.Tech Electronics and Communication",
    code: "ECE",
    duration: 8,
  },
];

export function getMockCourses(): Course[] {
  return mockCourses;
}

export function getMockPrograms(): Program[] {
  return mockPrograms;
}

export function getMockCourseById(id: string): Course | undefined {
  return mockCourses.find((course) => course.id === id);
}
