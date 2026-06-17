"use client";

const suggestions = [
  "Data Structures",
  "Semester 1",
  "Core Courses",
  "Credits",
  "Electives",
  "Computer Science",
];

interface SuggestedSearchesProps {
  onSelect: (value: string) => void;
}

export function SuggestedSearches({ onSelect }: SuggestedSearchesProps) {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-wrap justify-center gap-2">
      {suggestions.map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onSelect(s)}
          className="rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm text-white/80 backdrop-blur transition-all hover:bg-white/20 hover:text-white"
        >
          {s}
        </button>
      ))}
    </div>
  );
}
