from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from pydantic import BaseModel

from app.questions import select_enrollment_questions
from app import session_store
from app.config import ENROLLMENT_QUESTIONS
from tools.audio_converter import webm_to_wav_bytes
from tools.embedding_extractor import wav_bytes_to_embedding, average_embeddings
from tools.db_manager import save_profile

router = APIRouter(prefix="/enroll", tags=["enrollment"])


class StartBody(BaseModel):
    name: str


class FinishBody(BaseModel):
    session_id: str


@router.post("/start")
def enroll_start(body: StartBody):
    if not body.name.strip():
        raise HTTPException(400, "Nume gol")
    questions = select_enrollment_questions(ENROLLMENT_QUESTIONS)
    order = [q["id"] for q in questions]
    sid = session_store.create_session(body.name.strip(), order)
    return {
        "session_id": sid,
        "question_text": questions[0]["text"],
        "question_index": 0,
        "total_questions": len(order),
    }


@router.post("/answer")
async def enroll_answer(
    session_id: str = Form(...),
    audio: UploadFile = File(...),
):
    session = session_store.get_session(session_id)
    if not session:
        raise HTTPException(422, "Sesiune expirata sau invalida")

    raw = await audio.read()
    try:
        wav = webm_to_wav_bytes(raw)
    except ValueError as e:
        raise HTTPException(400, str(e))
    except Exception as e:
        raise HTTPException(400, f"Conversie audio esuata: {e}")

    try:
        emb = wav_bytes_to_embedding(wav)
    except Exception as e:
        raise HTTPException(500, f"Eroare extragere embedding: {e}")
    session_store.add_embedding(session_id, emb)

    done = session["questions_done"]
    total = len(session["question_order"])

    if done >= total:
        return {
            "session_id": session_id,
            "next_question": None,
            "question_index": done,
            "questions_done": done,
            "total_questions": total,
            "status": "ready_to_finalize",
        }

    from app.questions import QUESTION_BANK
    next_q = next(q for q in QUESTION_BANK if q["id"] == session["question_order"][done])
    return {
        "session_id": session_id,
        "next_question": next_q["text"],
        "question_index": done,
        "questions_done": done,
        "total_questions": total,
        "status": "in_progress",
    }


@router.post("/finish")
def enroll_finish(body: FinishBody):
    session = session_store.get_session(body.session_id)
    if not session:
        raise HTTPException(422, "Sesiune expirata sau invalida")
    if not session["embeddings"]:
        raise HTTPException(400, "Nicio înregistrare primită")

    final_emb = average_embeddings(session["embeddings"])
    save_profile(session["name"], final_emb, questions_count=len(session["embeddings"]))
    session_store.delete_session(body.session_id)

    return {"status": "enrolled", "name": session["name"], "embedding_dim": len(final_emb)}
