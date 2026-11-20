import io
import time
import logging
from pathlib import Path
import pytest
from starlette.testclient import TestClient
import pymupdf as fitz

from backend.app.core.config import MAX_FILE_SIZE_BYTES, TEMP_DIR
from backend.app.core.security_logger import SensitiveDataFilter
from backend.app.services.cleaner import purge_expired_files
from backend.app.utils.file_utils import create_session_dir, register_download_file, get_registered_file

def test_empty_file_upload(client: TestClient):
    """Empty files must be rejected with 400 Bad Request."""
    empty_bytes = b""
    
    # Compress
    res = client.post("/api/compress", files={"file": ("empty.pdf", empty_bytes, "application/pdf")})
    assert res.status_code == 400
    assert "empty" in res.json()["detail"].lower()

    # Split
    res = client.post("/api/split", files={"file": ("empty.pdf", empty_bytes, "application/pdf")})
    assert res.status_code == 400
    assert "empty" in res.json()["detail"].lower()

    # Protect
    res = client.post(
        "/api/protect",
        files={"file": ("empty.pdf", empty_bytes, "application/pdf")},
        data={"password": "secret", "confirm_password": "secret"}
    )
    assert res.status_code == 400
    assert "empty" in res.json()["detail"].lower()

    # Unlock
    res = client.post(
        "/api/unlock",
        files={"file": ("empty.pdf", empty_bytes, "application/pdf")},
        data={"password": "secret"}
    )
    assert res.status_code == 400
    assert "empty" in res.json()["detail"].lower()

    # PDF to JPG
    res = client.post("/api/pdf-to-jpg", files={"file": ("empty.pdf", empty_bytes, "application/pdf")})
    assert res.status_code == 400
    assert "empty" in res.json()["detail"].lower()

    # JPG to PDF
    res = client.post("/api/jpg-to-pdf", files={"files": ("empty.jpg", empty_bytes, "image/jpeg")})
    assert res.status_code == 400
    assert "empty" in res.json()["detail"].lower()

def test_fake_pdf_renamed(client: TestClient):
    """A non-PDF file with a .pdf extension must be rejected."""
    fake_content = b"This is a plain text file pretending to be a PDF."
    res = client.post("/api/compress", files={"file": ("fake.pdf", fake_content, "application/pdf")})
    assert res.status_code == 400
    assert "not a valid pdf" in res.json()["detail"].lower()

def test_corrupted_pdf_structure(client: TestClient):
    """A file starting with %PDF- but having corrupt internal stream data."""
    corrupted_content = b"%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\ncorrupted garbage without xref or root"
    res = client.post("/api/compress", files={"file": ("corrupt.pdf", corrupted_content, "application/pdf")})
    assert res.status_code == 400
    detail = res.json()["detail"].lower()
    assert "0 pages" in detail or "corrupted" in detail or "invalid" in detail

def test_zero_page_pdf(client: TestClient):
    """A valid PDF container that contains 0 pages must be rejected."""
    zero_page_bytes = (
        b"%PDF-1.4\n"
        b"1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj\n"
        b"2 0 obj << /Type /Pages /Count 0 /Kids [] >> endobj\n"
        b"xref\n0 3\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n"
        b"trailer << /Size 3 /Root 1 0 R >>\nstartxref\n115\n%%EOF\n"
    )
    res = client.post("/api/compress", files={"file": ("zero_page.pdf", zero_page_bytes, "application/pdf")})
    assert res.status_code == 400
    assert "0 pages" in res.json()["detail"].lower()

