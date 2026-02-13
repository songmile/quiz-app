# Legacy Module and Flow Audit (for full Spring Boot + MySQL rebuild)

Generated on: 2026-02-13
Note: legacy source directories (`backend/`, `frontend/`) were removed from this repository on 2026-02-13; this file is retained as audit reference.

## 1. Current codebase topology
- Legacy backend: `backend/` (Node.js + Express + Mongoose/MongoDB)
- Legacy frontend: `frontend/` (Vue 3 + Vuex + Vue Router + Axios)
- New backend: `backend-springboot/` (Spring Boot + MyBatis-Plus + Flyway + MySQL)
- New frontend: `frontend-new/` (Vue 3 + TS + Pinia + Vue Router + Vite)

## 2. Legacy frontend modules (route-level)
Routes from `frontend/src/router/index.js`:
- `/` Home
- `/quiz` quiz mode
- `/review` wrong-question review mode
- `/flashcards` flashcard mode
- `/drill` drill mode
- `/notes` note list
- `/bookmarks` bookmark list
- `/questions` question manager
- `/questions/import` import
- `/questions/backup` question backup/restore
- `/questions/banks` bank management
- `/questions/:id` question detail/edit
- `/stats/overview` overview
- `/stats/wrong-questions` wrong-question stats
- `/stats/advisor` advisor
- `/stats/trends` trend
- `/stats/timeline` timeline
- `/stats/progress` progress
- `/settings/general` general settings
- `/settings/api` API settings
- `/settings/font` font settings
- `/settings/backup` app backup/restore

Vuex modules from `frontend/src/store/index.js`:
- `questions`, `quiz`, `ai`, `stats`, `settings`, `banks`, `notes`, `review`, `bookmarks`, `flashcards`, `streak`, `drill`

## 3. Legacy backend module inventory (API-level)
Mounted under `/api` in `backend/src/routes/index.js`:

Question domain:
- `GET /api/questions/tags/all`
- `GET /api/questions`
- `GET /api/questions/:id`
- `POST /api/questions`
- `PUT /api/questions/:id`
- `DELETE /api/questions/:id`
- `POST /api/questions/import`
- `POST /api/questions/import/text`
- `POST /api/questions/import/ai`
- `GET /api/questions/import/status/:importId`
- `POST /api/questions/clean-duplicates`
- `POST /api/questions/backup`
- `POST /api/questions/restore`

Bank domain:
- `GET /api/banks`
- `POST /api/banks`
- `PUT /api/banks/:id`
- `DELETE /api/banks/:id`
- `GET /api/banks/:id/questions`

Quiz domain:
- `POST /api/quiz/start`
- `POST /api/quiz/review`
- `GET /api/quiz/current`
- `POST /api/quiz/submit`
- `GET /api/quiz/next`
- `GET /api/quiz/previous`
- `GET /api/quiz/answers`
- `GET /api/quiz/answers/:questionId`
- `POST /api/quiz/reset`
- `GET /api/quiz/navigator`
- `POST /api/quiz/jump/:index`

Review domain:
- `GET /api/review/due`
- `GET /api/review/due-count`
- `GET /api/review/stats`
- `POST /api/review/start`

Stats domain:
- `GET /api/stats`
- `GET /api/stats/overview`
- `GET /api/stats/categories`
- `GET /api/stats/wrong-questions`
- `GET /api/stats/sessions`
- `GET /api/stats/trends`
- `POST /api/stats/sessions/start`
- `POST /api/stats/sessions/end`
- `POST /api/stats/reset`
- `GET /api/stats/advisor`
- `POST /api/stats/view-history`
- `GET /api/stats/timeline`
- `GET /api/stats/bank-progress`
- `GET /api/stats/tag-progress`
- `GET /api/stats/mastery`

AI domain:
- `POST /api/ai/explanation/:questionId`
- `GET /api/ai/explanation/:questionId`
- `POST /api/ai/error-analysis/:questionId`
- `GET /api/ai/error-analysis/:questionId`
- `POST /api/ai/variant/:questionId`
- `GET /api/ai/variant/:questionId`
- `POST /api/ai/variant/:questionId/add`
- `POST /api/ai/knowledge-tree/:questionId`
- `GET /api/ai/knowledge-tree/:questionId`
- `POST /api/ai/design-process/:questionId`
- `GET /api/ai/design-process/:questionId`
- `POST /api/ai/test-connection`
- `DELETE /api/ai/explanations`
- `DELETE /api/ai/error-analyses`
- `DELETE /api/ai/variants`

Settings domain:
- `GET /api/settings`
- `PUT /api/settings`
- `PUT /api/settings/api/:index`
- `PUT /api/settings/fonts`
- `PUT /api/settings/import`
- `GET /api/settings/backup-files`
- `POST /api/settings/reset`
- `POST /api/settings/backup`
- `POST /api/settings/restore`
- `PUT /api/settings/data-path`

