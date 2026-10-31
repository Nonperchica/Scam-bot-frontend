"""Dashboard reads only. No writes to the bot's tables or schema."""
import os
import secrets
import logging
from datetime import date
from fastapi import APIRouter, Depends, Header, HTTPException, Query
from live_data import sources_and_logs, summary, groups, threat_logs, daily_report

logger = logging.getLogger(__name__)


def authorize(authorization: str = Header(default="")):
    token = os.getenv("DASHBOARD_API_TOKEN", "")
    if token:
        if not secrets.compare_digest(authorization, f"Bearer {token}"):
            raise HTTPException(401, "กรุณาใส่รหัสเข้า Dashboard")
    else:
        raise HTTPException(503, "ต้องตั้งค่า DASHBOARD_API_TOKEN ใน Backend ก่อนใช้งาน")


router = APIRouter(dependencies=[Depends(authorize)])


@router.get("/auth/session")
def auth_session():
    return {"authenticated": True}


def history():
    try:
        return sources_and_logs()
    except Exception as error:
        # เก็บเฉพาะชนิด error เพื่อไม่เผยข้อมูลจาก exception
        logger.error("dashboard history failed error_type=%s", type(error).__name__)
        raise HTTPException(503, "อ่านข้อมูล Supabase ไม่สำเร็จ กรุณาตรวจการตั้งค่า Backend") from None


@router.get("/dashboard")
def dashboard(period: str = Query(default="week", pattern="^(day|week|month)$"),
              source: str = Query(default="all", pattern="^(all|private|group)$"),
              target: date | None = None):
    sources, logs = history()
    if source != "all":
        source_types = {str(item["id"]): item.get("source_type") for item in sources}
        wanted = "user" if source == "private" else "group"
        logs = [row for row in logs if source_types.get(str(row.get("source_id")), row.get("source_type")) == wanted]
    return summary(logs, period=period, target=target)


@router.get("/threats")
def threats(source_id: str | None = None,
            source: str = Query(default="all", pattern="^(all|private|group)$")):
    sources, logs = history()
    if source != "all":
        source_types = {str(item["id"]): item.get("source_type") for item in sources}
        wanted = "user" if source == "private" else "group"
        logs = [row for row in logs if source_types.get(str(row.get("source_id")), row.get("source_type")) == wanted]
    return threat_logs(sources, logs, source_id)


@router.get("/reports/daily")
def daily_email_report(report_date: date | None = None):
    return daily_report(*history(), report_date=report_date)


@router.get("/line-groups")
def line_groups():
    return groups(*history())


@router.get("/line-groups/{source_id}/trends")
def group_trends(source_id: str, period: str = Query(default="week", pattern="^(day|week|month)$"), target: date | None = None):
    _, logs = history()
    return summary([r for r in logs if r.get("source_id") == source_id], period=period, target=target)
