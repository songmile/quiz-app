import { http, request } from "./http";
export function getBookmarks() {
    return request(http.get("/bookmarks"));
}
export function getBookmarkIds() {
    return request(http.get("/bookmarks/ids"));
}
export function addBookmark(questionId) {
    return request(http.post(`/bookmarks/${questionId}`));
}
export function deleteBookmark(questionId) {
    return request(http.delete(`/bookmarks/${questionId}`));
}
