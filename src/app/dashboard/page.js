"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import WelcomeBack from "./sections/WelcomeBack";
import EndOfDayButton from "./sections/EndofDayButton";
import StatCards from "./sections/StatCards";
import ProteinWeekChart from "./sections/ProteinWeekChart";
import ActivityWeekChart from "./sections/ActivityWeekChart";
import ThisWeekGymSessions from "./sections/ThisWeekGymSessions";

const AUTH_KEY = "gymapp_authed";

export default function DashboardPage() {
  const router = useRouter();
  const [db, setDb] = useState(null);
  const [loading, setLoading] = useState(true);

  // Used by both charts so they stay in sync when you change week
  const [weekOffset, setWeekOffset] = useState(0);

  useEffect(() => {
    const authed = localStorage.getItem(AUTH_KEY);
    if (authed !== "1") {
      router.replace("/");
      return;
    }

    const load = async () => {
      try {
        const res = await fetch("/api/db", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to load database");
        const data = await res.json();
        setDb(data);
      } catch (err) {
        console.error(err);
        setDb(null);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [router]);

  const safeDb = useMemo(() => {
    // Defensive defaults so UI never crashes
    return {
      passcode: db?.passcode ?? null,
      gym_days_template: Array.isArray(db?.gym_days_template) ? db.gym_days_template : [],
      gym_sessions: Array.isArray(db?.gym_sessions) ? db.gym_sessions : [],
      protein_intake: Array.isArray(db?.protein_intake) ? db.protein_intake : [],
      football_sessions: Array.isArray(db?.football_sessions) ? db.football_sessions : [],
      squash_sessions: Array.isArray(db?.squash_sessions) ? db.squash_sessions : [],
    };
  }, [db]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#e3e3e3] p-6">
        <div className="mx-auto max-w-5xl space-y-4">
          <div className="h-8 w-40 animate-pulse rounded bg-gray-100" />
          <div className="h-12 w-48 animate-pulse rounded bg-gray-100" />
          <div className="h-40 w-full animate-pulse rounded-2xl bg-gray-100" />
        </div>
      </main>
    );
  }

  if (!db) {
    return (
      <main className="min-h-screen bg-gray-200 p-6">
        <div className="mx-auto max-w-2xl space-y-4">
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <div className="rounded-2xl border p-4">
            <p className="text-sm text-gray-700">
              Couldn’t load your database. Check your API and Upstash env vars.
            </p>
            <button
              className="mt-3 rounded-xl bg-orange-500 px-4 py-2 text-white hover:bg-orange-600"
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <WelcomeBack />

        <EndOfDayButton />

        <ThisWeekGymSessions db={safeDb} weekOffset={weekOffset} />

        <StatCards db={safeDb} />

        <ProteinWeekChart
          db={safeDb}
          weekOffset={weekOffset}
          setWeekOffset={setWeekOffset}
        />

        <ActivityWeekChart
          db={safeDb}
          weekOffset={weekOffset}
          setWeekOffset={setWeekOffset}
        />

      </div>
    </main>
  );
}