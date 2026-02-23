import { getDb } from "@/lib/db";

export async function GET() {
  try {
    const db = await getDb();
    return Response.json({ passcode: db?.passcode?.passcode ?? null }, { status: 200 });
  } catch (err) {
    console.error("GET /api/passcode failed:", err);
    return Response.json({ ok: false, error: String(err?.message || err) }, { status: 500 });
  }
}