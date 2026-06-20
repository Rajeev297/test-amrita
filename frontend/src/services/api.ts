import type { Course } from "@/types";
import type {
  ProgramFull, CurriculumDiff, SemesterBreakdown,
  AggregatedReport,
} from "@/types/curriculum";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

interface RawCourse {
  id: number;
  course_code: string;
  course_name: string;
  credits: number;
  category: string;
  lecture_hours?: number;
  tutorial_hours?: number;
  practical_hours?: number;
  description?: string;
  department?: string;
  program_id: number;
  program_name?: string;
  semester: number;
  batch_year?: number;
  source_url?: string;
  is_active?: boolean;
}

interface RawSearchResult {
  query: string;
  results: RawCourse[];
  total: number;
  match_type: string;
}

interface RawChatResult {
  answer: string;
  courses: RawCourse[];
  sql_query: string;
  source: Record<string, unknown> | null;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }

  private async request<T>(path: string, options?: RequestInit): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      headers: { "Content-Type": "application/json", ...options?.headers },
      ...options,
    });
    if (!res.ok) throw new Error(`API error: ${res.status} ${res.statusText}`);
    return res.json();
  }

  async searchCourses(q: string, limit = 20): Promise<{ query: string; results: Course[]; total: number; match_type: string }> {
    const data = await this.request<RawSearchResult>(`/courses/search?q=${encodeURIComponent(q)}&limit=${limit}`);
    return { ...data, results: data.results.map(mapCourse) };
  }

  async getSemesterCourses(programId: number, semester: number, batchYear?: number): Promise<Course[]> {
    let path = `/courses/semester/${programId}/${semester}`;
    if (batchYear) path += `?batch_year=${batchYear}`;
    const data = await this.request<RawCourse[]>(path);
    return data.map(mapCourse);
  }

  async getTotalCredits(programId: number): Promise<Record<string, number>> {
    return this.request(`/courses/credits/${programId}`);
  }

  async getElectives(programId: number, semester: number): Promise<Course[]> {
    const data = await this.request<RawCourse[]>(`/courses/electives/${programId}/${semester}`);
    return data.map(mapCourse);
  }

  async getRelationships(courseCode: string, programId = 1): Promise<Record<string, string>[]> {
    return this.request(`/courses/relationships/${courseCode}?program_id=${programId}`);
  }

  async getCategoryBreakdown(programId: number, batchYear?: number): Promise<SemesterBreakdown[]> {
    let path = `/courses/breakdown/${programId}`;
    if (batchYear) path += `?batch_year=${batchYear}`;
    return this.request<SemesterBreakdown[]>(path);
  }

  async getCoreElectiveSplit(programId: number, semester?: number): Promise<Record<string, unknown>> {
    let path = `/courses/core-elective-split/${programId}`;
    if (semester) path += `?semester=${semester}`;
    return this.request(path);
  }

  async compareBatch(programId: number, batchYearOld: number, batchYearNew: number): Promise<CurriculumDiff> {
    return this.request<CurriculumDiff>(
      `/courses/compare?program_id=${programId}&batch_year_old=${batchYearOld}&batch_year_new=${batchYearNew}`
    );
  }

  async exportCurriculum(programId: number, batchYear?: number): Promise<Record<string, unknown>> {
    let path = `/courses/export/${programId}`;
    if (batchYear) path += `?batch_year=${batchYear}`;
    return this.request(path);
  }

  async getAggregated(): Promise<AggregatedReport[]> {
    return this.request<AggregatedReport[]>("/courses/aggregated");
  }

  async listPrograms(): Promise<ProgramFull[]> {
    return this.request<ProgramFull[]>("/programs");
  }

  async getProgram(programId: number): Promise<ProgramFull> {
    return this.request<ProgramFull>(`/programs/${programId}`);
  }

  async chatQuery(query: string): Promise<{ answer: string; courses: Course[]; sql_query: string; source: Record<string, unknown> | null }> {
    const data = await this.request<RawChatResult>("/chat", {
      method: "POST",
      body: JSON.stringify({ query }),
    });
    return { ...data, courses: data.courses.map(mapCourse) };
  }

  async login(username: string, password: string): Promise<{ access_token: string; role: string; name: string }> {
    return this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
  }

  async createCourse(data: Record<string, unknown>, token: string): Promise<Course> {
    const res = await this.request<RawCourse>("/courses", {
      method: "POST",
      body: JSON.stringify(data),
      headers: { Authorization: `Bearer ${token}` },
    });
    return mapCourse(res);
  }

  async updateCourse(id: number, data: Record<string, unknown>, token: string): Promise<Course> {
    const res = await this.request<RawCourse>(`/courses/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
      headers: { Authorization: `Bearer ${token}` },
    });
    return mapCourse(res);
  }

  async deleteCourse(id: number, token: string): Promise<void> {
    await this.request(`/courses/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
  }
}

function mapCourse(c: RawCourse): Course {
  return {
    id: String(c.id || c.course_code),
    code: c.course_code,
    title: c.course_name,
    credits: c.credits,
    category: c.category as Course["category"],
    lectureHours: c.lecture_hours ?? 0,
    tutorialHours: c.tutorial_hours ?? 0,
    practicalHours: c.practical_hours ?? 0,
    description: c.description || "",
    department: c.department || "",
    program: c.program_name || "",
    semester: c.semester,
    batchYear: c.batch_year,
    sourceUrl: c.source_url,
    isActive: c.is_active,
  };
}

export const apiClient = new ApiClient(API_BASE_URL);
