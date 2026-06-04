# Repository Audit

## Audit Scope

Repository audited: `Shreyas-R-Gowda/Citizen_Issue_Prioritization_and_Management_System`

Local path: `/Users/shreyasr/Documents/Citizen-Reporting/civic-final`

This audit covers:

- Backend FastAPI code
- Frontend React/Vite code
- ML and AI ensemble workspaces
- Docker/Render/GitHub Actions configuration
- Documentation and repository hygiene

No application code was modified during this audit.

## Executive Summary

The repository is a working MVP for a citizen road-issue reporting platform with a React frontend, FastAPI backend, PostgreSQL/PostGIS database, AI-assisted severity scoring, and basic Docker/Render deployment files.

The project is usable as a prototype, but it is not production-ready. The largest risks are inconsistent authorization, public officer self-registration, hardcoded development credentials in utility scripts, unsafe JWT handling in the Google OAuth flow, missing upload limits, lack of rate limiting, no database migrations, weak CI coverage, and thin documentation.

The codebase also has several hygiene issues: committed `.DS_Store` files, stale frontend fields, unused imports, duplicate AI scoring logic, unused/aspirational dependencies, stock template docs, no lockfile, and manual database scripts that bypass migration discipline.

## High-Priority Findings

| Area | Severity | Finding |
| --- | --- | --- |
| Security | High | Public signup allows users to choose `officer` role. |
| Security | High | Google OAuth redirects JWT in URL query string. |
| Security | High | JWT secret has unsafe fallback value. |
| Security | High | No rate limiting on login, signup, upload, report creation, votes, or AI-triggering endpoints. |
| Security | High | Upload route has no auth requirement, no file size limit, and only checks MIME prefix. |
| Security | High | Several analytics endpoints expose operational data to any authenticated user. |
| Security | Medium | Images are retrievable by ID without authentication or ownership checks. |
| Code Quality | High | No database migrations; schema is created/changed through `create_all` and manual scripts. |
| Code Quality | Medium | Frontend references removed `pothole_depth_score` fields. |
| Code Quality | Medium | `ai-ensemble` duplicates active backend AI logic but is not wired into runtime. |
| Documentation | Medium | Frontend README is still the default Vite template. |
| Documentation | Medium | Missing contribution, security, license, architecture diagram, screenshots, and production setup details. |

## Code Quality Audit

### Dead Code

Likely dead or stale code:

- `ai-ensemble/`
  - Standalone FastAPI app with its own `/analyze` endpoint.
  - Not included in `docker-compose.yml`.
  - Not called by the main backend.
  - Duplicates AI scoring and OSM logic already present in `backend/ai_analysis.py` and `backend/grok_analysis.py`.
- `backend/add_columns.py`
  - Manual schema patch script for `location_meta` and `sentiment_meta`.
  - Should be replaced by migrations.
- `backend/reset_db.py`
  - Drops a subset of tables manually and is unsafe outside local dev.
- `backend/inject_admin.py`
  - Hardcoded superadmin creation/reset helper with debug logging.
- `backend/verify_users.py`
  - Debug/admin helper that assumes default passwords and resets a hardcoded email.
- `backend/init_db.py`
  - Partly duplicated by app startup logic in `backend/main.py`.
- `ml/training/train_pothole_severity_yolov8m.py`
  - Appears to overlap with the more general `ml/training/train_detector.py` path.

Stale frontend data usage:

- `frontend/cityreport/src/components/AIAnalysisCard.jsx`
  - Reads `report.pothole_depth_score`, but the backend model says this field was removed.
  - Reads `sentimentMeta.visual_meta?.detector`, but current heuristic metadata stores YOLO details under `sentiment_meta.yolo`.
  - Reads `locationMeta.nearby_pois`, but Groq path stores nearby POIs in `sentiment_meta._nearby_pois`; heuristic path does not expose that key.
  - Reads `locationMeta.coordinates_supplied`, which is not written by the current backend.
- `frontend/cityreport/src/pages/admin/AdminReports.jsx`
  - Displays `report.pothole_depth_score`, which is not part of the active schema/response.

### Duplicate Code

Duplicate or overlapping logic:

- AI scoring appears in two places:
  - `backend/ai_analysis.py`
  - `ai-ensemble/main.py`
- OSM/Overpass context appears in two places:
  - `backend/grok_analysis.py`
  - `ai-ensemble/osm_utils.py`
