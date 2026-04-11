// Formula sheet content for each variant, rendered with MathMarkdown (KaTeX)
// "standard" — all 4 formula blocks including regression (P1 2024, P1 2025, P2 2025)
// "p2-2024"  — same but without regression line formulas (P2 May/June 2024)

export type FormulaSheetVariant = "standard" | "p2-2024";

export const FORMULA_SHEETS: Record<FormulaSheetVariant, string> = {
  standard: `
## Information Sheet

**Quadratic Formula**

$$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$

---

**Interest**

$$A = P(1 + ni) \\qquad A = P(1 - ni)$$

$$A = P(1 - i)^n \\qquad A = P(1 + i)^n$$

---

**Sequences & Series**

$$T_n = a + (n-1)d \\qquad S_n = \\frac{n}{2}[2a + (n-1)d]$$

$$T_n = ar^{n-1} \\qquad S_n = \\frac{a(r^n - 1)}{r - 1}\\;; \\; r \\neq 1 \\qquad S_\\infty = \\frac{a}{1 - r}\\;; \\; -1 < r < 1$$

---

**Finance**

$$F = \\frac{x[(1+i)^n - 1]}{i} \\qquad P = \\frac{x[1-(1+i)^{-n}]}{i}$$

---

**Calculus**

$$f'(x) = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}$$

---

**Analytical Geometry**

$$d = \\sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2} \\qquad M\\!\\left(\\frac{x_1+x_2}{2}\\,;\\,\\frac{y_1+y_2}{2}\\right)$$

$$y = mx + c \\qquad y - y_1 = m(x - x_1) \\qquad m = \\frac{y_2 - y_1}{x_2 - x_1} \\qquad m = \\tan\\theta$$

$$(x - a)^2 + (y - b)^2 = r^2$$

---

**Trigonometry** *(In △ABC)*

$$\\frac{a}{\\sin A} = \\frac{b}{\\sin B} = \\frac{c}{\\sin C} \\qquad a^2 = b^2 + c^2 - 2bc\\cos A \\qquad \\text{area }\\triangle ABC = \\tfrac{1}{2}ab\\sin C$$

$$\\sin(\\alpha + \\beta) = \\sin\\alpha\\cos\\beta + \\cos\\alpha\\sin\\beta \\qquad \\sin(\\alpha - \\beta) = \\sin\\alpha\\cos\\beta - \\cos\\alpha\\sin\\beta$$

$$\\cos(\\alpha + \\beta) = \\cos\\alpha\\cos\\beta - \\sin\\alpha\\sin\\beta \\qquad \\cos(\\alpha - \\beta) = \\cos\\alpha\\cos\\beta + \\sin\\alpha\\sin\\beta$$

$$\\cos 2\\alpha = \\begin{cases} \\cos^2\\alpha - \\sin^2\\alpha \\\\ 1 - 2\\sin^2\\alpha \\\\ 2\\cos^2\\alpha - 1 \\end{cases} \\qquad \\sin 2\\alpha = 2\\sin\\alpha\\cos\\alpha$$

---

**Statistics**

$$\\bar{x} = \\frac{\\sum x}{n} \\qquad \\sigma^2 = \\frac{\\sum_{i=1}^{n}(x_i - \\bar{x})^2}{n}$$

$$\\hat{y} = a + bx \\qquad b = \\frac{\\sum(x - \\bar{x})(y - \\bar{y})}{\\sum(x - \\bar{x})^2}$$

---

**Probability**

$$P(A) = \\frac{n(A)}{n(S)} \\qquad P(A \\text{ or } B) = P(A) + P(B) - P(A \\text{ and } B)$$
`.trim(),

  "p2-2024": `
## Information Sheet

**Quadratic Formula**

$$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$

---

**Interest**

$$A = P(1 + ni) \\qquad A = P(1 - ni)$$

$$A = P(1 - i)^n \\qquad A = P(1 + i)^n$$

---

**Sequences & Series**

$$T_n = a + (n-1)d \\qquad S_n = \\frac{n}{2}[2a + (n-1)d]$$

$$T_n = ar^{n-1} \\qquad S_n = \\frac{a(r^n - 1)}{r - 1}\\;; \\; r \\neq 1 \\qquad S_\\infty = \\frac{a}{1 - r}\\;; \\; -1 < r < 1$$

---

**Finance**

$$F = \\frac{x[(1+i)^n - 1]}{i} \\qquad P = \\frac{x[1-(1+i)^{-n}]}{i}$$

---

**Calculus**

$$f'(x) = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}$$

---

**Analytical Geometry**

$$d = \\sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2} \\qquad M\\!\\left(\\frac{x_1+x_2}{2}\\,;\\,\\frac{y_1+y_2}{2}\\right)$$

$$y = mx + c \\qquad y - y_1 = m(x - x_1) \\qquad m = \\frac{y_2 - y_1}{x_2 - x_1} \\qquad m = \\tan\\theta$$

$$(x - a)^2 + (y - b)^2 = r^2$$

---

**Trigonometry** *(In △ABC)*

$$\\frac{a}{\\sin A} = \\frac{b}{\\sin B} = \\frac{c}{\\sin C} \\qquad a^2 = b^2 + c^2 - 2bc\\cos A \\qquad \\text{area }\\triangle ABC = \\tfrac{1}{2}ab\\sin C$$

$$\\sin(\\alpha + \\beta) = \\sin\\alpha\\cos\\beta + \\cos\\alpha\\sin\\beta \\qquad \\sin(\\alpha - \\beta) = \\sin\\alpha\\cos\\beta - \\cos\\alpha\\sin\\beta$$

$$\\cos(\\alpha + \\beta) = \\cos\\alpha\\cos\\beta - \\sin\\alpha\\sin\\beta \\qquad \\cos(\\alpha - \\beta) = \\cos\\alpha\\cos\\beta + \\sin\\alpha\\sin\\beta$$

$$\\cos 2\\alpha = \\begin{cases} \\cos^2\\alpha - \\sin^2\\alpha \\\\ 1 - 2\\sin^2\\alpha \\\\ 2\\cos^2\\alpha - 1 \\end{cases} \\qquad \\sin 2\\alpha = 2\\sin\\alpha\\cos\\alpha$$

---

**Statistics**

$$\\bar{x} = \\frac{\\sum x}{n} \\qquad \\sigma^2 = \\frac{\\sum_{i=1}^{n}(x_i - \\bar{x})^2}{n}$$

---

**Probability**

$$P(A) = \\frac{n(A)}{n(S)} \\qquad P(A \\text{ or } B) = P(A) + P(B) - P(A \\text{ and } B)$$
`.trim(),
};
