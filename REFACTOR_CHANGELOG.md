# Refactor Changelog

## Summary

This refactor cleaned backend, frontend, package, and repository hygiene issues without changing the intended application workflows.

Primary goals completed:

- Removed dead/stale frontend assets and macOS repository artifacts.
- Removed unused imports and stale frontend references to removed backend fields.
- Centralized duplicated frontend report status/priority metadata.
- Improved backend request validation.
- Standardized upload error handling so expected HTTP errors are not converted into 500s.
- Removed clearly unused direct dependencies from package files.
- Improved `.gitignore` for generated/local files.

## Backend Changes

### Validation

Updated `backend/schemas.py`:

- Added length validation for user names and passwords.
- Added length validation for report titles and descriptions.
- Added coordinate bounds for latitude and longitude.
- Added max length validation for image URLs and update payload text fields.
- Normalized report category input by trimming/lowercasing it.

Updated `backend/routers/reports.py`:

- Added validation for `sort_order`.
- Added max length validation for verification/reopen feedback query parameters.
- Kept existing response shapes and endpoint behavior.

### Error Handling

Updated `backend/routers/upload.py`:

- Preserves deliberate `HTTPException` responses instead of wrapping them as 500 errors.
- Replaced `print` debugging with structured logger usage.
- Returns a generic server error message for unexpected upload failures.
- Added a size guard for uploaded images.
- Kept the existing upload response format: `image_url`, `filename`, and `id`.

### Imports and Comments

Removed unused imports from:

- `backend/schemas.py`
- `backend/routers/analytics.py`
- `backend/routers/votes.py`
- `backend/seed_data.py`

Updated `backend/utils/security.py`:

- Removed stale passlib-related comment.

## Frontend Changes

### Shared Report Metadata

Added:

- `frontend/cityreport/src/utils/reportMeta.js`

This centralizes:

- Report status labels
- Report status colors
- Status badge variants
- Priority badge variants
- Severity ordering
- Category formatting

Refactored consumers:

- `ReportCard.jsx`
- Citizen dashboard
- My Reports
- Report detail
- Map view
- Officer dashboard

### Duplicate Code Reduction

Removed duplicated local status/priority helpers from:

- `frontend/cityreport/src/components/citizen/ReportCard.jsx`
- `frontend/cityreport/src/pages/citizen/ReportDetail.jsx`
- `frontend/cityreport/src/pages/citizen/MapView.jsx`
- `frontend/cityreport/src/pages/officer/Dashboard.jsx`

### Stale Field Cleanup

Updated `frontend/cityreport/src/components/AIAnalysisCard.jsx`:

- Removed display logic for removed backend field `pothole_depth_score`.
- Updated detector metadata lookup to match the current backend shape.
- Reworded heuristic image-analysis description to match current behavior.
- Removed display block for metadata that the backend does not currently emit.

Updated `frontend/cityreport/src/pages/admin/AdminReports.jsx`:

- Removed the stale `pothole_depth_score` display.

### Unused Imports and Bindings

Removed unused imports/bindings from:

- `frontend/cityreport/src/pages/admin/Analytics.jsx`
- `frontend/cityreport/src/pages/auth/AuthCallback.jsx`
- `frontend/cityreport/src/pages/citizen/NewReport.jsx`
- `frontend/cityreport/src/pages/citizen/MyReports.jsx`
- `frontend/cityreport/src/pages/admin/AdminReports.jsx`

### Dead Frontend Files

Removed unused Vite/template artifacts:

- `frontend/cityreport/src/App.css`
- `frontend/cityreport/src/assets/react.svg`
- `frontend/index.html`

## Package and Configuration Changes

### Backend Dependencies

Removed unused direct dependencies from `backend/requirements.txt`:

- `psycopg2-binary`
- `pydantic-settings`
- `alembic`
- `passlib[bcrypt]`
- `pgvector`

Rationale:

- The backend uses async SQLAlchemy with `asyncpg`.
- Password hashing uses `bcrypt` directly.
- No Alembic migration config/history is present.
- pgvector Python integration is not used by the active model/schema.
- Settings are read directly with `os.getenv`/`dotenv`.

### AI Ensemble Dependencies

Removed unused direct dependencies from `ai-ensemble/requirements.txt`:

- `transformers`
- `scipy`

### Frontend Dependencies

Removed unused direct dependencies from `frontend/cityreport/package.json`:

- `react-is`
- `babel-plugin-react-compiler`

### `.gitignore`

Updated `.gitignore`:

- Added `.DS_Store`.
- Added `backend/uploads/`.
- Stopped ignoring `package-lock.json` so future frontend installs can be reproducible.

### Repository Artifacts

Removed committed macOS artifacts:

- `.DS_Store`
- `backend/.DS_Store`
- `frontend/.DS_Store`
- `ml/.DS_Store`

## Files Changed

Backend:

- `backend/schemas.py`
- `backend/routers/upload.py`
- `backend/routers/reports.py`
- `backend/routers/analytics.py`
- `backend/routers/votes.py`
- `backend/seed_data.py`
- `backend/utils/security.py`
- `backend/requirements.txt`

Frontend:

- `frontend/cityreport/src/utils/reportMeta.js`
- `frontend/cityreport/src/components/AIAnalysisCard.jsx`
- `frontend/cityreport/src/components/citizen/ReportCard.jsx`
- `frontend/cityreport/src/pages/admin/AdminReports.jsx`
- `frontend/cityreport/src/pages/admin/Analytics.jsx`
- `frontend/cityreport/src/pages/auth/AuthCallback.jsx`
- `frontend/cityreport/src/pages/citizen/Dashboard.jsx`
- `frontend/cityreport/src/pages/citizen/MapView.jsx`
- `frontend/cityreport/src/pages/citizen/MyReports.jsx`
- `frontend/cityreport/src/pages/citizen/NewReport.jsx`
- `frontend/cityreport/src/pages/citizen/ReportDetail.jsx`
- `frontend/cityreport/src/pages/officer/Dashboard.jsx`
- `frontend/cityreport/package.json`

Removed:

- `frontend/cityreport/src/App.css`
- `frontend/cityreport/src/assets/react.svg`
- `frontend/index.html`
- `.DS_Store` files

General:

- `.gitignore`
- `ai-ensemble/requirements.txt`

## Verification

Completed:

- Python syntax compilation:
  - `python3 -m compileall -q backend ai-ensemble ml`
- Frontend package JSON parsing:
  - `node -e "JSON.parse(...); console.log('package.json ok')"`
- Static cleanup scan for removed stale fields/dependencies.
- Confirmed no `.DS_Store` files remain in the working tree.

Not run:

- `npm run lint`
- `npm run build`
- backend integration/API tests

Reason:

- The checkout does not currently include `node_modules` or a lockfile, and installing dependencies would require a network/dependency install step.

## Notes

- This refactor intentionally did not change authentication flows, role behavior, API response shapes, database schema structure, or deployment topology.
- Some larger architecture recommendations from the audit remain intentionally untouched, including Alembic migration setup, auth hardening, upload authorization, rate limiting, object storage, and background AI jobs.
