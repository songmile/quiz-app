<template>
  <section class="page">
    <header class="row between">
      <h2>时间线</h2>
      <div class="row">
        <select v-model="period"><option value="daily">daily</option><option value="weekly">weekly</option><option value="monthly">monthly</option></select>
        <button class="btn" :disabled="loading" @click="load">查询</button>
      </div>
    </header>
    <div class="panel" v-if="error">{{ error }}</div>
    <div class="panel"><pre>{{ JSON.stringify(data, null, 2) }}</pre></div>
  </section>
</template>
<script setup lang="ts">
import { ref } from "vue";
import { getTimeline } from "../../api/stats";
const loading = ref(false); const error = ref(""); const data = ref<unknown>(null); const period = ref("daily");
async function load(){ loading.value=true; error.value=""; try{ data.value=await getTimeline({ period: period.value }); }catch(e){ error.value=(e as Error).message; } finally{ loading.value=false; } }
load();
</script>
<style scoped>.page{display:grid;gap:12px}.row{display:flex;gap:8px;align-items:center}.between{justify-content:space-between}.panel{border:1px solid #dcdfe6;border-radius:8px;padding:12px}.btn{border:1px solid #c9ced6;background:#fff;padding:6px 10px;border-radius:6px;cursor:pointer}select{border:1px solid #c9ced6;border-radius:6px;padding:6px 8px}pre{white-space:pre-wrap;word-break:break-word}</style>
