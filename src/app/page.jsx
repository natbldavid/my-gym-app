"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const AUTH_KEY = "gymapp_authed";

export default function PasscodePage() {
  const router = useRouter();
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // If already authed, go straight to dashboard
    const authed = localStorage.getItem(AUTH_KEY);
    if (authed === "1") router.replace("/dashboard");
  }, [router]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Uses your passcode API (recommended vs hardcoding)
      const res = await fetch("/api/passcode", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch passcode");
      const data = await res.json();

      if (String(passcode).trim() === String(data.passcode)) {
        localStorage.setItem(AUTH_KEY, "1");
        router.push("/dashboard");
      } else {
        setError("Incorrect passcode.");
      }
    } catch (err) {
      setError(err?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white p-6">
      <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">Enter passcode</h1>
          <p className="text-sm text-gray-600">
            Personal tracker access.
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border p-4 shadow-sm">
          <div>
            <label className="block text-sm font-medium">Passcode</label>
            <input
              type="password"
              className="mt-1 w-full rounded-xl border px-3 py-2 text-base outline-none focus:ring-2 focus:ring-orange-400"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              placeholder="••••••"
              autoFocus
            />
          </div>

          {error ? (
            <div className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-orange-500 px-4 py-2 font-medium text-white hover:bg-orange-600 disabled:opacity-60"
          >
            {loading ? "Checking..." : "Submit"}
          </button>
        </form>
      </div>
    </main>
  );
}