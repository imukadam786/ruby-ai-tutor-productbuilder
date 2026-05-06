import { PDFDocument, PDFFont, StandardFonts, rgb } from "pdf-lib";
import type { DiagnosticReportInput, ReportContent } from "./report-generator";

type Color = ReturnType<typeof rgb>;

const C = {
  crimson:    rgb(0.718, 0.094, 0.180),
  pink:       rgb(0.914, 0.275, 0.388),
  greenDark:  rgb(0.086, 0.396, 0.204),
  greenLight: rgb(0.863, 0.988, 0.871),
  greenBar:   rgb(0.133, 0.773, 0.369),
  amberDark:  rgb(0.573, 0.251, 0.055),
  amberLight: rgb(0.996, 0.953, 0.780),
  amberBar:   rgb(0.961, 0.620, 0.043),
  blueDark:   rgb(0.118, 0.251, 0.686),
  blueLight:  rgb(0.937, 0.965, 1.000),
  blueBar:    rgb(0.231, 0.510, 0.965),
  grayBg:     rgb(0.953, 0.957, 0.965),
  grayText:   rgb(0.216, 0.255, 0.318),
  white:      rgb(1, 1, 1),
  footerText: rgb(0.612, 0.639, 0.675),
  barEmpty:   rgb(0.898, 0.906, 0.922),
  pinkLabel:  rgb(0.988, 0.639, 0.678),
  muted:      rgb(0.420, 0.447, 0.502),
};

const PAGE_W = 595.28;
const PAGE_H = 841.89;
const MARGIN = 40;
const CONTENT_W = PAGE_W - MARGIN * 2;

