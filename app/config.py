import os

_FFMPEG_BIN = (
    r"C:\Users\HOME\AppData\Local\Microsoft\WinGet\Packages"
    r"\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe"
    r"\ffmpeg-8.1.1-full_build\bin"
)
if os.path.isdir(_FFMPEG_BIN) and _FFMPEG_BIN not in os.environ.get("PATH", ""):
    os.environ["PATH"] = _FFMPEG_BIN + os.pathsep + os.environ.get("PATH", "")

THRESHOLD_VALID   = 0.65   # cosine >= 0.65 → VALID
THRESHOLD_SUSPECT = 0.45   # cosine >= 0.45 → SUSPECT, else ALERT

ENROLLMENT_QUESTIONS = 4
SESSION_TTL          = 900   # 15 min
DETECTION_CHUNK_MS   = 4000
DB_PATH              = "voice_registry.db"
MODELS_DIR           = "models/ecapa"
MIN_AUDIO_MS         = 800

os.environ.setdefault("SPEECHBRAIN_LOCAL_STRATEGY", "copy")
