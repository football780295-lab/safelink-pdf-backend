from typing import List
from fastapi import APIRouter, UploadFile, File, Request, HTTPException
from backend.app.core.limiter import limiter
from backend.app.utils.validators import validate_pdf_file, validate_pdf_safety, sanitize_filename
from backend.app.utils.file_utils import create_session_dir, register_download_file, encode_file_data_uri
from backend.app.services.merge_service import merge_pdfs

router = APIRouter(prefix="/api/merge", tags=["Merge PDF"])

@router.post("")
@limiter.limit("20/minute")
async def handle_merge_pdfs(
    request: Request,
    files: List[UploadFile] = File(...)
):
    if len(files) < 2:
        raise HTTPException(
            status_code=400,
            detail="Please provide at least 2 PDF files to merge."
        )

    session_id, session_dir = create_session_dir()
    saved_paths = []

    for idx, f in enumerate(files):
        content = await validate_pdf_file(f)
        safe_name = sanitize_filename(f.filename or f"document_{idx + 1}.pdf")
        target_path = session_dir / f"{idx:03d}_{safe_name}"
        with open(target_path, "wb") as out_f:
            out_f.write(content)
        validate_pdf_safety(target_path)
        saved_paths.append(target_path)

    output_filename = "merged_document.pdf"
    output_path = session_dir / output_filename
    
    stats = merge_pdfs(saved_paths, output_path)
    download_id = register_download_file(output_path, output_filename, "application/pdf")
    file_data = encode_file_data_uri(output_path, "application/pdf")

    return {
        "download_id": download_id,
        "file_data": file_data,
        "filename": output_filename,
        "file_count": stats["file_count"],
        "total_pages": stats["total_pages"],
        "output_size": stats["output_size"]
    }
