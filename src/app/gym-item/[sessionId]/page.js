import Link from "next/link";

function fmtSet(set, isAbs) {
  if (isAbs) return `${set.reps ?? 0} reps`;
  return `${set.weight ?? 0}kg × ${set.reps ?? 0}`;
}

async function getDbFromApi() {
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? "";
  const res = await fetch(`${base}/api/db`, { cache: "no-store" });

  const contentType = res.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    const text = await res.text();
    throw new Error(
      `GET /api/db did not return JSON (status ${res.status}). Body starts: ${text.slice(0, 80)}`
    );
  }

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data?.error || `GET /api/db failed with ${res.status}`);
  }

  return res.json();
}

export default async function GymItemPage({ params }) {
  // ✅ IMPORTANT FIX: params may be a Promise in modern Next App Router
  const p = await Promise.resolve(params);
  const sessionId = p?.sessionId;

  const db = await getDbFromApi();

  const sessions = Array.isArray(db?.gym_sessions) ? db.gym_sessions : [];
  const wanted = decodeURIComponent(String(sessionId ?? ""));
  const session = sessions.find((s) => String(s.session_id) === wanted);

  if (!session) {
    return (
      <main className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-3xl space-y-4">
          <Link className="text-sm font-bold underline text-gray-700" href="/dashboard">
            Back to Dashboard
          </Link>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="text-lg font-bold text-gray-900">Gym session not found</div>
            <div className="mt-2 text-sm text-gray-600">
              This session may have been deleted or the link is incorrect.
            </div>

            <div className="mt-4 rounded-xl bg-gray-50 p-3 text-xs text-gray-700">
              <div className="font-bold">Debug info</div>
              <div>
                Looking for: <span className="font-semibold">{String(sessionId ?? "")}</span>
              </div>
              <div>
                Params keys:{" "}
                <span className="font-semibold">{Object.keys(p ?? {}).join(", ") || "(none)"}</span>
              </div>
              <div>
                Available session_ids:{" "}
                <span className="font-semibold">
                  {sessions.map((s) => s.session_id).join(", ") || "(none)"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const dayName = session.gym_day?.day_name ?? "Gym Session";
  const date = session.session_date;
  const mins = Math.round(Number(session.duration_minutes || 0));
  const exercises = Array.isArray(session.exercises) ? session.exercises : [];

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-3xl space-y-4">
        <Link className="text-sm font-bold underline text-gray-700" href="/dashboard">
          Back to Dashboard
        </Link>

        <header className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="text-xl font-bold text-gray-900">{dayName}</div>
          <div className="mt-1 text-sm font-semibold text-gray-600">{date}</div>

          <div className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gray-50 px-3 py-2">
            <div className="text-sm font-bold text-gray-900">{mins}</div>
            <div className="text-xs font-semibold text-gray-500">minutes</div>
          </div>
        </header>

        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="text-sm font-bold text-gray-900">Exercises</div>

          {exercises.length === 0 ? (
            <div className="mt-3 text-sm text-gray-600">
              No exercises were recorded for this session.
            </div>
          ) : (
            <div className="mt-4 space-y-4">
              {exercises.map((ex) => {
                const sets = Array.isArray(ex.sets) ? ex.sets : [];
                const isAbs = sets.length > 0 && sets[0]?.weight == null;

                return (
                  <div key={ex.exercise_id} className="rounded-2xl border border-gray-200 p-4">
                    <div className="text-sm font-bold text-gray-900">
                      {ex.exercise_name ?? "Exercise"}
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {sets.map((set, i) => (
                        <div
                          key={i}
                          className="rounded-xl bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-700"
                        >
                          <span className="text-gray-500">Set {i + 1}:</span>{" "}
                          <span className="font-bold text-gray-800">
                            {fmtSet(set, isAbs)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}