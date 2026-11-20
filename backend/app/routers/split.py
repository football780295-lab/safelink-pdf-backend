from typing import Optional
from fastapi import APIRouter, UploadFile, File, Form, Request, HTTPException
from backend.app.core.limiter import limiter
from backend.app.core.concurrency import acquire_job_slot
from backend.app.utils.validators import validate_pdf_file, validate_pdf_safety, sanitize_filename, parse_page_ranges
from backend.app.utils.file_utils import create_session_dir, register_download_file, encode_file_data_uri
from backend.app.services.split_service import generate_pdf_preview, split_pdf

router = APIRouter(prefix="/api/split", tags=["Split PDF"])

@router.post("/preview")
@limiter.limit("30/minute")
async def preview_pdf_pages(
    request: Request,
    file: UploadFile = File(...)
):
    content = await validate_pdf_file(file)
    safe_name = sanitize_filename(file.filename or "document.pdf")
    session_id, session_dir = create_session_dir()
    input_path = session_dir / safe_name

    with open(input_path, "wb") as f:
        f.write(content)

    validate_pdf_safety(input_path)

    async with acquire_job_slot():
        preview_data = generate_pdf_preview(input_path)

    return {
        "session_id": session_id,
        "filename": safe_name,
        "total_pages": preview_data["total_pages"],
        "thumbnails": preview_data["thumbnails"]
    }

@router.post("")
@limiter.limit("30/minute")
async def handle_split_pdf(
    request: Request,
    file: Optional[UploadFile] = File(None),
    session_id: Optional[str] = Form(None),
    filename: Optional[str] = Form(None),
    pages: Optional[str] = Form(None),      # e.g. "1-3, 5, 8-10" or "1,2,3"
    mode: str = Form("single")             # "single" or "zip"
):
    if mode not in ("single", "zip"):
        raise HTTPException(status_code=400, detail="Split mode must be either 'single' or 'zip'.")

    # Locate or save file
    from backend.app.core.config import TEMP_DIR
    if file:
        content = await validate_pdf_file(file)
        safe_name = sanitize_filename(file.filename or "document.pdf")
        sess_id, session_dir = create_session_dir()
        input_path = session_dir / safe_name
        with open(input_path, "wb") as f:
            f.write(content)
        validate_pdf_safety(input_path)
    elif session_id and filename:
        safe_name = sanitize_filename(filename)
        session_dir = TEMP_DIR / session_id
        input_path = session_dir / safe_name
        if not input_path.exists():
            raise HTTPException(status_code=404, detail="File session expired. Please re-upload your PDF.")
        validate_pdf_safety(input_path)
    else:
        raise HTTPException(status_code=400, detail="Please upload a PDF file.")

    # Inspect total pages
    import pymupdf as fitz
    try:
        doc = fitz.open(input_path)
        total_pages = len(doc)
        doc.close()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Cannot inspect PDF: {str(e)}")

    selected_pages_0_indexed = parse_page_ranges(pages or "", total_pages)
    base_name = safe_name.rsplit(".", 1)[0]
    
    async with acquire_job_slot():
        out_path, out_filename, mime_type = split_pdf(
            input_path=input_path,
            selected_pages=selected_pages_0_indexed,
            mode=mode,
            output_dir=session_dir,
            base_filename=base_name
        )

    download_id = register_download_file(out_path, out_filename, mime_type)
    file_data = encode_file_data_uri(out_path, mime_type)
    return {
        "download_id": download_id,
        "file_data": file_data,
        "filename": out_filename,
        "selected_pages_count": len(selected_pages_0_indexed),
        "total_pages": total_pages,
        "mode": mode,
        "file_size": out_path.stat().st_size
    }
