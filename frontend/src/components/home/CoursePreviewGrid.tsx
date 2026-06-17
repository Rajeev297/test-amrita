"use client";

import Link from "next/link";
import type { Course } from "@/types";
import { CourseCategoryBadge } from "@/components/courses/CourseCategoryBadge";
import { cn } from "@/lib/utils";

interface SummaryData {
  type: "info" | "credits";
  message: string;
}

interface CoursePreviewGridProps {
  courses: Course[];
  hasSearched: boolean;
  searchTerm: string;
  summary?: SummaryData;
}

export function CoursePreviewGrid({
  courses,
  hasSearched,
  searchTerm,
  summary,
}: CoursePreviewGridProps) {
  if (!hasSearched && courses.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            {hasSearched ? "Search Results" : "Explore Courses"}
          </h2>
          {hasSearched && (
            <p className="mt-1 text-sm text-slate-500">
              {courses.length}{" "}
              {courses.length === 1 ? "course" : "courses"} found for
              &ldquo;{searchTerm}&rdquo;
            </p>
          )}
          {!hasSearched && (
            <p className="mt-1 text-sm text-slate-500">
              Browse our curriculum catalog
            </p>
          )}
        </div>
        {hasSearched && (
          <Link
            href="/courses"
            className="text-sm font-medium text-brand-500 hover:text-brand-600"
          >
            View all courses &rarr;
          </Link>
        )}
      </div>

      {summary && (
        <div
          className={cn(
            "mb-6 rounded-xl border px-4 py-3 text-sm",
            summary.type === "credits" &&
              "border-brand-200 bg-brand-50 text-brand-800",
            summary.type === "info" &&
              "border-slate-200 bg-slate-50 text-slate-600"
          )}
        >
          {summary.message}
        </div>
      )}

      {courses.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white py-16 text-center">
          <p className="text-slate-500">
            No courses found for &ldquo;{searchTerm}&rdquo;.
          </p>
          <p className="mt-1 text-sm text-slate-400">
            Try a different search term or browse all courses.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <div
              key={course.id}
              className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-xs font-medium text-brand-500">
                    {course.code}
                  </p>
                  <p className="mt-0.5 truncate text-sm font-semibold text-slate-900">
                    {course.title}
                  </p>
                </div>
                <CourseCategoryBadge category={course.category} />
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                <span>
                  L-T-P: {course.lectureHours}-{course.tutorialHours}-
                  {course.practicalHours}
                </span>
                <span className="font-medium text-slate-700">
                  {course.credits} {course.credits === 1 ? "credit" : "credits"}
                </span>
                <span>Sem {course.semester}</span>
              </div>
              {course.description && (
                <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-400">
                  {course.description}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {!hasSearched && (
        <div className="mt-8 text-center">
          <Link
            href="/courses"
            className="inline-flex items-center gap-1 text-sm font-medium text-brand-500 hover:text-brand-600"
          >
            View all courses &rarr;
          </Link>
        </div>
      )}
    </section>
  );
}
