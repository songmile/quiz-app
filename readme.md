# Quiz Gen App — 智能刷题系统

基于 **Vue 2 + Node.js + MongoDB** 的全功能刷题 Web 应用，支持多种学习模式、AI 辅助解析、智能组卷和学习数据统计。

## 系统要求

- Node.js v14+
- MongoDB v4.0+
- npm v6+
- 现代浏览器（Chrome、Firefox、Edge 等）

## 快速开始

### 1. 安装 MongoDB

```bash
# Ubuntu/Debian
sudo apt update && sudo apt install -y mongodb
sudo systemctl start mongodb
sudo systemctl enable mongodb
```

### 2. 后端设置

```bash
cd backend
npm install
```

在 `backend/` 目录下创建 `.env` 文件：

```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/spring-boot-quiz
DEFAULT_API_KEY=your_api_key
DATA_DIR=data
```

创建数据目录：

```bash
mkdir -p data/backups
```

### 3. 前端设置

```bash
cd frontend
npm install
```

如需修改 API 地址，在 `frontend/` 下创建 `.env.local`：

```
VUE_APP_API_URL=http://localhost:5000/api
```

### 4. 启动

```bash
# 终端1 — 启动后端
cd backend && npm run dev

# 终端2 — 启动前端
cd frontend && npm run serve
```

浏览器访问 `http://localhost:8080`。

## 功能概览

### 学习模式

| 模式 | 说明 |
|------|------|
| 普通答题 | 随机抽取题目进行练习 |
| 错题复习 | 基于间隔重复算法复习错题 |
| 闪卡模式 | 快速翻卡复习，支持 Again/Hard/Good/Easy 评级 |
| 智能组卷 | 按题型、数量自动组卷，含薄弱点分析 |

### 更多功能

| 功能 | 说明 |
|------|------|
| 我的收藏 | 收藏题目，支持按类型筛选和搜索 |
| 学习打卡 | 每日连续学习天数追踪 |
| 题库管理 | 支持文本、JSON、AI 智能导入，编辑/删除/备份 |
| 我的笔记 | 答题时记录笔记，按题目关联查看 |

### AI 辅助

- **智能解析** — AI 生成详细题目解析
- **错误分析** — 分析错误答案的原因
- **变种题** — 生成测试相同知识点的变体题目
- **知识树** — 自动生成知识点关系图谱

### 统计分析

- 学习进度与正确率追踪
- 按题型分类统计
- 错题集管理
- 学习趋势图表
- 智能顾问个性化建议

## 生产部署（PM2）

```bash
npm install -g pm2

# 启动后端
cd backend
pm2 start src/app.js --name "quiz-backend"

# 构建并部署前端
cd frontend
npm run build
# 将 dist/ 目录部署到 Nginx 等静态服务器

# PM2 开机自启
pm2 startup
pm2 save
```

## 技术栈

- **前端**: Vue 2 + Vuex + Vue Router
- **后端**: Node.js + Express
- **数据库**: MongoDB + Mongoose
- **AI**: 支持外部 LLM API 集成
