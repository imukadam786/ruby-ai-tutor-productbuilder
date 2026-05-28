import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getMathsLiteracySkillById } from "@/lib/maths-literacy-student-model";
import type {
  MathsLiteracyBank,
  MathsLiteracyBankItem,
  MathsLiteracyGenerateRequest,
  MathsLiteracyGenerateResponse,
} from "@/types/maths-literacy";

// Banks live one-per-skill (e.g. L3.T2.A1.json). Cached in-memory after first
// read. Reading from disk via fs (Node runtime) instead of dynamic import
// because there are 85 files — a templated import context would pull every
// bank into the route's bundle.
const bankCache = new Map<string, MathsLiteracyBank>();

function loadBank(skillId: string): MathsLiteracyBank | null {
  const cached = bankCache.get(skillId);
  if (cached) return cached;
  // Skill ids look like "L3.T2.A1" — validate before joining a path.
  if (!/^L\d+\.T\d+\.A\d+$/.test(skillId)) return null;
  try {
    const file = path.join(
      process.cwd(),
      "data",
      "maths-literacy-question-banks",
      `${skillId}.json`
    );
    const raw = fs.readFileSync(file, "utf8");
    const bank = JSON.parse(raw) as MathsLiteracyBank;
    bankCache.set(skillId, bank);
    return bank;
  } catch {
    return null;
  }
}

function pickItem(bank: MathsLiteracyBank, used_refs: string[]): MathsLiteracyBankItem | null {
  if (!bank.items?.length) return null;
  const unseen = bank.items.filter((it) => !used_refs.includes(it.id));
  const pool = unseen.length > 0 ? unseen : bank.items;
  return pool[Math.floor(Math.random() * pool.length)];
}

function buildAnswerKey(item: MathsLiteracyBankItem): string {
  if (item.answerMode === "numeric") {
    return JSON.stringify({
      mode: "numeric",
      expectedAnswer: item.expectedAnswer,
      tolerance: item.tolerance,
      unit: item.unit,
    });
  }
  if (item.answerMode === "multiChoice") {
    return JSON.stringify({
      mode: "multiChoice",
      expectedAnswer: item.expectedAnswer,
      options: item.options,
    });
  }
  // multiField
  return JSON.stringify({
    mode: "multiField",
    fields: (item.fields ?? []).map((f) => ({
      label: f.label,
      expectedAnswer: f.expectedAnswer,
      tolerance: f.tolerance,
    })),
  });
}

export async function POST(req: NextRequest) {
  try {
    const { skill_id, used_refs = [] }: MathsLiteracyGenerateRequest = await req.json();

    const skill = getMathsLiteracySkillById(skill_id);
    if (!skill) {
      return NextResponse.json({ error: "Skill not found" }, { status: 404 });
    }

    const bank = loadBank(skill_id);
    if (!bank) {
      return NextResponse.json({ error: "Bank not found for skill" }, { status: 404 });
    }

    const item = pickItem(bank, used_refs);
    if (!item) {
      return NextResponse.json({ error: "No items available" }, { status: 404 });
    }

    const response: MathsLiteracyGenerateResponse = {
      id: `mlq_${Date.now()}`,
      skill_id,
      question_id: item.id,
      stimulus: item.stimulus.inline,
      question: item.question,
      answerMode: item.answerMode,
      options: item.options,
      fields: item.fields?.map((f) => ({ label: f.label, tolerance: f.tolerance })),
      unit: item.unit,
      expected_answer_key: buildAnswerKey(item),
      working_steps: item.workingSteps,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Maths Literacy generate-question error:", error);
    return NextResponse.json({ error: "Failed to generate question" }, { status: 500 });
  }
}
