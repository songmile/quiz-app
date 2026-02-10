import { createRouter, createWebHistory } from 'vue-router';
import store from '@/store';

// Eager: Home is the landing page
import Home from '@/views/Home.vue';

// Lazy-loaded views
const QuizMode = () => import('@/views/QuizMode.vue');
const ReviewMode = () => import('@/views/ReviewMode.vue');
const QuestionManager = () => import('@/views/QuestionManager.vue');
const Statistics = () => import('@/views/Statistics.vue');
const Settings = () => import('@/views/Settings.vue');
const NotFound = () => import('@/views/NotFound.vue');
const NoteList = () => import('@/views/notes/NoteList.vue');
const BookmarkList = () => import('@/views/bookmarks/BookmarkList.vue');
const FlashcardMode = () => import('@/views/FlashcardMode.vue');
const DrillMode = () => import('@/views/DrillMode.vue');

// Lazy-loaded sub-views
const QuestionList = () => import('@/views/questions/QuestionList.vue');
const QuestionDetail = () => import('@/views/questions/QuestionDetail.vue');
const QuestionImport = () => import('@/views/questions/QuestionImport.vue');
const QuestionBackup = () => import('@/views/questions/QuestionBackup.vue');
const QuestionBanks = () => import('@/views/questions/QuestionBanks.vue');

const StatsOverview = () => import('@/views/stats/StatsOverview.vue');
const StatsWrongQuestions = () => import('@/views/stats/StatsWrongQuestions.vue');
const StatsAdvisor = () => import('@/views/stats/StatsAdvisor.vue');
const StatsTrends = () => import('@/views/stats/StatsTrends.vue');
const StatsTimeline = () => import('@/views/stats/StatsTimeline.vue');
const StatsProgress = () => import('@/views/stats/StatsProgress.vue');

const SettingsGeneral = () => import('@/views/settings/SettingsGeneral.vue');
const SettingsApi = () => import('@/views/settings/SettingsApi.vue');
const SettingsFont = () => import('@/views/settings/SettingsFont.vue');
const SettingsBackup = () => import('@/views/settings/SettingsBackup.vue');

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: { title: '首页 - Spring Boot 刷题系统' }
  },
  {
    path: '/quiz',
    name: 'QuizMode',
    component: QuizMode,
    meta: { title: '答题模式 - Spring Boot 刷题系统' }
  },
  {
    path: '/review',
    name: 'ReviewMode',
    component: ReviewMode,
    meta: { title: '错题复习 - Spring Boot 刷题系统' }
  },
  {
    path: '/notes',
    name: 'NoteList',
    component: NoteList,
    meta: { title: '我的笔记 - Spring Boot 刷题系统' }
  },
  {
    path: '/bookmarks',
    name: 'BookmarkList',
    component: BookmarkList,
    meta: { title: '我的收藏 - Spring Boot 刷题系统' }
  },
  {
    path: '/flashcards',
    name: 'FlashcardMode',
    component: FlashcardMode,
    meta: { title: '闪卡模式 - Spring Boot 刷题系统' }
  },
  {
    path: '/drill',
    name: 'DrillMode',
    component: DrillMode,
    meta: { title: '智能组卷 - Spring Boot 刷题系统' }
  },
  {
    path: '/questions',
    name: 'QuestionManager',
    component: QuestionManager,
    meta: { title: '题库管理 - Spring Boot 刷题系统' },
    children: [
      {
        path: '',
        name: 'QuestionList',
        component: QuestionList,
        meta: { title: '题目列表 - Spring Boot 刷题系统' }
      },
      {
        path: 'import',
        name: 'QuestionImport',
        component: QuestionImport,
        meta: { title: '题目导入 - Spring Boot 刷题系统' }
      },
      {
        path: 'backup',
        name: 'QuestionBackup',
        component: QuestionBackup,
        meta: { title: '题库备份 - Spring Boot 刷题系统' }
      },
      {
        path: 'banks',
        name: 'QuestionBanks',
        component: QuestionBanks,
        meta: { title: '题库分组 - Spring Boot 刷题系统' }
      },
      {
        path: ':id',
        name: 'QuestionDetail',
        component: QuestionDetail,
        props: true,
        meta: { title: '题目详情 - Spring Boot 刷题系统' }
      }
    ]
  },
  {
    path: '/stats',
    name: 'Statistics',
    component: Statistics,
    meta: { title: '学习统计 - Spring Boot 刷题系统' },
    redirect: { name: 'StatsOverview' },
    children: [
      {
        path: 'overview',
        name: 'StatsOverview',
        component: StatsOverview,
        meta: { title: '统计概览 - Spring Boot 刷题系统' }
      },
      {
        path: 'wrong-questions',
        name: 'StatsWrongQuestions',
        component: StatsWrongQuestions,
        meta: { title: '错题统计 - Spring Boot 刷题系统' }
      },
      {
        path: 'advisor',
        name: 'StatsAdvisor',
        component: StatsAdvisor,
        meta: { title: '智能顾问 - Spring Boot 刷题系统' }
      },
      {
        path: 'trends',
        name: 'StatsTrends',
        component: StatsTrends,
        meta: { title: '学习趋势 - Spring Boot 刷题系统' }
      },
      {
      path: 'timeline',
      name: 'StatsTimeline',
      component: StatsTimeline,
      meta: { title: '学习时间线 - Spring Boot 刷题系统' }
      },
      {
        path: 'progress',
        name: 'StatsProgress',
        component: StatsProgress,
        meta: { title: '学习进度 - Spring Boot 刷题系统' }
      }
    ]
  },
  {
    path: '/settings',
    name: 'Settings',
    component: Settings,
    meta: { title: '设置 - Spring Boot 刷题系统' },
    redirect: { name: 'SettingsGeneral' },
    children: [
      {
        path: 'general',
        name: 'SettingsGeneral',
        component: SettingsGeneral,
        meta: { title: '通用设置 - Spring Boot 刷题系统' }
      },
      {
        path: 'api',
        name: 'SettingsApi',
        component: SettingsApi,
        meta: { title: 'API设置 - Spring Boot 刷题系统' }
      },
      {
        path: 'font',
        name: 'SettingsFont',
        component: SettingsFont,
        meta: { title: '字体设置 - Spring Boot 刷题系统' }
      },
      {
        path: 'backup',
        name: 'SettingsBackup',
        component: SettingsBackup,
        meta: { title: '备份恢复 - Spring Boot 刷题系统' }
      }
    ]
  },
  {
    path: '/:catchAll(.*)',
    name: 'NotFound',
    component: NotFound,
    meta: { title: '404 Not Found - Spring Boot 刷题系统' }
  }
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
});

// Global navigation guard
router.beforeEach((to, from, next) => {
  // Update document title
  document.title = to.meta.title || 'Spring Boot 刷题系统';
  
  // Continue navigation
  next();
});

// After navigation complete, update view history if needed
router.afterEach((to) => {
  // Update view history for quiz and review pages
  if (to.name === 'QuizMode' || to.name === 'ReviewMode') {
    const view = to.name === 'QuizMode' ? 'quiz' : 'review';
    const currentIndex = store.getters['quiz/currentIndex'] || 0;
    
    store.dispatch('stats/updateViewHistory', {
      view,
      currentIndex
    });
  }
});

export default router;