import { useState, useEffect } from 'react';
import type { NikkeData } from '../data/nikkes';
import { OPTION_LIST, OVERLOAD_DATA, PARTS, PART_NAMES } from '../data/game_constants';
import { calculatePowerDetailed, type AllPartOptions, type CalcResult } from '../utils/calculator';

interface CalculatorProps {
    nikke: NikkeData;
    onDataUpdate?: (data: any) => void;
}

// Default values
const defaultStats = {
    hp: 1000000,
    atk: 50000,
    def: 10000,
    s1: 10,
    s2: 10,
    burst: 10,
    cubeLvl: 0,
    colGrade: "None" as string,
    colSkill1: 0,
    colSkill2: 0
};

const createEmptyOptions = () => ({
    option1: { type: "옵션없음", stage: 0 },
    option2: { type: "옵션없음", stage: 0 },
    option3: { type: "옵션없음", stage: 0 }
});

const defaultPartOptions: AllPartOptions = {
    helmet: createEmptyOptions(),
    armor: createEmptyOptions(),
    gloves: createEmptyOptions(),
    boots: createEmptyOptions()
};

// Storage key prefix
export default function Calculator({ nikke, onDataUpdate }: CalculatorProps) {
    // Determine initial stats/options from nikke object (build) or defaults
    const getInitialStats = (n: NikkeData) => {
        const build = n.build;
        if (!build) return defaultStats;
        return {
            hp: build.stats.hp || 0,
            atk: build.stats.atk || 0,
            def: build.stats.def || 0,
            s1: build.skills.skill1 || 1,
            s2: build.skills.skill2 || 1,
            burst: build.skills.burst || 1,
            cubeLvl: build.cube_level || 1,
            colGrade: build.collection.grade || "None",
            colSkill1: build.collection.skill1 || 1,
            colSkill2: build.collection.skill2 || 1
        };
    };

    const getInitialPartOptions = (n: NikkeData): AllPartOptions => {
        const build = n.build;
        if (!build || !build.overload) return defaultPartOptions;
        
        const mapPart = (part: any) => ({
            option1: { type: part.option1?.type || "옵션없음", stage: part.option1?.stage || 0 },
            option2: { type: part.option2?.type || "옵션없음", stage: part.option2?.stage || 0 },
            option3: { type: part.option3?.type || "옵션없음", stage: part.option3?.stage || 0 },
        });

        return {
            helmet: mapPart(build.overload.helmet),
            armor: mapPart(build.overload.armor),
            gloves: mapPart(build.overload.gloves),
            boots: mapPart(build.overload.boots),
        };
    };

    const [stats, setStats] = useState(getInitialStats(nikke));
    const [partOptions, setPartOptions] = useState<AllPartOptions>(getInitialPartOptions(nikke));
    const [result, setResult] = useState<CalcResult | null>(null);

    // Sync state when nikke changes
    useEffect(() => {
        setStats(getInitialStats(nikke));
        setPartOptions(getInitialPartOptions(nikke));
    }, [nikke.id]);

    // Save data whenever it changes
    useEffect(() => {
        if (onDataUpdate) {
            const build = {
                stats: { hp: stats.hp, atk: stats.atk, def: stats.def },
                skills: { skill1: stats.s1, skill2: stats.s2, burst: stats.burst },
                cube_level: stats.cubeLvl,
                collection: { grade: stats.colGrade, skill1: stats.colSkill1, skill2: stats.colSkill2 },
                overload: partOptions
            };
            onDataUpdate(build);
        }
    }, [stats, partOptions]);

    // Recalculate whenever inputs change
    useEffect(() => {
        const res = calculatePowerDetailed(
            stats.hp, stats.atk, stats.def,
            stats.s1, stats.s2, stats.burst,
            partOptions,
            stats.cubeLvl,
            stats.colGrade, stats.colSkill1, stats.colSkill2,
            nikke.weapon,
            nikke
        );
        setResult(res);
    }, [stats, partOptions, nikke]);

    const handleStatChange = (key: keyof typeof stats, val: string | number) => {
        setStats((prev: typeof stats) => ({ ...prev, [key]: typeof val === 'string' && key === 'colGrade' ? val : Number(val) || 0 }));
    };

    const handleOptionChange = (part: keyof typeof PART_NAMES, optKey: 'option1' | 'option2' | 'option3', field: 'type' | 'stage', val: string | number) => {
        setPartOptions(prev => ({
            ...prev,
            [part]: {
                ...prev[part],
                [optKey]: {
                    ...prev[part][optKey],
                    [field]: field === 'stage' ? Number(val) : val
                }
            }
        }));
    };

    const handleReset = () => {
        setStats(defaultStats);
        setPartOptions(defaultPartOptions);
    };

    return (
        <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-700 space-y-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-bold text-white flex items-center">
                        <span className="mr-2">📊</span> 전투력 계산기
                    </h2>
                    <span className="text-[10px] px-2 py-0.5 bg-green-900/50 text-green-400 rounded border border-green-700/50">
                        💾 자동 저장
                    </span>
                    <button
                        onClick={handleReset}
                        className="text-[10px] px-2 py-0.5 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded"
                    >
                        🔄 초기화
                    </button>
                </div>
                {result && (
                    <div className="text-right">
                        <div className="text-sm text-gray-400">예상 전투력</div>
                        <div className="text-3xl font-black text-nikke-red">{result.power.toLocaleString()}</div>
                    </div>
                )}
            </div>

            {/* 1. Base Stats */}
            <div className="bg-black/30 p-4 rounded-lg border border-gray-800">
                <h3 className="text-gray-300 font-bold mb-4 flex items-center">1. 기본 스탯 & 성장</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    <div className="space-y-1">
                        <label className="text-xs text-gray-500">HP</label>
                        <input type="number" value={stats.hp} onChange={e => handleStatChange('hp', e.target.value)} className="w-full bg-gray-800 border border-gray-700 text-white px-2 py-1 rounded text-sm text-right" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs text-gray-500">공격력 (ATK)</label>
                        <input type="number" value={stats.atk} onChange={e => handleStatChange('atk', e.target.value)} className="w-full bg-gray-800 border border-gray-700 text-white px-2 py-1 rounded text-sm text-right" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs text-gray-500">방어력 (DEF)</label>
                        <input type="number" value={stats.def} onChange={e => handleStatChange('def', e.target.value)} className="w-full bg-gray-800 border border-gray-700 text-white px-2 py-1 rounded text-sm text-right" />
                    </div>
                    {/* Skills */}
                    <div className="space-y-1 lg:col-span-3 grid grid-cols-3 gap-2">
                        <div>
                            <label className="text-xs text-gray-500">스킬1 Lv</label>
                            <select value={stats.s1} onChange={e => handleStatChange('s1', e.target.value)} className="w-full bg-gray-800 text-white px-1 py-1 rounded">
                                {[...Array(11).keys()].slice(1).map(i => <option key={i} value={i}>{i}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs text-gray-500">스킬2 Lv</label>
                            <select value={stats.s2} onChange={e => handleStatChange('s2', e.target.value)} className="w-full bg-gray-800 text-white px-1 py-1 rounded">
                                {[...Array(11).keys()].slice(1).map(i => <option key={i} value={i}>{i}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs text-gray-500">버스트 Lv</label>
                            <select value={stats.burst} onChange={e => handleStatChange('burst', e.target.value)} className="w-full bg-gray-800 text-white px-1 py-1 rounded">
                                {[...Array(11).keys()].slice(1).map(i => <option key={i} value={i}>{i}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Cube & Collection */}
                    <div className="space-y-1">
                        <label className="text-xs text-gray-500">큐브 Lv</label>
                        <select value={stats.cubeLvl} onChange={e => handleStatChange('cubeLvl', e.target.value)} className="w-full bg-gray-800 text-white px-1 py-1 rounded">
                            {[...Array(16).keys()].map(i => <option key={i} value={i}>{i}</option>)}
                        </select>
                    </div>
                    <div className="space-y-1 col-span-2">
                        <label className="text-xs text-gray-500">소장품 등급/Lv</label>
                        <div className="flex gap-1">
                            <select value={stats.colGrade} onChange={e => handleStatChange('colGrade', e.target.value)} className="bg-gray-800 text-white px-1 py-1 rounded w-1/3">
                                <option value="None">없음</option>
                                <option value="R">R</option>
                                <option value="SR">SR</option>
                            </select>
                            <select value={stats.colSkill1} onChange={e => handleStatChange('colSkill1', e.target.value)} className="bg-gray-800 text-white px-1 py-1 rounded w-1/3">
                                {[0, 1, 2, 3, 4].map(i => <option key={i} value={i}>Lv{i}</option>)}
                            </select>
                            <select value={stats.colSkill2} onChange={e => handleStatChange('colSkill2', e.target.value)} className="bg-gray-800 text-white px-1 py-1 rounded w-1/3">
                                {[0, 1, 2, 3, 4].map(i => <option key={i} value={i}>Lv{i}</option>)}
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. Overload Options */}
            <div className="bg-black/30 p-4 rounded-lg border border-gray-800">
                <h3 className="text-gray-300 font-bold mb-4 flex items-center justify-between">
                    <span>2. 오버로드 장비 옵션</span>
                    {result && <span className="text-sm font-normal text-gray-400">종결도: <span className="text-white font-bold">{result.score.toFixed(1)}%</span></span>}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {PARTS.map(partKey => (
                        <div key={partKey} className="bg-gray-900/50 p-3 rounded border border-gray-700">
                            <div className="text-sm font-bold text-gray-400 mb-2">{PART_NAMES[partKey]}</div>
                            {[1, 2, 3].map(optIdx => {
                                const optKey = `option${optIdx}` as 'option1' | 'option2' | 'option3';
                                const currentOpt = partOptions[partKey][optKey];
                                const availableStages = currentOpt.type !== "옵션없음" && OVERLOAD_DATA[currentOpt.type]
                                    ? OVERLOAD_DATA[currentOpt.type].map((v: number, i: number) => ({ idx: i, val: v }))
                                    : [{ idx: 0, val: 0.00 }];

                                return (
                                    <div key={optIdx} className="flex gap-2 mb-2 last:mb-0">
                                        <select
                                            className="bg-gray-800 text-gray-200 text-xs rounded p-1.5 border border-gray-700 flex-1 w-32 truncate"
                                            value={currentOpt.type}
                                            onChange={e => handleOptionChange(partKey, optKey, 'type', e.target.value)}
                                        >
                                            {OPTION_LIST.map(o => <option key={o} value={o}>{o}</option>)}
                                        </select>
                                        <select
                                            className="bg-gray-800 text-gray-200 text-xs rounded p-1.5 border border-gray-700 w-24"
                                            value={currentOpt.stage}
                                            onChange={e => handleOptionChange(partKey, optKey, 'stage', e.target.value)}
                                        >
                                            {availableStages.map(s => (
                                                <option key={s.idx} value={s.idx}>{s.idx}단계 ({s.val}%)</option>
                                            ))}
                                        </select>
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>

            {/* 3. Analysis Table */}
            {result && (
                <div className="bg-black/30 p-4 rounded-lg border border-gray-800 overflow-hidden">
                    <h3 className="text-gray-300 font-bold mb-4">3. 효율 상세 분석</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-400">
                            <thead className="text-xs text-gray-500 uppercase bg-gray-900">
                                <tr>
                                    <th className="px-4 py-2">항목</th>
                                    <th className="px-4 py-2 text-center">수치 (Total)</th>
                                    <th className="px-4 py-2 text-center">평가</th>
                                    <th className="px-4 py-2 text-right">CP 기여</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-gray-800">
                                    <td className="px-4 py-2 font-medium text-white">기본 스탯 (깡전투력)</td>
                                    <td className="px-4 py-2 text-center">-</td>
                                    <td className="px-4 py-2 text-center">-</td>
                                    <td className="px-4 py-2 text-right">{result.details.base_cp.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                                </tr>
                                <tr className="border-b border-gray-800 bg-gray-900/20">
                                    <td className="px-4 py-2">스킬 성장도</td>
                                    <td className="px-4 py-2 text-center">{result.details.skill_pct.toFixed(1)}%</td>
                                    <td className="px-4 py-2 text-center">-</td>
                                    <td className="px-4 py-2 text-right">{result.details.skill_cp.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                                </tr>
                                {/* Overload Rows */}
                                {result.details.ol_aggregated.map((row, i) => (
                                    <tr key={i} className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors">
                                        <td className="px-4 py-1.5">
                                            <span className={row.tag === 'valid' ? 'text-green-400 font-bold' : row.tag === 'invalid' ? 'text-red-400' : 'text-gray-400'}>
                                                {row.type}
                                            </span>
                                            <span className="text-xs text-gray-600 ml-1">({row.lines}줄)</span>
                                        </td>
                                        <td className="px-4 py-1.5 text-center">
                                            {row.val.toFixed(2)}% <span className="text-xs text-gray-600">/ {row.max.toFixed(2)}%</span>
                                        </td>
                                        <td className="px-4 py-1.5 text-center">
                                            <span className={`px-2 py-0.5 rounded text-xs border ${row.tag === 'valid' ? 'border-green-900 bg-green-900/30 text-green-400' :
                                                row.tag === 'invalid' ? 'border-red-900 bg-red-900/30 text-red-500' :
                                                    'border-gray-700 bg-gray-800 text-gray-400'
                                                }`}>
                                                {row.grade}
                                            </span>
                                        </td>
                                        <td className="px-4 py-1.5 text-right">{row.cp.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
