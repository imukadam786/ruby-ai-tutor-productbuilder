import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Public read-only client — plans are publicly visible
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

export async function GET() {
  const { data, error } = await supabase
    .from("plans")
    .select("key, label, price_rands, billing_interval, features, sort_order")
    .eq("is_active", true)
    .order("sort_order");

  if (error) {
    console.error("[GET /api/plans]", error);
    return NextResponse.json({ error: "Failed to load plans" }, { status: 500 });
  }

  return NextResponse.json(data);
}
