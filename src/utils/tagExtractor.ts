import { TAG_DATA } from '../data/tags';

/**
 * 스킬 설명에서 태그를 자동으로 추출합니다.
 * @param skillName 스킬 이름
 * @param skillDesc 스킬 설명
 * @returns 추출된 태그 배열
 */
export function extractTagsFromSkill(skillName: string, skillDesc: string): string[] {
    // 모든 태그 목록 수집
    const allTags: string[] = [];
    for (const group of Object.values(TAG_DATA.tag_groups)) {
        allTags.push(...group.tags);
    }

    // 중복 제거
    const uniqueTags = Array.from(new Set(allTags));

    // 스킬 이름과 설명을 합친 텍스트
    const fullText = `${skillName} ${skillDesc}`;

    // 매칭된 태그 저장
    const matchedTags: string[] = [];

    // 각 태그에 대해 검색
    for (const tag of uniqueTags) {
        // 태그에서 특수 문자 제거 (▲, ▼ 등)
        const cleanTag = tag.replace(/[▲▼]/g, '').trim();
        
        // 정규식 패턴 생성 (대소문자 무시)
        const pattern = new RegExp(cleanTag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
        
        // 텍스트에서 태그 검색
        if (pattern.test(fullText)) {
            matchedTags.push(tag);
        }
    }

    return matchedTags;
}






