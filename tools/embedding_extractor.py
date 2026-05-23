import io
import os

os.environ["SPEECHBRAIN_LOCAL_STRATEGY"] = "copy"

import numpy as np
import torch
import torchaudio

_encoder = None


def get_encoder():
    global _encoder
    if _encoder is None:
        from speechbrain.inference.speaker import EncoderClassifier
        from speechbrain.utils.fetching import LocalStrategy
        from app.config import MODELS_DIR
        _encoder = EncoderClassifier.from_hparams(
            source="speechbrain/spkrec-ecapa-voxceleb",
            savedir=MODELS_DIR,
            use_auth_token=False,
            local_strategy=LocalStrategy.COPY,
        )
    return _encoder


def wav_bytes_to_embedding(wav_bytes: bytes) -> np.ndarray:
    waveform, sr = torchaudio.load(io.BytesIO(wav_bytes))
    if sr != 16000:
        waveform = torchaudio.functional.resample(waveform, sr, 16000)
    if waveform.shape[0] > 1:
        waveform = waveform.mean(0, keepdim=True)
    encoder = get_encoder()
    with torch.no_grad():
        emb = encoder.encode_batch(waveform).squeeze().numpy()
    norm = np.linalg.norm(emb)
    return emb / norm if norm > 1e-8 else emb


def average_embeddings(embeddings: list[np.ndarray]) -> np.ndarray:
    mean = np.stack(embeddings).mean(axis=0)
    norm = np.linalg.norm(mean)
    return mean / norm if norm > 1e-8 else mean


def cosine_similarity(a: np.ndarray, b: np.ndarray) -> float:
    return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b) + 1e-8))
