<template>
  <section class="page">
    <header class="row between wrap">
      <div>
        <h2>学习总览</h2>
        <p class="hint">聚焦进度、连续学习与下一步动作。</p>
      </div>
      <button class="btn" :disabled="loading" @click="load">刷新数据</button>
    </header>

    <div class="panel" v-if="error">{{ error }}</div>

    <div class="hero-grid">
      <article class="card">
        <h3>学习概况</h3>
        <div class="kv-grid top-gap" v-if="overviewEntries.length">
          <div class="kv-item" v-for="[key, value] in overviewEntries" :key="key">
            <small>{{ key }}</small>
            <strong>{{ formatValue(value) }}</strong>
          </div>
        </div>
        <p class="muted top-gap" v-else>暂无统计数据</p>
      </article>

      <article class="card">
        <h3>连续学习</h3>
        <div class="kv-grid top-gap" v-if="streakEntries.length">
          <div class="kv-item" v-for="[key, value] in streakEntries" :key="key">
            <small>{{ key }}</small>
            <strong>{{ formatValue(value) }}</strong>
          </div>
        </div>
        <p class="muted top-gap" v-else>暂无打卡数据</p>
      </article>
    </div>

    <article class="card">
      <h3>快捷入口</h3>
      <div class="row wrap top-gap">
        <RouterLink class="btn primary" to="/quiz">进入答题</RouterLink>
        <RouterLink class="btn" to="/review">开始复习</RouterLink>
        <RouterLink class="btn" to="/questions/import">导入题目</RouterLink>
        <RouterLink class="btn" to="/stats/overview">查看统计</RouterLink>
      </div>
    </article>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { RouterLink } from "vue-router";
import { getOverview } from "../api/stats";
import { getStreak } from "../api/streak";

const loading = ref(false);
const error = ref("");
const overview = ref<Record<string, unknown>>({});
const streak = ref<Record<string, unknown>>({});

const overviewEntries = computed(() => Object.entries(overview.value || {}));
const streakEntries = computed(() => Object.entries(streak.value || {}));

function formatValue(value: unknown) {
  if (value === null || value === undefined) return "-";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

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
.hint {
  margin: 6px 0 0;
  color: #746652;
}

.hero-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(260px, 1fr));
  gap: 16px;
}

.top-gap {
  margin-top: 10px;
}

.muted {
  color: #857764;
}

@media (max-width: 900px) {
  .hero-grid {
    grid-template-columns: 1fr;
  }
}
</style>
