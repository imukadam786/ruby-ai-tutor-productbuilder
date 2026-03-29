// ─── lib/report-store.ts ─────────────────────────────────────────────────────
// File-based report storage. Writes to /tmp/ruby-reports/ for Vercel
// compatibility. Reports do not persist across cold starts in serverless
// deployments — production should replace this with a DB or object store.

import fs from "fs/promises";
import path from "path";
import type { ReportSubject, ReportContent } from "./report-generator";

const STORE_DIR = path.join("/tmp", "ruby-reports");

export type StoredReport = {
  reportId: string;
  studentId: string;
  subject: ReportSubject;
  generatedAt: string;
  content: ReportContent;
};

// Ensure the storage directory exists
async function ensureDir(): Promise<void> {
  await fs.mkdir(STORE_DIR, { recursive: true });
}

// ─── Write ────────────────────────────────────────────────────────────────────

export async function saveReport(report: Omit<StoredReport, "reportId"> & { pdfBuffer: Buffer }): Promise<string> {
  await ensureDir();
  const reportId = `${report.studentId}-${report.subject}-${Date.now()}`;
  const pdfPath = path.join(STORE_DIR, `${reportId}.pdf`);
  const metaPath = path.join(STORE_DIR, `${reportId}.json`);

  await fs.writeFile(pdfPath, report.pdfBuffer);
  await fs.writeFile(
    metaPath,
    JSON.stringify({
      reportId,
      studentId: report.studentId,
      subject: report.subject,
      generatedAt: report.generatedAt,
      content: report.content,
    } satisfies StoredReport)
  );

  // Update student index (maps studentId+subject → latest reportId)
  await updateIndex(report.studentId, report.subject, reportId);

  return reportId;
}

// ─── Read ─────────────────────────────────────────────────────────────────────

export async function getReportPDF(reportId: string): Promise<Buffer | null> {
  try {
    const pdfPath = path.join(STORE_DIR, `${reportId}.pdf`);
    return await fs.readFile(pdfPath);
  } catch {
    return null;
  }
}

export async function getReportMeta(reportId: string): Promise<StoredReport | null> {
  try {
    const metaPath = path.join(STORE_DIR, `${reportId}.json`);
    const raw = await fs.readFile(metaPath, "utf8");
    return JSON.parse(raw) as StoredReport;
  } catch {
    return null;
  }
}

export async function getLatestReportId(
  studentId: string,
  subject: ReportSubject
): Promise<string | null> {
  try {
    const indexPath = path.join(STORE_DIR, "index.json");
    const raw = await fs.readFile(indexPath, "utf8");
    const index = JSON.parse(raw) as Record<string, string>;
    return index[`${studentId}:${subject}`] ?? null;
  } catch {
    return null;
  }
}

// ─── Index helpers ────────────────────────────────────────────────────────────

async function updateIndex(
  studentId: string,
  subject: ReportSubject,
  reportId: string
): Promise<void> {
  const indexPath = path.join(STORE_DIR, "index.json");
  let index: Record<string, string> = {};
  try {
    const raw = await fs.readFile(indexPath, "utf8");
    index = JSON.parse(raw);
  } catch {
    // Index doesn't exist yet — start fresh
  }
  index[`${studentId}:${subject}`] = reportId;
  await fs.writeFile(indexPath, JSON.stringify(index));
}
