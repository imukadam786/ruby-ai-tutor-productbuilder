import json, sys
sys.stdout.reconfigure(encoding='utf-8')

with open(r"C:\Users\rrazz\Desktop\ai-tutor\data\question-bank.json", encoding='utf-8') as f:
    data = json.load(f)

domains = data['domains']

# ── 1. M007: remove L7.T1.A1 and L7.T1.A2 from skill_ids ─────────────────────
domains['M007']['skill_ids'] = [s for s in domains['M007']['skill_ids']
                                 if s not in ('L7.T1.A1', 'L7.T1.A2')]

# ── 2. M008: remove L9.T1.A1 from skill_ids ───────────────────────────────────
domains['M008']['skill_ids'] = [s for s in domains['M008']['skill_ids']
                                 if s != 'L9.T1.A1']

# ── 3. M030: add L9.T1.A1, tag all existing questions with subtype ─────────────
domains['M030']['skill_ids'] = ['L9.T1.A1'] + domains['M030']['skill_ids']

SUBTYPE_MAP = {
    '30.12': 'add_same', '30.13': 'add_same', '30.14': 'add_same',
    '30.15': 'add_same', '30.16': 'add_same', '30.17': 'add_same',
    '30.41': 'add_same',
    '30.1':  'add_diff', '30.2':  'add_diff', '30.3':  'add_diff',
    '30.18': 'add_diff', '30.19': 'add_diff', '30.20': 'add_diff',
    '30.21': 'add_diff', '30.22': 'add_diff', '30.23': 'add_diff',
    '30.24': 'add_diff', '30.25': 'add_diff', '30.26': 'add_diff',
    '30.27': 'add_diff', '30.28': 'add_diff', '30.29': 'add_diff',
    '30.30': 'add_diff', '30.42': 'add_diff', '30.43': 'add_diff',
    '30.44': 'add_diff', '30.45': 'add_diff', '30.46': 'add_diff',
    '30.47': 'add_diff', '30.48': 'add_diff', '30.49': 'add_diff',
    '30.50': 'add_diff',
    '30.4':  'mult_whole', '30.5':  'mult_whole', '30.31': 'mult_whole',
    '30.6':  'mult_frac',  '30.7':  'mult_frac',  '30.32': 'mult_frac',
    '30.33': 'mult_frac',  '30.34': 'mult_frac',  '30.35': 'mult_frac',
    '30.8':  'div_whole',  '30.9':  'div_whole',
    '30.36': 'div_whole',  '30.37': 'div_whole',
    '30.10': 'div_frac',   '30.11': 'div_frac',   '30.38': 'div_frac',
    '30.39': 'div_frac',   '30.40': 'div_frac',
}
for q in domains['M030']['questions']:
    if q['ref'] in SUBTYPE_MAP:
        q['subtype'] = SUBTYPE_MAP[q['ref']]

