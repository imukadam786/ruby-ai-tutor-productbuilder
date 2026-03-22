import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // 🔐 use service role
);

function generateSignature(data: Record<string, string>, passphrase?: string) {
    const sortedKeys = Object.keys(data).sort();

    let pfOutput = "";
    for (const key of sortedKeys) {
        if (data[key] !== "") {
            pfOutput += `${key}=${encodeURIComponent(data[key]).replace(/%20/g, "+")}&`;
        }
    }

    pfOutput = pfOutput.slice(0, -1);

    if (passphrase) {
        pfOutput += `&passphrase=${encodeURIComponent(passphrase).replace(/%20/g, "+")}`;
    }

    return crypto.createHash("md5").update(pfOutput).digest("hex");
}

export async function POST(req: NextRequest) {
    const formData = await req.formData();

    const data: Record<string, string> = {};
    formData.forEach((value, key) => {
        data[key] = value.toString();
    });

    const receivedSignature = data.signature;
    delete data.signature;

    const generatedSignature = generateSignature(
        data,
        process.env.PAYFAST_PASSPHRASE
    );

    // 🔐 Validate signature
    if (receivedSignature !== generatedSignature) {
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    // ✅ Only process successful payments
    if (data.payment_status === "COMPLETE") {
        const email = data.email_address;
        const token = data.token; // 🔥 IMPORTANT

        await supabase
            .from("users")
            .update({
                paid: true,
                plan: data.item_name,
                subscription_token: token,
                subscription_status: "active",
                last_payment_date: new Date().toISOString(),
            })
            .eq("email", email);
    }

    if (data.payment_status === "FAILED") {
        await supabase
            .from("users")
            .update({
                subscription_status: "past_due",
            })
            .eq("email", data.email_address);
    }

    return NextResponse.json({ success: true });
}