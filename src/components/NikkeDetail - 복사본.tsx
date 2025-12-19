import { useState, useEffect } from 'react';
import type { NikkeData } from '../data/nikkes';
import UpgradeGuide from './UpgradeGuide';
import Calculator from './Calculator';
import OptionCompare from './OptionCompare';
import {
    weaponNames, squadOptions, classNames, classDescriptions,
    codeColors, tierColors, companyOptions, codeOptions,
    tierOptions, burstOptions, weaponOptions, classOptions
} from '../utils/nikkeConstants';
import { extractTagsFromSkill } from '../utils/tagExtractor';

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

type ViewTab = 'info' | 'guide' | 'calc' | 'compare';

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

    const handleSkillDetailChange = (skillKey: 'normal' | 'skill1' | 'skill2' | 'burst', field: 'name' | 'desc' | 'type' | 'cooldown', value: string) => {
        setEditData(prev => ({
            ...prev,
            skills_detail: {
                ...prev.skills_detail,
                [skillKey]: {
                    ...(prev.skills_detail?.[skillKey] || { name: '', desc: '', tags: [] }),
                    [field]: value
                }
            }
        }));
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
            // 저장 전에 각 스킬의 태그를 자동으로 추출
            const updatedData = { ...editData };
            if (updatedData.skills_detail) {
                // skill1, skill2, burst에 대해 태그 자동 추출
                for (const skillKey of ['skill1', 'skill2', 'burst'] as const) {
                    const skill = updatedData.skills_detail[skillKey];
                    if (skill && skill.name && skill.desc) {
                        const autoTags = extractTagsFromSkill(skill.name, skill.desc);
                        // 기존 태그와 자동 추출된 태그를 병합 (중복 제거)
                        const existingTags = skill.tags || [];
                        const mergedTags = Array.from(new Set([...existingTags, ...autoTags]));
                        updatedData.skills_detail[skillKey] = {
                            ...skill,
                            tags: mergedTags
                        };
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

    // Check if any tags are selected
    const hasSelectedTags = highlightTags.and.length > 0 || highlightTags.or.length > 0 || highlightTags.not.length > 0;
    const allTags = [...highlightTags.and, ...highlightTags.or, ...highlightTags.not];

    // Get tag type for coloring
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

    // Highlight text utility with color-coded tags
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

    // === Render Tabs ===
    const renderBasicTab = () => (
        <div className="space-y-4">
            {/* 1. Names */}
            <div className="bg-black/30 p-4 rounded-lg border border-gray-700">
                <h4 className="text-sm font-bold text-gray-400 mb-3">📛 이름</h4>
                {isEditMode ? (
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs text-gray-500 block mb-1">한글 이름</label>
                            <input type="text" value={editData.name} onChange={e => handleFieldChange('name', e.target.value)}
                                className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded" />
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 block mb-1">영문 이름</label>
                            <input type="text" value={editData.name_en} onChange={e => handleFieldChange('name_en', e.target.value)}
                                className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded" />
                        </div>
                        <div className="col-span-2">
                            <label className="text-xs text-gray-500 block mb-1">추가 정보 (콜라보, 특별판 등)</label>
                            <input type="text" value={editData.extra_info || ''} onChange={e => handleFieldChange('extra_info', e.target.value)}
                                placeholder="예: 니어 오토마타, 2주년" className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded" />
                        </div>
                    </div>
                ) : (
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-xl font-bold text-white">{currentData.name}</span>
                            {currentData.extra_info && (
                                <span className="text-xs px-2 py-0.5 bg-purple-900/50 text-purple-300 rounded">{currentData.extra_info}</span>
                            )}
                        </div>
                        <span className="text-sm text-gray-500">{currentData.name_en}</span>
                    </div>
                )}
            </div>

            {/* 2. Classification (분류) */}
            <div className="bg-black/30 p-4 rounded-lg border border-gray-700">
                <h4 className="text-sm font-bold text-gray-400 mb-3">📊 분류</h4>
                {isEditMode ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        <div>
                            <label className="text-xs text-gray-500 block mb-1">티어</label>
                            <select value={editData.tier} onChange={e => handleFieldChange('tier', e.target.value)}
                                className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded">
                                {tierOptions.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 block mb-1">제조사</label>
                            <select value={editData.company || ''} onChange={e => handleFieldChange('company', e.target.value)}
                                className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded">
                                <option value="">선택</option>
                                {companyOptions.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 block mb-1">스쿼드</label>
                            <select value={editData.squad || ''} onChange={e => handleFieldChange('squad', e.target.value)}
                                className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded">
                                <option value="">선택</option>
                                {squadOptions.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 block mb-1">클래스</label>
                            <select value={editData.class} onChange={e => handleFieldChange('class', e.target.value)}
                                className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded">
                                <option value="Attacker">화력형(공격)</option>
                                <option value="Defender">방어형(탱킹)</option>
                                <option value="Supporter">지원형(버프/힐)</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 block mb-1">속성</label>
                            <select value={editData.code || ''} onChange={e => handleFieldChange('code', e.target.value)}
                                className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded">
                                <option value="">선택</option>
                                {codeOptions.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 block mb-1">버스트</label>
                            <select value={editData.burst} onChange={e => handleFieldChange('burst', e.target.value)}
                                className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded">
                                {burstOptions.map(t => <option key={t} value={t}>버스트 {t}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 block mb-1">무기 종류</label>
                            <select value={editData.weapon} onChange={e => handleFieldChange('weapon', e.target.value)}
                                className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded">
                                {weaponOptions.map(t => <option key={t} value={t}>{weaponNames[t]}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 block mb-1">무기 이름</label>
                            <input type="text" value={editData.weapon_info?.weapon_name || ''}
                                onChange={e => handleFieldChange('weapon_info', { ...editData.weapon_info, weapon_name: e.target.value })}
                                placeholder="예: 런처" className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded" />
                        </div>
                    </div>
                ) : (
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
                            {currentData.weapon_info?.weapon_name && (
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-500">무기 이름:</span>
                                    <span className="px-2 py-0.5 bg-gray-800 text-gray-300 rounded text-sm">{currentData.weapon_info.weapon_name}</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* 3. Skill Build (육성 가이드 내용) */}
            <div className="bg-black/30 p-4 rounded-lg border border-gray-700">
                <h4 className="text-sm font-bold text-gray-400 mb-3">⚡ 스킬 레벨 작업 (1스킬/2스킬/버스트)</h4>
                {isEditMode ? (
                    <>
                        <div className="grid grid-cols-3 gap-3">
                            <div>
                                <label className="text-xs text-gray-500 block mb-1">최소 컷</label>
                                <input type="text" value={editData.skills?.min || ''} onChange={e => handleSkillsChange('min', e.target.value)}
                                    placeholder="4/4/4" className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded text-center font-mono" />
                            </div>
                            <div>
                                <label className="text-xs text-green-400 block mb-1">가성비 (추천)</label>
                                <input type="text" value={editData.skills?.efficient || ''} onChange={e => handleSkillsChange('efficient', e.target.value)}
                                    placeholder="7/7/7" className="w-full bg-gray-800 border border-green-700 text-green-300 px-3 py-2 rounded text-center font-mono font-bold" />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 block mb-1">종결 (Max)</label>
                                <input type="text" value={editData.skills?.max || ''} onChange={e => handleSkillsChange('max', e.target.value)}
                                    placeholder="10/10/10" className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded text-center font-mono" />
                            </div>
                        </div>
                        <div className="mt-3">
                            <label className="text-xs text-gray-500 block mb-1">스킬 우선순위</label>
                            <input type="text" value={editData.skill_priority} onChange={e => handleFieldChange('skill_priority', e.target.value)}
                                placeholder="예: B우선, 1=2" className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded" />
                        </div>
                    </>
                ) : (
                    <>
                        <div className="grid grid-cols-3 gap-3 mb-3">
                            <div className="text-center p-3 bg-gray-800/50 rounded-lg">
                                <div className="text-xs text-gray-500 mb-1">최소</div>
                                <div className="text-lg font-mono text-gray-300">{currentData.skills?.min || '-'}</div>
                            </div>
                            <div className="text-center p-3 bg-green-900/30 rounded-lg border border-green-700/50">
                                <div className="text-xs text-green-400 mb-1">추천</div>
                                <div className="text-lg font-mono font-bold text-green-300">{currentData.skills?.efficient || '-'}</div>
                            </div>
                            <div className="text-center p-3 bg-gray-800/50 rounded-lg">
                                <div className="text-xs text-gray-500 mb-1">종결</div>
                                <div className="text-lg font-mono text-gray-300">{currentData.skills?.max || '-'}</div>
                            </div>
                        </div>
                        {currentData.skill_priority && (
                            <div className="text-sm text-gray-400 bg-gray-800/30 px-3 py-2 rounded">
                                <span className="text-gray-500">우선순위:</span> {currentData.skill_priority}
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* 4. Overload Options */}
            <div className="bg-black/30 p-4 rounded-lg border border-gray-700">
                <h4 className="text-sm font-bold text-gray-400 mb-3">🎯 오버로드 옵션</h4>
                {isEditMode ? (
                    <div className="space-y-3">
                        <div>
                            <label className="text-xs text-green-400 block mb-1">✓ 추천 옵션</label>
                            <input type="text" value={editData.valid_options?.join(', ') || ''}
                                onChange={e => handleFieldChange('valid_options', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                                placeholder="공격력 증가, 우월코드 대미지 증가"
                                className="w-full bg-gray-800 border border-green-700 text-white px-3 py-2 rounded" />
                        </div>
                        <div>
                            <label className="text-xs text-red-400 block mb-1">✗ 비추천 옵션</label>
                            <input type="text" value={editData.invalid_options?.join(', ') || ''}
                                onChange={e => handleFieldChange('invalid_options', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                                placeholder="방어력 증가"
                                className="w-full bg-gray-800 border border-red-700 text-white px-3 py-2 rounded" />
                        </div>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {currentData.valid_options && currentData.valid_options.length > 0 && (
                            <div>
                                <span className="text-xs text-green-400">✓ 추천: </span>
                                {currentData.valid_options.map((opt, i) => (
                                    <span key={i} className="text-xs mx-1 px-2 py-0.5 bg-green-900/50 text-green-300 rounded">{opt}</span>
                                ))}
                            </div>
                        )}
                        {currentData.invalid_options && currentData.invalid_options.length > 0 && (
                            <div>
                                <span className="text-xs text-red-400">✗ 비추천: </span>
                                {currentData.invalid_options.map((opt, i) => (
                                    <span key={i} className="text-xs mx-1 px-2 py-0.5 bg-red-900/50 text-red-300 rounded">{opt}</span>
                                ))}
                            </div>
                        )}
                        {(!currentData.valid_options || currentData.valid_options.length === 0) &&
                            (!currentData.invalid_options || currentData.invalid_options.length === 0) && (
                                <p className="text-sm text-gray-500 italic">옵션 정보 없음</p>
                            )}
                    </div>
                )}
            </div>

            {/* 5. Weapon Info (일반 공격) */}
            <div className="bg-black/30 p-4 rounded-lg border border-gray-700">
                <h4 className="text-sm font-bold text-gray-400 mb-3">🔫 일반 공격 정보</h4>
                {isEditMode ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div>
                            <label className="text-xs text-gray-500 block mb-1">무기 이름</label>
                            <input type="text" value={editData.weapon_info?.weapon_name || ''}
                                onChange={e => handleFieldChange('weapon_info', { ...editData.weapon_info, weapon_name: e.target.value })}
                                placeholder="런처" className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded" />
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 block mb-1">최대 장탄 수</label>
                            <input type="number" value={editData.weapon_info?.max_ammo || ''}
                                onChange={e => handleFieldChange('weapon_info', { ...editData.weapon_info, max_ammo: parseInt(e.target.value) || 0 })}
                                placeholder="6" className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded" />
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 block mb-1">재장전 시간 (초)</label>
                            <input type="number" step="0.01" value={editData.weapon_info?.reload_time || ''}
                                onChange={e => handleFieldChange('weapon_info', { ...editData.weapon_info, reload_time: parseFloat(e.target.value) || 0 })}
                                placeholder="2.00" className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded" />
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 block mb-1">조작 타입</label>
                            <select value={editData.weapon_info?.control_type || ''}
                                onChange={e => handleFieldChange('weapon_info', { ...editData.weapon_info, control_type: e.target.value })}
                                className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded">
                                <option value="">선택</option>
                                <option value="일반형">일반형</option>
                                <option value="차지형">차지형</option>
                                <option value="점사형">점사형</option>
                            </select>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="bg-gray-800/50 p-3 rounded text-center">
                            <div className="text-xs text-gray-500 mb-1">무기</div>
                            <div className="text-sm text-white font-bold">{currentData.weapon_info?.weapon_name || weaponNames[currentData.weapon]?.split(' ')[0] || currentData.weapon}</div>
                        </div>
                        <div className="bg-gray-800/50 p-3 rounded text-center">
                            <div className="text-xs text-gray-500 mb-1">최대 장탄 수</div>
                            <div className="text-sm text-white font-bold">{currentData.weapon_info?.max_ammo || '-'}</div>
                        </div>
                        <div className="bg-gray-800/50 p-3 rounded text-center">
                            <div className="text-xs text-gray-500 mb-1">재장전 시간</div>
                            <div className="text-sm text-white font-bold">{currentData.weapon_info?.reload_time ? `${currentData.weapon_info.reload_time}초` : '-'}</div>
                        </div>
                        <div className="bg-gray-800/50 p-3 rounded text-center">
                            <div className="text-xs text-gray-500 mb-1">조작 타입</div>
                            <div className="text-sm text-white font-bold">{currentData.weapon_info?.control_type || '-'}</div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

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
                                        placeholder="예: 머신건" className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded" />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 block mb-1">최대 장탄 수</label>
                                    <input type="number" value={weaponInfo?.max_ammo || ''}
                                        onChange={e => handleFieldChange('weapon_info', { ...weaponInfo, max_ammo: parseInt(e.target.value) || 0 })}
                                        placeholder="300" className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded" />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 block mb-1">재장전 시간 (초)</label>
                                    <input type="number" step="0.01" value={weaponInfo?.reload_time || ''}
                                        onChange={e => handleFieldChange('weapon_info', { ...weaponInfo, reload_time: parseFloat(e.target.value) || 0 })}
                                        placeholder="2.50" className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded" />
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
                                    placeholder="대상에게 [공격력 5.57% 대미지]..." className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded h-24 resize-none" />
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
                            {normal?.desc && (
                                <div className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{highlightText(normal.desc)}</div>
                            )}
                        </div>
                    )}
                </div>
            );
        };

        const renderSkillSection = (skillKey: 'skill1' | 'skill2' | 'burst', label: string, borderColor: string, bgColor: string) => {
            const skill = currentData.skills_detail?.[skillKey];
            return (
                <div className={`p-4 rounded-lg border border-gray-700 border-l-4 ${borderColor} ${bgColor}`}>
                    <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-bold text-white">{label}</h4>
                        {!isEditMode && skill?.type && (
                            <span className="text-xs px-2 py-0.5 bg-gray-700 text-gray-300 rounded">{skill.type}</span>
                        )}
                    </div>
                    {isEditMode ? (
                        <div className="space-y-3">
                            <div>
                                <label className="text-xs text-gray-500 block mb-1">스킬명</label>
                                <input type="text" value={skill?.name || ''} onChange={e => handleSkillDetailChange(skillKey, 'name', e.target.value)}
                                    placeholder="스킬 이름..." className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded" />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 block mb-1">스킬 타입</label>
                                <select value={skill?.type || '패시브'} onChange={e => handleSkillDetailChange(skillKey, 'type', e.target.value)}
                                    className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded">
                                    <option value="패시브">패시브</option>
                                    <option value="액티브">액티브</option>
                                </select>
                            </div>
                            {skillKey === 'burst' && (
                                <div>
                                    <label className="text-xs text-gray-500 block mb-1">재사용 시간 (초)</label>
                                    <input type="text" value={skill?.cooldown || ''} onChange={e => handleSkillDetailChange(skillKey, 'cooldown', e.target.value)}
                                        placeholder="예: 20.00초" className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded" />
                                </div>
                            )}
                            <div>
                                <label className="text-xs text-gray-500 block mb-1">스킬 설명</label>
                                <textarea value={skill?.desc || ''} onChange={e => handleSkillDetailChange(skillKey, 'desc', e.target.value)}
                                    placeholder="스킬 효과 설명..." className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded h-24 resize-none" />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 block mb-1">태그 (쉼표 구분, 저장 시 자동 추출)</label>
                                <input type="text" value={skill?.tags?.join(', ') || ''} onChange={e => handleSkillTagsChange(skillKey, e.target.value)}
                                    placeholder="공격력 증가, 버프, 아군" className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded" />
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {skill?.name && (
                                <div className="flex items-center gap-2">
                                    <div className="text-sm font-bold text-white">{skill.name}</div>
                                    {skill.type && (
                                        <span className="text-xs px-2 py-0.5 bg-gray-700 text-gray-300 rounded">{skill.type}</span>
                                    )}
                                </div>
                            )}
                            {skillKey === 'burst' && skill?.cooldown && (
                                <div className="text-xs text-gray-400">재사용 시간: {skill.cooldown}</div>
                            )}
                            {skill?.desc ? (
                                <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{highlightText(skill.desc)}</p>
                            ) : (
                                <p className="text-sm text-gray-500 italic">설명 없음</p>
                            )}
                            {skill?.tags && skill.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                    {skill.tags.map((tag: string, i: number) => {
                                        const tagType = getTagType(tag);
                                        const colorClasses = tagType === 'and' ? 'bg-green-500/30 text-green-200 border border-green-500/50' :
                                            tagType === 'or' ? 'bg-yellow-500/30 text-yellow-200 border border-yellow-500/50' :
                                                tagType === 'not' ? 'bg-red-500/30 text-red-200 border border-red-500/50' :
                                                    'bg-gray-700 text-gray-300';
                                        return (
                                            <span key={i} className={`text-[10px] px-2 py-0.5 rounded ${colorClasses}`}>{tag}</span>
                                        );
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
                        <span className="text-xs text-gray-400">🏷️ 선택된 태그: </span>
                        {highlightTags.and.map((tag: string, i: number) => (
                            <span key={`and-${i}`} className="text-xs mx-1 px-2 py-0.5 bg-green-600/50 text-green-100 rounded border border-green-500/50">AND: {tag}</span>
                        ))}
                        {highlightTags.or.map((tag: string, i: number) => (
                            <span key={`or-${i}`} className="text-xs mx-1 px-2 py-0.5 bg-yellow-600/50 text-yellow-100 rounded border border-yellow-500/50">OR: {tag}</span>
                        ))}
                        {highlightTags.not.map((tag: string, i: number) => (
                            <span key={`not-${i}`} className="text-xs mx-1 px-2 py-0.5 bg-red-600/50 text-red-100 rounded border border-red-500/50">NOT: {tag}</span>
                        ))}
                    </div>
                )}
                {renderNormalAttackSection()}
                {renderSkillSection('skill1', '1스킬 (Skill 1)', 'border-l-green-600', 'bg-green-900/10')}
                {renderSkillSection('skill2', '2스킬 (Skill 2)', 'border-l-blue-600', 'bg-blue-900/10')}
                {renderSkillSection('burst', '버스트 (Burst)', 'border-l-purple-600', 'bg-purple-900/10')}
            </div>
        );
    };

    // Cube & Description Tab (마지막)
    const renderCubeDescTab = () => (
        <div className="space-y-4">
            <div className="bg-black/30 p-4 rounded-lg border border-gray-700">
                <h4 className="text-sm font-bold text-blue-400 mb-3">🧊 추천 큐브</h4>
                {isEditMode ? (
                    <input type="text" value={editData.cube} onChange={e => handleFieldChange('cube', e.target.value)}
                        placeholder="예: 리질리언스, 바실리스크"
                        className="w-full bg-gray-800 border border-blue-700 text-white px-3 py-2 rounded" />
                ) : (
                    currentData.cube ? (
                        <div className="flex flex-wrap gap-2">
                            {currentData.cube.split(',').map((c, i) => (
                                <span key={i} className="px-3 py-1.5 bg-blue-900/50 text-blue-300 rounded-lg border border-blue-700/50 text-sm font-bold">
                                    🧊 {c.trim()}
                                </span>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500 italic">큐브 정보 없음</p>
                    )
                )}
            </div>

            <div className="bg-black/30 p-4 rounded-lg border border-gray-700">
                <h4 className="text-sm font-bold text-gray-400 mb-3">📝 설명 & 메모</h4>
                {isEditMode ? (
                    <textarea value={editData.desc} onChange={e => handleFieldChange('desc', e.target.value)}
                        placeholder="이 니케에 대한 설명, 운용법, 메모 등..."
                        className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded h-32 resize-none" />
                ) : (
                    currentData.desc ? (
                        <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{currentData.desc}</p>
                    ) : (
                        <p className="text-sm text-gray-500 italic">설명 없음</p>
                    )
                )}
            </div>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto animate-fadeIn">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
                <button onClick={onBack} className="flex items-center text-gray-400 hover:text-white transition-colors group">
                    <span className="mr-2 group-hover:-translate-x-1 transition-transform">←</span>
                    검색 목록으로 돌아가기
                </button>
                <div className="flex items-center gap-2">
                    {isEditMode ? (
                        <>
                            <button onClick={handleCancelEdit}
                                className="px-3 py-1.5 text-sm bg-gray-700 hover:bg-gray-600 text-gray-300 rounded">
                                취소
                            </button>
                            <button onClick={handleSave}
                                className="px-4 py-1.5 text-sm bg-nikke-red hover:bg-red-700 text-white rounded font-bold">
                                ✓ 저장
                            </button>
                        </>
                    ) : (
                        onSaveNikke && (
                            <button onClick={() => setIsEditMode(true)}
                                className="px-3 py-1.5 text-sm bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded border border-gray-700 flex items-center gap-2">
                                <span>✏️</span> 편집 모드
                            </button>
                        )
                    )}
                </div>
            </div>

            {/* Nikke Header Card */}
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-t-xl p-4 border border-gray-700 border-b-0">
                <div className="flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-2xl font-bold text-white">{currentData.name}</h2>
                            {currentData.extra_info && (
                                <span className="text-xs px-2 py-0.5 bg-purple-900/50 text-purple-300 rounded">{currentData.extra_info}</span>
                            )}
                            {isEditMode && (
                                <span className="text-xs px-2 py-0.5 bg-yellow-900/50 text-yellow-300 rounded animate-pulse">편집 중</span>
                            )}
                        </div>
                        <span className="text-sm text-gray-500">{currentData.name_en}</span>
                    </div>
                    <div className={`px-3 py-1 rounded bg-black/50 border ${tierColor} font-bold`}>
                        {currentData.tier}
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="grid grid-cols-4 bg-gray-900/80 border-x border-gray-700 p-1 gap-1">
                {[
                    { key: 'info', label: '📋 정보' },
                    { key: 'guide', label: '🛠️ 가이드', color: 'bg-nikke-red' },
                    { key: 'calc', label: '📊 계산기', color: 'bg-blue-600' },
                    { key: 'compare', label: '⚖️ 비교', color: 'bg-purple-600' }
                ].map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key as ViewTab)}
                        className={`py-2 text-sm font-bold rounded transition-all ${activeTab === tab.key
                            ? `${tab.color || 'bg-gray-700'} text-white shadow-lg`
                            : 'text-gray-400 hover:text-white hover:bg-gray-800'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
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
                {activeTab === 'guide' && <UpgradeGuide nikke={currentData} />}
                {activeTab === 'calc' && <Calculator nikke={currentData} />}
                {activeTab === 'compare' && <OptionCompare nikke={currentData} />}
            </div>
        </div>
    );
}
