import { useState, useEffect } from 'react';
import type { NikkeData } from '../data/nikkes';
import { OPTION_LIST, OVERLOAD_DATA, PARTS, PART_NAMES } from '../data/game_constants';
import { calculatePowerDetailed, type AllPartOptions, type CalcResult } from '../utils/calculator';

interface OptionCompareProps {
    nikke: NikkeData;
    onDataUpdate?: (data: any) => void;
}

type BuildConfig = {
    stats: {
        hp: number;
        atk: number;
        def: number;
        s1: number;
        s2: number;
        burst: number;
        cubeLvl: number;
    };
    partOptions: AllPartOptions;
};

const createEmptyOptions = () => ({
    option1: { type: "옵션없음", stage: 0 },
    option2: { type: "옵션없음", stage: 0 },
    option3: { type: "옵션없음", stage: 0 }
});

const defaultBuild = (): BuildConfig => ({
    stats: { hp: 1000000, atk: 50000, def: 10000, s1: 10, s2: 10, burst: 10, cubeLvl: 7 },
    partOptions: {
        helmet: createEmptyOptions(),
        armor: createEmptyOptions(),
        gloves: createEmptyOptions(),
        boots: createEmptyOptions()
    }
});

export default function OptionCompare({ nikke, onDataUpdate }: OptionCompareProps) {
    const [buildA, setBuildA] = useState<BuildConfig>(nikke.compare_data?.buildA || defaultBuild());
    const [buildB, setBuildB] = useState<BuildConfig>(nikke.compare_data?.buildB || defaultBuild());

    const [resultA, setResultA] = useState<CalcResult | null>(null);
    const [resultB, setResultB] = useState<CalcResult | null>(null);

    // Calculate both builds
    useEffect(() => {
        const resA = calculatePowerDetailed(
            buildA.stats.hp, buildA.stats.atk, buildA.stats.def,
            buildA.stats.s1, buildA.stats.s2, buildA.stats.burst,
            buildA.partOptions, buildA.stats.cubeLvl,
            "None", 0, 0, nikke.weapon, nikke
        );
        setResultA(resA);

        const resB = calculatePowerDetailed(
            buildB.stats.hp, buildB.stats.atk, buildB.stats.def,
            buildB.stats.s1, buildB.stats.s2, buildB.stats.burst,
            buildB.partOptions, buildB.stats.cubeLvl,
            "None", 0, 0, nikke.weapon, nikke
        );
        setResultB(resB);

        // Sync to parent
        if (onDataUpdate) {
            onDataUpdate({ buildA, buildB });
        }
    }, [buildA, buildB, nikke.id]);

    const handleOptionChange = (
        build: 'A' | 'B',
        part: keyof typeof PART_NAMES,
        optKey: 'option1' | 'option2' | 'option3',
        field: 'type' | 'stage',
        val: string | number
    ) => {
        const setBuild = build === 'A' ? setBuildA : setBuildB;
        setBuild(prev => ({
            ...prev,
            partOptions: {
                ...prev.partOptions,
                [part]: {
                    ...prev.partOptions[part],
                    [optKey]: {
                        ...prev.partOptions[part][optKey],
                        [field]: field === 'stage' ? Number(val) : val
                    }
                }
            }
        }));
    };

    const copyAtoB = () => setBuildB(JSON.parse(JSON.stringify(buildA)));
    const copyBtoA = () => setBuildA(JSON.parse(JSON.stringify(buildB)));

    const diff = resultA && resultB ? {
        power: resultB.power - resultA.power,
        score: resultB.score - resultA.score
    } : null;

    const renderBuildPanel = (label: string, build: BuildConfig, result: CalcResult | null, buildKey: 'A' | 'B') => (
        <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-4 flex-1 min-w-0">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-white">{label}</h3>
                {result && (
                    <div className="text-right">
                        <div className="text-2xl font-black text-nikke-red">{result.power.toLocaleString()}</div>
                        <div className="text-xs text-gray-400">종결도: {result.score.toFixed(1)}%</div>
                    </div>
                )}
            </div>

            <div className="space-y-3">
                {PARTS.map(partKey => (
                    <div key={partKey} className="bg-black/30 p-2 rounded border border-gray-800">
                        <div className="text-xs font-bold text-gray-500 mb-1">{PART_NAMES[partKey]}</div>
                        {[1, 2, 3].map(optIdx => {
                            const optKey = `option${optIdx}` as 'option1' | 'option2' | 'option3';
                            const currentOpt = build.partOptions[partKey][optKey];
                            const availableStages = currentOpt.type !== "옵션없음" && OVERLOAD_DATA[currentOpt.type]
                                ? OVERLOAD_DATA[currentOpt.type].map((v: number, i: number) => ({ idx: i, val: v }))
                                : [{ idx: 0, val: 0.00 }];

                            return (
                                <div key={optIdx} className="flex gap-1 mb-1 last:mb-0">
                                    <select
                                        className="bg-gray-800 text-gray-200 text-[10px] rounded p-1 border border-gray-700 flex-1 min-w-0"
                                        value={currentOpt.type}
                                        onChange={e => handleOptionChange(buildKey, partKey, optKey, 'type', e.target.value)}
                                    >
                                        {OPTION_LIST.map(o => <option key={o} value={o}>{o}</option>)}
                                    </select>
                                    <select
                                        className="bg-gray-800 text-gray-200 text-[10px] rounded p-1 border border-gray-700 w-16"
                                        value={currentOpt.stage}
                                        onChange={e => handleOptionChange(buildKey, partKey, optKey, 'stage', e.target.value)}
                                    >
                                        {availableStages.map(s => (
                                            <option key={s.idx} value={s.idx}>{s.idx}단 ({s.val}%)</option>
                                        ))}
                                    </select>
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center">
                    <span className="mr-2">⚖️</span> 옵션 비교 시뮬레이터
                </h2>
                <div className="flex gap-2">
                    <button onClick={copyAtoB} className="px-2 py-1 text-xs bg-blue-800 hover:bg-blue-700 text-blue-200 rounded border border-blue-600">📊 계산기(A) → 비교(B)</button>
                    <button onClick={copyBtoA} className="px-2 py-1 text-xs bg-purple-800 hover:bg-purple-700 text-purple-200 rounded border border-purple-600">⚖️ 비교(B) → 계산기(A)</button>
                </div>
            </div>

            {/* Comparison Summary */}
            {diff && (
                <div className={`p-4 rounded-lg border text-center ${diff.power > 0 ? 'bg-green-900/20 border-green-700' : diff.power < 0 ? 'bg-red-900/20 border-red-700' : 'bg-gray-800 border-gray-700'}`}>
                    <div className="text-sm text-gray-400 mb-1">Build B vs Build A</div>
                    <div className={`text-2xl font-black ${diff.power > 0 ? 'text-green-400' : diff.power < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                        {diff.power > 0 ? '+' : ''}{diff.power.toLocaleString()} CP
                    </div>
                    <div className={`text-sm ${diff.score > 0 ? 'text-green-300' : diff.score < 0 ? 'text-red-300' : 'text-gray-400'}`}>
                        종결도: {diff.score > 0 ? '+' : ''}{diff.score.toFixed(1)}%
                    </div>
                </div>
            )}

            {/* Side by Side Panels */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {renderBuildPanel("📊 전투력 계산기 (A)", buildA, resultA, 'A')}
                {renderBuildPanel("⚖️ 옵션 비교 (B)", buildB, resultB, 'B')}
            </div>
        </div>
    );
}
