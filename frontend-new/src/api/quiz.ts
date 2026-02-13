import { http, request } from "./http";

export function startQuiz(payload: Record<string, unknown> = {}) {
  return request<Record<string, unknown>>(http.post("/quiz/start", payload));
}

export function startReviewQuiz() {
  return request<Record<string, unknown>>(http.post("/quiz/review"));
}

export function getCurrentQuestion(index = 0, mode = "normal") {
  return request<Record<string, unknown>>(http.get("/quiz/current", { params: { index, mode } }));
}

export function submitAnswer(payload: { questionId: string; userAnswer: string; mode?: string }) {
  return request<Record<string, unknown>>(http.post("/quiz/submit", payload));
}

export function nextQuestion(currentIndex: number, mode = "normal") {
  return request<Record<string, unknown>>(http.get("/quiz/next", { params: { currentIndex, mode } }));
}

export function previousQuestion(currentIndex: number, mode = "normal") {
  return request<Record<string, unknown>>(http.get("/quiz/previous", { params: { currentIndex, mode } }));
}

export function getAnswers(params: { page?: number; limit?: number; isCorrect?: string; sessionType?: string } = {}) {
  return request<Record<string, unknown>>(http.get("/quiz/answers", { params }));
}

export function getQuestionAnswers(questionId: string) {
  return request<Array<Record<string, unknown>>>(http.get(`/quiz/answers/${questionId}`));
}

export function resetQuiz() {
  return request<void>(http.post("/quiz/reset"));
}

export function getNavigator(params: { filter?: string; type?: string; search?: string } = {}) {
  return request<Array<Record<string, unknown>>>(http.get("/quiz/navigator", { params }));
}

export function jumpTo(index: number, mode = "normal") {
  return request<Record<string, unknown>>(http.post(`/quiz/jump/${index}`, { mode }));
}
