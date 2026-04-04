import json

with open('C:/Users/rrazz/Desktop/ai-tutor/data/question-bank.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

domains = data['domains']

# ── M015 ── refs 15.29–15.50 (22 questions)
new_M015 = [
    {"ref":"15.29","question":"log\u2081\u2080(100) = ?","expected":"2","input_type":"numeric","error_signals":["ERR_LOG_BASE10"],"ruby_prompt":"10 to the power of what equals 100?","difficulty":1},
    {"ref":"15.30","question":"log\u2081\u2080(1000) = ?","expected":"3","input_type":"numeric","error_signals":["ERR_LOG_BASE10"],"ruby_prompt":"10 to the power of what gives 1000?","difficulty":1},
    {"ref":"15.31","question":"log\u2081\u2080(10) = ?","expected":"1","input_type":"numeric","error_signals":["ERR_LOG_BASE10"],"ruby_prompt":"Any log of its own base equals 1.","difficulty":1},
    {"ref":"15.32","question":"log\u2081\u2080(1) = ?","expected":"0","input_type":"numeric","error_signals":["ERR_LOG_BASE10"],"ruby_prompt":"Any log of 1 equals 0.","difficulty":1},
    {"ref":"15.33","question":"log\u2082(1) = ?","expected":"0","input_type":"numeric","error_signals":["ERR_LOG_BASE2"],"ruby_prompt":"2 to the power 0 = 1, so log\u2082(1) = 0.","difficulty":1},
    {"ref":"15.34","question":"log\u2083(1) = ?","expected":"0","input_type":"numeric","error_signals":["ERR_LOG_BASE3"],"ruby_prompt":"Any base raised to 0 gives 1, so the log is 0.","difficulty":1},
    {"ref":"15.35","question":"If 5\u02e3 = 25, what is x?","expected":"2","input_type":"numeric","error_signals":["ERR_LOG_EXPONENT"],"ruby_prompt":"5 to the power of what equals 25?","difficulty":1},
    {"ref":"15.36","question":"If 3\u02e3 = 81, what is x?","expected":"4","input_type":"numeric","error_signals":["ERR_LOG_EXPONENT"],"ruby_prompt":"3 to the power of what equals 81?","difficulty":2},
    {"ref":"15.37","question":"If 2\u02e3 = 64, what is x?","expected":"6","input_type":"numeric","error_signals":["ERR_LOG_EXPONENT"],"ruby_prompt":"2 to the power of what equals 64?","difficulty":2},
    {"ref":"15.38","question":"If 4\u02e3 = 64, what is x?","expected":"3","input_type":"numeric","error_signals":["ERR_LOG_EXPONENT"],"ruby_prompt":"4 to the power of what equals 64?","difficulty":2},
    {"ref":"15.39","question":"If 10\u02e3 = 10000, what is x?","expected":"4","input_type":"numeric","error_signals":["ERR_LOG_EXPONENT"],"ruby_prompt":"10 to what power gives 10000?","difficulty":1},
    {"ref":"15.40","question":"log\u2086(216) = ?","expected":"3","input_type":"numeric","error_signals":["ERR_LOG_BASE6"],"ruby_prompt":"6 to the power 3 = 216.","difficulty":2},
    {"ref":"15.41","question":"log\u2082(256) = ?","expected":"8","input_type":"numeric","error_signals":["ERR_LOG_BASE2"],"ruby_prompt":"2 to the power 8 = 256.","difficulty":3},
    {"ref":"15.42","question":"log\u2083(243) = ?","expected":"5","input_type":"numeric","error_signals":["ERR_LOG_BASE3"],"ruby_prompt":"3 to the power 5 = 243.","difficulty":2},
    {"ref":"15.43","question":"log\u2085(625) = ?","expected":"4","input_type":"numeric","error_signals":["ERR_LOG_BASE5"],"ruby_prompt":"5 to the power 4 = 625.","difficulty":2},
    {"ref":"15.44","question":"10\u00b3 = ?","expected":"1000","input_type":"numeric","error_signals":["ERR_EXPONENT"],"ruby_prompt":"10 to the power 3 means 10 \u00d7 10 \u00d7 10.","difficulty":1},
    {"ref":"15.45","question":"2\u2078 = ?","expected":"256","input_type":"numeric","error_signals":["ERR_EXPONENT"],"ruby_prompt":"Keep doubling: 2, 4, 8, 16, 32, 64, 128, 256.","difficulty":2},
    {"ref":"15.46","question":"3\u2075 = ?","expected":"243","input_type":"numeric","error_signals":["ERR_EXPONENT"],"ruby_prompt":"Multiply: 3\u00d73\u00d73\u00d73\u00d73 = ?","difficulty":2},
    {"ref":"15.47","question":"5\u2074 = ?","expected":"625","input_type":"numeric","error_signals":["ERR_EXPONENT"],"ruby_prompt":"5\u00d75\u00d75\u00d75 = ?","difficulty":2},
    {"ref":"15.48","question":"log\u2082(2) = ?","expected":"1","input_type":"numeric","error_signals":["ERR_LOG_BASE2"],"ruby_prompt":"The log of a number in its own base is always 1.","difficulty":1},
    {"ref":"15.49","question":"log\u2085(1) = ?","expected":"0","input_type":"numeric","error_signals":["ERR_LOG_BASE5"],"ruby_prompt":"5 to the power 0 = 1, so log\u2085(1) = 0.","difficulty":1},
    {"ref":"15.50","question":"If 6\u02e3 = 36, what is x?","expected":"2","input_type":"numeric","error_signals":["ERR_LOG_EXPONENT"],"ruby_prompt":"6 squared equals 36 — so x = 2.","difficulty":1},
]

# ── M016 ── refs 16.21–16.50 (30 questions)
new_M016 = [
    {"ref":"16.21","question":"sin 30\u00b0 = ?","expected":"0.5","input_type":"numeric","error_signals":["ERR_TRIG_EXACT"],"ruby_prompt":"This is an exact value — sin 30\u00b0 = 1/2 = 0.5.","difficulty":1},
    {"ref":"16.22","question":"cos 0\u00b0 = ?","expected":"1","input_type":"numeric","error_signals":["ERR_TRIG_EXACT"],"ruby_prompt":"cos 0\u00b0 = 1 — a fundamental exact value.","difficulty":1},
    {"ref":"16.23","question":"sin 0\u00b0 = ?","expected":"0","input_type":"numeric","error_signals":["ERR_TRIG_EXACT"],"ruby_prompt":"sin 0\u00b0 = 0 — the starting point on the unit circle.","difficulty":1},
    {"ref":"16.24","question":"cos 90\u00b0 = ?","expected":"0","input_type":"numeric","error_signals":["ERR_TRIG_EXACT"],"ruby_prompt":"cos 90\u00b0 = 0.","difficulty":1},
    {"ref":"16.25","question":"sin 90\u00b0 = ?","expected":"1","input_type":"numeric","error_signals":["ERR_TRIG_EXACT"],"ruby_prompt":"sin 90\u00b0 = 1 — the maximum value of sine.","difficulty":1},
    {"ref":"16.26","question":"tan 0\u00b0 = ?","expected":"0","input_type":"numeric","error_signals":["ERR_TRIG_EXACT"],"ruby_prompt":"tan 0\u00b0 = sin 0\u00b0 / cos 0\u00b0 = 0/1 = 0.","difficulty":1},
    {"ref":"16.27","question":"cos 30\u00b0 = ? (Give the surd form: \u221a3/2)","expected":"\u221a3/2","input_type":"text","error_signals":["ERR_TRIG_EXACT"],"ruby_prompt":"cos 30\u00b0 is an exact value — it equals \u221a3 over 2.","difficulty":2},
    {"ref":"16.28","question":"sin 45\u00b0 = ? (Give the surd form: \u221a2/2)","expected":"\u221a2/2","input_type":"text","error_signals":["ERR_TRIG_EXACT"],"ruby_prompt":"sin 45\u00b0 = \u221a2 / 2 — an isosceles right triangle gives this.","difficulty":2},
    {"ref":"16.29","question":"cos 45\u00b0 = ? (Give the surd form: \u221a2/2)","expected":"\u221a2/2","input_type":"text","error_signals":["ERR_TRIG_EXACT"],"ruby_prompt":"cos 45\u00b0 = \u221a2 / 2.","difficulty":2},
    {"ref":"16.30","question":"tan 45\u00b0 = ?","expected":"1","input_type":"numeric","error_signals":["ERR_TRIG_EXACT"],"ruby_prompt":"tan 45\u00b0 = 1 — sin 45\u00b0 = cos 45\u00b0 so they divide to 1.","difficulty":1},
    {"ref":"16.31","question":"cos 60\u00b0 = ?","expected":"0.5","input_type":"numeric","error_signals":["ERR_TRIG_EXACT"],"ruby_prompt":"cos 60\u00b0 = 1/2 = 0.5.","difficulty":1},
    {"ref":"16.32","question":"sin 60\u00b0 = ? (Give the surd form: \u221a3/2)","expected":"\u221a3/2","input_type":"text","error_signals":["ERR_TRIG_EXACT"],"ruby_prompt":"sin 60\u00b0 = \u221a3 / 2.","difficulty":2},
    {"ref":"16.33","question":"In a right triangle, opposite = 5, hypotenuse = 13. Find sin \u03b8.","expected":"5/13","input_type":"text","error_signals":["ERR_TRIG_RATIO"],"ruby_prompt":"sin = opposite / hypotenuse.","difficulty":2},
    {"ref":"16.34","question":"In a right triangle, adjacent = 12, hypotenuse = 13. Find cos \u03b8.","expected":"12/13","input_type":"text","error_signals":["ERR_TRIG_RATIO"],"ruby_prompt":"cos = adjacent / hypotenuse.","difficulty":2},
    {"ref":"16.35","question":"In a right triangle, opposite = 5, adjacent = 12. Find tan \u03b8.","expected":"5/12","input_type":"text","error_signals":["ERR_TRIG_RATIO"],"ruby_prompt":"tan = opposite / adjacent.","difficulty":2},
    {"ref":"16.36","question":"In a right triangle, opposite = 8, hypotenuse = 17. Find sin \u03b8.","expected":"8/17","input_type":"text","error_signals":["ERR_TRIG_RATIO"],"ruby_prompt":"sin = opposite / hypotenuse.","difficulty":2},
    {"ref":"16.37","question":"In a right triangle, adjacent = 15, hypotenuse = 17. Find cos \u03b8.","expected":"15/17","input_type":"text","error_signals":["ERR_TRIG_RATIO"],"ruby_prompt":"cos = adjacent / hypotenuse.","difficulty":2},
    {"ref":"16.38","question":"In a right triangle, opposite = 8, adjacent = 15. Find tan \u03b8.","expected":"8/15","input_type":"text","error_signals":["ERR_TRIG_RATIO"],"ruby_prompt":"tan = opposite / adjacent.","difficulty":2},
    {"ref":"16.39","question":"In a right triangle, opposite = 3, hypotenuse = 5. Find sin \u03b8.","expected":"3/5","input_type":"text","error_signals":["ERR_TRIG_RATIO"],"ruby_prompt":"sin = opposite / hypotenuse — use the 3-4-5 triangle.","difficulty":1},
    {"ref":"16.40","question":"In a right triangle, adjacent = 4, hypotenuse = 5. Find cos \u03b8.","expected":"4/5","input_type":"text","error_signals":["ERR_TRIG_RATIO"],"ruby_prompt":"cos = adjacent / hypotenuse — use the 3-4-5 triangle.","difficulty":1},
    {"ref":"16.41","question":"In a right triangle, opposite = 3, adjacent = 4. Find tan \u03b8.","expected":"3/4","input_type":"text","error_signals":["ERR_TRIG_RATIO"],"ruby_prompt":"tan = opposite / adjacent.","difficulty":1},
    {"ref":"16.42","question":"Which ratio is sin? (opposite/hypotenuse, adjacent/hypotenuse, or opposite/adjacent)","expected":"opposite/hypotenuse","input_type":"text","error_signals":["ERR_TRIG_DEF"],"ruby_prompt":"SOH — Sine = Opposite over Hypotenuse.","difficulty":1},
    {"ref":"16.43","question":"Which ratio is cos?","expected":"adjacent/hypotenuse","input_type":"text","error_signals":["ERR_TRIG_DEF"],"ruby_prompt":"CAH — Cosine = Adjacent over Hypotenuse.","difficulty":1},
    {"ref":"16.44","question":"Which ratio is tan?","expected":"opposite/adjacent","input_type":"text","error_signals":["ERR_TRIG_DEF"],"ruby_prompt":"TOA — Tangent = Opposite over Adjacent.","difficulty":1},
    {"ref":"16.45","question":"tan 30\u00b0 = ? (Give the surd form: 1/\u221a3)","expected":"1/\u221a3","input_type":"text","error_signals":["ERR_TRIG_EXACT"],"ruby_prompt":"tan 30\u00b0 = sin30/cos30 = (1/2) / (\u221a3/2) = 1/\u221a3.","difficulty":3},
    {"ref":"16.46","question":"tan 60\u00b0 = ? (Give the surd form: \u221a3)","expected":"\u221a3","input_type":"text","error_signals":["ERR_TRIG_EXACT"],"ruby_prompt":"tan 60\u00b0 = sin60/cos60 = (\u221a3/2) / (1/2) = \u221a3.","difficulty":3},
    {"ref":"16.47","question":"In a right triangle with hypotenuse 10 and one angle 30\u00b0, the opposite side = 10 \u00d7 sin 30\u00b0 = ?","expected":"5","input_type":"numeric","error_signals":["ERR_TRIG_APPLY"],"ruby_prompt":"sin 30\u00b0 = 0.5. So opposite = 10 \u00d7 0.5.","difficulty":2},
    {"ref":"16.48","question":"In a right triangle with hypotenuse 10 and one angle 60\u00b0, the adjacent side = 10 \u00d7 cos 60\u00b0 = ?","expected":"5","input_type":"numeric","error_signals":["ERR_TRIG_APPLY"],"ruby_prompt":"cos 60\u00b0 = 0.5. So adjacent = 10 \u00d7 0.5.","difficulty":2},
    {"ref":"16.49","question":"In a right triangle with hypotenuse 20 and one angle 30\u00b0, the adjacent side = 20 \u00d7 cos 30\u00b0. Is the answer 10\u221a3?","expected":"10\u221a3","input_type":"text","error_signals":["ERR_TRIG_APPLY"],"ruby_prompt":"cos 30\u00b0 = \u221a3/2. So adjacent = 20 \u00d7 \u221a3/2.","difficulty":3},
    {"ref":"16.50","question":"If sin \u03b8 = 3/5, what is cos \u03b8? (Use a 3-4-5 triangle.)","expected":"4/5","input_type":"text","error_signals":["ERR_TRIG_PYTHAGOREAN"],"ruby_prompt":"In a 3-4-5 triangle, if opposite=3 and hyp=5, adjacent=4.","difficulty":3},
]

# ── M018 ── refs 18.19–18.50 (32 questions)
new_M018 = [
    {"ref":"18.19","question":"A car travels 60 km/h for 2.5 hours. How far does it travel?","expected":"150","input_type":"numeric","error_signals":["ERR_SPEED_DIST"],"ruby_prompt":"Distance = speed \u00d7 time. Multiply 60 by 2.5.","difficulty":2},
    {"ref":"18.20","question":"3 items cost R45 each. You pay with R200. How much change do you receive?","expected":"65","input_type":"numeric","error_signals":["ERR_MULTI_STEP"],"ruby_prompt":"Total cost = 3 \u00d7 R45 = R135. Change = R200 \u2212 R135.","difficulty":2},
    {"ref":"18.21","question":"A train travels 360 km in 4 hours. What is its average speed in km/h?","expected":"90","input_type":"numeric","error_signals":["ERR_SPEED_DIST"],"ruby_prompt":"Speed = distance \u00f7 time.","difficulty":2},
    {"ref":"18.22","question":"A shop buys pens for R5 each and sells them for R8 each. If 50 pens are sold, what is the profit?","expected":"150","input_type":"numeric","error_signals":["ERR_PROFIT"],"ruby_prompt":"Profit per pen = R8 \u2212 R5 = R3. Total profit = 50 \u00d7 R3.","difficulty":2},
    {"ref":"18.23","question":"A rectangle is 14 cm long and 9 cm wide. What is its area?","expected":"126","input_type":"numeric","error_signals":["ERR_AREA"],"ruby_prompt":"Area = length \u00d7 width.","difficulty":1},
    {"ref":"18.24","question":"Thandi earns R3200 per month. She saves 15% of her salary. How much does she save?","expected":"480","input_type":"numeric","error_signals":["ERR_PERCENT_OF"],"ruby_prompt":"15% of R3200 — find 10% then add 5%.","difficulty":2},
    {"ref":"18.25","question":"A box holds 24 apples. A school orders 15 boxes. How many apples is that in total?","expected":"360","input_type":"numeric","error_signals":["ERR_MULTI_STEP"],"ruby_prompt":"Multiply: 24 \u00d7 15.","difficulty":2},
    {"ref":"18.26","question":"A cyclist rides 12 km in 30 minutes. What is the speed in km/h?","expected":"24","input_type":"numeric","error_signals":["ERR_SPEED_DIST"],"ruby_prompt":"30 minutes = 0.5 hours. Speed = 12 \u00f7 0.5.","difficulty":2},
    {"ref":"18.27","question":"Water fills a tank at 8 litres per minute. After 15 minutes, 40 litres are removed. How much water is in the tank?","expected":"80","input_type":"numeric","error_signals":["ERR_MULTI_STEP"],"ruby_prompt":"8 \u00d7 15 = 120 litres filled. Then 120 \u2212 40 = ?","difficulty":2},
    {"ref":"18.28","question":"A class of 32 students each contribute R12.50 for a gift. What is the total amount collected?","expected":"400","input_type":"numeric","error_signals":["ERR_MULTI_STEP"],"ruby_prompt":"32 \u00d7 12.50 = ?","difficulty":2},
    {"ref":"18.29","question":"A price of R180 is increased by 20%. What is the new price?","expected":"216","input_type":"numeric","error_signals":["ERR_PERCENT_INCREASE"],"ruby_prompt":"20% of R180 = R36. Add to R180.","difficulty":2},
    {"ref":"18.30","question":"A triangular plot has base 12 m and height 8 m. What is its area?","expected":"48","input_type":"numeric","error_signals":["ERR_AREA"],"ruby_prompt":"Area of triangle = (base \u00d7 height) \u00f7 2.","difficulty":2},
    {"ref":"18.31","question":"A taxi charges R3 per km plus a R15 base fee. How much for a 20 km trip?","expected":"75","input_type":"numeric","error_signals":["ERR_MULTI_STEP"],"ruby_prompt":"20 km \u00d7 R3 = R60. Add the base fee R15.","difficulty":2},
    {"ref":"18.32","question":"A recipe uses 200 g of sugar for 8 servings. How much sugar is needed for 12 servings?","expected":"300","input_type":"numeric","error_signals":["ERR_RATIO"],"ruby_prompt":"Find sugar per serving, then multiply by 12.","difficulty":2},
    {"ref":"18.33","question":"Two friends share R450 in the ratio 2:3. How much does the larger share receive?","expected":"270","input_type":"numeric","error_signals":["ERR_RATIO"],"ruby_prompt":"Total parts = 5. Each part = 450\u00f75=90. Larger share = 3\u00d790.","difficulty":3},
    {"ref":"18.34","question":"A shop sells 5 items at R24 each. After selling, only R32 profit remains after costs of R88. How much was the revenue?","expected":"120","input_type":"numeric","error_signals":["ERR_MULTI_STEP"],"ruby_prompt":"Revenue = 5 \u00d7 R24 = R120.","difficulty":2},
    {"ref":"18.35","question":"A runner completes a 10 km race in 50 minutes. What is the average pace in minutes per km?","expected":"5","input_type":"numeric","error_signals":["ERR_SPEED_DIST"],"ruby_prompt":"Pace = total time \u00f7 total distance = 50 \u00f7 10.","difficulty":2},
    {"ref":"18.36","question":"A shopkeeper bought 200 items at R4 each and sold them all at R6 each. What is the total profit?","expected":"400","input_type":"numeric","error_signals":["ERR_PROFIT"],"ruby_prompt":"Profit per item = R6 \u2212 R4 = R2. Total = 200 \u00d7 R2.","difficulty":2},
    {"ref":"18.37","question":"John is twice as old as his sister. In 5 years he will be 29. How old is his sister now?","expected":"12","input_type":"numeric","error_signals":["ERR_WORD_EQ"],"ruby_prompt":"John now = 24. He is twice his sister's age, so she is 24\u00f72.","difficulty":3},
    {"ref":"18.38","question":"A sale reduces all prices by 30%. A jacket was R450. What is the sale price?","expected":"315","input_type":"numeric","error_signals":["ERR_PERCENT_DECREASE"],"ruby_prompt":"30% of R450 = R135. Sale price = R450 \u2212 R135.","difficulty":2},
    {"ref":"18.39","question":"A square garden has perimeter 36 m. What is its area?","expected":"81","input_type":"numeric","error_signals":["ERR_AREA"],"ruby_prompt":"Perimeter = 4 \u00d7 side. Side = 36 \u00f7 4 = 9. Area = 9 \u00d7 9.","difficulty":2},
    {"ref":"18.40","question":"A worker earns R120 per hour. She works 7.5 hours a day for 5 days. What is her weekly pay?","expected":"4500","input_type":"numeric","error_signals":["ERR_MULTI_STEP"],"ruby_prompt":"Daily pay = 120 \u00d7 7.5. Weekly = daily \u00d7 5.","difficulty":3},
    {"ref":"18.41","question":"A container holds 3.6 litres. How many 150 ml cups can be filled from it?","expected":"24","input_type":"numeric","error_signals":["ERR_UNIT_CONVERT"],"ruby_prompt":"Convert 3.6 litres to ml = 3600 ml. Then 3600 \u00f7 150.","difficulty":2},
    {"ref":"18.42","question":"Two numbers are in ratio 3:7. They add up to 100. What is the larger number?","expected":"70","input_type":"numeric","error_signals":["ERR_RATIO"],"ruby_prompt":"Total parts = 10. Each part = 10. Larger = 7 \u00d7 10.","difficulty":3},
    {"ref":"18.43","question":"A farmer plants 8 rows of 25 trees. He then sells 60 trees. How many remain?","expected":"140","input_type":"numeric","error_signals":["ERR_MULTI_STEP"],"ruby_prompt":"Total trees = 8 \u00d7 25. Then subtract 60.","difficulty":2},
    {"ref":"18.44","question":"An investment of R5000 earns 8% interest per year. What is the interest after 1 year?","expected":"400","input_type":"numeric","error_signals":["ERR_PERCENT_OF"],"ruby_prompt":"8% of R5000 = ?","difficulty":2},
    {"ref":"18.45","question":"A rectangle has area 96 cm\u00b2 and width 6 cm. What is its length?","expected":"16","input_type":"numeric","error_signals":["ERR_AREA"],"ruby_prompt":"Length = Area \u00f7 width = 96 \u00f7 6.","difficulty":2},
    {"ref":"18.46","question":"5 workers build a wall in 6 days. How many days would 3 workers take?","expected":"10","input_type":"numeric","error_signals":["ERR_INVERSE_PROP"],"ruby_prompt":"This is inverse proportion: 5\u00d76 = 3\u00d7d. Solve for d.","difficulty":3},
    {"ref":"18.47","question":"A car uses 8 litres of fuel per 100 km. How far can it travel on 20 litres?","expected":"250","input_type":"numeric","error_signals":["ERR_RATIO"],"ruby_prompt":"100 km needs 8 L. 20 L \u00f7 8 L \u00d7 100 km.","difficulty":2},
    {"ref":"18.48","question":"A shop has 140 items. After selling 40% of them, how many remain?","expected":"84","input_type":"numeric","error_signals":["ERR_PERCENT_OF"],"ruby_prompt":"40% of 140 = 56. Remaining = 140 \u2212 56.","difficulty":2},
    {"ref":"18.49","question":"A pump fills a pool at 300 litres per hour. The pool holds 1800 litres. How many hours to fill?","expected":"6","input_type":"numeric","error_signals":["ERR_SPEED_DIST"],"ruby_prompt":"Time = Volume \u00f7 Rate = 1800 \u00f7 300.","difficulty":2},
    {"ref":"18.50","question":"Lebo buys 3 books at R45 each and 2 pens at R8 each. She pays with R200. What is her change?","expected":"35","input_type":"numeric","error_signals":["ERR_MULTI_STEP"],"ruby_prompt":"Total = 3\u00d745 + 2\u00d78 = 135 + 16 = 151. Change = 200 \u2212 151.","difficulty":2},
]

# ── M_STAT ── refs S1.27–S1.50 (24 questions)
new_MSTAT = [
    {"ref":"S1.27","question":"Find the mean of 4, 8, 12, 16, 20.","expected":"12","input_type":"numeric","error_signals":["ERR_MEAN"],"ruby_prompt":"Add all values and divide by the count.","difficulty":1},
    {"ref":"S1.28","question":"Find the median of 5, 3, 9, 1, 7.","expected":"5","input_type":"numeric","error_signals":["ERR_MEDIAN"],"ruby_prompt":"Sort first: 1, 3, 5, 7, 9 — the middle value is?","difficulty":1},
    {"ref":"S1.29","question":"Find the mode of 4, 4, 5, 6, 7, 4, 5.","expected":"4","input_type":"numeric","error_signals":["ERR_MODE"],"ruby_prompt":"The mode is the value that appears most often.","difficulty":1},
    {"ref":"S1.30","question":"Find the range of 3, 8, 1, 14, 9.","expected":"13","input_type":"numeric","error_signals":["ERR_RANGE"],"ruby_prompt":"Range = largest \u2212 smallest. What is 14 \u2212 1?","difficulty":1},
    {"ref":"S1.31","question":"Find the median of 4, 6, 8, 10. (Even number of values.)","expected":"7","input_type":"numeric","error_signals":["ERR_MEDIAN_EVEN"],"ruby_prompt":"Two middle values: 6 and 8. Median = (6+8)\u00f72.","difficulty":2},
    {"ref":"S1.32","question":"Find the median of 2, 5, 7, 9, 12, 15.","expected":"8","input_type":"numeric","error_signals":["ERR_MEDIAN_EVEN"],"ruby_prompt":"Two middle values: 7 and 9. Median = (7+9)\u00f72.","difficulty":2},
    {"ref":"S1.33","question":"Find the mean of 7, 7, 7, 7, 7.","expected":"7","input_type":"numeric","error_signals":["ERR_MEAN"],"ruby_prompt":"All values are the same — the mean equals that value.","difficulty":1},
    {"ref":"S1.34","question":"A data set has mean 10 and five values. The sum of four values is 44. What is the fifth value?","expected":"6","input_type":"numeric","error_signals":["ERR_MEAN_REVERSE"],"ruby_prompt":"Total sum = mean \u00d7 count = 50. Fifth value = 50 \u2212 44.","difficulty":3},
    {"ref":"S1.35","question":"Find the range of -3, -1, 2, 5, 8.","expected":"11","input_type":"numeric","error_signals":["ERR_RANGE"],"ruby_prompt":"Range = 8 \u2212 (-3) = 8 + 3.","difficulty":2},
    {"ref":"S1.36","question":"Find the median of 3, 7, 8, 12, 15.","expected":"8","input_type":"numeric","error_signals":["ERR_MEDIAN"],"ruby_prompt":"The data is already sorted — the middle value is?","difficulty":1},
    {"ref":"S1.37","question":"Find the mode of 2, 3, 3, 5, 7.","expected":"3","input_type":"numeric","error_signals":["ERR_MODE"],"ruby_prompt":"Which number appears most often?","difficulty":1},
    {"ref":"S1.38","question":"What is the range of 4, 8, 2, 11, 6?","expected":"9","input_type":"numeric","error_signals":["ERR_RANGE"],"ruby_prompt":"Range = max \u2212 min = 11 \u2212 2.","difficulty":1},
    {"ref":"S1.39","question":"P(rolling a 3 on a fair die) = ?","expected":"1/6","input_type":"text","error_signals":["ERR_PROBABILITY"],"ruby_prompt":"There is 1 favourable outcome out of 6 possible outcomes.","difficulty":1},
    {"ref":"S1.40","question":"A bag has 3 red, 2 blue, and 5 green balls. What is the probability of picking blue?","expected":"1/5","input_type":"text","error_signals":["ERR_PROBABILITY"],"ruby_prompt":"2 blue out of 10 total = 2/10 — simplify.","difficulty":2},
    {"ref":"S1.41","question":"P(rolling an even number on a fair die) = ?","expected":"1/2","input_type":"text","error_signals":["ERR_PROBABILITY"],"ruby_prompt":"Even numbers on a die: 2, 4, 6 — that is 3 out of 6.","difficulty":1},
    {"ref":"S1.42","question":"A fair coin is flipped twice. P(both heads) = ?","expected":"1/4","input_type":"text","error_signals":["ERR_PROBABILITY"],"ruby_prompt":"P(H) \u00d7 P(H) = 1/2 \u00d7 1/2 = ?","difficulty":2},
    {"ref":"S1.43","question":"Find the mean of 15, 20, 25, 30, 35.","expected":"25","input_type":"numeric","error_signals":["ERR_MEAN"],"ruby_prompt":"Sum = 125. Mean = 125 \u00f7 5.","difficulty":1},
    {"ref":"S1.44","question":"A spinner has sections: 1, 2, 3, 4 (equal size). P(landing on 2 or 3) = ?","expected":"1/2","input_type":"text","error_signals":["ERR_PROBABILITY"],"ruby_prompt":"2 favourable outcomes out of 4 total = 2/4.","difficulty":2},
    {"ref":"S1.45","question":"Find the median of 11, 4, 7, 2, 9.","expected":"7","input_type":"numeric","error_signals":["ERR_MEDIAN"],"ruby_prompt":"Sort first: 2, 4, 7, 9, 11 — the middle is?","difficulty":1},
    {"ref":"S1.46","question":"Which measure of central tendency is most affected by an outlier?","expected":"mean","input_type":"text","error_signals":["ERR_STAT_CONCEPT"],"ruby_prompt":"An extreme value pulls the mean towards it more than median or mode.","difficulty":2},
    {"ref":"S1.47","question":"A data set: 3, 5, 7, 7, 8. What is the modal value?","expected":"7","input_type":"numeric","error_signals":["ERR_MODE"],"ruby_prompt":"The mode is the most frequent value.","difficulty":1},
    {"ref":"S1.48","question":"P(rolling a number greater than 4 on a fair die) = ?","expected":"1/3","input_type":"text","error_signals":["ERR_PROBABILITY"],"ruby_prompt":"Numbers greater than 4 on a die: 5 and 6 — that is 2 out of 6.","difficulty":2},
    {"ref":"S1.49","question":"Find the mean of 0, 10, 20, 30.","expected":"15","input_type":"numeric","error_signals":["ERR_MEAN"],"ruby_prompt":"Sum = 60. Divide by 4.","difficulty":1},
    {"ref":"S1.50","question":"In a class of 25, 5 students are left-handed. P(randomly chosen student is left-handed) = ?","expected":"1/5","input_type":"text","error_signals":["ERR_PROBABILITY"],"ruby_prompt":"5 out of 25 = 5/25 — simplify.","difficulty":2},
]

for domain, new_qs in [
    ("M015", new_M015), ("M016", new_M016), ("M018", new_M018), ("M_STAT", new_MSTAT),
]:
    domains[domain]["questions"].extend(new_qs)
    print(f"{domain}: now {len(domains[domain]['questions'])} questions")

with open('C:/Users/rrazz/Desktop/ai-tutor/data/question-bank.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("Batch 4 written.")
