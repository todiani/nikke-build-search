import json
import os

DB_PATH = 'public/data/nikke_db.json'
BACKUP_PATH = 'backups/nikke_db_2026-01-08T13-21-30-044Z.json'

# 예상되는 유효한 값들
VALID_COMPANIES = ['엘리시온', '미실리스', '테트라', '필그림', '어브노멀']
VALID_TIERS = ['SSS', 'SS', 'S', 'A', 'B', 'PvP', 'Unranked']
VALID_BURSTS = ['I', 'II', 'III', 'A']
VALID_CLASSES = ['화력형', '방어형', '지원형']
VALID_CODES = ['작열', '풍압', '철갑', '전격', '수냉']
VALID_WEAPONS = ['기관단총 (SMG)', '기관총 (MG)', '런처 (RL)', '샷건 (SG)', '소총 (AR)', '저격소총 (SR)']
VALID_RARITIES = ['SSR', 'SR', 'R']

def validate_db(filepath, label):
    """DB 파일의 무결성 검증"""
    print(f"\n{'='*80}")
    print(f"📊 {label} 검증 중...")
    print(f"{'='*80}\n")
    
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except Exception as e:
        print(f"❌ JSON 파일 읽기 실패: {e}")
        return
    
    nikkes = data.get('nikkes', [])
    print(f"총 니케 수: {len(nikkes)}\n")
    
    # 문제 카운터
    issues = {
        'missing_id': [],
        'missing_name': [],
        'invalid_company': [],
        'invalid_tier': [],
        'invalid_burst': [],
        'invalid_class': [],
        'invalid_code': [],
        'invalid_weapon': [],
        'invalid_rarity': [],
        'missing_skills_detail': [],
        'missing_usage_stats': [],
        'duplicate_ids': [],
        'duplicate_names': []
    }
    
    seen_ids = {}
    seen_names = {}
    
    for idx, nikke in enumerate(nikkes):
        name = nikke.get('name', f'[Index {idx}]')
        nikke_id = nikke.get('id', '')
        
        # ID 검증
        if not nikke_id:
            issues['missing_id'].append(name)
        elif nikke_id in seen_ids:
            issues['duplicate_ids'].append(f"{name} (ID: {nikke_id}, 중복: {seen_ids[nikke_id]})")
        else:
            seen_ids[nikke_id] = name
        
        # 이름 검증
        if not nikke.get('name'):
            issues['missing_name'].append(f"Index {idx}")
        elif name in seen_names:
            issues['duplicate_names'].append(f"{name} (중복)")
        else:
            seen_names[name] = True
        
        # 제조사 검증
        company = nikke.get('company', '')
        if company not in VALID_COMPANIES and company != '0':
            issues['invalid_company'].append(f"{name}: '{company}'")
        elif company == '0' or company == 0:
            issues['invalid_company'].append(f"{name}: 0 (손상됨)")
        
        # 티어 검증
        tier = nikke.get('tier', '')
        if tier not in VALID_TIERS:
            issues['invalid_tier'].append(f"{name}: '{tier}'")
        
        # 버스트 검증
        burst = nikke.get('burst', '')
        if burst not in VALID_BURSTS:
            issues['invalid_burst'].append(f"{name}: '{burst}'")
        
        # 클래스 검증
        class_type = nikke.get('class', '')
        if class_type not in VALID_CLASSES:
            issues['invalid_class'].append(f"{name}: '{class_type}'")
        
        # 속성 검증
        code = nikke.get('code', '')
        if code not in VALID_CODES:
            issues['invalid_code'].append(f"{name}: '{code}'")
        
        # 무기 검증
        weapon = nikke.get('weapon', '')
        if weapon not in VALID_WEAPONS:
            issues['invalid_weapon'].append(f"{name}: '{weapon}'")
        
        # 등급 검증
        rarity = nikke.get('rarity', '')
        if rarity and rarity not in VALID_RARITIES:
            issues['invalid_rarity'].append(f"{name}: '{rarity}'")
        
        # 스킬 상세 검증
        if not nikke.get('skills_detail'):
            issues['missing_skills_detail'].append(name)
        
        # 사용 통계 검증
        if not nikke.get('usage_stats') or len(nikke.get('usage_stats', [])) == 0:
            issues['missing_usage_stats'].append(name)
    
    # 결과 출력
    print(f"\n{'─'*80}")
    print("🔍 검증 결과:")
    print(f"{'─'*80}\n")
    
    total_issues = 0
    for issue_type, issue_list in issues.items():
        if issue_list:
            total_issues += len(issue_list)
            print(f"\n❌ {issue_type.replace('_', ' ').title()} ({len(issue_list)}개):")
            # 처음 10개만 출력
            for item in issue_list[:10]:
                print(f"   - {item}")
            if len(issue_list) > 10:
                print(f"   ... 외 {len(issue_list) - 10}개")
    
    if total_issues == 0:
        print("✅ 모든 검증 통과! DB 상태 정상입니다.")
    else:
        print(f"\n⚠️  총 {total_issues}개의 문제 발견")
    
    # 통계 요약
    print(f"\n{'─'*80}")
    print("📈 통계 요약:")
    print(f"{'─'*80}\n")
    
    # 제조사 분포
    company_dist = {}
    for nikke in nikkes:
        company = nikke.get('company', 'Unknown')
        company_dist[company] = company_dist.get(company, 0) + 1
    print("제조사 분포:")
    for company, count in sorted(company_dist.items(), key=lambda x: x[1], reverse=True):
        print(f"   {company}: {count}명")
    
    # 티어 분포
    tier_dist = {}
    for nikke in nikkes:
        tier = nikke.get('tier', 'Unknown')
        tier_dist[tier] = tier_dist.get(tier, 0) + 1
    print("\n티어 분포:")
    for tier, count in sorted(tier_dist.items(), key=lambda x: x[1], reverse=True):
        print(f"   {tier}: {count}명")
    
    return total_issues

