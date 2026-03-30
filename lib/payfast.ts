import crypto from "crypto";

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

// ── Plan catalogue ────────────────────────────────────────────────────────────

export const PLAN_PRICES: Record<string, { amount: string; itemName: string }> = {
  starter:  { amount: "149.00", itemName: "Ruby AI Tutor – Starter"  },
  pro:      { amount: "299.00", itemName: "Ruby AI Tutor – Pro"      },
  ultimate: { amount: "499.00", itemName: "Ruby AI Tutor – Ultimate" },
};

// ── Signature helpers ─────────────────────────────────────────────────────────

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

/** Verify the signature on an ITN POST body */
export function verifyITNSignature(data: Record<string, string>): boolean {
  const { signature, ...rest } = data;
  return signature === generateSignature(rest, PASSPHRASE);
}

// ── Checkout params builder ───────────────────────────────────────────────────

export function buildCheckoutParams({
  userId,
  plan,
  firstName,
  lastName,
  email,
  baseUrl,
}: {
  userId: string;
  plan: string;
  firstName: string;
  lastName: string;
  email: string;
  baseUrl: string;
}): Record<string, string> {
  const planInfo = PLAN_PRICES[plan];
  if (!planInfo) throw new Error(`Unknown plan: ${plan}`);

  // First billing date = today + 30 days (PayFast max is 30 days from today)
  const billingDay = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  const billingDate = billingDay.toISOString().split("T")[0]; // YYYY-MM-DD

  // Keep insertion order — PayFast signature is order-sensitive
  const params: Record<string, string> = {
    merchant_id:       MERCHANT_ID,
    merchant_key:      MERCHANT_KEY,
    return_url:        `${baseUrl}/settings?payment=success`,
    cancel_url:        `${baseUrl}/settings?payment=cancelled`,
    notify_url:        `${baseUrl}/api/payfast/notify`,
    name_first:        firstName || "Ruby",
    name_last:         lastName  || "User",
    email_address:     email,
    m_payment_id:      userId,          // referenced in ITN
    amount:            planInfo.amount,
    item_name:         planInfo.itemName,
    custom_str1:       plan,            // passed through ITN
    subscription_type: "1",
    billing_date:      billingDate,
    recurring_amount:  planInfo.amount,
    frequency:         "3",             // 3 = monthly
    cycles:            "0",             // 0 = indefinite
  };

  params.signature = generateSignature(params);
  return params;
}