- Status label/variant mapping is duplicated across:
  - `frontend/cityreport/src/pages/citizen/ReportDetail.jsx`
  - `frontend/cityreport/src/pages/citizen/MapView.jsx`
  - `frontend/cityreport/src/pages/officer/Dashboard.jsx`
  - `frontend/cityreport/src/pages/admin/AdminReports.jsx`
- Report fetching/list normalization is repeated in several frontend pages.
- Upvote localStorage state logic appears in:
  - `Dashboard.jsx`
  - `ReportDetail.jsx`
  - `ReportCard.jsx`

Recommended direction:

- Consolidate status/priority labels and variants into shared frontend utilities.
- Keep one AI scoring service path: either integrated backend scoring or a separately deployed AI service, not both.
- Centralize report list fetching with a small API helper.

### Unused Imports

Confirmed likely unused imports/candidates from static source scan:

- `backend/schemas.py`
  - `Field`, `field_validator`, and `Any` appear imported but unused.
- `backend/seed_data.py`
  - `text` and `FieldTeam` appear imported but unused.
- `backend/routers/votes.py`
  - `to_shape` appears imported but unused.
- `frontend/cityreport/src/pages/admin/Analytics.jsx`
  - `LineChart` and `Line` appear imported but unused.
- `frontend/cityreport/src/pages/auth/AuthCallback.jsx`
  - `useAuth`/`login` is imported/read but not used.
- `frontend/cityreport/src/pages/citizen/NewReport.jsx`
  - `useAuth`/`token` is read but not used.

Potential React 17+ JSX runtime cleanup:

- Many files import `React` only for JSX. This is not harmful, but with the modern JSX transform it may be unnecessary if the build is configured accordingly.

### Unused Dependencies

Potentially unused or aspirational backend dependencies:

- `alembic`
  - Installed but no migration directory/config is present.
- `pydantic-settings`
  - Installed but not imported in application code.
- `passlib[bcrypt]`
  - Installed but backend uses `bcrypt` directly.
- `pgvector`
  - Installed and extension is attempted, but vector column is commented out.
- `psycopg2-binary`
  - Installed alongside `asyncpg`; runtime app uses async engine.
- `shapely`
  - May be transitive/used through GeoAlchemy conversions, but not directly imported.
- `ultralytics`
  - Required only if local ML detector is enabled; heavy for base API runtime.

Frontend dependency notes:

- `react-is` appears in `package.json` but source does not import it directly. It may be a transitive compatibility dependency, but it likely does not need to be direct.
- No `package-lock.json` is committed. `.gitignore` explicitly ignores it, which makes frontend builds less reproducible.

AI ensemble dependency notes:

- `ai-ensemble/requirements.txt` includes `transformers`, `torch`, `scipy`, and `numpy`.
- `ai-ensemble/main.py` currently uses FastAPI, Uvicorn, Pillow, Ultralytics through `model_loader`, and Requests through `osm_utils`.
- `transformers`, `torch`, `scipy`, and `numpy` appear unused directly in `ai-ensemble` code unless needed indirectly by model packages.

### Large Files

Largest tracked files from local scan:

| File | Size | Notes |
| --- | ---: | --- |
| `ml/tools/prepare_pothole_severity_dataset.py` | 36K | Large single script with embedded HTML/JS UI. |
| `PROJECT_OVERVIEW.md` | 28K | Generated architecture report. |
| `frontend/cityreport/src/pages/citizen/ReportDetail.jsx` | 16K | Large page component with many responsibilities. |
| `frontend/cityreport/src/pages/citizen/MapView.jsx` | 16K | Large map component with marker, heatmap, sidebar, geolocation logic. |
| `frontend/cityreport/src/pages/admin/Analytics.jsx` | 16K | Large chart/dashboard component. |
| `frontend/cityreport/src/components/AIAnalysisCard.jsx` | 16K | Large presentational component with parsing and scoring display logic. |
| `backend/routers/reports.py` | 16K | Large router with serialization, AI orchestration, CRUD, workflow actions. |
| `backend/grok_analysis.py` | 16K | Large module containing scoring constants, OSM querying, prompt construction, API call handling. |

Repository hygiene:

- `.DS_Store` files are committed at:
  - `./.DS_Store`
  - `backend/.DS_Store`
  - `frontend/.DS_Store`
  - `ml/.DS_Store`

### Hardcoded Values

Hardcoded credentials/defaults:

- `backend/database.py`
  - Fallback database URL: `postgresql+asyncpg://admin:admin123@db:5432/citizen_ai`
- `backend/init_db.py`
  - Fallback database URL: `postgresql+asyncpg://admin:admin123@localhost:5432/citizen_ai`
