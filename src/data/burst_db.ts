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

export let BURST_DB: Record<string, NikkeBurst> = {};

export const setBurstDB = (data: Record<string, NikkeBurst>) => {
    BURST_DB = data;
};

export const getBurstDB = () => BURST_DB;

export const getNikkeBurstValue = (name: string): NikkeBurst | null => {
    const cleanName = name.split('(')[0].trim();
    return BURST_DB[cleanName] || BURST_DB[name] || null;
};
