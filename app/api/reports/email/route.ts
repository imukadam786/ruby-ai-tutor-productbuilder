import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { buildReportPDF } from "@/lib/report-pdf";
import type { DiagnosticReportInput, ReportContent } from "@/lib/report-generator";

const resend = new Resend(process.env.RESEND_API_KEY);

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function POST(request: NextRequest) {
  try {
    const { userId, subject, inputData, contentData } = await request.json() as {
      userId: string;
      subject: "maths" | "reading";
      inputData: DiagnosticReportInput;
      contentData: ReportContent;
    };

    if (!userId || !subject || !inputData || !contentData) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Fetch the user's email from the users table
    const { data: user, error: userErr } = await supabaseAdmin
      .from("users")
      .select("email, full_name")
      .eq("id", userId)
      .maybeSingle();

    if (userErr || !user?.email) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Build the PDF
    const pdfBuffer = await buildReportPDF(inputData, contentData);

    const subjectLabel = subject === "maths" ? "Maths" : "Reading";
    const studentName = inputData.studentName ?? "your child";
    const fileName = `Ruby_${subjectLabel}_Report_${studentName.replace(/\s+/g, "_")}.pdf`;

    // Send via Resend
    const { error: sendErr } = await resend.emails.send({
      from: "Ruby AI Tutor <reports@rubyaitutor.com>",
      to: user.email,
      subject: `${studentName}'s ${subjectLabel} Diagnostic Report — Ruby AI Tutor`,
      html: buildEmailHtml(studentName, subjectLabel),
      attachments: [
        {
          filename: fileName,
          content: pdfBuffer,
        },
      ],
    });

    if (sendErr) {
      console.error("[report/email] Resend error:", sendErr);
      return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[report/email] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

function buildEmailHtml(studentName: string, subject: string): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:32px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#BE1832,#E8305A);padding:32px 40px;">
            <p style="margin:0;font-size:28px;font-weight:900;color:#ffffff;letter-spacing:-0.5px;">ruby</p>
            <p style="margin:6px 0 0;font-size:13px;color:rgba(255,255,255,0.75);">AI Tutor · Diagnostic Report</p>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:36px 40px;">
            <p style="margin:0 0 16px;font-size:20px;font-weight:700;color:#111827;">
              ${studentName}'s ${subject} Report is ready
            </p>
            <p style="margin:0 0 24px;font-size:15px;color:#4b5563;line-height:1.6;">
              The diagnostic is complete. We've attached a full personalised report showing
              ${studentName}'s current level, domain performance, strengths, and a step-by-step
              learning plan.
            </p>
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="background:#f9fafb;border-left:4px solid #BE1832;border-radius:0 8px 8px 0;padding:16px 20px;">
                  <p style="margin:0 0 6px;font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;">What's inside</p>
                  <p style="margin:0;font-size:14px;color:#374151;line-height:1.7;">
                    ✓ Placement level &amp; working grade<br>
                    ✓ Domain scores with strengths &amp; gaps<br>
                    ✓ Root cause analysis<br>
                    ✓ Personalised learning plan<br>
                    ✓ Guidance for parents
                  </p>
                </td>
              </tr>
            </table>
            <p style="margin:28px 0 0;font-size:14px;color:#6b7280;line-height:1.6;">
              The report is attached as a PDF. You can also view it anytime inside the Ruby app
              under <strong>Settings → Reports</strong>.
            </p>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background:#f9fafb;padding:20px 40px;border-top:1px solid #e5e7eb;">
            <p style="margin:0;font-size:12px;color:#9ca3af;text-align:center;">
              Ruby AI Tutor · rubytutors.co.za<br>
              You received this because a diagnostic was completed on your account.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
