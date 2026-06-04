# Refactor Safety Report

## Summary

The refactor is mostly safe on the frontend bundle path, but not fully safe overall. The production frontend build passed, and no broken `reportMeta.js` imports were found. However, backend startup is currently blocked by missing dependencies, and lint surfaced several cleanup issues in modified files.

## Files Reviewed

Files listed in `REFACTOR_CHANGELOG.md` were reviewed, with special focus on:

- `frontend/cityreport/src/components/AIAnalysisCard.jsx`
- `frontend/cityreport/src/components/citizen/ReportCard.jsx`
- `frontend/cityreport/src/pages/citizen/ReportDetail.jsx`
- `frontend/cityreport/src/pages/citizen/MapView.jsx`
- `frontend/cityreport/src/pages/citizen/Dashboard.jsx`
- `frontend/cityreport/src/pages/admin/AdminReports.jsx`
- `frontend/cityreport/src/utils/reportMeta.js`

## Passed Safety Checks

| Check | Result |
|---|---|
| Production frontend build | Passed |
| `reportMeta.js` imports resolve | Passed |
| `reportMeta.js` exported helpers are used | Passed |
| Removed `pothole_depth_score` UI display from main touched files | Passed |
| Python syntax compilation | Passed |
| Backend module imports after temporary dependency fixes | Passed |
| Circular dependency scan for `reportMeta.js` | No issue found |

## Broken Imports / Exports

No broken frontend imports or exports were detected by the production build.

Backend import is broken from a clean dependency install because `bcrypt` is missing from `backend/requirements.txt`. This is not a broken source import path, but it is a runtime dependency regression.

## Dead References and Stale Fields

| Area | Finding | Severity |
|---|---|---|
| `pothole_depth_score` | No active source usage found in `frontend/cityreport/src` after refactor. Remaining mentions are in docs/comments. | Pass |
| `sentimentMeta.visual_meta?.detector` | Removed from frontend source. | Pass |
| `sentimentMeta.yolo` | Used in `AIAnalysisCard.jsx` and matches current heuristic metadata shape. | Pass |
| `nearby_pois` | `AIAnalysisCard.jsx` still reads `locationMeta.nearby_pois`; Groq path appears to store nearby POIs under `sentiment_meta._nearby_pois`. | Warning |

## File-Specific Review

### `frontend/cityreport/src/utils/reportMeta.js`

Status: Mostly safe.

- Exports status labels, status colors, severity order, badge variants, and category formatting.
- All exported helpers/constants are used either directly or internally.
- `getPriorityVariant('low')` returns `info`; `Badge.css` supports `.badge-info`.

Warning:

- Low-priority badge styling changed in `ReportDetail.jsx` from the previous local `success` mapping to shared `info`. This is a small visual behavior change.

### `frontend/cityreport/src/components/AIAnalysisCard.jsx`

Status: Build-safe with one data-display warning.

- Removed stale depth-score display.
- Uses `sentimentMeta.yolo`, which matches current heuristic metadata.
- Uses current backend fields such as `pothole_spread_score`, `location_score`, `emotion_score`, and `upvote_score`.

Warning:

- Nearby POI rendering may still be incomplete for Groq results because the component reads `locationMeta.nearby_pois`, while backend Groq code stores nearby POI names in `sentiment_meta._nearby_pois`.

### `frontend/cityreport/src/components/citizen/ReportCard.jsx`

Status: Safe.

- Shared status helpers import correctly.
- Build passed.
- No stale removed field references found.

### `frontend/cityreport/src/pages/citizen/ReportDetail.jsx`

Status: Build-safe with minor behavior change.

- Shared helpers import correctly.
- Category formatting uses `formatCategory`.
- Low-priority badge variant changed from `success` to `info`.
- Lint reports a React hook warning for synchronous state updates in an effect. This appears pre-existing in pattern, but it remains unresolved.

### `frontend/cityreport/src/pages/citizen/MapView.jsx`

Status: Build-safe.

- Shared status color/label helpers import correctly.
- Build passed.
- Lint reports missing hook dependencies for `map`, `onError`, and `onLocated`.

### `frontend/cityreport/src/pages/citizen/Dashboard.jsx`

Status: Build-safe with lint issue.

- Shared `SEVERITY_ORDER` import works.
- Lint reports unused `Icon` in the `StatCard` parameter. This should be cleaned.

### `frontend/cityreport/src/pages/citizen/MyReports.jsx`

Status: Build-safe with lint issue.

- Shared `SEVERITY_ORDER` import works.
- Lint reports an empty catch block in `handleUpvote`.

### `frontend/cityreport/src/pages/admin/AdminReports.jsx`

Status: Build-safe with lint issues.

- Removed stale depth-score display.
- Build passed.
- Lint reports `fetchReports` is accessed before declaration under React compiler lint rules.
- Lint reports unused `err` variables.

### `frontend/cityreport/src/pages/admin/Analytics.jsx`

Status: Build-safe with lint issue.

- Build passed.
- Lint reports `fetchAnalytics` is accessed before declaration under React compiler lint rules.

### `frontend/cityreport/src/pages/officer/Dashboard.jsx`

Status: Build-safe with lint issues.

- Shared `getPriorityVariant` and `getStatusVariant` imports work.
- Lint reports unused `navigate`.
- Lint reports `fetchReports` is accessed before declaration under React compiler lint rules.

## Refactor Safety Failures

| Severity | Issue | Impact |
|---|---|---|
| High | `backend/requirements.txt` does not include `bcrypt` even though backend imports it. | Clean backend import/startup fails. |
| High | `backend/requirements.txt` does not include `greenlet`; SQLAlchemy async startup needs it. | Clean backend startup fails. |
| Medium | Frontend lint fails. | Build works, but code quality gate is not clean. |

## Recommendation

Do not push as-is if the goal is a polished, verified refactor. Fix backend dependency blockers first, then clean the refactor-adjacent lint issues in modified files.
