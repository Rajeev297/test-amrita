export function CourseTableSkeleton() {
  return (
    <div className="animate-pulse space-y-3">
      <div className="h-10 w-full rounded-lg bg-slate-200" />
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-12 w-full rounded-lg bg-slate-100" />
      ))}
    </div>
  );
}
