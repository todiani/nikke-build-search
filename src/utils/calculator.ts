import { OVERLOAD_DATA, PART_NAMES, PARTS } from '../data/game_constants';
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

function calculateGrade(isValid: boolean, percentage: number): { str: string, tag: AggregatedStat['tag'] } {
    if (!isValid) return { str: "F (무효)", tag: 'invalid' };
    if (percentage >= 95) return { str: "SSS (종결)", tag: 'valid' };
    if (percentage >= 85) return { str: "SS (준종결)", tag: 'valid' };
    if (percentage >= 70) return { str: "S (우수)", tag: 'primary' };
    if (percentage >= 50) return { str: "A (보통)", tag: 'neutral' };
    return { str: "B (아쉬움)", tag: 'neutral' };
}

export function calculatePowerDetailed(
    hp: number, atk: number, def: number,
    skill1: number, skill2: number, burst: number,
    partOptions: AllPartOptions,
    cubeLvl: number,
    colGrade: string, colSkill1: number, colSkill2: number,
    _weapon: string, // Unused
    nikkeData: NikkeData | null
): CalcResult {
    // 1. Base Stats CP
    const term1 = 0.7 * hp;
    const term2 = 19.35 * atk;
    const term3 = 70.0 * def;
    const baseSum = term1 + term2 + term3;

    const baseCoeff = 1.3;
    const skillCoeff = (0.01 * skill1) + (0.01 * skill2) + (0.02 * burst);
    const cubeCoeff = 0.0092 * cubeLvl;

    let colCoeffVal = 0;
    if (colGrade === "R") colCoeffVal = colSkill1 + 6.33;
    else if (colGrade === "SR") colCoeffVal = colSkill1 + colSkill2 + 10.66;
    const colCoeff = 0.0069 * colCoeffVal;

    // 2. Overload Data Aggregation
    let totalOlCpCoeff = 0;
    let totalOlPotentialScore = 0;

    // Parse valid options from Nikke Data (Text -> List)
    // The current data format in nikkes.ts stores options as strings in `options` array.
    // We might need to guess valid/invalid or use the PRESET_BUILD_DATA meta if available.
    // Ideally, `nikkeData` should have `valid_ops` field. Since our basic parser doesn't perfectly extract it into a list yet,
    // we will try to infer or defaults.

    // Let's assume we can rudimentary check against `nikkeData.options` content for validity?
    // Actually, `nikkeData.options` contains the *recommended* options text.
    // We can try to match keywords.

    const validOpsKeywords = nikkeData?.options || []; // "공격력", "명중률" etc strings
    const checkIsValid = (optType: string) => {
        if (optType === "옵션없음") return false;
        // Simple keyword matching against the scraped option recommendations
        // E.g. optType="공격력 증가", recommendation="공격력"
        const coreName = optType.replace(" 증가", "").replace(" 대미지", "").replace("최대 ", "").replace(" 수", "");
        return validOpsKeywords.some(valid => valid.includes(coreName));
    };

    // Dictionary for aggregation
    const aggStats: Record<string, { curr: number, max: number, count: number, cp: number, is_valid: boolean }> = {};

    PARTS.forEach(part => {
        const opts = partOptions[part];
        [opts.option1, opts.option2, opts.option3].forEach(opt => {
            const oType = opt.type;
            const stageNum = opt.stage;

            if (oType === "옵션없음") return;

            // CP Calculation
            const cpMultiplier = (oType === "우월코드 대미지 증가") ? 0.00828 : 0.0069;
            const cpCoeffLoop = stageNum * cpMultiplier;
            totalOlCpCoeff += cpCoeffLoop;

            // Value Calculation
            const currentVal = getOptionValue(oType, stageNum);
            const maxValSingle = getMaxValue(oType);

            // Validity & Score
            const isValid = checkIsValid(oType);
            const pctSingle = maxValSingle > 0 ? (currentVal / maxValSingle * 100) : 0;
            const weight = isValid ? 1.0 : 0.0;
            const lineScore = (pctSingle / 100) * weight * 100;
            totalOlPotentialScore += lineScore;

            // Aggregation
            if (!aggStats[oType]) aggStats[oType] = { curr: 0, max: 0, count: 0, cp: 0, is_valid: isValid };
            aggStats[oType].curr += currentVal;
            aggStats[oType].max += maxValSingle;
            aggStats[oType].count += 1;
            aggStats[oType].cp += (baseSum * cpCoeffLoop) / 100;
            // logic OR for validity if appeared multiple times? usually property of type.
            aggStats[oType].is_valid = isValid;
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
        const { str, tag } = calculateGrade(data.is_valid, totalPct);

        return {
            type: oType,
            lines: data.count,
            val: data.curr,
            max: data.max,
            pct: totalPct,
            cp: data.cp,
            grade: str,
            tag: tag
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
            col_pct: colGrade !== "None" ? (colCoeffVal / (4 + 4 + 10.66)) * 100 : 0,
            ol_cp: (baseSum * totalOlCpCoeff) / 100,
            ol_graduation_pct: graduationPct,
            ol_aggregated: finalAggregatedList
        }
    };
}
