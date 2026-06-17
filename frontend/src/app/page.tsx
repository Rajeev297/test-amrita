"use client";

import { useState, useCallback } from "react";
import { HeroSection } from "@/components/home/HeroSection";
import { SearchBar } from "@/components/home/SearchBar";
import { SuggestedSearches } from "@/components/home/SuggestedSearches";
import { CoursePreviewGrid } from "@/components/home/CoursePreviewGrid";
import { searchCourses } from "@/services/searchService";
import { getCoursesBySemester } from "@/services/courseService";
import { mockCoursesData } from "@/data/mockCourses";
import type { Course } from "@/types";

interface SummaryData {
  type: "info" | "credits";
  message: string;
}

type SearchIntent =
  | { type: "semester"; programId: string; semester: number }
  | { type: "credits"; programId: string }
  | { type: "search" };

function parseIntent(q: string): SearchIntent {
  const trimmed = q.toLowerCase().trim();

  const semMatch = trimmed.match(/sem(?:ester)?\s+(\d+)/i);
  if (semMatch) {
    const semester = parseInt(semMatch[1], 10);
    const programId = /\bece\b/i.test(trimmed) ? "ece" : "cse";
    return { type: "semester", programId, semester };
  }

  if (trimmed.includes("credit") || trimmed.includes("graduate")) {
    const programId = /\bece\b/i.test(trimmed) ? "ece" : "cse";
    return { type: "credits", programId };
  }

  return { type: "search" };
}

async function searchOrRoute(
  query: string
): Promise<{ courses: Course[]; summary?: SummaryData }> {
  const intent = parseIntent(query);

  switch (intent.type) {
    case "semester": {
      const courses = await getCoursesBySemester(intent.programId, intent.semester);
      const programLabel = intent.programId === "cse" ? "CSE" : "ECE";
      if (courses.length === 0) {
        return {
          courses: [],
          summary: {
            type: "info",
            message: `No courses found for Semester ${intent.semester} (${programLabel}). Try a different semester or program.`,
          },
        };
      }
      return {
        courses,
        summary: {
          type: "info",
          message: `Showing ${courses.length} course${courses.length === 1 ? "" : "s"} for Semester ${intent.semester} (${programLabel}).`,
        },
      };
    }
    case "credits": {
      const programId = intent.programId;
      const allCourses: Course[] = [];
      for (let sem = 1; sem <= 8; sem++) {
        const semCourses = await getCoursesBySemester(programId, sem);
        if (semCourses.length === 0) break;
        allCourses.push(...semCourses);
      }
      const total = allCourses.reduce((sum, c) => sum + c.credits, 0);
      const programName =
        programId === "cse"
          ? "B.Tech Computer Science and Engineering"
          : "B.Tech Electronics and Communication";
      return {
        courses: allCourses,
        summary: {
          type: "credits",
          message: `Total credits for ${programName}: ${total} (across ${allCourses.length} courses, semesters 1\u20134).`,
        },
      };
    }
    default: {
      const courses = await searchCourses(query);
      return { courses };
    }
  }
}

export default function HomePage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Course[]>(
    mockCoursesData.slice(0, 6)
  );
  const [hasSearched, setHasSearched] = useState(false);
  const [summary, setSummary] = useState<SummaryData | undefined>(undefined);

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;
    const { courses, summary: sum } = await searchOrRoute(query);
    setResults(courses);
    setSummary(sum);
    setHasSearched(true);
  }, [query]);

  const handleSelect = useCallback(async (value: string) => {
    setQuery(value);
    const { courses, summary: sum } = await searchOrRoute(value);
    setResults(courses);
    setSummary(sum);
    setHasSearched(true);
  }, []);

  return (
    <div className="bg-slate-50">
      <HeroSection>
        <div className="space-y-5">
          <SearchBar
            value={query}
            onChange={setQuery}
            onSubmit={handleSearch}
          />
          <SuggestedSearches onSelect={handleSelect} />
        </div>
      </HeroSection>
      <CoursePreviewGrid
        courses={results}
        hasSearched={hasSearched}
        searchTerm={query}
        summary={summary}
      />
    </div>
  );
}
