import { defineStore } from "pinia";
import { getQuestions } from "../api/question";

export const useQuestionStore = defineStore("question", {
  state: () => ({
    loading: false,
    items: [] as Array<{ id: string; type: string; text: string }>
  }),
  actions: {
    async load() {
      this.loading = true;
      try {
        const page = await getQuestions();
        this.items = page.data ?? [];
      } finally {
        this.loading = false;
      }
    }
  }
});