def test_wrong_unlock_password(client: TestClient, sample_pdf_bytes: bytes):
    """Unlocking a protected PDF with an incorrect password must fail with 400."""
    # First protect it
    protect_res = client.post(
        "/api/protect",
        files={"file": ("secure.pdf", sample_pdf_bytes, "application/pdf")},
        data={"password": "CorrectPassword123!", "confirm_password": "CorrectPassword123!"}
    )
    assert protect_res.status_code == 200
    protected_dl_id = protect_res.json()["download_id"]

    # Download the protected PDF
    protected_pdf_res = client.get(f"/api/files/download/{protected_dl_id}?delete_after=false")
    assert protected_pdf_res.status_code == 200
    protected_bytes = protected_pdf_res.content

    # Try unlocking with WRONG password
    unlock_res = client.post(
        "/api/unlock",
        files={"file": ("locked.pdf", protected_bytes, "application/pdf")},
        data={"password": "WrongPassword999!"}
    )
    assert unlock_res.status_code == 400
    assert "incorrect" in unlock_res.json()["detail"].lower()

def test_protect_password_mismatch(client: TestClient, sample_pdf_bytes: bytes):
    """Password and confirm_password mismatch must fail."""
    res = client.post(
        "/api/protect",
        files={"file": ("doc.pdf", sample_pdf_bytes, "application/pdf")},
        data={"password": "AlphaPassword1", "confirm_password": "BetaPassword2"}
    )
    assert res.status_code == 400
    assert "match" in res.json()["detail"].lower()

def test_invalid_split_page_ranges(client: TestClient, sample_pdf_bytes: bytes):
    """Out of bound ranges or malformed range strings must return 400."""
    # sample_pdf_bytes has 2 pages; requesting page 10 must fail
    res = client.post(
        "/api/split",
        files={"file": ("doc.pdf", sample_pdf_bytes, "application/pdf")},
        data={"pages": "1, 10-15", "mode": "single"}
    )
    assert res.status_code == 400
    assert "out of bounds" in res.json()["detail"].lower()

    # Malformed range format
    res_malformed = client.post(
        "/api/split",
        files={"file": ("doc.pdf", sample_pdf_bytes, "application/pdf")},
        data={"pages": "1-abc", "mode": "single"}
    )
    assert res_malformed.status_code == 400
    assert "invalid page range" in res_malformed.json()["detail"].lower()

def test_file_exceeding_max_size(client: TestClient, monkeypatch):
    """Files exceeding maximum allowed size must return 413 Payload Too Large."""
    import backend.app.core.config as cfg
    monkeypatch.setattr(cfg, "MAX_FILE_SIZE_BYTES", 100)
    monkeypatch.setattr(cfg, "MAX_FILE_SIZE_MB", 0.0001)

    big_content = b"%PDF-1.4\n" + b"X" * 200
    res = client.post("/api/compress", files={"file": ("big.pdf", big_content, "application/pdf")})
    assert res.status_code == 413
    assert "exceeds" in res.json()["detail"].lower()

def test_log_sensitive_data_redaction():
    """Verify SensitiveDataFilter scrubs passwords from logging records."""
    log_filter = SensitiveDataFilter()
    
    record = logging.LogRecord(
        name="test_logger",
        level=logging.INFO,
        pathname=__file__,
        lineno=10,
        msg="User authenticated with password=MySuperSecretPass! and confirm_password=MySuperSecretPass!",
        args=(),
        exc_info=None
    )
    log_filter.filter(record)
    assert "MySuperSecretPass!" not in record.msg
    assert "***REDACTED***" in record.msg

def test_temp_file_deletion_and_cleanup():
    """Verify files are cleaned up on download and expired files are purged."""
    sess_id, sess_dir = create_session_dir()
    test_file = sess_dir / "test_cleanup.pdf"
    test_file.write_bytes(b"%PDF-1.4 dummy")

    dl_id = register_download_file(test_file, "test_cleanup.pdf")
    assert get_registered_file(dl_id) is not None
    assert test_file.exists()

    # Simulate expired file by setting mtime to 20 minutes ago (1200 seconds)
    twenty_mins_ago = time.time() - 1200
    import os
    os.utime(test_file, (twenty_mins_ago, twenty_mins_ago))
    os.utime(sess_dir, (twenty_mins_ago, twenty_mins_ago))

    # Run background purge
    purged = purge_expired_files()
    assert purged >= 1
    assert not test_file.exists()
    assert not sess_dir.exists()
