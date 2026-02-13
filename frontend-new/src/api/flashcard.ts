import { http, request } from "./http";

export function startFlashcards(payload: { source?: string; bankId?: string | null; limit?: number } = {}) {
  return request<Record<string, unknown>>(http.post("/flashcards/start", payload));
}

export function rateFlashcard(payload: { questionId: string; rating: string }) {
  return request<Record<string, unknown>>(http.post("/flashcards/rate", payload));
}

export function getFlashcardInfo() {
  return request<Record<string, unknown>>(http.get("/flashcards/info"));
}
