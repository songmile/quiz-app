<template>
  <section class="page">
    <header class="row between">
      <h2>通用设置</h2>
      <button class="btn" :disabled="loading" @click="load">刷新</button>
    </header>

    <div class="panel" v-if="error">{{ error }}</div>

    <form class="panel form" @submit.prevent="save">
      <label>导入并发
        <input v-model.number="form.import_max_concurrent" type="number" min="1" />
      </label>
      <label>导入批次延迟(秒)
        <input v-model.number="form.import_batch_delay" type="number" min="0" />
      </label>
      <label>解析 API 索引
        <input v-model.number="form.explanation_api_index" type="number" min="0" />
      </label>
      <label>知识树 API 索引
        <input v-model.number="form.knowledge_tree_api_index" type="number" min="0" />
      </label>
      <label>设计流程 API 索引
        <input v-model.number="form.design_process_api_index" type="number" min="0" />
      </label>
      <label>自动保存间隔(分钟)
        <input v-model.number="form.autosave_interval" type="number" min="1" />
      </label>
      <div class="row">
        <button class="btn" :disabled="loading">保存设置</button>
        <button class="btn danger" type="button" :disabled="loading" @click="reset">恢复默认</button>
      </div>
    </form>
  </section>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import { getSettings, resetSettings, updateImportSettings, updateSettings } from "../../api/settings";

const loading = ref(false);
const error = ref("");

const form = reactive({
  import_max_concurrent: 2,
  import_batch_delay: 2,
  explanation_api_index: 0,
  knowledge_tree_api_index: 2,
  design_process_api_index: 3,
  autosave_interval: 5
});

function fill(data: Record<string, unknown>) {
  form.import_max_concurrent = Number(data.import_max_concurrent ?? 2);
  form.import_batch_delay = Number(data.import_batch_delay ?? 2);
  form.explanation_api_index = Number(data.explanation_api_index ?? 0);
  form.knowledge_tree_api_index = Number(data.knowledge_tree_api_index ?? 2);
  form.design_process_api_index = Number(data.design_process_api_index ?? 3);
  form.autosave_interval = Number(data.autosave_interval ?? 5);
}

async function load() {
  loading.value = true;
  error.value = "";
  try {
    const data = await getSettings();
    fill(data as unknown as Record<string, unknown>);
  } catch (e) {
    error.value = (e as Error).message;
  } finally {
    loading.value = false;
  }
}

async function save() {
  loading.value = true;
  error.value = "";
  try {
    await updateImportSettings({
      import_max_concurrent: form.import_max_concurrent,
      import_batch_delay: form.import_batch_delay
    });
    await updateSettings({
      explanation_api_index: form.explanation_api_index,
      knowledge_tree_api_index: form.knowledge_tree_api_index,
      design_process_api_index: form.design_process_api_index,
      autosave_interval: form.autosave_interval
    });
    alert("保存成功");
  } catch (e) {
    error.value = (e as Error).message;
  } finally {
    loading.value = false;
  }
}

async function reset() {
  if (!confirm("确认重置所有设置？")) return;
  loading.value = true;
  error.value = "";
  try {
    const data = await resetSettings();
    fill(data as unknown as Record<string, unknown>);
  } catch (e) {
    error.value = (e as Error).message;
  } finally {
    loading.value = false;
  }
}

onMounted(load);
</script>

<style scoped>
.page { display: grid; gap: 12px; }
.row { display: flex; gap: 8px; align-items: center; }
.between { justify-content: space-between; }
.panel { border: 1px solid #dcdfe6; border-radius: 8px; padding: 12px; }
.form { display: grid; gap: 10px; }
label { display: grid; gap: 6px; }
input { border: 1px solid #c9ced6; border-radius: 6px; padding: 6px 8px; }
.btn { border: 1px solid #c9ced6; background: #fff; padding: 6px 10px; border-radius: 6px; cursor: pointer; }
.btn.danger { border-color: #e06c75; color: #c0392b; }
</style>
