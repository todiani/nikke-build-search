import json
db_path = r'r:\AI\nikke-build-search\python_src\nikkedatabase.json'
with open(db_path, 'r', encoding='utf-8') as f:
    db = json.load(f)

for char in db:
    if char.get('nikke_name') == '라피 : 레드 후드':
        print(f"Nikke: {char['nikke_name']}")
        print(json.dumps(char.get('user_data', {}).get('options', {}), indent=2, ensure_ascii=False))
