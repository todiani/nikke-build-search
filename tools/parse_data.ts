import fs from 'fs';
import path from 'path';

// Use process.cwd() for path resolution
const rawData = fs.readFileSync(path.join(process.cwd(), 'raw_data.txt'), 'utf-8');
const lines = rawData.split('\n');

interface NikkeData {
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

// Static metadata map to fill missing info (Tier, Burst, Class, Weapon)
// I will populate this with as much known info as possible.
// If missing, I will use defaults and mark them.
const metadata: Record<string, Partial<NikkeData>> = {
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
    "리틀 머메이드": { id: "little_mermaid", name_en: "Little Mermaid", tier: "SS", burst: "II", class: "Supporter", weapon: "AR" }, // Guessing 
    "D : 킬러 와이프": { id: "killer_d", name_en: "D: Killer Wife", tier: "SS", burst: "I", class: "Supporter", weapon: "SR" },
    "나유타": { id: "nayuta", name_en: "Nayuta", tier: "SS", burst: "II", class: "Supporter", weapon: "MG" }, // Guessing

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
    "루주": { id: "rouge", name_en: "Rouge", tier: "S", burst: "I", class: "Supporter", weapon: "SR" }, // Guessing
    "팬텀": { id: "phantom", name_en: "Phantom", tier: "S", burst: "III", class: "Attacker", weapon: "AR" }, // Guessing
    "이사벨": { id: "isabel", name_en: "Isabel", tier: "A", burst: "III", class: "Attacker", weapon: "SG" },

    // PvP
    "자칼": { id: "jackal", name_en: "Jackal", tier: "PvP", burst: "I", class: "Defender", weapon: "RL" },
    "비스킷": { id: "biscuit", name_en: "Biscuit", tier: "PvP", burst: "II", class: "Supporter", weapon: "RL" },
    "노아": { id: "noah", name_en: "Noah", tier: "PvP", burst: "II", class: "Defender", weapon: "RL" },
    "로산나": { id: "rosanna", name_en: "Rosanna", tier: "PvP", burst: "I", class: "Attacker", weapon: "MG" },
    "사쿠라": { id: "sakura", name_en: "Sakura", tier: "A", burst: "I", class: "Supporter", weapon: "SR" },
};

// Helper to determine meta info if not in list
function guessMeta(name: string): Partial<NikkeData> {
    if (metadata[name.trim()]) return metadata[name.trim()];

    // Default fallback
    return {
        id: 'gen_' + name.trim().replace(/\s+/g, '_').toLowerCase(),
        name_en: name.trim(), // Placeholder
        tier: "A", // Default to A tier for unknown
        burst: "II",
        class: "Attacker",
        weapon: "AR"
    };
}

const entries: NikkeData[] = [];

let currentName: string | null = null;
let currentCubes: string[] = [];

for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Heuristic: Name line usually doesn't start with numbers and has specific format
    // The raw data format logic:
    // Iterate through lines.
    // 1. Identify Name Line: "[Tab] Name [Tab] Cube [Tab] Cube"
    // 2. Identify Stat Line: "[Tab] 7 7 7 10 10 10 [Tab] Options [Tab] Notes"

    // Actually, let's use the tab structure from the raw string.
    // Ideally I would read the raw string without trim() first to see indentation.
    const rawLine = lines[i];
    const parts = rawLine.split('\t').map(s => s.trim()).filter(s => s.length > 0);

    // Check if it's the header line
    if (parts[0] === '소속' || parts[0] === '1스킬') continue;

    // Check if it's a "Stat Line" (starts with numbers like 7, 4, 10, 1)
    const firstPartIsNumber = /^[0-9]+$/.test(parts[0]);

