import { NextRequest, NextResponse } from "next/server";
import { verifyToken, getUsage } from "@/lib/server-usage";

export async function GET(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "").trim();
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = await verifyToken(token);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await getUsage(userId);
  return NextResponse.json(result);
}
