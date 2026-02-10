<template>
  <div class="not-found">
    <div class="container">
      <div class="error-code">404</div>
      <div class="error-title">页面未找到</div>
      <div class="error-message">
        您请求的页面不存在或已被移除。
      </div>
      <div class="error-actions">
        <router-link to="/" class="home-button">
          <i class="fas fa-home"></i> 返回首页
        </router-link>
        <button class="back-button" @click="goBack">
          <i class="fas fa-arrow-left"></i> 返回上一页
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NotFound',
  methods: {
    goBack() {
      this.$router.go(-1);
    }
  }
};
</script>

<style scoped>
.not-found {
  min-height: calc(100vh - 60px);
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 20px;
}

.container {
  max-width: 500px;
}

.error-code {
  font-size: 8rem;
  font-weight: 800;
  color: #1e88e5;
  line-height: 1;
  margin-bottom: 10px;
  opacity: 0.7;
}

.error-title {
  font-size: 2rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 20px;
}

.error-message {
  font-size: 1.1rem;
  color: #6c757d;
  margin-bottom: 30px;
}

.error-actions {
  display: flex;
  justify-content: center;
  gap: 15px;
}

.home-button, .back-button {
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
  cursor: pointer;
}

.home-button {
  background-color: #1e88e5;
  color: white;
  text-decoration: none;
  border: none;
}

.home-button:hover {
  background-color: #1976d2;
}

.back-button {
  background-color: #f8f9fa;
  color: #495057;
  border: 1px solid #dee2e6;
}

.back-button:hover {
  background-color: #e9ecef;
}
</style>
