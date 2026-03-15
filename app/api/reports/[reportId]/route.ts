// ─── app/api/reports/[reportId]/route.ts ─────────────────────────────────────
// GET handler — returns a stored PDF by reportId.
// Used by the parent dashboard / download link in SettingsView.

import { NextRequest, NextResponse } from "next/server";
import { getReportPDF, getReportMeta } from "@/lib/report-store";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ reportId: string }> }
) {
  const { reportId } = await params;
  const pdf = await getReportPDF(reportId);

  if (!pdf) {
    return NextResponse.json({ error: "Report not found" }, { status: 404 });
  }

  const meta = await getReportMeta(reportId);
  const filename = meta
    ? `${meta.studentId}-${meta.subject}-report.pdf`
    : `${reportId}.pdf`;

  return new NextResponse(pdf as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${filename}"`,
      "Content-Length": String(pdf.length),
    },
  });
}
