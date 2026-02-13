import { http, request } from "./http";

export interface BankItem {
  id: string;
  name: string;
  description?: string;
  createdAt?: string;
}

export function getBanks() {
  return request<BankItem[]>(http.get("/banks"));
}

export function createBank(payload: { name: string; description?: string }) {
  return request<BankItem>(http.post("/banks", payload));
}

export function updateBank(id: string, payload: { name: string; description?: string }) {
  return request<BankItem>(http.put(`/banks/${id}`, payload));
}

export function deleteBank(id: string) {
  return request<void>(http.delete(`/banks/${id}`));
}

export function getBankQuestions(id: string, params: Record<string, unknown> = {}) {
  return request(http.get(`/banks/${id}/questions`, { params }));
}
