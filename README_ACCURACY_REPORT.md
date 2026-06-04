# README Accuracy Report

## Summary

`README.md` is mostly accurate, but it has several important caveats:

- All documented API endpoints exist.
- The root backend endpoint `GET /` exists but is not documented.
- A few features are described in a way that overstates current frontend support.
- Some documented environment variables are only reserved/aspirational in active code.
- The root README does not contain copied Vite template content, but `frontend/cityreport/README.md` still does.

## Endpoint Verification

All endpoints documented in `README.md` exist in the backend.

| README Endpoint Group | Status |
|---|---|
| Auth endpoints | All exist |
| User profile endpoints | All exist |
| Upload endpoints | All exist |
| Reports endpoints | All exist |
| Vote endpoints | All exist |
| Notification endpoints | All exist |
| Analytics endpoints | All exist |
| Modeling endpoint | Exists |

Additional existing endpoint not documented:

| Method | Endpoint | Notes |
|---|---|---|
| `GET` | `/` | Root health/status message: `Citizen Road Reporting backend is running`. |

## Environment Variable Accuracy

| Variable | README Status | Actual Usage | Accuracy |
|---|---|---|---|
| `DATABASE_URL` | Required backend var | Used in `backend/database.py`, scripts, Docker Compose, Render. | Accurate |
| `SECRET_KEY` | Required backend var | Used in `backend/utils/security.py`. Has unsafe fallback. | Accurate |
| `ALGORITHM` | Optional backend var | Used in `backend/utils/security.py`. | Accurate |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Optional backend var | Used in `backend/utils/security.py` and auth router. | Accurate |
| `GROK_API_KEY` | Optional AI vision var | Used in `backend/grok_analysis.py`; Docker Compose passes it through. | Accurate |
| `ALLOWED_ORIGINS` | Production CORS var | Used in `backend/main.py`. | Accurate |
| `FRONTEND_URL` | OAuth redirect var | Used in `backend/routers/auth.py`. | Accurate |
| `GOOGLE_CLIENT_ID` | OAuth var | Used in `backend/routers/auth.py`. | Accurate |
| `GOOGLE_CLIENT_SECRET` | OAuth var | Used in `backend/routers/auth.py`. | Accurate |
| `REDIRECT_URI` | OAuth callback var | Used in `backend/routers/auth.py`. | Accurate |
| `ROAD_DETECTOR_WEIGHTS` | Optional detector weights | Used in `backend/ml_models.py`; also supported by `ai-ensemble/model_loader.py`. | Accurate |
| `ROAD_DEPTH_MODEL` | Reserved depth model var | Present in `.env.example`, not used by active backend code. | Accurate only because README says reserved |
| `ROAD_SEVERITY_MODEL` | Reserved severity model var | Present in `.env.example`, not used by active backend code. | Accurate only because README says reserved |
| `ROAD_MODEL_DEVICE` | Reserved device var | Present in `.env.example`, not used by active backend code. | Accurate only because README says reserved |
| `VITE_API_URL` | Frontend API base URL | Used in `frontend/cityreport/src/api.js`; Render defines it. | Accurate |

## Feature Accuracy

### Accurate Implemented Features

- Citizen registration and login.
- Google OAuth route support.
- Citizen report submission with photo and coordinates.
- Backend image storage and retrieval.
- AI-assisted severity/priority scoring.
- Groq vision path when `GROK_API_KEY` is configured.
- Heuristic/local fallback scoring.
- Local detector status endpoint.
- Citizen feed, personal report history, map view, report detail page.
- Voting.
- Citizen verification/dispute flow after resolution.
- Officer dashboard with status updates.
- Admin dashboard and analytics.
- Resolved-report notifications.
- Docker Compose deployment structure.

### Overstated or Needs Clarification

| README Claim | Accuracy Issue | Recommendation |
|---|---|---|
| "Admin report management with ... reanalysis support" | Backend reanalysis endpoint exists, but current admin report UI does not expose a reanalysis action. | Reword as backend/API support or add UI control. |
| "Data-driven prioritization for field teams" | Schema supports departments/teams, but field-team workflow is minimal. | Keep with stronger caveat. |
| Optional ML dependencies wording | Backend base install still pulls Ultralytics/Torch-related runtime dependencies. | Clarify runtime vs training dependencies. |

## Architecture Diagram Accuracy

The root README high-level architecture is broadly accurate:

- React/Vite frontend.
- FastAPI backend.
- PostgreSQL/PostGIS database.
- Stored image table.
- Groq optional vision API.
- Overpass/OpenStreetMap enrichment.
- Optional local YOLO detector.
- Analytics through backend APIs.

Warnings:

- Admin reanalysis is an API capability, not currently a visible admin UI workflow.
- Predictive maintenance is a backend endpoint, not currently rendered by the frontend analytics page.

## Stale Names, Paths, and Template Content

| Check | Result |
|---|---|
| Stale project name in root README | No incorrect project title found. |
| Stale local filesystem paths in root README | None found; localhost URLs are expected setup docs. |
| Copied template content in root README | None found. |
| Copied template content elsewhere | `frontend/cityreport/README.md` is still the default Vite/React template README and incorrectly says React Compiler is enabled. |
| Upstream repository mention | Root README credits `shankar0311/civic-final`; this is not necessarily stale, but should be intentional. |

## README Accuracy Verdict

Root `README.md` is publishable after small corrections, but should be updated before pushing a "verified" refactor:

1. Add `GET /` to API documentation or explicitly omit root health endpoints.
2. Reword admin reanalysis to avoid implying frontend UI support.
3. Clarify predictive maintenance as backend-only unless frontend support is added.
4. Clarify ML dependency wording.
5. Replace or remove `frontend/cityreport/README.md` template content.
