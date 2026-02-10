import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

// 导入第三方库
import 'chart.js/auto'  // 引入 Chart.js 用于统计图表
// 使用 @fortawesome/fontawesome-free 代替 font-awesome
import '@fortawesome/fontawesome-free/css/all.min.css'

// 创建 Vue 应用实例
const app = createApp(App)

// 创建简单通知函数替代缺失的 notification 工具
app.config.globalProperties.$notify = (options) => {
  console.log('Notification:', options)
  // 这里可以实现简单的通知逻辑，或者后续创建完整的通知组件
  alert(options.title + ': ' + options.text)
}

// 使用 Vuex 和 Vue Router
app.use(store)
app.use(router)

// 全局错误处理 - 修复未使用变量的ESLint警告
app.config.errorHandler = (err) => {
  console.error('Vue Error:', err)
  // 可以在这里添加错误报告逻辑
}

// 初始化操作 - 预加载设置
store.dispatch('settings/fetchSettings').catch(error => {
  console.error('Failed to load settings:', error)
})

// 挂载应用到 DOM
app.mount('#app')

// 开发环境下的警告配置
if (process.env.NODE_ENV === 'development') {
  console.info('Running in development mode')
}