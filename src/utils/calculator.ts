import { OVERLOAD_DATA, PART_NAMES, PARTS, PRESET_BUILD_DATA, WEAPON_OPTION_DEFAULTS } from '../data/game_constants';
import type { NikkeData } from '../data/nikkes';

export interface OverloadOption {
    type: string;
    stage: number; // 0~15
}

export interface PartOptions {
    option1: OverloadOption;
    option2: OverloadOption;
    option3: OverloadOption;
}

export type AllPartOptions = Record<keyof typeof PART_NAMES, PartOptions>;

export interface CalcResult {
    power: number;
    score: number;
    details: {
        base_cp: number;
        skill_cp: number;
        skill_pct: number;
        cube_cp: number;
        cube_pct: number;
        col_cp: number;
        col_pct: number;
        ol_cp: number;
        ol_graduation_pct: number;
        ol_aggregated: AggregatedStat[];
    };
}

export interface AggregatedStat {
    type: string;
    lines: number;
    val: number;
    max: number;
    pct: number;
    cp: number;
    grade: string;
    tag: 'valid' | 'invalid' | 'neutral' | 'primary';
    priority_level: number; // 0: Invalid, 1: Best, 2: Good, 3: Neutral
}

function getOptionValue(optionType: string, stage: number): number {
    if (optionType === "옵션없음" || !OVERLOAD_DATA[optionType]) return 0;
    const data = OVERLOAD_DATA[optionType];
    if (stage >= 0 && stage < data.length) return data[stage];
    return 0;
}

function getMaxValue(optionType: string): number {
    if (OVERLOAD_DATA[optionType]) return OVERLOAD_DATA[optionType][OVERLOAD_DATA[optionType].length - 1];
    return 0;
}

function calculateGrade(priorityLevel: number, percentage: number): { str: string, tag: AggregatedStat['tag'] } {
    if (priorityLevel === 0) return { str: "F (무효)", tag: 'invalid' };
    
    // Grade based on percentage
    let gradeStr = "B (아쉬움)";
    if (percentage >= 95) gradeStr = "SSS (종결)";
    else if (percentage >= 85) gradeStr = "SS (준종결)";
    else if (percentage >= 70) gradeStr = "S (우수)";
    else if (percentage >= 50) gradeStr = "A (보통)";

    if (priorityLevel === 1) return { str: gradeStr, tag: 'primary' };
    if (priorityLevel === 2) return { str: gradeStr, tag: 'valid' };
    return { str: gradeStr, tag: 'neutral' };
}

