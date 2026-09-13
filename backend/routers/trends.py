# =============================================
# GET /api/trends — Trend Data for Chart
# =============================================
# ดึงข้อมูลแนวโน้ม 7 วันล่าสุด จากตาราง scam_logs
# ตอบกลับตรงกับ TrendDataPoint[] interface

from fastapi import APIRouter, HTTPException, Query
from database import get_supabase_client
from schemas import TrendDataPoint
from datetime import datetime, timedelta, timezone
from collections import defaultdict

router = APIRouter(tags=["Trends"])

THAI_MONTHS = {
    1: "ม.ค.", 2: "ก.พ.", 3: "มี.ค.", 4: "เม.ย.",
    5: "พ.ค.", 6: "มิ.ย.", 7: "ก.ค.", 8: "ส.ค.",
    9: "ก.ย.", 10: "ต.ค.", 11: "พ.ย.", 12: "ธ.ค.",
}


def _thai_date_label(dt: datetime) -> str:
    """แปลง datetime → '14 ส.ค.' รูปแบบเดียวกับ mock data"""
    return f"{dt.day} {THAI_MONTHS[dt.month]}"


@router.get("/trends", response_model=list[TrendDataPoint])
async def get_trend_data(
    days: int = Query(default=7, ge=1, le=30, description="จำนวนวันย้อนหลัง"),
):
    """
    ดึงข้อมูลแนวโน้มภัยคุกคามแต่ละวัน (7 วันล่าสุดโดย default)
    เรียงลำดับจากเก่าไปใหม่
    """
    try:
        client = get_supabase_client()

        tz_bkk = timezone(timedelta(hours=7))
        now = datetime.now(tz=tz_bkk)
        start_date = (now - timedelta(days=days - 1)).replace(
            hour=0, minute=0, second=0, microsecond=0
        )

        res = (
            client.table("scam_logs")
            .select("timestamp, risk_level")
            .gte("timestamp", start_date.isoformat())
            .execute()
        )
        rows = res.data or []

        # สะสมข้อมูลตามวัน
        daily_scanned: dict[str, int] = defaultdict(int)
        daily_threats: dict[str, int] = defaultdict(int)

        # สร้าง keys ทุกวันใน range ก่อน (เพื่อให้วันที่ไม่มีข้อมูลแสดง 0)
        date_labels: list[str] = []
        for i in range(days):
            d = start_date + timedelta(days=i)
            label = _thai_date_label(d)
            date_labels.append(label)
            daily_scanned[label] = 0
            daily_threats[label] = 0

        for row in rows:
            ts_str: str = row.get("timestamp", "")
            if not ts_str:
                continue
            try:
                # รองรับทั้ง +07:00 และ UTC (Z)
                ts = datetime.fromisoformat(ts_str.replace("Z", "+00:00"))
                ts_bkk = ts.astimezone(tz_bkk)
                label = _thai_date_label(ts_bkk)
                if label in daily_scanned:
                    daily_scanned[label] += 1
                    if row.get("risk_level") in ("high", "medium"):
                        daily_threats[label] += 1
            except ValueError:
                continue

        result = [
            TrendDataPoint(
                date=label,
                threats=daily_threats[label],
                scanned=daily_scanned[label],
            )
            for label in date_labels
        ]
        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"เกิดข้อผิดพลาด: {str(e)}")
