import { http, request } from "./http";

export function getStreak() {
  return request<Record<string, unknown>>(http.get("/streak"));
}

export function updateDailyGoal(dailyGoal: number) {
  return request<Record<string, unknown>>(http.patch("/streak/goal", { dailyGoal }));
}
