import { Router, type Request, type Response } from "express";
import Telnyx from "telnyx";
import { config } from "../config";
import { getVictimByPhone, getWhitelistedContact } from "../db/supabase";
import {
  answerCall,
  startStreaming,
  dialVictim,
  bridgeCalls,
  hangupCall,
} from "../services/telnyx";
import { registerCall, activeCalls } from "../stream/handler";
import type { TelnyxWebhookEvent } from "../types";

const telnyx = new (Telnyx as any)(config.telnyxApiKey);
const router = Router();

router.post("/webhook/telnyx", async (req: Request, res: Response) => {
  // Verify Telnyx webhook signature if public key is configured
  if (config.telnyxPublicKey) {
    try {
      telnyx.webhooks.constructEvent(
        JSON.stringify(req.body),
        req.headers["telnyx-signature-ed25519"] as string,
        req.headers["telnyx-timestamp"] as string,
        config.telnyxPublicKey
      );
    } catch {
      return res.status(400).json({ error: "Semnătură invalidă" });
    }
  }

  // Always acknowledge immediately — Telnyx expects 200 fast
  res.sendStatus(200);

  const event = req.body as TelnyxWebhookEvent;
  const { event_type, payload } = event.data;

  console.log(`[webhook] ${event_type} | from:${payload?.from} to:${payload?.to}`);

  try {
    await handleEvent(event_type, payload);
  } catch (e) {
    console.error(`[webhook] eroare la ${event_type}:`, (e as Error).message);
  }
});

async function handleEvent(
  eventType: string,
  payload: TelnyxWebhookEvent["data"]["payload"]
): Promise<void> {
  const { call_control_id, from, to } = payload;

  switch (eventType) {
    case "call.initiated": {
      // "to" = victim's phone (the original number dialed by scammer, passed through forwarding)
      const victimPhone = to;
      const victim = await getVictimByPhone(victimPhone);

      if (!victim) {
        console.warn(`[webhook] victimă necunoscută pentru numărul: ${victimPhone}`);
        await hangupCall(call_control_id);
        return;
      }

      if (!victim.subscription_active) {
        console.log(`[webhook] abonament inactiv pentru: ${victimPhone} → forward direct`);
        await answerAndForwardDirect(call_control_id, from, victim.phone);
        return;
      }

      // Whitelist check: if caller is a trusted contact AND whitelist is enabled → forward direct
      if (victim.whitelist_enabled) {
        const trusted = await getWhitelistedContact(victim.id, from);
        if (trusted) {
          console.log(`[webhook] whitelist hit: ${from} → forward direct fără analiză`);
          await answerAndForwardDirect(call_control_id, from, victim.phone);
          return;
        }
      }

      // Suspect call → answer, start streaming, dial victim
      await answerCall(call_control_id);

      registerCall({
        callControlId: call_control_id,
        fromNumber: from,
        victimId: victim.id,
        victimPhone: victim.phone,
        transcriptBuffer: "",
        audioBuffer: [],
        audioBufferMs: 0,
        combinedScore: 0,
        keywordHits: new Set(),
        lastBiometricScore: 0,
        resolved: false,
      });

      // Start media stream before bridging so we capture audio from the start
      await startStreaming(call_control_id);

      // Dial victim with scammer's callerId so they see the original number
      const outboundId = await dialVictim(from, victim.phone, call_control_id);
      const callState = activeCalls.get(call_control_id);
      if (callState) callState.outboundCallControlId = outboundId;

      break;
    }

    case "call.answered": {
      // Outbound leg answered (victim picked up) → bridge with inbound
      const clientState = payload.client_state
        ? Buffer.from(payload.client_state as string, "base64").toString()
        : "";

      const inboundCallControlId = clientState;
      if (!inboundCallControlId) break;

      console.log(`[webhook] victima a răspuns → bridge cu ${inboundCallControlId}`);
      await bridgeCalls(inboundCallControlId, call_control_id);
      break;
    }

    case "call.hangup": {
      const callState = activeCalls.get(call_control_id);
      if (callState) {
        console.log(`[webhook] hangup | score final: ${callState.combinedScore}`);
      }
      break;
    }
  }
}

async function answerAndForwardDirect(
  callControlId: string,
  fromNumber: string,
  victimPhone: string
): Promise<void> {
  await answerCall(callControlId);
  const outboundId = await dialVictim(fromNumber, victimPhone, callControlId);
  console.log(`[webhook] forward direct → outbound ${outboundId}`);
}

export default router;
