import dotenv from "dotenv";
dotenv.config();

function req(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Lipsește variabila de mediu obligatorie: ${name}`);
  return v;
}

export const config = {
  port: parseInt(process.env.PORT || "3000", 10),
  webhookBaseUrl: process.env.WEBHOOK_BASE_URL || "",

  telnyxApiKey: req("TELNYX_API_KEY"),
  telnyxPublicKey: process.env.TELNYX_PUBLIC_KEY || "",
  telnyxNumber: req("TELNYX_NUMBER"),
  telnyxConnectionId: req("TELNYX_CONNECTION_ID"),

  vapiAssistantId: req("VAPI_ASSISTANT_ID"),
  vapiSipDomain: process.env.VAPI_SIP_DOMAIN || "sip.vapi.ai",

  deepgramApiKey: req("DEEPGRAM_API_KEY"),

  voiceBiometricUrl: req("VOICE_BIOMETRIC_URL"),
  internalApiKey: req("INTERNAL_API_KEY"),

  supabaseUrl: req("SUPABASE_URL"),
  supabaseServiceKey: req("SUPABASE_SERVICE_KEY"),

  scamThreshold: parseInt(process.env.SCAM_THRESHOLD || "70", 10),
  biometricChunkMs: parseInt(process.env.BIOMETRIC_CHUNK_MS || "7000", 10),

  voiceWeight: parseFloat(process.env.VOICE_WEIGHT || "0.5"),
  keywordWeight: parseFloat(process.env.KEYWORD_WEIGHT || "0.5"),
};
