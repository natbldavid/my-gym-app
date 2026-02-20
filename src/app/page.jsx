import Link from "next/link";

export default function DashboardPage() {
  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <Link
            className="rounded-md bg-black px-4 py-2 text-white hover:opacity-90"
            href="/end-of-day"
          >
            End of Day
          </Link>
        </header>

        <section className="rounded-xl border p-4">
          <h2 className="text-lg font-medium">Quick Summary</h2>
          <p className="mt-2 text-sm text-gray-600">
            This will later show today’s protein, gym session summary, football/squash minutes, etc.
          </p>
        </section>

        <section className="rounded-xl border p-4">
          <h2 className="text-lg font-medium">Recent Entries</h2>
          <p className="mt-2 text-sm text-gray-600">
            This will later list recent gym sessions and activity entries.
          </p>
        </section>
      </div>
    </main>
  );
}