export type RLStage = "2RL" | "2_5RL" | "3RL" | "3_5RL" | "4RL";

export interface RLData {
    value: number;
    hits?: string;
    bonus?: string;
}

export interface NikkeBurst {
    "2RL": RLData;
    "2_5RL": RLData;
    "3RL": RLData;
    "3_5RL": RLData;
    "4RL": RLData;
}

export const BURST_DB: Record<string, NikkeBurst> = {
    "아니스": {
        "2RL": { value: 28.4, hits: "2-4", bonus: "0%-0%" },
        "2_5RL": { value: 28.4, hits: "2-4", bonus: "0%-0%" },
        "3RL": { value: 42.6, hits: "3-6", bonus: "0%-0%" },
        "3_5RL": { value: 42.6, hits: "3-6", bonus: "0%-0%" },
        "4RL": { value: 56.8, hits: "4-8", bonus: "0%-0%" }
    },
    "센티": {
        "2RL": { value: 27.6, hits: "2-4", bonus: "0%-0%" },
        "2_5RL": { value: 27.6, hits: "2-4", bonus: "0%-0%" },
        "3RL": { value: 41.4, hits: "3-6", bonus: "0%-0%" },
        "3_5RL": { value: 41.4, hits: "3-6", bonus: "0%-0%" },
        "4RL": { value: 55.2, hits: "4-8", bonus: "0%-0%" }
    },
    "에밀리아": {
        "2RL": { value: 25.2, hits: "4-8", bonus: "0%-0%" },
        "2_5RL": { value: 25.2, hits: "4-8", bonus: "0%-0%" },
        "3RL": { value: 37.8, hits: "6-12", bonus: "0%-3.55%" },
        "3_5RL": { value: 37.8, hits: "6-12", bonus: "0%-3.55%" },
        "4RL": { value: 50.4, hits: "8-16", bonus: "0%-3.55%" }
    },
    "파스칼": {
        "2RL": { value: 18.4, hits: "4-8", bonus: "0%-0%" },
        "2_5RL": { value: 23.0, hits: "5-10", bonus: "0%-3.55%" },
        "3RL": { value: 27.6, hits: "6-12", bonus: "0%-3.55%" },
        "3_5RL": { value: 32.2, hits: "6-12", bonus: "0%-3.55%" },
        "4RL": { value: 36.8, hits: "6-12", bonus: "3.55%-7.1%" }
    },
    "드레이크": {
        "2RL": { value: 18.4, hits: "40-40", bonus: "14.2%-14.2%" },
        "2_5RL": { value: 22.5, hits: "50-50", bonus: "17.75%-17.75%" },
        "3RL": { value: 27.0, hits: "60-60", bonus: "21.3%-21.3%" },
        "3_5RL": { value: 31.5, hits: "70-70", bonus: "24.85%-24.85%" },
        "4RL": { value: 36.0, hits: "80-80", bonus: "28.4%-28.4%" }
    },
    "자칼": {
        "2RL": { value: 35.0, hits: "2-4", bonus: "0%-0%" },
        "2_5RL": { value: 35.0, hits: "2-4", bonus: "0%-0%" },
        "3RL": { value: 52.5, hits: "3-6", bonus: "0%-0%" },
        "3_5RL": { value: 52.5, hits: "3-6", bonus: "0%-0%" },
        "4RL": { value: 70.0, hits: "4-8", bonus: "0%-0%" }
    },
    "비스킷": {
        "2RL": { value: 20.0, hits: "4-8", bonus: "0%-0%" },
        "2_5RL": { value: 20.0, hits: "4-8", bonus: "0%-0%" },
        "3RL": { value: 30.0, hits: "6-12", bonus: "0%-0%" },
        "3_5RL": { value: 30.0, hits: "6-12", bonus: "0%-0%" },
        "4RL": { value: 40.0, hits: "8-16", bonus: "0%-0%" }
    }
};

export const getNikkeBurstValue = (name: string): NikkeBurst | null => {
    const cleanName = name.split('(')[0].trim();
    return BURST_DB[cleanName] || BURST_DB[name] || null;
};