# ── 4. M030: add questions to thin pools ──────────────────────────────────────
new_m030 = [
    # add_same (8 more)
    {"ref":"30.51","question":"1/3 + 1/3 = ?","expected":"2/3","input_type":"text","subtype":"add_same","error_signals":["ERR_ADD_SAME_DENOM"],"ruby_prompt":"Same denominator: just add the tops. 1+1=2, keep /3.","difficulty":1},
    {"ref":"30.52","question":"2/7 + 3/7 = ?","expected":"5/7","input_type":"text","subtype":"add_same","error_signals":["ERR_ADD_SAME_DENOM"],"ruby_prompt":"Same denominator: 2+3=5, keep /7.","difficulty":1},
    {"ref":"30.53","question":"1/5 + 2/5 = ?","expected":"3/5","input_type":"text","subtype":"add_same","error_signals":["ERR_ADD_SAME_DENOM"],"ruby_prompt":"Same denominator: 1+2=3, keep /5.","difficulty":1},
    {"ref":"30.54","question":"1/6 + 4/6 = ?","expected":"5/6","input_type":"text","subtype":"add_same","error_signals":["ERR_ADD_SAME_DENOM"],"ruby_prompt":"Same denominator: 1+4=5, keep /6.","difficulty":1},
    {"ref":"30.55","question":"5/8 \u2212 1/8 = ?","expected":"4/8","input_type":"text","subtype":"add_same","error_signals":["ERR_SUB_SAME_DENOM"],"ruby_prompt":"Same denominator: 5-1=4, keep /8.","difficulty":1},
    {"ref":"30.56","question":"4/5 \u2212 2/5 = ?","expected":"2/5","input_type":"text","subtype":"add_same","error_signals":["ERR_SUB_SAME_DENOM"],"ruby_prompt":"Same denominator: 4-2=2, keep /5.","difficulty":1},
    {"ref":"30.57","question":"7/9 \u2212 4/9 = ?","expected":"3/9","input_type":"text","subtype":"add_same","error_signals":["ERR_SUB_SAME_DENOM"],"ruby_prompt":"Same denominator: 7-4=3, keep /9.","difficulty":1},
    {"ref":"30.58","question":"4/9 + 2/9 = ?","expected":"6/9","input_type":"text","subtype":"add_same","error_signals":["ERR_ADD_SAME_DENOM"],"ruby_prompt":"Same denominator: 4+2=6, keep /9.","difficulty":1},
    # mult_whole (12 more)
    {"ref":"30.59","question":"1/5 \u00d7 10 = ?","expected":"2","input_type":"numeric","subtype":"mult_whole","error_signals":["ERR_MULT_FRAC"],"ruby_prompt":"1/5 of 10: divide 10 by 5, then multiply by 1.","difficulty":2},
    {"ref":"30.60","question":"3/4 \u00d7 8 = ?","expected":"6","input_type":"numeric","subtype":"mult_whole","error_signals":["ERR_MULT_FRAC"],"ruby_prompt":"3/4 of 8: 8\u00f74=2, then 2\u00d73=6.","difficulty":2},
    {"ref":"30.61","question":"2/5 \u00d7 10 = ?","expected":"4","input_type":"numeric","subtype":"mult_whole","error_signals":["ERR_MULT_FRAC"],"ruby_prompt":"2/5 of 10: 10\u00f75=2, then 2\u00d72=4.","difficulty":2},
    {"ref":"30.62","question":"1/3 \u00d7 9 = ?","expected":"3","input_type":"numeric","subtype":"mult_whole","error_signals":["ERR_MULT_FRAC"],"ruby_prompt":"1/3 of 9: 9\u00f73=3.","difficulty":1},
    {"ref":"30.63","question":"3/8 \u00d7 8 = ?","expected":"3","input_type":"numeric","subtype":"mult_whole","error_signals":["ERR_MULT_FRAC"],"ruby_prompt":"3/8 of 8: 8\u00f78=1, then 1\u00d73=3.","difficulty":2},
    {"ref":"30.64","question":"1/6 \u00d7 12 = ?","expected":"2","input_type":"numeric","subtype":"mult_whole","error_signals":["ERR_MULT_FRAC"],"ruby_prompt":"1/6 of 12: 12\u00f76=2.","difficulty":2},
    {"ref":"30.65","question":"3/5 \u00d7 5 = ?","expected":"3","input_type":"numeric","subtype":"mult_whole","error_signals":["ERR_MULT_FRAC"],"ruby_prompt":"3/5 of 5: 5\u00f75=1, then 1\u00d73=3.","difficulty":1},
    {"ref":"30.66","question":"5/6 \u00d7 6 = ?","expected":"5","input_type":"numeric","subtype":"mult_whole","error_signals":["ERR_MULT_FRAC"],"ruby_prompt":"5/6 of 6: 6\u00f76=1, then 1\u00d75=5.","difficulty":1},
    {"ref":"30.67","question":"4/7 \u00d7 7 = ?","expected":"4","input_type":"numeric","subtype":"mult_whole","error_signals":["ERR_MULT_FRAC"],"ruby_prompt":"4/7 of 7: 7\u00f77=1, then 1\u00d74=4.","difficulty":1},
    {"ref":"30.68","question":"1/4 \u00d7 12 = ?","expected":"3","input_type":"numeric","subtype":"mult_whole","error_signals":["ERR_MULT_FRAC"],"ruby_prompt":"1/4 of 12: 12\u00f74=3.","difficulty":2},
    {"ref":"30.69","question":"2/3 \u00d7 9 = ?","expected":"6","input_type":"numeric","subtype":"mult_whole","error_signals":["ERR_MULT_FRAC"],"ruby_prompt":"2/3 of 9: 9\u00f73=3, then 3\u00d72=6.","difficulty":2},
    {"ref":"30.70","question":"2/7 \u00d7 7 = ?","expected":"2","input_type":"numeric","subtype":"mult_whole","error_signals":["ERR_MULT_FRAC"],"ruby_prompt":"2/7 of 7: 7\u00f77=1, then 1\u00d72=2.","difficulty":1},
    # mult_frac (8 more)
    {"ref":"30.71","question":"1/4 \u00d7 1/2 = ?","expected":"1/8","input_type":"text","subtype":"mult_frac","error_signals":["ERR_MULT_FRAC"],"ruby_prompt":"Multiply tops: 1\u00d71=1. Multiply bottoms: 4\u00d72=8. Answer: 1/8.","difficulty":3},
    {"ref":"30.72","question":"2/5 \u00d7 1/3 = ?","expected":"2/15","input_type":"text","subtype":"mult_frac","error_signals":["ERR_MULT_FRAC"],"ruby_prompt":"Tops: 2\u00d71=2. Bottoms: 5\u00d73=15. Answer: 2/15.","difficulty":3},
    {"ref":"30.73","question":"3/4 \u00d7 2/5 = ?","expected":"3/10","input_type":"text","subtype":"mult_frac","error_signals":["ERR_MULT_FRAC"],"ruby_prompt":"Tops: 3\u00d72=6. Bottoms: 4\u00d75=20. Simplify 6/20 = 3/10.","difficulty":3},
    {"ref":"30.74","question":"1/3 \u00d7 3/5 = ?","expected":"1/5","input_type":"text","subtype":"mult_frac","error_signals":["ERR_MULT_FRAC"],"ruby_prompt":"Tops: 1\u00d73=3. Bottoms: 3\u00d75=15. Simplify 3/15 = 1/5.","difficulty":3},
    {"ref":"30.75","question":"5/6 \u00d7 3/5 = ?","expected":"1/2","input_type":"text","subtype":"mult_frac","error_signals":["ERR_MULT_FRAC"],"ruby_prompt":"Tops: 5\u00d73=15. Bottoms: 6\u00d75=30. Simplify 15/30 = 1/2.","difficulty":4},
    {"ref":"30.76","question":"3/8 \u00d7 4/9 = ?","expected":"1/6","input_type":"text","subtype":"mult_frac","error_signals":["ERR_MULT_FRAC"],"ruby_prompt":"Tops: 3\u00d74=12. Bottoms: 8\u00d79=72. Simplify 12/72 = 1/6.","difficulty":4},
    {"ref":"30.77","question":"1/2 \u00d7 4/5 = ?","expected":"2/5","input_type":"text","subtype":"mult_frac","error_signals":["ERR_MULT_FRAC"],"ruby_prompt":"Tops: 1\u00d74=4. Bottoms: 2\u00d75=10. Simplify 4/10 = 2/5.","difficulty":3},
    {"ref":"30.78","question":"2/3 \u00d7 3/8 = ?","expected":"1/4","input_type":"text","subtype":"mult_frac","error_signals":["ERR_MULT_FRAC"],"ruby_prompt":"Tops: 2\u00d73=6. Bottoms: 3\u00d78=24. Simplify 6/24 = 1/4.","difficulty":4},
    # div_whole (10 more)
    {"ref":"30.79","question":"1/2 \u00f7 2 = ?","expected":"1/4","input_type":"text","subtype":"div_whole","error_signals":["ERR_DIV_FRAC"],"ruby_prompt":"Dividing by 2: multiply the denominator by 2. 1/(2\u00d72)=1/4.","difficulty":3},
    {"ref":"30.80","question":"2/5 \u00f7 2 = ?","expected":"1/5","input_type":"text","subtype":"div_whole","error_signals":["ERR_DIV_FRAC"],"ruby_prompt":"2/5 \u00f7 2 = 2/10 = 1/5.","difficulty":3},
    {"ref":"30.81","question":"3/4 \u00f7 6 = ?","expected":"1/8","input_type":"text","subtype":"div_whole","error_signals":["ERR_DIV_FRAC"],"ruby_prompt":"3/4 \u00f7 6 = 3/24 = 1/8.","difficulty":3},
    {"ref":"30.82","question":"4/5 \u00f7 4 = ?","expected":"1/5","input_type":"text","subtype":"div_whole","error_signals":["ERR_DIV_FRAC"],"ruby_prompt":"4/5 \u00f7 4 = 4/20 = 1/5.","difficulty":3},
    {"ref":"30.83","question":"5/6 \u00f7 5 = ?","expected":"1/6","input_type":"text","subtype":"div_whole","error_signals":["ERR_DIV_FRAC"],"ruby_prompt":"5/6 \u00f7 5 = 5/30 = 1/6.","difficulty":3},
    {"ref":"30.84","question":"2/3 \u00f7 2 = ?","expected":"1/3","input_type":"text","subtype":"div_whole","error_signals":["ERR_DIV_FRAC"],"ruby_prompt":"2/3 \u00f7 2 = 2/6 = 1/3.","difficulty":2},
    {"ref":"30.85","question":"7/8 \u00f7 7 = ?","expected":"1/8","input_type":"text","subtype":"div_whole","error_signals":["ERR_DIV_FRAC"],"ruby_prompt":"7/8 \u00f7 7 = 7/56 = 1/8.","difficulty":3},
    {"ref":"30.86","question":"3/5 \u00f7 3 = ?","expected":"1/5","input_type":"text","subtype":"div_whole","error_signals":["ERR_DIV_FRAC"],"ruby_prompt":"3/5 \u00f7 3 = 3/15 = 1/5.","difficulty":2},
    {"ref":"30.87","question":"1/4 \u00f7 2 = ?","expected":"1/8","input_type":"text","subtype":"div_whole","error_signals":["ERR_DIV_FRAC"],"ruby_prompt":"1/4 \u00f7 2 = 1/8.","difficulty":2},
    {"ref":"30.88","question":"6/7 \u00f7 6 = ?","expected":"1/7","input_type":"text","subtype":"div_whole","error_signals":["ERR_DIV_FRAC"],"ruby_prompt":"6/7 \u00f7 6 = 6/42 = 1/7.","difficulty":3},
    # div_frac (9 more)
    {"ref":"30.89","question":"3/4 \u00f7 3/8 = ? (Multiply by the reciprocal.)","expected":"2","input_type":"numeric","subtype":"div_frac","error_signals":["ERR_DIV_FRAC","ERR_INVERT"],"ruby_prompt":"3/4 \u00d7 8/3 = 24/12 = 2.","difficulty":4},
    {"ref":"30.90","question":"2/3 \u00f7 1/3 = ? (Multiply by the reciprocal.)","expected":"2","input_type":"numeric","subtype":"div_frac","error_signals":["ERR_DIV_FRAC","ERR_INVERT"],"ruby_prompt":"2/3 \u00d7 3/1 = 6/3 = 2.","difficulty":3},
    {"ref":"30.91","question":"1/2 \u00f7 1/6 = ? (Multiply by the reciprocal.)","expected":"3","input_type":"numeric","subtype":"div_frac","error_signals":["ERR_DIV_FRAC","ERR_INVERT"],"ruby_prompt":"1/2 \u00d7 6/1 = 6/2 = 3.","difficulty":3},
    {"ref":"30.92","question":"3/5 \u00f7 1/5 = ? (Multiply by the reciprocal.)","expected":"3","input_type":"numeric","subtype":"div_frac","error_signals":["ERR_DIV_FRAC","ERR_INVERT"],"ruby_prompt":"3/5 \u00d7 5/1 = 15/5 = 3.","difficulty":3},
    {"ref":"30.93","question":"4/7 \u00f7 2/7 = ? (Multiply by the reciprocal.)","expected":"2","input_type":"numeric","subtype":"div_frac","error_signals":["ERR_DIV_FRAC","ERR_INVERT"],"ruby_prompt":"4/7 \u00d7 7/2 = 28/14 = 2.","difficulty":3},
    {"ref":"30.94","question":"1/4 \u00f7 1/8 = ? (Multiply by the reciprocal.)","expected":"2","input_type":"numeric","subtype":"div_frac","error_signals":["ERR_DIV_FRAC","ERR_INVERT"],"ruby_prompt":"1/4 \u00d7 8/1 = 8/4 = 2.","difficulty":3},
    {"ref":"30.95","question":"5/6 \u00f7 1/6 = ? (Multiply by the reciprocal.)","expected":"5","input_type":"numeric","subtype":"div_frac","error_signals":["ERR_DIV_FRAC","ERR_INVERT"],"ruby_prompt":"5/6 \u00d7 6/1 = 30/6 = 5.","difficulty":3},
    {"ref":"30.96","question":"7/8 \u00f7 7/16 = ? (Multiply by the reciprocal.)","expected":"2","input_type":"numeric","subtype":"div_frac","error_signals":["ERR_DIV_FRAC","ERR_INVERT"],"ruby_prompt":"7/8 \u00d7 16/7 = 112/56 = 2.","difficulty":4},
    {"ref":"30.97","question":"2/5 \u00f7 1/10 = ? (Multiply by the reciprocal.)","expected":"4","input_type":"numeric","subtype":"div_frac","error_signals":["ERR_DIV_FRAC","ERR_INVERT"],"ruby_prompt":"2/5 \u00d7 10/1 = 20/5 = 4.","difficulty":3},
]
domains['M030']['questions'].extend(new_m030)

