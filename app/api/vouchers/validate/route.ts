import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

export type VoucherValidateResponse =
  | {
      valid: true;
      discount_type: "percentage" | "fixed";
      discount_value: number;
      applicable_plans: string[]; // empty = all paid plans
      discounted_price: number;   // final price in rands after discount
    }
  | { valid: false; error: string };

/**
 * GET /api/vouchers/validate?code=RUBY20&plan=starter
 *
 * No auth required — anyone can check if a voucher is valid.
 * Returns the discounted price so the UI can display it before checkout.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = (searchParams.get("code") ?? "").trim().toUpperCase();
  const plan = (searchParams.get("plan") ?? "").trim();

  if (!code || !plan) {
    return NextResponse.json<VoucherValidateResponse>(
      { valid: false, error: "code and plan are required" },
      { status: 400 },
    );
  }

  // Fetch voucher
  const { data: voucher, error: vErr } = await supabase
    .from("vouchers")
    .select("discount_type, discount_value, applicable_plans, max_uses, used_count, expires_at, is_active")
    .eq("code", code)
    .single();

  if (vErr || !voucher) {
    return NextResponse.json<VoucherValidateResponse>({ valid: false, error: "Voucher not found" });
  }

  if (!voucher.is_active) {
    return NextResponse.json<VoucherValidateResponse>({ valid: false, error: "Voucher is no longer active" });
  }

  if (voucher.expires_at && new Date(voucher.expires_at) < new Date()) {
    return NextResponse.json<VoucherValidateResponse>({ valid: false, error: "Voucher has expired" });
  }

  if (voucher.max_uses !== null && voucher.used_count >= voucher.max_uses) {
    return NextResponse.json<VoucherValidateResponse>({ valid: false, error: "Voucher has reached its usage limit" });
  }

  // Check plan applicability — empty array means valid for all paid plans
  const applicablePlans: string[] = voucher.applicable_plans ?? [];
  if (applicablePlans.length > 0 && !applicablePlans.includes(plan)) {
    return NextResponse.json<VoucherValidateResponse>({
      valid: false,
      error: `Voucher is not valid for the ${plan} plan`,
    });
  }

  // Fetch the plan's base price
  const { data: planData, error: pErr } = await supabase
    .from("plans")
    .select("price_rands")
    .eq("key", plan)
    .eq("is_active", true)
    .single();

  if (pErr || !planData) {
    return NextResponse.json<VoucherValidateResponse>({ valid: false, error: "Plan not found" });
  }

  const basePrice: number = parseFloat(planData.price_rands);
  const discountValue: number = parseFloat(voucher.discount_value);

  let discountedPrice: number;
  if (voucher.discount_type === "percentage") {
    discountedPrice = basePrice * (1 - discountValue / 100);
  } else {
    discountedPrice = basePrice - discountValue;
  }
  discountedPrice = Math.max(0, Math.round(discountedPrice * 100) / 100);

  return NextResponse.json<VoucherValidateResponse>({
    valid: true,
    discount_type: voucher.discount_type,
    discount_value: discountValue,
    applicable_plans: applicablePlans,
    discounted_price: discountedPrice,
  });
}
