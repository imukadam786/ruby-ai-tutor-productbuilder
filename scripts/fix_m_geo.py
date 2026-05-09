import json, sys
sys.stdout.reconfigure(encoding='utf-8')

GEO_QUESTIONS = [
    # (bank, id, stimulus, question, answer, errorSignals)
    # Triangle: find the missing angle
    ( 1,'GEO.1', 'A triangle has angles of 40° and 65°.',           'What is the third angle? Type the answer in degrees.',  75, ['ERR_ANGLE_SUM','ERR_CALC_WRONG']),
    ( 2,'GEO.2', 'A triangle has angles of 55° and 70°.',           'What is the third angle? Type the answer in degrees.',  55, ['ERR_ANGLE_SUM','ERR_CALC_WRONG']),
    ( 3,'GEO.3', 'A right-angled triangle has one angle of 30°.',   'What is the third angle? Type the answer in degrees.',  60, ['ERR_ANGLE_SUM','ERR_CALC_WRONG']),
    ( 4,'GEO.4', 'A triangle has angles of 45° and 72°.',           'What is the third angle? Type the answer in degrees.',  63, ['ERR_ANGLE_SUM','ERR_CALC_WRONG']),
    ( 5,'GEO.5', 'A triangle has angles of 60° and 60°.',           'What is the third angle? Type the answer in degrees.',  60, ['ERR_ANGLE_SUM','ERR_CALC_WRONG']),
    ( 6,'GEO.6', 'A triangle has angles of 80° and 55°.',           'What is the third angle? Type the answer in degrees.',  45, ['ERR_ANGLE_SUM','ERR_CALC_WRONG']),
    ( 7,'GEO.7', 'A triangle has angles of 35° and 95°.',           'What is the third angle? Type the answer in degrees.',  50, ['ERR_ANGLE_SUM','ERR_CALC_WRONG']),
    ( 8,'GEO.8', 'A triangle has angles of 20° and 140°.',          'What is the third angle? Type the answer in degrees.',  20, ['ERR_ANGLE_SUM','ERR_CALC_WRONG']),
    ( 9,'GEO.9', 'A triangle has angles of 75° and 65°.',           'What is the third angle? Type the answer in degrees.',  40, ['ERR_ANGLE_SUM','ERR_CALC_WRONG']),
    (10,'GEO.10','A triangle has angles of 50° and 80°.',           'What is the third angle? Type the answer in degrees.',  50, ['ERR_ANGLE_SUM','ERR_CALC_WRONG']),
    (11,'GEO.11','A triangle has angles of 25° and 110°.',          'What is the third angle? Type the answer in degrees.',  45, ['ERR_ANGLE_SUM','ERR_CALC_WRONG']),
    (12,'GEO.12','A triangle has angles of 70° and 70°.',           'What is the third angle? Type the answer in degrees.',  40, ['ERR_ANGLE_SUM','ERR_CALC_WRONG']),
    (13,'GEO.13','A triangle has angles of 15° and 120°.',          'What is the third angle? Type the answer in degrees.',  45, ['ERR_ANGLE_SUM','ERR_CALC_WRONG']),
    (14,'GEO.14','A right-angled triangle has one angle of 45°.',   'What is the third angle? Type the answer in degrees.',  45, ['ERR_ANGLE_SUM','ERR_CALC_WRONG']),
    (15,'GEO.15','A triangle has angles of 38° and 67°.',           'What is the third angle? Type the answer in degrees.',  75, ['ERR_ANGLE_SUM','ERR_CALC_WRONG']),
    # Area of rectangle
    (16,'GEO.16','A rectangle has length 8 cm and width 5 cm.',     'What is the area? Type the answer in cm\u00b2.',  40, ['ERR_AREA_FORMULA','ERR_CALC_WRONG']),
    (17,'GEO.17','A rectangle has length 12 cm and width 7 cm.',    'What is the area? Type the answer in cm\u00b2.',  84, ['ERR_AREA_FORMULA','ERR_CALC_WRONG']),
    (18,'GEO.18','A rectangle has length 6 cm and width 9 cm.',     'What is the area? Type the answer in cm\u00b2.',  54, ['ERR_AREA_FORMULA','ERR_CALC_WRONG']),
    (19,'GEO.19','A rectangle has length 10 cm and width 4 cm.',    'What is the area? Type the answer in cm\u00b2.',  40, ['ERR_AREA_FORMULA','ERR_CALC_WRONG']),
    (20,'GEO.20','A rectangle has length 15 cm and width 3 cm.',    'What is the area? Type the answer in cm\u00b2.',  45, ['ERR_AREA_FORMULA','ERR_CALC_WRONG']),
    (21,'GEO.21','A rectangle has length 11 cm and width 6 cm.',    'What is the area? Type the answer in cm\u00b2.',  66, ['ERR_AREA_FORMULA','ERR_CALC_WRONG']),
    (22,'GEO.22','A rectangle has length 7 cm and width 8 cm.',     'What is the area? Type the answer in cm\u00b2.',  56, ['ERR_AREA_FORMULA','ERR_CALC_WRONG']),
    (23,'GEO.23','A rectangle has length 9 cm and width 9 cm.',     'What is the area? Type the answer in cm\u00b2.',  81, ['ERR_AREA_FORMULA','ERR_CALC_WRONG']),
    (24,'GEO.24','A rectangle has length 13 cm and width 4 cm.',    'What is the area? Type the answer in cm\u00b2.',  52, ['ERR_AREA_FORMULA','ERR_CALC_WRONG']),
    (25,'GEO.25','A rectangle has length 20 cm and width 5 cm.',    'What is the area? Type the answer in cm\u00b2.', 100, ['ERR_AREA_FORMULA','ERR_CALC_WRONG']),
    # Perimeter of rectangle
    (26,'GEO.26','A rectangle has length 8 cm and width 5 cm.',     'What is the perimeter? Type the answer in cm.',  26, ['ERR_PERI_FORMULA','ERR_CALC_WRONG']),
    (27,'GEO.27','A rectangle has length 12 cm and width 7 cm.',    'What is the perimeter? Type the answer in cm.',  38, ['ERR_PERI_FORMULA','ERR_CALC_WRONG']),
    (28,'GEO.28','A rectangle has length 6 cm and width 9 cm.',     'What is the perimeter? Type the answer in cm.',  30, ['ERR_PERI_FORMULA','ERR_CALC_WRONG']),
    (29,'GEO.29','A rectangle has length 10 cm and width 4 cm.',    'What is the perimeter? Type the answer in cm.',  28, ['ERR_PERI_FORMULA','ERR_CALC_WRONG']),
    (30,'GEO.30','A rectangle has length 15 cm and width 3 cm.',    'What is the perimeter? Type the answer in cm.',  36, ['ERR_PERI_FORMULA','ERR_CALC_WRONG']),
    (31,'GEO.31','A rectangle has length 11 cm and width 6 cm.',    'What is the perimeter? Type the answer in cm.',  34, ['ERR_PERI_FORMULA','ERR_CALC_WRONG']),
    (32,'GEO.32','A rectangle has length 7 cm and width 8 cm.',     'What is the perimeter? Type the answer in cm.',  30, ['ERR_PERI_FORMULA','ERR_CALC_WRONG']),
    (33,'GEO.33','A rectangle has length 9 cm and width 9 cm.',     'What is the perimeter? Type the answer in cm.',  36, ['ERR_PERI_FORMULA','ERR_CALC_WRONG']),
    (34,'GEO.34','A rectangle has length 13 cm and width 4 cm.',    'What is the perimeter? Type the answer in cm.',  34, ['ERR_PERI_FORMULA','ERR_CALC_WRONG']),
    (35,'GEO.35','A rectangle has length 20 cm and width 5 cm.',    'What is the perimeter? Type the answer in cm.',  50, ['ERR_PERI_FORMULA','ERR_CALC_WRONG']),
    # Supplementary angles (sum to 180 on a straight line)
    (36,'GEO.36','Two angles on a straight line. One angle is 130°.','What is the other angle? Type the answer in degrees.',  50, ['ERR_SUPP_ANGLE','ERR_CALC_WRONG']),
    (37,'GEO.37','Two angles on a straight line. One angle is 72°.', 'What is the other angle? Type the answer in degrees.', 108, ['ERR_SUPP_ANGLE','ERR_CALC_WRONG']),
    (38,'GEO.38','Two angles on a straight line. One angle is 45°.', 'What is the other angle? Type the answer in degrees.', 135, ['ERR_SUPP_ANGLE','ERR_CALC_WRONG']),
    (39,'GEO.39','Two angles on a straight line. One angle is 110°.','What is the other angle? Type the answer in degrees.',  70, ['ERR_SUPP_ANGLE','ERR_CALC_WRONG']),
    (40,'GEO.40','Two angles on a straight line. One angle is 63°.', 'What is the other angle? Type the answer in degrees.', 117, ['ERR_SUPP_ANGLE','ERR_CALC_WRONG']),
    (41,'GEO.41','Two angles on a straight line. One angle is 25°.', 'What is the other angle? Type the answer in degrees.', 155, ['ERR_SUPP_ANGLE','ERR_CALC_WRONG']),
    (42,'GEO.42','Two angles on a straight line. One angle is 150°.','What is the other angle? Type the answer in degrees.',  30, ['ERR_SUPP_ANGLE','ERR_CALC_WRONG']),
    (43,'GEO.43','Two angles on a straight line. One angle is 88°.', 'What is the other angle? Type the answer in degrees.',  92, ['ERR_SUPP_ANGLE','ERR_CALC_WRONG']),
    (44,'GEO.44','Two angles on a straight line. One angle is 55°.', 'What is the other angle? Type the answer in degrees.', 125, ['ERR_SUPP_ANGLE','ERR_CALC_WRONG']),
    (45,'GEO.45','Two angles on a straight line. One angle is 120°.','What is the other angle? Type the answer in degrees.',  60, ['ERR_SUPP_ANGLE','ERR_CALC_WRONG']),
    # Area of triangle (half base times height)
    (46,'GEO.46','A triangle has base 8 cm and height 5 cm.',        'What is the area? Type the answer in cm\u00b2.',  20, ['ERR_AREA_FORMULA','ERR_CALC_WRONG']),
    (47,'GEO.47','A triangle has base 10 cm and height 6 cm.',       'What is the area? Type the answer in cm\u00b2.',  30, ['ERR_AREA_FORMULA','ERR_CALC_WRONG']),
    (48,'GEO.48','A triangle has base 12 cm and height 4 cm.',       'What is the area? Type the answer in cm\u00b2.',  24, ['ERR_AREA_FORMULA','ERR_CALC_WRONG']),
    (49,'GEO.49','A triangle has base 7 cm and height 8 cm.',        'What is the area? Type the answer in cm\u00b2.',  28, ['ERR_AREA_FORMULA','ERR_CALC_WRONG']),
    (50,'GEO.50','A triangle has base 9 cm and height 6 cm.',        'What is the area? Type the answer in cm\u00b2.',  27, ['ERR_AREA_FORMULA','ERR_CALC_WRONG']),
]

geo_by_bank = {row[0]: row for row in GEO_QUESTIONS}

added = 0
for bank_num in range(1, 51):
    path = f'C:/Users/rrazz/Desktop/ai-tutor/data/maths-question-banks/{bank_num}.json'
    with open(path, encoding='utf-8') as f:
        data = json.load(f)

    _, qid, stimulus, question, answer, errors = geo_by_bank[bank_num]
    data.append({
        'id': qid,
        'domain': 'M_GEO',
        'domainTitle': 'Geometry \u2014 Shape and Space',
        'gate': 'C',
        'stimulus': stimulus,
        'question': question,
        'answerMode': 'numeric',
        'expectedAnswer': answer,
        'errorSignals': errors,
        'passThreshold': 0.8,
    })
    added += 1

    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

print(f'M_GEO entries added to {added} bank files')

# Spot-check
for b in [1, 16, 36, 46]:
    path = f'C:/Users/rrazz/Desktop/ai-tutor/data/maths-question-banks/{b}.json'
    with open(path, encoding='utf-8') as f:
        data = json.load(f)
    geo = next(q for q in data if q['domain'] == 'M_GEO')
    print(f'Bank {b}: {geo["id"]} | {geo["stimulus"]} | answer={geo["expectedAnswer"]}')
