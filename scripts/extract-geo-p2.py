import fitz
import re

def extract_section_a(pdf_path):
    doc = fitz.open(pdf_path)
    full_text = ""
    for i in range(doc.page_count):
        full_text += f"\n<<<PAGE {i+1}>>>\n"
        full_text += doc[i].get_text()
    doc.close()
    sec_b = re.search(r'SECTION\s+B', full_text, re.IGNORECASE)
    if sec_b:
        full_text = full_text[:sec_b.start()]
    return full_text

for year in ['2023', '2024', '2025']:
    qp = extract_section_a(rf'C:\Users\rrazz\Downloads\Geography P2 May-June {year} Eng.pdf')
    mg = extract_section_a(rf'C:\Users\rrazz\Downloads\Geography P2 May-June {year} MG Eng.pdf')

    with open(rf'C:\Users\rrazz\Downloads\geo-p2-{year}-qp.txt', 'w', encoding='utf-8') as f:
        f.write(qp)
    with open(rf'C:\Users\rrazz\Downloads\geo-p2-{year}-mg.txt', 'w', encoding='utf-8') as f:
        f.write(mg)
    print(f'{year} QP: {len(qp)} chars | MG: {len(mg)} chars')
