import os
import uuid
import shutil
import base64
from pathlib import Path
from typing import Dict, Any, Optional, Tuple
from fastapi import HTTPException
from backend.app.core.config import TEMP_DIR
from backend.app.utils.validators import sanitize_filename

# Max binary file size to inline as a base64 data URI (3MB -> ~4MB base64, safely under Vercel's 4.5MB limit)
MAX_INLINE_B64_BYTES = 3 * 1024 * 1024

# Metadata store for generated files ready for download:
# session_id -> { "file_path": Path, "filename": str, "mime_type": str, "created_at": float }
FILE_REGISTRY: Dict[str, Dict[str, Any]] = {}

def encode_file_data_uri(
    file_path: Path,
    mime_type: str = "application/pdf",
    max_bytes: int = MAX_INLINE_B64_BYTES,
) -> Optional[str]:
    """Return a base64 data URI for files within max_bytes so stateless serverless downloads never 404."""
    try:
        if file_path.exists() and file_path.stat().st_size <= max_bytes:
            encoded = base64.b64encode(file_path.read_bytes()).decode("ascii")
            return f"data:{mime_type};base64,{encoded}"
    except Exception:
        pass
    return None

def create_session_dir() -> Tuple[str, Path]:
    session_id = str(uuid.uuid4())
    session_dir = TEMP_DIR / session_id
    session_dir.mkdir(parents=True, exist_ok=True)
    return session_id, session_dir

def register_download_file(file_path: Path, download_filename: str, mime_type: str = "application/pdf") -> str:
    """Register an output file for download and return a secure download token/ID."""
    download_id = str(uuid.uuid4())
    FILE_REGISTRY[download_id] = {
        "file_path": file_path,
        "filename": sanitize_filename(download_filename),
        "mime_type": mime_type,
        "created_at": file_path.stat().st_mtime if file_path.exists() else 0
    }
    return download_id

def get_registered_file(download_id: str) -> Optional[Dict[str, Any]]:
    record = FILE_REGISTRY.get(download_id)
    if not record:
        return None
    file_path: Path = record["file_path"]
    if not file_path.exists():
        FILE_REGISTRY.pop(download_id, None)
        return None
    return record

def cleanup_download_file(download_id: str, delete_parent_dir: bool = True):
    """Remove a file and optionally its parent session directory when all its files are cleaned."""
    record = FILE_REGISTRY.pop(download_id, None)
    if record:
        file_path: Path = record["file_path"]
        try:
            if file_path.exists():
                file_path.unlink(missing_ok=True)
            if delete_parent_dir and file_path.parent != TEMP_DIR and file_path.parent.exists():
                # Only remove parent directory if no other registered download files exist in it
                other_registered = any(
                    rec["file_path"].parent == file_path.parent
                    for rec in FILE_REGISTRY.values()
                )
                if not other_registered:
                    shutil.rmtree(file_path.parent, ignore_errors=True)
        except Exception:
            pass
