# PDF Tools 🛠️📄

A production-ready, privacy-first web application to fix common PDF problems. Built with Next.js (App Router), Tailwind CSS, Python FastAPI, Ghostscript, pikepdf, and PyMuPDF.

Features full bilingual support for **English** and **Bangla (বাংলা)** with light and dark mode.

---

## ✨ Available Tools

| Tool | Route | Description | Tech Stack |
| :--- | :--- | :--- | :--- |
| **Compress PDF** | `/compress` | Shrink PDF file size with selectable levels (Low, Recommended, Extreme). Shows original size, new size, and % saved. | Ghostscript (subprocess) + PyMuPDF/pikepdf fallback |
| **Merge PDF** | `/merge` | Combine 2 or more PDFs into a single file with drag-and-drop and arrow reordering. | `pypdf` + `pikepdf` |
| **Split PDF** | `/split` | Interactive page thumbnail previews. Select pages or ranges (`1-3, 5, 8-10`) to export as a single merged PDF or a ZIP of separate PDFs. | PyMuPDF (`fitz`) + `pikepdf` |
| **JPG to PDF** | `/jpg-to-pdf` | Convert multiple JPG/PNG images into a PDF with page size choices (A4 / Fit to image) and orientation options (Portrait / Landscape). | `img2pdf` + `Pillow` |
| **PDF to JPG** | `/pdf-to-jpg` | Render every PDF page into high-resolution JPGs with selectable DPI (72, 150, 300) and JPEG quality slider. Download as ZIP. | PyMuPDF (`fitz`) + `Pillow` |
| **Protect PDF** | `/protect` | Encrypt PDF files with 256-bit AES (`R=6`). Password confirmation and show/hide toggle. Zero password logging. | `pikepdf` AES-256 |
| **Unlock PDF** | `/unlock` | Decrypt authorized PDFs using the correct known password to strip security. Clear legal notice (no cracking/brute force). | `pikepdf` decryption |

---

## 🔒 Privacy & Security

- **Zero-Persistence Policy**: Uploaded files and generated outputs are stored exclusively in isolated temporary directories.
- **Auto-Deletion**: An autonomous background worker runs every 5 minutes and permanently deletes any file or folder older than 15 minutes.
- **Immediate Post-Download Purge**: Files can be marked for instant deletion upon download.
- **No Password or Content Logging**: Passwords and document contents are never logged, persisted in databases, or cached.
- **Strict Size Limits**: Max 50MB file size enforced on both client and server with magic-byte format validation.
- **Path Traversal Protection**: All filenames are sanitized with UUID session mapping.
- **Rate Limiting**: IP-based rate limiting via SlowAPI to prevent abuse.

---

## 🏗️ Architecture & Project Structure

```
pdf_tool/
├── backend/
│   ├── app/
│   │   ├── core/
│   │   │   ├── config.py         # App configurations, paths, GS binary detection
│   │   │   └── limiter.py        # SlowAPI rate limiter
│   │   ├── routers/
│   │   │   ├── compress.py       # POST /api/compress
│   │   │   ├── merge.py          # POST /api/merge
│   │   │   ├── split.py          # POST /api/split, /api/split/preview
│   │   │   ├── jpg_to_pdf.py     # POST /api/jpg-to-pdf
│   │   │   ├── pdf_to_jpg.py     # POST /api/pdf-to-jpg
│   │   │   ├── protect.py        # POST /api/protect
│   │   │   ├── unlock.py         # POST /api/unlock
│   │   │   └── files.py          # GET /api/files/download/{id}, DELETE /cleanup/{id}
│   │   ├── services/
│   │   │   ├── cleaner.py        # Background task for 15-minute TTL cleanup
│   │   │   ├── compression_service.py # Ghostscript runner + fallback
│   │   │   ├── merge_service.py  # PDF merging service
│   │   │   ├── split_service.py  # Page preview generation & split engine
│   │   │   ├── conversion_service.py # Image <-> PDF converters
│   │   │   └── security_service.py   # AES-256 encryption & unlock
│   │   ├── utils/
│   │   │   ├── file_utils.py     # Session directory & file registry
│   │   │   └── validators.py     # Size, magic byte, and range validators
│   │   └── main.py               # FastAPI initialization, CORS, lifespan
│   ├── tests/
│   │   ├── conftest.py           # Pytest fixtures (sample PDFs, images, TestClient)
│   │   └── test_tools.py         # Complete test suite for all 7 tools
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx        # App layout with Providers, Navbar & Footer
│   │   │   ├── page.tsx          # Homepage with 7 tool cards & hero
│   │   │   ├── compress/page.tsx # Compress PDF route
│   │   │   ├── merge/page.tsx    # Merge PDF route
│   │   │   ├── split/page.tsx    # Split PDF route
│   │   │   ├── jpg-to-pdf/page.tsx # JPG to PDF route
│   │   │   ├── pdf-to-jpg/page.tsx # PDF to JPG route
│   │   │   ├── protect/page.tsx  # Protect PDF route
│   │   │   ├── unlock/page.tsx   # Unlock PDF route
│   │   │   ├── privacy/page.tsx  # Privacy policy page
│   │   │   └── globals.css       # Tailwind CSS styles & dark mode
│   │   ├── components/
│   │   │   ├── Navbar.tsx        # Header with Language & Theme toggle
│   │   │   ├── Footer.tsx        # Footer with privacy badges
│   │   │   ├── FileDropzone.tsx  # Drag & drop upload component
│   │   │   ├── ResultCard.tsx    # Result screen with download & stats
│   │   │   ├── ProgressBar.tsx   # Processing progress component
│   │   │   └── Providers.tsx     # Client context providers
│   │   ├── context/
│   │   │   ├── LanguageContext.tsx # English (EN) & Bangla (BN) toggle
│   │   │   └── ThemeContext.tsx    # Light & Dark theme toggle
│   │   ├── locales/
│   │   │   ├── en.ts             # English translations
│   │   │   └── bn.ts             # Bangla translations
│   │   └── lib/
│   │       └── api.ts            # API base URL & format helpers
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## 🚀 Getting Started

### Method 1: Local Development (Recommended)

#### Prerequisites
- **Python**: 3.10+ (tested on Python 3.12 and 3.13)
- **Node.js**: 18+ (tested on Node.js 20 and 24)
- **Ghostscript** *(optional for local dev)*: If installed (`gs` or `gswin64c`), Ghostscript is used directly for compression. If not installed, the app automatically falls back to an internal PyMuPDF/pikepdf optimization engine.

#### 1. Start the Backend
```bash
# Navigate to backend directory or project root
cd c:/Users/LaptopCorner/Desktop/pdf_tool