- `backend/utils/security.py`
  - Fallback JWT secret: `your_super_secret_key_change_this`
- `backend/seed_data.py`
  - Default users:
    - `admin@example.com / admin123`
    - `citizen@example.com / citizen123`
- `backend/inject_admin.py`
  - `superadmin@example.com / admin123`
  - Prints generated hash debug info.
- `backend/verify_users.py`
  - Assumes `admin123`/`citizen123`.
  - Resets a hardcoded email to `password123`.

Other hardcoded operational values:

- Localhost CORS defaults in `backend/main.py`.
- Google OAuth fallback callback: `http://localhost:8005/auth/google/callback`.
- Frontend fallback API base URL: `http://localhost:8005`.
- Overpass and Nominatim URLs hardcoded.
- Docker Compose development DB password: `postgres`.
- `uvicorn --reload` in backend Dockerfile and Compose command.

### Poor Naming Conventions

Naming inconsistencies:

- Groq/Grok naming is mixed:
  - `GROK_API_KEY`
  - `grok_analysis.py`
  - comments mention Groq/xAI/Grok
- `CityReport`, `Citizen Road Reporting System`, and `Citizen Issue Prioritization and Management System` are all used as product/project names.
- `ROAD_CATEGORY = "road_issues"` hardcodes a category despite schema allowing arbitrary categories.
- `emotion_score` appears to mean text urgency/sentiment, not emotion.
- `pothole_spread_score` sometimes represents image score in Groq path, not strictly spread.
- `is_read` is stored as an integer instead of a boolean.
- `full_name` frontend/profile schema maps to `User.name`, while auth schema uses `name`.

### Missing Comments

The code has comments in the AI scoring modules and some UI logic, but lacks explanatory comments where they would help most:

- `backend/routers/reports.py`
  - Complex report lifecycle transitions would benefit from a state machine comment/table.
- `backend/routers/votes.py`
  - Vote toggle behavior and score recalculation assumptions should be documented.
- `backend/routers/analytics.py`
  - Raw SQL dashboard/heatmap queries need context and index assumptions.
- `frontend/cityreport/src/components/AIAnalysisCard.jsx`
  - Metadata parsing assumes several backend JSON shapes; those contracts should be documented or typed.
- `frontend/cityreport/src/pages/citizen/MapView.jsx`
  - Heatmap and status marker behavior could be separated and documented.

Missing comments are not the main issue; the larger issue is missing typed contracts/tests around these behaviors.

## Security Audit

### Exposed Secrets, API Keys, and Credentials

No real API keys or private keys were found in the scanned repository files.

However, development credentials and unsafe defaults are present:

- `backend/seed_data.py` creates/prints `admin@example.com / admin123` and `citizen@example.com / citizen123`.
- `backend/inject_admin.py` hardcodes `superadmin@example.com / admin123`.
- `backend/verify_users.py` assumes default passwords and resets one hardcoded user to `password123`.
- `backend/utils/security.py` has a weak fallback `SECRET_KEY`.
- Database fallback URLs include passwords.

Recommendations:

- Move all admin provisioning to environment-driven, one-time setup.
- Remove debug scripts from production images.
- Fail fast if `SECRET_KEY` is unset in non-development environments.
- Never print password hashes or default credentials in logs.

### Unsafe Queries

Most dynamic SQLAlchemy ORM queries are safe.

Areas to watch:

- `backend/routers/analytics.py`
  - Builds a raw SQL string with `where_clause`.
  - Current `status` and `priority` values are enum-validated and parameters are bound, so immediate injection risk is low.
  - Still, raw SQL construction should be kept tightly controlled or replaced with SQLAlchemy query builders.
- `backend/reset_db.py`
  - Uses `text(f"DROP TABLE IF EXISTS {table} CASCADE")`.
  - Current table list is static, but this is destructive and should not be available in production images.

### Missing Validation

Backend validation gaps:

- Registration accepts role from request body. Any user can request `officer`; backend schema also allows `admin` if sent directly.
- Password rules are inconsistent:
  - Signup frontend requires 6 characters.
  - Password change backend requires 8 characters.
  - Registration backend does not enforce length/complexity.
- Report creation accepts latitude/longitude as floats but does not validate coordinate bounds.
- Report title/description have no length limits.
- Upload accepts any `image/*` content type without content sniffing, size limit, extension allowlist, EXIF stripping, or malware scanning.
- `feedback` query parameters for verify/reopen have no length limits.
- `sort_order` accepts arbitrary strings and falls back only by comparison.
- `start_date`/`end_date` are strings compared to timestamps instead of parsed/validated datetimes.

