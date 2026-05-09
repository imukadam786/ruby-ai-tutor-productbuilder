import json

BASE_URL = "https://kmgnizvqkqkiulzgvkcb.supabase.co/storage/v1/object/public/matric-diagrams/"
DATA_DIR = "data/papers/"

def u(name):
    return BASE_URL + name + ".png"

def load(fname):
    with open(DATA_DIR + fname, encoding='utf-8') as f:
        return json.load(f)

def save(data, fname):
    with open(DATA_DIR + fname, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f"  Saved {fname}")

def get_sq(question, sq_id):
    for sq in question['subQuestions']:
        if sq['id'] == sq_id:
            return sq
    return None

def first_sq_with_topic(question, topic):
    for sq in question['subQuestions']:
        if sq.get('topic') == topic:
            return sq
    return None

# ===================== P1 2022 =====================
# Uploaded: q1-text-a, q1-text-a1, q1-text-b, q2-text-c, q3-text-d,
#           q4-text-e, q4-text-f, q5-text-g
# Note: Q4 has two cartoons — text-e (business/coffee shop), text-f (Thandi/classroom)

print("=== P1 2022 ===")
data = load("eng-hl-p1-may-jun-2022.json")
for q in data['questions']:
    n = q['number']
    sqs = q['subQuestions']
    if n == 1:
        q['diagramUrl'] = u("eng-hl-p1-may-jun-2022-q1-text-a")
        sq = get_sq(q, '1-1')
        if sq: sq['diagramUrl'] = u("eng-hl-p1-may-jun-2022-q1-text-a1")
        sq_vis = first_sq_with_topic(q, 'Visual Literacy')
        if sq_vis: sq_vis['diagramUrl'] = u("eng-hl-p1-may-jun-2022-q1-text-b")
    elif n == 2:
        q['diagramUrl'] = u("eng-hl-p1-may-jun-2022-q2-text-c")
    elif n == 3:
        q['diagramUrl'] = u("eng-hl-p1-may-jun-2022-q3-text-d")
    elif n == 4:
        q['diagramUrl'] = u("eng-hl-p1-may-jun-2022-q4-text-e")
        for sq in sqs:
            if sq['id'] in ['4-4', '4-5', '4-6']:
                sq['diagramUrl'] = u("eng-hl-p1-may-jun-2022-q4-text-f")
    elif n == 5:
        q['diagramUrl'] = u("eng-hl-p1-may-jun-2022-q5-text-g")
save(data, "eng-hl-p1-may-jun-2022.json")

# ===================== P2 2022 =====================
# Uploaded: q5, q7-extract-a/b, q9-extract-c/d,
#           q11-extract-e/e1/f/f1, q13-extract-g/g1/h/h1, q15-extract-i/j
# Note: Q1-Q4 poems are embedded as passageText (only Q5 uploaded as image)
# Note: 2022 uses e1/f1/g1/h1 (no hyphen) unlike other years' e-1/f-1/g-1/h-1

print("=== P2 2022 ===")
data = load("eng-hl-p2-may-jun-2022.json")
for q in data['questions']:
    n = q['number']
    sqs = q['subQuestions']

    if n == 5:
        q['diagramUrl'] = u("eng-hl-p2-may-jun-2022-q5")

    elif n == 7:
        q['diagramUrl'] = u("eng-hl-p2-may-jun-2022-q7-extract-a")
        if sqs:
            sqs[0]['diagramUrl'] = u("eng-hl-p2-may-jun-2022-q7-extract-b")

    elif n == 9:
        q['diagramUrl'] = u("eng-hl-p2-may-jun-2022-q9-extract-c")
        if sqs:
            sqs[0]['diagramUrl'] = u("eng-hl-p2-may-jun-2022-q9-extract-d")

    elif n == 11:
        q['diagramUrl'] = u("eng-hl-p2-may-jun-2022-q11-extract-e")
        if len(sqs) >= 1: sqs[0]['diagramUrl'] = u("eng-hl-p2-may-jun-2022-q11-extract-e1")
        if len(sqs) >= 2: sqs[1]['diagramUrl'] = u("eng-hl-p2-may-jun-2022-q11-extract-f")
        if len(sqs) >= 3: sqs[2]['diagramUrl'] = u("eng-hl-p2-may-jun-2022-q11-extract-f1")

    elif n == 13:
        q['diagramUrl'] = u("eng-hl-p2-may-jun-2022-q13-extract-g")
        if len(sqs) >= 1: sqs[0]['diagramUrl'] = u("eng-hl-p2-may-jun-2022-q13-extract-g1")
        if len(sqs) >= 2: sqs[1]['diagramUrl'] = u("eng-hl-p2-may-jun-2022-q13-extract-h")
        if len(sqs) >= 3: sqs[2]['diagramUrl'] = u("eng-hl-p2-may-jun-2022-q13-extract-h1")

    elif n == 15:
        q['diagramUrl'] = u("eng-hl-p2-may-jun-2022-q15-extract-i")
        if sqs:
            sqs[0]['diagramUrl'] = u("eng-hl-p2-may-jun-2022-q15-extract-j")

save(data, "eng-hl-p2-may-jun-2022.json")

# ===================== P3 2022 =====================
# Uploaded: q1.6.1, q1.6.2, q1.6.3 (picture essay options), q2.3 (e-mail question)

print("=== P3 2022 ===")
data = load("eng-hl-p3-may-jun-2022.json")
for q in data['questions']:
    if q['number'] == 1:
        for sq in q['subQuestions']:
            if sq['label'] in ['1.6.1', '1.6.2', '1.6.3']:
                sq['diagramUrl'] = u(f"eng-hl-p3-may-jun-2022-q{sq['label']}")
    elif q['number'] == 2:
        for sq in q['subQuestions']:
            if sq['label'] == '2.3':
                sq['diagramUrl'] = u("eng-hl-p3-may-jun-2022-q2.3")
save(data, "eng-hl-p3-may-jun-2022.json")

print("Done.")
