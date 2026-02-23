import Link from "next/link";

export default function EndOfDayButton() {
  return (
    <section className="space-y-3">
      <Link
        href="/gym-live"
        className="inline-flex w-full items-center justify-center rounded-2xl bg-orange-400 px-5 py-3 text-base font-semibold text-white shadow-sm hover:bg-orange-50 hover:text-black sm:w-auto"
      >
        Gym Live
      </Link>

      <Link
        href="/end-of-day"
        className="inline-flex w-full items-center justify-center rounded-2xl bg-white px-5 py-3 text-base font-semibold text-orange-400 border border-orange-400 shadow-sm hover:bg-orange-200 sm:w-auto"
      >
        End of Day
      </Link>
    </section>
  );
}