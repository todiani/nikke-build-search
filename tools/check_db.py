#!/usr/bin/env python
# -*- coding: utf-8 -*-
import json
import os

INPUT_FILE = os.path.join(os.path.dirname(__file__), '../public/data/nikke_db.json')

with open(INPUT_FILE, 'r', encoding='utf-8') as f:
    data = json.load(f)

print(f"Total entries: {len(data)}")
print("\nFirst 15 entries:")
for n in data[:15]:
    extra = n.get('extra_info', '')
    extra_str = f" [{extra}]" if extra else ""
    print(f"  {n['name']}{extra_str}")
    
print("\n중복 확인:")
names = [n['name'] for n in data]
unique_names = set(names)
if len(names) != len(unique_names):
    print(f"  중복 발견: {len(names) - len(unique_names)} 개")
else:
    print("  중복 없음!")
