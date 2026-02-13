<template>
  <section class="page">
    <header class="row between wrap">
      <div>
        <h2>题库管理</h2>
        <p class="hint">维护题库名称和描述，便于分类训练。</p>
      </div>
      <RouterLink class="btn" to="/questions">返回题目列表</RouterLink>
    </header>

    <form class="panel form-grid" @submit.prevent="create">
      <label>
        题库名称
        <input v-model.trim="name" placeholder="如：数据库基础" required />
      </label>
      <label>
        题库描述
        <input v-model.trim="description" placeholder="可选描述" />
      </label>
      <div class="row full">
        <button class="btn primary" :disabled="loading || !name">新建题库</button>
      </div>
    </form>

    <div class="panel" v-if="error">{{ error }}</div>

    <article class="panel">
      <h3>已有题库</h3>
      <div class="table-wrap top-gap">
        <table>
          <thead>
            <tr>
              <th>编号</th>
              <th>名称</th>
              <th>描述</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in banks" :key="item.id">
              <td>{{ item.id }}</td>
              <td><input v-model.trim="item.name" /></td>
              <td><input v-model.trim="item.description" /></td>
              <td class="row wrap">
                <button class="btn" @click="save(item)">保存</button>
                <button class="btn danger" @click="remove(item.id)">删除</button>
              </td>
            </tr>
            <tr v-if="banks.length === 0">
              <td colspan="4">暂无题库</td>
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
import { createBank, deleteBank, getBanks, updateBank, type BankItem } from "../../api/bank";

const loading = ref(false);
const error = ref("");
const banks = ref<BankItem[]>([]);
const name = ref("");
const description = ref("");

async function load() {
  loading.value = true;
  error.value = "";
  try {
    banks.value = await getBanks();
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
    await createBank({ name: name.value, description: description.value || undefined });
    name.value = "";
    description.value = "";
    await load();
  } catch (e) {
    error.value = (e as Error).message;
  } finally {
    loading.value = false;
  }
}

async function save(item: BankItem) {
  try {
    await updateBank(item.id, { name: item.name, description: item.description || undefined });
    await load();
  } catch (e) {
    alert((e as Error).message);
  }
}

async function remove(id: string) {
  if (!confirm(`确认删除题库 ${id} ?`)) return;
  try {
    await deleteBank(id);
    await load();
  } catch (e) {
    alert((e as Error).message);
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
  grid-template-columns: repeat(2, minmax(220px, 1fr));
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

.top-gap {
  margin-top: 10px;
}

@media (max-width: 900px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
