<template>
  <section class="page">
    <header class="row between wrap">
      <div>
        <h2>闪卡模式</h2>
        <p class="hint">高频复盘，快速判断熟练度。</p>
      </div>
      <div class="row wrap">
        <label>
          来源
          <select v-model="source">
            <option value="all">全部</option>
            <option value="bookmark">收藏</option>
            <option value="wrong">错题</option>
            <option value="bank">按题库</option>
          </select>
        </label>
        <label v-if="source === 'bank'">
          题库
          <select v-model="bankId">
            <option value="">请选择题库</option>
            <option v-for="b in banks" :key="b.id" :value="b.id">{{ b.name }}</option>
          </select>
        </label>
        <label>
          数量
          <input v-model.number="limit" type="number" min="1" max="200" />
        </label>
        <button class="btn primary" :disabled="loading || (source === 'bank' && !bankId)" @click="start">开始</button>
        <button class="btn" :disabled="loading" @click="refresh">刷新状态</button>
      </div>
    </header>

    <div class="panel" v-if="error">{{ error }}</div>

    <section class="metric-grid">
      <article class="kv-item">
        <small>当前卡片数</small>
        <strong>{{ info.totalCards ?? 0 }}</strong>
      </article>
      <article class="kv-item">
        <small>会话创建时间</small>
        <strong>{{ info.createdAt || "-" }}</strong>
      </article>
      <article class="kv-item">
        <small>本次抽取数量</small>
        <strong>{{ cards.length }}</strong>
      </article>
    </section>

    <article class="panel">
      <h3>卡片列表</h3>
      <p class="hint-inline">点击卡片可自动填入评分对象。</p>
      <div class="card-grid top-gap">
        <button
          class="flash-card"
          v-for="card in cards"
          :key="card.id"
          :class="{ active: questionId === card.id }"
          @click="selectCard(card.id)"
          type="button"
        >
          <small>{{ card.type }}</small>
          <strong>{{ card.id }}</strong>
          <p>{{ card.text }}</p>
        </button>
      </div>
      <p class="hint-inline" v-if="cards.length === 0">点击“开始”生成闪卡。</p>
    </article>

    <article class="panel">
      <h3>评分提交</h3>
      <div class="row wrap top-gap">
        <input v-model.trim="questionId" placeholder="题号（如 q_xxx）" />
        <select v-model="rating">
          <option value="again">again（不会）</option>
          <option value="hard">hard（吃力）</option>
          <option value="good">good（正常）</option>
          <option value="easy">easy（轻松）</option>
        </select>
        <button class="btn" :disabled="loading || !questionId" @click="rate">提交评分</button>
      </div>
      <div class="kv-grid top-gap" v-if="rateResult.questionId">
        <div class="kv-item">
          <small>题号</small>
          <strong>{{ rateResult.questionId }}</strong>
        </div>
        <div class="kv-item">
          <small>评分</small>
          <strong>{{ rateResult.rating }}</strong>
        </div>
        <div class="kv-item">
          <small>质量值</small>
          <strong>{{ rateResult.quality }}</strong>
        </div>
      </div>
    </article>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { getBanks, type BankItem } from "../api/bank";
import { getFlashcardInfo, rateFlashcard, startFlashcards } from "../api/flashcard";

type GenericMap = Record<string, unknown>;

const loading = ref(false);
const error = ref("");
const source = ref("all");
const bankId = ref("");
const limit = ref(20);
const questionId = ref("");
const rating = ref("good");

const banks = ref<BankItem[]>([]);
const session = ref<GenericMap>({});
const info = ref<GenericMap>({});
const result = ref<GenericMap>({});

const cards = computed(() => {
  const list = (session.value.cards || []) as Array<GenericMap>;
  return list.map((card) => ({
    id: String(card.id || ""),
    type: String(card.type || ""),
    text: String(card.text || "")
  }));
});

const rateResult = computed(() => ({
  questionId: String(result.value.questionId || ""),
  rating: String(result.value.rating || ""),
  quality: String(result.value.quality || "")
}));

async function loadBanks() {
  try {
    banks.value = await getBanks();
  } catch {
    banks.value = [];
  }
}

function selectCard(id: string) {
  questionId.value = id;
}

async function start() {
  loading.value = true;
  error.value = "";
  try {
    session.value = await startFlashcards({
      source: source.value,
      bankId: source.value === "bank" ? bankId.value : null,
      limit: limit.value
    });
    await refresh();
  } catch (e) {
    error.value = (e as Error).message;
  } finally {
    loading.value = false;
  }
}

async function refresh() {
  try {
    info.value = await getFlashcardInfo();
  } catch (e) {
    error.value = (e as Error).message;
  }
}

async function rate() {
  loading.value = true;
  error.value = "";
  try {
    result.value = await rateFlashcard({ questionId: questionId.value, rating: rating.value });
    await refresh();
  } catch (e) {
    error.value = (e as Error).message;
  } finally {
    loading.value = false;
  }
}

onMounted(async () => {
  await loadBanks();
  await refresh();
});
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

input {
  width: 130px;
}

.hint-inline {
  margin: 4px 0 0;
  color: #786a56;
  font-size: 13px;
}

.metric-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
  gap: 10px;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 10px;
}

.flash-card {
  text-align: left;
  border: 1px solid #d4c6af;
  border-radius: 12px;
  padding: 10px;
  background: #fffef9;
  cursor: pointer;
  transition: all 0.2s ease;
}

.flash-card:hover {
  border-color: #ba9f7c;
}

.flash-card.active {
  border-color: #0f766e;
  background: #e8f7f4;
}

.flash-card small {
  color: #7b6e5a;
}

.flash-card strong {
  display: block;
  margin-top: 4px;
}

.flash-card p {
  margin: 8px 0 0;
  font-size: 13px;
  color: #5f523f;
  line-height: 1.45;
}

.top-gap {
  margin-top: 10px;
}
</style>
