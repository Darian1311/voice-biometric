import { Router } from "express";
import twilio from "twilio";
import { config } from "../config";
import { detectScam } from "../scamDetector";

const router = Router();

router.post("/incoming-call", async (req, res) => {
  const from = (req.body.From as string) || "";
  const twiml = new twilio.twiml.VoiceResponse();

  const check = await detectScam(from);

  if (check.isScam) {
    // Suspect → route to VAPI agent over SIP. Agent listens live and intervenes.
    const dial = twiml.dial({ answerOnBridge: true });
    dial.sip(`sip:${config.vapiAssistantId}@${config.vapiSipDomain}`);
  } else {
    // Clean → forward to protected person. callerId = From so they see the original number.
    // Twilio only honors an arbitrary callerId if that number is verified/owned on the account;
    // otherwise it substitutes a Twilio number.
    const dial = twiml.dial({ callerId: from, answerOnBridge: true });
    dial.number(config.grandmaNumber);
  }

  res.type("text/xml").send(twiml.toString());
});

export default router;
