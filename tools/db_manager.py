import sqlite3
import numpy as np
from datetime import datetime
from app.config import DB_PATH


def _conn():
    return sqlite3.connect(DB_PATH)


def init_db():
    with _conn() as c:
        c.execute("""
            CREATE TABLE IF NOT EXISTS voice_profiles (
                id             INTEGER PRIMARY KEY AUTOINCREMENT,
                name           TEXT NOT NULL UNIQUE,
                embedding      BLOB NOT NULL,
                embedding_dim  INTEGER DEFAULT 192,
                questions_count INTEGER DEFAULT 0,
                enrolled_at    TEXT NOT NULL
            )
        """)


def save_profile(name: str, embedding: np.ndarray, questions_count: int = 4):
    blob = embedding.astype(np.float32).tobytes()
    now = datetime.utcnow().isoformat()
    with _conn() as c:
        c.execute("""
            INSERT INTO voice_profiles (name, embedding, embedding_dim, questions_count, enrolled_at)
            VALUES (?, ?, ?, ?, ?)
            ON CONFLICT(name) DO UPDATE SET
                embedding=excluded.embedding,
                embedding_dim=excluded.embedding_dim,
                questions_count=excluded.questions_count,
                enrolled_at=excluded.enrolled_at
        """, (name, blob, len(embedding), questions_count, now))


def load_all_profiles() -> list[dict]:
    with _conn() as c:
        rows = c.execute(
            "SELECT name, embedding, embedding_dim, questions_count, enrolled_at FROM voice_profiles"
        ).fetchall()
    profiles = []
    for name, blob, dim, qcount, enrolled_at in rows:
        emb = np.frombuffer(blob, dtype=np.float32).copy()
        profiles.append({
            "name": name,
            "embedding": emb,
            "embedding_dim": dim,
            "questions_count": qcount,
            "enrolled_at": enrolled_at,
        })
    return profiles


def list_profiles() -> list[dict]:
    with _conn() as c:
        rows = c.execute(
            "SELECT name, embedding_dim, questions_count, enrolled_at FROM voice_profiles ORDER BY enrolled_at DESC"
        ).fetchall()
    return [
        {"name": r[0], "embedding_dim": r[1], "questions_count": r[2], "enrolled_at": r[3]}
        for r in rows
    ]


def delete_profile(name: str) -> bool:
    with _conn() as c:
        cur = c.execute("DELETE FROM voice_profiles WHERE name=?", (name,))
        return cur.rowcount > 0
