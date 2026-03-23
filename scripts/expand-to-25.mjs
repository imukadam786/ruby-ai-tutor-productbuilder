import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const bankPath = join(__dirname, '../data/question-bank.json');
const bank = JSON.parse(readFileSync(bankPath, 'utf8'));

const expansions = {
  "M020": [
    // No regroup — variety of number pairs
    { "ref": "20.16", "question": "71 + 18 = ?", "expected": "89", "input_type": "numeric", "error_signals": ["ERR_ADD_ONES","ERR_ADD_TENS","ERR_PLACE_VALUE"], "ruby_prompt": "Add ones: 1+8=9. Add tens: 7+1=8.", "difficulty": 1 },
    { "ref": "20.17", "question": "30 + 26 = ?", "expected": "56", "input_type": "numeric", "error_signals": ["ERR_ADD_ONES","ERR_ADD_TENS","ERR_PLACE_VALUE"], "ruby_prompt": "Add ones: 0+6=6. Add tens: 3+2=5.", "difficulty": 1 },
    { "ref": "20.18", "question": "13 + 62 = ?", "expected": "75", "input_type": "numeric", "error_signals": ["ERR_ADD_ONES","ERR_ADD_TENS","ERR_PLACE_VALUE"], "ruby_prompt": "Add ones: 3+2=5. Add tens: 1+6=7.", "difficulty": 1 },
    { "ref": "20.19", "question": "44 + 53 = ?", "expected": "97", "input_type": "numeric", "error_signals": ["ERR_ADD_ONES","ERR_ADD_TENS","ERR_PLACE_VALUE"], "ruby_prompt": "Add ones: 4+3=7. Add tens: 4+5=9.", "difficulty": 1 },
    // With regroup
    { "ref": "20.20", "question": "39 + 53 = ? (You may need to regroup.)", "expected": "92", "input_type": "numeric", "error_signals": ["ERR_REGROUP","ERR_ADD_TENS_AFTER_CARRY","ERR_PLACE_VALUE"], "ruby_prompt": "9+3=12: write 2, carry 1. Then 3+5+1=9 tens.", "difficulty": 2 },
    { "ref": "20.21", "question": "47 + 26 = ? (You may need to regroup.)", "expected": "73", "input_type": "numeric", "error_signals": ["ERR_REGROUP","ERR_ADD_TENS_AFTER_CARRY","ERR_PLACE_VALUE"], "ruby_prompt": "7+6=13: write 3, carry 1. Then 4+2+1=7 tens.", "difficulty": 2 },
    { "ref": "20.22", "question": "18 + 63 = ? (You may need to regroup.)", "expected": "81", "input_type": "numeric", "error_signals": ["ERR_REGROUP","ERR_ADD_TENS_AFTER_CARRY","ERR_PLACE_VALUE"], "ruby_prompt": "8+3=11: write 1, carry 1. Then 1+6+1=8 tens.", "difficulty": 2 },
    { "ref": "20.23", "question": "75 + 17 = ? (You may need to regroup.)", "expected": "92", "input_type": "numeric", "error_signals": ["ERR_REGROUP","ERR_ADD_TENS_AFTER_CARRY","ERR_PLACE_VALUE"], "ruby_prompt": "5+7=12: write 2, carry 1. Then 7+1+1=9 tens.", "difficulty": 2 },
    { "ref": "20.24", "question": "66 + 28 = ? (You may need to regroup.)", "expected": "94", "input_type": "numeric", "error_signals": ["ERR_REGROUP","ERR_ADD_TENS_AFTER_CARRY","ERR_PLACE_VALUE"], "ruby_prompt": "6+8=14: write 4, carry 1. Then 6+2+1=9 tens.", "difficulty": 2 },
    { "ref": "20.25", "question": "48 + 43 = ? (You may need to regroup.)", "expected": "91", "input_type": "numeric", "error_signals": ["ERR_REGROUP","ERR_ADD_TENS_AFTER_CARRY","ERR_PLACE_VALUE"], "ruby_prompt": "8+3=11: write 1, carry 1. Then 4+4+1=9 tens.", "difficulty": 2 }
  ],
  "M021": [
    { "ref": "21.16", "question": "41 - 33 = ?", "expected": "8", "input_type": "numeric", "error_signals": ["ERR_COUNT_UP","ERR_SUB_OFF"], "ruby_prompt": "Count up from 33 to 41. How many steps?", "difficulty": 2 },
    { "ref": "21.17", "question": "50 - 43 = ?", "expected": "7", "input_type": "numeric", "error_signals": ["ERR_COUNT_UP","ERR_SUB_OFF"], "ruby_prompt": "Count up from 43 to 50. How many steps?", "difficulty": 2 },
    { "ref": "21.18", "question": "35 - 28 = ?", "expected": "7", "input_type": "numeric", "error_signals": ["ERR_COUNT_UP","ERR_SUB_OFF"], "ruby_prompt": "Count up from 28 to 35. How many steps?", "difficulty": 2 },
    { "ref": "21.19", "question": "52 - 44 = ?", "expected": "8", "input_type": "numeric", "error_signals": ["ERR_COUNT_UP","ERR_SUB_OFF"], "ruby_prompt": "Count up from 44 to 52. How many steps?", "difficulty": 2 },
    { "ref": "21.20", "question": "61 - 55 = ?", "expected": "6", "input_type": "numeric", "error_signals": ["ERR_COUNT_UP","ERR_SUB_OFF"], "ruby_prompt": "Count up from 55 to 61. How many steps?", "difficulty": 2 },
    { "ref": "21.21", "question": "70 - 63 = ?", "expected": "7", "input_type": "numeric", "error_signals": ["ERR_COUNT_UP","ERR_SUB_OFF"], "ruby_prompt": "Count up from 63 to 70. How many steps?", "difficulty": 2 },
    { "ref": "21.22", "question": "45 - 39 = ?", "expected": "6", "input_type": "numeric", "error_signals": ["ERR_COUNT_UP","ERR_SUB_OFF"], "ruby_prompt": "Count up from 39 to 45. How many steps?", "difficulty": 2 },
    { "ref": "21.23", "question": "62 - 57 = ?", "expected": "5", "input_type": "numeric", "error_signals": ["ERR_COUNT_UP","ERR_SUB_OFF"], "ruby_prompt": "Count up from 57 to 62. How many steps?", "difficulty": 2 },
    { "ref": "21.24", "question": "80 - 72 = ?", "expected": "8", "input_type": "numeric", "error_signals": ["ERR_COUNT_UP","ERR_SUB_OFF"], "ruby_prompt": "Count up from 72 to 80. How many steps?", "difficulty": 2 },
    { "ref": "21.25", "question": "100 - 93 = ?", "expected": "7", "input_type": "numeric", "error_signals": ["ERR_COUNT_UP","ERR_SUB_OFF"], "ruby_prompt": "Count up from 93 to 100. How many steps?", "difficulty": 2 }
  ],
  "M022": [
    // No regroup
    { "ref": "22.16", "question": "88 - 41 = ?", "expected": "47", "input_type": "numeric", "error_signals": ["ERR_SUB_ONES","ERR_SUB_TENS","ERR_PLACE_VALUE"], "ruby_prompt": "Subtract ones: 8-1=7. Subtract tens: 8-4=4.", "difficulty": 1 },
    { "ref": "22.17", "question": "95 - 63 = ?", "expected": "32", "input_type": "numeric", "error_signals": ["ERR_SUB_ONES","ERR_SUB_TENS","ERR_PLACE_VALUE"], "ruby_prompt": "Subtract ones: 5-3=2. Subtract tens: 9-6=3.", "difficulty": 1 },
    { "ref": "22.18", "question": "76 - 32 = ?", "expected": "44", "input_type": "numeric", "error_signals": ["ERR_SUB_ONES","ERR_SUB_TENS","ERR_PLACE_VALUE"], "ruby_prompt": "Subtract ones: 6-2=4. Subtract tens: 7-3=4.", "difficulty": 1 },
    { "ref": "22.19", "question": "57 - 24 = ?", "expected": "33", "input_type": "numeric", "error_signals": ["ERR_SUB_ONES","ERR_SUB_TENS","ERR_PLACE_VALUE"], "ruby_prompt": "Subtract ones: 7-4=3. Subtract tens: 5-2=3.", "difficulty": 1 },
    // With regroup
    { "ref": "22.20", "question": "62 - 18 = ? (You may need to regroup.)", "expected": "44", "input_type": "numeric", "error_signals": ["ERR_BORROW","ERR_SUB_AFTER_BORROW","ERR_PLACE_VALUE"], "ruby_prompt": "2<8: borrow 1 ten. 12-8=4, then 5-1=4.", "difficulty": 2 },
    { "ref": "22.21", "question": "53 - 29 = ? (You may need to regroup.)", "expected": "24", "input_type": "numeric", "error_signals": ["ERR_BORROW","ERR_SUB_AFTER_BORROW","ERR_PLACE_VALUE"], "ruby_prompt": "3<9: borrow 1 ten. 13-9=4, then 4-2=2.", "difficulty": 2 },
    { "ref": "22.22", "question": "91 - 47 = ? (You may need to regroup.)", "expected": "44", "input_type": "numeric", "error_signals": ["ERR_BORROW","ERR_SUB_AFTER_BORROW","ERR_PLACE_VALUE"], "ruby_prompt": "1<7: borrow 1 ten. 11-7=4, then 8-4=4.", "difficulty": 2 },
    { "ref": "22.23", "question": "75 - 38 = ? (You may need to regroup.)", "expected": "37", "input_type": "numeric", "error_signals": ["ERR_BORROW","ERR_SUB_AFTER_BORROW","ERR_PLACE_VALUE"], "ruby_prompt": "5<8: borrow 1 ten. 15-8=7, then 6-3=3.", "difficulty": 2 },
    { "ref": "22.24", "question": "86 - 49 = ? (You may need to regroup.)", "expected": "37", "input_type": "numeric", "error_signals": ["ERR_BORROW","ERR_SUB_AFTER_BORROW","ERR_PLACE_VALUE"], "ruby_prompt": "6<9: borrow 1 ten. 16-9=7, then 7-4=3.", "difficulty": 2 },
    { "ref": "22.25", "question": "44 - 17 = ? (You may need to regroup.)", "expected": "27", "input_type": "numeric", "error_signals": ["ERR_BORROW","ERR_SUB_AFTER_BORROW","ERR_PLACE_VALUE"], "ruby_prompt": "4<7: borrow 1 ten. 14-7=7, then 3-1=2.", "difficulty": 2 }
  ],
  "M025": [
    { "ref": "25.16", "question": "3 × 3 = ?", "expected": "9", "input_type": "numeric", "error_signals": ["ERR_TIMES_TABLE","ERR_MULT_OFF"], "ruby_prompt": "3 groups of 3. Count: 3, 6, 9.", "difficulty": 1 },
    { "ref": "25.17", "question": "4 × 4 = ?", "expected": "16", "input_type": "numeric", "error_signals": ["ERR_TIMES_TABLE","ERR_MULT_OFF"], "ruby_prompt": "4 groups of 4. Count: 4, 8, 12, 16.", "difficulty": 1 },
    { "ref": "25.18", "question": "5 × 9 = ?", "expected": "45", "input_type": "numeric", "error_signals": ["ERR_TIMES_TABLE","ERR_MULT_OFF"], "ruby_prompt": "Try 5×10=50, then subtract one 5.", "difficulty": 2 },
    { "ref": "25.19", "question": "7 × 9 = ?", "expected": "63", "input_type": "numeric", "error_signals": ["ERR_TIMES_TABLE","ERR_MULT_OFF"], "ruby_prompt": "Try 7×10=70, then subtract one 7.", "difficulty": 2 },
    { "ref": "25.20", "question": "6 × 8 = ?", "expected": "48", "input_type": "numeric", "error_signals": ["ERR_TIMES_TABLE","ERR_MULT_OFF"], "ruby_prompt": "Try 6×4=24, then double it for 6×8.", "difficulty": 2 },
    { "ref": "25.21", "question": "8 × 3 = ?", "expected": "24", "input_type": "numeric", "error_signals": ["ERR_TIMES_TABLE","ERR_MULT_OFF"], "ruby_prompt": "Count by 8s three times: 8, 16, 24.", "difficulty": 1 },
    { "ref": "25.22", "question": "9 × 3 = ?", "expected": "27", "input_type": "numeric", "error_signals": ["ERR_TIMES_TABLE","ERR_MULT_OFF"], "ruby_prompt": "Try 10×3=30, then subtract one 3.", "difficulty": 2 },
    { "ref": "25.23", "question": "5 × 4 = ?", "expected": "20", "input_type": "numeric", "error_signals": ["ERR_TIMES_TABLE","ERR_MULT_OFF"], "ruby_prompt": "Count by 5s four times: 5, 10, 15, 20.", "difficulty": 1 },
    { "ref": "25.24", "question": "9 × 4 = ?", "expected": "36", "input_type": "numeric", "error_signals": ["ERR_TIMES_TABLE","ERR_MULT_OFF"], "ruby_prompt": "Try 10×4=40, then subtract one 4.", "difficulty": 2 },
    { "ref": "25.25", "question": "6 × 6 = ?", "expected": "36", "input_type": "numeric", "error_signals": ["ERR_TIMES_TABLE","ERR_MULT_OFF"], "ruby_prompt": "6 groups of 6. Try 6×3=18, then double it.", "difficulty": 2 }
  ]
};

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
  console.log(`${domainId}: ${domain.questions.length} questions`);
}

writeFileSync(bankPath, JSON.stringify(bank, null, 2), 'utf8');
console.log(`\nAdded ${totalAdded} questions.`);
