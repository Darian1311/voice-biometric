# Workflow: Voice Biometric System

## Obiectiv
Înrolare vorbitori + detecție live cu scor procentual (VALID/SUSPECT/ALERT).

## Inputs necesari
- Nume persoană (string)
- Fișiere audio WebM/Opus de la browser (~3-5s per întrebare)

## Tools folosite
- `tools/audio_converter.py` — WebM → WAV 16kHz mono via pydub/ffmpeg
- `tools/embedding_extractor.py` — ECAPA-TDNN 192-dim embeddings, cosine similarity
- `tools/db_manager.py` — SQLite CRUD (BLOB numpy float32)

## Fluxuri

### Înrolare (4 pași)
1. `POST /enroll/start` cu `{name}` → returnează `session_id` + prima întrebare
2. User înregistrează audio + `POST /enroll/answer` (multipart: session_id + audio)
3. Repetă pasul 2 pentru toate 4 întrebările
4. `POST /enroll/finish` cu `{session_id}` → medie embeddings → salvat în DB

### Detecție (loop 4s)
1. Browser înregistrează chunk 4s (WebM/Opus)
2. `POST /detect/analyze` cu audio → returneaza scor % + verdict
3. Frontend afișează gauge live

## Scoring
- cosine similarity × 100 = procent
- ≥75% → VALID (verde)
- 50–74% → SUSPECT (portocaliu)
- <50% → ALERT (roșu)

## Edge cases
- Audio < 800ms → 400 Bad Request
- Sesiune expirată (>15min) → 422, user repornește înrolarea
- Nicio amprentă în DB → verdict NO_PROFILES
- WebM incompatibil → pydub ridică excepție → 400

## Pornire server
```powershell
cd c:\Users\HOME\Desktop\Biometric
pip install -r requirements.txt
python -m uvicorn app.main:app --port 8000
# http://127.0.0.1:8000
```

## Prerequisite
- ffmpeg pe PATH: `winget install ffmpeg`
- Model SpeechBrain: descărcat automat la primul request (~80 MB în models/ecapa/)
