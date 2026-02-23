import { useMemo, useState } from "react";

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
function formatRange(start, end) {
  const opts = { day: "2-digit", month: "short", year: "numeric" };
  return `${start.toLocaleDateString(undefined, opts)} – ${end.toLocaleDateString(undefined, opts)}`;
}

const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// Fixed Apple-Health-style scale
const MAX_PROTEIN = 200;
const MID_PROTEIN = 100;

export default function ProteinWeekChart({ db, weekOffset, setWeekOffset }) {
  const [selectedIndex, setSelectedIndex] = useState(null);

  const { start, end, days } = useMemo(() => {
    const base = new Date();
    const start = startOfWeekMonday(base);
    start.setDate(start.getDate() + weekOffset * 7);
    const end = addDays(start, 6);

    const dayTotals = [];
    for (let i = 0; i < 7; i++) {
      const dayISO = toISODate(addDays(start, i));
      const total = (db.protein_intake || [])
        .filter((x) => x.date === dayISO)
        .reduce((sum, x) => sum + Number(x.grams || 0), 0);

      dayTotals.push({ dayISO, total });
    }

    return { start, end, days: dayTotals };
  }, [db.protein_intake, weekOffset]);

  const canGoForward = weekOffset < 0;

  return (
    <div className="space-y-2">
      {/* 1) Title OUTSIDE the card and slightly larger */}
      <div className="text-base font-bold text-gray-900">Protein</div>

        <div className="flex items-center justify-center">
          <div className="flex items-center gap-2">
          <button
            className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-xs font-bold text-white"
            onClick={() => {
              setSelectedIndex(null);
              setWeekOffset((x) => x - 1);
            }}
            aria-label="Previous week"
          >
            &lt;
          </button>

          <div className="text-xs font-semibold text-gray-700">
            {formatRange(start, end)}
          </div>

          {canGoForward ? (
            <button
              className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-xs font-bold text-white"
              onClick={() => {
                setSelectedIndex(null);
                setWeekOffset((x) => x + 1);
              }}
              aria-label="Next week"
            >
              &gt;
            </button>
          ) : (
            <div className="w-[34px]" />
          )}
        </div>
      </div>

      {/* White card ONLY contains the chart */}
      <section className="rounded-2xl bg-white p-4 shadow-sm">
        {/* Chart + right-side labels */}
        <div className="grid grid-cols-[1fr_auto] gap-3">
          {/* Chart box with border + gridlines */}
          <div className="relative h-44 rounded-xl border border-gray-200 px-2 pb-7 pt-3">
            {/* Horizontal gridline at 100 (middle) */}
            <div className="pointer-events-none absolute left-0 right-0 top-1/2 border-t border-gray-200" />

            {/* Bars row (inside chart area) */}
            <div className="flex h-full items-end">
              {days.map((d, idx) => {
                const isSelected = selectedIndex === idx;
                const clamped = Math.min(Math.max(d.total, 0), MAX_PROTEIN);
                const heightPct = (clamped / MAX_PROTEIN) * 100;

                return (
                  <div
                    key={d.dayISO}
                    className={`relative flex h-full flex-1 items-end justify-center ${
                      idx === 0 ? "" : "border-l border-dashed border-gray-200"
                    }`}
                  >
                    <button
                      type="button"
                      className="relative flex h-full w-full items-end justify-center"
                      onClick={() => setSelectedIndex(isSelected ? null : idx)}
                      aria-label={`${dayLabels[idx]} protein`}
                    >
                      {/* Tooltip */}
                      {isSelected && d.total > 0 ? (
                        <div className="absolute -top-9 rounded-xl bg-gray-200 px-3 py-1 text-xs font-semibold text-gray-900 shadow-sm">
                          {Math.round(d.total)}g
                        </div>
                      ) : null}

                      {/* 2) No data = no bar */}
                      {d.total > 0 ? (
                        <div
                          className="w-3.5 md:w-10 rounded-t-xl bg-orange-500"
                          style={{ height: `${heightPct}%` }}
                        />
                      ) : (
                        <div className="w-2.5" />
                      )}
                    </button>

                    {/* Day label */}
                    <div className="absolute -bottom-6 text-[11px] font-semibold text-gray-600">
                      {dayLabels[idx]}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right-side fixed labels aligned to the chart */}
          <div className="relative h-44 w-10">
            {/* Top label (200) */}
            <div className="absolute top-0 text-xs font-bold text-gray-500">
              {MAX_PROTEIN}
            </div>

            {/* Middle label (100) */}
            <div className="absolute top-1/2 -translate-y-1/2 text-xs font-bold text-gray-500">
              {MID_PROTEIN}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}