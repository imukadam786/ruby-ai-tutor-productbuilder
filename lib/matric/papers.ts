export interface SubQuestion {
  id: string;
  label: string;
  questionText: string;
  marks: number;
  memoText: string;
  topic: string;
}

export interface PaperQuestion {
  number: number;
  title: string;
  totalMarks: number;
  subQuestions: SubQuestion[];
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
