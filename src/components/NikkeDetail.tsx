import { useState, useEffect } from 'react';
import type { NikkeData } from '../data/nikkes';
import UpgradeGuide from './UpgradeGuide';
import Calculator from './Calculator';
import OptionCompare from './OptionCompare';
import {
    codeColors, tierColors, squadOptions, classNames, classDescriptions,
    weaponNames
} from '../utils/nikkeConstants';
import { extractTagsFromSkill } from '../utils/tagExtractor';
import { TAG_DATA } from '../data/tags';
import NikkeFieldsEditor from './NikkeFieldsEditor';
interface TagInfo {
    and: string[];
    or: string[];
    not: string[];
}

interface NikkeDetailProps {
    nikke: NikkeData;
    onBack: () => void;
    onSaveNikke?: (updatedNikke: NikkeData) => void;
    highlightTags?: TagInfo;
}

type ViewTab = 'info' | 'guide' | 'calc' | 'compare' | 'team';

export default function NikkeDetail({ nikke, onBack, onSaveNikke, highlightTags = { and: [], or: [], not: [] } }: NikkeDetailProps) {
    const [activeTab, setActiveTab] = useState<ViewTab>('info');
    const [isEditMode, setIsEditMode] = useState(false);
    const [editData, setEditData] = useState<NikkeData>(nikke);

    // Reset edit data when nikke changes
    useEffect(() => {
        setEditData(nikke);
        setIsEditMode(false);
    }, [nikke]);

    const tierColor = tierColors[nikke.tier] || 'text-gray-400 border-gray-400';

    // === Edit Handlers ===
    const handleFieldChange = (field: keyof NikkeData, value: any) => {
        setEditData(prev => ({ ...prev, [field]: value }));
    };

    const handleSkillsChange = (field: 'min' | 'efficient' | 'max', value: string) => {
        setEditData(prev => ({
            ...prev,
            skills: {
                min: prev.skills?.min || '',
                efficient: prev.skills?.efficient || '',
                max: prev.skills?.max || '',
                [field]: value
            }
        }));
    };

    const handleSkillDetailChange = (skillKey: 'normal' | 'skill1' | 'skill2' | 'burst', field: string, value: any) => {
        setEditData(prev => ({
            ...prev,
            skills_detail: {
                ...(prev.skills_detail || {}),
                [skillKey]: {
                    ...(prev.skills_detail?.[skillKey] || { name: '', desc: '', tags: [] }),
                    [field]: value
                }
            }
        }));
    };

    const handleUsageStatChange = (idx: number, field: 'stars' | 'desc', value: any) => {
        setEditData(prev => {
            const stats = [...(prev.usage_stats || [])];
            if (stats[idx]) {
                stats[idx] = { ...stats[idx], [field]: value };
            }
            return { ...prev, usage_stats: stats };
        });
    };

    const handleBurstDetailChange = (stage: "2RL" | "2_5RL" | "3RL" | "3_5RL" | "4RL", field: 'value' | 'hits' | 'bonus', val: any) => {
        setEditData(prev => {
            const details = { ...(prev.burst_details || {}) };
            if (!details[stage]) {
                details[stage] = { value: 0, hits: '', bonus: '' };
            }
            details[stage] = { ...details[stage], [field]: field === 'value' ? parseFloat(val) || 0 : val };
            return { ...prev, burst_details: details };
        });
    };

    const handleSkillTagsChange = (skillKey: 'normal' | 'skill1' | 'skill2' | 'burst', tagsStr: string) => {
        const tags = tagsStr.split(',').map(t => t.trim()).filter(Boolean);
        setEditData(prev => ({
            ...prev,
            skills_detail: {
                ...prev.skills_detail,
                [skillKey]: {
                    ...(prev.skills_detail?.[skillKey] || { name: '', desc: '', tags: [] }),
                    tags
                }
            }
        }));
    };

    const handleSave = () => {
        if (onSaveNikke) {
            const updatedData = { ...editData };
            const systemTags = new Set<string>();
            if (TAG_DATA && TAG_DATA.tag_groups) {
                Object.values(TAG_DATA.tag_groups).forEach((group: any) => {
                    if (group.tags && Array.isArray(group.tags)) {
                        group.tags.forEach((t: string) => systemTags.add(t));
                    }
                });
            }

            if (updatedData.skills_detail) {
                for (const skillKey of ['skill1', 'skill2', 'burst'] as const) {
                    const skill = updatedData.skills_detail[skillKey];
                    if (skill && skill.name && skill.desc) {
                        const autoTags = extractTagsFromSkill(skill.name, skill.desc);
                        const currentTags = skill.tags || [];
                        const customTags = currentTags.filter(t => !systemTags.has(t));
                        const mergedTags = Array.from(new Set([...customTags, ...autoTags]));
                        updatedData.skills_detail[skillKey] = { ...skill, tags: mergedTags };
                    }
                }
            }
            onSaveNikke(updatedData);
            setIsEditMode(false);
        }
    };

    const handleCancelEdit = () => {
        setEditData(nikke);
        setIsEditMode(false);
    };

    const hasSelectedTags = highlightTags.and.length > 0 || highlightTags.or.length > 0 || highlightTags.not.length > 0;
    const allTags = [...highlightTags.and, ...highlightTags.or, ...highlightTags.not];

    const getTagType = (tag: string): 'and' | 'or' | 'not' | null => {
        if (highlightTags.and.some(t => t.toLowerCase() === tag.toLowerCase())) return 'and';
        if (highlightTags.or.some(t => t.toLowerCase() === tag.toLowerCase())) return 'or';
        if (highlightTags.not.some(t => t.toLowerCase() === tag.toLowerCase())) return 'not';
        return null;
    };

    const getTagColor = (type: 'and' | 'or' | 'not' | null) => {
        switch (type) {
            case 'and': return 'bg-green-500/40 text-green-200';
            case 'or': return 'bg-yellow-500/40 text-yellow-200';
            case 'not': return 'bg-red-500/40 text-red-200';
            default: return 'bg-gray-500/40 text-gray-200';
        }
    };

    const highlightText = (text: string): React.ReactNode => {
        if (!text || allTags.length === 0) return text;
        let result: React.ReactNode[] = [text];
        allTags.forEach((tag: string) => {
            const tagType = getTagType(tag);
            const colorClass = getTagColor(tagType);
            result = result.flatMap((part, idx) => {
                if (typeof part !== 'string') return part;
                const regex = new RegExp(`(${tag})`, 'gi');
                const parts = part.split(regex);
                return parts.map((p, i) =>
                    regex.test(p)
                        ? <mark key={`${idx}-${i}`} className={`${colorClass} px-0.5 rounded`}>{p}</mark>
                        : p
                );
            });
        });
        return result;
    };

    const currentData = isEditMode ? editData : nikke;

    const renderBasicTab = () => {
        if (isEditMode) {
            return (
                <NikkeFieldsEditor
                    data={editData}
                    onChange={handleFieldChange}
                    onUsageStatChange={handleUsageStatChange}
                    onBurstDetailChange={handleBurstDetailChange}
                />
            );
        }

        return (
            <div className="space-y-4">
                {/* 1. Names */}
                <div className="bg-black/30 p-4 rounded-lg border border-gray-700">
                    <h4 className="text-sm font-bold text-gray-400 mb-3">📛 이름</h4>
                    <div className="flex flex-col gap-1">
                        <span className="text-sm font-bold text-blue-400">📊 기본 능력치 & 오버로드 가이드는 [가이드] 탭을 확인해주세요.</span>
                    </div>
                </div>

                {/* 2. Classification (분류) */}
                <div className="bg-black/30 p-4 rounded-lg border border-gray-700">
                    <h4 className="text-sm font-bold text-gray-400 mb-3">📊 분류</h4>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">티어:</span>
                                <span className={`px-2 py-0.5 rounded bg-black/50 border ${tierColor} font-bold text-sm`}>{currentData.tier}</span>
                            </div>
                            {currentData.company && (
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-500">제조사:</span>
                                    <span className="px-2 py-0.5 bg-gray-800 text-gray-300 rounded text-sm">{currentData.company}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">스쿼드:</span>
                                {currentData.squad && squadOptions.includes(currentData.squad) ? (
                                    <span className="px-2 py-0.5 bg-gray-800 text-gray-300 rounded text-sm">{currentData.squad}</span>
                                ) : (
                                    <span className="px-2 py-0.5 bg-gray-800/50 text-gray-500 rounded text-sm italic">-</span>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">클래스:</span>
                                <span className="px-2 py-0.5 bg-gray-800 text-gray-300 rounded text-sm">
                                    {classDescriptions[currentData.class] || classNames[currentData.class] || currentData.class}
                                </span>
                            </div>
                            {currentData.code && (
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-500">속성:</span>
                                    <span className={`px-2 py-0.5 rounded text-sm border ${codeColors[currentData.code] || 'bg-gray-800 text-gray-300 border-gray-700'}`}>{currentData.code}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">버스트:</span>
                                <span className="px-2 py-0.5 bg-gray-800 text-gray-300 rounded text-sm">버스트 {currentData.burst}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">무기 종류:</span>
                                <span className="px-2 py-0.5 bg-gray-800 text-gray-300 rounded text-sm">{weaponNames[currentData.weapon] || currentData.weapon}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">무기 이름:</span>
                                {currentData.weapon_info?.weapon_name ? (
                                    <span className="px-2 py-0.5 bg-gray-800 text-gray-300 rounded text-sm">{currentData.weapon_info.weapon_name}</span>
                                ) : (
                                    <span className="text-xs text-gray-500">-</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. 주요 사용 콘텐츠 (통일된 UI 디자인) */}
                <div className="bg-black/30 p-6 rounded-lg border border-gray-700 mt-6 shadow-xl">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                        <span className="w-1 h-6 bg-nikke-red mr-3 inline-block rounded-full"></span>
                        3. 주요 사용 콘텐츠
                    </h3>

                    {currentData.desc && (
                        <div className="mb-6 p-4 bg-gray-900/50 border border-gray-800 rounded-lg text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                            {currentData.desc}
                        </div>
                    )}

                    <div className="overflow-x-auto">
                        <table className="w-full text-xs text-center text-gray-300 border-collapse">
                            <thead>
                                <tr className="bg-gray-800/50 text-gray-400">
                                    <th className="px-4 py-2.5 border border-gray-700 font-bold w-1/3">콘텐츠명</th>
                                    <th className="px-4 py-2.5 border border-gray-700 font-bold w-1/3 text-center">추천도</th>
                                    <th className="px-4 py-2.5 border border-gray-700 font-bold w-1/3">설명</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(currentData.usage_stats || []).map((stat: any, idx: number) => (
                                    <tr key={idx} className="hover:bg-white/5 transition-colors border-b border-gray-800/50 last:border-0">
                                        <td className="px-4 py-3 border border-gray-700 font-bold text-gray-100 bg-gray-900/20">{stat.name}</td>
                                        <td className="px-4 py-3 border border-gray-700 text-yellow-500 text-base h-12">
                                            {stat.stars > 0 ? (
                                                <div className="flex justify-center tracking-tighter">
                                                    {'★'.repeat(stat.stars)}
                                                    <span className="text-gray-800">{'★'.repeat(5 - stat.stars)}</span>
                                                </div>
                                            ) : (
                                                <span className="text-gray-600">-</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 border border-gray-700 text-gray-400 text-left">
                                            {stat.desc || ''}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* 4. Burst RL Details (버스트 수급량 상세) */}
                <div className="bg-black/30 p-4 rounded-lg border border-gray-700">
                    <h4 className="text-sm font-bold text-gray-400 mb-4 flex justify-between items-center">
                        <span>⚡ RL 단계별 버스트 수급량 (정밀 데이터)</span>
                    </h4>

                    <div className="flex bg-black/40 rounded-lg overflow-hidden border border-gray-800">
                        {(["2RL", "2_5RL", "3RL", "3_5RL", "4RL"] as const).map((stage, idx) => {
                            const data = currentData.burst_details?.[stage] || { value: 0, hits: '', bonus: '' };
                            const colors = {
                                '2RL': 'text-green-400', '2_5RL': 'text-green-500',
                                '3RL': 'text-white', '3_5RL': 'text-orange-400', '4RL': 'text-orange-500'
                            }[stage];

                            return (
                                <div key={stage} className={`flex-1 flex flex-col items-center py-3 px-1 border-gray-800 ${idx !== 4 ? 'border-r' : ''}`}>
                                    <div className={`text-xs font-black mb-1 ${colors}`}>{stage.replace('_', '.')}</div>
                                    <div className="w-8 h-[1px] bg-gray-700 mb-2" />
                                    <div className={`text-sm font-mono font-bold ${colors}`}>{data.value > 0 ? `${data.value}%` : '-'}</div>
                                    <div className="text-[10px] text-gray-500">{data.hits || '-'}</div>
                                    <div className={`text-[9px] text-gray-400 leading-none mt-1`}>{data.bonus || '-'}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    };

    const renderSkillsTab = () => {
        const renderNormalAttackSection = () => {
            const normal = currentData.skills_detail?.normal;
            const weaponInfo = currentData.weapon_info;
            return (
                <div className="p-4 rounded-lg border border-gray-700 border-l-4 border-l-gray-500 bg-gray-900/10">
                    <h4 className="text-sm font-bold text-white mb-3">일반 공격</h4>
                    {isEditMode ? (
                        <div className="space-y-3">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                <div>
                                    <label className="text-xs text-gray-500 block mb-1">무기 이름</label>
                                    <input type="text" value={weaponInfo?.weapon_name || ''}
                                        onChange={e => handleFieldChange('weapon_info', { ...weaponInfo, weapon_name: e.target.value })}
                                        className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded" />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 block mb-1">최대 장탄 수</label>
                                    <input type="number" value={weaponInfo?.max_ammo || ''}
                                        onChange={e => handleFieldChange('weapon_info', { ...weaponInfo, max_ammo: parseInt(e.target.value) || 0 })}
                                        className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded" />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 block mb-1">재장전 시간 (초)</label>
                                    <input type="number" step="0.01" value={weaponInfo?.reload_time || ''}
                                        onChange={e => handleFieldChange('weapon_info', { ...weaponInfo, reload_time: parseFloat(e.target.value) || 0 })}
                                        className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded" />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 block mb-1">조작 타입</label>
                                    <select value={weaponInfo?.control_type || ''}
                                        onChange={e => handleFieldChange('weapon_info', { ...weaponInfo, control_type: e.target.value })}
                                        className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded">
                                        <option value="">선택</option>
                                        <option value="일반형">일반형</option>
                                        <option value="차지형">차지형</option>
                                        <option value="점사형">점사형</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 block mb-1">일반 공격 설명</label>
                                <textarea value={normal?.desc || ''} onChange={e => handleSkillDetailChange('normal', 'desc', e.target.value)}
                                    className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded h-32 resize-none" />
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                <div className="bg-gray-800/50 p-3 rounded text-center">
                                    <div className="text-xs text-gray-500 mb-1">무기</div>
                                    <div className="text-sm text-white font-bold">{weaponInfo?.weapon_name || weaponNames[currentData.weapon] || currentData.weapon}</div>
                                </div>
                                <div className="bg-gray-800/50 p-3 rounded text-center">
                                    <div className="text-xs text-gray-500 mb-1">최대 장탄 수</div>
                                    <div className="text-sm text-white font-bold">{weaponInfo?.max_ammo || '-'}</div>
                                </div>
                                <div className="bg-gray-800/50 p-3 rounded text-center">
                                    <div className="text-xs text-gray-500 mb-1">재장전 시간</div>
                                    <div className="text-sm text-white font-bold">{weaponInfo?.reload_time ? `${weaponInfo.reload_time}초` : '-'}</div>
                                </div>
                                <div className="bg-gray-800/50 p-3 rounded text-center">
                                    <div className="text-xs text-gray-500 mb-1">조작 타입</div>
                                    <div className="text-sm text-white font-bold">{weaponInfo?.control_type || '-'}</div>
                                </div>
                            </div>
                            {normal?.desc && <div className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{highlightText(normal.desc)}</div>}
                        </div>
                    )}
                </div>
            );
        };

        const renderSkillSection = (skillKey: 'skill1' | 'skill2' | 'burst', label: string, borderColor: string, bgColor: string) => {
            const skill = currentData.skills_detail?.[skillKey];
            return (
                <div className={`p-4 rounded-lg border border-gray-700 border-l-4 ${borderColor} ${bgColor}`}>
                    <h4 className="text-sm font-bold text-white mb-3">{label}</h4>
                    {isEditMode ? (
                        <div className="space-y-3">
                            <input type="text" value={skill?.name || ''} onChange={e => handleSkillDetailChange(skillKey, 'name', e.target.value)}
                                placeholder="스킬 이름..." className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded" />
                            <select value={skill?.type || (skillKey === 'burst' ? '액티브' : '패시브')} onChange={e => handleSkillDetailChange(skillKey, 'type', e.target.value)}
                                className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded">
                                <option value="패시브">패시브</option>
                                <option value="액티브">액티브</option>
                            </select>
                            {skillKey === 'burst' && (
                                <input type="text" value={skill?.cooldown || ''} onChange={e => handleSkillDetailChange(skillKey, 'cooldown', e.target.value)}
                                    placeholder="예: 20.00초" className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded" />
                            )}
                            <textarea value={skill?.desc || ''} onChange={e => handleSkillDetailChange(skillKey, 'desc', e.target.value)}
                                placeholder="스킬 효과 설명..." className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded h-24 resize-none" />
                            <input type="text" value={skill?.tags?.join(', ') || ''} onChange={e => handleSkillTagsChange(skillKey, e.target.value)}
                                placeholder="테그 (쉼표 구분)" className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded" />
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <div className="text-sm font-bold text-white">{skill?.name || '정보 없음'}</div>
                                <div className="flex gap-2">
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded border ${(skill?.type || (skillKey === 'burst' ? '액티브' : '패시브')) === '패시브' ? 'bg-blue-900/30 text-blue-300 border-blue-800' : 'bg-red-900/30 text-red-300 border-red-800'}`}>
                                        {skill?.type || (skillKey === 'burst' ? '액티브' : '패시브')}
                                    </span>
                                    {skillKey === 'burst' && <span className="text-[10px] px-1.5 py-0.5 bg-gray-800 text-gray-400 rounded border border-gray-700">⌛ {skill?.cooldown || '20.00초'}</span>}
                                </div>
                            </div>
                            {skill?.desc ? <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{highlightText(skill.desc)}</p> : <p className="text-sm text-gray-500 italic">설명 없음</p>}
                            {skill?.tags && skill.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                    {skill.tags.map((tag: string, i: number) => {
                                        const tagType = getTagType(tag);
                                        const colorClasses = getTagColor(tagType);
                                        return <span key={i} className={`text-[10px] px-2 py-0.5 rounded ${colorClasses}`}>{tag}</span>;
                                    })}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            );
        };

        return (
            <div className="space-y-4">
                {hasSelectedTags && (
                    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-3">
                        <span className="text-xs text-gray-400">🏷️ 태그: </span>
                        {highlightTags.and.map((t: string, i: number) => <span key={i} className="text-xs mx-1 px-2 py-0.5 bg-green-600/50 text-green-100 rounded">AND: {t}</span>)}
                        {highlightTags.or.map((t: string, i: number) => <span key={i} className="text-xs mx-1 px-2 py-0.5 bg-yellow-600/50 text-yellow-100 rounded">OR: {t}</span>)}
                        {highlightTags.not.map((t: string, i: number) => <span key={i} className="text-xs mx-1 px-2 py-0.5 bg-red-600/50 text-red-100 rounded">NOT: {t}</span>)}
                    </div>
                )}
                {renderNormalAttackSection()}
                {renderSkillSection('skill1', '1스킬 (Skill 1)', 'border-l-green-600', 'bg-green-900/10')}
                {renderSkillSection('skill2', '2스킬 (Skill 2)', 'border-l-blue-600', 'bg-blue-900/10')}
                {renderSkillSection('burst', '버스트 (Burst)', 'border-l-purple-600', 'bg-purple-900/10')}
            </div>
        );
    };

    const renderCubeDescTab = () => (
        <div className="bg-black/30 p-4 rounded-lg border border-gray-700">
            <h4 className="text-sm font-bold text-gray-400 mb-3">📝 설명 & 메모</h4>
            {isEditMode ? (
                <textarea value={editData.desc} onChange={e => handleFieldChange('desc', e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded h-32 resize-none" />
            ) : (
                <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{currentData.desc || '설명 없음'}</p>
            )}
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto animate-fadeIn">
            <div className="flex justify-between items-center mb-4">
                <button onClick={onBack} className="flex items-center text-gray-400 hover:text-white transition-colors group">
                    <span className="mr-2 group-hover:-translate-x-1 transition-transform">←</span> 돌아가기
                </button>
                <div className="flex items-center gap-2">
                    {isEditMode ? (
                        <>
                            <button onClick={handleCancelEdit} className="px-3 py-1.5 text-sm bg-gray-700 text-gray-300 rounded">취소</button>
                            <button onClick={handleSave} className="px-4 py-1.5 text-sm bg-nikke-red text-white rounded font-bold">✓ 저장</button>
                        </>
                    ) : (
                        onSaveNikke && <button onClick={() => setIsEditMode(true)} className="px-3 py-1.5 text-sm bg-gray-800 text-gray-300 rounded border border-gray-700 flex items-center gap-2"><span>✏️</span> 편집 모드</button>
                    )}
                </div>
            </div>

            <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-t-xl p-4 border border-gray-700 border-b-0">
                <div className="flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-2xl font-bold text-white">{currentData.name}</h2>
                            {currentData.extra_info && <span className="text-xs px-2 py-0.5 bg-purple-900/50 text-purple-300 rounded">{currentData.extra_info}</span>}
                        </div>
                        <span className="text-sm text-gray-500">{currentData.name_en}</span>
                    </div>
                    <div className={`px-3 py-1 rounded bg-black/50 border ${tierColor} font-bold`}>{currentData.tier}</div>
                </div>
            </div>

            <div className="grid grid-cols-4 bg-gray-900/80 border-x border-gray-700 p-1 gap-1">
                {[
                    { key: 'info', label: '📋 정보' },
                    { key: 'guide', label: '🛠️ 가이드', color: 'bg-nikke-red' },
                    { key: 'calc', label: '📊 계산기', color: 'bg-blue-600' },
                    { key: 'compare', label: '⚖️ 비교', color: 'bg-purple-600' },
                ].map(tab => (
                    <button key={tab.key} onClick={() => setActiveTab(tab.key as ViewTab)}
                        className={`py-2 text-sm font-bold rounded transition-all ${activeTab === tab.key ? `${tab.color || 'bg-gray-700'} text-white` : 'text-gray-400 hover:text-white'}`}>
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="bg-gray-900/50 rounded-b-xl p-4 border border-gray-700 border-t-0 min-h-[400px]">
                {activeTab === 'info' && (
                    <div className="space-y-6">
                        {renderBasicTab()}
                        <hr className="border-gray-700" />
                        {renderSkillsTab()}
                        <hr className="border-gray-700" />
                        {renderCubeDescTab()}
                    </div>
                )}
                {activeTab === 'guide' && <UpgradeGuide nikke={currentData} isEditMode={isEditMode} onUpdate={handleFieldChange} onSkillUpdate={handleSkillsChange} />}
                {activeTab === 'calc' && (
                    <Calculator
                        nikke={editData}
                        onDataUpdate={(calc_data) => setEditData(prev => ({ ...prev, calc_data }))}
                    />
                )}
                {activeTab === 'compare' && (
                    <OptionCompare
                        nikke={editData}
                        onDataUpdate={(compare_data) => setEditData(prev => ({ ...prev, compare_data }))}
                    />
                )}
            </div>
        </div>
    );
}
