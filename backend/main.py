import sys
import types
from pathlib import Path

# Allow `from backend.app...` imports to work whether running from repo root or `backend/` (Vercel Services)
backend_dir = Path(__file__).resolve().parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

if "backend" not in sys.modules:
    backend_pkg = types.ModuleType("backend")
    backend_pkg.__path__ = [str(backend_dir)]
    backend_pkg.__package__ = "backend"
    sys.modules["backend"] = backend_pkg

from backend.app.main import app  # noqa: E402, F401
