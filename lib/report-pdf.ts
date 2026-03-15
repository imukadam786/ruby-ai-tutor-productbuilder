// ─── lib/report-pdf.ts ────────────────────────────────────────────────────────
// Builds the branded PDF using pdfmake (pure Node.js).
// Note: spec called for Python/ReportLab, but Python is not available in this
// environment. pdfmake produces an equivalent result server-side.
//
// Layout mirrors Liam_Ruby_Diagnostic_Report.pdf:
//   Crimson header → placement banner → domain cards → strengths →
//   root cause → learning plan → experience bullets → parent guidance →
//   outcomes → next-session banner → footer

import type { DiagnosticReportInput, ReportContent } from "./report-generator";

// pdfmake server-side (Node.js PdfPrinter)
/* eslint-disable @typescript-eslint/no-require-imports */
const PdfPrinter = require("pdfmake");
const vfsFonts = require("pdfmake/build/vfs_fonts");

const FONTS = {
  Roboto: {
    normal:      Buffer.from(vfsFonts.pdfMake.vfs["Roboto-Regular.ttf"],      "base64"),
    bold:        Buffer.from(vfsFonts.pdfMake.vfs["Roboto-Medium.ttf"],       "base64"),
    italics:     Buffer.from(vfsFonts.pdfMake.vfs["Roboto-Italic.ttf"],       "base64"),
    bolditalics: Buffer.from(vfsFonts.pdfMake.vfs["Roboto-MediumItalic.ttf"], "base64"),
  },
};

// ─── Brand colours ────────────────────────────────────────────────────────────

