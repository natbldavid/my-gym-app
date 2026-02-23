import { getDb, saveDb } from "@/lib/db";

export async function GET() {
  try {
    const db = await getDb();
    return Response.json(db, { status: 200 });
  } catch (err) {
    console.error("GET /api/db failed:", err);
    return Response.json({ ok: false, error: String(err?.message || err) }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const nextDb = await request.json();
    if (!nextDb || typeof nextDb !== "object") {
      return Response.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
    }
    await saveDb(nextDb);
    return Response.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error("PUT /api/db failed:", err);
    return Response.json({ ok: false, error: String(err?.message || err) }, { status: 500 });
  }
}