<template>
  <section class="page">
    <header class="row between">
      <h2>题目列表</h2>
      <div class="row">
        <RouterLink class="btn" to="/questions/new">新建题目</RouterLink>
        <RouterLink class="btn" to="/questions/import">导入</RouterLink>
        <RouterLink class="btn" to="/questions/backup">备份</RouterLink>
        <RouterLink class="btn" to="/questions/banks">题库管理</RouterLink>
      </div>
    </header>

    <div class="panel">
      <div class="row wrap">
        <input v-model="filters.search" placeholder="搜索题干" />
        <select v-model="filters.type">
          <option value="">全部类型</option>
          <option>单选题</option>
          <option>多选题</option>
          <option>判断题</option>
          <option>简答题</option>
        </select>
        <select v-model="filters.bankId">
          <option value="">全部题库</option>
          <option value="null">未分组</option>
          <option v-for="b in banks" :key="b.id" :value="b.id">{{ b.name }}</option>
        </select>
        <button class="btn" :disabled="loading" @click="load">查询</button>
      </div>
    </div>

    <div class="panel" v-if="error">{{ error }}</div>

    <div class="panel table-wrap">
      <table class="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>类型</th>
            <th>题干</th>
            <th>答案</th>
            <th>题库</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in page.data" :key="item.id">
            <td>{{ item.id }}</td>
            <td>{{ item.type }}</td>
            <td class="ellipsis" :title="item.text">{{ item.text }}</td>
            <td>{{ item.answer }}</td>
            <td>{{ item.bankId || '-' }}</td>
            <td class="row">
              <RouterLink class="btn" :to="`/questions/${item.id}`">编辑</RouterLink>
              <button class="btn danger" @click="remove(item.id)">删除</button>
            </td>
          </tr>
          <tr v-if="!loading && page.data.length === 0">
            <td colspan="6">暂无数据</td>
          </tr>
        </tbody>
      </table>
      <div class="row between top-gap">
        <span>共 {{ page.total }} 条</span>
        <div class="row">
          <button class="btn" :disabled="page.page <= 1 || loading" @click="changePage(page.page - 1)">上一页</button>
          <span>第 {{ page.page }} / {{ page.totalPages || 1 }} 页</span>
          <button class="btn" :disabled="page.page >= page.totalPages || loading" @click="changePage(page.page + 1)">下一页</button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import { RouterLink } from "vue-router";
import { deleteQuestion, getQuestions, type QuestionPage } from "../../api/question";
import { getBanks, type BankItem } from "../../api/bank";

const loading = ref(false);
const error = ref("");
const page = ref<QuestionPage>({ total: 0, page: 1, totalPages: 1, data: [] });
const banks = ref<BankItem[]>([]);

const filters = reactive({
  search: "",
  type: "",
  bankId: "",
  page: 1,
  limit: 20
});

async function load() {
  loading.value = true;
  error.value = "";
  try {
    page.value = await getQuestions({
      page: filters.page,
      limit: filters.limit,
      search: filters.search || undefined,
      type: filters.type || undefined,
      bankId: filters.bankId || undefined
    });
  } catch (e) {
    error.value = (e as Error).message;
  } finally {
    loading.value = false;
  }
}

async function loadBanks() {
  try {
    banks.value = await getBanks();
  } catch {
    banks.value = [];
  }
}

async function remove(id: string) {
  if (!confirm(`确认删除题目 ${id} ?`)) return;
  try {
    await deleteQuestion(id);
    await load();
  } catch (e) {
    alert((e as Error).message);
  }
}

function changePage(next: number) {
  filters.page = next;
  load();
}

onMounted(async () => {
  await Promise.all([loadBanks(), load()]);
});
</script>

<style scoped>
.table {
  min-width: 860px;
}

.ellipsis { max-width: 560px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.top-gap { margin-top: 10px; }
</style>
