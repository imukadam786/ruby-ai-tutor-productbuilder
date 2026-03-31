import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { verifyITNSignature } from "@/lib/payfast";

/**
 * PayFast ITN (Instant Transaction Notification) webhook.
 * PayFast POSTs form-encoded data here after every payment event.
 * Must respond 200 OK — any other status triggers PayFast retries.
 */
export async function POST(request: NextRequest) {
  // Parse form-encoded body
  const formData = await request.formData();
  const data: Record<string, string> = {};
  formData.forEach((value, key) => {
    data[key] = value.toString();
  });

  // 1. Verify signature
  if (!verifyITNSignature(data)) {
    console.error("[PayFast ITN] Signature mismatch", data);
    return new NextResponse("Invalid signature", { status: 400 });
  }

  const {
    payment_status,
    m_payment_id:    userId,            // we stored userId here
    custom_str1:     plan,              // plan name
    token,                              // subscription token (set on first payment)
    amount_gross:    amountGross,       // actual amount charged
    pf_payment_id:   pfPaymentId,       // PayFast's own payment ID
  } = data;

  if (!userId) {
    return new NextResponse("Missing m_payment_id", { status: 400 });
  }

  // 2. Handle payment statuses
  if (payment_status === "COMPLETE") {
    const periodEnd = new Date();
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    const { error: subErr } = await supabaseAdmin
      .from("subscriptions")
      .upsert(
        {
          user_id:            userId,
          plan:               plan || "starter",
          status:             "active",
          payfast_token:      token || null,
          current_period_end: periodEnd.toISOString(),
          updated_at:         new Date().toISOString(),
        },
        { onConflict: "user_id" },
      );

    if (subErr) console.error("[PayFast ITN] subscription upsert error", subErr);

    const { error: payErr } = await supabaseAdmin
      .from("payments")
      .insert({
        user_id:           userId,
        payfast_payment_id: pfPaymentId || null,
        amount:            parseFloat(amountGross || "0"),
        plan:              plan || "starter",
        status:            "complete",
        paid_at:           new Date().toISOString(),
      });

    if (payErr) console.error("[PayFast ITN] payment insert error", payErr);

    const { error: userErr } = await supabaseAdmin
      .from("users")
      .update({ plan: plan || "starter" })
      .eq("id", userId);

    if (userErr) console.error("[PayFast ITN] user plan update error", userErr);

  } else if (payment_status === "CANCELLED") {
    await supabaseAdmin
      .from("subscriptions")
      .update({ status: "cancelled", updated_at: new Date().toISOString() })
      .eq("user_id", userId);

    await supabaseAdmin
      .from("users")
      .update({ plan: "free" })
      .eq("id", userId);

  } else if (payment_status === "FAILED") {
    await supabaseAdmin
      .from("subscriptions")
      .update({ status: "past_due", updated_at: new Date().toISOString() })
      .eq("user_id", userId);
  }

  return new NextResponse("OK", { status: 200 });
}
