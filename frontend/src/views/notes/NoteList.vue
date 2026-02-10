<template>
  <div class="note-list-page">
    <div class="page-header">
      <h1 class="page-title">我的笔记</h1>
    </div>

    <div class="search-bar">
      <div class="search-box">
        <input type="text" v-model="searchQuery" placeholder="搜索笔记..." @input="debounceSearch">
        <i class="fas fa-search"></i>
      </div>
    </div>

    <div class="loading-state" v-if="loading">
      <i class="fas fa-circle-notch fa-spin"></i>
      <span>加载中...</span>
    </div>

    <div class="empty-state" v-else-if="notes.length === 0">
      <i class="fas fa-sticky-note"></i>
      <p>{{ searchQuery ? '没有找到匹配的笔记' : '还没有笔记，做题时可以添加笔记' }}</p>
    </div>

    <div class="notes-container" v-else>
      <div class="note-card" v-for="note in notes" :key="note._id" @click="goToQuestion(note)">
        <div class="note-content">{{ note.content }}</div>
        <div class="note-question" v-if="note.question">
          <span class="question-type">{{ note.question.type }}</span>
          <span class="question-text">{{ note.question.text }}</span>
        </div>
        <div class="note-time">{{ formatDate(note.updatedAt) }}</div>
      </div>

      <div class="pagination" v-if="totalPages > 1">
        <button class="page-btn" @click="changePage(currentPage - 1)" :disabled="currentPage === 1">
          <i class="fas fa-chevron-left"></i>
        </button>
        <span class="page-info">{{ currentPage }} / {{ totalPages }}</span>
        <button class="page-btn" @click="changePage(currentPage + 1)" :disabled="currentPage === totalPages">
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NoteList',
  data() {
    return {
      searchQuery: '',
      currentPage: 1,
      searchTimeout: null
    };
  },
  computed: {
    notes() { return this.$store.getters['notes/allNotes']; },
    totalPages() { return this.$store.getters['notes/totalPages']; },
    loading() { return this.$store.getters['notes/isLoading']; }
  },
  methods: {
    fetchNotes() {
      this.$store.dispatch('notes/fetchNotes', {
        page: this.currentPage,
        limit: 20,
        search: this.searchQuery
      });
    },
    debounceSearch() {
      if (this.searchTimeout) clearTimeout(this.searchTimeout);
      this.searchTimeout = setTimeout(() => {
        this.currentPage = 1;
        this.fetchNotes();
      }, 300);
    },
    changePage(page) {
      if (page < 1 || page > this.totalPages) return;
      this.currentPage = page;
      this.fetchNotes();
    },
    goToQuestion(note) {
      if (note.question) {
        this.$router.push(`/questions/${note.question.id}`);
      }
    },
    formatDate(d) {
      if (!d) return '';
      return new Date(d).toLocaleString('zh-CN');
    }
  },
  created() {
    this.fetchNotes();
  }
};
</script>
