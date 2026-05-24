import { config } from "./config";

export const scamKeywords = [
  "transfer",
  "cont",
  "cod",
  "priză",
  "urgență",
  "poliție",
  "accident",
  "euro",
  "lei",
  "bancă",
  "card",
  "pin",
];

export type Decision = "valid" | "gray_zone" | "invalid";

export interface AnalysisResult {
  voiceScore: number;
  keywordScore: number;
  combinedScore: number;
  matchedKeywords: string[];
  decision: Decision;
  instruction: string;
}

const INSTRUCTIONS: Record<Decision, string> = {
  valid: "Conversație sigură. Nu interveni, lasă apelul să continue.",
  gray_zone:
    "Posibil scam. Intervino vocal: avertizează persoana să nu ofere coduri, parole, PIN sau bani și să verifice identitatea apelantului.",
  invalid:
    "Scam confirmat. Încheie apelul imediat și anunță că a fost identificat ca tentativă de fraudă.",
};

function stripDiacritics(s: string): string {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "");
}

const norm = (s: string) => stripDiacritics((s || "").toLowerCase());

export function matchKeywords(transcript = "", detected: string[] = []): string[] {
  const found = new Set<string>();

  for (const k of detected) {
    const nk = norm(k);
    const match = scamKeywords.find((sk) => norm(sk) === nk);
    if (match) found.add(match);
  }

  if (transcript) {
    const t = norm(transcript);
    for (const sk of scamKeywords) {
      if (t.includes(norm(sk))) found.add(sk);
    }
  }

  return [...found];
}

export function keywordScore(matched: string[]): number {
  return Math.min(100, matched.length * 20);
}

function clamp100(n: number): number {
  if (Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(100, n));
}

export function analyze(
  voiceScore: number,
  transcript?: string,
  detected?: string[]
): AnalysisResult {
  const matched = matchKeywords(transcript, detected);
  const kScore = keywordScore(matched);
  const vScore = clamp100(voiceScore);
  const combined = Math.round(vScore * config.voiceWeight + kScore * config.keywordWeight);

  let decision: Decision;
  if (combined >= config.invalidMin) decision = "invalid";
  else if (combined >= config.grayZoneMin) decision = "gray_zone";
  else decision = "valid";

  return {
    voiceScore: vScore,
    keywordScore: kScore,
    combinedScore: combined,
    matchedKeywords: matched,
    decision,
    instruction: INSTRUCTIONS[decision],
  };
}
