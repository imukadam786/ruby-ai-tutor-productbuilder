// ─── app/api/reports/generate/route.ts ───────────────────────────────────────
// POST handler — called fire-and-forget after diagnostic placement completes.
// Accepts a pre-built DiagnosticReportInput (constructed client-side from
// the student profile, since the profile lives in localStorage not a server DB).

import { NextRequest, NextResponse } from "next/server";
import { generateReportContent, type DiagnosticReportInput } from "@/lib/report-generator";
import { buildDeterministicReportContent } from "@/lib/report-content-builder";
import { buildReportPDF } from "@/lib/report-pdf";
import { saveReport } from "@/lib/report-store";
import { requireApiSecret } from "@/lib/api-auth";

export async function POST(req: NextRequest) {
  const authError = requireApiSecret(req);
  if (authError) return authError;

  try {
    const body = await req.json();
    const { input, studentId }: { input: DiagnosticReportInput; studentId?: string } = body;

    if (!input?.studentName || !input?.subject) {
      return NextResponse.json(
        { error: "input with studentName and subject required" },
        { status: 400 }
      );
    }

    // 1. Generate AI content — fall back to deterministic builder if GPT-4o fails
    let content;
    try {
      content = await generateReportContent(input);
    } catch (aiErr) {
      console.warn("[ReportGenerate] GPT-4o failed, using deterministic fallback:", aiErr);
      content = buildDeterministicReportContent(input);
    }

    // 2. Build PDF
    const pdfBuffer = await buildReportPDF(input, content);

    // 3. Store — use real student ID when available, fall back to name
    const reportId = await saveReport({
      studentId: studentId ?? input.studentName,
      subject: input.subject,
      generatedAt: new Date().toISOString(),
      pdfBuffer,
      content,
    });

    return NextResponse.json({ reportId, success: true });
  } catch (err) {
    console.error("[ReportGenerate]", err);
    return NextResponse.json({ error: "Report generation failed" }, { status: 500 });
  }
}
