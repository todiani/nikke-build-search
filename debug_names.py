import json
import os

db_path = r'r:\AI\nikke-build-search\python_src\nikkedatabase.json'
with open(db_path, 'r', encoding='utf-8') as f:
    db = json.load(f)

for char in db:
    name = char.get('nikke_name', '')
    if '라피' in name or '레드 후드' in name:
        print(f"Name: {repr(name)}")
        if 'user_data' in char:
            print(f"  Has user_data: {list(char['user_data'].keys())}")
            if 'options' in char['user_data']:
                print(f"  Options keys: {list(char['user_data']['options'].keys())}")
