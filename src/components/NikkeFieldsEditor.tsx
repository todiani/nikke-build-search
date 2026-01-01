import type { NikkeData } from '../data/nikkes';
import { getBurstOptions, getClassOptions, getCodeOptions, getCompanyOptions, getMasters, getRarityOptions, getSquadOptions, getTierOptions, getWeaponOptions } from '../utils/nikkeDataManager';
import { useState, useEffect } from 'react';
import SquadManager from './SquadManager';
import NikkeBuildEditor from './NikkeBuildEditor';

interface NikkeFieldsEditorProps {
    data: NikkeData;
    onChange: (field: keyof NikkeData, value: any) => void;
    onUsageStatChange: (idx: number, field: 'stars' | 'desc', value: any) => void;
    onBurstDetailChange: (stage: "2RL" | "2_5RL" | "3RL" | "3_5RL" | "4RL", field: 'value' | 'hits' | 'bonus', val: any) => void;
}

export default function NikkeFieldsEditor({ data, onChange, onUsageStatChange, onBurstDetailChange }: NikkeFieldsEditorProps) {
    const [squads, setSquads] = useState<string[]>([]);
    const [tiers, setTiers] = useState<string[]>([]);
    const [rarities, setRarities] = useState<string[]>([]);
    const [companies, setCompanies] = useState<string[]>([]);
    const [codes, setCodes] = useState<string[]>([]);
    const [classes, setClasses] = useState<string[]>([]);
    const [bursts, setBursts] = useState<string[]>([]);
    const [weapons, setWeapons] = useState<string[]>([]);

    function refreshOptions() {
        setSquads(getSquadOptions());
        setTiers(getTierOptions());
        setRarities(getRarityOptions());
        setCompanies(getCompanyOptions());
        setCodes(getCodeOptions());
        setClasses(getClassOptions());
        setBursts(getBurstOptions());
        setWeapons(getWeaponOptions());
    }

    // Load squads on mount and whenever they might have changed
    useEffect(() => {
        refreshOptions();

        const handler = () => {
            refreshOptions();
        };

        window.addEventListener('nikke-db-updated', handler);
        return () => window.removeEventListener('nikke-db-updated', handler);
    }, []);

    const [isSquadManagerOpen, setIsSquadManagerOpen] = useState(false);
    const [managerMode, setManagerMode] = useState<'list' | 'add' | 'edit' | 'delete'>('list');
    const [managerTarget, setManagerTarget] = useState<string | undefined>(undefined);

    // Refresh squads when SquadManager closes
    useEffect(() => {
        if (!isSquadManagerOpen) {
            refreshOptions();
        }
    }, [isSquadManagerOpen]);

    const handleOpenSquadManager = (mode: 'list' | 'add' | 'edit' | 'delete', target?: string) => {
        setManagerMode(mode);
        // If mode is edit or delete, we need a target. If target is base squad, fallback to list?
        // SquadManager logic handles base squad safety (e.g. not deleting base).
        if ((mode === 'edit' || mode === 'delete') && target) {
            setManagerTarget(target);
        } else {
            setManagerTarget(undefined);
            // If trying to edit/delete nothing/invalid, maybe default to list? 
            // Current Add/List setup already handles this.
        }
        setIsSquadManagerOpen(true);
    };

    return (
        <div className="space-y-6">
            {/* 1. 기본 정보 */}
            <div className="bg-black/30 p-4 rounded-lg border border-gray-700">
                <h4 className="text-sm font-bold text-gray-400 mb-3">📛 기본 정보</h4>
                <div className="grid grid-cols-2 gap-3 mb-4">
                    <div>
                        <label className="text-xs text-gray-500 block mb-1">한글 이름</label>
                        <input type="text" value={data.name} onChange={e => onChange('name', e.target.value)}
                            className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded" />
                    </div>
                    <div>
                        <label className="text-xs text-gray-500 block mb-1">영문 이름</label>
                        <input type="text" value={data.name_en} onChange={e => onChange('name_en', e.target.value)}
                            className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded" />
                    </div>
                    <div className="col-span-2">
                        <label className="text-xs text-gray-500 block mb-1">추가 정보 (특별판 등)</label>
                        <input type="text" value={data.extra_info || ''} onChange={e => onChange('extra_info', e.target.value)}
                            placeholder="니어 오토마타, 2주년 등" className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded" />
                    </div>
                    <div className="col-span-2">
                        <label className="text-xs text-gray-500 block mb-1">별명 / 별칭 (쉼표로 구분)</label>
                        <input 
                            type="text" 
                            value={(data.aliases || []).join(', ')} 
                            onChange={e => onChange('aliases', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                            placeholder="리크, 수니스, 흑련 등" 
                            className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded" 
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                        <label className="text-xs text-gray-500 block mb-1">티어</label>
                        <select value={data.tier} onChange={e => onChange('tier', e.target.value)}
                            className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded">
                            {tiers.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs text-gray-500 block mb-1">희귀도</label>
                        <select value={data.rarity || 'SSR'} onChange={e => onChange('rarity', e.target.value)}
                            className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded">
                            {rarities.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs text-gray-500 block mb-1">제조사</label>
                        <select value={data.company || ''} onChange={e => onChange('company', e.target.value)}
                            className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded">
                            <option value="">선택</option>
                            {companies.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label className="text-xs text-gray-500 block">스쿼드</label>
                            <div className="flex gap-1">
                                <button
                                    type="button"
                                    onClick={() => handleOpenSquadManager('add')}
                                    title="스쿼드 추가"
                                    className="text-[10px] bg-gray-700 hover:bg-gray-600 px-1 rounded text-gray-300"
                                >
                                    +
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleOpenSquadManager('edit', data.squad)}
                                    title="수정"
                                    className="text-[10px] bg-gray-700 hover:bg-gray-600 px-1 rounded text-gray-300"
                                >
                                    ✏️
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleOpenSquadManager('delete', data.squad)}
                                    title="삭제 (관리)"
                                    className="text-[10px] bg-red-900/50 hover:bg-red-800/50 px-1 rounded text-red-300"
                                >
                                    🗑️
                                </button>
                            </div>
                        </div>
                        <select value={data.squad || ''} onChange={e => onChange('squad', e.target.value)}
                            className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded">
                            <option value="">없음 (선택)</option>
                            {squads.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>

                        {/* Squad Manager Modal */}
                        <SquadManager
                            isOpen={isSquadManagerOpen}
                            onClose={() => setIsSquadManagerOpen(false)}
                            onUpdate={refreshOptions}
                            onSquadRename={(oldName, newName) => {
                                if (data.squad === oldName) {
                                    onChange('squad', newName); // Update the current Nikke's squad field
                                }
                            }}
                            initialMode={managerMode}
                            targetSquad={managerTarget}
                        />
                    </div>
                    <div>
                        <label className="text-xs text-gray-500 block mb-1">속성</label>
                        <select value={data.code || ''} onChange={e => onChange('code', e.target.value)}
                            className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded">
                            <option value="">선택</option>
                            {codes.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs text-gray-500 block mb-1">클래스</label>
                        <select value={data.class} onChange={e => onChange('class', e.target.value)}
                            className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded">
                            {classes.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs text-gray-500 block mb-1">버스트</label>
                        <select value={data.burst} onChange={e => onChange('burst', e.target.value)}
                            className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded">
                            {bursts.map(t => <option key={t} value={t}>버스트 {t}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs text-gray-500 block mb-1">무기</label>
                        <select value={data.weapon} onChange={e => onChange('weapon', e.target.value)}
                            className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded">
                            {weapons.map(t => <option key={t} value={t}>{getMasters().weapon_names?.[t] || t}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {/* 2. 주요 사용 콘텐츠 */}
            <div className="bg-black/30 p-4 rounded-lg border border-gray-700">
                <h4 className="text-sm font-bold text-gray-400 mb-3">📍 주요 사용 콘텐츠 및 총평</h4>

                <div className="mb-4">
                    <label className="text-xs text-gray-500 block mb-1">💡 활용 가이드 / 총평 (작열코드 우월 등 상세 설명)</label>
                    <textarea
                        value={data.desc || ''}
                        onChange={e => onChange('desc', e.target.value)}
                        placeholder="예: 작열코드가 우월코드인 보스 콘텐츠에서 사용하며..."
                        className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded h-24 resize-none text-sm leading-relaxed"
                    />
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left text-gray-300">
                        <thead className="bg-gray-800 text-gray-400">
                            <tr>
                                <th className="px-3 py-2 border border-gray-700">콘텐츠명</th>
                                <th className="px-3 py-2 border border-gray-700 text-center w-32">추천도 (별점)</th>
                                <th className="px-3 py-2 border border-gray-700">콘텐츠별 상세 설명</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(data.usage_stats || []).map((stat, idx) => (
                                <tr key={idx} className="border-b border-gray-800">
                                    <td className="px-3 py-2 border border-gray-700 font-bold bg-black/20">{stat.name}</td>
                                    <td className="px-3 py-2 border border-gray-700 text-center">
                                        <div className="flex justify-center gap-0.5">
                                            {[1, 2, 3, 4, 5].map(s => (
                                                <button
                                                    key={s}
                                                    type="button"
                                                    onClick={() => onUsageStatChange(idx, 'stars', stat.stars === s ? 0 : s)}
                                                    className={`text-base transition-colors ${s <= stat.stars ? 'text-yellow-500' : 'text-gray-700 hover:text-gray-500'}`}
                                                >
                                                    ★
                                                </button>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-3 py-2 border border-gray-700 text-gray-400">
                                        <input type="text" value={stat.desc} onChange={e => onUsageStatChange(idx, 'desc', e.target.value)}
                                            placeholder="상세 설명 입력..."
                                            className="w-full bg-gray-800 border border-transparent focus:border-gray-600 rounded px-2 py-0.5 outline-none transition-colors" />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* 3. 빌드 정보 (새로 추가됨) */}
            <NikkeBuildEditor data={data} onChange={onChange} />
        </div>
    );
}
