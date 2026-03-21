import json

with open('C:/Users/rrazz/Desktop/ai-tutor/data/question-bank.json', encoding='utf-8') as f:
    bank = json.load(f)

d = bank['domains']['M_DEC']

# Fix corrupted operator symbols (U+FFFD replacement chars)
fixes = {
    'dec.10': 'What is 2.4 x 10?',
    'dec.11': 'What is 0.35 x 100?',
    'dec.12': 'What is 460 / 100?',
    'dec.13': 'What is 0.7 x 1000?',
    'dec.20': 'What is 12.6 / 10?',
}
for q in d['questions']:
    if q['ref'] in fixes:
        q['question'] = fixes[q['ref']]

# New questions
new_questions = [
    # L10.T1.A1 — place value / decimals as fractions (3 more → total ~10 in this area)
    {"ref":"dec.21","question":"What is the value of the digit 3 in 5.03?","expected":"0.03","input_type":"text","ruby_prompt":"Look at which decimal place the digit 3 is in. Hundredths means divide by 100.","error_signals":["ERR_PLACE_VALUE"],"difficulty":3},
    {"ref":"dec.22","question":"Write 9/100 as a decimal.","expected":"0.09","input_type":"text","ruby_prompt":"Hundredths go two places after the decimal point.","error_signals":["ERR_DECIMAL_CONVERT"],"difficulty":3},
    {"ref":"dec.23","question":"Which is larger: 0.09 or 0.1?","expected":"0.1","input_type":"text","ruby_prompt":"Compare digit by digit from left to right. 0.1 = 0.10.","error_signals":["ERR_DECIMAL_COMPARE"],"difficulty":3},

    # L10.T2.A1 — add/subtract decimals (5 more → total ~10 in this area)
    {"ref":"dec.24","question":"What is 6.4 + 2.7?","expected":"9.1","input_type":"numeric","ruby_prompt":"Line up the decimal points then add.","error_signals":["ERR_ALIGNMENT","ERR_ARITHMETIC"],"difficulty":3},
    {"ref":"dec.25","question":"What is 8.3 - 4.6?","expected":"3.7","input_type":"numeric","ruby_prompt":"Line up the decimal points then subtract. You may need to regroup.","error_signals":["ERR_ALIGNMENT","ERR_ARITHMETIC"],"difficulty":3},
    {"ref":"dec.26","question":"What is 3.15 + 2.85?","expected":"6","input_type":"numeric","ruby_prompt":"Line up the decimal points. The answer may be a whole number.","error_signals":["ERR_ALIGNMENT","ERR_ARITHMETIC"],"difficulty":4},
    {"ref":"dec.27","question":"What is 9.2 - 3.75?","expected":"5.45","input_type":"numeric","ruby_prompt":"Write 9.2 as 9.20 so both numbers have the same decimal places, then subtract.","error_signals":["ERR_ALIGNMENT","ERR_ARITHMETIC"],"difficulty":4},
    {"ref":"dec.28","question":"What is 0.6 + 0.45?","expected":"1.05","input_type":"numeric","ruby_prompt":"Write 0.6 as 0.60 so both numbers have the same decimal places, then add.","error_signals":["ERR_ALIGNMENT","ERR_ARITHMETIC"],"difficulty":4},

    # L10.T2.A2 — multiply/divide by powers of 10 (5 more → total ~10 in this area)
    {"ref":"dec.29","question":"What is 3.6 x 100?","expected":"360","input_type":"numeric","ruby_prompt":"Multiplying by 100 moves each digit two places to the left.","error_signals":["ERR_PLACE_SHIFT"],"difficulty":3},
    {"ref":"dec.30","question":"What is 0.08 x 10?","expected":"0.8","input_type":"numeric","ruby_prompt":"Multiplying by 10 moves each digit one place to the left.","error_signals":["ERR_PLACE_SHIFT"],"difficulty":3},
    {"ref":"dec.31","question":"What is 25 / 10?","expected":"2.5","input_type":"numeric","ruby_prompt":"Dividing by 10 moves each digit one place to the right.","error_signals":["ERR_PLACE_SHIFT"],"difficulty":3},
    {"ref":"dec.32","question":"What is 0.045 x 1000?","expected":"45","input_type":"numeric","ruby_prompt":"Multiplying by 1000 moves each digit three places to the left.","error_signals":["ERR_PLACE_SHIFT"],"difficulty":4},
    {"ref":"dec.33","question":"What is 8200 / 1000?","expected":"8.2","input_type":"numeric","ruby_prompt":"Dividing by 1000 moves each digit three places to the right.","error_signals":["ERR_PLACE_SHIFT"],"difficulty":4},

    # L10.T3.A1 — rounding (7 more → total 10 in this area)
    {"ref":"dec.34","question":"Round 4.62 to one decimal place.","expected":"4.6","input_type":"numeric","ruby_prompt":"Look at the second decimal digit. If it is less than 5, round down.","error_signals":["ERR_ROUNDING_DIR","ERR_DECIMAL_PLACE"],"difficulty":4},
    {"ref":"dec.35","question":"Round 7.85 to one decimal place.","expected":"7.9","input_type":"numeric","ruby_prompt":"Look at the second decimal digit. If it is 5 or more, round up.","error_signals":["ERR_ROUNDING_DIR","ERR_DECIMAL_PLACE"],"difficulty":4},
    {"ref":"dec.36","question":"Round 5.3 to the nearest whole number.","expected":"5","input_type":"numeric","ruby_prompt":"Look at the first decimal digit. If it is less than 5, round down.","error_signals":["ERR_ROUNDING_DIR"],"difficulty":4},
    {"ref":"dec.37","question":"Round 6.8 to the nearest whole number.","expected":"7","input_type":"numeric","ruby_prompt":"Look at the first decimal digit. If it is 5 or more, round up.","error_signals":["ERR_ROUNDING_DIR"],"difficulty":4},
    {"ref":"dec.38","question":"Round 3.449 to one decimal place.","expected":"3.4","input_type":"numeric","ruby_prompt":"Only look at the second decimal digit to decide. It is 4, so round down.","error_signals":["ERR_ROUNDING_DIR","ERR_DECIMAL_PLACE"],"difficulty":4},
    {"ref":"dec.39","question":"Round 9.95 to one decimal place.","expected":"10.0","input_type":"text","ruby_prompt":"The second decimal digit is 5 so round up. 9.9 rounds up to 10.0.","error_signals":["ERR_ROUNDING_DIR","ERR_CARRY"],"difficulty":4},
    {"ref":"dec.40","question":"Round 0.745 to two decimal places.","expected":"0.75","input_type":"numeric","ruby_prompt":"Look at the third decimal digit. It is 5 or more, so round the second decimal place up.","error_signals":["ERR_ROUNDING_DIR","ERR_DECIMAL_PLACE"],"difficulty":4},
]

d['questions'].extend(new_questions)

with open('C:/Users/rrazz/Desktop/ai-tutor/data/question-bank.json', 'w', encoding='utf-8') as f:
    json.dump(bank, f, indent=2, ensure_ascii=False)

print(f'M_DEC now has {len(d["questions"])} questions')
print('Fixed: dec.10, dec.11, dec.12, dec.13, dec.20')
print(f'Added: {len(new_questions)} new questions (dec.21–dec.40)')
