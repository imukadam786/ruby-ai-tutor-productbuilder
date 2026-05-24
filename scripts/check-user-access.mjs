// One-off diagnostic: look up a user by email and report plan / subscription / payment state.
// Usage: node scripts/check-user-access.mjs <email>
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import path from "node:path";

const envPath = path.resolve(process.cwd(), ".env.local");
const env = Object.fromEntries(
  readFileSync(envPath, "utf8")
    .split(/\r?\n/)
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    }),
);

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}
const admin = createClient(url, key);

const email = process.argv[2];
if (!email) {
  console.error("Usage: node scripts/check-user-access.mjs <email>");
  process.exit(1);
}

// 1. Look up the auth user
const { data: authList, error: authErr } = await admin.auth.admin.listUsers({
  page: 1,
  perPage: 1000,
});
if (authErr) {
  console.error("auth.admin.listUsers error:", authErr);
  process.exit(1);
}
const authUser = authList.users.find(
  (u) => u.email?.toLowerCase() === email.toLowerCase(),
);
if (!authUser) {
  console.log(`No auth user found for ${email}`);
  process.exit(0);
}
console.log("=== auth.users ===");
console.log({
  id: authUser.id,
  email: authUser.email,
  created_at: authUser.created_at,
  last_sign_in_at: authUser.last_sign_in_at,
  email_confirmed_at: authUser.email_confirmed_at,
});

// 2. public.users row
const { data: userRow, error: userErr } = await admin
  .from("users")
  .select("*")
  .eq("id", authUser.id)
  .maybeSingle();
console.log("\n=== public.users ===");
if (userErr) console.error(userErr);
else console.log(userRow);

// 3. subscriptions
const { data: subs, error: subErr } = await admin
  .from("subscriptions")
  .select("*")
  .eq("user_id", authUser.id);
console.log("\n=== subscriptions ===");
if (subErr) console.error(subErr);
else console.log(subs);

// 4. payments
const { data: pays, error: payErr } = await admin
  .from("payments")
  .select("*")
  .eq("user_id", authUser.id)
  .order("paid_at", { ascending: false });
console.log("\n=== payments ===");
if (payErr) console.error(payErr);
else console.log(pays);

// 5. voucher_redemptions
const { data: vrs, error: vrErr } = await admin
  .from("voucher_redemptions")
  .select("*")
  .eq("user_id", authUser.id);
console.log("\n=== voucher_redemptions ===");
if (vrErr) console.error(vrErr);
else console.log(vrs);
