"use client";

import { useEffect, useState } from "react";
import type { DiagnosticReportInput, ReportContent } from "@/lib/report-generator";
import { supabase } from "@/lib/supabase";

interface Props {
  subject: "maths" | "reading";
  onBack: () => void;
}

const LABEL_STYLE: Record<string, string> = {
  strong:   "bg-green-100 text-green-700",
  building: "bg-amber-100 text-amber-700",
  practice: "bg-red-100 text-red-600",
};

const LABEL_TEXT: Record<string, string> = {
  strong:   "Strong",
  building: "Building",
  practice: "Needs practice",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
      <h2 className="text-sm font-semibold text-[#1a2744] uppercase tracking-wide">{title}</h2>
      {children}
    </div>
  );
}

function Prose({ text }: { text: string }) {
  return <p className="text-sm text-gray-700 leading-relaxed">{text}</p>;
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="p-2 -ml-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
    >
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
      </svg>
    </button>
  );
}

export default function SavedReportView({ subject, onBack }: Props) {
  const [reportData, setReportData] = useState<{ input: DiagnosticReportInput; content: ReportContent; generatedAt: number } | null | undefined>(undefined);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setReportData(null); return; }
      const { data } = await supabase
        .from("student_reports")
        .select("input_data, content_data, generated_at")
        .eq("user_id", user.id)
        .eq("subject", subject)
        .order("generated_at", { ascending: false })
        .limit(1)
        .single();
      if (data) {
        setReportData({
          input: data.input_data as unknown as DiagnosticReportInput,
          content: data.content_data as unknown as ReportContent,
          generatedAt: new Date(data.generated_at as string).getTime(),
        });
      } else {
        setReportData(null);
      }
    })();
  }, [subject]);

  const subjectLabel = subject === "maths" ? "Maths" : "Reading";

  if (reportData === undefined) {
    return (
      <div className="flex flex-col h-full bg-[#F4F4F5] items-center justify-center">
        <p className="text-gray-400 text-sm">Loading report…</p>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="flex flex-col h-full bg-[#F4F4F5]">
        <div className="bg-white border-b border-gray-100 px-5 py-4 flex items-center gap-3 flex-shrink-0">
          <BackButton onClick={onBack} />
          <h1 className="font-semibold text-gray-900 text-lg">{subjectLabel} Discovery Report</h1>
        </div>
        <div className="flex-1 flex items-center justify-center p-8 text-center">
          <div className="space-y-2">
            <p className="text-gray-700 font-medium">No report available yet.</p>
            <p className="text-sm text-gray-400">Complete the {subjectLabel} diagnostic to unlock your report.</p>
          </div>
        </div>
      </div>
    );
  }

  const { input, content } = reportData;
  const generatedDate = new Date(reportData.generatedAt).toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric",
  });

  return (
    <div className="flex flex-col h-full bg-[#F4F4F5]">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-5 py-4 flex items-center gap-3 flex-shrink-0">
        <BackButton onClick={onBack} />
        <div className="flex-1 min-w-0">
          <h1 className="font-semibold text-gray-900 text-lg leading-tight">{subjectLabel} Discovery Report</h1>
          <p className="text-xs text-gray-400 mt-0.5">{input.studentName} · Grade {input.studentGrade} · {generatedDate}</p>
        </div>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">

          {/* Placement overview */}
          <Section title="Placement Overview">
            <div className="flex flex-wrap gap-3">
              <div className="flex-1 min-w-[120px] bg-[#1a2744] rounded-xl px-4 py-3 text-white">
                <p className="text-xs opacity-70 mb-0.5">Starting level</p>
                <p className="text-base font-bold">{input.workingLevel}</p>
              </div>
              <div className="flex-1 min-w-[120px] bg-gray-50 rounded-xl px-4 py-3">
                <p className="text-xs text-gray-400 mb-0.5">Questions completed</p>
                <p className="text-base font-bold text-gray-800">{input.questionsAnalysed}</p>
              </div>
              {input.skillsCompleted > 0 && (
                <div className="flex-1 min-w-[120px] bg-green-50 rounded-xl px-4 py-3">
                  <p className="text-xs text-green-600 mb-0.5">Skills already known</p>
                  <p className="text-base font-bold text-green-700">{input.skillsCompleted}</p>
                </div>
              )}
            </div>
            <Prose text={content.placementSummary} />
          </Section>

          {/* Domain scores */}
          {input.domainScores.length > 0 && (
            <Section title="Topic Breakdown">
              <div className="space-y-3">
                {input.domainScores.map((d) => (
                  <div key={d.domain}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-700 font-medium">{d.domain}</span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${LABEL_STYLE[d.label] ?? "bg-gray-100 text-gray-600"}`}>
                        {LABEL_TEXT[d.label] ?? d.label}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${d.label === "strong" ? "bg-green-400" : d.label === "building" ? "bg-amber-400" : "bg-red-400"}`}
                        style={{ width: `${d.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Strengths */}
          <Section title="What's Going Well">
            <Prose text={content.strengthsNote} />
          </Section>

          {/* Root cause */}
          <Section title="What Ruby Will Focus On">
            <Prose text={content.rootCauseSummary} />
          </Section>

          {/* Learning plan */}
          <Section title="Learning Plan">
            <div className="space-y-4">
              {content.learningPlan.map((step) => (
                <div key={step.stepNumber} className="flex gap-3">
                  <div className="flex-shrink-0 w-7 h-7 rounded-full bg-[#1a2744] text-white text-xs font-bold flex items-center justify-center mt-0.5">
                    {step.stepNumber}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 mb-0.5">{step.title}</p>
                    <p className="text-sm text-gray-600 leading-relaxed">{step.description}</p>
                    <p className="text-xs text-gray-400 mt-1">{step.estimate}</p>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* What the student will experience */}
          <Section title="What to Expect on Ruby">
            <ul className="space-y-2">
              {content.experienceBullets.map((b, i) => (
                <li key={i} className="flex gap-2 text-sm text-gray-700">
                  <span className="text-[#1a2744] font-bold flex-shrink-0">·</span>
                  {b}
                </li>
              ))}
            </ul>
          </Section>

          {/* For parents */}
          <Section title="For Parents">
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">What You May Notice</p>
                <Prose text={content.parentGuidance.whatYouMayNotice} />
              </div>
              <div className="border-t border-gray-100 pt-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">How You Can Help This Week</p>
                <Prose text={content.parentGuidance.howYouCanHelp} />
              </div>
            </div>
          </Section>

          {/* Expected outcomes */}
          <Section title="What You Will See Improve">
            <ul className="space-y-2">
              {content.expectedOutcomes.map((o, i) => (
                <li key={i} className="flex gap-2 text-sm text-gray-700">
                  <span className="text-green-500 flex-shrink-0">✓</span>
                  {o}
                </li>
              ))}
            </ul>
          </Section>

          {/* Next steps */}
          <Section title="Next Steps">
            <Prose text={content.nextSessionHook} />
          </Section>

          <p className="text-center text-xs text-gray-300 pb-6">Ruby AI Tutor · Discovery Report</p>
        </div>
      </div>
    </div>
  );
}
