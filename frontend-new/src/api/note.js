import { http, request } from "./http";
export function getNotes(params = {}) {
    return request(http.get("/notes", { params }));
}
export function getNotesByQuestion(questionId) {
    return request(http.get(`/notes/question/${questionId}`));
}
export function createNote(payload) {
    return request(http.post("/notes", payload));
}
export function updateNote(id, payload) {
    return request(http.put(`/notes/${id}`, payload));
}
export function deleteNote(id) {
    return request(http.delete(`/notes/${id}`));
}
