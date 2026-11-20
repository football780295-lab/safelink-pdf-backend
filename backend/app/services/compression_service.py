import os
import subprocess
import logging
from pathlib import Path
from typing import Dict, Any
import pymupdf as fitz
import pikepdf
from backend.app.core.config import GHOSTSCRIPT_BIN

logger = logging.getLogger(__name__)

GS_LEVEL_MAP = {
    "low": "/printer",        # 300 dpi, high quality, minimal compression
    "recommended": "/ebook",   # 150 dpi, medium quality, standard compression
    "extreme": "/screen"       # 72 dpi, maximum compression
}

def compress_pdf_ghostscript(input_path: Path, output_path: Path, level: str) -> bool:
    """Run Ghostscript subprocess to compress PDF."""
    if not GHOSTSCRIPT_BIN:
        return False

    gs_preset = GS_LEVEL_MAP.get(level.lower(), "/ebook")
    
    cmd = [
        GHOSTSCRIPT_BIN,
        "-sDEVICE=pdfwrite",
        "-dCompatibilityLevel=1.4",
        f"-dPDFSETTINGS={gs_preset}",
        "-dNOPAUSE",
        "-dQUIET",
        "-dBATCH",
        f"-sOutputFile={output_path}",
        str(input_path)
    ]
    
    try:
        result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=60)
        if result.returncode == 0 and output_path.exists() and output_path.stat().st_size > 0:
            return True
        else:
            logger.warning(f"Ghostscript failed with returncode {result.returncode}: {result.stderr.decode('utf-8', errors='ignore')}")
            return False
    except Exception as e:
        logger.warning(f"Ghostscript execution error: {e}")
        return False

def compress_pdf_fallback(input_path: Path, output_path: Path, level: str):
    """
    Fallback compression using PyMuPDF and pikepdf when Ghostscript is not available.
    Applies image downsampling, stream deflation, and object deduplication.
    """
    level = level.lower()
    
    # Target DPI and JPEG quality based on level
    if level == "extreme":
        target_dpi = 72
        jpeg_quality = 40
    elif level == "low":
        target_dpi = 220
        jpeg_quality = 80
    else:  # recommended
        target_dpi = 130
        jpeg_quality = 65

    # 1. First pass with PyMuPDF for image optimization & garbage collection
    try:
        doc = fitz.open(input_path)
        
        # Optimize images in the document
        for page_idx in range(len(doc)):
            page = doc[page_idx]
            image_list = page.get_images(full=True)
            for img_info in image_list:
                xref = img_info[0]
                try:
                    base_img = doc.extract_image(xref)
                    if base_img:
                        img_bytes = base_img["image"]
                        # Compress with Pillow if image is large
                        from PIL import Image
                        import io
                        with Image.open(io.BytesIO(img_bytes)) as pil_img:
                            # If larger than target, resize
                            w, h = pil_img.size
                            # Only downscale if excessive
                            scale_factor = 1.0
                            if level == "extreme" and (w > 1200 or h > 1200):
                                scale_factor = min(1200 / w, 1200 / h)
                            elif level == "recommended" and (w > 1800 or h > 1800):
                                scale_factor = min(1800 / w, 1800 / h)
                                
                            if scale_factor < 1.0:
                                new_size = (int(w * scale_factor), int(h * scale_factor))
                                pil_img = pil_img.resize(new_size, Image.Resampling.LANCZOS)
                                
                            out_buf = io.BytesIO()
                            if pil_img.mode in ("RGBA", "P"):
                                pil_img = pil_img.convert("RGB")
                            pil_img.save(out_buf, format="JPEG", quality=jpeg_quality, optimize=True)
                            new_bytes = out_buf.getvalue()
                            
                            # Only replace if new bytes are actually smaller
                            if len(new_bytes) < len(img_bytes):
                                doc.update_stream(xref, new_bytes)
                except Exception:
                    continue
        
        # Save PyMuPDF with maximum compression and deflation
        doc.save(
            output_path,
            garbage=4,
            deflate=True,
            deflate_images=True,
            deflate_fonts=True,
            clean=True
        )
        doc.close()
    except Exception as e:
        logger.warning(f"PyMuPDF optimization pass failed: {e}")
        # Secondary fallback: simple pikepdf
        with pikepdf.Pdf.open(input_path) as pdf:
            pdf.save(
                output_path,
                compress_streams=True,
                linearize=True,
                object_stream_mode=pikepdf.ObjectStreamMode.generate
            )

    # Final pass with pikepdf for stream compression if output exists
    if output_path.exists():
        try:
            temp_final = output_path.with_suffix(".tmp.pdf")
            with pikepdf.Pdf.open(output_path) as pdf:
                pdf.save(
                    temp_final,
                    compress_streams=True,
                    object_stream_mode=pikepdf.ObjectStreamMode.generate
                )
            if temp_final.exists() and temp_final.stat().st_size <= output_path.stat().st_size:
                temp_final.replace(output_path)
            else:
                temp_final.unlink(missing_ok=True)
        except Exception:
            pass

def compress_pdf(input_path: Path, output_path: Path, level: str = "recommended") -> Dict[str, Any]:
    """
    Compress a PDF using Ghostscript (primary) or optimized PyMuPDF/pikepdf (fallback).
    Returns size comparison metrics.
    """
    original_size = input_path.stat().st_size
    success = False

    # Try Ghostscript first
    if GHOSTSCRIPT_BIN:
        success = compress_pdf_ghostscript(input_path, output_path, level)
        
    # Fallback to PyMuPDF/pikepdf if GS unavailable or failed
    if not success or not output_path.exists() or output_path.stat().st_size == 0:
        compress_pdf_fallback(input_path, output_path, level)

    # Measure result
    if not output_path.exists() or output_path.stat().st_size == 0:
        # If both somehow failed, copy original
        import shutil
        shutil.copyfile(input_path, output_path)

    new_size = output_path.stat().st_size
    
    # If compressed size ended up larger than original, revert to original
    if new_size > original_size:
        import shutil
        shutil.copyfile(input_path, output_path)
        new_size = original_size
        percent_saved = 0.0
    else:
        percent_saved = round((1 - (new_size / original_size)) * 100, 1)

    return {
        "original_size": original_size,
        "new_size": new_size,
        "percent_saved": percent_saved,
        "level": level,
        "method": "ghostscript" if success else "pymupdf_fallback"
    }
