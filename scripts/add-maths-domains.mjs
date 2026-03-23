import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const bankPath = join(__dirname, '../data/question-bank.json');
const bank = JSON.parse(readFileSync(bankPath, 'utf8'));

const newDomains = {
  "M019": {
    "title": "Addition Strategies — Doubles and Make-Ten",
    "gate": "A",
    "skill_ids": ["L2.T2.A1", "L2.T2.A2"],
    "pass_threshold": 0.8,
    "questions_for_mastery": 3,
    "questions": [
      { "ref": "19.1", "question": "6 + 6 = ?", "expected": "12", "input_type": "numeric", "error_signals": ["ERR_DOUBLES","ERR_ADD_OFF"], "ruby_prompt": "Double 6. What do you get?", "difficulty": 1 },
      { "ref": "19.2", "question": "7 + 7 = ?", "expected": "14", "input_type": "numeric", "error_signals": ["ERR_DOUBLES","ERR_ADD_OFF"], "ruby_prompt": "Double 7. What do you get?", "difficulty": 1 },
      { "ref": "19.3", "question": "8 + 8 = ?", "expected": "16", "input_type": "numeric", "error_signals": ["ERR_DOUBLES","ERR_ADD_OFF"], "ruby_prompt": "Double 8. What do you get?", "difficulty": 1 },
      { "ref": "19.4", "question": "6 + 7 = ? (Hint: 6+6=12, so 6+7 is one more.)", "expected": "13", "input_type": "numeric", "error_signals": ["ERR_NEAR_DOUBLE","ERR_ADD_OFF"], "ruby_prompt": "Use near-doubles: 6+6=12, so 6+7=?", "difficulty": 1 },
      { "ref": "19.5", "question": "7 + 8 = ? (Hint: 7+7=14, so 7+8 is one more.)", "expected": "15", "input_type": "numeric", "error_signals": ["ERR_NEAR_DOUBLE","ERR_ADD_OFF"], "ruby_prompt": "Use near-doubles: 7+7=14, so 7+8=?", "difficulty": 1 },
      { "ref": "19.6", "question": "9 + 1 = ? (Make ten!)", "expected": "10", "input_type": "numeric", "error_signals": ["ERR_MAKE_TEN","ERR_ADD_OFF"], "ruby_prompt": "9 and how many more make 10?", "difficulty": 1 },
      { "ref": "19.7", "question": "8 + 2 = ?", "expected": "10", "input_type": "numeric", "error_signals": ["ERR_MAKE_TEN","ERR_ADD_OFF"], "ruby_prompt": "8 and 2 make ten. What is 8+2?", "difficulty": 1 },
      { "ref": "19.8", "question": "9 + 5 = ? (Make ten first: 9+1=10, then add the rest.)", "expected": "14", "input_type": "numeric", "error_signals": ["ERR_MAKE_TEN","ERR_ADD_OFF"], "ruby_prompt": "Use make-ten: 9+1=10, then add 4 more.", "difficulty": 2 },
      { "ref": "19.9", "question": "8 + 6 = ? (Make ten first: 8+2=10, then add the rest.)", "expected": "14", "input_type": "numeric", "error_signals": ["ERR_MAKE_TEN","ERR_ADD_OFF"], "ruby_prompt": "Use make-ten: 8+2=10, then add 4 more.", "difficulty": 2 },
      { "ref": "19.10", "question": "7 + 5 = ? (Make ten first: 7+3=10, then add the rest.)", "expected": "12", "input_type": "numeric", "error_signals": ["ERR_MAKE_TEN","ERR_ADD_OFF"], "ruby_prompt": "Use make-ten: 7+3=10, then add 2 more.", "difficulty": 2 }
    ]
  },
  "M020": {
    "title": "Two-Digit Addition",
    "gate": "A",
    "skill_ids": ["L2.T3.A1", "L2.T3.A2"],
    "pass_threshold": 0.8,
    "questions_for_mastery": 3,
    "questions": [
      { "ref": "20.1", "question": "23 + 14 = ?", "expected": "37", "input_type": "numeric", "error_signals": ["ERR_ADD_ONES","ERR_ADD_TENS","ERR_PLACE_VALUE"], "ruby_prompt": "Add the ones first, then add the tens.", "difficulty": 1 },
      { "ref": "20.2", "question": "41 + 25 = ?", "expected": "66", "input_type": "numeric", "error_signals": ["ERR_ADD_ONES","ERR_ADD_TENS","ERR_PLACE_VALUE"], "ruby_prompt": "Add ones: 1+5=6. Add tens: 4+2=6. Answer?", "difficulty": 1 },
      { "ref": "20.3", "question": "32 + 46 = ?", "expected": "78", "input_type": "numeric", "error_signals": ["ERR_ADD_ONES","ERR_ADD_TENS","ERR_PLACE_VALUE"], "ruby_prompt": "Add ones: 2+6=8. Add tens: 3+4=7. Answer?", "difficulty": 1 },
      { "ref": "20.4", "question": "54 + 23 = ?", "expected": "77", "input_type": "numeric", "error_signals": ["ERR_ADD_ONES","ERR_ADD_TENS","ERR_PLACE_VALUE"], "ruby_prompt": "Add ones: 4+3=7. Add tens: 5+2=7. Answer?", "difficulty": 1 },
      { "ref": "20.5", "question": "27 + 15 = ? (You may need to regroup.)", "expected": "42", "input_type": "numeric", "error_signals": ["ERR_REGROUP","ERR_ADD_TENS_AFTER_CARRY","ERR_PLACE_VALUE"], "ruby_prompt": "7+5=12: write 2, carry 1. Then 2+1+1=4 tens.", "difficulty": 2 },
      { "ref": "20.6", "question": "38 + 24 = ? (You may need to regroup.)", "expected": "62", "input_type": "numeric", "error_signals": ["ERR_REGROUP","ERR_ADD_TENS_AFTER_CARRY","ERR_PLACE_VALUE"], "ruby_prompt": "8+4=12: write 2, carry 1. Then 3+2+1=6 tens.", "difficulty": 2 },
      { "ref": "20.7", "question": "46 + 37 = ? (You may need to regroup.)", "expected": "83", "input_type": "numeric", "error_signals": ["ERR_REGROUP","ERR_ADD_TENS_AFTER_CARRY","ERR_PLACE_VALUE"], "ruby_prompt": "6+7=13: write 3, carry 1. Then 4+3+1=8 tens.", "difficulty": 2 },
      { "ref": "20.8", "question": "55 + 36 = ? (You may need to regroup.)", "expected": "91", "input_type": "numeric", "error_signals": ["ERR_REGROUP","ERR_ADD_TENS_AFTER_CARRY","ERR_PLACE_VALUE"], "ruby_prompt": "5+6=11: write 1, carry 1. Then 5+3+1=9 tens.", "difficulty": 2 }
    ]
  },
  "M021": {
    "title": "Find the Difference — Counting Up",
    "gate": "A",
    "skill_ids": ["L3.T2.A1"],
    "pass_threshold": 0.8,
    "questions_for_mastery": 3,
    "questions": [
      { "ref": "21.1", "question": "15 - 8 = ? (Count up from 8 to 15.)", "expected": "7", "input_type": "numeric", "error_signals": ["ERR_COUNT_UP","ERR_SUB_OFF"], "ruby_prompt": "Start at 8 and count up to 15. How many steps?", "difficulty": 1 },
      { "ref": "21.2", "question": "13 - 6 = ? (Count up from 6 to 13.)", "expected": "7", "input_type": "numeric", "error_signals": ["ERR_COUNT_UP","ERR_SUB_OFF"], "ruby_prompt": "Start at 6 and count up to 13. How many steps?", "difficulty": 1 },
      { "ref": "21.3", "question": "14 - 9 = ? (Count up from 9 to 14.)", "expected": "5", "input_type": "numeric", "error_signals": ["ERR_COUNT_UP","ERR_SUB_OFF"], "ruby_prompt": "Start at 9 and count up to 14. How many steps?", "difficulty": 1 },
      { "ref": "21.4", "question": "12 - 7 = ?", "expected": "5", "input_type": "numeric", "error_signals": ["ERR_COUNT_UP","ERR_SUB_OFF"], "ruby_prompt": "Count up from 7 to 12. How many steps?", "difficulty": 1 },
      { "ref": "21.5", "question": "17 - 9 = ?", "expected": "8", "input_type": "numeric", "error_signals": ["ERR_COUNT_UP","ERR_SUB_OFF"], "ruby_prompt": "Count up from 9 to 17. How many steps?", "difficulty": 1 },
      { "ref": "21.6", "question": "16 - 7 = ?", "expected": "9", "input_type": "numeric", "error_signals": ["ERR_COUNT_UP","ERR_SUB_OFF"], "ruby_prompt": "Count up from 7 to 16. How many steps?", "difficulty": 1 },
      { "ref": "21.7", "question": "18 - 9 = ?", "expected": "9", "input_type": "numeric", "error_signals": ["ERR_COUNT_UP","ERR_SUB_OFF"], "ruby_prompt": "Count up from 9 to 18. How many steps?", "difficulty": 1 },
      { "ref": "21.8", "question": "11 - 6 = ?", "expected": "5", "input_type": "numeric", "error_signals": ["ERR_COUNT_UP","ERR_SUB_OFF"], "ruby_prompt": "Count up from 6 to 11. How many steps?", "difficulty": 1 }
    ]
  },
  "M022": {
    "title": "Two-Digit Subtraction",
    "gate": "A",
    "skill_ids": ["L3.T3.A1", "L3.T3.A2"],
    "pass_threshold": 0.8,
    "questions_for_mastery": 3,
    "questions": [
      { "ref": "22.1", "question": "48 - 23 = ?", "expected": "25", "input_type": "numeric", "error_signals": ["ERR_SUB_ONES","ERR_SUB_TENS","ERR_PLACE_VALUE"], "ruby_prompt": "Subtract ones: 8-3=5. Subtract tens: 4-2=2.", "difficulty": 1 },
      { "ref": "22.2", "question": "67 - 34 = ?", "expected": "33", "input_type": "numeric", "error_signals": ["ERR_SUB_ONES","ERR_SUB_TENS","ERR_PLACE_VALUE"], "ruby_prompt": "Subtract ones: 7-4=3. Subtract tens: 6-3=3.", "difficulty": 1 },
      { "ref": "22.3", "question": "85 - 42 = ?", "expected": "43", "input_type": "numeric", "error_signals": ["ERR_SUB_ONES","ERR_SUB_TENS","ERR_PLACE_VALUE"], "ruby_prompt": "Subtract ones: 5-2=3. Subtract tens: 8-4=4.", "difficulty": 1 },
      { "ref": "22.4", "question": "59 - 31 = ?", "expected": "28", "input_type": "numeric", "error_signals": ["ERR_SUB_ONES","ERR_SUB_TENS","ERR_PLACE_VALUE"], "ruby_prompt": "Subtract ones: 9-1=8. Subtract tens: 5-3=2.", "difficulty": 1 },
      { "ref": "22.5", "question": "73 - 25 = ? (You may need to regroup.)", "expected": "48", "input_type": "numeric", "error_signals": ["ERR_BORROW","ERR_SUB_AFTER_BORROW","ERR_PLACE_VALUE"], "ruby_prompt": "3<5: borrow 1 ten. 13-5=8, then 6-2=4.", "difficulty": 2 },
      { "ref": "22.6", "question": "64 - 38 = ? (You may need to regroup.)", "expected": "26", "input_type": "numeric", "error_signals": ["ERR_BORROW","ERR_SUB_AFTER_BORROW","ERR_PLACE_VALUE"], "ruby_prompt": "4<8: borrow 1 ten. 14-8=6, then 5-3=2.", "difficulty": 2 },
      { "ref": "22.7", "question": "51 - 27 = ? (You may need to regroup.)", "expected": "24", "input_type": "numeric", "error_signals": ["ERR_BORROW","ERR_SUB_AFTER_BORROW","ERR_PLACE_VALUE"], "ruby_prompt": "1<7: borrow 1 ten. 11-7=4, then 4-2=2.", "difficulty": 2 },
      { "ref": "22.8", "question": "82 - 47 = ? (You may need to regroup.)", "expected": "35", "input_type": "numeric", "error_signals": ["ERR_BORROW","ERR_SUB_AFTER_BORROW","ERR_PLACE_VALUE"], "ruby_prompt": "2<7: borrow 1 ten. 12-7=5, then 7-4=3.", "difficulty": 2 }
    ]
  },
  "M023": {
    "title": "Addition and Subtraction Strategies — Splitting, Compensation, Three-Digit",
    "gate": "A",
    "skill_ids": ["L4.T1.A2", "L4.T2.A1", "L4.T3.A1"],
    "pass_threshold": 0.8,
    "questions_for_mastery": 3,
    "questions": [
      { "ref": "23.1", "question": "34 + 25 = ? (Split: 30+20=50, 4+5=9, then add.)", "expected": "59", "input_type": "numeric", "error_signals": ["ERR_SPLIT_TENS","ERR_SPLIT_ONES","ERR_ADD_PARTS"], "ruby_prompt": "Split into tens and ones. Add each part, then combine.", "difficulty": 2 },
      { "ref": "23.2", "question": "47 + 36 = ? (Split: 40+30=70, 7+6=13, then add.)", "expected": "83", "input_type": "numeric", "error_signals": ["ERR_SPLIT_TENS","ERR_SPLIT_ONES","ERR_ADD_PARTS"], "ruby_prompt": "Split: 40+30=70 and 7+6=13. Add together: 70+13=?", "difficulty": 2 },
      { "ref": "23.3", "question": "99 + 47 = ? (Compensation: round 99 to 100, add 47, then subtract 1.)", "expected": "146", "input_type": "numeric", "error_signals": ["ERR_COMPENSATION","ERR_FORGET_ADJUST"], "ruby_prompt": "100+47=147. Subtract 1 because you added 1 extra: 147-1=?", "difficulty": 2 },
      { "ref": "23.4", "question": "198 + 65 = ? (Compensation: round 198 to 200, add 65, then subtract 2.)", "expected": "263", "input_type": "numeric", "error_signals": ["ERR_COMPENSATION","ERR_FORGET_ADJUST"], "ruby_prompt": "200+65=265. Subtract 2 because you added 2 extra: 265-2=?", "difficulty": 2 },
      { "ref": "23.5", "question": "234 + 152 = ?", "expected": "386", "input_type": "numeric", "error_signals": ["ERR_ADD_HUNDREDS","ERR_REGROUP","ERR_PLACE_VALUE"], "ruby_prompt": "Add column by column: ones 4+2=6, tens 3+5=8, hundreds 2+1=3.", "difficulty": 2 },
      { "ref": "23.6", "question": "456 + 237 = ?", "expected": "693", "input_type": "numeric", "error_signals": ["ERR_ADD_HUNDREDS","ERR_REGROUP","ERR_PLACE_VALUE"], "ruby_prompt": "6+7=13 (write 3, carry 1), 5+3+1=9, 4+2=6.", "difficulty": 3 },
      { "ref": "23.7", "question": "742 - 318 = ?", "expected": "424", "input_type": "numeric", "error_signals": ["ERR_SUB_HUNDREDS","ERR_BORROW","ERR_PLACE_VALUE"], "ruby_prompt": "Work column by column from right to left. Borrow where needed.", "difficulty": 3 },
      { "ref": "23.8", "question": "523 - 267 = ?", "expected": "256", "input_type": "numeric", "error_signals": ["ERR_SUB_HUNDREDS","ERR_BORROW","ERR_PLACE_VALUE"], "ruby_prompt": "Start in ones: 3<7, borrow. Work each column right to left.", "difficulty": 3 }
    ]
  },
  "M024": {
    "title": "Skip Counting",
    "gate": "A",
    "skill_ids": ["L5.T2.A1"],
    "pass_threshold": 0.8,
    "questions_for_mastery": 3,
    "questions": [
      { "ref": "24.1", "question": "4, 6, 8, __ — what is the next number? (Counting by 2s.)", "expected": "10", "input_type": "numeric", "error_signals": ["ERR_SKIP_COUNT_STEP","ERR_PATTERN"], "ruby_prompt": "Count by 2s. After 8, what comes next?", "difficulty": 1 },
      { "ref": "24.2", "question": "10, 15, 20, __ — what is the next number? (Counting by 5s.)", "expected": "25", "input_type": "numeric", "error_signals": ["ERR_SKIP_COUNT_STEP","ERR_PATTERN"], "ruby_prompt": "Count by 5s. After 20, what comes next?", "difficulty": 1 },
      { "ref": "24.3", "question": "30, 40, 50, __ — what is the next number? (Counting by 10s.)", "expected": "60", "input_type": "numeric", "error_signals": ["ERR_SKIP_COUNT_STEP","ERR_PATTERN"], "ruby_prompt": "Count by 10s. After 50, what comes next?", "difficulty": 1 },
      { "ref": "24.4", "question": "8, 10, 12, 14, __ — what is the next number?", "expected": "16", "input_type": "numeric", "error_signals": ["ERR_SKIP_COUNT_STEP","ERR_PATTERN"], "ruby_prompt": "Each number increases by 2. After 14, what comes next?", "difficulty": 1 },
      { "ref": "24.5", "question": "25, 30, 35, 40, __ — what is the next number?", "expected": "45", "input_type": "numeric", "error_signals": ["ERR_SKIP_COUNT_STEP","ERR_PATTERN"], "ruby_prompt": "Each number increases by 5. After 40, what comes next?", "difficulty": 1 },
      { "ref": "24.6", "question": "5, 10, 15, __, 25 — what is the missing number?", "expected": "20", "input_type": "numeric", "error_signals": ["ERR_SKIP_COUNT_STEP","ERR_PATTERN"], "ruby_prompt": "Count by 5s. After 15, what comes before 25?", "difficulty": 1 },
      { "ref": "24.7", "question": "2, 4, __, 8, 10 — what is the missing number?", "expected": "6", "input_type": "numeric", "error_signals": ["ERR_SKIP_COUNT_STEP","ERR_PATTERN"], "ruby_prompt": "Count by 2s. After 4, what comes before 8?", "difficulty": 1 },
      { "ref": "24.8", "question": "20, 30, __, 50, 60 — what is the missing number?", "expected": "40", "input_type": "numeric", "error_signals": ["ERR_SKIP_COUNT_STEP","ERR_PATTERN"], "ruby_prompt": "Count by 10s. After 30, what comes before 50?", "difficulty": 1 }
    ]
  },
  "M025": {
    "title": "Multiplication Tables",
    "gate": "A",
    "skill_ids": ["L5.T2.A2", "L5.T2.A3"],
    "pass_threshold": 0.8,
    "questions_for_mastery": 3,
    "questions": [
      { "ref": "25.1", "question": "3 × 2 = ?", "expected": "6", "input_type": "numeric", "error_signals": ["ERR_TIMES_TABLE","ERR_MULT_OFF"], "ruby_prompt": "3 groups of 2. What is 3 times 2?", "difficulty": 1 },
      { "ref": "25.2", "question": "6 × 5 = ?", "expected": "30", "input_type": "numeric", "error_signals": ["ERR_TIMES_TABLE","ERR_MULT_OFF"], "ruby_prompt": "Count by 5s six times: 5,10,15,20,25,30.", "difficulty": 1 },
      { "ref": "25.3", "question": "7 × 10 = ?", "expected": "70", "input_type": "numeric", "error_signals": ["ERR_TIMES_TABLE","ERR_MULT_OFF"], "ruby_prompt": "Multiplying by 10 adds a zero. 7×10=?", "difficulty": 1 },
      { "ref": "25.4", "question": "8 × 5 = ?", "expected": "40", "input_type": "numeric", "error_signals": ["ERR_TIMES_TABLE","ERR_MULT_OFF"], "ruby_prompt": "Count by 5s eight times. What do you get?", "difficulty": 1 },
      { "ref": "25.5", "question": "9 × 10 = ?", "expected": "90", "input_type": "numeric", "error_signals": ["ERR_TIMES_TABLE","ERR_MULT_OFF"], "ruby_prompt": "9×10. Add a zero to 9.", "difficulty": 1 },
      { "ref": "25.6", "question": "4 × 3 = ?", "expected": "12", "input_type": "numeric", "error_signals": ["ERR_TIMES_TABLE","ERR_MULT_OFF"], "ruby_prompt": "4 groups of 3. Count: 3,6,9,12.", "difficulty": 1 },
      { "ref": "25.7", "question": "6 × 4 = ?", "expected": "24", "input_type": "numeric", "error_signals": ["ERR_TIMES_TABLE","ERR_MULT_OFF"], "ruby_prompt": "6 groups of 4. Count up by 4s.", "difficulty": 2 },
      { "ref": "25.8", "question": "7 × 6 = ?", "expected": "42", "input_type": "numeric", "error_signals": ["ERR_TIMES_TABLE","ERR_MULT_OFF"], "ruby_prompt": "Use 7×5=35, then add one more 6.", "difficulty": 2 },
      { "ref": "25.9", "question": "8 × 7 = ?", "expected": "56", "input_type": "numeric", "error_signals": ["ERR_TIMES_TABLE","ERR_MULT_OFF"], "ruby_prompt": "Try 8×5=40 plus 8×2=16.", "difficulty": 2 },
      { "ref": "25.10", "question": "9 × 8 = ?", "expected": "72", "input_type": "numeric", "error_signals": ["ERR_TIMES_TABLE","ERR_MULT_OFF"], "ruby_prompt": "Try 10×8=80, then subtract one 8.", "difficulty": 2 },
      { "ref": "25.11", "question": "6 × 9 = ?", "expected": "54", "input_type": "numeric", "error_signals": ["ERR_TIMES_TABLE","ERR_MULT_OFF"], "ruby_prompt": "Try 6×10=60, then subtract one 6.", "difficulty": 2 },
      { "ref": "25.12", "question": "7 × 8 = ?", "expected": "56", "input_type": "numeric", "error_signals": ["ERR_TIMES_TABLE","ERR_MULT_OFF"], "ruby_prompt": "Try 7×4=28, then double it.", "difficulty": 2 }
    ]
  },
  "M026": {
    "title": "Multiplication Properties — Commutative and Distributive",
    "gate": "B",
    "skill_ids": ["L5.T3.A1", "L6.T3.A1"],
    "pass_threshold": 0.8,
    "questions_for_mastery": 3,
    "questions": [
      { "ref": "26.1", "question": "4 × 7 = 28. What is 7 × 4?", "expected": "28", "input_type": "numeric", "error_signals": ["ERR_COMMUTATIVE","ERR_MULT_OFF"], "ruby_prompt": "Multiplication can be done in any order. 4×7 = 7×4.", "difficulty": 1 },
      { "ref": "26.2", "question": "3 × 9 = 27. What is 9 × 3?", "expected": "27", "input_type": "numeric", "error_signals": ["ERR_COMMUTATIVE","ERR_MULT_OFF"], "ruby_prompt": "Swapping the numbers does not change the product.", "difficulty": 1 },
      { "ref": "26.3", "question": "Use the distributive property to find 4 × 13. (4×10) + (4×3) = 40 + 12 = ?", "expected": "52", "input_type": "numeric", "error_signals": ["ERR_DISTRIBUTIVE","ERR_MULT_PARTIAL"], "ruby_prompt": "4×13 = 4×10 + 4×3 = 40 + 12. What is the total?", "difficulty": 2 },
      { "ref": "26.4", "question": "Use the distributive property to find 6 × 12. (6×10) + (6×2) = 60 + 12 = ?", "expected": "72", "input_type": "numeric", "error_signals": ["ERR_DISTRIBUTIVE","ERR_MULT_PARTIAL"], "ruby_prompt": "6×12 = 6×10 + 6×2 = 60 + 12. What is the total?", "difficulty": 2 },
      { "ref": "26.5", "question": "Use the distributive property to find 7 × 14. (7×10) + (7×4) = 70 + 28 = ?", "expected": "98", "input_type": "numeric", "error_signals": ["ERR_DISTRIBUTIVE","ERR_MULT_PARTIAL"], "ruby_prompt": "7×14 = 7×10 + 7×4 = 70 + 28. What is the total?", "difficulty": 2 },
      { "ref": "26.6", "question": "Use the distributive property to find 5 × 18. (5×10) + (5×8) = 50 + 40 = ?", "expected": "90", "input_type": "numeric", "error_signals": ["ERR_DISTRIBUTIVE","ERR_MULT_PARTIAL"], "ruby_prompt": "5×18 = 5×10 + 5×8 = 50 + 40. What is the total?", "difficulty": 2 },
      { "ref": "26.7", "question": "3 × 15 = ? (Split 15 as 10+5: 3×10 + 3×5)", "expected": "45", "input_type": "numeric", "error_signals": ["ERR_DISTRIBUTIVE","ERR_MULT_PARTIAL"], "ruby_prompt": "3×10=30 and 3×5=15. Add them together.", "difficulty": 2 },
      { "ref": "26.8", "question": "8 × 13 = ? (Split 13 as 10+3: 8×10 + 8×3)", "expected": "104", "input_type": "numeric", "error_signals": ["ERR_DISTRIBUTIVE","ERR_MULT_PARTIAL"], "ruby_prompt": "8×10=80 and 8×3=24. Add them together.", "difficulty": 3 }
    ]
  },
  "M027": {
    "title": "Multi-Digit Multiplication",
    "gate": "B",
    "skill_ids": ["L6.T2.A1", "L6.T2.A2", "L6.T2.A3"],
    "pass_threshold": 0.8,
    "questions_for_mastery": 3,
    "questions": [
      { "ref": "27.1", "question": "23 × 4 = ?", "expected": "92", "input_type": "numeric", "error_signals": ["ERR_MULT_ONES","ERR_MULT_TENS","ERR_REGROUP"], "ruby_prompt": "4×3=12 (write 2, carry 1). 4×2+1=9. Answer: 92.", "difficulty": 2 },
      { "ref": "27.2", "question": "36 × 5 = ?", "expected": "180", "input_type": "numeric", "error_signals": ["ERR_MULT_ONES","ERR_MULT_TENS","ERR_REGROUP"], "ruby_prompt": "5×6=30 (write 0, carry 3). 5×3+3=18. Answer: 180.", "difficulty": 2 },
      { "ref": "27.3", "question": "47 × 3 = ?", "expected": "141", "input_type": "numeric", "error_signals": ["ERR_MULT_ONES","ERR_MULT_TENS","ERR_REGROUP"], "ruby_prompt": "3×7=21 (write 1, carry 2). 3×4+2=14. Answer: 141.", "difficulty": 2 },
      { "ref": "27.4", "question": "52 × 6 = ?", "expected": "312", "input_type": "numeric", "error_signals": ["ERR_MULT_ONES","ERR_MULT_TENS","ERR_REGROUP"], "ruby_prompt": "6×2=12 (write 2, carry 1). 6×5+1=31. Answer: 312.", "difficulty": 2 },
      { "ref": "27.5", "question": "124 × 3 = ?", "expected": "372", "input_type": "numeric", "error_signals": ["ERR_MULT_HUNDREDS","ERR_REGROUP","ERR_PLACE_VALUE"], "ruby_prompt": "3×4=12, 3×2+1=7, 3×1=3. Answer: 372.", "difficulty": 2 },
      { "ref": "27.6", "question": "215 × 4 = ?", "expected": "860", "input_type": "numeric", "error_signals": ["ERR_MULT_HUNDREDS","ERR_REGROUP","ERR_PLACE_VALUE"], "ruby_prompt": "4×5=20, 4×1+2=6, 4×2=8. Answer: 860.", "difficulty": 2 },
      { "ref": "27.7", "question": "23 × 12 = ?", "expected": "276", "input_type": "numeric", "error_signals": ["ERR_LONG_MULT_ROW","ERR_PLACE_SHIFT","ERR_ADD_ROWS"], "ruby_prompt": "23×2=46, 23×10=230. Add: 46+230=276.", "difficulty": 3 },
      { "ref": "27.8", "question": "34 × 21 = ?", "expected": "714", "input_type": "numeric", "error_signals": ["ERR_LONG_MULT_ROW","ERR_PLACE_SHIFT","ERR_ADD_ROWS"], "ruby_prompt": "34×1=34, 34×20=680. Add: 34+680=714.", "difficulty": 3 },
      { "ref": "27.9", "question": "45 × 12 = ?", "expected": "540", "input_type": "numeric", "error_signals": ["ERR_LONG_MULT_ROW","ERR_PLACE_SHIFT","ERR_ADD_ROWS"], "ruby_prompt": "45×2=90, 45×10=450. Add: 90+450=540.", "difficulty": 3 }
    ]
  },
  "M028": {
    "title": "Division Strategies",
    "gate": "B",
    "skill_ids": ["L7.T2.A1", "L7.T3.A1"],
    "pass_threshold": 0.8,
    "questions_for_mastery": 3,
    "questions": [
      { "ref": "28.1", "question": "24 ÷ 4 = ? (Think: 4 × ? = 24)", "expected": "6", "input_type": "numeric", "error_signals": ["ERR_DIV_INVERSE","ERR_DIV_OFF"], "ruby_prompt": "What number times 4 equals 24?", "difficulty": 1 },
      { "ref": "28.2", "question": "35 ÷ 5 = ? (Think: 5 × ? = 35)", "expected": "7", "input_type": "numeric", "error_signals": ["ERR_DIV_INVERSE","ERR_DIV_OFF"], "ruby_prompt": "Count by 5s until you reach 35. How many steps?", "difficulty": 1 },
      { "ref": "28.3", "question": "42 ÷ 6 = ? (Think: 6 × ? = 42)", "expected": "7", "input_type": "numeric", "error_signals": ["ERR_DIV_INVERSE","ERR_DIV_OFF"], "ruby_prompt": "What times 6 equals 42? Use your 6 times table.", "difficulty": 2 },
      { "ref": "28.4", "question": "56 ÷ 7 = ? (Think: 7 × ? = 56)", "expected": "8", "input_type": "numeric", "error_signals": ["ERR_DIV_INVERSE","ERR_DIV_OFF"], "ruby_prompt": "What times 7 equals 56? Use your 7 times table.", "difficulty": 2 },
      { "ref": "28.5", "question": "72 ÷ 8 = ? (Think: 8 × ? = 72)", "expected": "9", "input_type": "numeric", "error_signals": ["ERR_DIV_INVERSE","ERR_DIV_OFF"], "ruby_prompt": "What times 8 equals 72? Use your 8 times table.", "difficulty": 2 },
      { "ref": "28.6", "question": "25 ÷ 4: what is the quotient (whole number answer only)?", "expected": "6", "input_type": "numeric", "error_signals": ["ERR_REMAINDER_IGNORE","ERR_DIV_OFF"], "ruby_prompt": "4×6=24, which is less than 25. The quotient is 6.", "difficulty": 2 },
      { "ref": "28.7", "question": "25 ÷ 4 = 6 remainder __. What is the remainder?", "expected": "1", "input_type": "numeric", "error_signals": ["ERR_REMAINDER_CALC","ERR_DIV_OFF"], "ruby_prompt": "4×6=24. Subtract from 25: 25-24=1. Remainder is 1.", "difficulty": 2 },
      { "ref": "28.8", "question": "37 ÷ 5: what is the quotient (whole number answer only)?", "expected": "7", "input_type": "numeric", "error_signals": ["ERR_REMAINDER_IGNORE","ERR_DIV_OFF"], "ruby_prompt": "5×7=35, which is less than 37. The quotient is 7.", "difficulty": 2 },
      { "ref": "28.9", "question": "37 ÷ 5 = 7 remainder __. What is the remainder?", "expected": "2", "input_type": "numeric", "error_signals": ["ERR_REMAINDER_CALC","ERR_DIV_OFF"], "ruby_prompt": "5×7=35. Subtract: 37-35=2. Remainder is 2.", "difficulty": 2 },
      { "ref": "28.10", "question": "47 ÷ 6: what is the quotient (whole number answer only)?", "expected": "7", "input_type": "numeric", "error_signals": ["ERR_REMAINDER_IGNORE","ERR_DIV_OFF"], "ruby_prompt": "6×7=42, which is less than 47. The quotient is 7.", "difficulty": 2 }
    ]
  },
  "M029": {
    "title": "Fractions — Number Line and Equivalence",
    "gate": "B",
    "skill_ids": ["L8.T2.A1", "L8.T3.A1"],
    "pass_threshold": 0.8,
    "questions_for_mastery": 3,
    "questions": [
      { "ref": "29.1", "question": "A number line from 0 to 1 has 4 equal parts. The arrow points to the 3rd mark. What fraction is shown? (Write as a/b)", "expected": "3/4", "input_type": "text", "error_signals": ["ERR_NUMERATOR","ERR_DENOMINATOR","ERR_NUMBER_LINE"], "ruby_prompt": "3 parts out of 4 equal parts = 3/4.", "difficulty": 1 },
      { "ref": "29.2", "question": "A number line from 0 to 1 has 3 equal parts. The arrow points to the 2nd mark. What fraction is shown?", "expected": "2/3", "input_type": "text", "error_signals": ["ERR_NUMERATOR","ERR_DENOMINATOR","ERR_NUMBER_LINE"], "ruby_prompt": "2 parts out of 3 equal parts = 2/3.", "difficulty": 1 },
      { "ref": "29.3", "question": "A number line from 0 to 1 has 5 equal parts. The arrow points to the 4th mark. What fraction is shown?", "expected": "4/5", "input_type": "text", "error_signals": ["ERR_NUMERATOR","ERR_DENOMINATOR","ERR_NUMBER_LINE"], "ruby_prompt": "4 parts out of 5 equal parts = 4/5.", "difficulty": 1 },
      { "ref": "29.4", "question": "A number line from 0 to 1 has 8 equal parts. The arrow points to the 6th mark. What fraction is shown?", "expected": "6/8", "input_type": "text", "error_signals": ["ERR_NUMERATOR","ERR_DENOMINATOR","ERR_NUMBER_LINE"], "ruby_prompt": "6 parts out of 8 equal parts = 6/8 (or 3/4).", "difficulty": 2 },
      { "ref": "29.5", "question": "What fraction equivalent to 1/2 has a denominator of 4?", "expected": "2/4", "input_type": "text", "error_signals": ["ERR_EQUIV_FRAC","ERR_MULTIPLY_BOTH"], "ruby_prompt": "Multiply top and bottom by 2: 1×2=2, 2×2=4. So 1/2 = 2/4.", "difficulty": 2 },
      { "ref": "29.6", "question": "What fraction equivalent to 2/3 has a denominator of 6?", "expected": "4/6", "input_type": "text", "error_signals": ["ERR_EQUIV_FRAC","ERR_MULTIPLY_BOTH"], "ruby_prompt": "Multiply top and bottom by 2: 2×2=4, 3×2=6. So 2/3 = 4/6.", "difficulty": 2 },
      { "ref": "29.7", "question": "What fraction equivalent to 3/4 has a denominator of 8?", "expected": "6/8", "input_type": "text", "error_signals": ["ERR_EQUIV_FRAC","ERR_MULTIPLY_BOTH"], "ruby_prompt": "Multiply top and bottom by 2: 3×2=6, 4×2=8. So 3/4 = 6/8.", "difficulty": 2 },
      { "ref": "29.8", "question": "Simplify 4/8 to its simplest form.", "expected": "1/2", "input_type": "text", "error_signals": ["ERR_SIMPLIFY","ERR_HCF"], "ruby_prompt": "HCF of 4 and 8 is 4. 4÷4=1, 8÷4=2. Simplest form: 1/2.", "difficulty": 2 }
    ]
  },
  "M030": {
    "title": "Fraction Operations",
    "gate": "B",
    "skill_ids": ["L9.T1.A2", "L9.T2.A1", "L9.T2.A2", "L9.T3.A1", "L9.T3.A2"],
    "pass_threshold": 0.8,
    "questions_for_mastery": 3,
    "questions": [
      { "ref": "30.1", "question": "1/2 + 1/4 = ? (Find a common denominator first.)", "expected": "3/4", "input_type": "text", "error_signals": ["ERR_COMMON_DENOM","ERR_ADD_FRAC"], "ruby_prompt": "Convert 1/2 to 2/4. Then 2/4 + 1/4 = 3/4.", "difficulty": 2 },
      { "ref": "30.2", "question": "1/3 + 1/6 = ? (Find a common denominator first.)", "expected": "1/2", "input_type": "text", "error_signals": ["ERR_COMMON_DENOM","ERR_ADD_FRAC"], "ruby_prompt": "Convert 1/3 to 2/6. Then 2/6 + 1/6 = 3/6 = 1/2.", "difficulty": 2 },
      { "ref": "30.3", "question": "3/4 + 1/8 = ?", "expected": "7/8", "input_type": "text", "error_signals": ["ERR_COMMON_DENOM","ERR_ADD_FRAC"], "ruby_prompt": "Convert 3/4 to 6/8. Then 6/8 + 1/8 = 7/8.", "difficulty": 2 },
      { "ref": "30.4", "question": "1/4 × 8 = ?", "expected": "2", "input_type": "numeric", "error_signals": ["ERR_FRAC_WHOLE_MULT","ERR_SIMPLIFY"], "ruby_prompt": "1/4 × 8 = 8/4 = 2. Divide the whole number by the denominator.", "difficulty": 2 },
      { "ref": "30.5", "question": "2/3 × 6 = ?", "expected": "4", "input_type": "numeric", "error_signals": ["ERR_FRAC_WHOLE_MULT","ERR_SIMPLIFY"], "ruby_prompt": "2/3 × 6 = (2×6)/3 = 12/3 = 4.", "difficulty": 2 },
      { "ref": "30.6", "question": "1/2 × 1/3 = ?", "expected": "1/6", "input_type": "text", "error_signals": ["ERR_FRAC_FRAC_MULT","ERR_ADD_NOT_MULT"], "ruby_prompt": "Multiply top by top and bottom by bottom: (1×1)/(2×3) = 1/6.", "difficulty": 2 },
      { "ref": "30.7", "question": "2/3 × 3/4 = ?", "expected": "1/2", "input_type": "text", "error_signals": ["ERR_FRAC_FRAC_MULT","ERR_SIMPLIFY"], "ruby_prompt": "(2×3)/(3×4) = 6/12. Simplify: 6/12 = 1/2.", "difficulty": 2 },
      { "ref": "30.8", "question": "3/4 ÷ 3 = ? (Divide a fraction by a whole number.)", "expected": "1/4", "input_type": "text", "error_signals": ["ERR_FRAC_WHOLE_DIV","ERR_DENOM_CHANGE"], "ruby_prompt": "3/4 ÷ 3 = 3/12 = 1/4. Multiply the denominator by the whole number.", "difficulty": 2 },
      { "ref": "30.9", "question": "2/3 ÷ 4 = ?", "expected": "1/6", "input_type": "text", "error_signals": ["ERR_FRAC_WHOLE_DIV","ERR_DENOM_CHANGE"], "ruby_prompt": "2/3 ÷ 4 = 2/12 = 1/6.", "difficulty": 2 },
      { "ref": "30.10", "question": "1/2 ÷ 1/4 = ? (Multiply by the reciprocal.)", "expected": "2", "input_type": "numeric", "error_signals": ["ERR_RECIPROCAL","ERR_FRAC_DIV"], "ruby_prompt": "Flip the second fraction and multiply: 1/2 × 4/1 = 4/2 = 2.", "difficulty": 3 },
      { "ref": "30.11", "question": "2/3 ÷ 1/6 = ?", "expected": "4", "input_type": "numeric", "error_signals": ["ERR_RECIPROCAL","ERR_FRAC_DIV"], "ruby_prompt": "Flip and multiply: 2/3 × 6/1 = 12/3 = 4.", "difficulty": 3 }
    ]
  },
  "M031": {
    "title": "Percentages — Unitary Method, Percentage of Amount, Increase and Decrease",
    "gate": "B",
    "skill_ids": ["L11.T2.A1", "L11.T2.A2", "L11.T3.A1"],
    "pass_threshold": 0.8,
    "questions_for_mastery": 3,
    "questions": [
      { "ref": "31.1", "question": "10% of 80 = ?", "expected": "8", "input_type": "numeric", "error_signals": ["ERR_PCT_OF_AMOUNT","ERR_PERCENT_CALC"], "ruby_prompt": "10% means divide by 10. 80 ÷ 10 = ?", "difficulty": 1 },
      { "ref": "31.2", "question": "25% of 60 = ?", "expected": "15", "input_type": "numeric", "error_signals": ["ERR_PCT_OF_AMOUNT","ERR_PERCENT_CALC"], "ruby_prompt": "25% = 1/4. 60 ÷ 4 = ?", "difficulty": 2 },
      { "ref": "31.3", "question": "50% of 120 = ?", "expected": "60", "input_type": "numeric", "error_signals": ["ERR_PCT_OF_AMOUNT","ERR_PERCENT_CALC"], "ruby_prompt": "50% = half. Half of 120 = ?", "difficulty": 1 },
      { "ref": "31.4", "question": "20% of 45 = ?", "expected": "9", "input_type": "numeric", "error_signals": ["ERR_PCT_OF_AMOUNT","ERR_PERCENT_CALC"], "ruby_prompt": "Find 10% first (=4.5), then double it for 20%.", "difficulty": 2 },
      { "ref": "31.5", "question": "5 books cost £35. How much does 1 book cost? (Unitary method.)", "expected": "7", "input_type": "numeric", "error_signals": ["ERR_UNITARY_DIV","ERR_UNITARY_EXTRA_STEP"], "ruby_prompt": "Divide total by number of items: 35 ÷ 5 = ?", "difficulty": 2 },
      { "ref": "31.6", "question": "4 pencils cost 60p. How much does 1 pencil cost? (Give answer in pence.)", "expected": "15", "input_type": "numeric", "error_signals": ["ERR_UNITARY_DIV","ERR_UNITS"], "ruby_prompt": "Divide total by number of items: 60 ÷ 4 = ?", "difficulty": 2 },
      { "ref": "31.7", "question": "Increase 80 by 10%. What is the new amount?", "expected": "88", "input_type": "numeric", "error_signals": ["ERR_PCT_INCREASE","ERR_FORGET_ORIGINAL"], "ruby_prompt": "Find 10% of 80 = 8. Add it to 80: 80 + 8 = ?", "difficulty": 2 },
      { "ref": "31.8", "question": "Decrease 200 by 25%. What is the new amount?", "expected": "150", "input_type": "numeric", "error_signals": ["ERR_PCT_DECREASE","ERR_FORGET_ORIGINAL"], "ruby_prompt": "Find 25% of 200 = 50. Subtract: 200 - 50 = ?", "difficulty": 2 },
      { "ref": "31.9", "question": "A coat costs £80. It is reduced by 20% in a sale. What is the sale price?", "expected": "64", "input_type": "numeric", "error_signals": ["ERR_PCT_DECREASE","ERR_FORGET_ORIGINAL"], "ruby_prompt": "20% of 80 = 16. Sale price = 80 - 16 = ?", "difficulty": 3 },
      { "ref": "31.10", "question": "A meal costs £30. A 20% tip is added. What is the total bill?", "expected": "36", "input_type": "numeric", "error_signals": ["ERR_PCT_INCREASE","ERR_FORGET_ORIGINAL"], "ruby_prompt": "20% of 30 = 6. Total = 30 + 6 = ?", "difficulty": 3 }
    ]
  },
  "M032": {
    "title": "Negative Number Operations",
    "gate": "C",
    "skill_ids": ["L12.T2.A1", "L12.T2.A2"],
    "pass_threshold": 0.8,
    "questions_for_mastery": 3,
    "questions": [
      { "ref": "32.1", "question": "5 + (-3) = ?", "expected": "2", "input_type": "numeric", "error_signals": ["ERR_NEG_ADD","ERR_SIGN_CONFUSION"], "ruby_prompt": "Adding a negative is the same as subtracting. 5 - 3 = ?", "difficulty": 2 },
      { "ref": "32.2", "question": "-4 + 7 = ?", "expected": "3", "input_type": "numeric", "error_signals": ["ERR_NEG_ADD","ERR_SIGN_CONFUSION"], "ruby_prompt": "Start at -4 on the number line and move 7 places right.", "difficulty": 2 },
      { "ref": "32.3", "question": "3 - 8 = ?", "expected": "-5", "input_type": "numeric", "error_signals": ["ERR_NEG_RESULT","ERR_SIGN_CONFUSION"], "ruby_prompt": "3 - 8 goes below zero. 3 - 8 = ?", "difficulty": 2 },
      { "ref": "32.4", "question": "-2 - 5 = ?", "expected": "-7", "input_type": "numeric", "error_signals": ["ERR_NEG_SUB","ERR_SIGN_CONFUSION"], "ruby_prompt": "Start at -2 and move 5 more to the left. -2 - 5 = ?", "difficulty": 2 },
      { "ref": "32.5", "question": "-6 + 2 = ?", "expected": "-4", "input_type": "numeric", "error_signals": ["ERR_NEG_ADD","ERR_SIGN_CONFUSION"], "ruby_prompt": "Start at -6 and move 2 places right. -6 + 2 = ?", "difficulty": 2 },
      { "ref": "32.6", "question": "-3 × 4 = ?", "expected": "-12", "input_type": "numeric", "error_signals": ["ERR_NEG_MULT_SIGN","ERR_TIMES_TABLE"], "ruby_prompt": "Negative × positive = negative. 3×4=12, so -3×4=?", "difficulty": 2 },
      { "ref": "32.7", "question": "-5 × -3 = ?", "expected": "15", "input_type": "numeric", "error_signals": ["ERR_NEG_NEG_MULT","ERR_TIMES_TABLE"], "ruby_prompt": "Negative × negative = positive. 5×3=15, so -5×-3=?", "difficulty": 2 },
      { "ref": "32.8", "question": "12 ÷ (-4) = ?", "expected": "-3", "input_type": "numeric", "error_signals": ["ERR_NEG_DIV_SIGN","ERR_DIV_OFF"], "ruby_prompt": "Positive ÷ negative = negative. 12÷4=3, so 12÷(-4)=?", "difficulty": 2 },
      { "ref": "32.9", "question": "-20 ÷ (-5) = ?", "expected": "4", "input_type": "numeric", "error_signals": ["ERR_NEG_NEG_DIV","ERR_DIV_OFF"], "ruby_prompt": "Negative ÷ negative = positive. 20÷5=4, so -20÷(-5)=?", "difficulty": 2 },
      { "ref": "32.10", "question": "6 × (-7) = ?", "expected": "-42", "input_type": "numeric", "error_signals": ["ERR_NEG_MULT_SIGN","ERR_TIMES_TABLE"], "ruby_prompt": "Positive × negative = negative. 6×7=42, so 6×(-7)=?", "difficulty": 3 }
    ]
  },
  "M033": {
    "title": "Number Patterns, Expanding Brackets, and Factorisation",
    "gate": "C",
    "skill_ids": ["L13.T1.A1", "L13.T3.A1", "L13.T3.A2"],
    "pass_threshold": 0.8,
    "questions_for_mastery": 3,
    "questions": [
      { "ref": "33.1", "question": "What is the next term? 3, 6, 9, 12, __", "expected": "15", "input_type": "numeric", "error_signals": ["ERR_PATTERN_STEP","ERR_PATTERN_TYPE"], "ruby_prompt": "Each term increases by 3. After 12, what comes next?", "difficulty": 1 },
      { "ref": "33.2", "question": "What is the next term? 2, 5, 8, 11, __", "expected": "14", "input_type": "numeric", "error_signals": ["ERR_PATTERN_STEP","ERR_PATTERN_TYPE"], "ruby_prompt": "Each term increases by 3. After 11, what comes next?", "difficulty": 1 },
      { "ref": "33.3", "question": "What is the next term? 1, 4, 9, 16, __", "expected": "25", "input_type": "numeric", "error_signals": ["ERR_PATTERN_STEP","ERR_PATTERN_SQUARE"], "ruby_prompt": "These are square numbers: 1², 2², 3², 4². What is 5²?", "difficulty": 2 },
      { "ref": "33.4", "question": "What is the missing term? 4, __, 16, 32", "expected": "8", "input_type": "numeric", "error_signals": ["ERR_PATTERN_STEP","ERR_PATTERN_TYPE"], "ruby_prompt": "Each term doubles. 4 doubled = 8. 8 doubled = 16.", "difficulty": 2 },
      { "ref": "33.5", "question": "Expand: 3(x + 4). Type your answer with no spaces (e.g. 3x+12).", "expected": "3x+12", "input_type": "text", "error_signals": ["ERR_EXPAND_BRACKET","ERR_DIST_FORGET_CONST"], "ruby_prompt": "Multiply each term inside by 3: 3×x=3x, 3×4=12.", "difficulty": 2 },
      { "ref": "33.6", "question": "Expand: 2(3x - 5). Type your answer with no spaces.", "expected": "6x-10", "input_type": "text", "error_signals": ["ERR_EXPAND_BRACKET","ERR_SIGN_CHANGE"], "ruby_prompt": "2×3x=6x. 2×(-5)=-10.", "difficulty": 2 },
      { "ref": "33.7", "question": "Expand: 4(2x + 3). Type your answer with no spaces.", "expected": "8x+12", "input_type": "text", "error_signals": ["ERR_EXPAND_BRACKET","ERR_DIST_FORGET_CONST"], "ruby_prompt": "4×2x=8x. 4×3=12.", "difficulty": 2 },
      { "ref": "33.8", "question": "Factorise 12x + 8. What is the HCF of 12 and 8?", "expected": "4", "input_type": "numeric", "error_signals": ["ERR_HCF","ERR_FACTOR_PARTIAL"], "ruby_prompt": "List factors of 12 and 8. The largest common factor is?", "difficulty": 2 },
      { "ref": "33.9", "question": "Factorise 12x + 8 fully. Write as a(bx + c) with no spaces.", "expected": "4(3x+2)", "input_type": "text", "error_signals": ["ERR_FACTORISE_HCF","ERR_FACTOR_PARTIAL"], "ruby_prompt": "HCF is 4. 12x÷4=3x, 8÷4=2. So 12x+8 = 4(3x+2).", "difficulty": 3 },
      { "ref": "33.10", "question": "Factorise 15x + 10 fully. Write as a(bx + c) with no spaces.", "expected": "5(3x+2)", "input_type": "text", "error_signals": ["ERR_FACTORISE_HCF","ERR_FACTOR_PARTIAL"], "ruby_prompt": "HCF of 15 and 10 is 5. 15x÷5=3x, 10÷5=2. So: 5(3x+2).", "difficulty": 3 }
    ]
  },
  "M034": {
    "title": "Advanced Linear Equations — Both Sides and Word Problems",
    "gate": "C",
    "skill_ids": ["L14.T2.A1", "L14.T3.A1"],
    "pass_threshold": 0.8,
    "questions_for_mastery": 3,
    "questions": [
      { "ref": "34.1", "question": "Solve: 3x + 4 = x + 12. What is x?", "expected": "4", "input_type": "numeric", "error_signals": ["ERR_COLLECT_X_TERMS","ERR_BOTH_SIDES","ERR_OP_ERROR"], "ruby_prompt": "Move x terms to one side: 3x - x = 12 - 4. So 2x = 8, x = ?", "difficulty": 3 },
      { "ref": "34.2", "question": "Solve: 5x - 3 = 2x + 9. What is x?", "expected": "4", "input_type": "numeric", "error_signals": ["ERR_COLLECT_X_TERMS","ERR_BOTH_SIDES","ERR_OP_ERROR"], "ruby_prompt": "Move x terms left: 5x - 2x = 9 + 3. So 3x = 12, x = ?", "difficulty": 3 },
      { "ref": "34.3", "question": "Solve: 4x + 1 = 2x + 9. What is x?", "expected": "4", "input_type": "numeric", "error_signals": ["ERR_COLLECT_X_TERMS","ERR_BOTH_SIDES","ERR_OP_ERROR"], "ruby_prompt": "4x - 2x = 9 - 1. So 2x = 8, x = ?", "difficulty": 3 },
      { "ref": "34.4", "question": "Solve: 6x - 5 = 3x + 7. What is x?", "expected": "4", "input_type": "numeric", "error_signals": ["ERR_COLLECT_X_TERMS","ERR_BOTH_SIDES","ERR_OP_ERROR"], "ruby_prompt": "6x - 3x = 7 + 5. So 3x = 12, x = ?", "difficulty": 3 },
      { "ref": "34.5", "question": "Solve: 2x + 7 = x + 11. What is x?", "expected": "4", "input_type": "numeric", "error_signals": ["ERR_COLLECT_X_TERMS","ERR_BOTH_SIDES","ERR_OP_ERROR"], "ruby_prompt": "2x - x = 11 - 7. So x = ?", "difficulty": 3 },
      { "ref": "34.6", "question": "A number is doubled and 3 is added, giving 11. Write an equation and solve for the number.", "expected": "4", "input_type": "numeric", "error_signals": ["ERR_FORM_EQUATION","ERR_WORD_PROBLEM"], "ruby_prompt": "Let the number be x. Equation: 2x + 3 = 11. Solve for x.", "difficulty": 3 },
      { "ref": "34.7", "question": "Sara has x stickers. Ben has 3 times as many. Together they have 24. How many does Sara have?", "expected": "6", "input_type": "numeric", "error_signals": ["ERR_FORM_EQUATION","ERR_WORD_PROBLEM"], "ruby_prompt": "Sara = x, Ben = 3x. x + 3x = 24. 4x = 24. x = ?", "difficulty": 3 },
      { "ref": "34.8", "question": "A rectangle has perimeter 28 cm. Its length is 3 more than its width. Find the width.", "expected": "5.5", "input_type": "numeric", "error_signals": ["ERR_FORM_EQUATION","ERR_PERIMETER","ERR_WORD_PROBLEM"], "ruby_prompt": "Width = w, length = w+3. 2(w + w+3) = 28. 4w + 6 = 28. 4w = 22. w = ?", "difficulty": 4 }
    ]
  }
};

Object.assign(bank.domains, newDomains);
writeFileSync(bankPath, JSON.stringify(bank, null, 2), 'utf8');

const newCount = Object.keys(newDomains).length;
const skillCount = Object.values(newDomains).reduce((s, d) => s + d.skill_ids.length, 0);
const qCount = Object.values(newDomains).reduce((s, d) => s + d.questions.length, 0);
console.log(`Added ${newCount} domains, ${skillCount} skills mapped, ${qCount} questions. Total domains: ${Object.keys(bank.domains).length}`);
