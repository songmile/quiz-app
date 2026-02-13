<template>
  <section class="page">
    <header class="row between">
      <h2>笔记</h2>
      <button class="btn" :disabled="loading" @click="load">刷新</button>
    </header>

    <form class="panel row wrap" @submit.prevent="create">
      <input v-model="questionId" placeholder="题目ID" required />
      <input v-model="content" placeholder="笔记内容" required />
      <button class="btn" :disabled="loading">新增</button>
    </form>

    <div class="panel" v-if="error">{{ error }}</div>

    <div class="panel">
      <table class="table">
        <thead><tr><th>ID</th><th>题目</th><th>内容</th><th>时间</th><th>操作</th></tr></thead>
        <tbody>
          <tr v-for="n in notes" :key="n.id">
            <td>{{ n.id }}</td>
            <td>{{ n.questionId }}</td>
            <td>{{ n.content }}</td>
            <td>{{ n.updatedAt }}</td>
            <td><button class="btn danger" @click="remove(n.id)">删除</button></td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { createNote, deleteNote, getNotes, type NoteItem } from "../../api/note";

const loading = ref(false);
const error = ref("");
const notes = ref<NoteItem[]>([]);
const questionId = ref("");
const content = ref("");

async function load() {
  loading.value = true;
  error.value = "";
  try {
    const page = await getNotes({ page: 1, limit: 100 });
    notes.value = page.data;
  } catch (e) {
    error.value = (e as Error).message;
  } finally {
    loading.value = false;
  }
}

async function create() {
  loading.value = true;
  error.value = "";
  try {
    await createNote({ questionId: questionId.value.trim(), content: content.value.trim() });
    questionId.value = "";
    content.value = "";
    await load();
  } catch (e) {
    error.value = (e as Error).message;
  } finally {
    loading.value = false;
  }
}

async function remove(id: string) {
  if (!confirm("确认删除该笔记？")) return;
  try {
    await deleteNote(id);
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
.wrap { flex-wrap: wrap; }
.between { justify-content: space-between; }
.panel { border: 1px solid #dcdfe6; border-radius: 8px; padding: 12px; }
.table { width: 100%; border-collapse: collapse; }
.table th, .table td { border-bottom: 1px solid #f0f2f5; text-align: left; padding: 8px; }
.btn { border: 1px solid #c9ced6; background: #fff; padding: 6px 10px; border-radius: 6px; cursor: pointer; }
.btn.danger { border-color: #e06c75; color: #c0392b; }
input { border: 1px solid #c9ced6; border-radius: 6px; padding: 6px 8px; min-width: 240px; }
</style>
