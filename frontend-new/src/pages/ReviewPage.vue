<template>
  <section class="page">
    <header class="row between">
      <h2>复习模式</h2>
      <div class="row wrap">
        <button class="btn" :disabled="loading" @click="start">开始复习</button>
        <button class="btn" :disabled="loading" @click="refreshDue">刷新到期统计</button>
        <label class="row check"><input type="checkbox" v-model="autoNext" /> 提交后自动下一题</label>
      </div>
    </header>

    <div class="panel" v-if="error">{{ error }}</div>

    <div class="panel">
      <h3>复习统计</h3>
      <pre>{{ JSON.stringify(dueStats, null, 2) }}</pre>
    </div>

    <div class="panel" v-if="!current">点击“开始复习”进入会话。</div>

    <div class="panel" v-if="current">
      <div class="row between">
        <h3>{{ current.type }} - {{ current.id }}</h3>
        <span>{{ currentIndex + 1 }} / {{ totalQuestions }}</span>
      </div>
      <p class="question">{{ current.text }}</p>

      <div v-if="(current.options || []).length > 0" class="options">
        <button
          v-for="opt in current.options"
          :key="opt.letter"
          class="opt"
          :class="{ selected: selectedOptions.includes(opt.letter) }"
          @click="toggleOption(opt.letter)"
          type="button"
        >
          <strong>{{ opt.letter }}</strong> {{ opt.text }}
        </button>
      </div>

      <textarea
        v-else
        v-model="answerInput"
        rows="4"
        placeholder="输入答案"
      />

      <div class="row wrap top-gap">
        <input v-model="answerInput" placeholder="答案（自动由选项生成）" />
        <button class="btn primary" :disabled="loading || !answerInput.trim()" @click="submitCurrent">提交</button>
        <button class="btn" :disabled="loading || currentIndex <= 0" @click="prev">上一题</button>
        <button class="btn" :disabled="loading || currentIndex >= totalQuestions - 1" @click="next">下一题</button>
      </div>

      <div class="card-grid top-gap" v-if="totalQuestions > 0">
        <button
          v-for="idx in cardIndexes"
          :key="idx"
          class="card-btn"
          :class="cardClass(idx)"
          :disabled="loading"
          @click="jump(idx)"
          type="button"
        >
          {{ idx + 1 }}
        </button>
      </div>
    </div>

    <div class="panel" v-if="result">
      <h3>本题结果</h3>
      <pre>{{ JSON.stringify(result, null, 2) }}</pre>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { getQuestion, type QuestionItem } from "../api/question";
import { getCurrentQuestion, jumpTo, nextQuestion, previousQuestion, submitAnswer } from "../api/quiz";
import { getDueCount, getReviewStats, startReview } from "../api/review";

type CardStatus = "unanswered" | "correct" | "wrong";

const loading = ref(false);
const error = ref("");
const dueStats = ref<Record<string, unknown>>({});

const current = ref<QuestionItem | null>(null);
const currentIndex = ref(0);
const totalQuestions = ref(0);
const answerInput = ref("");
const selectedOptions = ref<string[]>([]);
const autoNext = ref(true);
const result = ref<unknown>(null);
const cardStatusMap = ref<Record<number, CardStatus>>({});

const cardIndexes = computed(() => Array.from({ length: totalQuestions.value }, (_, i) => i));

function normalizeAnswer() {
  if (selectedOptions.value.length > 0) {
    const sorted = [...selectedOptions.value].sort();
    answerInput.value = sorted.join(",");
  }
}

function isMultiChoice() {
  return current.value?.type === "多选题";
}

function toggleOption(letter: string) {
  if (isMultiChoice()) {
    if (selectedOptions.value.includes(letter)) {
      selectedOptions.value = selectedOptions.value.filter((v) => v !== letter);
    } else {
      selectedOptions.value = [...selectedOptions.value, letter];
    }
  } else {
    selectedOptions.value = [letter];
  }
  normalizeAnswer();
}

function hydrateAnswerFromText(answer: string) {
  answerInput.value = answer || "";
  selectedOptions.value = (answer || "")
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean)
    .map((v) => v.toUpperCase());
}

async function enrichQuestion(base: Record<string, unknown>) {
  const id = String(base.id || "");
  if (!id) {
    current.value = null;
    return;
  }
  try {
    current.value = await getQuestion(id);
  } catch {
    current.value = {
      id,
      type: String(base.type || ""),
      text: String(base.text || ""),
      answer: String(base.answer || ""),
      explanation: String(base.explanation || "")
    };
  }
}

