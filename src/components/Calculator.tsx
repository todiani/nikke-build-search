import { useState, useEffect } from 'react';
import type { NikkeData } from '../data/nikkes';
import { OPTION_LIST, OVERLOAD_DATA, PARTS, PART_NAMES } from '../data/game_constants';
import { calculatePowerDetailed, type AllPartOptions, type CalcResult } from '../utils/calculator';
import { parseExtractorData } from '../utils/extractorParser';
import { normalizeName } from '../utils/nikkeConstants';

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
        if (!n) return defaultStats;
        const build = n.build;
        if (!build) return defaultStats;
        
        return {
            hp: build.stats?.hp || defaultStats.hp,
            atk: build.stats?.atk || defaultStats.atk,
            def: build.stats?.def || defaultStats.def,
            s1: build.skills?.skill1 || 1,
            s2: build.skills?.skill2 || 1,
            burst: build.skills?.burst || 1,
            cubeLvl: build.cube_level || 1,
            colGrade: build.collection?.grade || "None",
            colSkill1: build.collection?.skill1 || 1,
            colSkill2: build.collection?.skill2 || 1
        };
    };

    const getInitialPartOptions = (n: NikkeData): AllPartOptions => {
        if (!n) return defaultPartOptions;
        const build = n.build;
        if (!build || !build.overload) return defaultPartOptions;
        
        const mapPart = (part: any) => {
            if (!part) return createEmptyOptions();
            return {
                option1: { type: (part.option1?.type === "None" ? "옵션없음" : part.option1?.type) || "옵션없음", stage: part.option1?.stage || 0 },
                option2: { type: (part.option2?.type === "None" ? "옵션없음" : part.option2?.type) || "옵션없음", stage: part.option2?.stage || 0 },
                option3: { type: (part.option3?.type === "None" ? "옵션없음" : part.option3?.type) || "옵션없음", stage: part.option3?.stage || 0 },
            };
        };

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
    const [loadingExtractor, setLoadingExtractor] = useState(false);

    const handleLoadFromExtractor = async () => {
        setLoadingExtractor(true);
        try {
            const listRes = await fetch('/api/extractor/list');
            if (!listRes.ok) throw new Error('Failed to fetch extractor list');
            const files: string[] = await listRes.json();
            
            // 이름 정규화 후 매칭 (예: "라피 : 레드 후드" vs "라피 - 레드 후드(16).json")
            const targetNorm = normalizeName(nikke.name);
            const match = files.find(f => normalizeName(f.replace('.json', '')) === targetNorm);
            
            if (!match) {
                alert(`${nikke.name}에 해당하는 추출 데이터를 찾을 수 없습니다.`);
                return;
            }
            
            const dataRes = await fetch(`/api/extractor/data/${encodeURIComponent(match)}`);
            if (!dataRes.ok) throw new Error('Failed to fetch extractor data');
            const rawData = await dataRes.json();
            
            const { stats: extStats, overload: extOverload } = parseExtractorData(rawData);
            
            setStats(prev => ({
                ...prev,
                hp: extStats.hp,
                atk: extStats.atk,
                def: extStats.def,
                s1: extStats.s1,
                s2: extStats.s2,
                burst: extStats.burst,
                cubeLvl: extStats.cubeLvl,
                colGrade: extStats.colGrade,
                colSkill1: extStats.colSkill1,
                colSkill2: extStats.colSkill2
            }));
            setPartOptions(extOverload);
            
            alert(`${nikke.name}의 데이터를 성공적으로 불러왔습니다.`);
        } catch (error) {
            console.error('Extractor Load Error:', error);
            alert('데이터를 불러오는 중 오류가 발생했습니다.');
        } finally {
            setLoadingExtractor(false);
        }
    };

    // Sync state when nikke changes
    useEffect(() => {
        setStats(getInitialStats(nikke));
        setPartOptions(getInitialPartOptions(nikke));
    }, [nikke.id, JSON.stringify(nikke.build)]);

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
        try {
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
        } catch (error) {
            console.error("Calculator Error:", error);
            setResult(null);
        }
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
                        className="text-[10px] px-2 py-0.5 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded flex items-center gap-1"
                    >
                        <span>🔄</span> 초기화
                    </button>
                    <button
                        onClick={() => {
                            const newOptions = { ...partOptions };
                            PARTS.forEach(part => {
                                [1, 2, 3].forEach(idx => {
                                    const optKey = `option${idx}` as keyof typeof newOptions.helmet;
                                    if (newOptions[part][optKey].type !== "옵션없음") {
                                        newOptions[part][optKey] = { ...newOptions[part][optKey], stage: 15 };
                                    }
                                });
                            });
                            setPartOptions(newOptions);
                        }}
                        className="text-[10px] px-2 py-0.5 bg-orange-900/50 hover:bg-orange-800/50 text-orange-400 rounded border border-orange-700/50 flex items-center gap-1"
                    >
                        <span>⚡</span> 전체 15단계
                    </button>
                    <button
                        onClick={handleLoadFromExtractor}
                        disabled={loadingExtractor}
                        className={`text-[10px] px-2 py-0.5 rounded transition-colors flex items-center gap-1 ${
                            loadingExtractor 
                                ? 'bg-blue-900/50 text-blue-400 cursor-not-allowed' 
                                : 'bg-blue-700 hover:bg-blue-600 text-white'
                        }`}
                    >
                        {loadingExtractor ? '⌛ 불러오는 중...' : '📥 데이터 불러오기'}
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
                                <option value="SSR">SSR</option>
                            </select>
                            <select value={stats.colSkill1} onChange={e => handleStatChange('colSkill1', e.target.value)} className="bg-gray-800 text-white px-1 py-1 rounded w-1/3">
                                {[...Array(16).keys()].map(i => <option key={i} value={i}>Lv{i}</option>)}
                            </select>
                            <select value={stats.colSkill2} onChange={e => handleStatChange('colSkill2', e.target.value)} className="bg-gray-800 text-white px-1 py-1 rounded w-1/3">
                                {[...Array(16).keys()].map(i => <option key={i} value={i}>Lv{i}</option>)}
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
                    {/* Left Column: Helmet & Gloves */}
                    <div className="space-y-6">
                        {['helmet', 'gloves'].map(partKey => {
                            const pk = partKey as keyof typeof PART_NAMES;
                            return (
                                <div key={pk} className="bg-gray-900/50 p-3 rounded border border-gray-700">
                                    <div className="text-sm font-bold text-gray-400 mb-2">{PART_NAMES[pk]}</div>
                                    {[1, 2, 3].map(optIdx => {
                                        const optKey = `option${optIdx}` as 'option1' | 'option2' | 'option3';
                                        const currentOpt = partOptions[pk][optKey];
                                        const availableStages = currentOpt.type !== "옵션없음" && OVERLOAD_DATA[currentOpt.type]
                                            ? OVERLOAD_DATA[currentOpt.type].map((v: number, i: number) => ({ idx: i, val: v }))
                                            : [{ idx: 0, val: 0.00 }];

                                        return (
                                            <div key={optIdx} className="flex gap-2 mb-2 last:mb-0 group/opt">
                                                <div className="relative flex-1 min-w-0">
                                                    <select
                                                        className="w-full bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs rounded-lg p-2 border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all appearance-none"
                                                        value={currentOpt.type}
                                                        onChange={e => handleOptionChange(pk, optKey, 'type', e.target.value)}
                                                    >
                                                        {OPTION_LIST.map(o => <option key={o} value={o}>{o}</option>)}
                                                    </select>
                                                    <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[10px] text-gray-500">▼</div>
                                                </div>
                                                <div className="relative w-28">
                                                    <select
                                                        className={`w-full bg-gray-800 hover:bg-gray-700 text-xs rounded-lg p-2 border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all appearance-none text-right pr-6 ${currentOpt.stage >= 11 ? 'text-orange-400 font-bold' : currentOpt.stage >= 6 ? 'text-blue-400' : 'text-gray-300'}`}
                                                        value={currentOpt.stage}
                                                        onChange={e => handleOptionChange(pk, optKey, 'stage', e.target.value)}
                                                    >
                                                        {availableStages.map(s => (
                                                              <option key={s.idx} value={s.idx} className="bg-gray-900 text-gray-200">
                                                                  {currentOpt.type === "옵션없음" ? '선택 안함' : `${s.idx + 1}단계(${s.val}%)`}
                                                              </option>
                                                          ))}
                                                    </select>
                                                    <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[10px] text-gray-500">▼</div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        })}
                    </div>

                    {/* Right Column: Armor & Boots */}
                    <div className="space-y-6">
                        {['armor', 'boots'].map(partKey => {
                            const pk = partKey as keyof typeof PART_NAMES;
                            return (
                                <div key={pk} className="bg-gray-900/50 p-3 rounded border border-gray-700">
                                    <div className="text-sm font-bold text-gray-400 mb-2">{PART_NAMES[pk]}</div>
                                    {[1, 2, 3].map(optIdx => {
                                        const optKey = `option${optIdx}` as 'option1' | 'option2' | 'option3';
                                        const currentOpt = partOptions[pk][optKey];
                                        const availableStages = currentOpt.type !== "옵션없음" && OVERLOAD_DATA[currentOpt.type]
                                            ? OVERLOAD_DATA[currentOpt.type].map((v: number, i: number) => ({ idx: i, val: v }))
                                            : [{ idx: 0, val: 0.00 }];

                                        return (
                                            <div key={optIdx} className="flex gap-2 mb-2 last:mb-0 group/opt">
                                                <div className="relative flex-1 min-w-0">
                                                    <select
                                                        className="w-full bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs rounded-lg p-2 border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all appearance-none"
                                                        value={currentOpt.type}
                                                        onChange={e => handleOptionChange(pk, optKey, 'type', e.target.value)}
                                                    >
                                                        {OPTION_LIST.map(o => <option key={o} value={o}>{o}</option>)}
                                                    </select>
                                                    <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[10px] text-gray-500">▼</div>
                                                </div>
                                                <div className="relative w-28">
                                                    <select
                                                        className={`w-full bg-gray-800 hover:bg-gray-700 text-xs rounded-lg p-2 border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all appearance-none text-right pr-6 ${currentOpt.stage >= 11 ? 'text-orange-400 font-bold' : currentOpt.stage >= 6 ? 'text-blue-400' : 'text-gray-300'}`}
                                                        value={currentOpt.stage}
                                                        onChange={e => handleOptionChange(pk, optKey, 'stage', e.target.value)}
                                                    >
                                                        {availableStages.map(s => (
                                                            <option key={s.idx} value={s.idx} className="bg-gray-900 text-gray-200">
                                                                {currentOpt.type === "옵션없음" ? '선택 안함' : `${s.idx + 1}단계(${s.val}%)`}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[10px] text-gray-500">▼</div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* 3. Analysis Table */}
            {result && (
                <div className="bg-black/40 rounded-2xl border border-gray-700 overflow-hidden shadow-2xl mt-8">
                    <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-6 py-5 border-b border-gray-700 flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-nikke-red/20 rounded-xl flex items-center justify-center border border-nikke-red/30">
                                <span className="text-2xl">📊</span>
                            </div>
                            <div>
                                <h3 className="text-white font-black text-lg">3. 효율 상세 분석</h3>
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Efficiency Detailed Analysis</p>
                            </div>
                        </div>
                        
                        <div className="flex gap-6 items-center bg-black/40 px-6 py-3 rounded-2xl border border-gray-800/50">
                            <div className="text-center">
                                <div className="text-[10px] text-gray-500 uppercase font-black tracking-tighter mb-1">빌드 종결도</div>
                                <div className="flex items-center gap-3">
                                    <div className="w-32 h-2 bg-gray-800 rounded-full overflow-hidden border border-gray-700">
                                        <div 
                                            className={`h-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(255,51,51,0.5)] ${
                                                result.score >= 90 ? 'bg-gradient-to-r from-red-500 to-orange-400' :
                                                result.score >= 70 ? 'bg-gradient-to-r from-blue-500 to-cyan-400' :
                                                'bg-gradient-to-r from-gray-600 to-gray-400'
                                            }`} 
                                            style={{ width: `${Math.min(100, result.score)}%` }}
                                        ></div>
                                    </div>
                                    <span className={`text-2xl font-black ${
                                        result.score >= 90 ? 'text-nikke-red' :
                                        result.score >= 70 ? 'text-blue-400' :
                                        'text-gray-400'
                                    }`}>{result.score.toFixed(1)}%</span>
                                </div>
                            </div>
                            <div className="w-px h-10 bg-gray-800"></div>
                            <div className="text-right">
                                <div className="text-[10px] text-gray-500 uppercase font-black tracking-tighter mb-1">최종 예상 전투력</div>
                                <div className="text-2xl font-black text-white tracking-tighter">
                                    {result.power.toLocaleString()} <span className="text-[10px] text-gray-500 font-normal ml-0.5">CP</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-4">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left border-separate border-spacing-y-2">
                                <thead className="text-[11px] text-gray-500 uppercase font-black">
                                    <tr>
                                        <th className="px-6 py-3">분석 항목</th>
                                        <th className="px-6 py-3 text-center">현재 수치 / 비율</th>
                                        <th className="px-6 py-3 text-center">효율 점수</th>
                                        <th className="px-6 py-3 text-right">상세 정보</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {result.details.ol_aggregated.map((item, idx) => {
                                        const getPriorityColor = (p: number) => {
                                            switch(p) {
                                                case 1: return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30';
                                                case 2: return 'bg-green-500/10 text-green-500 border-green-500/30';
                                                default: return 'bg-gray-500/10 text-gray-500 border-gray-500/30';
                                            }
                                        };

                                        const getStatIcon = (name: string) => {
                                            if (name.includes('공격력')) return '⚔️';
                                            if (name.includes('장탄')) return '🔋';
                                            if (name.includes('우월코드')) return '🌟';
                                            if (name.includes('차지 속도')) return '⚡';
                                            if (name.includes('차지 대미지')) return '🎯';
                                            if (name.includes('명중률')) return '👁️';
                                            if (name.includes('크리티컬')) return '💥';
                                            if (name.includes('체력')) return '❤️';
                                            if (name.includes('방어력')) return '🛡️';
                                            return '🔹';
                                        };

                                        return (
                                            <tr key={idx} className="group hover:bg-white/5 transition-all duration-300">
                                                <td className="px-6 py-5 bg-gray-900/60 rounded-l-2xl border-l border-y border-gray-800/50">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 bg-gray-800 rounded-xl flex items-center justify-center text-xl shadow-inner group-hover:scale-110 transition-transform">
                                                            {getStatIcon(item.type)}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-gray-200 group-hover:text-white transition-colors text-base">{item.type}</div>
                                                            <div className={`mt-1 text-[9px] px-2 py-0.5 rounded-full border inline-block font-black uppercase tracking-wider ${getPriorityColor(item.priority_level)}`}>
                                                                {item.priority_level === 1 ? 'Core Priority' : item.priority_level === 2 ? 'Sub Priority' : 'Utility'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5 bg-gray-900/60 border-y border-gray-800/50 text-center">
                                                    <div className="text-white font-black text-lg tracking-tighter">{item.val.toFixed(2)}%</div>
                                                    <div className="text-[10px] text-gray-500 font-bold mt-1">최대치 대비 {item.pct.toFixed(1)}%</div>
                                                </td>
                                                <td className="px-6 py-5 bg-gray-900/60 border-y border-gray-800/50">
                                                    <div className="flex flex-col items-center gap-2">
                                                        <div className="w-full max-w-[120px] h-2 bg-black/60 rounded-full overflow-hidden border border-gray-800 shadow-inner">
                                                            <div 
                                                                className={`h-full transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(255,255,255,0.1)] ${
                                                                    item.pct > 85 ? 'bg-gradient-to-r from-green-500 to-emerald-400' :
                                                                    item.pct > 50 ? 'bg-gradient-to-r from-blue-500 to-cyan-400' :
                                                                    'bg-gradient-to-r from-gray-600 to-gray-500'
                                                                }`}
                                                                style={{ width: `${item.pct}%` }}
                                                            ></div>
                                                        </div>
                                                        <div className={`text-[11px] font-black tracking-tighter ${
                                                            item.pct > 85 ? 'text-green-400' :
                                                            item.pct > 50 ? 'text-blue-400' :
                                                            'text-gray-500'
                                                        }`}>{item.pct.toFixed(1)}% Score</div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5 bg-gray-900/60 rounded-r-2xl border-r border-y border-gray-800/50 text-right">
                                                    <div className="text-xs text-gray-400 font-medium">
                                                        CP Contribution
                                                    </div>
                                                    <div className="text-white font-black text-base mt-0.5">
                                                        +{item.cp.toLocaleString()} <span className="text-[9px] text-gray-600 font-normal">CP</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-nikke-red/10 via-transparent to-transparent border-t border-gray-800 p-8 flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 bg-gradient-to-br from-nikke-red to-red-700 rounded-2xl flex items-center justify-center text-3xl shadow-[0_0_20px_rgba(255,51,51,0.3)] transform -rotate-3">
                                🏆
                            </div>
                            <div>
                                <div className="text-white font-black text-2xl tracking-tight leading-none mb-2">
                                    {result.score >= 95 ? '신급 종결 (God Roll)' :
                                     result.score >= 90 ? '최상급 종결 (Top Tier)' :
                                     result.score >= 80 ? '우수 빌드 (Great)' :
                                     result.score >= 60 ? '실전 가능 (Usable)' : '개조 필요 (Needs Reroll)'}
                                </div>
                                <div className="text-gray-500 text-xs font-medium max-w-md">
                                    현재 장착된 오버로드 옵션의 종류와 수치를 분석한 종합 결과입니다. 권장 옵션 확보 시 더 높은 점수를 획득할 수 있습니다.
                                </div>
                            </div>
                        </div>
                        <div className="text-center md:text-right bg-black/40 px-8 py-4 rounded-3xl border border-gray-800/50 backdrop-blur-sm">
                            <div className="text-nikke-red text-4xl font-black tracking-tighter drop-shadow-[0_0_10px_rgba(255,51,51,0.5)]">
                                {result.power.toLocaleString()}
                            </div>
                            <div className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Estimated Total Power</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
