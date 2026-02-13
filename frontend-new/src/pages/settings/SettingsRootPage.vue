<template>
  <section class="page">
    <header class="section-tabs">
      <RouterLink class="tab-link" to="/settings/general">通用</RouterLink>
      <RouterLink class="tab-link" to="/settings/api">API</RouterLink>
      <RouterLink class="tab-link" to="/settings/font">字体</RouterLink>
      <RouterLink class="tab-link" to="/settings/backup">备份与恢复</RouterLink>
    </header>
    <RouterView />
  </section>
</template>

<script setup lang="ts">
import { RouterLink, RouterView } from "vue-router";
</script>
