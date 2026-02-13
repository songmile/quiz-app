<template>
  <section class="page">
    <header class="row">
      <RouterLink class="btn" to="/stats/overview">概览</RouterLink>
      <RouterLink class="btn" to="/stats/wrong-questions">错题</RouterLink>
      <RouterLink class="btn" to="/stats/advisor">建议</RouterLink>
      <RouterLink class="btn" to="/stats/trends">趋势</RouterLink>
      <RouterLink class="btn" to="/stats/timeline">时间线</RouterLink>
      <RouterLink class="btn" to="/stats/progress">进度</RouterLink>
    </header>
    <RouterView />
  </section>
</template>

<script setup lang="ts">
import { RouterLink, RouterView } from "vue-router";
</script>

<style scoped>
.page { display: grid; gap: 12px; }
.row { display: flex; gap: 8px; flex-wrap: wrap; }
.btn { border: 1px solid #c9ced6; background: #fff; padding: 6px 10px; border-radius: 6px; text-decoration: none; color: #222; }
</style>
