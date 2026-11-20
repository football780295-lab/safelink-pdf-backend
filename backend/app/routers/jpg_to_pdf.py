from typing import List
from fastapi import APIRouter, UploadFile, File, Form, Request, HTTPException
from backend.app.core.limiter import limiter
from backend.app.utils.validators import validate_image_file, sanitize_filename
from backend.app.utils.file_utils import create_session_dir, register_download_file, encode_file_data_uri
from backend.app.services.conversion_service import images_to_pdf

router = APIRouter(prefix="/api/jpg-to-pdf", tags=["JPG to PDF"])

@router.post("")
@limiter.limit("20/minute")
async def handle_jpg_to_pdf(
    request: Request,
    files: List[UploadFile] = File(...),
    page_size: str = Form("a4"),          # "a4" or "fit"
    orientation: str = Form("portrait")   # "portrait" or "landscape"
):
    if not files:
        raise HTTPException(status_code=400, detail="Please upload at least one image.")

    if page_size not in ("a4", "fit"):
        raise HTTPException(status_code=400, detail="Page size must be 'a4' or 'fit'.")

    if orientation not in ("portrait", "landscape"):
        raise HTTPException(status_code=400, detail="Orientation must be 'portrait' or 'landscape'.")

    session_id, session_dir = create_session_dir()
    saved_images = []

    for idx, f in enumerate(files):
        content = await validate_image_file(f)
        safe_name = sanitize_filename(f.filename or f"image_{idx + 1}.jpg")
        img_path = session_dir / f"{idx:03d}_{safe_name}"
        with open(img_path, "wb") as out_f:
            out_f.write(content)
        saved_images.append(img_path)

    output_filename = "converted_document.pdf"
    output_path = session_dir / output_filename

    stats = images_to_pdf(
        image_paths=saved_images,
        output_path=output_path,
        page_size=page_size,
        orientation=orientation
    )

    download_id = register_download_file(output_path, output_filename, "application/pdf")
    file_data = encode_file_data_uri(output_path, "application/pdf")
    return {
        "download_id": download_id,
        "file_data": file_data,
        "filename": output_filename,
        "page_count": stats["page_count"],
        "file_size": stats["file_size"],
        "page_size": page_size,
        "orientation": orientation
    }
