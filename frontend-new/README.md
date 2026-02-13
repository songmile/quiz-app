# Frontend New

## Stack
- Vue 3
- TypeScript
- Vite
- Pinia
- Vue Router

## Run

```bash
npm install
npm run dev
```

Default URL: `http://localhost:5173`

## Build

```bash
npm run build
```

## API
- Frontend uses `/api` as base path.
- Backend expected at `http://localhost:5000/api`.

## Current Status
- Core pages are wired to new backend APIs:
  - questions/banks/import/backup
  - quiz/review (including option selection, auto-next, question-card jump)
  - settings, stats, notes, bookmarks, flashcards, drill
- Build passes.
- Remaining work is interaction polish and regression alignment with legacy frontend.
