// Formula sheet content for each variant, rendered with MathMarkdown (KaTeX)
// "standard"      — Maths info sheet with regression (P1 2024, P1 2025, P2 2025)
// "p2-2024"       — Maths info sheet without regression line formulas (P2 May/June 2024)
// "physics-p1"    — Physical Sciences P1 data sheet (mechanics, waves, electricity, modern physics)
// "accounting-p1" — Accounting P1 financial indicator formula sheet
// "accounting-p2" — Accounting P2 financial indicator formula sheet (identical to P1)

export type FormulaSheetVariant = "standard" | "p2-2024" | "physics-p1" | "accounting-p1" | "accounting-p2";

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

  "physics-p1": `
## Data Sheet — Physical Sciences P1

**Physical Constants**

| Quantity | Symbol | Value |
|---|---|---|
| Speed of light in a vacuum | $c$ | $3 \\times 10^{8}$ m·s⁻¹ |
| Gravitational acceleration | $g$ | $9{,}8$ m·s⁻² |
| Universal gravitational constant | $G$ | $6{,}67 \\times 10^{-11}$ N·m²·kg⁻² |
| Coulomb's constant | $k$ | $9{,}0 \\times 10^{9}$ N·m²·C⁻² |
| Charge on electron | $e$ | $1{,}6 \\times 10^{-19}$ C |
| Mass of electron | $m_e$ | $9{,}11 \\times 10^{-31}$ kg |
| Mass of proton | $m_p$ | $1{,}67 \\times 10^{-27}$ kg |
| Planck's constant | $h$ | $6{,}63 \\times 10^{-34}$ J·s |
| Speed of sound in air | | $340$ m·s⁻¹ |

---

**Mechanics**

$$v = v_i + a \\Delta t \\qquad \\Delta x = v_i \\Delta t + \\tfrac{1}{2}a(\\Delta t)^2 \\qquad v^2 = v_i^2 + 2a\\Delta x$$

$$F_{\\text{net}} = ma \\qquad p = mv \\qquad F_{\\text{net}}\\,\\Delta t = \\Delta p$$

$$w = mg \\qquad F = \\frac{Gm_1 m_2}{r^2}$$

$$W = F\\,\\Delta x\\cos\\theta \\qquad U = mgh \\qquad K = \\tfrac{1}{2}mv^2 \\qquad W_{\\text{net}} = \\Delta K$$

$$P = \\frac{W}{\\Delta t} \\qquad P = Fv$$

---

**Waves, Sound & Light**

$$v = f\\lambda \\qquad T = \\frac{1}{f}$$

$$f_L = \\frac{v \\pm v_L}{v \\mp v_S}\\,f_S \\quad \\text{(Doppler effect)}$$

$$E = hf \\qquad E = \\frac{hc}{\\lambda} \\qquad E_k(\\text{max}) = hf - W_0$$

---

**Electrostatics**

$$F = \\frac{kQ_1 Q_2}{r^2} \\qquad E = \\frac{kQ}{r^2} \\qquad E = \\frac{F}{q} \\qquad V = \\frac{W}{q}$$

---

**Electric Circuits**

$$R = \\frac{V}{I} \\qquad \\varepsilon = I(R + r) \\qquad q = I\\,\\Delta t$$

$$W = VQ = VI\\,\\Delta t = I^2 R\\,\\Delta t = \\frac{V^2}{R}\\,\\Delta t$$

$$P = \\frac{W}{\\Delta t} = VI = I^2 R = \\frac{V^2}{R}$$

**Series:** $\\;R_s = R_1 + R_2 + \\cdots$ $\\qquad$ **Parallel:** $\\;\\dfrac{1}{R_p} = \\dfrac{1}{R_1} + \\dfrac{1}{R_2} + \\cdots$

---

**Alternating Current**

$$I_{\\text{rms}} = \\frac{I_{\\text{max}}}{\\sqrt{2}} \\qquad V_{\\text{rms}} = \\frac{V_{\\text{max}}}{\\sqrt{2}} \\qquad P_{\\text{avg}} = V_{\\text{rms}}\\,I_{\\text{rms}} = \\tfrac{1}{2}V_{\\text{max}}\\,I_{\\text{max}}$$
`.trim(),

  "accounting-p1": `
## Financial Indicator Formula Sheet

**Profitability**

$$\\frac{\\text{Gross profit}}{\\text{Sales}} \\times 100 \\qquad \\frac{\\text{Gross profit}}{\\text{Cost of sales}} \\times 100$$

$$\\frac{\\text{Net profit before tax}}{\\text{Sales}} \\times 100 \\qquad \\frac{\\text{Net profit after tax}}{\\text{Sales}} \\times 100$$

$$\\frac{\\text{Operating expenses}}{\\text{Sales}} \\times 100 \\qquad \\frac{\\text{Operating profit}}{\\text{Sales}} \\times 100$$

---

**Liquidity & Solvency**

$$\\text{Total assets : Total liabilities} \\qquad \\text{Current assets : Current liabilities}$$

$$\\text{(Current assets} - \\text{Inventories) : Current liabilities} \\qquad \\text{Non-current liabilities : Shareholders' equity}$$

$$\\text{(Trade \\& other receivables} + \\text{Cash \\& cash equivalents) : Current liabilities}$$

---

**Efficiency**

$$\\frac{\\text{Average trading stock} \\times 365}{\\text{Cost of sales}} \\quad \\text{(Note 1)} \\qquad \\frac{\\text{Cost of sales}}{\\text{Average trading stock}}$$

$$\\frac{\\text{Average debtors} \\times 365}{\\text{Credit sales}} \\qquad \\frac{\\text{Average creditors} \\times 365}{\\text{Cost of sales}} \\quad \\text{(Note 2)}$$

---

**Return on Equity / Investment**

$$\\frac{\\text{Net income after tax}}{\\text{Average shareholders' equity}} \\times 100 \\qquad \\frac{\\text{Net income after tax}}{\\text{Number of issued shares}} \\times 100 \\quad \\text{(Note 3)}$$

$$\\frac{\\text{Net income before tax} + \\text{Interest on loans}}{\\text{Average shareholders' equity} + \\text{Average non-current liabilities}} \\times 100$$

---

**Per Share**

$$\\frac{\\text{Shareholders' equity}}{\\text{Number of issued shares}} \\times 100 \\qquad \\frac{\\text{Dividends for the year}}{\\text{Number of issued shares}} \\times 100$$

$$\\frac{\\text{Interim dividends}}{\\text{Number of issued shares}} \\times 100 \\qquad \\frac{\\text{Final dividends}}{\\text{Number of issued shares}} \\times 100$$

---

**Dividend Ratios**

$$\\frac{\\text{Dividends per share}}{\\text{Earnings per share}} \\times 100 \\qquad \\frac{\\text{Dividends for the year}}{\\text{Net income after tax}} \\times 100$$

---

**Break-even**

$$\\frac{\\text{Total fixed costs}}{\\text{Selling price per unit} - \\text{Variable costs per unit}}$$

---

**Note 1:** Trading stock at end of financial year may be used if required. 365 days applicable only if relevant to whole year.

**Note 2:** Credit purchases may be used instead of cost of sales (figures will be the same if stock is constant).

**Note 3:** If there is a change in number of issued shares during a financial year, the weighted-average number of shares is used.
`.trim(),

  "accounting-p2": `
## Financial Indicator Formula Sheet

**Profitability**

$$\\frac{\\text{Gross profit}}{\\text{Sales}} \\times 100 \\qquad \\frac{\\text{Gross profit}}{\\text{Cost of sales}} \\times 100$$

$$\\frac{\\text{Net profit before tax}}{\\text{Sales}} \\times 100 \\qquad \\frac{\\text{Net profit after tax}}{\\text{Sales}} \\times 100$$

$$\\frac{\\text{Operating expenses}}{\\text{Sales}} \\times 100 \\qquad \\frac{\\text{Operating profit}}{\\text{Sales}} \\times 100$$

---

**Liquidity & Solvency**

$$\\text{Total assets : Total liabilities} \\qquad \\text{Current assets : Current liabilities}$$

$$\\text{(Current assets} - \\text{Inventories) : Current liabilities} \\qquad \\text{Non-current liabilities : Shareholders' equity}$$

$$\\text{(Trade \\& other receivables} + \\text{Cash \\& cash equivalents) : Current liabilities}$$

---

**Efficiency**

$$\\frac{\\text{Average trading stock} \\times 365}{\\text{Cost of sales}} \\quad \\text{(Note 1)} \\qquad \\frac{\\text{Cost of sales}}{\\text{Average trading stock}}$$

$$\\frac{\\text{Average debtors} \\times 365}{\\text{Credit sales}} \\qquad \\frac{\\text{Average creditors} \\times 365}{\\text{Cost of sales}} \\quad \\text{(Note 2)}$$

---

**Return on Equity / Investment**

$$\\frac{\\text{Net income after tax}}{\\text{Average shareholders' equity}} \\times 100 \\qquad \\frac{\\text{Net income after tax}}{\\text{Number of issued shares}} \\times 100 \\quad \\text{(Note 3)}$$

$$\\frac{\\text{Net income before tax} + \\text{Interest on loans}}{\\text{Average shareholders' equity} + \\text{Average non-current liabilities}} \\times 100$$

---

**Per Share**

$$\\frac{\\text{Shareholders' equity}}{\\text{Number of issued shares}} \\times 100 \\qquad \\frac{\\text{Dividends for the year}}{\\text{Number of issued shares}} \\times 100$$

$$\\frac{\\text{Interim dividends}}{\\text{Number of issued shares}} \\times 100 \\qquad \\frac{\\text{Final dividends}}{\\text{Number of issued shares}} \\times 100$$

---

**Dividend Ratios**

$$\\frac{\\text{Dividends per share}}{\\text{Earnings per share}} \\times 100 \\qquad \\frac{\\text{Dividends for the year}}{\\text{Net income after tax}} \\times 100$$

---

**Break-even**

$$\\frac{\\text{Total fixed costs}}{\\text{Selling price per unit} - \\text{Variable costs per unit}}$$

---

**Note 1:** Trading stock at end of financial year may be used if required. 365 days applicable only if relevant to whole year.

**Note 2:** Credit purchases may be used instead of cost of sales (figures will be the same if stock is constant).

**Note 3:** If there is a change in number of issued shares during a financial year, the weighted-average number of shares is used.
`.trim(),
};
