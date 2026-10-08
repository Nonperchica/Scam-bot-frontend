"""Dataset reads and reviewed insertions; credentials stay on the server."""
import math
import hashlib
import json
import os
from pathlib import Path
from typing import Literal
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field, field_validator
from dotenv import dotenv_values

from database import get_supabase_client
from live_data import read_all, sources_and_logs
from routers.dashboard import authorize

router = APIRouter(dependencies=[Depends(authorize)], tags=["Dataset"])


class Review(BaseModel):
    message: str = Field(min_length=1, max_length=5000)
    label: Literal["spam", "ham"] | None = None
    confirmMatch: str | None = Field(default=None, max_length=64)

    @field_validator("message")
    @classmethod
    def trim_message(cls, value):
        value = value.strip()
        if not value:
            raise ValueError("Empty message")
        return value


def entry(row):
    return {"id": str(row["id"]), "message": row["thai_text"],
            "label": row["label"], "category": "ยังไม่ระบุ",
            "source": "ยังไม่ระบุ", "confirmed": True}


@router.get("/dataset")
def dataset_entries():
    try:
        return [entry(row) for row in read_all("scam_dataset", "id,thai_text,label")]
    except Exception:
        raise HTTPException(503, "อ่าน scam_dataset ไม่สำเร็จ") from None


@router.get("/dataset/history")
def approval_history(page: int = Query(1, ge=1), label: Literal["spam", "ham"] | None = None):
    try:
        query = get_supabase_client().table("dataset_reviews").select(
            "id,candidate_id,reviewed_at,scam_dataset!dataset_id!inner(id,thai_text,label)", count="exact"
        ).eq("status", "saved")
        if label:
            query = query.eq("scam_dataset.label", label)
        response = query.order("reviewed_at", desc=True).order("id").range((page - 1) * 25, page * 25 - 1).execute()
        return {"items": [{**entry(row["scam_dataset"]), "reviewId": row["id"],
                           "approvedAt": row["reviewed_at"]} for row in response.data or []],
                "total": response.count or 0, "pageSize": 25}
    except Exception:
        raise HTTPException(503, "อ่านประวัติการอนุมัติไม่สำเร็จ") from None


def candidates():
    _, logs = sources_and_logs()
    reviewed = {str(row["candidate_id"]) for row in read_all("dataset_reviews")}
    pending = []
    for row in sorted(logs, key=lambda item: (item.get("received_at") or "", str(item["id"])), reverse=True):
        status = row.get("detection_status")
        if str(row["id"]) in reviewed or status not in {"risk_found", "uncertain"}:
            continue
        text = (row.get("message_text") or "").strip()
        if not text:
            continue
        pending.append({"id": str(row["id"]), "message": text, "label": None,
                        "reason": "ระบบไม่แน่ใจ" if status == "uncertain" else "พบความเสี่ยง รอแอดมินตรวจ",
                        "similarity": row.get("similarity_percent"), "analysis": row.get("reason") or "ยังไม่ระบุ",
                        "source": "LINE", "category": "ยังไม่ระบุ", "occurrences": 1})
    return pending


@router.get("/dataset/candidates")
def dataset_candidates():
    try:
        return candidates()
    except Exception:
        raise HTTPException(503, "อ่านคิวไม่สำเร็จ กรุณาติดตั้ง dataset_review.sql ใน Supabase") from None


def embedding(text):
    key = os.getenv("GEMINI_API_KEY")
    if not key:
        # ใช้คีย์บอตเฉพาะการรันในเครื่องนี้ ไม่คัดลอก secret ลงไฟล์หรือส่งไป browser
        bot_env = Path(__file__).resolve().parents[3] / "scam-bot-backend" / "scam-bot-backend" / ".env"
        key = dotenv_values(bot_env).get("GEMINI_API_KEY")
    if not key:
        raise HTTPException(503, "ต้องตั้ง GEMINI_API_KEY ใน backend/.env")
    from google import genai
    from google.genai import types
    with genai.Client(api_key=key, http_options=types.HttpOptions(
        timeout=30000, retry_options=types.HttpRetryOptions(attempts=1),
    )) as client:
        result = client.models.embed_content(model="gemini-embedding-001", contents=text,
            config=types.EmbedContentConfig(task_type="retrieval_document", output_dimensionality=768))
    values = result.embeddings[0].values
    if len(values) != 768 or not all(math.isfinite(value) for value in values):
        raise ValueError("Invalid embedding")
    return values


def review(candidate_id, body, action):
    try:
        db = get_supabase_client()
        # ตรวจสถานะก่อนเรียก Gemini; retry ของรายการเดิมไม่สร้าง embedding ซ้ำ
        previous = db.table("dataset_reviews").select("status,dataset_id").eq("candidate_id", str(candidate_id)).execute().data
        if previous:
            record = previous[0]
            if record["status"] != action:
                raise HTTPException(409, "รายการนี้ถูกตรวจไปแล้ว กรุณาโหลดใหม่")
            if action == "skipped":
                return {"status": "skipped"}
            saved = db.table("scam_dataset").select("id,thai_text,label").eq("id", record["dataset_id"]).single().execute().data
            return {"status": "saved", "entry": entry(saved)}
        if not any(row["id"] == str(candidate_id) for row in candidates()):
            raise HTTPException(404, "ไม่พบรายการรอพิจารณา")
        if action == "saved" and body.label is None:
            raise HTTPException(422, "ต้องเลือก spam หรือ ham")
        vector = embedding(body.message) if action == "saved" else None
        if action == "saved":
            matches = db.rpc("match_scam", {"query_embedding": vector,
                "match_threshold": 0, "match_count": 1}).execute().data
            if not isinstance(matches, list):
                raise ValueError("Invalid similarity response")
            if matches:
                match = matches[0]
                score = match.get("similarity")
                if type(score) not in (int, float) or not math.isfinite(score):
                    raise ValueError("Invalid similarity")
                if not isinstance(match.get("thai_text"), str) or match.get("label") not in {"spam", "ham"}:
                    raise ValueError("Invalid match")
                confirmation = hashlib.sha256(json.dumps([body.message, body.label,
                    match["thai_text"], match["label"]], ensure_ascii=False).encode()).hexdigest()
                if body.confirmMatch != confirmation:
                    return {"status": "review_required", "confirmation": confirmation,
                            "match": {"message": match["thai_text"], "label": match["label"],
                                      "similarity": round(score * 100, 2)}}
        result = db.rpc("review_dataset_candidate", {
            "p_candidate_id": str(candidate_id), "p_action": action,
            "p_message": body.message, "p_label": body.label, "p_embedding": vector,
        }).execute().data
        return result
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(503, "บันทึกไม่สำเร็จ ตรวจ SQL, Gemini และสิทธิ์ Supabase แล้วโหลดสถานะก่อนลองใหม่") from None


@router.post("/dataset/candidates/{candidate_id}/approve")
def approve(candidate_id: UUID, body: Review):
    return review(candidate_id, body, "saved")


@router.post("/dataset/candidates/{candidate_id}/skip")
def skip(candidate_id: UUID, body: Review):
    return review(candidate_id, body, "skipped")
