/**
 * Shared API secret guard.
 * All internal API routes call requireApiSecret(req) as the first thing.
 * The client sends the secret via the X-Ruby-Secret header (set in lib/fetch.ts).
 */
import { NextRequest, NextResponse } from "next/server";

export function requireApiSecret(req: NextRequest): NextResponse | null {
  const secret = process.env.RUBY_API_SECRET;
  if (!secret) {
    // Secret not configured — fail closed in production, warn in dev
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "Secret not configured on server" }, { status: 403 });
    }
    console.warn("[api-auth] RUBY_API_SECRET not set — skipping check in dev");
    return null;
  }

  const header = req.headers.get("x-ruby-secret");
  if (header?.trim() !== secret.trim()) {
    return NextResponse.json({ error: `Secret mismatch (server len=${secret.trim().length}, client len=${header?.trim().length ?? 0})` }, { status: 403 });
  }

  return null; // null = request is authorised, continue
}
