import json, sys

with open('C:/Users/rrazz/Desktop/ai-tutor/data/question-bank.json', encoding='utf-8') as f:
    bank = json.load(f)

m_geo = {
  "title": "Geometry – Angles, Area and Volume",
  "gate": "C",
  "skill_ids": ["L15.T1.A1", "L15.T1.A2", "L15.T2.A1", "L15.T3.A1"],
  "pass_threshold": 0.8,
  "questions_for_mastery": 3,
  "questions": [
    {"ref":"G1.1","question":"What type of angle is 45 degrees?","expected":"acute","input_type":"text","ruby_prompt":"Is this angle acute, right, obtuse or reflex?","error_signals":["ERR_ANGLE_TYPE"],"difficulty":2},
    {"ref":"G1.2","question":"What type of angle is 90 degrees?","expected":"right","input_type":"text","ruby_prompt":"Is this angle acute, right, obtuse or reflex?","error_signals":["ERR_ANGLE_TYPE"],"difficulty":2},
    {"ref":"G1.3","question":"What type of angle is 130 degrees?","expected":"obtuse","input_type":"text","ruby_prompt":"Is this angle acute, right, obtuse or reflex?","error_signals":["ERR_ANGLE_TYPE"],"difficulty":2},
    {"ref":"G1.4","question":"What type of angle is 210 degrees?","expected":"reflex","input_type":"text","ruby_prompt":"Is this angle acute, right, obtuse or reflex?","error_signals":["ERR_ANGLE_TYPE"],"difficulty":3},
    {"ref":"G1.5","question":"What type of angle is 75 degrees?","expected":"acute","input_type":"text","ruby_prompt":"Is this angle acute, right, obtuse or reflex?","error_signals":["ERR_ANGLE_TYPE"],"difficulty":2},
    {"ref":"G1.6","question":"What type of angle is 95 degrees?","expected":"obtuse","input_type":"text","ruby_prompt":"Is this angle acute, right, obtuse or reflex?","error_signals":["ERR_ANGLE_TYPE"],"difficulty":2},
    {"ref":"G1.7","question":"What type of angle is 270 degrees?","expected":"reflex","input_type":"text","ruby_prompt":"Is this angle acute, right, obtuse or reflex?","error_signals":["ERR_ANGLE_TYPE"],"difficulty":3},
    {"ref":"G1.8","question":"What type of angle is 150 degrees?","expected":"obtuse","input_type":"text","ruby_prompt":"Is this angle acute, right, obtuse or reflex?","error_signals":["ERR_ANGLE_TYPE"],"difficulty":2},
    {"ref":"G1.9","question":"Angles on a straight line add to 180. One angle is 65 degrees. What is the other angle?","expected":"115","input_type":"numeric","ruby_prompt":"The two angles must add to 180. What is the missing angle?","error_signals":["ERR_ANGLE_SUM","ERR_ARITHMETIC"],"difficulty":3},
    {"ref":"G1.10","question":"Angles on a straight line add to 180. One angle is 110 degrees. What is the other angle?","expected":"70","input_type":"numeric","ruby_prompt":"The two angles must add to 180. What is the missing angle?","error_signals":["ERR_ANGLE_SUM","ERR_ARITHMETIC"],"difficulty":3},
    {"ref":"G1.11","question":"Angles in a triangle add to 180. Two angles are 60 degrees and 80 degrees. What is the third angle?","expected":"40","input_type":"numeric","ruby_prompt":"All three angles in a triangle add to 180. Find the missing one.","error_signals":["ERR_ANGLE_SUM","ERR_ARITHMETIC"],"difficulty":3},
    {"ref":"G1.12","question":"Angles in a triangle add to 180. Two angles are 45 degrees and 90 degrees. What is the third angle?","expected":"45","input_type":"numeric","ruby_prompt":"All three angles in a triangle add to 180. Find the missing one.","error_signals":["ERR_ANGLE_SUM","ERR_ARITHMETIC"],"difficulty":3},
    {"ref":"G1.13","question":"Angles in a triangle add to 180. Two angles are 70 degrees and 70 degrees. What is the third angle?","expected":"40","input_type":"numeric","ruby_prompt":"All three angles in a triangle add to 180. Find the missing one.","error_signals":["ERR_ANGLE_SUM","ERR_ARITHMETIC"],"difficulty":3},
    {"ref":"G1.14","question":"Vertically opposite angles are equal. One angle is 55 degrees. What is the vertically opposite angle?","expected":"55","input_type":"numeric","ruby_prompt":"Vertically opposite angles are always equal.","error_signals":["ERR_ANGLE_TYPE"],"difficulty":3},
    {"ref":"G1.15","question":"Angles on a straight line add to 180. One angle is 35 degrees. What is the other angle?","expected":"145","input_type":"numeric","ruby_prompt":"The two angles must add to 180. What is the missing angle?","error_signals":["ERR_ANGLE_SUM","ERR_ARITHMETIC"],"difficulty":3},
    {"ref":"G1.16","question":"Angles in a triangle add to 180. Two angles are 30 degrees and 120 degrees. What is the third angle?","expected":"30","input_type":"numeric","ruby_prompt":"All three angles in a triangle add to 180. Find the missing one.","error_signals":["ERR_ANGLE_SUM","ERR_ARITHMETIC"],"difficulty":3},
    {"ref":"G2.1","question":"A rectangle is 8 cm long and 3 cm wide. What is its area in cm2?","expected":"24","input_type":"numeric","ruby_prompt":"Area of rectangle = length x width.","error_signals":["ERR_FORMULA","ERR_ARITHMETIC"],"difficulty":3},
    {"ref":"G2.2","question":"A rectangle is 5 m long and 4 m wide. What is its area in m2?","expected":"20","input_type":"numeric","ruby_prompt":"Area of rectangle = length x width.","error_signals":["ERR_FORMULA","ERR_ARITHMETIC"],"difficulty":3},
    {"ref":"G2.3","question":"A triangle has base 10 cm and height 6 cm. What is its area in cm2?","expected":"30","input_type":"numeric","ruby_prompt":"Area of triangle = half x base x height.","error_signals":["ERR_FORMULA","ERR_HALF_MISSING"],"difficulty":4},
    {"ref":"G2.4","question":"A triangle has base 8 m and height 5 m. What is its area in m2?","expected":"20","input_type":"numeric","ruby_prompt":"Area of triangle = half x base x height.","error_signals":["ERR_FORMULA","ERR_HALF_MISSING"],"difficulty":4},
    {"ref":"G2.5","question":"A rectangle has length 12 cm and width 7 cm. Find the area in cm2.","expected":"84","input_type":"numeric","ruby_prompt":"Area of rectangle = length x width.","error_signals":["ERR_FORMULA","ERR_ARITHMETIC"],"difficulty":3},
    {"ref":"G2.6","question":"A triangle has base 14 cm and height 4 cm. Find the area in cm2.","expected":"28","input_type":"numeric","ruby_prompt":"Area of triangle = half x base x height.","error_signals":["ERR_FORMULA","ERR_HALF_MISSING"],"difficulty":4},
    {"ref":"G2.7","question":"A rectangle is 9 cm long and 6 cm wide. What is its area in cm2?","expected":"54","input_type":"numeric","ruby_prompt":"Area of rectangle = length x width.","error_signals":["ERR_FORMULA","ERR_ARITHMETIC"],"difficulty":3},
    {"ref":"G2.8","question":"A triangle has base 6 m and height 10 m. Find its area in m2.","expected":"30","input_type":"numeric","ruby_prompt":"Area of triangle = half x base x height.","error_signals":["ERR_FORMULA","ERR_HALF_MISSING"],"difficulty":4},
    {"ref":"G3.1","question":"A box is 4 cm long, 3 cm wide, and 2 cm high. Find its volume in cm3.","expected":"24","input_type":"numeric","ruby_prompt":"Volume = length x width x height.","error_signals":["ERR_FORMULA","ERR_ARITHMETIC"],"difficulty":4},
    {"ref":"G3.2","question":"A cuboid is 5 m long, 4 m wide, and 3 m high. Find its volume in m3.","expected":"60","input_type":"numeric","ruby_prompt":"Volume = length x width x height.","error_signals":["ERR_FORMULA","ERR_ARITHMETIC"],"difficulty":4},
    {"ref":"G3.3","question":"A room is 6 m long, 4 m wide, and 3 m high. Find its volume in m3.","expected":"72","input_type":"numeric","ruby_prompt":"Volume = length x width x height.","error_signals":["ERR_FORMULA","ERR_ARITHMETIC"],"difficulty":4},
    {"ref":"G3.4","question":"A box is 10 cm long, 5 cm wide, and 2 cm high. Find its volume in cm3.","expected":"100","input_type":"numeric","ruby_prompt":"Volume = length x width x height.","error_signals":["ERR_FORMULA","ERR_ARITHMETIC"],"difficulty":4},
    {"ref":"G3.5","question":"A cuboid measures 8 cm by 3 cm by 4 cm. Find its volume in cm3.","expected":"96","input_type":"numeric","ruby_prompt":"Volume = length x width x height.","error_signals":["ERR_FORMULA","ERR_ARITHMETIC"],"difficulty":4},
    {"ref":"G3.6","question":"A container is 12 cm long, 4 cm wide, and 5 cm high. Find its volume in cm3.","expected":"240","input_type":"numeric","ruby_prompt":"Volume = length x width x height.","error_signals":["ERR_FORMULA","ERR_ARITHMETIC"],"difficulty":4},
    {"ref":"G3.7","question":"A box is 7 cm long, 7 cm wide, and 7 cm high. Find its volume in cm3.","expected":"343","input_type":"numeric","ruby_prompt":"Volume = length x width x height. All three sides are the same.","error_signals":["ERR_FORMULA","ERR_ARITHMETIC"],"difficulty":4},
    {"ref":"G3.8","question":"A storage unit is 3 m long, 2 m wide, and 2 m high. Find its volume in m3.","expected":"12","input_type":"numeric","ruby_prompt":"Volume = length x width x height.","error_signals":["ERR_FORMULA","ERR_ARITHMETIC"],"difficulty":3},
  ]
}

