<template>
  <section class="page">
    <header class="row between wrap">
      <div>
        <h2>收藏题目</h2>
        <p class="hint">集中查看重点题并快速回到编辑页。</p>
      </div>
      <button class="btn" :disabled="loading" @click="load">刷新</button>
    </header>

    <div class="panel" v-if="error">{{ error }}</div>

    <article class="panel">
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>题号</th>
              <th>题型</th>
              <th>题干</th>
              <th>收藏时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="b in bookmarks" :key="b.questionId">
              <td>{{ b.questionId }}</td>
              <td>{{ b.question?.type || "-" }}</td>
              <td class="text">{{ b.question?.text || "-" }}</td>
              <td>{{ b.createdAt || "-" }}</td>
              <td class="row wrap">
                <RouterLink class="btn" :to="`/questions/${b.questionId}`">查看</RouterLink>
                <button class="btn danger" @click="remove(b.questionId)">取消收藏</button>
              </td>
            </tr>
            <tr v-if="bookmarks.length === 0">
              <td colspan="5">暂无收藏</td>
            </tr>
          </tbody>
        </table>
      </div>
    </article>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { RouterLink } from "vue-router";
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
.hint {
  margin: 6px 0 0;
  color: #756954;
}

.text {
  min-width: 320px;
  max-width: 640px;
}
</style>
