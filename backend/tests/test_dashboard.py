import os
import sys
import unittest
from datetime import datetime
from pathlib import Path
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from fastapi.testclient import TestClient
import live_data
from main import app


def row(id, status="no_risk_found", scam=False, timestamp="2026-10-02T22:00:00+00:00", **extra):
    return dict(id=id, detection_status=status, is_scam=scam, received_at=timestamp, source_id="s1", **extra)


class DashboardTests(unittest.TestCase):
    def test_login_checks_token_without_reading_history(self):
        client = TestClient(app)
        with patch.dict(os.environ, {"DASHBOARD_API_TOKEN": "test-secret"}), patch("routers.dashboard.sources_and_logs") as history:
            self.assertEqual(client.get("/api/auth/session").status_code, 401)
            self.assertEqual(client.get("/api/auth/session", headers={"Authorization": "Bearer wrong"}).status_code, 401)
            result = client.get("/api/auth/session", headers={"Authorization": "Bearer test-secret"})
            self.assertEqual(result.status_code, 200)
            self.assertEqual(result.json(), {"authenticated": True})
            history.assert_not_called()
        with patch.dict(os.environ, {"DASHBOARD_API_TOKEN": ""}):
            self.assertEqual(client.get("/api/auth/session").status_code, 503)

    def test_bangkok_boundary_and_status_semantics(self):
        rows = [row("1", "risk_found", True, risk_level="high"),
                row("2", "uncertain", False, risk_level="medium"),
                row("3", "error", False), row("4", "conversation", False),
                row("5", risk_level="low"),
                row("old", timestamp="2026-09-26T16:59:59+00:00")]
        result = live_data.summary(rows, datetime.fromisoformat("2026-10-03T10:00:00+07:00"))
        self.assertEqual(result["totalScanned"], 5)
        self.assertEqual(result["threatsDetected"], 1)
        self.assertEqual(result["riskRate"], 20)
        self.assertEqual(result["riskLevels"], {"high": 1, "low": 1})
        self.assertEqual(result["trends"][-1], {"date": "2026-10-03", "totalMessages": 5, "suspiciousMessages": 1})
        self.assertEqual(len(result["trends"]), 7)

    def test_empty_history(self):
        self.assertEqual(live_data.summary([])["riskRate"], 0)

    def test_filters_synthetic_but_keeps_private_history(self):
        sources = [{"id": "test", "line_source_id": "backend-smoke-test-group"}, {"id": "s1", "source_type": "user"}]
        rows = [row("real"), row("fake", line_event_id="backend-smoke-test-123")]
        with patch.object(live_data, "read_all", side_effect=[sources, rows]):
            actual_sources, actual_logs = live_data.sources_and_logs()
        self.assertEqual([r["id"] for r in actual_logs], ["real"])
        self.assertEqual(live_data.groups(actual_sources, actual_logs), [])

    def test_missing_fields_are_not_invented(self):
        sources = [{"id": "s1", "source_type": "group", "is_active": True}]
        rows = [row("1", "risk_found", True)]
        self.assertIsNone(live_data.groups(sources, rows)[0]["memberCount"])
        threat = live_data.threat_logs(sources, rows)[0]
        self.assertIsNone(threat["confidence"])
        self.assertEqual(threat["senderId"], "")
        self.assertEqual(threat["riskLevel"], "unknown")

    def test_leave_hides_group_but_preserves_history_and_rejoin(self):
        sources = [{"id": "s1", "source_type": "group", "display_name": "Test group", "is_active": True}]
        rows = [row("1", "risk_found", True)]
        client = TestClient(app)
        with patch.dict(os.environ, {"DASHBOARD_API_TOKEN": "test-secret"}), patch("routers.dashboard.sources_and_logs", return_value=(sources, rows)):
            headers = {"Authorization": "Bearer test-secret"}
            before = client.get('/api/line-groups', headers=headers).json()
            sources[0]['is_active'] = False
            self.assertEqual(client.get('/api/line-groups', headers=headers).json(), [])
            threats = client.get('/api/threats', headers=headers).json()
            self.assertEqual(len(threats), 1)
            self.assertEqual(threats[0]['lineGroupName'], 'Test group')
            sources[0]['is_active'] = True
            self.assertEqual(client.get('/api/line-groups', headers=headers).json(), before)

    def test_group_list_requires_explicit_active_group(self):
        sources = [{"id": str(i), "source_type": kind, "is_active": active}
                   for i, (kind, active) in enumerate([('group', True), ('group', False), ('group', None), ('user', True), ('room', True)])]
        self.assertEqual([g['id'] for g in live_data.groups(sources, [])], ['0'])

    def test_pagination_over_server_row_limit(self):
        class Query:
            def select(self, *args): return self
            def order(self, *args): return self
            def range(self, start, end): self.start = start; return self
            def execute(self):
                self.data = [{"id": i} for i in range(self.start, min(self.start + 500, 1101))]
                return self
        class Client:
            def table(self, *args): return Query()
        with patch.object(live_data, "get_supabase_client", return_value=Client()):
            self.assertEqual(len(live_data.read_all("detection_logs")), 1101)

    def test_auth_errors_and_contract(self):
        client = TestClient(app)
        with patch.dict(os.environ, {"DASHBOARD_API_TOKEN": "test-secret"}):
            self.assertEqual(client.get("/api/dashboard").status_code, 401)
            headers = {"Authorization": "Bearer test-secret"}
            with patch("routers.dashboard.sources_and_logs", return_value=([], [])):
                response = client.get("/api/dashboard", headers=headers)
                self.assertEqual(response.status_code, 200)
                self.assertEqual(response.json()["totalScanned"], 0)
                self.assertEqual(client.get("/api/line-groups", headers=headers).json(), [])
            with patch("routers.dashboard.sources_and_logs", side_effect=RuntimeError("secret-value")):
                response = client.get("/api/dashboard", headers=headers)
                self.assertEqual(response.status_code, 503)
                self.assertNotIn("secret-value", response.text)


if __name__ == "__main__":
    unittest.main()
