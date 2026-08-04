import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export const runtime = "nodejs";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json() as {
      name: string;
      email: string;
      grade: string;
      packageType: "free" | "scholar" | "master" | "matric";
      trialEndDate?: string;
      loginUrl?: string;
      dashboardUrl?: string;
    };

    const { name, email, grade, packageType } = payload;

    if (!name || !email || !grade || !packageType) {
      return NextResponse.json(
        { error: "Missing required fields: name, email, grade, packageType" },
        { status: 400 }
      );
    }

    const subject = generateSubject(name, packageType, payload.trialEndDate);
    const html = buildWelcomeHtml(name, grade, packageType, payload);

    const { error } = await resend.emails.send({
      from: "Ruby AI Tutor <noreply@rubyaitutor.com>",
      to: email,
      subject,
      html,
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

function generateSubject(
  name: string,
  packageType: "free" | "scholar" | "master" | "matric",
  trialEndDate?: string
): string {
  const firstName = name.split(" ")[0] || name;

  switch (packageType) {
    case "free":
      return `🎉 ${firstName}'s 7-day Ruby journey starts now!`;
    case "scholar":
      return `Welcome to Ruby Scholar, ${firstName}!`;
    case "master":
      return `Welcome to Ruby Master, ${firstName}!`;
    case "matric":
      return `${firstName} is exam-ready with Ruby.`;
    default:
      return `🎉 ${firstName}'s learning journey begins today.`;
  }
}

function getGradeDescription(grade: string): string {
  const gradeNum = parseInt(grade);

  if (grade.toLowerCase() === "r" || grade.toLowerCase() === "kg") {
    return "Ruby is designed to make first learning experiences fun through reading, counting and confidence-building activities.";
  } else if (gradeNum >= 1 && gradeNum <= 3) {
    return "Ruby helps learners master reading, writing and maths foundations through personalised practice.";
  } else if (gradeNum >= 4 && gradeNum <= 7) {
    return "Ruby supports growing independence with CAPS-aligned lessons, homework assistance and personalised skills practice.";
  } else if (gradeNum >= 8 && gradeNum <= 9) {
    return "Ruby helps learners strengthen core concepts and prepare confidently for high school assessments.";
  } else if (gradeNum >= 10 && gradeNum <= 11) {
    return "Ruby provides subject-specific support, exam preparation and AI-powered homework help.";
  } else if (gradeNum === 12) {
    return "Ruby is built to help learners prepare confidently for Matric through guided practice, past papers and personalised revision.";
  }
  return "Ruby adapts to each learner's pace with personalised learning support.";
}

function getPackageIcon(packageType: string): string {
  switch (packageType) {
    case "free":
      return "🎁";
    case "scholar":
      return "❤️";
    case "master":
      return "⭐";
    case "matric":
      return "🎓";
    default:
      return "🎁";
  }
}

function getPackageTitle(packageType: string): string {
  switch (packageType) {
    case "free":
      return "Ruby Free";
    case "scholar":
      return "Ruby Scholar";
    case "master":
      return "Ruby Master";
    case "matric":
      return "Ruby Matric Exam Pack";
    default:
      return "Ruby";
  }
}

function buildPackageSection(
  packageType: "free" | "scholar" | "master" | "matric",
  grade: string
): string {
  const icon = getPackageIcon(packageType);
  const title = getPackageTitle(packageType);
  const gradeDesc = getGradeDescription(grade);

  const packageContent = {
    free: {
      intro: "You're starting with",
      description: "Perfect for exploring everything Ruby can do.",
      features: [
        "CAPS-aligned learning",
        "1 Discovery Activity",
        "1 Discovery Report",
        "5 AI Homework Questions each day",
        "5 Personalised Worksheets",
        "Home Language Feedback",
        "Audio Support",
      ],
      cta: "Start Learning",
    },
    scholar: {
      intro: "You're enrolled in",
      description: `Designed for learners in Grade ${grade}.`,
      features: [
        "Unlimited AI Homework Help",
        "Unlimited Hints",
        "Personalised Worksheets",
        "Discovery Activities",
        "Discovery Reports",
        "Audio Playback",
        "Home Language Feedback",
      ],
      cta: "Go to Dashboard",
    },
    master: {
      intro: "You're enrolled in",
      description: "Built specifically for Grade 12 learners preparing for Matric.",
      features: [
        "50+ Past Papers",
        "Study Guides",
        "Practice Exams",
        "AI Homework Help",
        "Personalised Revision",
      ],
      cta: "Start Preparing",
    },
    matric: {
      intro: "You're enrolled in",
      description: "Everything needed for exam season.",
      features: [
        "50+ Past Papers",
        "Study Guides",
        "2026 Practice Papers",
        "Unlimited AI Feedback",
        "Unlimited Access until 30 November 2026",
      ],
      cta: "Open My Exam Pack",
    },
  };

  const content = packageContent[packageType];
  const featuresList = content.features.map((f) => `✅ ${f}`).join("<br>");

  return `
    <!-- Package Section -->
    <tr>
      <td style="background:#fdf2f4;border-left:4px solid #BE1832;border-radius:0 8px 8px 0;padding:24px 20px;margin-bottom:20px;">
        <p style="margin:0 0 8px;font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;">${content.intro}</p>
        <p style="margin:0 0 4px;font-size:18px;font-weight:700;color:#111827;">
          ${icon} ${title}
        </p>
        <p style="margin:0 0 16px;font-size:14px;color:#374151;line-height:1.6;">
          ${content.description}
        </p>
        <p style="margin:0 0 12px;font-size:13px;font-weight:600;color:#111827;">Included:</p>
        <p style="margin:0;font-size:14px;color:#374151;line-height:1.8;">
          ${featuresList}
        </p>
      </td>
    </tr>

    <!-- Grade-Specific Section -->
    <tr>
      <td style="padding:20px 40px;background:#f3f4f6;">
        <p style="margin:0;font-size:13px;color:#374151;line-height:1.6;">
          ${gradeDesc}
        </p>
      </td>
    </tr>
  `;
}

function buildWelcomeHtml(
  name: string,
  grade: string,
  packageType: "free" | "scholar" | "master" | "matric",
  payload: any
): string {
  const firstName = name.split(" ")[0] || name;
  const dashboardUrl = payload.dashboardUrl || "https://rubyaitutor.com/dashboard";

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

        <!-- Hero Section -->
        <tr>
          <td style="padding:36px 40px;border-bottom:1px solid #e5e7eb;">
            <p style="margin:0 0 8px;font-size:24px;font-weight:700;color:#111827;">
              🎉 ${firstName}'s learning journey starts today.
            </p>
            <p style="margin:0 0 20px;font-size:15px;color:#4b5563;line-height:1.7;">
              Whether you're helping ${firstName} learn at home, or ${firstName} is exploring independently, Ruby is ready with personalised AI support every step of the way.
            </p>
          </td>
        </tr>

        <!-- Intro Copy -->
        <tr>
          <td style="padding:24px 40px;border-bottom:1px solid #e5e7eb;">
            <p style="margin:0 0 12px;font-size:14px;font-weight:600;color:#111827;">Hi,</p>
            <p style="margin:0 0 12px;font-size:14px;color:#374151;line-height:1.6;">
              Great news! ${firstName}'s Ruby AI Tutor account has been created successfully.
            </p>
            <p style="margin:0;font-size:14px;color:#374151;line-height:1.6;">
              Everything is ready, and learning can begin immediately. From homework help to personalised practice, Ruby adapts to each learner's pace and helps build confidence every day.
            </p>
          </td>
        </tr>

        <!-- Package Content -->
        <tr>
          <td style="padding:24px 40px;">
            ${buildPackageSection(packageType, grade)}
          </td>
        </tr>

        <!-- Progress Section -->
        <tr>
          <td style="padding:24px 40px;border-top:1px solid #e5e7eb;">
            <p style="margin:0 0 16px;font-size:15px;font-weight:700;color:#111827;">
              Here's what happens next
            </p>
            <table cellpadding="0" cellspacing="0" width="100%">
              <tr>
                <td style="padding:12px 0;border-bottom:1px solid #e5e7eb;">
                  <p style="margin:0;font-size:14px;color:#374151;"><strong>1️⃣ Complete the Discovery Activity</strong></p>
                </td>
              </tr>
              <tr>
                <td style="padding:12px 0;border-bottom:1px solid #e5e7eb;">
                  <p style="margin:0;font-size:14px;color:#374151;"><strong>2️⃣ Receive a personalised learning report</strong></p>
                </td>
              </tr>
              <tr>
                <td style="padding:12px 0;border-bottom:1px solid #e5e7eb;">
                  <p style="margin:0;font-size:14px;color:#374151;"><strong>3️⃣ Ruby builds a learning path</strong></p>
                </td>
              </tr>
              <tr>
                <td style="padding:12px 0;">
                  <p style="margin:0;font-size:14px;color:#374151;"><strong>4️⃣ Keep improving every week</strong></p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- CTA -->
        <tr>
          <td style="padding:24px 40px;text-align:center;">
            <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
              <tr>
                <td style="border-radius:50px;background:#BE1832;">
                  <a href="${dashboardUrl}" target="_blank"
                     style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:50px;">
                    ${packageType === "free" ? "Start Learning" : packageType === "scholar" ? "Go to Dashboard" : packageType === "master" ? "Start Preparing" : "Open My Exam Pack"} →
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f9fafb;padding:20px 40px;border-top:1px solid #e5e7eb;">
            <p style="margin:0 0 12px;font-size:12px;font-weight:600;color:#374151;">Questions?</p>
            <p style="margin:0 0 16px;font-size:12px;color:#6b7280;">
              Reply to this email anytime — we're here to help.
            </p>
            <p style="margin:0 0 12px;font-size:12px;color:#6b7280;">
              Happy learning,<br>
              <strong>The Ruby AI Tutor Team</strong>
            </p>
            <p style="margin:16px 0 0;font-size:11px;color:#9ca3af;border-top:1px solid #e5e7eb;padding-top:12px;">
              Ruby AI Tutor · rubyaitutor.com
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
