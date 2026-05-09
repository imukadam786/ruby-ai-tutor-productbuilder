import { NextRequest, NextResponse } from "next/server";
import {
  getDomainForSkill,
  selectQuestion,
  bankQuestionToGenerated,
} from "@/lib/question-selector";

export async function POST(req: NextRequest) {
  try {
    const {
      skill_id,
      attempt_number = 1,
      include_hint = false,
      used_refs = [],
    }: {
      skill_id: string;
      attempt_number?: number;
      include_hint?: boolean;
      used_refs?: string[];
    } = await req.json();

    // Find which domain covers this skill
    const domainId = getDomainForSkill(skill_id);
    if (!domainId) {
      return NextResponse.json(
        { error: `No question bank domain found for skill: ${skill_id}` },
        { status: 404 }
      );
    }

    // Select a random unused question (excluding already-used refs)
    const bankQ = selectQuestion(domainId, used_refs, attempt_number > 1, skill_id);
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
