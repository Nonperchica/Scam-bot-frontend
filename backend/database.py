# =============================================
# Senior Guard — Supabase Database Client
# =============================================

import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

_supabase_client: Client | None = None


def get_supabase_client() -> Client:
    """Singleton factory สำหรับ Supabase client"""
    global _supabase_client
    if _supabase_client is None:
        url: str = os.environ.get("SUPABASE_URL", "")
        key: str = os.environ.get("SUPABASE_SERVICE_KEY", "")
        if not url or not key:
            raise ValueError(
                "SUPABASE_URL และ SUPABASE_SERVICE_KEY ต้องตั้งค่าใน .env"
            )
        _supabase_client = create_client(url, key)
    return _supabase_client
