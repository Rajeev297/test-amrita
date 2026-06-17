export function SearchSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-slate-200 bg-white p-6 shadow-card"
        >
          <div className="mb-3 h-4 w-20 rounded bg-slate-200" />
          <div className="mb-3 h-5 w-3/4 rounded bg-slate-200" />
          <div className="flex gap-6">
            <div className="h-4 w-16 rounded bg-slate-200" />
            <div className="h-4 w-24 rounded bg-slate-200" />
            <div className="h-4 w-40 rounded bg-slate-200" />
          </div>
        </div>
      ))}
    </div>
  );
}
