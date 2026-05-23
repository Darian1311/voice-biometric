import io
import os
from pydub import AudioSegment
from pydub.utils import which
from app.config import MIN_AUDIO_MS

_FFMPEG_WINGET = (
    r"C:\Users\HOME\AppData\Local\Microsoft\WinGet\Packages"
    r"\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe"
    r"\ffmpeg-8.1.1-full_build\bin\ffmpeg.exe"
)
if not which("ffmpeg") and os.path.exists(_FFMPEG_WINGET):
    AudioSegment.converter = _FFMPEG_WINGET

TARGET_SR    = 16000
TARGET_CH    = 1
TARGET_WIDTH = 2  # 16-bit PCM


def webm_to_wav_bytes(raw: bytes) -> bytes:
    audio = AudioSegment.from_file(io.BytesIO(raw), format="webm")
    audio = (audio
             .set_frame_rate(TARGET_SR)
             .set_channels(TARGET_CH)
             .set_sample_width(TARGET_WIDTH))
    if len(audio) < MIN_AUDIO_MS:
        raise ValueError(f"Audio prea scurt: {len(audio)}ms (minim {MIN_AUDIO_MS}ms)")
    buf = io.BytesIO()
    audio.export(buf, format="wav")
    buf.seek(0)
    return buf.read()
