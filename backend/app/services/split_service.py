import base64
import zipfile
from pathlib import Path
from typing import List, Dict, Any, Tuple
from fastapi import HTTPException
import pymupdf as fitz
import pikepdf

def generate_pdf_preview(pdf_path: Path, max_pages: int = 100) -> Dict[str, Any]:
    """
    Generate thumbnail previews and page metadata for split/extract UI.
    """
    try:
        doc = fitz.open(pdf_path)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Cannot open PDF: {str(e)}")

    if doc.is_encrypted:
        doc.close()
        raise HTTPException(
            status_code=400,
            detail="This PDF is password protected. Please unlock it first."
        )

    total_pages = len(doc)
    thumbnails = []
    
    # Render thumbnails (cap at max_pages for preview performance)
    render_count = min(total_pages, max_pages)
    for idx in range(render_count):
        page = doc[idx]
        rect = page.rect
        # Scale to max width 180px
        scale = 180.0 / max(rect.width, 1.0)
        matrix = fitz.Matrix(scale, scale)
        pix = page.get_pixmap(matrix=matrix, alpha=False)
        img_bytes = pix.tobytes("jpeg")
        b64 = base64.b64encode(img_bytes).decode("ascii")
        thumbnails.append({
            "page_number": idx + 1,
            "width": int(rect.width),
            "height": int(rect.height),
            "thumbnail": f"data:image/jpeg;base64,{b64}"
        })

    doc.close()
    return {
        "total_pages": total_pages,
        "preview_count": render_count,
        "thumbnails": thumbnails
    }

def split_pdf(
    input_path: Path,
    selected_pages: List[int],  # 0-indexed
    mode: str,                  # "single" or "zip"
    output_dir: Path,
    base_filename: str = "split_document"
) -> Tuple[Path, str, str]:
    """
    Extract selected pages from PDF.
    Returns (result_path, filename, mime_type).
    """
    if not selected_pages:
        raise HTTPException(status_code=400, detail="No pages were selected for splitting.")

    try:
        src_pdf = pikepdf.Pdf.open(input_path)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Cannot open PDF: {str(e)}")

    if src_pdf.is_encrypted:
        src_pdf.close()
        raise HTTPException(status_code=400, detail="The PDF is encrypted. Unlock it first.")

    total_pages = len(src_pdf.pages)
    for p in selected_pages:
        if p < 0 or p >= total_pages:
            src_pdf.close()
            raise HTTPException(
                status_code=400,
                detail=f"Page {p + 1} is out of bounds (document has {total_pages} pages)."
            )

    if mode == "single":
        # Create one combined PDF containing selected pages
        out_pdf = pikepdf.Pdf.new()
        for p in selected_pages:
            out_pdf.pages.append(src_pdf.pages[p])
            
        out_path = output_dir / f"{base_filename}_extracted.pdf"
        out_pdf.save(out_path)
        out_pdf.close()
        src_pdf.close()
        return out_path, f"{base_filename}_extracted.pdf", "application/pdf"

    elif mode == "zip":
        # Create individual PDFs and zip them
        zip_path = output_dir / f"{base_filename}_pages.zip"
        with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
            for p in selected_pages:
                single_pdf = pikepdf.Pdf.new()
                single_pdf.pages.append(src_pdf.pages[p])
                temp_pdf_name = f"page_{p + 1:03d}.pdf"
                temp_pdf_path = output_dir / temp_pdf_name
                single_pdf.save(temp_pdf_path)
                single_pdf.close()
                zf.write(temp_pdf_path, arcname=temp_pdf_name)
                temp_pdf_path.unlink(missing_ok=True)
                
        src_pdf.close()
        return zip_path, f"{base_filename}_pages.zip", "application/zip"
    else:
        src_pdf.close()
        raise HTTPException(status_code=400, detail=f"Unsupported split mode: '{mode}'. Use 'single' or 'zip'.")
