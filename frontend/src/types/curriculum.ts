export interface ProgramFull {
  id: number;
  name: string;
  code: string;
  duration: number;
  total_semesters: number;
  total_credits_required: number;
  degree_level: string;
  is_active: boolean;
}

export interface CurriculumDiff {
  batch_year_old: number;
  batch_year_new: number;
  program_id: number;
  added: DiffCourse[];
  removed: DiffCourse[];
  changed: DiffChange[];
}

export interface DiffCourse {
  id: number;
  course_code: string;
  course_name: string;
  credits: number;
  category: string;
  lecture_hours: number;
  tutorial_hours: number;
  practical_hours: number;
  description: string;
  department: string;
  program_id: number;
  program_name: string;
  semester: number;
  batch_year: number;
  source_url: string;
  is_active: boolean;
}

export interface DiffChange {
  course_code: string;
  semester: number;
  changes: Record<string, { old: string | number; new: string | number }>;
}

export interface CategoryBreakdown {
  category: string;
  count: number;
  total_credits: number;
}

export interface SemesterBreakdown {
  semester: number;
  total_courses: number;
  total_credits: number;
  categories: CategoryBreakdown[];
}

export interface AggregatedReport {
  program_name: string;
  program_code: string;
  total_courses: number;
  total_credits: number;
  semester_breakdown: SemesterBreakdown[];
}

export interface SourceInfo {
  batch_year: number;
  program_id: number;
  program_name: string;
  source_url: string;
}