Frontend validation gaps:

- Image selection allows up to 5 images but backend only uploads the first image.
- Client route guards are useful UX but not security boundaries.
- Local upvote state is stored in localStorage and can disagree with server state.

### Missing Authorization Checks

Important findings:

- `POST /upload/image` has no authentication requirement.
- `GET /upload/image/{image_id}` has no authentication or ownership check.
- `GET /reports/` and `GET /reports/{report_id}` are public; this may be intentional for public civic data, but it should be explicit.
- Analytics endpoints require authentication but mostly not admin/officer role:
  - `/analytics/status-distribution`
  - `/analytics/priority-distribution`
  - `/analytics/time-bound-stats`
  - `/analytics/heatmap-data`
  - `/analytics/trend-analysis`
  - `/analytics/summary`
  - `/analytics/dashboard`
- `POST /auth/register` allows role selection from user input.
- Officer dashboard fetches all reports through generic `/reports/`; no field-team assignment enforcement exists.
- `PATCH /reports/{report_id}/status` allows any officer to update any report.
- `DELETE /reports/{report_id}` allows owner/admin, but no audit log.

### Missing Rate Limiting

No rate limiting was found.

Endpoints needing rate limits:

- `/auth/login`
- `/auth/register`
- `/auth/google/login`
- `/auth/google/callback`
- `/upload/image`
- `/reports/`
- `/reports/{id}/upvote`
- `/reports/{id}/downvote`
- `/reports/{id}/reanalyze`
- Analytics endpoints if exposed publicly or to many users

Potential impact:

- Brute-force login attempts
- Account creation spam
- Storage exhaustion through upload
- AI/Groq cost exhaustion
- Overpass API abuse or throttling
- Vote manipulation pressure

### Token and Session Security

Current behavior:

- JWTs are stored in `localStorage`.
- Google OAuth callback redirects token in URL query string.
- No refresh token, revocation list, logout invalidation, or token rotation.
- JWT `sub` contains email, so changing email may affect token identity.

Risks:

- XSS can steal tokens from localStorage.
- Query tokens can leak through logs, browser history, screenshots, and referrer headers.
- Tokens remain valid until expiration even after logout.

Recommendations:

- Use secure, HttpOnly, SameSite cookies for sessions.
- Avoid putting bearer tokens in URLs.
- Add CSRF protection if cookie sessions are used.
- Add short-lived access tokens plus refresh/session revocation.

## Documentation Audit

### README Coverage

Current top-level README includes:

- Basic project summary
- Feature bullets
- Prerequisites
- Docker quick start
- Local backend/frontend development commands
- Model training pointer
- Render deployment outline
- Swagger/ReDoc links

Missing or incomplete README sections:

- Accurate repository name and clone path.
- Full environment variable reference.
- Google OAuth setup.
- Groq/GROK API setup.
- Database initialization/migration guidance.
- Seed user guidance with security warning.
- Role descriptions and user flows.
- API examples.
- Troubleshooting.
- Testing instructions.
- CI/CD explanation.
- Production deployment checklist.
- Security considerations.
- Screenshots or demo GIFs.
- Architecture diagram.
- Data model diagram.
- License information.
- Contribution guidelines link.

Problems in current README:

- Contains stale absolute path to another machine:
  - `/Users/shreyas/Documents/New project/hotspot-prioritizer/ml/README.md`
- Render instructions mention `OPENAI_API_KEY`, but code uses `GROK_API_KEY`.
- Repeated leftover headings:
  - `# EL-sem-6th` repeated multiple times.
- Claims TailwindCSS in stack, but frontend appears to use plain CSS files plus utility-like class names, not a Tailwind config.
- Mentions pgvector embeddings, but embedding field is commented out.

### Frontend README

`frontend/cityreport/README.md` is still the default React + Vite template.

It does not explain:

- App routes
- Required env var `VITE_API_URL`
- Auth behavior
- Map/Leaflet setup
- Build/deploy behavior
- Component/page structure

### API Documentation

Present:

- FastAPI automatically exposes Swagger UI and ReDoc.

Missing:

- No checked-in OpenAPI export.
- No API usage examples.
- No auth header instructions.
- No role matrix.
- No endpoint ownership/status transition documentation.
- No request/response examples for report creation, image upload, and AI analysis.

### Architecture Diagrams

Missing:

