import { NextRequest, NextResponse } from "next/server";
import { requireApiSecret } from "@/lib/api-auth";
import { verifyToken } from "@/lib/server-usage";
import {
  getDomainForSkill,
  selectQuestion,
  bankQuestionToGenerated,
} from "@/lib/business-studies-selector";
import type { BusinessStudiesGenerateQuestionResponse } from "@/types/business-studies";

export async function POST(req: NextRequest) {
  const authError = requireApiSecret(req);
  if (authError) return authError;

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

    const topicId = getDomainForSkill(skill_id);
    if (!topicId) {
      return NextResponse.json(
        { error: `No businessStudies topic found for skill: ${skill_id}` },
        { status: 404 },
      );
    }

    const bankQ = selectQuestion(topicId, used_refs, attempt_number > 1, skill_id);
    if (!bankQ) {
      const empty: BusinessStudiesGenerateQuestionResponse = { question: null };
      return NextResponse.json(empty);
    }

    const question = bankQuestionToGenerated(bankQ, skill_id);
    const response: BusinessStudiesGenerateQuestionResponse = { question };
    return NextResponse.json(response);
  } catch (error) {
    console.error("[business-studies/generate-question] error:", error);
    return NextResponse.json(
      { error: "Failed to generate question" },
      { status: 500 },
    );
  }
}
