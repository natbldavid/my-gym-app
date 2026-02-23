import { FiCalendar, FiActivity, FiDroplet, FiTrendingUp } from "react-icons/fi";

function startOfWeekMonday(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay(); // Sun=0
  const diff = day === 0 ? -6 : 1 - day; // move to Monday
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

function inRangeInclusive(iso, startISO, endISO) {
  return iso >= startISO && iso <= endISO;
}

function formatNumber(n) {
  if (n == null || Number.isNaN(n)) return "0";
  return String(Math.round(n));
}

export default function StatCards({ db }) {
  const now = new Date();

  const weekStart = startOfWeekMonday(now);
  const weekEnd = addDays(weekStart, 6);

  const weekStartISO = toISODate(weekStart);
  const weekEndISO = toISODate(weekEnd);

  // 1) Avg protein this week (Mon-Sun). Missing days counted as 0.
  const proteinByDay = new Map();
  for (let i = 0; i < 7; i++) {
    proteinByDay.set(toISODate(addDays(weekStart, i)), 0);
  }
  for (const entry of db.protein_intake) {
    if (inRangeInclusive(entry.date, weekStartISO, weekEndISO)) {
      const prev = proteinByDay.get(entry.date) ?? 0;
      proteinByDay.set(entry.date, prev + Number(entry.grams || 0));
    }
  }
  const proteinTotal = Array.from(proteinByDay.values()).reduce((a, b) => a + b, 0);
  const avgProtein = proteinTotal / 7;

  // 2) Total activity minutes this week
  const footballMinutes = db.football_sessions
    .filter((x) => inRangeInclusive(x.date, weekStartISO, weekEndISO))
    .reduce((sum, x) => sum + Number(x.duration_minutes || 0), 0);

  const squashMinutes = db.squash_sessions
    .filter((x) => inRangeInclusive(x.date, weekStartISO, weekEndISO))
    .reduce((sum, x) => sum + Number(x.duration_minutes || 0), 0);

  const gymMinutes = db.gym_sessions
    .filter((x) => inRangeInclusive(x.session_date, weekStartISO, weekEndISO))
    .reduce((sum, x) => sum + Number(x.duration_minutes || 0), 0);

  const totalActivityMinutes = footballMinutes + squashMinutes + gymMinutes;

  // 3) Weights increased this week (template exercises updated this week AND current > start)
  let weightsIncreased = 0;
  for (const day of db.gym_days_template) {
    for (const ex of day.exercises || []) {
      if (!ex?.last_updated) continue;
      const updatedDate = toISODate(new Date(ex.last_updated));
      if (!inRangeInclusive(updatedDate, weekStartISO, weekEndISO)) continue;

      const startW = ex.start_weight;
      const currentW = ex.current_weight;
      if (startW == null || currentW == null) continue;
      if (Number(currentW) > Number(startW)) weightsIncreased += 1;
    }
  }

  // Gym sessions this week (Mon-Sun)
const gymSessionsThisWeek = db.gym_sessions.filter((x) =>
  inRangeInclusive(x.session_date, weekStartISO, weekEndISO)
).length;

  // 4) Gym sessions this month
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const monthStartISO = toISODate(monthStart);
  const monthEndISO = toISODate(monthEnd);

  const gymSessionsThisMonth = db.gym_sessions.filter((x) =>
    inRangeInclusive(x.session_date, monthStartISO, monthEndISO)
  ).length;

// Get the year
  const currentYear = now.getFullYear();
const yearStartISO = `${currentYear}-01-01`;
const yearEndISO = `${currentYear}-12-31`;

const gymSessionsThisYear = db.gym_sessions.filter((x) =>
  inRangeInclusive(x.session_date, yearStartISO, yearEndISO)
).length;

  const cards = [
  {
    title: "Average protein this week",
    value: `${formatNumber(avgProtein)}g`,
    sub: `${weekStartISO} → ${weekEndISO}`,
    icon: FiDroplet,
    colorClass: "text-rose-600",
  },
  {
    title: "Weights increased this week",
    value: `${formatNumber(weightsIncreased)}`,
    sub: "Exercises updated + increased",
    icon: FiTrendingUp,
    colorClass: "text-amber-600",
  }
  ];

  return (
    <section className="space-y-3">
<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
{/* Custom first card */}
<div className="rounded-2xl bg-white p-4 shadow-sm">
  <div className="flex items-center gap-2 text-sm font-bold">
    <FiCalendar className="h-4 w-4 text-[#FE6C3E]" />
    <span className="text-[#FE6C3E]">Gym Sessions</span>
  </div>

  {/* One grid, with consistent vertical separators */}
  <div className="mt-3 inline-flex items-start divide-x divide-gray-200">
    {/* Week */}
    <div className="pr-3">
      <div className="text-[11px] font-bold leading-none text-[#E93949]">
        Week
      </div>
      <div className="mt-1 text-xl font-bold leading-tight">
        {formatNumber(gymSessionsThisWeek)}
      </div>
    </div>

    {/* Month */}
    <div className="px-3">
      <div className="text-[11px] font-bold leading-none text-[#3EE12E]">
        Month
      </div>
      <div className="mt-1 text-xl font-bold leading-tight">
        {formatNumber(gymSessionsThisMonth)}
      </div>
    </div>

    {/* Year */}
    <div className="pl-3">
      <div className="text-[11px] font-bold leading-none text-[#44C8E0]">
        Year
      </div>
      <div className="mt-1 text-xl font-bold leading-tight">
        {formatNumber(gymSessionsThisYear)}
      </div>
    </div>
  </div>
</div>
{/* Custom second card: Activity with breakdown */}
  <div className="rounded-2xl bg-white p-4 shadow-sm">
    <div className="flex items-center gap-2 text-sm font-bold">
      <FiActivity className="h-4 w-4 text-emerald-600" />
      <span className="text-emerald-600">Total activity this week</span>
    </div>

    <div className="mt-2 text-2xl font-bold">
      {formatNumber(totalActivityMinutes)} min
    </div>

    {/* breakdown row: always show all 3 */}
    <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
      <span className="inline-flex items-baseline gap-1">
        <span className="text-sm font-bold text-gray-600">
          {formatNumber(gymMinutes)}
        </span>
        <span className="text-[11px] font-semibold text-gray-500">Gym</span>
      </span>

      <span className="inline-flex items-baseline gap-1">
        <span className="text-sm font-bold text-gray-600">
          {formatNumber(footballMinutes)}
        </span>
        <span className="text-[11px] font-semibold text-gray-500">Football</span>
      </span>

      <span className="inline-flex items-baseline gap-1">
        <span className="text-sm font-bold text-gray-600">
          {formatNumber(squashMinutes)}
        </span>
        <span className="text-[11px] font-semibold text-gray-500">Squash</span>
      </span>
    </div>
  </div>
{cards.map((c) => {
  const Icon = c.icon;

  return (
    <div key={c.title} className="rounded-2xl bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 text-sm font-bold">
        <Icon className={`h-4 w-4 ${c.colorClass}`} />
        <span className={c.colorClass}>{c.title}</span>
      </div>

      <div className="mt-2 text-2xl font-bold">{c.value}</div>
      <div className="mt-1 text-xs text-gray-500 font-bold">{c.sub}</div>
    </div>
  );
})}
      </div>
    </section>
  );
}