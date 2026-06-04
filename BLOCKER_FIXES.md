# Blocker Fixes

## Summary

All code-level blocking issues from the critical verification pass were addressed.

The backend dependency regression was fixed by restoring direct runtime dependencies that the application actually needs. The frontend lint failures were fixed without suppressing ESLint rules, and the production build now passes.

## Priority 1 Fixes

### Backend Dependencies

Updated `backend/requirements.txt`:

- Added `bcrypt==4.1.2`
- Added `greenlet==3.0.3`

Why:

- `backend/utils/security.py` imports `bcrypt` directly for password hashing and verification. Removing `passlib[bcrypt]` was acceptable, but the backend still needed a direct `bcrypt` dependency.
- SQLAlchemy async engine startup requires `greenlet` for the async/sync bridge used by `create_async_engine`.

Result:

- Clean backend dependency install passed.
- Backend imports now succeed from a clean venv.
- Router and Swagger/OpenAPI registration now succeed.

## Priority 2 Fixes

### Frontend Lint

Fixed all ESLint errors without disabling rules.

Changes included:

- Split the auth hook into `frontend/cityreport/src/contexts/useAuth.js`.
- Added `frontend/cityreport/src/contexts/AuthContextCore.js` for the shared React context.
- Kept `AuthContext.jsx` focused on the provider component for Fast Refresh compatibility.
- Updated all `useAuth` imports to use the new hook module.
- Removed the case-insensitive filename collision caused by `authContext.js` vs `AuthContext.jsx`.
- Reworked admin/officer/analytics data-loading effects to avoid React hook lint violations.
- Removed unused bindings and fixed empty catch handling.
- Memoized map locate callbacks in `MapView.jsx`.
- Preserved existing UI behavior and API calls.

## Priority 3 Verification

Commands rerun:

```bash
python3.10 -m venv .venv-blocker-fix
.venv-blocker-fix/bin/python -m pip install -r backend/requirements.txt
.venv-blocker-fix/bin/python -m compileall -q backend ai-ensemble ml
npm install
npm run lint
npm run build
```

Additional backend checks:

- Imported `backend/main.py`.
- Confirmed `main.app` exists.
- Confirmed 39 FastAPI routes are registered.
- Confirmed `/docs` and `/openapi.json` routes are registered.
- Started a temporary FastAPI server with lifespan disabled and confirmed:
  - `GET /docs` returned `HTTP 200`.
  - `GET /openapi.json` returned title `Citizen Road Reporting API`.
  - OpenAPI contained 31 API paths.

## Remaining Environment Limitation

Full database-backed startup was attempted, but Docker/PostGIS could not be started locally because the Docker daemon is not running:

```text
failed to connect to the docker API at unix:///Users/shreyasr/.docker/run/docker.sock
```

After dependency fixes, the full startup attempt reached the database connection path and failed only because the default hostname `db` is a Docker Compose service name unavailable outside Compose:

```text
socket.gaierror: [Errno 8] nodename nor servname provided, or not known
```

This confirms the previous missing `bcrypt` and `greenlet` blockers are resolved, but successful table creation against PostGIS still needs to be verified when Docker or a database is available.

## Files Changed For Blocker Resolution

- `backend/requirements.txt`
- `frontend/cityreport/src/App.jsx`
- `frontend/cityreport/src/contexts/AuthContext.jsx`
- `frontend/cityreport/src/contexts/AuthContextCore.js`
- `frontend/cityreport/src/contexts/useAuth.js`
- `frontend/cityreport/src/components/citizen/ReportCard.jsx`
- `frontend/cityreport/src/components/shared/LocationPicker.jsx`
- `frontend/cityreport/src/components/shared/Navbar.jsx`
- `frontend/cityreport/src/pages/auth/Login.jsx`
- `frontend/cityreport/src/pages/auth/Signup.jsx`
- `frontend/cityreport/src/pages/admin/AdminReports.jsx`
- `frontend/cityreport/src/pages/admin/Analytics.jsx`
- `frontend/cityreport/src/pages/citizen/Dashboard.jsx`
- `frontend/cityreport/src/pages/citizen/MapView.jsx`
- `frontend/cityreport/src/pages/citizen/MyReports.jsx`
- `frontend/cityreport/src/pages/citizen/ReportDetail.jsx`
- `frontend/cityreport/src/pages/officer/Dashboard.jsx`
- `frontend/cityreport/package-lock.json`
