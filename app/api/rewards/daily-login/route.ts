import { NextRequest, NextResponse } from "next/server";
import { requireApiSecret } from "@/lib/api-auth";
import { verifyToken } from "@/lib/server-usage";
import { awardDailyLogin } from "@/lib/rewards";

/**
 * POST /api/rewards/daily-login
 * Fired once on app load. Awards the daily-login reward (rising with the
 * day-streak, capped) the first time per day; a no-op for the rest of the day.
 */
export async function POST(req: NextRequest) {
  const authError = requireApiSecret(req);
  if (authError) return authError;

  const token = req.headers.get("authorization")?.replace("Bearer ", "").trim();
  const userId = token ? await verifyToken(token) : null;
  if (!userId) return NextResponse.json({ rubies: null });

  const rubies = await awardDailyLogin(userId);
  return NextResponse.json({ rubies });
}
