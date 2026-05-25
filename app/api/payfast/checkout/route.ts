import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { buildCheckoutParams, PAYFAST_PROCESS_URL } from "@/lib/payfast";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { plan, voucherCode, paymentType = "subscription", billingFrequency = "monthly", amountOverride: clientAmountOverride } = body as {
    plan: string;
    voucherCode?: string;
    paymentType?: "subscription" | "once-off";
    billingFrequency?: "weekly" | "monthly";
    amountOverride?: string;
  };

  if (!plan) {
    return NextResponse.json({ error: "Plan is required" }, { status: 400 });
  }

  // Authenticate user via the Bearer token from the client
  const token = request.headers.get("Authorization")?.replace("Bearer ", "");
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: `Bearer ${token}` } } },
  );

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("users")
    .select("full_name, email")
    .eq("id", user.id)
    .single();

  // ── Voucher validation (server-side, authoritative check) ─────────────────
  let amountOverride: string | undefined = clientAmountOverride;
  let resolvedVoucherCode: string | undefined;

  if (voucherCode) {
    const code = voucherCode.trim().toUpperCase();
    const { data: voucher } = await supabase
      .from("vouchers")
      .select("discount_type, discount_value, applicable_plans, max_uses, used_count, expires_at, is_active")
      .eq("code", code)
      .single();

    if (
      voucher &&
      voucher.is_active &&
      (!voucher.expires_at || new Date(voucher.expires_at) >= new Date()) &&
      (voucher.max_uses === null || voucher.used_count < voucher.max_uses) &&
      (voucher.applicable_plans.length === 0 || voucher.applicable_plans.includes(plan))
    ) {
      // Fetch base price to compute discounted amount
      const { data: planData } = await supabase
        .from("plans")
        .select("price_rands")
        .eq("key", plan)
        .eq("is_active", true)
        .single();

      if (planData) {
        const base = parseFloat(planData.price_rands);
        const dv   = parseFloat(voucher.discount_value);
        const discounted = voucher.discount_type === "percentage"
          ? base * (1 - dv / 100)
          : base - dv;
        amountOverride    = Math.max(0, discounted).toFixed(2);
        resolvedVoucherCode = code;
      }
    }
    // If voucher is invalid we silently fall back to full price — no error,
    // so a race condition (e.g. last use claimed while user was on the page)
    // still lets the user complete checkout at full price.
  }

  const nameParts = (profile?.full_name || "").trim().split(/\s+/);
  const baseUrl = `${request.nextUrl.protocol}//${request.nextUrl.host}`;

  console.log("[PayFast checkout] notify_url will be:", `${baseUrl}/api/payfast/notify`);

  let params: Record<string, string>;
  try {
    params = await buildCheckoutParams({
      userId:    user.id,
      plan,
      firstName: nameParts[0] || "Ruby",
      lastName:  nameParts.slice(1).join(" ") || "User",
      email:     profile?.email || user.email || "",
      baseUrl,
      amountOverride,
      voucherCode: resolvedVoucherCode,
      paymentType,
      billingFrequency,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Invalid plan";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  return NextResponse.json({ url: PAYFAST_PROCESS_URL, params });
}
