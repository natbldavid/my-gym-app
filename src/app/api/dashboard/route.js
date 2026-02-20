import { getDb } from "@/lib/db";

function toISODate(d) {
  return d.toISOString().slice(0, 10);
}

export async function GET() {
  const db = await getDb();

  // Example dashboard view model (still includes full db if you want)
  const today = toISODate(new Date());

  const todayProtein = db.protein_intake.find((x) => x.date === today) || null;

  const recentGym = [...db.gym_sessions]
    .sort((a, b) => (a.session_date < b.session_date ? 1 : -1))
    .slice(0, 10);

  const recentFootball = [...db.football_sessions]
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, 10);

  const recentSquash = [...db.squash_sessions]
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, 10);

  return Response.json(
    {
      today,
      todayProtein,
      recentGym,
      recentFootball,
      recentSquash,
      gym_days_template: db.gym_days_template, // include if dashboard needs it
      // If you truly want *all data* too:
      db
    },
    { status: 200 }
  );
}