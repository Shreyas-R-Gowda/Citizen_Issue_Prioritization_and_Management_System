# Project Overview

## Executive Summary

Citizen Issue Prioritization and Management System is a full-stack civic reporting platform focused on road issues such as potholes, cracks, surface failures, and other road hazards. Citizens can submit reports with location and photo evidence, the backend enriches each report with AI-assisted severity scoring, and officers/admins can triage, resolve, analyze, and manage those reports.

The system currently uses a React/Vite single-page frontend, a FastAPI backend, PostgreSQL with PostGIS, JWT authentication, optional Google OAuth, image storage in the database, and an AI severity pipeline based on Groq vision analysis, OpenStreetMap context, heuristic AHP scoring, and optional local YOLO detection.

The repository is functional as a prototype/MVP, but it needs hardening before production: migrations, stricter role-based access control, safer OAuth/token handling, upload limits, tests, background processing for AI/external calls, deployment env cleanup, and a clearer model lifecycle.

## Project Objective

The project aims to help municipalities and civic teams collect, prioritize, and manage citizen-reported road infrastructure issues. Its core value is not just receiving complaints, but ranking them by urgency using multiple signals:

- Uploaded image evidence
- Citizen description
- Geospatial risk near schools, hospitals, transit, and other sensitive places
- Road/traffic context from OpenStreetMap
- Community upvotes
- Officer/admin status updates

## Problem Being Solved

Manual civic complaint triage is slow, inconsistent, and hard to prioritize at city scale. This project addresses:

- Fragmented citizen road complaints
- Lack of severity-based prioritization
- Missing geographic visibility into issue clusters
- Poor feedback loops between citizens and repair teams
- Limited analytics for administrators
- Difficulty identifying high-risk or recurring road damage zones

## Target Users

- Citizens: report road issues, upload photos, select exact map location, upvote other reports, track status, verify resolution, reopen disputed fixes.
- Field officers: view assigned/high-priority road reports, filter by status/priority, move issues through workflow states.
- Administrators: view city-wide dashboards, manage reports, run/review AI prioritization, delete reports, inspect analytics and hotspots.
- Municipal operations teams: use dashboards and analytics to allocate resources and plan preventive maintenance.

## System Architecture

```text
React/Vite SPA
  |
  | Axios + JWT bearer token
  v
FastAPI backend
  |
  | SQLAlchemy async
  v
PostgreSQL + PostGIS
  |
  +-- Stored images in stored_images table
  +-- Reports with spatial POINT location
  +-- Users, votes, notifications, departments, field teams

External services:
  - Google OAuth for optional login
  - Groq OpenAI-compatible vision endpoint for AI image analysis
  - Overpass API for POI and road context
  - OpenStreetMap tiles and Nominatim reverse geocoding from frontend

Optional/experimental:
  - Local YOLO detector through backend/ml_models.py
  - Separate ai-ensemble FastAPI service, currently not wired into compose/backend
  - ML training workspace under ml/
```

## Tech Stack

Frontend:

- React 18
- Vite 5
- React Router
- Axios
- Leaflet, React Leaflet, leaflet.heat
- Recharts
- Lucide React icons
- CSS modules/files by page/component
- Nginx static hosting in Docker

Backend:

- Python 3.11
- FastAPI
- Uvicorn
- SQLAlchemy 2 async
- asyncpg and psycopg2-binary
- Pydantic v2
- GeoAlchemy2, Shapely
- PostgreSQL/PostGIS
- bcrypt
- python-jose JWT
- httpx
- Pillow, NumPy, Ultralytics
- pgvector dependency installed but not actively modeled

AI/ML:

- Groq OpenAI-compatible chat/completions vision call
- AHP-style weighted severity model
- OSM/Overpass geospatial enrichment
- Optional YOLOv8/YOLOv5 detector training
- Optional ONNX runtime path in backend model loader
- Optional severity regressor training script

DevOps:

- Docker Compose
- Backend Dockerfile
- Frontend Dockerfile
- Render blueprint
- GitHub Actions workflow

## Frontend Structure

Important frontend paths:

