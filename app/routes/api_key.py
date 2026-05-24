import os
from fastapi import Header, HTTPException

API_KEY = os.environ.get("API_KEY", "biometric-dev-key-2024")


async def verify_api_key(x_api_key: str = Header(None)):
    if not x_api_key or x_api_key != API_KEY:
        raise HTTPException(status_code=401, detail="Invalid or missing API key")
    return {"key": x_api_key}
