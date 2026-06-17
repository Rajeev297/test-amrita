import type { Course } from "@/types";
import { CourseCategoryBadge } from "./CourseCategoryBadge";

interface CourseTableProps {
  courses: Course[];
}

export function CourseTable({ courses }: CourseTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
              Code
            </th>
            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
              Course Name
            </th>
            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
              L-T-P
            </th>
            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
              Credits
            </th>
            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
              Category
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {courses.map((course) => (
            <tr key={course.id} className="transition-colors hover:bg-slate-50">
              <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-slate-900">
                {course.code}
              </td>
              <td className="px-6 py-4 text-sm text-slate-600">
                {course.title}
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                {course.lectureHours}-{course.tutorialHours}-
                {course.practicalHours}
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                {course.credits}
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm">
                <CourseCategoryBadge category={course.category} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
