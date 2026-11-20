import io
import pytest
from fastapi.testclient import TestClient

def test_health_check(client: TestClient):
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "max_file_size_mb" in data

def test_compress_pdf(client: TestClient, sample_pdf_bytes: bytes):
    response = client.post(
        "/api/compress",
        files={"file": ("test.pdf", sample_pdf_bytes, "application/pdf")},
        data={"level": "recommended"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "download_id" in data
    assert data["original_size"] > 0
    assert data["new_size"] > 0
    assert "percent_saved" in data

    # Verify download works
    dl_res = client.get(f"/api/files/download/{data['download_id']}")
    assert dl_res.status_code == 200
    assert dl_res.content.startswith(b"%PDF-")

def test_merge_pdf(client: TestClient, sample_pdf_bytes: bytes):
    response = client.post(
        "/api/merge",
        files=[
            ("files", ("doc1.pdf", sample_pdf_bytes, "application/pdf")),
            ("files", ("doc2.pdf", sample_pdf_bytes, "application/pdf")),
        ]
    )
    assert response.status_code == 200
    data = response.json()
    assert data["file_count"] == 2
    assert data["total_pages"] == 4  # 2 pages each = 4 pages
    assert "download_id" in data

    # Test rejection when only 1 file is sent
    single_res = client.post(
        "/api/merge",
        files=[
            ("files", ("doc1.pdf", sample_pdf_bytes, "application/pdf")),
        ]
    )
    assert single_res.status_code == 400

def test_split_pdf(client: TestClient, sample_pdf_bytes: bytes):
    # Test preview
    preview_res = client.post(
        "/api/split/preview",
        files={"file": ("test_split.pdf", sample_pdf_bytes, "application/pdf")}
    )
    assert preview_res.status_code == 200
    pdata = preview_res.json()
    assert pdata["total_pages"] == 2
    assert len(pdata["thumbnails"]) == 2

    # Test extract single page as PDF
    split_res = client.post(
        "/api/split",
        files={"file": ("test_split.pdf", sample_pdf_bytes, "application/pdf")},
        data={"pages": "1", "mode": "single"}
    )
    assert split_res.status_code == 200
    sdata = split_res.json()
    assert sdata["selected_pages_count"] == 1

    # Test extract as ZIP
    zip_res = client.post(
        "/api/split",
        files={"file": ("test_split.pdf", sample_pdf_bytes, "application/pdf")},
        data={"pages": "1-2", "mode": "zip"}
    )
    assert zip_res.status_code == 200
    zdata = zip_res.json()
    assert zdata["selected_pages_count"] == 2
    assert zdata["mode"] == "zip"

def test_jpg_to_pdf(client: TestClient, sample_image_bytes: bytes):
    response = client.post(
        "/api/jpg-to-pdf",
        files=[
            ("files", ("img1.jpg", sample_image_bytes, "image/jpeg")),
            ("files", ("img2.jpg", sample_image_bytes, "image/jpeg")),
        ],
        data={"page_size": "a4", "orientation": "portrait"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["page_count"] == 2
    assert "download_id" in data

    dl_res = client.get(f"/api/files/download/{data['download_id']}")
    assert dl_res.status_code == 200
    assert dl_res.content.startswith(b"%PDF-")

def test_pdf_to_jpg(client: TestClient, sample_pdf_bytes: bytes):
    response = client.post(
        "/api/pdf-to-jpg",
        files={"file": ("test_to_img.pdf", sample_pdf_bytes, "application/pdf")},
        data={"dpi": 150, "quality": 85}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["total_pages"] == 2
    assert data["image_count"] == 2
    assert "download_id" in data
    assert "images" in data
    assert len(data["images"]) == 2

    # Verify zip download
    dl_res = client.get(f"/api/files/download/{data['download_id']}")
    assert dl_res.status_code == 200
    # ZIP magic bytes: PK
    assert dl_res.content.startswith(b"PK")

    # Verify single page image download
    img_dl_res = client.get(f"/api/files/download/{data['images'][0]['download_id']}")
    assert img_dl_res.status_code == 200
    assert img_dl_res.content.startswith(b"\xff\xd8\xff")  # JPEG magic bytes

def test_protect_and_unlock_pdf(client: TestClient, sample_pdf_bytes: bytes):
    password = "SecurePassword123!"

    # 1. Protect with mismatched passwords -> should fail 400
    mismatch_res = client.post(
        "/api/protect",
        files={"file": ("test.pdf", sample_pdf_bytes, "application/pdf")},
        data={"password": password, "confirm_password": "WrongPassword"}
    )
    assert mismatch_res.status_code == 400

    # 2. Protect with valid matching passwords
    protect_res = client.post(
        "/api/protect",
        files={"file": ("test.pdf", sample_pdf_bytes, "application/pdf")},
        data={"password": password, "confirm_password": password}
    )
    assert protect_res.status_code == 200
    pdata = protect_res.json()
    assert "download_id" in pdata

    # Download the encrypted PDF
    enc_pdf_res = client.get(f"/api/files/download/{pdata['download_id']}")
    assert enc_pdf_res.status_code == 200
    encrypted_bytes = enc_pdf_res.content

    # 3. Attempt unlock with incorrect password -> should fail 400
    wrong_unlock = client.post(
        "/api/unlock",
        files={"file": ("enc.pdf", encrypted_bytes, "application/pdf")},
        data={"password": "IncorrectPassword"}
    )
    assert wrong_unlock.status_code == 400
    assert "incorrect password" in wrong_unlock.json()["detail"].lower()

    # 4. Attempt unlock with correct password -> should succeed
    success_unlock = client.post(
        "/api/unlock",
        files={"file": ("enc.pdf", encrypted_bytes, "application/pdf")},
        data={"password": password}
    )
    assert success_unlock.status_code == 200
    udata = success_unlock.json()
    assert udata["status"] == "unlocked"
    assert "download_id" in udata

    # Download decrypted PDF
    dec_pdf_res = client.get(f"/api/files/download/{udata['download_id']}")
    assert dec_pdf_res.status_code == 200
    assert dec_pdf_res.content.startswith(b"%PDF-")
