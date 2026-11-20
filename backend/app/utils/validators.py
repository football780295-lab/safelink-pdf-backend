import re
import os
import zipfile
from pathlib import Path
from typing import List, Tuple
from fastapi import HTTPException, UploadFile
from PIL import Image
import pymupdf as fitz
from backend.app.core.config import MAX_FILE_SIZE_BYTES, MAX_FILE_SIZE_MB

PDF_MAGIC_BYTES = b"%PDF-"
PNG_MAGIC_BYTES = b"\x89PNG\r\n\x1a\n"
JPEG_MAGIC_BYTES = b"\xff\xd8\xff"

# Security limits
MAX_PDF_PAGES = 1500
MAX_PAGE_DIMENSION_POINTS = 14400  # 200 inches (PDF standard maximum limit)
MAX_ZIP_RATIO = 100                # Decompression bomb ratio limit
MAX_UNCOMPRESSED_ZIP_BYTES = 250 * 1024 * 1024  # 250MB uncompressed limit

def sanitize_filename(filename: str) -> str:
    """Strip dangerous characters and path traversal components."""
    clean = os.path.basename(filename)
    clean = re.sub(r'[^a-zA-Z0-9._\- ]', '_', clean)
    if not clean or clean.startswith('.'):
        clean = f"document_{clean}".strip('_')
    return clean[:200]

async def validate_pdf_file(file: UploadFile, max_size_bytes: int | None = None) -> bytes:
    """Validate that the uploaded file is a valid PDF within size limits."""
    from backend.app.core import config
    effective_max = max_size_bytes if max_size_bytes is not None else config.MAX_FILE_SIZE_BYTES
    effective_mb = config.MAX_FILE_SIZE_MB

    content = await file.read()
    
    if len(content) == 0:
        raise HTTPException(status_code=400, detail="The uploaded file is empty.")
        
    if len(content) > effective_max:
        raise HTTPException(
            status_code=413,
            detail=f"File exceeds maximum allowed size of {effective_mb}MB."
        )
        
    # Check magic bytes
    if not content.startswith(PDF_MAGIC_BYTES):
        first_1024 = content[:1024]
        if PDF_MAGIC_BYTES not in first_1024:
            raise HTTPException(
                status_code=400,
                detail="Invalid file format. The uploaded file is not a valid PDF document."
            )
            
    await file.seek(0)
    return content

async def validate_image_file(file: UploadFile, max_size_bytes: int | None = None) -> bytes:
    """Validate that the uploaded file is a valid JPEG or PNG image within size limits."""
    from backend.app.core import config
    effective_max = max_size_bytes if max_size_bytes is not None else config.MAX_FILE_SIZE_BYTES
    effective_mb = config.MAX_FILE_SIZE_MB

    content = await file.read()
    
    if len(content) == 0:
        raise HTTPException(status_code=400, detail="The uploaded image is empty.")
        
    if len(content) > effective_max:
        raise HTTPException(
            status_code=413,
            detail=f"File exceeds maximum allowed size of {effective_mb}MB."
        )
        
    is_png = content.startswith(PNG_MAGIC_BYTES)
    is_jpeg = content.startswith(JPEG_MAGIC_BYTES)
    
    if not (is_png or is_jpeg):
        raise HTTPException(
            status_code=400,
            detail="Invalid image format. Only JPG, JPEG, and PNG images are supported."
        )
        
    await file.seek(0)
    return content

def validate_pdf_safety(pdf_path: Path):
    """
    Inspect PDF document for malformed structure, 0 pages, or oversized dimensions.
    Protects against decompression and rasterizer exhaustion attacks.
    """
    try:
        doc = fitz.open(pdf_path)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Corrupted or invalid PDF document: {str(e)}")

    if doc.is_encrypted:
        doc.close()
        return  # Password verification handled separately in security tools

    total_pages = len(doc)
    if total_pages == 0:
        doc.close()
        raise HTTPException(status_code=400, detail="Document has 0 pages or contains no readable content.")

    if total_pages > MAX_PDF_PAGES:
        doc.close()
        raise HTTPException(
            status_code=400,
            detail=f"Document exceeds maximum page limit of {MAX_PDF_PAGES} pages."
        )

    # Check page dimensions on first 20 pages
    check_count = min(total_pages, 20)
    for i in range(check_count):
        rect = doc[i].rect
        if rect.width > MAX_PAGE_DIMENSION_POINTS or rect.height > MAX_PAGE_DIMENSION_POINTS:
            doc.close()
            raise HTTPException(
                status_code=400,
                detail=f"Page {i + 1} has excessive dimensions ({int(rect.width)}x{int(rect.height)}pt). Max limit is {MAX_PAGE_DIMENSION_POINTS}pt."
            )

    doc.close()

def parse_page_ranges(range_str: str, total_pages: int) -> List[int]:
    """
    Parse a range string like '1-3, 5, 8-10' into a sorted list of 0-indexed page numbers.
    Input page numbers are 1-indexed.
    """
    if not range_str or not range_str.strip():
        return list(range(total_pages))
        
    pages = set()
    parts = [p.strip() for p in range_str.split(',') if p.strip()]
    
    range_regex = re.compile(r'^(\d+)(?:\s*-\s*(\d+))?$')
    
    for part in parts:
        match = range_regex.match(part)
        if not match:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid page range format: '{part}'. Example format: '1-3, 5, 8-10'."
            )
        start_str, end_str = match.groups()
        start = int(start_str)
        end = int(end_str) if end_str is not None else start
        
        if start > end:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid range '{part}': start page {start} is greater than end page {end}."
            )
            
        if start < 1 or end > total_pages:
            raise HTTPException(
                status_code=400,
                detail=f"Page range '{part}' is out of bounds. The document has {total_pages} pages (valid range: 1-{total_pages})."
            )
            
        for p in range(start, end + 1):
            pages.add(p - 1)
            
    if not pages:
        raise HTTPException(status_code=400, detail="No valid pages selected.")
        
    return sorted(list(pages))
