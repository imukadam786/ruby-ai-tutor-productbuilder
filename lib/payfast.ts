import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

// ── Config ────────────────────────────────────────────────────────────────────

const MERCHANT_ID  = process.env.PAYFAST_MERCHANT_ID!;
const MERCHANT_KEY = process.env.PAYFAST_MERCHANT_KEY!;
const PASSPHRASE   = process.env.PAYFAST_PASSPHRASE;

// Payment form URL (browser-side form POST)
const BASE = (process.env.PAYFAST_API_URL || "https://sandbox.payfast.co.za").replace(/\/$/, "");
export const PAYFAST_PROCESS_URL = `${BASE}/eng/process`;

// Subscriptions REST API (server-side)
const isSandbox = BASE.includes("sandbox");
export const PAYFAST_API_BASE = isSandbox
  ? "https://api.sandbox.payfast.co.za"
  : "https://api.payfast.co.za";

// ── Plan lookup (from DB) ─────────────────────────────────────────────────────

async function getPlanInfo(plan: string): Promise<{ amount: string; itemName: string }> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  const { data, error } = await supabase
    .from("plans")
    .select("price_rands, label")
    .eq("key", plan)
    .eq("is_active", true)
    .single();

  if (error || !data) throw new Error(`Unknown or inactive plan: ${plan}`);

  return {
    amount:   data.price_rands.toFixed(2),
    itemName: `Ruby AI Tutor – ${data.label}`,
  };
}

// ── Signature helpers ─────────────────────────────────────────────────────────

/**
 * Signature for PayFast REST API calls (cancel, update, etc.)
 * The REST API requires ALL parameters (including passphrase) sorted alphabetically
 * before hashing — unlike the checkout form where passphrase is appended at the end.
 *
 * Correct sorted order: merchant-id → passphrase → timestamp → version
 */
export function generateApiSignature(
  params: Record<string, string>,
  passphrase: string | undefined = PASSPHRASE,
): string {
  const all: Record<string, string> = {
    ...params,
    ...(passphrase ? { passphrase } : {}),
  };

  const str = Object.entries(all)
    .filter(([k]) => k !== "signature")
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${encodeURIComponent(v).replace(/%20/g, "+")}`)
    .join("&");

  return crypto.createHash("md5").update(str).digest("hex");
}

/**
 * Build the signature string (key=urlEncoded(value) pairs joined with &)
 * then return its MD5 hash.  Order of `params` is preserved — do NOT sort.
 */
export function generateSignature(
  params: Record<string, string>,
  passphrase: string | undefined = PASSPHRASE,
): string {
  const str = Object.entries(params)
    .filter(([k, v]) => k !== "signature" && v !== "")
    .map(([k, v]) => `${k}=${encodeURIComponent(v).replace(/%20/g, "+")}`)
    .join("&");

  const toHash = passphrase
    ? `${str}&passphrase=${encodeURIComponent(passphrase).replace(/%20/g, "+")}`
    : str;

  return crypto.createHash("md5").update(toHash).digest("hex");
}

/**
 * Verify the signature on an ITN POST body.
 * PayFast includes empty-value fields in the ITN signature, so we do NOT
 * filter them out here (unlike the checkout signature builder).
 */
export function verifyITNSignature(data: Record<string, string>): boolean {
  const { signature, ...rest } = data;

  const str = Object.entries(rest)
    .map(([k, v]) => `${k}=${encodeURIComponent(v).replace(/%20/g, "+")}`)
    .join("&");

  const toHash = PASSPHRASE
    ? `${str}&passphrase=${encodeURIComponent(PASSPHRASE).replace(/%20/g, "+")}`
    : str;

  const computed = crypto.createHash("md5").update(toHash).digest("hex");
  return signature === computed;
}

// ── Checkout params builder ───────────────────────────────────────────────────

export async function buildCheckoutParams({
  userId,
  plan,
  firstName,
  lastName,
  email,
  baseUrl,
  amountOverride,
  voucherCode,
  paymentType = "subscription",
}: {
  userId: string;
  plan: string;
  firstName: string;
  lastName: string;
  email: string;
  baseUrl: string;
  /** Pre-discounted amount in rands — omit to use the plan's full price. */
  amountOverride?: string;
  /** Voucher code passed through to ITN via custom_str2 for redemption tracking. */
  voucherCode?: string;
  /** "subscription" for recurring billing, "once-off" for a single charge. */
  paymentType?: "subscription" | "once-off";
}): Promise<Record<string, string>> {
  const planInfo = await getPlanInfo(plan);
  const amount = amountOverride ?? planInfo.amount;

  // Keep insertion order — PayFast signature is order-sensitive
  const params: Record<string, string> = {
    merchant_id:       MERCHANT_ID,
    merchant_key:      MERCHANT_KEY,
    return_url:        `${baseUrl}/?payment=success`,
    cancel_url:        `${baseUrl}/?payment=cancelled`,
    notify_url:        `${baseUrl}/api/payfast/notify`,
    name_first:        firstName || "Ruby",
    name_last:         lastName  || "User",
    email_address:     email,
    m_payment_id:      userId,
    amount,
    item_name:         planInfo.itemName,
    custom_str1:       plan,
    ...(voucherCode ? { custom_str2: voucherCode } : {}),
    custom_str3:       paymentType,
  };

  if (paymentType === "subscription") {
    // First billing date = today + 30 days (PayFast max is 30 days from today)
    const billingDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString().split("T")[0];
    params.subscription_type = "1";
    params.billing_date      = billingDate;
    params.recurring_amount  = amount;
    params.frequency         = "3"; // monthly
    params.cycles            = "0"; // indefinite
  }

  params.signature = generateSignature(params);
  return params;
}
