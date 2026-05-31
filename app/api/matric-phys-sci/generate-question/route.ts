import { NextRequest, NextResponse } from "next/server";
import { requireApiSecret } from "@/lib/api-auth";
import { verifyToken } from "@/lib/server-usage";
import {
  hasSkill,
  itemToGenerated,
  selectItem,
} from "@/lib/matric-phys-sci-selector";
import type { MatricPhysSciGenerateQuestionResponse } from "@/types/matric-phys-sci";

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

    if (!hasSkill(skill_id)) {
      return NextResponse.json(
        { error: `No Matric Physical Sciences skill found: ${skill_id}` },
        { status: 404 },
      );
    }

    const item = selectItem(skill_id, used_refs, attempt_number > 1);
    if (!item) {
      const empty: MatricPhysSciGenerateQuestionResponse = { question: null };
      return NextResponse.json(empty);
    }

    const question = itemToGenerated(item, skill_id);
    const response: MatricPhysSciGenerateQuestionResponse = { question };
    return NextResponse.json(response);
  } catch (error) {
    console.error("[matric-phys-sci/generate-question] error:", error);
    return NextResponse.json(
      { error: "Failed to generate question" },
      { status: 500 },
    );
  }
}
