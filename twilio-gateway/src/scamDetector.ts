import { redis } from "./redis";
import { config } from "./config";

export interface ScamCheck {
  isScam: boolean;
  reason: string;
}

export function normalizeNumber(n: string): string {
  return (n || "").replace(/[\s()-]/g, "");
}

export async function detectScam(callerNumber: string): Promise<ScamCheck> {
  const num = normalizeNumber(callerNumber);
  if (!num) return { isScam: false, reason: "no_caller_id" };

  const prefix = config.suspectPrefixes.find((p) => num.startsWith(p));
  if (prefix) return { isScam: true, reason: `prefix_suspect:${prefix}` };

  // Redis may be down — fall back to prefix-only screening so the call still routes.
  try {
    const hit = await redis.sismember(config.blacklistKey, num);
    if (hit) return { isScam: true, reason: "blacklist" };
  } catch (e) {
    console.error("[detectScam] redis indisponibil, doar prefix check:", (e as Error).message);
  }

  return { isScam: false, reason: "clean" };
}
