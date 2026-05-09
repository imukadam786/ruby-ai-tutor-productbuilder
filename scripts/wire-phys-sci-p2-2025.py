import json

BASE_URL = "https://kmgnizvqkqkiulzgvkcb.supabase.co/storage/v1/object/public/matric-diagrams/"
FILE = "data/papers/phys-sci-p2-may-jun-2025.json"

def u(name):
    return BASE_URL + name

with open(FILE, encoding="utf-8") as f:
    data = json.load(f)

# question-level images (shared context for all subquestions in that question)
Q_IMAGES = {
    2: u("physics-p2-may-jun-2025-q2.png"),
    4: u("physics-p2-may-jun-2025-q4.png"),
    5: u("physics-p2-may-jun-2025-q5.png"),
    6: u("physics-p2-may-jun-2025-q6.png"),
    8: u("physics-p2-may-jun-2025-q8.png"),
    9: u("physics-p2-may-jun-2025-q9.png"),
}

# subquestion-level images (specific diagram for that subquestion)
SQ_LABEL_IMAGES = {
    "1.4": u("physics-p2-may-jun-2025-q1.4.png"),
    "1.8": u("physics-p2-may-jun-2025-q1.8.png"),
    "5.2": u("physics-p2-may-jun-2025-q5.2.png"),
    "6.5": u("physics-p2-may-jun-2025-q6.5.png"),
}

wired_q = 0
wired_sq = 0

for q in data["questions"]:
    n = q["number"]
    if n in Q_IMAGES:
        q["diagramUrl"] = Q_IMAGES[n]
        wired_q += 1
    for sq in q.get("subQuestions", []):
        label = sq.get("label", "")
        if label in SQ_LABEL_IMAGES:
            sq["diagramUrl"] = SQ_LABEL_IMAGES[label]
            wired_sq += 1

with open(FILE, "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print(f"Wired {wired_q} question-level + {wired_sq} subquestion-level diagramUrls -> {FILE}")
