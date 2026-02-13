<template>
  <section class="page">
    <header class="row between">
      <h2>首页</h2>
      <button class="btn" :disabled="loading" @click="load">刷新</button>
    </header>

    <div class="grid">
      <div class="card">
        <h3>概览</h3>
        <pre>{{ JSON.stringify(overview, null, 2) }}</pre>
      </div>
      <div class="card">
        <h3>连续学习</h3>
        <pre>{{ JSON.stringify(streak, null, 2) }}</pre>
      </div>
    </div>

    <div class="card" v-if="error">{{ error }}</div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { getOverview } from "../api/stats";
import { getStreak } from "../api/streak";

const loading = ref(false);
const error = ref("");
const overview = ref<Record<string, unknown>>({});
const streak = ref<Record<string, unknown>>({});

async function load() {
  loading.value = true;
  error.value = "";
  try {
    const [o, s] = await Promise.all([getOverview(), getStreak()]);
    overview.value = o;
    streak.value = s;
  } catch (e) {
    error.value = (e as Error).message;
  } finally {
    loading.value = false;
  }
}

onMounted(load);
</script>

<style scoped>
.page { display: grid; gap: 12px; }
.row { display: flex; align-items: center; gap: 8px; }
.between { justify-content: space-between; }
.grid { display: grid; grid-template-columns: repeat(2, minmax(320px, 1fr)); gap: 12px; }
.card { border: 1px solid #dcdfe6; border-radius: 8px; padding: 12px; }
.btn { border: 1px solid #c9ced6; background: #fff; padding: 6px 10px; border-radius: 6px; cursor: pointer; }
pre { white-space: pre-wrap; word-break: break-word; margin: 0; }
</style>
