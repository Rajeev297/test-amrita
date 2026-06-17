export type CourseCategory = "Core" | "Elective" | "Lab" | "Audit";

export interface Course {
  id: string;
  code: string;
  title: string;
  lectureHours: number;
  tutorialHours: number;
  practicalHours: number;
  credits: number;
  description: string;
  department: string;
  program: string;
  semester: number;
  category: CourseCategory;
}

export interface Program {
  id: string;
  name: string;
  code: string;
  duration: number;
}

export interface Department {
  id: string;
  name: string;
  code: string;
}

export interface Semester {
  number: number;
  courses: Course[];
}
