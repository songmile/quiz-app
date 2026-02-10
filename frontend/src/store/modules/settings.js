import settingsService from '@/services/settingsService';

export default {
  namespaced: true,
  
  state: {
    settings: null,
    apiConfigs: [],
    fontSettings: null,
    importSettings: null,
    loading: false,
    error: null,
    backupList: [],
    lastBackup: null
  },
  
  mutations: {
    SET_SETTINGS(state, settings) {
      state.settings = settings;
      state.apiConfigs = settings.api_configs || [];
      state.fontSettings = settings.font_settings || {};
      state.importSettings = {
        import_max_concurrent: settings.import_max_concurrent,
        import_batch_delay: settings.import_batch_delay
      };
    },
    SET_API_CONFIG(state, { index, config }) {
      if (index >= 0 && index < state.apiConfigs.length) {
        state.apiConfigs[index] = config;
      }
    },
    SET_FONT_SETTINGS(state, fontSettings) {
      state.fontSettings = fontSettings;
    },
    SET_IMPORT_SETTINGS(state, importSettings) {
      state.importSettings = importSettings;
    },
    SET_LOADING(state, status) {
      state.loading = status;
    },
    SET_ERROR(state, error) {
      state.error = error;
    },
    SET_BACKUP_LIST(state, backupList) {
      state.backupList = backupList;
    },
    SET_LAST_BACKUP(state, backup) {
      state.lastBackup = backup;
    }
  },
  
  actions: {
    async fetchSettings({ commit }) {
      try {
        commit('SET_LOADING', true);
        const response = await settingsService.getSettings();
        commit('SET_SETTINGS', response.data.data);
        commit('SET_ERROR', null);
        return response.data.data;
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || 'Failed to fetch settings');
        console.error('Error fetching settings:', error);
        return null;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    async updateSettings({ commit, dispatch }, settings) {
      try {
        commit('SET_LOADING', true);
        const response = await settingsService.updateSettings(settings);
        
        // Refresh settings after update
        await dispatch('fetchSettings');
        
        commit('SET_ERROR', null);
        return response.data;
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || 'Failed to update settings');
        console.error('Error updating settings:', error);
        return null;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    async updateApiConfig({ commit, dispatch }, { index, config }) {
      try {
        commit('SET_LOADING', true);
        const response = await settingsService.updateApiConfig(index, config);
        
        // Update locally first for immediate UI update
        commit('SET_API_CONFIG', { index, config: response.data.data });
        
        // Refresh all settings to ensure consistency
        await dispatch('fetchSettings');
        
        commit('SET_ERROR', null);
        return response.data;
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || 'Failed to update API configuration');
        console.error('Error updating API configuration:', error);
        return null;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    async updateFontSettings({ commit, dispatch }, fontSettings) {
      try {
        commit('SET_LOADING', true);
        const response = await settingsService.updateFontSettings(fontSettings);
        
        // Update locally first for immediate UI update
        commit('SET_FONT_SETTINGS', response.data.data);
        
        // Refresh all settings to ensure consistency
        await dispatch('fetchSettings');
        
        commit('SET_ERROR', null);
        return response.data;
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || 'Failed to update font settings');
        console.error('Error updating font settings:', error);
        return null;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    async updateImportSettings({ commit, dispatch }, importSettings) {
      try {
        commit('SET_LOADING', true);
        const response = await settingsService.updateImportSettings(importSettings);
        
        // Update locally first for immediate UI update
        commit('SET_IMPORT_SETTINGS', response.data.data);
        
        // Refresh all settings to ensure consistency
        await dispatch('fetchSettings');
        
        commit('SET_ERROR', null);
        return response.data;
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || 'Failed to update import settings');
        console.error('Error updating import settings:', error);
        return null;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    async resetSettings({ commit, dispatch }) {
      try {
        commit('SET_LOADING', true);
        await settingsService.resetSettings();
        
        // Refresh settings after reset
        await dispatch('fetchSettings');
        
        commit('SET_ERROR', null);
        return true;
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || 'Failed to reset settings');
        console.error('Error resetting settings:', error);
        return false;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    async backupData({ commit }) {
      try {
        commit('SET_LOADING', true);
        const response = await settingsService.backupData();
        commit('SET_LAST_BACKUP', response.data.backup);
        commit('SET_ERROR', null);
        return response.data;
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || 'Failed to backup data');
        console.error('Error backing up data:', error);
        return null;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    async restoreData({ commit }, filename) {
      try {
        commit('SET_LOADING', true);
        const response = await settingsService.restoreData(filename);
        commit('SET_ERROR', null);
        return response.data;
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || 'Failed to restore data');
        console.error('Error restoring data:', error);
        return null;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    async updateDataPath({ commit }, path) {
      try {
        commit('SET_LOADING', true);
        const response = await settingsService.updateDataPath(path);
        commit('SET_ERROR', null);
        return response.data;
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || 'Failed to update data path');
        console.error('Error updating data path:', error);
        return null;
      } finally {
        commit('SET_LOADING', false);
      }
    }
  },
  
  getters: {
    settings: state => state.settings,
    apiConfigs: state => state.apiConfigs,
    fontSettings: state => state.fontSettings,
    importSettings: state => state.importSettings,
    isLoading: state => state.loading,
    error: state => state.error,
    lastBackup: state => state.lastBackup,
    
    // Specific settings getters
    questionFontSize: state => state.fontSettings?.question_font_size || 12,
    optionFontSize: state => state.fontSettings?.option_font_size || 11,
    explanationFontSize: state => state.fontSettings?.explanation_font_size || 11,
    currentApiConfig: state => index => {
      return (index >= 0 && index < state.apiConfigs.length) 
        ? state.apiConfigs[index] 
        : null;
    },
    maxConcurrentImports: state => state.importSettings?.import_max_concurrent || 2,
    batchDelay: state => state.importSettings?.import_batch_delay || 2
  }
};