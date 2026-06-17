"use client";

import { useState, useMemo } from "react";
import { mockCoursesData, mockProgramsData } from "@/data/mockCourses";
import { SectionHeader } from "@/components/common/SectionHeader";
import { Button } from "@/components/common/Button";
import { CourseCategoryBadge } from "@/components/courses/CourseCategoryBadge";
import type { Course } from "@/types";

const emptyCourse: Omit<Course, "id"> = {
  code: "",
  title: "",
  lectureHours: 3,
  tutorialHours: 0,
  practicalHours: 0,
  credits: 3,
  description: "",
  department: "",
  program: "B.Tech Computer Science and Engineering",
  semester: 1,
  category: "Core",
};

type SortKey = "code" | "title" | "credits" | "semester" | "category";
type SortDir = "asc" | "desc";

function StatsCard({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

function formatLT(hours: number): string {
  return hours > 0 ? String(hours) : "\u2014";
}

export default function AdminPage() {
  const [courses, setCourses] = useState<Course[]>(mockCoursesData);
  const [filterProgram, setFilterProgram] = useState<string>("all");
  const [filterSemester, setFilterSemester] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [sortKey, setSortKey] = useState<SortKey>("code");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Course, "id">>(emptyCourse);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const programs = useMemo(() => mockProgramsData, []);

  const stats = useMemo(() => {
    const total = courses.length;
    const programCount = new Set(courses.map((c) => c.program)).size;
    const semesterCount = new Set(courses.map((c) => c.semester)).size;
    const coreCount = courses.filter((c) => c.category === "Core").length;
    const electiveCount = courses.filter((c) => c.category === "Elective").length;
    const labCount = courses.filter((c) => c.category === "Lab").length;
    const totalCredits = courses.reduce((s, c) => s + c.credits, 0);
    return { total, programCount, semesterCount, coreCount, electiveCount, labCount, totalCredits };
  }, [courses]);

  const filtered = useMemo(() => {
    let result = [...courses];
    if (filterProgram !== "all") {
      result = result.filter((c) => c.program === filterProgram);
    }
    if (filterSemester !== "all") {
      result = result.filter((c) => c.semester === Number(filterSemester));
    }
    if (filterCategory !== "all") {
      result = result.filter((c) => c.category === filterCategory);
    }
    result.sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (typeof aVal === "string") {
        return sortDir === "asc"
          ? aVal.localeCompare(String(bVal))
          : String(bVal).localeCompare(aVal);
      }
      return sortDir === "asc"
        ? Number(aVal) - Number(bVal)
        : Number(bVal) - Number(aVal);
    });
    return result;
  }, [courses, filterProgram, filterSemester, filterCategory, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        name === "lectureHours" ||
        name === "tutorialHours" ||
        name === "practicalHours" ||
        name === "credits" ||
        name === "semester"
          ? Number(value)
          : value,
    }));
  };

  const resetForm = () => {
    setForm(emptyCourse);
    setEditingId(null);
    setShowForm(false);
  };

  const openEdit = (course: Course) => {
    const { id: _omit, ...rest } = course;
    void _omit;
    setForm(rest);
    setEditingId(course.id);
    setShowForm(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code || !form.title) return;

    if (editingId) {
      setCourses((prev) =>
        prev.map((c) => (c.id === editingId ? { ...c, ...form } : c))
      );
    } else {
      const id = `manual-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      setCourses((prev) => [...prev, { id, ...form }]);
    }
    resetForm();
  };

  const handleDelete = (id: string) => {
    setCourses((prev) => prev.filter((c) => c.id !== id));
    setDeleteConfirm(null);
  };

  const handleCopy = (course: Course) => {
    const { id: _omit, ...rest } = course;
    void _omit;
    const newId = `manual-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setCourses((prev) => [...prev, { id: newId, ...rest, code: rest.code + "-copy" }]);
  };

  const semesterOptions = Array.from({ length: 8 }, (_, i) => i + 1);

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Admin Dashboard"
        subtitle="Manage courses, semesters, and curriculum data"
        action={
          <Button onClick={() => { resetForm(); setShowForm(true); }}>
            Add Course
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        <StatsCard label="Total Courses" value={stats.total} />
        <StatsCard label="Programs" value={stats.programCount} />
        <StatsCard label="Semesters" value={stats.semesterCount} />
        <StatsCard label="Total Credits" value={stats.totalCredits} />
        <StatsCard label="Core" value={stats.coreCount} />
        <StatsCard label="Elective" value={stats.electiveCount} />
        <StatsCard label="Lab" value={stats.labCount} />
        <StatsCard
          label="Avg Credits / Course"
          value={stats.total > 0 ? (stats.totalCredits / stats.total).toFixed(1) : 0}
        />
      </div>

      {/* Add / Edit Form */}
      {showForm && (
        <form
          onSubmit={handleSave}
          className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h2 className="text-lg font-semibold text-slate-900">
            {editingId ? "Edit Course" : "Add Course"}
          </h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label htmlFor="form-code" className="block text-xs font-medium text-slate-500">Code *</label>
              <input
                id="form-code"
                name="code"
                value={form.code}
                onChange={handleFormChange}
                required
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="form-title" className="block text-xs font-medium text-slate-500">Title *</label>
              <input
                id="form-title"
                name="title"
                value={form.title}
                onChange={handleFormChange}
                required
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
            <div>
              <label htmlFor="form-lectureHours" className="block text-xs font-medium text-slate-500">L</label>
              <input
                id="form-lectureHours"
                name="lectureHours"
                type="number"
                min={0}
                max={6}
                value={form.lectureHours}
                onChange={handleFormChange}
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
            <div>
              <label htmlFor="form-tutorialHours" className="block text-xs font-medium text-slate-500">T</label>
              <input
                id="form-tutorialHours"
                name="tutorialHours"
                type="number"
                min={0}
                max={6}
                value={form.tutorialHours}
                onChange={handleFormChange}
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
            <div>
              <label htmlFor="form-practicalHours" className="block text-xs font-medium text-slate-500">P</label>
              <input
                id="form-practicalHours"
                name="practicalHours"
                type="number"
                min={0}
                max={6}
                value={form.practicalHours}
                onChange={handleFormChange}
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
            <div>
              <label htmlFor="form-credits" className="block text-xs font-medium text-slate-500">Credits</label>
              <input
                id="form-credits"
                name="credits"
                type="number"
                min={0}
                max={10}
                value={form.credits}
                onChange={handleFormChange}
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
            <div>
              <label htmlFor="form-category" className="block text-xs font-medium text-slate-500">Category</label>
              <select
                id="form-category"
                name="category"
                value={form.category}
                onChange={handleFormChange}
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                <option value="Core">Core</option>
                <option value="Elective">Elective</option>
                <option value="Lab">Lab</option>
                <option value="Audit">Audit</option>
              </select>
            </div>
            <div>
              <label htmlFor="form-program" className="block text-xs font-medium text-slate-500">Program</label>
              <select
                id="form-program"
                name="program"
                value={form.program}
                onChange={handleFormChange}
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                {programs.map((p) => (
                  <option key={p.id} value={p.name}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="form-semester" className="block text-xs font-medium text-slate-500">Semester</label>
              <select
                id="form-semester"
                name="semester"
                value={form.semester}
                onChange={handleFormChange}
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                {semesterOptions.map((s) => (
                  <option key={s} value={s}>
                    Semester {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="form-department" className="block text-xs font-medium text-slate-500">Department</label>
              <input
                id="form-department"
                name="department"
                value={form.department}
                onChange={handleFormChange}
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="form-description" className="block text-xs font-medium text-slate-500">Description</label>
              <textarea
                id="form-description"
                name="description"
                value={form.description}
                onChange={handleFormChange}
                rows={2}
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
          </div>
          <div className="mt-5 flex gap-3">
            <Button type="submit">{editingId ? "Update" : "Save"}</Button>
            <Button variant="secondary" type="button" onClick={resetForm}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <label htmlFor="filter-program" className="text-xs font-medium text-slate-500">Program:</label>
        <select
          id="filter-program"
          value={filterProgram}
          onChange={(e) => setFilterProgram(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
        >
          <option value="all">All</option>
          {programs.map((p) => (
            <option key={p.id} value={p.name}>
              {p.code}
            </option>
          ))}
        </select>

        <label htmlFor="filter-semester" className="text-xs font-medium text-slate-500">Semester:</label>
        <select
          id="filter-semester"
          value={filterSemester}
          onChange={(e) => setFilterSemester(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
        >
          <option value="all">All</option>
          {semesterOptions.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <label htmlFor="filter-category" className="text-xs font-medium text-slate-500">Category:</label>
        <select
          id="filter-category"
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
        >
          <option value="all">All</option>
          <option value="Core">Core</option>
          <option value="Elective">Elective</option>
          <option value="Lab">Lab</option>
          <option value="Audit">Audit</option>
        </select>

        <span className="ml-auto text-xs text-slate-400">
          {filtered.length} course{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Course Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              {[
                { key: "code", label: "Code" },
                { key: "title", label: "Title" },
                { key: "credits", label: "Credits" },
                { key: "semester", label: "Sem" },
                { key: "category", label: "Category" },
              ].map(({ key, label }) => (
                <th
                  key={key}
                  scope="col"
                  className="cursor-pointer px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 hover:text-slate-700"
                  onClick={() => toggleSort(key as SortKey)}
                >
                  {label}
                  {sortKey === key && (
                    <span className="ml-1">{sortDir === "asc" ? "\u25B2" : "\u25BC"}</span>
                  )}
                </th>
              ))}
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((course) => (
              <tr key={course.id} className="hover:bg-slate-50/50">
                <td className="whitespace-nowrap px-4 py-3 font-mono text-xs font-medium text-slate-900">
                  {course.code}
                </td>
                <td className="max-w-[200px] truncate px-4 py-3 text-slate-700">
                  {course.title}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                  {course.credits}
                  <span className="ml-1 text-xs text-slate-400">
                    ({formatLT(course.lectureHours)}-{formatLT(course.tutorialHours)}-{formatLT(course.practicalHours)})
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                  {course.semester}
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <CourseCategoryBadge category={course.category} />
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => openEdit(course)}
                      className="text-xs font-medium text-brand-500 hover:text-brand-600"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteConfirm(course.id)}
                      className="text-xs font-medium text-red-500 hover:text-red-600"
                    >
                      Delete
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCopy(course)}
                      className="text-xs font-medium text-slate-400 hover:text-slate-600"
                    >
                      Duplicate
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="py-12 text-center text-sm text-slate-400">
            No courses match the current filters.
          </div>
        )}
      </div>

      {/* Delete confirmation */}
      {deleteConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Delete course confirmation"
        >
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-900">Delete Course?</h3>
            <p className="mt-2 text-sm text-slate-500">
              This action cannot be undone. Changes are in-memory and will reset on page reload.
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deleteConfirm)}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
