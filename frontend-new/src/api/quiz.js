import { http, request } from "./http";
export function startQuiz(payload = {}) {
    return request(http.post("/quiz/start", payload));
}
export function startReviewQuiz() {
    return request(http.post("/quiz/review"));
}
export function getCurrentQuestion(index = 0, mode = "normal") {
    return request(http.get("/quiz/current", { params: { index, mode } }));
}
export function submitAnswer(payload) {
    return request(http.post("/quiz/submit", payload));
}
export function nextQuestion(currentIndex, mode = "normal") {
    return request(http.get("/quiz/next", { params: { currentIndex, mode } }));
}
export function previousQuestion(currentIndex, mode = "normal") {
    return request(http.get("/quiz/previous", { params: { currentIndex, mode } }));
}
export function getAnswers(params = {}) {
    return request(http.get("/quiz/answers", { params }));
}
export function getQuestionAnswers(questionId) {
    return request(http.get(`/quiz/answers/${questionId}`));
}
export function resetQuiz() {
    return request(http.post("/quiz/reset"));
}
export function getNavigator(params = {}) {
    return request(http.get("/quiz/navigator", { params }));
}
export function jumpTo(index, mode = "normal") {
    return request(http.post(`/quiz/jump/${index}`, { mode }));
}
