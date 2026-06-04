# Dependency Safety Report

## Summary

Dependency removal was only partially safe.

The frontend removals were verified by a successful `npm install` and `npm run build`. The `ai-ensemble` removals were also safe for current imports. The backend cleanup introduced at least one direct regression: `backend/utils/security.py` imports `bcrypt`, but `backend/requirements.txt` no longer installs `bcrypt` after removing `passlib[bcrypt]`.

A second backend runtime blocker was found during startup verification: SQLAlchemy async startup requires `greenlet`, but `greenlet` is not listed in `backend/requirements.txt`.

## Files Reviewed

- `backend/requirements.txt`
- `backend/requirements-ml.txt`
- `frontend/cityreport/package.json`
- `ai-ensemble/requirements.txt`

## Package-by-Package Verification

| Package | Removed From | Why It Was Removed | Code Still References It? | Startup/Build/Runtime Impact | Recommendation |
|---|---|---|---|---|---|
| `alembic` | `backend/requirements.txt` | No Alembic config, migrations directory, or migration commands are present. | No direct imports found. | Startup does not require it. Long-term schema migration workflow is missing, but removal does not break current app startup. | Keep removed |
| `pgvector` | `backend/requirements.txt` | No active Python `pgvector` model fields or imports are present. Vector ORM fields are not active. | No Python import found. SQL startup still attempts `CREATE EXTENSION IF NOT EXISTS vector;`, but that uses the database extension, not the Python package. | Python startup does not require the `pgvector` package. Database startup gracefully skips unavailable extension errors. | Keep removed |
| `passlib[bcrypt]` | `backend/requirements.txt` | Code uses `bcrypt` directly rather than `passlib`. | No `passlib` import found. | Removing it exposed a hidden dependency problem: `bcrypt` is still imported directly by `backend/utils/security.py`, but `bcrypt` is not listed as a direct dependency. Backend import failed with `ModuleNotFoundError: No module named 'bcrypt'`. | Keep removed, but add direct `bcrypt` dependency |
| `pydantic-settings` | `backend/requirements.txt` | Settings are loaded through `os.getenv` and `python-dotenv`; no `BaseSettings` usage found. | No `pydantic_settings` import found. | Startup/build does not require it. | Keep removed |
| `psycopg2-binary` | `backend/requirements.txt` | Backend uses async SQLAlchemy with `asyncpg`. | No `psycopg2` import found. | App startup does not require it when `DATABASE_URL` uses `postgresql+asyncpg://`. Risk remains if production injects a sync `postgres://`/`postgresql://` URL. | Keep removed |
| `react-is` | `frontend/cityreport/package.json` | No direct frontend source import found. | No direct import found. | `npm install` and production build completed successfully without it. | Keep removed |
| `babel-plugin-react-compiler` | `frontend/cityreport/package.json` | Vite config does not enable React Compiler. | No direct config/source reference found. | `npm install` and production build completed successfully without it. Nested `frontend/cityreport/README.md` still claims React Compiler is enabled, but code does not. | Keep removed |
| `transformers` | `ai-ensemble/requirements.txt` | `ai-ensemble` source does not import Transformers. | No `ai-ensemble` import found. `backend/requirements-ml.txt` still includes `transformers>=4.51.0`. | `ai-ensemble/main.py` and `ai-ensemble/model_loader.py` imported successfully without direct `transformers`. Keep in backend ML extras if depth-model experiments require it. | Keep removed from `ai-ensemble`; keep in `backend/requirements-ml.txt` |
| `scipy` | `ai-ensemble/requirements.txt` | `ai-ensemble` source does not import SciPy. | No direct `ai-ensemble` import found. | `ai-ensemble` imports passed. Note: SciPy is still installed transitively by Ultralytics in backend verification, but not needed as an ai-ensemble direct dependency. | Keep removed |

## Additional Dependency Issues Found

| Package | Status | Evidence | Impact | Recommendation |
|---|---|---|---|---|
| `bcrypt` | Missing direct backend dependency | `backend/utils/security.py` imports `bcrypt`; backend import failed after installing only `backend/requirements.txt`. | Backend cannot import/start from a clean install. | Add `bcrypt` to `backend/requirements.txt` or restore a dependency that installs it. |
| `greenlet` | Missing backend runtime dependency | Uvicorn startup failed with `ValueError: the greenlet library is required to use this function. No module named 'greenlet'`. | Backend startup fails before database connection on a clean install. | Add `greenlet` to `backend/requirements.txt`, or use a SQLAlchemy install extra that guarantees it. |

## Verification Commands

```bash
/opt/homebrew/bin/python3.10 -m venv .venv-verify310
.venv-verify310/bin/python -m pip install -r backend/requirements.txt
.venv-verify310/bin/python - <<'PY'
import sys, os
sys.path.insert(0, os.path.abspath('backend'))
import main
PY
```

Result before temporary fixes:

- Failed: `ModuleNotFoundError: No module named 'bcrypt'`

Temporary verification-only installs:

```bash
.venv-verify310/bin/python -m pip install bcrypt
.venv-verify310/bin/python -m pip install greenlet
```

After temporary installs:

- Backend imports passed.
- Router registration passed.
- Startup advanced to database connection.