export function calculatePowerDetailed(
    hp: number, atk: number, def: number,
    skill1: number, skill2: number, burst: number,
    partOptions: AllPartOptions,
    cubeLvl: number,
    colGrade: string, colSkill1: number, colSkill2: number,
    weapon: string,
    nikkeData: NikkeData | null
): CalcResult {
    // 0. Sanitize inputs
    const _hp = Number(hp) || 0;
    const _atk = Number(atk) || 0;
    const _def = Number(def) || 0;
    const _s1 = Number(skill1) || 0;
    const _s2 = Number(skill2) || 0;
    const _bst = Number(burst) || 0;
    const _cube = Number(cubeLvl) || 0;
    const _colS1 = Number(colSkill1) || 0;
    const _colS2 = Number(colSkill2) || 0;

    // 1. Base Stats CP
    const term1 = 0.7 * _hp;
    const term2 = 19.35 * _atk;
    const term3 = 70.0 * _def;
    const baseSum = term1 + term2 + term3;

    const baseCoeff = 1.3;
    const skillCoeff = (0.01 * _s1) + (0.01 * _s2) + (0.02 * _bst);
    const cubeCoeff = 0.0092 * _cube;

    let colCoeffVal = 0;
    let maxColVal = 1.0;
    if (colGrade === "R") {
        colCoeffVal = _colS1 + 6.33;
        maxColVal = 15 + 6.33;
    } else if (colGrade === "SR") {
        colCoeffVal = _colS1 + _colS2 + 10.66;
        maxColVal = 15 + 15 + 10.66;
    } else if (colGrade === "SSR") {
        colCoeffVal = _colS1 + _colS2 + 15.00;
        maxColVal = 15 + 15 + 15.00;
    }
    const colCoeff = 0.0069 * colCoeffVal;

    // 2. Overload Data Aggregation
    let totalOlCpCoeff = 0;
    let totalOlPotentialScore = 0;

    // Enhanced Priority Check Logic
    const getPriorityLevel = (optType: string): number => {
        if (optType === "옵션없음") return 0;
        
        const coreName = optType.replace(" 증가", "").replace(" 대미지", "").replace("최대 ", "").replace(" 수", "").trim();
        const nikkeName = nikkeData?.name || "";
        const cleanNikkeName = nikkeName.split('(')[0].trim();
        
        // 1. Check PRESET_BUILD_DATA (Highest reliability)
        const preset = PRESET_BUILD_DATA[cleanNikkeName] || PRESET_BUILD_DATA[nikkeName];
        if (preset) {
            if (preset.ol_best?.includes(coreName)) return 1;
            if (preset.ol_good?.includes(coreName)) return 2;
        }

        // 2. Check NikkeData specific fields
        if (nikkeData?.overload_detail?.valid_ops?.some(v => v.includes(coreName))) return 1;
        if (nikkeData?.valid_options?.some(v => v.includes(coreName))) return 1;

        // 2.1. Check Invalid Options (return 0)
        if (nikkeData?.overload_detail?.invalid_ops?.some(v => v.includes(coreName))) return 0;
        if (nikkeData?.invalid_options?.some(v => v.includes(coreName))) return 0;
        
        // 3. Check General Options text
        if (nikkeData?.options?.some(v => v.includes(coreName))) return 1;

        // 4. Baseline: "우월코드 대미지 증가" is almost always valid for attackers/supporters
        if (coreName === "우월코드") {
            if (nikkeData?.class === "Attacker") return 1;
            return 2; // Supporter/Defender
        }

        // 5. Weapon Baseline
        const weaponDefaults = WEAPON_OPTION_DEFAULTS[weapon] || WEAPON_OPTION_DEFAULTS["Unknown"];
        if (weaponDefaults[optType] && weaponDefaults[optType] >= 1.0) return 2;

        return 3; // Neutral/Situational
    };

    // Dictionary for aggregation
    const aggStats: Record<string, { curr: number, max: number, count: number, cp: number, priority: number }> = {};

    PARTS.forEach(part => {
        const opts = partOptions[part];
        [opts.option1, opts.option2, opts.option3].forEach(opt => {
            const oType = opt.type;
            const stageNum = opt.stage;

            if (oType === "옵션없음") return;

            // CP Calculation
            // In Nikke, each OL line adds a fixed CP coefficient.
            // A common approximation is ~0.0069 per stage-unit.
            // We use (stageNum + 1) because even Stage 1 should have a base CP contribution.
            const cpMultiplier = (oType === "우월코드 대미지 증가") ? 0.00828 : 0.0069;
            const cpCoeffLoop = (stageNum > 0 ? stageNum : 0) * cpMultiplier;
            totalOlCpCoeff += cpCoeffLoop;

            // Value Calculation
            const currentVal = getOptionValue(oType, stageNum);
            const maxValSingle = getMaxValue(oType);

            // Priority & Score
            const priority = getPriorityLevel(oType);
            const pctSingle = maxValSingle > 0 ? (currentVal / maxValSingle * 100) : 0;
            
            // Score weight based on priority
            let weight = 0;
            if (priority === 1) weight = 1.0;
            else if (priority === 2) weight = 0.7;
            else if (priority === 3) weight = 0.3;
            
            const lineScore = (pctSingle / 100) * weight * 100;
            totalOlPotentialScore += lineScore;

            // Aggregation
            if (!aggStats[oType]) aggStats[oType] = { curr: 0, max: 0, count: 0, cp: 0, priority: priority };
            aggStats[oType].curr += currentVal;
            aggStats[oType].max += maxValSingle;
            aggStats[oType].count += 1;
            // Ensure CP contribution is at least 0 and rounded properly later
            const lineCp = (baseSum * cpCoeffLoop) / 100;
            aggStats[oType].cp += lineCp;
            aggStats[oType].priority = priority;
        });
    });

    const totalCoeff = baseCoeff + skillCoeff + totalOlCpCoeff + cubeCoeff + colCoeff;
    const finalPower = (baseSum * totalCoeff) / 100;

    // Graduation Score (4 parts * 3 lines * 100 = 1200 max)
    const graduationPct = (totalOlPotentialScore / 1200) * 100;
    const skillPct = ((skill1 + skill2 + burst) / 30) * 100;

    // Final List
    const finalAggregatedList: AggregatedStat[] = Object.keys(aggStats).map(oType => {
        const data = aggStats[oType];
        const totalPct = data.max > 0 ? (data.curr / data.max * 100) : 0;
        const { str, tag } = calculateGrade(data.priority, totalPct);

        return {
            type: oType,
            lines: data.count,
            val: data.curr,
            max: data.max,
            pct: totalPct,
            cp: data.cp,
            grade: str,
            tag: tag,
            priority_level: data.priority
        };
    });

    return {
        power: Math.round(finalPower),
        score: graduationPct,
        details: {
            base_cp: (baseSum * baseCoeff) / 100,
            skill_cp: (baseSum * skillCoeff) / 100,
            skill_pct: skillPct,
            cube_cp: (baseSum * cubeCoeff) / 100,
            cube_pct: (cubeLvl / 15) * 100,
            col_cp: (baseSum * colCoeff) / 100,
            col_pct: colGrade !== "None" ? (colCoeffVal / maxColVal) * 100 : 0,
            ol_cp: (baseSum * totalOlCpCoeff) / 100,
            ol_graduation_pct: graduationPct,
            ol_aggregated: finalAggregatedList
        }
    };
}
