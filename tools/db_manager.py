import base64
import os
import numpy as np
from datetime import datetime

import httpx

_URL = None
_HEADERS = None


def _get_headers():
    global _URL, _HEADERS
    if _HEADERS is None:
        url = os.environ["SUPABASE_URL"]
        key = os.environ["SUPABASE_KEY"]
        _URL = f"{url}/rest/v1/voice_profiles"
        _HEADERS = {
            "apikey": key,
            "Authorization": f"Bearer {key}",
            "Content-Type": "application/json",
            "Prefer": "return=representation",
        }
    return _URL, _HEADERS


def init_db():
    pass


def save_profile(name: str, embedding: np.ndarray, questions_count: int = 4):
    url, headers = _get_headers()
    blob = base64.b64encode(embedding.astype(np.float32).tobytes()).decode()
    now = datetime.utcnow().isoformat()
    h = {**headers, "Prefer": "resolution=merge-duplicates,return=representation"}
    try:
        res = httpx.post(url, headers=h, json={
            "name": name,
            "embedding": blob,
            "embedding_dim": int(len(embedding)),
            "questions_count": questions_count,
            "enrolled_at": now,
        })
        if res.status_code == 409:
            raise ValueError(f"Profil '{name}' există deja. Alege alt nume.")
        res.raise_for_status()
    except httpx.HTTPStatusError as e:
        raise ValueError(f"DB error: {e.response.status_code} - {e.response.text}")


def load_all_profiles() -> list[dict]:
    url, headers = _get_headers()
    res = httpx.get(
        url,
        headers=headers,
        params={"select": "name,embedding,embedding_dim,questions_count,enrolled_at"},
    )
    res.raise_for_status()
    profiles = []
    for row in res.json():
        emb = np.frombuffer(base64.b64decode(row["embedding"]), dtype=np.float32).copy()
        profiles.append({
            "name": row["name"],
            "embedding": emb,
            "embedding_dim": row["embedding_dim"],
            "questions_count": row["questions_count"],
            "enrolled_at": row["enrolled_at"],
        })
    return profiles


def list_profiles() -> list[dict]:
    url, headers = _get_headers()
    res = httpx.get(
        url,
        headers=headers,
        params={
            "select": "name,embedding_dim,questions_count,enrolled_at",
            "order": "enrolled_at.desc",
        },
    )
    res.raise_for_status()
    return res.json()


def delete_profile(name: str) -> bool:
    url, headers = _get_headers()
    res = httpx.delete(
        url,
        headers=headers,
        params={"name": f"eq.{name}"},
    )
    res.raise_for_status()
    return len(res.json()) > 0
