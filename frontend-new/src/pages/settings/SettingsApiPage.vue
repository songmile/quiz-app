<template>
  <section class="page">
    <header class="row between">
      <h2>API 配置</h2>
      <button class="btn" :disabled="loading" @click="load">刷新</button>
    </header>

    <div class="panel" v-if="error">{{ error }}</div>

    <div class="panel" v-for="(cfg, idx) in configs" :key="idx">
      <h3>配置 {{ idx }}</h3>
      <div class="grid">
        <label>名称<input v-model="cfg.name" /></label>
        <label>API URL<input v-model="cfg.api_url" /></label>
        <label>模型<input v-model="cfg.model" /></label>
        <label>API Key<input v-model="cfg.api_key" placeholder="保持掩码表示不变更" /></label>
        <label>Chunk Size<input v-model.number="cfg.chunk_size" type="number" min="1" /></label>
        <label>Max Tokens<input v-model.number="cfg.max_tokens" type="number" min="1" /></label>
      </div>
      <label class="row"><input type="checkbox" v-model="cfg.enabled" /> 启用</label>
      <div class="row top-gap">
        <button class="btn" :disabled="loading" @click="save(idx)">保存配置</button>
        <button class="btn" :disabled="loading" @click="test(idx)">测试连接</button>
      </div>
      <pre v-if="testResult[idx]">{{ JSON.stringify(testResult[idx], null, 2) }}</pre>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { testConnection } from "../../api/ai";
import { getSettings, updateApiConfig, type SettingsData } from "../../api/settings";

const loading = ref(false);
const error = ref("");
const configs = ref<SettingsData["api_configs"]>([]);
const testResult = ref<Record<number, unknown>>({});

async function load() {
  loading.value = true;
  error.value = "";
  try {
    const settings = await getSettings();
    configs.value = JSON.parse(JSON.stringify(settings.api_configs || []));
  } catch (e) {
    error.value = (e as Error).message;
  } finally {
    loading.value = false;
  }
}

async function save(index: number) {
  loading.value = true;
  error.value = "";
  try {
    await updateApiConfig(index, configs.value[index]);
    await load();
  } catch (e) {
    error.value = (e as Error).message;
  } finally {
    loading.value = false;
  }
}

async function test(index: number) {
  try {
    testResult.value[index] = await testConnection(index);
  } catch (e) {
    testResult.value[index] = { error: (e as Error).message };
  }
}

onMounted(load);
</script>

<style scoped>
.panel { display: grid; gap: 8px; }
.grid { display: grid; grid-template-columns: repeat(2, minmax(260px, 1fr)); gap: 8px; }
label { display: grid; gap: 6px; color: #5f513e; }
.top-gap { margin-top: 8px; }

@media (max-width: 900px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
</style>
