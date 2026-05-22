import { NextRequest, NextResponse } from "next/server";
import { requireApiSecret } from "@/lib/api-auth";
import { verifyToken } from "@/lib/server-usage";
import {
  getDomainForSkill,
  selectQuestion,
  bankQuestionToGenerated,
} from "@/lib/afrikaans-selector";
import type { AfrikaansGenerateQuestionResponse } from "@/types/afrikaans";

export async function POST(req: NextRequest) {
  const authError = requireApiSecret(req);
  if (authError) return authError;

  // Auth required so progress can be tied to a user, but Afrikaans FAL is open
  // to all plans (including freebie) — same as Life Skills / reading.
  const token = req.headers.get("authorization")?.replace("Bearer ", "").trim();
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = await verifyToken(token);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const {
      skill_id,
      used_refs = [],
      attempt_number = 1,
    }: {
      skill_id: string;
      used_refs?: string[];
      attempt_number?: number;
    } = await req.json();

    const skillId = getDomainForSkill(skill_id);
    if (!skillId) {
      return NextResponse.json(
        { error: `No afrikaans-fal skill found for: ${skill_id}` },
        { status: 404 },
      );
    }

    const bankQ = selectQuestion(skillId, used_refs, attempt_number > 1);
    if (!bankQ) {
      const empty: AfrikaansGenerateQuestionResponse = { question: null };
      return NextResponse.json(empty);
    }

    const question = bankQuestionToGenerated(bankQ, skillId);
    const response: AfrikaansGenerateQuestionResponse = { question };
    return NextResponse.json(response);
  } catch (error) {
    console.error("[afrikaans/generate-question] error:", error);
    return NextResponse.json(
      { error: "Failed to generate question" },
      { status: 500 },
    );
  }
}
