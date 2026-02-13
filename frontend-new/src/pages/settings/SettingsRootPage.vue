<template>
  <section class="page">
    <header class="row">
      <RouterLink class="btn" to="/settings/general">通用</RouterLink>
      <RouterLink class="btn" to="/settings/api">API</RouterLink>
      <RouterLink class="btn" to="/settings/font">字体</RouterLink>
      <RouterLink class="btn" to="/settings/backup">备份</RouterLink>
    </header>
    <RouterView />
  </section>
</template>

<script setup lang="ts">
import { RouterLink, RouterView } from "vue-router";
</script>

<style scoped>
.page { display: grid; gap: 12px; }
.row { display: flex; gap: 8px; }
.btn { border: 1px solid #c9ced6; background: #fff; padding: 6px 10px; border-radius: 6px; text-decoration: none; color: #222; }
</style>
