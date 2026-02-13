<template>
  <section class="page">
    <header class="row between wrap">
      <div>
        <h2>学习建议</h2>
        <p class="hint">基于你的作答数据给出阶段性行动建议。</p>
      </div>
      <button class="btn" :disabled="loading" @click="load">刷新</button>
    </header>

    <div class="panel" v-if="error">{{ error }}</div>

    <article class="panel" v-if="!hasEnoughData">
      <h3>数据不足</h3>
      <p>{{ advisor.message || "当前数据不足以生成建议，请继续练习后再查看。" }}</p>
    </article>

    <template v-else>
      <section class="metric-grid">
        <article class="kv-item" v-for="item in analysisCards" :key="item.label">
          <small>{{ item.label }}</small>
          <strong>{{ item.value }}</strong>
        </article>
      </section>

      <article class="panel">
        <h3>建议动作</h3>
        <ol class="advice-list top-gap">
          <li v-for="(item, idx) in advices" :key="idx">{{ item }}</li>
          <li v-if="advices.length === 0">暂无建议</li>
        </ol>
      </article>

      <article class="panel">
        <h3>本周计划</h3>
        <div class="kv-grid top-gap">
          <div class="kv-item" v-for="item in planCards" :key="item.label">
            <small>{{ item.label }}</small>
            <strong>{{ item.value }}</strong>
          </div>
        </div>
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
import { getAdvisor } from "../../api/stats";

type GenericMap = Record<string, unknown>;

const loading = ref(false);
const error = ref("");
const advisor = ref<GenericMap>({});

const hasEnoughData = computed(() => Boolean(advisor.value.hasEnoughData));

const analysisCards = computed(() => {
  const analysis = (advisor.value.analysis || {}) as GenericMap;
  return [
    { label: "正确率", value: `${analysis.correctRate ?? "0.0"}%` },
    { label: "总作答数", value: String(analysis.totalAnswered ?? 0) },
    { label: "错题数", value: String(analysis.wrongQuestionCount ?? 0) },
    { label: "学习时长", value: `${analysis.studyTimeHours ?? 0}h ${analysis.studyTimeMinutes ?? 0}m` }
  ];
});

const advices = computed(() => ((advisor.value.advices || []) as unknown[]).map((v) => String(v)));

const planCards = computed(() => {
  const plan = (advisor.value.plan || {}) as GenericMap;
  return [
    { label: "每日目标", value: String(plan.dailyGoal ?? "-") },
    { label: "周计划", value: String(plan.weeklyPlan ?? "-") },
    { label: "重点方向", value: String(plan.focusAreas ?? "-") }
  ];
});

const errorTypeRows = computed(() => {
  const map = (advisor.value.errorTypes || {}) as GenericMap;
  return Object.entries(map).map(([type, count]) => ({ type, count: Number(count || 0) }));
});

async function load() {
  loading.value = true;
  error.value = "";
  try {
    advisor.value = await getAdvisor();
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

.advice-list {
  margin: 0;
  padding-left: 18px;
  display: grid;
  gap: 6px;
  line-height: 1.6;
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
