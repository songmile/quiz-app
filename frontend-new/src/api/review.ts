import { http, request } from "./http";

export function getDueQuestions(params: { bankId?: string; tags?: string; limit?: number } = {}) {
  return request<Array<Record<string, unknown>>>(http.get("/review/due", { params }));
}

export function getDueCount() {
  return request<{ dueCount: number }>(http.get("/review/due-count"));
}

export function getReviewStats() {
  return request<Record<string, unknown>>(http.get("/review/stats"));
}

export function startReview(payload: { bankId?: string; tags?: string } = {}) {
  return request<Record<string, unknown>>(http.post("/review/start", payload));
}
