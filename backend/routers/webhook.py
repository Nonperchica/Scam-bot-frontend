# =============================================
# POST /api/webhook/scam-result — AI Bot Webhook
# =============================================
# รับข้อมูลผลการวิเคราะห์จาก AI Bot

import os
from fastapi import APIRouter, HTTPException, Security, Depends
from fastapi.security.api_key import APIKeyHeader
from database import get_supabase_client
from schemas import WebhookPayload

router = APIRouter(tags=["Webhook"])

API_KEY_NAME = "X-API-Key"
api_key_header = APIKeyHeader(name=API_KEY_NAME, auto_error=False)

def get_api_key(api_key_header: str = Security(api_key_header)):
    webhook_secret = os.environ.get("WEBHOOK_SECRET")
    if not webhook_secret:
        # ถ้าไม่ได้ตั้ง secret ใน .env ให้เตือน (หรือจะยอมให้ผ่านตอน dev ก็ได้)
        print("⚠️ WEBHOOK_SECRET is not set in environment variables!")
        raise HTTPException(status_code=500, detail="Server configuration error")
    
    if api_key_header == webhook_secret:
        return api_key_header
    else:
        raise HTTPException(status_code=403, detail="Could not validate API KEY")


@router.post("/webhook/scam-result", status_code=201)
async def receive_scam_result(
    payload: WebhookPayload, 
    api_key: str = Depends(get_api_key)
):
    """
    รับข้อมูลจาก AI Bot เมื่อเจอข้อความต้องสงสัย
    """
    try:
        client = get_supabase_client()
        
        # Insert data into Supabase
        data_to_insert = {
            "message": payload.message,
            "sender_name": payload.sender_name,
            "sender_id": payload.sender_id,
            "risk_level": payload.risk_level,
            "confidence": payload.confidence,
            "category": payload.category,
            "status": "pending", # ค่าเริ่มต้นรอคนมาตรวจ
            "line_group_name": payload.line_group_name,
        }
        
        res = client.table("scam_logs").insert(data_to_insert).execute()
        
        return {"status": "success", "message": "Scam log recorded"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"เกิดข้อผิดพลาด: {str(e)}")
