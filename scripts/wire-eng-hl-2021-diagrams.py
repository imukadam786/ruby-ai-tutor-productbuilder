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

# ===================== P2 2021 =====================
# Confirmed in bucket:
#   q1.png, q2.png, q3.png, q4.png, q5.png
#   q7-extract-a.png, q7-extract-b.png
#   q9-extract-c.png, q9-extract-d.png
#   q11-extract-e.png
#   q13-extract-g.png
#   q15-extract-i.png

print("=== P2 2021 ===")
data = load("eng-hl-p2-may-jun-2021.json")
for q in data['questions']:
    n = q['number']
    sqs = q['subQuestions']

    if n in [1, 2, 3, 4, 5]:
        q['diagramUrl'] = u(f"eng-hl-p2-may-jun-2021-q{n}")

    elif n == 7:
        q['diagramUrl'] = u("eng-hl-p2-may-jun-2021-q7-extract-a")
        if sqs:
            sqs[0]['diagramUrl'] = u("eng-hl-p2-may-jun-2021-q7-extract-b")

    elif n == 9:
        q['diagramUrl'] = u("eng-hl-p2-may-jun-2021-q9-extract-c")
        if sqs:
            sqs[0]['diagramUrl'] = u("eng-hl-p2-may-jun-2021-q9-extract-d")

    elif n == 11:
        q['diagramUrl'] = u("eng-hl-p2-may-jun-2021-q11-extract-e")

    elif n == 13:
        q['diagramUrl'] = u("eng-hl-p2-may-jun-2021-q13-extract-g")

    elif n == 15:
        q['diagramUrl'] = u("eng-hl-p2-may-jun-2021-q15-extract-i")

save(data, "eng-hl-p2-may-jun-2021.json")

# ===================== P3 2021 =====================
# Confirmed in bucket: q2.1.png (Q2 sq label "2.1")

print("=== P3 2021 ===")
data = load("eng-hl-p3-may-jun-2021.json")
for q in data['questions']:
    if q['number'] == 2:
        for sq in q['subQuestions']:
            if sq['label'] == '2.1':
                sq['diagramUrl'] = u("eng-hl-p3-may-jun-2021-q2.1")
save(data, "eng-hl-p3-may-jun-2021.json")

print("Done.")
