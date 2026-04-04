"""Fix reading question bank files (data/question-banks/1-50.json):
1. Fix mojibake encoding: â€¢ → •  â€" → –
2. Replace D09 (silent-E) pseudo-words with real English words
3. Replace D10 (vowel teams) pseudo-words with real English words
4. Replace D12 (r-controlled) pseudo-words with real English words
"""

import json, os, sys

BANK_DIR = os.path.join(os.path.dirname(__file__), "..", "data", "question-banks")

# ── Word pools (50 words, one per bank file) ──────────────────────────────────

# D09: Long Vowel / Silent E — all real, STT-recognizable, CVCe words
D09_WORDS = [
    "BAKE", "BIKE", "BONE", "CAME", "CODE", "CUBE", "CUTE", "DUNE", "FAME", "FUSE",
    "GATE", "HIDE", "HOLE", "KITE", "LACE", "LATE", "MINE", "MOLE", "MOPE", "MULE",
    "NOTE", "PINE", "RIDE", "ROPE", "RULE", "TAPE", "TIME", "TUNE", "VOTE", "WADE",
    "WIFE", "CAVE", "CANE", "CAPE", "DARE", "DATE", "DIVE", "DOME", "DOSE", "FACE",
    "FARE", "FILE", "FINE", "FIRE", "FIVE", "GAME", "GAVE", "GAZE", "GIVE", "MADE",
]

# D10: Vowel Teams — real words covering ai, ea, oa, oo, ee, oi
D10_WORDS = [
    "RAIN", "MAIL", "SAIL", "TAIL", "WAIT", "PAID", "BAIT", "BEAM", "BOAT", "BOOM",
    "COAL", "COAT", "FOAM", "FOOD", "HEAT", "LEAD", "LEAN", "LOAD", "LOOP", "MEAL",
    "MOON", "POOL", "REAM", "ROAD", "ROOF", "SEAL", "SOON", "TOAD", "TEAK", "BAIL",
    "BEAN", "BEAT", "BOIL", "COOL", "DEAL", "DEAN", "DEEP", "FEEL", "FEET", "GOAL",
    "HEEL", "HEED", "HOOD", "HOOK", "JAIL", "KEEN", "PEEL", "PEAT", "WAIL", "WEEK",
]

# D12: R-Controlled Vowels — real words covering ar, or, er, ir, ur
D12_WORDS = [
    "BAR",   "CAR",   "DARK",  "FARM",  "HARM",  "JAR",   "PARK",  "SCAR",  "STAR",  "BARK",
    "BORN",  "CORN",  "CORD",  "FORM",  "HORN",  "PORT",  "SORT",  "WORD",  "FORK",  "SPORT",
    "FERN",  "GERM",  "HER",   "HERD",  "PERK",  "TERM",  "VERB",  "PERM",  "STERN", "SERVE",
    "BIRD",  "DIRT",  "FIRM",  "GIRL",  "SHIRT", "STIR",  "SKIRT", "SWIRL", "TWIRL", "WHIRL",
    "BURN",  "CURL",  "HURT",  "PURSE", "TURN",  "FUR",   "SURF",  "TURF",  "BURP",  "CURE",
]

# ── Helper: derive metadata from replacement word ─────────────────────────────

def get_long_vowel(word: str) -> str:
    """Extract the long vowel label for a silent-E word (e.g. BAKE → 'long a')."""
    w = word.upper().rstrip("E")
    for c in reversed(w):
        if c in "AEIOU":
            return f"long {c.lower()}"
    return "long a"

def get_vowel_team(word: str) -> str:
    """Extract the vowel team label (e.g. RAIN → 'ai')."""
    w = word.upper()
    for team in ["OO", "OA", "EA", "EE", "AI", "OI"]:
        if team in w:
            return team.lower()
    return "ea"

def get_r_pattern(word: str) -> str:
    """Extract the r-controlled pattern label (e.g. FARM → 'ar')."""
    w = word.upper()
    for pattern in ["UR", "IR", "ER", "OR", "AR"]:
        if pattern in w:
            return pattern.lower()
    return "ar"

# ── Main fix ──────────────────────────────────────────────────────────────────

fixed = 0
encoding_fixes = 0

for i in range(1, 51):
    path = os.path.join(BANK_DIR, f"{i}.json")

    with open(path, "r", encoding="utf-8") as f:
        raw = f.read()

    # 1. Fix mojibake — UTF-8 bytes (E2 80 xx) were decoded as Windows-1252,
    #    producing 3-character sequences instead of the intended single character.
    #    E2→\u00e2  80→\u20ac  then the third byte varies:
    original = raw
    raw = raw.replace("\u00e2\u20ac\u00a2", "\u2022")  # E2 80 A2 → • (BULLET)
    raw = raw.replace("\u00e2\u20ac\u201d", "\u2013")  # E2 80 93 → – (EN DASH)
    raw = raw.replace("\u00e2\u20ac\u2122", "\u2019")  # E2 80 99 → ' (RIGHT SINGLE QUOTE)
    raw = raw.replace("\u00e2\u20ac\u02dc", "\u2018")  # E2 80 98 → ' (LEFT SINGLE QUOTE)
    raw = raw.replace("\u00e2\u20ac\u0153", "\u201c")  # E2 80 9C → " (LEFT DOUBLE QUOTE)
    raw = raw.replace("\u00e2\u20ac\u009d", "\u201d")  # E2 80 9D → " (RIGHT DOUBLE QUOTE)
    if raw != original:
        encoding_fixes += 1

    data = json.loads(raw)

    for task in data:
        task_id = task.get("id", "")

        # 2. Fix D09 — replace all 50 words (guarantees no pseudo-words in any paper)
        if task_id == "D09":
            word = D09_WORDS[i - 1]
            task["displayWord"] = word
            task["expectedAnswer"] = word.lower()
            task["vowelPattern"] = get_long_vowel(word)
            fixed += 1

        # 3. Fix D10 — replace all 50 words
        elif task_id == "D10":
            word = D10_WORDS[i - 1]
            task["displayWord"] = word
            task["expectedAnswer"] = word.lower()
            task["vowelTeam"] = get_vowel_team(word)
            fixed += 1

        # 4. Fix D12 — replace all 50 words
        elif task_id == "D12":
            word = D12_WORDS[i - 1]
            task["displayWord"] = word
            task["expectedAnswer"] = word.lower()
            task["rControlledPattern"] = get_r_pattern(word)
            fixed += 1

    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

print(f"Done. {encoding_fixes} files had encoding fixes. {fixed} task words replaced across D09/D10/D12.")
