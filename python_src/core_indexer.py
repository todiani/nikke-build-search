# core_indexer.py
from collections import defaultdict

class TagIndexer:
    def __init__(self):
        # char_name -> set of tags
        self.char_to_tags = defaultdict(set)
        # tag -> set of char_names (역색인)
        self.tag_to_chars = defaultdict(set)
        
        # 정밀 검색용 (스킬 단위 인덱스)
        # char_name -> { 'skill1': set(), 'skill2': set(), 'burst': set() }
        self.char_skill_tags = defaultdict(lambda: defaultdict(set))

    def build_index(self, database):
        """데이터베이스를 기반으로 인덱스를 생성합니다."""
        self.char_to_tags.clear()
        self.tag_to_chars.clear()
        self.char_skill_tags.clear()

        for char in database:
            name = char.get("nikke_name")
            if not name: continue

            skills = char.get("skills", {})
            all_tags_for_char = set()

            for sk_key in ["skill1", "skill2", "burst"]:
                skill_data = skills.get(sk_key, {})
                tags = set(skill_data.get("tags", []))
                
                # 스킬별 태그 저장
                self.char_skill_tags[name][sk_key] = tags
                
                # 캐릭터 전체 태그 통합
                all_tags_for_char.update(tags)

            self.char_to_tags[name] = all_tags_for_char
            
            # 역색인 구성
            for t in all_tags_for_char:
                self.tag_to_chars[t].add(name)

    def search(self, tags_and, tags_or, tags_not, strict_mode=False):
        """
        태그 조건에 맞는 니케 이름의 집합(Set)을 반환합니다.
        strict_mode=True일 경우, '단일 스킬 내'에서 AND 조건을 만족해야 합니다.
        """
        # 1. 초기 후보군 설정 (전체 니케)
        candidates = set(self.char_to_tags.keys())

        # 2. NOT 조건 처리 (제일 먼저 제거)
        if tags_not:
            for t in tags_not:
                chars_with_tag = self.tag_to_chars.get(t, set())
                candidates -= chars_with_tag

        # 3. AND 조건 처리
        if tags_and:
            if strict_mode:
                # 정밀 모드: 한 스킬 안에 모든 AND 태그가 다 있어야 함
                strict_candidates = set()
                for name in candidates:
                    skill_map = self.char_skill_tags[name]
                    # 1, 2, 버스트 중 하나라도 AND 태그 전부를 포함하는 스킬이 있는지 확인
                    for sk_tags in skill_map.values():
                        if set(tags_and).issubset(sk_tags):
                            strict_candidates.add(name)
                            break
                candidates &= strict_candidates
            else:
                # 일반 모드: 캐릭터가 가진 전체 태그 중에 있으면 됨
                for t in tags_and:
                    chars_with_tag = self.tag_to_chars.get(t, set())
                    candidates &= chars_with_tag

        # 4. OR 조건 처리
        if tags_or:
            or_candidates = set()
            for t in tags_or:
                chars_with_tag = self.tag_to_chars.get(t, set())
                or_candidates |= chars_with_tag
            
            # 기존 후보군과 OR 후보군의 교집합 (AND 조건도 만족하고 OR 조건도 만족해야 하므로)
            # 만약 AND 조건이 없었다면 candidates는 전체였으므로 필터링 효과
            # UI 로직상: (AND조건들) 그리고 (OR조건들 중 하나) 가 일반적임
            candidates &= or_candidates

        return candidates