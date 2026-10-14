import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("Authorization");
  const token = authHeader?.replace("Bearer ", "");
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify JWT and get user
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
  const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
  if (authErr || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { plan, paymentType, voucherCode } = await request.json() as {
    plan: string;
    paymentType: "subscription" | "once-off";
    voucherCode?: string;
  };

  if (!plan || !paymentType) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // This route skips PayFast, so it must only unlock a plan when a valid
  // voucher brings the price to R0 (same checks as /api/payfast/checkout).
  if (!voucherCode) {
    return NextResponse.json({ error: "A voucher is required" }, { status: 403 });
  }
  const code = voucherCode.trim().toUpperCase();
  const { data: voucher } = await supabaseAdmin
    .from("vouchers")
    .select("discount_type, discount_value, applicable_plans, max_uses, used_count, expires_at, is_active")
    .eq("code", code)
    .maybeSingle();
  const { data: planData } = await supabaseAdmin
    .from("plans")
    .select("price_rands")
    .eq("key", plan)
    .eq("is_active", true)
    .maybeSingle();
  const voucherValid =
    voucher &&
    voucher.is_active &&
    (!voucher.expires_at || new Date(voucher.expires_at) >= new Date()) &&
    (voucher.max_uses === null || voucher.used_count < voucher.max_uses) &&
    (voucher.applicable_plans.length === 0 || voucher.applicable_plans.includes(plan));
  if (!voucher || !voucherValid || !planData) {
    return NextResponse.json({ error: "Voucher is not valid for this plan" }, { status: 403 });
  }
  const base = parseFloat(planData.price_rands);
  const dv   = parseFloat(voucher.discount_value);
  const discounted = voucher.discount_type === "percentage" ? base * (1 - dv / 100) : base - dv;
  if (discounted > 0.005) {
    return NextResponse.json({ error: "Voucher does not cover the full price" }, { status: 403 });
  }

  const userId = user.id;
  const isOnceOff = paymentType === "once-off";

  if (isOnceOff) {
    const accessEnd = plan === "matric-pack"
      ? new Date("2026-12-31T23:59:59Z")
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    // Login only lets a user in if their subscription row is active, so a
    // once-off plan needs one too (the PayFast ITN does the same).
    const { error: subErr } = await supabaseAdmin
      .from("subscriptions")
      .upsert(
        {
          user_id:            userId,
          plan,
          status:             "active",
          payfast_token:      null,
          current_period_end: accessEnd.toISOString(),
          updated_at:         new Date().toISOString(),
        },
        { onConflict: "user_id" },
      );

    if (subErr) {
      console.error("[plans/activate] once-off subscription upsert error", subErr);
      return NextResponse.json({ error: "Failed to activate plan" }, { status: 500 });
    }

    const { error: userErr } = await supabaseAdmin
      .from("users")
      .update({ plan, trial_expires_at: accessEnd.toISOString() })
      .eq("id", userId);

    if (userErr) {
      console.error("[plans/activate] user update error", userErr);
      return NextResponse.json({ error: "Failed to activate plan" }, { status: 500 });
    }
  } else {
    const periodEnd = new Date();
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    const { error: subErr } = await supabaseAdmin
      .from("subscriptions")
      .upsert(
        {
          user_id:            userId,
          plan,
          status:             "active",
          payfast_token:      null,
          current_period_end: periodEnd.toISOString(),
          updated_at:         new Date().toISOString(),
        },
        { onConflict: "user_id" },
      );

    if (subErr) {
      console.error("[plans/activate] subscription upsert error", subErr);
      return NextResponse.json({ error: "Failed to activate plan" }, { status: 500 });
    }

    const { error: userErr } = await supabaseAdmin
      .from("users")
      .update({ plan })
      .eq("id", userId);

    if (userErr) {
      console.error("[plans/activate] user plan update error", userErr);
      return NextResponse.json({ error: "Failed to activate plan" }, { status: 500 });
    }
  }

  // Record voucher redemption if used
  if (voucherCode) {
    const { error: redErr } = await supabaseAdmin
      .from("voucher_redemptions")
      .insert({ voucher_code: voucherCode, user_id: userId, plan });

    if (!redErr) {
      await supabaseAdmin.rpc("increment_voucher_use", { voucher_code: voucherCode });
    } else {
      console.error("[plans/activate] voucher redemption error", redErr);
    }
  }

  return NextResponse.json({ ok: true });
}
