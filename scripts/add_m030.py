import json, sys
sys.stdout.reconfigure(encoding='utf-8')

BASE = 'C:/Users/rrazz/Desktop/ai-tutor/data/maths-question-banks'

M030_QUESTIONS = {
     1: {'stimulus': '1/2 x 6',      'answerMode': 'numeric',  'expectedAnswer': 3,       'question': 'Multiply the fraction by the whole number. Type the answer.', 'errors': ['ERR_FRAC_WHOLE_MULT','ERR_SIMPLIFY']},
     2: {'stimulus': '1/3 x 9',      'answerMode': 'numeric',  'expectedAnswer': 3,       'question': 'Multiply the fraction by the whole number. Type the answer.', 'errors': ['ERR_FRAC_WHOLE_MULT','ERR_SIMPLIFY']},
     3: {'stimulus': '1/4 x 8',      'answerMode': 'numeric',  'expectedAnswer': 2,       'question': 'Multiply the fraction by the whole number. Type the answer.', 'errors': ['ERR_FRAC_WHOLE_MULT','ERR_SIMPLIFY']},
     4: {'stimulus': '1/5 x 10',     'answerMode': 'numeric',  'expectedAnswer': 2,       'question': 'Multiply the fraction by the whole number. Type the answer.', 'errors': ['ERR_FRAC_WHOLE_MULT','ERR_SIMPLIFY']},
     5: {'stimulus': '2/3 x 6',      'answerMode': 'numeric',  'expectedAnswer': 4,       'question': 'Multiply the fraction by the whole number. Type the answer.', 'errors': ['ERR_FRAC_WHOLE_MULT','ERR_SIMPLIFY']},
     6: {'stimulus': '3/4 x 8',      'answerMode': 'numeric',  'expectedAnswer': 6,       'question': 'Multiply the fraction by the whole number. Type the answer.', 'errors': ['ERR_FRAC_WHOLE_MULT','ERR_SIMPLIFY']},
     7: {'stimulus': '1/2 x 10',     'answerMode': 'numeric',  'expectedAnswer': 5,       'question': 'Multiply the fraction by the whole number. Type the answer.', 'errors': ['ERR_FRAC_WHOLE_MULT','ERR_SIMPLIFY']},
     8: {'stimulus': '2/5 x 10',     'answerMode': 'numeric',  'expectedAnswer': 4,       'question': 'Multiply the fraction by the whole number. Type the answer.', 'errors': ['ERR_FRAC_WHOLE_MULT','ERR_SIMPLIFY']},
     9: {'stimulus': '1/3 x 12',     'answerMode': 'numeric',  'expectedAnswer': 4,       'question': 'Multiply the fraction by the whole number. Type the answer.', 'errors': ['ERR_FRAC_WHOLE_MULT','ERR_SIMPLIFY']},
    10: {'stimulus': '3/5 x 10',     'answerMode': 'numeric',  'expectedAnswer': 6,       'question': 'Multiply the fraction by the whole number. Type the answer.', 'errors': ['ERR_FRAC_WHOLE_MULT','ERR_SIMPLIFY']},
    11: {'stimulus': '1/4 x 12',     'answerMode': 'numeric',  'expectedAnswer': 3,       'question': 'Multiply the fraction by the whole number. Type the answer.', 'errors': ['ERR_FRAC_WHOLE_MULT','ERR_SIMPLIFY']},
    12: {'stimulus': '2/3 x 9',      'answerMode': 'numeric',  'expectedAnswer': 6,       'question': 'Multiply the fraction by the whole number. Type the answer.', 'errors': ['ERR_FRAC_WHOLE_MULT','ERR_SIMPLIFY']},
    13: {'stimulus': '1/6 x 12',     'answerMode': 'numeric',  'expectedAnswer': 2,       'question': 'Multiply the fraction by the whole number. Type the answer.', 'errors': ['ERR_FRAC_WHOLE_MULT','ERR_SIMPLIFY']},
    14: {'stimulus': '3/4 x 12',     'answerMode': 'numeric',  'expectedAnswer': 9,       'question': 'Multiply the fraction by the whole number. Type the answer.', 'errors': ['ERR_FRAC_WHOLE_MULT','ERR_SIMPLIFY']},
    15: {'stimulus': '1/5 x 15',     'answerMode': 'numeric',  'expectedAnswer': 3,       'question': 'Multiply the fraction by the whole number. Type the answer.', 'errors': ['ERR_FRAC_WHOLE_MULT','ERR_SIMPLIFY']},
    16: {'stimulus': '4/5 x 10',     'answerMode': 'numeric',  'expectedAnswer': 8,       'question': 'Multiply the fraction by the whole number. Type the answer.', 'errors': ['ERR_FRAC_WHOLE_MULT','ERR_SIMPLIFY']},
    17: {'stimulus': '1/2 x 14',     'answerMode': 'numeric',  'expectedAnswer': 7,       'question': 'Multiply the fraction by the whole number. Type the answer.', 'errors': ['ERR_FRAC_WHOLE_MULT','ERR_SIMPLIFY']},
    18: {'stimulus': '2/7 x 14',     'answerMode': 'numeric',  'expectedAnswer': 4,       'question': 'Multiply the fraction by the whole number. Type the answer.', 'errors': ['ERR_FRAC_WHOLE_MULT','ERR_SIMPLIFY']},
    19: {'stimulus': '1/3 x 15',     'answerMode': 'numeric',  'expectedAnswer': 5,       'question': 'Multiply the fraction by the whole number. Type the answer.', 'errors': ['ERR_FRAC_WHOLE_MULT','ERR_SIMPLIFY']},
    20: {'stimulus': '5/6 x 12',     'answerMode': 'numeric',  'expectedAnswer': 10,      'question': 'Multiply the fraction by the whole number. Type the answer.', 'errors': ['ERR_FRAC_WHOLE_MULT','ERR_SIMPLIFY']},
    21: {'stimulus': '1/4 x 16',     'answerMode': 'numeric',  'expectedAnswer': 4,       'question': 'Multiply the fraction by the whole number. Type the answer.', 'errors': ['ERR_FRAC_WHOLE_MULT','ERR_SIMPLIFY']},
    22: {'stimulus': '3/8 x 16',     'answerMode': 'numeric',  'expectedAnswer': 6,       'question': 'Multiply the fraction by the whole number. Type the answer.', 'errors': ['ERR_FRAC_WHOLE_MULT','ERR_SIMPLIFY']},
    23: {'stimulus': '1/6 x 18',     'answerMode': 'numeric',  'expectedAnswer': 3,       'question': 'Multiply the fraction by the whole number. Type the answer.', 'errors': ['ERR_FRAC_WHOLE_MULT','ERR_SIMPLIFY']},
    24: {'stimulus': '5/9 x 9',      'answerMode': 'numeric',  'expectedAnswer': 5,       'question': 'Multiply the fraction by the whole number. Type the answer.', 'errors': ['ERR_FRAC_WHOLE_MULT','ERR_SIMPLIFY']},
    25: {'stimulus': '7/10 x 10',    'answerMode': 'numeric',  'expectedAnswer': 7,       'question': 'Multiply the fraction by the whole number. Type the answer.', 'errors': ['ERR_FRAC_WHOLE_MULT','ERR_SIMPLIFY']},
    26: {'stimulus': '1/5 + 2/5',    'answerMode': 'fraction', 'expectedAnswer': '3/5',   'question': 'Add these fractions. Type the answer as a fraction.', 'errors': ['ERR_ADD_FRAC','ERR_COMMON_DENOM']},
    27: {'stimulus': '2/7 + 3/7',    'answerMode': 'fraction', 'expectedAnswer': '5/7',   'question': 'Add these fractions. Type the answer as a fraction.', 'errors': ['ERR_ADD_FRAC','ERR_COMMON_DENOM']},
    28: {'stimulus': '1/9 + 4/9',    'answerMode': 'fraction', 'expectedAnswer': '5/9',   'question': 'Add these fractions. Type the answer as a fraction.', 'errors': ['ERR_ADD_FRAC','ERR_COMMON_DENOM']},
    29: {'stimulus': '3/11 + 5/11',  'answerMode': 'fraction', 'expectedAnswer': '8/11',  'question': 'Add these fractions. Type the answer as a fraction.', 'errors': ['ERR_ADD_FRAC','ERR_COMMON_DENOM']},
    30: {'stimulus': '1/7 + 3/7',    'answerMode': 'fraction', 'expectedAnswer': '4/7',   'question': 'Add these fractions. Type the answer as a fraction.', 'errors': ['ERR_ADD_FRAC','ERR_COMMON_DENOM']},
    31: {'stimulus': '4/9 + 4/9',    'answerMode': 'fraction', 'expectedAnswer': '8/9',   'question': 'Add these fractions. Type the answer as a fraction.', 'errors': ['ERR_ADD_FRAC','ERR_COMMON_DENOM']},
    32: {'stimulus': '3/11 + 7/11',  'answerMode': 'fraction', 'expectedAnswer': '10/11', 'question': 'Add these fractions. Type the answer as a fraction.', 'errors': ['ERR_ADD_FRAC','ERR_COMMON_DENOM']},
    33: {'stimulus': '5/13 + 6/13',  'answerMode': 'fraction', 'expectedAnswer': '11/13', 'question': 'Add these fractions. Type the answer as a fraction.', 'errors': ['ERR_ADD_FRAC','ERR_COMMON_DENOM']},
    34: {'stimulus': '3/5 + 1/5',    'answerMode': 'fraction', 'expectedAnswer': '4/5',   'question': 'Add these fractions. Type the answer as a fraction.', 'errors': ['ERR_ADD_FRAC','ERR_COMMON_DENOM']},
    35: {'stimulus': '2/9 + 5/9',    'answerMode': 'fraction', 'expectedAnswer': '7/9',   'question': 'Add these fractions. Type the answer as a fraction.', 'errors': ['ERR_ADD_FRAC','ERR_COMMON_DENOM']},
    36: {'stimulus': '5/7 + 1/7',    'answerMode': 'fraction', 'expectedAnswer': '6/7',   'question': 'Add these fractions. Type the answer as a fraction.', 'errors': ['ERR_ADD_FRAC','ERR_COMMON_DENOM']},
    37: {'stimulus': '4/11 + 5/11',  'answerMode': 'fraction', 'expectedAnswer': '9/11',  'question': 'Add these fractions. Type the answer as a fraction.', 'errors': ['ERR_ADD_FRAC','ERR_COMMON_DENOM']},
    38: {'stimulus': '6/7 - 2/7',    'answerMode': 'fraction', 'expectedAnswer': '4/7',   'question': 'Subtract these fractions. Type the answer as a fraction.', 'errors': ['ERR_SUB_FRAC','ERR_COMMON_DENOM']},
    39: {'stimulus': '7/9 - 2/9',    'answerMode': 'fraction', 'expectedAnswer': '5/9',   'question': 'Subtract these fractions. Type the answer as a fraction.', 'errors': ['ERR_SUB_FRAC','ERR_COMMON_DENOM']},
    40: {'stimulus': '4/5 - 1/5',    'answerMode': 'fraction', 'expectedAnswer': '3/5',   'question': 'Subtract these fractions. Type the answer as a fraction.', 'errors': ['ERR_SUB_FRAC','ERR_COMMON_DENOM']},
    41: {'stimulus': '9/11 - 4/11',  'answerMode': 'fraction', 'expectedAnswer': '5/11',  'question': 'Subtract these fractions. Type the answer as a fraction.', 'errors': ['ERR_SUB_FRAC','ERR_COMMON_DENOM']},
    42: {'stimulus': '11/13 - 4/13', 'answerMode': 'fraction', 'expectedAnswer': '7/13',  'question': 'Subtract these fractions. Type the answer as a fraction.', 'errors': ['ERR_SUB_FRAC','ERR_COMMON_DENOM']},
    43: {'stimulus': '5/7 - 1/7',    'answerMode': 'fraction', 'expectedAnswer': '4/7',   'question': 'Subtract these fractions. Type the answer as a fraction.', 'errors': ['ERR_SUB_FRAC','ERR_COMMON_DENOM']},
    44: {'stimulus': '10/11 - 3/11', 'answerMode': 'fraction', 'expectedAnswer': '7/11',  'question': 'Subtract these fractions. Type the answer as a fraction.', 'errors': ['ERR_SUB_FRAC','ERR_COMMON_DENOM']},
    45: {'stimulus': '6/11 - 1/11',  'answerMode': 'fraction', 'expectedAnswer': '5/11',  'question': 'Subtract these fractions. Type the answer as a fraction.', 'errors': ['ERR_SUB_FRAC','ERR_COMMON_DENOM']},
    46: {'stimulus': '10/13 - 3/13', 'answerMode': 'fraction', 'expectedAnswer': '7/13',  'question': 'Subtract these fractions. Type the answer as a fraction.', 'errors': ['ERR_SUB_FRAC','ERR_COMMON_DENOM']},
    47: {'stimulus': '8/9 - 3/9',    'answerMode': 'fraction', 'expectedAnswer': '5/9',   'question': 'Subtract these fractions. Type the answer as a fraction.', 'errors': ['ERR_SUB_FRAC','ERR_COMMON_DENOM']},
    48: {'stimulus': '7/11 - 2/11',  'answerMode': 'fraction', 'expectedAnswer': '5/11',  'question': 'Subtract these fractions. Type the answer as a fraction.', 'errors': ['ERR_SUB_FRAC','ERR_COMMON_DENOM']},
    49: {'stimulus': '6/7 - 1/7',    'answerMode': 'fraction', 'expectedAnswer': '5/7',   'question': 'Subtract these fractions. Type the answer as a fraction.', 'errors': ['ERR_SUB_FRAC','ERR_COMMON_DENOM']},
    50: {'stimulus': '9/13 - 2/13',  'answerMode': 'fraction', 'expectedAnswer': '7/13',  'question': 'Subtract these fractions. Type the answer as a fraction.', 'errors': ['ERR_SUB_FRAC','ERR_COMMON_DENOM']},
}

added = 0
for b, q in M030_QUESTIONS.items():
    path = f'{BASE}/{b}.json'
    data = json.load(open(path, encoding='utf-8'))
    entry = {
        'id': f'30.{b}',
        'domain': 'M030',
        'domainTitle': 'Fraction Operations',
        'gate': 'B',
        'stimulus': q['stimulus'],
        'question': q['question'],
        'answerMode': q['answerMode'],
        'expectedAnswer': q['expectedAnswer'],
        'errorSignals': q['errors'],
        'passThreshold': 0.8,
    }
    data.append(entry)
    added += 1
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

print(f'M030 questions added to {added} bank files')
