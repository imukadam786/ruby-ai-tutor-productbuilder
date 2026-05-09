# Prompt: Convert NSC Accounting P1 Exam to JSON

Copy this prompt and paste it into Claude AI together with the PDF attachments (question paper + marking guidelines). The answer book layout is the same every year — the JSON schema below is all you need for structure.

---

## PROMPT (copy everything below this line)

You are converting a South African NSC/SC Grade 12 Accounting Paper 1 exam into a structured JSON file for an AI tutoring platform. I am attaching the QUESTION PAPER and MARKING GUIDELINES (memo). Use BOTH documents together.

Produce a single valid JSON object. Do not include any explanation, markdown fences, or commentary — output ONLY the raw JSON.

---

### REQUIRED JSON SCHEMA

```
{
  "id": "acc-p1-{session}-{year}",
  "subject": "Accounting",
  "subjectCode": "acc",
  "paperCode": "P1",
  "year": {YYYY},
  "session": "{May-June | November | March}",
  "totalMarks": 150,
  "durationHours": 2,
  "questions": [
    {
      "number": {1|2|3|4},
      "title": "{topic and company name}",
      "totalMarks": {50|45|40|15},
      "subQuestions": [
        {
          "id": "acc-p1-{session}-{year}-{q}-{sq}",
          "label": "{e.g. 1.1, 2.1(i), 3.2, 4.1.1}",
          "questionText": "{full self-contained question — see rules below}",
          "marks": {integer},
          "memoText": "{full marking guideline answer — see rules below}",
          "topic": "{specific topic name}",
          "type": "{written | mcq}",
          "options": { "A": "...", "B": "..." }   // only for type=mcq
        }
      ]
    }
  ]
}
```

---

### ID FORMAT
- Session codes: `may-jun`, `nov`, `mar`
- Examples: `acc-p1-may-jun-2025-1-1`, `acc-p1-nov-2024-2-1i`, `acc-p1-nov-2024-3-4a`
- For multi-part sub-questions use suffixes: `i`, `ii`, `iii` or `a`, `b`, `c`

---

### SUB-QUESTION SPLITTING RULES

Split into ONE sub-question per distinct calculation or answer required:

**Question 1 (Company Financial Statements):**
- 1.1 = Statement of Comprehensive Income (one sub-question, all marks)
- 1.2 = Statement of Financial Position / relevant section (one sub-question, all marks)

**Question 2 (Fixed Assets, Cash Flow, Financial Indicators):**
- 2.1(i), 2.1(ii), 2.1(iii) = each fixed asset calculation separately
- 2.2a = Taxation paid; 2.2b = Dividends paid
- 2.3 = Cash effects from financing activities (one sub-question)
- 2.4a, 2.4b, 2.4c = each financial indicator separately
- 2.5 = Sources of funding analysis (one sub-question covering both parts)

**Question 3 (Interpretation):**
- 3.1.1, 3.1.2, 3.1.3 = each word-choice separately (type: mcq)
- 3.2 = liquidity analysis
- 3.3a = dividend pay-out rate calculation; 3.3b = reason for policy change
- 3.4a = shares calculation; 3.4b = % shareholding; 3.4c = auditor concern
- 3.5a = gearing argument (should not borrow); 3.5b = benefits of share issue
- 3.6 = share value
- 3.7a = qualified CFO reason; 3.7b = indicators for non-renewal

**Question 4 (Corporate Governance):**
- 4.1.1, 4.1.2, 4.1.3 = each part separately
- 4.2.1, 4.2.2 = each part separately

---

### questionText RULES (critical)

Each questionText MUST be completely self-contained — a student reading ONLY this field must have ALL information needed to answer. This means:

1. **Include ALL relevant data tables**, financial figures, and information blocks from the question paper that are needed for this specific sub-question. Embed them as formatted text (use | for table columns, or plain indented lists).

2. **Include the company name and background** (one line) for the first sub-question in each question group. Subsequent sub-questions in the same group may say "Use the same information as [label above]" ONLY if they share ALL the same data — otherwise repeat relevant data.

3. **Quote the specific question being asked** verbatim or near-verbatim from the question paper.

4. **For Q1 sub-questions**: embed Information A (full balances table), B (all adjustments), C, D, E, F, G from the question paper.

5. **For Q2 sub-questions**: embed the relevant extracts from Information A (income statement), B (SFP), C (shares), D (fixed asset note) as needed per sub-question.

6. **For Q3 sub-questions**: embed the relevant rows from Information A (financial indicators table), B (additional info), C (shares table), D (shareholding) as needed.

7. **For Q4 sub-questions**: embed the full relevant extract (audit report text or newspaper article).

8. Spell out monetary values with spaces as per South African convention (e.g. R1 200 500, not R1,200,500).

---

### memoText RULES (critical)

Each memoText MUST be a complete, pedagogical marking guide. Include:

1. **Step-by-step workings** with the exact calculations and final answers.

2. **Mark allocation indicators** — use ✓ for each mark awarded. Label method marks (✓ for operation, ✓✓ for two-part correct). Where the memo says "one part correct" write ✓ per part.

3. **Exact figures from the marking guidelines** — copy them precisely.

4. **Penalty notes** where specified in the memo (e.g. "−1 for foreign items, max −2").

5. **Teaching points** — add 1–3 sentences explaining WHY the calculation works this way, what common mistakes to avoid, and what the concept means. Label these as "Teaching:" or "Teaching point:".

6. **Alternative methods** — where the memo shows an alternative working (OR), include it.

7. **"Do not accept" notes** — include any items the memo explicitly rejects.

8. For written interpretation questions (Q3), include the **full list of acceptable bullet points** from the memo, not just one example.

9. For Q1.1 and Q1.2, include the complete line-by-line answer with all workings shown.

---

### SPECIAL RULES FOR ACCOUNTING

- Rent income: if received in advance, only the portion EARNED in the financial year goes to income. The advance portion is a current liability.
- Provision for bad debts: a DECREASE in provision = income (other income). An INCREASE = expense.
- Directors' fees: fees paid for the NEXT period must be excluded (prepaid expense or adjust the nominal account).
- Trading stock deficit: may be shown as income or expense depending on whether it is a net credit or debit — follow the memo's treatment.
- Interest expense on loan: calculate as (monthly payment × 12) − capital repayment for the year.
- Taxation paid (cash flow): Opening IT liability + Current year tax + Closing IT asset = Tax paid.
- Dividends paid (cash flow): Opening SFD + Interim dividends declared = Dividends paid (closing SFD stays as liability).
- Solvency ratio given → use it to back-calculate total liabilities: Total liabilities = Total assets ÷ solvency ratio.

---

### MARK VALIDATION

Before finalising JSON, verify:
- Sum of all subQuestion marks in Q1 = 50
- Sum of all subQuestion marks in Q2 = 45
- Sum of all subQuestion marks in Q3 = 40
- Sum of all subQuestion marks in Q4 = 15
- Grand total = 150

If totals do not match, recheck the question paper's mark allocations and adjust.

---

### OUTPUT

Output ONLY the raw JSON object. No markdown. No explanation. Start with `{` and end with `}`.
```
