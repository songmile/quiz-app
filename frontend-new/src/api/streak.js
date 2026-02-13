import { http, request } from "./http";
export function getStreak() {
    return request(http.get("/streak"));
}
export function updateDailyGoal(dailyGoal) {
    return request(http.patch("/streak/goal", { dailyGoal }));
}
