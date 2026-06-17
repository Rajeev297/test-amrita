import type { Course } from "@/types";
import { Card } from "@/components/common";
import { CourseMeta } from "@/components/course/CourseMeta";

interface CourseCardMobileProps {
  course: Course;
}

export function CourseCardMobile({ course }: CourseCardMobileProps) {
  return (
    <Card className="space-y-3">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {course.code}
        </p>
        <p className="mt-0.5 text-base font-semibold text-slate-900">
          {course.title}
        </p>
      </div>
      <CourseMeta course={course} />
    </Card>
  );
}
