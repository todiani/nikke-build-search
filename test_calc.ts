import { calculatePowerDetailed } from './src/utils/calculator';

const mockPartOptions = {
    helmet: {
        option1: { type: "공격력 증가", stage: 10 },
        option2: { type: "옵션없음", stage: 0 },
        option3: { type: "옵션없음", stage: 0 }
    },
    armor: {
        option1: { type: "옵션없음", stage: 0 },
        option2: { type: "옵션없음", stage: 0 },
        option3: { type: "옵션없음", stage: 0 }
    },
    gloves: {
        option1: { type: "옵션없음", stage: 0 },
        option2: { type: "옵션없음", stage: 0 },
        option3: { type: "옵션없음", stage: 0 }
    },
    boots: {
        option1: { type: "옵션없음", stage: 0 },
        option2: { type: "옵션없음", stage: 0 },
        option3: { type: "옵션없음", stage: 0 }
    }
};

const result = calculatePowerDetailed(
    1000000, 50000, 10000, // hp, atk, def
    10, 10, 10,            // s1, s2, burst
    mockPartOptions as any,
    7,                     // cubeLvl
    "None", 0, 0,          // colGrade, colSkill1, colSkill2
    "AR",                  // weapon
    null                   // nikkeData
);

console.log("Final Power:", result.power);
console.log("OL CP Detail:", result.details.ol_cp);
console.log("Aggregated Stats:");
result.details.ol_aggregated.forEach(row => {
    console.log(`- ${row.type}: CP=${row.cp}, Stage=${row.val}%`);
});