m_stat = {
  "title": "Statistics – Averages, Charts and Probability",
  "gate": "C",
  "skill_ids": ["L16.T1.A1", "L16.T2.A1", "L16.T3.A1"],
  "pass_threshold": 0.8,
  "questions_for_mastery": 3,
  "questions": [
    {"ref":"S1.1","question":"Find the mean of 2, 4, 6, 8, 10.","expected":"6","input_type":"numeric","ruby_prompt":"Mean = total divided by how many numbers.","error_signals":["ERR_MEAN_DIV","ERR_ARITHMETIC"],"difficulty":3},
    {"ref":"S1.2","question":"Find the mean of 3, 7, 8, 6.","expected":"6","input_type":"numeric","ruby_prompt":"Add all values then divide by how many there are.","error_signals":["ERR_MEAN_DIV","ERR_ARITHMETIC"],"difficulty":3},
    {"ref":"S1.3","question":"Find the mean of 10, 20, 30, 40.","expected":"25","input_type":"numeric","ruby_prompt":"Add all values then divide by how many there are.","error_signals":["ERR_MEAN_DIV","ERR_ARITHMETIC"],"difficulty":3},
    {"ref":"S1.4","question":"Find the mean of 5, 9, 11, 15.","expected":"10","input_type":"numeric","ruby_prompt":"Add all values then divide by how many there are.","error_signals":["ERR_MEAN_DIV","ERR_ARITHMETIC"],"difficulty":3},
    {"ref":"S1.5","question":"Find the median of 3, 1, 5, 2, 4.","expected":"3","input_type":"numeric","ruby_prompt":"First put the numbers in order, then find the middle one.","error_signals":["ERR_MEDIAN_ORDER","ERR_MEDIAN_PICK"],"difficulty":3},
    {"ref":"S1.6","question":"Find the median of 8, 2, 6, 4, 10.","expected":"6","input_type":"numeric","ruby_prompt":"First put the numbers in order, then find the middle one.","error_signals":["ERR_MEDIAN_ORDER","ERR_MEDIAN_PICK"],"difficulty":3},
    {"ref":"S1.7","question":"Find the median of 11, 7, 3, 9, 5.","expected":"7","input_type":"numeric","ruby_prompt":"First put the numbers in order, then find the middle one.","error_signals":["ERR_MEDIAN_ORDER","ERR_MEDIAN_PICK"],"difficulty":3},
    {"ref":"S1.8","question":"Find the median of 15, 5, 10, 20, 25.","expected":"15","input_type":"numeric","ruby_prompt":"First put the numbers in order, then find the middle one.","error_signals":["ERR_MEDIAN_ORDER","ERR_MEDIAN_PICK"],"difficulty":3},
    {"ref":"S1.9","question":"Find the mode of 3, 5, 3, 7, 5, 3.","expected":"3","input_type":"numeric","ruby_prompt":"The mode is the number that appears most often.","error_signals":["ERR_MODE_COUNT"],"difficulty":3},
    {"ref":"S1.10","question":"Find the mode of 2, 4, 4, 6, 8, 4.","expected":"4","input_type":"numeric","ruby_prompt":"The mode is the number that appears most often.","error_signals":["ERR_MODE_COUNT"],"difficulty":3},
    {"ref":"S1.11","question":"Find the mode of 1, 2, 2, 3, 4, 2.","expected":"2","input_type":"numeric","ruby_prompt":"The mode is the number that appears most often.","error_signals":["ERR_MODE_COUNT"],"difficulty":3},
    {"ref":"S1.12","question":"Find the mean of 6, 8, 10, 12.","expected":"9","input_type":"numeric","ruby_prompt":"Add all values then divide by how many there are.","error_signals":["ERR_MEAN_DIV","ERR_ARITHMETIC"],"difficulty":3},
    {"ref":"S2.1","question":"A pie chart has 4 equal sections. What is the angle of each section in degrees?","expected":"90","input_type":"numeric","ruby_prompt":"A full pie chart is 360 degrees. Divide by the number of sections.","error_signals":["ERR_PIE_TOTAL","ERR_ARITHMETIC"],"difficulty":3},
    {"ref":"S2.2","question":"A pie chart represents 180 students. One slice shows 45 students. What is the angle of that slice in degrees?","expected":"90","input_type":"numeric","ruby_prompt":"Angle = (frequency divided by total) times 360.","error_signals":["ERR_PIE_FORMULA","ERR_ARITHMETIC"],"difficulty":4},
    {"ref":"S2.3","question":"A pie chart slice has an angle of 72 degrees. What percentage of the total does it represent?","expected":"20","input_type":"numeric","ruby_prompt":"Percentage = (angle divided by 360) times 100.","error_signals":["ERR_PIE_PERCENT","ERR_ARITHMETIC"],"difficulty":4},
    {"ref":"S2.4","question":"A pie chart represents 360 students. A slice shows 90 students. What is the angle of that slice in degrees?","expected":"90","input_type":"numeric","ruby_prompt":"Angle = (frequency divided by total) times 360.","error_signals":["ERR_PIE_FORMULA","ERR_ARITHMETIC"],"difficulty":4},
    {"ref":"S2.5","question":"A pie chart has 6 equal sections. What is the angle of each section in degrees?","expected":"60","input_type":"numeric","ruby_prompt":"A full pie chart is 360 degrees. Divide by the number of sections.","error_signals":["ERR_PIE_TOTAL","ERR_ARITHMETIC"],"difficulty":3},
    {"ref":"S2.6","question":"A pie chart slice has an angle of 90 degrees. What fraction of the whole does it represent?","expected":"1/4","input_type":"text","ruby_prompt":"Fraction = angle divided by 360. Simplify your answer.","error_signals":["ERR_PIE_FRACTION","ERR_SIMPLIFY"],"difficulty":4},
    {"ref":"S3.1","question":"A bag has 3 red and 7 blue marbles. What is the probability of picking a red marble? Write as a fraction.","expected":"3/10","input_type":"text","ruby_prompt":"Probability = number of favourable outcomes divided by total outcomes.","error_signals":["ERR_PROB_TOTAL","ERR_FRACTION"],"difficulty":3},
    {"ref":"S3.2","question":"A fair die is rolled. What is the probability of rolling a 4? Write as a fraction.","expected":"1/6","input_type":"text","ruby_prompt":"There are 6 equally likely outcomes on a fair die.","error_signals":["ERR_PROB_TOTAL"],"difficulty":3},
    {"ref":"S3.3","question":"A coin is flipped. What is the probability of getting heads? Write as a fraction.","expected":"1/2","input_type":"text","ruby_prompt":"There are 2 equally likely outcomes when flipping a coin.","error_signals":["ERR_PROB_TOTAL"],"difficulty":2},
    {"ref":"S3.4","question":"A bag has 2 red, 3 blue, and 5 green balls. What is the probability of picking a green ball? Write as a fraction.","expected":"1/2","input_type":"text","ruby_prompt":"Total = 2 + 3 + 5. Probability = green balls divided by total. Simplify.","error_signals":["ERR_PROB_TOTAL","ERR_SIMPLIFY"],"difficulty":4},
    {"ref":"S3.5","question":"A fair die is rolled. What is the probability of rolling a number less than 3? Write as a fraction.","expected":"1/3","input_type":"text","ruby_prompt":"Numbers less than 3 on a die: 1 and 2. There are 6 total outcomes.","error_signals":["ERR_PROB_TOTAL","ERR_SIMPLIFY"],"difficulty":4},
    {"ref":"S3.6","question":"A bag has 4 yellow and 6 purple sweets. What is the probability of picking a yellow sweet? Write as a fraction.","expected":"2/5","input_type":"text","ruby_prompt":"Probability = yellow sweets divided by total sweets. Simplify.","error_signals":["ERR_PROB_TOTAL","ERR_SIMPLIFY"],"difficulty":4},
    {"ref":"S3.7","question":"A spinner has 8 equal sections numbered 1 to 8. What is the probability of spinning an even number? Write as a fraction.","expected":"1/2","input_type":"text","ruby_prompt":"Even numbers: 2, 4, 6, 8. Total sections: 8. Simplify.","error_signals":["ERR_PROB_TOTAL","ERR_SIMPLIFY"],"difficulty":4},
    {"ref":"S3.8","question":"In a class of 30, 12 students play sport. What is the probability a student chosen at random plays sport? Write as a fraction.","expected":"2/5","input_type":"text","ruby_prompt":"Probability = 12 divided by 30. Simplify the fraction.","error_signals":["ERR_PROB_TOTAL","ERR_SIMPLIFY"],"difficulty":4},
  ]
}

# Fix M013 and M014 — remove wrong skill mappings
bank['domains']['M013']['skill_ids'] = []
bank['domains']['M014']['skill_ids'] = []

# Add new domains
bank['domains']['M_GEO'] = m_geo
bank['domains']['M_STAT'] = m_stat

with open('C:/Users/rrazz/Desktop/ai-tutor/data/question-bank.json', 'w', encoding='utf-8') as f:
    json.dump(bank, f, indent=2, ensure_ascii=False)

print('Done.')
print(f'M_GEO: {len(m_geo["questions"])} questions, skill_ids={m_geo["skill_ids"]}')
print(f'M_STAT: {len(m_stat["questions"])} questions, skill_ids={m_stat["skill_ids"]}')
print(f'M013 skill_ids now: {bank["domains"]["M013"]["skill_ids"]}')
print(f'M014 skill_ids now: {bank["domains"]["M014"]["skill_ids"]}')
