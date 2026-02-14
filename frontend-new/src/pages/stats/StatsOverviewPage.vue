<template>
  <section class="page">
    <header class="row between wrap">
      <div>
        <h2>统计概览</h2>
        <p class="hint">从全局数据看学习完成度与质量。</p>
      </div>
      <button class="btn" :disabled="loading" @click="loadAll">刷新</button>
    </header>

    <div class="panel" v-if="error">{{ error }}</div>

    <section class="metric-grid">
      <article class="kv-item" v-for="item in metricCards" :key="item.label">
        <small>{{ item.label }}</small>
        <strong>{{ item.value }}</strong>
      </article>
    </section>

    <article class="panel">
      <h3>按题型统计</h3>
      <div class="table-wrap top-gap">
        <table>
          <thead>
            <tr>
              <th>题型</th>
              <th>总题数</th>
              <th>已作答</th>
              <th>正确数</th>
              <th>正确率</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in categoryRows" :key="row.type">
              <td>{{ row.type }}</td>
              <td>{{ row.total }}</td>
              <td>{{ row.answered }}</td>
              <td>{{ row.correct }}</td>
              <td>{{ row.correctRate }}%</td>
            </tr>
            <tr v-if="categoryRows.length === 0">
              <td colspan="5">暂无题型统计</td>
            </tr>
          </tbody>
        </table>
      </div>
    </article>

    <article class="panel">
      <h3>最近学习会话</h3>
      <div class="table-wrap top-gap">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>模式</th>
              <th>开始时间</th>
              <th>结束时间</th>
              <th>作答数</th>
              <th>正确率</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in recentSessions" :key="row.id">
              <td>{{ row.id }}</td>
              <td>{{ row.mode }}</td>
              <td>{{ row.start_time || "-" }}</td>
              <td>{{ row.end_time || "-" }}</td>
              <td>{{ row.questions_answered }}</td>
              <td>{{ row.correctRate }}%</td>
            </tr>
            <tr v-if="recentSessions.length === 0">
              <td colspan="6">暂无会话记录</td>
            </tr>
          </tbody>
        </table>
      </div>
    </article>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { getCategories, getOverview, getSessions } from "../../api/stats";

type GenericMap = Record<string, unknown>;
type CategoryRow = {
  type: string;
  total: number;
  answered: number;
  correct: number;
  correctRate: string;
};
type SessionRow = {
  id: string;
  mode: string;
  start_time: string;
  end_time: string;
  questions_answered: number;
  correctRate: string;
};

const loading = ref(false);
const error = ref("");
const overview = ref<GenericMap>({});
const categories = ref<GenericMap>({});
const sessions = ref<Array<Record<string, unknown>>>([]);

const metricCards = computed(() => {
  const study = (overview.value.studyTime as GenericMap | undefined) || {};
  return [
    { label: "题库总量", value: String(overview.value.totalQuestions ?? 0) },
    { label: "已作答", value: String(overview.value.totalAnswered ?? 0) },
    { label: "正确题数", value: String(overview.value.correct ?? 0) },
    { label: "错题数", value: String(overview.value.wrongQuestionCount ?? 0) },
    { label: "正确率", value: `${overview.value.correctRate ?? "0.0"}%` },
    { label: "完成率", value: `${overview.value.completionRate ?? "0.0"}%` },
    { label: "学习时长", value: String(study.formatted ?? "-") },
    { label: "最近更新", value: String(overview.value.lastUpdated ?? "-") }
  ];
});

const categoryRows = computed<CategoryRow[]>(() => {
  return Object.entries(categories.value || {}).map(([type, data]) => {
    const row = (data || {}) as GenericMap;
    return {
      type: String(type),
      total: Number(row.total ?? 0),
      answered: Number(row.answered ?? 0),
      correct: Number(row.correct ?? 0),
      correctRate: String(row.correctRate ?? "0.0")
    };
  });
});

const recentSessions = computed<SessionRow[]>(() => {
  return sessions.value.slice(0, 8).map((row) => ({
    id: String(row.id ?? ""),
    mode: String(row.mode ?? ""),
    start_time: String(row.start_time ?? ""),
    end_time: String(row.end_time ?? ""),
    questions_answered: Number(row.questions_answered ?? 0),
    correctRate: String(row.correctRate ?? "0.0")
  }));
});

async function loadAll() {
  loading.value = true;
  error.value = "";
  try {
    const [o, c, s] = await Promise.all([getOverview(), getCategories(), getSessions()]);
    overview.value = o;
    categories.value = c;
    sessions.value = s;
  } catch (e) {
    error.value = (e as Error).message;
  } finally {
    loading.value = false;
  }
}

onMounted(loadAll);
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

.top-gap {
  margin-top: 10px;
}
</style>
