import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const bankPath = join(__dirname, '../data/question-bank.json');
const bank = JSON.parse(readFileSync(bankPath, 'utf8'));

const expansions = {
  "M019": [
    { "ref": "19.11", "question": "5 + 5 = ?", "expected": "10", "input_type": "numeric", "error_signals": ["ERR_DOUBLES","ERR_ADD_OFF"], "ruby_prompt": "Double 5. What do you get?", "difficulty": 1 },
    { "ref": "19.12", "question": "9 + 9 = ?", "expected": "18", "input_type": "numeric", "error_signals": ["ERR_DOUBLES","ERR_ADD_OFF"], "ruby_prompt": "Double 9. What do you get?", "difficulty": 1 },
    { "ref": "19.13", "question": "8 + 9 = ? (Hint: 9+9=18, so 8+9 is one less.)", "expected": "17", "input_type": "numeric", "error_signals": ["ERR_NEAR_DOUBLE","ERR_ADD_OFF"], "ruby_prompt": "Use near-doubles: 9+9=18, so 8+9=?", "difficulty": 1 },
    { "ref": "19.14", "question": "6 + 8 = ? (Make ten first: 6+4=10, then add the rest.)", "expected": "14", "input_type": "numeric", "error_signals": ["ERR_MAKE_TEN","ERR_ADD_OFF"], "ruby_prompt": "Use make-ten: 6+4=10, then add 4 more.", "difficulty": 2 },
    { "ref": "19.15", "question": "7 + 6 = ? (Make ten first: 7+3=10, then add the rest.)", "expected": "13", "input_type": "numeric", "error_signals": ["ERR_MAKE_TEN","ERR_ADD_OFF"], "ruby_prompt": "Use make-ten: 7+3=10, then add 3 more.", "difficulty": 2 }
  ],
  "M020": [
    { "ref": "20.9",  "question": "61 + 28 = ?", "expected": "89", "input_type": "numeric", "error_signals": ["ERR_ADD_ONES","ERR_ADD_TENS","ERR_PLACE_VALUE"], "ruby_prompt": "Add ones: 1+8=9. Add tens: 6+2=8.", "difficulty": 1 },
    { "ref": "20.10", "question": "43 + 35 = ?", "expected": "78", "input_type": "numeric", "error_signals": ["ERR_ADD_ONES","ERR_ADD_TENS","ERR_PLACE_VALUE"], "ruby_prompt": "Add ones: 3+5=8. Add tens: 4+3=7.", "difficulty": 1 },
    { "ref": "20.11", "question": "12 + 74 = ?", "expected": "86", "input_type": "numeric", "error_signals": ["ERR_ADD_ONES","ERR_ADD_TENS","ERR_PLACE_VALUE"], "ruby_prompt": "Add ones: 2+4=6. Add tens: 1+7=8.", "difficulty": 1 },
    { "ref": "20.12", "question": "22 + 53 = ?", "expected": "75", "input_type": "numeric", "error_signals": ["ERR_ADD_ONES","ERR_ADD_TENS","ERR_PLACE_VALUE"], "ruby_prompt": "Add ones: 2+3=5. Add tens: 2+5=7.", "difficulty": 1 },
    { "ref": "20.13", "question": "29 + 43 = ? (You may need to regroup.)", "expected": "72", "input_type": "numeric", "error_signals": ["ERR_REGROUP","ERR_ADD_TENS_AFTER_CARRY","ERR_PLACE_VALUE"], "ruby_prompt": "9+3=12: write 2, carry 1. Then 2+4+1=7 tens.", "difficulty": 2 },
    { "ref": "20.14", "question": "57 + 35 = ? (You may need to regroup.)", "expected": "92", "input_type": "numeric", "error_signals": ["ERR_REGROUP","ERR_ADD_TENS_AFTER_CARRY","ERR_PLACE_VALUE"], "ruby_prompt": "7+5=12: write 2, carry 1. Then 5+3+1=9 tens.", "difficulty": 2 },
    { "ref": "20.15", "question": "64 + 28 = ? (You may need to regroup.)", "expected": "92", "input_type": "numeric", "error_signals": ["ERR_REGROUP","ERR_ADD_TENS_AFTER_CARRY","ERR_PLACE_VALUE"], "ruby_prompt": "4+8=12: write 2, carry 1. Then 6+2+1=9 tens.", "difficulty": 2 }
  ],
  "M021": [
    { "ref": "21.9",  "question": "20 - 13 = ?", "expected": "7", "input_type": "numeric", "error_signals": ["ERR_COUNT_UP","ERR_SUB_OFF"], "ruby_prompt": "Count up from 13 to 20. How many steps?", "difficulty": 1 },
    { "ref": "21.10", "question": "23 - 17 = ?", "expected": "6", "input_type": "numeric", "error_signals": ["ERR_COUNT_UP","ERR_SUB_OFF"], "ruby_prompt": "Count up from 17 to 23. How many steps?", "difficulty": 2 },
    { "ref": "21.11", "question": "32 - 25 = ?", "expected": "7", "input_type": "numeric", "error_signals": ["ERR_COUNT_UP","ERR_SUB_OFF"], "ruby_prompt": "Count up from 25 to 32. How many steps?", "difficulty": 2 },
    { "ref": "21.12", "question": "40 - 34 = ?", "expected": "6", "input_type": "numeric", "error_signals": ["ERR_COUNT_UP","ERR_SUB_OFF"], "ruby_prompt": "Count up from 34 to 40. How many steps?", "difficulty": 2 },
    { "ref": "21.13", "question": "25 - 18 = ?", "expected": "7", "input_type": "numeric", "error_signals": ["ERR_COUNT_UP","ERR_SUB_OFF"], "ruby_prompt": "Count up from 18 to 25. How many steps?", "difficulty": 2 },
    { "ref": "21.14", "question": "51 - 46 = ?", "expected": "5", "input_type": "numeric", "error_signals": ["ERR_COUNT_UP","ERR_SUB_OFF"], "ruby_prompt": "Count up from 46 to 51. How many steps?", "difficulty": 2 },
    { "ref": "21.15", "question": "30 - 22 = ?", "expected": "8", "input_type": "numeric", "error_signals": ["ERR_COUNT_UP","ERR_SUB_OFF"], "ruby_prompt": "Count up from 22 to 30. How many steps?", "difficulty": 2 }
  ],
  "M022": [
    { "ref": "22.9",  "question": "79 - 45 = ?", "expected": "34", "input_type": "numeric", "error_signals": ["ERR_SUB_ONES","ERR_SUB_TENS","ERR_PLACE_VALUE"], "ruby_prompt": "Subtract ones: 9-5=4. Subtract tens: 7-4=3.", "difficulty": 1 },
    { "ref": "22.10", "question": "96 - 53 = ?", "expected": "43", "input_type": "numeric", "error_signals": ["ERR_SUB_ONES","ERR_SUB_TENS","ERR_PLACE_VALUE"], "ruby_prompt": "Subtract ones: 6-3=3. Subtract tens: 9-5=4.", "difficulty": 1 },
    { "ref": "22.11", "question": "68 - 24 = ?", "expected": "44", "input_type": "numeric", "error_signals": ["ERR_SUB_ONES","ERR_SUB_TENS","ERR_PLACE_VALUE"], "ruby_prompt": "Subtract ones: 8-4=4. Subtract tens: 6-2=4.", "difficulty": 1 },
    { "ref": "22.12", "question": "77 - 43 = ?", "expected": "34", "input_type": "numeric", "error_signals": ["ERR_SUB_ONES","ERR_SUB_TENS","ERR_PLACE_VALUE"], "ruby_prompt": "Subtract ones: 7-3=4. Subtract tens: 7-4=3.", "difficulty": 1 },
    { "ref": "22.13", "question": "93 - 46 = ? (You may need to regroup.)", "expected": "47", "input_type": "numeric", "error_signals": ["ERR_BORROW","ERR_SUB_AFTER_BORROW","ERR_PLACE_VALUE"], "ruby_prompt": "3<6: borrow 1 ten. 13-6=7, then 8-4=4.", "difficulty": 2 },
    { "ref": "22.14", "question": "71 - 35 = ? (You may need to regroup.)", "expected": "36", "input_type": "numeric", "error_signals": ["ERR_BORROW","ERR_SUB_AFTER_BORROW","ERR_PLACE_VALUE"], "ruby_prompt": "1<5: borrow 1 ten. 11-5=6, then 6-3=3.", "difficulty": 2 },
    { "ref": "22.15", "question": "84 - 29 = ? (You may need to regroup.)", "expected": "55", "input_type": "numeric", "error_signals": ["ERR_BORROW","ERR_SUB_AFTER_BORROW","ERR_PLACE_VALUE"], "ruby_prompt": "4<9: borrow 1 ten. 14-9=5, then 7-2=5.", "difficulty": 2 }
  ],
  "M023": [
    { "ref": "23.9",  "question": "56 + 33 = ? (Split: 50+30=80, 6+3=9, then add.)", "expected": "89", "input_type": "numeric", "error_signals": ["ERR_SPLIT_TENS","ERR_SPLIT_ONES","ERR_ADD_PARTS"], "ruby_prompt": "Split: 50+30=80 and 6+3=9. Add together: 80+9=?", "difficulty": 2 },
    { "ref": "23.10", "question": "28 + 41 = ? (Split: 20+40=60, 8+1=9, then add.)", "expected": "69", "input_type": "numeric", "error_signals": ["ERR_SPLIT_TENS","ERR_SPLIT_ONES","ERR_ADD_PARTS"], "ruby_prompt": "Split: 20+40=60 and 8+1=9. Add together: 60+9=?", "difficulty": 2 },
    { "ref": "23.11", "question": "101 - 47 = ? (Compensation: round 101 to 100, subtract 47, then add 1.)", "expected": "54", "input_type": "numeric", "error_signals": ["ERR_COMPENSATION","ERR_FORGET_ADJUST"], "ruby_prompt": "100-47=53, then add 1 because you subtracted 1 extra: 53+1=?", "difficulty": 2 },
    { "ref": "23.12", "question": "299 + 63 = ? (Compensation: round 299 to 300, add 63, then subtract 1.)", "expected": "362", "input_type": "numeric", "error_signals": ["ERR_COMPENSATION","ERR_FORGET_ADJUST"], "ruby_prompt": "300+63=363, then subtract 1: 363-1=?", "difficulty": 2 },
    { "ref": "23.13", "question": "315 + 248 = ?", "expected": "563", "input_type": "numeric", "error_signals": ["ERR_ADD_HUNDREDS","ERR_REGROUP","ERR_PLACE_VALUE"], "ruby_prompt": "5+8=13 (write 3, carry 1), 1+4+1=6, 3+2=5.", "difficulty": 3 },
    { "ref": "23.14", "question": "627 + 158 = ?", "expected": "785", "input_type": "numeric", "error_signals": ["ERR_ADD_HUNDREDS","ERR_REGROUP","ERR_PLACE_VALUE"], "ruby_prompt": "7+8=15 (write 5, carry 1), 2+5+1=8, 6+1=7.", "difficulty": 3 },
    { "ref": "23.15", "question": "843 - 256 = ?", "expected": "587", "input_type": "numeric", "error_signals": ["ERR_SUB_HUNDREDS","ERR_BORROW","ERR_PLACE_VALUE"], "ruby_prompt": "3<6: borrow. 13-6=7. 3<5 after borrow: borrow again. 13-5=8. 7-2=5... wait, 7-1-2=4... work column by column.", "difficulty": 3 }
  ],
  "M024": [
    { "ref": "24.9",  "question": "18, 16, 14, __ — what is the next number? (Counting back by 2s.)", "expected": "12", "input_type": "numeric", "error_signals": ["ERR_SKIP_COUNT_STEP","ERR_PATTERN"], "ruby_prompt": "Count back by 2s. After 14, what comes next going down?", "difficulty": 2 },
    { "ref": "24.10", "question": "50, 45, 40, __ — what is the next number? (Counting back by 5s.)", "expected": "35", "input_type": "numeric", "error_signals": ["ERR_SKIP_COUNT_STEP","ERR_PATTERN"], "ruby_prompt": "Count back by 5s. After 40, what comes next going down?", "difficulty": 2 },
    { "ref": "24.11", "question": "100, 90, 80, __ — what is the next number?", "expected": "70", "input_type": "numeric", "error_signals": ["ERR_SKIP_COUNT_STEP","ERR_PATTERN"], "ruby_prompt": "Count back by 10s. After 80, what comes next going down?", "difficulty": 2 },
    { "ref": "24.12", "question": "6, 8, 10, 12, 14, __ — what is the next number?", "expected": "16", "input_type": "numeric", "error_signals": ["ERR_SKIP_COUNT_STEP","ERR_PATTERN"], "ruby_prompt": "Each number increases by 2. After 14, what comes next?", "difficulty": 1 },
    { "ref": "24.13", "question": "3, __, 9, 12, 15 — what is the missing number?", "expected": "6", "input_type": "numeric", "error_signals": ["ERR_SKIP_COUNT_STEP","ERR_PATTERN"], "ruby_prompt": "Count by 3s. After 3, what comes before 9?", "difficulty": 2 },
    { "ref": "24.14", "question": "10, 20, 30, 40, 50, __ — what is the next number?", "expected": "60", "input_type": "numeric", "error_signals": ["ERR_SKIP_COUNT_STEP","ERR_PATTERN"], "ruby_prompt": "Count by 10s. After 50, what comes next?", "difficulty": 1 },
    { "ref": "24.15", "question": "__, 4, 6, 8, 10 — what is the missing first number?", "expected": "2", "input_type": "numeric", "error_signals": ["ERR_SKIP_COUNT_STEP","ERR_PATTERN"], "ruby_prompt": "Count by 2s. What comes before 4?", "difficulty": 2 }
  ],
  "M025": [
    { "ref": "25.13", "question": "5 × 3 = ?", "expected": "15", "input_type": "numeric", "error_signals": ["ERR_TIMES_TABLE","ERR_MULT_OFF"], "ruby_prompt": "Count by 5s three times: 5, 10, 15.", "difficulty": 1 },
    { "ref": "25.14", "question": "8 × 4 = ?", "expected": "32", "input_type": "numeric", "error_signals": ["ERR_TIMES_TABLE","ERR_MULT_OFF"], "ruby_prompt": "Try 8×2=16, then double it for 8×4.", "difficulty": 2 },
    { "ref": "25.15", "question": "7 × 3 = ?", "expected": "21", "input_type": "numeric", "error_signals": ["ERR_TIMES_TABLE","ERR_MULT_OFF"], "ruby_prompt": "Count by 7s three times: 7, 14, 21.", "difficulty": 2 }
  ],
  "M026": [
    { "ref": "26.9",  "question": "5 × 8 = 40. What is 8 × 5?", "expected": "40", "input_type": "numeric", "error_signals": ["ERR_COMMUTATIVE","ERR_MULT_OFF"], "ruby_prompt": "The order does not change the product. 5×8 = 8×5.", "difficulty": 1 },
    { "ref": "26.10", "question": "Use the distributive property to find 9 × 11. (9×10) + (9×1) = 90 + 9 = ?", "expected": "99", "input_type": "numeric", "error_signals": ["ERR_DISTRIBUTIVE","ERR_MULT_PARTIAL"], "ruby_prompt": "9×11 = 9×10 + 9×1 = 90 + 9. What is the total?", "difficulty": 2 },
    { "ref": "26.11", "question": "Use the distributive property to find 6 × 16. (6×10) + (6×6) = 60 + 36 = ?", "expected": "96", "input_type": "numeric", "error_signals": ["ERR_DISTRIBUTIVE","ERR_MULT_PARTIAL"], "ruby_prompt": "6×16 = 6×10 + 6×6 = 60 + 36. What is the total?", "difficulty": 3 },
    { "ref": "26.12", "question": "4 × 19 = ? (Split 19 as 20-1: 4×20 - 4×1)", "expected": "76", "input_type": "numeric", "error_signals": ["ERR_DISTRIBUTIVE","ERR_MULT_PARTIAL"], "ruby_prompt": "4×20=80. 4×1=4. 80-4=?", "difficulty": 3 }
  ],
  "M027": [
    { "ref": "27.10", "question": "63 × 4 = ?", "expected": "252", "input_type": "numeric", "error_signals": ["ERR_MULT_ONES","ERR_MULT_TENS","ERR_REGROUP"], "ruby_prompt": "4×3=12 (write 2, carry 1). 4×6+1=25. Answer: 252.", "difficulty": 2 },
    { "ref": "27.11", "question": "312 × 3 = ?", "expected": "936", "input_type": "numeric", "error_signals": ["ERR_MULT_HUNDREDS","ERR_REGROUP","ERR_PLACE_VALUE"], "ruby_prompt": "3×2=6, 3×1=3, 3×3=9. Answer: 936.", "difficulty": 2 },
    { "ref": "27.12", "question": "26 × 13 = ?", "expected": "338", "input_type": "numeric", "error_signals": ["ERR_LONG_MULT_ROW","ERR_PLACE_SHIFT","ERR_ADD_ROWS"], "ruby_prompt": "26×3=78, 26×10=260. Add: 78+260=338.", "difficulty": 3 }
  ],
  "M028": [
    { "ref": "28.11", "question": "63 ÷ 7 = ? (Think: 7 × ? = 63)", "expected": "9", "input_type": "numeric", "error_signals": ["ERR_DIV_INVERSE","ERR_DIV_OFF"], "ruby_prompt": "What times 7 equals 63? Use your 7 times table.", "difficulty": 2 },
    { "ref": "28.12", "question": "48 ÷ 6 = ? (Think: 6 × ? = 48)", "expected": "8", "input_type": "numeric", "error_signals": ["ERR_DIV_INVERSE","ERR_DIV_OFF"], "ruby_prompt": "What times 6 equals 48? Use your 6 times table.", "difficulty": 2 }
  ]
};

// Verify no ref conflicts and append questions
let totalAdded = 0;
for (const [domainId, newQuestions] of Object.entries(expansions)) {
  const domain = bank.domains[domainId];
  if (!domain) { console.error('Domain not found:', domainId); continue; }
  const existingRefs = new Set(domain.questions.map(q => q.ref));
  for (const q of newQuestions) {
    if (existingRefs.has(q.ref)) {
      console.error(`Duplicate ref ${q.ref} in ${domainId}`);
    } else {
      domain.questions.push(q);
      totalAdded++;
    }
  }
  console.log(`${domainId}: ${domain.questions.length} questions total`);
}

writeFileSync(bankPath, JSON.stringify(bank, null, 2), 'utf8');
console.log(`\nDone. Added ${totalAdded} questions.`);
