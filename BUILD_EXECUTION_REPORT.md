# Build Execution Report

Repository: https://github.com/HarshaliEPAM/ai-sdlc-capstone_CodeMie_Harshali
Branch analyzed: main
Report generated: 2026-08-06 UTC

## 1) Build scripts read (main branch)
- `build.sh` (Linux/Mac)
- `build.ps1` (Windows/PowerShell)
- Root `package.json` (workspaces: `src/frontend`, `src/backend`)

## 2) Build steps that will be executed
The project provides two equivalent build entrypoints.

### A) Cross-platform build scripts (recommended)
**Prerequisites**
- Node.js (LTS recommended) + npm
- Git (used to capture branch/commit metadata into the build report)

**Run the build**
- Linux/Mac: `bash ./build.sh`
- Windows: `pwsh -NoProfile -ExecutionPolicy Bypass -File ./build.ps1`

Both scripts perform:
1. Install frontend deps (`npm ci` if lockfile exists, else `npm install`)
2. Run frontend lint if script exists
3. Build frontend (`npm run build` in `src/frontend`, which runs `vite build`)
4. Install backend deps (`npm ci`/`npm install` in `src/backend`)
5. Run backend lint if script exists
6. Copy artifacts into `/build`:
   - Frontend from `src/frontend/dist` -> `build/frontend`
   - Backend from `src/backend` -> `build/backend` (then remove `build/backend/node_modules`)
7. Write build report JSON to `build/build-report.json`

### B) npm workspaces scripts (alternative)
From repo root:
- `npm run install:all`
- `npm run lint` (frontend)
- `npm run build -workspace src/frontend`

Note: these workspace scripts do not assemble `/build/*` artifacts or `build/build-report.json`—those are produced by `build.sh`/`build.ps1`.

## 3) Expected artifacts to be generated
On successful build, the scripts assemble the following:

| Artifact | Expected path | Notes |
|---|---|---|
| Frontend build output | `/build/frontend` | Copied from `src/frontend/dist` (Vite output) |
| Backend build output | `/build/backend` | Copy of `src/backend` with `node_modules` removed |
| Build report | `/build/build-report.json` | Metadata (branch, commit, timestamp, node/npm versions) |

**Required output locations (per request)**
- Frontend: `/build/frontend`
- Backend: `/build/backend`
- Build report: `/build/build-report.json`

## 4) Build configuration details
### Root configuration
- npm workspaces: `src/frontend`, `src/backend`
- Root scripts of interest:
  - `build:sh`: `bash ./build.sh`
  - `build:ps1`: `pwsh -NoProfile -ExecutionPolicy Bypass -File ./build.ps1`

### Frontend
- Tooling: Vite + React
- Scripts:
  - `lint`: `eslint .`
  - `build`: `vite build`
- Output: `src/frontend/dist`

### Backend
- Runtime: Node.js (Express)
- Scripts:
  - `start`: `node server.js`
  - `dev`: `nodemon server.js`
- No compile/build step defined; backend is packaged as source.

## 5) Build script verification (correctness findings)
The intent is correct (build frontend, package backend, produce `/build` and `build-report.json`), but there are reliability issues:

### build.sh issues (will fail as-is)
- `REPORT_FILE` is assigned using an invalid variable: `"$BMPUI\EDIR/build-report.json"`.
- Uses undefined vars: `TBPS`, `PRONTEND_DIR`, `RUSLD_DIR`.
- `date` formatting has mismatched quote: `date -u +"%Y-%m-%dT%H:%M:%SZ')"`.
- Minor typos in log messages.

**Result:** `build.sh` is currently not runnable in most environments until these typos are fixed.

### build.ps1 issues (may fail)
- `[smdletbinding()]` is misspelled; should be `[CmdletBinding()]`.
- `git rev-parse --abbrev-ref HEAD --action SilentlyContinue` uses an invalid git flag.

**Result:** `build.ps1` is close to working, but should be corrected for robust CI usage.

---

## How to run locally
### Windows
```powershell
pwsh -NoProfile -ExecutionPolicy Bypass -File ./build.ps1
```

### Linux/Mac
```bash
bash ./build.sh
```

If you only want to build the frontend via workspaces:
```bash
npm install
npm run build -workspace src/frontend
```
