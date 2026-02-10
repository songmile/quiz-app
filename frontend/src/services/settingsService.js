import apiClient from './api';

export default {
  // Get all settings
  getSettings() {
    return apiClient.get('/settings');
  },

  // Update settings
  updateSettings(settings) {
    return apiClient.put('/settings', settings);
  },

  // Update API configuration
  updateApiConfig(index, config) {
    return apiClient.put(`/settings/api/${index}`, config);
  },

  // Update font settings
  updateFontSettings(fontSettings) {
    return apiClient.put('/settings/fonts', fontSettings);
  },

  // Update import settings
  updateImportSettings(importSettings) {
    return apiClient.put('/settings/import', importSettings);
  },

  // Reset settings to default
  resetSettings() {
    return apiClient.post('/settings/reset');
  },

  // Backup all data
  backupData() {
    return apiClient.post('/settings/backup');
  },

  // Restore data from backup
  restoreData(filename) {
    return apiClient.post('/settings/restore', { filename });
  },

  // Update data storage path
  updateDataPath(path) {
    return apiClient.put('/settings/data-path', { path });
  }
};