import { describe, it, expect } from 'vitest';
import { calculatePowerDetailed } from './calculator';
import type { AllPartOptions } from './calculator';

describe('calculatePowerDetailed', () => {
    const emptyOptions: AllPartOptions = {
        helmet: {
            option1: { type: '옵션없음', stage: 0 },
            option2: { type: '옵션없음', stage: 0 },
            option3: { type: '옵션없음', stage: 0 },
        },
        armor: {
            option1: { type: '옵션없음', stage: 0 },
            option2: { type: '옵션없음', stage: 0 },
            option3: { type: '옵션없음', stage: 0 },
        },
        gloves: {
            option1: { type: '옵션없음', stage: 0 },
            option2: { type: '옵션없음', stage: 0 },
            option3: { type: '옵션없음', stage: 0 },
        },
        boots: {
            option1: { type: '옵션없음', stage: 0 },
            option2: { type: '옵션없음', stage: 0 },
            option3: { type: '옵션없음', stage: 0 },
        }
    };

    it('should calculate base power correctly with default stats', () => {
        const result = calculatePowerDetailed(
            1000000, 50000, 10000,
            10, 10, 10,
            emptyOptions,
            0, "None", 0, 0,
            "기관총 (MG)",
            null
        );

        expect(result.power).toBeGreaterThan(0);
        expect(result.details.base_cp).toBeGreaterThan(0);
        expect(result.details.skill_pct).toBe(100); // 10-10-10 is 100% of max skill level (10)
    });

    it('should increase power with skill levels', () => {
        const lowSkill = calculatePowerDetailed(
            1000000, 50000, 10000,
            1, 1, 1,
            emptyOptions,
            0, "None", 0, 0,
            "기관총 (MG)",
            null
        );

        const highSkill = calculatePowerDetailed(
            1000000, 50000, 10000,
            10, 10, 10,
            emptyOptions,
            0, "None", 0, 0,
            "기관총 (MG)",
            null
        );

        expect(highSkill.power).toBeGreaterThan(lowSkill.power);
    });

    it('should handle overload options', () => {
        const withOptions = JSON.parse(JSON.stringify(emptyOptions));
        withOptions.helmet.option1 = { type: '공격력 증가', stage: 10 };

        const result = calculatePowerDetailed(
            1000000, 50000, 10000,
            10, 10, 10,
            withOptions,
            0, "None", 0, 0,
            "기관총 (MG)",
            null
        );

        expect(result.details.ol_cp).toBeGreaterThan(0);
    });
});
