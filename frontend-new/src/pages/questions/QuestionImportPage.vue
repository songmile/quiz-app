<template>
  <section class="page">
    <header class="row between wrap">
      <div>
        <h2>题目导入</h2>
        <p class="hint">支持文本解析导入和 AI 分片导入。</p>
      </div>
      <RouterLink class="btn" to="/questions">返回题目列表</RouterLink>
    </header>

    <article class="panel">
      <h3>导入配置</h3>
      <div class="row wrap top-gap">
        <label>
          导入模式
          <select v-model="mode">
            <option value="add">追加</option>
            <option value="replace">替换</option>
          </select>
        </label>
        <label>
          题库
          <select v-model="bankId">
            <option value="">未分组</option>
            <option v-for="b in banks" :key="b.id" :value="b.id">{{ b.name }}</option>
          </select>
        </label>
      </div>
    </article>

    <article class="panel">
      <h3>文本导入</h3>
      <textarea v-model="textContent" rows="10" placeholder="粘贴结构化题目文本" />
      <div class="row top-gap">
        <button class="btn primary" :disabled="loading || !textContent.trim()" @click="importText">开始文本导入</button>
      </div>
    </article>

    <article class="panel">
      <h3>AI 导入</h3>
      <textarea v-model="aiContent" rows="10" placeholder="粘贴原始资料，后端将分片调用 AI 解析" />
      <div class="row top-gap">
        <button class="btn" :disabled="loading || !aiContent.trim()" @click="importAi">启动 AI 导入</button>
      </div>

      <div v-if="status" class="top-gap status-box">
        <div class="row between wrap">
          <strong>任务状态：{{ status.status }}</strong>
          <span>{{ status.progress.percentage }}%</span>
        </div>
        <progress :value="Number(status.progress.percentage)" max="100"></progress>
        <div class="kv-grid top-gap">
          <div class="kv-item"><small>总分片</small><strong>{{ status.progress.total }}</strong></div>
          <div class="kv-item"><small>已处理</small><strong>{{ status.progress.processed }}</strong></div>
          <div class="kv-item"><small>成功</small><strong>{{ status.progress.successful }}</strong></div>
          <div class="kv-item"><small>失败</small><strong>{{ status.progress.failed }}</strong></div>
          <div class="kv-item"><small>导入题数</small><strong>{{ status.importedCount }}</strong></div>
          <div class="kv-item"><small>耗时</small><strong>{{ status.duration }}s</strong></div>
        </div>
        <div class="panel top-gap" v-if="status.errors.length">
          <h4>错误日志</h4>
          <pre>{{ status.errors.join("\n") }}</pre>
        </div>
      </div>
    </article>

    <article class="panel" v-if="resultObj">
      <h3>最近操作结果</h3>
      <div class="kv-grid top-gap">
        <div class="kv-item" v-for="item in resultCards" :key="item.label">
          <small>{{ item.label }}</small>
          <strong>{{ item.value }}</strong>
        </div>
      </div>
      <div class="table-wrap top-gap" v-if="resultPreview.length">
        <table>
          <thead>
            <tr>
              <th>题号</th>
              <th>题型</th>
              <th>题干</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in resultPreview" :key="row.id">
              <td>{{ row.id }}</td>
              <td>{{ row.type }}</td>
              <td>{{ row.text }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </article>

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
const resultObj = ref<Record<string, unknown> | null>(null);
const status = ref<ImportStatus | null>(null);
const pollTimer = ref<number | null>(null);

const mode = ref<"add" | "replace">("add");
const bankId = ref("");
const textContent = ref("");
const aiContent = ref("");
const banks = ref<BankItem[]>([]);

const resultCards = ref<Array<{ label: string; value: string }>>([]);
const resultPreview = ref<Array<{ id: string; type: string; text: string }>>([]);

function buildResultView(data: Record<string, unknown>) {
  const cards: Array<{ label: string; value: string }> = [];
  if (data.message) cards.push({ label: "消息", value: String(data.message) });
  if (data.importId) cards.push({ label: "导入任务ID", value: String(data.importId) });
  if (data.mode) cards.push({ label: "模式", value: String(data.mode) });
  if (data.parsedCount !== undefined) cards.push({ label: "解析数", value: String(data.parsedCount) });
  if (data.insertedCount !== undefined) cards.push({ label: "插入数", value: String(data.insertedCount) });
  if (data.duplicateCount !== undefined) cards.push({ label: "重复数", value: String(data.duplicateCount) });
  if (cards.length === 0) {
    Object.entries(data)
      .filter(([, value]) => value === null || ["string", "number", "boolean"].includes(typeof value))
      .forEach(([key, value]) => cards.push({ label: key, value: String(value ?? "-") }));
  }
  resultCards.value = cards;

  const list = Array.isArray(data.data) ? data.data as Array<Record<string, unknown>> : [];
  resultPreview.value = list.slice(0, 10).map((item) => ({
    id: String(item.id || ""),
    type: String(item.type || ""),
    text: String(item.text || "")
  }));
}

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
  resultObj.value = null;
  resultCards.value = [];
  resultPreview.value = [];
  try {
    const data = await importTextQuestions(textContent.value, mode.value, bankId.value || null) as Record<string, unknown>;
    resultObj.value = data;
    buildResultView(data);
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
  }, 1500);
}

async function importAi() {
  loading.value = true;
  error.value = "";
  resultObj.value = null;
  resultCards.value = [];
  resultPreview.value = [];
  status.value = null;
  try {
    const data = await importQuestionsWithAi(aiContent.value, mode.value, bankId.value || null);
    resultObj.value = data;
    buildResultView(data as unknown as Record<string, unknown>);
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
.hint {
  margin: 6px 0 0;
  color: #756954;
}

label {
  display: grid;
  gap: 6px;
  color: #5f513e;
}

.top-gap {
  margin-top: 10px;
}

.status-box {
  border: 1px dashed #d8c8ad;
  border-radius: 12px;
  padding: 10px;
  background: #fffcf5;
}

progress {
  width: 100%;
  height: 10px;
}

textarea {
  width: 100%;
}
</style>
