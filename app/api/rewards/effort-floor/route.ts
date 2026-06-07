import { NextRequest, NextResponse } from "next/server";
import { requireApiSecret } from "@/lib/api-auth";
import { verifyToken } from "@/lib/server-usage";
import { awardEffortFloor } from "@/lib/rewards";

/**
 * POST /api/rewards/effort-floor  { subject, lessonId }
 * The fairness faucet: finishing a lesson earns a small reward even if answers
 * were wrong, so strugglers still earn. Once per lesson per day.
 */
export async function POST(req: NextRequest) {
  const authError = requireApiSecret(req);
  if (authError) return authError;

  const token = req.headers.get("authorization")?.replace("Bearer ", "").trim();
  const userId = token ? await verifyToken(token) : null;
  if (!userId) return NextResponse.json({ rubies: null });

  const { subject, lessonId } = await req.json().catch(() => ({}));
  if (!subject || !lessonId) {
    return NextResponse.json({ error: "subject and lessonId required" }, { status: 400 });
  }

  const rubies = await awardEffortFloor(userId, subject, lessonId);
  return NextResponse.json({ rubies });
}
