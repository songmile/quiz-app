<template>
  <section class="page">
    <header class="row between">
      <h2>收藏</h2>
      <button class="btn" :disabled="loading" @click="load">刷新</button>
    </header>

    <div class="panel" v-if="error">{{ error }}</div>

    <div class="panel">
      <table class="table">
        <thead><tr><th>题目ID</th><th>题干</th><th>类型</th><th>收藏时间</th><th>操作</th></tr></thead>
        <tbody>
          <tr v-for="b in bookmarks" :key="b.questionId">
            <td>{{ b.questionId }}</td>
            <td>{{ b.question?.text }}</td>
            <td>{{ b.question?.type }}</td>
            <td>{{ b.createdAt }}</td>
            <td><button class="btn danger" @click="remove(b.questionId)">取消收藏</button></td>
          </tr>
          <tr v-if="bookmarks.length === 0"><td colspan="5">暂无收藏</td></tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { deleteBookmark, getBookmarks, type BookmarkItem } from "../../api/bookmark";

const loading = ref(false);
const error = ref("");
const bookmarks = ref<BookmarkItem[]>([]);

async function load() {
  loading.value = true;
  error.value = "";
  try {
    bookmarks.value = await getBookmarks();
  } catch (e) {
    error.value = (e as Error).message;
  } finally {
    loading.value = false;
  }
}

async function remove(questionId: string) {
  if (!confirm("确认取消收藏？")) return;
  try {
    await deleteBookmark(questionId);
    await load();
  } catch (e) {
    error.value = (e as Error).message;
  }
}

onMounted(load);
</script>

<style scoped>
.page { display: grid; gap: 12px; }
.row { display: flex; gap: 8px; align-items: center; }
.between { justify-content: space-between; }
.panel { border: 1px solid #dcdfe6; border-radius: 8px; padding: 12px; }
.table { width: 100%; border-collapse: collapse; }
.table th, .table td { border-bottom: 1px solid #f0f2f5; text-align: left; padding: 8px; }
.btn { border: 1px solid #c9ced6; background: #fff; padding: 6px 10px; border-radius: 6px; cursor: pointer; }
.btn.danger { border-color: #e06c75; color: #c0392b; }
</style>
