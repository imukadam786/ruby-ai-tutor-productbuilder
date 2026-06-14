"use client";
// ─── components/DiagnosticReportView.tsx ──────────────────────────────────────
// Full-screen in-app diagnostic report. Matches the PDF template design.
// Props:
//   input          — placement data (built client-side from student profile)
//   onStartLearning — called when student taps "Start Learning"

import { buildDeterministicReportContent, } from "@/lib/report-content-builder";
import { describeError } from "@/lib/report-generator";
import type { DiagnosticReportInput } from "@/lib/report-generator";
import EduBackground from "@/components/EduBackground";
import Button from "@/components/ui/Button";

// ─── Colour helpers ───────────────────────────────────────────────────────────

const LABEL_STYLES = {
  strong:   { badge: "bg-green-100 text-green-800",  bar: "bg-green-500",  border: "border-green-200" },
  building: { badge: "bg-amber-100 text-amber-800",  bar: "bg-amber-400",  border: "border-amber-200" },
  practice: { badge: "bg-blue-100 text-blue-800",    bar: "bg-blue-400",   border: "border-blue-200"  },
};

const LABEL_TEXT = {
  strong:   "Strong foundation",
  building: "Building skills",
  practice: "Needs more practice",
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function Section({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-gray-100 bg-white shadow-sm p-5 ${className}`}>
      {children}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-3">{children}</p>
  );
}

function DomainCard({ domain, score, label, errorNote }: DiagnosticReportInput["domainScores"][0]) {
  const s = LABEL_STYLES[label];
  return (
    <div className={`rounded-xl border ${s.border} bg-white p-4`}>
      <div className="flex items-center justify-between mb-2">
        <span className="font-semibold text-gray-800 text-sm">{domain}</span>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${s.badge}`}>
          {LABEL_TEXT[label]}
        </span>
      </div>
      <div className="w-full h-2 rounded-full bg-gray-100 mb-1">
        <div
          className={`h-2 rounded-full ${s.bar} transition-all`}
          style={{ width: `${Math.max(4, score)}%` }}
        />
      </div>
      {errorNote && (
        <p className="text-xs text-gray-400 italic mt-1.5">{errorNote}</p>
      )}
    </div>
  );
}

function StepCircle({ n }: { n: number }) {
  return (
    <div className="w-8 h-8 rounded-full bg-[#E94663] text-white text-sm font-bold flex items-center justify-center flex-shrink-0">
      {n}
    </div>
  );
}

function CheckItem({ text }: { text: string }) {
  return (
    <div className="flex gap-2 items-start">
      <span className="text-green-600 font-bold mt-0.5">✓</span>
      <span className="text-green-800 text-sm">{text}</span>
    </div>
  );
}

