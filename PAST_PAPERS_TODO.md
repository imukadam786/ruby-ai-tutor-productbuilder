# Past Papers — What's Left To Build

Master tracker for every Nov past paper that's sourced (or partly sourced) in
`Downloads` but not yet built into `data/papers/*.json`. Pick any unchecked row,
open a fresh window on this repo, and knock it out — each row is self-contained.

All source PDFs referenced below live in `C:\Users\keega\Downloads`.

---

## How to build ONE paper (do this in every window)

1. **Read the source PDFs** — question paper + marking guidelines (memo), both
   listed per row below. Use the `pages` param on Read for anything over ~16 pages.
2. **Write `data/papers/<id>.json`.** Copy the schema from an already-built paper
   in the same subject (fastest: open the most recent year for that subject-code,
   e.g. `data/papers/cat-p2-nov-2025.json`, `data/papers/hist-p1-nov-2025.json`).
   Accounting has its own detailed authoring rules — use
   `data/papers/PROMPT_for_future_acc_papers.md` instead of eyeballing an example.
   - Every sub-question needs `id`, `label`, `questionText` (fully self-contained —
     embed any table/figures as text), `marks`, `memoText`, `topic`, `type`.
   - Build **text-first**. If a sub-question shows a picture/graph/screenshot that
     the answer doesn't strictly need reproduced (i.e. the memo answer stands on
     its own), just describe it in `questionText` and move on — don't block on
     images. See "Images" column below for which subjects actually need them.
   - Verify marks per question sum to the paper's own section totals, and the
     grand total matches the cover page (always 150, except Hospitality/CAT-style
     papers — check the cover page's own "MARKS" line).
3. **Register the subject in the Papers UI — only if it's a brand-new subject.**
   Every subject below except CAT is already registered in
   `components/matric/MatricPastPapers.tsx`'s `SUBJECTS` array — skip this step.
4. **Regenerate the index:** `node scripts/regen-paper-index.mjs` (auto-discovers
   every file in `data/papers/`, no manual edits to `paper-index.ts`).
5. **Type-check:** `npx tsc --noEmit` — must be clean.
6. Leave it uncommitted unless told to commit/push (there may be other people's
   in-progress work sitting in the same working tree).

If a row's images are flagged "yes" below, don't crop anything yourself mid-build —
finish the paper text-first, then log the image-referencing sub-question labels at
the bottom of this file (same format as `HOSPITALITY_NOV_CROP_LIST.md` etc. in the
repo root) so cropping can happen as a separate pass later.

---

## Ready to build now (source complete in Downloads)

### Computer Applications Technology — P2 (subject already registered ✅)
Images: **no** — you already hand-cropped every screenshot for these years
(`Downloads\cat_p2_nov_20XX_q*.png`), same as 2025, but the 2025 build shipped
text-first without wiring them. Treat these the same way unless you want to
wire `diagramUrl`s while you're in there.

| Year | Question paper | Memo | Output file | Done |
|---|---|---|---|---|
| 2021 | `Computer Application Technology P2 Nov 2021 Eng.pdf` | `Computer Application Technology P2 Nov 2021 MG Eng.pdf` | `cat-p2-nov-2021.json` | [x] |
| 2022 | `Computer Applications Technology P2 Nov 2022 Eng.pdf` | `Computer Applications Technology P2 Nov 2022 MG Eng.pdf` | `cat-p2-nov-2022.json` | [x] |
| 2023 | `Computer Applications Technology P2 Nov 2023 Eng.pdf` | `CAT P2 Oct-Nov 2023 Approved Marking Guideline (Eng Ver).pdf` (the file listed here was mislabeled — it's actually a P1 memo) | `cat-p2-nov-2023.json` | [x] |
| 2024 | `Computer Applications Technology P2 Nov 2024 Eng.pdf` | `Computer Applications Technology P2 Nov 2024 MG Eng.pdf` | `cat-p2-nov-2024.json` | [x] |

### Accounting — P1 & P2 (no Nov papers exist yet — only May/June is built)
Images: **no** — financial statements/notes are all tables, transcribe as text
(same as the already-built May/June papers, which shipped with zero images).
Use `data/papers/PROMPT_for_future_acc_papers.md` for the authoring rules
(sub-question splitting, memo formatting, mark validation) — just swap
`session` to `"November"`.

| Paper | Year | Question paper | Memo | Output file | Done |
|---|---|---|---|---|---|
| P1 | 2021 | `Accounting P1 Nov 2021 Eng.pdf` | `Accounting P1 Nov 2021 MG Eng.pdf` | `acc-p1-nov-2021.json` | [ ] |
| P1 | 2022 | `Accounting P1 Nov 2022 Eng.pdf` | `Accounting P1 Nov 2022 MG Eng.pdf` | `acc-p1-nov-2022.json` | [ ] |
| P1 | 2023 | `Accounting P1 Nov 2023 Eng.pdf` | `Accounting P1 Nov 2023 MG Eng.pdf` | `acc-p1-nov-2023.json` | [ ] |
| P1 | 2024 | `Accounting P1 Nov 2024 Eng.pdf` | `Accounting P1 Nov 2024 MG Eng.pdf` | `acc-p1-nov-2024.json` | [ ] |
| P1 | 2025 | `Accounting P1 Nov 2025 Eng.pdf` | `Accounting P1 Nov 2025 MG Eng.pdf` | `acc-p1-nov-2025.json` | [ ] |
| P2 | 2021 | `Accounting P2 Nov 2021 Eng.pdf` (or `(1).pdf`) | `Accounting P2 Nov 2021 MG Eng.pdf` | `acc-p2-nov-2021.json` | [ ] |
| P2 | 2022 | `Accounting P2 Nov 2022 Eng.pdf` | `Accounting P2 Nov 2022 MG Eng.pdf` | `acc-p2-nov-2022.json` | [ ] |
| P2 | 2023 | `Accounting P2 Nov 2023 Eng.pdf` | `Accounting P2 Nov 2023 MG Eng.pdf` | `acc-p2-nov-2023.json` | [ ] |
| P2 | 2024 | `Accounting P2 Nov 2024 Eng.pdf` | `Accounting P2 Nov 2024 MG Eng.pdf` | `acc-p2-nov-2024.json` | [ ] |
| P2 | 2025 | `Accounting P2 Nov 2025 Eng.pdf` | `Accounting P2 Nov 2025 MG Eng.pdf` | `acc-p2-nov-2025.json` | [ ] |

### Agricultural Sciences — P1 & P2 (no Nov papers exist yet — only May/June is built)
Images: **likely yes** — Agri Sci regularly tests diagrams (organism anatomy,
life cycles, farm-layout maps, graphs). Build text-first regardless; describe
each diagram/graph in `questionText` as best you can from the PDF page, and add
any sub-question where the picture genuinely can't be described in words to a
new `AGRIC_SCI_NOV_CROP_LIST.md` (same format as the other `*_CROP_LIST.md`
files in this repo root) instead of blocking the build on it.

| Paper | Year | Question paper | Memo | Output file | Done |
|---|---|---|---|---|---|
| P1 | 2021 | `Agricultural Sciences P1 Nov 2021 Eng.pdf` | `Agricultural Sciences P1 Nov 2021 MG Eng.pdf` | `agric-sci-p1-nov-2021.json` | [ ] |
| P1 | 2022 | `Agricultural Sciences P1 Nov 2022 Eng.pdf` | `Agricultural Sciences P1 Nov 2022 MG Eng.pdf` | `agric-sci-p1-nov-2022.json` | [ ] |
| P1 | 2023 | `Agricultural Sciences P1 Nov 2023 Eng.pdf` | `Agricultural Sciences P1 Nov 2023 MG Eng.pdf` | `agric-sci-p1-nov-2023.json` | [ ] |
| P1 | 2024 | `Agricultural Sciences P1 Nov 2024 Eng.pdf` | `Agricultural Sciences P1 Nov 2024 MG Eng.pdf` | `agric-sci-p1-nov-2024.json` | [ ] |
| P1 | 2025 | `Agricultural Sciences P1 Nov 2025 Eng.pdf` | `Agricultural Sciences P1 Nov 2025 MG Eng.pdf` | `agric-sci-p1-nov-2025.json` | [ ] |
| P2 | 2021 | `Agricultural Sciences P2 Nov 2021 Eng.pdf` | `Agricultural Sciences P2 Nov 2021 MG Eng.pdf` | `agric-sci-p2-nov-2021.json` | [ ] |
| P2 | 2022 | `Agricultural Sciences P2 Nov 2022 Eng.pdf` | `Agricultural Sciences P2 Nov 2022 MG Eng.pdf` | `agric-sci-p2-nov-2022.json` | [ ] |
| P2 | 2023 | `Agricultural Sciences P2 Nov 2023 Eng.pdf` | `Agricultural Sciences P2 Nov 2023 MG Eng.pdf` | `agric-sci-p2-nov-2023.json` | [ ] |
| P2 | 2024 | `Agricultural Sciences P2 Nov 2024 Eng.pdf` | `Agricultural Sciences P2 Nov 2024 MG Eng.pdf` | `agric-sci-p2-nov-2024.json` | [ ] |
| P2 | 2025 | `Agricultural Sciences P2 Nov 2025 Eng.pdf` | `Agricultural Sciences P2 Nov 2025 MG Eng.pdf` | `agric-sci-p2-nov-2025.json` | [ ] |

### English HL — P2 (Literature) & P3 (Writing) — Nov not built yet
Images: **low risk, mostly text** — P3 (writing) never has images. P2
(literature extracts — poetry/prose/drama) occasionally has one for a visual
poetry question; describe it in `questionText` if so, don't block the build.

| Paper | Year | Question paper | Memo | Output file | Done |
|---|---|---|---|---|---|
| P2 | 2021 | `English HL P2 Nov 2021.pdf` | `English HL P2 Nov 2021 MG.pdf` | `eng-hl-p2-nov-2021.json` | [ ] |
| P2 | 2022 | `English HL P2 Nov 2022.pdf` | `English HL P2 Nov 2022 MG.pdf` | `eng-hl-p2-nov-2022.json` | [ ] |
| P2 | 2023 | `English HL P2 Nov 2023.pdf` | `English HL P2 Nov 2023 MG.pdf` | `eng-hl-p2-nov-2023.json` | [ ] |
| P2 | 2024 | `English HL P2 Nov 2024.pdf` | `English HL P2 Nov 2024 MG.pdf` | `eng-hl-p2-nov-2024.json` | [ ] |
| P2 | 2025 | `English HL P2 Nov 2025.pdf` | *(not in Downloads — source before building)* | `eng-hl-p2-nov-2025.json` | [ ] |
| P3 | 2021 | `English HL P3 Nov 2021.pdf` | `English HL P3 Nov 2021 MG.pdf` | `eng-hl-p3-nov-2021.json` | [ ] |
| P3 | 2022 | `English HL P3 Nov 2022.pdf` | `English HL P3 Nov 2022 MG.pdf` | `eng-hl-p3-nov-2022.json` | [ ] |
| P3 | 2023 | `English HL P3 Nov 2023.pdf` | `English HL P3 Nov 2023 MG.pdf` | `eng-hl-p3-nov-2023.json` | [ ] |
| P3 | 2024 | `English HL P3 Nov 2024.pdf` | `English HL P3 Nov 2024 MG.pdf` | `eng-hl-p3-nov-2024.json` | [ ] |
| P3 | 2025 | `English HL P3 Nov 2025.pdf` | *(not in Downloads — source before building)* | `eng-hl-p3-nov-2025.json` | [ ] |

### Afrikaans FAL — P2 (Literature) — only 2025 is built, 2021–2024 missing
Images: **no** — P1 and P3 of the same subject already built 5 years each
with zero crop list, and P2 is the same literature-extract format.

| Year | Question paper | Memo | Output file | Done |
|---|---|---|---|---|
| 2021 | `Afrikaans FAL P2 Nov 2021.pdf` (or `afri_fal_p2_nov_2021_qp.pdf`) | `Afrikaans FAL P2 Nov 2021 MG.pdf` | `afr-fal-p2-nov-2021.json` | [ ] |
| 2022 | `Afrikaans FAL P2 Nov 2022.pdf` | `Afrikaans FAL P2 Nov 2022 MG.pdf` | `afr-fal-p2-nov-2022.json` | [ ] |
| 2023 | `Afrikaans FAL P2 Nov 2023.pdf` | `Afrikaans FAL P2 Nov 2023 MG.pdf` | `afr-fal-p2-nov-2023.json` | [ ] |
| 2024 | `Afrikaans FAL P2 Nov 2024.pdf` | `Afrikaans FAL P2 Nov 2024 MG.pdf` | `afr-fal-p2-nov-2024.json` | [ ] |

---

## Blocked — source needs finding first

Don't start these until the missing PDF is in Downloads (Google/DBE site, or
wherever you've been pulling the rest from).

| Subject | Paper | Year | What's missing | Images? |
|---|---|---|---|---|
| Maths Literacy | P2 | 2022 | **Memo** — QP is there (`Mathematical Literacy P2 Nov 2022 Eng.pdf`), no MG anywhere in Downloads | **Yes** — Maths Lit Nov papers are graph/table-heavy (see `MATHS_LIT_NOV_CROP_LIST.md` for the other 4 years) |
| Business Studies | P1 | 2021 | **Memo** — QP is there (`Grade 12 NSC Business Studies P1 (English) November 2021 Question Paper.pdf`) | Low — no crop list exists for the other already-built years |
| Business Studies | P2 | 2021 | **Question paper** — only `bus_p2_nov_2021_memo.pdf` is there | Low — same as above |
| Business Studies | P2 | 2025 | **Question paper** — only `bus_p2_nov_2025_memo.pdf` is there | Low — same as above |
| English HL | P1 | 2021–2025 | Neither QP nor memo sourced yet for any Nov year (only May/June exists) | Low |

---

## Already done — nothing left here

Mathematics, Physical Sciences, Life Sciences, History, Geography, Economics,
Hospitality Studies, Tourism, and Afrikaans FAL P1/P3 all have every Nov
2021–2025 paper built and wired already.
