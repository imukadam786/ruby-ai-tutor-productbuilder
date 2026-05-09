import json, sys
sys.stdout.reconfigure(encoding='utf-8')

with open(r"C:\Users\rrazz\Desktop\ai-tutor\data\question-bank.json", encoding='utf-8') as f:
    data = json.load(f)

m_scale = {
    "title": "Multiplication as Scaling",
    "gate": "B",
    "skill_ids": ["L6.T1.A1"],
    "pass_threshold": 0.8,
    "questions_for_mastery": 3,
    "questions": [
        {
            "ref": "SC.1",
            "question": "A ribbon is 5 cm long. A second ribbon is 3 times as long. How long is the second ribbon?",
            "expected": "15",
            "input_type": "numeric",
            "difficulty": 1,
            "error_signals": ["ERR_ADD_NOT_MULT", "ERR_ARITH"],
            "ruby_prompt": "Multiply: 5 \u00d7 3 = 15 cm."
        },
        {
            "ref": "SC.2",
            "question": "Tom has 4 stickers. Jane has 5 times as many. How many stickers does Jane have?",
            "expected": "20",
            "input_type": "numeric",
            "difficulty": 1,
            "error_signals": ["ERR_ADD_NOT_MULT", "ERR_ARITH"],
            "ruby_prompt": "Multiply: 4 \u00d7 5 = 20 stickers."
        },
        {
            "ref": "SC.3",
            "question": "A worm is 6 cm long. A snake is 4 times as long. How long is the snake?",
            "expected": "24",
            "input_type": "numeric",
            "difficulty": 1,
            "error_signals": ["ERR_ADD_NOT_MULT", "ERR_ARITH"],
            "ruby_prompt": "Multiply: 6 \u00d7 4 = 24 cm."
        },
        {
            "ref": "SC.4",
            "question": "A plant is 3 cm tall. After two weeks it is 6 times as tall. How tall is the plant now?",
            "expected": "18",
            "input_type": "numeric",
            "difficulty": 1,
            "error_signals": ["ERR_ADD_NOT_MULT", "ERR_ARITH"],
            "ruby_prompt": "Multiply: 3 \u00d7 6 = 18 cm."
        },
        {
            "ref": "SC.5",
            "question": "Ben runs 5 km. Sara runs 3 times as far. How far does Sara run?",
            "expected": "15",
            "input_type": "numeric",
            "difficulty": 1,
            "error_signals": ["ERR_ADD_NOT_MULT", "ERR_ARITH"],
            "ruby_prompt": "Multiply: 5 \u00d7 3 = 15 km."
        },
        {
            "ref": "SC.6",
            "question": "A box weighs 4 kg. A second box is 5 times as heavy. How heavy is the second box?",
            "expected": "20",
            "input_type": "numeric",
            "difficulty": 1,
            "error_signals": ["ERR_ADD_NOT_MULT", "ERR_ARITH"],
            "ruby_prompt": "Multiply: 4 \u00d7 5 = 20 kg."
        },
        {
            "ref": "SC.7",
            "question": "Lily has 7 books. Max has 4 times as many. How many books does Max have?",
            "expected": "28",
            "input_type": "numeric",
            "difficulty": 1,
            "error_signals": ["ERR_ADD_NOT_MULT", "ERR_ARITH"],
            "ruby_prompt": "Multiply: 7 \u00d7 4 = 28 books."
        },
        {
            "ref": "SC.8",
            "question": "A pencil is 9 cm long. A ruler is 2 times as long. How long is the ruler?",
            "expected": "18",
            "input_type": "numeric",
            "difficulty": 1,
            "error_signals": ["ERR_ADD_NOT_MULT", "ERR_ARITH"],
            "ruby_prompt": "Multiply: 9 \u00d7 2 = 18 cm."
        },
        {
            "ref": "SC.9",
            "question": "Sam has \u00a33. Ella has 8 times as much money. How much does Ella have?",
            "expected": "24",
            "input_type": "numeric",
            "difficulty": 1,
            "error_signals": ["ERR_ADD_NOT_MULT", "ERR_ARITH"],
            "ruby_prompt": "Multiply: 3 \u00d7 8 = \u00a324."
        },
        {
            "ref": "SC.10",
            "question": "A car travels 8 km. A train travels 6 times as far. How far does the train travel?",
            "expected": "48",
            "input_type": "numeric",
            "difficulty": 2,
            "error_signals": ["ERR_ADD_NOT_MULT", "ERR_ARITH"],
            "ruby_prompt": "Multiply: 8 \u00d7 6 = 48 km."
        },
        {
            "ref": "SC.11",
            "question": "A pond is 12 m wide. A lake is 5 times as wide. How wide is the lake?",
            "expected": "60",
            "input_type": "numeric",
            "difficulty": 2,
            "error_signals": ["ERR_ADD_NOT_MULT", "ERR_ARITH"],
            "ruby_prompt": "Multiply: 12 \u00d7 5 = 60 m."
        },
        {
            "ref": "SC.12",
            "question": "A tree is 15 m tall. A building is 3 times as tall. How tall is the building?",
            "expected": "45",
            "input_type": "numeric",
            "difficulty": 2,
            "error_signals": ["ERR_ADD_NOT_MULT", "ERR_ARITH"],
            "ruby_prompt": "Multiply: 15 \u00d7 3 = 45 m."
        },
        {
            "ref": "SC.13",
            "question": "Josh saved \u00a325. His sister saved 4 times as much. How much did his sister save?",
            "expected": "100",
            "input_type": "numeric",
            "difficulty": 2,
            "error_signals": ["ERR_ADD_NOT_MULT", "ERR_ARITH"],
            "ruby_prompt": "Multiply: 25 \u00d7 4 = \u00a3100."
        },
        {
            "ref": "SC.14",
            "question": "A jar holds 250 ml. A bottle holds 3 times as much. How much does the bottle hold?",
            "expected": "750",
            "input_type": "numeric",
            "difficulty": 2,
            "error_signals": ["ERR_ADD_NOT_MULT", "ERR_ARITH"],
            "ruby_prompt": "Multiply: 250 \u00d7 3 = 750 ml."
        },
        {
            "ref": "SC.15",
            "question": "A field is 14 m long. A park is 5 times as long. How long is the park?",
            "expected": "70",
            "input_type": "numeric",
            "difficulty": 2,
            "error_signals": ["ERR_ADD_NOT_MULT", "ERR_ARITH"],
            "ruby_prompt": "Multiply: 14 \u00d7 5 = 70 m."
        },
        {
            "ref": "SC.16",
            "question": "A brick weighs 3 kg. A stone is 7 times as heavy. How heavy is the stone?",
            "expected": "21",
            "input_type": "numeric",
            "difficulty": 1,
            "error_signals": ["ERR_ADD_NOT_MULT", "ERR_ARITH"],
            "ruby_prompt": "Multiply: 3 \u00d7 7 = 21 kg."
        },
        {
            "ref": "SC.17",
            "question": "A caterpillar is 8 cm long. A stick insect is 6 times as long. How long is the stick insect?",
            "expected": "48",
            "input_type": "numeric",
            "difficulty": 2,
            "error_signals": ["ERR_ADD_NOT_MULT", "ERR_ARITH"],
            "ruby_prompt": "Multiply: 8 \u00d7 6 = 48 cm."
        },
        {
            "ref": "SC.18",
            "question": "A model car is 16 cm long. The real car is 10 times as long. How long is the real car in cm?",
            "expected": "160",
            "input_type": "numeric",
            "difficulty": 2,
            "error_signals": ["ERR_ADD_NOT_MULT", "ERR_ARITH"],
            "ruby_prompt": "Multiply: 16 \u00d7 10 = 160 cm."
        },
        {
            "ref": "SC.19",
            "question": "A small box has 24 tiles. A larger box has 3 times as many. How many tiles are in the larger box?",
            "expected": "72",
            "input_type": "numeric",
            "difficulty": 2,
            "error_signals": ["ERR_ADD_NOT_MULT", "ERR_ARITH"],
            "ruby_prompt": "Multiply: 24 \u00d7 3 = 72 tiles."
        },
        {
            "ref": "SC.20",
            "question": "A baby weighs 4 kg at birth. By age 1 the baby weighs 3 times as much. How much does the baby weigh?",
            "expected": "12",
            "input_type": "numeric",
            "difficulty": 1,
            "error_signals": ["ERR_ADD_NOT_MULT", "ERR_ARITH"],
            "ruby_prompt": "Multiply: 4 \u00d7 3 = 12 kg."
        },
        {
            "ref": "SC.21",
            "question": "A small pipe carries 6 litres per minute. A large pipe carries 8 times as much. How many litres per minute does the large pipe carry?",
            "expected": "48",
            "input_type": "numeric",
            "difficulty": 2,
            "error_signals": ["ERR_ADD_NOT_MULT", "ERR_ARITH"],
            "ruby_prompt": "Multiply: 6 \u00d7 8 = 48 litres per minute."
        },
        {
            "ref": "SC.22",
            "question": "A blue rod is 9 cm. A red rod is 5 times as long. How long is the red rod?",
            "expected": "45",
            "input_type": "numeric",
            "difficulty": 1,
            "error_signals": ["ERR_ADD_NOT_MULT", "ERR_ARITH"],
            "ruby_prompt": "Multiply: 9 \u00d7 5 = 45 cm."
        },
        {
            "ref": "SC.23",
            "question": "One bag holds 7 kg of sand. Another bag holds 6 times as much. How many kg does the second bag hold?",
            "expected": "42",
            "input_type": "numeric",
            "difficulty": 2,
            "error_signals": ["ERR_ADD_NOT_MULT", "ERR_ARITH"],
            "ruby_prompt": "Multiply: 7 \u00d7 6 = 42 kg."
        },
        {
            "ref": "SC.24",
            "question": "A shelf holds 18 books. A bookcase holds 4 times as many. How many books can the bookcase hold?",
            "expected": "72",
            "input_type": "numeric",
            "difficulty": 2,
            "error_signals": ["ERR_ADD_NOT_MULT", "ERR_ARITH"],
            "ruby_prompt": "Multiply: 18 \u00d7 4 = 72 books."
        },
        {
            "ref": "SC.25",
            "question": "A tree grew 11 cm in spring. It grew 3 times as much in summer. How many cm did it grow in summer?",
            "expected": "33",
            "input_type": "numeric",
            "difficulty": 2,
            "error_signals": ["ERR_ADD_NOT_MULT", "ERR_ARITH"],
            "ruby_prompt": "Multiply: 11 \u00d7 3 = 33 cm."
        }
    ]
}

data['domains']['M_SCALE'] = m_scale

with open(r"C:\Users\rrazz\Desktop\ai-tutor\data\question-bank.json", 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

# Verify
d = data['domains']['M_SCALE']
print(f"M_SCALE added: {len(d['questions'])} questions, skill_ids={d['skill_ids']}")
