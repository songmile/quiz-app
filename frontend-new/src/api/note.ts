import { http, request } from "./http";

export interface NoteItem {
  id: string;
  questionId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotePage {
  data: NoteItem[];
  total: number;
  page: number;
  totalPages: number;
}

export function getNotes(params: { page?: number; limit?: number; search?: string } = {}) {
  return request<NotePage>(http.get("/notes", { params }));
}

export function getNotesByQuestion(questionId: string) {
  return request<NoteItem[]>(http.get(`/notes/question/${questionId}`));
}

export function createNote(payload: { questionId: string; content: string }) {
  return request<NoteItem>(http.post("/notes", payload));
}

export function updateNote(id: string, payload: { questionId?: string; content: string }) {
  return request<NoteItem>(http.put(`/notes/${id}`, payload));
}

export function deleteNote(id: string) {
  return request<void>(http.delete(`/notes/${id}`));
}
