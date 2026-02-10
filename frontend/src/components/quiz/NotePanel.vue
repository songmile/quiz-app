<template>
  <div class="note-panel">
    <div class="note-toggle" @click="expanded = !expanded">
      <i class="fas" :class="expanded ? 'fa-chevron-down' : 'fa-chevron-right'"></i>
      <span>笔记</span>
      <span class="note-badge" v-if="notes.length > 0">{{ notes.length }}</span>
    </div>

    <div class="note-content" v-if="expanded">
      <div class="notes-list" v-if="notes.length > 0">
        <div class="note-item" v-for="note in notes" :key="note._id">
          <div class="note-body" v-if="editingNoteId !== note._id">
            <p>{{ note.content }}</p>
            <div class="note-meta">
              <span>{{ formatDate(note.updatedAt) }}</span>
              <div class="note-actions">
                <button @click="startEdit(note)" title="编辑">
                  <i class="fas fa-edit"></i>
                </button>
                <button @click="removeNote(note._id)" title="删除">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
          </div>
          <div class="note-edit" v-else>
            <textarea v-model="editContent" rows="3"></textarea>
            <div class="edit-actions">
              <button class="save-btn" @click="saveEdit(note._id)">保存</button>
              <button class="cancel-btn" @click="cancelEdit">取消</button>
            </div>
          </div>
        </div>
      </div>

      <div class="note-empty" v-else>
        <span>暂无笔记</span>
      </div>

      <div class="note-add">
        <textarea
          v-model="newContent"
          rows="2"
          placeholder="写下你的笔记..."
        ></textarea>
        <button
          class="add-btn"
          @click="addNote"
          :disabled="!newContent.trim()"
        >
          <i class="fas fa-plus"></i> 保存笔记
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NotePanel',
  props: {
    questionId: { type: String, required: true }
  },
  data() {
    return {
      expanded: false,
      newContent: '',
      editingNoteId: null,
      editContent: ''
    };
  },
  computed: {
    notes() {
      return this.$store.getters['notes/questionNotes'];
    }
  },
  watch: {
    questionId: {
      immediate: true,
      handler(id) {
        if (id) {
          this.$store.dispatch('notes/fetchQuestionNotes', id);
        }
      }
    }
  },
  methods: {
    async addNote() {
      if (!this.newContent.trim()) return;
      await this.$store.dispatch('notes/createNote', {
        questionId: this.questionId,
        content: this.newContent.trim()
      });
      this.newContent = '';
    },
    startEdit(note) {
      this.editingNoteId = note._id;
      this.editContent = note.content;
    },
    cancelEdit() {
      this.editingNoteId = null;
      this.editContent = '';
    },
    async saveEdit(noteId) {
      await this.$store.dispatch('notes/updateNote', {
        id: noteId,
        content: this.editContent,
        questionId: this.questionId
      });
      this.cancelEdit();
    },
    async removeNote(noteId) {
      await this.$store.dispatch('notes/deleteNote', {
        id: noteId,
        questionId: this.questionId
      });
    },
    formatDate(d) {
      if (!d) return '';
      return new Date(d).toLocaleString('zh-CN');
    }
  }
};
</script>
