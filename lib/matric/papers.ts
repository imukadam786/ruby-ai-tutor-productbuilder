export type MCQOptions = { A: string; B: string; C: string; D: string };

export interface SubQuestion {
  id: string;
  label: string;
  questionText: string;
  marks: number;
  memoText: string;
  topic: string;
  diagramUrl?: string;
  /** "mcq" renders A/B/C/D option cards. Defaults to "written" if omitted. */
  type?: "written" | "mcq";
  /** Required when type === "mcq" */
  options?: MCQOptions;
}

export interface PaperQuestion {
  number: number;
  title: string;
  totalMarks: number;
  diagramUrl?: string;
  subQuestions: SubQuestion[];
}

export interface InfoSheet {
  title: string;
  /** Render from the pre-built markdown formula sheets (Maths) */
  formulaSheetVariant?: import("./formula-sheets").FormulaSheetVariant;
  /** Render a PDF in an iframe (upload PDF to Supabase storage) */
  pdfUrl?: string;
  /** Render from Supabase-hosted images (fallback for image-based sheets) */
  imageUrls?: string[];
}

export interface Paper {
  id: string;
  subject: string;
  paperCode: string;
  year: number;
  session: string;
  totalMarks: number;
  durationHours: number;
  questions: PaperQuestion[];
  questionPaperUrl?: string;
  memoUrl?: string;
  /** Info / formula / data sheet shown in-session */
  infoSheet?: InfoSheet;
}

