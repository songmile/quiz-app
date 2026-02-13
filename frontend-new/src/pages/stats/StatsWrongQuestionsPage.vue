<template>
  <section class="page">
    <header class="row between"><h2>错题统计</h2><button class="btn" :disabled="loading" @click="load">刷新</button></header>
    <div class="panel" v-if="error">{{ error }}</div>
    <div class="panel"><pre>{{ JSON.stringify(data, null, 2) }}</pre></div>
  </section>
</template>
<script setup lang="ts">
import { onMounted, ref } from "vue";
import { getWrongQuestions } from "../../api/stats";
const loading = ref(false); const error = ref(""); const data = ref<unknown>(null);
async function load(){ loading.value=true; error.value=""; try{ data.value=await getWrongQuestions(); }catch(e){ error.value=(e as Error).message; } finally{ loading.value=false; } }
onMounted(load);
</script>
<style scoped>.page{display:grid;gap:12px}.row{display:flex;gap:8px;align-items:center}.between{justify-content:space-between}.panel{border:1px solid #dcdfe6;border-radius:8px;padding:12px}.btn{border:1px solid #c9ced6;background:#fff;padding:6px 10px;border-radius:6px;cursor:pointer}pre{white-space:pre-wrap;word-break:break-word}</style>
