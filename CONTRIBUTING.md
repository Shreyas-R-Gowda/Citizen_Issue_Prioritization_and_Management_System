# Contributing

Thank you for your interest in contributing to the Citizen Issue Prioritization and Management System.

This project combines a React frontend, FastAPI backend, PostgreSQL/PostGIS database, and AI-assisted issue prioritization. Contributions should keep civic reliability, data privacy, and maintainability in mind.

## Ways to Contribute

- Report bugs with clear reproduction steps.
- Suggest focused feature improvements.
- Improve documentation, setup instructions, or diagrams.
- Add tests for backend API flows and frontend user workflows.
- Refactor code without changing behavior.
- Improve validation, accessibility, security, or deployment reliability.

## Development Setup

Clone the repository:

```bash
git clone https://github.com/Shreyas-R-Gowda/Citizen_Issue_Prioritization_and_Management_System.git
cd Citizen_Issue_Prioritization_and_Management_System
```

Create backend environment configuration:

```bash
cp backend/.env.example backend/.env
```

Run the full stack:

```bash
docker compose up --build
```

Run backend locally:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8005
```

Run frontend locally:

```bash
cd frontend/cityreport
npm install
npm run dev
```

## Branch Naming

Use short, descriptive branch names:

- `feature/report-filters`
- `fix/upload-validation`
- `docs/api-endpoints`
- `refactor/status-utils`

## Commit Guidelines

Use clear commit messages. Conventional-style prefixes are recommended:

- `feat: add admin report export`
- `fix: validate image upload size`
- `docs: update local setup guide`
- `refactor: centralize report status labels`
- `test: add report API tests`

## Pull Request Checklist

Before opening a pull request:

- Confirm the change is focused and easy to review.
- Update documentation when behavior, setup, APIs, or environment variables change.
- Add or update tests when possible.
- Avoid committing generated files, secrets, local database files, or model weights.
- Run the relevant checks available in your environment.

Suggested checks:

```bash
python3 -m compileall -q backend ai-ensemble ml
cd frontend/cityreport && npm run build
```

## Code Style

Backend:

- Prefer FastAPI and SQLAlchemy patterns already used in the project.
- Keep request/response schemas explicit with Pydantic validation.
- Use structured error handling and avoid leaking internal exceptions to clients.
- Keep AI/external-service code isolated from route handlers where practical.

Frontend:

- Prefer shared utilities/components over duplicate page-local logic.
- Keep role-specific pages clear and readable.
- Do not store derived constants in multiple places if a shared utility exists.
- Keep UI text concise and user-focused.

## Security Expectations

- Do not commit secrets, tokens, API keys, credentials, `.env` files, model weights, or user data.
- Do not weaken authentication, authorization, validation, or upload controls.
- Report security issues privately using the process in `SECURITY.md`.

## Review Process

Maintainers may ask for:

- Smaller pull requests.
- More explicit tests or documentation.
- Security or privacy clarifications.
- Screenshots for UI changes.

Respectful, focused review makes the project better for everyone.
