import { http, request } from "./http";
export function getStats() {
    return request(http.get("/stats"));
}
export function getOverview() {
    return request(http.get("/stats/overview"));
}
export function getCategories() {
    return request(http.get("/stats/categories"));
}
export function getWrongQuestions() {
    return request(http.get("/stats/wrong-questions"));
}
export function getSessions() {
    return request(http.get("/stats/sessions"));
}
export function getTrends() {
    return request(http.get("/stats/trends"));
}
export function startSession(mode = "normal") {
    return request(http.post("/stats/sessions/start", { mode }));
}
export function endSession() {
    return request(http.post("/stats/sessions/end"));
}
export function resetStats() {
    return request(http.post("/stats/reset"));
}
export function getAdvisor() {
    return request(http.get("/stats/advisor"));
}
export function updateViewHistory(view, currentIndex) {
    return request(http.post("/stats/view-history", { view, currentIndex }));
}
export function getTimeline(params = {}) {
    return request(http.get("/stats/timeline", { params }));
}
export function getBankProgress() {
    return request(http.get("/stats/bank-progress"));
}
export function getTagProgress() {
    return request(http.get("/stats/tag-progress"));
}
export function getMastery() {
    return request(http.get("/stats/mastery"));
}
