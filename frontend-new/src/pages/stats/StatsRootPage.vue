<template>
  <section class="page">
    <header class="section-tabs">
      <RouterLink class="tab-link" to="/stats/overview">概览</RouterLink>
      <RouterLink class="tab-link" to="/stats/wrong-questions">错题</RouterLink>
      <RouterLink class="tab-link" to="/stats/advisor">建议</RouterLink>
      <RouterLink class="tab-link" to="/stats/trends">趋势</RouterLink>
      <RouterLink class="tab-link" to="/stats/timeline">时间线</RouterLink>
      <RouterLink class="tab-link" to="/stats/progress">进度</RouterLink>
    </header>
    <RouterView />
  </section>
</template>

<script setup lang="ts">
import { RouterLink, RouterView } from "vue-router";
</script>
