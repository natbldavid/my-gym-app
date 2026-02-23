"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { FiChevronLeft, FiChevronRight, FiCheck } from "react-icons/fi";

const STEPS = [1, 2, 3, 4, 5];

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function isPositiveNumberString(s) {
  if (s == null) return false;
  const n = Number(s);
  return Number.isFinite(n) && n > 0;
}

function isNonNegNumberString(s) {
  if (s === "" || s == null) return true; // allow blank in inputs; treat as 0 later
  const n = Number(s);
  return Number.isFinite(n) && n >= 0;
}

function parseNumOrZero(s) {
  if (s === "" || s == null) return 0;
  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
}

function Stepper({ step }) {
  return (
    <div className="w-full overflow-hidden">
      <div className="flex items-center gap-2 sm:gap-3">
        {STEPS.map((n, idx) => {
          const done = n < step;
          const current = n === step;

          const base =
            "flex items-center justify-center rounded-full font-bold shrink-0";

          // Mobile: smaller circles, no numbers
          // Desktop: bigger circles with numbers/check
          const cls = done
            ? `${base} h-6 w-6 sm:h-8 sm:w-8 bg-green-500 text-white text-[10px] sm:text-sm`
            : current
            ? `${base} h-6 w-6 sm:h-8 sm:w-8 bg-yellow-400 text-black text-[10px] sm:text-sm`
            : `${base} h-6 w-6 sm:h-8 sm:w-8 bg-gray-200 text-gray-600 text-[10px] sm:text-sm`;

          return (
            <div key={n} className="flex items-center gap-2 sm:gap-3">
              <div className={cls}>
                {/* Mobile: show dots only (no numbers), Desktop: show check/number */}
                <span className="hidden sm:inline">
                  {done ? <FiCheck /> : n}
                </span>
                <span className="sm:hidden">
                  {/* simple dot */}
                  <span className="block h-1.5 w-1.5 rounded-full bg-current opacity-70" />
                </span>
              </div>

              {/* connector */}
              {idx !== STEPS.length - 1 && (
                <div className="h-px w-6 sm:w-10 bg-gray-200 shrink-0" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function InputWithSuffix({ value, onChange, placeholder, suffix }) {
  return (
    <div className="flex w-full items-center rounded-xl border bg-white px-3 py-2">
      <input
        className="w-full outline-none"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        inputMode="numeric"
      />
      <span className="ml-2 text-sm font-semibold text-gray-400">{suffix}</span>
    </div>
  );
}

function SelectBox({ label, selected, onClick, disabled }) {
  const cls = selected
    ? "rounded-2xl border-2 border-green-600 bg-green-50 p-4 font-bold text-green-700"
    : "rounded-2xl border p-4 font-bold text-gray-700 hover:bg-gray-50";

  const finalCls = disabled ? "opacity-50 pointer-events-none" : "";
  return (
    <button type="button" className={`${cls} ${finalCls}`} onClick={onClick}>
      {label}
    </button>
  );
}

export default function EndOfDayPage() {
  const router = useRouter();

  // load DB once for checks + gym template
  const [db, setDb] = useState(null);
  const [dbLoading, setDbLoading] = useState(true);
  const [gymDraft, setGymDraft] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/db", { cache: "no-store" });
        const data = await res.json();
        setDb(data);

        
      // also load gym live draft
      const draftRes = await fetch("/api/gym-live", { cache: "no-store" });
             const draftData = await draftRes.json();
             setGymDraft(draftData?.draft ?? null);
      } catch (e) {
        console.error(e);
        setDb(null);
        setGymDraft(null);
      } finally {
        setDbLoading(false);
      }
    };
    load();
  }, []);

    const applyGymDraftToForm = (draft) => {
    if (!draft) return;

    setGymDayNumber(Number(draft.day_number));
    setGymDuration(String(draft.duration_minutes ?? ""));

    const map = {};
    for (const ex of draft.exercises || []) {
      const sets = Array.isArray(ex.sets) ? ex.sets : [];

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
    setGymError("");
  };

  const gymDays = useMemo(
    () => (Array.isArray(db?.gym_days_template) ? db.gym_days_template : []),
    [db]
  );
  const proteinIntake = useMemo(
    () => (Array.isArray(db?.protein_intake) ? db.protein_intake : []),
    [db]
  );

  // wizard state
  const [step, setStep] = useState(1);

  // Step 1
  const [date, setDate] = useState(() => todayISO());
  const [dateError, setDateError] = useState("");

  // Step 2
  const [protein, setProtein] = useState("");

  // Step 3
  const [activities, setActivities] = useState([]); // ["Gym","Football","Squash"] or ["None"]

  // Step 4 (data entry)
  const [activityIndex, setActivityIndex] = useState(0);

  // Gym sub-flow
  const [gymDayNumber, setGymDayNumber] = useState(null);
  const [gymDuration, setGymDuration] = useState("");
  const [gymExerciseInputs, setGymExerciseInputs] = useState(() => ({}));
  const [gymError, setGymError] = useState("");

  // Football / Squash
  const [footballMinutes, setFootballMinutes] = useState("");
  const [squashMinutes, setSquashMinutes] = useState("");

  // Submit UX
  const [submitting, setSubmitting] = useState(false);
  const [showCongrats, setShowCongrats] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // --- Helpers
  const selectedGymDay = useMemo(() => {
    if (gymDayNumber == null) return null;
    return gymDays.find((d) => Number(d.day_number) === Number(gymDayNumber)) ?? null;
  }, [gymDayNumber, gymDays]);

  const activityFlow = useMemo(() => {
    // Step 4 order
    const order = ["Gym", "Football", "Squash"];
    return order.filter((x) => activities.includes(x));
  }, [activities]);

  const currentActivity = activityFlow[activityIndex] ?? null;

  // STEP 1 validation: check protein_intake already present
  useEffect(() => {
    if (step !== 1) return;
    setDateError("");
  }, [date, step]);

  const validateStep1 = () => {
    if (!date) return "Choose a date";
    const exists = proteinIntake.some((x) => x?.date === date);
    if (exists) return "Error: data already present for this day";
    return "";
  };

  const step1NextEnabled = !dbLoading && !!db && validateStep1() === "";

  // STEP 2 validation
  const step2NextEnabled = isPositiveNumberString(protein);

  // STEP 3 selection rules
  const toggleActivity = (label) => {
    setActivities((prev) => {
      const has = prev.includes(label);

      // if clicking "None"
      if (label === "None") {
        return has ? [] : ["None"];
      }

      // clicking one of the three
      let next = has ? prev.filter((x) => x !== label) : [...prev, label];
      // cannot combine with None
      next = next.filter((x) => x !== "None");
      return next;
    });
  };

  const step3Valid = useMemo(() => {
    if (activities.length === 0) return false;
    if (activities.includes("None")) return activities.length === 1;
    // at least one of gym/football/squash
    return activities.some((x) => ["Gym", "Football", "Squash"].includes(x));
  }, [activities]);

  // STEP 4 validation per activity
  const validateGym = () => {
    if (!gymDayNumber) return "Select a gym day";
    if (!isPositiveNumberString(gymDuration)) return "Enter time spent in minutes";

    const day = selectedGymDay;
    const exercises = Array.isArray(day?.exercises) ? day.exercises : [];

    // Build payload exercises from inputs, with validation:
    // - blank exercise = ignore
    // - for weighted lifts: must have weight+reps for all sets used
    // - if partial (weight missing reps or reps missing weight) -> error
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

        const allBlank = [r1, r2, r3].every((v) => v === "");
        if (allBlank) continue;

        // if some entered, require all entered (keeps it simple + consistent)
        const anyBlank = [r1, r2, r3].some((v) => v === "");
        if (anyBlank) return `Fix "${ex.exercise_name}": enter reps for all 3 sets or leave it blank`;

        out.push({
          exercise_id: id,
          exercise_name: ex.exercise_name,
          sets: [
            { reps: Number(r1) },
            { reps: Number(r2) },
            { reps: Number(r3) },
          ],
        });
        continue;
      }

      // Weighted lifts: w+reps each set
      const w1 = inp.w1 ?? "";
      const w2 = inp.w2 ?? "";
      const w3 = inp.w3 ?? "";
      const r1 = inp.r1 ?? "";
      const r2 = inp.r2 ?? "";
      const r3 = inp.r3 ?? "";

      const allBlank = [w1, w2, w3, r1, r2, r3].every((v) => v === "");
      if (allBlank) continue;

      // each set must be complete if any part entered
      const pairs = [
        [w1, r1],
        [w2, r2],
        [w3, r3],
      ];

      for (let i = 0; i < 3; i++) {
        const [w, r] = pairs[i];
        const bothBlank = w === "" && r === "";
        const bothFilled = w !== "" && r !== "";
        if (bothBlank) {
          return `Fix "${ex.exercise_name}": Set ${i + 1} is incomplete. Enter weight + reps or leave the whole exercise blank`;
        }
        if (!bothFilled) {
          return `Fix "${ex.exercise_name}": Set ${i + 1} needs both weight and reps`;
        }
      }

      out.push({
        exercise_id: id,
        exercise_name: ex.exercise_name,
        sets: [
          { weight: Number(w1), reps: Number(r1) },
          { weight: Number(w2), reps: Number(r2) },
          { weight: Number(w3), reps: Number(r3) },
        ],
      });
    }

    // gym valid
    return "";
  };

  const step4NextEnabled = useMemo(() => {
    if (!currentActivity) return true;

    if (currentActivity === "Gym") {
      return validateGym() === "";
    }
    if (currentActivity === "Football") {
      return isPositiveNumberString(footballMinutes);
    }
    if (currentActivity === "Squash") {
      return isPositiveNumberString(squashMinutes);
    }
    return false;
  }, [currentActivity, gymDayNumber, gymDuration, gymExerciseInputs, selectedGymDay, footballMinutes, squashMinutes]);

  // navigation
  const goNext = () => {
    if (step === 1) {
      const err = validateStep1();
      setDateError(err);
      if (err) return;
      setStep(2);
      return;
    }

    if (step === 2) {
      setStep(3);
      return;
    }

    if (step === 3) {
      if (!step3Valid) return;

      // if None -> skip step 4
      if (activities.includes("None")) {
        setStep(5);
        return;
      }

      // otherwise start step 4
      setActivityIndex(0);
      setGymError("");
      setStep(4);
      return;
    }

    if (step === 4) {
      // validate current activity
      if (currentActivity === "Gym") {
        const err = validateGym();
        setGymError(err);
        if (err) return;
      }

      // move to next activity, else to review
      if (activityIndex < activityFlow.length - 1) {
        setActivityIndex((i) => i + 1);
      } else {
        setStep(5);
      }
      return;
    }
  };

  const goBack = () => {
    setSubmitError("");

    if (step === 1) return;

    if (step === 2) {
      setStep(1);
      return;
    }

    if (step === 3) {
      setStep(2);
      return;
    }

    if (step === 4) {
      // if at first activity -> back to step 3
      if (activityIndex === 0) {
        setStep(3);
      } else {
        setActivityIndex((i) => i - 1);
      }
      return;
    }

    if (step === 5) {
      // if we skipped step 4 (None), go back to 3, else back to 4 last activity
      if (activities.includes("None")) {
        setStep(3);
      } else {
        setStep(4);
        setActivityIndex(Math.max(0, activityFlow.length - 1));
      }
      return;
    }
  };

  // Build submission payload
  const payload = useMemo(() => {
    const out = {
      date,
      protein_grams: Number(protein),
      football_minutes: activities.includes("Football") ? parseNumOrZero(footballMinutes) : 0,
      squash_minutes: activities.includes("Squash") ? parseNumOrZero(squashMinutes) : 0,
      gym: null,
    };

    if (activities.includes("Gym")) {
      const day = selectedGymDay;
      const exercises = Array.isArray(day?.exercises) ? day.exercises : [];

      const gymEx = [];
      for (const ex of exercises) {
        const id = ex.exercise_id;
        const cat = ex.category;
        const inp = gymExerciseInputs[id] || {};

        if (cat === "Abs") {
          const r1 = inp.r1 ?? "";
          const r2 = inp.r2 ?? "";
          const r3 = inp.r3 ?? "";
          if ([r1, r2, r3].every((v) => v === "")) continue;

          gymEx.push({
            exercise_id: id,
            exercise_name: ex.exercise_name,
            sets: [{ reps: Number(r1) }, { reps: Number(r2) }, { reps: Number(r3) }],
          });
        } else {
          const w1 = inp.w1 ?? "";
          const w2 = inp.w2 ?? "";
          const w3 = inp.w3 ?? "";
          const r1 = inp.r1 ?? "";
          const r2 = inp.r2 ?? "";
          const r3 = inp.r3 ?? "";
          if ([w1, w2, w3, r1, r2, r3].every((v) => v === "")) continue;

          gymEx.push({
            exercise_id: id,
            exercise_name: ex.exercise_name,
            sets: [
              { weight: Number(w1), reps: Number(r1) },
              { weight: Number(w2), reps: Number(r2) },
              { weight: Number(w3), reps: Number(r3) },
            ],
          });
        }
      }

      out.gym = {
        day_number: Number(day?.day_number),
        day_name: day?.day_name,
        duration_minutes: Number(gymDuration),
        exercises: gymEx,
      };
    }

    return out;
  }, [date, protein, activities, footballMinutes, squashMinutes, selectedGymDay, gymDuration, gymExerciseInputs]);

  const onSubmit = async () => {
    setSubmitting(true);
    setSubmitError("");

    try {
      const res = await fetch("/api/end-of-day", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data?.ok) {
        setSubmitError(data?.error || "Submission failed");
        setSubmitting(false);
        return;
      }

      setShowCongrats(true);
    } catch (e) {
      setSubmitError(String(e?.message || e));
    } finally {
      setSubmitting(false);
    }
  };

  // --- UI sections per step
  const canNext =
    (step === 1 && step1NextEnabled) ||
    (step === 2 && step2NextEnabled) ||
    (step === 3 && step3Valid) ||
    (step === 4 && step4NextEnabled) ||
    step === 5;

  const nextLabel = step === 4 && activityIndex === activityFlow.length - 1 ? "Review" : "Next";

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="sticky top-0 z-40 -mx-6 mb-4 bg-slate-50 px-6 py-3">
  <Link className="text-sm font-bold underline text-gray-700" href="/dashboard">
    Back to Dashboard
  </Link>
</div>
      <div className="mx-auto max-w-3xl space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">End of Day</h1>
            <div className="mt-2">
              <Stepper step={step} />
            </div>
          </div>
        </header>

        {dbLoading && (
          <div className="rounded-2xl bg-white p-4 shadow-sm">Loading…</div>
        )}

        {!dbLoading && !db && (
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            Couldn’t load DB.
          </div>
        )}

        {!dbLoading && db && (
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            {/* STEP 1 */}
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <div className="text-sm font-bold text-gray-800">Choose date</div>
                  <input
                    type="date"
                    className="mt-2 w-full rounded-xl border px-3 py-2"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                  {dateError && (
                    <div className="mt-2 text-sm font-bold text-red-600">{dateError}</div>
                  )}
                </div>
              </div>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="text-sm font-bold text-gray-800">Enter protein intake</div>
                <InputWithSuffix
                  value={protein}
                  onChange={(e) => setProtein(e.target.value)}
                  placeholder="e.g. 160"
                  suffix="g"
                />
                <div className="text-xs font-semibold text-gray-500">
                  Must be greater than 0.
                </div>
              </div>
            )}

            {/* STEP 3 */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="text-sm font-bold text-gray-800">Choose exercise(s)</div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <SelectBox
                    label="Gym"
                    selected={activities.includes("Gym")}
                    onClick={() => toggleActivity("Gym")}
                    disabled={activities.includes("None")}
                  />
                  <SelectBox
                    label="Football"
                    selected={activities.includes("Football")}
                    onClick={() => toggleActivity("Football")}
                    disabled={activities.includes("None")}
                  />
                  <SelectBox
                    label="Squash"
                    selected={activities.includes("Squash")}
                    onClick={() => toggleActivity("Squash")}
                    disabled={activities.includes("None")}
                  />
                  <SelectBox
                    label="None"
                    selected={activities.includes("None")}
                    onClick={() => toggleActivity("None")}
                    disabled={activities.some((x) => x !== "None")}
                  />
                </div>

                <div className="text-xs font-semibold text-gray-500">
                  Choose 1–3 (Gym/Football/Squash) or choose None.
                </div>
              </div>
            )}

            {/* STEP 4 */}
            {step === 4 && (
              <div className="space-y-5">
                <div className="text-sm font-bold text-gray-800">
                  Enter data: <span className="text-emerald-700">{currentActivity}</span>
                </div>

                {currentActivity === "Football" && (
                  <div className="space-y-2">
                    <div className="text-sm font-bold text-gray-800">Time spent</div>
                    <InputWithSuffix
                      value={footballMinutes}
                      onChange={(e) => (isNonNegNumberString(e.target.value) ? setFootballMinutes(e.target.value) : null)}
                      placeholder="e.g. 60"
                      suffix="min"
                    />
                    <div className="text-xs font-semibold text-gray-500">
                      Must be greater than 0.
                    </div>
                  </div>
                )}

                {currentActivity === "Squash" && (
                  <div className="space-y-2">
                    <div className="text-sm font-bold text-gray-800">Time spent</div>
                    <InputWithSuffix
                      value={squashMinutes}
                      onChange={(e) => (isNonNegNumberString(e.target.value) ? setSquashMinutes(e.target.value) : null)}
                      placeholder="e.g. 45"
                      suffix="min"
                    />
                    <div className="text-xs font-semibold text-gray-500">
                      Must be greater than 0.
                    </div>
                  </div>
                )}

                {currentActivity === "Gym" && (
                  <div className="space-y-5">
                    {/* Gym day selection */}
                    {!gymDayNumber && (
                      <div className="space-y-3">
                        <div className="text-sm font-bold text-gray-800">Choose gym day</div>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                          {gymDays.map((d) => (
                            <button
                              key={d.day_number}
                              type="button"
                              onClick={() => setGymDayNumber(d.day_number)}
                              className="rounded-2xl border p-4 text-left font-bold hover:bg-gray-50"
                            >
                              <div className="text-sm">{d.day_name}</div>
                              <div className="mt-1 text-xs font-semibold text-gray-500">
                                Day {d.day_number} · {d.area}
                              </div>
                            </button>
                          ))}
                        </div>
                        +   <div className="pt-2">
                               <button
                                      type="button"
      disabled={!gymDraft}
      onClick={() => applyGymDraftToForm(gymDraft)}
      className="w-full rounded-xl border px-4 py-3 font-bold text-gray-800 disabled:opacity-50"
    >
           Choose Load Data
    </button>
     <div className="mt-2 text-xs font-semibold text-gray-500">
       {gymDraft
        ? `Loads your saved gym-live draft (${gymDraft.day_name || "Gym"}).`
        : "No saved gym-live draft found. Use Gym Live first."}
    </div>
  </div>
                      </div>
                    )}

                    {/* Gym entry */}
                    {gymDayNumber && (
                      <div className="space-y-5">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-bold text-gray-800">
                              {selectedGymDay?.day_name}
                            </div>
                            <div className="text-xs font-semibold text-gray-500">
                              {selectedGymDay?.area}
                            </div>
                          </div>

                          <button
                            type="button"
                            className="text-sm font-bold text-gray-600 underline"
                            onClick={() => {
                              setGymDayNumber(null);
                              setGymExerciseInputs({});
                              setGymDuration("");
                              setGymError("");
                            }}
                          >
                            Change
                          </button>
                        </div>

                        <div className="space-y-2">
                          <div className="text-sm font-bold text-gray-800">Time spent</div>
                          <InputWithSuffix
                            value={gymDuration}
                            onChange={(e) => setGymDuration(e.target.value)}
                            placeholder="e.g. 70"
                            suffix="min"
                          />
                        </div>

                        <div className="space-y-4">
                          {(selectedGymDay?.exercises || []).map((ex) => {
                            const inp = gymExerciseInputs[ex.exercise_id] || {};
                            const isAbs = ex.category === "Abs";

                            return (
                              <div key={ex.exercise_id} className="rounded-2xl border p-4">
                                <div className="text-sm font-bold text-gray-800">
                                  {ex.exercise_name}
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

                                      {!isAbs && (
                                        <div className="text-xs font-semibold text-gray-400">
                                          kg / reps
                                        </div>
                                      )}
                                      {isAbs && (
                                        <div className="text-xs font-semibold text-gray-400">
                                          reps
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>

                                <div className="mt-2 text-xs font-semibold text-gray-400">
                                  Leave all fields blank to skip this exercise.
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {gymError && (
                          <div className="text-sm font-bold text-red-600">{gymError}</div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* STEP 5 REVIEW */}
            {step === 5 && (
              <div className="space-y-4">
                <div className="text-sm font-bold text-gray-800">Review</div>

                <div className="rounded-2xl border p-4 text-sm">
                  <div className="font-bold text-gray-800">Receipt</div>

                  <div className="mt-3 space-y-2 text-gray-700">
                    <div className="flex justify-between">
                      <span className="font-semibold">Date</span>
                      <span className="font-bold">{date}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="font-semibold">Protein</span>
                      <span className="font-bold">{protein} g</span>
                    </div>

                    <div className="mt-3 font-bold text-gray-800">Activities</div>

                    <div className="flex justify-between">
                      <span className="font-semibold">Gym</span>
                      <span className="font-bold">
                        {activities.includes("Gym") ? `${gymDuration} min` : "—"}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="font-semibold">Football</span>
                      <span className="font-bold">
                        {activities.includes("Football") ? `${footballMinutes} min` : "—"}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="font-semibold">Squash</span>
                      <span className="font-bold">
                        {activities.includes("Squash") ? `${squashMinutes} min` : "—"}
                      </span>
                    </div>

                    {activities.includes("Gym") && (
                      <>
                        <div className="mt-3 font-bold text-gray-800">Gym details</div>
                        <div className="text-xs font-semibold text-gray-500">
                          {selectedGymDay?.day_name}
                        </div>

                        <div className="mt-2 space-y-2">
                          {(payload.gym?.exercises || []).map((ex) => (
                            <div key={ex.exercise_id} className="rounded-xl bg-gray-50 p-3">
                              <div className="text-xs font-bold text-gray-800">
                                {ex.exercise_name}
                              </div>
                              <div className="mt-1 text-xs text-gray-600">
                                {ex.sets
                                  .map((s, i) =>
                                    s.weight != null
                                      ? `S${i + 1}: ${s.weight}kg x ${s.reps}`
                                      : `S${i + 1}: ${s.reps} reps`
                                  )
                                  .join(" · ")}
                              </div>
                            </div>
                          ))}
                          {payload.gym?.exercises?.length === 0 && (
                            <div className="text-xs font-semibold text-gray-500">
                              No exercises entered (session still recorded).
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {submitError && (
                  <div className="text-sm font-bold text-red-600">{submitError}</div>
                )}

                <button
                  type="button"
                  disabled={submitting}
                  onClick={onSubmit}
                  className="w-full rounded-xl bg-black px-4 py-3 font-bold text-white disabled:opacity-50"
                >
                  {submitting ? "Submitting…" : "Submit"}
                </button>
              </div>
            )}

            {/* Controls */}
            <div className="mt-6 flex items-center justify-between">
              <button
                type="button"
                onClick={goBack}
                className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50"
              >
                <FiChevronLeft /> Back
              </button>

              {step !== 5 && (
                <button
                  type="button"
                  onClick={goNext}
                  disabled={!canNext}
                  className="inline-flex items-center gap-2 rounded-xl bg-black px-4 py-2 text-sm font-bold text-white disabled:bg-gray-300"
                >
                  {nextLabel} <FiChevronRight />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Congrats modal */}
        {showCongrats && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-lg">
              <div className="text-lg font-bold text-gray-900">
                Well done for the workout!
              </div>
              <div className="mt-2 text-sm font-semibold text-gray-600">
                Your end-of-day data has been saved.
              </div>

              <button
                type="button"
                className="mt-5 w-full rounded-xl bg-black px-4 py-3 font-bold text-white"
                onClick={() => {
                  setShowCongrats(false);
                  router.push("/dashboard");
                  router.refresh?.();
                }}
              >
                Thanks
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}