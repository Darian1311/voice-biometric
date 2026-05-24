import { WebSocketServer, WebSocket } from "ws";
import type { IncomingMessage } from "http";
import type { ActiveCall } from "../types";
import { createSTTSession, type DeepgramSession } from "../services/deepgram";
import { countKeywordHits, evaluate, runBiometricCheck } from "../services/decision";
import { config } from "../config";

// In-memory call state — key = callControlId
export const activeCalls = new Map<string, ActiveCall>();
const deepgramSessions = new Map<string, DeepgramSession>();

export function createStreamServer(): WebSocketServer {
  const wss = new WebSocketServer({ noServer: true });

  wss.on("connection", (ws: WebSocket, req: IncomingMessage) => {
    let callControlId = "";

    ws.on("message", (raw: Buffer) => {
      let msg: Record<string, unknown>;
      try {
        msg = JSON.parse(raw.toString());
      } catch {
        return;
      }

      const event = msg.event as string;

      if (event === "connected") {
        console.log("[stream] Telnyx WebSocket conectat");
        return;
      }

      if (event === "start") {
        const startData = msg.start as Record<string, unknown>;
        callControlId = (startData?.call_control_id as string) || "";
        console.log(`[stream] start pentru callControlId: ${callControlId}`);

        const call = activeCalls.get(callControlId);
        if (!call) {
          console.warn(`[stream] callControlId necunoscut: ${callControlId}`);
          return;
        }

        const dg = createSTTSession(
          (text) => {
            // New transcript segment received
            call.transcriptBuffer += " " + text;
            const newHits = countKeywordHits(text, call.keywordHits);
            if (newHits.length > 0) {
              console.log(`[stream] keywords noi: ${newHits.join(", ")}`);
              evaluate(call).catch((e) => console.error("[stream] evaluate:", e));
            }
          },
          (err) => console.error("[stream] deepgram error:", err.message)
        );

        deepgramSessions.set(callControlId, dg);
        return;
      }

      if (event === "media") {
        const media = msg.media as Record<string, unknown>;
        const payload = media?.payload as string;
        const track = (media?.track as string) || "inbound";

        if (!payload || track !== "inbound_track") return;

        const call = activeCalls.get(callControlId);
        if (!call || call.resolved) return;

        const audioChunk = Buffer.from(payload, "base64");

        // Pipe to Deepgram STT
        deepgramSessions.get(callControlId)?.send(audioChunk);

        // Accumulate for biometric analysis
        call.audioBuffer.push(audioChunk);
        // mulaw 8kHz = 8000 bytes/s → chunk duration in ms = bytes / 8
        call.audioBufferMs += audioChunk.length / 8;

        if (call.audioBufferMs >= config.biometricChunkMs) {
          runBiometricCheck(call).catch((e) =>
            console.error("[stream] biometric chunk:", e)
          );
        }
        return;
      }

      if (event === "stop") {
        console.log(`[stream] stop pentru: ${callControlId}`);
        cleanupCall(callControlId);
        return;
      }
    });

    ws.on("close", () => {
      if (callControlId) cleanupCall(callControlId);
    });

    ws.on("error", (e) => console.error("[stream] ws error:", e.message));
  });

  return wss;
}

export function registerCall(call: ActiveCall): void {
  activeCalls.set(call.callControlId, call);
}

export function cleanupCall(callControlId: string): void {
  deepgramSessions.get(callControlId)?.close();
  deepgramSessions.delete(callControlId);
  activeCalls.delete(callControlId);
}