# ── 5. M028: add 20 remainder/quotient questions ───────────────────────────────
new_m028 = [
    {"ref":"28.51","question":"13 \u00f7 4: what is the quotient (whole number answer only)?","expected":"3","input_type":"numeric","error_signals":["ERR_REMAINDER_IGNORE","ERR_DIV_OFF"],"ruby_prompt":"4\u00d73=12, less than 13. Quotient is 3.","difficulty":2},
    {"ref":"28.52","question":"13 \u00f7 4 = 3 remainder __. What is the remainder?","expected":"1","input_type":"numeric","error_signals":["ERR_REMAINDER_CALC","ERR_DIV_OFF"],"ruby_prompt":"4\u00d73=12. Subtract: 13-12=1. Remainder is 1.","difficulty":2},
    {"ref":"28.53","question":"17 \u00f7 5: what is the quotient (whole number answer only)?","expected":"3","input_type":"numeric","error_signals":["ERR_REMAINDER_IGNORE","ERR_DIV_OFF"],"ruby_prompt":"5\u00d73=15, less than 17. Quotient is 3.","difficulty":2},
    {"ref":"28.54","question":"17 \u00f7 5 = 3 remainder __. What is the remainder?","expected":"2","input_type":"numeric","error_signals":["ERR_REMAINDER_CALC","ERR_DIV_OFF"],"ruby_prompt":"5\u00d73=15. Subtract: 17-15=2. Remainder is 2.","difficulty":2},
    {"ref":"28.55","question":"19 \u00f7 3: what is the quotient (whole number answer only)?","expected":"6","input_type":"numeric","error_signals":["ERR_REMAINDER_IGNORE","ERR_DIV_OFF"],"ruby_prompt":"3\u00d76=18, less than 19. Quotient is 6.","difficulty":2},
    {"ref":"28.56","question":"19 \u00f7 3 = 6 remainder __. What is the remainder?","expected":"1","input_type":"numeric","error_signals":["ERR_REMAINDER_CALC","ERR_DIV_OFF"],"ruby_prompt":"3\u00d76=18. Subtract: 19-18=1. Remainder is 1.","difficulty":2},
    {"ref":"28.57","question":"22 \u00f7 7: what is the quotient (whole number answer only)?","expected":"3","input_type":"numeric","error_signals":["ERR_REMAINDER_IGNORE","ERR_DIV_OFF"],"ruby_prompt":"7\u00d73=21, less than 22. Quotient is 3.","difficulty":2},
    {"ref":"28.58","question":"22 \u00f7 7 = 3 remainder __. What is the remainder?","expected":"1","input_type":"numeric","error_signals":["ERR_REMAINDER_CALC","ERR_DIV_OFF"],"ruby_prompt":"7\u00d73=21. Subtract: 22-21=1. Remainder is 1.","difficulty":2},
    {"ref":"28.59","question":"29 \u00f7 4: what is the quotient (whole number answer only)?","expected":"7","input_type":"numeric","error_signals":["ERR_REMAINDER_IGNORE","ERR_DIV_OFF"],"ruby_prompt":"4\u00d77=28, less than 29. Quotient is 7.","difficulty":2},
    {"ref":"28.60","question":"29 \u00f7 4 = 7 remainder __. What is the remainder?","expected":"1","input_type":"numeric","error_signals":["ERR_REMAINDER_CALC","ERR_DIV_OFF"],"ruby_prompt":"4\u00d77=28. Subtract: 29-28=1. Remainder is 1.","difficulty":2},
    {"ref":"28.61","question":"31 \u00f7 6: what is the quotient (whole number answer only)?","expected":"5","input_type":"numeric","error_signals":["ERR_REMAINDER_IGNORE","ERR_DIV_OFF"],"ruby_prompt":"6\u00d75=30, less than 31. Quotient is 5.","difficulty":2},
    {"ref":"28.62","question":"31 \u00f7 6 = 5 remainder __. What is the remainder?","expected":"1","input_type":"numeric","error_signals":["ERR_REMAINDER_CALC","ERR_DIV_OFF"],"ruby_prompt":"6\u00d75=30. Subtract: 31-30=1. Remainder is 1.","difficulty":2},
    {"ref":"28.63","question":"38 \u00f7 7: what is the quotient (whole number answer only)?","expected":"5","input_type":"numeric","error_signals":["ERR_REMAINDER_IGNORE","ERR_DIV_OFF"],"ruby_prompt":"7\u00d75=35, less than 38. Quotient is 5.","difficulty":3},
    {"ref":"28.64","question":"38 \u00f7 7 = 5 remainder __. What is the remainder?","expected":"3","input_type":"numeric","error_signals":["ERR_REMAINDER_CALC","ERR_DIV_OFF"],"ruby_prompt":"7\u00d75=35. Subtract: 38-35=3. Remainder is 3.","difficulty":3},
    {"ref":"28.65","question":"43 \u00f7 8: what is the quotient (whole number answer only)?","expected":"5","input_type":"numeric","error_signals":["ERR_REMAINDER_IGNORE","ERR_DIV_OFF"],"ruby_prompt":"8\u00d75=40, less than 43. Quotient is 5.","difficulty":3},
    {"ref":"28.66","question":"43 \u00f7 8 = 5 remainder __. What is the remainder?","expected":"3","input_type":"numeric","error_signals":["ERR_REMAINDER_CALC","ERR_DIV_OFF"],"ruby_prompt":"8\u00d75=40. Subtract: 43-40=3. Remainder is 3.","difficulty":3},
    {"ref":"28.67","question":"53 \u00f7 9: what is the quotient (whole number answer only)?","expected":"5","input_type":"numeric","error_signals":["ERR_REMAINDER_IGNORE","ERR_DIV_OFF"],"ruby_prompt":"9\u00d75=45, less than 53. Quotient is 5.","difficulty":3},
    {"ref":"28.68","question":"53 \u00f7 9 = 5 remainder __. What is the remainder?","expected":"8","input_type":"numeric","error_signals":["ERR_REMAINDER_CALC","ERR_DIV_OFF"],"ruby_prompt":"9\u00d75=45. Subtract: 53-45=8. Remainder is 8.","difficulty":3},
    {"ref":"28.69","question":"61 \u00f7 8: what is the quotient (whole number answer only)?","expected":"7","input_type":"numeric","error_signals":["ERR_REMAINDER_IGNORE","ERR_DIV_OFF"],"ruby_prompt":"8\u00d77=56, less than 61. Quotient is 7.","difficulty":3},
    {"ref":"28.70","question":"61 \u00f7 8 = 7 remainder __. What is the remainder?","expected":"5","input_type":"numeric","error_signals":["ERR_REMAINDER_CALC","ERR_DIV_OFF"],"ruby_prompt":"8\u00d77=56. Subtract: 61-56=5. Remainder is 5.","difficulty":3},
]
domains['M028']['questions'].extend(new_m028)

