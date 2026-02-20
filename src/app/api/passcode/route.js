import { getDb } from "@/lib/db";

export async function GET() {
  const db = await getDb();
  return Response.json({ passcode: db.passcode.passcode });
}