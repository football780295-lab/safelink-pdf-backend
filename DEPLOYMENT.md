# PDF Tools - Production Deployment & Operations Guide

This guide is designed for developers of all skill levels, from beginners deploying their first server to experienced DevOps engineers.

---

## 1. System Architecture Overview

```
                      +-----------------------------+
                      |   Users (Web / Mobile PWA)  |
                      +--------------+--------------+
                                     |
               +---------------------+---------------------+
               |                                           |
               v                                           v
    +----------------------+                    +----------------------+
    | Frontend (Next.js)   |                    | VPS Reverse Proxy    |
    | - Vercel Serverless  |                    | - Nginx (HTTPS: 443) |
    |   OR Docker (Port 3000)                   | - Let's Encrypt SSL  |
    +----------------------+                    +-----------+----------+
                                                            |
                                                            v
                                                +----------------------+
                                                | Backend (FastAPI)    |
                                                | - Uvicorn (Port 8000)|
                                                | - PyMuPDF / pikepdf  |
                                                | - Ghostscript CLI    |
                                                +----------------------+
```

- **Frontend:** Next.js App Router (TypeScript, Tailwind CSS v4, Lucide icons). Deployable to **Vercel** or within the included Docker Compose stack.
- **Backend:** Python FastAPI running in an isolated container under non-root user `appuser`.
- **Reverse Proxy & TLS:** Nginx with automatic HTTP -> HTTPS redirection, Let's Encrypt SSL certificates, rate limiting, and 50MB file upload limits.
- **Privacy Engine:** Automatic 15-minute file expiration cleanup worker and immediate post-download file purging.

---

## 2. Option A: Full Stack on a Single VPS (Docker Compose)

Recommended for budget hosting (e.g., $4–$6/month 2GB RAM VPS on Hetzner, DigitalOcean, Linode, or AWS Lightsail).

### Step 1: Provision your Ubuntu 22.04 / 24.04 Server
Connect to your server via SSH:
```bash
ssh root@YOUR_SERVER_IP
```

Update system packages:
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y git curl ufw
```

Configure Firewall:
```bash
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP (Certbot & Web)
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

### Step 2: Install Docker & Docker Compose
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

### Step 3: Clone Repository and Configure Environment
```bash
git clone https://github.com/your-username/pdf-tool.git
cd pdf-tool

# Copy environment template
cp .env.example .env
nano .env
```

Ensure your `.env` contains:
```env
NEXT_PUBLIC_API_URL=https://yourdomain.com
MAX_FILE_SIZE_MB=50
FILE_TTL_MINUTES=15
MAX_CONCURRENT_HEAVY_JOBS=2
ALLOWED_ORIGINS=https://yourdomain.com,http://localhost:3000
```

### Step 4: Obtain Let's Encrypt SSL Certificate
Install Certbot on host:
```bash
sudo apt install -y certbot
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com
```
Certificates will be saved to `/etc/letsencrypt/live/yourdomain.com/`.

Mount them in `docker-compose.yml` under nginx volumes:
```yaml
volumes:
  - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
  - /etc/letsencrypt:/etc/letsencrypt:ro
```

### Step 5: Start the Application Stack
```bash
docker compose up -d --build
```

Verify containers are running:
```bash
docker compose ps
docker compose logs -f
```

---

## 3. Option B: All-in-One on Vercel (Frontend + FastAPI Backend via Vercel Services)

Both the Next.js frontend and Python FastAPI backend are configured in `vercel.json` using **Vercel Services** (Beta) so they deploy together as one unified site:

```bash
# Deploy both frontend + backend from project root
npx vercel --prod --yes
```

> **Note on Vercel limits:** Vercel Functions cap single request/response payloads at **4.5 MB**. For files up to ~3–4 MB, everything runs directly on Vercel out of the box (using PyMuPDF/pikepdf compression and stateless inline downloads). For large files up to **50 MB** and Ghostscript compression, use Option A (VPS Docker) or Option C (Hybrid).

---

## 4. Option C: Hybrid Deployment (Frontend on Vercel + Backend on VPS)

Best performance and global edge caching for the frontend while maintaining full control over the backend PDF processors.

### Deploying Frontend to Vercel:
1. Push your repository to GitHub.
2. Log into [Vercel Dashboard](https://vercel.com) and click **"Add New Project"**.
3. Import your GitHub repository.
4. Set **Root Directory** to `frontend`.
5. Under **Environment Variables**, add:
   - `NEXT_PUBLIC_API_URL`: `https://api.yourdomain.com` (Your backend VPS domain)
   - `NEXT_PUBLIC_ENABLE_ADS`: `false` (or `true` if Google AdSense is ready)
   - `NEXT_PUBLIC_ADSENSE_CLIENT_ID`: `ca-pub-XXXXXXXXXXXXXXXX` (Optional)
6. Click **Deploy**. Vercel will build and assign an SSL URL (e.g., `https://your-app.vercel.app` or your custom domain).

### Deploying Backend to VPS:
1. Follow Step 1–3 from Option A.
2. In `backend/.env`, set:
   ```env
   ALLOWED_ORIGINS=https://your-app.vercel.app,https://yourdomain.com
   MAX_CONCURRENT_HEAVY_JOBS=2
   ```
3. Run only the backend and Nginx services:
   ```bash
   docker compose up -d --build backend nginx
   ```

---

## 4. 2GB RAM VPS Optimization Profile

Heavy PDF processing (rasterizing pages and downsampling high-res images) can cause memory spikes. To ensure rock-solid stability on a 2GB RAM server:

1. **Enable Swap Memory (Recommended: 2GB–4GB):**
   ```bash
   sudo fallocate -l 4G /swapfile
   sudo chmod 600 /swapfile
   sudo mkswap /swapfile
   sudo swapon /swapfile
   echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
   ```

2. **Concurrency Limiting:**
   The backend includes an internal semaphore limit (`MAX_CONCURRENT_HEAVY_JOBS=2`) which queues concurrent Ghostscript / PyMuPDF calls to ensure RAM stays below 1.2GB at all times.

3. **Docker Memory Limits:**
   In `docker-compose.yml`, the backend service is configured with:
   ```yaml
   deploy:
     resources:
       limits:
         memory: 1536M
   ```

---

## 5. Local Development Quickstart

### Running Backend Locally:
```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtualenv (Windows)
.\venv\Scripts\activate
# Activate virtualenv (Linux/macOS)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run Uvicorn server
uvicorn backend.app.main:app --reload --host 127.0.0.1 --port 8000
```
Backend API will be accessible at `http://127.0.0.1:8000/api/health` and docs at `http://127.0.0.1:8000/docs`.

### Running Frontend Locally:
```bash
# In a new terminal, navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```
Frontend will be accessible at `http://localhost:3000`.

---

## 6. Health Checks, Monitoring & Maintenance

- **Health Check Endpoint:**
  ```bash
  curl http://localhost:8000/api/health
  ```
  Returns:
  ```json
  {
    "status": "healthy",
    "service": "PDF Tools API",
    "ghostscript_available": true,
    "max_file_size_mb": 50,
    "file_ttl_minutes": 15
  }
  ```

- **Logs Inspection (No sensitive data / passwords logged):**
  ```bash
  docker compose logs -f backend
  ```

- **Manual Temp Storage Cleanup (Automatic runs every 5 minutes):**
  ```bash
  docker compose exec backend python -c "from backend.app.services.cleaner import purge_expired_files; print('Cleaned:', purge_expired_files())"
  ```
