import { Router } from "express";
import { analyze } from "../scoring";

const router = Router();

// Accepts either a flat body { voiceScore, transcript, detectedKeywords }
// or VAPI's nested tool-call payload, and returns the scoring decision.
function extractArgs(body: any): {
  voiceScore: number;
  transcript: string;
  detectedKeywords: string[];
  toolCallId?: string;
} {
  const toolCall = body?.message?.toolCalls?.[0] ?? body?.message?.toolCallList?.[0];
  let args: any = body ?? {};
  let toolCallId: string | undefined;

  if (toolCall) {
    toolCallId = toolCall.id;
    const raw = toolCall.function?.arguments ?? toolCall.arguments ?? {};
    args = typeof raw === "string" ? safeParse(raw) : raw;
  }

  return {
    voiceScore: Number(args.voiceScore ?? 0),
    transcript: String(args.transcript ?? ""),
    detectedKeywords: Array.isArray(args.detectedKeywords) ? args.detectedKeywords : [],
    toolCallId,
  };
}

function safeParse(s: string): any {
  try {
    return JSON.parse(s);
  } catch {
    return {};
  }
}

router.post("/vapi/analyze-voice", (req, res) => {
  const { voiceScore, transcript, detectedKeywords, toolCallId } = extractArgs(req.body);
  const result = analyze(voiceScore, transcript, detectedKeywords);

  // VAPI expects tool results under `results` when a toolCallId is present.
  if (toolCallId) {
    return res.json({
      results: [{ toolCallId, result: JSON.stringify(result) }],
      ...result,
    });
  }

  res.json(result);
});

export default router;
