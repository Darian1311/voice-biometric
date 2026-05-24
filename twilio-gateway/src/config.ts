import dotenv from "dotenv";

dotenv.config();

function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Lipsește variabila de mediu obligatorie: ${name}`);
  return v;
}

export const config = {
  port: parseInt(process.env.PORT || "3000", 10),

  redisUrl: process.env.REDIS_URL || "redis://127.0.0.1:6379",
  blacklistKey: process.env.REDIS_BLACKLIST_KEY || "scam:blacklist",

  twilioAccountSid: process.env.TWILIO_ACCOUNT_SID || "",
  twilioAuthToken: process.env.TWILIO_AUTH_TOKEN || "",
  validateTwilio: (process.env.VALIDATE_TWILIO || "false").toLowerCase() === "true",
  publicBaseUrl: process.env.PUBLIC_BASE_URL || "",

  grandmaNumber: required("GRANDMA_NUMBER"),

  vapiAssistantId: required("VAPI_ASSISTANT_ID"),
  vapiSipDomain: process.env.VAPI_SIP_DOMAIN || "sip.vapi.ai",

  suspectPrefixes: (process.env.SUSPECT_PREFIXES || "+373,+44,+1,+234")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),

  voiceWeight: parseFloat(process.env.VOICE_WEIGHT || "0.4"),
  keywordWeight: parseFloat(process.env.KEYWORD_WEIGHT || "0.6"),
  grayZoneMin: parseInt(process.env.GRAY_ZONE_MIN || "40", 10),
  invalidMin: parseInt(process.env.INVALID_MIN || "70", 10),
};
