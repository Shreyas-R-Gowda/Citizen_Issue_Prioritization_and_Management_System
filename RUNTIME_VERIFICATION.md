# Runtime Verification

## Summary

Runtime verification found backend startup blockers and a successful frontend production build.

The backend does not start from a clean `backend/requirements.txt` install because `bcrypt` and `greenlet` are missing. After temporarily installing those packages in the verification environment, backend imports and route registration passed. Full database initialization could not be completed locally because Docker was not running and no local PostgreSQL/PostGIS service was available.

The frontend installed and built successfully with the refactored `package.json`.

## Backend Verification

### Environment Used

- Default local Python: `Python 3.14.4`
- Verification Python: `Python 3.10`
- Backend dependency install command:

```bash
.venv-verify310/bin/python -m pip install -r backend/requirements.txt
```

### Passed Checks

| Check | Result | Evidence |
|---|---|---|
| Dependencies install under Python 3.10 | Passed | `backend/requirements.txt` installed successfully under Python 3.10. |
| Python syntax compile | Passed | `.venv-verify310/bin/python -m compileall -q backend ai-ensemble ml` exited successfully. |
| Backend imports after temporary dependency fixes | Passed | `backend.main`, `backend.database`, `backend.utils.security`, and `backend.ml_models` imported successfully after temporarily installing `bcrypt` and `greenlet`. |
| Router registration | Passed | `main.app.routes` contained 39 routes, including auth, reports, votes, analytics, upload, modeling, notifications, users, root, docs, and OpenAPI routes. |
| Swagger route registration | Passed | `app.docs_url` is `/docs`; route list includes `GET /docs`. |
| OpenAPI route registration | Passed | `app.openapi_url` is `/openapi.json`; local OpenAPI probe with lifespan disabled returned title `Citizen Road Reporting API` and 31 API paths. |

### Failed Checks

| Check | Result | Evidence | Impact |
|---|---|---|---|
| Clean backend import after installing only `backend/requirements.txt` | Failed | `ModuleNotFoundError: No module named 'bcrypt'` from `backend/utils/security.py`. | Backend cannot start on a clean install. |
| Clean backend startup after installing only `backend/requirements.txt` | Failed | SQLAlchemy async startup failed with missing `greenlet`. | Backend startup fails before database initialization. |
| Database initialization path with real PostGIS database | Not completed | `docker compose up -d db` failed because Docker daemon was not running. | Could not verify `CREATE EXTENSION` and `Base.metadata.create_all` against a real database in this environment. |

### Backend Startup Details

Initial Uvicorn startup failed after dependency install:

```text
ModuleNotFoundError: No module named 'bcrypt'
```

After installing `bcrypt` temporarily, startup failed again:

```text
ValueError: the greenlet library is required to use this function. No module named 'greenlet'
```

After installing `greenlet` temporarily, startup reached the database connection and failed because the default hostname is Docker-only:

```text
socket.gaierror: [Errno 8] nodename nor servname provided, or not known
```

This confirms the database initialization path is reached, but it does not confirm successful table creation.

## Frontend Verification

### Commands Run

```bash
npm install
npm run build
npm run lint
npm audit --audit-level=moderate
```

### Passed Checks

| Check | Result | Evidence |
|---|---|---|
| Dependency install | Passed | `npm install` added 231 packages and completed. |
| Production build | Passed | `vite build` completed successfully. |
| Missing imports from `reportMeta.js` refactor | Passed | Production build transformed 2538 modules and emitted `dist` successfully. |
| Removed frontend packages | Passed | Build succeeded without `react-is` and `babel-plugin-react-compiler` as direct dependencies. |

### Failed Checks

| Check | Result | Evidence |
|---|---|---|
| Lint | Failed | `npm run lint` reported 14 errors and 4 warnings. |

### Frontend Warnings

| Warning | Details |
|---|---|
| Bundle size | Vite warned that `dist/assets/index-*.js` is larger than 500 kB after minification. |
| Vulnerabilities | `npm audit` reported 2 moderate vulnerabilities through `vite <=6.4.1` and `esbuild <=0.24.2`; fix requires a breaking Vite upgrade. |

### Lint Failures Observed

Important lint findings:

- `frontend/cityreport/src/pages/admin/AdminReports.jsx`
  - `fetchReports` accessed before declaration under React compiler lint rule.
  - Missing hook dependency warning.
  - Unused `err` variables.
- `frontend/cityreport/src/pages/admin/Analytics.jsx`
  - `fetchAnalytics` accessed before declaration under React compiler lint rule.
- `frontend/cityreport/src/pages/citizen/Dashboard.jsx`
  - Unused `Icon` binding.
- `frontend/cityreport/src/pages/citizen/MyReports.jsx`
  - Empty catch block.
- `frontend/cityreport/src/pages/officer/Dashboard.jsx`
  - Unused `navigate`.
  - `fetchReports` accessed before declaration under React compiler lint rule.
- Additional pre-existing hook/lint issues in `LocationPicker.jsx`, `AuthContext.jsx`, `MapView.jsx`, and `ReportDetail.jsx`.

## Overall Runtime Result

| Area | Result |
|---|---|
| Backend clean startup | Failed |
| Backend imports after temporary fixes | Passed |
| Backend router/docs registration | Passed |
| Database initialization success | Not verified |
| Frontend install | Passed |
| Frontend production build | Passed |
| Frontend lint | Failed |
