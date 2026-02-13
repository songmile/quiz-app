<template>
  <section class="page">
    <header class="row between">
      <h2>字体设置</h2>
      <button class="btn" :disabled="loading" @click="load">刷新</button>
    </header>

    <div class="panel" v-if="error">{{ error }}</div>

    <form class="panel grid" @submit.prevent="save">
      <label v-for="key in keys" :key="key">
        {{ key }}
        <input v-model.number="fonts[key]" type="number" min="8" max="64" />
      </label>
      <div class="row full">
        <button class="btn" :disabled="loading">保存字体设置</button>
      </div>
    </form>
  </section>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import { getSettings, updateFontSettings } from "../../api/settings";

const keys = [
  "question_font_size",
  "option_font_size",
  "answer_font_size",
  "explanation_font_size",
  "ai_font_size",
  "error_font_size",
  "variant_font_size"
] as const;

const loading = ref(false);
const error = ref("");
const fonts = reactive<Record<string, number>>({});

async function load() {
  loading.value = true;
  error.value = "";
  try {
    const settings = await getSettings();
    keys.forEach((k) => { fonts[k] = Number(settings.font_settings?.[k] ?? 11); });
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
    await updateFontSettings(fonts);
    alert("保存成功");
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
.grid { display: grid; grid-template-columns: repeat(2, minmax(260px, 1fr)); gap: 8px; }
.full { grid-column: 1 / -1; }
label { display: grid; gap: 6px; }
input { border: 1px solid #c9ced6; border-radius: 6px; padding: 6px 8px; }
.btn { border: 1px solid #c9ced6; background: #fff; padding: 6px 10px; border-radius: 6px; cursor: pointer; }
</style>
