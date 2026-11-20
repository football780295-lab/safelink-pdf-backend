from pathlib import Path
from typing import Dict, Any
from fastapi import HTTPException
import pikepdf

def protect_pdf(
    input_path: Path,
    output_path: Path,
    password: str,
    confirm_password: str
) -> Dict[str, Any]:
    """
    Encrypt a PDF document with AES-256 encryption.
    Does NOT log the password.
    """
    if not password:
        raise HTTPException(status_code=400, detail="Password cannot be empty.")

    if password != confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match. Please ensure both fields match.")

    if len(password) < 1:
        raise HTTPException(status_code=400, detail="Password must be at least 1 character long.")

    try:
        pdf = pikepdf.Pdf.open(input_path)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to read PDF document: {str(e)}")

    try:
        # pikepdf R=6 corresponds to AES-256 encryption
        encryption = pikepdf.Encryption(
            owner=password,
            user=password,
            R=6,
            allow=pikepdf.Permissions(extract=True, print_lowres=True, print_highres=True, modify_annotation=True)
        )
        pdf.save(output_path, encryption=encryption)
        pdf.close()
    except Exception as e:
        pdf.close()
        raise HTTPException(status_code=500, detail=f"Encryption failed: {str(e)}")

    return {
        "status": "success",
        "file_size": output_path.stat().st_size,
        "encryption": "AES-256"
    }

def unlock_pdf(
    input_path: Path,
    output_path: Path,
    password: str
) -> Dict[str, Any]:
    """
    Decrypt an authorized PDF with the correct user password and remove security.
    No brute-forcing or cracking. Does NOT log the password.
    """
    if not password:
        raise HTTPException(
            status_code=400,
            detail="Password is required to unlock this document."
        )

    # 1. First check if document is actually encrypted
    try:
        test_pdf = pikepdf.Pdf.open(input_path)
        # If opened without password, document is not encrypted
        test_pdf.save(output_path)
        test_pdf.close()
        return {
            "status": "already_unlocked",
            "message": "Document is not password protected.",
            "file_size": output_path.stat().st_size
        }
    except pikepdf.PasswordError:
        # Document is indeed encrypted, proceed with provided password
        pass
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid or corrupted PDF file: {str(e)}")

    # 2. Attempt decryption with user's provided password
    try:
        pdf = pikepdf.Pdf.open(input_path, password=password)
    except pikepdf.PasswordError:
        raise HTTPException(
            status_code=400,
            detail="Incorrect password. Please check your password and try again."
        )
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Unable to unlock PDF: {str(e)}"
        )

    try:
        # Saving without encryption parameter strips the password protection
        pdf.save(output_path)
        pdf.close()
    except Exception as e:
        pdf.close()
        raise HTTPException(status_code=500, detail=f"Failed to save decrypted PDF: {str(e)}")

    return {
        "status": "unlocked",
        "message": "Password removed successfully. Your document is now unencrypted.",
        "file_size": output_path.stat().st_size
    }
