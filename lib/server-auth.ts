/**
 * Server-side JWT verification for Next.js API routes.
 * Verifies tokens issued by the C# API using the shared JWT_SECRET.
 */
import crypto from "crypto";

export type JwtClaims = {
  sub: string;
  email: string;
  name?: string;
  plan?: string;
  exp: number;
  iss: string;
  aud: string;
};

function b64urlDecode(str: string): string {
  const padded = str + "=".repeat((4 - (str.length % 4)) % 4);
  return Buffer.from(padded.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8");
}

export function verifyJwt(token: string): JwtClaims | null {
  const secret = process.env.JWT_SECRET;
  if (!secret) return null;

  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const [headerB64, payloadB64, signature] = parts;

  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${headerB64}.${payloadB64}`)
    .digest("base64url");

  if (expected !== signature) return null;

  try {
    const claims = JSON.parse(b64urlDecode(payloadB64)) as JwtClaims;
    if (claims.exp && Date.now() / 1000 > claims.exp) return null;
    return claims;
  } catch {
    return null;
  }
}

export function getUserFromRequest(req: Request): JwtClaims | null {
  const auth = req.headers.get("Authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  return verifyJwt(auth.slice(7));
}
