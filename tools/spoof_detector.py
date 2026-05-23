import io
import numpy as np


def analyze_spoof(wav_bytes: bytes) -> dict:
    """
    Spectral anti-spoofing heuristic.
    Returns spoof_prob 0.0 (real) -> 1.0 (synthetic/AI).

    Two signals:
    1. Spectral flatness  — AI voices have unnaturally uniform frequency spectrum
    2. Energy CV          — real speech has high variance (pauses, consonants, vowels)
                            AI voices are too smooth / uniform in energy
    """
    from scipy.io import wavfile
    from scipy.signal import spectrogram

    sr, data = wavfile.read(io.BytesIO(wav_bytes))
    if data.dtype == np.int16:
        data = data.astype(np.float32) / 32768.0
    elif data.dtype == np.int32:
        data = data.astype(np.float32) / 2147483648.0
    else:
        data = data.astype(np.float32)
    if data.ndim > 1:
        data = data.mean(axis=1)

    if len(data) < sr * 0.5:
        return {"spoof_prob": 0.5, "spoof_pct": 50, "spoof_verdict": "UNKNOWN"}

    _, _, Sxx = spectrogram(data, sr, nperseg=512, noverlap=256)
    Sxx = np.abs(Sxx) + 1e-10

    # Spectral flatness (geometric mean / arithmetic mean per frame)
    log_mean = np.mean(np.log(Sxx), axis=0)
    arith_log = np.log(np.mean(Sxx, axis=0) + 1e-10)
    flatness = float(np.mean(np.exp(log_mean - arith_log)))
    # Real voice: ~0.005-0.05 | Synthetic: higher, more uniform

    # Energy coefficient of variation over time
    frame_energy = np.sum(Sxx, axis=0)
    cv = float(np.std(frame_energy) / (np.mean(frame_energy) + 1e-10))
    # Real voice: cv > 0.6 (breathing, pauses) | Synthetic: cv < 0.3

    flatness_score = float(np.clip(flatness / 0.08, 0.0, 1.0))
    energy_score = float(np.clip(1.0 - cv / 0.7, 0.0, 1.0))

    spoof_prob = round(0.55 * flatness_score + 0.45 * energy_score, 3)
    spoof_pct = round(spoof_prob * 100)

    if spoof_prob > 0.60:
        spoof_verdict = "SYNTHETIC"
    elif spoof_prob > 0.35:
        spoof_verdict = "UNCERTAIN"
    else:
        spoof_verdict = "REAL"

    return {
        "spoof_prob": spoof_prob,
        "spoof_pct": spoof_pct,
        "spoof_verdict": spoof_verdict,
    }
