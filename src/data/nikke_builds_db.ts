export interface OverloadOption {
    type: string;
    stage: number;
}

export interface PartOptions {
    option1: OverloadOption;
    option2: OverloadOption;
    option3: OverloadOption;
}

export interface NikkeBuild {
    stats: {
        hp: number;
        atk: number;
        def: number;
    };
    skills: {
        skill1: number;
        skill2: number;
        burst: number;
    };
    cube_level: number;
    collection: {
        grade: string; // None, R, SR, SSR
        skill1: number;
        skill2: number;
    };
    overload: {
        helmet: PartOptions;
        armor: PartOptions;
        gloves: PartOptions;
        boots: PartOptions;
    };
}

export let NIKKE_BUILDS_DB: Record<string, NikkeBuild> = {};

export const setNikkeBuildsDB = (data: Record<string, NikkeBuild>) => {
    NIKKE_BUILDS_DB = data;
};

export const getNikkeBuild = (name: string): NikkeBuild | null => {
    const cleanName = name.split('(')[0].trim();
    return NIKKE_BUILDS_DB[cleanName] || NIKKE_BUILDS_DB[name] || null;
};