export const PAPERS: Paper[] = [
  {
    id: "math-p1-may-jun-2025",
    subject: "Mathematics",
    paperCode: "P1",
    year: 2025,
    session: "May/June",
    totalMarks: 150,
    durationHours: 3,
    infoSheet: { title: "Info Sheet", formulaSheetVariant: "standard" },
    questions: [
      {
        number: 1,
        title: "Algebra & Equations",
        totalMarks: 25,
        subQuestions: [
          {
            id: "1-1-1",
            label: "1.1.1",
            questionText: "Solve for $x$:\n\n$$x^2 - 3x - 10 = 0$$",
            marks: 3,
            memoText: `Mark scheme (3 marks):
Mark 1: Correct factorisation (x + 2)(x − 5) = 0 OR correct substitution into quadratic formula
Mark 2: x = −2
Mark 3: x = 5
Both values required for full marks. Consistent Accuracy (CA) applies.`,
            topic: "Algebra",
          },
          {
            id: "1-1-2",
            label: "1.1.2",
            questionText: "Solve for $x$ (correct to TWO decimal places):\n\n$$3x^2 + 6x + 1 = 0$$",
            marks: 3,
            memoText: `Mark scheme (3 marks):
Mark 1: Correct substitution into quadratic formula: x = (−6 ± √(36 − 12)) / 6
Mark 2: x = −1.82
Mark 3: x = −0.18
Both values required. CA applies.`,
            topic: "Algebra",
          },
          {
            id: "1-1-3",
            label: "1.1.3",
            questionText: "Solve for $x$:\n\n$$2^{x+4} + 2^x = 8\\,704$$",
            marks: 3,
            memoText: `Mark scheme (3 marks):
Mark 1: Correct factorisation — 2^x(2^4 + 1) = 8 704, i.e. 2^x × 17 = 8 704
Mark 2: Simplify to exponential equation — 2^x = 512 = 2^9
Mark 3: x = 9 (OR x = log₂ 512 = 9)`,
            topic: "Algebra",
          },
          {
            id: "1-1-4",
            label: "1.1.4",
            questionText: "Solve for $x$:\n\n$$(x - 8)(x + 2) \\leq 0$$",
            marks: 3,
            memoText: `Mark scheme (3 marks):
Mark 1: Critical values x = 8 and x = −2
Marks 2–3 (double mark): Answer −2 ≤ x ≤ 8 OR x ∈ [−2 ; 8]`,
            topic: "Algebra",
          },
          {
            id: "1-1-5",
            label: "1.1.5",
            questionText: "Solve for $x$:\n\n$$x + 3\\sqrt{x + 2} = 2$$",
            marks: 4,
            memoText: `Mark scheme (4 marks):
Mark 1: Correctly isolating the surd — 3√(x + 2) = 2 − x
Mark 2: Squaring both sides — 9(x + 2) = (2 − x)² = 4 − 4x + x²
Mark 3: Standard form — x² − 13x − 14 = 0 → (x − 14)(x + 1) = 0
Mark 4: x ≠ 14 (rejected — does not satisfy original equation) and x = −1
Must show selection/rejection of x = 14 for the final mark.`,
            topic: "Algebra",
          },
          {
            id: "1-2",
            label: "1.2",
            questionText:
              "A rectangle has sides of $(y - 3)$ metres and $(x + 2)$ metres. It has a perimeter of 24 metres and an area of 32 square metres. Calculate the values of $x$ and $y$.",
            marks: 6,
            memoText: `Mark scheme (6 marks):
Mark 1: Area equation — (y − 3)(x + 2) = 32
Mark 2: Perimeter equation — 2(y − 3) + 2(x + 2) = 24 → y + x = 13 → y = 13 − x
Mark 3: Substitute y into area equation
Mark 4: Standard form — x² − 8x + 12 = 0 → (x − 6)(x − 2) = 0
Mark 5: x-values — x = 6 or x = 2
Mark 6: Corresponding y-values — y = 7 or y = 11`,
            topic: "Algebra",
          },
          {
            id: "1-3",
            label: "1.3",
            questionText:
              "Show that $\\left(1 + x^m + x^{-n}\\right)^2 - \\left(1 - x^m - x^{-n}\\right)^2$ is divisible by 2 for all real values of $m$ and $n$.",
            marks: 3,
            memoText: `Mark scheme (3 marks):
Mark 1: Recognise difference of squares and factorise:
= [(1+x^m+x^{-n}) + (1−x^m−x^{-n})][(1+x^m+x^{-n}) − (1−x^m−x^{-n})]
= [2][2x^m + 2x^{-n}]
Mark 2: Simplify to 2(2x^m + 2x^{-n})
Mark 3: Final simplified form — clearly divisible by 2 for all real m and n.
OR via full expansion: subtract the two expansions and simplify to 4(x^m + x^{-n})`,
            topic: "Algebra",
          },
        ],
      },
      {
        number: 2,
        title: "Number Patterns & Series",
        totalMarks: 18,
        subQuestions: [
          {
            id: "2-1-1",
            label: "2.1.1",
            questionText:
              "Given the arithmetic series: $5 + 7 + 9 + \\ldots + 93$\n\nDetermine the general term $T_n$ in the form $T_n = pn + q$.",
            marks: 2,
            memoText: `Mark scheme (2 marks):
Mark 1: p = 2 (coefficient of n)
Mark 2: q = 3 (constant)
Answer: T_n = 2n + 3`,
            topic: "Sequences & Series",
          },
          {
            id: "2-1-2",
            label: "2.1.2",
            questionText:
              "The series represents the number of kilometres an athlete ran each week in training for an ultramarathon. The athlete ran 93 km in the last week. How long, in weeks, was the training programme?",
            marks: 2,
            memoText: `Mark scheme (2 marks):
Mark 1: Set T_n = 93: 2n + 3 = 93 (equating)
Mark 2: n = 45 weeks`,
            topic: "Sequences & Series",
          },
          {
            id: "2-1-3",
            label: "2.1.3",
            questionText:
              "The community sponsored the athlete R10 for each kilometre run during the training programme. Calculate the total amount raised for her school.",
            marks: 3,
            memoText: `Mark scheme (3 marks):
Mark 1: Convert km to money — series becomes 50 + 70 + 90 + … + 930 (multiply by R10)
Mark 2: Correct substitution: S₄₅ = (45/2)[2(50) + (45−1)(20)] OR S₄₅ = (45/2)[50 + 930]
Mark 3: S₄₅ = R22 050`,
            topic: "Sequences & Series",
          },
          {
            id: "2-2-1a",
            label: "2.2.1(a)",
            questionText:
              "The general term of a geometric sequence is $T_n = 2^{n+2}$.\n\nWrite down the **first term** of the sequence.",
            marks: 1,
            memoText: `Mark scheme (1 mark):
Mark 1: T₁ = 2^(1+2) = 2³ = 8, so a = 8`,
            topic: "Sequences & Series",
          },
          {
            id: "2-2-1b",
            label: "2.2.1(b)",
            questionText:
              "The general term of a geometric sequence is $T_n = 2^{n+2}$.\n\nWrite down the **common ratio**.",
            marks: 1,
            memoText: `Mark scheme (1 mark):
Mark 1: r = 2 (T₂/T₁ = 2^4/2^3 = 2)`,
            topic: "Sequences & Series",
          },
          {
            id: "2-2-2",
            label: "2.2.2",
            questionText: "Calculate $T_{20}$. Write your answer as a **power of 4**.",
            marks: 2,
            memoText: `Mark scheme (2 marks):
Mark 1: T₂₀ = 2^(20+2) = 2^22 (correct substitution)
Mark 2: Express as power of 4: 2^22 = (2²)^11 = 4^11`,
            topic: "Sequences & Series",
          },
          {
            id: "2-2-3",
            label: "2.2.3",
            questionText:
              "Calculate $\\displaystyle\\sum_{n=1}^{\\infty} \\dfrac{1}{T_n}$",
            marks: 3,
            memoText: `Mark scheme (3 marks):
Mark 1: Identify series: 1/T_n = 1/2^(n+2), so series is 1/8 + 1/16 + 1/32 + ... (a = 1/8, r = 1/2)
Mark 2: Correct substitution into S∞ formula: S∞ = (1/8) / (1 − 1/2)
Mark 3: S∞ = 1/4`,
            topic: "Sequences & Series",
          },
          {
            id: "2-2-4",
            label: "2.2.4",
            questionText:
              "Consider the first 21 terms of the sequence $T_n = 2^{n+2}$. Calculate the sum of the terms that are **not** powers of 4.",
            marks: 4,
            memoText: `Mark scheme (4 marks):
Mark 1: S₂₁ (all 21 terms, r = 2): 8(2^21 − 1)/(2 − 1)
Mark 2: Identify n = 10 terms ARE powers of 4 (the odd-positioned terms: n=1,3,5,...,19)
Mark 3: S₁₀ for powers of 4 (first term 8, r = 4): 16(4^10 − 1)/(4 − 1)
Mark 4: Answer = S₂₁ − S₁₀ = 16 777 208 − 5 592 400 = 11 184 808
OR: 11 terms NOT powers of 4, first term 32, r = 4: S₁₁ = 8(4^11−1)/(4−1) = 11 184 808`,
            topic: "Sequences & Series",
          },
        ],
      },
      {
        number: 3,
        title: "Quadratic Sequences",
        totalMarks: 9,
        subQuestions: [
          {
            id: "3-1",
            label: "3.1",
            questionText:
              "Given the quadratic sequence: $14 \\;; 9 \\;; 6 \\;; 5 \\;; \\ldots$\n\nShow that the general term is $T_n = n^2 - 8n + 21$.",
            marks: 3,
            memoText: `Mark scheme (3 marks):
Mark 1: Second difference = 2, so 2a = 2 → a = 1
Mark 2: First differences: −5, −3, −1; using T₁: 3(1) + b = −5 → b = −8
Mark 3: Using T₁: 1 − 8 + c = 14 → c = 21; therefore T_n = n² − 8n + 21 ✓`,
            topic: "Quadratic Sequences",
          },
          {
            id: "3-2",
            label: "3.2",
            questionText:
              "Two consecutive terms of the quadratic sequence have a difference of 33. Calculate the value of the **larger** term.",
            marks: 3,
            memoText: `Mark scheme (3 marks):
Mark 1: General first-difference formula: T_{n+1} − T_n = 2n − 7
Mark 2: Set equal to 33: 2n − 7 = 33 → n = 20
Mark 3: Larger term is T₂₁ = (21)² − 8(21) + 21 = 441 − 168 + 21 = 294`,
            topic: "Quadratic Sequences",
          },
          {
            id: "3-3",
            label: "3.3",
            questionText:
              "The value of $m$ is added to each term in the quadratic sequence. Determine the values of $m$ for which **only** the terms between $T_1$ and $T_7$ will have negative values.",
            marks: 3,
            memoText: `Mark scheme (3 marks):
Mark 1: T₇ = T₁ = 14 (both endpoints equal); for T₁ + m to be non-negative boundary: 14 + m ≥ 0 → m ≥ −14
Mark 2: T₂ (= T₆ = 9) must be negative: 9 + m < 0 → m < −9
Mark 3: Final answer: −14 ≤ m < −9`,
            topic: "Quadratic Sequences",
          },
        ],
      },
      {
        number: 4,
        title: "Functions: Hyperbola",
        totalMarks: 15,
        diagramUrl: "https://kmgnizvqkqkiulzgvkcb.supabase.co/storage/v1/object/public/matric-diagrams/math-p1-may-jun-2025_q4.png",
        subQuestions: [
          {
            id: "4-1",
            label: "4.1",
            questionText:
              "The graph of $f(x) = \\dfrac{4}{x-3} + 4$ is drawn. $M$ is the point where the asymptotes of $f$ intersect.\n\nWrite down the coordinates of $M$.",
            marks: 2,
            memoText: `Mark scheme (2 marks):
Mark 1: x = 3 (vertical asymptote)
Mark 2: y = 4 (horizontal asymptote)
Answer: M(3 ; 4)`,
            topic: "Functions",
          },
          {
            id: "4-2",
            label: "4.2",
            questionText:
              "For $f(x) = \\dfrac{4}{x-3} + 4$, calculate the coordinates of $D$, the $y$-intercept of $f$.",
            marks: 2,
            memoText: `Mark scheme (2 marks):
Mark 1: Set x = 0: y = 4/(0−3) + 4 = −4/3 + 4 = 8/3
Mark 2: D(0 ; 8/3)`,
            topic: "Functions",
          },
          {
            id: "4-3",
            label: "4.3",
            questionText:
              "If $y = x + t$ is the equation of a line of symmetry of $f(x) = \\dfrac{4}{x-3} + 4$, calculate the value of $t$.",
            marks: 2,
            memoText: `Mark scheme (2 marks):
Mark 1: Substitute asymptote intersection M(3 ; 4) into y = x + t: 4 = 3 + t
Mark 2: t = 1`,
            topic: "Functions",
          },
          {
            id: "4-4",
            label: "4.4",
            questionText:
              "Determine the values of $x$ for which $f(x) \\leq 0$, where $f(x) = \\dfrac{4}{x-3} + 4$.",
            marks: 4,
            memoText: `Mark scheme (4 marks):
Mark 1: Set y = 0: 4/(x−3) + 4 = 0 → −4(x−3) = 4 → x − 3 = −1
Mark 2: x = 2, so C(2 ; 0)
Marks 3–4 (double mark): Answer 2 ≤ x < 3 (include x = 2; exclude vertical asymptote x = 3)`,
            topic: "Functions",
          },
          {
            id: "4-5",
            label: "4.5",
            questionText:
              "Calculate the coordinates of $A$, the point on $f(x) = \\dfrac{4}{x-3} + 4$ that is closest to $M(3;4)$.",
            marks: 3,
            memoText: `Mark scheme (3 marks):
Mark 1: Equate f(x) to the line of symmetry y = x + 1: 4/(x−3) + 4 = x + 1 → 4/(x−3) = x−3 → 4 = (x−3)²  → ±2 = x−3
Mark 2: x = 5 (reject x = 1 — it lies below M on the other branch), so x_A = 5
Mark 3: y_A = 5 + 1 = 6; Answer: A(5 ; 6)`,
            topic: "Functions",
          },
          {
            id: "4-6",
            label: "4.6",
            questionText:
              "A transformation is applied to $f$ to obtain $h(x) = \\dfrac{-4}{x+3} + 4$. $A'$ is the image of $A(5\\,;\\,6)$ under this transformation. Calculate the length of $AA'$.",
            marks: 2,
            memoText: `Mark scheme (2 marks):
Mark 1: h(x) = −4/(x+3)+4 = 4/(−x−3)+4; this is a reflection of f in the y-axis; A(5;6) maps to A'(−5;6)
Mark 2: AA' = |5 − (−5)| = 10`,
            topic: "Functions",
          },
        ],
      },
      {
        number: 5,
        title: "Functions: Parabola",
        totalMarks: 9,
        diagramUrl: "https://kmgnizvqkqkiulzgvkcb.supabase.co/storage/v1/object/public/matric-diagrams/math-p1-may-jun-2025_q5.png",
        subQuestions: [
          {
            id: "5-1",
            label: "5.1",
            questionText:
              "The graph of $f(x) = a(x+p)^2 + q$ has turning point $C(-1\\,;\\,4)$ and passes through $B(-3\\,;\\,-4)$.\n\nShow that $f(x) = -2x^2 - 4x + 2$.",
            marks: 3,
            memoText: `Mark scheme (3 marks):
Mark 1: Use turning point C(−1;4): f(x) = a(x+1)² + 4; substitute B(−3;−4)
Mark 2: −4 = a(−2)² + 4 → −8 = 4a → a = −2
Mark 3: f(x) = −2(x+1)²+4 = −2x²−4x−2+4 = −2x²−4x+2 ✓`,
            topic: "Functions",
          },
          {
            id: "5-2",
            label: "5.2",
            questionText:
              "Determine the values of $k$ for which $h(x) = f(x) + k$ will have **no real roots**.",
            marks: 2,
            memoText: `Mark scheme (2 marks — double mark):
For no real roots the entire parabola must be below the x-axis.
Maximum value of f(x) is 4 (at turning point C).
h(x) = f(x) + k has no real roots when 4 + k < 0 → k < −4`,
            topic: "Functions",
          },
          {
            id: "5-3",
            label: "5.3",
            questionText:
              "The graph of $y = g'(x)$, where $g'$ is the derivative of $g$, is obtained when $f$ is reflected over the line $y = 4$. Draw a sketch graph of $g$ if $g(0) < 0$. Clearly indicate any stationary points.",
            marks: 4,
            memoText: `Mark scheme (4 marks):
Mark 1: Point of inflection shown on sketch
Mark 2: Change of concavity at x = −1 (inflection point of the cubic)
Mark 3: y-intercept is below the x-axis [since g(0) < 0]
Mark 4: Increasing curve (cubic shape — starts very negative bottom-left, increases through inflection, continues up)`,
            topic: "Functions",
          },
        ],
      },
      {
        number: 6,
        title: "Exponential Functions & Inverses",
        totalMarks: 11,
        diagramUrl: "https://kmgnizvqkqkiulzgvkcb.supabase.co/storage/v1/object/public/matric-diagrams/math-p1-may-jun-2025_q6.png",
        subQuestions: [
          {
            id: "6-1",
            label: "6.1",
            questionText:
              "The graphs of $f(x) = p^x + q$ and $g(x) = mx + c$ are drawn. $A(3\\,;\\,4)$ is their intersection. $B(0\\,;\\,-3)$ is the $y$-intercept of $f$.\n\nCalculate the values of $p$ and $q$.",
            marks: 4,
            memoText: `Mark scheme (4 marks):
Mark 1: Substitute B(0;−3): −3 = p⁰ + q = 1 + q → q = −4
Mark 2: q = −4
Mark 3: Substitute A(3;4): 4 = p³ − 4 → p³ = 8
Mark 4: p = 2; so f(x) = 2^x − 4`,
            topic: "Functions",
          },
          {
            id: "6-2",
            label: "6.2",
            questionText: "Write down the range of $f(x) = 2^x - 4$.",
            marks: 1,
            memoText: `Mark scheme (1 mark):
Mark 1: y > −4 OR y ∈ (−4 ; ∞)`,
            topic: "Functions",
          },
          {
            id: "6-3",
            label: "6.3",
            questionText:
              "The graph of $g^{-1}$ (the inverse of $g$) also passes through $B(0\\,;\\,-3)$. Determine the equation of $g$ in the form $y = \\ldots$",
            marks: 4,
            memoText: `Mark scheme (4 marks):
Mark 1: g^{-1} passes through B(0;−3) → g passes through (−3;0), so E(−3;0)
Mark 2: Gradient m = (4−0)/(3−(−3)) = 4/6 = 2/3
Mark 3: Substitution to find c: 0 = (2/3)(−3) + c → c = 2
Mark 4: g(x) = (2/3)x + 2`,
            topic: "Functions",
          },
          {
            id: "6-4",
            label: "6.4",
            questionText:
              "Write down the equation of $g^{-1}$ in the form $y = \\ldots$",
            marks: 2,
            memoText: `Mark scheme (2 marks):
Mark 1: Swap x and y in g: x = (2/3)y + 2
Mark 2: g^{-1}(x) = (3/2)x − 3`,
            topic: "Functions",
          },
        ],
      },
      {
        number: 7,
        title: "Finance",
        totalMarks: 13,
        subQuestions: [
          {
            id: "7-1",
            label: "7.1",
            questionText:
              "John invests money at a rate of 15% p.a., compounded monthly. Calculate the **annual effective interest rate** of this investment.",
            marks: 2,
            memoText: `Mark scheme (2 marks):
Mark 1: Correct substitution: (1 + i) = (1 + 0.15/12)^12
Mark 2: i = 16.08%`,
            topic: "Finance",
          },
          {
            id: "7-2",
            label: "7.2",
            questionText:
              "Tino invests R500 000 in an account earning 6% p.a., compounded quarterly. He withdraws R11 250 at the end of every 3 months. How many withdrawals of R11 250 will Tino be able to make?",
            marks: 5,
            memoText: `Mark scheme (5 marks):
Mark 1: i = 0.06/4 = 0.015 (quarterly rate)
Mark 2: Correct substitution into present-value annuity formula: 500 000 = 11 250 × [1 − (1.015)^{−n}] / 0.015
Mark 3: Correct use of logarithms: −n = log_{1.015}(1/3)
Mark 4: n = 73.788...
Mark 5: n = 73 withdrawals (round down — cannot make a partial withdrawal)`,
            topic: "Finance",
          },
          {
            id: "7-3",
            label: "7.3",
            questionText:
              "On 1 March 2021, Abby deposited R12 000 once-off at 9.5% p.a., compounded monthly. On 1 April 2023 she began depositing R500 monthly (on the first of each month). Calculate how much was in the account immediately after the R500 deposit on **1 March 2025** (exactly 4 years after her initial deposit).",
            marks: 6,
            memoText: `Mark scheme (6 marks):
Mark 1: i = 0.095/12 (monthly rate)
Mark 2: n = 48 months for the R12 000 compound amount (March 2021 → March 2025)
Mark 3: A = 12 000(1 + 0.095/12)^48 = R17 521.18
Mark 4: n = 24 months for the future-value annuity (April 2023 → March 2025)
Mark 5: F = 500[(1 + 0.095/12)^24 − 1] / (0.095/12) = R13 158.65
Mark 6: Total = R17 521.18 + R13 158.65 = R30 679.83`,
            topic: "Finance",
          },
        ],
      },
      {
        number: 8,
        title: "Calculus: Differentiation",
        totalMarks: 17,
        subQuestions: [
          {
            id: "8-1",
            label: "8.1",
            questionText:
              "Determine $f'(x)$ from **first principles** if $f(x) = x^2 - 2$.",
            marks: 5,
            memoText: `Mark scheme (5 marks):
Mark 1: Write f(x+h) = (x+h)² − 2 = x² + 2xh + h² − 2
Mark 2: Correct substitution into definition: f'(x) = lim_{h→0} [f(x+h) − f(x)] / h
Mark 3: Simplification: = lim_{h→0} (2xh + h²) / h
Mark 4: Factorisation and cancellation: = lim_{h→0} h(2x+h) / h = lim_{h→0} (2x+h)
Mark 5: f'(x) = 2x`,
            topic: "Calculus",
          },
          {
            id: "8-2-1",
            label: "8.2.1",
            questionText:
              "Determine: $\\dfrac{d}{dx}\\left[3x^2 - 4x\\right]$",
            marks: 2,
            memoText: `Mark scheme (2 marks):
Mark 1: 6x
Mark 2: −4
Answer: 6x − 4`,
            topic: "Calculus",
          },
          {
            id: "8-2-2",
            label: "8.2.2",
            questionText:
              "Determine $g'(x)$ if $g(x) = -2\\sqrt{x}\\,(x-1)^2$.",
            marks: 4,
            memoText: `Mark scheme (4 marks):
Mark 1: Rewrite with fractional exponent: g(x) = −2x^{1/2}(x² − 2x + 1)
Mark 2: Expand: g(x) = −2x^{5/2} + 4x^{3/2} − 2x^{1/2}
Mark 3: −5x^{3/2} + 6x^{1/2} terms (differentiate first two terms)
Mark 4: − x^{−1/2} (differentiate last term)
Answer: g'(x) = −5x^{3/2} + 6x^{1/2} − x^{−1/2}`,
            topic: "Calculus",
          },
          {
            id: "8-3",
            label: "8.3",
            questionText:
              "Given that $y = 4x - 14$ is a common tangent to both $f(x) = 2x^2 - 4x - 6$ and $g(x) = ax^2 + bx - 18$, calculate the values of $a$ and $b$.",
            marks: 6,
            memoText: `Mark scheme (6 marks):
Mark 1: f'(x) = 4x − 4 = 4 (tangent gradient) → x = 2
Mark 2: y-value of tangency point: y = 4(2) − 14 = −6; point is (2 ; −6)
Mark 3: g(2) = −6: 4a + 2b − 18 = −6 → 4a + 2b = 12 ... (1)
Mark 4: g'(2) = 4: 4a + b = 4 ... (2)
Marks 5–6: Solve (1) − (2): b = 8; then 4a + 8 = 4 → a = −1`,
            topic: "Calculus",
          },
        ],
      },
      {
        number: 9,
        title: "Calculus: Cubic Functions",
        totalMarks: 18,
        subQuestions: [
          {
            id: "9-1",
            label: "9.1",
            questionText:
              "Given: $f(x) = x^3 - 6x^2 + 9x - 4 = (x-4)(x-k)^2$\n\nShow that $k = 1$.",
            marks: 2,
            memoText: `Mark scheme (2 marks):
Mark 1: Either test f(1) = 1 − 6 + 9 − 4 = 0 so (x−1) is a factor; OR compare constant terms: (−4)(k²) = −4 → k² = 1
Mark 2: k = 1`,
            topic: "Calculus",
          },
          {
            id: "9-2",
            label: "9.2",
            questionText:
              "Calculate the coordinates of the **turning points** of $f(x) = x^3 - 6x^2 + 9x - 4$.",
            marks: 4,
            memoText: `Mark scheme (4 marks):
Mark 1: f'(x) = 3x² − 12x + 9
Mark 2: Set f'(x) = 0: x² − 4x + 3 = 0 → (x−3)(x−1) = 0 → x = 3 or x = 1
Marks 3–4 (double mark): Turning points (3 ; −4) and (1 ; 0)`,
            topic: "Calculus",
          },
          {
            id: "9-3",
            label: "9.3",
            questionText:
              "Describe the **concavity** of $f(x) = x^3 - 6x^2 + 9x - 4$ at $x = -3$.",
            marks: 2,
            memoText: `Mark scheme (2 marks):
Mark 1: f''(x) = 6x − 12; substitute x = −3: f''(−3) = −18 − 12 = −30
Mark 2: f''(−3) < 0, therefore the graph is concave down at x = −3`,
            topic: "Calculus",
          },
          {
            id: "9-4",
            label: "9.4",
            questionText:
              "Draw the graph of $f(x) = x^3 - 6x^2 + 9x - 4$. Label ALL turning points and intercepts with the axes.",
            marks: 4,
            memoText: `Mark scheme (4 marks):
Mark 1: Both turning points plotted: (1 ; 0) and (3 ; −4)
Mark 2: x-intercepts: x = 1 (double root — graph touches axis) and x = 4
Mark 3: y-intercept: f(0) = −4; point (0 ; −4)
Mark 4: Correct cubic shape starting bottom-left, rising to touch (1;0), dipping to (3;−4), then rising through (4;0)`,
            topic: "Calculus",
          },
          {
            id: "9-5",
            label: "9.5",
            questionText:
              "Calculate the **maximum vertical distance** between $f$ and $h$ for $1 < x < 3$, if $h(x) = -2f'(x)$.",
            marks: 6,
            memoText: `Mark scheme (6 marks):
Mark 1: h(x) = −2f'(x) = −2(3x²−12x+9) = −6x²+24x−18
Mark 2: Distance D(x) = h(x) − f(x) = (−6x²+24x−18) − (x³−6x²+9x−4); simplify to D(x) = −x³ + 15x − 14
Mark 3: D'(x) = −3x² + 15 = 0 → x² = 5 → x = ±√5
Mark 4: Select x = √5 ≈ 2.24 (since 1 < √5 < 3)
Mark 5: D(√5) = −(√5)³ + 15√5 − 14 = −5√5 + 15√5 − 14 = 10√5 − 14
Mark 6: Maximum distance ≈ 8.36`,
            topic: "Calculus",
          },
        ],
      },
      {
        number: 10,
        title: "Probability",
        totalMarks: 8,
        subQuestions: [
          {
            id: "10-1",
            label: "10.1",
            questionText:
              "A and B are **mutually exclusive** events. $P(A) = 0.42$ and $P(A \\text{ or } B) = 0.79$. Calculate $P(B)$.",
            marks: 2,
            memoText: `Mark scheme (2 marks):
Mark 1: P(A or B) = P(A) + P(B) for mutually exclusive events; correct substitution: 0.79 = 0.42 + P(B)
Mark 2: P(B) = 0.37`,
            topic: "Probability",
          },
          {
            id: "10-2",
            label: "10.2",
            questionText:
              "A game requires a player to roll a six-sided die **and** draw a card from a deck of 52 cards. A player wins if an odd number appears on the die AND the card drawn is a picture card (king, queen, jack or ace — 4 per suit × 4 suits = 16 picture cards total).\n\n260 people each pay R10 to play. The owner wants to make a **70% profit** per hour. Calculate the maximum amount the owner must pay out to **each winner**.",
            marks: 6,
            memoText: `Mark scheme (6 marks):
Mark 1: Total collected = 260 × R10 = R2 600; 70% profit → pay-out pool = 30% × R2 600 = R780
Mark 2: P(odd on die) = 3/6 = 1/2
Mark 3: P(picture card) = 16/52
Mark 4: P(win) = 1/2 × 16/52 = 2/13
Mark 5: Expected winners = (2/13) × 260 = 40 winners
Mark 6: Pay-out per winner = R780 / 40 = R19.50`,
            topic: "Probability",
          },
        ],
      },
      {
        number: 11,
        title: "Counting Principles",
        totalMarks: 7,
        subQuestions: [
          {
            id: "11-1",
            label: "11.1",
            questionText:
              "Consider the three-digit numbers from 501 up to 999. How many of these numbers have **exactly one 5** in them?",
            marks: 4,
            memoText: `Mark scheme (4 marks):
Mark 1: Case 1 — 5 in hundreds digit (501–599, excluding those with another 5): 1×9×9 = 81; but 500 is out of range, so 80 valid numbers
Mark 2: Case 2 — 5 in tens digit (hundreds ∈ {6,7,8,9}, units ≠ 5): 4×1×9 = 36
Mark 3: Case 3 — 5 in units digit (hundreds ∈ {6,7,8,9}, tens ≠ 5): 4×9×1 = 36
Mark 4: Total = 80 + 36 + 36 = 152`,
            topic: "Counting",
          },
          {
            id: "11-2",
            label: "11.2",
            questionText:
              "Calculate the probability that a three-digit number chosen at random from 501 to 999 does **not** satisfy the condition in Question 11.1.",
            marks: 3,
            memoText: `Mark scheme (3 marks):
Mark 1: n(S) = 499 (numbers from 501 to 999 inclusive)
Mark 2: P(not satisfying) = 1 − P(satisfying) = 1 − 152/499
Mark 3: = 347/499 ≈ 0.70`,
            topic: "Counting",
          },
        ],
      },
    ],
  },
  {
    id: "math-p2-may-jun-2025",
    subject: "Mathematics",
    paperCode: "P2",
    year: 2025,
    session: "May/June",
    totalMarks: 150,
    durationHours: 3,
    infoSheet: { title: "Info Sheet", formulaSheetVariant: "standard" },
    questions: [
      {
        number: 1,
        title: "Statistics",
        totalMarks: 9,
        subQuestions: [
          {
            id: "p2-1-1",
            label: "1.1",
            questionText:
              "An insurance broker signed contracts with 15 people. The monthly premium (in rands) payable on each contract is:\n\n$$134 \\quad 215 \\quad 325 \\quad 326 \\quad 362 \\quad 429 \\quad 515 \\quad 531 \\quad 598 \\quad 610 \\quad 624 \\quad 728 \\quad 923 \\quad 1\\,034 \\quad 1\\,200$$\n\nCalculate the mean of the data.",
            marks: 2,
            memoText: `Mark scheme (2 marks):
Mark 1: Correct sum — 8 554
Mark 2: x̄ = 8 554 ÷ 15 = 570,27`,
            topic: "Statistics",
          },
          {
            id: "p2-1-2",
            label: "1.2",
            questionText: "Write down the standard deviation of the data.",
            marks: 1,
            memoText: `Mark scheme (1 mark):
Mark 1: σ = 291,03`,
            topic: "Statistics",
          },
          {
            id: "p2-1-3",
            label: "1.3",
            questionText:
              "Calculate how many monthly premiums are within **ONE standard deviation** of the mean.",
            marks: 2,
            memoText: `Mark scheme (2 marks):
Mark 1: Correct interval (x̄ − σ ; x̄ + σ) = (279,24 ; 861,30)
Mark 2: 10 premiums fall within this interval (325, 326, 362, 429, 515, 531, 598, 610, 624, 728)`,
            topic: "Statistics",
          },
          {
            id: "p2-1-4",
            label: "1.4",
            questionText:
              "The insurance company decided to increase the monthly premiums:\n- Monthly premiums **less than R500** increased by **18%**\n- Monthly premiums **equal to or more than R500** increased by **$k$%**\n\nAfter these increases, the new mean monthly premium was **R686,44**. Calculate the value of $k$.",
            marks: 4,
            memoText: `Mark scheme (4 marks):
Mark 1: Identify premiums < R500: 134, 215, 325, 326, 362, 429 → sum = 1 791; multiply by 118/100
Mark 2: Identify premiums ≥ R500: 515, 531, 598, 610, 624, 728, 923, 1 034, 1 200 → sum = 6 763; multiply by (k+100)/100
Mark 3: Set up equation: [1 791 × 118/100 + 6 763 × (k+100)/100] ÷ 15 = 686,44 → 6 763 × (k+100)/100 = 8 183,22
Mark 4: k = 21%`,
            topic: "Statistics",
          },
        ],
      },
      {
        number: 2,
        title: "Regression & Correlation",
        totalMarks: 10,
        subQuestions: [
          {
            id: "p2-2-1",
            label: "2.1",
            questionText:
              "A supermarket surveyed 10 online orders. The number of items ($x$) and packing time in minutes ($y$) are:\n\n| $x$ | 10 | 3 | 20 | 14 | 17 | 9 | 12 | 18 | 15 | 19 |\n|---|---|---|---|---|---|---|---|---|---|---|\n| $y$ | 5 | 5 | 9 | 7 | 6 | 6 | 8 | 11 | 10 | 12 |\n\nDraw a scatter plot for this data.",
            marks: 3,
            memoText: `Mark scheme (3 marks):
Mark 1: At least 3 points plotted correctly
Mark 2: At least 6 points plotted correctly
Mark 3: All 10 points plotted correctly`,
            topic: "Statistics",
          },
          {
            id: "p2-2-2",
            label: "2.2",
            questionText: "Determine the equation of the least squares regression line.",
            marks: 3,
            memoText: `Mark scheme (3 marks):
Mark 1: a = 3,08 (correct y-intercept)
Mark 2: b = 0,35 (correct gradient)
Mark 3: ŷ = 3,08 + 0,35x`,
            topic: "Statistics",
          },
          {
            id: "p2-2-3",
            label: "2.3",
            questionText: "Write down the correlation coefficient of the data.",
            marks: 1,
            memoText: `Mark scheme (1 mark):
Mark 1: r = 0,74`,
            topic: "Statistics",
          },
          {
            id: "p2-2-4",
            label: "2.4",
            questionText:
              "The supermarket received an online order for **13 items**. Predict how long (in minutes) it will take to pack the order.",
            marks: 2,
            memoText: `Mark scheme (2 marks):
Mark 1: Substitute x = 13 into regression equation: ŷ = 3,08 + 0,35(13)
Mark 2: ŷ = 7,63 minutes (calculator value: 7,65 also accepted)`,
            topic: "Statistics",
          },
          {
            id: "p2-2-5",
            label: "2.5",
            questionText:
              "Explain why the $y$-intercept of the least squares regression line in QUESTION 2.2 does **NOT** make sense in this context.",
            marks: 1,
            memoText: `Mark scheme (1 mark):
Mark 1: It implies packing 0 items takes 3,08 minutes, which does not make sense — you cannot pack 0 items.`,
            topic: "Statistics",
          },
        ],
      },
      {
        number: 3,
        title: "Analytical Geometry",
        totalMarks: 21,
        diagramUrl: "https://kmgnizvqkqkiulzgvkcb.supabase.co/storage/v1/object/public/matric-diagrams/math-p2-may-jun-2025_q3.png",
        subQuestions: [
          {
            id: "p2-3-1",
            label: "3.1",
            questionText:
              "In the diagram, $\\Delta SRT$ is drawn where $R$ lies on the $x$-axis and $S$ lies to the left of $R$. $T$ lies on the $y$-axis and the coordinates of $S$ are $(m\\,;\\,1)$. The equation of $RT$ is $2x - y + 10 = 0$.\n\nCalculate the coordinates of $R$.",
            marks: 2,
            memoText: `Mark scheme (2 marks):
Mark 1: Set y = 0: 2x + 10 = 0 → x = −5
Mark 2: R(−5 ; 0)`,
            topic: "Coordinate Geometry",
          },
          {
            id: "p2-3-2",
            label: "3.2",
            questionText: "Calculate the length of $RT$. Leave your answer in surd form.",
            marks: 3,
            memoText: `Mark scheme (3 marks):
Mark 1: Find T — set x = 0: y = 10, so T(0 ; 10)
Mark 2: Substitute R(−5 ; 0) and T(0 ; 10) into distance formula: RT² = (0−(−5))² + (10−0)² = 25 + 100 = 125
Mark 3: RT = √125 = 5√5 units`,
            topic: "Coordinate Geometry",
          },
          {
            id: "p2-3-3",
            label: "3.3",
            questionText:
              "If it is also given that $2RT^2 = 5SR^2$, calculate the value of $m$.",
            marks: 4,
            memoText: `Mark scheme (4 marks):
Mark 1: 2RT² = 2(125) = 250
Mark 2: SR² = (m−(−5))² + (1−0)² = (m+5)² + 1
Mark 3: 5[(m+5)² + 1] = 250 → (m+5)² = 49 → m+5 = ±7
Mark 4: m = 2 (N/A, S must be left of R so x < −5) or m = −12 ∴ m = −12`,
            topic: "Coordinate Geometry",
          },
          {
            id: "p2-3-4",
            label: "3.4",
            questionText:
              "V lies on $ST$ such that $VR \\perp ST$. Determine the equation of $VR$ in the form $y = mx + c$.",
            marks: 5,
            memoText: `Mark scheme (5 marks):
Mark 1: Use S(−12 ; 1) and T(0 ; 10) to find m_ST = (10−1)/(0−(−12)) = 9/12 = 3/4
Mark 2: m_VR = −1/m_ST = −4/3
Mark 3: Substitute R(−5 ; 0): 0 = −(4/3)(−5) + c → c = −20/3
Mark 4: y = −(4/3)x − 20/3
Mark 5: Equation correct in y = mx + c form`,
            topic: "Coordinate Geometry",
          },
          {
            id: "p2-3-5",
            label: "3.5",
            questionText:
              "Hence, show that the coordinates of $V$ are $(−8\\,;\\,4)$.",
            marks: 2,
            memoText: `Mark scheme (2 marks):
Mark 1: Equate VR and ST: (3/4)x + 10 = −(4/3)x − 20/3 → solve to get x = −8
Mark 2: Substitute x = −8 into ST: y = (3/4)(−8) + 10 = 4 ∴ V(−8 ; 4) ✓`,
            topic: "Coordinate Geometry",
          },
          {
            id: "p2-3-6",
            label: "3.6",
            questionText:
              "If $R'$ is the reflection of $R$ about the line $x = 0$, calculate the area of $RVTR'$.",
            marks: 5,
            memoText: `Mark scheme (5 marks):
Mark 1: R'(5 ; 0) [reflection of R(−5 ; 0) about x = 0]
Mark 2: VR = √[(−8−(−5))² + (4−0)²] = √(9+16) = 5 units
Mark 3: VT = √[(−8−0)² + (4−10)²] = √(64+36) = 10 units
Mark 4: Area ΔVRT = ½(5)(10) = 25 units²; Area ΔRTR' = ½ × RR' × OT = ½(10)(10) = 50 units²
Mark 5: Area RVTR' = 25 + 50 = 75 units²`,
            topic: "Coordinate Geometry",
          },
        ],
      },
      {
        number: 4,
        title: "Circles & Tangents",
        totalMarks: 20,
        diagramUrl: "https://kmgnizvqkqkiulzgvkcb.supabase.co/storage/v1/object/public/matric-diagrams/math-p2-may-jun-2025_q4.png",
        subQuestions: [
          {
            id: "p2-4-1",
            label: "4.1",
            questionText:
              "In the diagram, M is the centre of the circle with equation $(x-3)^2 + y^2 = 25$. $E(-1\\,;\\,3)$ and $T$ are points on the circle. $EC$ is a tangent to the circle at $E$ and cuts the $x$-axis at $D$. $ED = \\dfrac{15}{4}$ units. $MT$ is produced to meet the tangent at $C(-7\\,;\\,p)$.\n\nWrite down the size of $C\\hat{E}M$.",
            marks: 1,
            memoText: `Mark scheme (1 mark):
Mark 1: CÊM = 90° (tangent is perpendicular to radius at point of contact)`,
            topic: "Coordinate Geometry",
          },
          {
            id: "p2-4-2",
            label: "4.2",
            questionText:
              "Determine the equation of the tangent $EC$ in the form $y = mx + c$.",
            marks: 4,
            memoText: `Mark scheme (4 marks):
Mark 1: M(3 ; 0), so m_ME = (0−3)/(3−(−1)) = −3/4
Mark 2: m_ED = 4/3 (tangent ⊥ radius)
Mark 3: Substitute E(−1 ; 3): 3 = (4/3)(−1) + c → c = 13/3
Mark 4: y = (4/3)x + 13/3`,
            topic: "Coordinate Geometry",
          },
          {
            id: "p2-4-3",
            label: "4.3",
            questionText: "Calculate the length of $DM$.",
            marks: 3,
            memoText: `Mark scheme (3 marks):
Mark 1: Find D — set y = 0 in tangent equation: 0 = (4/3)x + 13/3 → x = −13/4, so D(−13/4 ; 0)
Mark 2: DM = x_M − x_D = 3 − (−13/4) = 25/4
Mark 3: DM = 25/4 or 6,25 units`,
            topic: "Coordinate Geometry",
          },
          {
            id: "p2-4-4",
            label: "4.4",
            questionText: "Show that $p = -5$.",
            marks: 1,
            memoText: `Mark scheme (1 mark):
Mark 1: Substitute C(−7 ; p) into tangent equation: p = (4/3)(−7) + 13/3 = −28/3 + 13/3 = −15/3 = −5 ✓`,
            topic: "Coordinate Geometry",
          },
          {
            id: "p2-4-5",
            label: "4.5",
            questionText:
              "Calculate the coordinates of $S$ if $SEMC$ is a parallelogram and $x_S < 0$.",
            marks: 3,
            memoText: `Mark scheme (3 marks):
Mark 1: Use translation method — M→E: (x;y)→(x−4;y+3), apply to C(−7;−5): S(−11;−2)
OR midpoint method: midpoint of EC = midpoint of SM → S(−11;−2)
Mark 2: x_S = −11
Mark 3: y_S = −2 ∴ S(−11;−2)`,
            topic: "Coordinate Geometry",
          },
          {
            id: "p2-4-6",
            label: "4.6",
            questionText:
              "If the radius of the circle centred at M is increased by 7 units, determine whether $S$ lies inside or outside the new circle. Support your answer with calculations.",
            marks: 3,
            memoText: `Mark scheme (3 marks):
Mark 1: New radius = 5 + 7 = 12 units
Mark 2: MS = √[(3−(−11))² + (0−(−2))²] = √(196+4) = √200 = 10√2 ≈ 14,14 units
Mark 3: 14,14 > 12 ∴ S lies OUTSIDE the new circle`,
            topic: "Coordinate Geometry",
          },
          {
            id: "p2-4-7",
            label: "4.7",
            questionText: "If $ET$ is drawn, calculate the size of $E\\hat{T}M$.",
            marks: 5,
            memoText: `Mark scheme (5 marks):
Mark 1: Inclination of EM: tan(angle) = m_ME = −3/4 → ref angle = 36,87° → inclination of EM = 143,13°
Mark 2: EÎD = 180° − 143,13° = 36,87° (or use m_ME directly)
Mark 3: Inclination of CM: m_CM = (0−(−5))/(3−(−7)) = 5/10 = 1/2 → angle = 26,57°
Mark 4: EÎM = 26,57° + 36,87° = 63,44°
Mark 5: EM = MT (radii) → EÎM = EÎM is isosceles → EÎM = (180° − 63,44°)/2 = 58,28°`,
            topic: "Coordinate Geometry",
          },
        ],
      },
      {
        number: 5,
        title: "Trigonometry",
        totalMarks: 19,
        subQuestions: [
          {
            id: "p2-5-1-1",
            label: "5.1.1",
            questionText:
              "If $\\cos\\theta = -\\dfrac{5}{13}$ where $180° < \\theta < 360°$, determine **without using a calculator** the value of:\n\n$$\\sin^2\\theta$$",
            marks: 3,
            memoText: `Mark scheme (3 marks):
Mark 1: θ in third quadrant (cos negative, 180°<θ<360°) → y = −12 [Pythagoras: y² = 13² − 5² = 144]
Mark 2: sin θ = −12/13 (negative in Q3)
Mark 3: sin²θ = 144/169`,
            topic: "Trigonometry",
          },
          {
            id: "p2-5-1-2",
            label: "5.1.2",
            questionText:
              "If $\\cos\\theta = -\\dfrac{5}{13}$ where $180° < \\theta < 360°$, determine **without using a calculator**:\n\n$$\\tan(360° - \\theta)$$",
            marks: 2,
            memoText: `Mark scheme (2 marks):
Mark 1: tan(360°−θ) = −tan θ
Mark 2: = −(−12/13 ÷ −5/13) = −(12/5) = −12/5`,
            topic: "Trigonometry",
          },
          {
            id: "p2-5-1-3",
            label: "5.1.3",
            questionText:
              "If $\\cos\\theta = -\\dfrac{5}{13}$ where $180° < \\theta < 360°$, determine **without using a calculator**:\n\n$$\\cos(\\theta - 135°)$$",
            marks: 4,
            memoText: `Mark scheme (4 marks):
Mark 1: Expand using compound angle: cos θ cos135° + sin θ sin135°
Mark 2: Reduce: cos135° = −cos45° = −√2/2; sin135° = sin45° = √2/2
Mark 3: Substitute: (−5/13)(−√2/2) + (−12/13)(√2/2) = 5√2/26 − 12√2/26
Mark 4: = −7√2/26`,
            topic: "Trigonometry",
          },
          {
            id: "p2-5-2",
            label: "5.2",
            questionText:
              "Simplify the following expression to a single trigonometric term:\n\n$$\\dfrac{2\\cos(180° - x)\\sin(-x)}{1 - 2\\cos^2(90° - x)}$$",
            marks: 6,
            memoText: `Mark scheme (6 marks):
Mark 1: cos(180°−x) = −cos x
Mark 2: sin(−x) = −sin x
Mark 3: cos²(90°−x) = sin²x
Mark 4: Numerator = 2(−cos x)(−sin x) = 2sin x cos x
Mark 5: Denominator = 1 − 2sin²x = cos 2x
Mark 6: = sin 2x / cos 2x = tan 2x`,
            topic: "Trigonometry",
          },
          {
            id: "p2-5-3",
            label: "5.3",
            questionText:
              "Calculate the value of the following expression **without using a calculator**:\n\n$$(\\tan 92°)(\\tan 94°)(\\tan 96°)\\cdots(\\tan 176°)(\\tan 178°)$$",
            marks: 4,
            memoText: `Mark scheme (4 marks):
Mark 1: Use quotient identity: tan x = sin x / cos x and co-ratio tan(180°−x) = −tan x; tan(90°+x) = −cot x
Mark 2: Pair each factor: tan(92°)·tan(88°) is not directly available — instead use tan(180°−x): tan(92°) = −tan(88°)·...
OR: Convert using sin/cos, apply co-ratios (cos2° = sin88°, etc.) to get paired products each equal to −1...
Actually: use co-ratios: tan(90°+x) = −cot x, so tan92° = −cot2°, tan94° = −cot4°...tan178° = −cot2°...
The product pairs as (−cot2°)(tan2°)×... each pair = −1; there are 44 terms → product = 1
Mark 3: Each paired product simplifies to 1 (tan x · co-ratio cancels)
Mark 4: Answer = 1`,
            topic: "Trigonometry",
          },
        ],
      },
      {
        number: 6,
        title: "Trigonometry: Proofs & Equations",
        totalMarks: 13,
        subQuestions: [
          {
            id: "p2-6-1",
            label: "6.1",
            questionText:
              "Prove that $2\\cos^2(45° + x) = 1 - \\sin 2x$.",
            marks: 4,
            memoText: `Mark scheme (4 marks):
Mark 1: Use double angle: 2cos²(45°+x) = cos[2(45°+x)] + 1 → write as cos(90°+2x) + 1
Mark 2: cos(90°+2x) = −sin 2x
Mark 3: = −sin 2x + 1 = 1 − sin 2x
Mark 4: = RHS ✓`,
            topic: "Trigonometry",
          },
          {
            id: "p2-6-2-1",
            label: "6.2.1",
            questionText:
              "Prove that $\\sin(A - B) - \\sin(A + B) = -2\\cos A \\sin B$.",
            marks: 2,
            memoText: `Mark scheme (2 marks):
Mark 1: LHS = (sin A cos B − cos A sin B) − (sin A cos B + cos A sin B) = sin A cos B − cos A sin B − sin A cos B − cos A sin B
Mark 2: = −2cos A sin B = RHS ✓`,
            topic: "Trigonometry",
          },
          {
            id: "p2-6-2-2",
            label: "6.2.2",
            questionText:
              "Using the result of 6.2.1, simplify the following expression to a single term:\n\n$$\\sin 4x - \\sin 10x$$",
            marks: 2,
            memoText: `Mark scheme (2 marks):
Mark 1: Write as sin(7x − 3x) − sin(7x + 3x): A = 7x, B = 3x
Mark 2: = −2cos 7x sin 3x`,
            topic: "Trigonometry",
          },
          {
            id: "p2-6-2-3",
            label: "6.2.3",
            questionText:
              "Hence, determine the solution for $\\sin 4x - \\sin 10x = \\sin 3x$ for $x \\in [0°\\,;\\,30°]$.",
            marks: 5,
            memoText: `Mark scheme (5 marks):
Mark 1: Substitute result: −2cos 7x sin 3x = sin 3x
Mark 2: 2cos 7x sin 3x + sin 3x = 0 → sin 3x(2cos 7x + 1) = 0
Mark 3: sin 3x = 0 → 3x = 0° → x = 0° (only solution in [0°;30°])
Mark 4: cos 7x = −1/2 → 7x = 120° → x = 17,14°
Mark 5: 7x = 240° → x = 34,29° (outside [0°;30°], N/A) ∴ x = 0° or x = 17,14°`,
            topic: "Trigonometry",
          },
        ],
      },
      {
        number: 7,
        title: "Trigonometric Graphs",
        totalMarks: 10,
        diagramUrl: "https://kmgnizvqkqkiulzgvkcb.supabase.co/storage/v1/object/public/matric-diagrams/math-p2-may-jun-2025_q7.png",
        subQuestions: [
          {
            id: "p2-7-1",
            label: "7.1",
            questionText:
              "In the diagram, the graphs of $f(x) = 2\\cos x + 1$ and $g(x) = \\sin 2x$ are drawn for the interval $x \\in [-180°\\,;\\,180°]$.\n\nWrite down the range of $f$.",
            marks: 1,
            memoText: `Mark scheme (1 mark):
Mark 1: y ∈ [−1 ; 3] or −1 ≤ y ≤ 3`,
            topic: "Trigonometry",
          },
          {
            id: "p2-7-2",
            label: "7.2",
            questionText: "Write down the period of $g$.",
            marks: 1,
            memoText: `Mark scheme (1 mark):
Mark 1: Period = 180°`,
            topic: "Trigonometry",
          },
          {
            id: "p2-7-3",
            label: "7.3",
            questionText:
              "For which values of $x$, in the interval $x \\in [-180°\\,;\\,180°]$, is $f$ increasing?",
            marks: 1,
            memoText: `Mark scheme (1 mark):
Mark 1: x ∈ (−180° ; 0°) or −180° < x < 0°`,
            topic: "Trigonometry",
          },
          {
            id: "p2-7-4-1",
            label: "7.4.1",
            questionText:
              "Use the graphs to determine the values of $x$, in the interval $x \\in [-180°\\,;\\,180°]$, for which:\n\n$$g(x) \\cdot f'(x) < 0$$",
            marks: 2,
            memoText: `Mark scheme (2 marks):
Mark 1: x ∈ (−90° ; 0°)
Mark 2: x ∈ (0° ; 90°)
[f'(x) = −2sinx < 0 when sinx > 0 i.e. x ∈ (0°;180°); g(x) > 0 for x ∈ (0°;90°) → product negative for x ∈ (0°;90°). g(x) < 0 for x ∈ (−90°;0°) and f'(x) > 0 for x ∈ (−180°;0°) → product negative for x ∈ (−90°;0°)]`,
            topic: "Trigonometry",
          },
          {
            id: "p2-7-4-2",
            label: "7.4.2",
            questionText:
              "Use the graphs to determine the values of $x$, in the interval $x \\in [-180°\\,;\\,180°]$, for which:\n\n$$\\cos x \\leq -\\dfrac{1}{2}$$",
            marks: 3,
            memoText: `Mark scheme (3 marks):
Mark 1: Rewrite: 2cos x + 1 ≤ 0 i.e. f(x) ≤ 0
Mark 2: x ∈ [−180° ; −120°]
Mark 3: x ∈ [120° ; 180°]`,
            topic: "Trigonometry",
          },
          {
            id: "p2-7-5",
            label: "7.5",
            questionText:
              "Graph $g$ is shifted $45°$ to the right to obtain a new graph $h$. Determine the equation of $h$ in its simplest form.",
            marks: 2,
            memoText: `Mark scheme (2 marks):
Mark 1: h(x) = sin 2(x − 45°) = sin(2x − 90°)
Mark 2: = −cos 2x`,
            topic: "Trigonometry",
          },
        ],
      },
      {
        number: 8,
        title: "3D Trigonometry",
        totalMarks: 8,
        diagramUrl: "https://kmgnizvqkqkiulzgvkcb.supabase.co/storage/v1/object/public/matric-diagrams/math-p2-may-jun-2025_q8.png",
        subQuestions: [
          {
            id: "p2-8-1",
            label: "8.1",
            questionText:
              "In the diagram, A, B and C lie in the same horizontal plane with $AB = AC$. D is directly above A such that $2AD = BC$. Also, $AD = p$, $A\\hat{B}C = x$ and $D\\hat{B}A = y$.\n\nDetermine $AB$ in terms of $p$ and $y$.",
            marks: 2,
            memoText: `Mark scheme (2 marks):
Mark 1: In right-angled triangle DAB: tan y = AD/AB = p/AB
Mark 2: AB = p/tan y`,
            topic: "Trigonometry",
          },
          {
            id: "p2-8-2",
            label: "8.2",
            questionText: "Show that $\\cos x = \\tan y$.",
            marks: 4,
            memoText: `Mark scheme (4 marks):
Mark 1: In ΔBAC, use sine rule: BC/sin(BÂC) = AB/sin(AĈB)
   BC = 2p, AB = p/tan y; BÂC = 180°−2x (since AB=AC, triangle is isosceles)
Mark 2: Substitute and simplify: sin(180°−2x)/(2p) = sin x/(p/tan y)
Mark 3: sin 2x / (2p) = sin x · tan y / p → 2sin x cos x / (2p) = sin x · tan y / p
Mark 4: Cancel sin x: cos x = tan y ✓`,
            topic: "Trigonometry",
          },
          {
            id: "p2-8-3",
            label: "8.3",
            questionText: "If $x = 60°$, calculate the size of $y$.",
            marks: 2,
            memoText: `Mark scheme (2 marks):
Mark 1: cos 60° = tan y → tan y = 0,5
Mark 2: y = 26,57°`,
            topic: "Trigonometry",
          },
        ],
      },
      {
        number: 9,
        title: "Euclidean Geometry",
        totalMarks: 20,
        subQuestions: [
          {
            id: "p2-9-1-1",
            label: "9.1.1",
            questionText:
              "In the diagram, $\\Delta DEF$ is drawn. Line $GH$ intersects $DF$ and $EF$ at $G$ and $H$ respectively such that $GH \\parallel DE$ and $\\dfrac{GF}{DG} = \\dfrac{2}{5}$.\n\nWrite down, with a reason, the value of $\\dfrac{HF}{EH}$.",
            marks: 2,
            memoText: `Mark scheme (2 marks):
Mark 1 (S): HF/EH = GF/DG = 2/5
Mark 2 (R): Line parallel to one side of a triangle divides the other two sides proportionally (Proportion theorem)`,
            topic: "Euclidean Geometry",
            diagramUrl: "https://kmgnizvqkqkiulzgvkcb.supabase.co/storage/v1/object/public/matric-diagrams/math-p2-may-jun-2025_q9.png",
          },
          {
            id: "p2-9-1-2",
            label: "9.1.2",
            questionText: "If $EF = 21$ cm, calculate the length of $EH$.",
            marks: 2,
            memoText: `Mark scheme (2 marks):
Mark 1: EH/EF = DG/DF = 5/7 (since DG/GF = 5/2, so DG/DF = 5/7)
Mark 2: EH/21 = 5/7 → EH = 15 cm`,
            topic: "Euclidean Geometry",
            diagramUrl: "https://kmgnizvqkqkiulzgvkcb.supabase.co/storage/v1/object/public/matric-diagrams/math-p2-may-jun-2025_q9.png",
          },
          {
            id: "p2-9-1-3",
            label: "9.1.3",
            questionText:
              "Write down a triangle which is similar to $\\Delta FGH$.",
            marks: 1,
            memoText: `Mark scheme (1 mark):
Mark 1: ΔFGH ||| ΔFDE [equal angles — all three angles equal]`,
            topic: "Euclidean Geometry",
            diagramUrl: "https://kmgnizvqkqkiulzgvkcb.supabase.co/storage/v1/object/public/matric-diagrams/math-p2-may-jun-2025_q9.png",
          },
          {
            id: "p2-9-1-4",
            label: "9.1.4",
            questionText:
              "Hence, calculate the value of $\\dfrac{GH}{DE}$.",
            marks: 2,
            memoText: `Mark scheme (2 marks):
Mark 1: From ΔFGH ||| ΔFDE: GH/DE = FH/FE = FG/FD [similar triangles]
Mark 2: GH/DE = 2/7`,
            topic: "Euclidean Geometry",
            diagramUrl: "https://kmgnizvqkqkiulzgvkcb.supabase.co/storage/v1/object/public/matric-diagrams/math-p2-may-jun-2025_q9.png",
          },
          {
            id: "p2-9-2-1",
            label: "9.2.1",
            questionText:
              "In the diagram, $POL$ is a diameter of the larger circle with centre $O$. $TMR$ is a diameter of the smaller circle with centre $M$. The two circles intersect at $L$ and $R$. $PLK$ is a tangent to the smaller circle at $L$ and $TR$ is a tangent to the larger circle at $R$. $OM$ intersects the smaller circle at $N$. Straight lines $LT$, $LR$, $LN$ and $PR$ are drawn.\n\nProve, giving reasons, that $LT \\parallel PR$.",
            marks: 4,
            memoText: `Mark scheme (4 marks):
Mark 1 (S): L̂₂ = 90° [∠ in semi-circle, POL is diameter of larger circle] OR L̂₁ = R̂₁ [tan-chord theorem, PLK tangent to small circle]
Mark 2 (S/R): R̂₂ = 90° [∠ in semi-circle, POL is diameter] → L̂₂ = R̂₂
OR L̂₁ = P̂ [tan-chord theorem]
Mark 3 (R): ∴ LT ∥ PR [alt ∠s equal] or [corresp ∠s equal]
Mark 4: Reason clearly stated`,
            topic: "Euclidean Geometry",
            diagramUrl: "https://kmgnizvqkqkiulzgvkcb.supabase.co/storage/v1/object/public/matric-diagrams/math-p2-may-jun-2025_q9.2.png",
          },
          {
            id: "p2-9-2-2",
            label: "9.2.2",
            questionText:
              "Prove, giving reasons, that $LORM$ is a cyclic quadrilateral, if it is also given that $LT \\parallel OM$.",
            marks: 5,
            memoText: `Mark scheme (5 marks):
Mark 1 (S/R): L̂₁ = R̂₁ [tan-chord theorem, PLK tangent to small circle]
Mark 2 (S/R): L̂₁ = Ô₁ [corresp ∠s; LT ∥ OM]
Mark 3 (S): ∴ R̂₁ = Ô₁
Mark 4 (S): ∴ L, O, R, M are concyclic
Mark 5 (R): LORM is a cyclic quadrilateral [converse ∠s in same segment]`,
            topic: "Euclidean Geometry",
            diagramUrl: "https://kmgnizvqkqkiulzgvkcb.supabase.co/storage/v1/object/public/matric-diagrams/math-p2-may-jun-2025_q9.2.png",
          },
          {
            id: "p2-9-2-3",
            label: "9.2.3",
            questionText: "Prove, giving reasons, that $LN$ bisects $O\\hat{L}R$.",
            marks: 4,
            memoText: `Mark scheme (4 marks):
Mark 1 (S/R): OL̂R = M̂₁ [∠s in same segment, cyclic quad LORM]
Mark 2 (S/R): 2L̂₃ = M̂₁ [∠ at centre = 2 × ∠ at circumference; OM intersects small circle at N, MN is radius]
Mark 3 (S): ∴ OL̂R = 2L̂₃
Mark 4 (S): ∴ L̂₄ = L̂₃ → LN bisects OL̂R ✓`,
            topic: "Euclidean Geometry",
            diagramUrl: "https://kmgnizvqkqkiulzgvkcb.supabase.co/storage/v1/object/public/matric-diagrams/math-p2-may-jun-2025_q9.2.png",
          },
        ],
      },
      {
        number: 10,
        title: "Euclidean Geometry: Proofs",
        totalMarks: 20,
        subQuestions: [
          {
            id: "p2-10-1",
            label: "10.1",
            questionText:
              "In the diagram, $\\Delta ABC$ and $\\Delta PKL$ are drawn such that $\\hat{A} = \\hat{P}$, $\\hat{B} = \\hat{K}$ and $\\hat{C} = \\hat{L}$.\n\nUse the diagram to **prove the theorem** which states that if two triangles are equiangular, then corresponding sides are in proportion:\n$$\\dfrac{AB}{PK} = \\dfrac{AC}{PL}$$",
            marks: 6,
            memoText: `Mark scheme (6 marks):
Mark 1: Construction — draw MN on AB and AC such that AM = PK and AN = PL
Mark 2 (S/R): In ΔAMN and ΔPKL: Â = P̂ [given]; AM = PK [construction]; AN = PL [construction] → ΔAMN ≡ ΔPKL [SAS]
Mark 3 (S): ∴ M̂₁ = K̂ [≡ triangles]
Mark 4 (S): But B̂ = K̂ [given] ∴ M̂₁ = B̂
Mark 5 (S/R): ∴ MN ∥ BC [corresp ∠s equal]
Mark 6 (S/R): ∴ AB/AM = AC/AN [line ∥ to one side of triangle] → AB/PK = AC/PL ✓`,
            topic: "Euclidean Geometry",
            diagramUrl: "https://kmgnizvqkqkiulzgvkcb.supabase.co/storage/v1/object/public/matric-diagrams/math-p2-may-jun-2025_q10.png",
          },
          {
            id: "p2-10-2-1",
            label: "10.2.1",
            questionText:
              "In the diagram, O is the centre of the circle. Points D and B lie on the circle. Points A and C lie outside the circle such that side AC of $\\Delta ADC$ passes through B. F is a point on BC such that $FO \\parallel BD$. $DR = RB$ and $RO$ is drawn.\n\nProve, with reasons, that $\\Delta CFO \\parallel\\!\\!\\!\\parallel \\Delta CBD$.",
            marks: 3,
            memoText: `Mark scheme (3 marks):
Mark 1 (S): Ĉ = Ĉ [common angle]
Mark 2 (S/R): CF̂O = CB̂D [corresp ∠s; FO ∥ BD]
Mark 3 (S/R): ∴ ΔCFO ||| ΔCBD [∠∠∠]`,
            topic: "Euclidean Geometry",
            diagramUrl: "https://kmgnizvqkqkiulzgvkcb.supabase.co/storage/v1/object/public/matric-diagrams/math-p2-may-jun-2025_q10.2.png",
          },
          {
            id: "p2-10-2-2",
            label: "10.2.2",
            questionText:
              "If it is given that $R\\hat{D}O = F\\hat{C}O$, show, with reasons, that $OF \\cdot CD = CO \\cdot BC$.",
            marks: 2,
            memoText: `Mark scheme (2 marks):
Mark 1 (S/R): From ΔCFO ||| ΔCBD: FO/BD = CO/CD [||| triangles] → FO·CD = CO·BD
Mark 2 (S/R): RD̂O = FĈO [given] → BD = BC [sides opp equal ∠s in ΔCBD] ∴ OF·CD = CO·BC ✓`,
            topic: "Euclidean Geometry",
            diagramUrl: "https://kmgnizvqkqkiulzgvkcb.supabase.co/storage/v1/object/public/matric-diagrams/math-p2-may-jun-2025_q10.2.png",
          },
          {
            id: "p2-10-2-3",
            label: "10.2.3",
            questionText:
              "It is further given that $DC = 19{,}2$ units, $BD = 12$ units and $\\dfrac{RO}{RD} = \\dfrac{3}{4}$.\n\nProve, with reasons, that $BF = \\dfrac{75}{16}$.",
            marks: 6,
            memoText: `Mark scheme (6 marks):
Mark 1 (S): RD = 6 units [DR = RB, BD = 12 → RD = 6]
Mark 2 (S/R): RO/RD = 3/4 → RO = (3/4)(6) = 4,5 units
Mark 3 (S/R): OR ⊥ BD [line from centre to midpoint of chord] → DO = √(6² + 4,5²) = √(36 + 20,25) = √56,25 = 7,5 units [Pythagoras]
Mark 4 (S/R): BF/BC = DO/DC [FO ∥ BD, prop theorem]
Mark 5 (S): BC = BD = 12 units [sides opp equal ∠s; from 10.2.2]
Mark 6 (S): BF/12 = 7,5/19,2 → BF = 7,5 × 12/19,2 = 75/16 ✓`,
            topic: "Euclidean Geometry",
            diagramUrl: "https://kmgnizvqkqkiulzgvkcb.supabase.co/storage/v1/object/public/matric-diagrams/math-p2-may-jun-2025_q10.2.png",
          },
          {
            id: "p2-10-2-4",
            label: "10.2.4",
            questionText: "Calculate the size of $A\\hat{B}D$.",
            marks: 3,
            memoText: `Mark scheme (3 marks):
Mark 1: tan RD̂O = RO/RD = 4,5/6 = 3/4 → RD̂O = 36,87°
Mark 2: FĈO = RD̂O = 36,87° [given]
Mark 3: AÂD = 180° − 2(36,87°)...
OR use cosine rule in ΔDBC: cos DB̂C = (12²+12²−19,2²)/(2×12×12) = (144+144−368,64)/288 = −80,64/288 = −7/25
DB̂C = 106,26° → AB̂D = 180° − 106,26° = 73,74°`,
            topic: "Euclidean Geometry",
            diagramUrl: "https://kmgnizvqkqkiulzgvkcb.supabase.co/storage/v1/object/public/matric-diagrams/math-p2-may-jun-2025_q10.2.png",
          },
        ],
      },
    ],
  },
  // ─────────────────────────────────────────────────────────────────────────────
  // Physical Sciences P1 — May/June 2025
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: "phys-sci-p1-may-jun-2025",
    subject: "Physical Science",
    paperCode: "P1",
    year: 2025,
    session: "May/June",
    totalMarks: 150,
    durationHours: 3,
    infoSheet: {
      title: "Data Sheet",
      formulaSheetVariant: "physics-p1",
    },
    questions: [
      // ── QUESTION 1 — Multiple Choice (20 marks) ──────────────────────────────
      {
        number: 1,
        title: "Multiple Choice",
        totalMarks: 20,
        subQuestions: [
          {
            id: "phys-p1-1-1",
            label: "1.1",
            type: "mcq",
            questionText:
              "Three forces P, Q and R act on an object. The object is in EQUILIBRIUM. Which ONE of the following vector diagrams CORRECTLY represents the three forces?\n\n*(Refer to the four vector diagrams labelled A–D in the original question paper.)*",
            marks: 2,
            options: {
              A: "Diagram A — open triangle; forces do not form a closed loop",
              B: "Diagram B — forces arranged head-to-tail but not closing back to start",
              C: "Diagram C — forces not drawn to the same scale",
              D: "Diagram D — forces form a closed triangle (head-to-tail, returning to start point)",
            },
            memoText: `Correct answer: D (2 marks)\nFor equilibrium, the vector sum of all forces = 0. The three vectors must form a CLOSED triangle when drawn head-to-tail.`,
            topic: "Newton's Laws",
          },
          {
            id: "phys-p1-1-2",
            label: "1.2",
            type: "mcq",
            questionText:
              "The gravitational force between two objects X and Y is F. The mass of object X is DOUBLED and the distance between X and Y is also DOUBLED. What is the new gravitational force between X and Y?",
            marks: 2,
            options: {
              A: "½F",
              B: "F",
              C: "2F",
              D: "4F",
            },
            memoText: `Correct answer: A (2 marks)\nF = Gm₁m₂/r²\nNew force = G(2m₁)m₂/(2r)² = 2Gm₁m₂/4r² = ½ · Gm₁m₂/r² = ½F`,
            topic: "Gravitation",
          },
          {
            id: "phys-p1-1-3",
            label: "1.3",
            type: "mcq",
            questionText:
              "A ball is projected vertically upward from the ground. A velocity-time (v-t) graph is drawn for the motion of the ball.\n\nAt which point on the graph does the ball reach its GREATEST HEIGHT?\n\n*(Refer to the v-t graph in the original question paper showing points A, B, C and D.)*",
            marks: 2,
            options: {
              A: "Point A — at the moment of projection (maximum upward velocity)",
              B: "Point B — where the graph crosses the time axis (velocity = 0)",
              C: "Point C — midway between projection and landing",
              D: "Point D — at the moment the ball hits the ground again",
            },
            memoText: `Correct answer: B (2 marks)\nThe ball reaches its greatest height when its velocity = 0 (momentarily at rest). On the v-t graph, this is the point where the line crosses the time axis.`,
            topic: "Vertical Projectile Motion",
          },
          {
            id: "phys-p1-1-4",
            label: "1.4",
            type: "mcq",
            questionText:
              "Trolley A collides with stationary trolley B and the two trolleys STICK TOGETHER after the collision. Which ONE of the following statements about this collision is CORRECT?",
            marks: 2,
            options: {
              A: "Kinetic energy is conserved but linear momentum is not conserved.",
              B: "Both kinetic energy and linear momentum are conserved.",
              C: "Neither kinetic energy nor linear momentum is conserved.",
              D: "Linear momentum is conserved but kinetic energy is not conserved.",
            },
            memoText: `Correct answer: D (2 marks)\nWhen two objects stick together it is a perfectly inelastic collision. In any collision in an isolated system, linear momentum IS conserved. However, kinetic energy is NOT conserved in an inelastic collision — some is converted to heat/sound/deformation.`,
            topic: "Momentum and Impulse",
          },
          {
            id: "phys-p1-1-5",
            label: "1.5",
            type: "mcq",
            questionText:
              "Engine P has a greater maximum power output than engine Q. Both engines operate at their maximum power for the SAME time interval. Which ONE of the following statements is CORRECT?",
            marks: 2,
            options: {
              A: "P does less work than Q.",
              B: "P does the same amount of work as Q.",
              C: "Q does more work than P.",
              D: "P does more work than Q.",
            },
            memoText: `Correct answer: D (2 marks)\nWork = Power × time. Since both engines work for the same time but P has greater power, P does MORE work than Q. (W = Pt; greater P → greater W)`,
            topic: "Work, Energy and Power",
          },
          {
            id: "phys-p1-1-6",
            label: "1.6",
            type: "mcq",
            questionText:
              "Star A and star B are both moving AWAY from Earth. The spectral lines of star B are MORE red-shifted than those of star A.\n\nWhich ONE of the following conclusions is CORRECT?",
            marks: 2,
            options: {
              A: "Star B is moving TOWARDS Earth.",
              B: "Star A and star B are moving away from Earth at the same speed.",
              C: "Star B is moving away from Earth FASTER than star A.",
              D: "Star A is moving away from Earth faster than star B.",
            },
            memoText: `Correct answer: C (2 marks)\nA greater red-shift means the observed frequency is lower than the source frequency. The greater the red-shift, the faster the source is moving away from the observer. Star B is more red-shifted → star B moves away faster than star A.`,
            topic: "Doppler Effect",
          },
          {
            id: "phys-p1-1-7",
            label: "1.7",
            type: "mcq",
            questionText:
              "The diagram below shows the electric field lines around two charged spheres S and T placed near each other. Point P lies to the RIGHT of sphere S.\n\nWhat are the charges on spheres S and T respectively?",
            marks: 2,
            diagramUrl:
              "https://kmgnizvqkqkiulzgvkcb.supabase.co/storage/v1/object/public/matric-diagrams/physics-p1-may-jun-2025_q1.7.png",
            options: {
              A: "S is positive; T is negative",
              B: "S is negative; T is positive",
              C: "Both S and T are positive",
              D: "Both S and T are negative",
            },
            memoText: `Correct answer: A (2 marks)\nElectric field lines point AWAY from positive charges and TOWARDS negative charges. From the diagram, the field lines between S and T show S repelling outward (positive) and T attracting inward (negative).`,
            topic: "Electrostatics",
          },
          {
            id: "phys-p1-1-8",
            label: "1.8",
            type: "mcq",
            questionText:
              "A battery with emf ε and internal resistance r is connected to a variable resistor. The graphs in the diagram show the results of practical measurements as the resistance is varied.\n\nWhich ONE correctly identifies what graphs K and L represent?",
            marks: 2,
            diagramUrl:
              "https://kmgnizvqkqkiulzgvkcb.supabase.co/storage/v1/object/public/matric-diagrams/physics-p1-may-jun-2025_q1.8.png",
            options: {
              A: "K: terminal voltage (V₁); L: voltage across variable resistor (V₂)",
              B: "K: voltage across internal resistance; L: terminal voltage (V₁)",
              C: "K: voltage across variable resistor (V₂); L: terminal voltage (V₁)",
              D: "K: terminal voltage (V₁); L: voltage across internal resistance",
            },
            memoText: `Correct answer: C (2 marks)\nGraph K increases with current: V₂ = IR (voltage across variable resistor increases as R increases → current…). As current (I) increases, voltage across variable resistor (V₂ = IR) increases — graph K.\nTerminal voltage V₁ = ε − Ir DECREASES as current increases — graph L.`,
            topic: "Electric Circuits",
          },
          {
            id: "phys-p1-1-9",
            label: "1.9",
            type: "mcq",
            questionText:
              "A simplified diagram of a DC electric motor is shown below. What is the function of the SPLIT-RING COMMUTATOR in the DC electric motor?",
            marks: 2,
            options: {
              A: "It increases the speed of rotation of the coil.",
              B: "It strengthens the magnetic field around the coil.",
              C: "It reverses the direction of the current through the coil every half rotation.",
              D: "It converts electrical energy into mechanical energy.",
            },
            memoText: `Correct answer: C (2 marks)\nThe split-ring commutator reverses the direction of the current in the coil every half rotation (180°). This ensures the force on each side of the coil always acts in the same rotational direction, allowing continuous rotation.`,
            topic: "Electromagnetic Induction",
          },
          {
            id: "phys-p1-1-10",
            label: "1.10",
            type: "mcq",
            questionText:
              "Which ONE of the following statements about the PHOTOELECTRIC EFFECT is CORRECT?",
            marks: 2,
            options: {
              A: "The frequency of incident light determines the NUMBER of photoelectrons emitted per second.",
              B: "Increasing the intensity of light increases the MAXIMUM KINETIC ENERGY of the photoelectrons.",
              C: "Each photoelectron absorbs ONE photon and is ejected if the photon energy exceeds the work function of the metal.",
              D: "The maximum kinetic energy of photoelectrons is independent of the frequency of the incident light.",
            },
            memoText: `Correct answer: C (2 marks)\nEinstein's explanation: each photoelectron absorbs exactly ONE photon. If the photon energy (hf) exceeds the work function (W₀), the electron is ejected with Ek(max) = hf − W₀.\nA is wrong: intensity (not frequency) determines number of electrons.\nB is wrong: intensity does NOT affect max KE.\nD is wrong: Ek(max) DOES depend on frequency.`,
            topic: "Photoelectric Effect",
          },
        ],
      },

      // ── QUESTION 2 — Forces and Newton's Laws (15 marks) ─────────────────────
      {
        number: 2,
        title: "Forces and Newton's Laws",
        totalMarks: 15,
        diagramUrl:
          "https://kmgnizvqkqkiulzgvkcb.supabase.co/storage/v1/object/public/matric-diagrams/physics-p1-may-jun-2025_q2.png",
        subQuestions: [
          {
            id: "phys-p1-2-1",
            label: "2.1",
            questionText:
              "State Newton's FIRST Law of Motion.",
            marks: 2,
            memoText: `Mark scheme (2 marks):\nMark 1: A body/object will remain at rest OR in uniform motion (constant velocity) in a straight line...\nMark 2: ...unless acted upon by a net (resultant) external force / unless a non-zero net force acts on it.`,
            topic: "Newton's Laws",
            diagramUrl:
              "https://kmgnizvqkqkiulzgvkcb.supabase.co/storage/v1/object/public/matric-diagrams/physics-p1-may-jun-2025_q2.png",
          },
          {
            id: "phys-p1-2-2",
            label: "2.2",
            questionText:
              "A 24 kg block is pulled up a rough inclined plane at a constant velocity by an applied force F parallel to the incline. The incline makes an angle of 30° with the horizontal. The coefficient of kinetic friction between the block and the surface is 0.19.\n\nDraw a labelled FREE-BODY DIAGRAM showing ALL the forces acting on the block. Show the block as a dot.",
            marks: 4,
            memoText: `Mark scheme (4 marks):\nMark 1 (R): Normal force N — perpendicular to inclined surface, pointing away from the surface ✓\nMark 2 (R): Weight/Gravity Fg — pointing vertically downward ✓\nMark 3 (R): Applied force F — along and up the incline ✓\nMark 4 (R): Friction force f — along and down the incline (opposing motion) ✓\nPenalty: Any extra force → max 3/4. Forces not starting from dot → max 3/4.`,
            topic: "Newton's Laws",
            diagramUrl:
              "https://kmgnizvqkqkiulzgvkcb.supabase.co/storage/v1/object/public/matric-diagrams/physics-p1-may-jun-2025_q2.png",
          },
          {
            id: "phys-p1-2-3",
            label: "2.3",
            questionText:
              "Calculate the magnitude of force F needed to pull the 24 kg block up the 30° incline at constant velocity. (Use g = 9.8 m·s⁻².)",
            marks: 3,
            memoText: `Mark scheme (3 marks):\nMark 1 (S): Fnet = 0 (constant velocity) → F = Fg∥ + f\nMark 2 (S): F = mgsin30° + μk·mgcos30°\n  = (24)(9.8)sin30° + (0.19)(24)(9.8)cos30°\n  = 117.6 + 38.78\nMark 3 (A): F = 156.38 N ≈ 156.4 N`,
            topic: "Newton's Laws",
            diagramUrl:
              "https://kmgnizvqkqkiulzgvkcb.supabase.co/storage/v1/object/public/matric-diagrams/physics-p1-may-jun-2025_q2.png",
          },
          {
            id: "phys-p1-2-4",
            label: "2.4",
            questionText:
              "A block is placed on the same rough inclined surface. The angle θ is gradually increased until the block is on the VERGE of sliding down the incline.\n\nUsing Newton's first law, show that the coefficient of static friction μs = tan θ at this point.\n\n*(Refer to the second diagram showing the variable-angle incline.)*",
            marks: 3,
            memoText: `Mark scheme (3 marks):\nMark 1 (S/R): At verge of sliding, Fnet = 0 → fs = Fg∥\nMark 2 (S): fs = μs·N = μs·mgcosθ and Fg∥ = mgsinθ\nMark 3 (S): μs·mgcosθ = mgsinθ → μs = sinθ/cosθ = tanθ ✓`,
            topic: "Newton's Laws",
            diagramUrl:
              "https://kmgnizvqkqkiulzgvkcb.supabase.co/storage/v1/object/public/matric-diagrams/physics-p1-may-jun-2025_q2.3.png",
          },
          {
            id: "phys-p1-2-5",
            label: "2.5",
            questionText:
              "The block is on the verge of sliding at θ = 24°. Calculate the magnitude of the static frictional force acting on the 24 kg block at this angle.",
            marks: 3,
            memoText: `Mark scheme (3 marks):\nMark 1 (S): fs = mgsinθ (since at verge, fs = Fg∥)\nMark 2 (S): fs = (24)(9.8)sin24°\n  = 235.2 × 0.4067\nMark 3 (A): fs = 95.66 N ≈ 95.7 N\n(Accept: fs = μs·mgcosθ = tan24°×(24)(9.8)cos24° → same answer)`,
            topic: "Newton's Laws",
            diagramUrl:
              "https://kmgnizvqkqkiulzgvkcb.supabase.co/storage/v1/object/public/matric-diagrams/physics-p1-may-jun-2025_q2.3.png",
          },
        ],
      },

      // ── QUESTION 3 — Vertical Projectile Motion (15 marks) ───────────────────
      {
        number: 3,
        title: "Vertical Projectile Motion",
        totalMarks: 15,
        diagramUrl:
          "https://kmgnizvqkqkiulzgvkcb.supabase.co/storage/v1/object/public/matric-diagrams/physics-p1-may-jun-2025_q3.png",
        subQuestions: [
          {
            id: "phys-p1-3-1",
            label: "3.1",
            questionText: "Give the definition of FREE FALL.",
            marks: 2,
            memoText: `Mark scheme (2 marks):\nMark 1: Motion of an object...\nMark 2: ...under the influence of gravitational force ONLY (no air resistance / no other forces).`,
            topic: "Vertical Projectile Motion",
          },
          {
            id: "phys-p1-3-2",
            label: "3.2",
            questionText:
              "A ball is dropped from REST from the top of a building. The ball passes point A after falling 1 s and reaches the ground 3 s after being released.\n\nRefer to the diagram. Show that the time taken for the ball to travel from A to the ground is 2 s.",
            marks: 3,
            memoText: `Mark scheme (3 marks):\nMark 1 (S): Total time = 3 s; time to reach A = 1 s\nMark 2 (S): Time from A to ground = 3 − 1 = 2 s ✓\nMark 3 (S/R): Verify: distance in first 1 s = ½(9.8)(1)² = 4.9 m\nDistance in 3 s = ½(9.8)(9) = 44.1 m → distance from A to ground = 44.1 − 4.9 = 39.2 m\nCheck using A → ground (v₀ = 9.8 m/s at A, t = 2 s): s = 9.8(2) + ½(9.8)(4) = 19.6 + 19.6 = 39.2 m ✓`,
            topic: "Vertical Projectile Motion",
            diagramUrl:
              "https://kmgnizvqkqkiulzgvkcb.supabase.co/storage/v1/object/public/matric-diagrams/physics-p1-may-jun-2025_q3.png",
          },
          {
            id: "phys-p1-3-3",
            label: "3.3",
            questionText:
              "Calculate the HEIGHT of the building.",
            marks: 3,
            memoText: `Mark scheme (3 marks):\nMark 1 (S): Use y = v₀t + ½gt² from rest (v₀ = 0)\nMark 2 (S): y = 0 + ½(9.8)(3)²\nMark 3 (A): y = 44.1 m`,
            topic: "Vertical Projectile Motion",
          },
          {
            id: "phys-p1-3-4",
            label: "3.4",
            questionText:
              "Calculate the VELOCITY of the ball when it reaches point A.",
            marks: 3,
            memoText: `Mark scheme (3 marks):\nMark 1 (S): v = v₀ + gt (downward positive)\nMark 2 (S): v = 0 + (9.8)(1)\nMark 3 (A): v = 9.8 m·s⁻¹ downward`,
            topic: "Vertical Projectile Motion",
          },
          {
            id: "phys-p1-3-5",
            label: "3.5",
            questionText:
              "Sketch a POSITION-TIME graph for the entire motion of the ball from when it is released until it hits the ground. Indicate the following on the graph:\n- The initial height of the building\n- The position at point A (at t = 1 s)\n- The final position (ground = 0 m)",
            marks: 4,
            memoText: `Mark scheme (4 marks):\nMark 1 (S): Correct shape — parabola curving downward (position decreasing at an increasing rate) ✓\nMark 2 (S): Starting position = 44.1 m at t = 0 ✓\nMark 3 (S): Point A at (1 s; 39.2 m) correctly indicated ✓\nMark 4 (S): Graph ends at position = 0 m at t = 3 s ✓`,
            topic: "Vertical Projectile Motion",
          },
        ],
      },

      // ── QUESTION 4 — Momentum and Impulse (15 marks) ─────────────────────────
      {
        number: 4,
        title: "Momentum and Impulse",
        totalMarks: 15,
        diagramUrl:
          "https://kmgnizvqkqkiulzgvkcb.supabase.co/storage/v1/object/public/matric-diagrams/physics-p1-may-jun-2025_q4.png",
        subQuestions: [
          {
            id: "phys-p1-4-1",
            label: "4.1",
            questionText:
              "State the PRINCIPLE OF CONSERVATION OF LINEAR MOMENTUM.",
            marks: 2,
            memoText: `Mark scheme (2 marks):\nMark 1: The total (linear) momentum of an isolated / closed system...\nMark 2: ...remains constant / is conserved. (No net external force acts on the system.)`,
            topic: "Momentum and Impulse",
          },
          {
            id: "phys-p1-4-2",
            label: "4.2",
            questionText:
              "Trolley A (mass 2 kg) moves to the right and collides with STATIONARY trolley B (mass 3 kg). After the collision, both trolleys move to the right. Trolley B moves at 0.4 m·s⁻¹ after the collision and trolley A continues at 0.1 m·s⁻¹ to the right.\n\nRefer to the diagram. Calculate the velocity of trolley A BEFORE the collision.",
            marks: 4,
            memoText: `Mark scheme (4 marks):\nMark 1 (S): Σpbefore = Σpafter (isolated system)\nMark 2 (S): mA·vA(before) + mB·vB(before) = mA·vA(after) + mB·vB(after)\n  (2)vA + (3)(0) = (2)(0.1) + (3)(0.4)\nMark 3 (S): 2vA = 0.2 + 1.2 = 1.4\nMark 4 (A): vA = 0.7 m·s⁻¹ to the right`,
            topic: "Momentum and Impulse",
            diagramUrl:
              "https://kmgnizvqkqkiulzgvkcb.supabase.co/storage/v1/object/public/matric-diagrams/physics-p1-may-jun-2025_q4.png",
          },
          {
            id: "phys-p1-4-3",
            label: "4.3",
            questionText:
              "Was the collision between trolley A and trolley B ELASTIC? Show by means of a CALCULATION.",
            marks: 4,
            memoText: `Mark scheme (4 marks):\nMark 1 (S): Calculate KE before: ½mAvA² = ½(2)(0.7)² = 0.49 J\nMark 2 (S): Calculate KE after: ½(2)(0.1)² + ½(3)(0.4)² = 0.01 + 0.24 = 0.25 J\nMark 3 (S/R): KE before (0.49 J) ≠ KE after (0.25 J)\nMark 4 (S/R): Collision is NOT elastic / inelastic — kinetic energy is NOT conserved.`,
            topic: "Momentum and Impulse",
          },
          {
            id: "phys-p1-4-4",
            label: "4.4",
            questionText:
              "A stationary ball is hit by a bat. The bat exerts an average force of 200 N on the ball for 0.05 s.\n\nIf the same ball is hit with the same change in momentum but the contact time is DECREASED to 0.02 s, how does the average force on the ball compare to 200 N? Support your answer with a calculation.",
            marks: 5,
            memoText: `Mark scheme (5 marks):\nMark 1 (S): Impulse = F·Δt = Δp (same change in momentum)\nMark 2 (S): F₁·Δt₁ = F₂·Δt₂\nMark 3 (S): (200)(0.05) = F₂(0.02)\nMark 4 (S): F₂ = 10/0.02 = 500 N\nMark 5 (S/R): The average force INCREASES to 500 N. A shorter contact time with the same impulse requires a greater force.`,
            topic: "Momentum and Impulse",
          },
        ],
      },

      // ── QUESTION 5 — Work, Energy and Power (15 marks) ───────────────────────
      {
        number: 5,
        title: "Work, Energy and Power",
        totalMarks: 15,
        diagramUrl:
          "https://kmgnizvqkqkiulzgvkcb.supabase.co/storage/v1/object/public/matric-diagrams/physics-p1-may-jun-2025_q5.png",
        subQuestions: [
          {
            id: "phys-p1-5-1",
            label: "5.1",
            questionText:
              "Give the definition of a NON-CONSERVATIVE FORCE.",
            marks: 2,
            memoText: `Mark scheme (2 marks):\nMark 1: A force for which the work done in moving an object between two points...\nMark 2: ...depends on the PATH taken / is not independent of the path.\n(Accept: A force for which mechanical energy is NOT conserved, e.g. friction, air resistance.)`,
            topic: "Work, Energy and Power",
          },
          {
            id: "phys-p1-5-2",
            label: "5.2",
            questionText:
              "A 50 kg crate is dragged along a horizontal surface by an applied force of 300 N at an angle of 20° above the horizontal.\n\nDraw a labelled FREE-BODY DIAGRAM showing ALL forces acting on the crate.",
            marks: 3,
            memoText: `Mark scheme (3 marks):\nMark 1 (R): Weight/Fg — vertically downward ✓\nMark 2 (R): Normal force N — vertically upward (perpendicular to surface) ✓\nMark 3 (R): Applied force F = 300 N at 20° above horizontal ✓\n(Mark 4 if awarded): Friction force f — horizontal, opposing motion ✓\nNote: Friction must be shown for full marks. Any extra force → deduct 1 mark.`,
            topic: "Work, Energy and Power",
            diagramUrl:
              "https://kmgnizvqkqkiulzgvkcb.supabase.co/storage/v1/object/public/matric-diagrams/physics-p1-may-jun-2025_q5.png",
          },
          {
            id: "phys-p1-5-3",
            label: "5.3",
            questionText:
              "The crate is dragged 8 m along the horizontal surface by the 300 N force at 20° above horizontal. The coefficient of kinetic friction between the crate and the surface is 0.25.\n\n5.3.1 Calculate the work done by the APPLIED FORCE over 8 m.\n5.3.2 Calculate the work done by the FRICTION FORCE over 8 m.\n5.3.3 Calculate the NET WORK done on the crate over 8 m.",
            marks: 10,
            memoText: `Mark scheme (10 marks):\n\n5.3.1 Work done by applied force (3 marks):\nMark 1 (S): W = F·d·cosθ\nMark 2 (S): W = (300)(8)cos20°\nMark 3 (A): W = 2255.8 J ≈ 2255.8 J\n\n5.3.2 Work done by friction (4 marks):\nMark 1 (S): Normal force N = mg − Fsinθ = (50)(9.8) − 300sin20° = 490 − 102.6 = 387.4 N\nMark 2 (S): f = μk·N = (0.25)(387.4) = 96.85 N\nMark 3 (S): W_friction = −f·d = −(96.85)(8) (negative: friction opposes displacement)\nMark 4 (A): W_friction = −774.8 J\n\n5.3.3 Net work (3 marks):\nMark 1 (S): W_net = W_applied + W_friction + W_N + W_g (N and g do no work — ⊥ to motion)\nMark 2 (S): W_net = 2255.8 + (−774.8)\nMark 3 (A): W_net = 1481 J ≈ 1481 J`,
            topic: "Work, Energy and Power",
          },
        ],
      },

      // ── QUESTION 6 — Doppler Effect (15 marks) ───────────────────────────────
      {
        number: 6,
        title: "Doppler Effect",
        totalMarks: 15,
        diagramUrl:
          "https://kmgnizvqkqkiulzgvkcb.supabase.co/storage/v1/object/public/matric-diagrams/physics-p1-may-jun-2025_q6.png",
        subQuestions: [
          {
            id: "phys-p1-6-1",
            label: "6.1",
            questionText: "Define the DOPPLER EFFECT.",
            marks: 2,
            memoText: `Mark scheme (2 marks):\nMark 1: The (apparent) change in frequency (or pitch) of a sound/wave...\nMark 2: ...as perceived by a listener/observer when there is RELATIVE MOTION between the source and the observer/listener.`,
            topic: "Doppler Effect",
          },
          {
            id: "phys-p1-6-2",
            label: "6.2",
            questionText:
              "A bat emits ultrasound of frequency f₀ = 50 000 Hz while flying towards a stationary cliff at speed vB. The speed of sound in air is v = 340 m·s⁻¹.\n\nThe bat acts as BOTH a moving source (emitting towards the cliff) and then a moving listener (receiving the reflected echo from the cliff).\n\nDerive an expression for the frequency fL received by the bat from the reflected echo, in terms of f₀, v and vB.",
            marks: 5,
            memoText: `Mark scheme (5 marks):\nMark 1 (S/R): Bat as moving source → cliff receives frequency: f_cliff = f₀·v/(v − vB)  [bat moving toward stationary cliff]\nMark 2 (S): Cliff re-emits at f_cliff (stationary source now)\nMark 3 (S/R): Bat as moving listener moving toward stationary source (cliff): fL = f_cliff·(v + vB)/v\nMark 4 (S): Substitute: fL = [f₀·v/(v − vB)] × (v + vB)/v\nMark 5 (A): fL = f₀·(v + vB)/(v − vB) ✓`,
            topic: "Doppler Effect",
          },
          {
            id: "phys-p1-6-3",
            label: "6.3",
            questionText:
              "The bat emits ultrasound at 50 000 Hz and receives the reflected echo at 52 000 Hz. The speed of sound is 340 m·s⁻¹.\n\nCalculate the speed of the bat.",
            marks: 4,
            memoText: `Mark scheme (4 marks):\nMark 1 (S): fL = f₀(v + vB)/(v − vB)\nMark 2 (S): 52 000 = 50 000(340 + vB)/(340 − vB)\nMark 3 (S): 52 000(340 − vB) = 50 000(340 + vB)\n  17 680 000 − 52 000vB = 17 000 000 + 50 000vB\n  680 000 = 102 000vB\nMark 4 (A): vB = 6.67 m·s⁻¹ ≈ 6.7 m·s⁻¹`,
            topic: "Doppler Effect",
          },
          {
            id: "phys-p1-6-4",
            label: "6.4",
            questionText:
              "Name ONE application of the Doppler effect in MEDICINE.",
            marks: 2,
            memoText: `Mark scheme (2 marks):\nMark 1: Correct application named, e.g. Doppler ultrasound / echocardiography / foetal heartbeat monitoring / blood flow measurement ✓\nMark 2: Brief explanation — used to measure blood flow speed / detect moving structures (heart valves, red blood cells) by detecting frequency shifts in reflected ultrasound.`,
            topic: "Doppler Effect",
          },
          {
            id: "phys-p1-6-5",
            label: "6.5",
            questionText:
              "As the bat MOVES AWAY from the cliff at the same speed, describe the change (if any) in the frequency of the ECHO received by the bat compared to the emitted frequency. Give a reason.",
            marks: 2,
            memoText: `Mark scheme (2 marks):\nMark 1 (S/R): The received frequency is LOWER than the emitted frequency / the echo is red-shifted / fL < f₀.\nMark 2 (R): When the bat moves away from the cliff, it is a moving source moving away → cliff receives lower frequency; and the bat (listener) is moving away from the source → it receives an even lower frequency. Both effects reduce fL below f₀.`,
            topic: "Doppler Effect",
          },
        ],
      },

      // ── QUESTION 7 — Electrostatics (15 marks) ───────────────────────────────
      {
        number: 7,
        title: "Electrostatics",
        totalMarks: 15,
        diagramUrl:
          "https://kmgnizvqkqkiulzgvkcb.supabase.co/storage/v1/object/public/matric-diagrams/physics-p1-may-jun-2025_q7.png",
        subQuestions: [
          {
            id: "phys-p1-7-1",
            label: "7.1",
            questionText:
              "Draw the electric field pattern around an ISOLATED POSITIVELY charged sphere. Show at least FOUR field lines.",
            marks: 3,
            memoText: `Mark scheme (3 marks):\nMark 1 (R): Field lines point OUTWARD from the positive charge (away from the sphere) ✓\nMark 2 (S): Lines are RADIALLY symmetric / evenly spaced around the sphere ✓\nMark 3 (S): At least 4 lines drawn; lines do NOT cross ✓\nPenalty: If lines point inward → 0/3.`,
            topic: "Electrostatics",
          },
          {
            id: "phys-p1-7-2",
            label: "7.2",
            questionText: "State COULOMB'S LAW in words.",
            marks: 3,
            memoText: `Mark scheme (3 marks):\nMark 1: The electrostatic force between two point charges...\nMark 2: ...is directly proportional to the PRODUCT of the charges (Q₁ × Q₂)...\nMark 3: ...and inversely proportional to the SQUARE of the distance (r²) between them.\n(Accept: F = kQ₁Q₂/r²  with each component correctly described.)`,
            topic: "Electrostatics",
          },
          {
            id: "phys-p1-7-3",
            label: "7.3",
            questionText:
              "Two small charged spheres A (+4 μC) and B (−6 μC) are placed 0.03 m apart in air.\n\nRefer to the diagram.\n7.3.1 Calculate the magnitude of the electrostatic force that sphere A exerts on sphere B. (Use k = 9 × 10⁹ N·m²·C⁻².)\n7.3.2 Sphere B is suspended by a light string. The electrostatic force from sphere A causes the string to make an angle with the vertical. Calculate the ANGLE the string makes with the vertical. (Mass of sphere B = 1.5 × 10⁻³ kg; g = 9.8 m·s⁻².)",
            marks: 9,
            memoText: `Mark scheme (9 marks):\n\n7.3.1 Electrostatic force (4 marks):\nMark 1 (S): F = kQ₁Q₂/r²\nMark 2 (S): F = (9×10⁹)(4×10⁻⁶)(6×10⁻⁶)/(0.03)²\nMark 3 (S): F = (9×10⁹)(24×10⁻¹²)/(9×10⁻⁴)\nMark 4 (A): F = 240 N\n\n7.3.2 Angle with vertical (5 marks):\nMark 1 (S): Weight Fg = mg = (1.5×10⁻³)(9.8) = 0.01470 N\nMark 2 (S): Electrostatic force FE = 240 N (horizontal, attractive → toward A)\nMark 3 (S): tanθ = FE/Fg = 240/0.01470\nMark 4 (S): tanθ = 16 326.5\nMark 5 (A): θ = 89.996° ≈ 90° (string is nearly horizontal)\n\nNote to student: The very large electrostatic force compared to weight means the string is essentially horizontal. Credit if student identifies this physical result.`,
            topic: "Electrostatics",
            diagramUrl:
              "https://kmgnizvqkqkiulzgvkcb.supabase.co/storage/v1/object/public/matric-diagrams/physics-p1-may-jun-2025_q7.2.png",
          },
        ],
      },

      // ── QUESTION 8 — Electric Circuits (15 marks) ────────────────────────────
      {
        number: 8,
        title: "Electric Circuits",
        totalMarks: 15,
        diagramUrl:
          "https://kmgnizvqkqkiulzgvkcb.supabase.co/storage/v1/object/public/matric-diagrams/physics-p1-may-jun-2025_q8.png",
        subQuestions: [
          {
            id: "phys-p1-8-1",
            label: "8.1",
            questionText: "State OHM'S LAW in words.",
            marks: 2,
            memoText: `Mark scheme (2 marks):\nMark 1: The current in a conductor is directly proportional to the potential difference across it...\nMark 2: ...provided that temperature and other physical conditions remain CONSTANT.\n(Accept: V = IR with the proportionality and constant-temperature conditions stated.)`,
            topic: "Electric Circuits",
          },
          {
            id: "phys-p1-8-2",
            label: "8.2",
            questionText:
              "The circuit diagram shows a battery (emf = 12 V, internal resistance r = 0.5 Ω) connected to a parallel combination of a 9 Ω resistor and a parallel branch containing resistors in series. The ammeter (A) is connected in the main circuit.\n\nRefer to the diagram. Calculate the current through the 9 Ω resistor.",
            marks: 3,
            memoText: `Mark scheme (3 marks):\nMark 1 (S): Voltage across parallel combination = terminal voltage − voltage across internal resistance\nMark 2 (S): Current through 9 Ω = V/R (apply correct terminal voltage to 9 Ω)\nMark 3 (A): I₉Ω = 1.2 A (accept answer consistent with circuit given in diagram)\nNote: Exact values depend on the specific circuit values given in the diagram.`,
            topic: "Electric Circuits",
            diagramUrl:
              "https://kmgnizvqkqkiulzgvkcb.supabase.co/storage/v1/object/public/matric-diagrams/physics-p1-may-jun-2025_q8.png",
          },
          {
            id: "phys-p1-8-3",
            label: "8.3",
            questionText:
              "Calculate the reading on the AMMETER in the main circuit. The ammeter reads the total current from the battery.",
            marks: 3,
            memoText: `Mark scheme (3 marks):\nMark 1 (S): Total current I = ε/(R_external + r)\nMark 2 (S): Substitute correct external resistance (parallel combination) and internal resistance r = 0.5 Ω\nMark 3 (A): I = 3.05 A (accept answer consistent with circuit given in diagram)`,
            topic: "Electric Circuits",
          },
          {
            id: "phys-p1-8-4",
            label: "8.4",
            questionText:
              "One of the resistors in the parallel branch has an unknown resistance R. Given that the total current in the main circuit is 3.05 A, calculate the value of R.",
            marks: 4,
            memoText: `Mark scheme (4 marks):\nMark 1 (S): Use ε = I(R_ext + r) to find total external resistance R_ext\nMark 2 (S): Use R_ext = (R_parallel) to find the parallel resistance value\nMark 3 (S): Apply parallel resistor formula: 1/R_parallel = 1/R₁ + 1/R (solve for R)\nMark 4 (A): R ≈ 4.16 Ω`,
            topic: "Electric Circuits",
          },
          {
            id: "phys-p1-8-5",
            label: "8.5",
            questionText:
              "Switch S₂ (which controls one parallel branch) is now OPENED. Describe and explain the effect this has on:\n(a) The reading on the ammeter\n(b) The brightness of a light bulb connected in the main circuit (in series with the battery)",
            marks: 3,
            memoText: `Mark scheme (3 marks):\nMark 1 (S/R): Opening S₂ REMOVES one parallel branch → total external resistance INCREASES.\nMark 2 (S/R): Increased R_ext → total current DECREASES (ammeter reading decreases).\nMark 3 (S/R): Less current through the bulb → LESS power dissipated (P = I²R) → bulb is DIMMER.\n(If student says terminal voltage increases — correct, but main effect is less current → dimmer bulb.)`,
            topic: "Electric Circuits",
          },
        ],
      },

      // ── QUESTION 9 — Electromagnetic Induction (12 marks) ────────────────────
      {
        number: 9,
        title: "Electromagnetic Induction",
        totalMarks: 12,
        diagramUrl:
          "https://kmgnizvqkqkiulzgvkcb.supabase.co/storage/v1/object/public/matric-diagrams/physics-p1-may-jun-2025_q9.png",
        subQuestions: [
          {
            id: "phys-p1-9-1",
            label: "9.1",
            questionText:
              "The diagram shows a simplified AC generator. The coil is rotating in the magnetic field. The left end of the coil is labelled A and the right end is labelled B.\n\nAt the instant shown, which end (A or B) acts as the NORTH POLE of the electromagnet formed by the coil? Give a reason.",
            marks: 2,
            memoText: `Mark scheme (2 marks):\nMark 1 (A): End A is the north pole. ✓\nMark 2 (R): Using the right-hand rule / corkscrew rule applied to the current direction in the coil as shown — the conventional current circulates in a direction that makes end A the north pole (field lines exit from A).`,
            topic: "Electromagnetic Induction",
            diagramUrl:
              "https://kmgnizvqkqkiulzgvkcb.supabase.co/storage/v1/object/public/matric-diagrams/physics-p1-may-jun-2025_q9.png",
          },
          {
            id: "phys-p1-9-2",
            label: "9.2",
            questionText:
              "Give TWO ways in which the MAXIMUM EMF of this generator can be INCREASED.",
            marks: 2,
            memoText: `Mark scheme (2 marks — 1 mark each):\nAny TWO of the following:\n• Increase the SPEED of rotation of the coil ✓\n• Increase the NUMBER OF TURNS (loops) on the coil ✓\n• Use a STRONGER MAGNET (increase magnetic field strength) ✓\n• Increase the AREA of the coil ✓\n• Insert a SOFT IRON CORE inside the coil ✓`,
            topic: "Electromagnetic Induction",
          },
          {
            id: "phys-p1-9-3",
            label: "9.3",
            questionText:
              "The generator produces an alternating current. Sketch a CURRENT versus TIME graph for TWO complete cycles, starting at the MAXIMUM positive current value. Label the maximum current I_max on the graph.",
            marks: 3,
            memoText: `Mark scheme (3 marks):\nMark 1 (S): Correct sinusoidal shape (smooth wave) ✓\nMark 2 (S): Graph STARTS at the maximum positive value (cosine-shaped start) ✓\nMark 3 (S): TWO complete cycles shown; I_max correctly labelled; graph symmetric about the time axis ✓`,
            topic: "Electromagnetic Induction",
          },
          {
            id: "phys-p1-9-4",
            label: "9.4",
            questionText: "Define RMS CURRENT.",
            marks: 2,
            memoText: `Mark scheme (2 marks):\nMark 1: The rms (root mean square) current is the value of the alternating current...\nMark 2: ...that produces the SAME HEATING EFFECT (power dissipation) in a resistor as an equivalent DIRECT CURRENT of the same value.\n(Or: Irms = Imax/√2)`,
            topic: "Electromagnetic Induction",
          },
          {
            id: "phys-p1-9-5",
            label: "9.5",
            questionText:
              "A generator produces a maximum (peak) voltage of 340 V. It is connected to a resistive load.\n\n9.5.1 Calculate the RMS voltage.\n9.5.2 If the rms current through the load is 5 A, calculate the resistance of the load.\n9.5.3 Calculate the average power dissipated in the load.",
            marks: 3,
            memoText: `Mark scheme (3 marks):\n\n9.5.1 Vrms (1 mark):\nVrms = Vmax/√2 = 340/√2 = 240.4 V ≈ 240 V ✓\n\n9.5.2 Resistance (1 mark):\nR = Vrms/Irms = 240/5 = 48 Ω ✓\n\n9.5.3 Average power (1 mark):\nP_avg = Vrms × Irms = (240)(5) = 1200 W (OR P = Irms²R = (25)(48) = 1200 W) ✓`,
            topic: "Electromagnetic Induction",
          },
        ],
      },

      // ── QUESTION 10 — Photoelectric Effect (13 marks) ────────────────────────
      {
        number: 10,
        title: "Photoelectric Effect",
        totalMarks: 13,
        diagramUrl:
          "https://kmgnizvqkqkiulzgvkcb.supabase.co/storage/v1/object/public/matric-diagrams/physics-p1-may-jun-2025_q10.png",
        subQuestions: [
          {
            id: "phys-p1-10-1",
            label: "10.1",
            questionText: "Define the WORK FUNCTION of a metal.",
            marks: 2,
            memoText: `Mark scheme (2 marks):\nMark 1: The work function (W₀) is the MINIMUM energy needed...\nMark 2: ...to remove/eject an electron from the surface of a metal. (Units: joules or eV)`,
            topic: "Photoelectric Effect",
          },
          {
            id: "phys-p1-10-2",
            label: "10.2",
            questionText:
              "The graph below shows maximum kinetic energy (Ek max) plotted against the frequency (f) of incident light for a particular metal surface.\n\nDetermine the GRADIENT of the graph and state what physical quantity it represents.",
            marks: 3,
            memoText: `Mark scheme (3 marks):\nMark 1 (S): Choose two widely spaced points on the graph and apply gradient = ΔEk/Δf\nMark 2 (A): Gradient ≈ 6.63 × 10⁻³⁴ J·s (read from the graph)\nMark 3 (S/R): The gradient represents PLANCK'S CONSTANT (h). The equation Ek(max) = hf − W₀ is linear with slope h.`,
            topic: "Photoelectric Effect",
            diagramUrl:
              "https://kmgnizvqkqkiulzgvkcb.supabase.co/storage/v1/object/public/matric-diagrams/physics-p1-may-jun-2025_q10.png",
          },
          {
            id: "phys-p1-10-3",
            label: "10.3",
            questionText:
              "Use the graph to determine the WORK FUNCTION of the metal. Express your answer in joules.",
            marks: 3,
            memoText: `Mark scheme (3 marks):\nMark 1 (S): At the x-intercept of the graph, Ek(max) = 0, so hf₀ = W₀ (threshold frequency f₀)\nMark 2 (S): Read threshold frequency from x-intercept of graph: f₀ ≈ 5.55 × 10¹⁴ Hz\nMark 3 (A): W₀ = hf₀ = (6.63×10⁻³⁴)(5.55×10¹⁴) ≈ 3.68 × 10⁻¹⁹ J\n\n(Alternatively: W₀ is the magnitude of the y-intercept when the line is extrapolated.)`,
            topic: "Photoelectric Effect",
          },
          {
            id: "phys-p1-10-4",
            label: "10.4",
            questionText:
              "Light of frequency 7.5 × 10¹⁴ Hz is incident on the metal surface. Calculate the MAXIMUM SPEED of the photoelectrons ejected. (h = 6.63 × 10⁻³⁴ J·s; mₑ = 9.11 × 10⁻³¹ kg)",
            marks: 3,
            memoText: `Mark scheme (3 marks):\nMark 1 (S): Ek(max) = hf − W₀\n  = (6.63×10⁻³⁴)(7.5×10¹⁴) − 3.68×10⁻¹⁹\n  = 4.97×10⁻¹⁹ − 3.68×10⁻¹⁹\n  = 1.29×10⁻¹⁹ J\nMark 2 (S): Ek(max) = ½mₑv²\n  1.29×10⁻¹⁹ = ½(9.11×10⁻³¹)v²\n  v² = 2.83×10¹¹\nMark 3 (A): v = 5.32 × 10⁵ m·s⁻¹`,
            topic: "Photoelectric Effect",
          },
          {
            id: "phys-p1-10-5",
            label: "10.5",
            questionText:
              "The intensity of the incident light (same frequency 7.5 × 10¹⁴ Hz) is now DOUBLED. What effect does this have on the MAXIMUM KINETIC ENERGY of the ejected photoelectrons? Explain.",
            marks: 2,
            memoText: `Mark scheme (2 marks):\nMark 1 (S/R): The maximum kinetic energy REMAINS THE SAME / does NOT change.\nMark 2 (R): Intensity determines the NUMBER of photons per second, not the energy of individual photons. Since the frequency is unchanged, each photon still has energy hf. Each photoelectron still absorbs only ONE photon, so Ek(max) = hf − W₀ is unchanged. (Doubling intensity only doubles the NUMBER of photoelectrons emitted.)`,
            topic: "Photoelectric Effect",
          },
        ],
      },
    ],
  },
];

export function getFlatSubQuestions(paper: Paper): SubQuestion[] {
  return paper.questions.flatMap((q) => q.subQuestions);
}

export function getTopicBreakdown(
  paper: Paper,
  attempts: Record<string, { marksEarned: number; submitted: boolean }>
): Record<string, { earned: number; total: number; question: number }> {
  const topics: Record<string, { earned: number; total: number; question: number }> = {};
  for (const q of paper.questions) {
    for (const sq of q.subQuestions) {
      if (!topics[sq.topic]) {
        topics[sq.topic] = { earned: 0, total: 0, question: q.number };
      }
      topics[sq.topic].total += sq.marks;
      if (attempts[sq.id]?.submitted) {
        topics[sq.topic].earned += attempts[sq.id]?.marksEarned ?? 0;
      }
    }
  }
  return topics;
}
