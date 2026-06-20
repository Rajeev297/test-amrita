"use client";

import type { Course } from "@/types";
import type { SourceInfo } from "@/types/curriculum";
import { CourseCategoryBadge } from "@/components/courses/CourseCategoryBadge";
import { SourceLabel } from "@/components/source/SourceLabel";
import { cn } from "@/lib/utils";

export interface SummaryData {
  type: "credits" | "compare" | "info";
  message: string;
}

export interface ChatMessageData {
  id: string;
  role: "user" | "assistant";
  text: string;
  courses?: Course[];
  summary?: SummaryData;
  source?: SourceInfo;
}

interface ChatMessageProps {
  message: ChatMessageData;
}

function UserBubble({ text }: { text: string }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[75%] rounded-2xl bg-brand-500 px-4 py-2.5 text-sm text-white">
        {text}
      </div>
    </div>
  );
}

function CourseCompactView({ courses }: { courses: Course[] }) {
  if (courses.length === 1) {
    const c = courses[0];
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
        <p className="font-medium text-slate-900">
          {c.code} &mdash; {c.title}
        </p>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
          <span>
            L-T-P: {c.lectureHours}-{c.tutorialHours}-{c.practicalHours}
          </span>
          <span className="font-medium text-slate-700">
            {c.credits} {c.credits === 1 ? "credit" : "credits"}
          </span>
          <span>Sem {c.semester}</span>
          <CourseCategoryBadge category={c.category} />
        </div>
        {c.description && (
          <p className="mt-1.5 text-xs leading-relaxed text-slate-500">
            {c.description}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white shadow-sm">
      {courses.map((c) => (
        <div key={c.id} className="flex items-center justify-between px-3 py-2.5 first:pt-2.5 last:pb-2.5">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-slate-900">
              {c.code} &mdash; {c.title}
            </p>
            <p className="mt-0.5 text-xs text-slate-500">
              {c.credits} credits &middot; Sem {c.semester} &middot; L-T-P: {c.lectureHours}-{c.tutorialHours}-{c.practicalHours}
            </p>
          </div>
          <div className="ml-3 shrink-0">
            <CourseCategoryBadge category={c.category} />
          </div>
        </div>
      ))}
    </div>
  );
}

function SummaryBanner({ summary }: { summary: SummaryData }) {
  return (
    <div
      className={cn(
        "rounded-xl border px-4 py-3 text-sm",
        summary.type === "credits" &&
          "border-brand-200 bg-brand-50 text-brand-800",
        summary.type === "compare" &&
          "border-purple-200 bg-purple-50 text-purple-800",
        summary.type === "info" &&
          "border-slate-200 bg-slate-50 text-slate-600"
      )}
    >
      {summary.message}
    </div>
  );
}

function AssistantMessage({
  text,
  courses,
  summary,
  source,
}: {
  text: string;
  courses?: Course[];
  summary?: SummaryData;
  source?: SourceInfo;
}) {
  return (
    <div className="flex justify-start">
      <div className="max-w-[80%] space-y-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-600">
            AI
          </span>
          <span className="text-xs font-medium text-slate-400">Assistant</span>
        </div>

        <div className="rounded-2xl bg-white px-4 py-3 text-sm text-slate-700 shadow-sm ring-1 ring-slate-200/50">
          {text && <p className="whitespace-pre-wrap">{text}</p>}

          {summary && (
            <div className={cn(text && "mt-3")}>
              <SummaryBanner summary={summary} />
            </div>
          )}

          {courses && courses.length > 0 && (
            <div className={cn((text || summary) && "mt-3")}>
              <CourseCompactView courses={courses} />
            </div>
          )}

          {courses && courses.length === 0 && !summary && (
            <p className="mt-2 text-xs text-slate-400">
              No courses matched your query. Try a different search term.
            </p>
          )}

          {source && (
            <div className={cn("mt-2", (text || summary || (courses && courses.length > 0)) && "border-t border-slate-100 pt-2")}>
              <SourceLabel source={source} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function ChatMessage({ message }: ChatMessageProps) {
  if (message.role === "user") {
    return <UserBubble text={message.text} />;
  }

  return (
    <AssistantMessage
      text={message.text}
      courses={message.courses}
      summary={message.summary}
      source={message.source}
    />
  );
}

export function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="max-w-[80%] space-y-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-600">
            AI
          </span>
          <span className="text-xs font-medium text-slate-400">Assistant</span>
        </div>

        <div className="rounded-2xl bg-white px-5 py-4 shadow-sm ring-1 ring-slate-200/50">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 animate-bounce rounded-full bg-slate-300 [animation-delay:0ms]" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-slate-300 [animation-delay:150ms]" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-slate-300 [animation-delay:300ms]" />
          </div>
        </div>
      </div>
    </div>
  );
}
