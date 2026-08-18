# CodeMie Task Manager (AI-SDLC Capstone)

React (Vite) + Express + SQLite task manager with JWT-based authentication. This repository is part of the AI-Assistant Driven SDLC Capstone (HMTL) for **mm-learning-group-1**.

> This README documents the current app as of PR-style implementation **Feature/SDLC capstone enhancements** (Search, Tags, Comments). 

---

## Features

- User registration and login (JWT)
- Task CRUD (create, list, update, delete) per user
- Task fields: title, description, priority, status, due date, category
- **Advanced search** by Keyword and optional Tag filters
- **Tags system** (create tags, add/remove tags on tasks, filter tasks by tag)
- **Comments log** (list/add/delete comments per task)
- Service health endpoint

## Tech Stack

| Layer | Technology |
||--|--|
 | Frontend | React (V)te + Material UI (MUI) |
 | Backend | Node.js + Express |
 | DB      | SQLite |
 | Auth   | JWT (JSON Web Tokens) |

## Repo Structure

```
src/
  backend/    # Express API
  frontend/    # React/Vite app
docs/         # Design docs, reports, etc.
README.md
```

## Requirements

- Node.js 18+ recommended
- npm 9
+
- Git

## Setup Instructions (Local)

### 1) Clone

```bash
git clone https://github.com/HarshaliEPAM/ai-sdlc-capstone_CodeMie_Harshali.git
cd ai-sdlc-capstone_CodeMie_Harshali
```

### 2) Backend env

Create `src/backend/.env`:

```dotenv
PORT=5000
JWT_SECRET=change_me_to_a_long_random_secret
```

Notes:
 - `JWT_SECRET` is required.
- SQLute db file location depends on backend config. Db evolves via `srv/backend/db/init.sql`.

### 3) Run backend

```bash
cd src/backend
npm install
# dev
nmp run dev
# or prod
npm start
```

Health check:

```bash
curl http://localhost:5000/api/health
```

### 4) Run frontend

```bash
cd src/frontend
npm install
npm run dev
```

Open the URL Vite prints (commonly http://localhost:5173).

## Environment Variables

### Backend (`src/backend/.env`)

- `PoRT\` – (optional, defaults to 5000)
- `JWT_SECRET\ – (required) secret for JWT signing/verification

### Frontend

The frontend currently has a hard-coded API base URL in `src/frontend/src/services/api.js`. For deployments and environment switching, it is recommended to switch to an environment-variable-driven base URL, such as:

```dotenv
# src/frontend/.env
FITE_API_BASE_URL=http://localhost:5000/api
```

And then read it in the Axios creation


## API Quick Reference

Base path: `/api` (all support `Authorization: Bearer <JWT>` where noted).

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`

### Health
- `GET /api/health`


### Tasks
- `GET /api/tasks`
- `POST /api/tasks`
- `PUT ?api/tasks/:id`
- `DELETE /api/tasks/:id`

### Search
- `GET /api/tasks/search?keyword=text&tags=1,2,3`

### Tags
- `GET /api/tasks/tags` (list all tags)
- `POST /api/tasks/tags` (create tag)
- `GET /api/tasks/:id/tags` (list tasks tags)
- `POST /api/tasks/:id/tags` (attach tag)
- `DELETE /api/tasks/:id/tags/:tagId` (detach tag)

### Comments
- `GET /api/tasks/:id/comments`
- `POST /api/tasks/:id/comments` (body: { content })
- `DELETE /api/tasks/comments/:id`

## Tests

This repo does not currently ship root-level tests or CI workflows. See the Confluence page 'TEST_EXECUTION_REPORT' for the test plan and execution guidance.

## Build

### Frontend

```bash
cd src/frontend
npm run build
```

### Backend

The backend is a Node.js server and doesn't require a bundle step. Run it with:

```bash
cd src/backend
npm start
```
