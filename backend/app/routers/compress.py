from fastapi import APIRouter, UploadFile, File, Form, Request, HTTPException
from backend.app.core.limiter import limiter
from backend.app.core.concurrency import acquire_job_slot
from backend.app.utils.validators import validate_pdf_file, validate_pdf_safety, sanitize_filename
from backend.app.utils.file_utils import create_session_dir, register_download_file, encode_file_data_uri
from backend.app.services.compression_service import compress_pdf

router = APIRouter(prefix="/api/compress", tags=["Compress PDF"])

@router.post("")
@limiter.limit("30/minute")
async def handle_compress_pdf(
    request: Request,
    file: UploadFile = File(...),
    level: str = Form("recommended")
):
    if level not in ("low", "recommended", "extreme"):
        raise HTTPException(
            status_code=400,
            detail="Invalid compression level. Must be 'low', 'recommended', or 'extreme'."
        )

    content = await validate_pdf_file(file)
    safe_name = sanitize_filename(file.filename or "document.pdf")
    base_name = safe_name.rsplit(".", 1)[0]
    
    session_id, session_dir = create_session_dir()
    input_path = session_dir / safe_name
    output_filename = f"{base_name}_compressed.pdf"
    output_path = session_dir / output_filename
    
    with open(input_path, "wb") as f:
        f.write(content)
        
    validate_pdf_safety(input_path)

    async with acquire_job_slot():
        stats = compress_pdf(input_path, output_path, level=level)

    download_id = register_download_file(output_path, output_filename, "application/pdf")
    file_data = encode_file_data_uri(output_path, "application/pdf")
    
    return {
        "download_id": download_id,
        "file_data": file_data,
        "filename": output_filename,
        "original_size": stats["original_size"],
        "new_size": stats["new_size"],
        "percent_saved": stats["percent_saved"],
        "level": stats["level"],
        "method": stats["method"]
    }
