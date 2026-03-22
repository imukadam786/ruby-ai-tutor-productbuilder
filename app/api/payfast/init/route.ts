import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const PAYFAST_URL =
  process.env.NODE_ENV === "production"
    ? "https://www.payfast.co.za/eng/process"
    : "https://sandbox.payfast.co.za/eng/process";

function generateSignature(data: Record<string, string>, passphrase?: string) {
  // Sort keys alphabetically
  const sortedKeys = Object.keys(data).sort();

  // Create query string
  let pfOutput = "";
  for (const key of sortedKeys) {
    if (data[key] !== "") {
      pfOutput += `${key}=${encodeURIComponent(data[key]).replace(/%20/g, "+")}&`;
    }
  }

  // Remove last &
  pfOutput = pfOutput.slice(0, -1);

  // Add passphrase if set
  if (passphrase) {
    pfOutput += `&passphrase=${encodeURIComponent(passphrase).replace(/%20/g, "+")}`;
  }

  return crypto.createHash("md5").update(pfOutput).digest("hex");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      name,
      email,
      grade,
      curriculum,
    } = body;

    // 🔥 Decide plan + amount
      const isGrade12 = grade === "12";
      const amount = isGrade12 ? "199.00" : "149.00";

      const today = new Date();
      const billingDate = new Date(today.setDate(today.getDate() + 1))
          .toISOString()
          .split("T")[0]; // start tomorrow

      const paymentData: Record<string, string> = {
          merchant_id: process.env.PAYFAST_MERCHANT_ID!,
          merchant_key: process.env.PAYFAST_MERCHANT_KEY!,

          return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/success`,
          cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/cancel`,
          notify_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/payfast/itn`,

          name_first: name,
          email_address: email,

          m_payment_id: crypto.randomUUID(),

          // 🔁 SUBSCRIPTION FIELDS
          subscription_type: "1",        // REQUIRED
          billing_date: billingDate,     // first charge
          recurring_amount: amount,
          frequency: "3",                // 3 = monthly
          cycles: "0",                   // 0 = infinite

          amount,                        // first charge
          item_name: "Ruby Subscription",

          custom_str1: grade || "",
          custom_str2: curriculum || "",
      };

    const signature = generateSignature(
      paymentData,
      process.env.PAYFAST_PASSPHRASE
    );

    const query = new URLSearchParams({
      ...paymentData,
      signature,
    }).toString();

    return NextResponse.json({
      redirectUrl: `${PAYFAST_URL}?${query}`,
    });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}