import os

import httpx
from fastapi import Header, HTTPException

_INTERNAL_KEY = os.environ.get("INTERNAL_API_KEY", "")


async def verify_token(
    authorization: str = Header(None),
    x_internal_key: str = Header(None, alias="X-Internal-Key"),
):
    # Service-to-service calls (antiscam-platform → biometric) bypass JWT
    if _INTERNAL_KEY and x_internal_key == _INTERNAL_KEY:
        return {"sub": "internal-service"}

    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Neautentificat")

    token = authorization[7:]
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_KEY")
    if not url or not key:
        raise HTTPException(status_code=500, detail="Auth neconfigurat (lipsesc SUPABASE_URL / SUPABASE_KEY)")

    try:
        res = httpx.get(
            f"{url}/auth/v1/user",
            headers={"apikey": key, "Authorization": f"Bearer {token}"},
            timeout=10,
        )
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Eroare verificare auth: {e}")

    if res.status_code != 200:
        raise HTTPException(status_code=401, detail="Token invalid sau expirat")

    return res.json()
