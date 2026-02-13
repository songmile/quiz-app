<template>
  <section class="page">
    <header class="row between wrap">
      <div>
        <h2>学习时间线</h2>
        <p class="hint">按周期观察作答量和正确率波动。</p>
      </div>
      <div class="row wrap">
        <select v-model="period">
          <option value="daily">日</option>
          <option value="weekly">周</option>
          <option value="monthly">月</option>
          <option value="yearly">年</option>
        </select>
        <button class="btn" :disabled="loading" @click="load">查询</button>
      </div>
    </header>

    <div class="panel" v-if="error">{{ error }}</div>

    <section class="metric-grid">
      <article class="kv-item" v-for="item in summaryCards" :key="item.label">
        <small>{{ item.label }}</small>
        <strong>{{ item.value }}</strong>
      </article>
    </section>

    <article class="panel">
      <h3>周期明细</h3>
      <div class="table-wrap top-gap">
        <table>
          <thead>
            <tr>
              <th>周期</th>
              <th>作答数</th>
              <th>正确数</th>
              <th>正确率</th>
              <th>强度</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in timelineRows" :key="row.period">
              <td>{{ row.period }}</td>
              <td>{{ row.total }}</td>
              <td>{{ row.correct }}</td>
              <td>{{ row.correctRate }}%</td>
              <td>
                <div class="bar-track">
                  <div class="bar-fill" :style="{ width: `${row.correctRate}%` }"></div>
                </div>
              </td>
            </tr>
            <tr v-if="timelineRows.length === 0">
              <td colspan="5">暂无时间线数据</td>
            </tr>
          </tbody>
        </table>
      </div>
    </article>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { getTimeline } from "../../api/stats";

type GenericMap = Record<string, unknown>;

const loading = ref(false);
const error = ref("");
const period = ref("daily");
const timelineData = ref<GenericMap>({});

const summaryCards = computed(() => {
  const summary = (timelineData.value.summary || {}) as GenericMap;
  return [
    { label: "周期类型", value: String(summary.period || period.value) },
    { label: "起始", value: String(summary.startDate || "-") },
    { label: "结束", value: String(summary.endDate || "-") },
    { label: "总作答", value: String(summary.totalAnswered || 0) },
    { label: "总正确", value: String(summary.totalCorrect || 0) },
    { label: "平均正确率", value: `${summary.correctRate || "0.0"}%` }
  ];
});

const timelineRows = computed(() => {
  const list = (timelineData.value.timeline || []) as Array<GenericMap>;
  return list.map((row) => ({
    period: String(row.period || ""),
    total: Number(row.total || 0),
    correct: Number(row.correct || 0),
    correctRate: Number(row.correctRate || 0)
  }));
});

async function load() {
  loading.value = true;
  error.value = "";
  try {
    timelineData.value = await getTimeline({ period: period.value });
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

.bar-track {
  width: 160px;
  max-width: 100%;
  height: 8px;
  border-radius: 999px;
  background: #ebe1cf;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #1d9c8a 0%, #0f766e 100%);
}

.top-gap {
  margin-top: 10px;
}
</style>
