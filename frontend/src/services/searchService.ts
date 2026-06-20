import { mockCoursesData } from "@/data/mockCourses";
import type { Course } from "@/types";

export async function searchCourses(rawQuery: string): Promise<Course[]> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const q = rawQuery.toLowerCase().trim();
  if (!q) return [];

  const codePattern = /\b[a-z]{1,3}\d{1,4}[a-z]?\d?\b/g;
  const codeMatches = q.match(codePattern);

  if (codeMatches) {
    const byCode = mockCoursesData.filter((course) =>
      codeMatches.some((m) => course.code.toLowerCase() === m)
    );
    if (byCode.length > 0) return byCode;
  }

  return mockCoursesData.filter((course) => {
    const code = course.code.toLowerCase();
    const title = course.title.toLowerCase();
    const cat = course.category.toLowerCase();

    if (code.includes(q) || title.includes(q)) return true;
    if (cat.includes(q) || q.includes(cat)) return true;

    const words = q.split(/\s+/).filter((w) => w.length >= 3);
    if (words.some((w) => code.includes(w) || title.includes(w))) return true;

    return false;
  });
}

function calculateSimilarity(a: string, b: string): number {
  const aLower = a.toLowerCase();
  const bLower = b.toLowerCase();

  if (aLower === bLower) return 1;

  const bigrams = (s: string): Map<string, number> => {
    const map = new Map<string, number>();
    for (let i = 0; i < s.length - 1; i++) {
      const bg = s.substring(i, i + 2);
      map.set(bg, (map.get(bg) || 0) + 1);
    }
    return map;
  };

  if (aLower.length < 2 || bLower.length < 2) return 0;

  const aBigrams = bigrams(aLower);
  const bBigrams = bigrams(bLower);

  let intersection = 0;
  for (const [bg, count] of aBigrams) {
    intersection += Math.min(count, bBigrams.get(bg) || 0);
  }

  return (2 * intersection) / (aLower.length - 1 + bLower.length - 1);
}

export async function getSuggestions(query: string): Promise<string[]> {
  await new Promise((resolve) => setTimeout(resolve, 150));

  const q = query.toLowerCase().trim();
  if (!q || q.length < 3) return [];

  const seen = new Set<string>();
  const scored: { title: string; score: number }[] = [];

  for (const course of mockCoursesData) {
    if (seen.has(course.title)) continue;
    seen.add(course.title);

    const sim = calculateSimilarity(q, course.title);
    if (sim > 0.3) {
      scored.push({ title: course.title, score: sim });
    }
  }

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((s) => s.title);
}
