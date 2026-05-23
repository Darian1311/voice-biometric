import os

THRESHOLD_VALID   = 0.65   # cosine >= 0.65 → VALID
THRESHOLD_SUSPECT = 0.45   # cosine >= 0.45 → SUSPECT, else ALERT

ENROLLMENT_QUESTIONS = 4
SESSION_TTL          = 900   # 15 min
DETECTION_CHUNK_MS   = 4000
DB_PATH              = "voice_registry.db"
MODELS_DIR           = "models/ecapa"
MIN_AUDIO_MS         = 800

os.environ.setdefault("SPEECHBRAIN_LOCAL_STRATEGY", "copy")
