# Quiz Gen App V1 交付清单

交付日期：2026-02-13

## 1. 交付范围
- 后端：`backend-springboot/`（Spring Boot + MySQL）
- 前端：`frontend-new/`（Vue 3 + TypeScript）
- 规格与审计文档：`REBUILD_SPEC_V1.md`、`LEGACY_MODULE_FLOW_AUDIT.md`

## 2. 功能覆盖
- 题库：题目 CRUD、标签、题库管理、导入、去重、备份恢复
- 学习：测验、复习、会话提交、错题集、闪卡、drill
- 统计：overview、trends、timeline、progress、advisor、会话统计
- AI：explanation、error-analysis、variant、knowledge-tree、design-process
- 个人：笔记、收藏、学习打卡
- 设置：API 配置、字体、导入参数、数据目录、整库备份恢复
- 异步任务：
  - AI 导入任务：分片处理、状态查询、失败可见
  - 整库备份任务：`backup_job` 轮询、重试、超时清理、保留清理

## 3. 目录清理
- 已删除旧实现目录：
  - `backend/`
  - `frontend/`
- 当前仓库只保留重构主线代码。

## 4. 已完成验证
- 后端编译：`mvn -DskipTests compile` 通过（`backend-springboot`）
- 前端构建：`npm run build` 通过（`frontend-new`）

## 5. 运行入口
- 后端：`backend-springboot`，默认 `http://localhost:5000`
- 前端：`frontend-new`，默认 `http://localhost:5173`
- API 前缀：`/api`

## 6. 当前剩余事项（非阻断）
- 前端交互细节打磨
- 端到端回归用例全量执行与结果归档
