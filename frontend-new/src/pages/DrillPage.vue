<template>
  <section class="page">
    <header class="row between wrap">
      <div>
        <h2>专项训练</h2>
        <p class="hint">根据薄弱点自动抽题，优先练短板。</p>
      </div>
      <div class="row wrap">
        <label class="row">
          数量
          <input v-model.number="count" type="number" min="1" max="200" />
        </label>
        <button class="btn primary" :disabled="loading" @click="start">开始训练</button>
        <button class="btn" :disabled="loading" @click="analyze">刷新分析</button>
      </div>
    </header>

    <div class="panel" v-if="error">{{ error }}</div>

    <article class="panel">
      <h3>薄弱分类</h3>
      <div class="table-wrap top-gap">
        <table>
          <thead>
            <tr>
              <th>题型</th>
              <th>作答数</th>
              <th>正确数</th>
              <th>正确率</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in analysisRows" :key="item.type">
              <td>{{ item.type }}</td>
              <td>{{ item.total }}</td>
              <td>{{ item.correct }}</td>
              <td>{{ item.rate }}%</td>
            </tr>
            <tr v-if="analysisRows.length === 0">
              <td colspan="4">暂无分析数据</td>
            </tr>
          </tbody>
        </table>
      </div>
    </article>

    <article class="panel">
      <h3>训练题单</h3>
      <p class="hint-inline">共 {{ drillSummary.totalQuestions }} 题</p>
      <div class="table-wrap top-gap">
        <table>
          <thead>
            <tr>
              <th>题号</th>
              <th>题型</th>
              <th>题干</th>
              <th>答案</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="q in drillQuestions" :key="q.id">
              <td>{{ q.id }}</td>
              <td>{{ q.type }}</td>
              <td>{{ q.text }}</td>
              <td>{{ q.answer }}</td>
            </tr>
            <tr v-if="drillQuestions.length === 0">
              <td colspan="4">点击“开始训练”生成题单</td>
            </tr>
          </tbody>
        </table>
      </div>
    </article>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { getDrillAnalysis, startDrill } from "../api/drill";

type GenericMap = Record<string, unknown>;

const loading = ref(false);
const error = ref("");
const count = ref(20);
const startResult = ref<GenericMap>({});
const analysis = ref<GenericMap>({});

const drillSummary = computed(() => ({
  totalQuestions: Number(startResult.value.totalQuestions || 0)
}));

const drillQuestions = computed(() => {
  const list = (startResult.value.questions || []) as Array<GenericMap>;
  return list.map((q) => ({
    id: String(q.id || ""),
    type: String(q.type || ""),
    text: String(q.text || ""),
    answer: String(q.answer || "")
  }));
});

const analysisRows = computed(() => {
  const map = (analysis.value.categoryWeakness || {}) as GenericMap;
  return Object.entries(map).map(([type, item]) => {
    const row = (item || {}) as GenericMap;
    return {
      type,
      total: Number(row.total || 0),
      correct: Number(row.correct || 0),
      rate: Number(row.rate || 0)
    };
  });
});

async function start() {
  loading.value = true;
  error.value = "";
  try {
    startResult.value = await startDrill(count.value);
    if (startResult.value.analysis) {
      analysis.value = { categoryWeakness: startResult.value.analysis as GenericMap };
    }
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
    const data = await getDrillAnalysis();
    analysis.value = (data || {}) as GenericMap;
  } catch (e) {
    error.value = (e as Error).message;
  } finally {
    loading.value = false;
  }
}

onMounted(analyze);
</script>

<style scoped>
.hint {
  margin: 6px 0 0;
  color: #756954;
}

.hint-inline {
  margin: 4px 0 0;
  color: #786a56;
  font-size: 13px;
}

input {
  width: 96px;
}

.top-gap {
  margin-top: 10px;
}
</style>
