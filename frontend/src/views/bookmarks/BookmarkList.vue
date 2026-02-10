<template>
  <div class="bookmark-page">
    <div class="page-header">
      <h2><i class="fas fa-star"></i> 我的收藏</h2>
      <div class="header-actions">
        <span class="bookmark-count">共 {{ bookmarks.length }} 题</span>
        <button class="btn-practice" @click="startBookmarkQuiz" :disabled="bookmarks.length === 0">
          <i class="fas fa-pen"></i> 收藏题专练
        </button>
      </div>
    </div>

    <div class="filter-bar">
      <select v-model="filterType" class="filter-select">
        <option value="all">全部类型</option>
        <option value="单选题">单选题</option>
        <option value="多选题">多选题</option>
        <option value="判断题">判断题</option>
        <option value="填空题">填空题</option>
      </select>
      <input v-model="searchText" class="filter-input" placeholder="搜索题目..." />
    </div>

    <div v-if="loading" class="loading-state">
      <i class="fas fa-spinner fa-spin"></i> 加载中...
    </div>

    <div v-else-if="filteredBookmarks.length === 0" class="empty-state">
      <i class="fas fa-star empty-icon"></i>
      <p v-if="bookmarks.length === 0">暂无收藏题目</p>
      <p v-else>没有匹配的题目</p>
    </div>

    <div v-else class="bookmark-list">
      <div v-for="item in filteredBookmarks" :key="item.questionId" class="bookmark-item">
        <div class="item-header">
          <span class="item-type">{{ item.question.type }}</span>
          <span class="item-id">ID: {{ item.question.id }}</span>
          <button class="btn-remove" @click="removeBookmark(item.questionId)" title="取消收藏">
            <i class="fas fa-star"></i>
          </button>
        </div>
        <div class="item-text">{{ item.question.text }}</div>
        <div class="item-footer">
          <span class="item-date">收藏于 {{ formatDate(item.createdAt) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BookmarkList',
  data() {
    return {
      filterType: 'all',
      searchText: ''
    };
  },
  computed: {
    bookmarks() {
      return this.$store.getters['bookmarks/bookmarks'];
    },
    loading() {
      return this.$store.getters['bookmarks/isLoading'];
    },
    filteredBookmarks() {
      let list = this.bookmarks;
      if (this.filterType !== 'all') {
        list = list.filter(b => b.question.type === this.filterType);
      }
      if (this.searchText.trim()) {
        const keyword = this.searchText.trim().toLowerCase();
        list = list.filter(b => b.question.text.toLowerCase().includes(keyword));
      }
      return list;
    }
  },
  methods: {
    async removeBookmark(questionId) {
      await this.$store.dispatch('bookmarks/toggleBookmark', questionId);
      await this.$store.dispatch('bookmarks/fetchBookmarks');
    },
    async startBookmarkQuiz() {
      if (this.bookmarks.length === 0) return;
      this.$store.commit('quiz/SET_MODE', 'bookmark');
      try {
        const response = await this.$store.dispatch('quiz/startQuiz', { mode: 'bookmark' });
        if (response) {
          this.$router.push('/quiz');
        }
      } catch {
        alert('启动收藏题专练失败');
      }
    },
    formatDate(dateStr) {
      if (!dateStr) return '';
      const d = new Date(dateStr);
      return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    }
  },
  created() {
    this.$store.dispatch('bookmarks/fetchBookmarks');
  }
};
</script>

<style scoped>
.bookmark-page {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
}
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.page-header h2 {
  margin: 0;
  color: #333;
}
.page-header h2 i { color: #f9a825; }
.header-actions {
  display: flex;
  align-items: center;
  gap: 15px;
}
.bookmark-count {
  color: #6c757d;
  font-size: 0.9rem;
}
.btn-practice {
  padding: 8px 18px;
  background: linear-gradient(135deg, #f9a825, #f57f17);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: opacity 0.2s;
}
.btn-practice:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.filter-bar {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}
.filter-select, .filter-input {
  padding: 8px 12px;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  font-size: 0.9rem;
}
.filter-input { flex: 1; }
.loading-state, .empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #6c757d;
}
.empty-icon { font-size: 3rem; color: #dee2e6; margin-bottom: 15px; }
.bookmark-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.bookmark-item {
  background: white;
  border-radius: 8px;
  padding: 15px 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}
.item-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}
.item-type {
  background: #1e88e5;
  color: white;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
}
.item-id { font-size: 0.8rem; color: #6c757d; }
.btn-remove {
  margin-left: auto;
  background: none;
  border: none;
  color: #f9a825;
  font-size: 1.1rem;
  cursor: pointer;
}
.btn-remove:hover { color: #f57f17; }
.item-text {
  font-size: 0.95rem;
  line-height: 1.5;
  color: #333;
  white-space: pre-line;
}
.item-footer {
  margin-top: 10px;
  font-size: 0.8rem;
  color: #adb5bd;
}

@media (max-width: 768px) {
  .bookmark-page {
    padding: 10px;
  }

  .page-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .filter-bar {
    flex-direction: column;
  }

  .filter-bar input {
    width: 100%;
  }

  .bookmark-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .bookmark-actions {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>
