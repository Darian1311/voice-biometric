from fastapi import APIRouter, UploadFile, File, HTTPException
from app.config import THRESHOLD_VALID, THRESHOLD_SUSPECT
from tools.audio_converter import webm_to_wav_bytes
from tools.embedding_extractor import wav_bytes_to_embedding, cosine_similarity
from tools.db_manager import load_all_profiles
from tools.spoof_detector import analyze_spoof

router = APIRouter(prefix="/detect", tags=["detection"])


@router.post("/analyze")
async def analyze(audio: UploadFile = File(...)):
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
        raise HTTPException(500, f"Eroare embedding: {e}")
    profiles = load_all_profiles()

    if not profiles:
        return {"verdict": "NO_PROFILES", "best_match": None, "score_pct": 0, "best_score_raw": 0.0, "all_scores": []}

    scores = []
    for p in profiles:
        sim = cosine_similarity(emb, p["embedding"])
        scores.append({"name": p["name"], "score_pct": max(0, round(sim * 100)), "score_raw": round(sim, 4)})

    scores.sort(key=lambda x: x["score_pct"], reverse=True)
    best = scores[0]

    if best["score_raw"] >= THRESHOLD_VALID:
        verdict = "VALID"
    elif best["score_raw"] >= THRESHOLD_SUSPECT:
        verdict = "SUSPECT"
    else:
        verdict = "ALERT"

    spoof = analyze_spoof(wav)
    if verdict == "VALID" and spoof["spoof_verdict"] == "SYNTHETIC":
        verdict = "CLONE_ALERT"

    return {
        "verdict": verdict,
        "best_match": best["name"],
        "score_pct": best["score_pct"],
        "best_score_raw": best["score_raw"],
        "all_scores": [{"name": s["name"], "score_pct": s["score_pct"]} for s in scores],
        "spoof_pct": spoof["spoof_pct"],
        "spoof_verdict": spoof["spoof_verdict"],
    }
