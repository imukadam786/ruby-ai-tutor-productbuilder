import { NextResponse } from "next/server";
import { supabase } from "../../../../lib/supabase";

export async function POST() {
    const users = await supabase
        .from("users")
        .select("*")
        .eq("subscription_status", "active");


    for (const user of users.data || []) {
        if (!user.subscription_token) continue;

        const amount = user.grade === "12" ? "199.00" : "149.00";

        try {
            await fetch(
                `https://api.payfast.co.za/subscriptions/${user.subscription_token}/adhoc`,
                {
                    method: "POST",
                    headers: {
                        "merchant-id": process.env.PAYFAST_MERCHANT_ID!,
                        "merchant-key": process.env.PAYFAST_MERCHANT_KEY!,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        amount: amount, // or dynamic
                        item_name: "Monthly Subscription",
                    }),
                }
            );
        } catch (err) {
            console.error("Charge failed", user.email);
        }
    }

    return NextResponse.json({ success: true });
}