import random

QUESTION_BANK = [
    {"id": 0, "text": "Citește cu voce tare: «Bună ziua, numele meu este...»"},
    {"id": 1, "text": "Citește rar și clar: «Soarele strălucește peste munți și văi»"},
    {"id": 2, "text": "Rostește apăsat: «Vremea schimbătoare aduce furtuni puternice»"},
    {"id": 3, "text": "Spune rar: «Cinci sute șaizeci și trei de pași până acasă»"},
    {"id": 4, "text": "Citește cu voce normală: «Ploaia cade lin pe câmpie și pe ape»"},
    {"id": 5, "text": "Rostește clar: «Orașul vechi păstrează amintiri și legende»"},
    {"id": 6, "text": "Spune rar și distinct: «Familia mea trăiește liniștit la țară»"},
]


def select_enrollment_questions(n: int = 4) -> list[dict]:
    return random.sample(QUESTION_BANK, min(n, len(QUESTION_BANK)))


def random_question() -> dict:
    return random.choice(QUESTION_BANK)