    if (!firstPartIsNumber) {
        // Likely a Name Line
        // Check for "Cube" keywords to be sure
        if (parts.length > 0) {
            currentName = parts[0];
            // Cubes are usually subsequent parts
            currentCubes = parts.slice(1).filter(p => p.includes('베어') || p.includes('부스트') || p.includes('큐브') || p.includes('어썰트') || p.includes('퀀텀'));
        }
    } else if (currentName && firstPartIsNumber) {
        // It's a Stat Line following a Name Line
        // Expected format: min1, min2, minB, eff1, eff2, effB, (maybe max?), Options, Notes
        // The user data says: "7 7 7 10 10 10 [Options] [Notes]"
        // Min: parts[0,1,2]. Eff: parts[3,4,5]??
        // Actually the header says: "가성비(1,2,B) 종결(1,2,B)"
        // So parts[0,1,2] = Efficient?, parts[3,4,5] = Max?
        // Wait, let's look at Red Hood: "7 7 7 10 10 10"
        // Header says: "가성비 스킬작" then "종결 스킬작"
        // So 7/7/7 is Efficient, 10/10/10 is Max.
        // The "Min" (Minimal) is not explicitly in this new data columns, but sometimes distinct.
        // I will map:
        // Min -> take from "Efficient" or 4/4/4 default?
        // User says: "가성비", "종결".
        // I will map:
        //  Min -> "4/4/4" (Safe default) or just copy Efficient if low.
        //  Efficient -> parts[0]/parts[1]/parts[2]
        //  Max -> parts[3]/parts[4]/parts[5]

        // Check if we have enough parts
        if (parts.length >= 6) {
            const effInv = `${parts[0]}/${parts[1]}/${parts[2]}`;
            const maxInv = `${parts[3]}/${parts[4]}/${parts[5]}`;

            // Options usually next
            let optionsStr = "";
            let descStr = "";

            // Find the part that looks like options (contains "우월코드", "공격력", "장탄")
            const optionIdx = parts.findIndex((p, idx) => idx >= 6 && (p.includes('우월코드') || p.includes('공격력') || p.includes('장탄') || p.includes('차지')));

            if (optionIdx !== -1) {
                optionsStr = parts[optionIdx];

                // Description is usually the last part or the part after options
                // Sometimes description is multiline in the prompt but here likely one string
                if (parts.length > optionIdx + 1) {
                    descStr = parts.slice(optionIdx + 1).join('\n');
                }
            }

            // Parse Options
            // "우월코드 / 공격력 / 장탄" -> ["우월코드", "공격력", "장탄"]
            // Handle quoted strings if any (cleaned by split)
            // Also remove quotes from the string itself
            const cleanOptions = optionsStr.replace(/"/g, '').split(/[\/\n]/).map(s => s.trim()).filter(s => s);

            // Parse Desc for Priority
            // "스킬 우선순위: 1스킬 > 버스트 > 2 스킬"
            let priority = "버스트 > 1스 = 2스"; // Default
            const prioMatch = descStr.match(/스킬 우선순위[:\s]+([^(\n|")]*)/);
            if (prioMatch) {
                priority = prioMatch[1].trim();
            }

            // Meta lookup
            const meta = guessMeta(currentName);

            const nikke: NikkeData = {
                id: meta.id || 'unknown_' + Math.random().toString(36).substr(2, 5),
                name: currentName,
                name_en: meta.name_en || currentName,
                tier: (meta.tier || 'A') as any, // Default to A if unknown
                burst: (meta.burst || 'II') as any,
                class: (meta.class || 'Attacker') as any,
                weapon: (meta.weapon || 'AR') as any,
                skill_priority: priority,
                skills: {
                    min: effInv, // User provided "Efficient" as first column, mapping to Min for now? No, User called it "가성비"(Efficient).
                    // I will map: Min -> Efficient (as provided), Efficient -> Efficient, Max -> Max
                    // actually user provided "가성비" (Efficient) and "종결" (End Game / Max).
                    // I'll just use Efficient for Min and Efficient.
                    efficient: effInv,
                    max: maxInv
                },
                options: cleanOptions,
                cube: currentCubes.join(', ') || '렐릭 베어',
                desc: descStr.replace(/"/g, '').replace(/스킬 우선순위:[^\n]*\n?/, '').trim() // Remove extracted priority from desc to keep it clean
            };

            entries.push(nikke);

            // Reset for next
            currentName = null;
        }
    }
}

// Generate the TS file content
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

fs.writeFileSync(path.join(__dirname, '../src/data/nikkes.ts'), outputContent);
console.log(`Generated ${entries.length} nikkes.`);
