import { NextRequest, NextResponse } from "next/server";
import { requireApiSecret } from "@/lib/api-auth";
import { verifyToken } from "@/lib/server-usage";
import { getBalance } from "@/lib/rewards";

/** GET /api/rewards/balance → { balance } for the logged-in learner. */
export async function GET(req: NextRequest) {
  const authError = requireApiSecret(req);
  if (authError) return authError;

  const token = req.headers.get("authorization")?.replace("Bearer ", "").trim();
  const userId = token ? await verifyToken(token) : null;
  if (!userId) return NextResponse.json({ balance: 0 });

  const balance = await getBalance(userId);
  return NextResponse.json({ balance });
}