async function applyQuestionPayload(payload: Record<string, unknown>) {
  currentIndex.value = Number(payload.currentIndex ?? currentIndex.value);
  totalQuestions.value = Number(payload.totalQuestions ?? totalQuestions.value);

  const data = payload.data as Record<string, unknown> | undefined;
  if (!data) {
    return;
  }

  await enrichQuestion(data);

  const ua = payload.userAnswer as Record<string, unknown> | null | undefined;
  if (ua?.answer) {
    hydrateAnswerFromText(String(ua.answer));
    const ok = Boolean(ua.isCorrect);
    cardStatusMap.value[currentIndex.value] = ok ? "correct" : "wrong";
  } else {
    hydrateAnswerFromText("");
  }
}

async function refreshDue() {
  try {
    const [count, stats] = await Promise.all([getDueCount(), getReviewStats()]);
    dueStats.value = { ...count, ...stats };
  } catch (e) {
    error.value = (e as Error).message;
  }
}

async function start() {
  loading.value = true;
  error.value = "";
  result.value = null;
  cardStatusMap.value = {};
  try {
    const started = await startReview({});
    totalQuestions.value = Number((started as Record<string, unknown>).totalQuestions ?? 0);
    const payload = await getCurrentQuestion(0, "spaced_review");
    await applyQuestionPayload(payload);
    await refreshDue();
  } catch (e) {
    error.value = (e as Error).message;
  } finally {
    loading.value = false;
  }
}

async function submitCurrent() {
  if (!current.value) return;
  loading.value = true;
  error.value = "";
  try {
    const data = await submitAnswer({
      questionId: current.value.id,
      userAnswer: answerInput.value.trim(),
      mode: "spaced_review"
    });
    result.value = data;
    const ok = Boolean((data as Record<string, unknown>).isCorrect);
    cardStatusMap.value[currentIndex.value] = ok ? "correct" : "wrong";
    await refreshDue();

    if (autoNext.value && currentIndex.value < totalQuestions.value - 1) {
      setTimeout(() => {
        void next();
      }, 500);
    }
  } catch (e) {
    error.value = (e as Error).message;
  } finally {
    loading.value = false;
  }
}

async function next() {
  if (currentIndex.value >= totalQuestions.value - 1) return;
  loading.value = true;
  error.value = "";
  try {
    const payload = await nextQuestion(currentIndex.value, "spaced_review");
    if (payload.data) {
      await applyQuestionPayload(payload);
    }
  } catch (e) {
    error.value = (e as Error).message;
  } finally {
    loading.value = false;
  }
}

async function prev() {
  if (currentIndex.value <= 0) return;
  loading.value = true;
  error.value = "";
  try {
    const payload = await previousQuestion(currentIndex.value, "spaced_review");
    if (payload.data) {
      await applyQuestionPayload(payload);
    }
  } catch (e) {
    error.value = (e as Error).message;
  } finally {
    loading.value = false;
  }
}

async function jump(idx: number) {
  if (idx < 0 || idx >= totalQuestions.value) return;
  loading.value = true;
  error.value = "";
  try {
    const payload = await jumpTo(idx, "spaced_review");
    await applyQuestionPayload(payload);
  } catch (e) {
    error.value = (e as Error).message;
  } finally {
    loading.value = false;
  }
}

function cardClass(idx: number) {
  if (idx === currentIndex.value) return "current";
  const status = cardStatusMap.value[idx] || "unanswered";
  return status;
}

onMounted(refreshDue);
</script>

<style scoped>
.check { font-size: 13px; }
.question {
  line-height: 1.8;
  font-size: 16px;
}
.options { display: grid; gap: 8px; margin-top: 8px; }

.opt {
  text-align: left;
  border: 1px solid #d7cbb8;
  background: linear-gradient(180deg, #fffefb 0%, #f9f3e8 100%);
  border-radius: 12px;
  padding: 10px 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.opt:hover {
  border-color: #c2ad8a;
}

.opt.selected {
  border-color: #128274;
  background: linear-gradient(180deg, #eaf8f6 0%, #dff1ee 100%);
}

input,
textarea {
  min-width: 260px;
}

textarea { width: 100%; }
.card-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(44px, 1fr)); gap: 6px; }
.card-btn {
  border: 1px solid #d1c4ae;
  border-radius: 8px;
  padding: 7px 0;
  background: #fffdf8;
  cursor: pointer;
}

.card-btn.current { border-color: #0f766e; background: #ddf3f0; }
.card-btn.correct { border-color: #3d8e4f; background: #e5f5df; }
.card-btn.wrong { border-color: #cc5a2f; background: #fee8df; }
.card-btn.unanswered { border-color: #d1c4ae; }
.top-gap { margin-top: 10px; }
</style>
