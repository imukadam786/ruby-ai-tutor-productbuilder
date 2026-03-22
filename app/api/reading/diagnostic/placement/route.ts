import { NextRequest, NextResponse } from "next/server";
import { requireApiSecret } from "@/lib/api-auth";
import { DiagnosticTaskResult } from "@/types/reading";
import { calculateReadingPlacement } from "@/lib/reading-placement-calculator";

export async function POST(req: NextRequest) {
  const deny = requireApiSecret(req);
  if (deny) return deny;
  try {
    const { tasks, grade } = await req.json() as { tasks: DiagnosticTaskResult[]; grade?: number };

    if (!tasks || tasks.length === 0) {
      return NextResponse.json({ error: "No tasks provided" }, { status: 400 });
    }

    const result = calculateReadingPlacement(tasks, grade);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Diagnostic placement error:", error);
    return NextResponse.json({ error: "Failed to calculate placement" }, { status: 500 });
  }
}