- `frontend/cityreport/src/App.jsx`: route tree and client-side protected routes.
- `frontend/cityreport/src/api.js`: Axios client, API base URL resolution, auth header interceptor, 401 auto-logout.
- `frontend/cityreport/src/contexts/AuthContext.jsx`: login/signup/logout, token and user storage.
- `frontend/cityreport/src/pages/auth`: welcome, login, signup, Google callback.
- `frontend/cityreport/src/pages/citizen`: citizen dashboard, new report, report detail, map view, my reports.
- `frontend/cityreport/src/pages/officer`: officer work queue/status management.
- `frontend/cityreport/src/pages/admin`: admin dashboard, report management, analytics.
- `frontend/cityreport/src/components`: shared UI, report cards, AI severity card.
- `frontend/cityreport/src/utils/image.js`: converts backend image paths to renderable URLs.

Frontend route map:

| Route | Purpose |
| --- | --- |
| `/` | Welcome page |
| `/login` | Email/password or Google login |
| `/signup` | Citizen/officer registration |
| `/auth/callback` | Google OAuth token callback handler |
| `/citizen/dashboard` | City-wide citizen report feed |
| `/citizen/report/new` | New report form with map picker and image upload |
| `/citizen/report/:id` | Report details, upvote, verify, reopen, delete owner report |
| `/citizen/map` | Leaflet map, markers, heatmap |
| `/citizen/reports` | Current user's reports |
| `/officer/dashboard` | Officer status workflow |
| `/officer/report/:id` | Shared report detail page |
| `/admin/dashboard` | Summary dashboard and charts |
| `/admin/reports` | Admin report list, sorting, status updates, delete |
| `/admin/reports/:id` | Shared report detail page |
| `/admin/analytics` | Analytics charts and hotspot table |

## Backend Structure

Important backend paths:

- `backend/main.py`: FastAPI app, CORS, static uploads mount, router registration, startup extension/table creation.
- `backend/database.py`: async SQLAlchemy engine/session setup.
- `backend/models.py`: database ORM models and enums.
- `backend/schemas.py`: Pydantic request/response schemas.
- `backend/utils/security.py`: password hashing and JWT creation.
- `backend/routers/auth.py`: registration, login, current user, Google OAuth.
- `backend/routers/reports.py`: report CRUD, AI analysis, status transitions, verification/reopen flow.
- `backend/routers/votes.py`: upvote/downvote and lightweight AI re-score.
- `backend/routers/analytics.py`: dashboard/statistics/heatmap/trend endpoints.
- `backend/routers/upload.py`: image upload and retrieval from database.
- `backend/routers/notifications.py`: citizen notifications for resolved reports.
- `backend/routers/modeling.py`: model status endpoint.
- `backend/routers/user.py`: profile and password update endpoints.
- `backend/ai_analysis.py`: report severity orchestration.
- `backend/grok_analysis.py`: Groq and OpenStreetMap enrichment.
- `backend/ml_models.py`: optional local YOLO/ONNX detector.
- `backend/seed_data.py`, `init_db.py`, `reset_db.py`, `add_columns.py`: operational/manual scripts.

## Database Design

Database engine:

- PostgreSQL
- PostGIS extension created on startup
- pgvector extension attempted on startup, but vector fields are commented out

Tables:

| Table | Purpose |
| --- | --- |
| `users` | Accounts with name, email, hashed password, role, created timestamp |
| `departments` | Civic departments, currently seeded with Roads |
| `field_teams` | Field teams tied to departments, current location/status |
| `reports` | Road issue reports, status, severity, priority, image URL, spatial location, AI scores, metadata, ownership, assignment |
| `votes` | Composite key on user/report with upvote/downvote value |
| `notifications` | Citizen notifications, mainly resolution prompts |
| `stored_images` | Uploaded image bytes, filename, content type |

Key report fields:

- `status`: `pending`, `assigned`, `in_progress`, `resolved`, `closed`, `reopened`, `rejected`
- `severity`: `low`, `medium`, `high`, `critical`
- `priority`: `low`, `medium`, `high`, `critical`
- `location`: PostGIS `POINT` with SRID 4326
- `pothole_spread_score`, `emotion_score`, `location_score`, `upvote_score`
- `ai_severity_score`, `ai_severity_level`
- `location_meta`, `sentiment_meta` JSON stored as strings

Indexes:

