<template>
  <section class="page">
    <header class="row between">
      <h2>{{ isCreate ? "新建题目" : `编辑题目 ${form.id}` }}</h2>
      <RouterLink class="btn" to="/questions">返回列表</RouterLink>
    </header>

    <div class="panel" v-if="error">{{ error }}</div>

    <form class="panel form" @submit.prevent="save">
      <label>
        <span>题型</span>
        <select v-model="form.type" required>
          <option>单选题</option>
          <option>多选题</option>
          <option>判断题</option>
          <option>简答题</option>
        </select>
      </label>

      <label>
        <span>题库</span>
        <select v-model="form.bankId">
          <option value="">未分组</option>
          <option v-for="b in banks" :key="b.id" :value="b.id">{{ b.name }}</option>
        </select>
      </label>

      <label class="full">
        <span>题干</span>
        <textarea v-model="form.text" rows="4" required />
      </label>

      <label>
        <span>答案</span>
        <input v-model="form.answer" required />
      </label>

      <label class="full">
        <span>解析</span>
        <textarea v-model="form.explanation" rows="4" />
      </label>

      <label class="full">
        <span>标签(逗号分隔)</span>
        <input v-model="tagText" placeholder="如: SQL,索引" />
      </label>

      <label class="full">
        <span>选项(每行 `A. 内容`)</span>
        <textarea v-model="optionText" rows="6" placeholder="A. 选项一\nB. 选项二" />
      </label>

      <div class="row full">
        <button class="btn" :disabled="saving">保存</button>
      </div>
    </form>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { useRoute, useRouter, RouterLink } from "vue-router";
import { createQuestion, getQuestion, updateQuestion, type QuestionItem, type QuestionOption } from "../../api/question";
import { getBanks, type BankItem } from "../../api/bank";

const route = useRoute();
const router = useRouter();

const id = computed(() => String(route.params.id || "new"));
const isCreate = computed(() => id.value === "new");

const saving = ref(false);
const error = ref("");
const banks = ref<BankItem[]>([]);
const tagText = ref("");
const optionText = ref("");

const form = reactive<QuestionItem>({
  id: "",
  type: "单选题",
  text: "",
  answer: "",
  bankId: "",
  explanation: "",
  tags: [],
  options: []
});

function parseOptions(text: string): QuestionOption[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const m = line.match(/^([A-Za-z])[\.、:：\)]\s*(.+)$/);
      if (!m) return null;
      return { letter: m[1].toUpperCase(), text: m[2].trim() };
    })
    .filter((v): v is QuestionOption => Boolean(v));
}

function hydrate(item: QuestionItem) {
  form.id = item.id;
  form.type = item.type;
  form.text = item.text;
  form.answer = item.answer;
  form.bankId = item.bankId || "";
  form.explanation = item.explanation || "";
  form.tags = item.tags || [];
  form.options = item.options || [];
  tagText.value = (form.tags || []).join(",");
  optionText.value = (form.options || []).map((o) => `${o.letter}. ${o.text}`).join("\n");
}

async function load() {
  error.value = "";
  try {
    banks.value = await getBanks();
    if (!isCreate.value) {
      const data = await getQuestion(id.value);
      hydrate(data);
    }
  } catch (e) {
    error.value = (e as Error).message;
  }
}

async function save() {
  saving.value = true;
  error.value = "";
  try {
    const payload: QuestionItem = {
      ...form,
      bankId: form.bankId || undefined,
      tags: tagText.value.split(",").map((v) => v.trim()).filter(Boolean),
      options: parseOptions(optionText.value)
    };

    if (isCreate.value) {
      const created = await createQuestion(payload);
      await router.replace(`/questions/${created.id}`);
    } else {
      await updateQuestion(id.value, payload);
      alert("保存成功");
    }
  } catch (e) {
    error.value = (e as Error).message;
  } finally {
    saving.value = false;
  }
}

onMounted(load);
</script>

<style scoped>
.form {
  display: grid;
  grid-template-columns: repeat(2, minmax(280px, 1fr));
  gap: 12px;
}

label {
  display: grid;
  gap: 6px;
}

.full {
  grid-column: 1 / -1;
}

textarea {
  width: 100%;
}

@media (max-width: 900px) {
  .form {
    grid-template-columns: 1fr;
  }
}
</style>
