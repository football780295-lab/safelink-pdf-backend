import asyncio
import os
from contextlib import asynccontextmanager
from fastapi import HTTPException

# For a 2GB RAM VPS, limit concurrent heavy PDF jobs (Ghostscript / PyMuPDF) to 2
MAX_CONCURRENT_HEAVY_JOBS = int(os.getenv("MAX_CONCURRENT_HEAVY_JOBS", "2"))
JOB_TIMEOUT_SECONDS = int(os.getenv("JOB_TIMEOUT_SECONDS", "60"))

heavy_job_semaphore = asyncio.Semaphore(MAX_CONCURRENT_HEAVY_JOBS)

@asynccontextmanager
async def acquire_job_slot(timeout: float = 30.0):
    """
    Acquire an execution slot with concurrency control.
    Prevents Out-Of-Memory (OOM) crashes on low-resource VPS hosts.
    """
    try:
        acquired = await asyncio.wait_for(heavy_job_semaphore.acquire(), timeout=timeout)
    except asyncio.TimeoutError:
        raise HTTPException(
            status_code=503,
            detail="Server is currently busy processing other PDF requests. Please try again in a few moments."
        )

    try:
        yield
    finally:
        heavy_job_semaphore.release()
