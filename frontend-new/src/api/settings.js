import { http, request } from "./http";
export function getSettings() {
    return request(http.get("/settings"));
}
export function updateSettings(payload) {
    return request(http.put("/settings", payload));
}
export function updateApiConfig(index, payload) {
    return request(http.put(`/settings/api/${index}`, payload));
}
export function updateFontSettings(payload) {
    return request(http.put("/settings/fonts", payload));
}
export function updateImportSettings(payload) {
    return request(http.put("/settings/import", payload));
}
export function resetSettings() {
    return request(http.post("/settings/reset"));
}
export function createAppBackup() {
    return request(http.post("/settings/backup"));
}
export function getBackupJobStatus(jobNo) {
    return request(http.get(`/settings/backup-jobs/${encodeURIComponent(jobNo)}`));
}
export function restoreAppBackup(filename) {
    return request(http.post("/settings/restore", { filename }));
}
export function listBackupFiles() {
    return request(http.get("/settings/backup-files"));
}
export function updateDataPath(path) {
    return request(http.put("/settings/data-path", { path }));
}
