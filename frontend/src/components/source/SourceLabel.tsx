import type { SourceInfo } from "@/types/curriculum";

interface SourceLabelProps {
  source: SourceInfo | null;
  className?: string;
}

export function SourceLabel({ source, className = "" }: SourceLabelProps) {
  if (!source) return null;

  return (
    <div className={`flex items-center gap-1.5 text-xs text-slate-400 ${className}`}>
      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <span>
        Source: {source.program_name} ({source.batch_year})
      </span>
      {source.source_url && (
        <a
          href={source.source_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-brand-500 hover:text-brand-600 underline"
        >
          Official Document
        </a>
      )}
    </div>
  );
}
