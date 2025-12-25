import { useState, useEffect } from 'react';
import type { NikkeData } from '../data/nikkes';
import { tierColors } from '../utils/nikkeConstants';
import { extractTagsFromSkill } from '../utils/tagExtractor';
import NikkeFieldsEditor from './NikkeFieldsEditor';
import { initializeNikkeData } from '../utils/nikkeDataManager';
import {
    getBackupSettings, saveBackupSettings, getBackupHistory,
    createBackup, deleteBackup, checkAndRunAutoBackup
} from '../utils/backupManager';
import Calculator from './Calculator';
import OptionCompare from './OptionCompare';
import UpgradeGuide from './UpgradeGuide';

interface DataManagerProps {
    isOpen: boolean;
    onClose: () => void;
    data: NikkeData[];
    onUpdate: (newData: NikkeData[]) => void;
}

type ViewMode = 'list' | 'edit' | 'json' | 'backup';
type EditTab = 'info' | 'guide' | 'calc' | 'compare';

// Default new Nikke template
const createNewNikke = (): NikkeData => {
    const base: NikkeData = {
        id: `nikke_${Date.now()}`,
        name: '',
        name_en: '',
        tier: 'Unranked',
        burst: 'III',
        class: 'Attacker',
        weapon: 'AR',
        skill_priority: '',
        skills: { min: '', efficient: '', max: '' },
        options: [],
        cube: '',
        desc: '',
        extra_info: '',
        company: '',
        squad: '',
        code: '',
        weapon_info: { weapon_name: '' },
        valid_options: [],
        invalid_options: [],
        skills_detail: {
            normal: { name: '일반 공격', desc: '' },
            skill1: { name: '', desc: '', tags: [], type: '패시브' },
            skill2: { name: '', desc: '', tags: [], type: '패시브' },
            burst: { name: '', desc: '', tags: [], type: '액티브', cooldown: '' }
        }
    };
    return initializeNikkeData(base);
};

