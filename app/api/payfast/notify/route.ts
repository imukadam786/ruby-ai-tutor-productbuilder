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

  console.log("[PayFast ITN] received", {
    payment_status: data.payment_status,
    m_payment_id: data.m_payment_id,
    custom_str1: data.custom_str1,
    pf_payment_id: data.pf_payment_id,
    amount_gross: data.amount_gross,
  });

  // 1. Verify signature
  if (!verifyITNSignature(data)) {
    console.error("[PayFast ITN] Signature mismatch — check PAYFAST_PASSPHRASE in env vars", {
      received_signature: data.signature,
    });
    return new NextResponse("Invalid signature", { status: 400 });
  }

  console.log("[PayFast ITN] Signature verified OK");

  const {
    payment_status,
    m_payment_id:    userId,
    custom_str1:     plan,
    custom_str2:     voucherCode,
    custom_str3:     paymentType,       // "subscription" | "once-off"
    token,                              // subscription token (set on first payment)
    amount_gross:    amountGross,
    pf_payment_id:   pfPaymentId,
  } = data;

  if (!userId) {
    return new NextResponse("Missing m_payment_id", { status: 400 });
  }

  // 2. Handle payment statuses
  if (payment_status === "COMPLETE") {
    const isOnceOff = paymentType === "once-off";

    // Always record the payment
    const { error: payErr } = await supabaseAdmin
      .from("payments")
      .insert({
        user_id:            userId,
        payfast_payment_id: pfPaymentId || null,
        amount:             parseFloat(amountGross || "0"),
        plan:               plan || "starter",
        status:             "complete",
        paid_at:            new Date().toISOString(),
      });
    if (payErr) console.error("[PayFast ITN] payment insert error", payErr);

    if (isOnceOff) {
      // Once-off: grant access until fixed end date (matric-pack) or 30 days
      const accessEnd = plan === "matric-pack"
        ? new Date("2026-06-30T23:59:59Z")
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

      const { error: userErr } = await supabaseAdmin
        .from("users")
        .update({ plan: plan || "starter", trial_expires_at: accessEnd.toISOString() })
        .eq("id", userId);
      if (userErr) console.error("[PayFast ITN] once-off user update error", userErr);
      else console.log("[PayFast ITN] once-off access granted until", accessEnd.toISOString());

    } else {
      // Subscription: upsert subscription row and update plan
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

      const { data: updatedUsers, error: userErr } = await supabaseAdmin
        .from("users")
        .update({ plan: plan || "starter" })
        .eq("id", userId)
        .select("id, plan");
      if (userErr) console.error("[PayFast ITN] user plan update error", userErr);
      else console.log("[PayFast ITN] user plan update result", { rowsUpdated: updatedUsers?.length, updatedUsers });
    }

    // Record voucher redemption if a voucher was used
    if (voucherCode) {
      const { error: redErr } = await supabaseAdmin
        .from("voucher_redemptions")
        .insert({ voucher_code: voucherCode, user_id: userId, plan: plan || "starter" });

      if (redErr) {
        console.error("[PayFast ITN] voucher redemption insert error", redErr);
      } else {
        await supabaseAdmin.rpc("increment_voucher_use", { voucher_code: voucherCode });
      }
    }

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
