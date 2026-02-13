import { http, request } from "./http";
export function startFlashcards(payload = {}) {
    return request(http.post("/flashcards/start", payload));
}
export function rateFlashcard(payload) {
    return request(http.post("/flashcards/rate", payload));
}
export function getFlashcardInfo() {
    return request(http.get("/flashcards/info"));
}
