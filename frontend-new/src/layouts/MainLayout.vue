<template>
  <div class="layout">
    <aside class="sidebar">
      <h1>Quiz Gen</h1>
      <nav>
        <RouterLink to="/">首页</RouterLink>
        <RouterLink to="/quiz">答题</RouterLink>
        <RouterLink to="/review">复习</RouterLink>
        <RouterLink to="/flashcards">闪卡</RouterLink>
        <RouterLink to="/drill">专项训练</RouterLink>
        <RouterLink to="/questions">题库</RouterLink>
        <RouterLink to="/notes">笔记</RouterLink>
        <RouterLink to="/bookmarks">收藏</RouterLink>
        <RouterLink to="/stats">统计</RouterLink>
        <RouterLink to="/settings">设置</RouterLink>
      </nav>
    </aside>
    <main class="content">
      <RouterView />
    </main>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
.layout {
  display: grid;
  grid-template-columns: 220px 1fr;
  min-height: 100vh;
}
.sidebar {
  padding: 16px;
  border-right: 1px solid #e5e7eb;
  position: sticky;
  top: 0;
  height: 100vh;
  overflow: auto;
}
.sidebar nav {
  display: grid;
  gap: 8px;
  margin-top: 16px;
}
.sidebar a {
  border: 1px solid #d9dde3;
  border-radius: 6px;
  padding: 8px 10px;
  text-decoration: none;
  color: #111827;
}
.sidebar a.router-link-active {
  border-color: #8da2fb;
  background: #eef2ff;
}
.content {
  padding: 24px;
}
@media (max-width: 900px) {
  .layout {
    grid-template-columns: 1fr;
  }
  .sidebar {
    height: auto;
    position: static;
    border-right: none;
    border-bottom: 1px solid #e5e7eb;
  }
  .sidebar nav {
    grid-template-columns: repeat(2, minmax(120px, 1fr));
  }
}
</style>
