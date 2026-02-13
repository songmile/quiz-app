import { http, request } from "./http";
export function getQuestions(params = {}) {
    return request(http.get("/questions", { params }));
}
export function getQuestion(id) {
    return request(http.get(`/questions/${id}`));
}
export function createQuestion(payload) {
    return request(http.post("/questions", payload));
}
export function updateQuestion(id, payload) {
    return request(http.put(`/questions/${id}`, payload));
}
export function deleteQuestion(id) {
    return request(http.delete(`/questions/${id}`));
}
export function getAllTags() {
    return request(http.get("/questions/tags/all"));
}
export function importQuestions(payload) {
    return request(http.post("/questions/import", payload));
}
export function importTextQuestions(content, mode = "add", bankId = null) {
    return request(http.post("/questions/import/text", { content, mode, bankId }));
}
export function importQuestionsWithAi(content, mode = "add", bankId = null) {
    return request(http.post("/questions/import/ai", { content, mode, bankId }));
}
export function getImportStatus(importId) {
    return request(http.get(`/questions/import/status/${importId}`));
}
export function cleanDuplicates() {
    return request(http.post("/questions/clean-duplicates"));
}
export function createQuestionBackup() {
    return request(http.post("/questions/backup"));
}
export function restoreQuestionBackup(backupId) {
    return request(http.post("/questions/restore", { backupId }));
}
