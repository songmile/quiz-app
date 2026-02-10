<template>
  <div class="question-banks">
    <div class="banks-header">
      <h1 class="page-title">题库分组</h1>
      <button class="action-button primary" @click="showCreateModal = true">
        <i class="fas fa-plus"></i> 新建题库
      </button>
    </div>

    <div class="loading-state" v-if="loading">
      <i class="fas fa-circle-notch fa-spin"></i>
      <span>加载中...</span>
    </div>

    <div class="empty-state" v-else-if="!banks || banks.length === 0">
      <i class="fas fa-layer-group"></i>
      <p>还没有创建题库分组</p>
      <button class="action-button primary" @click="showCreateModal = true">
        <i class="fas fa-plus"></i> 创建第一个题库
      </button>
    </div>

    <div class="banks-grid" v-else>
      <div class="bank-card" v-for="bank in banks" :key="bank.id">
        <div class="bank-header">
          <h3 class="bank-name">{{ bank.name }}</h3>
          <div class="bank-actions">
            <button class="icon-btn edit" @click="editBank(bank)" title="编辑">
              <i class="fas fa-edit"></i>
            </button>
            <button class="icon-btn delete" @click="confirmDelete(bank)" title="删除">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
        <p class="bank-desc">{{ bank.description || '暂无描述' }}</p>
        <div class="bank-footer">
          <span class="question-count">
            <i class="fas fa-file-alt"></i> {{ bank.questionCount }} 道题目
          </span>
          <span class="bank-date">{{ formatDate(bank.createdAt) }}</span>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div class="modal" v-if="showCreateModal || showEditModal">
      <div class="modal-overlay" @click="closeModals"></div>
      <div class="modal-container">
        <div class="modal-header">
          <h3>{{ showEditModal ? '编辑题库' : '新建题库' }}</h3>
          <button class="close-button" @click="closeModals">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>题库名称</label>
            <input type="text" v-model="formData.name" placeholder="输入题库名称...">
          </div>
          <div class="form-group">
            <label>描述</label>
            <textarea v-model="formData.description" rows="3" placeholder="输入描述（可选）..."></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="cancel-button" @click="closeModals">取消</button>
          <button class="save-button" @click="saveBank" :disabled="!formData.name">
            {{ showEditModal ? '保存' : '创建' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation -->
    <div class="modal" v-if="showDeleteModal">
      <div class="modal-overlay" @click="showDeleteModal = false"></div>
      <div class="modal-container delete-confirm">
        <div class="modal-header">
          <h3>确认删除</h3>
          <button class="close-button" @click="showDeleteModal = false">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <p>确定要删除题库「{{ bankToDelete?.name }}」吗？题目将变为未分组状态。</p>
        </div>
        <div class="modal-footer">
          <button class="cancel-button" @click="showDeleteModal = false">取消</button>
          <button class="delete-btn" @click="deleteBank">确认删除</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'QuestionBanks',
  data() {
    return {
      showCreateModal: false,
      showEditModal: false,
      showDeleteModal: false,
      formData: { name: '', description: '' },
      editingBankId: null,
      bankToDelete: null
    };
  },
  computed: {
    banks() { return this.$store.getters['banks/allBanks']; },
    loading() { return this.$store.getters['banks/isLoading']; }
  },
  methods: {
    editBank(bank) {
      this.formData = { name: bank.name, description: bank.description };
      this.editingBankId = bank.id;
      this.showEditModal = true;
    },
    confirmDelete(bank) {
      this.bankToDelete = bank;
      this.showDeleteModal = true;
    },
    async saveBank() {
      if (!this.formData.name) return;
      if (this.showEditModal) {
        await this.$store.dispatch('banks/updateBank', {
          id: this.editingBankId, data: this.formData
        });
      } else {
        await this.$store.dispatch('banks/createBank', this.formData);
      }
      this.closeModals();
    },
    async deleteBank() {
      if (!this.bankToDelete) return;
      await this.$store.dispatch('banks/deleteBank', this.bankToDelete.id);
      this.showDeleteModal = false;
      this.bankToDelete = null;
    },
    closeModals() {
      this.showCreateModal = false;
      this.showEditModal = false;
      this.formData = { name: '', description: '' };
      this.editingBankId = null;
    },
    formatDate(d) {
      if (!d) return '';
      return new Date(d).toLocaleDateString('zh-CN');
    }
  },
  created() {
    this.$store.dispatch('banks/fetchBanks');
  }
};
</script>
