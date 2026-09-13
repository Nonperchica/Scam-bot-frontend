# =============================================
# GET /api/threats — Threat Log List
# =============================================
# ดึงรายการ Threat Logs จากตาราง scam_logs
# ตอบกลับตรงกับ ThreatLog[] interface

from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from database import get_supabase_client
from schemas import ThreatLog, ThreatListResponse, ThreatStatusUpdate

router = APIRouter(tags=["Threats"])


@router.get("/threats", response_model=ThreatListResponse)
async def get_threat_logs(
    limit: int = Query(default=50, ge=1, le=200, description="จำนวนแถวสูงสุด"),
    offset: int = Query(default=0, ge=0, description="เริ่มที่แถวที่เท่าไร"),
    risk_level: Optional[str] = Query(default=None, description="กรองตาม risk_level: high | medium | low"),
    status: Optional[str] = Query(default=None, description="กรองตาม status: blocked | flagged | reviewed | pending"),
):
    """
    ดึงรายการข้อความที่ถูกตรวจจับว่าเป็นสแกม
    เรียงลำดับจากใหม่ไปเก่า (timestamp DESC)
    """
    try:
        client = get_supabase_client()

        query = (
            client.table("scam_logs")
            .select(
                "id, message, sender_name, sender_id, "
                "risk_level, confidence, timestamp, status, "
                "category, line_group_name"
            )
            .order("timestamp", desc=True)
            .range(offset, offset + limit - 1)
        )

        if risk_level:
            query = query.eq("risk_level", risk_level)

        if status:
            query = query.eq("status", status)

        res = query.execute()
        rows = res.data or []
        
        # Get exact count for pagination
        count_query = client.table("scam_logs").select("id", count="exact")
        if risk_level:
            count_query = count_query.eq("risk_level", risk_level)
        if status:
            count_query = count_query.eq("status", status)
            
        count_res = count_query.execute()
        total_count = count_res.count or 0

        # แปลง snake_case → camelCase ผ่าน Pydantic alias
        threats_data = [
            ThreatLog(
                id=row["id"],
                message=row["message"],
                sender_name=row.get("sender_name", ""),
                sender_id=row.get("sender_id", ""),
                risk_level=row.get("risk_level", "low"),
                confidence=row.get("confidence", 0),
                timestamp=row.get("timestamp", ""),
                status=row.get("status", "pending"),
                category=row.get("category", "other"),
                line_group_name=row.get("line_group_name"),
            )
            for row in rows
        ]
        
        return ThreatListResponse(
            data=threats_data,
            total=total_count,
            limit=limit,
            offset=offset
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"เกิดข้อผิดพลาด: {str(e)}")


@router.get("/threats/{threat_id}", response_model=ThreatLog)
async def get_threat_detail(threat_id: str):
    """
    ดึงรายละเอียด Threat Log 1 รายการ
    """
    try:
        client = get_supabase_client()
        res = client.table("scam_logs").select("*").eq("id", threat_id).execute()
        
        if not res.data:
            raise HTTPException(status_code=404, detail="ไม่พบข้อมูล Threat Log นี้")
            
        row = res.data[0]
        return ThreatLog(
            id=row["id"],
            message=row["message"],
            sender_name=row.get("sender_name", ""),
            sender_id=row.get("sender_id", ""),
            risk_level=row.get("risk_level", "low"),
            confidence=row.get("confidence", 0),
            timestamp=row.get("timestamp", ""),
            status=row.get("status", "pending"),
            category=row.get("category", "other"),
            line_group_name=row.get("line_group_name"),
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"เกิดข้อผิดพลาด: {str(e)}")


@router.patch("/threats/{threat_id}/status")
async def update_threat_status(threat_id: str, payload: ThreatStatusUpdate):
    """
    อัปเดตสถานะของ Threat Log (เช่น เปลี่ยนเป็น reviewed, blocked)
    """
    try:
        client = get_supabase_client()
        
        res = client.table("scam_logs").update({"status": payload.status}).eq("id", threat_id).execute()
        
        if not res.data:
            # If update didn't affect any rows, it probably doesn't exist
            raise HTTPException(status_code=404, detail="ไม่พบข้อมูล Threat Log นี้ หรืออัปเดตไม่สำเร็จ")
            
        return {"status": "success", "message": f"Updated status to {payload.status}"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"เกิดข้อผิดพลาด: {str(e)}")
