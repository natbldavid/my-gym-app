import { getDb, saveDb } from "@/lib/db";

function isoNow() {
  return new Date().toISOString();
}

function makeId(prefix) {
  return `${prefix}_${Date.now()}`;
}

function isoFromDateOnly(yyyy_mm_dd) {
  // Date-only string → ISO (UTC midnight)
  return new Date(yyyy_mm_dd).toISOString();
}

function findTemplateExercise(db, exercise_id) {
  for (const day of db.gym_days_template || []) {
    for (const ex of day.exercises || []) {
      if (ex.exercise_id === exercise_id) return ex;
    }
  }
  return null;
}

function maybeUpdateCurrentWeight(db, dateISO, gymExercises) {
  // gymExercises: [{ exercise_id, sets:[{weight,reps},...]}]
  for (const ex of gymExercises || []) {
    if (!ex?.exercise_id) continue;
    const sets = Array.isArray(ex.sets) ? ex.sets : [];
    if (sets.length !== 3) continue;

    const weights = sets.map((s) => (s?.weight == null ? null : Number(s.weight)));
    if (weights.some((w) => w == null || Number.isNaN(w))) continue;

    const templateEx = findTemplateExercise(db, ex.exercise_id);
    if (!templateEx) continue;

    // Abs typically have null current_weight; skip those safely
    const current = templateEx.current_weight;
    if (current == null || Number.isNaN(Number(current))) continue;

    const minW = Math.min(...weights);
    const maxW = Math.max(...weights);

    if (weights.every((w) => w > Number(current))) {
      templateEx.current_weight = maxW;
      templateEx.last_updated = dateISO;
    } else if (weights.some((w) => w < Number(current))) {
      templateEx.current_weight = minW;
      templateEx.last_updated = dateISO;
    }
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    if (!body?.date) {
      return Response.json({ ok: false, error: "Missing date" }, { status: 400 });
    }

    const db = await getDb();

    db.protein_intake = Array.isArray(db.protein_intake) ? db.protein_intake : [];
    db.football_sessions = Array.isArray(db.football_sessions) ? db.football_sessions : [];
    db.squash_sessions = Array.isArray(db.squash_sessions) ? db.squash_sessions : [];
    db.gym_sessions = Array.isArray(db.gym_sessions) ? db.gym_sessions : [];
    db.gym_days_template = Array.isArray(db.gym_days_template) ? db.gym_days_template : [];

    const selectedDateISO = isoFromDateOnly(body.date);

    // Protein: reject if already exists for date
    if (body.protein_grams != null) {
      const exists = db.protein_intake.some((x) => x.date === body.date);
      if (exists) {
        return Response.json(
          { ok: false, error: "Error: data already present for this day" },
          { status: 409 }
        );
      }

      db.protein_intake.push({
        entry_id: makeId("pi"),
        date: body.date,
        grams: Number(body.protein_grams),
        created_at: isoNow(),
      });
    }

    // Football
    if (body.football_minutes != null && Number(body.football_minutes) >= 0) {
      // you said always show 0 in UI; DB: only store if > 0 (your prior behavior)
      if (Number(body.football_minutes) > 0) {
        db.football_sessions.push({
          entry_id: makeId("fb"),
          date: body.date,
          duration_minutes: Number(body.football_minutes),
          created_at: isoNow(),
        });
      }
    }

    // Squash
    if (body.squash_minutes != null && Number(body.squash_minutes) >= 0) {
      if (Number(body.squash_minutes) > 0) {
        db.squash_sessions.push({
          entry_id: makeId("sq"),
          date: body.date,
          duration_minutes: Number(body.squash_minutes),
          created_at: isoNow(),
        });
      }
    }

    // Gym session
    if (body.gym) {
      const gymExercises = Array.isArray(body.gym.exercises) ? body.gym.exercises : [];

      db.gym_sessions.push({
        session_id: makeId("gs"),
        session_date: body.date,
        gym_day: {
          day_number: Number(body.gym.day_number),
          day_name: body.gym.day_name,
        },
        duration_minutes: Number(body.gym.duration_minutes || 0),
        exercises: gymExercises,
        created_at: isoNow(),
      });

      // Update current_weight + last_updated based on sets
      maybeUpdateCurrentWeight(db, selectedDateISO, gymExercises);
    }

    await saveDb(db);
    return Response.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error("POST /api/end-of-day failed:", err);
    return Response.json({ ok: false, error: String(err?.message || err) }, { status: 500 });
  }
}