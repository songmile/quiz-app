<template>
  <section class="page">
    <header class="row between wrap">
      <div>
        <h2>题库备份</h2>
        <p class="hint">用于快速保存或回滚题库数据。</p>
      </div>
      <RouterLink class="btn" to="/questions">返回题目列表</RouterLink>
    </header>

    <article class="panel">
      <h3>创建备份</h3>
      <p class="hint-inline">系统会生成 `backupId` 供后续恢复使用。</p>
      <div class="row top-gap">
        <button class="btn primary" :disabled="loading" @click="backup">创建备份</button>
      </div>
    </article>

    <article class="panel">
      <h3>恢复备份</h3>
      <p class="hint-inline">恢复会覆盖当前题库，请先确认。</p>
      <div class="row wrap top-gap">
        <input v-model.trim="backupId" placeholder="输入 backupId 或文件名" />
        <button class="btn danger" :disabled="loading || !backupId" @click="restore">执行恢复</button>
      </div>
    </article>

    <div class="panel" v-if="error">{{ error }}</div>

    <article class="panel" v-if="result.backupId">
      <h3>最近操作结果</h3>
      <div class="kv-grid top-gap">
        <div class="kv-item">
          <small>backupId</small>
          <strong>{{ result.backupId }}</strong>
        </div>
        <div class="kv-item">
          <small>文件名</small>
          <strong>{{ result.filename }}</strong>
        </div>
        <div class="kv-item">
          <small>题目数量</small>
          <strong>{{ result.questionCount }}</strong>
        </div>
        <div class="kv-item">
          <small>时间</small>
          <strong>{{ result.timestamp }}</strong>
        </div>
      </div>
    </article>
  </section>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";
import { RouterLink } from "vue-router";
import { createQuestionBackup, restoreQuestionBackup } from "../../api/question";

const loading = ref(false);
const error = ref("");
const backupId = ref("");
const result = reactive({
  backupId: "",
  filename: "",
  timestamp: "",
  questionCount: 0
});

function fill(payload: Record<string, unknown>) {
  result.backupId = String(payload.backupId || "");
  result.filename = String(payload.filename || "");
  result.timestamp = String(payload.timestamp || "");
  result.questionCount = Number(payload.questionCount || 0);
}

async function backup() {
  loading.value = true;
  error.value = "";
  try {
    fill(await createQuestionBackup());
    backupId.value = result.backupId;
  } catch (e) {
    error.value = (e as Error).message;
  } finally {
    loading.value = false;
  }
}

async function restore() {
  if (!confirm("恢复会覆盖当前题库，继续？")) return;
  loading.value = true;
  error.value = "";
  try {
    fill(await restoreQuestionBackup(backupId.value));
  } catch (e) {
    error.value = (e as Error).message;
  } finally {
    loading.value = false;
  }
}
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
  min-width: 280px;
}

.top-gap {
  margin-top: 10px;
}
</style>
