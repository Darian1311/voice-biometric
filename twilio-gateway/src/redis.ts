import Redis from "ioredis";
import { config } from "./config";

export const redis = new Redis(config.redisUrl, {
  maxRetriesPerRequest: 2,
  lazyConnect: false,
});

redis.on("error", (e) => console.error("[redis] error:", e.message));
redis.on("connect", () => console.log("[redis] conectat"));
