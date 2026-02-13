import { http, request } from "./http";
export function getBanks() {
    return request(http.get("/banks"));
}
export function createBank(payload) {
    return request(http.post("/banks", payload));
}
export function updateBank(id, payload) {
    return request(http.put(`/banks/${id}`, payload));
}
export function deleteBank(id) {
    return request(http.delete(`/banks/${id}`));
}
export function getBankQuestions(id, params = {}) {
    return request(http.get(`/banks/${id}/questions`, { params }));
}
