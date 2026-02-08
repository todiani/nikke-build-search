const fs = require('fs');
const path = require('path');

// Use process.cwd() for path resolution
// Assuming I run from project root
const rawDataPath = path.join(process.cwd(), 'raw_data.txt');
console.log('Reading from:', rawDataPath);

try {
    const rawData = fs.readFileSync(rawDataPath, 'utf-8');
    const lines = rawData.split('\n');

    // Metadata map
    const metadata = {
        // SSS
        "라피 : 레드 후드": { id: "red_hood", name_en: "Red Hood", tier: "SSS", burst: "III", class: "Attacker", weapon: "SR" },
        "신데렐라": { id: "cinderella", name_en: "Cinderella", tier: "SSS", burst: "III", class: "Defender", weapon: "RL" },
        "홍련 : 흑영": { id: "scarlet_bs", name_en: "Scarlet: Black Shadow", tier: "SSS", burst: "III", class: "Attacker", weapon: "RL" },
        "크라운": { id: "crown", name_en: "Crown", tier: "SSS", burst: "II", class: "Defender", weapon: "MG" },
        "리타": { id: "liter", name_en: "Liter", tier: "SSS", burst: "I", class: "Supporter", weapon: "SMG" },
        "모더니아": { id: "modernia", name_en: "Modernia", tier: "SSS", burst: "III", class: "Attacker", weapon: "MG" },

        // SS
        "도로시 : 세렌디피티": { id: "dorothy_skin", name_en: "Dorothy: Serendipity", tier: "SS", burst: "I", class: "Supporter", weapon: "AR" },
        "도로시": { id: "dorothy", name_en: "Dorothy", tier: "SS", burst: "I", class: "Supporter", weapon: "AR" },
        "블랑": { id: "blanc", name_en: "Blanc", tier: "SS", burst: "II", class: "Supporter", weapon: "AR" },
        "누아르": { id: "noir", name_en: "Noir", tier: "SS", burst: "III", class: "Attacker", weapon: "SG" },
        "티아": { id: "tia", name_en: "Tia", tier: "SS", burst: "I", class: "Defender", weapon: "RL" },
        "나가": { id: "naga", name_en: "Naga", tier: "SS", burst: "II", class: "Supporter", weapon: "SG" },
        "아니스 : 스파클링 서머": { id: "s_anis", name_en: "Anis: Sparkling Summer", tier: "SS", burst: "III", class: "Supporter", weapon: "SG" },
        "홍련": { id: "scarlet", name_en: "Scarlet", tier: "SS", burst: "III", class: "Attacker", weapon: "AR" },
        "앨리스": { id: "alice", name_en: "Alice", tier: "SS", burst: "III", class: "Attacker", weapon: "SR" },
        "리틀 머메이드": { id: "little_mermaid", name_en: "Little Mermaid", tier: "SS", burst: "II", class: "Supporter", weapon: "AR" },
        "D : 킬러 와이프": { id: "killer_d", name_en: "D: Killer Wife", tier: "SS", burst: "I", class: "Supporter", weapon: "SR" },
        "나유타": { id: "nayuta", name_en: "Nayuta", tier: "SS", burst: "II", class: "Supporter", weapon: "MG" },

        // S / General
        "아인": { id: "ein", name_en: "Ein", tier: "S", burst: "III", class: "Attacker", weapon: "SR" },
        "맥스웰": { id: "maxwell", name_en: "Maxwell", tier: "S", burst: "III", class: "Attacker", weapon: "SR" },
        "프리바티": { id: "privaty", name_en: "Privaty", tier: "S", burst: "III", class: "Attacker", weapon: "AR" },
        "라푼젤": { id: "rapunzel", name_en: "Rapunzel", tier: "S", burst: "I", class: "Supporter", weapon: "RL" },
        "루드밀라 : 윈터 오너": { id: "x_ludmilla", name_en: "Ludmilla: Winter Owner", tier: "S", burst: "III", class: "Attacker", weapon: "MG" },
        "헬름 ( 애장품 )": { id: "helm_item", name_en: "Helm (Favorite Item)", tier: "S", burst: "III", class: "Attacker", weapon: "SR" },
        "헬름 : 아쿠아 마린": { id: "s_helm", name_en: "Helm: Aquamarine", tier: "S", burst: "II", class: "Attacker", weapon: "AR" },
        "마르차나": { id: "marciana", name_en: "Marciana", tier: "S", burst: "II", class: "Supporter", weapon: "SG" },
        "그레이브": { id: "grave", name_en: "Grave", tier: "S", burst: "II", class: "Supporter", weapon: "AR" },
        "팬텀": { id: "phantom", name_en: "Phantom", tier: "S", burst: "III", class: "Attacker", weapon: "AR" },
        "이사벨": { id: "isabel", name_en: "Isabel", tier: "A", burst: "III", class: "Attacker", weapon: "SG" },

        // PvP
        "자칼": { id: "jackal", name_en: "Jackal", tier: "PvP", burst: "I", class: "Defender", weapon: "RL" },
        "비스킷": { id: "biscuit", name_en: "Biscuit", tier: "PvP", burst: "II", class: "Supporter", weapon: "RL" },
        "노아": { id: "noah", name_en: "Noah", tier: "PvP", burst: "II", class: "Defender", weapon: "RL" },
        "로산나": { id: "rosanna", name_en: "Rosanna", tier: "PvP", burst: "I", class: "Attacker", weapon: "MG" },
        "사쿠라": { id: "sakura", name_en: "Sakura", tier: "A", burst: "I", class: "Supporter", weapon: "SR" },
        "목단": { id: "moran", name_en: "Moran", tier: "PvP", burst: "I", class: "Defender", weapon: "AR" },
        "모란": { id: "moran", name_en: "Moran", tier: "PvP", burst: "I", class: "Defender", weapon: "AR" },
        "네로": { id: "nero", name_en: "Nero", tier: "PvP", burst: "II", class: "Defender", weapon: "SMG" },
        "베이 ( 애장품 )": { id: "bay", name_en: "Bay", tier: "PvP", burst: "II", class: "Defender", weapon: "RL" },
        "클레이": { id: "clay", name_en: "Clay", tier: "A", burst: "II", class: "Defender", weapon: "SMG" },
    };

    function guessMeta(name) {
        const key = name.trim();
        if (metadata[key]) return metadata[key];

        // Fix: Ensure unique ID for unknown characters
        // Using simple hash-like replacement or encoding
        const safeId = 'gen_' + Buffer.from(key).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

        return {
            id: safeId,
            name_en: key,
            tier: "A",
            burst: "II",
            class: "Attacker",
            weapon: "AR"
        };
    }

    const entries = [];
    const seenIds = new Set();

    let currentName = null;
    let currentCubes = [];

    const SKIP_KEYWORDS = ['높음', '보통', '낮음', '스킬', '오버로드', '우선순위', '모듈', '투자', '우월코드', '공격력', '장탄', '차지', '크리티컬', '명중률', '가성비', '종결'];

    for (let i = 0; i < lines.length; i++) {
        const rawLine = lines[i];
        const parts = rawLine.split('\t').map(s => s.trim()).filter(s => s.length > 0);

        // Skip empty or header-like lines
        if (parts.length === 0) continue;
        if (parts[0] === '소속' || parts[0].includes('1스킬') || parts[0].includes('스킬작')) continue;

        const firstPartIsNumber = /^[0-9]+$/.test(parts[0]);

        if (!firstPartIsNumber) {
            // Name Candidate
            const candidateName = parts[0];

            // Strict filtering
            if (candidateName.length > 30) continue; // Too long for a name
            if (candidateName.includes(':') && candidateName.includes('투자')) continue; // "낮음 : 모듈 투자 X" type lines
            if (SKIP_KEYWORDS.some(kw => candidateName.includes(kw))) continue;

            currentName = candidateName;
            currentCubes = parts.slice(1).filter(p => p.includes('베어') || p.includes('부스트') || p.includes('큐브') || p.includes('어썰트') || p.includes('퀀텀'));
        } else if (currentName && firstPartIsNumber) {
            // Stats Line for the detected name
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

            // Extract Options & Desc
            const remainder = parts.slice(idx);
            let optionsStr = "";
            let descStr = remainder.join('\n'); // Default fallback

            const optIdx = remainder.findIndex(p => p.includes('우월코드') || p.includes('공격력') || (p.includes('장탄') && !p.includes('기믹')) || p.includes('차지') || p.includes('명중') || p.includes('크리티컬'));

            if (optIdx !== -1) {
                optionsStr = remainder[optIdx];
                if (remainder.length > optIdx + 1) {
                    descStr = remainder.slice(optIdx + 1).join('\n');
                } else {
                    descStr = ""; // No description after options
                }
            }

            const cleanOptions = optionsStr.replace(/"/g, '').split(/[\/\n]/).map(s => s.trim()).filter(s => s);
            let priority = "버스트 > 1스 = 2스";
            const prioMatch = descStr.match(/스킬 우선순위[:\s]+([^(\n|")]*)/);
            if (prioMatch) priority = prioMatch[1].trim();

            const meta = guessMeta(currentName);

            // Deduplication check
            if (!seenIds.has(meta.id)) {
                seenIds.add(meta.id);

                const nikke = {
                    id: meta.id,
                    name: currentName,
                    name_en: meta.name_en,
                    tier: meta.tier,
                    burst: meta.burst,
                    class: meta.class,
                    weapon: meta.weapon,
                    skill_priority: priority,
                    skills: { min: effInv, efficient: effInv, max: maxInv },
                    options: cleanOptions,
                    cube: currentCubes.join(', ') || '렐릭 베어',
                    desc: descStr.replace(/"/g, '').replace(/스킬 우선순위:[^\n]*\n?/, '').trim()
                };
                entries.push(nikke);
            }

            currentName = null;
        }
    }

    const outputContent = `export interface NikkeData {
  id: string;
  name: string;
  name_en: string;
  tier: "SSS" | "SS" | "S" | "A" | "PvP" | "Unranked";
  burst: "I" | "II" | "III";
  class: "Attacker" | "Supporter" | "Defender";
  weapon: "AR" | "SR" | "SG" | "SMG" | "RL" | "MG";
  skill_priority: string;
  skills: {
    min: string;
    efficient: string;
    max: string;
  };
  options: string[];
  cube: string;
  desc: string;
}

export const nikkes: NikkeData[] = ${JSON.stringify(entries, null, 2)};
`;

    fs.writeFileSync(path.join(process.cwd(), 'src/data/nikkes.ts'), outputContent);
    console.log(`Successfully generated ${entries.length} nikkes to src/data/nikkes.ts`);

} catch (err) {
    console.error('Error:', err);
    process.exit(1);
}
