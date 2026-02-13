<template>
  <section class="page">
    <header class="row between wrap">
      <div>
        <h2>错题统计</h2>
        <p class="hint">定位高频错误题型，优先安排复习。</p>
      </div>
      <button class="btn" :disabled="loading" @click="load">刷新</button>
    </header>

    <div class="panel" v-if="error">{{ error }}</div>

    <section class="metric-grid">
      <article class="kv-item">
        <small>错题数量</small>
        <strong>{{ data.count ?? 0 }}</strong>
      </article>
      <article class="kv-item">
        <small>错题率</small>
        <strong>{{ data.wrongRate ?? "0.0" }}%</strong>
      </article>
      <article class="kv-item">
        <small>错题编号数</small>
        <strong>{{ wrongIds.length }}</strong>
      </article>
    </section>

    <article class="panel">
      <h3>错题题型分布</h3>
      <div class="chips top-gap">
        <span class="chip" v-for="item in typeRows" :key="item.type">{{ item.type }}: {{ item.count }}</span>
        <span class="chip muted" v-if="typeRows.length === 0">暂无分布数据</span>
      </div>
    </article>

    <article class="panel">
      <h3>错题清单</h3>
      <div class="table-wrap top-gap">
        <table>
          <thead>
            <tr>
              <th>题号</th>
              <th>题型</th>
              <th>题干</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="q in questions" :key="q.id">
              <td>{{ q.id }}</td>
              <td>{{ q.type }}</td>
              <td>{{ q.text }}</td>
            </tr>
            <tr v-if="questions.length === 0">
              <td colspan="3">暂无错题</td>
            </tr>
          </tbody>
        </table>
      </div>
    </article>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { getWrongQuestions } from "../../api/stats";

type GenericMap = Record<string, unknown>;

const loading = ref(false);
const error = ref("");
const data = ref<GenericMap>({});

const typeRows = computed(() => {
  const map = (data.value.wrongTypes || {}) as GenericMap;
  return Object.entries(map).map(([type, count]) => ({ type, count: Number(count || 0) }));
});

const questions = computed(() => {
  const list = (data.value.questions || []) as Array<GenericMap>;
  return list.map((item) => ({
    id: String(item.id || ""),
    type: String(item.type || ""),
    text: String(item.text || "")
  }));
});

const wrongIds = computed(() => ((data.value.wrongIds || []) as unknown[]).map((v) => String(v)));

async function load() {
  loading.value = true;
  error.value = "";
  try {
    data.value = await getWrongQuestions();
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
