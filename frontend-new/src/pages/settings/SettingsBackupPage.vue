<template>
  <section class="page">
    <header class="row between">
      <h2>备份与恢复</h2>
      <button class="btn" :disabled="loading" @click="load">刷新</button>
    </header>

    <div class="panel row wrap">
      <button class="btn" :disabled="loading" @click="backup">创建完整备份</button>
      <span class="job-badge" v-if="backupPolling">备份任务执行中：{{ backupJobNo }}</span>
      <input v-model="restoreFilename" placeholder="选择或输入备份文件名" />
      <button class="btn" :disabled="loading || !restoreFilename" @click="restore">恢复备份</button>
    </div>

    <div class="panel row wrap">
      <input v-model="dataPath" placeholder="数据目录，如 D:\\quiz-data" />
      <button class="btn" :disabled="loading || !dataPath" @click="saveDataPath">更新数据路径</button>
    </div>

    <div class="panel" v-if="error">{{ error }}</div>

    <div class="panel" v-if="resultObject">
      <h3>最近操作结果</h3>
      <div class="kv-grid top-gap" v-if="resultKind === 'job'">
        <div class="kv-item">
          <small>任务号</small>
          <strong>{{ resultObject.jobNo }}</strong>
        </div>
        <div class="kv-item">
          <small>状态</small>
          <strong>{{ resultObject.status }}</strong>
        </div>
        <div class="kv-item">
          <small>重试</small>
          <strong>{{ resultObject.retryCount }} / {{ resultObject.maxRetries }}</strong>
        </div>
        <div class="kv-item">
          <small>备份文件</small>
          <strong>{{ resultObject.filename || "-" }}</strong>
        </div>
      </div>
      <div class="kv-grid top-gap" v-else-if="resultKind === 'restore'">
        <div class="kv-item">
          <small>恢复文件</small>
          <strong>{{ resultObject.filename }}</strong>
        </div>
        <div class="kv-item">
          <small>影响表数</small>
          <strong>{{ restoreSummary.tables }}</strong>
        </div>
        <div class="kv-item">
          <small>写入行数</small>
          <strong>{{ restoreSummary.rows }}</strong>
        </div>
        <div class="kv-item">
          <small>回滚文件</small>
          <strong>{{ restoreSummary.rollback }}</strong>
        </div>
      </div>
      <div class="kv-grid top-gap" v-else-if="resultKind === 'path'">
        <div class="kv-item">
          <small>数据目录</small>
          <strong>{{ resultObject.path }}</strong>
        </div>
      </div>
      <div class="kv-grid top-gap" v-else>
        <div class="kv-item" v-for="entry in scalarEntries" :key="entry.key">
          <small>{{ entry.key }}</small>
          <strong>{{ entry.value }}</strong>
        </div>
      </div>
    </div>

    <div class="panel">
      <h3>备份文件</h3>
      <div class="table-wrap top-gap">
        <table class="table">
          <thead>
            <tr>
              <th>文件名</th>
              <th>类型</th>
              <th>题目数</th>
              <th>大小</th>
              <th>时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="f in files" :key="f.filename">
              <td>{{ f.filename }}</td>
              <td>{{ f.type }}</td>
              <td>{{ f.questionCount }}</td>
              <td>{{ f.size }}</td>
              <td>{{ f.modifiedAt }}</td>
              <td><button class="btn" @click="restoreFilename = f.filename">选择</button></td>
            </tr>
            <tr v-if="files.length === 0"><td colspan="6">暂无备份</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import {
  createAppBackup,
  getBackupJobStatus,
  getSettings,
  listBackupFiles,
  restoreAppBackup,
  updateDataPath,
  type BackupFileItem
} from "../../api/settings";

const BACKUP_POLL_INTERVAL_MS = 1500;
const BACKUP_POLL_TIMEOUT_MS = 180000;

const loading = ref(false);
const error = ref("");
const result = ref<unknown>(null);
const files = ref<BackupFileItem[]>([]);
const restoreFilename = ref("");
const dataPath = ref("");
const backupPolling = ref(false);
const backupJobNo = ref("");

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : null;
}

