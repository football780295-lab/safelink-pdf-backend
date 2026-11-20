import io
import zipfile
from pathlib import Path
from typing import List, Dict, Any, Tuple
from fastapi import HTTPException
from PIL import Image
import img2pdf
import pymupdf as fitz

def prepare_images_for_pdf(image_paths: List[Path], temp_dir: Path) -> List[str]:
    """
    Ensure all images are in RGB JPEG/PNG format and valid for img2pdf.
    """
    normalized_paths = []
    for idx, img_path in enumerate(image_paths):
        try:
            with Image.open(img_path) as pil_img:
                # Handle RGBA / Palette / transparency
                if pil_img.mode in ("RGBA", "LA", "P"):
                    # Create white background for transparent images
                    rgb_img = Image.new("RGB", pil_img.size, (255, 255, 255))
                    if pil_img.mode == "P":
                        pil_img = pil_img.convert("RGBA")
                    rgb_img.paste(pil_img, mask=pil_img.split()[3])
                    norm_path = temp_dir / f"norm_{idx}_{img_path.stem}.jpg"
                    rgb_img.save(norm_path, format="JPEG", quality=95)
                    normalized_paths.append(str(norm_path))
                elif pil_img.mode != "RGB":
                    rgb_img = pil_img.convert("RGB")
                    norm_path = temp_dir / f"norm_{idx}_{img_path.stem}.jpg"
                    rgb_img.save(norm_path, format="JPEG", quality=95)
                    normalized_paths.append(str(norm_path))
                else:
                    normalized_paths.append(str(img_path))
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=f"Failed to process image '{img_path.name}': {str(e)}"
            )
    return normalized_paths

def images_to_pdf(
    image_paths: List[Path],
    output_path: Path,
    page_size: str = "a4",         # "a4" or "fit"
    orientation: str = "portrait"  # "portrait" or "landscape"
) -> Dict[str, Any]:
    """
    Convert a list of images into a single PDF document.
    """
    if not image_paths:
        raise HTTPException(status_code=400, detail="No images provided for conversion.")

    temp_dir = output_path.parent
    prepared_paths = prepare_images_for_pdf(image_paths, temp_dir)

    try:
        if page_size.lower() == "a4":
            # A4 size in points: 595.28 x 841.89
            a4_w = img2pdf.in_to_pt(8.27)
            a4_h = img2pdf.in_to_pt(11.69)
            if orientation.lower() == "landscape":
                page_dim = (a4_h, a4_w)
            else:
                page_dim = (a4_w, a4_h)

            layout_fun = img2pdf.get_layout_fun(
                pagesize=page_dim,
                fit=img2pdf.FitMode.into
            )
            pdf_bytes = img2pdf.convert(prepared_paths, layout_fun=layout_fun)
        else:
            # Fit to image
            pdf_bytes = img2pdf.convert(prepared_paths)

        with open(output_path, "wb") as f_out:
            f_out.write(pdf_bytes)

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to convert images to PDF: {str(e)}"
        )

    return {
        "page_count": len(image_paths),
        "file_size": output_path.stat().st_size,
        "page_size": page_size,
        "orientation": orientation
    }

def pdf_to_images(
    pdf_path: Path,
    output_dir: Path,
    dpi: int = 150,
    quality: int = 90
) -> Tuple[Path, str, int, List[str]]:
    """
    Convert each page of a PDF into a JPG image and bundle into a ZIP archive.
    Returns (zip_path, zip_filename, total_pages, list_of_image_filenames).
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
    if total_pages == 0:
        doc.close()
        raise HTTPException(status_code=400, detail="The PDF contains no pages.")

    # Restrict DPI to safe bounds
    safe_dpi = max(72, min(dpi, 300))
    image_filenames = []
    
    zip_filename = f"{pdf_path.stem}_images.zip"
    zip_path = output_dir / zip_filename

    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
        for page_idx in range(total_pages):
            page = doc[page_idx]
            pix = page.get_pixmap(dpi=safe_dpi, alpha=False)
            
            img_name = f"page_{page_idx + 1:03d}.jpg"
            img_path = output_dir / img_name
            
            # Save using Pillow to apply quality parameter
            img_bytes = pix.tobytes("jpeg")
            with Image.open(io.BytesIO(img_bytes)) as pil_img:
                pil_img.save(img_path, format="JPEG", quality=quality, optimize=True)
                
            zf.write(img_path, arcname=img_name)
            image_filenames.append(img_name)
            
            # Keep individual files in session directory for separate downloads if desired
            
    doc.close()
    return zip_path, zip_filename, total_pages, image_filenames
