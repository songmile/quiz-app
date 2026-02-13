import { http, request } from "./http";
export function getDueQuestions(params = {}) {
    return request(http.get("/review/due", { params }));
}
export function getDueCount() {
    return request(http.get("/review/due-count"));
}
export function getReviewStats() {
    return request(http.get("/review/stats"));
}
export function startReview(payload = {}) {
    return request(http.post("/review/start", payload));
}
