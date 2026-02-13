<template>
  <section class="page">
    <header class="row between">
      <h2>闪卡模式</h2>
      <div class="row">
        <button class="btn" :disabled="loading" @click="start">开始</button>
        <button class="btn" :disabled="loading" @click="refresh">刷新信息</button>
      </div>
    </header>

    <div class="panel" v-if="error">{{ error }}</div>
    <div class="panel" v-if="session"><pre>{{ JSON.stringify(session, null, 2) }}</pre></div>
    <div class="panel" v-if="info"><pre>{{ JSON.stringify(info, null, 2) }}</pre></div>

    <div class="panel row wrap">
      <input v-model="questionId" placeholder="questionId" />
      <select v-model="rating">
        <option value="again">again</option>
        <option value="hard">hard</option>
        <option value="good">good</option>
        <option value="easy">easy</option>
      </select>
      <button class="btn" :disabled="loading || !questionId" @click="rate">评分提交</button>
    </div>

    <div class="panel" v-if="result"><pre>{{ JSON.stringify(result, null, 2) }}</pre></div>
  </section>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { getFlashcardInfo, rateFlashcard, startFlashcards } from "../api/flashcard";

const loading = ref(false);
const error = ref("");
const session = ref<unknown>(null);
const info = ref<unknown>(null);
const result = ref<unknown>(null);
const questionId = ref("");
const rating = ref("good");

async function start() {
  loading.value = true;
  error.value = "";
  try {
    session.value = await startFlashcards({ source: "all", limit: 20 });
    info.value = await getFlashcardInfo();
  } catch (e) {
    error.value = (e as Error).message;
  } finally {
    loading.value = false;
  }
}

async function refresh() {
  try {
    info.value = await getFlashcardInfo();
  } catch (e) {
    error.value = (e as Error).message;
  }
}

async function rate() {
  loading.value = true;
  error.value = "";
  try {
    result.value = await rateFlashcard({ questionId: questionId.value, rating: rating.value });
    await refresh();
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
.wrap { flex-wrap: wrap; }
.between { justify-content: space-between; }
.panel { border: 1px solid #dcdfe6; border-radius: 8px; padding: 12px; }
.btn { border: 1px solid #c9ced6; background: #fff; padding: 6px 10px; border-radius: 6px; cursor: pointer; }
input, select { border: 1px solid #c9ced6; border-radius: 6px; padding: 6px 8px; }
pre { white-space: pre-wrap; word-break: break-word; }
</style>