function wrapText(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(test, size) > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

export async function buildReportPDF(
  input: DiagnosticReportInput,
  content: ReportContent,
): Promise<Buffer> {
  const doc = await PDFDocument.create();
  const fontNormal = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold   = await doc.embedFont(StandardFonts.HelveticaBold);

  let page = doc.addPage([PAGE_W, PAGE_H]);
  let y = PAGE_H;

  function checkSpace(needed: number): void {
    if (y - needed < MARGIN + 20) {
      page = doc.addPage([PAGE_W, PAGE_H]);
      y = PAGE_H - MARGIN;
    }
  }

  function drawCard(cardY: number, height: number, fill: Color): void {
    page.drawRectangle({ x: MARGIN, y: cardY, width: CONTENT_W, height, color: fill });
  }

  function drawWrapped(
    text: string, x: number, startY: number,
    font: PDFFont, size: number, color: Color, maxW: number, lineH: number,
  ): number {
    const lines = wrapText(text, font, size, maxW);
    let cy = startY;
    for (const l of lines) {
      page.drawText(l, { x, y: cy, size, font, color });
      cy -= lineH;
    }
    return cy;
  }

  const subject = input.subject === "maths" ? "Maths" : "Reading";
  const studentName = input.studentName ?? "Student";
  const generatedDate = new Date().toLocaleDateString("en-ZA", {
    day: "numeric", month: "long", year: "numeric",
  });

  // ── 1. Header ───────────────────────────────────────────────────────────────
  const headerH = 110;
  page.drawRectangle({ x: 0, y: PAGE_H - headerH, width: PAGE_W, height: headerH, color: C.crimson });
  page.drawText("ruby", { x: MARGIN, y: PAGE_H - 36, size: 26, font: fontBold, color: C.white });
  page.drawText(`${subject} Diagnostic Report`, { x: MARGIN, y: PAGE_H - 54, size: 10.5, font: fontNormal, color: C.pinkLabel });

  const metaY = PAGE_H - 78;
  const colW = CONTENT_W / 3;
  [
    { label: "STUDENT",            value: studentName },
    { label: "WORKING LEVEL",      value: input.workingLevel },
    { label: "QUESTIONS ANALYSED", value: String(input.questionsAnalysed) },
  ].forEach(({ label, value }, i) => {
    const x = MARGIN + i * colW;
    page.drawText(label, { x, y: metaY,      size: 7,  font: fontBold,   color: C.pinkLabel });
    page.drawText(value, { x, y: metaY - 14, size: 10, font: fontBold,   color: C.white });
  });
  y = PAGE_H - headerH - 14;

  // ── 2. Placement banner ─────────────────────────────────────────────────────
  const placementLines = wrapText(content.placementSummary, fontNormal, 9.5, CONTENT_W - 32);
  const placementH = 34 + placementLines.length * 13;
  checkSpace(placementH);
  drawCard(y - placementH, placementH, C.greenLight);
  page.drawText(`Where ${studentName} starts`, { x: MARGIN + 16, y: y - 16, size: 10, font: fontBold, color: C.greenDark });
  let ty = y - 30;
  for (const l of placementLines) { page.drawText(l, { x: MARGIN + 16, y: ty, size: 9.5, font: fontNormal, color: C.greenDark }); ty -= 13; }
  y -= placementH + 12;

  // ── 3. Domain performance ───────────────────────────────────────────────────
  checkSpace(20);
  page.drawText(`How ${studentName} performed across each area`, { x: MARGIN, y, size: 11, font: fontBold, color: C.grayText });
  y -= 14;

  for (const d of input.domainScores) {
    const domH = 52;
    checkSpace(domH + 6);
    const barColor  = d.label === "strong" ? C.greenBar  : d.label === "building" ? C.amberBar  : C.blueBar;
    const bgColor   = d.label === "strong" ? C.greenLight : d.label === "building" ? C.amberLight : C.blueLight;
    const textColor = d.label === "strong" ? C.greenDark  : d.label === "building" ? C.amberDark  : C.blueDark;
    drawCard(y - domH, domH, bgColor);
    page.drawText(d.domain, { x: MARGIN + 10, y: y - 13, size: 8.5, font: fontBold, color: C.grayText });
    const barW = CONTENT_W - 20;
    const filled = Math.max(2, Math.round((d.score / 100) * barW));
    page.drawRectangle({ x: MARGIN + 10, y: y - 26, width: filled,        height: 7, color: barColor });
    page.drawRectangle({ x: MARGIN + 10 + filled, y: y - 26, width: barW - filled, height: 7, color: C.barEmpty });
    page.drawText(`${d.score}%  ·  ${d.label.charAt(0).toUpperCase() + d.label.slice(1)}`, { x: MARGIN + 10, y: y - 40, size: 7.5, font: fontBold, color: textColor });
    y -= domH + 5;
  }
  y -= 6;

  // ── 4. Strengths ────────────────────────────────────────────────────────────
  const strengthLines = wrapText(content.strengthsNote, fontNormal, 9.5, CONTENT_W - 32);
  const strengthH = 34 + strengthLines.length * 13;
  checkSpace(strengthH);
  drawCard(y - strengthH, strengthH, C.greenLight);
  page.drawText("Strengths", { x: MARGIN + 16, y: y - 16, size: 10, font: fontBold, color: C.greenDark });
  ty = y - 30;
  for (const l of strengthLines) { page.drawText(l, { x: MARGIN + 16, y: ty, size: 9.5, font: fontNormal, color: C.greenDark }); ty -= 13; }
  y -= strengthH + 10;

  // ── 5. Root cause ───────────────────────────────────────────────────────────
  const rootLines = wrapText(content.rootCauseSummary, fontNormal, 9.5, CONTENT_W - 32);
  const rootH = 34 + rootLines.length * 13;
  checkSpace(rootH);
  drawCard(y - rootH, rootH, C.grayBg);
  page.drawText("What to focus on", { x: MARGIN + 16, y: y - 16, size: 10, font: fontBold, color: C.grayText });
  ty = y - 30;
  for (const l of rootLines) { page.drawText(l, { x: MARGIN + 16, y: ty, size: 9.5, font: fontNormal, color: C.grayText }); ty -= 13; }
  y -= rootH + 10;

  // ── 6. Learning plan ────────────────────────────────────────────────────────
  checkSpace(24);
  page.drawText("Learning Plan", { x: MARGIN, y, size: 12, font: fontBold, color: C.grayText });
  y -= 18;

  for (const step of content.learningPlan) {
    const descLines = wrapText(step.description, fontNormal, 9, CONTENT_W - 50);
    const stepH = 16 + descLines.length * 12 + 16;
    checkSpace(stepH);
    page.drawEllipse({ x: MARGIN + 12, y: y - 10, xScale: 10, yScale: 10, color: C.pink });
    page.drawText(String(step.stepNumber), { x: MARGIN + (step.stepNumber < 10 ? 9 : 6), y: y - 14, size: 8, font: fontBold, color: C.white });
    page.drawText(step.title, { x: MARGIN + 30, y: y - 8, size: 10, font: fontBold, color: C.grayText });
    let sy = y - 20;
    for (const l of descLines) { page.drawText(l, { x: MARGIN + 30, y: sy, size: 9, font: fontNormal, color: C.grayText }); sy -= 12; }
    page.drawText(step.estimate, { x: MARGIN + 30, y: sy, size: 8, font: fontNormal, color: C.muted });
    y -= stepH;
  }
  y -= 8;

  // ── 7. Experience bullets ───────────────────────────────────────────────────
  checkSpace(20);
  page.drawText(`What ${studentName} will experience on Ruby`, { x: MARGIN, y, size: 10, font: fontBold, color: C.grayText });
  y -= 14;
  for (const bullet of content.experienceBullets) {
    const bLines = wrapText(bullet, fontNormal, 9, CONTENT_W - 16);
    checkSpace(bLines.length * 12 + 4);
    page.drawText("•", { x: MARGIN, y, size: 10, font: fontNormal, color: C.grayText });
    let by = y;
    for (const l of bLines) { page.drawText(l, { x: MARGIN + 12, y: by, size: 9, font: fontNormal, color: C.grayText }); by -= 12; }
    y = by - 3;
  }
  y -= 8;

  // ── 8. Parent guidance ──────────────────────────────────────────────────────
  checkSpace(24);
  page.drawText("For Parents", { x: MARGIN, y, size: 12, font: fontBold, color: C.grayText });
  y -= 16;
  page.drawText("What you may notice", { x: MARGIN, y, size: 9.5, font: fontBold, color: C.grayText });
  y -= 13;
  y = drawWrapped(content.parentGuidance.whatYouMayNotice, MARGIN, y, fontNormal, 9, C.grayText, CONTENT_W, 12);
  y -= 8;
  checkSpace(14);
  page.drawText("How you can help this week", { x: MARGIN, y, size: 9.5, font: fontBold, color: C.grayText });
  y -= 13;
  y = drawWrapped(content.parentGuidance.howYouCanHelp, MARGIN, y, fontNormal, 9, C.grayText, CONTENT_W, 12);
  y -= 10;

  // ── 9. Expected outcomes ────────────────────────────────────────────────────
  const outcomeH = 22 + content.expectedOutcomes.length * 14;
  checkSpace(outcomeH);
  drawCard(y - outcomeH, outcomeH, C.greenLight);
  page.drawText("What to expect", { x: MARGIN + 16, y: y - 15, size: 10, font: fontBold, color: C.greenDark });
  ty = y - 29;
  for (const o of content.expectedOutcomes) {
    page.drawText(`✓  ${o}`, { x: MARGIN + 16, y: ty, size: 9, font: fontNormal, color: C.greenDark });
    ty -= 14;
  }
  y -= outcomeH + 10;

  // ── 10. Next session ────────────────────────────────────────────────────────
  const nextLines = wrapText(content.nextSessionHook, fontNormal, 9.5, CONTENT_W - 32);
  const nextH = 34 + nextLines.length * 13;
  checkSpace(nextH);
  drawCard(y - nextH, nextH, C.blueLight);
  page.drawText("What's next", { x: MARGIN + 16, y: y - 16, size: 10, font: fontBold, color: C.blueDark });
  ty = y - 30;
  for (const l of nextLines) { page.drawText(l, { x: MARGIN + 16, y: ty, size: 9.5, font: fontNormal, color: C.blueDark }); ty -= 13; }
  y -= nextH + 12;

  // ── 11. Footer ──────────────────────────────────────────────────────────────
  const footerText = `Generated by Ruby AI Tutor  ·  ${generatedDate}`;
  const footerX = (PAGE_W - fontNormal.widthOfTextAtSize(footerText, 8)) / 2;
  page.drawText(footerText, { x: footerX, y: Math.max(y - 10, MARGIN), size: 8, font: fontNormal, color: C.footerText });

  return Buffer.from(await doc.save());
}
