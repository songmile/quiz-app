# Spring Boot 刷题系统使用说明

这个文档提供了关于 Spring Boot 刷题系统的详细安装、配置和使用说明。本系统是一个基于 Vue + Node.js + MongoDB 的 Web 应用，旨在帮助用户学习和练习 Spring Boot 相关题目。

## 目录

- [系统要求](#系统要求)
- [安装步骤](#安装步骤)
  - [MongoDB 安装](#mongodb-安装)
  - [后端设置](#后端设置)
  - [前端设置](#前端设置)
- [启动系统](#启动系统)
  - [使用原生方式启动](#使用原生方式启动)
  - [使用 Docker 启动](#使用-docker-启动)
- [常见问题与解决方案](#常见问题与解决方案)
- [系统功能说明](#系统功能说明)
- [注意事项](#注意事项)

## 系统要求

- Node.js v14.0.0 或更高版本
- MongoDB v4.0 或更高版本
- npm v6.0.0 或更高版本
- 现代浏览器（Chrome、Firefox、Edge等）

## 安装步骤

### MongoDB 安装

1. **Ubuntu/Debian 系统**:
   ```bash
   sudo apt update
   sudo apt install -y mongodb
   sudo systemctl start mongodb
   sudo systemctl enable mongodb  # 设置开机自启
   ```

2. **检查 MongoDB 是否运行**:
   ```bash
   sudo systemctl status mongodb
   ```
   
   确保服务状态为 "active (running)"。

3. **如果使用 Docker**，MongoDB 会通过 docker-compose 启动，无需单独安装。

### 后端设置

1. **克隆仓库**:
   ```bash
   git clone <repository-url> spring-boot-quiz-app
   cd spring-boot-quiz-app
   ```

2. **安装后端依赖**:
   ```bash
   cd backend
   npm install
   ```

3. **配置环境变量**:
   ```bash
   cp env-file.txt .env
   ```
   
   编辑 `.env` 文件，确保 MongoDB URI 正确设置:
   ```
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/spring-boot-quiz
   DEFAULT_API_KEY=your_api_key   # 如果有使用外部AI服务
   DATA_DIR=data
   ```

4. **创建数据目录**:
   ```bash
   mkdir -p data/backups
   chmod -R 755 data
   ```

### 前端设置

1. **安装前端依赖**:
   ```bash
   cd ../frontend
   npm install
   ```

2. **配置 API URL**:
   在前端根目录创建一个 `.env.local` 文件:
   ```
   VUE_APP_API_URL=http://localhost:5000/api
   ```
   
   如果后端不是运行在 localhost 上，请相应修改 URL。

## 启动系统

### 使用原生方式启动

1. **启动 MongoDB** (如果尚未运行):
   ```bash
   sudo systemctl start mongodb
   ```

2. **启动后端**:
   ```bash
   cd spring-boot-quiz-app/backend
   npm run dev
   ```
   
   应该看到类似以下输出:
   ```
   服务器运行在端口 5000
   MongoDB connected: localhost
   ```

3. **启动前端**:
   ```bash
   cd ../frontend
   npm run serve
   ```
   
   前端通常会运行在 `http://localhost:8080`

4. **在浏览器中访问**:
   打开 `http://localhost:8080` 访问系统。

### 使用 Docker 启动

1. **确保 Docker 和 Docker Compose 已安装**:
   ```bash
   docker --version
   docker-compose --version
   ```

2. **创建 docker-compose.yml**:
   ```bash
   cd spring-boot-quiz-app
   cp dockercompose.txt docker-compose.yml
   ```

3. **启动容器**:
   ```bash
   docker-compose up -d
   ```
   
   这将启动 MongoDB 和后端服务。前端仍需单独启动（或者取消 docker-compose.yml 中前端服务的注释）。

4. **检查容器状态**:
   ```bash
   docker-compose ps
   ```
   
   确保所有服务都处于 "Up" 状态。

5. **查看日志**:
   ```bash
   docker-compose logs -f
   ```

## 常见问题与解决方案

### MongoDB 连接问题

**问题**: `Error connecting to MongoDB: The uri parameter to openUri() must be a string, got "undefined"`

**解决方案**:
- 确保 MongoDB 服务运行中
- 检查 `.env` 文件是否存在并包含正确的 `MONGODB_URI`
- 尝试手动设置环境变量: `MONGODB_URI=mongodb://localhost:27017/spring-boot-quiz node src/app.js`

### 前端无法连接到后端

**问题**: 控制台显示 `ERR_CONNECTION_REFUSED` 错误

**解决方案**:
- 确保后端正在运行
- 检查前端 API URL 配置是否正确
- 确认没有防火墙阻止连接
- 如果在不同设备上运行，确保使用正确的 IP 地址而不是 localhost

### 备份/恢复功能失败

**问题**: `ENOENT: no such file or directory, scandir 'data/backups'`

**解决方案**:
- 创建必要的目录: `mkdir -p data/backups`
- 确保目录权限正确: `chmod -R 755 data`
- 检查 `DATA_DIR` 环境变量设置

### Map 对象错误

**问题**: `Cannot read properties of undefined (reading 'has')` 或 `Cannot read properties of undefined (reading 'total')`

**解决方案**:
修改 `service-stats.js` 文件中的代码，确保对象在使用前已正确初始化:
```javascript
// 更新分类统计
if (!stats.category_stats || !stats.category_stats.stats) {
  stats.category_stats = { stats: new Map() };
}

// 检查stats是否是一个Map对象
if (!(stats.category_stats.stats instanceof Map)) {
  stats.category_stats.stats = new Map();
}

// 获取该类型的统计，如果不存在则创建
let categoryStats = stats.category_stats.stats.get(questionType);
if (!categoryStats) {
  categoryStats = { total: 0, correct: 0 };
  stats.category_stats.stats.set(questionType, categoryStats);
}
```

## 系统功能说明

### 题库管理
- **导入题目**: 支持文本、JSON和AI智能导入
- **编辑题目**: 修改已有题目的内容、选项、答案和解析
- **删除题目**: 移除不需要的题目
- **备份恢复**: 创建和恢复题库备份

### 答题模式
- **普通答题**: 随机抽取题目进行练习
- **错题复习**: 专门复习之前做错的题目

### AI 功能
- **智能解析**: 使用 AI 生成详细题目解析
- **错误分析**: 分析用户错误答案的原因
- **变种题**: 生成测试相同知识点的变体题目
- **知识树**: 自动生成题目知识点的关系图谱

### 统计分析
- **学习进度**: 跟踪整体完成情况和正确率
- **分类统计**: 按题型查看学习情况
- **错题集**: 管理和查看错题记录
- **智能顾问**: 基于学习数据提供个性化建议

## 注意事项

1. **数据备份**:
   - 定期备份题库和学习进度
   - 备份文件存储在 `data/backups` 目录下

2. **系统性能**:
   - AI功能可能需要较长处理时间，请耐心等待
   - 大量题目导入时建议分批进行

3. **API 密钥**:
   - 如使用外部AI服务，需要配置有效的API密钥
   - 在 "设置" > "API设置" 中配置

4. **跨域问题**:
   - 如果前后端分离部署，需要正确配置CORS
   - 修改后端 `app.js` 中的 CORS 设置

5. **环境变量**:
   - 生产环境部署时，确保所有环境变量正确设置
   - 敏感信息（如API密钥）应妥善保管

6. **服务器要求**:
   - 推荐至少 1GB RAM 用于运行整个系统
   - AI功能可能需要更多资源

---

此系统由 [您的名称/组织] 开发和维护。如有问题或建议，请联系 [联系方式]。

部署1：
# 安装PM2
npm install -g pm2

# 启动后端
cd /root/spring-boot-quiz-app/backend
pm2 start src/app.js --name "quiz-backend"

# 启动前端（如果是使用Vue CLI的开发服务器）
cd /root/spring-boot-quiz-app/frontend
pm2 start npm --name "quiz-frontend" -- run serve

# 设置PM2开机自启
pm2 startup
pm2 save

# 查看运行状态
pm2 status

# 查看日志
pm2 logs quiz-backend
pm2 logs quiz-frontend



部署2：




