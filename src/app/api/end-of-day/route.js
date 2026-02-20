import { getDb, saveDb } from "@/lib/db";

function isoNow() {
  return new Date().toISOString();
}

function makeId(prefix) {
  // good enough for personal use
  return `${prefix}_${Date.now()}`;
}

export async function POST(request) {
  const body = await request.json();

  // Expected shape from your End of Day form/wizard:
  // {
  //   date: "YYYY-MM-DD",
  //   protein_grams: number | null,
  //   football_minutes: number | null,
  //   squash_minutes: number | null,
  //   gym: { day_number, day_name, duration_minutes, exercises:[{exercise_id, exercise_name, sets:[{weight,reps}]}] } | null
  // }

  if (!body?.date) return new Response("Missing date", { status: 400 });

  const db = await getDb();

  // Protein upsert-by-date
  if (body.protein_grams != null) {
    const idx = db.protein_intake.findIndex((x) => x.date === body.date);
    const entry = {
      entry_id: idx >= 0 ? db.protein_intake[idx].entry_id : makeId("pi"),
      date: body.date,
      grams: Number(body.protein_grams),
      created_at: idx >= 0 ? db.protein_intake[idx].created_at : isoNow(),
    };
    if (idx >= 0) db.protein_intake[idx] = entry;
    else db.protein_intake.push(entry);
  }

  // Football
  if (body.football_minutes != null && Number(body.football_minutes) > 0) {
    db.football_sessions.push({
      entry_id: makeId("fb"),
      date: body.date,
      duration_minutes: Number(body.football_minutes),
      created_at: isoNow(),
    });
  }

  // Squash
  if (body.squash_minutes != null && Number(body.squash_minutes) > 0) {
    db.squash_sessions.push({
      entry_id: makeId("sq"),
      date: body.date,
      duration_minutes: Number(body.squash_minutes),
      created_at: isoNow(),
    });
  }

  // Gym session
  if (body.gym) {
    db.gym_sessions.push({
      session_id: makeId("gs"),
      session_date: body.date,
      gym_day: {
        day_number: Number(body.gym.day_number),
        day_name: body.gym.day_name,
      },
      duration_minutes: Number(body.gym.duration_minutes || 0),
      exercises: Array.isArray(body.gym.exercises) ? body.gym.exercises : [],
      created_at: isoNow(),
    });
  }

  await saveDb(db);
  return Response.json({ ok: true });
}