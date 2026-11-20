from fastapi import APIRouter, UploadFile, File, Form, Request
from backend.app.core.limiter import limiter
from backend.app.core.concurrency import acquire_job_slot
from backend.app.utils.validators import validate_pdf_file, validate_pdf_safety, sanitize_filename
from backend.app.utils.file_utils import create_session_dir, register_download_file, encode_file_data_uri
from backend.app.services.conversion_service import pdf_to_images

router = APIRouter(prefix="/api/pdf-to-jpg", tags=["PDF to JPG"])

@router.post("")
@limiter.limit("20/minute")
async def handle_pdf_to_jpg(
    request: Request,
    file: UploadFile = File(...),
    dpi: int = Form(150),
    quality: int = Form(90)
):
    if dpi not in (72, 150, 300):
        dpi = 150

    quality = max(50, min(quality, 100))

    content = await validate_pdf_file(file)
    safe_name = sanitize_filename(file.filename or "document.pdf")

    session_id, session_dir = create_session_dir()
    input_path = session_dir / safe_name

    with open(input_path, "wb") as f:
        f.write(content)

    validate_pdf_safety(input_path)

    async with acquire_job_slot():
        zip_path, zip_filename, total_pages, image_names = pdf_to_images(
            pdf_path=input_path,
            output_dir=session_dir,
            dpi=dpi,
            quality=quality
        )

    download_id = register_download_file(zip_path, zip_filename, "application/zip")
    zip_size = zip_path.stat().st_size
    file_data = encode_file_data_uri(zip_path, "application/zip")

    # Inline individual images only when total payload stays comfortably under serverless limits (~2.8MB binary)
    remaining_b64_budget = max(0, (2_800_000 - zip_size)) if file_data else 0

    individual_images = []
    for idx, img_name in enumerate(image_names):
        img_path = session_dir / img_name
        img_dl_id = register_download_file(img_path, img_name, "image/jpeg")
        img_data = None
        img_size = img_path.stat().st_size if img_path.exists() else 0
        if img_size > 0 and img_size <= remaining_b64_budget:
            img_data = encode_file_data_uri(img_path, "image/jpeg", max_bytes=remaining_b64_budget)
            if img_data:
                remaining_b64_budget -= img_size

        individual_images.append({
            "page": idx + 1,
            "download_id": img_dl_id,
            "file_data": img_data,
            "filename": img_name
        })

    return {
        "download_id": download_id,
        "file_data": file_data,
        "filename": zip_filename,
        "total_pages": total_pages,
        "image_count": len(image_names),
        "dpi": dpi,
        "file_size": zip_size,
        "images": individual_images
    }
