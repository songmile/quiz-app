<template>
  <section class="page">
    <header class="row between wrap">
      <div>
        <h2>学习进度</h2>
        <p class="hint">按题库和标签观察掌握程度。</p>
      </div>
      <button class="btn" :disabled="loading" @click="load">刷新</button>
    </header>

    <div class="panel" v-if="error">{{ error }}</div>

    <section class="metric-grid">
      <article class="kv-item" v-for="item in masteryCards" :key="item.label">
        <small>{{ item.label }}</small>
        <strong>{{ item.value }}</strong>
      </article>
    </section>

    <article class="panel">
      <h3>题库进度</h3>
      <div class="table-wrap top-gap">
        <table>
          <thead>
            <tr>
              <th>题库</th>
              <th>总题数</th>
              <th>已作答</th>
              <th>正确数</th>
              <th>正确率</th>
              <th>掌握率</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in bankRows" :key="row.bankName">
              <td>{{ row.bankName }}</td>
              <td>{{ row.totalQuestions }}</td>
              <td>{{ row.answeredCount }}</td>
              <td>{{ row.correctCount }}</td>
              <td>{{ row.correctRate }}%</td>
              <td>{{ row.masteryRate }}%</td>
            </tr>
            <tr v-if="bankRows.length === 0">
              <td colspan="6">暂无题库进度</td>
            </tr>
          </tbody>
        </table>
      </div>
    </article>

    <article class="panel">
      <h3>标签进度</h3>
      <div class="table-wrap top-gap">
        <table>
          <thead>
            <tr>
              <th>标签</th>
              <th>总题数</th>
              <th>已作答</th>
              <th>正确数</th>
              <th>正确率</th>
              <th>掌握率</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in tagRows" :key="row.tag">
              <td>{{ row.tag }}</td>
              <td>{{ row.totalQuestions }}</td>
              <td>{{ row.answeredCount }}</td>
              <td>{{ row.correctCount }}</td>
              <td>{{ row.correctRate }}%</td>
              <td>{{ row.masteryRate }}%</td>
            </tr>
            <tr v-if="tagRows.length === 0">
              <td colspan="6">暂无标签进度</td>
            </tr>
          </tbody>
        </table>
      </div>
    </article>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { getBankProgress, getMastery, getTagProgress } from "../../api/stats";

type GenericMap = Record<string, unknown>;
type ProgressRow = {
  bankName?: string;
  tag?: string;
  totalQuestions: number;
  answeredCount: number;
  correctCount: number;
  correctRate: string;
  masteryRate: string;
};

const loading = ref(false);
const error = ref("");
const bankProgress = ref<Array<GenericMap>>([]);
const tagProgress = ref<Array<GenericMap>>([]);
const mastery = ref<GenericMap>({});

const masteryCards = computed(() => [
  { label: "总题数", value: String(mastery.value.totalQuestions ?? 0) },
  { label: "已掌握", value: String(mastery.value.masteredCount ?? 0) },
  { label: "学习中", value: String(mastery.value.learningCount ?? 0) },
  { label: "未开始", value: String(mastery.value.newCount ?? 0) },
  { label: "待复习", value: String(mastery.value.dueCount ?? 0) },
  { label: "掌握率", value: `${mastery.value.masteryRate ?? "0.0"}%` }
]);

const bankRows = computed<ProgressRow[]>(() => {
  return bankProgress.value.map((row) => ({
    bankName: String(row.bankName ?? "-"),
    totalQuestions: Number(row.totalQuestions ?? 0),
    answeredCount: Number(row.answeredCount ?? 0),
    correctCount: Number(row.correctCount ?? 0),
    correctRate: String(row.correctRate ?? "0.0"),
    masteryRate: String(row.masteryRate ?? "0.0")
  }));
});

const tagRows = computed<ProgressRow[]>(() => {
  return tagProgress.value.map((row) => ({
    tag: String(row.tag ?? "-"),
    totalQuestions: Number(row.totalQuestions ?? 0),
    answeredCount: Number(row.answeredCount ?? 0),
    correctCount: Number(row.correctCount ?? 0),
    correctRate: String(row.correctRate ?? "0.0"),
    masteryRate: String(row.masteryRate ?? "0.0")
  }));
});

async function load() {
  loading.value = true;
  error.value = "";
  try {
    const [b, t, m] = await Promise.all([getBankProgress(), getTagProgress(), getMastery()]);
    bankProgress.value = b;
    tagProgress.value = t;
    mastery.value = m;
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

.top-gap {
  margin-top: 10px;
}
</style>
