<template>
  <section class="page">
    <header class="row between">
      <h2>专项训练</h2>
      <div class="row">
        <input v-model.number="count" type="number" min="1" max="200" />
        <button class="btn" :disabled="loading" @click="start">开始训练</button>
        <button class="btn" :disabled="loading" @click="analyze">弱项分析</button>
      </div>
    </header>

    <div class="panel" v-if="error">{{ error }}</div>
    <div class="panel" v-if="startResult"><pre>{{ JSON.stringify(startResult, null, 2) }}</pre></div>
    <div class="panel" v-if="analysis"><pre>{{ JSON.stringify(analysis, null, 2) }}</pre></div>
  </section>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { getDrillAnalysis, startDrill } from "../api/drill";

const loading = ref(false);
const error = ref("");
const count = ref(20);
const startResult = ref<unknown>(null);
const analysis = ref<unknown>(null);

async function start() {
  loading.value = true;
  error.value = "";
  try {
    startResult.value = await startDrill(count.value);
  } catch (e) {
    error.value = (e as Error).message;
  } finally {
    loading.value = false;
  }
}

async function analyze() {
  loading.value = true;
  error.value = "";
  try {
    analysis.value = await getDrillAnalysis();
  } catch (e) {
    error.value = (e as Error).message;
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.page { display: grid; gap: 12px; }
.row { display: flex; gap: 8px; align-items: center; }
.between { justify-content: space-between; }
.panel { border: 1px solid #dcdfe6; border-radius: 8px; padding: 12px; }
.btn { border: 1px solid #c9ced6; background: #fff; padding: 6px 10px; border-radius: 6px; cursor: pointer; }
input { border: 1px solid #c9ced6; border-radius: 6px; padding: 6px 8px; width: 120px; }
pre { white-space: pre-wrap; word-break: break-word; }
</style>
