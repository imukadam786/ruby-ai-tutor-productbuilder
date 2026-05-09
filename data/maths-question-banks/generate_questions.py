import json
import os

BASE_DIR = r"C:/Users/rrazz/Desktop/ai-tutor/data/maths-question-banks"

# ---------------------------------------------------------------------------
# M020 — Two-Digit Addition (gate: "A")
# 25 no-carry + 25 with-carry, all sums ≤ 99, unique stimuli
# ---------------------------------------------------------------------------
def gen_m020():
    questions = []
    seen = set()

    # No-carry pairs: ones digits sum < 10
    no_carry = []
    for a in range(10, 90):
        for b in range(10, 90):
            if a + b <= 99 and (a % 10) + (b % 10) < 10 and (a, b) not in seen and (b, a) not in seen:
                no_carry.append((a, b))
                seen.add((a, b))

    # With-carry pairs: ones digits sum >= 10
    with_carry = []
    for a in range(10, 90):
        for b in range(10, 90):
            if a + b <= 99 and (a % 10) + (b % 10) >= 10 and (a, b) not in seen and (b, a) not in seen:
                with_carry.append((a, b))
                seen.add((a, b))

    # Pick 25 no-carry and 25 with-carry (spread evenly)
    step_nc = max(1, len(no_carry) // 25)
    step_wc = max(1, len(with_carry) // 25)
    selected_nc = no_carry[::step_nc][:25]
    selected_wc = with_carry[::step_wc][:25]
    pairs = selected_nc + selected_wc

    for i, (a, b) in enumerate(pairs[:50]):
        questions.append({
            "id": f"20.{i+1}",
            "domain": "M020",
            "domainTitle": "Two-Digit Addition",
            "gate": "A",
            "stimulus": f"{a} + {b} = ___",
            "question": "Work this out. Type the answer.",
            "answerMode": "numeric",
            "expectedAnswer": a + b,
            "errorSignals": ["ERR_ADD_TENS", "ERR_PLACE_VALUE"],
            "passThreshold": 0.8
        })
    return questions

# ---------------------------------------------------------------------------
# M028 — Division Strategies (gate: "B")
# 50 exact divisions, divisors 2-12, dividends up to 144
# ---------------------------------------------------------------------------
def gen_m028():
    questions = []
    seen = set()
    pairs = []

    for divisor in range(2, 13):
        for quotient in range(1, 13):
            dividend = divisor * quotient
            if dividend <= 144 and (dividend, divisor) not in seen:
                pairs.append((dividend, divisor, quotient))
                seen.add((dividend, divisor))

    # Spread across divisors; ensure variety
    # Sort and pick 50 spread across all divisors
    from itertools import cycle
    by_divisor = {d: [] for d in range(2, 13)}
    for dividend, divisor, quotient in pairs:
        by_divisor[divisor].append((dividend, divisor, quotient))

    selected = []
    divisor_cycle = cycle(range(2, 13))
    used = {d: 0 for d in range(2, 13)}
    while len(selected) < 50:
        d = next(divisor_cycle)
        idx = used[d]
        if idx < len(by_divisor[d]):
            selected.append(by_divisor[d][idx])
            used[d] += 1
        if all(used[d] >= len(by_divisor[d]) for d in range(2, 13)):
            break

    for i, (dividend, divisor, quotient) in enumerate(selected[:50]):
        questions.append({
            "id": f"28.{i+1}",
            "domain": "M028",
            "domainTitle": "Division Strategies",
            "gate": "B",
            "stimulus": f"{dividend} \u00f7 {divisor} = ___",
            "question": "Work this out. Type the answer.",
            "answerMode": "numeric",
            "expectedAnswer": quotient,
            "errorSignals": ["ERR_DIV_MULT", "ERR_REMAINDER"],
            "passThreshold": 0.8
        })
    return questions

# ---------------------------------------------------------------------------
# M029 — Fractions Equivalence (gate: "B")
# 50 questions: a/b = ___/c
# ---------------------------------------------------------------------------
def gen_m029():
    questions = []
    base_fractions = [
        (1, 2), (1, 3), (2, 3), (1, 4), (3, 4),
        (1, 5), (2, 5), (3, 5), (4, 5)
    ]
    seen = set()
    candidates = []

    for a, b in base_fractions:
        for multiplier in range(2, 13):
            c = b * multiplier
            answer = a * multiplier
            stimulus = f"{a}/{b} = ___/{c}"
            if stimulus not in seen:
                seen.add(stimulus)
                candidates.append((a, b, c, answer, stimulus))

    # Cycle through base fractions to get variety
    from itertools import cycle
    by_frac = {(a, b): [] for a, b in base_fractions}
    for item in candidates:
        a, b = item[0], item[1]
        by_frac[(a, b)].append(item)

    selected = []
    frac_cycle = cycle(base_fractions)
    used = {f: 0 for f in base_fractions}
    while len(selected) < 50:
        f = next(frac_cycle)
        idx = used[f]
        if idx < len(by_frac[f]):
            selected.append(by_frac[f][idx])
            used[f] += 1
        if all(used[f] >= len(by_frac[f]) for f in base_fractions):
            break

    for i, (a, b, c, answer, stimulus) in enumerate(selected[:50]):
        questions.append({
            "id": f"29.{i+1}",
            "domain": "M029",
            "domainTitle": "Fractions \u2014 Number Line and Equivalence",
            "gate": "B",
            "stimulus": stimulus,
            "question": "Fill in the missing number to make an equivalent fraction.",
            "answerMode": "numeric",
            "expectedAnswer": answer,
            "errorSignals": ["ERR_EQUIV_MULT", "ERR_DENOM_ADD"],
            "passThreshold": 0.8
        })
    return questions

# ---------------------------------------------------------------------------
# M031 — Percentages (gate: "B")
# 50 questions: percentages of amounts giving whole number answers
# ---------------------------------------------------------------------------
def gen_m031():
    questions = []
    seen = set()
    candidates = []

    pct_configs = [
        (10, list(range(10, 201, 10))),
        (20, list(range(10, 101, 5))),
        (25, list(range(4, 101, 4))),
        (50, list(range(2, 101, 2))),
        (5,  list(range(20, 201, 20))),
        (15, list(range(20, 201, 20))),
    ]

    for pct, amounts in pct_configs:
        for amt in amounts:
            result = pct * amt // 100
            if result == pct * amt / 100 and result > 0:
                stimulus = f"{pct}% of {amt}"
                if stimulus not in seen:
                    seen.add(stimulus)
                    candidates.append((pct, amt, result, stimulus))

    # Spread across percentages
    from itertools import cycle
    pcts = [10, 20, 25, 50, 5, 15]
    by_pct = {p: [] for p in pcts}
    for item in candidates:
        by_pct[item[0]].append(item)

    selected = []
    pct_cycle = cycle(pcts)
    used = {p: 0 for p in pcts}
    while len(selected) < 50:
        p = next(pct_cycle)
        idx = used[p]
        if idx < len(by_pct[p]):
            selected.append(by_pct[p][idx])
            used[p] += 1
        if all(used[p] >= len(by_pct[p]) for p in pcts):
            break

    for i, (pct, amt, result, stimulus) in enumerate(selected[:50]):
        questions.append({
            "id": f"31.{i+1}",
            "domain": "M031",
            "domainTitle": "Percentages",
            "gate": "B",
            "stimulus": stimulus,
            "question": "Work out this percentage.",
            "answerMode": "numeric",
            "expectedAnswer": result,
            "errorSignals": ["ERR_PCT_DECIMAL", "ERR_PCT_OF_AMOUNT"],
            "passThreshold": 0.8
        })
    return questions

# ---------------------------------------------------------------------------
# M032 — Negative Number Operations (gate: "C")
# 50 questions: mix of neg+pos, pos+neg, neg-neg, pos-neg
# ---------------------------------------------------------------------------
def gen_m032():
    questions = []
    seen = set()
    candidates = []

    # neg + pos: -a + b = b-a
    for a in range(1, 13):
        for b in range(1, 15):
            result = -a + b
            stimulus = f"\u2212{a} + {b} = ___"
            if stimulus not in seen:
                seen.add(stimulus)
                candidates.append(("neg_plus_pos", stimulus, result))

    # pos + neg: a + (-b) = a-b
    for a in range(1, 13):
        for b in range(1, 15):
            result = a - b
            stimulus = f"{a} + (\u2212{b}) = ___"
            if stimulus not in seen:
                seen.add(stimulus)
                candidates.append(("pos_plus_neg", stimulus, result))

    # neg - neg: -a - (-b) = b-a
    for a in range(1, 10):
        for b in range(1, 10):
            result = -a + b
            stimulus = f"\u2212{a} \u2212 (\u2212{b}) = ___"
            if stimulus not in seen:
                seen.add(stimulus)
                candidates.append(("neg_minus_neg", stimulus, result))

    # pos - neg: a - (-b) = a+b
    for a in range(1, 10):
        for b in range(1, 10):
            result = a + b
            stimulus = f"{a} \u2212 (\u2212{b}) = ___"
            if stimulus not in seen:
                seen.add(stimulus)
                candidates.append(("pos_minus_neg", stimulus, result))

    # Spread across types
    from itertools import cycle
    types = ["neg_plus_pos", "pos_plus_neg", "neg_minus_neg", "pos_minus_neg"]
    by_type = {t: [] for t in types}
    for item in candidates:
        by_type[item[0]].append(item)

    selected = []
    type_cycle = cycle(types)
    used = {t: 0 for t in types}
    while len(selected) < 50:
        t = next(type_cycle)
        idx = used[t]
        if idx < len(by_type[t]):
            selected.append(by_type[t][idx])
            used[t] += 1
        if all(used[t] >= len(by_type[t]) for t in types):
            break

    for i, (_, stimulus, result) in enumerate(selected[:50]):
        questions.append({
            "id": f"32.{i+1}",
            "domain": "M032",
            "domainTitle": "Negative Number Operations",
            "gate": "C",
            "stimulus": stimulus,
            "question": "Work this out. Type the answer.",
            "answerMode": "numeric",
            "expectedAnswer": result,
            "errorSignals": ["ERR_INTEGER_SIGN", "ERR_NEG_ADD"],
            "passThreshold": 0.8
        })
    return questions

# ---------------------------------------------------------------------------
# M033 — Expanding Brackets (gate: "C")
# 50 questions: a(x + b) and a(x - b)
# ---------------------------------------------------------------------------
def gen_m033():
    questions = []
    seen = set()
    candidates = []

    for a in range(2, 10):
        for b in range(1, 13):
            # a(x + b)
            stimulus = f"{a}(x + {b})"
            answer = f"{a}x + {a*b}"
            if stimulus not in seen:
                seen.add(stimulus)
                candidates.append(("+", stimulus, answer))

            # a(x - b)
            stimulus2 = f"{a}(x \u2212 {b})"
            answer2 = f"{a}x \u2212 {a*b}"
            if stimulus2 not in seen:
                seen.add(stimulus2)
                candidates.append(("-", stimulus2, answer2))

    # Alternate + and -
    from itertools import cycle
    by_sign = {"+": [], "-": []}
    for item in candidates:
        by_sign[item[0]].append(item)

    selected = []
    sign_cycle = cycle(["+", "-"])
    used = {s: 0 for s in ["+", "-"]}
    while len(selected) < 50:
        s = next(sign_cycle)
        idx = used[s]
        if idx < len(by_sign[s]):
            selected.append(by_sign[s][idx])
            used[s] += 1
        if all(used[s] >= len(by_sign[s]) for s in ["+", "-"]):
            break

    for i, (_, stimulus, answer) in enumerate(selected[:50]):
        questions.append({
            "id": f"33.{i+1}",
            "domain": "M033",
            "domainTitle": "Number Patterns and Expanding Brackets",
            "gate": "C",
            "stimulus": stimulus,
            "question": "Expand the brackets.",
            "answerMode": "text",
            "expectedAnswer": answer,
            "errorSignals": ["ERR_EXPAND", "ERR_SIGN_DROP"],
            "passThreshold": 0.8
        })
    return questions

# ---------------------------------------------------------------------------
# M034 — Advanced Linear Equations (gate: "C")
# 50 questions: ax + b = c, x is positive integer 1-12
# ---------------------------------------------------------------------------
def gen_m034():
    questions = []
    seen = set()
    candidates = []

    for a in range(2, 10):
        for x in range(1, 13):
            for b in range(-15, 20):
                c = a * x + b
                if c > 0 and b != 0:
                    if b > 0:
                        stimulus = f"{a}x + {b} = {c}"
                    else:
                        stimulus = f"{a}x \u2212 {abs(b)} = {c}"
                    if stimulus not in seen:
                        seen.add(stimulus)
                        candidates.append((stimulus, x, a, b, c))

    # Spread across coefficients a
    from itertools import cycle
    coeffs = list(range(2, 10))
    by_coeff = {a: [] for a in coeffs}
    for item in candidates:
        by_coeff[item[2]].append(item)

    selected = []
    coeff_cycle = cycle(coeffs)
    used = {a: 0 for a in coeffs}
    while len(selected) < 50:
        a = next(coeff_cycle)
        idx = used[a]
        if idx < len(by_coeff[a]):
            selected.append(by_coeff[a][idx])
            used[a] += 1
        if all(used[a] >= len(by_coeff[a]) for a in coeffs):
            break

    for i, (stimulus, x, a, b, c) in enumerate(selected[:50]):
        questions.append({
            "id": f"34.{i+1}",
            "domain": "M034",
            "domainTitle": "Advanced Linear Equations",
            "gate": "C",
            "stimulus": stimulus,
            "question": "Solve for x. Type the value of x.",
            "answerMode": "numeric",
            "expectedAnswer": x,
            "errorSignals": ["ERR_STEP_SKIP", "ERR_OP_ERROR"],
            "passThreshold": 0.8
        })
    return questions

# ---------------------------------------------------------------------------
# Main — generate all domains, then append to each bank file
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    print("Generating questions for all 7 domains...")

    domains = {
        "M020": gen_m020(),
        "M028": gen_m028(),
        "M029": gen_m029(),
        "M031": gen_m031(),
        "M032": gen_m032(),
        "M033": gen_m033(),
        "M034": gen_m034(),
    }

    for domain, qs in domains.items():
        print(f"  {domain}: {len(qs)} questions generated")

    print("\nAppending to bank files...")

    for n in range(1, 51):
        filepath = os.path.join(BASE_DIR, f"{n}.json")
        with open(filepath, "r", encoding="utf-8") as f:
            bank = json.load(f)

        idx = n - 1  # 0-based index
        added = 0
        for domain, qs in domains.items():
            if idx < len(qs):
                bank.append(qs[idx])
                added += 1

        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(bank, f, ensure_ascii=False, indent=2)

        print(f"  Bank {n:02d}: appended {added} questions (now {len(bank)} total)")

    print("\nDone! All 50 bank files updated.")
    total = sum(len(qs) for qs in domains.values())
    print(f"Total questions generated: {total} ({len(domains)} domains x 50 each)")
