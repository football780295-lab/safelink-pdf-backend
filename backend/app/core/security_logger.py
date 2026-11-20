import logging
import re

SENSITIVE_PATTERNS = [
    re.compile(r'(password|confirm_password|pass|secret|token)=([^\s&]+)', re.IGNORECASE),
    re.compile(r'("password"|"confirm_password")\s*:\s*"([^"]+)"', re.IGNORECASE),
    re.compile(r'(data:image\/[a-zA-Z]+;base64,)[^\s"]{20,}', re.IGNORECASE),
]

class SensitiveDataFilter(logging.Filter):
    """
    Scrub passwords, secrets, and raw file payloads from all log messages.
    """
    def filter(self, record: logging.LogRecord) -> bool:
        if isinstance(record.msg, str):
            msg = record.msg
            for pattern in SENSITIVE_PATTERNS:
                msg = pattern.sub(r'\1=***REDACTED***', msg)
            record.msg = msg
        return True

def setup_secure_logging():
    logger = logging.getLogger("pdf_tool")
    handler = logging.StreamHandler()
    formatter = logging.Formatter("%(asctime)s [%(levelname)s] %(name)s: %(message)s")
    handler.setFormatter(formatter)
    handler.addFilter(SensitiveDataFilter())
    logger.handlers = [handler]
    logger.setLevel(logging.INFO)
    return logger
