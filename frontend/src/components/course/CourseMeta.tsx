import type { Course } from "@/types";
import { CourseCategoryBadge } from "@/components/courses/CourseCategoryBadge";

interface CourseMetaProps {
  course: Pick<
    Course,
    | "lectureHours"
    | "tutorialHours"
    | "practicalHours"
    | "credits"
    | "category"
  >;
}

export function CourseMeta({ course }: CourseMetaProps) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
      <span>
        L-T-P: {course.lectureHours}-{course.tutorialHours}-
        {course.practicalHours}
      </span>
      <span className="font-medium text-slate-700">
        {course.credits} {course.credits === 1 ? "credit" : "credits"}
      </span>
      <CourseCategoryBadge category={course.category} />
    </div>
  );
}
