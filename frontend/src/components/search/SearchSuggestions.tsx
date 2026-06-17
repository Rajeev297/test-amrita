"use client";

interface SearchSuggestionsProps {
  suggestions: string[];
  onSelect: (suggestion: string) => void;
}

export function SearchSuggestions({
  suggestions,
  onSelect,
}: SearchSuggestionsProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="mb-3 text-sm font-medium text-slate-700">Did you mean?</p>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            onClick={() => onSelect(suggestion)}
            className="rounded-full border border-brand-100 bg-brand-50 px-4 py-1.5 text-sm text-brand-600 transition-colors hover:bg-brand-100"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}
