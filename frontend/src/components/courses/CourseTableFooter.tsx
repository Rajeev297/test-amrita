interface CourseTableFooterProps {
  totalCredits: number;
  courseCount: number;
}

export function CourseTableFooter({
  totalCredits,
  courseCount,
}: CourseTableFooterProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-6 py-4">
      <p className="text-sm text-slate-600">
        <span className="font-semibold text-slate-900">{courseCount}</span>{" "}
        {courseCount === 1 ? "course" : "courses"} —{" "}
        <span className="font-semibold text-slate-900">{totalCredits}</span>{" "}
        total credits
      </p>
    </div>
  );
}
