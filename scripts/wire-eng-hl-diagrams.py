import json, os

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

# ===================== P1 PAPERS =====================

print("=== P1 Papers ===")

# P1 2023 — q2-text-d.png is the advertising image (JSON Q3)
data = load("eng-hl-p1-may-jun-2023.json")
for q in data['questions']:
    n = q['number']
    if n == 1:
        q['diagramUrl'] = u("eng-hl-p1-may-jun-2023-q1-text-a")
        sq = get_sq(q, '1-1')
        if sq: sq['diagramUrl'] = u("eng-hl-p1-may-jun-2023-q1-text-a-1")
        sq_vis = first_sq_with_topic(q, 'Visual Literacy')
        if sq_vis: sq_vis['diagramUrl'] = u("eng-hl-p1-may-jun-2023-q1-text-b")
    elif n == 2:
        q['diagramUrl'] = u("eng-hl-p1-may-jun-2023-q2-text-c")
    elif n == 3:
        q['diagramUrl'] = u("eng-hl-p1-may-jun-2023-q2-text-d")
    elif n == 4:
        q['diagramUrl'] = u("eng-hl-p1-may-jun-2023-q4-text-e")
    elif n == 5:
        q['diagramUrl'] = u("eng-hl-p1-may-jun-2023-q5-text-f")
save(data, "eng-hl-p1-may-jun-2023.json")

# P1 2024
data = load("eng-hl-p1-may-jun-2024.json")
for q in data['questions']:
    n = q['number']
    if n == 1:
        q['diagramUrl'] = u("eng-hl-p1-may-jun-2024-q1-text-a")
        sq = get_sq(q, '1-1')
        if sq: sq['diagramUrl'] = u("eng-hl-p1-may-jun-2024-q1-text-a-1")
        sq_vis = first_sq_with_topic(q, 'Visual Literacy')
        if sq_vis: sq_vis['diagramUrl'] = u("eng-hl-p1-may-jun-2024-q1-text-b")
    elif n == 2:
        q['diagramUrl'] = u("eng-hl-p1-may-jun-2024-q2-text-c")
    elif n == 3:
        q['diagramUrl'] = u("eng-hl-p1-may-jun-2024-q3-text-d")
        if q['subQuestions']:
            q['subQuestions'][0]['diagramUrl'] = u("eng-hl-p1-may-jun-2024-q3-text-d-1")
    elif n == 4:
        q['diagramUrl'] = u("eng-hl-p1-may-jun-2024-q4-text-e")
    elif n == 5:
        q['diagramUrl'] = u("eng-hl-p1-may-jun-2024-q5-text-f")
save(data, "eng-hl-p1-may-jun-2024.json")

# P1 2025
data = load("eng-hl-p1-may-jun-2025.json")
for q in data['questions']:
    n = q['number']
    if n == 1:
        q['diagramUrl'] = u("eng-hl-p1-may-jun-2025-q1-text-a")
        sq = get_sq(q, '1-1')
        if sq: sq['diagramUrl'] = u("eng-hl-p1-may-jun-2025-q1-text-a-1")
        sq_vis = first_sq_with_topic(q, 'Visual Literacy')
        if sq_vis: sq_vis['diagramUrl'] = u("eng-hl-p1-may-jun-2025-q1-text-b")
    elif n == 2:
        q['diagramUrl'] = u("eng-hl-p1-may-jun-2025-q2-text-c")
    elif n == 3:
        q['diagramUrl'] = u("eng-hl-p1-may-jun-2025-q3-text-d")
    elif n == 4:
        q['diagramUrl'] = u("eng-hl-p1-may-jun-2025-q4-text-e")
    elif n == 5:
        q['diagramUrl'] = u("eng-hl-p1-may-jun-2025-q5-text-f")
save(data, "eng-hl-p1-may-jun-2025.json")

# ===================== P2 PAPERS =====================

print("=== P2 Papers ===")