export default function DataManager({ isOpen, onClose, data, onUpdate }: DataManagerProps) {
    const [viewMode, setViewMode] = useState<ViewMode>('list');
    const [editTab, setEditTab] = useState<EditTab>('info');
    const [localData, setLocalData] = useState<NikkeData[]>([]);
    const [selectedNikke, setSelectedNikke] = useState<NikkeData | null>(null);
    const [isNewNikke, setIsNewNikke] = useState(false);
    const [searchFilter, setSearchFilter] = useState('');
    const [jsonText, setJsonText] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

    useEffect(() => {
        setLocalData([...data]);
        setJsonText(JSON.stringify(data, null, 2));
        checkAndRunAutoBackup(data);
    }, [data]);

    if (!isOpen) return null;

    const filteredData = localData.filter(n =>
        n.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
        n.name_en.toLowerCase().includes(searchFilter.toLowerCase())
    );

    const tierColor = (tier: string) => tierColors[tier] || 'text-gray-400 border-gray-400';

    // === Handlers ===
    const handleSelectNikke = (nikke: NikkeData) => {
        setSelectedNikke({ ...nikke });
        setIsNewNikke(false);
        setViewMode('edit');
        setEditTab('info');
    };

    const handleAddNew = () => {
        setSelectedNikke(createNewNikke());
        setIsNewNikke(true);
        setViewMode('edit');
        setEditTab('info');
    };

    const handleFieldChange = (field: keyof NikkeData, value: any) => {
        if (!selectedNikke) return;
        setSelectedNikke(prev => prev ? { ...prev, [field]: value } : null);
    };

    const handleSkillsChange = (field: 'min' | 'efficient' | 'max', value: string) => {
        if (!selectedNikke) return;
        setSelectedNikke(prev => prev ? {
            ...prev,
            skills: {
                min: prev.skills?.min || '',
                efficient: prev.skills?.efficient || '',
                max: prev.skills?.max || '',
                [field]: value
            }
        } : null);
    };


    const handleSkillDetailChange = (skillKey: 'normal' | 'skill1' | 'skill2' | 'burst', field: string, value: any) => {
        if (!selectedNikke) return;
        setSelectedNikke(prev => {
            if (!prev) return null;
            return {
                ...prev,
                skills_detail: {
                    ...(prev.skills_detail || {}),
                    [skillKey]: {
                        ...(prev.skills_detail?.[skillKey] || { name: '', desc: '', tags: [] }),
                        [field]: value
                    }
                }
            };
        });
    };

    const handleUsageStatChange = (idx: number, field: 'stars' | 'desc', value: any) => {
        setSelectedNikke(prev => {
            if (!prev) return null;
            const stats = [...(prev.usage_stats || [])];
            if (stats[idx]) {
                stats[idx] = { ...stats[idx], [field]: value };
            }
            return { ...prev, usage_stats: stats };
        });
    };

    const handleBurstDetailChange = (stage: "2RL" | "2_5RL" | "3RL" | "3_5RL" | "4RL", field: 'value' | 'hits' | 'bonus', val: any) => {
        setSelectedNikke(prev => {
            if (!prev) return null;
            const details = { ...(prev.burst_details || {}) };
            if (!details[stage]) {
                details[stage] = { value: 0, hits: '', bonus: '' };
            }
            details[stage] = { ...details[stage], [field]: field === 'value' ? parseFloat(val) || 0 : val };
            return { ...prev, burst_details: details };
        });
    };

    const handleSkillTagsChange = (skillKey: 'normal' | 'skill1' | 'skill2' | 'burst', tagsStr: string) => {
        if (!selectedNikke) return;
        const tags = tagsStr.split(',').map(t => t.trim()).filter(Boolean);
        setSelectedNikke(prev => {
            if (!prev) return null;
            return {
                ...prev,
                skills_detail: {
                    ...prev.skills_detail,
                    [skillKey]: {
                        ...(prev.skills_detail?.[skillKey] || { name: '', desc: '', tags: [] }),
                        tags
                    }
                }
            };
        });
    };

    const handleArrayFieldChange = (field: 'options' | 'valid_options' | 'invalid_options', value: string) => {
        if (!selectedNikke) return;
        const arr = value.split(',').map(t => t.trim()).filter(Boolean);
        setSelectedNikke(prev => prev ? { ...prev, [field]: arr } : null);
    };

    const handleSaveNikke = () => {
        if (!selectedNikke || !selectedNikke.name.trim()) {
            alert("니케 이름을 입력해주세요.");
            return;
        }

        // 저장 전에 각 스킬의 태그를 자동으로 추출
        const updatedNikke = { ...selectedNikke };
        if (updatedNikke.skills_detail) {
            // skill1, skill2, burst에 대해 태그 자동 추출
            for (const skillKey of ['skill1', 'skill2', 'burst'] as const) {
                const skill = updatedNikke.skills_detail[skillKey];
                if (skill && skill.name && skill.desc) {
                    const autoTags = extractTagsFromSkill(skill.name, skill.desc);
                    // 기존 태그와 자동 추출된 태그를 병합 (중복 제거)
                    const existingTags = skill.tags || [];
                    const mergedTags = Array.from(new Set([...existingTags, ...autoTags]));
                    updatedNikke.skills_detail[skillKey] = {
                        ...skill,
                        tags: mergedTags
                    };
                }
            }
        }

        if (isNewNikke) {
            setLocalData(prev => [...prev, updatedNikke]);
        } else {
            setLocalData(prev => prev.map(n => n.id === updatedNikke.id ? updatedNikke : n));
        }
        setViewMode('list');
        setSelectedNikke(null);
        setIsNewNikke(false);
    };

    const handleDeleteNikke = (nikkeId: string) => {
        setLocalData(prev => prev.filter(n => n.id !== nikkeId));
        setDeleteConfirm(null);
        if (selectedNikke?.id === nikkeId) {
            setSelectedNikke(null);
            setViewMode('list');
        }
    };

    const handleApplyAll = () => {
        onUpdate(localData);
        localStorage.setItem('nikke_db_cache', JSON.stringify(localData));
        alert(`✓ 데이터가 적용되었습니다!\n\n${localData.length}명의 니케 정보가 저장됨\n\n영구 저장: 'JSON 내보내기'로 파일 저장`);
    };

    const handleJsonApply = () => {
        try {
            const parsed = JSON.parse(jsonText);
            if (!Array.isArray(parsed)) throw new Error("Data must be an array");
            setLocalData(parsed);
            setViewMode('list');
            setError(null);
        } catch (e: any) {
            setError(e.message);
        }
    };

    const handleDownload = () => {
        const blob = new Blob([JSON.stringify(localData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'nikke_db.json';
        a.click();
        URL.revokeObjectURL(url);
    };

    // === Render List View ===
    const renderListView = () => (
        <div className="flex-1 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-gray-700 bg-gray-800/50 flex gap-2">
                <input
                    type="text"
                    value={searchFilter}
                    onChange={e => setSearchFilter(e.target.value)}
                    placeholder="니케 이름 검색..."
                    className="flex-1 bg-gray-900 border border-gray-600 text-white px-3 py-2 rounded"
                />
                <button
                    onClick={handleAddNew}
                    className="px-4 py-2 bg-green-700 hover:bg-green-600 text-white rounded font-bold text-sm flex items-center gap-1"
                >
                    ➕ 새 니케 추가
                </button>
            </div>
            <div className="flex-1 overflow-y-auto">
                {filteredData.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">검색 결과가 없습니다</div>
                ) : (
                    filteredData.map(nikke => (
                        <div key={nikke.id} className="flex items-center justify-between px-4 py-3 border-b border-gray-800 hover:bg-gray-800 transition-colors">
                            <button onClick={() => handleSelectNikke(nikke)} className="flex-1 text-left flex items-center gap-2">
                                <span className="text-white font-bold">{nikke.name}</span>
                                {nikke.extra_info && (
                                    <span className="text-[10px] px-1.5 py-0.5 bg-purple-900/50 text-purple-300 rounded">{nikke.extra_info}</span>
                                )}
                                <span className="text-gray-500 text-sm">{nikke.name_en}</span>
                            </button>
                            <div className="flex gap-2 items-center">
                                <span className={`text-xs px-2 py-0.5 rounded border ${tierColor(nikke.tier)}`}>{nikke.tier}</span>
                                {deleteConfirm === nikke.id ? (
                                    <>
                                        <button onClick={() => handleDeleteNikke(nikke.id)} className="text-xs px-2 py-1 bg-red-700 hover:bg-red-600 text-white rounded">삭제 확인</button>
                                        <button onClick={() => setDeleteConfirm(null)} className="text-xs px-2 py-1 bg-gray-600 hover:bg-gray-500 text-white rounded">취소</button>
                                    </>
                                ) : (
                                    <button onClick={() => setDeleteConfirm(nikke.id)} className="text-xs px-2 py-1 text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded">🗑️</button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );

    // === Render Edit Tabs (Unified with NikkeDetail) ===
    const renderEditTabs = () => (
        <div className="grid grid-cols-4 bg-gray-800/50 border-b border-gray-700 p-1 gap-1">
            {[
                { key: 'info', label: '📋 정보' },
                { key: 'guide', label: '🛠️ 가이드' },
                { key: 'calc', label: '📊 계산기' },
                { key: 'compare', label: '⚖️ 비교' }
            ].map(tab => (
                <button
                    key={tab.key}
                    onClick={() => setEditTab(tab.key as EditTab)}
                    className={`py-2 text-sm font-bold rounded transition-all ${editTab === tab.key
                        ? 'bg-nikke-red text-white shadow-lg'
                        : 'text-gray-400 hover:text-white hover:bg-gray-700'
                        }`}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    );

    // === Tab Contents ===
    const renderBasicTab = () => {
        if (!selectedNikke) return null;
        return (
            <NikkeFieldsEditor
                data={selectedNikke}
                onChange={handleFieldChange}
                onUsageStatChange={handleUsageStatChange}
                onBurstDetailChange={handleBurstDetailChange}
            />
        );
    };

    const renderSkillsTab = () => {
        const renderNormalAttackSection = () => {
            const normal = selectedNikke?.skills_detail?.normal;
            const weaponInfo = selectedNikke?.weapon_info;
            return (
                <div className="p-4 rounded-lg border border-gray-700 border-l-4 border-l-gray-500 bg-gray-900/10">
                    <h4 className="text-sm font-bold text-white mb-3">일반 공격</h4>
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
                </div>
            );
        };

        const renderSkillSection = (skillKey: 'skill1' | 'skill2' | 'burst', label: string, borderColor: string, bgColor: string) => {
            const skill = selectedNikke?.skills_detail?.[skillKey];
            return (
                <div className={`p-4 rounded-lg border border-gray-700 border-l-4 ${borderColor} ${bgColor}`}>
                    <h4 className="text-sm font-bold text-white mb-3">{label}</h4>
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
                            {skill?.tags && skill.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                    {skill.tags.map((tag, i) => <span key={i} className="text-[10px] px-2 py-0.5 bg-gray-700 text-gray-300 rounded">{tag}</span>)}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            );
        };

        return (
            <div className="space-y-4">
                {renderNormalAttackSection()}
                {renderSkillSection('skill1', '1스킬 (Skill 1)', 'border-l-green-600', 'bg-green-900/10')}
                {renderSkillSection('skill2', '2스킬 (Skill 2)', 'border-l-blue-600', 'bg-blue-900/10')}
                {renderSkillSection('burst', '버스트 (Burst)', 'border-l-purple-600', 'bg-purple-900/10')}
            </div>
        );
    };

    const renderOptionsTab = () => (
        <div className="space-y-4">
            <div className="bg-black/30 p-4 rounded-lg border border-gray-700">
                <h4 className="text-sm font-bold text-green-400 mb-3">✓ 추천 옵션 (Valid)</h4>
                <input type="text" value={selectedNikke?.valid_options?.join(', ') || ''} onChange={e => handleArrayFieldChange('valid_options', e.target.value)}
                    placeholder="공격력 증가, 우월코드 대미지 증가, 차지 속도 증가"
                    className="w-full bg-gray-800 border border-green-700 text-white px-3 py-2 rounded" />
                {selectedNikke?.valid_options && selectedNikke.valid_options.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                        {selectedNikke.valid_options.map((opt, i) => <span key={i} className="text-xs px-2 py-0.5 bg-green-900/50 text-green-300 rounded">{opt}</span>)}
                    </div>
                )}
            </div>

            <div className="bg-black/30 p-4 rounded-lg border border-gray-700">
                <h4 className="text-sm font-bold text-red-400 mb-3">✗ 비추천 옵션 (Invalid)</h4>
                <input type="text" value={selectedNikke?.invalid_options?.join(', ') || ''} onChange={e => handleArrayFieldChange('invalid_options', e.target.value)}
                    placeholder="방어력 증가, 차지 속도 증가 (MG의 경우)"
                    className="w-full bg-gray-800 border border-red-700 text-white px-3 py-2 rounded" />
                {selectedNikke?.invalid_options && selectedNikke.invalid_options.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                        {selectedNikke.invalid_options.map((opt, i) => <span key={i} className="text-xs px-2 py-0.5 bg-red-900/50 text-red-300 rounded">{opt}</span>)}
                    </div>
                )}
            </div>

            <div className="bg-black/30 p-4 rounded-lg border border-gray-700">
                <h4 className="text-sm font-bold text-gray-400 mb-3">📋 간략 추천 (레거시)</h4>
                <input type="text" value={selectedNikke?.options?.join(', ') || ''} onChange={e => handleArrayFieldChange('options', e.target.value)}
                    placeholder="공격력, 우월코드, 장탄"
                    className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded" />
            </div>
        </div>
    );

    const renderGuideTab = () => {
        if (!selectedNikke) return null;
        return (
            <UpgradeGuide
                nikke={selectedNikke}
                isEditMode={true}
                onUpdate={handleFieldChange}
                onSkillUpdate={handleSkillsChange}
            />
        );
    };

    // === Render Edit View ===
    const renderEditView = () => {
        if (!selectedNikke) return null;

        return (
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <div className="p-4 border-b border-gray-700 bg-gradient-to-r from-gray-800 to-gray-900 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button onClick={() => { setViewMode('list'); setSelectedNikke(null); setIsNewNikke(false); }}
                            className="text-gray-400 hover:text-white text-sm">
                            ← 목록
                        </button>
                        <span className="text-white font-bold text-lg">
                            {selectedNikke.name || '새 니케'}
                        </span>
                        {isNewNikke && (
                            <span className="text-xs px-2 py-0.5 bg-green-900/50 text-green-300 rounded">NEW</span>
                        )}
                        {selectedNikke.extra_info && (
                            <span className="text-xs px-2 py-0.5 bg-purple-900/50 text-purple-300 rounded">{selectedNikke.extra_info}</span>
                        )}
                    </div>
                    <div className={`px-3 py-1 rounded bg-black/50 border font-bold text-sm ${tierColor(selectedNikke.tier)}`}>
                        {selectedNikke.tier}
                    </div>
                </div>

                {/* Tabs */}
                {renderEditTabs()}

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4">
                    {editTab === 'info' && (
                        <div className="space-y-6">
                            {renderBasicTab()}
                            <hr className="border-gray-700" />
                            {renderSkillsTab()}
                            <hr className="border-gray-700" />
                            {renderOptionsTab()}
                        </div>
                    )}
                    {editTab === 'guide' && renderGuideTab()}
                    {editTab === 'calc' && (
                        <Calculator
                            nikke={selectedNikke}
                            onDataUpdate={(calc_data) => setSelectedNikke(prev => prev ? { ...prev, calc_data } : null)}
                        />
                    )}
                    {editTab === 'compare' && (
                        <OptionCompare
                            nikke={selectedNikke}
                            onDataUpdate={(compare_data) => setSelectedNikke(prev => prev ? { ...prev, compare_data } : null)}
                        />
                    )}
                </div>

                {/* Save Button */}
                <div className="p-4 border-t border-gray-700 bg-gray-800">
                    <button onClick={handleSaveNikke}
                        className="w-full py-3 bg-nikke-red hover:bg-red-700 text-white font-bold rounded-lg text-lg">
                        {isNewNikke ? '➕ 새 니케 저장' : '✓ 변경사항 저장'}
                    </button>
                </div>
            </div>
        );
    };

    // === Render JSON View ===
    const renderJsonView = () => (
        <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 relative">
                <textarea
                    className="w-full h-full bg-black text-green-400 font-mono text-xs p-4 resize-none outline-none"
                    value={jsonText}
                    onChange={e => { setJsonText(e.target.value); setError(null); }}
                    spellCheck={false}
                />
                {error && (
                    <div className="absolute bottom-4 left-4 right-4 bg-red-900/90 text-red-100 p-3 rounded border border-red-500">
                        ⚠️ Error: {error}
                    </div>
                )}
            </div>
            <div className="p-4 bg-gray-800 border-t border-gray-700">
                <button onClick={handleJsonApply}
                    className="w-full py-2 bg-green-800 hover:bg-green-700 text-green-100 font-bold rounded">
                    JSON 적용
                </button>
            </div>
        </div>
    );

    const renderBackupView = () => {
        const settings = getBackupSettings();
        const history = getBackupHistory();

        return (
            <div className="flex-1 flex flex-col overflow-hidden p-6 space-y-6 overflow-y-auto">
                {/* Backup Settings */}
                <div className="bg-black/30 p-4 rounded-lg border border-gray-700">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                        <span className="mr-2">⚙️</span> 백업 설정
                    </h3>
                    <div className="flex items-center gap-4">
                        <div className="flex-1">
                            <label className="text-xs text-gray-500 block mb-1">자동 백업 주기</label>
                            <select
                                value={settings.intervalDays}
                                onChange={e => saveBackupSettings({ ...settings, intervalDays: Number(e.target.value) })}
                                className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded text-sm"
                            >
                                <option value={0}>사용 안함</option>
                                <option value={1}>매일 (1일)</option>
                                <option value={3}>3일 마다</option>
                                <option value={7}>1주 마다 (7일)</option>
                                <option value={30}>1달 마다 (30일)</option>
                            </select>
                        </div>
                        <div className="pt-5">
                            <button
                                onClick={() => {
                                    createBackup(localData, 'manual');
                                    alert('수동 백업이 생성되었습니다.');
                                }}
                                className="px-4 py-2 bg-blue-700 hover:bg-blue-600 text-white rounded font-bold text-sm"
                            >
                                💾 지금 수동 백업 생성
                            </button>
                        </div>
                    </div>
                    <p className="text-[10px] text-gray-500 mt-2">
                        * 자동 백업은 설정된 기간이 지나고 앱을 실행할 때 자동으로 수행됩니다.
                    </p>
                </div>

                {/* Backup History */}
                <div className="bg-black/30 p-4 rounded-lg border border-gray-700">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                        <span className="mr-2">📜 백업 히스토리 (최근 10개)</span>
                    </h3>
                    {history.length === 0 ? (
                        <div className="text-center py-8 text-gray-500 italic">백업 내역이 없습니다.</div>
                    ) : (
                        <div className="space-y-2">
                            {history.map(item => (
                                <div key={item.id} className="flex items-center justify-between p-3 bg-gray-900/50 border border-gray-800 rounded hover:border-gray-600 transition-colors">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-gray-200">
                                            {new Date(item.timestamp).toLocaleString()}
                                            <span className={`ml-2 text-[10px] px-1.5 py-0.5 rounded ${item.type === 'auto' ? 'bg-purple-900/50 text-purple-300' : 'bg-blue-900/50 text-blue-300'}`}>
                                                {item.type === 'auto' ? 'AUTO' : 'MANUAL'}
                                            </span>
                                        </span>
                                        <span className="text-xs text-gray-500">포함된 니케: {item.count}명</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => {
                                                if (window.confirm('선택한 백업으로 전체 데이터를 복구하시겠습니까?\n현재의 수정 사항은 덮어씌워집니다.')) {
                                                    setLocalData(item.data);
                                                    alert('백업 데이터가 로드되었습니다. "전체 적용" 버튼을 눌러 확정하세요.');
                                                    setViewMode('list');
                                                }
                                            }}
                                            className="px-3 py-1 bg-green-900 hover:bg-green-800 text-green-300 rounded text-xs"
                                        >
                                            복구(로드)
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (window.confirm('이 백업을 삭제하시겠습니까?')) {
                                                    deleteBackup(item.id);
                                                }
                                            }}
                                            className="px-3 py-1 bg-red-900/30 hover:bg-red-900 text-red-400 rounded text-xs"
                                        >
                                            삭제
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Emergency Tips */}
                <div className="p-4 border border-yellow-900/50 bg-yellow-900/10 rounded-lg">
                    <h4 className="text-yellow-500 font-bold text-sm mb-2 font-black">⚠️ DB 오류 및 비상 대처 방법</h4>
                    <ul className="text-xs text-gray-400 space-y-2 ml-4 list-disc">
                        <li>데이터가 유실된 경우 위 히스토리에서 가장 최근 백업을 찾아 <strong>'복구'</strong>를 누르세요.</li>
                        <li>JSON 내보내기 기능을 이용해 정기적으로 <strong>nikke_db.json</strong> 파일을 PC에 저장하는 것이 가장 안전합니다.</li>
                        <li>
                            <div className="flex items-center justify-between">
                                <span>캐시 꼬임이나 중목 현상이 지속될 경우 브라우저 데이터를 초기화하세요:</span>
                                <button
                                    onClick={() => {
                                        if (window.confirm('브라우저 캐시를 초기화하시겠습니까?\n이름 검색 중복 및 데이터 꼬임 현상이 해결됩니다.\n(사용자가 편집한 내용은 사라질 수 있습니다)')) {
                                            localStorage.removeItem('nikke_db_cache');
                                            window.location.reload();
                                        }
                                    }}
                                    className="px-2 py-1 bg-red-900 hover:bg-red-700 text-white rounded text-[10px] font-bold"
                                >
                                    캐시 강제 초기화 (새로고침)
                                </button>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
        );
    };

    // === Main Return ===
    return (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fadeIn">
            <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-4xl h-[90vh] flex flex-col shadow-2xl">
                {/* Header */}
                <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-gray-800 rounded-t-xl">
                    <h2 className="text-xl font-bold text-white flex items-center">
                        <span className="mr-2">💾</span> 데이터 관리
                        <span className="text-xs text-gray-400 ml-2">({localData.length}명)</span>
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white px-2 text-xl">✕</button>
                </div>

                {/* Mode Tabs */}
                {viewMode !== 'edit' && (
                    <div className="flex border-b border-gray-700 bg-gray-800/50">
                        <button onClick={() => setViewMode('list')}
                            className={`px-4 py-2 text-sm font-bold transition-colors ${viewMode === 'list' ? 'text-nikke-red border-b-2 border-nikke-red' : 'text-gray-400 hover:text-white'}`}>
                            📋 니케 목록
                        </button>
                        <button onClick={() => { setViewMode('json'); setJsonText(JSON.stringify(localData, null, 2)); }}
                            className={`px-4 py-2 text-sm font-bold transition-colors ${viewMode === 'json' ? 'text-green-400 border-b-2 border-green-400' : 'text-gray-400 hover:text-white'}`}>
                            {"{ }"} Raw JSON
                        </button>
                        <button onClick={() => setViewMode('backup')}
                            className={`px-4 py-2 text-sm font-bold transition-colors ${viewMode === 'backup' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'}`}>
                            🛡️ 백업/복구
                        </button>
                    </div>
                )}

                {/* Content */}
                {viewMode === 'list' && renderListView()}
                {viewMode === 'edit' && renderEditView()}
                {viewMode === 'json' && renderJsonView()}
                {viewMode === 'backup' && renderBackupView()}

                {/* Footer */}
                {viewMode !== 'edit' && (
                    <div className="p-4 border-t border-gray-700 bg-gray-800 rounded-b-xl flex justify-between">
                        <button onClick={handleDownload}
                            className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-blue-100 rounded text-sm border border-blue-700">
                            📥 JSON 내보내기
                        </button>
                        <button onClick={handleApplyAll}
                            className="px-6 py-2 bg-nikke-red hover:bg-red-700 text-white font-bold rounded shadow-lg shadow-red-900/20">
                            ✓ 전체 적용 ({localData.length}명)
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
