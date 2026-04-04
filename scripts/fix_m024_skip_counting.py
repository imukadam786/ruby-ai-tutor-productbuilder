import json, sys
sys.stdout.reconfigure(encoding='utf-8')

with open(r"C:\Users\rrazz\Desktop\ai-tutor\data\question-bank.json", encoding='utf-8') as f:
    data = json.load(f)

domain = data['domains']['M024']

# ── 1. Remove the 9 "Nth multiple of X" questions ─────────────────────────────
remove_refs = {'24.24', '24.25', '24.26', '24.27', '24.28',
               '24.32', '24.40', '24.44', '24.46', '24.50'}
domain['questions'] = [q for q in domain['questions']
                       if q['ref'] not in remove_refs]

# ── 2. Add 6 more "count by 6s" questions to bring that pool to 8 ─────────────
new_6s = [
    {
        "ref": "24.51",
        "question": "6, 12, 18, 24, __ \u2014 what is the next number? (Counting by 6s.)",
        "expected": "30",
        "input_type": "numeric",
        "error_signals": ["ERR_SEQ_RULE", "ERR_OFF_BY_ONE"],
        "ruby_prompt": "Count by 6s: 6, 12, 18, 24, 30.",
        "difficulty": 2
    },
    {
        "ref": "24.52",
        "question": "6, __, 18, 24, 30 \u2014 what is the missing number?",
        "expected": "12",
        "input_type": "numeric",
        "error_signals": ["ERR_SEQ_RULE", "ERR_OFF_BY_ONE"],
        "ruby_prompt": "Count by 6s: 6, 12, 18, 24, 30.",
        "difficulty": 2
    },
    {
        "ref": "24.53",
        "question": "Count by 6s: 24, 30, 36, __ \u2014 what comes next?",
        "expected": "42",
        "input_type": "numeric",
        "error_signals": ["ERR_SEQ_RULE", "ERR_OFF_BY_ONE"],
        "ruby_prompt": "Add 6 each time: 36 + 6 = 42.",
        "difficulty": 2
    },
    {
        "ref": "24.54",
        "question": "Count by 6s: 42, 48, 54, __ \u2014 what comes next?",
        "expected": "60",
        "input_type": "numeric",
        "error_signals": ["ERR_SEQ_RULE", "ERR_OFF_BY_ONE"],
        "ruby_prompt": "Add 6 each time: 54 + 6 = 60.",
        "difficulty": 2
    },
    {
        "ref": "24.55",
        "question": "Count backwards by 6s: 48, 42, 36, __ \u2014 what comes next?",
        "expected": "30",
        "input_type": "numeric",
        "error_signals": ["ERR_SEQ_RULE", "ERR_SEQ_DIR"],
        "ruby_prompt": "Subtract 6 each time: 36 - 6 = 30.",
        "difficulty": 3
    },
    {
        "ref": "24.56",
        "question": "__, 12, 18, 24, 30 \u2014 what is the missing first number? (Counting by 6s.)",
        "expected": "6",
        "input_type": "numeric",
        "error_signals": ["ERR_SEQ_RULE", "ERR_OFF_BY_ONE"],
        "ruby_prompt": "Count back by 6: 12 - 6 = 6.",
        "difficulty": 2
    },
]
domain['questions'].extend(new_6s)

# ── Write ──────────────────────────────────────────────────────────────────────
with open(r"C:\Users\rrazz\Desktop\ai-tutor\data\question-bank.json", 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

# ── Verify ─────────────────────────────────────────────────────────────────────
remaining = data['domains']['M024']['questions']
multiples_left = [q for q in remaining if 'multiple' in q.get('question', '').lower()]
new_6s_refs = [q['ref'] for q in remaining if q['ref'].startswith('24.5')]
print(f"Total M024 questions: {len(remaining)}")
print(f"Multiples questions remaining: {len(multiples_left)}")
print(f"New 6s questions added: {new_6s_refs}")
