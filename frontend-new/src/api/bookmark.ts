import { http, request } from "./http";
import type { QuestionItem } from "./question";

export interface BookmarkItem {
  questionId: string;
  createdAt: string;
  question: QuestionItem;
}

export function getBookmarks() {
  return request<BookmarkItem[]>(http.get("/bookmarks"));
}

export function getBookmarkIds() {
  return request<string[]>(http.get("/bookmarks/ids"));
}

export function addBookmark(questionId: string) {
  return request<void>(http.post(`/bookmarks/${questionId}`));
}

export function deleteBookmark(questionId: string) {
  return request<void>(http.delete(`/bookmarks/${questionId}`));
}
