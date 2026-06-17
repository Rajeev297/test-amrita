"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ChatMessage, TypingIndicator } from "@/components/chat/ChatMessage";
import type { ChatMessageData, SummaryData } from "@/components/chat/ChatMessage";
import { searchCourses } from "@/services/searchService";
import { getCoursesBySemester } from "@/services/courseService";
import type { Course } from "@/types";

type SearchIntent =
  | { type: "semester"; programId: string; semester: number }
  | { type: "credits"; programId: string }
  | { type: "compare" }
  | { type: "search" };

function parseIntent(q: string): SearchIntent {
  const trimmed = q.toLowerCase().trim();

  const semMatch = trimmed.match(/sem(?:ester)?\s+(\d+)/i);
  if (semMatch) {
    const semester = parseInt(semMatch[1], 10);
    const programId = /\bece\b/i.test(trimmed) ? "ece" : "cse";
    return { type: "semester", programId, semester };
  }

  if (trimmed.includes("credit") || trimmed.includes("graduate")) {
    const programId = /\bece\b/i.test(trimmed) ? "ece" : "cse";
    return { type: "credits", programId };
  }

  if (trimmed.includes("compare") || (trimmed.includes("cse") && trimmed.includes("ece"))) {
    return { type: "compare" };
  }

  return { type: "search" };
}

async function executeIntent(
  intent: SearchIntent,
  rawQuery: string
): Promise<{ courses: Course[]; summary?: SummaryData }> {
  switch (intent.type) {
    case "semester": {
      const courses = await getCoursesBySemester(intent.programId, intent.semester);
      return { courses };
    }
    case "credits": {
      const programId = intent.programId;
      const allCourses: Course[] = [];
      for (let sem = 1; sem <= 8; sem++) {
        const semCourses = await getCoursesBySemester(programId, sem);
        if (semCourses.length === 0) break;
        allCourses.push(...semCourses);
      }
      const total = allCourses.reduce((sum, c) => sum + c.credits, 0);
      const programName =
        programId === "cse"
          ? "B.Tech Computer Science and Engineering"
          : "B.Tech Electronics and Communication";
      return {
        courses: allCourses,
        summary: {
          type: "credits",
          message: `Total credits for ${programName}: ${total} (across ${allCourses.length} courses found). Data available for semesters 1\u20134.`,
        },
      };
    }
    case "compare": {
      const [cse, ece] = await Promise.all([
        getCoursesBySemester("cse", 1),
        getCoursesBySemester("ece", 1),
      ]);
      const combined = [...cse, ...ece];
      return {
        courses: combined,
        summary: {
          type: "compare",
          message: `Comparing CSE vs ECE \u2014 Semester 1 (${cse.length} CSE courses, ${ece.length} ECE courses).`,
        },
      };
    }
    default: {
      const courses = await searchCourses(rawQuery);
      if (courses.length === 0) {
        return { courses: [], summary: { type: "info", message: `No results found for "${rawQuery}".` } };
      }
      return { courses };
    }
  }
}

function generateResponseText(
  intent: SearchIntent,
  courses: Course[],
  summary?: SummaryData
): string {
  if (summary) return "";

  if (courses.length === 0) return "No courses matched your query.";

  if (intent.type === "semester") {
    const programLabel = intent.programId === "cse" ? "CSE" : "ECE";
    return `Here are the Semester ${intent.semester} courses for ${programLabel}:`;
  }

  if (courses.length === 1) {
    const c = courses[0];
    return `${c.code}: ${c.title} \u2014 ${c.credits} credits, Semester ${c.semester}, ${c.category}.`;
  }

  return `Found ${courses.length} matching courses:`;
}

let messageIdCounter = 0;
function nextId(): string {
  messageIdCounter += 1;
  return `msg-${messageIdCounter}`;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessageData[]>([
    {
      id: nextId(),
      role: "assistant",
      text: "Hello! I\u2019m your curriculum assistant. Ask me about courses, credits, electives, or semester details.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || isTyping) return;

    setInput("");

    const userMessage: ChatMessageData = {
      id: nextId(),
      role: "user",
      text,
    };
    setMessages((prev) => [...prev, userMessage]);

    setIsTyping(true);

    try {
      const intent = parseIntent(text);
      const { courses, summary } = await executeIntent(intent, text);
      const responseText = generateResponseText(intent, courses, summary);

      const assistantMessage: ChatMessageData = {
        id: nextId(),
        role: "assistant",
        text: responseText,
        courses,
        summary,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      const errorMessage: ChatMessageData = {
        id: nextId(),
        role: "assistant",
        text: "Sorry, something went wrong. Please try again.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  }, [input, isTyping]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      className="mx-auto flex max-w-3xl flex-col"
      style={{ height: "calc(100dvh - 4rem - 5rem)" }}
    >
      <div className="shrink-0 pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Chat
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Ask questions about courses, credits, and curriculum
        </p>
      </div>

      <div
        ref={listRef}
        role="log"
        aria-live="polite"
        className="flex-1 space-y-4 overflow-y-auto pb-4"
      >
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        {isTyping && <TypingIndicator />}
      </div>

      <div className="shrink-0 border-t border-slate-200 bg-slate-50 pb-safe pt-4">
        <div className="flex items-end gap-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about courses..."
            aria-label="Type your message"
            rows={1}
            className="min-h-[44px] flex-1 resize-none rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-xl bg-brand-500 text-white transition-colors hover:bg-brand-600 disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Send"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
              />
            </svg>
          </button>
        </div>
        <p className="mt-1.5 text-xs text-slate-400">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
