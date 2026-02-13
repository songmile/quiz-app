<template>
  <section class="page">
    <header class="row between"><h2>学习进度</h2><button class="btn" :disabled="loading" @click="load">刷新</button></header>
    <div class="panel" v-if="error">{{ error }}</div>
    <div class="panel"><h3>题库进度</h3><pre>{{ JSON.stringify(bankProgress, null, 2) }}</pre></div>
    <div class="panel"><h3>标签进度</h3><pre>{{ JSON.stringify(tagProgress, null, 2) }}</pre></div>
    <div class="panel"><h3>掌握度</h3><pre>{{ JSON.stringify(mastery, null, 2) }}</pre></div>
  </section>
</template>
<script setup lang="ts">
import { onMounted, ref } from "vue";
import { getBankProgress, getMastery, getTagProgress } from "../../api/stats";
const loading = ref(false); const error = ref(""); const bankProgress = ref<unknown>(null); const tagProgress = ref<unknown>(null); const mastery = ref<unknown>(null);
async function load(){ loading.value=true; error.value=""; try{ const [b,t,m]=await Promise.all([getBankProgress(), getTagProgress(), getMastery()]); bankProgress.value=b; tagProgress.value=t; mastery.value=m; }catch(e){ error.value=(e as Error).message; } finally{ loading.value=false; } }
onMounted(load);
</script>
<style scoped>.page{display:grid;gap:12px}.row{display:flex;gap:8px;align-items:center}.between{justify-content:space-between}.panel{border:1px solid #dcdfe6;border-radius:8px;padding:12px}.btn{border:1px solid #c9ced6;background:#fff;padding:6px 10px;border-radius:6px;cursor:pointer}pre{white-space:pre-wrap;word-break:break-word}</style>
