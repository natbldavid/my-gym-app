import { getDb, saveDb } from "@/lib/db";

// GET: return everything
export async function GET() {
  const db = await getDb();
  return Response.json(db, { status: 200 });
}

// OPTIONAL: replace everything (admin-style)
export async function PUT(request) {
  const nextDb = await request.json();
  if (!nextDb || typeof nextDb !== "object") {
    return new Response("Invalid JSON body", { status: 400 });
  }
  await saveDb(nextDb);
  return Response.json({ ok: true }, { status: 200 });
}