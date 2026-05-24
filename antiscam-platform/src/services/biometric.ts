import { spawn } from "child_process";
import FormData from "form-data";
import { config } from "../config";

// Convert raw mulaw 8kHz mono → WAV 16kHz mono via ffmpeg (already on PATH from biometric service)
async function mulawToWav(mulawBuffer: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const ff = spawn("ffmpeg", [
      "-f", "mulaw", "-ar", "8000", "-ac", "1",  // input format
      "-i", "pipe:0",
      "-f", "wav", "-ar", "16000", "-ac", "1",   // output format
      "pipe:1",
    ]);

    const chunks: Buffer[] = [];
    ff.stdout.on("data", (d: Buffer) => chunks.push(d));
    ff.stdout.on("end", () => resolve(Buffer.concat(chunks)));
    ff.stderr.on("data", () => { /* suppress ffmpeg logs */ });
    ff.on("error", reject);

    ff.stdin.write(mulawBuffer);
    ff.stdin.end();
  });
}

export interface BiometricResult {
  score: number;      // 0-100
  verdict: string;
}

// POST WAV to existing biometric /detect/analyze endpoint.
// Returns voice score 0-100 (score_pct from biometric service).
export async function analyzeBiometric(mulawBuffer: Buffer): Promise<BiometricResult> {
  const wav = await mulawToWav(mulawBuffer);

  const form = new FormData();
  form.append("audio", wav, { filename: "chunk.wav", contentType: "audio/wav" });

  const res = await fetch(`${config.voiceBiometricUrl}/detect/analyze`, {
    method: "POST",
    headers: {
      "X-Internal-Key": config.internalApiKey,
      ...form.getHeaders(),
    },
    body: new Uint8Array(form.getBuffer()) as unknown as BodyInit,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Biometric API ${res.status}: ${text}`);
  }

  const data = await res.json() as { score_pct?: number; verdict?: string };
  return {
    score: data.score_pct ?? 0,
    verdict: data.verdict ?? "unknown",
  };
}
