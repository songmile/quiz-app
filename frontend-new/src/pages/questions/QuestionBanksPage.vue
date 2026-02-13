<template>
  <section class="page">
    <header class="row between">
      <h2>题库管理</h2>
      <RouterLink class="btn" to="/questions">返回列表</RouterLink>
    </header>

    <form class="panel row wrap" @submit.prevent="create">
      <input v-model="name" placeholder="题库名称" required />
      <input v-model="description" placeholder="题库描述" />
      <button class="btn" :disabled="loading">新建题库</button>
    </form>

    <div class="panel" v-if="error">{{ error }}</div>

    <div class="panel">
      <table class="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>名称</th>
            <th>描述</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in banks" :key="item.id">
            <td>{{ item.id }}</td>
            <td>
              <input v-model="item.name" />
            </td>
            <td>
              <input v-model="item.description" />
            </td>
            <td class="row">
              <button class="btn" @click="save(item)">保存</button>
              <button class="btn danger" @click="remove(item.id)">删除</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
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
    await createBank({ name: name.value.trim(), description: description.value.trim() || undefined });
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
    await updateBank(item.id, { name: item.name.trim(), description: item.description?.trim() || undefined });
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
.page { display: grid; gap: 12px; }
.row { display: flex; gap: 8px; align-items: center; }
.wrap { flex-wrap: wrap; }
.between { justify-content: space-between; }
.panel { border: 1px solid #dcdfe6; border-radius: 8px; padding: 12px; }
.btn { border: 1px solid #c9ced6; background: #fff; padding: 6px 10px; border-radius: 6px; cursor: pointer; text-decoration: none; color: #222; }
.btn.danger { border-color: #e06c75; color: #c0392b; }
.table { width: 100%; border-collapse: collapse; }
.table th, .table td { border-bottom: 1px solid #f0f2f5; text-align: left; padding: 8px; }
input { border: 1px solid #c9ced6; border-radius: 6px; padding: 6px 8px; width: 100%; }
</style>
