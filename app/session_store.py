import asyncio
import time
import uuid
import numpy as np
from app.config import SESSION_TTL

_sessions: dict[str, dict] = {}


def create_session(name: str, question_order: list[int]) -> str:
    sid = str(uuid.uuid4())
    _sessions[sid] = {
        "name": name,
        "created_at": time.time(),
        "embeddings": [],
        "question_order": question_order,
        "questions_done": 0,
    }
    return sid


def get_session(sid: str) -> dict | None:
    return _sessions.get(sid)


def add_embedding(sid: str, emb: np.ndarray):
    _sessions[sid]["embeddings"].append(emb)
    _sessions[sid]["questions_done"] += 1


def delete_session(sid: str):
    _sessions.pop(sid, None)


async def cleanup_loop():
    while True:
        await asyncio.sleep(300)
        now = time.time()
        expired = [sid for sid, s in _sessions.items() if now - s["created_at"] > SESSION_TTL]
        for sid in expired:
            del _sessions[sid]
