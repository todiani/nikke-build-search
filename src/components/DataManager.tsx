import { useState, useEffect, useRef } from 'react';
import type { NikkeData } from '../data/nikkes';
import { extractTagsFromSkill } from '../utils/tagExtractor';
import NikkeFieldsEditor from './NikkeFieldsEditor';
import NikkeSkillsEditor from './NikkeSkillsEditor';
import NikkeOptionsEditor from './NikkeOptionsEditor';
import { initializeNikkeData, normalize, getMasters } from '../utils/nikkeDataManager';
import { matchKorean } from '../utils/hangul';
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
    initialNikke?: NikkeData | null; // Added prop for direct entry
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

export default function DataManager({ isOpen, onClose, data, onUpdate, initialNikke }: DataManagerProps) {
    const searchInputRef = useRef<HTMLInputElement>(null);
    const [viewMode, setViewMode] = useState<ViewMode>('list');
    const [editTab, setEditTab] = useState<EditTab>('info');
    const [localData, setLocalData] = useState<NikkeData[]>([]);
    const [selectedNikke, setSelectedNikke] = useState<NikkeData | null>(null);
    const [isNewNikke, setIsNewNikke] = useState(false);
    const [searchFilter, setSearchFilter] = useState('');
    const [jsonText, setJsonText] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

    // Manual Link State
    const [linkingGuestName, setLinkingGuestName] = useState<string | null>(null);
    const [linkSearchTerm, setLinkSearchTerm] = useState('');

    useEffect(() => {
        if (isOpen && viewMode === 'list' && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [isOpen, viewMode]);

    useEffect(() => {
        const init = async () => {
            setLocalData([...data]);
            setJsonText(JSON.stringify(data, null, 2));

            // If initialNikke is provided, jump straight to edit mode
            if (initialNikke) {
                const existing = data.find(n => normalize(n.name) === normalize(initialNikke.name));
                if (existing) {
                    setSelectedNikke({ ...existing });
                    setIsNewNikke(false);
                } else {
                    setSelectedNikke({ ...initialNikke });
                    setIsNewNikke(true);
                }
                setViewMode('edit');
                setEditTab('info');
            }

            await checkAndRunAutoBackup(data);
        };
        init();
    }, [data, initialNikke]);

    if (!isOpen) return null;

    const filteredData = localData.filter(n =>
        n.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
        n.name_en.toLowerCase().includes(searchFilter.toLowerCase())
    );

    const masters = getMasters();
    const colors = masters.colors || {} as any;

    const tierColor = (tier: string) => (colors.tier?.[tier]) || 'text-gray-400 border-gray-400';

    // === Handlers ===
    const handleLinkAlias = (targetNikke: NikkeData) => {
        if (!linkingGuestName) return;

        const updatedData = localData.map(n => {
            if (n.id === targetNikke.id) {
                return {
                    ...n,
                    aliases: [...(n.aliases || []), linkingGuestName]
                };
            }
            return n;
        });

        setLocalData(updatedData);
        onUpdate(updatedData); // App.tsx handles API call
        setLinkingGuestName(null);
        setLinkSearchTerm('');
        alert(`✓ '${linkingGuestName}'이(가) '${targetNikke.name}'의 별명으로 연결되었습니다.`);
    };

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

    const handleSaveNikke = async () => {
        if (!selectedNikke || !selectedNikke.name.trim()) {
            alert("니케 이름을 입력해주세요.");
            return;
        }

        // 저장 전에 각 스킬의 태그를 자동으로 추출
        const updatedNikke = { ...selectedNikke };
        if (updatedNikke.skills_detail) {
            for (const skillKey of ['skill1', 'skill2', 'burst'] as const) {
                const skill = updatedNikke.skills_detail[skillKey];
                if (skill && skill.name && skill.desc) {
                    const autoTags = extractTagsFromSkill(skill.name, skill.desc);
                    const existingTags = skill.tags || [];
                    const mergedTags = Array.from(new Set([...existingTags, ...autoTags]));
                    updatedNikke.skills_detail[skillKey] = {
                        ...skill,
                        tags: mergedTags
                    };
                }
            }
        }

        let newData: NikkeData[];
        if (isNewNikke) {
            newData = [...localData, updatedNikke];
        } else {
            newData = localData.map(n => n.id === updatedNikke.id ? updatedNikke : n);
        }

        setLocalData(newData);
        onUpdate(newData); // App.tsx handles API call

        setViewMode('list');
        setSelectedNikke(null);
        setIsNewNikke(false);
    };

    const handleDeleteNikke = async (nikkeId: string) => {
        const newData = localData.filter(n => n.id !== nikkeId);
        setLocalData(newData);
        onUpdate(newData); // App.tsx handles API call

        setDeleteConfirm(null);
        if (selectedNikke?.id === nikkeId) {
            setSelectedNikke(null);
            setViewMode('list');
        }
    };

    const handleApplyAll = () => {
        onUpdate(localData);
        alert(`✓ 데이터가 적용되었습니다!\n\n${localData.length}명의 니케 정보가 저장됨\n\n로컬 서버 실행 중이면 nikke_db.json에 저장됩니다.`);
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

    const renderListView = () => (
        <div className="flex-1 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-gray-700 bg-gray-800/50 flex gap-2">
                <input
                    ref={searchInputRef}
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
                    <div className="flex flex-col">
                        {filteredData.map(nikke => (
                            <div key={nikke.id} className="flex items-center justify-between px-4 py-3 border-b border-gray-800 hover:bg-gray-800 transition-colors">
                                <button onClick={() => handleSelectNikke(nikke)} className="flex-1 text-left flex flex-col min-w-0">
                                    <div className="flex items-baseline gap-2 flex-wrap">
                                        <span className="text-white font-bold">{nikke.name}</span>
                                        {nikke.name_en && (
                                            <span className="text-xs text-blue-400/80 font-medium">{nikke.name_en}</span>
                                        )}
                                    </div>
                                    {nikke.extra_info && (
                                        <span className="text-[11px] text-gray-400 font-medium mt-0.5">{nikke.extra_info}</span>
                                    )}
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
                        ))}
                    </div>
                )}
            </div>
        </div>
    );

    // === Render Edit Tabs (Unified with NikkeDetail) ===
    const renderEditTabs = () => (
        <div className="grid grid-cols-4 bg-gray-900/80 border-x border-gray-700 p-1 gap-1">
            {([
                { key: 'info', label: '📋 정보' },
                { key: 'guide', label: '🛠️ 가이드', color: 'bg-nikke-red' },
                { key: 'calc', label: '📊 계산기', color: 'bg-blue-600' },
                { key: 'compare', label: '⚖️ 비교', color: 'bg-purple-600' }
            ] as { key: EditTab; label: string; color?: string }[]).map(tab => (
                <button
                    key={tab.key}
                    onClick={() => setEditTab(tab.key as EditTab)}
                    className={`py-2 text-sm font-bold rounded transition-all ${editTab === tab.key ? `${tab.color || 'bg-gray-700'} text-white` : 'text-gray-400 hover:text-white'}`}
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
        if (!selectedNikke) return null;
        return (
            <NikkeSkillsEditor
                data={selectedNikke}
                onSkillDetailChange={handleSkillDetailChange}
                onSkillTagsChange={handleSkillTagsChange}
                handleFieldChange={handleFieldChange}
            />
        );
    };

    const renderOptionsTab = () => {
        if (!selectedNikke) return null;
        return (
            <NikkeOptionsEditor
                data={selectedNikke}
                onArrayFieldChange={handleArrayFieldChange}
            />
        );
    };

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
                <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-t-xl p-4 border border-gray-700 border-b-0 flex items-center justify-between">
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

                {renderEditTabs()}

                <div className="flex-1 overflow-y-auto bg-gray-900/50 p-4 border border-gray-700 border-t-0 rounded-b-xl">
                    {editTab === 'info' && (
                        <div className="space-y-6">
                            {renderBasicTab()}
                            <hr className="border-gray-700 mt-6" />
                            {renderOptionsTab()}
                            <hr className="border-gray-700 my-6" />
                            {renderSkillsTab()}
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
                                onChange={async (e) => await saveBackupSettings({ ...settings, intervalDays: Number(e.target.value) })}
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
                                onClick={async () => {
                                    await createBackup(localData, 'manual');
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
                                            onClick={async () => {
                                                if (window.confirm('이 백업을 삭제하시겠습니까?')) {
                                                    await deleteBackup(item.id);
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
                        <li>로컬 서버가 실행 중인지 확인하세요. 미실행 시 저장이 반영되지 않을 수 있습니다.</li>
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

                {/* Manual Link Selector Modal */}
                {linkingGuestName && (
                    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4 backdrop-blur-md animate-fadeIn">
                        <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-md shadow-2xl flex flex-col max-h-[80vh]">
                            <div className="p-5 border-b border-gray-800 flex justify-between items-center bg-gray-900/50 rounded-t-2xl">
                                <div>
                                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                        <span className="text-blue-400">🔗</span> 별명 연결
                                    </h3>
                                    <p className="text-xs text-gray-400 mt-1">
                                        <span className="text-red-400 font-bold">'{linkingGuestName}'</span>을(를) 어느 니케와 연결할까요?
                                    </p>
                                </div>
                                <button onClick={() => setLinkingGuestName(null)} className="text-gray-500 hover:text-white p-2 transition-colors">✕</button>
                            </div>

                            <div className="p-4 bg-gray-950/50">
                                <input
                                    type="text"
                                    autoFocus
                                    placeholder="니케 이름 검색..."
                                    value={linkSearchTerm}
                                    onChange={e => setLinkSearchTerm(e.target.value)}
                                    className="w-full bg-gray-900 border border-gray-700 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                />
                            </div>

                            <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                                {localData
                                    .filter(n =>
                                        !linkSearchTerm ||
                                        matchKorean(n.name, linkSearchTerm) ||
                                        matchKorean(n.name_en, linkSearchTerm) ||
                                        n.name.toLowerCase().includes(linkSearchTerm.toLowerCase())
                                    )
                                    .slice(0, 50)
                                    .map(n => (
                                        <button
                                            key={n.id}
                                            onClick={() => handleLinkAlias(n)}
                                            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 text-left transition-all group"
                                        >
                                            <div className={`w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center text-xs font-bold border border-gray-700 group-hover:border-blue-500 transition-colors
                                                ${n.burst === 'I' ? 'text-blue-400' : n.burst === 'II' ? 'text-orange-400' : 'text-red-400'}`}>
                                                {n.burst}
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">{n.name}</div>
                                                <div className="text-[10px] text-gray-500">{n.name_en}</div>
                                            </div>
                                            <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                                                <span className="text-xs text-blue-400 font-bold">선택 ↵</span>
                                            </div>
                                        </button>
                                    ))
                                }
                                {localData.filter(n => !linkSearchTerm || matchKorean(n.name, linkSearchTerm)).length === 0 && (
                                    <div className="p-8 text-center text-gray-500 text-sm">
                                        검색 결과가 없습니다.
                                    </div>
                                )}
                            </div>

                            <div className="p-4 bg-gray-900/80 border-t border-gray-800 text-center">
                                <button
                                    onClick={() => setLinkingGuestName(null)}
                                    className="px-6 py-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition-all text-sm"
                                >
                                    취소
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
