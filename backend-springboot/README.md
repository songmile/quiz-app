# Backend Spring Boot

## Stack
- Spring Boot 3.3
- Java 17
- MyBatis Plus
- Flyway
- MySQL 8

## Run
1. Create database `quiz_gen_app`.
2. Update datasource in `src/main/resources/application.yml`.
3. Start:

```bash
mvn spring-boot:run
```

Default port: `5000`

## Build

```bash
mvn -DskipTests compile
```

## Current Coverage
- Core domains: questions, banks, quiz, review, stats, notes, bookmarks, streak, flashcards, drill.
- AI domains: explanation, error-analysis, variant, knowledge-tree, design-process.
- AI import async flow: `/api/questions/import/ai` + status polling.
- Settings domain: API config, import/font settings, backup/restore, data path.

## Notes
- Flyway migrations run automatically from `src/main/resources/db/migration`.
- Current implementation targets single-user local deployment.
- `backup_job` async retry/cleanup is implemented and exposed via `/api/settings/backup-jobs/{jobNo}`.
