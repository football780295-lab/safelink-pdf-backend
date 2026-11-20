import os
import shutil
from pathlib import Path

# Base Paths
BASE_DIR = Path(__file__).resolve().parent.parent.parent
default_temp = Path("/tmp/temp_uploads") if os.getenv("VERCEL") or os.getenv("AWS_LAMBDA_FUNCTION_NAME") else BASE_DIR / "temp_uploads"
TEMP_DIR = Path(os.getenv("TEMP_DIR", str(default_temp)))
try:
    TEMP_DIR.mkdir(parents=True, exist_ok=True)
except OSError:
    TEMP_DIR = Path("/tmp/temp_uploads")
    TEMP_DIR.mkdir(parents=True, exist_ok=True)

# Constraints
MAX_FILE_SIZE_MB = int(os.getenv("MAX_FILE_SIZE_MB", "50"))
MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024
FILE_TTL_MINUTES = int(os.getenv("FILE_TTL_MINUTES", "15"))
CLEANUP_INTERVAL_SECONDS = int(os.getenv("CLEANUP_INTERVAL_SECONDS", "300"))

# Rate Limiting
RATE_LIMIT_PER_MINUTE = os.getenv("RATE_LIMIT_PER_MINUTE", "60/minute")

# Ghostscript Path detection
def find_ghostscript_binary() -> str | None:
    env_gs = os.getenv("GHOSTSCRIPT_PATH")
    if env_gs and os.path.isfile(env_gs):
        return env_gs
    candidates = ["gs", "gswin64c", "gswin32c", "gswin64", "gswin32"]
    for cand in candidates:
        found = shutil.which(cand)
        if found:
            return found
    # Common Windows installation locations
    common_win_paths = [
        r"C:\Program Files\gs\gs10.04.0\bin\gswin64c.exe",
        r"C:\Program Files\gs\gs10.03.1\bin\gswin64c.exe",
        r"C:\Program Files\gs\gs10.03.0\bin\gswin64c.exe",
        r"C:\Program Files\gs\gs10.02.0\bin\gswin64c.exe",
        r"C:\Program Files\gs\gs10.01.0\bin\gswin64c.exe",
        r"C:\Program Files (x86)\gs\gs10.04.0\bin\gswin32c.exe",
    ]
    for p in common_win_paths:
        if os.path.isfile(p):
            return p
    return None

GHOSTSCRIPT_BIN = find_ghostscript_binary()
