"use client";

import { useState, useEffect } from "react";
import { SectionHeader, EmptyState } from "@/components/common";
import { SearchBar } from "@/components/search/SearchBar";
import { SearchResults } from "@/components/search/SearchResults";
import { SearchSuggestions } from "@/components/search/SearchSuggestions";
import { SearchSkeleton } from "@/components/search/SearchSkeleton";
import { searchCourses, getSuggestions } from "@/services/searchService";
import { useDebounce } from "@/hooks/useDebounce";
import type { Course } from "@/types";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Course[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) {
      setResults([]);
      setSuggestions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    searchCourses(debouncedQuery)
      .then((data) => {
        setResults(data);

        if (data.length === 0) {
          getSuggestions(debouncedQuery).then((sugs) => {
            setSuggestions(sugs);
          });
        } else {
          setSuggestions([]);
        }
      })
      .catch(() => {
        setResults([]);
        setSuggestions([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [debouncedQuery]);

  const hasSearched = debouncedQuery.length >= 2;

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Search Courses"
        subtitle="Search by course code or name"
      />

      <SearchBar value={query} onChange={setQuery} />

      {loading ? (
        <SearchSkeleton />
      ) : hasSearched && results.length === 0 && suggestions.length > 0 ? (
        <>
          <SearchSuggestions
            suggestions={suggestions}
            onSelect={setQuery}
          />
          <EmptyState
            title="No courses found"
            message={`No results for "${debouncedQuery}". Try one of the suggestions above.`}
          />
        </>
      ) : hasSearched && results.length === 0 ? (
        <EmptyState
          title="No courses found"
          message={`No results for "${debouncedQuery}". Try a different search term.`}
        />
      ) : hasSearched ? (
        <SearchResults results={results} query={debouncedQuery} />
      ) : null}
    </div>
  );
}
