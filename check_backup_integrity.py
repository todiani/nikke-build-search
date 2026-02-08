import json
import os
from datetime import datetime

# 백업 디렉터리
BACKUP_DIR = 'backups'
DB_PATH = 'public/data/nikke_db.json'

def check_backup_integrity():
    """최근 백업 파일들의 무결성 확인"""
    
    # 백업 파일 목록 가져오기 (최신순)
    backups = []
    for filename in os.listdir(BACKUP_DIR):
        if filename.startswith('nikke_db_') and filename.endswith('.json'):
            filepath = os.path.join(BACKUP_DIR, filename)
            stat = os.stat(filepath)
            backups.append({
                'filename': filename,
                'filepath': filepath,
                'size': stat.st_size,
                'mtime': stat.st_mtime
            })
    
    # 수정 시간 기준으로 정렬 (최신순)
    backups.sort(key=lambda x: x['mtime'], reverse=True)
    
    print("=== 최근 백업 파일 무결성 검사 ===\n")
    
    # 최근 10개 백업 확인
    for i, backup in enumerate(backups[:10], 1):
        print(f"\n[{i}] {backup['filename']}")
        print(f"    크기: {backup['size']:,} bytes ({backup['size'] / 1024:.1f} KB)")
        print(f"    수정 시간: {datetime.fromtimestamp(backup['mtime']).strftime('%Y-%m-%d %H:%M:%S')}")
        
        # JSON 유효성 확인
        try:
            with open(backup['filepath'], 'r', encoding='utf-8') as f:
                data = json.load(f)
                nikke_count = len(data.get('nikkes', []))
                
                # 제조사 분포 확인
                companies = {}
                bad_companies = 0
                for nikke in data.get('nikkes', []):
                    company = nikke.get('company', 'Unknown')
                    if company == '0' or not company or company == 0:
                        bad_companies += 1
                    else:
                        companies[company] = companies.get(company, 0) + 1
                
                print(f"    니케 수: {nikke_count}")
                print(f"    제조사 분포: {dict(list(companies.items())[:5])}...")
                if bad_companies > 0:
                    print(f"    ⚠️  잘못된 제조사: {bad_companies}개")
                else:
                    print(f"    ✅ 제조사 데이터 정상")
                    
        except Exception as e:
            print(f"    ❌ JSON 오류: {str(e)}")
    
    # 현재 DB 상태 확인
    print(f"\n\n=== 현재 DB 상태 ===")
    print(f"파일: {DB_PATH}")
    try:
        with open(DB_PATH, 'r', encoding='utf-8') as f:
            data = json.load(f)
            nikke_count = len(data.get('nikkes', []))
            
            companies = {}
            bad_companies = 0
            for nikke in data.get('nikkes', []):
                company = nikke.get('company', 'Unknown')
                if company == '0' or not company or company == 0:
                    bad_companies += 1
                else:
                    companies[company] = companies.get(company, 0) + 1
            
            print(f"니케 수: {nikke_count}")
            print(f"제조사 분포: {companies}")
            if bad_companies > 0:
                print(f"⚠️  잘못된 제조사: {bad_companies}개")
            else:
                print(f"✅ 제조사 데이터 정상")
                
    except Exception as e:
        print(f"❌ JSON 오류: {str(e)}")

if __name__ == '__main__':
    check_backup_integrity()
