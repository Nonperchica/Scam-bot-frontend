# =============================================
# GET /api/stats — Dashboard Statistics
# =============================================
# ดึงสถิติภาพรวมจากตาราง scam_logs ใน Supabase
# ตอบกลับตรงกับ DashboardStats interface

from fastapi import APIRouter, HTTPException
from database import get_supabase_client
from schemas import DashboardStats

router = APIRouter(tags=["Stats"])


@router.get("/stats", response_model=DashboardStats)
async def get_dashboard_stats():
    """
    ดึงสถิติภาพรวม Dashboard:
    - totalScanned    — จำนวนข้อความที่สแกนทั้งหมด
    - threatsDetected — จำนวนภัยคุกคามที่ตรวจพบ
    - riskRate        — อัตราความเสี่ยง (%)
    - activeUsers     — จำนวน Sender ที่ไม่ซ้ำกัน
    """
    try:
        client = get_supabase_client()

        # จำนวนแถวทั้งหมด (totalScanned)
        total_res = (
            client.table("scam_logs")
            .select("id", count="exact")
            .execute()
        )
        total_scanned: int = total_res.count or 0

        # จำนวนที่เป็นภัยคุกคาม (threatsDetected) — risk_level = high หรือ medium
        threat_res = (
            client.table("scam_logs")
            .select("id", count="exact")
            .in_("risk_level", ["high", "medium"])
            .execute()
        )
        threats_detected: int = threat_res.count or 0

        # risk rate (%)
        risk_rate: float = (
            round((threats_detected / total_scanned) * 100, 2)
            if total_scanned > 0
            else 0.0
        )

        # activeUsers — sender_id ที่ไม่ซ้ำกัน
        users_res = (
            client.table("scam_logs")
            .select("sender_id")
            .execute()
        )
        sender_ids = {row["sender_id"] for row in (users_res.data or []) if row.get("sender_id")}
        active_users: int = len(sender_ids)

        return DashboardStats(
            totalScanned=total_scanned,
            threatsDetected=threats_detected,
            riskRate=risk_rate,
            activeUsers=active_users,
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"เกิดข้อผิดพลาด: {str(e)}")
