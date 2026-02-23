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

// Fixed Apple-Health-style scale (minutes)
const MAX_ACTIVITY = 200;
const MID_ACTIVITY = 100;

export default function ActivityWeekChart({ db, weekOffset, setWeekOffset }) {
  const [selected, setSelected] = useState(null);
  // { idx: number, part: "gym" | "football" | "squash" } | null

  const { start, end, days } = useMemo(() => {
    const base = new Date();
    const start = startOfWeekMonday(base);
    start.setDate(start.getDate() + weekOffset * 7);
    const end = addDays(start, 6);

    const dayTotals = [];
    for (let i = 0; i < 7; i++) {
      const dayISO = toISODate(addDays(start, i));

      const football = (db.football_sessions || [])
        .filter((x) => x.date === dayISO)
        .reduce((sum, x) => sum + Number(x.duration_minutes || 0), 0);

      const squash = (db.squash_sessions || [])
        .filter((x) => x.date === dayISO)
        .reduce((sum, x) => sum + Number(x.duration_minutes || 0), 0);

      const gym = (db.gym_sessions || [])
        .filter((x) => x.session_date === dayISO)
        .reduce((sum, x) => sum + Number(x.duration_minutes || 0), 0);

      const total = football + squash + gym;
      dayTotals.push({ dayISO, total, gym, football, squash });
    }

    return { start, end, days: dayTotals };
  }, [db.football_sessions, db.squash_sessions, db.gym_sessions, weekOffset]);

  const canGoForward = weekOffset < 0;

  return (
    <div className="space-y-2">
      {/* Title OUTSIDE the card */}
      <div className="text-base font-bold text-gray-900">Activity</div>

      {/* Centered date range + arrows */}
      <div className="flex items-center justify-center">
        <div className="flex items-center gap-2">
          <button
            className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-xs font-bold text-white"
            onClick={() => {
              setSelected(null);
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
                setSelected(null);
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
        <div className="grid grid-cols-[1fr_auto] gap-3">
          {/* Chart box with border + gridlines */}
          <div className="relative h-44 rounded-xl border border-gray-200 px-2 pb-7 pt-3">
            {/* Horizontal gridline at MID (100) */}
            <div className="pointer-events-none absolute left-0 right-0 top-1/2 border-t border-gray-200" />

            {/* Bars */}
            <div className="flex h-full items-end">
              {days.map((d, idx) => {
                const total = d.gym + d.football + d.squash;
                const hasData = total > 0;

                const isDaySelected = selected?.idx === idx;
                const selectedPart = isDaySelected ? selected?.part : null;

                const partLabel =
                  selectedPart === "gym"
                    ? "Gym"
                    : selectedPart === "football"
                    ? "Football"
                    : selectedPart === "squash"
                    ? "Squash"
                    : null;

                const partValue =
                  selectedPart === "gym"
                    ? d.gym
                    : selectedPart === "football"
                    ? d.football
                    : selectedPart === "squash"
                    ? d.squash
                    : null;

                // Bar height is based on TOTAL vs MAX (so bar doesn't always fill full chart height)
const totalClamped = Math.min(Math.max(total, 0), MAX_ACTIVITY);
const barH = (totalClamped / MAX_ACTIVITY) * 100;

// Segment heights are relative to TOTAL so they perfectly fill the bar container
const safeTotal = totalClamped === 0 ? 1 : totalClamped;

const gymH = (Math.min(Math.max(d.gym, 0), totalClamped) / safeTotal) * 100;
const footballH = (Math.min(Math.max(d.football, 0), totalClamped) / safeTotal) * 100;
const squashH = (Math.min(Math.max(d.squash, 0), totalClamped) / safeTotal) * 100;

                return (
                  <div
                    key={d.dayISO}
                    className={`relative flex h-full flex-1 items-end justify-center ${
                      idx === 0 ? "" : "border-l border-dashed border-gray-200"
                    }`}
                  >
                    {/* Tooltip */}
                    {isDaySelected && hasData ? (
                      <div className="absolute -top-10 rounded-xl bg-gray-200 px-3 py-1 text-xs font-semibold text-gray-900 shadow-sm">
                        <div>Total: {Math.round(total)} min</div>
                        {partLabel ? (
                          <div>
                            {partLabel}: {Math.round(partValue)} min
                          </div>
                        ) : null}
                      </div>
                    ) : null}

                    {/* Full-height interaction column */}
                    <div className="relative flex h-full w-full items-end justify-center">
                      {/* No data = no bar */}
                      {hasData ? (
                        <div
                          className="flex w-3.5 md:w-10 flex-col justify-end overflow-hidden rounded-t-xl rounded-b-none"
                          // IMPORTANT: container is full-height now
                          style={{ height: `${barH}%` }}
                        >
                          {/* Stack order bottom -> top: Gym, Football, Squash */}
                          {d.gym > 0 ? (
                            <button
                              type="button"
                              aria-label={`${dayLabels[idx]} gym minutes`}
                              onClick={() =>
                                setSelected(
                                  isDaySelected && selected?.part === "gym"
                                    ? null
                                    : { idx, part: "gym" }
                                )
                              }
                              onMouseEnter={() => setSelected({ idx, part: "gym" })}
                              className="w-full bg-orange-600"
                              style={{ height: `${gymH}%` }}
                            />
                          ) : null}

                          {d.football > 0 ? (
                            <button
                              type="button"
                              aria-label={`${dayLabels[idx]} football minutes`}
                              onClick={() =>
                                setSelected(
                                  isDaySelected && selected?.part === "football"
                                    ? null
                                    : { idx, part: "football" }
                                )
                              }
                              onMouseEnter={() => setSelected({ idx, part: "football" })}
                              className="w-full bg-orange-500"
                              style={{ height: `${footballH}%` }}
                            />
                          ) : null}

                          {d.squash > 0 ? (
                            <button
                              type="button"
                              aria-label={`${dayLabels[idx]} squash minutes`}
                              onClick={() =>
                                setSelected(
                                  isDaySelected && selected?.part === "squash"
                                    ? null
                                    : { idx, part: "squash" }
                                )
                              }
                              onMouseEnter={() => setSelected({ idx, part: "squash" })}
                              className="w-full bg-orange-400"
                              style={{ height: `${squashH}%` }}
                            />
                          ) : null}
                        </div>
                      ) : (
                        <div className="w-2.5" />
                      )}
                    </div>

                    {/* Day label */}
                    <div className="absolute -bottom-6 text-[11px] font-semibold text-gray-600">
                      {dayLabels[idx]}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right-side fixed labels */}
          <div className="relative h-44 w-10">
            <div className="absolute top-0 text-xs font-bold text-gray-500">
              {MAX_ACTIVITY}
            </div>
            <div className="absolute top-1/2 -translate-y-1/2 text-xs font-bold text-gray-500">
              {MID_ACTIVITY}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}