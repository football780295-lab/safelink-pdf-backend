import time
import shutil
import asyncio
import logging
from pathlib import Path
from backend.app.core.config import TEMP_DIR, FILE_TTL_MINUTES, CLEANUP_INTERVAL_SECONDS
from backend.app.utils.file_utils import FILE_REGISTRY

logger = logging.getLogger(__name__)

def purge_expired_files() -> int:
    """Scan the temp directory and remove files/folders older than FILE_TTL_MINUTES."""
    now = time.time()
    ttl_seconds = FILE_TTL_MINUTES * 60
    purged_count = 0
    
    # 1. Clean directory tree
    try:
        if TEMP_DIR.exists():
            for item in TEMP_DIR.iterdir():
                try:
                    stat = item.stat()
                    age = now - stat.st_mtime
                    if age > ttl_seconds:
                        if item.is_dir():
                            shutil.rmtree(item, ignore_errors=True)
                        else:
                            item.unlink(missing_ok=True)
                        purged_count += 1
                except Exception:
                    pass
    except Exception as e:
        logger.error(f"Error during directory cleanup: {e}")

    # 2. Clean FILE_REGISTRY
    expired_ids = []
    for download_id, data in list(FILE_REGISTRY.items()):
        file_path: Path = data.get("file_path")
        created_at = data.get("created_at", 0)
        if not file_path or not file_path.exists() or (now - created_at > ttl_seconds):
            expired_ids.append(download_id)

    for download_id in expired_ids:
        FILE_REGISTRY.pop(download_id, None)

    return purged_count

async def start_periodic_cleanup():
    """Async loop that periodically purges old temporary files."""
    while True:
        try:
            purge_expired_files()
        except Exception as e:
            logger.error(f"Cleanup task encountered an exception: {e}")
        await asyncio.sleep(CLEANUP_INTERVAL_SECONDS)
