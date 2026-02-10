<template>
  <header class="navbar">
    <div class="logo" @click="goHome">
      <img src="@/assets/logo.png" alt="Logo" class="logo-img">
      <span class="logo-text">Spring Boot 刷题系统</span>
    </div>
    
    <button class="menu-toggle" @click="menuOpen = !menuOpen">
      <i class="fas fa-bars"></i>
    </button>

    <div class="nav-links" :class="{ open: menuOpen }">
      <router-link to="/" class="nav-link" active-class="active" exact>首页</router-link>
      <router-link to="/quiz" class="nav-link" active-class="active">答题模式</router-link>
      <router-link to="/review" class="nav-link" active-class="active">错题复习</router-link>
      <router-link to="/questions" class="nav-link" active-class="active">题库管理</router-link>
      <router-link to="/stats" class="nav-link" active-class="active">学习统计</router-link>
      <router-link to="/settings" class="nav-link" active-class="active">设置</router-link>
    </div>
    
    <div class="nav-actions">
      <span v-if="studyTime" class="study-time">学习时间: {{ studyTime }}</span>
      <button @click="backupData" class="action-button" title="备份数据">
        <i class="fas fa-save"></i>
      </button>
    </div>
  </header>
</template>

<script>
export default {
  name: 'NavBar',
  data() {
    return {
      menuOpen: false
    };
  },
  watch: {
    '$route'() {
      this.menuOpen = false;
    }
  },
  computed: {
    studyTime() {
      return this.$store.getters['stats/studyTimeFormatted'];
    }
  },
  methods: {
    goHome() {
      this.$router.push('/');
    },
    async backupData() {
      try {
        await this.$store.dispatch('settings/backupData');
        alert('数据备份成功！');
      } catch (error) {
        alert('备份失败: ' + (error.message || '未知错误'));
      }
    }
  },
  mounted() {
    // Load stats for displaying study time
    this.$store.dispatch('stats/fetchOverview');
  }
};
</script>

<style scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  background-color: #1e88e5;
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.logo {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.logo-img {
  height: 36px;
  margin-right: 10px;
}

.logo-text {
  font-size: 1.2rem;
  font-weight: bold;
}

.nav-links {
  display: flex;
  gap: 20px;
}

.nav-link {
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  font-size: 1rem;
  font-weight: 500;
  padding: 5px 0;
  position: relative;
  transition: color 0.3s;
}

.nav-link:hover {
  color: white;
}

.nav-link.active {
  color: white;
}

.nav-link.active::after {
  content: '';
  position: absolute;
  bottom: -3px;
  left: 0;
  width: 100%;
  height: 3px;
  background-color: white;
  border-radius: 2px;
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 15px;
}

.study-time {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.9);
}

.action-button {
  background: transparent;
  border: none;
  color: white;
  cursor: pointer;
  font-size: 1.1rem;
  padding: 8px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.action-button:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.menu-toggle {
  display: none;
  background: transparent;
  border: none;
  color: white;
  font-size: 1.3rem;
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.menu-toggle:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

@media (max-width: 768px) {
  .nav-links {
    display: none;
    position: absolute;
    top: 60px;
    left: 0;
    right: 0;
    flex-direction: column;
    background: #1e88e5;
    padding: 10px 0;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    z-index: 999;
  }

  .nav-links.open {
    display: flex;
  }

  .nav-link {
    padding: 12px 20px;
  }

  .nav-link.active::after {
    display: none;
  }

  .menu-toggle {
    display: block;
  }

  .study-time {
    display: none;
  }

  .logo-text {
    font-size: 1rem;
  }
}
</style>