- Report indexes exist for status, priority, user_id, created_at, category.
- There is no explicit GiST/SP-GiST spatial index for `reports.location`, which matters for radius queries.

## API Flow

Core endpoints:

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/` | Health/root message |
| `POST` | `/auth/register` | Register a user |
| `POST` | `/auth/login` | OAuth2 password login, returns JWT |
| `GET` | `/auth/me` | Current authenticated user |
| `GET` | `/auth/google/login` | Redirect to Google OAuth |
| `GET` | `/auth/google/callback` | Exchange Google code, create/find user, redirect frontend with JWT |
| `POST` | `/upload/image` | Store one uploaded image in DB |
| `GET` | `/upload/image/{image_id}` | Serve image bytes from DB |
| `POST` | `/reports/` | Create road report and run AI analysis |
| `GET` | `/reports/` | List road reports with filters, sorting, pagination |
| `GET` | `/reports/mine` | Current user's reports |
| `GET` | `/reports/{report_id}` | Report detail |
| `POST` | `/reports/{report_id}/verify` | Owner/admin closes resolved report |
| `POST` | `/reports/{report_id}/reopen` | Owner/admin reopens report with feedback |
| `POST` | `/reports/{report_id}/reanalyze` | Admin reruns AI analysis |
| `PATCH` | `/reports/{report_id}/status` | Officer/admin updates report status |
| `DELETE` | `/reports/{report_id}` | Owner/admin deletes report |
| `POST` | `/reports/{report_id}/upvote` | Toggle/upsert upvote and recalculate stored AI score |
| `POST` | `/reports/{report_id}/downvote` | Toggle/upsert downvote and recalculate stored AI score |
| `GET` | `/analytics/*` | Summary, dashboard, heatmap, distributions, trend and predictive endpoints |
| `GET` | `/notifications/` | Current user's notifications |
| `POST` | `/notifications/{notif_id}/read` | Mark notification read |
| `POST` | `/notifications/read-all` | Mark current user's notifications read |
| `GET` | `/modeling/status` | Admin-only local model status |
| `GET/PATCH/POST` | `/users/me...` | Profile and password actions |

Create report flow:

1. Frontend uploads image to `POST /upload/image`.
2. Backend stores image bytes in `stored_images` and returns `/upload/image/{id}`.
3. Frontend submits report data to `POST /reports/`.
4. Backend loads stored image bytes.
5. Backend queries OSM/Overpass for POIs and traffic context.
6. If `GROK_API_KEY` exists, backend calls Groq vision API.
7. If Groq is unavailable, backend falls back to heuristic AHP and optional YOLO.
8. Backend writes report with severity/priority and AI metadata.
9. Frontend navigates to the report detail page.

Resolution flow:

1. Officer/admin changes status to `resolved`.
2. Backend creates a notification for the report owner.
3. Citizen receives notification in the navbar polling flow.
4. Citizen verifies to move report to `closed`, or disputes/reopens with feedback.

## Authentication Flow

Email/password:

1. User registers via `/auth/register`.
2. Password is hashed with bcrypt.
3. Login uses OAuth2PasswordRequestForm at `/auth/login`.
4. Backend returns JWT with `sub` set to user email.
5. Frontend stores token and user in `localStorage`.
6. Axios attaches `Authorization: Bearer <token>` to future requests.

Google OAuth:

1. Frontend redirects to `/auth/google/login`.
2. Backend redirects to Google OAuth.
3. Google redirects to `/auth/google/callback`.
4. Backend exchanges code for access token, fetches profile, creates citizen user if needed.
5. Backend redirects to frontend `/auth/callback?token=...&role=...&email=...&name=...`.
6. Frontend stores query token/user in `localStorage`.

Authorization:

- Client-side route guards redirect by role.
- Backend enforces role checks on selected endpoints, including admin-only `reanalyze`, admin-only `modeling/status`, admin-only `predictive-maintenance`, and officer/admin status updates.
- Several analytics endpoints allow any authenticated user.
- Registration currently allows selecting `citizen` or `officer` from the frontend.

## AI/ML Components

Severity model:

- The main scoring pipeline is in `backend/ai_analysis.py`.
- It uses a weighted AHP/MCDM-style approach.
- Groq path uses weights:
  - Image score: 40 percent
  - Description score: 25 percent
  - Location score: 15 percent
  - Traffic score: 10 percent
  - Upvote score: 10 percent
- Heuristic fallback uses:
  - Visual: 35 percent
  - Location: 20 percent
  - Sentiment: 25 percent
  - Social/upvotes: 20 percent

External AI/geospatial:

- `backend/grok_analysis.py` calls `https://api.groq.com/openai/v1/chat/completions`.
- It uses the model `meta-llama/llama-4-scout-17b-16e-instruct`.
- Overpass API is used for nearby hospitals, schools, emergency services, transit, landuse, road types, and traffic proxy scoring.

Local model support:

- `backend/ml_models.py` supports `ROAD_DETECTOR_WEIGHTS`.
- It prefers an ONNX file next to the `.pt` path, otherwise uses Ultralytics YOLO.
- It returns boxes, count, max area ratio, labels, confidence, and source.

ML workspace:

- `ml/training/train_detector.py`: train YOLOv5/v8 detector.
- `ml/training/train_severity.py`: train RandomForest severity regressor from labeled CSV.
- `ml/tools`: dataset preparation, validation, promotion scripts.
- `ml/templates/severity_labels.example.csv`: severity labeling template.
- `ml/docs/pothole_severity_labeling_guide.md`: labeling guide.

Experimental separate service:

- `ai-ensemble/main.py` exposes its own `/analyze` FastAPI endpoint.
- It loads YOLO and OSM context independently.
- It is not included in `docker-compose.yml`, not referenced by the main backend, and currently acts as a standalone prototype.

## Deployment Requirements

Local Docker Compose:

- `docker-compose.yml` runs:
  - PostGIS PostgreSQL on host port `5433`
  - Backend on host port `8005`
  - Frontend Nginx on host port `3005`
- Requires `backend/.env`.
- Backend command uses Uvicorn reload and mounts the backend source directory.

Render:

- `render.yaml` defines:
  - `citizen-backend` Python web service
  - `citizen-frontend` Node/static service
  - `citizen-db` Postgres database
- `DATABASE_URL` is sourced from Render database.
- `VITE_API_URL` is sourced from backend service URL.
- Additional required runtime vars are not listed in the blueprint.

CI/CD:

- `.github/workflows/ci-cd.yml` installs backend dependencies, runs Python compile checks, installs frontend dependencies, builds frontend, then builds/pushes the backend Docker image to Docker Hub.
- No real test suite currently runs.
- Frontend Docker image is not built/pushed in the workflow.

## Environment Variables

Backend:

| Variable | Purpose | Current status |
| --- | --- | --- |
| `DATABASE_URL` | Async SQLAlchemy database URL | Required |
| `SECRET_KEY` | JWT signing key | Required for production, has unsafe fallback |
| `ALGORITHM` | JWT algorithm, defaults HS256 | Optional |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | JWT lifetime | Optional |
| `GROK_API_KEY` | Enables Groq vision analysis | Optional but needed for AI vision path |
| `ALLOWED_ORIGINS` | Comma-separated production CORS origins | Important for production |
| `FRONTEND_URL` | Google OAuth callback redirect target | Required for OAuth |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | Required for Google login |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | Required for Google login |
| `REDIRECT_URI` | Google backend callback URL | Required in hosted OAuth |
| `ROAD_DETECTOR_WEIGHTS` | Local YOLO `.pt` or paired ONNX path | Optional |
| `ROAD_DEPTH_MODEL` | Documented but not implemented in active backend scoring | Aspirational |
| `ROAD_SEVERITY_MODEL` | Documented but not loaded in active backend scoring | Aspirational |
| `ROAD_MODEL_DEVICE` | Documented but not used in active loader | Aspirational |

Frontend:

| Variable | Purpose |
| --- | --- |
| `VITE_API_URL` | Backend base URL for Axios |

AI ensemble service:

| Variable | Purpose |
| --- | --- |
| `POTHOLE_YOLO_MODEL` | YOLO model path/name for ai-ensemble |
| `ROAD_DETECTOR_WEIGHTS` | Alternate model path/name |

## Features

Implemented:

- Email/password registration and login
- Google OAuth path
- Role-aware frontend routes for citizen/officer/admin
- Citizen report submission with geolocation and map picker
- Image upload and rendering
- City-wide report feed
- Report ownership actions: delete, verify, reopen/dispute
- Upvote/downvote model with stored vote rows
- AI severity scoring on report creation
- AI reanalysis endpoint for admin
- AI breakdown card on report detail
- Leaflet map view with markers and heatmap overlay
- Officer status workflow
- Admin report management
- Admin analytics charts
- Notifications when reports are resolved
- Docker Compose local environment
- Render deployment blueprint
- Basic GitHub Actions workflow
- ML training workspace and docs

Partially implemented or inconsistent:

- Field teams and departments exist in schema but assignment workflow is minimal.
- `assigned` status exists but is not fully used by UI.
- `resolution_image_url` exists but upload/usage flow is missing.
- pgvector is installed/extension attempted but embedding column is commented out.
- Depth/severity model env vars are documented but not connected to active scoring.
- `ai-ensemble` service duplicates logic but is not wired into the main app.
- Frontend still references removed `pothole_depth_score`.

## Folder Structure Explanation

```text
.
|-- README.md
|-- docker-compose.yml
|-- render.yaml
|-- .github/workflows/ci-cd.yml
|-- backend/
|   |-- main.py
|   |-- database.py
|   |-- models.py
|   |-- schemas.py
|   |-- ai_analysis.py
|   |-- grok_analysis.py
|   |-- ml_models.py
|   |-- routers/
|   |-- utils/
|   |-- Dockerfile
|   |-- requirements.txt
|   |-- requirements-ml.txt
|   |-- .env.example
|   |-- seed/reset/init/manual scripts
|-- frontend/
|   |-- Dockerfile
|   |-- nginx.conf
|   |-- cityreport/
|       |-- package.json
|       |-- vite.config.js
|       |-- src/
|           |-- App.jsx
|           |-- api.js
|           |-- contexts/
|           |-- pages/
|           |-- components/
|           |-- utils/
|-- ml/
|   |-- README.md
|   |-- config/
|   |-- docs/
|   |-- templates/
|   |-- tools/
|   |-- training/
|-- ai-ensemble/
|   |-- main.py
|   |-- model_loader.py
|   |-- osm_utils.py
|   |-- requirements.txt
```

## Current State Assessment

Strengths:

- Clear MVP concept with citizen, officer, and admin roles.
- Practical report workflow from submission to resolution verification.
- Good use of maps and geospatial data for civic reporting.
- AI scoring is explainable through stored score components and metadata.
- Backend is modularized by routers/services.
- Docker Compose makes local stack understandable.
- ML workspace shows a path from prototype to trained model.

Weaknesses:

- No real database migrations despite Alembic dependency.
- Startup uses `Base.metadata.create_all`, which is not enough for schema evolution.
- Manual scripts contain default/admin credentials and debug logging.
- Role authorization is inconsistent.
- Google OAuth returns JWT in URL query parameters.
- Tokens are stored in `localStorage`.
- Uploaded images are stored as large binary blobs in Postgres without size limits.
- Report creation depends on external AI/OSM calls synchronously.
- Render blueprint is incomplete for production secrets and CORS/OAuth.
- README contains stale absolute local paths and repeated leftover headings.
- CI does not run meaningful backend/API tests.

## Missing Components

- Alembic migration setup and migration history.
- Production-ready admin provisioning.
- Email verification and password reset.
- Approval workflow for officer/admin accounts.
- Rate limiting and abuse prevention.
- File upload size/type/content validation beyond MIME prefix.
- Object storage for images.
- Background job queue for AI analysis and external API calls.
- Spatial index on report location.
- Full assignment workflow for departments and field teams.
- Resolution proof upload flow.
- Server-side audit log for status changes/deletes.
- Comprehensive API tests and frontend tests.
- Health/readiness endpoints for deployment.
- Observability: structured logs, metrics, tracing, alerts.
- Privacy/data retention policy for citizen reports and images.

## Technical Debt

- Mixed async/sync typing in upload route (`Session` annotation with async session behavior).
- `echo=True` SQL logging in database engine.
- Inconsistent naming: Groq/Grok in variables/comments/files.
- README references old local path `/Users/shreyas/Documents/New project/...`.
- `backend/add_columns.py` manually alters schema outside migrations.
- `backend/reset_db.py` drops only a subset of tables and is unsafe for shared environments.
- `backend/inject_admin.py` prints debug password/hash information.
- `backend/verify_users.py` contains default password assumptions and a hardcoded email reset.
- AI metadata is stored as stringified JSON instead of JSON/JSONB.
- Frontend uses stale `pothole_depth_score` fields that do not exist in current schema.
- `ai-ensemble` duplicates logic and increases maintenance cost.
- `requirements.txt` includes both runtime API and heavy ML packages.
- CI uses old GitHub Action major versions and only compiles selected Python files.

## Security Concerns

- Unsafe fallback JWT secret: `your_super_secret_key_change_this`.
- Users can self-register as officers through the public signup form.
- No email verification, account approval, lockout, or password reset flow.
- Google OAuth token is passed in URL query string, which can leak through history, logs, screenshots, and referrers.
- JWT and user data are stored in `localStorage`, increasing XSS impact.
- No refresh token/session revocation strategy.
- CORS defaults include local development origins; production depends on env hygiene.
- Image upload has no explicit size limit, malware scanning, EXIF stripping, or content validation.
- Stored image endpoint appears public by image ID.
- Default seed credentials are documented/printed.
- Analytics endpoints expose operational data to any authenticated user except selected admin-only endpoints.
- Raw SQL is used in analytics. Most dynamic values are parameterized or enum-validated, but the pattern deserves discipline.
- Render Postgres `ipAllowList: []` is documented as allow all.
- No rate limiting on login, registration, report creation, upload, or votes.

## Scalability Concerns

- Report creation performs AI, OSM POI, and traffic queries synchronously, increasing latency and failure coupling.
- External Overpass/Groq availability directly affects submission experience.
- Images stored in PostgreSQL will increase database size and backup/restore cost.
- No CDN/object storage for images.
- No background workers, retries, or dead-letter handling.
- No caching for OSM/traffic/geocoding calls.
- No spatial index for radius queries.
- Pagination exists in API but frontend often fetches broad report lists with default limits.
- Analytics queries scan reports and use raw SQL without materialized summaries.
- Notifications are polled every 30 seconds per citizen; realtime or smarter polling may be needed at scale.
- Running heavy ML dependencies in the API container increases image size and cold start time.
- `uvicorn --reload` is used in Docker Compose/backend Dockerfile, which is not suitable for production.

## Recommended Improvements

High priority:

1. Add Alembic migrations and remove schema mutation from startup for production.
2. Lock down role assignment: public signup should create only citizens; officers/admins should be invited or approved.
3. Replace query-string OAuth token delivery with secure callback/session handling.
4. Move JWT storage to safer cookie/session architecture or implement strong XSS protections and short-lived tokens.
5. Add upload size limits, content sniffing, and move images to object storage.
6. Add server-side RBAC checks consistently across analytics/admin/officer APIs.
7. Split AI analysis into a background job with pending/processing/completed states.
8. Add a spatial GiST index for `reports.location`.
9. Remove hardcoded/debug credential scripts from production paths.
10. Add API tests for auth, report creation, role enforcement, status transitions, voting, and analytics.

Medium priority:

1. Normalize AI metadata into JSONB columns.
2. Add audit logs for status changes, deletes, reanalysis, and admin actions.
3. Complete field team assignment and department workflows.
4. Implement resolution proof upload using `resolution_image_url`.
5. Wire or remove `ai-ensemble` to avoid duplicate architecture.
6. Separate lightweight backend requirements from optional ML/training dependencies.
7. Improve CI with linting, full backend import checks, frontend lint/build, tests, and Docker builds for both services.
8. Fix stale frontend references to `pothole_depth_score`.
9. Update README and ML docs to remove stale absolute paths.
10. Add health/readiness endpoints and structured logs.

Longer term:

1. Use queue-backed workers for AI and geospatial enrichment.
2. Cache OSM/geospatial context by geohash or grid cell.
3. Add materialized analytics summaries for dashboards.
4. Add map clustering for large report volumes.
5. Add notification channels beyond polling, such as WebSocket/SSE/email/SMS.
6. Introduce model evaluation/versioning for severity scoring.
7. Add privacy controls, retention policies, and consent text for uploaded images/location data.
