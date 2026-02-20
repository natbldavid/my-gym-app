import { kv } from "@vercel/kv";
import { initialDb } from "./initial-db";

const DB_KEY = "my-gym-db"; // single JSON blob key

export async function getDb() {
  const db = await kv.get(DB_KEY);
  if (db) return db;

  // First run: seed with your initial JSON
  await kv.set(DB_KEY, initialDb);
  return initialDb;
}

export async function saveDb(nextDb) {
  await kv.set(DB_KEY, nextDb);
  return nextDb;
}