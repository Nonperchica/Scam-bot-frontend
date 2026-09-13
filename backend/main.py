# =============================================
# Senior Guard — FastAPI Backend
# =============================================

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from routers import stats, threats, trends, line_groups, webhook
from database import get_supabase_client


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: ตรวจสอบการเชื่อมต่อ Supabase
    try:
        get_supabase_client()
        print("✅ Connected to Supabase successfully")
    except Exception as e:
        print(f"❌ Failed to connect to Supabase: {e}")
    yield
    # Shutdown
    print("🛑 Shutting down Senior Guard API")


app = FastAPI(
    title="Senior Guard API",
    description="Backend API สำหรับระบบตรวจจับสแกมในกลุ่ม LINE ผู้สูงอายุ",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS — อนุญาต Frontend (Vite default port)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(stats.router,       prefix="/api")
app.include_router(threats.router,     prefix="/api")
app.include_router(trends.router,      prefix="/api")
app.include_router(line_groups.router, prefix="/api")
app.include_router(webhook.router,     prefix="/api")


@app.get("/", tags=["Health"])
async def root():
    return {"status": "ok", "service": "Senior Guard API", "version": "1.0.0"}


@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "healthy"}
