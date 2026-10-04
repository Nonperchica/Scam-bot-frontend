# Live dashboard

Uses existing `detection_logs` and `line_sources` tables. No migration is required.
Do not run the old `supabase_schema.sql`: it describes the earlier demo schema.
The LINE bot remains a separate service. This API only reads existing history.

## Local setup

1. Copy `backend/.env.example` to `backend/.env`.
2. Set `SUPABASE_URL`, `SUPABASE_SERVICE_KEY` (or existing `SUPABASE_KEY`), and a long random `DASHBOARD_API_TOKEN`. Keep these server-side.
3. Install `backend/requirements.txt` in a virtual environment.
4. On Windows, from the project root run `npm run backend`. This uses `backend/.venv/Scripts/python.exe` directly, so Python does not need to be on PATH. Leave this terminal running.
5. Run `npm run dev`. Enter the dashboard token when prompted; it is kept in session storage for this tab. Close the tab to clear it.

For deployment, use HTTPS and configure allowed frontend origins in `backend/main.py`. Set `VITE_API_URL` before building if the API has a separate host. Never use the Supabase service key as the dashboard token. The shared dashboard token is a first-stage access gate, not individual admin accounts; `dashboard_admins` is not used yet.

### Git Bash: Python was not found

The global `python` command can point to the Microsoft Store shortcut even when the project's virtual environment is ready. Use `npm run backend` from the project root, or this command when already inside `backend/`:

```bash
./.venv/Scripts/python.exe -m uvicorn main:app --host 127.0.0.1 --port 8000 --no-proxy-headers
```

`python main.py` does not start this FastAPI application; Uvicorn starts the HTTP server. Check `http://127.0.0.1:8000/health` after startup. The dashboard endpoints require the existing `DASHBOARD_API_TOKEN` from `backend/.env`. Do not run a second backend on port 8000 while this one is running.

## Data rules

- Overview: seven calendar days including today, Asia/Bangkok. Charts and cards use one response.
- Total messages includes conversation, uncertain and failed checks. Risk rate is detected threats divided by all recorded messages, not model accuracy.
- Threats require `is_scam=true`, excluding error, conversation and uncertain outcomes.
- Risk chart includes only `risk_found` and `no_risk_found`. Fallback counts are shown separately.
- Excludes known synthetic records by `backend-smoke-` event/source prefix and `[TEST] Synthetic` message prefix. Other user-submitted test messages remain included; automatic classification of test intent is not attempted.
- Group cards and threat history use all recorded history. Group graph uses the latest seven days.
- Missing members, join date, sender and confidence are shown as unavailable. Source IDs are not sender IDs.
- Dataset page remains explicitly marked as demo, outside the history integration.
- Reads are paginated to avoid the Supabase per-response row cap. This initial implementation aggregates in the API; for large histories, move aggregation into a reviewed SQL function/view.

## Checks

`backend/.venv/Scripts/python.exe -m unittest discover -s backend/tests`

`npm run build` and `npm run lint`
