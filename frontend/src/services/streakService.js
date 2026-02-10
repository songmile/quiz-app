import apiClient from './api';

export default {
  getStreak() {
    return apiClient.get('/streak');
  },
  updateDailyGoal(dailyGoal) {
    return apiClient.patch('/streak/goal', { dailyGoal });
  }
};
