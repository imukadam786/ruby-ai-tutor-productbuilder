import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { results } = await req.json() as {
      results: Array<{ skillId: string; questionId: string; correct: boolean; response: string }>;
    };

    // Results are persisted client-side in localStorage.
    // This route exists as the server-side hook for future analytics/logging.
    return NextResponse.json({ ok: true, processed: results.length });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
