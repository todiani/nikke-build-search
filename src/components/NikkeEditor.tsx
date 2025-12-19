import { useState } from 'react';
import type { NikkeData } from '../data/nikkes';
import {
    weaponNames, squadOptions, classNames, classDescriptions,
    codeColors, tierColors, companyOptions, codeOptions,
    tierOptions, burstOptions, weaponOptions, classOptions
} from '../utils/nikkeConstants';
import { extractTagsFromSkill } from '../utils/tagExtractor';

interface NikkeEditorProps {
    nikke: NikkeData;
    onSave: (updated: NikkeData) => void;
    onClose: () => void;
}

export default function NikkeEditor({ nikke, onSave, onClose }: NikkeEditorProps) {
    const [editData, setEditData] = useState<NikkeData>({ ...nikke });
    const [activeSection, setActiveSection] = useState<'basic' | 'skills' | 'options'>('basic');

    const handleChange = (field: keyof NikkeData, value: any) => {
        setEditData(prev => ({ ...prev, [field]: value }));
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

    const handleOptionsChange = (optionsStr: string) => {
        const options = optionsStr.split(',').map(t => t.trim()).filter(Boolean);
        setEditData(prev => ({ ...prev, options }));
    };

    const handleSave = () => {
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
        onSave(updatedData);
    };

    return (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fadeIn">
            <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl">
                <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-gray-800 rounded-t-xl">
                    <h2 className="text-xl font-bold text-white flex items-center">
                        <span className="mr-2">✏️</span> 니케 데이터 편집: {nikke.name}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white px-2 text-xl">✕</button>
                </div>

                {/* Section Tabs */}
                <div className="flex border-b border-gray-700 bg-gray-800/50">
                    {(['basic', 'skills', 'options'] as const).map(sec => (
                        <button
                            key={sec}
                            onClick={() => setActiveSection(sec)}
                            className={`px-4 py-2 text-sm font-bold transition-colors ${activeSection === sec ? 'text-nikke-red border-b-2 border-nikke-red' : 'text-gray-400 hover:text-white'}`}
                        >
                            {sec === 'basic' ? '📋 기본정보' : sec === 'skills' ? '⚡ 스킬' : '🎯 옵션'}
                        </button>
                    ))}
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {activeSection === 'basic' && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-gray-400 block mb-1">이름 (한글)</label>
                                    <input
                                        type="text"
                                        value={editData.name}
                                        onChange={e => handleChange('name', e.target.value)}
                                        className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 block mb-1">이름 (영문)</label>
                                    <input
                                        type="text"
                                        value={editData.name_en}
                                        onChange={e => handleChange('name_en', e.target.value)}
                                        className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded"
                                    />
                                </div>
                            </div>
                            <div className="bg-black/30 p-4 rounded-lg border border-gray-700">
                                <h4 className="text-sm font-bold text-gray-400 mb-3">📊 분류</h4>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    <div>
                                        <label className="text-xs text-gray-500 block mb-1">티어</label>
                                        <select value={editData.tier} onChange={e => handleChange('tier', e.target.value)}
                                            className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded">
                                            {tierOptions.map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 block mb-1">제조사</label>
                                        <select value={editData.company || ''} onChange={e => handleChange('company', e.target.value)}
                                            className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded">
                                            <option value="">선택</option>
                                            {companyOptions.map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 block mb-1">스쿼드</label>
                                        <select value={editData.squad || ''} onChange={e => handleChange('squad', e.target.value)}
                                            className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded">
                                            <option value="">선택</option>
                                            {squadOptions.map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 block mb-1">클래스</label>
                                        <select value={editData.class} onChange={e => handleChange('class', e.target.value)}
                                            className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded">
                                            <option value="Attacker">화력형(공격)</option>
                                            <option value="Defender">방어형(탱킹)</option>
                                            <option value="Supporter">지원형(버프/힐)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 block mb-1">속성</label>
                                        <select value={editData.code || ''} onChange={e => handleChange('code', e.target.value)}
                                            className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded">
                                            <option value="">선택</option>
                                            {codeOptions.map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 block mb-1">버스트</label>
                                        <select value={editData.burst} onChange={e => handleChange('burst', e.target.value)}
                                            className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded">
                                            {burstOptions.map(t => <option key={t} value={t}>버스트 {t}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 block mb-1">무기 종류</label>
                                        <select value={editData.weapon} onChange={e => handleChange('weapon', e.target.value)}
                                            className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded">
                                            {weaponOptions.map(t => <option key={t} value={t}>{weaponNames[t]}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 block mb-1">무기 이름</label>
                                        <input type="text" value={editData.weapon_info?.weapon_name || ''}
                                            onChange={e => handleChange('weapon_info', { ...editData.weapon_info, weapon_name: e.target.value })}
                                            placeholder="예: 런처" className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded" />
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-gray-400 block mb-1">스킬 우선순위</label>
                                <input
                                    type="text"
                                    value={editData.skill_priority}
                                    onChange={e => handleChange('skill_priority', e.target.value)}
                                    className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded"
                                    placeholder="버스트 > 1스킬 > 2스킬"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-gray-400 block mb-1">추천 큐브</label>
                                <input
                                    type="text"
                                    value={editData.cube}
                                    onChange={e => handleChange('cube', e.target.value)}
                                    className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-gray-400 block mb-1">설명 (desc)</label>
                                <textarea
                                    value={editData.desc}
                                    onChange={e => handleChange('desc', e.target.value)}
                                    className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded h-24 resize-none"
                                />
                            </div>
                        </div>
                    )}

                    {activeSection === 'skills' && (
                        <div className="space-y-6">
                            {/* 일반 공격 */}
                            <div className="bg-black/30 p-4 rounded-lg border border-gray-800 border-l-4 border-l-gray-500">
                                <h4 className="text-sm font-bold text-white mb-3">일반 공격</h4>
                                <div className="space-y-3">
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        <div>
                                            <label className="text-xs text-gray-400 block mb-1">무기 이름</label>
                                            <input type="text" value={editData.weapon_info?.weapon_name || ''}
                                                onChange={e => handleChange('weapon_info', { ...editData.weapon_info, weapon_name: e.target.value })}
                                                placeholder="예: 머신건" className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded" />
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-400 block mb-1">최대 장탄 수</label>
                                            <input type="number" value={editData.weapon_info?.max_ammo || ''}
                                                onChange={e => handleChange('weapon_info', { ...editData.weapon_info, max_ammo: parseInt(e.target.value) || 0 })}
                                                placeholder="300" className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded" />
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-400 block mb-1">재장전 시간 (초)</label>
                                            <input type="number" step="0.01" value={editData.weapon_info?.reload_time || ''}
                                                onChange={e => handleChange('weapon_info', { ...editData.weapon_info, reload_time: parseFloat(e.target.value) || 0 })}
                                                placeholder="2.50" className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded" />
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-400 block mb-1">조작 타입</label>
                                            <select value={editData.weapon_info?.control_type || ''}
                                                onChange={e => handleChange('weapon_info', { ...editData.weapon_info, control_type: e.target.value })}
                                                className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded">
                                                <option value="">선택</option>
                                                <option value="일반형">일반형</option>
                                                <option value="차지형">차지형</option>
                                                <option value="점사형">점사형</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-400 block mb-1">일반 공격 설명</label>
                                        <textarea value={editData.skills_detail?.normal?.desc || ''}
                                            onChange={e => handleSkillDetailChange('normal', 'desc', e.target.value)}
                                            placeholder="대상에게 [공격력 5.57% 대미지]..." className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded h-24 resize-none" />
                                    </div>
                                </div>
                            </div>

                            {/* 스킬 1, 2, 버스트 */}
                            {(['skill1', 'skill2', 'burst'] as const).map(skillKey => {
                                const skill = editData.skills_detail?.[skillKey];
                                const skillLabel = skillKey === 'skill1' ? '1스킬 (Skill 1)' : skillKey === 'skill2' ? '2스킬 (Skill 2)' : '버스트 (Burst)';
                                const borderColor = skillKey === 'skill1' ? 'border-l-green-600' : skillKey === 'skill2' ? 'border-l-blue-600' : 'border-l-purple-600';
                                const bgColor = skillKey === 'skill1' ? 'bg-green-900/10' : skillKey === 'skill2' ? 'bg-blue-900/10' : 'bg-purple-900/10';
                                return (
                                    <div key={skillKey} className={`bg-black/30 p-4 rounded-lg border border-gray-800 border-l-4 ${borderColor} ${bgColor}`}>
                                        <h4 className="text-sm font-bold text-white mb-3">{skillLabel}</h4>
                                        <div className="space-y-3">
                                            <div>
                                                <label className="text-xs text-gray-400 block mb-1">스킬명</label>
                                                <input
                                                    type="text"
                                                    value={skill?.name || ''}
                                                    onChange={e => handleSkillDetailChange(skillKey, 'name', e.target.value)}
                                                    className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded text-sm"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs text-gray-400 block mb-1">스킬 타입</label>
                                                <select value={skill?.type || '패시브'} onChange={e => handleSkillDetailChange(skillKey, 'type', e.target.value)}
                                                    className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded">
                                                    <option value="패시브">패시브</option>
                                                    <option value="액티브">액티브</option>
                                                </select>
                                            </div>
                                            {skillKey === 'burst' && (
                                                <div>
                                                    <label className="text-xs text-gray-400 block mb-1">재사용 시간 (초)</label>
                                                    <input type="text" value={skill?.cooldown || ''}
                                                        onChange={e => handleSkillDetailChange(skillKey, 'cooldown', e.target.value)}
                                                        placeholder="예: 20.00초" className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded" />
                                                </div>
                                            )}
                                            <div>
                                                <label className="text-xs text-gray-400 block mb-1">스킬 설명</label>
                                                <textarea
                                                    value={skill?.desc || ''}
                                                    onChange={e => handleSkillDetailChange(skillKey, 'desc', e.target.value)}
                                                    className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded text-sm h-20 resize-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs text-gray-400 block mb-1">태그 (쉼표 구분, 저장 시 자동 추출)</label>
                                                <input
                                                    type="text"
                                                    value={skill?.tags?.join(', ') || ''}
                                                    onChange={e => handleSkillTagsChange(skillKey, e.target.value)}
                                                    className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded text-sm"
                                                    placeholder="전투 시작 시, 공격력 증가, ..."
                                                />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {activeSection === 'options' && (
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-gray-400 block mb-1">추천 오버로드 옵션 (쉼표 구분)</label>
                                <input
                                    type="text"
                                    value={editData.options.join(', ')}
                                    onChange={e => handleOptionsChange(e.target.value)}
                                    className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded"
                                    placeholder="공격력, 우월코드, 장탄"
                                />
                            </div>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {editData.options.map((opt, i) => (
                                    <span key={i} className="px-2 py-1 bg-blue-900/50 text-blue-200 text-xs rounded border border-blue-700">
                                        {opt}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-gray-700 bg-gray-800 rounded-b-xl flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-400 hover:text-white border border-transparent hover:border-gray-600 rounded"
                    >
                        취소
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-6 py-2 bg-nikke-red hover:bg-red-700 text-white font-bold rounded shadow-lg shadow-red-900/20 transition-all hover:scale-105"
                    >
                        저장하기
                    </button>
                </div>
            </div>
        </div>
    );
}
