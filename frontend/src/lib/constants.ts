export const ROUTES = {
  home: "/",
  courses: "/courses",
  search: "/search",
  chat: "/chat",
  compare: "/compare",
  admin: "/admin",
} as const;

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export const PAGINATION = {
  defaultLimit: 20,
  maxLimit: 100,
} as const;
