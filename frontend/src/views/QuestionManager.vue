<template>
  <div class="question-manager">
    <div class="page-header">
      <h1 class="page-title">题库管理</h1>
      <p class="page-subtitle">管理您的 Spring Boot 学习题库</p>
    </div>
    
    <div class="manager-container">
      <router-view />
    </div>
  </div>
</template>

<script>
export default {
  name: 'QuestionManager',
  created() {
    // If accessing the base route, redirect to the question list
    if (this.$route.path === '/questions') {
      // Already at questions path, check if we're exactly on the list route
      if (this.$route.name !== 'QuestionList') {
        this.$router.replace({ name: 'QuestionList' });
      }
    }
  }
};
</script>

<style scoped>
.question-manager {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.page-header {
  margin-bottom: 20px;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: #333;
  margin: 0 0 5px 0;
}

.page-subtitle {
  font-size: 1rem;
  color: #6c757d;
  margin: 0;
}

.manager-container {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  min-height: calc(100vh - 200px);
}
</style>
