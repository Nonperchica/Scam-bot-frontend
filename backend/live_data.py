"""Read-only dashboard adapter for the existing bot history schema."""
from collections import Counter
from datetime import datetime, timedelta, timezone

from database import get_supabase_client

BKK = timezone(timedelta(hours=7))


def read_all(table, columns="*", **filters):
    # Supabase caps individual responses; never silently truncate aggregates.
    rows = []
    while True:
        query = get_supabase_client().table(table).select(columns).order("id")
        for key, value in filters.items():
            query = query.eq(key, value)
        batch = query.range(len(rows), len(rows) + 499).execute().data or []
        rows.extend(batch)
        if len(batch) < 500:
            return rows


def sources_and_logs():
    sources = read_all("line_sources")
    test_ids = {s["id"] for s in sources if str(s.get("line_source_id", "")).startswith("backend-smoke-")}
    sources = [s for s in sources if s["id"] not in test_ids]
    logs = [r for r in read_all("detection_logs")
            if r.get("source_id") not in test_ids
            and not str(r.get("line_event_id", "")).startswith("backend-smoke-")
            and not str(r.get("message_text", "")).startswith("[TEST] Synthetic")]
    return sources, logs


def is_threat(row):
    return row.get("is_scam") is True and row.get("detection_status") not in {"error", "conversation", "uncertain"}


def summary(logs, now=None):
    now = now or datetime.now(BKK)
    start = now.astimezone(BKK).replace(hour=0, minute=0, second=0, microsecond=0) - timedelta(days=6)
    end = start + timedelta(days=7)
    daily = {(start + timedelta(days=i)).date().isoformat(): {"totalMessages": 0, "suspiciousMessages": 0} for i in range(7)}
    recent = []
    for row in logs:
        ts = datetime.fromisoformat(row["received_at"].replace("Z", "+00:00")).astimezone(BKK)
        if start <= ts < end:
            recent.append(row)
            bucket = daily[ts.date().isoformat()]
            bucket["totalMessages"] += 1
            bucket["suspiciousMessages"] += int(is_threat(row))
    threats = sum(is_threat(r) for r in recent)
    assessed = [r for r in recent if r.get("detection_status") in {"risk_found", "no_risk_found"}]
    levels = Counter(r.get("risk_level") or "unknown" for r in assessed)
    statuses = Counter(r.get("detection_status") or "unknown" for r in recent)
    return {
        "totalScanned": len(recent), "threatsDetected": threats,
        "riskRate": round(threats / len(recent) * 100, 2) if recent else 0,
        "riskLevels": dict(levels), "statuses": dict(statuses),
        "trends": [{"date": day, **counts} for day, counts in daily.items()],
        "updatedAt": now.isoformat(),
    }


def groups(sources, logs):
    return [{"id": s["id"], "name": s.get("display_name") or "กลุ่มที่ยังไม่ระบุชื่อ",
             "memberCount": s.get("member_count"), "joinedAt": s.get("bot_joined_at"),
             "status": "active" if s.get("is_active") else "inactive",
             "messagesScanned": sum(r.get("source_id") == s["id"] for r in logs),
             "threatsDetected": sum(r.get("source_id") == s["id"] and is_threat(r) for r in logs)}
            for s in sources if s.get("source_type") == "group" and s.get("is_active") is True]


def threat_logs(sources, logs, source_id=None):
    names = {s["id"]: s.get("display_name") for s in sources}
    return [{"id": r["id"], "message": r.get("message_text") or r.get("message_preview") or "",
             "senderName": "ไม่ระบุผู้ส่ง", "senderId": "", "riskLevel": r.get("risk_level") or "unknown",
             "confidence": None, "timestamp": r["received_at"], "status": "flagged",
             "category": "ยังไม่ระบุ", "lineGroupName": names.get(r.get("source_id"))}
            for r in sorted(logs, key=lambda r: r["received_at"], reverse=True)
            if is_threat(r) and (source_id is None or r.get("source_id") == source_id)]
