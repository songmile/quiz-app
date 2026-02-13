<template>
  <section class="page">
    <header class="row between wrap">
      <div>
        <h2>字体设置</h2>
        <p class="hint">统一调整阅读字号，避免页面间视觉跳变。</p>
      </div>
      <button class="btn" :disabled="loading" @click="load">刷新</button>
    </header>

    <div class="panel" v-if="error">{{ error }}</div>

    <form class="panel grid" @submit.prevent="save">
      <label v-for="item in fields" :key="item.key">
        {{ item.label }}
        <input v-model.number="fonts[item.key]" type="number" min="8" max="64" />
      </label>
      <div class="row full">
        <button class="btn primary" :disabled="loading">保存字体设置</button>
      </div>
    </form>
  </section>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import { getSettings, updateFontSettings } from "../../api/settings";

const fields = [
  { key: "question_font_size", label: "题干字号" },
  { key: "option_font_size", label: "选项字号" },
  { key: "answer_font_size", label: "答案字号" },
  { key: "explanation_font_size", label: "解析字号" },
  { key: "ai_font_size", label: "AI 结果字号" },
  { key: "error_font_size", label: "错因字号" },
  { key: "variant_font_size", label: "变式题字号" }
] as const;

const loading = ref(false);
const error = ref("");
const fonts = reactive<Record<string, number>>({});

async function load() {
  loading.value = true;
  error.value = "";
  try {
    const settings = await getSettings();
    fields.forEach((field) => {
      fonts[field.key] = Number(settings.font_settings?.[field.key] ?? 11);
    });
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
.hint {
  margin: 6px 0 0;
  color: #756954;
}

.grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(220px, 1fr));
  gap: 10px;
}

label {
  display: grid;
  gap: 6px;
  color: #5f513e;
}

.full {
  grid-column: 1 / -1;
}

@media (max-width: 900px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
</style>
