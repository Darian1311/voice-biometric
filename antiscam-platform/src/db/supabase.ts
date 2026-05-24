import { createClient } from "@supabase/supabase-js";
import { config } from "../config";
import type { VictimProfile, TrustedContact } from "../types";

const sb = createClient(config.supabaseUrl, config.supabaseServiceKey);

export async function getVictimByPhone(phone: string): Promise<VictimProfile | null> {
  const { data, error } = await sb
    .from("victims")
    .select("*")
    .eq("phone", phone)
    .single();
  if (error || !data) return null;
  return data as VictimProfile;
}

export async function getWhitelistedContact(
  victimId: string,
  fromPhone: string
): Promise<TrustedContact | null> {
  const { data } = await sb
    .from("trusted_contacts")
    .select("*")
    .eq("victim_id", victimId)
    .eq("phone", fromPhone)
    .single();
  return data ? (data as TrustedContact) : null;
}

export async function saveScamCall(params: {
  victimId: string;
  fromNumber: string;
  callControlId: string;
  combinedScore: number;
  verdict: "scam" | "suspect" | "clean";
  transcript: string;
  keywordsMatched: string[];
}): Promise<void> {
  const { error } = await sb.from("scam_calls").insert({
    victim_id: params.victimId,
    from_number: params.fromNumber,
    call_control_id: params.callControlId,
    combined_score: params.combinedScore,
    verdict: params.verdict,
    transcript: params.transcript,
    keywords_matched: params.keywordsMatched,
  });
  if (error) console.error("[db] saveScamCall error:", error.message);
}
