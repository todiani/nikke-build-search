import React from 'react';
import type { NikkeData } from '../data/nikkes';
import { getMasters } from '../utils/nikkeDataManager';

interface NikkeSkillsEditorProps {
    data: NikkeData;
    onSkillDetailChange: (skillKey: 'normal' | 'skill1' | 'skill2' | 'burst', field: string, value: any) => void;
    onSkillTagsChange: (skillKey: 'normal' | 'skill1' | 'skill2' | 'burst', tagsStr: string) => void;
    handleFieldChange: (field: keyof NikkeData, value: any) => void;
}

const NikkeSkillsEditor: React.FC<NikkeSkillsEditorProps> = ({
    data,
    onSkillDetailChange,
    onSkillTagsChange,
    handleFieldChange
}) => {
    const masters = getMasters();
    const weaponInfo = data.weapon_info;

    const renderNormalAttackSection = () => {
        const normal = data.skills_detail?.normal;
        return (
            <div className="p-4 rounded-lg border border-gray-700 border-l-4 border-l-gray-500 bg-gray-900/10 transition-all hover:bg-gray-900/20">
                <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-gray-500"></span>
                    일반 공격
                </h4>
                <div className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div>
                            <label className="text-[10px] uppercase tracking-wider text-gray-500 block mb-1 font-bold">무기 이름</label>
                            <input type="text" value={weaponInfo?.weapon_name || ''}
                                onChange={e => handleFieldChange('weapon_info', { ...weaponInfo, weapon_name: e.target.value })}
                                placeholder="예: 머신건" className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded-lg text-sm focus:ring-1 focus:ring-nikke-red outline-none transition-all" />
                        </div>
                        <div>
                            <label className="text-[10px] uppercase tracking-wider text-gray-500 block mb-1 font-bold">최대 장탄 수</label>
                            <input type="number" value={weaponInfo?.max_ammo || ''}
                                onChange={e => handleFieldChange('weapon_info', { ...weaponInfo, max_ammo: parseInt(e.target.value) || 0 })}
                                placeholder="300" className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded-lg text-sm focus:ring-1 focus:ring-nikke-red outline-none transition-all" />
                        </div>
                        <div>
                            <label className="text-[10px] uppercase tracking-wider text-gray-500 block mb-1 font-bold">재장전 (초)</label>
                            <input type="number" step="0.01" value={weaponInfo?.reload_time || ''}
                                onChange={e => handleFieldChange('weapon_info', { ...weaponInfo, reload_time: parseFloat(e.target.value) || 0 })}
                                placeholder="2.50" className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded-lg text-sm focus:ring-1 focus:ring-nikke-red outline-none transition-all" />
                        </div>
                        <div>
                            <label className="text-[10px] uppercase tracking-wider text-gray-500 block mb-1 font-bold">조작 타입</label>
                            <select value={weaponInfo?.control_type || ''}
                                onChange={e => handleFieldChange('weapon_info', { ...weaponInfo, control_type: e.target.value })}
                                className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded-lg text-sm focus:ring-1 focus:ring-nikke-red outline-none transition-all">
                                <option value="">선택</option>
                                <option value="일반형">일반형</option>
                                <option value="차지형">차지형</option>
                                <option value="점사형">점사형</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="text-[10px] uppercase tracking-wider text-gray-500 block mb-1 font-bold">공격 설명</label>
                        <textarea value={normal?.desc || ''} onChange={e => onSkillDetailChange('normal', 'desc', e.target.value)}
                            placeholder="대상에게 [공격력 5.57% 대미지]..." className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded-lg text-sm h-24 resize-none focus:ring-1 focus:ring-nikke-red outline-none transition-all" />
                    </div>
                </div>
            </div>
        );
    };

    const renderSkillSection = (skillKey: 'skill1' | 'skill2' | 'burst', label: string, borderColor: string, bgColor: string, dotColor: string) => {
        const skill = data.skills_detail?.[skillKey];
        return (
            <div className={`p-4 rounded-lg border border-gray-700 border-l-4 ${borderColor} ${bgColor} transition-all hover:brightness-110`}>
                <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${dotColor}`}></span>
                    {label}
                </h4>
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                            <label className="text-[10px] uppercase tracking-wider text-gray-500 block mb-1 font-bold">스킬명</label>
                            <input type="text" value={skill?.name || ''} onChange={e => onSkillDetailChange(skillKey, 'name', e.target.value)}
                                placeholder="스킬 이름..." className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded-lg text-sm focus:ring-1 focus:ring-nikke-red outline-none" />
                        </div>
                        <div className="flex gap-2">
                            <div className="flex-1">
                                <label className="text-[10px] uppercase tracking-wider text-gray-500 block mb-1 font-bold">스킬 타입</label>
                                <select value={skill?.type || (skillKey === 'burst' ? '액티브' : '패시브')} onChange={e => onSkillDetailChange(skillKey, 'type', e.target.value)}
                                    className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded-lg text-sm focus:ring-1 focus:ring-nikke-red outline-none">
                                    <option value="패시브">패시브</option>
                                    <option value="액티브">액티브</option>
                                </select>
                            </div>
                            {skill?.type === '액티브' && (
                                <div className="flex-1 animate-fadeIn">
                                    <label className="text-[10px] uppercase tracking-wider text-gray-500 block mb-1 font-bold">재사용 시간</label>
                                    <input type="text" value={skill?.cooldown || ''} onChange={e => onSkillDetailChange(skillKey, 'cooldown', e.target.value)}
                                        placeholder="예: 20.00초" className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded-lg text-sm focus:ring-1 focus:ring-nikke-red outline-none" />
                                </div>
                            )}
                        </div>
                    </div>
                    <div>
                        <label className="text-[10px] uppercase tracking-wider text-gray-500 block mb-1 font-bold">설명</label>
                        <textarea value={skill?.desc || ''} onChange={e => onSkillDetailChange(skillKey, 'desc', e.target.value)}
                            placeholder="스킬 효과 설명..." className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded-lg text-sm h-32 resize-none focus:ring-1 focus:ring-nikke-red outline-none" />
                    </div>
                    <div>
                        <label className="text-[10px] uppercase tracking-wider text-gray-500 block mb-1 font-bold">태그 (쉼표 구분, 저장 시 자동 추출)</label>
                        <input type="text" value={skill?.tags?.join(', ') || ''} onChange={e => onSkillTagsChange(skillKey, e.target.value)}
                            placeholder="공격력 증가, 버프, 아군" className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded-lg text-sm focus:ring-1 focus:ring-nikke-red outline-none" />
                        {skill?.tags && skill.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                                {skill.tags.map((tag, i) => (
                                    <span key={i} className="text-[9px] px-2 py-0.5 bg-white/5 text-gray-400 rounded-md border border-white/5">{tag}</span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-black text-white flex items-center gap-2">
                <span className="text-xl">📜</span> 스킬 세부 설정
            </h3>
            <div className="space-y-4">
                {renderNormalAttackSection()}
                {renderSkillSection('skill1', '1스킬 (Skill 1)', 'border-l-green-600', 'bg-green-900/5', 'bg-green-600')}
                {renderSkillSection('skill2', '2스킬 (Skill 2)', 'border-l-blue-600', 'bg-blue-900/5', 'bg-blue-600')}
                {renderSkillSection('burst', '버스트 (Burst)', 'border-l-purple-600', 'bg-purple-900/5', 'bg-purple-600')}
            </div>
        </div>
    );
};

export default NikkeSkillsEditor;
