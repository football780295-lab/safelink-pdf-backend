from pathlib import Path
from typing import List, Dict, Any
from fastapi import HTTPException
import pypdf

def merge_pdfs(input_paths: List[Path], output_path: Path) -> Dict[str, Any]:
    """
    Merge multiple PDF files in the specified order into a single PDF.
    """
    if len(input_paths) < 2:
        raise HTTPException(
            status_code=400,
            detail="At least 2 PDF files are required to perform a merge."
        )

    writer = pypdf.PdfWriter()
    total_pages = 0
    file_page_counts = []

    for path in input_paths:
        try:
            reader = pypdf.PdfReader(str(path))
            # Verify not encrypted or locked
            if reader.is_encrypted:
                try:
                    # Try decrypting with empty password
                    reader.decrypt("")
                except Exception:
                    raise HTTPException(
                        status_code=400,
                        detail=f"File '{path.name}' is password protected. Please unlock it before merging."
                    )
            
            count = len(reader.pages)
            if count == 0:
                raise HTTPException(
                    status_code=400,
                    detail=f"File '{path.name}' contains no readable pages."
                )
                
            writer.append(reader)
            total_pages += count
            file_page_counts.append(count)
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=f"Failed to read PDF '{path.name}': {str(e)}"
            )

    try:
        with open(output_path, "wb") as f_out:
            writer.write(f_out)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate merged PDF: {str(e)}"
        )

    return {
        "file_count": len(input_paths),
        "total_pages": total_pages,
        "page_counts": file_page_counts,
        "output_size": output_path.stat().st_size
    }
