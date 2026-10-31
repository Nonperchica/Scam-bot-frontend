"""Read-only dashboard adapter for the existing bot history schema."""
from collections import Counter
from datetime import date, datetime, timedelta, timezone
import logging
from time import monotonic

from database import get_supabase_client

BKK = timezone(timedelta(hours=7))
logger = logging.getLogger(__name__)


def read_all(table, columns="*", **filters):
    # Supabase caps individual responses; never silently truncate aggregates.
    rows = []
    while True:
        started = monotonic()
        try:
            query = get_supabase_client().table(table).select(columns).order("id")
            for key, value in filters.items():
                query = query.eq(key, value)
            batch = query.range(len(rows), len(rows) + 499).execute().data or []
        except Exception as error:
            # ไม่บันทึกข้อความ exception เพราะอาจมีคีย์หรือข้อมูลผู้ใช้
            logger.error("read_all failed table=%s page=%d elapsed=%.2fs error_type=%s",
                         table, len(rows) // 500 + 1, monotonic() - started, type(error).__name__)
            raise
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


def summary(logs, now=None, period="week", target=None):
    now = now or datetime.now(BKK)
    today = now.astimezone(BKK).replace(hour=0, minute=0, second=0, microsecond=0)
    if period == "day":
        start = datetime.combine(target, datetime.min.time(), BKK) if target else today
        end = start + timedelta(days=1)
        buckets = {f"{hour:02d}:00": {"totalMessages": 0, "suspiciousMessages": 0} for hour in range(24)}
    else:
        start = today - timedelta(days=6) if period == "week" else (datetime.combine(target, datetime.min.time(), BKK) if target else today).replace(day=1)
        end = today + timedelta(days=1) if period == "week" else (start.replace(year=start.year + 1, month=1) if start.month == 12 else start.replace(month=start.month + 1))
        buckets = {(start + timedelta(days=i)).date().isoformat(): {"totalMessages": 0, "suspiciousMessages": 0}
                   for i in range((end - start).days)}
    recent = []
    for row in logs:
        ts = datetime.fromisoformat(row["received_at"].replace("Z", "+00:00")).astimezone(BKK)
        if start <= ts < end:
            recent.append(row)
            bucket = buckets[f"{ts.hour:02d}:00" if period == "day" else ts.date().isoformat()]
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
        "trends": [{"date": day, **counts} for day, counts in buckets.items()],
        "updatedAt": now.isoformat(),
    }


def daily_report(sources, logs, report_date: date | None = None):
    """สรุปวันตามเวลาไทย ส่งเฉพาะจำนวนและชื่อกลุ่มให้ n8n."""
    report_date = report_date or (datetime.now(BKK) - timedelta(days=1)).date()
    daily_logs = [r for r in logs
                  if datetime.fromisoformat(r["received_at"].replace("Z", "+00:00")).astimezone(BKK).date() == report_date]
    group_reports = []
    # shortcut: รวมข้อมูลในหน่วยความจำ; ย้ายไป SQL aggregate เมื่อประวัติมีขนาดใหญ่
    for source in sources:
        if source.get("source_type") != "group":
            continue
        group_logs = [r for r in daily_logs if r.get("source_id") == source["id"]]
        if group_logs:
            group_reports.append({
                "name": source.get("display_name") or "กลุ่มที่ยังไม่ระบุชื่อ",
                "totalMessages": len(group_logs),
                "threatsDetected": sum(is_threat(r) for r in group_logs),
                "failedChecks": sum(r.get("detection_status") == "error" for r in group_logs),
            })
    return {
        "date": report_date.isoformat(), "timezone": "Asia/Bangkok",
        "totalMessages": len(daily_logs),
        "threatsDetected": sum(is_threat(r) for r in daily_logs),
        "failedChecks": sum(r.get("detection_status") == "error" for r in daily_logs),
        "fallbackChecks": sum(r.get("detection_status") == "fallback" for r in daily_logs),
        "warningFailures": sum(r.get("warning_attempted") is True and r.get("warning_sent") is False
                               for r in daily_logs),
        "groups": group_reports,
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
             "senderName": r.get("sender_display_name") or ("ผู้ใช้ LINE" if r.get("sender_user_id") else "ไม่ระบุผู้ส่ง"),
             "senderId": r.get("sender_user_id") or "", "riskLevel": r.get("risk_level") or "unknown",
             "confidence": None, "timestamp": r["received_at"], "status": "flagged",
             "category": "ยังไม่ระบุ", "lineGroupName": names.get(r.get("source_id"))}
            for r in sorted(logs, key=lambda r: r["received_at"], reverse=True)
            if is_threat(r) and (source_id is None or r.get("source_id") == source_id)]
