import { NextRequest, NextResponse } from "next/server";
import { requireApiSecret } from "@/lib/api-auth";
import {
  getDomainForSkill,
  selectQuestion,
  bankQuestionToGenerated,
} from "@/lib/question-selector";
import { abilityLevel } from "@/lib/bkt";

export async function POST(req: NextRequest) {
  const deny = requireApiSecret(req);
  if (deny) return deny;
  try {
    const {
      skill_id,
      attempt_number = 1,
      include_hint = false,
      used_refs = [],
      p_learned,
    }: {
      skill_id: string;
      attempt_number?: number;
      include_hint?: boolean;
      used_refs?: string[];
      p_learned?: number;
    } = await req.json();

    // Find which domain covers this skill
    const domainId = getDomainForSkill(skill_id);
    if (!domainId) {
      return NextResponse.json(
        { error: `No question bank domain found for skill: ${skill_id}` },
        { status: 404 }
      );
    }

    // Derive ability level from BKT p_learned for difficulty-matched selection
    const ability = p_learned !== undefined ? abilityLevel(p_learned) : undefined;

    // Select a difficulty-matched unused question
    const bankQ = selectQuestion(domainId, used_refs, attempt_number > 1, skill_id, ability);
    if (!bankQ) {
      return NextResponse.json(
        { error: "No questions available for this domain" },
        { status: 404 }
      );
    }

    // Convert to GeneratedQuestion format
    const question = bankQuestionToGenerated(
      bankQ,
      skill_id,
      domainId,
      include_hint || attempt_number > 1
    );

    return NextResponse.json(question);
  } catch (error) {
    console.error("Generate question error:", error);
    return NextResponse.json(
      { error: "Failed to generate question" },
      { status: 500 }
    );
  }
}
