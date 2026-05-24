import { Router } from "express";
import { createClient } from "@supabase/supabase-js";
import { config } from "../config";
import { sendActivationSms } from "../services/telnyx";

const sb = createClient(config.supabaseUrl, config.supabaseServiceKey);
const router = Router();

// POST /onboard/activate
// Body: { phone: "+40712345678" }
// Creates victim profile (or finds existing) → sends SMS with activation deep link.
router.post("/onboard/activate", async (req, res) => {
  const { phone } = req.body as { phone?: string };

  if (!phone || !/^\+40[0-9]{9}$/.test(phone.replace(/\s/g, ""))) {
    return res.status(400).json({ error: "Număr invalid. Format: +40712345678" });
  }

  const normalized = phone.replace(/\s/g, "");

  // Upsert victim profile — idempotent, safe to call multiple times
  const { error: dbErr } = await sb.from("victims").upsert(
    { phone: normalized, subscription_active: false },
    { onConflict: "phone", ignoreDuplicates: true }
  );

  if (dbErr) {
    console.error("[onboard] db error:", dbErr.message);
    return res.status(500).json({ error: "Eroare internă" });
  }

  try {
    await sendActivationSms(normalized);
  } catch (e) {
    console.error("[onboard] SMS error:", (e as Error).message);
    return res.status(500).json({
      error: "Nu am putut trimite SMS-ul. Verifică numărul și încearcă din nou.",
    });
  }

  return res.json({
    status: "sms_sent",
    message: "SMS trimis. Apasa linkul din SMS si apoi Suna.",
  });
});

// POST /onboard/confirm
// Body: { phone: "+40712345678" }
// Called after user confirms they dialed the USSD code.
// Marks victim as pending verification (not fully active until test call confirms forwarding).
router.post("/onboard/confirm", async (req, res) => {
  const { phone } = req.body as { phone?: string };
  if (!phone) return res.status(400).json({ error: "Lipsește numărul" });

  const normalized = phone.replace(/\s/g, "");

  // Mark as active — full verification via test call is optional (Phase 2)
  const { error } = await sb
    .from("victims")
    .update({ subscription_active: true })
    .eq("phone", normalized);

  if (error) {
    return res.status(500).json({ error: "Eroare internă" });
  }

  return res.json({ status: "active", message: "Protecție activată." });
});

export default router;
