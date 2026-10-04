"""Dashboard reads only. No writes to the bot's tables or schema."""
import os
import secrets
from fastapi import APIRouter, Depends, Header, HTTPException
from live_data import sources_and_logs, summary, groups, threat_logs


def authorize(authorization: str = Header(default="")):
    token = os.getenv("DASHBOARD_API_TOKEN", "")
    if token:
        if not secrets.compare_digest(authorization, f"Bearer {token}"):
            raise HTTPException(401, "กรุณาใส่รหัสเข้า Dashboard")
    else:
        raise HTTPException(503, "ต้องตั้งค่า DASHBOARD_API_TOKEN ใน Backend ก่อนใช้งาน")


router = APIRouter(dependencies=[Depends(authorize)])


def history():
    try:
        return sources_and_logs()
    except Exception:
        raise HTTPException(503, "อ่านข้อมูล Supabase ไม่สำเร็จ กรุณาตรวจการตั้งค่า Backend") from None


@router.get("/dashboard")
def dashboard():
    _, logs = history()
    return summary(logs)


@router.get("/threats")
def threats(source_id: str | None = None):
    sources, logs = history()
    return threat_logs(sources, logs, source_id)


@router.get("/line-groups")
def line_groups():
    return groups(*history())


@router.get("/line-groups/{source_id}/trends")
def group_trends(source_id: str):
    _, logs = history()
    return summary([r for r in logs if r.get("source_id") == source_id])["trends"]
