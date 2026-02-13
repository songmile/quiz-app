<template>
  <section class="page">
    <header class="row between wrap">
      <div>
        <h2>趋势分析</h2>
        <p class="hint">关注近期正确率变化，及时调整训练策略。</p>
      </div>
      <button class="btn" :disabled="loading" @click="load">刷新</button>
    </header>

    <div class="panel" v-if="error">{{ error }}</div>

    <article class="panel" v-if="!hasTrend">
      <h3>趋势数据不足</h3>
      <p>{{ trendData.message || "至少需要 3 次学习会话后才会显示趋势分析。" }}</p>
    </article>

    <template v-else>
      <section class="metric-grid">
        <article class="kv-item" v-for="item in trendCards" :key="item.label">
          <small>{{ item.label }}</small>
          <strong>{{ item.value }}</strong>
        </article>
      </section>

      <article class="panel">
        <h3>趋势结论</h3>
        <p class="summary top-gap">{{ trendSummary }}</p>
      </article>

      <article class="panel">
        <h3>错误类型分布</h3>
        <div class="chips top-gap">
          <span class="chip" v-for="item in errorTypeRows" :key="item.type">{{ item.type }}: {{ item.count }}</span>
          <span class="chip muted" v-if="errorTypeRows.length === 0">暂无数据</span>
        </div>
      </article>
    </template>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { getTrends } from "../../api/stats";

type GenericMap = Record<string, unknown>;

const loading = ref(false);
const error = ref("");
const trendData = ref<GenericMap>({});

const hasTrend = computed(() => Boolean(trendData.value.hasTrend));

const trend = computed(() => (trendData.value.trend || {}) as GenericMap);

const trendCards = computed(() => [
  { label: "方向", value: directionLabel(String(trend.value.direction || "stable")) },
  { label: "近期均值", value: `${trend.value.recentAverage ?? "0.0"}%` },
  { label: "历史均值", value: `${trend.value.earlierAverage ?? "0.0"}%` },
  { label: "变化幅度", value: `${trend.value.changePercentage ?? "0.0"}%` }
]);

const trendSummary = computed(() => String(trend.value.description || "暂无结论"));

const errorTypeRows = computed(() => {
  const map = (trendData.value.errorTypes || {}) as GenericMap;
  return Object.entries(map).map(([type, count]) => ({ type, count: Number(count || 0) }));
});

function directionLabel(direction: string) {
  if (direction === "up") return "上升";
  if (direction === "down") return "下降";
  return "稳定";
}

async function load() {
  loading.value = true;
  error.value = "";
  try {
    trendData.value = await getTrends();
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
  color: #756954;
}

.metric-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
  gap: 10px;
}

.summary {
  margin: 0;
  line-height: 1.7;
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.chip {
  padding: 5px 10px;
  border: 1px solid #ccb89a;
  border-radius: 999px;
  background: #fef8ec;
  font-size: 13px;
}

.chip.muted {
  color: #8b7d66;
}

.top-gap {
  margin-top: 10px;
}
</style>
