import { http, request } from "./http";

export interface QuestionOption {
  letter: string;
  text: string;
}

export interface QuestionItem {
  id: string;
  type: string;
  text: string;
  answer: string;
  bankId?: string;
  explanation?: string;
  options?: QuestionOption[];
  tags?: string[];
}

export interface QuestionPage {
  total: number;
  page: number;
  totalPages: number;
  data: QuestionItem[];
}

export interface QuestionListParams {
  page?: number;
  limit?: number;
  type?: string;
  search?: string;
  bankId?: string;
  tags?: string;
}

export interface QuestionImportPayload {
  questions: QuestionItem[];
  mode?: "add" | "replace";
  bankId?: string | null;
  tags?: string[];
}

export interface ImportStatus {
  id: string;
  status: "processing" | "completed" | "failed";
  mode: string;
  progress: {
    total: number;
    processed: number;
    successful: number;
    failed: number;
    percentage: string;
  };
  importedCount: number;
  duration: string;
  errors: string[];
}

export interface QuestionBackupResult {
  backupId: string;
  filename: string;
  timestamp: string;
  questionCount: number;
}

export function getQuestions(params: QuestionListParams = {}) {
  return request<QuestionPage>(http.get("/questions", { params }));
}

export function getQuestion(id: string) {
  return request<QuestionItem>(http.get(`/questions/${id}`));
}

export function createQuestion(payload: QuestionItem) {
  return request<QuestionItem>(http.post("/questions", payload));
}

export function updateQuestion(id: string, payload: QuestionItem) {
  return request<QuestionItem>(http.put(`/questions/${id}`, payload));
}

export function deleteQuestion(id: string) {
  return request<void>(http.delete(`/questions/${id}`));
}

export function getAllTags() {
  return request<string[]>(http.get("/questions/tags/all"));
}

export function importQuestions(payload: QuestionImportPayload) {
  return request(http.post("/questions/import", payload));
}

export function importTextQuestions(content: string, mode: "add" | "replace" = "add", bankId: string | null = null) {
  return request(http.post("/questions/import/text", { content, mode, bankId }));
}

export function importQuestionsWithAi(content: string, mode: "add" | "replace" = "add", bankId: string | null = null) {
  return request<{ message: string; importId: string; mode: string }>(http.post("/questions/import/ai", { content, mode, bankId }));
}

export function getImportStatus(importId: string) {
  return request<ImportStatus>(http.get(`/questions/import/status/${importId}`));
}

export function cleanDuplicates() {
  return request<{ originalCount: number; currentCount: number; removedCount: number }>(http.post("/questions/clean-duplicates"));
}

export function createQuestionBackup() {
  return request<QuestionBackupResult>(http.post("/questions/backup"));
}

export function restoreQuestionBackup(backupId: string) {
  return request<QuestionBackupResult>(http.post("/questions/restore", { backupId }));
}
