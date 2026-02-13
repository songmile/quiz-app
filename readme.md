# Quiz Gen App

当前仓库仅保留重构后的主线实现：`backend-springboot` + `frontend-new`。  
旧 `backend/`、`frontend/` 已于 2026-02-13 从仓库移除。

## 技术栈
- 后端：Spring Boot 3.3、Java 17、MyBatis Plus、Flyway、MySQL 8
- 前端：Vue 3、TypeScript、Vite、Pinia、Vue Router

## 快速启动

### 1. 启动 MySQL 并创建数据库

```sql
CREATE DATABASE quiz_gen_app CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. 启动后端

```bash
cd backend-springboot
# 按需修改 src/main/resources/application.yml 的数据库账号密码
mvn spring-boot:run
```

默认地址：`http://localhost:5000`

### 3. 启动前端

```bash
cd frontend-new
npm install
npm run dev
```

默认地址：`http://localhost:5173`

前端请求默认走 `/api`，直连后端 `http://localhost:5000/api`。

## 当前功能状态
- 后端：题库/题库管理、答题、复习、统计、AI 解析、设置、笔记、收藏、闪卡、drill、AI 异步导入、整库备份任务化重试均已可用。
- 前端：核心页面已接通后端 API，覆盖主要学习与设置流程。
- 待收口：前端深度交互打磨与完整回归测试。

## 目录说明
- `backend-springboot/`：新后端
- `frontend-new/`：新前端
- `REBUILD_SPEC_V1.md`：重构规格
- `LEGACY_MODULE_FLOW_AUDIT.md`：旧系统模块/流程审计记录（文档保留，源码已移除）