def compare_dbs():
    """현재 DB와 백업 비교"""
    print(f"\n{'='*80}")
    print("🔄 현재 DB vs 백업 비교")
    print(f"{'='*80}\n")
    
    try:
        with open(DB_PATH, 'r', encoding='utf-8') as f:
            current = json.load(f)
        with open(BACKUP_PATH, 'r', encoding='utf-8') as f:
            backup = json.load(f)
        
        current_nikkes = current.get('nikkes', [])
        backup_nikkes = backup.get('nikkes', [])
        
        print(f"현재 DB: {len(current_nikkes)}명")
        print(f"백업 DB: {len(backup_nikkes)}명")
        print(f"차이: {len(current_nikkes) - len(backup_nikkes):+d}명\n")
        
        # 이름 기준 비교
        current_names = {n.get('name') for n in current_nikkes}
        backup_names = {n.get('name') for n in backup_nikkes}
        
        new_nikkes = current_names - backup_names
        removed_nikkes = backup_names - current_names
        
        if new_nikkes:
            print(f"✨ 새로 추가된 니케 ({len(new_nikkes)}명):")
            for name in sorted(new_nikkes):
                print(f"   + {name}")
        
        if removed_nikkes:
            print(f"\n🗑️  삭제된 니케 ({len(removed_nikkes)}명):")
            for name in sorted(removed_nikkes):
                print(f"   - {name}")
        
        if not new_nikkes and not removed_nikkes:
            print("ℹ️  니케 목록 동일")
            
    except Exception as e:
        print(f"❌ 비교 실패: {e}")

if __name__ == '__main__':
    # 현재 DB 검증
    current_issues = validate_db(DB_PATH, "현재 DB")
    
    # 백업 DB 검증
    if os.path.exists(BACKUP_PATH):
        backup_issues = validate_db(BACKUP_PATH, "백업 DB (2026-01-08)")
        
        # 비교
        compare_dbs()
    else:
        print(f"\n⚠️  백업 파일을 찾을 수 없습니다: {BACKUP_PATH}")
    
    print(f"\n{'='*80}")
    print("검증 완료")
    print(f"{'='*80}\n")