# Create and activate virtual environment
python -m venv backend/venv

# Windows:
.\backend\venv\Scripts\activate
# Linux/macOS:
# source backend/venv/bin/activate

# Install dependencies
pip install -r backend/requirements.txt

# Run the FastAPI server
uvicorn backend.app.main:app --reload --port 8000
```
Backend API will be available at: `http://localhost:8000`  
Swagger API Documentation: `http://localhost:8000/docs`

#### 2. Start the Frontend
In a new terminal:
```bash
cd frontend

# Install dependencies
npm install

# Start Next.js development server
npm run dev
```
Frontend application will be live at: `http://localhost:3000`

---

### Method 2: Docker Compose (All-in-One)

The Docker setup builds both services in isolated containers, installs Ghostscript in the backend container, and connects the frontend to the backend.

```bash
# Build and run all services
docker compose up --build

# Run in background
docker compose up -d

# Stop all services
docker compose down
```

Frontend: `http://localhost:3000`  
Backend: `http://localhost:8000`

---

## 🧪 Automated Testing & QA

### 1. Backend Pytest Suite (Unit, Integration & Edge Cases)
All 7 core tools and extensive edge cases (empty files, corrupted streams, zero-page PDFs, wrong unlock passwords, size limits >50MB, sensitive log redaction, and 15-minute background TTL deletion) are thoroughly tested:

```bash
# Set PYTHONPATH and run pytest
$env:PYTHONPATH="c:\Users\LaptopCorner\Desktop\pdf_tool"; backend\venv\Scripts\pytest backend\tests -v
```

### 2. Frontend Playwright E2E Suite
End-to-end tests verify user workflows, dynamic English/Bangla language switching, dark/light theme toggle, file upload interactions, and cookie consent preferences:

```bash
cd frontend
npx playwright test
```

---

## 🚢 Deployment & Production Operations

Full beginner-friendly production instructions are available in [DEPLOYMENT.md](file:///c:/Users/LaptopCorner/Desktop/pdf_tool/DEPLOYMENT.md).

- **Docker Compose Stack**: Run `docker compose up -d --build` for the full backend, frontend, and Nginx reverse proxy.
- **Vercel + VPS Hybrid**: Deploy the frontend statically/edge-first to Vercel, and run the backend behind Nginx with Let's Encrypt SSL on a 2GB RAM VPS.
- **Resource Management**: 2-job concurrency semaphore prevents Out-Of-Memory (OOM) errors on budget hosts.

---

## 🌐 API Overview

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Service health status and Ghostscript availability |
| `POST` | `/api/compress` | Compress PDF with `level` ("low", "recommended", "extreme") |
| `POST` | `/api/merge` | Merge 2+ PDF files |
| `POST` | `/api/split/preview` | Generate page thumbnails and page count |
| `POST` | `/api/split` | Extract pages with `pages` range and `mode` ("single" \| "zip") |
| `POST` | `/api/jpg-to-pdf` | Convert images to PDF (`page_size`, `orientation`) |
| `POST` | `/api/pdf-to-jpg` | Convert PDF pages to JPGs (`dpi`, `quality`) bundled in ZIP |
| `POST` | `/api/protect` | Encrypt PDF with password (AES-256) |
| `POST` | `/api/unlock` | Decrypt authorized PDF with password |
| `GET` | `/api/files/download/{id}` | Secure download of processed file |
| `DELETE` | `/api/files/cleanup/{id}` | Immediate session cleanup |

---

## 📝 License
MIT License. Open-source, private, and free to use.
