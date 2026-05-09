import { NextRequest, NextResponse } from "next/server";
import { verifyToken, getUserPlan, checkAndIncrement } from "@/lib/server-usage";

export async function POST(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "").trim();
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = await verifyToken(token);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const plan = await getUserPlan(userId);
  const result = await checkAndIncrement(userId, "tts", plan);

  if (!result.allowed) {
    return NextResponse.json(
      { error: "limit_reached", limit: result.limit },
      { status: 429 },
    );
  }

  return NextResponse.json({ allowed: true, used: result.used, limit: result.limit });
}
