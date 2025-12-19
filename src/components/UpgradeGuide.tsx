import { useState, useEffect } from 'react';
import type { NikkeData } from '../data/nikkes';
import { OVERLOAD_DATA, WEAPON_OPTION_DEFAULTS } from '../data/game_constants';

interface UpgradeGuideProps {
    nikke: NikkeData;
    isEditMode?: boolean;
    onUpdate?: (field: keyof NikkeData, value: any) => void;
    onSkillUpdate?: (field: 'min' | 'efficient' | 'max', value: string) => void;
}

const SKILL_OPTIONS = ['1스킬', '2스킬', '버스트'];
const OPERATOR_OPTIONS = ['>', '='];

export default function UpgradeGuide({ nikke, isEditMode = false, onUpdate, onSkillUpdate }: UpgradeGuideProps) {
    // === Skill Priority Parsing & State ===
    // Priority string format assumption: "Item1 Op1 Item2 Op2 Item3" (e.g., "버스트 > 2스킬 = 1스킬")

    const parsePriority = (priorityStr: string) => {
        // Basic parsing: split by > or =
        // This regex splits by > or =, keeping the delimiters
        const parts = priorityStr.split(/([>=])/).map(s => s.trim()).filter(Boolean);

        // We expect structured data: [Skill, Op, Skill, Op, Skill]
        // If not matching pattern, return defaults
        if (parts.length < 1) {
            return {
                s1: '버스트', op1: '>',
                s2: '2스킬', op2: '>',
                s3: '1스킬'
            };
        }

        // Mapping simple text to our options if possible
        const normalize = (s: string) => {
            if (s.includes('1') || s.toLowerCase().includes('skill1')) return '1스킬';
            if (s.includes('2') || s.toLowerCase().includes('skill2')) return '2스킬';
            if (s.includes('버스트') || s.includes('Burst') || s.toLowerCase().includes('burst')) return '버스트';
            return s; // Fallback
        };

        return {
            s1: normalize(parts[0] || '버스트'),
            op1: parts[1] === '=' ? '=' : '>',
            s2: normalize(parts[2] || '2스킬'),
            op2: parts[3] === '=' ? '=' : '>',
            s3: normalize(parts[4] || '1스킬')
        };
    };

    const [priorityState, setPriorityState] = useState(parsePriority(nikke.skill_priority || ""));

    // Sync state when entering edit mode or nikke changes
    useEffect(() => {
        setPriorityState(parsePriority(nikke.skill_priority || ""));
    }, [nikke.skill_priority, isEditMode]);

    const handlePriorityChange = (field: keyof typeof priorityState, value: string) => {
        const newState = { ...priorityState, [field]: value };
        setPriorityState(newState);

        // Construct string
        const newString = `${newState.s1} ${newState.op1} ${newState.s2} ${newState.op2} ${newState.s3}`;
        if (onUpdate) {
            onUpdate('skill_priority', newString);
        }
    };


    // === Helpers for Overload Options ===
    const cleanOptName = (s: string) => s.replace(" 증가", "").replace(" 대미지", "").replace("최대 ", "").replace(" 수", "").trim();

    const mapToFullName = (s: string) => {
        const knownKey = Object.keys(OVERLOAD_DATA).find(k => k.includes(s) || s.includes(cleanOptName(k)));
        return knownKey || s;
    };

    const validOpts = nikke.valid_options?.length
        ? nikke.valid_options
        : nikke.options.map(mapToFullName).filter(Boolean);

    const invalidOpts = nikke.invalid_options?.length
        ? nikke.invalid_options
        : (() => {
            const weaponDefaults = WEAPON_OPTION_DEFAULTS[nikke.weapon] || {};
            return Object.keys(OVERLOAD_DATA).filter(opt => {
                const eff = weaponDefaults[opt] || 0.5;
                const isValid = validOpts.includes(opt);
                return eff === 0.0 && !isValid;
            });
        })();

    const neutralOpts = Object.keys(OVERLOAD_DATA).filter(k => !validOpts.includes(k) && !invalidOpts.includes(k));

    // === Visual Helpers ===
    const renderEmptyState = (text: string) => (
        <span className="text-gray-500 italic text-sm">{text}</span>
    );

    // Check if skill levels are effectively empty
    const isSkillsEmpty = !nikke.skills || (!nikke.skills.min && !nikke.skills.efficient && !nikke.skills.max);

    // Check if priority is empty (or effectively default/missing in data)
    const isPriorityEmpty = !nikke.skill_priority;

    // Check if overload options are empty
    const isOverloadEmpty = (!nikke.valid_options || nikke.valid_options.length === 0) && (!nikke.invalid_options || nikke.invalid_options.length === 0);

    // Check if cube is empty
    const isCubeEmpty = !nikke.cube;

    return (
        <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-700 space-y-6 animate-fadeIn">
            <h2 className="text-2xl font-bold text-white flex items-center">
                <span className="mr-2">🛠️</span> 육성 가이드
            </h2>

            {/* 1. Skills & Priority */}
            <div className="bg-black/30 p-5 rounded-lg border border-gray-800">
                <h3 className="text-gray-300 font-bold mb-3 border-b border-gray-700/50 pb-2">스킬 육성 추천</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Skill Levels */}
                    <div>
                        <div className="text-sm text-gray-500 mb-2">스킬 레벨링 (Min / Recommended / Max)</div>
                        {isEditMode ? (
                            <div className="grid grid-cols-3 gap-2">
                                <div className="space-y-1">
                                    <span className="text-xs text-gray-500 text-center block">최소</span>
                                    <input
                                        type="text"
                                        value={nikke.skills?.min || ''}
                                        onChange={e => onSkillUpdate?.('min', e.target.value)}
                                        placeholder="4/4/4"
                                        className="w-full bg-gray-800 border border-gray-700 text-white px-2 py-1.5 rounded text-center text-sm font-mono focus:border-blue-500 outline-none"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <span className="text-xs text-green-500 text-center block">추천</span>
                                    <input
                                        type="text"
                                        value={nikke.skills?.efficient || ''}
                                        onChange={e => onSkillUpdate?.('efficient', e.target.value)}
                                        placeholder="7/7/7"
                                        className="w-full bg-gray-800 border border-green-700 text-green-300 px-2 py-1.5 rounded text-center text-sm font-mono font-bold focus:border-green-500 outline-none"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <span className="text-xs text-gray-500 text-center block">종결</span>
                                    <input
                                        type="text"
                                        value={nikke.skills?.max || ''}
                                        onChange={e => onSkillUpdate?.('max', e.target.value)}
                                        placeholder="10/10/10"
                                        className="w-full bg-gray-800 border border-gray-700 text-white px-2 py-1.5 rounded text-center text-sm font-mono focus:border-blue-500 outline-none"
                                    />
                                </div>
                            </div>
                        ) : (
                            isSkillsEmpty ? renderEmptyState('스킬 육성 정보가 없습니다.') : (
                                <div className="flex items-center justify-between bg-gray-800/40 p-3 rounded-lg border border-gray-700/50">
                                    <div className="text-center">
                                        <div className="text-xs text-gray-500 mb-1">최소</div>
                                        <div className="font-mono text-gray-400">{nikke.skills?.min || '-'}</div>
                                    </div>
                                    <span className="text-gray-700">➜</span>
                                    <div className="text-center">
                                        <div className="text-xs text-green-500 mb-1">추천</div>
                                        <div className="font-mono font-bold text-green-400 text-lg">{nikke.skills?.efficient || '-'}</div>
                                    </div>
                                    <span className="text-gray-700">➜</span>
                                    <div className="text-center">
                                        <div className="text-xs text-gray-500 mb-1">종결</div>
                                        <div className="font-mono text-yellow-500">{nikke.skills?.max || '-'}</div>
                                    </div>
                                </div>
                            )
                        )}
                    </div>

                    {/* Skill Priority */}
                    <div>
                        <div className="text-sm text-gray-500 mb-2">스킬 중요도 순서</div>
                        {isEditMode ? (
                            <div className="flex items-center gap-2 bg-gray-800 p-2 rounded border border-gray-700">
                                {/* Slot 1 */}
                                <select
                                    value={priorityState.s1}
                                    onChange={e => handlePriorityChange('s1', e.target.value)}
                                    className="bg-gray-700 text-white text-xs rounded border border-gray-600 px-1 py-1 flex-1 outline-none"
                                >
                                    {SKILL_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>

                                {/* Op 1 */}
                                <select
                                    value={priorityState.op1}
                                    onChange={e => handlePriorityChange('op1', e.target.value)}
                                    className="bg-gray-900 text-gray-400 text-xs rounded border border-gray-700 px-1 py-1 font-mono outline-none w-10 text-center"
                                >
                                    {OPERATOR_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>

                                {/* Slot 2 */}
                                <select
                                    value={priorityState.s2}
                                    onChange={e => handlePriorityChange('s2', e.target.value)}
                                    className="bg-gray-700 text-white text-xs rounded border border-gray-600 px-1 py-1 flex-1 outline-none"
                                >
                                    {SKILL_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>

                                {/* Op 2 */}
                                <select
                                    value={priorityState.op2}
                                    onChange={e => handlePriorityChange('op2', e.target.value)}
                                    className="bg-gray-900 text-gray-400 text-xs rounded border border-gray-700 px-1 py-1 font-mono outline-none w-10 text-center"
                                >
                                    {OPERATOR_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>

                                {/* Slot 3 */}
                                <select
                                    value={priorityState.s3}
                                    onChange={e => handlePriorityChange('s3', e.target.value)}
                                    className="bg-gray-700 text-white text-xs rounded border border-gray-600 px-1 py-1 flex-1 outline-none"
                                >
                                    {SKILL_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                            </div>
                        ) : (
                            <div className={`p-3 rounded-lg border ${isPriorityEmpty ? 'border-gray-800 bg-gray-900/30' : 'border-gray-700 bg-gradient-to-r from-gray-800 to-gray-900'}`}>
                                {isPriorityEmpty ? (
                                    <div className="flex items-center justify-center text-gray-600 italic">
                                        <span className="mr-2">기본값:</span>
                                        <span className="font-mono">버스트 {'>'} 2스킬 {'>'} 1스킬</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center gap-2">
                                        <span className={`font-bold ${nikke.skill_priority.includes('1스킬') ? 'text-green-300' : 'text-gray-300'}`}>{priorityState.s1}</span>
                                        <span className="text-gray-500 font-mono text-xs">{priorityState.op1}</span>
                                        <span className={`font-bold ${nikke.skill_priority.includes('2스킬') ? 'text-blue-300' : 'text-gray-300'}`}>{priorityState.s2}</span>
                                        <span className="text-gray-500 font-mono text-xs">{priorityState.op2}</span>
                                        <span className={`font-bold ${nikke.skill_priority.includes('버스트') ? 'text-purple-300' : 'text-gray-300'}`}>{priorityState.s3}</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* 2. Overload Options Analysis */}
            <div className="bg-black/30 p-5 rounded-lg border border-gray-800">
                <h3 className="text-gray-300 font-bold mb-3 border-b border-gray-700/50 pb-2">⚙️ 오버로드 옵션 분석</h3>
                <p className="text-xs text-gray-500 mb-4">해당 니케의 무기({nikke.weapon}) 및 스킬셋을 기반으로 한 추천도입니다.</p>

                {isEditMode ? (
                    <div className="space-y-3">
                        <div>
                            <label className="text-xs text-green-400 block mb-1">✅ 추천 (Valid)</label>
                            <input
                                type="text"
                                value={nikke.valid_options?.join(', ') || ''}
                                onChange={e => onUpdate?.('valid_options', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                                placeholder="공격력 증가, 우월코드 대미지 증가"
                                className="w-full bg-gray-800 border border-green-700 text-white px-3 py-2 rounded"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-red-400 block mb-1">❌ 비추천 (Invalid)</label>
                            <input
                                type="text"
                                value={nikke.invalid_options?.join(', ') || ''}
                                onChange={e => onUpdate?.('invalid_options', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                                placeholder="방어력 증가"
                                className="w-full bg-gray-800 border border-red-700 text-white px-3 py-2 rounded"
                            />
                        </div>
                    </div>
                ) : (
                    isOverloadEmpty ? (
                        <div className="bg-gray-800/30 border border-gray-700/30 rounded p-6 text-center">
                            {renderEmptyState('오버로드 옵션 추천 정보가 업데이트 되지 않았습니다.')}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-green-900/10 border border-green-900/30 rounded p-3">
                                <div className="text-green-500 font-bold mb-2 flex items-center">✅ 추천 (Valid)</div>
                                <div className="space-y-1">
                                    {validOpts.length > 0 ? validOpts.map(o => (
                                        <div key={o} className="text-sm text-gray-300 flex items-center">
                                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></span>{o}
                                        </div>
                                    )) : <div className="text-sm text-gray-600">(없음)</div>}
                                </div>
                            </div>

                            <div className="bg-gray-800/30 border border-gray-700/30 rounded p-3">
                                <div className="text-gray-400 font-bold mb-2 flex items-center">➖ 무난 (Normal)</div>
                                <div className="space-y-1">
                                    {neutralOpts.length > 0 ? neutralOpts.map(o => (
                                        <div key={o} className="text-sm text-gray-500 flex items-center">
                                            <span className="w-1.5 h-1.5 bg-gray-500 rounded-full mr-2"></span>{o}
                                        </div>
                                    )) : <div className="text-sm text-gray-600">(없음)</div>}
                                </div>
                            </div>

                            <div className="bg-red-900/10 border border-red-900/30 rounded p-3">
                                <div className="text-red-500 font-bold mb-2 flex items-center">❌ 비추천 (Invalid)</div>
                                <div className="space-y-1">
                                    {invalidOpts.length > 0 ? invalidOpts.map(o => (
                                        <div key={o} className="text-sm text-gray-400 flex items-center">
                                            <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-2"></span>{o}
                                        </div>
                                    )) : <div className="text-sm text-gray-600">(없음)</div>}
                                </div>
                            </div>
                        </div>
                    )
                )}
            </div>

            {/* 3. Cube */}
            <div className="bg-black/30 p-5 rounded-lg border border-gray-800">
                <h3 className="text-gray-300 font-bold mb-3 border-b border-gray-700/50 pb-2">🧊 추천 큐브</h3>
                {isEditMode ? (
                    <input
                        type="text"
                        value={nikke.cube || ''}
                        onChange={e => onUpdate?.('cube', e.target.value)}
                        placeholder="예: 리질리언스, 바실리스크"
                        className="w-full bg-gray-800 border border-blue-700 text-white px-3 py-2 rounded"
                    />
                ) : (
                    isCubeEmpty ? renderEmptyState('추천 큐브 정보가 없습니다.') : (
                        <div className="flex flex-wrap gap-2">
                            {nikke.cube.split(',').map((c, i) => (
                                <span key={i} className="px-3 py-1.5 bg-indigo-900/30 border border-indigo-700/50 text-indigo-300 rounded-lg text-sm">
                                    {c.trim()}
                                </span>
                            ))}
                        </div>
                    )
                )}
            </div>

        </div>
    );
}
