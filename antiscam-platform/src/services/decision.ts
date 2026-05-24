import { config } from "../config";
import type { ActiveCall } from "../types";
import { analyzeBiometric } from "./biometric";
import { transferToVAPI } from "./telnyx";
import { saveScamCall } from "../db/supabase";

// Romanian scam keywords — hits * 20 points each, max 100
export const SCAM_KEYWORDS = [
  "transfer", "cont", "cod", "priză", "urgență",
  "poliție", "accident", "euro", "lei", "bancă", "card", "pin",
  "virement", "iban", "parola", "secret", "rata", "credite",
  "notariat", "procura", "dosar", "amendat", "mandat",
];

function stripDiacritics(s: string): string {
  return s.normalize("NFD").replace(/\p{Mn}/gu, "");
}

const norm = (s: string) => stripDiacritics((s || "").toLowerCase());

export function countKeywordHits(text: string, existing: Set<string>): string[] {
  const t = norm(text);
  const newHits: string[] = [];
  for (const kw of SCAM_KEYWORDS) {
    if (!existing.has(kw) && t.includes(norm(kw))) {
      existing.add(kw);
      newHits.push(kw);
    }
  }
  return newHits;
}

export function calcCombinedScore(keywordHits: Set<string>, voiceScore: number): number {
  const keywordScore = Math.min(100, keywordHits.size * 20);
  const voice = Math.max(0, Math.min(100, voiceScore));
  return Math.round(keywordScore * config.keywordWeight + voice * config.voiceWeight);
}

// Called after each biometric chunk or transcript event.
// Returns true if scam threshold crossed and action was taken.
export async function evaluate(call: ActiveCall): Promise<boolean> {
  if (call.resolved) return false;

  const combined = calcCombinedScore(call.keywordHits, call.lastBiometricScore);
  call.combinedScore = combined;

  console.log(
    `[decision] ${call.callControlId} | keywords:${call.keywordHits.size} voice:${call.lastBiometricScore} → combined:${combined}`
  );

  if (combined >= config.scamThreshold) {
    call.resolved = true;
    console.log(`[decision] SCAM CONFIRMAT (${combined}) → redirect VAPI`);

    const verdict = combined >= 85 ? "scam" : "suspect";
    await saveScamCall({
      victimId: call.victimId,
      fromNumber: call.fromNumber,
      callControlId: call.callControlId,
      combinedScore: combined,
      verdict,
      transcript: call.transcriptBuffer,
      keywordsMatched: [...call.keywordHits],
    }).catch((e) => console.error("[decision] saveScamCall:", e));

    await transferToVAPI(call.callControlId).catch((e) =>
      console.error("[decision] transferToVAPI:", e)
    );
    return true;
  }
  return false;
}

// Called every BIOMETRIC_CHUNK_MS of accumulated audio.
export async function runBiometricCheck(call: ActiveCall): Promise<void> {
  if (call.resolved || call.audioBuffer.length === 0) return;

  const audioChunk = Buffer.concat(call.audioBuffer);
  call.audioBuffer = [];
  call.audioBufferMs = 0;

  try {
    const result = await analyzeBiometric(audioChunk);
    call.lastBiometricScore = result.score;
    console.log(`[decision] biometric score: ${result.score} verdict: ${result.verdict}`);
    await evaluate(call);
  } catch (e) {
    console.error("[decision] biometric error:", (e as Error).message);
  }
}
