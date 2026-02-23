import { getDb, saveDb } from "@/lib/db";

function isoNow() {
  return new Date().toISOString();
}

/**
 * Shape stored in db.gym_live_draft:
 * {
 *   saved_at: ISO,
 *   day_number: number,
 *   day_name: string,
 *   duration_minutes: number,
 *   exercises: [
 *     { exercise_id, exercise_name, sets:[{weight?, reps}, ...] }
 *   ]
 * }
 */

export async function GET() {
  try {
    const db = await getDb();
    const draft = db?.gym_live_draft ?? null;
    return Response.json({ ok: true, draft }, { status: 200 });
  } catch (err) {
    console.error("GET /api/gym-live failed:", err);
    return Response.json(
      { ok: false, error: String(err?.message || err) },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();

    // Minimal validation
    if (!body || typeof body !== "object") {
      return Response.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
    }
    if (!body.day_number) {
      return Response.json({ ok: false, error: "Missing day_number" }, { status: 400 });
    }

    const db = await getDb();

    // Ensure field exists even if older db
    if (!("gym_live_draft" in db)) db.gym_live_draft = null;

    db.gym_live_draft = {
      saved_at: isoNow(),
      day_number: Number(body.day_number),
      day_name: String(body.day_name || ""),
      duration_minutes: Number(body.duration_minutes || 0),
      exercises: Array.isArray(body.exercises) ? body.exercises : [],
    };

    await saveDb(db);
    return Response.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error("PUT /api/gym-live failed:", err);
    return Response.json(
      { ok: false, error: String(err?.message || err) },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const db = await getDb();
    db.gym_live_draft = null;
    await saveDb(db);
    return Response.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error("DELETE /api/gym-live failed:", err);
    return Response.json(
      { ok: false, error: String(err?.message || err) },
      { status: 500 }
    );
  }
}