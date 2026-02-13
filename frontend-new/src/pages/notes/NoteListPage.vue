<template>
  <section class="page">
    <header class="row between wrap">
      <div>
        <h2>学习笔记</h2>
        <p class="hint">记录错因与解题关键点，便于复盘。</p>
      </div>
      <button class="btn" :disabled="loading" @click="load">刷新</button>
    </header>

    <form class="panel form-grid" @submit.prevent="create">
      <label>
        题号
        <input v-model.trim="questionId" placeholder="如 q_xxx" required />
      </label>
      <label class="full">
        笔记内容
        <textarea v-model.trim="content" rows="3" placeholder="输入你的理解、错因、记忆点" required />
      </label>
      <div class="row full">
        <button class="btn primary" :disabled="loading || !questionId || !content">新增笔记</button>
      </div>
    </form>

    <div class="panel" v-if="error">{{ error }}</div>

    <article class="panel">
      <div class="row wrap between">
        <h3>笔记列表</h3>
        <input v-model.trim="keyword" placeholder="按题号或内容过滤" />
      </div>
      <div class="table-wrap top-gap">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>题号</th>
              <th>内容</th>
              <th>更新时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="n in filteredNotes" :key="n.id">
              <td>{{ n.id }}</td>
              <td>{{ n.questionId }}</td>
              <td class="content-cell">
                <textarea v-if="editingId === n.id" v-model.trim="editingContent" rows="3" />
                <span v-else>{{ n.content }}</span>
              </td>
              <td>{{ n.updatedAt }}</td>
              <td class="row wrap">
                <button class="btn" v-if="editingId !== n.id" @click="startEdit(n)">编辑</button>
                <button class="btn" v-else @click="saveEdit(n.id)">保存</button>
                <button class="btn danger" @click="remove(n.id)">删除</button>
              </td>
            </tr>
            <tr v-if="filteredNotes.length === 0">
              <td colspan="5">暂无笔记</td>
            </tr>
          </tbody>
        </table>
      </div>
    </article>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { createNote, deleteNote, getNotes, type NoteItem, updateNote } from "../../api/note";

const loading = ref(false);
const error = ref("");
const notes = ref<NoteItem[]>([]);
const questionId = ref("");
const content = ref("");
const keyword = ref("");

const editingId = ref("");
const editingContent = ref("");

const filteredNotes = computed(() => {
  const key = keyword.value.toLowerCase();
  if (!key) return notes.value;
  return notes.value.filter((n) => {
    return n.questionId.toLowerCase().includes(key) || n.content.toLowerCase().includes(key);
  });
});

async function load() {
  loading.value = true;
  error.value = "";
  try {
    const page = await getNotes({ page: 1, limit: 200 });
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
    await createNote({ questionId: questionId.value, content: content.value });
    questionId.value = "";
    content.value = "";
    await load();
  } catch (e) {
    error.value = (e as Error).message;
  } finally {
    loading.value = false;
  }
}

function startEdit(item: NoteItem) {
  editingId.value = item.id;
  editingContent.value = item.content;
}

async function saveEdit(id: string) {
  if (!editingContent.value) return;
  loading.value = true;
  error.value = "";
  try {
    const current = notes.value.find((n) => n.id === id);
    if (!current) return;
    await updateNote(id, { questionId: current.questionId, content: editingContent.value });
    editingId.value = "";
    editingContent.value = "";
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
.hint {
  margin: 6px 0 0;
  color: #756954;
}

.form-grid {
  display: grid;
  grid-template-columns: 240px 1fr;
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

.content-cell {
  min-width: 280px;
  max-width: 520px;
}

.top-gap {
  margin-top: 10px;
}

@media (max-width: 900px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
