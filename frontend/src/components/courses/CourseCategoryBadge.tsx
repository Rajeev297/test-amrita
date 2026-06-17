import { cn } from "@/lib/utils";
import type { CourseCategory } from "@/types";

interface CourseCategoryBadgeProps {
  category: CourseCategory;
}

const categoryStyles: Record<CourseCategory, string> = {
  Core: "bg-brand-50 text-brand-600",
  Elective: "bg-purple-50 text-purple-700",
  Lab: "bg-emerald-50 text-emerald-700",
  Audit: "bg-slate-100 text-slate-600",
};

export function CourseCategoryBadge({ category }: CourseCategoryBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        categoryStyles[category]
      )}
    >
      {category}
    </span>
  );
}
