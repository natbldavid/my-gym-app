import Link from "next/link";

function startOfWeekMonday(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}
function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}
function toISODate(date) {
  return date.toISOString().slice(0, 10);
}

export default function ThisWeekGymSessions({ db, weekOffset }) {
  const base = new Date();
  const start = startOfWeekMonday(base);
  start.setDate(start.getDate() + weekOffset * 7);
  const end = addDays(start, 6);

  const startISO = toISODate(start);
  const endISO = toISODate(end);

  const sessions = db.gym_sessions
    .filter((s) => s.session_date >= startISO && s.session_date <= endISO)
    .slice()
    .sort((a, b) => (a.session_date < b.session_date ? 1 : -1));

  return (
    <section className="rounded-2xl bg-white p-4 shadow-sm">
      <div className="mb-3 text-sm font-semibold text-gray-800">
        This week’s gym sessions
      </div>

      {sessions.length === 0 ? (
        <div className="text-sm text-gray-600">No gym sessions logged this week.</div>
      ) : (
        <div className="space-y-2">
          {sessions.map((s) => (
            <Link
              key={s.session_id}
              href={`/gym-item/${s.session_id}`}
              className="flex items-center justify-between bg-[#F2F1F8] rounded-xl px-3 py-2 hover:opacity-90 active:scale-[0.99] transition"
            >
              <div className="min-w-0">
                <div className="truncate text-sm font-medium">
                  {s.gym_day?.day_name ?? "Gym"}
                </div>
                <div className="text-xs text-gray-500">{s.session_date}</div>
              </div>

              <div className="shrink-0 text-sm text-gray-700">
                {Math.round(Number(s.duration_minutes || 0))} min
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}