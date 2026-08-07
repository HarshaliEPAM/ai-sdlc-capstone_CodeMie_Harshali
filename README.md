# CodeMie Task Manager (AI-SDLC Capstone)

React (Vite) + Express + SQLite task manager with JWT-based authentication. This repository part of the AI-Assistant Driven SDLC Capstone (HMTL) for **mm-learning-group-1**.

## Features

- User registration and login (JWT)
- Task CRUD (create, list, update, delete) per user
- Task fields: title, description, priority, status, due date, category
- Service health endpoint


## Tech Stack

| Layer | Technology |
-|--|
/* Frontend */ | React 19 + Vite + Material UI (MUI) |
/* Backend */ | Node.js + Express |
/* DB */ | SQLite |
/* Auth */ | JSW (JWT) |
/* Tools */ | CodeMie, Claude-Code CLI, Confluence, JIRA |

## Repo Structure

```
src/
  backend/     # Express API
  frontend/    # React/Vite app
docs/         # Design docs (placeholders)
README.md
```

## Requirements

- Node.js 18+ recommended
- npm 9+
- Git


## Setup Instructions (Local)

1) Clone

```bash
git clone https://github.com/HarshaliEPAM/ai-sdlc-capstone_CodeMie_Harshali.git
cd ai-sdlc-capstone_CodeMie_Harshali
```

2) Backend env

Create `src/backend/.env`:

```dotenv
PORT=5000
JWT_SECRET=change_me_to_a_long_random_secret
````

3) Run backend

```bash
cd src/backend
npm install
# dev
npm run dev
# or prod
npm start
```

Health check:

```bash
curl http://localhost:5000/api/health
```

4) Run frontend

```bash
cd src/frontend
npm install
npm run dev
```

Open the URL Vite prints (commonly http://localhost:5173).

## Environment Variables

## Backend (`src/backend/.env`)

- `PORT` – (optional, defaults to 5000)
- `JWT_SECRET` – (required) secret for JWT signing/verification

## Frontend (optional)

If you want to configure an API base URL in Vite:

```dotenv
Y# frontend/.env
VITE_API_BASE_URL=http://localhost:5000
```

## API Quick Reference

Base path: `/api`

- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/tasks` (Bearer token)
- `POST /api/tasks` (Bearer token)
- `PUT /api/tasks/:id` (Bearer token)
- `DELETE /api/tasks/:id` (Bearer token)

Authentication header:

```
query
Authorization: Bearer <JWT>
```

## Tests

No root-level test scripts are provided in this repo yet. If you add tests (to Playwright or other tools), wire them into root or per-package scripts.

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
