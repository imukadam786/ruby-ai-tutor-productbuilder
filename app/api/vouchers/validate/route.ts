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
      discounted_price?: number;  // final price in rands after discount (omitted when no plan supplied)
    }
  | { valid: false; error: string };

// ─────────────────────────────────────────────────────────────────────────────
// CORS
//
// The matric study-guide site (rubyaitutor.com/matrics) is a separate origin
// that calls this endpoint directly so its cart can show "voucher applied"
// before the buyer is sent to PayFast. Same allow-list as
// /api/payfast/study-guides.
// ─────────────────────────────────────────────────────────────────────────────

const ALLOWED_ORIGINS = [
  "https://rubyaitutor.com",
  "https://www.rubyaitutor.com",
  "https://rubyaitutor.web.app",
  "https://rubyaitutor.firebaseapp.com",
  "http://localhost:5173",
];

function corsHeaders(origin: string | null): Record<string, string> {
  const allowedOrigin =
    origin && ALLOWED_ORIGINS.includes(origin) ? origin : "https://rubyaitutor.com";
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
  };
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(request.headers.get("origin")),
  });
}

/**
 * GET /api/vouchers/validate?code=RUBY20&plan=starter
 *
 * No auth required — anyone can check if a voucher is valid.
 * Returns the discounted price so the UI can display it before checkout.
 * `plan` is optional; omit it to just check the code and read its terms.
 */
export async function GET(request: NextRequest) {
  const headers = corsHeaders(request.headers.get("origin"));
  const reply = (body: VoucherValidateResponse, status = 200) =>
    NextResponse.json<VoucherValidateResponse>(body, { status, headers });

  const { searchParams } = new URL(request.url);
  const code = (searchParams.get("code") ?? "").trim().toUpperCase();
  const plan = (searchParams.get("plan") ?? "").trim();

  if (!code) {
    return reply({ valid: false, error: "code is required" }, 400);
  }

  // Fetch voucher
  const { data: voucher, error: vErr } = await supabase
    .from("vouchers")
    .select("discount_type, discount_value, applicable_plans, max_uses, used_count, expires_at, is_active")
    .eq("code", code)
    .single();

  if (vErr || !voucher) {
    return reply({ valid: false, error: "Voucher not found" });
  }

  if (!voucher.is_active) {
    return reply({ valid: false, error: "Voucher is no longer active" });
  }

  if (voucher.expires_at && new Date(voucher.expires_at) < new Date()) {
    return reply({ valid: false, error: "Voucher has expired" });
  }

  if (voucher.max_uses !== null && voucher.used_count >= voucher.max_uses) {
    return reply({ valid: false, error: "Voucher has reached its usage limit" });
  }

  const applicablePlans: string[] = voucher.applicable_plans ?? [];
  const discountValue: number = parseFloat(voucher.discount_value);

  // If a specific plan was supplied, validate applicability and compute discounted price
  if (plan) {
    if (applicablePlans.length > 0 && !applicablePlans.includes(plan)) {
      return reply({
        valid: false,
        error: `Voucher is not valid for the ${plan} plan`,
      });
    }

    const { data: planData, error: pErr } = await supabase
      .from("plans")
      .select("price_rands")
      .eq("key", plan)
      .eq("is_active", true)
      .single();

    if (pErr || !planData) {
      return reply({ valid: false, error: "Plan not found" });
    }

    const basePrice: number = parseFloat(planData.price_rands);
    let discountedPrice: number;
    if (voucher.discount_type === "percentage") {
      discountedPrice = basePrice * (1 - discountValue / 100);
    } else {
      discountedPrice = basePrice - discountValue;
    }
    discountedPrice = Math.max(0, Math.round(discountedPrice * 100) / 100);

    return reply({
      valid: true,
      discount_type: voucher.discount_type,
      discount_value: discountValue,
      applicable_plans: applicablePlans,
      discounted_price: discountedPrice,
    });
  }

  // No plan supplied — return voucher details only (UI computes per-plan prices itself)
  return reply({
    valid: true,
    discount_type: voucher.discount_type,
    discount_value: discountValue,
    applicable_plans: applicablePlans,
  });
}
