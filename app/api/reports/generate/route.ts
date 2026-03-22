// ─── app/api/reports/generate/route.ts ───────────────────────────────────────
// POST handler — called fire-and-forget after diagnostic placement completes.
// Accepts a pre-built DiagnosticReportInput (constructed client-side from
// the student profile, since the profile lives in localStorage not a server DB).

import { NextRequest, NextResponse } from "next/server";
import { requireApiSecret } from "@/lib/api-auth";
import { generateReportContent, type DiagnosticReportInput } from "@/lib/report-generator";
import { buildReportPDF } from "@/lib/report-pdf";
import { saveReport } from "@/lib/report-store";

export async function POST(req: NextRequest) {
  const deny = requireApiSecret(req);
  if (deny) return deny;
  try {
    const body = await req.json();
    const { input }: { input: DiagnosticReportInput } = body;

    if (!input?.studentName || !input?.subject) {
      return NextResponse.json(
        { error: "input with studentName and subject required" },
        { status: 400 }
      );
    }

    // 1. Generate AI content
    const content = await generateReportContent(input);

    // 2. Build PDF
    const pdfBuffer = await buildReportPDF(input, content);

    // 3. Store
    const reportId = await saveReport({
      studentId: input.studentName, // Use name as ID (no server-side ID in localStorage model)
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
