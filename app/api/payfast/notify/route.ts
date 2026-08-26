import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { verifyITNSignature } from "@/lib/payfast";
import { getStudyGuideDownloads, STUDY_GUIDE_NAMES } from "@/lib/study-guides";

export const runtime = "nodejs";

const resend = new Resend(process.env.RESEND_API_KEY);

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

  // Study-guide purchases from rubyaitutor.com/matrics are a separate,
  // unauthenticated once-off flow — handle and return before the
  // subscription logic below, which assumes m_payment_id is a real user id.
  if (data.custom_str1 === "study-guides") {
    return handleStudyGuidePurchase(data);
  }

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

      const { error: subErr } = await supabaseAdmin
        .from("subscriptions")
        .upsert(
          {
            user_id:            userId,
            plan:               plan || "starter",
            status:             "active",
            payfast_token:      null,
            current_period_end: accessEnd.toISOString(),
            updated_at:         new Date().toISOString(),
          },
          { onConflict: "user_id" },
        );
      if (subErr) console.error("[PayFast ITN] once-off subscription upsert error", subErr);

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

// ─────────────────────────────────────────────────────────────────────────────
// Study guide fulfilment
//
// custom_str4 carries the purchased guide ids as a comma-separated list
// (see app/api/payfast/study-guides/route.ts). Each guide can be more than
// one exam paper — the buyer gets one download link per paper, not one per
// subject.
// ─────────────────────────────────────────────────────────────────────────────

async function handleStudyGuidePurchase(data: Record<string, string>): Promise<NextResponse> {
  const {
    payment_status,
    email_address: email,
    custom_str2: school,
    custom_str4: guideIdsRaw,
    pf_payment_id: pfPaymentId,
    amount_gross: amountGross,
  } = data;

  console.log("[PayFast ITN] study-guides purchase", { payment_status, email, school, guideIdsRaw });

  if (payment_status !== "COMPLETE") {
    return new NextResponse("OK", { status: 200 });
  }

  if (!email) {
    console.error("[PayFast ITN] study-guides purchase missing email_address", { pfPaymentId });
    return new NextResponse("OK", { status: 200 });
  }

  const guideIds = (guideIdsRaw || "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);

  const guides = guideIds.map((id) => ({
    id,
    name: STUDY_GUIDE_NAMES[id] || id,
    downloads: getStudyGuideDownloads(id),
  }));

  const missing = guides.filter((g) => g.downloads.length === 0);
  if (missing.length > 0) {
    console.error("[PayFast ITN] study-guides purchase has unknown guide id(s)", {
      missing: missing.map((g) => g.id),
    });
  }

  const validGuides = guides.filter((g) => g.downloads.length > 0);

  if (validGuides.length === 0) {
    console.error("[PayFast ITN] study-guides purchase resolved to zero deliverable guides", { guideIdsRaw });
    return new NextResponse("OK", { status: 200 });
  }

  // Record the order so we can see who from which school bought which
  // guides — the PayFast statement itself only ever shows a guide count.
  const { error: orderErr } = await supabaseAdmin
    .from("study_guide_orders")
    .insert({
      email,
      school: school || "unknown",
      guide_ids: validGuides.map((g) => g.id),
      guide_names: validGuides.map((g) => g.name),
      amount: parseFloat(amountGross || "0"),
      payfast_payment_id: pfPaymentId || null,
    });
  if (orderErr) console.error("[PayFast ITN] study_guide_orders insert error", orderErr);

  const { error } = await resend.emails.send({
    from: "Ruby AI Tutor <guides@rubyaitutor.com>",
    to: email,
    subject: "Your Ruby study guides are ready to download",
    html: buildStudyGuideEmailHtml(validGuides),
  });

  if (error) {
    console.error("[PayFast ITN] study-guides Resend error:", error);
    // Still 200 — PayFast will retry the whole ITN on failure, which would
    // re-run the (idempotent) email send, not recover from a Resend outage.
  } else {
    console.log("[PayFast ITN] study-guides email sent", { email, guides: validGuides.map((g) => g.id) });
  }

  return new NextResponse("OK", { status: 200 });
}

function buildStudyGuideEmailHtml(
  guides: { id: string; name: string; downloads: { paper: number; url: string }[] }[]
): string {
  const rows = guides
    .map((g) => {
      const links = g.downloads
        .map(
          (d) => `
                  <a href="${d.url}" style="display:inline-block;margin:4px 8px 4px 0;padding:10px 18px;background:#BE1832;color:#ffffff;border-radius:999px;font-size:13px;font-weight:700;text-decoration:none;">
                    ${g.downloads.length > 1 ? `Paper ${d.paper}` : "Download"}
                  </a>`
        )
        .join("");
      return `
              <tr>
                <td style="padding:16px 0;border-top:1px solid #e5e7eb;">
                  <p style="margin:0 0 10px;font-size:15px;font-weight:700;color:#111827;">${g.name}</p>
                  ${links}
                </td>
              </tr>`;
    })
    .join("");

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:32px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:linear-gradient(135deg,#BE1832,#E8305A);padding:32px 40px;">
            <p style="margin:0;font-size:28px;font-weight:900;color:#ffffff;letter-spacing:-0.5px;">ruby</p>
            <p style="margin:6px 0 0;font-size:13px;color:rgba(255,255,255,0.75);">Matric Study Guides</p>
          </td>
        </tr>
        <tr>
          <td style="padding:36px 40px;">
            <p style="margin:0 0 8px;font-size:20px;font-weight:700;color:#111827;">Your study guides are ready</p>
            <p style="margin:0 0 8px;font-size:15px;color:#4b5563;line-height:1.6;">
              Thanks for your purchase. Every paper has its own download link below.
            </p>
            <table width="100%" cellpadding="0" cellspacing="0">
              ${rows}
            </table>
            <p style="margin:28px 0 0;font-size:13px;color:#9ca3af;line-height:1.6;">
              Keep this email, or save the PDFs somewhere safe, links won't be resent automatically.
            </p>
          </td>
        </tr>
        <tr>
          <td style="background:#f9fafb;padding:20px 40px;border-top:1px solid #e5e7eb;">
            <p style="margin:0;font-size:12px;color:#9ca3af;text-align:center;">
              Ruby AI Tutor · rubyaitutor.com<br>
              Questions? Reply to this email or chat to us on WhatsApp.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
