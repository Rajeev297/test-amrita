import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCredits(credits: number): string {
  return `${credits} ${credits === 1 ? "credit" : "credits"}`;
}

export function formatCourseCode(code: string): string {
  return code.toUpperCase();
}
