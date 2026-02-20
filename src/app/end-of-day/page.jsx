"use client";

import { useState } from "react";
import Link from "next/link";

export default function EndOfDayPage() {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [protein, setProtein] = useState("");
  const [footballMinutes, setFootballMinutes] = useState("");
  const [squashMinutes, setSquashMinutes] = useState("");

  const onSubmit = (e) => {
    e.preventDefault();

    // Convert to numbers (or null) cleanly
    const payload = {
      date,
      protein: protein === "" ? null : Number(protein),
      footballMinutes: footballMinutes === "" ? null : Number(footballMinutes),
      squashMinutes: squashMinutes === "" ? null : Number(squashMinutes)
    };

    alert(JSON.stringify(payload, null, 2));
  };

  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto max-w-2xl space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">End of Day</h1>
          <Link className="text-sm underline" href="/">
            Back to Dashboard
          </Link>
        </header>

        <form onSubmit={onSubmit} className="space-y-4 rounded-xl border p-4">
          <div>
            <label className="block text-sm font-medium">Date</label>
            <input
              type="date"
              className="mt-1 w-full rounded-md border px-3 py-2"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Protein (grams)</label>
            <input
              type="number"
              className="mt-1 w-full rounded-md border px-3 py-2"
              value={protein}
              onChange={(e) => setProtein(e.target.value)}
              min={0}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium">Football (minutes)</label>
              <input
                type="number"
                className="mt-1 w-full rounded-md border px-3 py-2"
                value={footballMinutes}
                onChange={(e) => setFootballMinutes(e.target.value)}
                min={0}
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Squash (minutes)</label>
              <input
                type="number"
                className="mt-1 w-full rounded-md border px-3 py-2"
                value={squashMinutes}
                onChange={(e) => setSquashMinutes(e.target.value)}
                min={0}
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full rounded-md bg-black px-4 py-2 text-white hover:opacity-90"
          >
            Save (placeholder)
          </button>
        </form>

        <p className="text-sm text-gray-600">
          Next step: replace the alert with API calls to persist data (KV/Postgres).
        </p>
      </div>
    </main>
  );
}