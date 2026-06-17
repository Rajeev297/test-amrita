import type { Course } from "@/types";
import { SearchResultCard } from "./SearchResultCard";

interface SearchResultsProps {
  results: Course[];
  query: string;
}

export function SearchResults({ results, query }: SearchResultsProps) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-500">
        Found {results.length} {results.length === 1 ? "result" : "results"} for
        &ldquo;{query}&rdquo;
      </p>
      <div className="grid gap-4 md:grid-cols-2">
        {results.map((course) => (
          <SearchResultCard key={course.id} course={course} />
        ))}
      </div>
    </div>
  );
}