def wire_p2(data, year):
    img_flags = {
        '2023': {'q9_c1': True,  'q9_d1': False, 'q11_f1': True,  'q13_h1': False},
        '2024': {'q9_c1': False, 'q9_d1': True,  'q11_f1': False, 'q13_h1': True},
        '2025': {'q9_c1': True,  'q9_d1': False, 'q11_f1': False, 'q13_h1': False},
    }[year]

    for q in data['questions']:
        n = q['number']
        sqs = q['subQuestions']

        if n in [1, 2, 3, 4, 5]:
            q['diagramUrl'] = u(f"eng-hl-p2-may-jun-{year}-q{n}")

        elif n == 7:
            q['diagramUrl'] = u(f"eng-hl-p2-may-jun-{year}-q7-extract-a")
            if sqs:
                sqs[0]['diagramUrl'] = u(f"eng-hl-p2-may-jun-{year}-q7-extract-b")

        elif n == 9:
            q['diagramUrl'] = u(f"eng-hl-p2-may-jun-{year}-q9-extract-c")
            if img_flags['q9_c1']:
                if len(sqs) >= 1: sqs[0]['diagramUrl'] = u(f"eng-hl-p2-may-jun-{year}-q9-extract-c-1")
                if len(sqs) >= 2: sqs[1]['diagramUrl'] = u(f"eng-hl-p2-may-jun-{year}-q9-extract-d")
            else:
                if len(sqs) >= 1: sqs[0]['diagramUrl'] = u(f"eng-hl-p2-may-jun-{year}-q9-extract-d")
                if img_flags['q9_d1'] and len(sqs) >= 2:
                    sqs[1]['diagramUrl'] = u(f"eng-hl-p2-may-jun-{year}-q9-extract-d-1")

        elif n == 11:
            q['diagramUrl'] = u(f"eng-hl-p2-may-jun-{year}-q11-extract-e")
            if len(sqs) >= 1: sqs[0]['diagramUrl'] = u(f"eng-hl-p2-may-jun-{year}-q11-extract-e-1")
            if len(sqs) >= 2: sqs[1]['diagramUrl'] = u(f"eng-hl-p2-may-jun-{year}-q11-extract-f")
            if img_flags['q11_f1'] and len(sqs) >= 3:
                sqs[2]['diagramUrl'] = u(f"eng-hl-p2-may-jun-{year}-q11-extract-f-1")

        elif n == 13:
            q['diagramUrl'] = u(f"eng-hl-p2-may-jun-{year}-q13-extract-g")
            if len(sqs) >= 1: sqs[0]['diagramUrl'] = u(f"eng-hl-p2-may-jun-{year}-q13-extract-g-1")
            if len(sqs) >= 2: sqs[1]['diagramUrl'] = u(f"eng-hl-p2-may-jun-{year}-q13-extract-h")
            if img_flags['q13_h1'] and len(sqs) >= 3:
                sqs[2]['diagramUrl'] = u(f"eng-hl-p2-may-jun-{year}-q13-extract-h-1")

        elif n == 15:
            q['diagramUrl'] = u(f"eng-hl-p2-may-jun-{year}-q15-extract-i")
            if sqs:
                sqs[0]['diagramUrl'] = u(f"eng-hl-p2-may-jun-{year}-q15-extract-j")

for year, fname in [
    ('2023', 'eng-hl-p2-may-jun-2023.json'),
    ('2024', 'eng-hl-p2-may-jun-2024-combined.json'),
    ('2025', 'eng-hl-p2-may-jun-2025-combined.json'),
]:
    data = load(fname)
    wire_p2(data, year)
    save(data, fname)

# ===================== P3 PAPERS =====================

print("=== P3 Papers ===")

def wire_p3(data, year):
    for q in data['questions']:
        if q['number'] == 1:
            for sq in q['subQuestions']:
                if sq['label'] in ['1.6', '1.7', '1.8']:
                    sq['diagramUrl'] = u(f"eng-hl-p3-may-jun-{year}-q{sq['label']}")
        elif q['number'] == 2:
            for sq in q['subQuestions']:
                if year == '2023' and sq['label'] == '2.1':
                    sq['diagramUrl'] = u(f"eng-hl-p3-may-jun-{year}-q{sq['label']}")
                elif year in ['2024', '2025'] and sq['label'] == '2.5':
                    sq['diagramUrl'] = u(f"eng-hl-p3-may-jun-{year}-q{sq['label']}")

for year, fname in [
    ('2023', 'eng-hl-p3-may-jun-2023.json'),
    ('2024', 'eng-hl-p3-may-jun-2024-combined.json'),
    ('2025', 'eng-hl-p3-may-jun-2025-combined.json'),
]:
    data = load(fname)
    wire_p3(data, year)
    save(data, fname)

print("Done.")
