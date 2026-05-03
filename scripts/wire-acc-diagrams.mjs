import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const BASE_URL =
  "https://kmgnizvqkqkiulzgvkcb.supabase.co/storage/v1/object/public/matric-diagrams/";

function url(paper, year, q, n) {
  const p = String(n).padStart(2, "0");
  return `${BASE_URL}acc-p${paper}-may-jun-${year}-q${q}-${p}.png`;
}

// Dot-notation images: filename encodes the question label directly.
// Lettered suffixes (c, d) are supplementary images assigned to adjacent subquestions.
function dotUrl(paper, year, label) {
  return `${BASE_URL}acc-p${paper}-may-jun-${year}-${label}.png`;
}

// Maps subquestion IDs → diagramUrl
// Images named: acc-p{paper}-may-jun-{year}-q{question}-{nn}.png
// Groupings derived from question content and image count per question.
const DIAGRAM_MAP = {
  // ── acc-p1-may-jun-2025 ─────────────────────────────────────────────────────
  // Q1 — Company Financial Statements (Ebony Ltd): 2 images
  "acc-p1-may-jun-2025-1-1": url(1, 2025, 1, 1),   // Income Statement
  "acc-p1-may-jun-2025-1-2": url(1, 2025, 1, 2),   // SFP Equity & Liabilities

  // Q2 — Fixed Assets / Cash Flow / Financial Indicators (Premier Ltd): 3 images
  "acc-p1-may-jun-2025-2-1i":   url(1, 2025, 2, 1),
  "acc-p1-may-jun-2025-2-1ii":  url(1, 2025, 2, 1),
  "acc-p1-may-jun-2025-2-1iii": url(1, 2025, 2, 1),
  "acc-p1-may-jun-2025-2-2a":   url(1, 2025, 2, 2),
  "acc-p1-may-jun-2025-2-2b":   url(1, 2025, 2, 2),
  "acc-p1-may-jun-2025-2-3":    url(1, 2025, 2, 2),
  "acc-p1-may-jun-2025-2-5":    url(1, 2025, 2, 2),
  "acc-p1-may-jun-2025-2-4a":   url(1, 2025, 2, 3),
  "acc-p1-may-jun-2025-2-4b":   url(1, 2025, 2, 3),
  "acc-p1-may-jun-2025-2-4c":   url(1, 2025, 2, 3),

  // Q3 — Interpretation (Venus Ltd): 4 images
  "acc-p1-may-jun-2025-3-1-1": url(1, 2025, 3, 1),
  "acc-p1-may-jun-2025-3-1-2": url(1, 2025, 3, 1),
  "acc-p1-may-jun-2025-3-1-3": url(1, 2025, 3, 1),
  "acc-p1-may-jun-2025-3-2":   url(1, 2025, 3, 1),
  "acc-p1-may-jun-2025-3-3a":  url(1, 2025, 3, 2),
  "acc-p1-may-jun-2025-3-3b":  url(1, 2025, 3, 2),
  "acc-p1-may-jun-2025-3-4a":  url(1, 2025, 3, 2),
  "acc-p1-may-jun-2025-3-4b":  url(1, 2025, 3, 2),
  "acc-p1-may-jun-2025-3-4c":  url(1, 2025, 3, 2),
  "acc-p1-may-jun-2025-3-5a":  url(1, 2025, 3, 3),
  "acc-p1-may-jun-2025-3-5b":  url(1, 2025, 3, 3),
  "acc-p1-may-jun-2025-3-6":   url(1, 2025, 3, 3),
  "acc-p1-may-jun-2025-3-7a":  url(1, 2025, 3, 4),
  "acc-p1-may-jun-2025-3-7b":  url(1, 2025, 3, 4),

  // Q4 — Corporate Governance: 2 images (audit report extract, newspaper extract)
  "acc-p1-may-jun-2025-4-1-1": url(1, 2025, 4, 1),
  "acc-p1-may-jun-2025-4-1-2": url(1, 2025, 4, 1),
  "acc-p1-may-jun-2025-4-1-3": url(1, 2025, 4, 1),
  "acc-p1-may-jun-2025-4-2-1": url(1, 2025, 4, 2),
  "acc-p1-may-jun-2025-4-2-2": url(1, 2025, 4, 2),

  // ── acc-p2-may-jun-2025 ─────────────────────────────────────────────────────
  // Q1 & Q2 — images not yet uploaded; skip

  // Q3 — Stock Valuation: 7 images (one per subquestion, 3.1–3.7)
  "acc-p2-may-jun-2025-3-1": url(2, 2025, 3, 1),
  "acc-p2-may-jun-2025-3-2": url(2, 2025, 3, 2),
  "acc-p2-may-jun-2025-3-3": url(2, 2025, 3, 3),
  "acc-p2-may-jun-2025-3-4": url(2, 2025, 3, 4),
  "acc-p2-may-jun-2025-3-5": url(2, 2025, 3, 5),
  "acc-p2-may-jun-2025-3-6": url(2, 2025, 3, 6),
  "acc-p2-may-jun-2025-3-7": url(2, 2025, 3, 7),

  // Q4 — Budgeting: 2 images
  "acc-p2-may-jun-2025-4-1":   url(2, 2025, 4, 1),
  "acc-p2-may-jun-2025-4-2":   url(2, 2025, 4, 1),
  "acc-p2-may-jun-2025-4-3":   url(2, 2025, 4, 1),
  "acc-p2-may-jun-2025-4-4":   url(2, 2025, 4, 1),
  "acc-p2-may-jun-2025-4-5":   url(2, 2025, 4, 2),
  "acc-p2-may-jun-2025-4-6-1": url(2, 2025, 4, 2),
  "acc-p2-may-jun-2025-4-6-2": url(2, 2025, 4, 2),

  // ── acc-p1-may-jun-2024 ─────────────────────────────────────────────────────
  // Q1 — no images uploaded; skip

  // Q2 — Cash Flow Statement and Financial Indicators (Jingle Ltd): 4 images
  "acc-p1-may-jun-2024-2-1i":   url(1, 2024, 2, 1),
  "acc-p1-may-jun-2024-2-1ii":  url(1, 2024, 2, 1),
  "acc-p1-may-jun-2024-2-1iii": url(1, 2024, 2, 1),
  "acc-p1-may-jun-2024-2-2":    url(1, 2024, 2, 2),
  "acc-p1-may-jun-2024-2-3i":   url(1, 2024, 2, 2),
  "acc-p1-may-jun-2024-2-3ii":  url(1, 2024, 2, 2),
  "acc-p1-may-jun-2024-2-3iii": url(1, 2024, 2, 2),
  "acc-p1-may-jun-2024-2-3iv":  url(1, 2024, 2, 3),
  "acc-p1-may-jun-2024-2-3v":   url(1, 2024, 2, 3),
  "acc-p1-may-jun-2024-2-4a":   url(1, 2024, 2, 4),
  "acc-p1-may-jun-2024-2-4b":   url(1, 2024, 2, 4),
  "acc-p1-may-jun-2024-2-4c":   url(1, 2024, 2, 4),

  // Q3 — Interpretation (Britesun Ltd): 3 images
  "acc-p1-may-jun-2024-3-1":  url(1, 2024, 3, 1),
  "acc-p1-may-jun-2024-3-2":  url(1, 2024, 3, 1),
  "acc-p1-may-jun-2024-3-3a": url(1, 2024, 3, 1),
  "acc-p1-may-jun-2024-3-3b": url(1, 2024, 3, 1),
  "acc-p1-may-jun-2024-3-4a": url(1, 2024, 3, 2),
  "acc-p1-may-jun-2024-3-4b": url(1, 2024, 3, 2),
  "acc-p1-may-jun-2024-3-5":  url(1, 2024, 3, 2),
  "acc-p1-may-jun-2024-3-6a": url(1, 2024, 3, 3),
  "acc-p1-may-jun-2024-3-6b": url(1, 2024, 3, 3),
  "acc-p1-may-jun-2024-3-7":  url(1, 2024, 3, 3),

  // Q4 — Corporate Governance (Gadram Ltd): 1 image
  "acc-p1-may-jun-2024-4-1":   url(1, 2024, 4, 1),
  "acc-p1-may-jun-2024-4-2-1": url(1, 2024, 4, 1),
  "acc-p1-may-jun-2024-4-2-2": url(1, 2024, 4, 1),
  "acc-p1-may-jun-2024-4-3":   url(1, 2024, 4, 1),
  "acc-p1-may-jun-2024-4-4":   url(1, 2024, 4, 1),

  // ── acc-p2-may-jun-2024 ─────────────────────────────────────────────────────
  // Q1 — Reconciliations: 2 images (bank recon, creditors recon)
  "acc-p2-may-jun-2024-1-1-1": url(2, 2024, 1, 1),
  "acc-p2-may-jun-2024-1-1-2": url(2, 2024, 1, 1),
  "acc-p2-may-jun-2024-1-1-3": url(2, 2024, 1, 1),
  "acc-p2-may-jun-2024-1-2":   url(2, 2024, 1, 2),

  // Q2 — VAT and Stock Valuation: 3 images
  "acc-p2-may-jun-2024-2-1-1": url(2, 2024, 2, 1),
  "acc-p2-may-jun-2024-2-1-2": url(2, 2024, 2, 1),
  "acc-p2-may-jun-2024-2-2":   url(2, 2024, 2, 2),
  "acc-p2-may-jun-2024-2-3":   url(2, 2024, 2, 2),
  "acc-p2-may-jun-2024-2-4":   url(2, 2024, 2, 2),
  "acc-p2-may-jun-2024-2-5":   url(2, 2024, 2, 3),
  "acc-p2-may-jun-2024-2-6":   url(2, 2024, 2, 3),

  // Q3 — Cost Accounting: 5 images
  "acc-p2-may-jun-2024-3-1": url(2, 2024, 3, 1),
  "acc-p2-may-jun-2024-3-2": url(2, 2024, 3, 1),
  "acc-p2-may-jun-2024-3-3": url(2, 2024, 3, 2),
  "acc-p2-may-jun-2024-3-4": url(2, 2024, 3, 2),
  "acc-p2-may-jun-2024-3-5": url(2, 2024, 3, 3),
  "acc-p2-may-jun-2024-3-6": url(2, 2024, 3, 4),
  "acc-p2-may-jun-2024-3-7": url(2, 2024, 3, 4),
  "acc-p2-may-jun-2024-3-8": url(2, 2024, 3, 5),

  // Q4 — Budgeting: 2 images
  "acc-p2-may-jun-2024-4-1": url(2, 2024, 4, 1),
  "acc-p2-may-jun-2024-4-2": url(2, 2024, 4, 1),
  "acc-p2-may-jun-2024-4-3": url(2, 2024, 4, 1),
  "acc-p2-may-jun-2024-4-4": url(2, 2024, 4, 1),
  "acc-p2-may-jun-2024-4-5": url(2, 2024, 4, 2),
  "acc-p2-may-jun-2024-4-6": url(2, 2024, 4, 2),
  "acc-p2-may-jun-2024-4-7": url(2, 2024, 4, 2),
  "acc-p2-may-jun-2024-4-8": url(2, 2024, 4, 2),

  // ── acc-p1-may-jun-2024 Q1 (dot-notation — newly uploaded) ─────────────────
  // q1.1  → Fixed Asset Note  (shared by all 1.1 subqs)
  // q1.2  → Net profit calculation (1.2)
  // q1,2d → SFP information (1.3) — comma in bucket filename is intentional
  "acc-p1-may-jun-2024-1-1i":   dotUrl(1, 2024, "q1.1"),
  "acc-p1-may-jun-2024-1-1ii":  dotUrl(1, 2024, "q1.1"),
  "acc-p1-may-jun-2024-1-1iii": dotUrl(1, 2024, "q1.1"),
  "acc-p1-may-jun-2024-1-2":    dotUrl(1, 2024, "q1.2"),
  "acc-p1-may-jun-2024-1-3":    dotUrl(1, 2024, "q1.2d"),

  // ── acc-p2-may-jun-2025 Q1 & Q2 (dot-notation — newly uploaded) ────────────
  // Q1: q1.1 → VAT section (1.1.1 + 1.1.2)
  //     q1.2.2  → Senzo fraud case (1.2.2)
  //     q1.2.2d → Creditors reconciliation data (1.2.1) — supplementary/detail
  // Q2: q2.2.1  → Direct material cost (2.2.1)
  //     q2.2.2  → Factory overhead cost (2.2.2)
  //     q2.2.2c → Gross profit context (2.2.3)
  //     q2.2.2d → Break-even / Information D (2.2.4)
  "acc-p2-may-jun-2025-1-1-1": dotUrl(2, 2025, "q1.1"),
  "acc-p2-may-jun-2025-1-1-2": dotUrl(2, 2025, "q1.1"),
  "acc-p2-may-jun-2025-1-2-1": dotUrl(2, 2025, "q1.2.2d"),
  "acc-p2-may-jun-2025-1-2-2": dotUrl(2, 2025, "q1.2.2"),
  "acc-p2-may-jun-2025-2-2-1": dotUrl(2, 2025, "q2.2.1"),
  "acc-p2-may-jun-2025-2-2-2": dotUrl(2, 2025, "q2.2.2"),
  "acc-p2-may-jun-2025-2-2-3": dotUrl(2, 2025, "q2.2.2c"),
  "acc-p2-may-jun-2025-2-2-4": dotUrl(2, 2025, "q2.2.2d"),

  // ── acc-p1-may-jun-2023 ─────────────────────────────────────────────────────
  // Q1 — Statement of Comprehensive Income and Current Assets (Starlight Ltd): 4 images
  "acc-p1-may-jun-2023-1-1-1":  url(1, 2023, 1, 1),
  "acc-p1-may-jun-2023-1-1-2":  url(1, 2023, 1, 1),
  "acc-p1-may-jun-2023-1-1-3":  url(1, 2023, 1, 2),
  "acc-p1-may-jun-2023-1-1-4":  url(1, 2023, 1, 2),
  "acc-p1-may-jun-2023-1-2-1":  url(1, 2023, 1, 3),
  "acc-p1-may-jun-2023-1-2-2a": url(1, 2023, 1, 3),
  "acc-p1-may-jun-2023-1-2-2b": url(1, 2023, 1, 3),
  "acc-p1-may-jun-2023-1-2-3a": url(1, 2023, 1, 4),
  "acc-p1-may-jun-2023-1-2-3b": url(1, 2023, 1, 4),

  // Q2 — Retained Income / Cash Flow / Financial Indicators (Swallows Ltd): 1 image
  "acc-p1-may-jun-2023-2-1":  url(1, 2023, 2, 1),
  "acc-p1-may-jun-2023-2-2a": url(1, 2023, 2, 1),
  "acc-p1-may-jun-2023-2-2b": url(1, 2023, 2, 1),
  "acc-p1-may-jun-2023-2-3":  url(1, 2023, 2, 1),
  "acc-p1-may-jun-2023-2-4a": url(1, 2023, 2, 1),
  "acc-p1-may-jun-2023-2-4b": url(1, 2023, 2, 1),
  "acc-p1-may-jun-2023-2-4c": url(1, 2023, 2, 1),

  // Q3 — Interpretation (Qumbu Ltd): 2 images
  "acc-p1-may-jun-2023-3-1":   url(1, 2023, 3, 1),
  "acc-p1-may-jun-2023-3-2a":  url(1, 2023, 3, 1),
  "acc-p1-may-jun-2023-3-2b":  url(1, 2023, 3, 1),
  "acc-p1-may-jun-2023-3-3-1": url(1, 2023, 3, 1),
  "acc-p1-may-jun-2023-3-3-2": url(1, 2023, 3, 1),
  "acc-p1-may-jun-2023-3-3-3": url(1, 2023, 3, 1),
  "acc-p1-may-jun-2023-3-4-1": url(1, 2023, 3, 2),
  "acc-p1-may-jun-2023-3-4-2": url(1, 2023, 3, 2),
  "acc-p1-may-jun-2023-3-5":   url(1, 2023, 3, 2),

  // Q4 — Corporate Governance: 2 images
  "acc-p1-may-jun-2023-4-1-1": url(1, 2023, 4, 1),
  "acc-p1-may-jun-2023-4-1-2": url(1, 2023, 4, 1),
  "acc-p1-may-jun-2023-4-1-3": url(1, 2023, 4, 1),
  "acc-p1-may-jun-2023-4-2":   url(1, 2023, 4, 2),
  "acc-p1-may-jun-2023-4-3a":  url(1, 2023, 4, 2),
  "acc-p1-may-jun-2023-4-3b":  url(1, 2023, 4, 2),
};

const PAPER_FILES = [
  "acc-p1-may-jun-2025-combined.json",
  "acc-p2-may-jun-2025-combined.json",
  "acc-p1-may-jun-2024-combined.json",
  "acc-p2-may-jun-2024-combined.json",
  "acc-p1-may-jun-2023-combined.json",
];

let totalWired = 0;

for (const filename of PAPER_FILES) {
  const filePath = resolve("data/papers", filename);
  let data;
  try {
    data = JSON.parse(readFileSync(filePath, "utf-8"));
  } catch {
    console.warn(`⚠ Skipping ${filename} — not found`);
    continue;
  }

  let wired = 0;
  for (const question of data.questions) {
    for (const sq of question.subQuestions) {
      const diagramUrl = DIAGRAM_MAP[sq.id];
      if (diagramUrl && sq.diagramUrl !== diagramUrl) {
        sq.diagramUrl = diagramUrl;
        wired++;
      }
    }
  }

  writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n", "utf-8");
  console.log(`✓ ${filename}: wired ${wired} diagramUrl(s)`);
  totalWired += wired;
}

console.log(`\nDone — ${totalWired} diagramUrl(s) set across ${PAPER_FILES.length} papers`);
