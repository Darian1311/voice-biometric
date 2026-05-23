import io
from pydub import AudioSegment
from app.config import MIN_AUDIO_MS

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
