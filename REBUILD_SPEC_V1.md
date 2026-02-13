# Quiz Gen App 重构规格 V1（全量重建）

## 1. 目标
- 现有 Node.js + MongoDB 后端与旧前端全部重建。
- 新后端：Spring Boot 3.3 + Java 17 + MySQL 8 + MyBatis Plus + Flyway。
- 新前端：Vue 3 + TypeScript + Vite + Pinia + Vue Router。
- 业务目标：保持现有功能完整覆盖，接口行为可平滑迁移。

## 2. 范围
- In Scope：题库、答题、复习、统计、AI、设置、备份恢复、笔记、收藏、打卡、闪卡、智能组卷。
- Out Scope（V1 不做）：多用户、权限系统、支付、消息推送、复杂审计、API Key 落库加密（按当前单用户部署策略）。

## 3. 领域模块
- Question Domain：questions/banks/import/backup/tags。
- Quiz Domain：quiz sessions/submit/navigator/history。
- Review Domain：spaced review + SM2。
- Stats Domain：overview/trends/timeline/progress/advisor。
- AI Domain：explanation/error-analysis/variant/knowledge-tree/design-process。
- Settings Domain：API 配置、字体、导入参数、数据路径、整库备份恢复。
- Personal Domain：notes/bookmarks/streak/flashcards/drill。

## 4. 后端架构
- 分层：controller -> application service -> domain service -> repository。
- DTO：request/response 独立，禁止直接暴露 entity。
- 错误模型：统一 `code/message/details`。
- 异步任务：AI 生成与导入流程进入 job 表 + 轮询接口。
- 事务边界：写操作按单用例最小事务，跨聚合事件解耦。

## 5. MySQL 数据模型（V1）
- `question_bank`：id, bank_code, name, description, created_at。
- `question`：id, question_code, bank_id, type, text, answer, explanation, created_at, updated_at。
- `question_option`：id, question_id, option_key, option_text, sort_order。
- `question_tag`：id, name, created_at。
- `question_tag_rel`：id, question_id, tag_id。
- `user_answer`：id, question_id, user_answer, is_correct, session_type, answered_at。
- `review_card`：id, question_id, ease_factor, interval_days, repetitions, next_review_at, last_review_at, total_reviews, total_correct。
- `study_session`：id, mode, started_at, ended_at, questions_answered, correct_answers。
- `statistics_snapshot`：id, total_answered, total_correct, study_minutes, wrong_question_count, updated_at。
- `wrong_question`：id, question_id, first_wrong_at, last_wrong_at。
- `view_history`：id, view_key, current_index, updated_at。
- `note`：id, question_id, content, created_at, updated_at。
- `bookmark`：id, question_id, created_at。
- `study_streak`：id, current_streak, longest_streak, last_active_date, daily_goal, today_progress, updated_at。
- `study_streak_log`：id, streak_id, stat_date, questions_answered, correct_answers。
- `app_setting`：id, setting_key, setting_value_json, updated_at。
- `api_config`：id, name, api_url, model, api_key_masked, api_key_cipher, chunk_size, max_tokens, enabled, updated_at。
  - 说明：`api_key_cipher` 字段名为兼容保留，V1 实现不强制加密-at-rest。
- `ai_explanation`：id, question_id, content, api_config_id, generated_at。
- `ai_error_analysis`：id, question_id, user_answer, content, api_config_id, generated_at。
- `ai_variant_question`：id, question_id, variant_payload_json, generated_at。
- `ai_knowledge_tree`：id, question_id, tree_payload_json, generated_at。
- `ai_design_process`：id, question_id, process_payload_json, generated_at。
- `import_job`：id, job_no, mode, status, total_chunks, processed_chunks, success_chunks, failed_chunks, started_at, ended_at, error_message。
- `import_job_item`：id, job_id, chunk_no, status, result_json, error_message。
- `backup_job`：id, job_no, kind, filename, status, retry_count, max_retries, error_message, started_at, ended_at, created_at, updated_at。

## 6. 接口策略
- V1 保留 `/api/*` 路径前缀。
- 先兼容现有前端关键接口与字段，再逐步收敛命名规范。
- 分页统一：`page`, `size`, `total`, `items`。
- 状态统一：HTTP + 业务码（成功码固定 0）。

## 7. 前端架构
- 页面保留现有信息架构：Home/Quiz/Review/Questions/Stats/Settings/Notes/Bookmarks/Flashcards/Drill。
- 状态拆分为 domain stores（questions, quiz, review, stats, ai, settings...）。
- API SDK 独立，所有请求集中在 `src/api`。
- 图表统一组件层，避免页面重复拼装。

## 8. 迁移顺序
1. 基础工程与基础设施（日志、异常、配置、DB 迁移）。
2. Core CRUD：questions/banks/notes/bookmarks。
3. 学习流程：quiz + submit + sessions。
4. 复习与统计：review/stats/streak。
5. AI 与导入任务。
6. 备份恢复。
7. 前端完整接入与回归测试。

## 9. 验收标准
- 关键页面全可用且无阻断。
- 关键 API 覆盖率 >= 90%。
- 核心流程（答题、复习、导入、备份恢复）端到端通过。
- 迁移后 MySQL 数据一致性校验通过。

## 10. 目录规划
- `backend-springboot/`
  - `src/main/java/.../controller`
  - `src/main/java/.../application`
  - `src/main/java/.../domain`
  - `src/main/java/.../infrastructure`
  - `src/main/resources/db/migration`
- `frontend-new/`
  - `src/pages`
  - `src/components`
  - `src/stores`
  - `src/api`
  - `src/router`

## 11. 风险与约束
- 现有项目为单用户模型，V1 继续单用户。
- AI 调用存在第三方不稳定性，必须有任务重试与失败可见性。
- 统计相关历史口径在重构时要固定版本，避免前后不一致。