function BulletItem({ text }: { text: string }) {
  return (
    <div className="flex gap-2 items-start">
      <span className="text-[#B7182E] font-bold mt-0.5 text-base leading-none">•</span>
      <span className="text-gray-700 text-sm">{text}</span>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function DiagnosticReportView({
  input,
  onStartLearning,
  ctaLabel = "Continue Learning 🚀",
}: {
  input: DiagnosticReportInput;
  onStartLearning: () => void;
  ctaLabel?: string;
}) {
  const content = buildDeterministicReportContent(input);
  const subject = input.subject === "maths" ? "Maths" : "Reading";
  const today = new Date().toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="flex flex-col h-full bg-[#F4F4F5] overflow-hidden relative">
      <EduBackground />

      {/* ── Scrollable body ── */}
      <div className="relative flex-1 overflow-y-auto pb-4">

        {/* ── Header — white panel ── */}
        <div className="bg-white px-5 py-5 border-b border-gray-100 shadow-sm">
          <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-2">ruby</p>
          <div className="flex flex-col gap-3">
            <div>
              <h1 className="text-gray-900 text-xl font-bold leading-tight">Discovery Report</h1>
              <p className="text-gray-400 text-sm mt-0.5">{subject} · Discovery Placement · {today}</p>
            </div>
            <div className="grid grid-cols-3 gap-3 border-t border-gray-100 pt-3">
              <div>
                <p className="text-gray-400 text-[10px] font-semibold uppercase tracking-wide">Student</p>
                <p className="text-gray-900 font-bold text-sm">{input.studentName}</p>
                <p className="text-gray-400 text-xs">Grade {input.studentGrade}</p>
              </div>
              <div>
                <p className="text-gray-400 text-[10px] font-semibold uppercase tracking-wide">Working Level</p>
                <p className="text-gray-900 font-bold text-sm leading-snug">{input.workingLevel}</p>
              </div>
              <div>
                <p className="text-gray-400 text-[10px] font-semibold uppercase tracking-wide">Score</p>
                <p className="text-gray-900 font-bold text-sm">{input.correctCount}/{input.questionsAnalysed}</p>
                <p className="text-gray-400 text-xs">Placement reliable</p>
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 py-5 space-y-4 max-w-xl mx-auto w-full">

          {/* ── Where student starts ── */}
          <div className="rounded-2xl bg-green-50 border border-green-200 p-5">
            <h2 className="font-bold text-green-800 text-base mb-2">
              📍 Where {input.studentName} starts on Ruby
            </h2>
            <p className="text-green-700 text-sm leading-relaxed">{content.placementSummary}</p>
          </div>

          {/* ── Performance by area ── */}
          <div>
            <SectionLabel>Performance by area</SectionLabel>
            <div className="space-y-3">
              {input.domainScores.map((d) => (
                <DomainCard key={d.domain} {...d} />
              ))}
            </div>
          </div>

          {/* ── Error patterns ── */}
          {input.dominantErrors.length > 0 && (() => {
            const patterns = input.dominantErrors
              .map((code) => describeError(code, input.subject))
              .filter(Boolean);
            if (!patterns.length) return null;
            return (
              <Section>
                <SectionLabel>Patterns found</SectionLabel>
                <div className="space-y-2">
                  {patterns.map((desc, i) => (
                    <div key={i} className="flex gap-2 items-start">
                      <span className="text-amber-500 font-bold mt-0.5 text-base leading-none">▸</span>
                      <span className="text-gray-700 text-sm leading-relaxed">{desc}</span>
                    </div>
                  ))}
                </div>
              </Section>
            );
          })()}

          {/* ── Strengths ── */}
          <div className="rounded-2xl bg-green-50 border border-green-200 p-5">
            <h2 className="font-bold text-green-800 text-base mb-2">
              ★ How Ruby will use {input.studentName}&apos;s strengths
            </h2>
            <p className="text-green-700 text-sm leading-relaxed">{content.strengthsNote}</p>
          </div>

          {/* ── Main focus / root cause ── */}
          <Section>
            <h2 className="font-bold text-gray-800 text-base mb-2">
              ▸ What to focus on first
            </h2>
            <p className="text-gray-600 text-sm leading-relaxed">{content.rootCauseSummary}</p>
          </Section>

          {/* ── Learning plan ── */}
          <Section>
            <SectionLabel>What Ruby will teach first</SectionLabel>
            <div className="space-y-5">
              {content.learningPlan.map((step) => (
                <div key={step.stepNumber} className="flex gap-3">
                  <StepCircle n={step.stepNumber} />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800 text-sm mb-1">{step.title}</p>
                    <p className="text-gray-600 text-sm leading-relaxed mb-1.5">{step.description}</p>
                    <p className="text-gray-400 text-xs italic">{step.estimate}</p>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* ── Experience ── */}
          <Section className="bg-gray-50">
            <h2 className="font-bold text-gray-800 text-base mb-3">
              What {input.studentName} will experience on Ruby
            </h2>
            <div className="space-y-2">
              {content.experienceBullets.map((b, i) => (
                <BulletItem key={i} text={b} />
              ))}
            </div>
          </Section>

          {/* ── Parent guidance ── */}
          <Section>
            <SectionLabel>Parent guidance</SectionLabel>
            <p className="text-gray-400 text-xs italic mb-4">
              Practical suggestions based specifically on what Ruby found in {input.studentName}&apos;s placement activity.
            </p>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1.5">What you may notice at home</p>
            <p className="text-gray-700 text-sm leading-relaxed mb-4">{content.parentGuidance.whatYouMayNotice}</p>
            <div className="border-t border-gray-100 pt-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1.5">How you can help this week</p>
              <p className="text-gray-700 text-sm leading-relaxed">{content.parentGuidance.howYouCanHelp}</p>
            </div>
          </Section>

          {/* ── Expected outcomes ── */}
          <div className="rounded-2xl bg-green-50 border border-green-200 p-5">
            <h2 className="font-bold text-green-800 text-base mb-3">
              What to expect as {input.studentName} progresses
            </h2>
            <div className="space-y-2">
              {content.expectedOutcomes.map((o, i) => (
                <CheckItem key={i} text={o} />
              ))}
            </div>
          </div>

          {/* ── After first session ── */}
          <div className="rounded-2xl bg-blue-50 border border-blue-200 p-5">
            <h2 className="font-bold text-blue-800 text-base mb-2">
              After {input.studentName}&apos;s first session
            </h2>
            <p className="text-blue-700 text-sm leading-relaxed">{content.nextSessionHook}</p>
          </div>

          {/* ── Footer ── */}
          <p className="text-center text-gray-400 text-xs pb-2">
            Generated by Ruby AI Tutor · {today}
          </p>
        </div>
      </div>

      {/* ── Bottom bar — constrained to match report content width ── */}
      <div className="relative bg-white border-t border-gray-200 py-3 flex-shrink-0">
        <div className="max-w-xl mx-auto px-4">
          <Button
            variant="success"
            size="lg"
            fullWidth
            onClick={onStartLearning}
          >
            {ctaLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