Personal/learning support:
- Notes: `GET /api/notes`, `GET /api/notes/question/:questionId`, `POST /api/notes`, `PUT /api/notes/:id`, `DELETE /api/notes/:id`
- Bookmarks: `GET /api/bookmarks`, `GET /api/bookmarks/ids`, `POST /api/bookmarks/:questionId`, `DELETE /api/bookmarks/:questionId`
- Flashcards: `POST /api/flashcards/start`, `POST /api/flashcards/rate`, `GET /api/flashcards/info`
- Streak: `GET /api/streak`, `PATCH /api/streak/goal`
- Drill: `POST /api/drill/start`, `GET /api/drill/analysis`

## 4. Legacy data model inventory (Mongo)
From `backend/src/models`:
- Questions and organization: `Question`, `QuestionBank`, `VariantQuestion`
- Learning records: `UserAnswer`, `ReviewCard`, `Statistics`, `StudyStreak`
- Personal data: `Note`, `Bookmark`
- AI artifacts: `AIExplanation`, `ErrorAnalysis`, `KnowledgeTree`, `DesignProcess`
- Settings: `Settings`

## 5. Legacy core business flows

### 5.1 Normal quiz flow
1. `POST /api/quiz/start` initializes shuffled question list (in-memory session list).
2. `GET /api/quiz/current` fetches current question by index and latest user answer.
3. `POST /api/quiz/submit` persists `UserAnswer` and triggers side effects:
- update stats totals/category/session
- wrong question add/remove
- SM2 review card update
- streak activity update
4. `GET /api/quiz/next|previous` navigates within in-memory order.
5. `POST /api/quiz/reset` ends session.

### 5.2 Wrong-question review flow
1. `POST /api/quiz/review` builds shuffled list from wrong-question set.
2. Submit path is shared with quiz submit.
3. If answer becomes correct in review mode, question can be removed from wrong set.

### 5.3 Spaced repetition flow
1. Review card initialized on first answer.
2. Every answer runs SM2 calculation (EF/interval/repetitions).
3. Due list and review stats exposed via `/api/review/*`.

### 5.4 Flashcard flow
1. `POST /api/flashcards/start` builds card set from source: all/bookmark/wrong/bank.
2. Cards are shuffled and limited.
3. `POST /api/flashcards/rate` feeds review logic.

### 5.5 Drill flow
1. Aggregate answer history and category weakness.
2. Score each question by low accuracy + weak category + recency.
3. Return top-N as drill set.

### 5.6 Import flow
1. Manual list import: `/api/questions/import`.
2. Local text parsing import: `/api/questions/import/text`.
3. AI async import: `/api/questions/import/ai` -> returns `importId`.
4. Poll `/api/questions/import/status/:importId`.

### 5.7 Backup/restore flow
1. Question-only backup/restore via `/api/questions/backup|restore`.
2. Full data backup/restore via `/api/settings/backup|restore`.
3. Includes questions + AI artifacts + stats + settings.

### 5.8 AI generation flow
1. Generate endpoint receives question id (and sometimes userAnswer).
2. Service dispatches async API request and stores result in artifact collection.
3. Query endpoint either returns stored result or pending status.

## 6. Legacy known risks/defects (important before migration freeze)
- Single-user assumptions across backend services.
- Quiz sessions stored in process memory, not durable and not user-scoped.
- `stats` route declares `/timeline`, but controller exports miss that handler (legacy inconsistency risk).
- Backup logic in legacy has filesystem-path coupling and complex fuzzy filename matching.
- No auth/permission boundaries.

## 7. Rebuild coverage matrix (as of now)
Implemented in `backend-springboot`:
- Health: `/api/health`
- Questions basic CRUD + tags
- Question import (manual/text), duplicate cleanup, backup, restore
- Banks CRUD + bank question list
- Notes CRUD
- Bookmarks CRUD + ids
- Quiz flow endpoints
- Review endpoints
- Stats endpoints
- Streak endpoints
- Flashcard endpoints
- Drill endpoints
- AI endpoints (`/api/ai/*`) with OpenAI-compatible chat calling, artifact persistence, variant-add
- AI import async flow (`/api/questions/import/ai`, `/api/questions/import/status/:importId`) with chunked processing and progress tracking
- Settings endpoints (`/api/settings/*`) including API config, font/import settings, backup/restore, data path
- Flyway V1 schema and common infra

Completed in `backend-springboot`:
- Backup job async execution/retry strategy (`/api/settings/backup-jobs/{jobNo}` status polling, retry, stale-job cleanup, retention cleanup)

Frontend rebuild status:
- `frontend-new` has route/page skeleton aligned to legacy IA.
- Core pages are now wired to new backend APIs (questions/settings/stats/quiz/review/notes/bookmarks/flashcards/drill) with minimal operational UI.
- Build passes; visual polishing and deep interaction parity with legacy frontend are still pending.

## 8. Can we delete old frontend/backend now?
Recommendation: not yet.

Safe delete gate:
1. Backend modules complete and all key endpoints reachable.
2. Wire frontend-new to new backend and finish all key flows:
- question CRUD/import/backup
- quiz/review submit loop
- stats dashboards
- settings backup/restore and API config
- AI generation paths
3. Run regression checklist against legacy behavior.
4. Freeze migration doc and then archive/remove legacy code.

Current conclusion:
- The architecture and schema for full rebuild are in place.
- Core learning loop mostly migrated.
- Backend is feature-complete for single-user V1 scope.
- Frontend has core API wiring, but still needs deeper parity polish and full regression before safe legacy removal.
