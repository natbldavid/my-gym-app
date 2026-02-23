import { Redis } from "@upstash/redis";
import { initialDb } from "./initial-db";

const DB_KEY = "my-gym-db";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export async function getDb() {
  const db = await redis.get(DB_KEY);

  if (db && typeof db === "object") return db;

  // first run: seed database
  await redis.set(DB_KEY, initialDb);
  return initialDb;
}

export async function saveDb(nextDb) {
  if (!nextDb || typeof nextDb !== "object") {
    throw new Error("saveDb: nextDb must be an object");
  }

  await redis.set(DB_KEY, nextDb);
  return nextDb;
}