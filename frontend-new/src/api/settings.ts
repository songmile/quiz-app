import { http, request } from "./http";

export interface SettingsData {
  api_configs: Array<{
    name: string;
    api_key: string;
    api_url: string;
    model: string;
    chunk_size: number;
    max_tokens: number;
    enabled: boolean;
  }>;
  import_max_concurrent: number;
  import_batch_delay: number;
  explanation_api_index: number;
  autosave_interval: number;
  knowledge_tree_api_index: number;
  design_process_api_index: number;
  font_settings: Record<string, number>;
  data_path: string;
}

export interface BackupFileItem {
  filename: string;
  size: number;
  createdAt: string;
  modifiedAt: string;
  type: string;
  questionCount: number;
}

export interface BackupJobStatus {
  jobNo: string;
  kind: string;
  status: "processing" | "completed" | "failed";
  retryCount: number;
  maxRetries: number;
  createdAt: string;
  startedAt?: string;
  endedAt?: string;
  error?: string;
  filename?: string;
  backup?: {
    filename: string;
    path: string;
    exists: boolean;
    file?: BackupFileItem;
  };
}

export function getSettings() {
  return request<SettingsData>(http.get("/settings"));
}

export function updateSettings(payload: Partial<SettingsData>) {
  return request<SettingsData>(http.put("/settings", payload));
}

export function updateApiConfig(index: number, payload: Partial<SettingsData["api_configs"][number]>) {
  return request(http.put(`/settings/api/${index}`, payload));
}

export function updateFontSettings(payload: Record<string, number>) {
  return request<Record<string, number>>(http.put("/settings/fonts", payload));
}

export function updateImportSettings(payload: { import_max_concurrent?: number; import_batch_delay?: number }) {
  return request(http.put("/settings/import", payload));
}

export function resetSettings() {
  return request<SettingsData>(http.post("/settings/reset"));
}

export function createAppBackup() {
  return request<BackupJobStatus>(http.post("/settings/backup"));
}

export function getBackupJobStatus(jobNo: string) {
  return request<BackupJobStatus>(http.get(`/settings/backup-jobs/${encodeURIComponent(jobNo)}`));
}

export function restoreAppBackup(filename: string) {
  return request(http.post("/settings/restore", { filename }));
}

export function listBackupFiles() {
  return request<BackupFileItem[]>(http.get("/settings/backup-files"));
}

export function updateDataPath(path: string) {
  return request<{ path: string }>(http.put("/settings/data-path", { path }));
}
