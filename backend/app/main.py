import asyncio
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi.errors import RateLimitExceeded
from slowapi import _rate_limit_exceeded_handler

from backend.app.core.limiter import limiter
from backend.app.core.config import GHOSTSCRIPT_BIN, MAX_FILE_SIZE_MB, FILE_TTL_MINUTES
from backend.app.core.security_logger import setup_secure_logging
from backend.app.services.cleaner import start_periodic_cleanup, purge_expired_files
from backend.app.routers import (
    compress,
    merge,
    split,
    jpg_to_pdf,
    pdf_to_jpg,
    protect,
    unlock,
    files,
)

logger = setup_secure_logging()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: purge expired files & launch background worker
    logger.info("Initializing PDF Tools application...")
    logger.info(f"Ghostscript binary: {GHOSTSCRIPT_BIN or 'Not found (using high-performance fallback)'}")
    logger.info(f"Max upload limit: {MAX_FILE_SIZE_MB}MB, TTL: {FILE_TTL_MINUTES} mins")
    
    purge_expired_files()
    cleanup_task = asyncio.create_task(start_periodic_cleanup())
    
    yield
    
    # Shutdown
    cleanup_task.cancel()
    try:
        await cleanup_task
    except asyncio.CancelledError:
        pass
    logger.info("Shutting down PDF Tools application.")

app = FastAPI(
    title="PDF Tools API",
    description="Production-ready PDF processing backend with privacy and rate-limiting",
    version="1.0.0",
    lifespan=lifespan
)

# Attach rate limiter
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Production config can be tightened with ALLOWED_ORIGINS env
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register tool routers
app.include_router(compress.router)
app.include_router(merge.router)
app.include_router(split.router)
app.include_router(jpg_to_pdf.router)
app.include_router(pdf_to_jpg.router)
app.include_router(protect.router)
app.include_router(unlock.router)
app.include_router(files.router)

@app.get("/api/health", tags=["Health"])
async def health_check():
    return {
        "status": "healthy",
        "service": "PDF Tools API",
        "ghostscript_available": bool(GHOSTSCRIPT_BIN),
        "max_file_size_mb": MAX_FILE_SIZE_MB,
        "file_ttl_minutes": FILE_TTL_MINUTES
    }
