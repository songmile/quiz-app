import { http, request } from "./http";

export function getStats() {
  return request<Record<string, unknown>>(http.get("/stats"));
}

export function getOverview() {
  return request<Record<string, unknown>>(http.get("/stats/overview"));
}

export function getCategories() {
  return request<Record<string, unknown>>(http.get("/stats/categories"));
}

export function getWrongQuestions() {
  return request<Record<string, unknown>>(http.get("/stats/wrong-questions"));
}

export function getSessions() {
  return request<Array<Record<string, unknown>>>(http.get("/stats/sessions"));
}

export function getTrends() {
  return request<Record<string, unknown>>(http.get("/stats/trends"));
}

export function startSession(mode = "normal") {
  return request<Record<string, unknown>>(http.post("/stats/sessions/start", { mode }));
}

export function endSession() {
  return request<Record<string, unknown>>(http.post("/stats/sessions/end"));
}

export function resetStats() {
  return request<void>(http.post("/stats/reset"));
}

export function getAdvisor() {
  return request<Record<string, unknown>>(http.get("/stats/advisor"));
}

export function updateViewHistory(view: string, currentIndex: number) {
  return request<void>(http.post("/stats/view-history", { view, currentIndex }));
}

export function getTimeline(params: Record<string, unknown> = {}) {
  return request<Record<string, unknown>>(http.get("/stats/timeline", { params }));
}

export function getBankProgress() {
  return request<Array<Record<string, unknown>>>(http.get("/stats/bank-progress"));
}

export function getTagProgress() {
  return request<Array<Record<string, unknown>>>(http.get("/stats/tag-progress"));
}

export function getMastery() {
  return request<Record<string, unknown>>(http.get("/stats/mastery"));
}
