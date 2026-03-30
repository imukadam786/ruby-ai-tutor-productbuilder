import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { buildCheckoutParams, PAYFAST_PROCESS_URL, PLAN_PRICES } from "@/lib/payfast";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { plan } = body as { plan: string };

  if (!PLAN_PRICES[plan]) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
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

  const nameParts = (profile?.full_name || "").trim().split(/\s+/);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  const params = buildCheckoutParams({
    userId:    user.id,
    plan,
    firstName: nameParts[0] || "Ruby",
    lastName:  nameParts.slice(1).join(" ") || "User",
    email:     profile?.email || user.email || "",
    baseUrl,
  });

  return NextResponse.json({ url: PAYFAST_PROCESS_URL, params });
}
