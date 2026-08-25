# CodeMie Capstone - Task List Enhancements (EPMLCDMETST)

Full-stack enhancements to the CodeMie task list experience, adding fast and consistent browsing capabilities across UI and REST APIs.

Delivered features (traceable to Jira):
- **EPMCDMETST-61074** – Search tasks by title or description
- **EPMLCDMETST-61075** – Multi-criteria sorting
- **EPMLCDMETST-61076** – Filtering by status, priority, category
- **EPMCDMETST-61077** – Pagination for performance

## Repository

- Repo: https://github.com/HarshaliEPAM/ai-sdlc-capstone_CodeMie_Harshali
- Default branch: `main`

> This repo is a monorepo using npm workspaces. The frontend and backend live under `src/`.

## Architecture & Component Summary

- **Frontend**: `src/frontend` (Vite + React)
  - Task list UI with search, sort, filter, and pagination controls
- **Backend**: `src/backend` (Node.js / Express)
  - REST endpoints for tasks supporting query params (search, sort, filters, page)
- **Database**: SQLite
  - Queries updated to support search, filter, sort, and paginate efficiently

## Prerequisites

- Node.js 18 (LTS)
- npm 9+

## Setup & Installation

- Clone the repo and install dependencies:

```bash
git clone https://github.com/HarshaliEPAM/ai-sdlc-capstone_CodeMie_Harshali.git
cd ai-sdlc-capstone_CodeMie_Harshali
npm install
npm run install:all
```

## Run Locally

In separate terminals:

```bash
# Backend
npm run dev:backend

# Frontend
npm run dev:frontend
```

By default, Vite will print the frontend URL (e.g. http://localhost:5173). The backend runs on its configured port (see `src/backend` docs).

## Build

- Frontend build:

```bash
npm run build
```

## Tests & Quality

- Frontend lint:

```bash
npm run lint
```

> If test scripts are added in a later cycle, this section should be extended.

## Confluence

- Space: `CodeMieCap`
- Root Technical Designs page:
  - https://epam-team-b69s97t6.atlassian.net/wiki/spaces/CodeMieCap/pages/20348929/Technical+Designs+Capston+Codemie+project+EPMLCDMETST
