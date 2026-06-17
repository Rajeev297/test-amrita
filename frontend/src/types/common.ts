export type Status = "idle" | "loading" | "success" | "error";

export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: Status;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
}
