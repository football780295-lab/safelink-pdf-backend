import os
from pathlib import Path
from fastapi import APIRouter, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse
from backend.app.utils.file_utils import get_registered_file, cleanup_download_file

router = APIRouter(prefix="/api/files", tags=["Files"])

@router.get("/download/{download_id}")
async def download_file(
    download_id: str,
    background_tasks: BackgroundTasks,
    delete_after: bool = True
):
    record = get_registered_file(download_id)
    if not record:
        raise HTTPException(
            status_code=404,
            detail="Download link expired or invalid. Please process your file again."
        )

    file_path: Path = record["file_path"]
    filename: str = record["filename"]
    mime_type: str = record["mime_type"]

    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Requested file not found on server.")

    # Schedule immediate cleanup if delete_after is set
    if delete_after:
        background_tasks.add_task(cleanup_download_file, download_id, True)

    return FileResponse(
        path=file_path,
        filename=filename,
        media_type=mime_type,
        headers={
            "Cache-Control": "no-store, no-cache, must-revalidate",
            "Content-Disposition": f'attachment; filename="{filename}"'
        }
    )

@router.delete("/cleanup/{download_id}")
async def trigger_cleanup(download_id: str):
    cleanup_download_file(download_id, delete_parent_dir=True)
    return {"status": "cleaned"}
