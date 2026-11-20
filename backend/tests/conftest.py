import io
import pytest
from PIL import Image
import fitz
from fastapi.testclient import TestClient
from backend.app.main import app

@pytest.fixture(scope="session")
def client():
    with TestClient(app) as test_client:
        yield test_client

@pytest.fixture
def sample_pdf_bytes():
    """Create a minimal valid 2-page PDF in memory."""
    doc = fitz.open()
    # Page 1
    p1 = doc.new_page(width=595, height=842)
    p1.insert_text((50, 100), "Hello PDF Tools Page 1", fontsize=24)
    # Page 2
    p2 = doc.new_page(width=595, height=842)
    p2.insert_text((50, 100), "Hello PDF Tools Page 2", fontsize=24)
    
    pdf_bytes = doc.tobytes()
    doc.close()
    return pdf_bytes

@pytest.fixture
def sample_image_bytes():
    """Create a sample 200x200 JPEG image in memory."""
    img = Image.new("RGB", (200, 200), color=(73, 109, 137))
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    return buf.getvalue()