# ── 6. New M_DIV_SHARE domain ──────────────────────────────────────────────────
def div_q(ref, question, expected, prompt, difficulty):
    return {
        "ref": ref,
        "question": question,
        "expected": str(expected),
        "input_type": "numeric",
        "error_signals": ["ERR_DIV_SHARE", "ERR_DIV_OFF"],
        "ruby_prompt": prompt,
        "difficulty": difficulty
    }

sharing = [
    div_q("DS.1",  "12 apples shared equally among 4 children. How many does each child get?",   "3",  "12 \u00f7 4 = 3.", 1),
    div_q("DS.2",  "15 sweets shared equally among 5 friends. How many does each friend get?",    "3",  "15 \u00f7 5 = 3.", 1),
    div_q("DS.3",  "20 stickers shared equally among 4 children. How many does each child get?",  "5",  "20 \u00f7 4 = 5.", 1),
    div_q("DS.4",  "18 pencils shared equally among 6 students. How many does each student get?", "3",  "18 \u00f7 6 = 3.", 1),
    div_q("DS.5",  "24 grapes shared equally among 8 people. How many does each person get?",     "3",  "24 \u00f7 8 = 3.", 1),
    div_q("DS.6",  "16 cookies shared equally among 4 children. How many does each child get?",   "4",  "16 \u00f7 4 = 4.", 1),
    div_q("DS.7",  "30 marbles shared equally among 5 children. How many does each child get?",   "6",  "30 \u00f7 5 = 6.", 1),
    div_q("DS.8",  "28 stickers shared equally among 7 students. How many does each student get?","4",  "28 \u00f7 7 = 4.", 2),
    div_q("DS.9",  "36 sweets shared equally among 9 friends. How many does each friend get?",    "4",  "36 \u00f7 9 = 4.", 2),
    div_q("DS.10", "42 apples shared equally among 6 people. How many does each person get?",     "7",  "42 \u00f7 6 = 7.", 2),
    div_q("DS.11", "21 books shared equally among 3 shelves. How many books on each shelf?",      "7",  "21 \u00f7 3 = 7.", 1),
    div_q("DS.12", "32 crayons shared equally among 8 children. How many does each child get?",   "4",  "32 \u00f7 8 = 4.", 2),
    div_q("DS.13", "45 biscuits shared equally among 9 plates. How many on each plate?",          "5",  "45 \u00f7 9 = 5.", 2),
    div_q("DS.14", "40 stickers shared equally among 8 children. How many does each child get?",  "5",  "40 \u00f7 8 = 5.", 2),
    div_q("DS.15", "48 grapes shared equally among 6 people. How many does each person get?",     "8",  "48 \u00f7 6 = 8.", 2),
    div_q("DS.16", "35 sweets shared equally among 5 friends. How many does each friend get?",    "7",  "35 \u00f7 5 = 7.", 2),
    div_q("DS.17", "27 pencils shared equally among 9 students. How many does each student get?", "3",  "27 \u00f7 9 = 3.", 2),
    div_q("DS.18", "56 marbles shared equally among 7 children. How many does each child get?",   "8",  "56 \u00f7 7 = 8.", 2),
    div_q("DS.19", "63 books shared equally among 9 shelves. How many books on each shelf?",      "7",  "63 \u00f7 9 = 7.", 2),
    div_q("DS.20", "72 grapes shared equally among 8 people. How many does each person get?",     "9",  "72 \u00f7 8 = 9.", 2),
    div_q("DS.21", "14 crayons shared equally among 2 children. How many does each child get?",   "7",  "14 \u00f7 2 = 7.", 1),
    div_q("DS.22", "18 apples shared equally among 3 people. How many does each person get?",     "6",  "18 \u00f7 3 = 6.", 1),
    div_q("DS.23", "24 cookies shared equally among 6 children. How many does each child get?",   "4",  "24 \u00f7 6 = 4.", 1),
    div_q("DS.24", "33 pencils shared equally among 3 students. How many does each student get?", "11", "33 \u00f7 3 = 11.", 2),
    div_q("DS.25", "44 sweets shared equally among 4 friends. How many does each friend get?",    "11", "44 \u00f7 4 = 11.", 2),
]
grouping = [
    div_q("DS.26", "How many groups of 3 can you make from 12?",  "4",  "12 \u00f7 3 = 4 groups.", 1),
    div_q("DS.27", "How many groups of 4 can you make from 20?",  "5",  "20 \u00f7 4 = 5 groups.", 1),
    div_q("DS.28", "How many groups of 5 can you make from 25?",  "5",  "25 \u00f7 5 = 5 groups.", 1),
    div_q("DS.29", "How many groups of 6 can you make from 18?",  "3",  "18 \u00f7 6 = 3 groups.", 1),
    div_q("DS.30", "How many groups of 7 can you make from 21?",  "3",  "21 \u00f7 7 = 3 groups.", 1),
    div_q("DS.31", "How many groups of 3 can you make from 24?",  "8",  "24 \u00f7 3 = 8 groups.", 1),
    div_q("DS.32", "How many groups of 4 can you make from 32?",  "8",  "32 \u00f7 4 = 8 groups.", 2),
    div_q("DS.33", "How many groups of 5 can you make from 45?",  "9",  "45 \u00f7 5 = 9 groups.", 2),
    div_q("DS.34", "How many groups of 6 can you make from 42?",  "7",  "42 \u00f7 6 = 7 groups.", 2),
    div_q("DS.35", "How many groups of 7 can you make from 56?",  "8",  "56 \u00f7 7 = 8 groups.", 2),
    div_q("DS.36", "How many groups of 8 can you make from 40?",  "5",  "40 \u00f7 8 = 5 groups.", 2),
    div_q("DS.37", "How many groups of 9 can you make from 63?",  "7",  "63 \u00f7 9 = 7 groups.", 2),
    div_q("DS.38", "How many groups of 2 can you make from 16?",  "8",  "16 \u00f7 2 = 8 groups.", 1),
    div_q("DS.39", "How many groups of 3 can you make from 27?",  "9",  "27 \u00f7 3 = 9 groups.", 2),
    div_q("DS.40", "How many groups of 4 can you make from 36?",  "9",  "36 \u00f7 4 = 9 groups.", 2),
    div_q("DS.41", "How many groups of 5 can you make from 35?",  "7",  "35 \u00f7 5 = 7 groups.", 2),
    div_q("DS.42", "How many groups of 6 can you make from 48?",  "8",  "48 \u00f7 6 = 8 groups.", 2),
    div_q("DS.43", "How many groups of 7 can you make from 49?",  "7",  "49 \u00f7 7 = 7 groups.", 2),
    div_q("DS.44", "How many groups of 8 can you make from 64?",  "8",  "64 \u00f7 8 = 8 groups.", 2),
    div_q("DS.45", "How many groups of 9 can you make from 81?",  "9",  "81 \u00f7 9 = 9 groups.", 2),
    div_q("DS.46", "How many groups of 4 can you make from 28?",  "7",  "28 \u00f7 4 = 7 groups.", 2),
    div_q("DS.47", "How many groups of 6 can you make from 54?",  "9",  "54 \u00f7 6 = 9 groups.", 2),
    div_q("DS.48", "How many groups of 8 can you make from 72?",  "9",  "72 \u00f7 8 = 9 groups.", 2),
    div_q("DS.49", "How many groups of 7 can you make from 42?",  "6",  "42 \u00f7 7 = 6 groups.", 2),
    div_q("DS.50", "How many groups of 3 can you make from 33?",  "11", "33 \u00f7 3 = 11 groups.", 2),
]

