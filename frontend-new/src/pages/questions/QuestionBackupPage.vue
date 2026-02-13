<template>
  <section class="page">
    <header class="row between">
      <h2>题库备份</h2>
      <RouterLink class="btn" to="/questions">返回列表</RouterLink>
    </header>

    <div class="panel row wrap">
      <button class="btn" :disabled="loading" @click="backup">创建备份</button>
      <input v-model="backupId" placeholder="输入 backupId 或文件名" />
      <button class="btn" :disabled="loading || !backupId" @click="restore">恢复备份</button>
    </div>

    <div class="panel" v-if="result">
      <pre>{{ JSON.stringify(result, null, 2) }}</pre>
    </div>
    <div class="panel" v-if="error">{{ error }}</div>
  </section>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { RouterLink } from "vue-router";
import { createQuestionBackup, restoreQuestionBackup } from "../../api/question";

const loading = ref(false);
const error = ref("");
const result = ref<unknown>(null);
const backupId = ref("");

async function backup() {
  loading.value = true;
  error.value = "";
  try {
    result.value = await createQuestionBackup();
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
    result.value = await restoreQuestionBackup(backupId.value.trim());
  } catch (e) {
    error.value = (e as Error).message;
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.page { display: grid; gap: 12px; }
.row { display: flex; gap: 8px; align-items: center; }
.wrap { flex-wrap: wrap; }
.between { justify-content: space-between; }
.panel { border: 1px solid #dcdfe6; border-radius: 8px; padding: 12px; }
.btn { border: 1px solid #c9ced6; background: #fff; padding: 6px 10px; border-radius: 6px; cursor: pointer; text-decoration: none; color: #222; }
input { border: 1px solid #c9ced6; border-radius: 6px; padding: 6px 8px; min-width: 280px; }
pre { white-space: pre-wrap; word-break: break-word; background: #fafbfc; border: 1px solid #eef1f4; border-radius: 6px; padding: 10px; }
</style>
