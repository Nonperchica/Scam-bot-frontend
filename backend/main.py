# =============================================
# Senior Guard — FastAPI Backend
# =============================================

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from routers import dashboard, dataset
from database import get_supabase_client


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: ตรวจสอบการเชื่อมต่อ Supabase
    try:
        get_supabase_client()
        print("Supabase client configured (connection checked on first query)")
    except Exception:
        print("Supabase configuration is missing or invalid")
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
app.include_router(dashboard.router, prefix="/api")
app.include_router(dataset.router, prefix="/api")


@app.get("/", tags=["Health"])
async def root():
    return {"status": "ok", "service": "Senior Guard API", "version": "1.0.0"}


@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "healthy"}
