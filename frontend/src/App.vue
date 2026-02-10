<template>
  <div class="app-container">
    <NavBar />
    <div class="main-container">
      <SideMenu v-if="showSidebar" />
      <main class="content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script>
import NavBar from '@/components/layout/NavBar.vue';
import SideMenu from '@/components/layout/SideMenu.vue';

export default {
  name: 'App',
  components: {
    NavBar,
    SideMenu
  },
  computed: {
    showSidebar() {
      // Don't show sidebar on quiz and review pages
      const hideOnRoutes = ['QuizMode', 'ReviewMode', 'FlashcardMode', 'DrillMode', 'BookmarkList', 'NotFound'];
      return !hideOnRoutes.includes(this.$route.name);
    }
  },
  created() {
    // Fetch initial settings and data
    this.$store.dispatch('settings/fetchSettings');
  }
};
</script>

<style>
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  font-family: 'PingFang SC', 'Helvetica Neue', Helvetica, 'Microsoft YaHei', Arial, sans-serif;
}

* {
  box-sizing: border-box;
}

.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main-container {
  display: flex;
  flex: 1;
  margin-top: 60px; /* Height of navbar */
}

.content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

/* Global utility classes */
.text-center {
  text-align: center;
}

.mb-1 {
  margin-bottom: 0.5rem;
}

.mb-2 {
  margin-bottom: 1rem;
}

.mb-3 {
  margin-bottom: 1.5rem;
}

.mt-1 {
  margin-top: 0.5rem;
}

.mt-2 {
  margin-top: 1rem;
}

.mt-3 {
  margin-top: 1.5rem;
}

.card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-bottom: 20px;
}

.card-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #333;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}

.flex {
  display: flex;
}

.justify-between {
  justify-content: space-between;
}

.align-center {
  align-items: center;
}

.flex-col {
  flex-direction: column;
}

.gap-2 {
  gap: 0.5rem;
}

.gap-4 {
  gap: 1rem;
}

.w-full {
  width: 100%;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>