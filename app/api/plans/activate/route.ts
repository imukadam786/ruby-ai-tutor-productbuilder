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

  const userId = user.id;
  const isOnceOff = paymentType === "once-off";

  if (isOnceOff) {
    const accessEnd = plan === "matric-pack"
      ? new Date("2026-06-30T23:59:59Z")
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

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
