import { OVERLOAD_DATA } from '../data/game_constants';
import type { AllPartOptions, PartOptions } from './calculator';

export interface ExtractorData {
    meta: {
        name: string;
        [key: string]: any;
    };
    stats: {
        hp: number;
        atk: number;
        def: number;
        combatPower: number;
    };
    skills?: {
        skill1: number;
        skill2: number;
        burst: number;
    };
    cube?: {
        level: number;
    };
    collection?: {
        rarity: string;
        skillLv1: number;
        skillLv2: number;
    };
    equipment: Array<{
        partIndex: number;
        stats: Record<string, number>;
        options: Array<{
            name: string;
            value: string;
            slot?: number; // Optional slot index (1, 2, or 3)
        }>;
    }>;
}

const findClosestStage = (type: string, valueStr: string): number => {
    if (!type || type === "옵션없음") return 0;
    const value = parseFloat(valueStr.replace('%', ''));
    const stages = OVERLOAD_DATA[type];
    if (!stages) return 0;

    let closestIdx = 0;
    let minDiff = Math.abs(stages[0] - value);

    for (let i = 1; i < stages.length; i++) {
        const diff = Math.abs(stages[i] - value);
        if (diff < minDiff) {
            minDiff = diff;
            closestIdx = i;
        }
    }
    return closestIdx;
};

export const parseExtractorData = (data: ExtractorData): { stats: any, overload: AllPartOptions } => {
    const stats = {
        hp: data.stats.hp,
        atk: data.stats.atk,
        def: data.stats.def,
        s1: data.skills?.skill1 ?? 1,
        s2: data.skills?.skill2 ?? 1,
        burst: data.skills?.burst ?? 1,
        cubeLvl: data.cube?.level ?? 0,
        colGrade: data.collection?.rarity ?? "None",
        colSkill1: data.collection?.skillLv1 ?? 0,
        colSkill2: data.collection?.skillLv2 ?? 0
    };

    const emptyPart = (): PartOptions => ({
        option1: { type: "옵션없음", stage: 0 },
        option2: { type: "옵션없음", stage: 0 },
        option3: { type: "옵션없음", stage: 0 }
    });

    const overload: AllPartOptions = {
        helmet: emptyPart(),
        armor: emptyPart(),
        gloves: emptyPart(),
        boots: emptyPart()
    };

    const partMap: Record<number, keyof AllPartOptions> = {
        1: 'helmet',
        2: 'armor',
        3: 'gloves',
        4: 'boots'
    };

    data.equipment.forEach(item => {
        const partKey = partMap[item.partIndex];
        if (!partKey) return;

        const options = item.options || [];
        options.forEach((opt, idx) => {
            // Use opt.slot if available (1-based), otherwise fallback to array index
            const slotIdx = (opt.slot && opt.slot >= 1 && opt.slot <= 3) ? opt.slot : (idx + 1);
            if (slotIdx > 3) return;
            
            const optKey = `option${slotIdx}` as keyof PartOptions;
            const type = opt.name;
            const stage = findClosestStage(type, opt.value);
            
            overload[partKey][optKey] = {
                type: OVERLOAD_DATA[type] ? type : "옵션없음",
                stage: stage
            };
        });
    });

    return { stats, overload };
};
