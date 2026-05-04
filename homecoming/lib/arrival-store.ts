import { Redis } from "@upstash/redis";
import fs from "fs/promises";
import path from "path";

/** Upstash Redis (set on Vercel). Local dev falls back to `data/arrivals.json`. */
const REDIS_KEY = "tipzy_homecoming_arrival_seq";

const DATA_PATH = path.join(process.cwd(), "data", "arrivals.json");

let redisSingleton: Redis | null | undefined;

function getRedis(): Redis | null {
  if (redisSingleton !== undefined) return redisSingleton;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  redisSingleton = url && token ? new Redis({ url, token }) : null;
  return redisSingleton;
}

async function readCount(): Promise<number> {
  try {
    const raw = await fs.readFile(DATA_PATH, "utf-8");
    const data = JSON.parse(raw) as { count?: number };
    return typeof data.count === "number" && data.count >= 0 ? data.count : 0;
  } catch {
    return 0;
  }
}

let fileMutex = Promise.resolve<void>(undefined);

function allocateNextRankFile(): Promise<number> {
  const result = fileMutex.then(async () => {
    await fs.mkdir(path.dirname(DATA_PATH), { recursive: true });
    const prev = await readCount();
    const rank = prev + 1;
    await fs.writeFile(DATA_PATH, JSON.stringify({ count: rank }), "utf-8");
    return rank;
  });
  fileMutex = result.then(() => undefined).catch(() => undefined);
  return result;
}

/** Atomically allocates the next rank. Uses Redis on Vercel when env vars are set. */
export function allocateNextRank(): Promise<number> {
  const redis = getRedis();
  if (redis) {
    return redis.incr(REDIS_KEY);
  }
  return allocateNextRankFile();
}
