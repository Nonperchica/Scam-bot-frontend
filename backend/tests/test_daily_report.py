"""ตรวจรายงานอีเมลด้วยข้อมูลจำลอง ไม่เรียก Supabase หรือส่งอีเมลจริง."""
import json
import os
import sys
import unittest
from datetime import date, datetime
from pathlib import Path
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from fastapi.testclient import TestClient
import live_data
from main import app


class DailyReportTests(unittest.TestCase):
    def test_bangkok_day_counts_and_no_message_content(self):
        sources = [{"id": "g1", "source_type": "group", "display_name": "Test group", "is_active": False},
                   {"id": "u1", "source_type": "user"}]
        def row(timestamp, status, scam=False, source="g1", **extra):
            return {"received_at": timestamp, "source_id": source, "detection_status": status,
                    "is_scam": scam, "message_text": "PRIVATE_MESSAGE", **extra}
        logs = [
            row("2026-10-11T16:59:59Z", "risk_found", True),
            row("2026-10-11T17:00:00Z", "risk_found", True, warning_attempted=True, warning_sent=False),
            row("2026-10-12T10:00:00Z", "error", None),
            row("2026-10-12T11:00:00Z", "fallback"),
            row("2026-10-12T12:00:00Z", "conversation"),
            row("2026-10-12T16:59:59Z", "no_risk_found", source="u1"),
            row("2026-10-12T17:00:00Z", "risk_found", True),
        ]
        report = live_data.daily_report(sources, logs, date(2026, 10, 12))
        self.assertEqual(report, {
            "date": "2026-10-12", "timezone": "Asia/Bangkok", "totalMessages": 5,
            "threatsDetected": 1, "failedChecks": 1, "fallbackChecks": 1, "warningFailures": 1,
            "groups": [{"name": "Test group", "totalMessages": 4, "threatsDetected": 1, "failedChecks": 1}],
        })
        self.assertNotIn("PRIVATE_MESSAGE", json.dumps(report))
        self.assertNotIn("source_id", json.dumps(report))

    def test_defaults_to_previous_day_in_bangkok(self):
        now = datetime.fromisoformat("2026-10-13T08:00:00+07:00")
        with patch.object(live_data, "datetime", wraps=datetime) as clock:
            clock.now.return_value = now
            report = live_data.daily_report([], [])
        self.assertEqual(report["date"], "2026-10-12")
        self.assertEqual(report["totalMessages"], 0)
        self.assertEqual(report["groups"], [])

    def test_route_requires_token_validates_date_and_reports_read_failure(self):
        client = TestClient(app)
        with patch.dict(os.environ, {"DASHBOARD_API_TOKEN": "test-secret"}), patch(
            "routers.dashboard.sources_and_logs", return_value=([], [])
        ) as history:
            self.assertEqual(client.get("/api/reports/daily").status_code, 401)
            history.assert_not_called()
            headers = {"Authorization": "Bearer test-secret"}
            response = client.get("/api/reports/daily?report_date=2026-10-12", headers=headers)
            self.assertEqual(response.status_code, 200)
            self.assertEqual(response.json()["date"], "2026-10-12")
            self.assertEqual(client.get("/api/reports/daily?report_date=invalid", headers=headers).status_code, 422)
            history.side_effect = RuntimeError("PRIVATE_ERROR")
            failure = client.get("/api/reports/daily", headers=headers)
            self.assertEqual(failure.status_code, 503)
            self.assertNotIn("PRIVATE_ERROR", failure.text)


if __name__ == "__main__":
    unittest.main()
