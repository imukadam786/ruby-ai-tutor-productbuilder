import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export const runtime = "nodejs";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { name, email } = await request.json() as { name: string; email: string };

    if (!name || !email) {
      return NextResponse.json({ error: "Missing name or email" }, { status: 400 });
    }

    const { error } = await resend.emails.send({
      from: "Ruby AI Tutor <noreply@rubyaitutor.com>",
      to: email,
      subject: "Welcome to Ruby AI Tutor! 🎉",
      html: buildWelcomeHtml(name),
    });

    if (error) {
      console.error("[welcome email] Resend error:", error);
      return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[welcome email] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

function buildWelcomeHtml(name: string): string {
  const firstName = name.split(" ")[0] || name;
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:32px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#BE1832,#E8305A);padding:32px 40px;">
            <p style="margin:0;font-size:28px;font-weight:900;color:#ffffff;letter-spacing:-0.5px;">ruby</p>
            <p style="margin:6px 0 0;font-size:13px;color:rgba(255,255,255,0.75);">AI Tutor · Welcome</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:36px 40px;">
            <p style="margin:0 0 8px;font-size:22px;font-weight:700;color:#111827;">
              Welcome, ${firstName}! 🎉
            </p>
            <p style="margin:0 0 24px;font-size:15px;color:#4b5563;line-height:1.6;">
              Your account is ready. You have a <strong>7-day free trial</strong> — no credit card needed.
              Explore everything Ruby has to offer and start your learning journey today.
            </p>

            <!-- What you get -->
            <table cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:24px;">
              <tr>
                <td style="background:#fdf2f4;border-left:4px solid #BE1832;border-radius:0 8px 8px 0;padding:16px 20px;">
                  <p style="margin:0 0 8px;font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;">What's included in your trial</p>
                  <p style="margin:0;font-size:14px;color:#374151;line-height:1.8;">
                    ✓ Instant homework help in any subject<br>
                    ✓ Personalised Maths &amp; Reading journey<br>
                    ✓ Study in 11 South African languages<br>
                    ✓ Voice, image &amp; text input<br>
                    ✓ Available 24/7 — on any device
                  </p>
                </td>
              </tr>
            </table>

            <!-- CTA -->
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="border-radius:50px;background:#BE1832;">
                  <a href="https://rubyaitutor.com" target="_blank"
                     style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:50px;">
                    Start Learning →
                  </a>
                </td>
              </tr>
            </table>

            <p style="margin:28px 0 0;font-size:14px;color:#6b7280;line-height:1.6;">
              If you have any questions, just reply to this email — we're happy to help.
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f9fafb;padding:20px 40px;border-top:1px solid #e5e7eb;">
            <p style="margin:0;font-size:12px;color:#9ca3af;text-align:center;">
              Ruby AI Tutor · rubyaitutor.com<br>
              You received this because you created an account with us.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
