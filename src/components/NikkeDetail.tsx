import { useState, useEffect } from 'react';
import type { NikkeData } from '../data/nikkes';
import UpgradeGuide from './UpgradeGuide';
import Calculator from './Calculator';
import OptionCompare from './OptionCompare';
import { getMasters } from '../utils/nikkeDataManager';
import { extractTagsFromSkill } from '../utils/tagExtractor';
import { TAG_DATA } from '../data/tags';
import NikkeFieldsEditor from './NikkeFieldsEditor';
import NikkeSkillsEditor from './NikkeSkillsEditor';
import NikkeOptionsEditor from './NikkeOptionsEditor';

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
    const [activeTab, setActiveTab] = useState<ViewTab>(nikke.isGuest ? 'info' : 'info');
    const [isEditMode, setIsEditMode] = useState(false);
    const [editData, setEditData] = useState<NikkeData>(nikke);
    const [isLinking, setIsLinking] = useState(false);

    const masters = getMasters();
    const colors = masters.colors || {};

    // Reset edit data when nikke changes
    useEffect(() => {
        setEditData(nikke);
        setIsEditMode(false);
        setIsLinking(false);
    }, [nikke]);

    const tierColor = colors.tier?.[nikke.tier] || 'text-gray-400 border-gray-400';

    // === Guest Management Handlers ===
    const handleGuestNameChange = (newName: string) => {
        if (!onSaveNikke) return;
        const updated = { ...nikke, name: newName };
        onSaveNikke(updated);
    };

    const handleLinkToDB = (dbNikke: NikkeData) => {
        if (!onSaveNikke) return;
        // This is a special signal to the parent to replace this guest with a DB nikke
        const updated = { ...dbNikke, _originalGuestName: nikke.name, isGuest: false };
        onSaveNikke(updated as any);
        setIsLinking(false);
    };

    const handleDeleteGuest = () => {
        if (!onSaveNikke || !window.confirm(`'${nikke.name}' 게스트 니케를 삭제하시겠습니까?`)) return;
        const updated = { ...nikke, _deleteGuest: true };
        onSaveNikke(updated as any);
        onBack();
    };

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

    const handleArrayFieldChange = (field: 'options' | 'valid_options' | 'invalid_options', value: string) => {
        const arr = value.split(',').map(t => t.trim()).filter(Boolean);
        setEditData(prev => ({ ...prev, [field]: arr }));
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
                <div className="bg-black/30 p-4 rounded-lg border border-gray-700">
                    <h4 className="text-sm font-bold text-gray-400 mb-3">📊 분류</h4>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">티어:</span>
                                <span className={`px-2 py-0.5 rounded bg-black/50 border ${tierColor} font-bold text-sm`}>{currentData.tier}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">희귀도:</span>
                                <span className={`px-2 py-0.5 rounded bg-black/50 border ${(colors as any).rarity?.[currentData.rarity || 'SSR'] || 'border-gray-700 text-gray-400'} font-bold text-sm`}>{currentData.rarity || 'SSR'}</span>
                            </div>
                            {currentData.company && (
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-500">제조사:</span>
                                    <span className="px-2 py-0.5 bg-gray-800 text-gray-300 rounded text-sm">{currentData.company}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">스쿼드:</span>
                                {currentData.squad ? (
                                    <span className="px-2 py-0.5 bg-gray-800 text-gray-300 rounded text-sm">{currentData.squad}</span>
                                ) : (
                                    <span className="px-2 py-0.5 bg-gray-800/50 text-gray-500 rounded text-sm italic">-</span>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">클래스:</span>
                                <span className="px-2 py-0.5 bg-gray-800 text-gray-300 rounded text-sm">
                                    {masters.class_descriptions?.[currentData.class] || (masters as any).class_names?.[currentData.class] || currentData.class}
                                </span>
                            </div>
                            {currentData.code && (
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-500">속성:</span>
                                    <span className={`px-2 py-0.5 rounded text-sm border ${(colors as any).code?.[currentData.code] || 'bg-gray-800 text-gray-300 border-gray-700'}`}>{currentData.code}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">버스트:</span>
                                <span className="px-2 py-0.5 bg-gray-800 text-gray-300 rounded text-sm">버스트 {currentData.burst}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">무기 종류:</span>
                                <span className="px-2 py-0.5 bg-gray-800 text-gray-300 rounded text-sm">{masters.weapon_names?.[currentData.weapon] || currentData.weapon}</span>
                            </div>
                        </div>
                    </div>
                </div>

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
            </div>
        );
    };

    const renderSkillsTab = () => {
        if (isEditMode) {
            return (
                <NikkeSkillsEditor
                    data={editData}
                    onSkillDetailChange={handleSkillDetailChange}
                    onSkillTagsChange={handleSkillTagsChange}
                    handleFieldChange={handleFieldChange}
                />
            );
        }

        const renderNormalAttackSection = () => {
            const normal = currentData.skills_detail?.normal;
            const weaponInfo = currentData.weapon_info;
            return (
                <div className="p-4 rounded-lg border border-gray-700 border-l-4 border-l-gray-500 bg-gray-900/10">
                    <h4 className="text-sm font-bold text-white mb-3">일반 공격</h4>
                    <div className="space-y-3">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div className="bg-gray-800/50 p-3 rounded text-center">
                                <div className="text-xs text-gray-500 mb-1">무기 이름</div>
                                <div className="text-sm text-white font-bold">{weaponInfo?.weapon_name || masters.weapon_names?.[currentData.weapon] || currentData.weapon}</div>
                            </div>
                            <div className="bg-gray-800/50 p-3 rounded text-center">
                                <div className="text-xs text-gray-500 mb-1">최대 장탄 수</div>
                                <div className="text-sm text-white font-bold">{weaponInfo?.max_ammo || '-'}</div>
                            </div>
                            <div className="bg-gray-800/50 p-3 rounded text-center">
                                <div className="text-xs text-gray-500 mb-1">재장전 시간 (초)</div>
                                <div className="text-sm text-white font-bold">{weaponInfo?.reload_time ? `${weaponInfo.reload_time}초` : '-'}</div>
                            </div>
                            <div className="bg-gray-800/50 p-3 rounded text-center">
                                <div className="text-xs text-gray-500 mb-1">조작 타입</div>
                                <div className="text-sm text-white font-bold">{weaponInfo?.control_type || '-'}</div>
                            </div>
                        </div>
                        <div className="mt-4">
                            <div className="text-xs text-gray-500 mb-2">일반 공격 설명</div>
                            <div className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap p-3 bg-gray-800/30 rounded border border-gray-800/50">
                                {normal?.desc ? highlightText(normal.desc) : <span className="text-gray-600 italic">설명 정보가 없습니다.</span>}
                            </div>
                        </div>
                    </div>
                </div>
            );
        };

        const renderSkillSection = (skillKey: 'skill1' | 'skill2' | 'burst', label: string, borderColor: string, bgColor: string) => {
            const skill = currentData.skills_detail?.[skillKey];
            return (
                <div className={`p-4 rounded-lg border border-gray-700 border-l-4 ${borderColor} ${bgColor}`}>
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


    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
            <div className="bg-[#0b0d11] w-full max-w-6xl max-h-[95vh] rounded-3xl border border-gray-800 shadow-2xl overflow-hidden flex flex-col">
                {/* Header with Back Button */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-900/50 p-6 border-b border-gray-800 backdrop-blur-sm shrink-0">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onBack}
                            className="p-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl transition-all shadow-lg active:scale-95"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                        </button>
                        <div>
                            <div className="flex items-center gap-3">
                                <h2 className="text-3xl font-black text-white tracking-tight">{nikke.name}</h2>
                                {nikke.isGuest && (
                                    <span className="px-2 py-1 bg-red-900/50 text-red-400 text-xs font-bold rounded border border-red-800">미등록 게스트</span>
                                )}
                            </div>
                            {nikke.name_en && <p className="text-blue-400 font-bold text-sm tracking-wide">{nikke.name_en}</p>}
                        </div>
                    </div>

                    <div className="flex gap-2">
                        {nikke.isGuest ? (
                            <div className="flex gap-2">
                                <button
                                    onClick={() => {
                                        const newName = prompt('새로운 이름을 입력하세요:', nikke.name);
                                        if (newName && newName.trim()) handleGuestNameChange(newName.trim());
                                    }}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold shadow-lg transition-all flex items-center gap-2"
                                >
                                    <span>✏️</span> 이름 수정
                                </button>
                                <button
                                    onClick={() => setIsLinking(true)}
                                    className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-xl text-sm font-bold shadow-lg transition-all flex items-center gap-2"
                                >
                                    <span>🔗</span> DB 동기화
                                </button>
                                <button
                                    onClick={handleDeleteGuest}
                                    className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-sm font-bold shadow-lg transition-all flex items-center gap-2"
                                >
                                    <span>🗑️</span> 삭제
                                </button>
                            </div>
                        ) : (
                            onSaveNikke && (
                                <button
                                    onClick={() => isEditMode ? handleSave() : setIsEditMode(true)}
                                    className={`px-6 py-2 rounded-xl text-sm font-bold shadow-lg transition-all flex items-center gap-2 ${isEditMode ? 'bg-green-600 hover:bg-green-500 text-white' : 'bg-blue-600 hover:bg-blue-500 text-white'}`}
                                >
                                    {isEditMode ? (
                                        <><span className="text-lg">💾</span> 저장하기</>
                                    ) : (
                                        <><span className="text-lg">📝</span> 정보 수정</>
                                    )}
                                </button>
                            )
                        )}
                        {isEditMode && (
                            <button
                                onClick={handleCancelEdit}
                                className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-xl text-sm font-bold shadow-lg transition-all"
                            >
                                취소
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    <div className="space-y-6">

            {/* DB Linking Overlay */}
            {isLinking && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
                    <div className="bg-gray-900 border border-green-600/50 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
                        <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-green-900/10">
                            <div>
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    <span className="text-green-500">🔗</span> DB 니케와 연결
                                </h3>
                                <p className="text-sm text-gray-400 mt-1">게스트 니케 '{nikke.name}'을(를) DB에 등록된 니케로 교체합니다.</p>
                            </div>
                            <button onClick={() => setIsLinking(false)} className="text-gray-400 hover:text-white text-xl">✕</button>
                        </div>
                        
                        <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {masters.all_nikkes?.map((n: NikkeData) => (
                                    <div 
                                        key={n.id}
                                        onClick={() => handleLinkToDB(n)}
                                        className="cursor-pointer bg-gray-800/50 border border-gray-700 p-4 rounded-xl hover:border-green-500 hover:bg-green-900/20 transition-all group"
                                    >
                                        <div className="font-bold text-white group-hover:text-green-400">{n.name}</div>
                                        <div className="text-xs text-gray-500 mt-1">{n.company} · {n.burst}버</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-t-xl p-6 border border-gray-700 border-b-0">
                <div className="flex justify-between items-start">
                    <div className="flex flex-col">
                        <div className="flex items-baseline gap-2 flex-wrap">
                            <h2 className="text-3xl font-bold text-white">{currentData.name}</h2>
                            {currentData.name_en && (
                                <span className="text-sm text-blue-400 font-bold">
                                    {currentData.name_en}
                                </span>
                            )}
                        </div>
                        {currentData.extra_info && (
                            <span className="text-sm text-orange-400 font-bold mt-1">
                                {currentData.extra_info}
                            </span>
                        )}
                        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-3 text-xs font-bold items-center">
                            <span className={(colors as any).company?.[currentData.company || ''] || 'text-gray-500'}>{currentData.company || '제조사 미정'}</span>
                            <span className="text-gray-600">|</span>
                            <span className="text-cyan-400">{currentData.squad || '스쿼드 미정'}</span>
                            <span className="text-gray-600">·</span>
                            <span className={(colors as any).burst?.[currentData.burst] || 'text-gray-400'}>{currentData.burst}버</span>
                            <span className="text-gray-600">·</span>
                            <span className={(colors as any).code_text?.[currentData.code || ''] || 'text-gray-400'}>{currentData.code}</span>
                            <span className="text-gray-600">·</span>
                            <span className={(colors as any).class?.[currentData.class] || 'text-gray-400'}>{(masters as any).class_names?.[currentData.class] || currentData.class}</span>
                            <span className="text-gray-600">·</span>
                            <span className={(colors as any).weapon?.[currentData.weapon] || 'text-amber-400'}>{(masters as any).weapon_names?.[currentData.weapon] || currentData.weapon}</span>
                        </div>
                    </div>
                    <div className={`px-4 py-2 rounded bg-black/50 border ${tierColor} font-black text-xl`}>{currentData.tier}</div>
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
                        <NikkeOptionsEditor
                            data={currentData}
                            onArrayFieldChange={handleArrayFieldChange}
                        />
                        <hr className="border-gray-700" />
                        {renderSkillsTab()}
                    </div>
                )}
                {activeTab === 'guide' && <UpgradeGuide nikke={currentData} isEditMode={isEditMode} onUpdate={handleFieldChange} onSkillUpdate={handleSkillsChange} />}
                {activeTab === 'calc' && (
                    <Calculator
                        nikke={editData}
                        onDataUpdate={(build) => setEditData(prev => ({ ...prev, build }))}
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
        </div>
    </div>
</div>
    );
}
