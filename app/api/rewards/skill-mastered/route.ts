import { NextRequest, NextResponse } from "next/server";
import { requireApiSecret } from "@/lib/api-auth";
import { verifyToken } from "@/lib/server-usage";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { awardSkillMastered } from "@/lib/rewards";

/**
 * POST /api/rewards/skill-mastered  { subject, skillId, profileId? }
 * Awards the first-time-ever mastery bonus for a skill (idempotent per skill,
 * so it can never pay twice). Best-effort anti-cheat: when the client passes its
 * student profile id, we require at least one correct attempt logged for that
 * skill before paying. (Mastery itself is tracked client-side in this codebase,
 * so this is a guard, not a proof — the once-ever cap is the real ceiling.)
 */
export async function POST(req: NextRequest) {
  const authError = requireApiSecret(req);
  if (authError) return authError;

  const token = req.headers.get("authorization")?.replace("Bearer ", "").trim();
  const userId = token ? await verifyToken(token) : null;
  if (!userId) return NextResponse.json({ rubies: null });

  const { subject, skillId, profileId } = await req.json().catch(() => ({}));
  if (!subject || !skillId) {
    return NextResponse.json({ error: "subject and skillId required" }, { status: 400 });
  }

  // Best-effort guard: if we know the profile, confirm a correct attempt exists.
  if (profileId) {
    const { count } = await supabaseAdmin
      .from("skill_attempts")
      .select("id", { count: "exact", head: true })
      .eq("student_id", profileId)
      .eq("skill_id", skillId)
      .eq("is_correct", true);
    if ((count ?? 0) < 1) {
      return NextResponse.json({ rubies: null, skipped: "no_correct_attempts" });
    }
  }

  const rubies = await awardSkillMastered(userId, subject, skillId);
  return NextResponse.json({ rubies });
}
