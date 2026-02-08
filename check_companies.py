import json

# 파일 읽기
with open('public/data/nikke_db.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# 알 수 없는 니케 찾기 (제조사가 엘리시온이 아닌 경우 확인)
companies = {}
for nikke in data['nikkes']:
    company = nikke.get('company', 'Unknown')
    if company not in companies:
        companies[company] = []
    companies[company].append(nikke['name'])

# 제조사별 분포 출력
print("제조사별 니케 수:")
for company, nikkes in sorted(companies.items()):
    print(f"\n{company} ({len(nikkes)}명):")
    # 처음 10개만 출력
    for name in nikkes[:10]:
        print(f"  - {name}")
    if len(nikkes) > 10:
        print(f"  ... 외 {len(nikkes) - 10}명")
