<template>
  <section class="page">
    <header class="row between">
      <h2>题目导入</h2>
      <RouterLink class="btn" to="/questions">返回列表</RouterLink>
    </header>

    <div class="panel row wrap">
      <label>模式
        <select v-model="mode">
          <option value="add">追加</option>
          <option value="replace">替换</option>
        </select>
      </label>
      <label>题库
        <select v-model="bankId">
          <option value="">未分组</option>
          <option v-for="b in banks" :key="b.id" :value="b.id">{{ b.name }}</option>
        </select>
      </label>
    </div>

    <div class="panel">
      <h3>文本本地导入</h3>
      <textarea v-model="textContent" rows="12" placeholder="粘贴题目文本" />
      <div class="row top-gap">
        <button class="btn" :disabled="loading" @click="importText">开始导入</button>
      </div>
    </div>

    <div class="panel">
      <h3>AI 导入</h3>
      <textarea v-model="aiContent" rows="12" placeholder="粘贴原始题目资料，后端将分块调用 AI" />
      <div class="row top-gap">
        <button class="btn" :disabled="loading" @click="importAi">启动 AI 导入</button>
      </div>

      <div v-if="status" class="top-gap">
        <div class="row between">
          <strong>任务状态: {{ status.status }}</strong>
          <span>{{ status.progress.percentage }}%</span>
        </div>
        <progress :value="Number(status.progress.percentage)" max="100" />
        <p>已处理 {{ status.progress.processed }} / {{ status.progress.total }}，成功 {{ status.progress.successful }}，失败 {{ status.progress.failed }}</p>
        <p>已导入 {{ status.importedCount }}，耗时 {{ status.duration }}s</p>
        <pre v-if="status.errors.length">{{ status.errors.join('\n') }}</pre>
      </div>
    </div>

    <div class="panel" v-if="result">
      <h3>结果</h3>
      <pre>{{ JSON.stringify(result, null, 2) }}</pre>
    </div>

    <div class="panel" v-if="error">{{ error }}</div>
  </section>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";
import { RouterLink } from "vue-router";
import { getBanks, type BankItem } from "../../api/bank";
import { getImportStatus, importQuestionsWithAi, importTextQuestions, type ImportStatus } from "../../api/question";

const loading = ref(false);
const error = ref("");
const result = ref<unknown>(null);
const status = ref<ImportStatus | null>(null);
const pollTimer = ref<number | null>(null);

const mode = ref<"add" | "replace">("add");
const bankId = ref("");
const textContent = ref("");
const aiContent = ref("");
const banks = ref<BankItem[]>([]);

async function loadBanks() {
  try {
    banks.value = await getBanks();
  } catch {
    banks.value = [];
  }
}

async function importText() {
  loading.value = true;
  error.value = "";
  result.value = null;
  try {
    result.value = await importTextQuestions(textContent.value, mode.value, bankId.value || null);
  } catch (e) {
    error.value = (e as Error).message;
  } finally {
    loading.value = false;
  }
}

function stopPolling() {
  if (pollTimer.value) {
    window.clearInterval(pollTimer.value);
    pollTimer.value = null;
  }
}

function startPolling(importId: string) {
  stopPolling();
  pollTimer.value = window.setInterval(async () => {
    try {
      const current = await getImportStatus(importId);
      status.value = current;
      if (current.status === "completed" || current.status === "failed") {
        stopPolling();
      }
    } catch (e) {
      error.value = (e as Error).message;
      stopPolling();
    }
  }, 2000);
}

async function importAi() {
  loading.value = true;
  error.value = "";
  result.value = null;
  status.value = null;
  try {
    const data = await importQuestionsWithAi(aiContent.value, mode.value, bankId.value || null);
    result.value = data;
    startPolling(data.importId);
  } catch (e) {
    error.value = (e as Error).message;
  } finally {
    loading.value = false;
  }
}

onMounted(loadBanks);
onBeforeUnmount(stopPolling);
</script>

<style scoped>
.page { display: grid; gap: 12px; }
.row { display: flex; gap: 8px; align-items: center; }
.wrap { flex-wrap: wrap; }
.between { justify-content: space-between; }
.panel { border: 1px solid #dcdfe6; border-radius: 8px; padding: 12px; display: grid; gap: 8px; }
textarea, select { border: 1px solid #c9ced6; border-radius: 6px; padding: 8px; font: inherit; width: 100%; }
.btn { border: 1px solid #c9ced6; background: #fff; padding: 6px 10px; border-radius: 6px; cursor: pointer; text-decoration: none; color: #222; }
pre { white-space: pre-wrap; word-break: break-word; background: #fafbfc; border: 1px solid #eef1f4; border-radius: 6px; padding: 10px; }
progress { width: 100%; }
.top-gap { margin-top: 8px; }
</style>
