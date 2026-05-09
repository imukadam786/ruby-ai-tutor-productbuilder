import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { PAYFAST_API_BASE, generateApiSignature } from "@/lib/payfast";
import { getUserFromRequest } from "@/lib/server-auth";

export async function POST(request: NextRequest) {
  const claims = getUserFromRequest(request);
  if (!claims) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Get PayFast subscription token
  const { data: sub } = await supabaseAdmin
    .from("subscriptions")
    .select("payfast_token, status")
    .eq("user_id", claims.sub)
    .single();

  if (!sub?.payfast_token) {
    return NextResponse.json({ error: "No active PayFast subscription found" }, { status: 400 });
  }

  // Build PayFast API request headers with signature
  const merchantId = process.env.PAYFAST_MERCHANT_ID!;
  const passphrase = process.env.PAYFAST_PASSPHRASE!;
  const version    = "v1";
  //const timestamp  = new Date().toISOString().replace("T", " ").substring(0, 19);
  const timestamp = new Date().toISOString().slice(0, 19);

  const signatureParams = { "merchant-id": merchantId, version, timestamp };
  const signature = generateApiSignature(signatureParams, passphrase);

  // Call PayFast subscriptions cancel API
  const pfRes = await fetch(
    `${PAYFAST_API_BASE}/subscriptions/${sub.payfast_token}/cancel`,
    {
      method: "PUT",
      headers: {
        "merchant-id": merchantId,
        version,
        timestamp,
        signature,
        "Content-Type": "application/json",
      },
    },
  );

  if (!pfRes.ok) {
    const text = await pfRes.text();
    console.error("[PayFast cancel]", pfRes.status, text);
    return NextResponse.json({ error: "PayFast API error" }, { status: 502 });
  }

  // Update DB
  await supabaseAdmin
    .from("subscriptions")
    .update({ status: "cancelled", updated_at: new Date().toISOString() })
    .eq("user_id", claims.sub);

  await supabaseAdmin
    .from("users")
    .update({ plan: "free" })
    .eq("id", claims.sub);

  return NextResponse.json({ success: true });
}