- No system architecture diagram.
- No sequence diagram for report creation and AI analysis.
- No auth/OAuth flow diagram.
- No database ERD.
- No deployment topology diagram.

`PROJECT_OVERVIEW.md` now contains a text architecture diagram, but the README still lacks user-facing diagrams.

### Screenshots

Missing:

- No screenshots of:
  - Citizen dashboard
  - New report form
  - Map view
  - Report detail/AI analysis card
  - Officer dashboard
  - Admin analytics

### Contribution and Governance

Missing:

- `CONTRIBUTING.md`
- `LICENSE`
- `SECURITY.md`
- `CODE_OF_CONDUCT.md`
- Issue templates
- Pull request template
- Changelog/release notes

## DevOps and Repository Hygiene

### Git Ignore and Generated Files

Issues:

- `.DS_Store` files are committed even though `frontend/.dockerignore` ignores them for Docker.
- Top-level `.gitignore` does not include `.DS_Store`.
- `package-lock.json` is ignored. This hurts reproducible frontend builds.
- No committed frontend lockfile exists.

Recommendations:

- Add `.DS_Store` to `.gitignore` and remove committed `.DS_Store` files.
- Stop ignoring `package-lock.json`; commit a lockfile.
- Consider `.dockerignore` for backend as well.

### CI/CD

Current GitHub Actions workflow:

- Installs backend dependencies.
- Runs `py_compile` on selected backend files.
- Installs frontend dependencies.
- Builds frontend.
- Builds and pushes backend Docker image on `main`.

Missing:

- Backend unit/API tests.
- Database integration tests.
- Frontend lint/test.
- Security/dependency scanning.
- Docker build for frontend.
- Render deployment validation.
- Type checking or stronger static analysis.
- Python linting/formatting.

### Docker and Deployment

Issues:

- Backend Dockerfile runs Uvicorn with `--reload`, unsuitable for production.
- Compose also runs backend with `--reload`.
- Backend image includes heavy ML dependencies in main API runtime.
- Render blueprint does not include `SECRET_KEY`, `GROK_API_KEY`, `ALLOWED_ORIGINS`, OAuth vars, or model vars.
- Render database `ipAllowList: []` is commented as "Allow all for now".
- No health/readiness endpoint beyond `/`.

## Recommended Remediation Plan

### Phase 1: Security and Production Blockers

1. Restrict public registration to `citizen`; create officer/admin only through admin-only flows.
2. Require `SECRET_KEY` and fail startup if it is unset outside local development.
3. Stop sending JWTs in OAuth query strings.
4. Add authentication and size limits to image uploads.
5. Add admin/officer role checks to analytics and operational endpoints.
6. Add rate limiting for auth, uploads, votes, reports, and AI reanalysis.
7. Remove or quarantine `inject_admin.py`, `verify_users.py`, and destructive DB scripts from production images.
8. Add upload content sniffing and maximum request body limits.

### Phase 2: Code Quality and Maintainability

1. Add Alembic migrations and remove schema mutation from startup/manual scripts.
2. Remove committed `.DS_Store` files and commit a package lockfile.
3. Clean unused imports and stale frontend fields.
4. Decide whether `ai-ensemble` is part of the architecture; wire it in or remove it.
5. Split optional ML dependencies from base backend runtime.
6. Convert `location_meta` and `sentiment_meta` to JSONB.
7. Extract shared frontend status/priority utilities.
8. Add typed frontend/backend contracts for AI metadata.

### Phase 3: Testing and CI

1. Add backend tests for auth, role authorization, reports, upload, votes, notifications, and analytics.
2. Add database integration tests with PostGIS-enabled Postgres.
3. Run frontend ESLint in CI.
4. Add basic frontend component/page tests.
5. Add Docker build checks for backend and frontend.
6. Add dependency vulnerability scanning.

### Phase 4: Documentation

1. Replace the top-level README with project-specific setup, architecture, env, API, and deployment docs.
2. Replace the frontend Vite template README.
3. Add diagrams:
   - System architecture
   - Report submission sequence
   - Auth flow
   - Database ERD
4. Add screenshots.
5. Add `CONTRIBUTING.md`, `SECURITY.md`, `LICENSE`, and PR/issue templates.

## Audit Limitations

- Dependencies are not installed in this checkout, so `npm run lint` and deeper automated lint checks were not run.
- No lockfile is present, so exact frontend dependency versions cannot be audited reproducibly.
- No live database or running backend was used for dynamic endpoint testing.
- Findings are based on static repository inspection and source-level analysis.
