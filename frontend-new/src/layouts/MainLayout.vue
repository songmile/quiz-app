<template>
  <div class="layout">
    <header class="mobile-header">
      <h1>Quiz Atelier</h1>
      <p>学习系统</p>
    </header>

    <aside class="sidebar">
      <div class="brand">
        <h1>Quiz Atelier</h1>
        <p>专注题库训练与复习追踪</p>
      </div>

      <nav class="nav-grid">
        <RouterLink v-for="item in navItems" :key="item.to" :to="item.to" class="nav-item">
          <span>{{ item.label }}</span>
          <small>{{ item.desc }}</small>
        </RouterLink>
      </nav>

      <footer class="side-note">每一次提交，都是对知识边界的更新。</footer>
    </aside>

    <main class="content">
      <div class="content-shell">
        <RouterView v-slot="{ Component }">
          <transition name="page-slide" mode="out-in">
            <component :is="Component" :key="route.fullPath" />
          </transition>
        </RouterView>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from "vue-router";

const route = useRoute();

const navItems = [
  { to: "/", label: "首页", desc: "学习概览" },
  { to: "/quiz", label: "答题", desc: "标准练习" },
  { to: "/review", label: "复习", desc: "间隔复习" },
  { to: "/flashcards", label: "闪卡", desc: "记忆强化" },
  { to: "/drill", label: "专项训练", desc: "弱项突破" },
  { to: "/questions", label: "题库", desc: "题目管理" },
  { to: "/notes", label: "笔记", desc: "个人记录" },
  { to: "/bookmarks", label: "收藏", desc: "重点留存" },
  { to: "/stats", label: "统计", desc: "学习分析" },
  { to: "/settings", label: "设置", desc: "系统配置" }
];
</script>

<style scoped>
.layout {
  display: grid;
  grid-template-columns: 270px 1fr;
  min-height: 100vh;
}

.mobile-header {
  display: none;
}

.sidebar {
  padding: 24px 18px;
  border-right: 1px solid #d7ccb9;
  background: linear-gradient(180deg, rgba(255, 253, 247, 0.8) 0%, rgba(247, 239, 225, 0.9) 100%);
  position: sticky;
  top: 0;
  height: 100vh;
  overflow: auto;
}

.brand {
  display: grid;
  gap: 8px;
}

.brand h1 {
  font-size: 24px;
  color: #1f3d3a;
}

.brand p {
  margin: 0;
  font-size: 13px;
  line-height: 1.4;
  color: #6a5d4a;
}

.nav-grid {
  display: grid;
  gap: 10px;
  margin-top: 20px;
}

.nav-item {
  display: grid;
  gap: 2px;
  border: 1px solid #cfc0a8;
  border-radius: 12px;
  padding: 10px 12px;
  text-decoration: none;
  background: linear-gradient(180deg, #fffcf7 0%, #f6eddd 100%);
  color: #3f3427;
  transition: all 0.2s ease;
}

.nav-item span {
  font-size: 14px;
  font-weight: 700;
}

.nav-item small {
  color: #6a5b45;
  font-size: 12px;
}

.nav-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 12px 24px rgba(72, 54, 31, 0.15);
}

.nav-item.router-link-active {
  border-color: #0f766e;
  background: linear-gradient(180deg, #e9f7f4 0%, #d7eeea 100%);
}

.side-note {
  margin-top: 18px;
  padding-top: 14px;
  border-top: 1px dashed #cdbb9e;
  font-size: 12px;
  color: #7c6a51;
  line-height: 1.5;
}

.content {
  padding: 20px 24px;
}

.content-shell {
  width: min(1180px, 100%);
}

.page-slide-enter-active,
.page-slide-leave-active {
  transition: all 0.2s ease;
}

.page-slide-enter-from {
  opacity: 0;
  transform: translateY(6px);
}

.page-slide-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

@media (max-width: 900px) {
  .layout {
    grid-template-columns: 1fr;
  }

  .mobile-header {
    display: block;
    padding: 14px 14px 2px;
  }

  .mobile-header h1 {
    font-size: 21px;
    color: #1e3a36;
  }

  .mobile-header p {
    margin: 4px 0 0;
    color: #73624b;
    font-size: 12px;
  }

  .sidebar {
    height: initial;
    position: static;
    border-right: none;
    border-bottom: 1px solid #d7ccb9;
    padding: 12px;
    background: transparent;
  }

  .brand {
    display: none;
  }

  .nav-grid {
    grid-template-columns: repeat(2, minmax(120px, 1fr));
    margin-top: 0;
  }

  .side-note {
    margin-top: 12px;
    padding-top: 10px;
  }

  .content {
    padding: 12px;
  }
}
</style>
