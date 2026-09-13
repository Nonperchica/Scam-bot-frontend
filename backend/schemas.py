# =============================================
# Senior Guard — Pydantic Schemas (ตรงกับ TypeScript types)
# =============================================

from pydantic import BaseModel, Field
from typing import Optional, Literal


# --------------- ThreatLog ---------------
# ตรงกับ interface ThreatLog ใน src/types/index.ts

class ThreatLog(BaseModel):
    id: str
    message: str
    senderName: str = Field(alias="sender_name")
    senderId: str = Field(alias="sender_id")
    riskLevel: Literal["high", "medium", "low"] = Field(alias="risk_level")
    confidence: float          # 0-100
    timestamp: str             # ISO 8601
    status: Literal["blocked", "flagged", "reviewed", "pending"]
    category: str
    lineGroupName: Optional[str] = Field(default=None, alias="line_group_name")

    model_config = {"populate_by_name": True}


class ThreatListResponse(BaseModel):
    data: list[ThreatLog]
    total: int
    limit: int
    offset: int


class ThreatStatusUpdate(BaseModel):
    status: Literal["blocked", "flagged", "reviewed", "pending"]


# --------------- WebhookPayload ---------------
# โครงสร้างข้อมูลที่รับจาก AI Bot

class WebhookPayload(BaseModel):
    message: str
    sender_name: str
    sender_id: str
    risk_level: Literal["high", "medium", "low"]
    confidence: float
    category: str
    line_group_name: Optional[str] = None


# --------------- DashboardStats ---------------
# ตรงกับ interface DashboardStats ใน src/types/index.ts

class DashboardStats(BaseModel):
    totalScanned: int
    threatsDetected: int
    riskRate: float      # เปอร์เซ็นต์ (คำนวณจาก threatsDetected / totalScanned * 100)
    activeUsers: int


# --------------- TrendDataPoint ---------------
# ตรงกับ interface TrendDataPoint ใน src/types/index.ts

class TrendDataPoint(BaseModel):
    date: str
    threats: int
    scanned: int


# --------------- LineGroup ---------------
# ตรงกับ interface LineGroup ใน src/types/index.ts

class LineGroup(BaseModel):
    id: str
    name: str
    memberCount: int = Field(alias="member_count")
    threatsDetected: int = Field(alias="threats_detected")
    messagesScanned: int = Field(alias="messages_scanned")
    status: Literal["active", "inactive"]
    joinedAt: str = Field(alias="joined_at")   # ISO 8601
    groupPictureUrl: Optional[str] = Field(default=None, alias="group_picture_url")

    model_config = {"populate_by_name": True}
