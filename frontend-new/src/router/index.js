import { createRouter, createWebHistory } from "vue-router";
const routes = [
    { path: "/", component: () => import("../pages/HomePage.vue") },
    { path: "/quiz", component: () => import("../pages/QuizPage.vue") },
    { path: "/review", component: () => import("../pages/ReviewPage.vue") },
    { path: "/flashcards", component: () => import("../pages/FlashcardPage.vue") },
    { path: "/drill", component: () => import("../pages/DrillPage.vue") },
    { path: "/notes", component: () => import("../pages/notes/NoteListPage.vue") },
    { path: "/bookmarks", component: () => import("../pages/bookmarks/BookmarkListPage.vue") },
    {
        path: "/questions",
        component: () => import("../pages/questions/QuestionRootPage.vue"),
        children: [
            { path: "", component: () => import("../pages/questions/QuestionListPage.vue") },
            { path: "import", component: () => import("../pages/questions/QuestionImportPage.vue") },
            { path: "backup", component: () => import("../pages/questions/QuestionBackupPage.vue") },
            { path: "banks", component: () => import("../pages/questions/QuestionBanksPage.vue") },
            { path: ":id", component: () => import("../pages/questions/QuestionDetailPage.vue") }
        ]
    },
    {
        path: "/stats",
        component: () => import("../pages/stats/StatsRootPage.vue"),
        children: [
            { path: "", redirect: "/stats/overview" },
            { path: "overview", component: () => import("../pages/stats/StatsOverviewPage.vue") },
            { path: "wrong-questions", component: () => import("../pages/stats/StatsWrongQuestionsPage.vue") },
            { path: "advisor", component: () => import("../pages/stats/StatsAdvisorPage.vue") },
            { path: "trends", component: () => import("../pages/stats/StatsTrendsPage.vue") },
            { path: "timeline", component: () => import("../pages/stats/StatsTimelinePage.vue") },
            { path: "progress", component: () => import("../pages/stats/StatsProgressPage.vue") }
        ]
    },
    {
        path: "/settings",
        component: () => import("../pages/settings/SettingsRootPage.vue"),
        children: [
            { path: "", redirect: "/settings/general" },
            { path: "general", component: () => import("../pages/settings/SettingsGeneralPage.vue") },
            { path: "api", component: () => import("../pages/settings/SettingsApiPage.vue") },
            { path: "font", component: () => import("../pages/settings/SettingsFontPage.vue") },
            { path: "backup", component: () => import("../pages/settings/SettingsBackupPage.vue") }
        ]
    },
    { path: "/:pathMatch(.*)*", component: () => import("../pages/NotFoundPage.vue") }
];
export default createRouter({
    history: createWebHistory(),
    routes
});
