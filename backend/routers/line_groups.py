# =============================================
# GET /api/line-groups — LINE Group List
# =============================================
# ดึงรายชื่อกลุ่ม LINE จากตาราง line_groups ใน Supabase
# ตอบกลับตรงกับ LineGroup[] interface

from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from database import get_supabase_client
from schemas import LineGroup

router = APIRouter(tags=["LINE Groups"])


@router.get("/line-groups", response_model=list[LineGroup])
async def get_line_groups(
    status: Optional[str] = Query(
        default=None, description="กรองตาม status: active | inactive"
    ),
):
    """
    ดึงรายชื่อกลุ่ม LINE ที่บอทเชื่อมต่ออยู่
    เรียงลำดับตามจำนวนสมาชิก (มากไปน้อย)
    """
    try:
        client = get_supabase_client()

        query = (
            client.table("line_groups")
            .select(
                "id, name, member_count, threats_detected, "
                "messages_scanned, status, joined_at, group_picture_url"
            )
            .order("member_count", desc=True)
        )

        if status:
            query = query.eq("status", status)

        res = query.execute()
        rows = res.data or []

        return [
            LineGroup(
                id=row["id"],
                name=row["name"],
                member_count=row.get("member_count", 0),
                threats_detected=row.get("threats_detected", 0),
                messages_scanned=row.get("messages_scanned", 0),
                status=row.get("status", "inactive"),
                joined_at=row.get("joined_at", ""),
                group_picture_url=row.get("group_picture_url"),
            )
            for row in rows
        ]

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"เกิดข้อผิดพลาด: {str(e)}")
