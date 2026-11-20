from fastapi import Request
from slowapi import Limiter


def get_client_ip(request: Request) -> str:
    """Resolve real client IP behind reverse proxies (Vercel / Nginx) safely."""
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    if request.client and request.client.host:
        return request.client.host
    return "127.0.0.1"


# Rate limiter instance using client IP
limiter = Limiter(key_func=get_client_ip, default_limits=["120/minute"])