const C = {
  crimson:       "#B7182E",
  pink:          "#E94663",
  greenDark:     "#166534",
  greenLight:    "#DCFCE7",
  greenBar:      "#22C55E",
  amberDark:     "#92400E",
  amberLight:    "#FEF3C7",
  amberBar:      "#F59E0B",
  blueDark:      "#1E40AF",
  blueLight:     "#EFF6FF",
  blueBar:       "#3B82F6",
  grayBg:        "#F3F4F6",
  grayText:      "#374151",
  grayLighter:   "#F9FAFB",
  white:         "#FFFFFF",
  footerText:    "#9CA3AF",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function sectionTitle(text: string): object {
  return {
    text,
    fontSize: 13,
    bold: true,
    color: C.grayText,
    margin: [0, 0, 0, 8],
  };
}

function card(content: object | object[], fillColor: string, margin = [0, 0, 0, 12]): object {
  return {
    table: {
      widths: ["*"],
      body: [[Array.isArray(content) ? { stack: content } : content]],
    },
    layout: { fillColor: () => fillColor, hLineWidth: () => 0, vLineWidth: () => 0, paddingLeft: () => 16, paddingRight: () => 16, paddingTop: () => 14, paddingBottom: () => 14 },
    margin,
  };
}

function labelColor(label: "strong" | "practice" | "building"): { bar: string; bg: string; text: string } {
  if (label === "strong")   return { bar: C.greenBar,  bg: C.greenLight,  text: C.greenDark  };
  if (label === "building") return { bar: C.amberBar,  bg: C.amberLight,  text: C.amberDark  };
  return                           { bar: C.blueBar,   bg: C.blueLight,   text: C.blueDark   };
}

function progressBar(score: number, label: "strong" | "practice" | "building"): object {
  const col = labelColor(label);
  const filled = Math.max(1, Math.round(score));
  const empty  = 100 - filled;
  return {
    table: {
      widths: [`${filled}%`, `${empty}%`],
      body: [[{ text: "", fillColor: col.bar, border: [false, false, false, false] }, { text: "", fillColor: "#E5E7EB", border: [false, false, false, false] }]],
    },
    layout: { hLineWidth: () => 0, vLineWidth: () => 0, paddingLeft: () => 0, paddingRight: () => 0, paddingTop: () => 0, paddingBottom: () => 0 },
    margin: [0, 3, 0, 2],
    heights: 8,
  };
}

function domainCard(d: DiagnosticReportInput["domainScores"][0]): object {
  const col = labelColor(d.label);
  return {
    table: {
      widths: ["*"],
      body: [[{
        stack: [
          { text: d.domain, fontSize: 9, bold: true, color: C.grayText, margin: [0, 0, 0, 2] },
          progressBar(d.score, d.label),
          {
            columns: [
              { text: `${d.score}%`, fontSize: 8, bold: true, color: col.text, width: "auto" },
              { text: d.label.charAt(0).toUpperCase() + d.label.slice(1), fontSize: 8, color: col.text, alignment: "right" },
            ],
            margin: [0, 1, 0, 0],
          },
          ...(d.errorNote ? [{ text: d.errorNote, fontSize: 7, color: "#6B7280", margin: [0, 3, 0, 0], italics: true }] : []),
        ],
        fillColor: col.bg,
        border: [false, false, false, false],
      }]],
    },
    layout: { hLineWidth: () => 0, vLineWidth: () => 0, paddingLeft: () => 10, paddingRight: () => 10, paddingTop: () => 10, paddingBottom: () => 10 },
    margin: [0, 0, 0, 6],
  };
}

function stepBadge(n: number): object {
  return {
    canvas: [
      { type: "ellipse", x: 12, y: 12, r1: 12, r2: 12, color: C.pink },
    ],
    width: 24,
    margin: [0, 0, 10, 0],
  };
}

function learningStep(step: ReportContent["learningPlan"][0]): object {
  return {
    columns: [
      {
        stack: [
          { canvas: [{ type: "ellipse", x: 12, y: 12, r1: 12, r2: 12, color: C.pink }] },
          { text: String(step.stepNumber), fontSize: 10, bold: true, color: C.white, relativePosition: { x: 8, y: -18 } },
        ],
        width: 30,
      },
      {
        stack: [
          { text: step.title, fontSize: 11, bold: true, color: C.grayText, margin: [0, 0, 0, 3] },
          { text: step.description, fontSize: 9, color: C.grayText, margin: [0, 0, 0, 4] },
          { text: step.estimate, fontSize: 8, color: "#6B7280", italics: true },
        ],
        width: "*",
      },
    ],
    columnGap: 0,
    margin: [0, 0, 0, 14],
  };
}

function checkBullet(text: string): object {
  return {
    columns: [
      { text: "✓", fontSize: 10, bold: true, color: C.greenDark, width: 16 },
      { text, fontSize: 10, color: C.greenDark },
    ],
    margin: [0, 0, 0, 5],
  };
}

function dotBullet(text: string): object {
  return {
    columns: [
      { text: "•", fontSize: 12, color: C.grayText, width: 14 },
      { text, fontSize: 10, color: C.grayText },
    ],
    margin: [0, 0, 0, 5],
  };
}

// ─── Main builder ─────────────────────────────────────────────────────────────

export async function buildReportPDF(
  input: DiagnosticReportInput,
  content: ReportContent
): Promise<Buffer> {
  const printer = new PdfPrinter(FONTS);
  const docDef = buildDocDefinition(input, content);

  return new Promise<Buffer>((resolve, reject) => {
    const pdfDoc = printer.createPdfKitDocument(docDef);
    const chunks: Buffer[] = [];
    pdfDoc.on("data", (chunk: Buffer) => chunks.push(chunk));
    pdfDoc.on("end", () => resolve(Buffer.concat(chunks)));
    pdfDoc.on("error", reject);
    pdfDoc.end();
  });
}

function buildDocDefinition(
  input: DiagnosticReportInput,
  content: ReportContent
): object {
  const subject = input.subject === "maths" ? "Maths" : "Reading";
  const generatedDate = new Date().toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" });

  // ── Section 1: Header ──────────────────────────────────────────────────────
  const header = {
    table: {
      widths: ["*"],
      body: [[{
        stack: [
          // Logo + title
          { text: "ruby", fontSize: 28, bold: true, color: C.white, margin: [0, 0, 0, 2] },
          { text: `${subject} Diagnostic Report`, fontSize: 13, color: "#F9A8B4", margin: [0, 0, 0, 18] },
          // 3 meta columns
          {
            columns: [
              { stack: [{ text: "STUDENT", fontSize: 7, color: "#FDA4AF", bold: true }, { text: input.studentName, fontSize: 13, bold: true, color: C.white }], width: "*" },
              { stack: [{ text: "WORKING LEVEL", fontSize: 7, color: "#FDA4AF", bold: true }, { text: input.workingLevel, fontSize: 13, bold: true, color: C.white }], width: "*" },
              { stack: [{ text: "QUESTIONS ANALYSED", fontSize: 7, color: "#FDA4AF", bold: true }, { text: String(input.questionsAnalysed), fontSize: 13, bold: true, color: C.white }], width: "*" },
            ],
          },
        ],
        fillColor: C.crimson,
        border: [false, false, false, false],
      }]],
    },
    layout: { hLineWidth: () => 0, vLineWidth: () => 0, paddingLeft: () => 24, paddingRight: () => 24, paddingTop: () => 24, paddingBottom: () => 20 },
    margin: [0, 0, 0, 0],
  };

  // ── Section 2: Placement banner ────────────────────────────────────────────
  const placementBanner = card(
    [
      { text: "📍  Where " + input.studentName + " starts", fontSize: 11, bold: true, color: C.greenDark, margin: [0, 0, 0, 6] },
      { text: content.placementSummary, fontSize: 10, color: C.greenDark },
    ],
    C.greenLight
  );

  // ── Section 3: Domain performance ─────────────────────────────────────────
  const domainCards = {
    stack: [
      sectionTitle(`How ${input.studentName} performed across each area`),
      ...input.domainScores.map((d) => domainCard(d)),
    ],
    margin: [0, 0, 0, 4],
  };

  // ── Section 4: Strengths ──────────────────────────────────────────────────
  const strengthsSection = card(
    [
      { text: "★  Strengths", fontSize: 11, bold: true, color: C.greenDark, margin: [0, 0, 0, 6] },
      { text: content.strengthsNote, fontSize: 10, color: C.greenDark },
    ],
    C.greenLight
  );

  // ── Section 5: Root cause ─────────────────────────────────────────────────
  const rootCauseSection = card(
    [
      { text: "▸  What to focus on", fontSize: 11, bold: true, color: C.grayText, margin: [0, 0, 0, 6] },
      { text: content.rootCauseSummary, fontSize: 10, color: C.grayText },
    ],
    C.grayBg
  );

  // ── Section 6: Learning plan ──────────────────────────────────────────────
  const learningPlanSection = card(
    [
      { text: "Learning Plan", fontSize: 13, bold: true, color: C.grayText, margin: [0, 0, 0, 12] },
      ...content.learningPlan.map((step) => learningStep(step)),
    ],
    C.white
  );

  // ── Section 7: What the student will experience ───────────────────────────
  const experienceSection = card(
    [
      { text: `What ${input.studentName} will experience on Ruby`, fontSize: 11, bold: true, color: C.grayText, margin: [0, 0, 0, 8] },
      ...content.experienceBullets.map((b) => dotBullet(b)),
    ],
    C.grayLighter
  );

  // ── Section 8: Parent guidance ────────────────────────────────────────────
  const parentGuidanceSection = card(
    [
      { text: "For Parents", fontSize: 13, bold: true, color: C.grayText, margin: [0, 0, 0, 10] },
      { text: "What you may notice", fontSize: 10, bold: true, color: C.grayText, margin: [0, 0, 0, 4] },
      { text: content.parentGuidance.whatYouMayNotice, fontSize: 10, color: C.grayText, margin: [0, 0, 0, 12] },
      { canvas: [{ type: "line", x1: 0, y1: 0, x2: 515 - 32, y2: 0, lineWidth: 1, lineColor: "#E5E7EB" }], margin: [0, 0, 0, 12] },
      { text: "How you can help this week", fontSize: 10, bold: true, color: C.grayText, margin: [0, 0, 0, 4] },
      { text: content.parentGuidance.howYouCanHelp, fontSize: 10, color: C.grayText },
    ],
    C.white
  );

  // ── Section 9: Expected outcomes ──────────────────────────────────────────
  const outcomesSection = card(
    [
      { text: "What to expect", fontSize: 11, bold: true, color: C.greenDark, margin: [0, 0, 0, 8] },
      ...content.expectedOutcomes.map((o) => checkBullet(o)),
    ],
    C.greenLight
  );

  // ── Section 10: Next session banner ───────────────────────────────────────
  const nextSessionBanner = card(
    [
      { text: "What's next", fontSize: 11, bold: true, color: C.blueDark, margin: [0, 0, 0, 5] },
      { text: content.nextSessionHook, fontSize: 10, color: C.blueDark },
    ],
    C.blueLight
  );

  // ── Section 11: Footer ────────────────────────────────────────────────────
  const footer = {
    text: `Generated by Ruby AI Tutor  ·  ${generatedDate}`,
    fontSize: 8,
    color: C.footerText,
    alignment: "center",
    margin: [0, 8, 0, 0],
  };

  return {
    pageSize: "A4",
    pageMargins: [40, 40, 40, 40],
    defaultStyle: { font: "Roboto" },
    content: [
      header,
      { text: "", margin: [0, 0, 0, 12] },
      placementBanner,
      domainCards,
      strengthsSection,
      rootCauseSection,
      learningPlanSection,
      experienceSection,
      parentGuidanceSection,
      outcomesSection,
      nextSessionBanner,
      footer,
    ],
  };
}
