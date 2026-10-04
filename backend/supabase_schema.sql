-- LEGACY DEMO SCHEMA: do not run for the live dashboard. See LIVE_DASHBOARD.md.
-- =============================================
-- Senior Guard — Supabase Schema (SKELETON)
-- ⚠️  โครงตาราง — ยังไม่ได้กำหนด column สุดท้าย
--     แก้ไข column ให้ตรงกับข้อมูลจริงก่อน deploy
-- =============================================

-- =============================================
-- ตาราง: scam_logs
-- เก็บข้อความที่บอทตรวจจับได้ในกลุ่ม LINE
-- TODO: เพิ่ม/ลบ column ตามโครงสร้างข้อมูลจริง
-- =============================================
CREATE TABLE IF NOT EXISTS public.scam_logs (
    -- Primary Key
    id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,

    -- ข้อความและผู้ส่ง
    message         TEXT        NOT NULL,
    sender_name     TEXT        NOT NULL DEFAULT '',
    sender_id       TEXT        NOT NULL DEFAULT '',  -- LINE user ID

    -- ผลการวิเคราะห์
    risk_level      TEXT        NOT NULL DEFAULT 'low'
                    CHECK (risk_level IN ('high', 'medium', 'low')),
    confidence      NUMERIC(5,2) NOT NULL DEFAULT 0
                    CHECK (confidence >= 0 AND confidence <= 100),
    category        TEXT        NOT NULL DEFAULT 'other',
    -- TODO: กำหนดค่า category ที่ใช้จริง เช่น phishing, investment_scam ฯลฯ

    -- การดำเนินการ
    status          TEXT        NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('blocked', 'flagged', 'reviewed', 'pending')),

    -- ข้อมูลกลุ่ม LINE (optional)
    line_group_name TEXT,       -- TODO: อาจเปลี่ยนเป็น FK → line_groups.id ภายหลัง

    -- Timestamp
    timestamp       TIMESTAMPTZ NOT NULL DEFAULT NOW()

    -- TODO: เพิ่ม column อื่นๆ ตามความต้องการ เช่น:
    -- raw_payload   JSONB,      -- ข้อมูล raw จาก LINE webhook
    -- reviewed_by   TEXT,       -- admin ที่ review
    -- reviewed_at   TIMESTAMPTZ
);

-- Index พื้นฐาน (ปรับได้ภายหลัง)
CREATE INDEX IF NOT EXISTS idx_scam_logs_timestamp  ON public.scam_logs (timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_scam_logs_risk_level ON public.scam_logs (risk_level);
CREATE INDEX IF NOT EXISTS idx_scam_logs_status     ON public.scam_logs (status);

-- =============================================
-- ตาราง: line_groups
-- กลุ่ม LINE ที่บอทเชื่อมต่ออยู่
-- TODO: เพิ่ม/ลบ column ตามโครงสร้างข้อมูลจริง
-- =============================================
CREATE TABLE IF NOT EXISTS public.line_groups (
    -- Primary Key (LINE Group ID จาก LINE API)
    id                TEXT PRIMARY KEY,

    -- ข้อมูลกลุ่ม
    name              TEXT        NOT NULL,
    member_count      INTEGER     NOT NULL DEFAULT 0,
    status            TEXT        NOT NULL DEFAULT 'active'
                      CHECK (status IN ('active', 'inactive')),
    joined_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- สถิติ (อาจคำนวณจาก scam_logs แทนการเก็บไว้ที่นี่)
    threats_detected  INTEGER     NOT NULL DEFAULT 0,
    messages_scanned  INTEGER     NOT NULL DEFAULT 0,

    -- รูปภาพกลุ่ม (optional)
    group_picture_url TEXT

    -- TODO: เพิ่ม column อื่นๆ ตามความต้องการ เช่น:
    -- description     TEXT,
    -- admin_line_id   TEXT        -- LINE user ID ของ admin กลุ่ม
);

CREATE INDEX IF NOT EXISTS idx_line_groups_status ON public.line_groups (status);

-- =============================================
-- Row Level Security (RLS)
-- =============================================
ALTER TABLE public.scam_logs   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.line_groups  ENABLE ROW LEVEL SECURITY;

-- Backend ใช้ service_role key → ผ่านได้ทุก operation
CREATE POLICY "service_role_all_scam_logs"
    ON public.scam_logs FOR ALL TO service_role
    USING (true) WITH CHECK (true);

CREATE POLICY "service_role_all_line_groups"
    ON public.line_groups FOR ALL TO service_role
    USING (true) WITH CHECK (true);

-- =============================================
-- TODO: ใส่ sample data จริงที่นี่ เมื่อโครงสร้างแน่นอนแล้ว
-- =============================================
-- INSERT INTO public.line_groups (...) VALUES (...);
-- INSERT INTO public.scam_logs (...) VALUES (...);
