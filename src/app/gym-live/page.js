"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

function isNonNegNumberString(s) {
  if (s === "" || s == null) return true;
  const n = Number(s);
  return Number.isFinite(n) && n >= 0;
}

function isoNow() {
  return new Date().toISOString();
}

export default function GymLivePage() {
  const [db, setDb] = useState(null);
  const [dbLoading, setDbLoading] = useState(true);

  const [draft, setDraft] = useState(null);
  const [draftLoading, setDraftLoading] = useState(true);

  const [screen, setScreen] = useState("start"); 
  // "start" | "confirm_wipe" | "choose_day" | "entry"

  const [gymDayNumber, setGymDayNumber] = useState(null);
  const [gymDuration, setGymDuration] = useState("");
  const [gymExerciseInputs, setGymExerciseInputs] = useState({});

  const [statusMsg, setStatusMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Load template DB + current draft
  useEffect(() => {
    const loadAll = async () => {
      try {
        setDbLoading(true);
        const res = await fetch("/api/db", { cache: "no-store" });
        const data = await res.json();
        setDb(data);
      } catch (e) {
        console.error(e);
        setDb(null);
      } finally {
        setDbLoading(false);
      }

      try {
        setDraftLoading(true);
        const res = await fetch("/api/gym-live", { cache: "no-store" });
        const data = await res.json();
        setDraft(data?.draft ?? null);
      } catch (e) {
        console.error(e);
        setDraft(null);
      } finally {
        setDraftLoading(false);
      }
    };

    loadAll();
  }, []);

  const gymDays = useMemo(
    () => (Array.isArray(db?.gym_days_template) ? db.gym_days_template : []),
    [db]
  );

  const selectedGymDay = useMemo(() => {
    if (!gymDayNumber) return null;
    return gymDays.find((d) => Number(d.day_number) === Number(gymDayNumber)) ?? null;
  }, [gymDayNumber, gymDays]);

  // Helpers to transform between "inputs" and "draft exercises"
  const buildExercisesPayloadFromInputs = () => {
    const day = selectedGymDay;
    const exercises = Array.isArray(day?.exercises) ? day.exercises : [];

    const out = [];
    for (const ex of exercises) {
      const id = ex.exercise_id;
      const cat = ex.category;
      const inp = gymExerciseInputs[id] || {};

      // Abs: reps only
      if (cat === "Abs") {
        const r1 = inp.r1 ?? "";
        const r2 = inp.r2 ?? "";
        const r3 = inp.r3 ?? "";
        if ([r1, r2, r3].every((v) => v === "")) continue;

        out.push({
          exercise_id: id,
          exercise_name: ex.exercise_name,
          sets: [{ reps: Number(r1 || 0) }, { reps: Number(r2 || 0) }, { reps: Number(r3 || 0) }],
        });
        continue;
      }

      // Weighted: weight + reps
      const w1 = inp.w1 ?? "";
      const w2 = inp.w2 ?? "";
      const w3 = inp.w3 ?? "";
      const r1 = inp.r1 ?? "";
      const r2 = inp.r2 ?? "";
      const r3 = inp.r3 ?? "";
      if ([w1, w2, w3, r1, r2, r3].every((v) => v === "")) continue;

      out.push({
        exercise_id: id,
        exercise_name: ex.exercise_name,
        sets: [
          { weight: Number(w1 || 0), reps: Number(r1 || 0) },
          { weight: Number(w2 || 0), reps: Number(r2 || 0) },
          { weight: Number(w3 || 0), reps: Number(r3 || 0) },
        ],
      });
    }

    return out;
  };

  const loadDraftIntoForm = (incomingDraft) => {
    // incomingDraft: {day_number, duration_minutes, exercises: [...]}
    setGymDayNumber(Number(incomingDraft.day_number));
    setGymDuration(String(incomingDraft.duration_minutes ?? ""));

    // Convert exercises[] into gymExerciseInputs map
    const map = {};
    for (const ex of incomingDraft.exercises || []) {
      const sets = Array.isArray(ex.sets) ? ex.sets : [];
      // If set has weight -> weighted, else abs
      if (sets.some((s) => s.weight != null)) {
        map[ex.exercise_id] = {
          w1: sets[0]?.weight ?? "",
          r1: sets[0]?.reps ?? "",
          w2: sets[1]?.weight ?? "",
          r2: sets[1]?.reps ?? "",
          w3: sets[2]?.weight ?? "",
          r3: sets[2]?.reps ?? "",
        };
      } else {
        map[ex.exercise_id] = {
          r1: sets[0]?.reps ?? "",
          r2: sets[1]?.reps ?? "",
          r3: sets[2]?.reps ?? "",
        };
      }
    }
    setGymExerciseInputs(map);
  };

  // Actions
  const onPressNew = () => {
    setErrorMsg("");
    setStatusMsg("");
    setScreen("confirm_wipe");
  };

  const wipeDraftAndStartFresh = async () => {
    setErrorMsg("");
    setStatusMsg("");

    try {
      const res = await fetch("/api/gym-live", { method: "DELETE" });
      const data = await res.json();
      if (!res.ok || !data?.ok) throw new Error(data?.error || "Failed to wipe draft");

      setDraft(null);
      setGymDayNumber(null);
      setGymDuration("");
      setGymExerciseInputs({});
      setScreen("choose_day");
    } catch (e) {
      setErrorMsg(String(e?.message || e));
    }
  };

  const onPressLoad = async () => {
    setErrorMsg("");
    setStatusMsg("");

    if (!draft) {
      setErrorMsg("No saved gym draft found. Press New to start one.");
      return;
    }

    loadDraftIntoForm(draft);
    setScreen("entry");
  };

  const onChooseDay = (dayNumber) => {
    setGymDayNumber(dayNumber);
    setGymDuration("");
    setGymExerciseInputs({});
    setScreen("entry");
  };

  const onSaveDraft = async () => {
    setErrorMsg("");
    setStatusMsg("");

    if (!selectedGymDay) {
      setErrorMsg("Choose a gym day first.");
      return;
    }

    const payload = {
      saved_at: isoNow(),
      day_number: Number(selectedGymDay.day_number),
      day_name: selectedGymDay.day_name,
      duration_minutes: Number(gymDuration || 0),
      exercises: buildExercisesPayloadFromInputs(),
    };

    try {
      const res = await fetch("/api/gym-live", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data?.ok) throw new Error(data?.error || "Save failed");

      // refresh local draft
      setDraft(payload);
      setStatusMsg("Saved! You can close the app now — Load will restore this.");
    } catch (e) {
      setErrorMsg(String(e?.message || e));
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="sticky top-0 z-40 -mx-6 mb-4 bg-slate-50 px-6 py-3">
        <Link className="text-sm font-bold underline text-gray-700" href="/dashboard">
          Back to Dashboard
        </Link>
      </div>

      <div className="mx-auto max-w-3xl space-y-6">
        <header className="space-y-1">
          <h1 className="text-2xl font-semibold">Gym Live</h1>
          <div className="text-sm font-semibold text-gray-600">
            Use this at the gym, then load it later inside End of Day.
          </div>
        </header>

        {(dbLoading || draftLoading) && (
          <div className="rounded-2xl bg-white p-4 shadow-sm">Loading…</div>
        )}

        {!dbLoading && !db && (
          <div className="rounded-2xl bg-white p-4 shadow-sm">Couldn’t load DB.</div>
        )}

        {!dbLoading && db && (
          <div className="rounded-2xl bg-white p-6 shadow-sm space-y-4">
            {/* START SCREEN */}
            {screen === "start" && (
              <div className="space-y-4">
                <div className="text-sm font-bold text-gray-800">
                  Start gym tracking
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={onPressNew}
                    className="rounded-2xl bg-black px-4 py-3 font-bold text-white"
                  >
                    New
                  </button>

                  <button
                    type="button"
                    onClick={onPressLoad}
                    className="rounded-2xl border px-4 py-3 font-bold text-gray-800"
                  >
                    Load
                  </button>
                </div>

                <div className="text-xs font-semibold text-gray-500">
                  {draft
                    ? `Current saved draft: ${draft.day_name || "Unknown day"} (saved ${draft.saved_at})`
                    : "No saved draft yet."}
                </div>
              </div>
            )}

            {/* CONFIRM WIPE */}
            {screen === "confirm_wipe" && (
              <div className="space-y-4">
                <div className="text-sm font-bold text-gray-800">Wipe previous data?</div>
                <div className="text-sm font-semibold text-gray-600">
                  This deletes the current saved gym draft.
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setScreen("start")}
                    className="rounded-2xl border px-4 py-3 font-bold text-gray-800"
                  >
                    No
                  </button>

                  <button
                    type="button"
                    onClick={wipeDraftAndStartFresh}
                    className="rounded-2xl bg-red-600 px-4 py-3 font-bold text-white"
                  >
                    Yes
                  </button>
                </div>
              </div>
            )}

            {/* CHOOSE DAY */}
            {screen === "choose_day" && (
              <div className="space-y-4">
                <div className="text-sm font-bold text-gray-800">Choose a gym day</div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {gymDays.map((d) => (
                    <button
                      key={d.day_number}
                      type="button"
                      onClick={() => onChooseDay(d.day_number)}
                      className="rounded-2xl border p-4 text-left font-bold hover:bg-gray-50"
                    >
                      <div className="text-sm">{d.day_name}</div>
                      <div className="mt-1 text-xs font-semibold text-gray-500">
                        Day {d.day_number} · {d.area}
                      </div>
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  className="text-sm font-bold text-gray-600 underline"
                  onClick={() => setScreen("start")}
                >
                  Back
                </button>
              </div>
            )}

            {/* ENTRY */}
            {screen === "entry" && (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold text-gray-800">{selectedGymDay?.day_name}</div>
                    <div className="text-xs font-semibold text-gray-500">{selectedGymDay?.area}</div>
                  </div>

                  <button
                    type="button"
                    className="text-sm font-bold text-gray-600 underline"
                    onClick={() => {
                      setGymDayNumber(null);
                      setGymDuration("");
                      setGymExerciseInputs({});
                      setScreen("choose_day");
                    }}
                  >
                    Change Day
                  </button>
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-bold text-gray-800">Time spent</div>
                  <input
                    className="w-full rounded-xl border px-3 py-2"
                    placeholder="e.g. 70 (minutes)"
                    value={gymDuration}
                    onChange={(e) =>
                      isNonNegNumberString(e.target.value) ? setGymDuration(e.target.value) : null
                    }
                    inputMode="numeric"
                  />
                </div>

                <div className="space-y-4">
                  {(selectedGymDay?.exercises || []).map((ex) => {
                    const inp = gymExerciseInputs[ex.exercise_id] || {};
                    const isAbs = ex.category === "Abs";

                    return (
<div key={ex.exercise_id} className="rounded-2xl border p-4">
  <div className="text-sm font-bold text-gray-800">{ex.exercise_name}</div>

  {/* NEW: Current Weight line */}
  <div className="mt-1 text-xs font-semibold text-gray-500">
    CurrentWeight:{" "}
    <span className="font-bold text-gray-700">
      {ex.current_weight == null ? "—" : `${ex.current_weight}kg`}
    </span>
  </div>

  <div className="mt-1 text-xs font-semibold text-gray-500">
    {ex.category} · {ex.reps}
  </div>

                        <div className="mt-3 space-y-2">
                          {[1, 2, 3].map((setNo) => (
                            <div key={setNo} className="flex items-center gap-2">
                              <div className="w-10 text-xs font-bold text-gray-500">
                                Set {setNo}
                              </div>

                              {!isAbs && (
                                <input
                                  className="w-24 rounded-xl border px-3 py-2 text-sm font-semibold"
                                  placeholder="kg"
                                  value={inp[`w${setNo}`] ?? ""}
                                  onChange={(e) =>
                                    setGymExerciseInputs((prev) => ({
                                      ...prev,
                                      [ex.exercise_id]: {
                                        ...prev[ex.exercise_id],
                                        [`w${setNo}`]: e.target.value,
                                      },
                                    }))
                                  }
                                />
                              )}

                              <input
                                className="w-24 rounded-xl border px-3 py-2 text-sm font-semibold"
                                placeholder="reps"
                                value={inp[`r${setNo}`] ?? ""}
                                onChange={(e) =>
                                  setGymExerciseInputs((prev) => ({
                                    ...prev,
                                    [ex.exercise_id]: {
                                      ...prev[ex.exercise_id],
                                      [`r${setNo}`]: e.target.value,
                                    },
                                  }))
                                }
                              />

                              <div className="text-xs font-semibold text-gray-400">
                                {isAbs ? "reps" : "kg / reps"}
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="mt-2 text-xs font-semibold text-gray-400">
                          You can leave any fields blank while you’re mid-workout. Saving stores whatever you entered.
                        </div>
                      </div>
                    );
                  })}
                </div>

                {errorMsg && <div className="text-sm font-bold text-red-600">{errorMsg}</div>}
                {statusMsg && <div className="text-sm font-bold text-emerald-700">{statusMsg}</div>}

                <button
                  type="button"
                  onClick={onSaveDraft}
                  className="w-full rounded-xl bg-black px-4 py-3 font-bold text-white"
                >
                  Save
                </button>

                <button
                  type="button"
                  className="text-sm font-bold text-gray-600 underline"
                  onClick={() => setScreen("start")}
                >
                  Back to New/Load
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}