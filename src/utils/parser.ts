import type { NikkeData } from '../data/nikkes';

const SKIP_KEYWORDS = ['높음', '보통', '낮음', '스킬', '오버로드', '우선순위', '모듈', '투자', '우월코드', '공격력', '장탄', '차지', '크리티컬', '명중률', '가성비', '종결'];

export function parseNikkeData(rawData: string): NikkeData[] {
    const lines = rawData.split('\n');
    const entries: NikkeData[] = [];
    const seenIds = new Set<string>();

    let currentName: string | null = null;
    let currentCubes: string[] = [];

    for (let i = 0; i < lines.length; i++) {
        const rawLine = lines[i];
        const parts = rawLine.split('\t').map(s => s.trim()).filter(s => s.length > 0);

        if (parts.length === 0) continue;
        if (parts[0] === '소속' || parts[0].includes('1스킬') || parts[0].includes('스킬작')) continue;

        const firstPartIsNumber = /^[0-9]+$/.test(parts[0]);

        if (!firstPartIsNumber) {
            // Name Candidate
            const candidateName = parts[0];

            if (candidateName.length > 30) continue;
            if (candidateName.includes(':') && candidateName.includes('투자')) continue;
            if (SKIP_KEYWORDS.some(kw => candidateName.includes(kw))) continue;

            currentName = candidateName;
            currentCubes = parts.slice(1).filter(p => p.includes('베어') || p.includes('부스트') || p.includes('큐브') || p.includes('어썰트') || p.includes('퀀텀'));
        } else if (currentName && firstPartIsNumber) {
            // Stats Line
            let effInv = "4/4/4";
            let maxInv = "10/10/10";

            const nums = [];
            let idx = 0;
            while (idx < parts.length && /^[0-9]+$/.test(parts[idx])) {
                nums.push(parts[idx]);
                idx++;
            }

            if (nums.length >= 3) effInv = `${nums[0]}/${nums[1]}/${nums[2]}`;
            if (nums.length >= 6) maxInv = `${nums[3]}/${nums[4]}/${nums[5]}`;

            const remainder = parts.slice(idx);
            let optionsStr = "";
            let descStr = remainder.join('\n');

            const optIdx = remainder.findIndex(p => p.includes('우월코드') || p.includes('공격력') || (p.includes('장탄') && !p.includes('기믹')) || p.includes('차지') || p.includes('명중') || p.includes('크리티컬'));

            if (optIdx !== -1) {
                optionsStr = remainder[optIdx];
                if (remainder.length > optIdx + 1) {
                    descStr = remainder.slice(optIdx + 1).join('\n');
                } else {
                    descStr = "";
                }
            }

            const cleanOptions = optionsStr.replace(/"/g, '').split(/[/\n]/).map(s => s.trim()).filter(s => s);
            let priority = "버스트 > 1스 = 2스";
            const prioMatch = descStr.match(/스킬 우선순위[:\s]+([^(\n|")]*)/);
            if (prioMatch) priority = prioMatch[1].trim();

            // Meta Generation
            // Since we don't have the full metadata map in client-side constant (it's too huge), 
            // we might need to rely on "If known, good. If not, generate ID".
            // For a robust update system, the Source File should ideally be JSON. 
            // But user requested "document" (text). 
            // We will generate stable IDs based on Name.

            const safeId = 'gen_' + btoa(unescape(encodeURIComponent(currentName))).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

            // Try to find if we have existing static data to merge metadata (Tier, Class, etc)
            // This is a bit tricky client-side if we want to preserve file size.
            // We can assume the user accepts defaults for new chars, or update allows specific format.

            const nikke: NikkeData = {
                id: safeId,
                name: currentName,
                name_en: currentName, // Placeholder for EN name if not in lookup
                tier: "Unranked", // Default for new external data
                burst: "II",
                class: "Attacker",
                weapon: "AR",
                skill_priority: priority,
                skills: { min: effInv, efficient: effInv, max: maxInv },
                options: cleanOptions,
                cube: currentCubes.join(', ') || '렐릭 베어',
                desc: descStr.replace(/"/g, '').replace(/스킬 우선순위:[^\n]*\n?/, '').trim()
            };

            // Dedupe
            if (!seenIds.has(safeId)) {
                seenIds.add(safeId);
                entries.push(nikke);
            }
            currentName = null;
        }
    }
    return entries;
}
