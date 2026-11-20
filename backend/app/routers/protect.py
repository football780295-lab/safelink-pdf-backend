from fastapi import APIRouter, UploadFile, File, Form, Request, HTTPException
from backend.app.core.limiter import limiter
from backend.app.utils.validators import validate_pdf_file, validate_pdf_safety, sanitize_filename
from backend.app.utils.file_utils import create_session_dir, register_download_file, encode_file_data_uri
from backend.app.services.security_service import protect_pdf

router = APIRouter(prefix="/api/protect", tags=["Protect PDF"])

@router.post("")
@limiter.limit("20/minute")
async def handle_protect_pdf(
    request: Request,
    file: UploadFile = File(...),
    password: str = Form(...),
    confirm_password: str = Form(...)
):
    if not password:
        raise HTTPException(status_code=400, detail="Password is required.")
        
    if password != confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match. Please verify both fields.")

    content = await validate_pdf_file(file)
    safe_name = sanitize_filename(file.filename or "document.pdf")
    base_name = safe_name.rsplit(".", 1)[0]
    
    session_id, session_dir = create_session_dir()
    input_path = session_dir / safe_name
    output_filename = f"{base_name}_protected.pdf"
    output_path = session_dir / output_filename
    
    with open(input_path, "wb") as f:
        f.write(content)

    validate_pdf_safety(input_path)

    stats = protect_pdf(
        input_path=input_path,
        output_path=output_path,
        password=password,
        confirm_password=confirm_password
    )

    download_id = register_download_file(output_path, output_filename, "application/pdf")
    file_data = encode_file_data_uri(output_path, "application/pdf")
    return {
        "download_id": download_id,
        "file_data": file_data,
        "filename": output_filename,
        "file_size": stats["file_size"],
        "encryption": stats["encryption"]
    }