const resultObject = computed(() => asRecord(result.value));
const resultKind = computed(() => {
  const obj = resultObject.value;
  if (!obj) return "";
  if (obj.jobNo) return "job";
  if (obj.stats) return "restore";
  if (obj.path) return "path";
  return "generic";
});
const restoreSummary = computed(() => {
  const obj = resultObject.value || {};
  const stats = (obj.stats || {}) as Record<string, unknown>;
  const rows = Object.values(stats).reduce<number>((sum, v) => sum + Number(v || 0), 0);
  const rollback = ((obj.rollback || {}) as Record<string, unknown>).filename || "-";
  return {
    tables: Object.keys(stats).length,
    rows,
    rollback: String(rollback)
  };
});
const scalarEntries = computed(() => {
  const obj = resultObject.value || {};
  return Object.entries(obj)
    .filter(([, value]) => value === null || ["string", "number", "boolean"].includes(typeof value))
    .map(([key, value]) => ({ key, value: String(value ?? "-") }));
});

let backupPollTimer: ReturnType<typeof setTimeout> | null = null;
let backupPollStartedAt = 0;

async function load() {
  loading.value = true;
  error.value = "";
  try {
    const [fileList, settings] = await Promise.all([listBackupFiles(), getSettings()]);
    files.value = fileList;
    dataPath.value = settings.data_path || "";
  } catch (e) {
    error.value = (e as Error).message;
  } finally {
    loading.value = false;
  }
}

async function refreshBackupFiles() {
  files.value = await listBackupFiles();
}

function stopBackupPolling() {
  backupPolling.value = false;
  if (backupPollTimer) {
    clearTimeout(backupPollTimer);
    backupPollTimer = null;
  }
}

function scheduleBackupPoll() {
  backupPollTimer = setTimeout(() => {
    void pollBackupStatus();
  }, BACKUP_POLL_INTERVAL_MS);
}

async function pollBackupStatus() {
  if (!backupJobNo.value) {
    stopBackupPolling();
    loading.value = false;
    return;
  }
  try {
    const job = await getBackupJobStatus(backupJobNo.value);
    result.value = job;
    if (job.status === "completed") {
      stopBackupPolling();
      await refreshBackupFiles();
      loading.value = false;
      return;
    }
    if (job.status === "failed") {
      stopBackupPolling();
      error.value = job.error || "备份失败";
      loading.value = false;
      return;
    }
    if (Date.now() - backupPollStartedAt > BACKUP_POLL_TIMEOUT_MS) {
      stopBackupPolling();
      error.value = "备份任务轮询超时，请稍后手动刷新";
      loading.value = false;
      return;
    }
    scheduleBackupPoll();
  } catch (e) {
    stopBackupPolling();
    error.value = (e as Error).message;
    loading.value = false;
  }
}

async function backup() {
  if (backupPolling.value) return;
  loading.value = true;
  error.value = "";
  try {
    const job = await createAppBackup();
    result.value = { ...job };
    backupJobNo.value = job.jobNo;
    backupPolling.value = true;
    backupPollStartedAt = Date.now();
    scheduleBackupPoll();
  } catch (e) {
    error.value = (e as Error).message;
    loading.value = false;
  }
}

async function restore() {
  if (!confirm("恢复将覆盖当前数据，继续？")) return;
  loading.value = true;
  error.value = "";
  try {
    result.value = await restoreAppBackup(restoreFilename.value.trim());
  } catch (e) {
    error.value = (e as Error).message;
  } finally {
    loading.value = false;
  }
}

async function saveDataPath() {
  loading.value = true;
  error.value = "";
  try {
    result.value = await updateDataPath(dataPath.value.trim());
  } catch (e) {
    error.value = (e as Error).message;
  } finally {
    loading.value = false;
  }
}

onMounted(load);
onBeforeUnmount(stopBackupPolling);
</script>

<style scoped>
input { min-width: 260px; }

.top-gap {
  margin-top: 10px;
}

.job-badge {
  display: inline-flex;
  align-items: center;
  padding: 5px 10px;
  border: 1px solid #b7d4cb;
  border-radius: 999px;
  background: #e8f6f2;
  color: #1b6f63;
  font-size: 13px;
}
</style>
