import { useState, useEffect } from 'react';
import type { NikkeData } from '../data/nikkes';
import { OPTION_LIST, OVERLOAD_DATA, PARTS, PART_NAMES } from '../data/game_constants';
import { calculatePowerDetailed, type AllPartOptions, type CalcResult } from '../utils/calculator';

interface OptionCompareProps {
    nikke: NikkeData;
    onDataUpdate?: (data: any) => void;
    onSyncToCalculator?: (build: any) => void;
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

export default function OptionCompare({ nikke, onDataUpdate, onSyncToCalculator }: OptionCompareProps) {
    const [buildA, setBuildA] = useState<BuildConfig>(nikke.compare_data?.buildA || defaultBuild());
    const [buildB, setBuildB] = useState<BuildConfig>(nikke.compare_data?.buildB || defaultBuild());

    // Helper to convert nikke.build to BuildConfig
    const getBuildFromCalculator = (): BuildConfig | null => {
        if (!nikke.build) return null;
        return {
            stats: {
                hp: nikke.build.stats.hp,
                atk: nikke.build.stats.atk,
                def: nikke.build.stats.def,
                s1: nikke.build.skills.skill1,
                s2: nikke.build.skills.skill2,
                burst: nikke.build.skills.burst,
                cubeLvl: nikke.build.cube_level
            },
            partOptions: JSON.parse(JSON.stringify(nikke.build.overload))
        };
    };

    const copyCalcToCompare = () => {
        const calcBuild = getBuildFromCalculator();
        if (calcBuild) {
            setBuildA(JSON.parse(JSON.stringify(calcBuild)));
            setBuildB(JSON.parse(JSON.stringify(calcBuild)));
        } else {
            alert("계산기 데이터가 없습니다. 먼저 계산기 탭에서 값을 입력해주세요.");
        }
    };

    const copyCompareToCalc = () => {
        // Copy B to A first
        const newBuildA = JSON.parse(JSON.stringify(buildB));
        setBuildA(newBuildA);

        // Then sync B back to Calculator tab
        if (onSyncToCalculator) {
            const syncData = {
                stats: { hp: buildB.stats.hp, atk: buildB.stats.atk, def: buildB.stats.def },
                skills: { skill1: buildB.stats.s1, skill2: buildB.stats.s2, burst: buildB.stats.burst },
                cube_level: buildB.stats.cubeLvl,
                collection: nikke.build?.collection || { grade: "None", skill1: 1, skill2: 1 },
                overload: JSON.parse(JSON.stringify(buildB.partOptions))
            };
            onSyncToCalculator(syncData);
        }
    };

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

    const diff = resultA && resultB ? {
        power: resultB.power - resultA.power,
        score: resultB.score - resultA.score
    } : null;

    const renderBuildPanel = (label: string, build: BuildConfig, result: CalcResult | null, buildKey: 'A' | 'B') => (
        <div className={`border rounded-2xl overflow-hidden shadow-xl transition-all ${buildKey === 'A' ? 'bg-blue-950/20 border-blue-900/50' : 'bg-purple-950/20 border-purple-900/50'}`}>
            <div className={`px-4 py-3 border-b flex justify-between items-center ${buildKey === 'A' ? 'bg-blue-900/30 border-blue-900/30' : 'bg-purple-900/30 border-purple-900/30'}`}>
                <h3 className="font-black text-white flex items-center gap-2">
                    <span className="text-lg">{buildKey === 'A' ? '📊' : '⚖️'}</span> {label}
                </h3>
                {result && (
                    <div className="text-right">
                        <div className="text-xl font-black text-nikke-red">{result.power.toLocaleString()} <span className="text-[10px] text-gray-500 font-normal">CP</span></div>
                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">종결도: {result.score.toFixed(1)}%</div>
                    </div>
                )}
            </div>

            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Left Column: Helmet & Gloves */}
                <div className="space-y-4">
                    {['helmet', 'gloves'].map(partKey => {
                        const pk = partKey as keyof typeof PART_NAMES;
                        return (
                            <div key={pk} className="bg-black/40 p-3 rounded-xl border border-gray-800/50 group/part hover:border-gray-700 transition-colors">
                                <div className="text-[10px] font-black text-gray-500 mb-2 uppercase tracking-widest flex items-center gap-2">
                                    <span className="w-1 h-3 bg-gray-700 rounded-full"></span>
                                    {PART_NAMES[pk]}
                                </div>
                                <div className="space-y-2">
                                    {[1, 2, 3].map(optIdx => {
                                        const optKey = `option${optIdx}` as 'option1' | 'option2' | 'option3';
                                        const currentOpt = build.partOptions[pk][optKey];
                                        const availableStages = currentOpt.type !== "옵션없음" && OVERLOAD_DATA[currentOpt.type]
                                            ? OVERLOAD_DATA[currentOpt.type].map((v: number, i: number) => ({ idx: i, val: v }))
                                            : [{ idx: 0, val: 0.00 }];

                                        return (
                                            <div key={optIdx} className="flex gap-2 group/opt">
                                                <div className="relative flex-1 min-w-0">
                                                    <select
                                                        className="w-full bg-gray-900/50 hover:bg-gray-800 text-gray-300 text-xs rounded-lg p-2 border border-gray-800 focus:border-blue-500 outline-none transition-all appearance-none"
                                                        value={currentOpt.type}
                                                        onChange={e => handleOptionChange(buildKey, pk, optKey, 'type', e.target.value)}
                                                    >
                                                        {OPTION_LIST.map(o => <option key={o} value={o}>{o}</option>)}
                                                    </select>
                                                    <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[8px] text-gray-600">▼</div>
                                                </div>
                                                <div className="relative w-24">
                                                    <select
                                                        className={`w-full bg-gray-900/50 hover:bg-gray-800 text-xs rounded-lg p-2 border border-gray-800 focus:border-blue-500 outline-none transition-all appearance-none text-right pr-5 ${currentOpt.stage >= 11 ? 'text-orange-400 font-bold' : currentOpt.stage >= 6 ? 'text-blue-400' : 'text-gray-400'}`}
                                                        value={currentOpt.stage}
                                                        onChange={e => handleOptionChange(buildKey, pk, optKey, 'stage', e.target.value)}
                                                    >
                                                        {availableStages.map(s => (
                                                            <option key={s.idx} value={s.idx} className="bg-gray-900">
                                                                {currentOpt.type === "옵션없음" ? '-' : `${s.idx + 1}단계(${s.val}%)`}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <div className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none text-[8px] text-gray-600">▼</div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Right Column: Armor & Boots */}
                <div className="space-y-4">
                    {['armor', 'boots'].map(partKey => {
                        const pk = partKey as keyof typeof PART_NAMES;
                        return (
                            <div key={pk} className="bg-black/40 p-3 rounded-xl border border-gray-800/50 group/part hover:border-gray-700 transition-colors">
                                <div className="text-[10px] font-black text-gray-500 mb-2 uppercase tracking-widest flex items-center gap-2">
                                    <span className="w-1 h-3 bg-gray-700 rounded-full"></span>
                                    {PART_NAMES[pk]}
                                </div>
                                <div className="space-y-2">
                                    {[1, 2, 3].map(optIdx => {
                                        const optKey = `option${optIdx}` as 'option1' | 'option2' | 'option3';
                                        const currentOpt = build.partOptions[pk][optKey];
                                        const availableStages = currentOpt.type !== "옵션없음" && OVERLOAD_DATA[currentOpt.type]
                                            ? OVERLOAD_DATA[currentOpt.type].map((v: number, i: number) => ({ idx: i, val: v }))
                                            : [{ idx: 0, val: 0.00 }];

                                        return (
                                            <div key={optIdx} className="flex gap-2 group/opt">
                                                <div className="relative flex-1 min-w-0">
                                                    <select
                                                        className="w-full bg-gray-900/50 hover:bg-gray-800 text-gray-300 text-xs rounded-lg p-2 border border-gray-800 focus:border-blue-500 outline-none transition-all appearance-none"
                                                        value={currentOpt.type}
                                                        onChange={e => handleOptionChange(buildKey, pk, optKey, 'type', e.target.value)}
                                                    >
                                                        {OPTION_LIST.map(o => <option key={o} value={o}>{o}</option>)}
                                                    </select>
                                                    <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[8px] text-gray-600">▼</div>
                                                </div>
                                                <div className="relative w-24">
                                                    <select
                                                        className={`w-full bg-gray-900/50 hover:bg-gray-800 text-xs rounded-lg p-2 border border-gray-800 focus:border-blue-500 outline-none transition-all appearance-none text-right pr-5 ${currentOpt.stage >= 11 ? 'text-orange-400 font-bold' : currentOpt.stage >= 6 ? 'text-blue-400' : 'text-gray-400'}`}
                                                        value={currentOpt.stage}
                                                        onChange={e => handleOptionChange(buildKey, pk, optKey, 'stage', e.target.value)}
                                                    >
                                                        {availableStages.map(s => (
                                                            <option key={s.idx} value={s.idx} className="bg-gray-900">
                                                                {currentOpt.type === "옵션없음" ? '-' : `${s.idx + 1}단계(${s.val}%)`}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <div className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none text-[8px] text-gray-600">▼</div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );

    const renderDetailedComparison = () => {
        if (!resultA || !resultB) return null;

        const allTypes = new Set<string>();
        resultA.details.ol_aggregated.forEach(r => allTypes.add(r.type));
        resultB.details.ol_aggregated.forEach(r => allTypes.add(r.type));

        const sortedTypes = Array.from(allTypes).sort((a, b) => {
            const rowA = resultA.details.ol_aggregated.find(r => r.type === a) || resultB.details.ol_aggregated.find(r => r.type === a);
            const rowB = resultA.details.ol_aggregated.find(r => r.type === b) || resultB.details.ol_aggregated.find(r => r.type === b);
            return (rowA?.priority_level || 9) - (rowB?.priority_level || 9);
        });

        const getDeltaStyle = (val: number) => {
            if (val > 0.01) return 'text-green-400 font-black';
            if (val < -0.01) return 'text-red-400 font-black';
            return 'text-gray-600';
        };

        return (
            <div className="bg-[#0a0a0c] rounded-3xl border border-gray-800/50 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] mt-12 transition-all hover:border-gray-700/50">
                <div className="bg-gradient-to-r from-gray-800/40 to-transparent px-8 py-6 border-b border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center border border-blue-500/20">
                            <span className="text-2xl">⚖️</span>
                        </div>
                        <div>
                            <h3 className="text-white font-black text-xl tracking-tight">3. 빌드 성능 비교 분석</h3>
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em]">Detailed Build Comparison (B vs A)</p>
                        </div>
                    </div>
                </div>

                <div className="p-2">
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-sm text-left border-separate border-spacing-y-2 px-4">
                            <thead>
                                <tr className="text-[10px] text-gray-500 uppercase font-black tracking-widest">
                                    <th className="px-6 py-4">분석 항목</th>
                                    <th className="px-6 py-4 text-center">Build A (기준)</th>
                                    <th className="px-6 py-4 text-center">Build B (변경)</th>
                                    <th className="px-6 py-4 text-right">상세 증감 (Delta)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {/* Summary Rows */}
                                <tr className="bg-gradient-to-r from-blue-900/20 to-transparent hover:from-blue-900/30 transition-all duration-300 rounded-2xl group">
                                    <td className="px-6 py-5 first:rounded-l-2xl last:rounded-r-2xl border-y border-l border-blue-900/20">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                                            <span className="font-black text-white text-base">총 전투력 (Total CP)</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-center border-y border-blue-900/10 font-mono text-gray-400">
                                        {resultA.power.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-5 text-center border-y border-blue-900/10 font-black text-white text-lg">
                                        {resultB.power.toLocaleString()}
                                    </td>
                                    <td className={`px-6 py-5 text-right first:rounded-l-2xl last:rounded-r-2xl border-y border-r border-blue-900/20 font-mono text-xl ${getDeltaStyle(resultB.power - resultA.power)}`}>
                                        <div className="flex items-center justify-end gap-2">
                                            {(resultB.power - resultA.power) > 0 ? 
                                                <span className="text-green-400 bg-green-400/10 px-2 py-0.5 rounded-lg text-sm font-black">▲ {Math.abs(resultB.power - resultA.power).toLocaleString()}</span> : 
                                                (resultB.power - resultA.power) < 0 ? 
                                                <span className="text-red-400 bg-red-400/10 px-2 py-0.5 rounded-lg text-sm font-black">▼ {Math.abs(resultB.power - resultA.power).toLocaleString()}</span> : 
                                                <span className="text-gray-600">-</span>
                                            }
                                        </div>
                                    </td>
                                </tr>

                                <tr className="bg-gradient-to-r from-purple-900/20 to-transparent hover:from-purple-900/30 transition-all duration-300 rounded-2xl group">
                                    <td className="px-6 py-5 first:rounded-l-2xl last:rounded-r-2xl border-y border-l border-purple-900/20 font-black text-white text-base">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></div>
                                            <span>졸업 종결도 (%)</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-center border-y border-purple-900/10 font-mono text-gray-400">{resultA.score.toFixed(2)}%</td>
                                    <td className="px-6 py-5 text-center border-y border-purple-900/10 font-black text-white text-lg">{resultB.score.toFixed(2)}%</td>
                                    <td className={`px-6 py-5 text-right first:rounded-l-2xl last:rounded-r-2xl border-y border-r border-purple-900/20 font-mono text-xl ${getDeltaStyle(resultB.score - resultA.score)}`}>
                                        <div className="flex items-center justify-end gap-2">
                                            {(resultB.score - resultA.score) > 0 ? 
                                                <span className="text-green-400 bg-green-400/10 px-2 py-0.5 rounded-lg text-sm font-black">+{(resultB.score - resultA.score).toFixed(2)}%</span> : 
                                                (resultB.score - resultA.score) < 0 ? 
                                                <span className="text-red-400 bg-red-400/10 px-2 py-0.5 rounded-lg text-sm font-black">{(resultB.score - resultA.score).toFixed(2)}%</span> : 
                                                <span className="text-gray-600">-</span>
                                            }
                                        </div>
                                    </td>
                                </tr>

                                {/* Spacing */}
                                <tr className="h-4"></tr>

                                {/* Overload Options */}
                                {sortedTypes.map((type, i) => {
                                    const rowA = resultA.details.ol_aggregated.find(r => r.type === type);
                                    const rowB = resultB.details.ol_aggregated.find(r => r.type === type);
                                    
                                    const valA = rowA?.val || 0;
                                    const valB = rowB?.val || 0;
                                    const diffVal = valB - valA;

                                    const cpA = rowA?.cp || 0;
                                    const cpB = rowB?.cp || 0;
                                    const diffCp = cpB - cpA;

                                    const priority = rowA?.priority_level || rowB?.priority_level || 3;

                                    return (
                                        <tr key={i} className="bg-white/[0.02] hover:bg-white/[0.05] transition-all duration-200 rounded-xl group">
                                            <td className="px-6 py-4 first:rounded-l-xl last:rounded-r-xl border-y border-l border-white/5">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black shadow-lg transform group-hover:scale-110 transition-transform ${
                                                        priority === 1 ? 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20 text-yellow-500 border border-yellow-500/30' :
                                                        priority === 2 ? 'bg-gradient-to-br from-green-500/20 to-emerald-500/20 text-green-500 border border-green-500/30' :
                                                        'bg-gray-800 text-gray-500 border border-gray-700'
                                                    }`}>
                                                        {type.substring(0, 1)}
                                                    </div>
                                                    <div>
                                                        <div className={`font-black tracking-tight ${
                                                            priority === 1 ? 'text-yellow-400' :
                                                            priority === 2 ? 'text-green-400' :
                                                            'text-gray-300'
                                                        }`}>
                                                            {type}
                                                        </div>
                                                        <div className="flex gap-1.5 mt-1">
                                                            {priority === 1 && <span className="text-[8px] px-1.5 py-0.5 bg-yellow-500/10 text-yellow-500 rounded-md border border-yellow-500/20 font-black uppercase tracking-tighter">Essential</span>}
                                                            {priority === 2 && <span className="text-[8px] px-1.5 py-0.5 bg-green-500/10 text-green-500 rounded-md border border-green-500/20 font-black uppercase tracking-tighter">Recommended</span>}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center border-y border-white/5">
                                                <div className="font-mono text-xs text-gray-500">{valA.toFixed(2)}%</div>
                                                <div className="text-[10px] text-gray-700 font-bold mt-0.5">{cpA.toLocaleString(undefined, { maximumFractionDigits: 0 })} CP</div>
                                            </td>
                                            <td className="px-6 py-4 text-center border-y border-white/5">
                                                <div className="font-mono text-sm font-black text-gray-200">{valB.toFixed(2)}%</div>
                                                <div className="text-[10px] text-gray-500 font-black mt-0.5 tracking-tighter">{cpB.toLocaleString(undefined, { maximumFractionDigits: 0 })} CP</div>
                                            </td>
                                            <td className="px-6 py-4 text-right first:rounded-l-xl last:rounded-r-xl border-y border-r border-white/5 font-mono">
                                                <div className={`text-sm font-black ${getDeltaStyle(diffVal)}`}>
                                                    {diffVal > 0 ? '+' : ''}{diffVal.toFixed(2)}%
                                                </div>
                                                <div className={`text-[10px] font-bold mt-0.5 ${getDeltaStyle(diffCp)}`}>
                                                    {diffCp > 0 ? '+' : ''}{diffCp.toLocaleString(undefined, { maximumFractionDigits: 0 })} CP
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
                
                {/* Comparison Footer Summary */}
                <div className="bg-gradient-to-r from-blue-500/10 via-transparent to-transparent border-t border-gray-800 p-8 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-700 rounded-2xl flex items-center justify-center text-3xl shadow-[0_0_20px_rgba(59,130,246,0.3)] transform -rotate-3">
                            ⚖️
                        </div>
                        <div>
                            <div className="text-white font-black text-2xl tracking-tight leading-none mb-2">
                                {(resultB.power - resultA.power) > 0 ? '전투력 상승 (Build B Up!)' :
                                 (resultB.power - resultA.power) < 0 ? '전투력 하락 (Build A Better)' : '성능 동일 (Identical)'}
                            </div>
                            <div className="text-gray-500 text-xs font-medium max-w-md">
                                Build B와 Build A의 오버로드 옵션 구성을 비교한 최종 결과입니다. 상세 증감 수치를 확인하여 최적의 빌드를 선택하세요.
                            </div>
                        </div>
                    </div>
                    <div className="text-center md:text-right bg-black/40 px-8 py-4 rounded-3xl border border-gray-800/50 backdrop-blur-sm">
                        <div className={`text-4xl font-black tracking-tighter drop-shadow-[0_0_10px_rgba(59,130,246,0.5)] ${getDeltaStyle(resultB.power - resultA.power)}`}>
                            {(resultB.power - resultA.power) > 0 ? '+' : ''}{(resultB.power - resultA.power).toLocaleString()}
                        </div>
                        <div className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mt-1 text-center md:text-right">Total CP Delta</div>
                    </div>
                </div>
            </div>
        );
    };


    return (
        <div className="space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center">
                    <span className="mr-2">⚖️</span> 옵션 비교 시뮬레이터
                    <span className="ml-3 text-[10px] px-2 py-0.5 bg-green-900/50 text-green-400 rounded border border-green-700/50">
                        💾 자동 저장
                    </span>
                </h2>
                <div className="flex gap-2">
                    <button onClick={copyCalcToCompare} className="px-2 py-1 text-xs bg-blue-800 hover:bg-blue-700 text-blue-200 rounded border border-blue-600">📊 계산기(A) → 비교(B)</button>
                    <button onClick={copyCompareToCalc} className="px-2 py-1 text-xs bg-purple-800 hover:bg-purple-700 text-purple-200 rounded border border-purple-600">⚖️ 비교(B) → 계산기(A)</button>
                </div>
            </div>

            {/* Comparison Summary */}
            {diff && (
                <div className={`p-6 rounded-3xl border transition-all duration-500 shadow-[0_10px_30px_rgba(0,0,0,0.3)] flex flex-col items-center justify-center relative overflow-hidden ${
                    diff.power > 0 ? 'bg-green-950/20 border-green-500/30 shadow-green-500/10' : 
                    diff.power < 0 ? 'bg-red-950/20 border-red-500/30 shadow-red-500/10' : 
                    'bg-gray-900/40 border-gray-700/50'
                }`}>
                    {/* Background Decorative Element */}
                    <div className={`absolute -right-4 -bottom-4 text-8xl opacity-5 transform rotate-12 pointer-events-none font-black`}>
                        {diff.power > 0 ? 'UP' : diff.power < 0 ? 'DOWN' : 'SAME'}
                    </div>

                    <div className="text-[10px] text-gray-500 font-black uppercase tracking-[0.3em] mb-2">Build B vs Build A Analysis</div>
                    
                    <div className="flex flex-col md:flex-row items-center gap-4 md:gap-12">
                        <div className="text-center">
                            <div className={`text-4xl font-black tracking-tighter drop-shadow-sm ${
                                diff.power > 0 ? 'text-green-400' : diff.power < 0 ? 'text-red-400' : 'text-gray-400'
                            }`}>
                                {diff.power > 0 ? '+' : ''}{diff.power.toLocaleString()} <span className="text-sm font-bold tracking-normal opacity-70">CP</span>
                            </div>
                            <div className="text-[10px] text-gray-500 font-bold uppercase mt-1">Combat Power Delta</div>
                        </div>

                        <div className="w-px h-12 bg-gray-800 hidden md:block"></div>

                        <div className="text-center">
                            <div className={`text-3xl font-black tracking-tight ${
                                diff.score > 0 ? 'text-green-300' : diff.score < 0 ? 'text-red-300' : 'text-gray-400'
                            }`}>
                                {diff.score > 0 ? '+' : ''}{diff.score.toFixed(2)}<span className="text-sm font-bold opacity-70">%</span>
                            </div>
                            <div className="text-[10px] text-gray-500 font-bold uppercase mt-1">Efficiency Delta</div>
                        </div>
                    </div>

                    {diff.power !== 0 && (
                        <div className={`mt-4 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest animate-bounce ${
                            diff.power > 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                            {diff.power > 0 ? 'Build B is Stronger' : 'Build A is Stronger'}
                        </div>
                    )}
                </div>
            )}

            {/* Side by Side Panels */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {renderBuildPanel("📊 전투력 계산기 (A)", buildA, resultA, 'A')}
                {renderBuildPanel("⚖️ 옵션 비교 (B)", buildB, resultB, 'B')}
            </div>

            {/* Detailed Analysis Table */}
            {renderDetailedComparison()}
        </div>
    );
}