domains['M_DIV_SHARE'] = {
    "title": "Division as Sharing and Grouping",
    "gate": "G4",
    "skill_ids": ["L7.T1.A1", "L7.T1.A2"],
    "pass_threshold": 0.8,
    "questions_for_mastery": 3,
    "authored_pool": 50,
    "questions": sharing + grouping
}

# ── Write ──────────────────────────────────────────────────────────────────────
with open(r"C:\Users\rrazz\Desktop\ai-tutor\data\question-bank.json", 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

# ── Verify ─────────────────────────────────────────────────────────────────────
from collections import Counter
print("M007 skill_ids:", domains['M007']['skill_ids'])
print("M008 skill_ids:", domains['M008']['skill_ids'])
print("M030 skill_ids:", domains['M030']['skill_ids'])
print("M030 total questions:", len(domains['M030']['questions']))
print("M028 total questions:", len(domains['M028']['questions']))
print("M_DIV_SHARE total questions:", len(domains['M_DIV_SHARE']['questions']))
subtypes = Counter(q.get('subtype', 'UNTAGGED') for q in domains['M030']['questions'])
print("M030 subtypes:", dict(subtypes))
remainder_qs = [q for q in domains['M028']['questions'] if 'remainder' in q.get('question','').lower() or 'quotient' in q.get('question','').lower()]
print("M028 remainder/quotient questions:", len(remainder_qs))
