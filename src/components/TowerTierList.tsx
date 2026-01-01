import { useState } from 'react';
import { CORPORATE_TOWER_DATA, ATTRIBUTE_TOWER_DATA } from '../data/tower_data';
import type { NikkeData } from '../data/nikkes';
import { getMasters } from '../utils/nikkeDataManager';

interface TowerTierListProps {
    allNikkes: NikkeData[];
    onSelectNikke?: (nikke: NikkeData) => void;
    towerSquads?: Record<string, string[][]>;
    onSaveSquads?: (towerKey: string, squads: string[][]) => void;
    openNikkeSelector?: (onSelect: (nikke: NikkeData) => void) => void;
}

const DEFAULT_TOWER_SQUADS: Record<string, string[][]> = {
    "tower_corporate_0": [
        ["D : 킬러 와이프", "마르차나", "프리바티 : 언카인드 메이드", "길로틴", "프리바티"],
        ["D : 킬러 와이프", "마스트", "길로틴", "헬름", "프리바티"],
        ["D : 킬러 와이프", "마르차나", "팬텀", "프리바티 : 언카인드 메이드", "베스티"]
    ],
    "tower_corporate_1": [
        ["리타", "티아", "나가", "아인", "맥스웰"],
        ["리타", "센티", "라플라스", "드레이크", "맥스웰"],
        ["리타", "일레그", "라플라스", "아인", "맥스웰"]
    ],
    "tower_corporate_2": [
        ["루주", "블랑", "누아르", "앨리스", "소다 : 트윙클링 바니"],
        ["리타", "루주", "앨리스", "아니스 : 스파클링 서머", "누아르"],
        ["루주", "블랑", "누아르", "앨리스", "슈가"]
    ],
    "tower_corporate_3": [
        ["크라운", "도로시", "라피 : 레드 후드", "홍련 : 흑영", "신데렐라"],
        ["리틀 머메이드", "크라운", "라피 : 레드 후드", "모더니아", "나유타"],
        ["도로시", "크라운", "모더니아", "라피 : 레드 후드", "홍련 : 흑영"]
    ],
    "tower_attribute_0": [
        ["리타", "크라운", "라피 : 레드 후드", "홍련 : 흑영", "모더니아"]
    ]
};

export default function TowerTierList({ allNikkes, onSelectNikke, towerSquads = {}, onSaveSquads, openNikkeSelector }: TowerTierListProps) {
    const [activeTab, setActiveTab] = useState<'corporate' | 'attribute'>('corporate');
    const [subTab, setSubTab] = useState<number>(0);
    const [editingSquadIdx, setEditingSquadIdx] = useState<number | null>(null);
    const [tempSquad, setTempSquad] = useState<string[] | null>(null);

    const masters = getMasters();
    const colors = (masters.colors || {}) as any;
    const companyColors = colors.company || {};
    const burstColors = colors.burst || {};
    const codeTextColors = colors.code_text || {};
    const classColors = colors.class || {};
    const weaponColors = colors.weapon || {};
    const classNames = masters.class_names || {};
    const weaponNames = masters.weapon_names || {};

    const towerKey = `tower_${activeTab}_${subTab}`;
    const currentSquads = (towerSquads[towerKey] && towerSquads[towerKey].length > 0)
        ? towerSquads[towerKey]
        : (DEFAULT_TOWER_SQUADS[towerKey] || []);

    const findNikke = (nameOrObj: string | { id: string; name: string }) => {
        if (!nameOrObj) return null;
        const name = typeof nameOrObj === 'string' ? nameOrObj : nameOrObj.name;
        const id = typeof nameOrObj === 'string' ? null : nameOrObj.id;

        if (id) {
            const found = allNikkes.find(n => n.id === id);
            if (found) return found;
        }

        const cleanSearch = name.includes(':')
            ? name.split(':')[1].trim().replace(/\s/g, '').toLowerCase()
            : name.split('(')[0].trim().replace(/\s/g, '').toLowerCase();
        return allNikkes.find(n => {
            const dbName = n.name.replace(/\s/g, '').toLowerCase();
            const dbNameEn = (n.name_en || '').replace(/\s/g, '').toLowerCase();
            return dbName.includes(cleanSearch) || dbName === cleanSearch || dbNameEn.includes(cleanSearch);
        });
    };

    const handleSave = () => {
        if (tempSquad && onSaveSquads) {
            const newSquads = [...currentSquads];
            if (editingSquadIdx === -1) {
                newSquads.push(tempSquad);
            } else if (editingSquadIdx !== null) {
                newSquads[editingSquadIdx] = tempSquad;
            }
            onSaveSquads(towerKey, newSquads);
            setEditingSquadIdx(null);
            setTempSquad(null);
        }
    };

    const startEditing = (idx: number) => {
        setEditingSquadIdx(idx);
        setTempSquad(idx === -1 ? Array(5).fill('') : [...currentSquads[idx]]);
    };

    const deleteSquad = (idx: number) => {
        if (window.confirm('이 조합을 삭제하시겠습니까?') && onSaveSquads) {
            const newSquads = currentSquads.filter((_, i) => i !== idx);
            onSaveSquads(towerKey, newSquads);
        }
    };

    const moveSquad = (idx: number, direction: 'up' | 'down') => {
        if (!onSaveSquads) return;
        const newSquads = [...currentSquads];
        const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
        if (targetIdx < 0 || targetIdx >= newSquads.length) return;

        [newSquads[idx], newSquads[targetIdx]] = [newSquads[targetIdx], newSquads[idx]];
        onSaveSquads(towerKey, newSquads);
    };

    const handleSlotClick = (idx: number) => {
        if (editingSquadIdx === null || !openNikkeSelector) return;

        openNikkeSelector((nikke: NikkeData) => {
            updateSquadMember(idx, nikke.name);
        });
    };

    const updateSquadMember = (idx: number, name: string) => {
        if (tempSquad) {
            const newSquad = [...tempSquad];
            newSquad[idx] = name;
            setTempSquad(newSquad);
        }
    };

    const getNikkeStarsForCategory = (nikke: NikkeData, categoryName: string) => {
        const categoryKey = categoryName === '타워' ? (activeTab === 'corporate' ? '기업타워' : '트라이브타워') : categoryName;

        const masters = getMasters();
        const latestTiers = masters.latest_tiers || {};

        const categoryTiers = latestTiers[categoryKey] || {};

        // 이름 매칭 (정확히 일치하거나 normalize해서 일치하는지 확인)
        if (categoryTiers[nikke.name]) return categoryTiers[nikke.name];

        const searchName = nikke.name.replace(/\s+/g, '').toLowerCase();
        for (const [name, stars] of Object.entries(categoryTiers)) {
            if (name.replace(/\s+/g, '').toLowerCase() === searchName) return (stars as number);
        }

        return 0;
    };

    const NikkeItem = ({ name, tier, stars: propStars }: any) => {
        const nikke = findNikke(name);

        // 분야별 티어 정보가 있으면 그것을 우선 사용 (LATEST_TIERS 기반)
        const categoryName = '타워';
        const stars = propStars || (nikke ? getNikkeStarsForCategory(nikke, categoryName) : 0);

        // 티어 표시 변환 (별 -> 문자)
        const displayTier = stars === 5 ? 'SSS' : stars === 4 ? 'SS' : stars === 3 ? 'S' : stars === 2 ? 'A' : (stars === 1 ? 'B' : (tier === '0' ? 'SSS' : tier === '1' ? 'SS' : 'S'));

        return (
            <div
                onClick={() => nikke && onSelectNikke?.(nikke)}
                className="cursor-pointer transform hover:-translate-y-1 transition-all duration-300"
            >
                <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 hover:border-nikke-red group h-full flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-2">
                        <div className="flex flex-col min-w-0 flex-1">
                            <div className="flex items-baseline gap-1.5 flex-wrap">
                                <h3 className="font-bold text-white group-hover:text-nikke-red text-[12px] truncate">
                                    {nikke ? nikke.name : name}
                                </h3>
                                {nikke?.name_en && (
                                    <span className="text-[10px] text-blue-400 font-bold truncate">
                                        {nikke.name_en}
                                    </span>
                                )}
                            </div>
                            {nikke?.extra_info && (
                                <span className="text-[11px] text-orange-400 font-bold mt-0.5 truncate leading-tight">
                                    {nikke.extra_info}
                                </span>
                            )}
                        </div>
                        <span className={`text-[12px] font-black shrink-0 ml-1 ${displayTier === 'SSS' ? 'text-red-500' :
                            displayTier === 'SS' ? 'text-orange-400' :
                                displayTier === 'S' ? 'text-yellow-400' :
                                    displayTier === 'A' ? 'text-blue-400' :
                                        'text-gray-400'
                            }`}>{displayTier}</span>
                    </div>
                    {nikke && (
                        <div className="space-y-1 mt-auto">
                            <div className="flex flex-wrap gap-x-1.5 gap-y-1 text-[9px] font-bold">
                                <span className={companyColors[nikke.company || ''] || 'text-gray-500'}>{nikke.company || '미정'}</span>
                                <span className="text-gray-600">|</span>
                                <span className="text-gray-400 truncate">{nikke.squad || '미정'}</span>
                            </div>
                            <div className="flex flex-wrap gap-x-1.5 text-[10px] font-black items-center mt-1 pt-1 border-t border-gray-700/50">
                                <span className={burstColors[nikke.burst] || 'text-gray-400'}>{nikke.burst}버</span>
                                <span className="text-gray-600">·</span>
                                <span className={codeTextColors[nikke.code || ''] || 'text-gray-400'}>{nikke.code}</span>
                                <span className="text-gray-600">·</span>
                                <span className={classColors[nikke.class] || 'text-gray-400'}>{classNames[nikke.class] || nikke.class}</span>
                                <span className="text-gray-600">·</span>
                                <span className={weaponColors[nikke.weapon] || 'text-amber-400'}>{weaponNames[nikke.weapon] || nikke.weapon}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {/* 상단 탭 (기업/트라이브) */}
            <div className="flex p-1 bg-gray-900/50 rounded-xl border border-gray-800 max-w-sm">
                <button
                    onClick={() => { setActiveTab('corporate'); setSubTab(0); }}
                    className={`flex-1 py-2 rounded-lg text-base font-bold transition-all ${activeTab === 'corporate' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                >
                    🏢 기업 타워
                </button>
                <button
                    onClick={() => { setActiveTab('attribute'); setSubTab(0); }}
                    className={`flex-1 py-2 rounded-lg text-base font-bold transition-all ${activeTab === 'attribute' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                >
                    🎨 트라이브 타워
                </button>
            </div>

            {/* 기업 타워 서브탭 (트라이브 타워는 속성 분리 제거됨) */}
            {activeTab === 'corporate' && (
                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                    {CORPORATE_TOWER_DATA.map((tower, idx) => (
                        <button
                            key={tower.name}
                            onClick={() => setSubTab(idx)}
                            className={`px-4 py-2 rounded-lg text-base font-bold transition-all whitespace-nowrap ${subTab === idx ? 'bg-gray-700 text-white' : 'bg-gray-800/50 text-gray-500 hover:bg-gray-800'}`}
                        >
                            {tower.name}
                        </button>
                    ))}
                </div>
            )}

            {/* 조합 추가 버튼 섹션 */}
            {/* 실제 저장된 조합 리스트 (최상단) */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <span>📋</span> 현재 저장된 추천 조합
                </h3>

                <div className="grid grid-cols-1 gap-4">
                    {currentSquads.length === 0 && editingSquadIdx === null && (
                        <div className="text-center py-12 border-2 border-dashed border-gray-800 rounded-lg">
                            <p className="text-gray-600">등록된 추천 조합이 없습니다. 아래 '조합 추가' 버튼으로 추가해 보세요.</p>
                        </div>
                    )}

                    {currentSquads.map((squad, sIdx) => (
                        <div key={sIdx} className="space-y-2">
                            <div className="bg-gray-900/60 border border-gray-800 rounded-lg p-1.5 hover:border-blue-500/50 hover:bg-gray-800/40 cursor-pointer group relative flex flex-col gap-1.5 shadow-md min-h-[70px] transition-all">

                                <div className="flex items-center justify-between w-full">
                                    <div className="flex items-center gap-2">
                                        <div className={`flex items-center justify-center w-5 h-5 rounded shadow-sm ${sIdx === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' :
                                            sIdx === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500' :
                                                'bg-gradient-to-br from-orange-500 to-orange-800'
                                            }`}>
                                            <span className="text-[10px] font-black text-white italic">{sIdx + 1}</span>
                                        </div>
                                        <span className="text-[17px] font-black text-white leading-tight break-keep">
                                            {activeTab === 'corporate' ? CORPORATE_TOWER_DATA[subTab].name : '트라이브 타워'} 추천 {sIdx + 1}위
                                        </span>
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); moveSquad(sIdx, 'up'); }}
                                            disabled={sIdx === 0}
                                            className="p-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-[10px] disabled:opacity-30"
                                            title="위로 이동"
                                        >
                                            ▲
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); moveSquad(sIdx, 'down'); }}
                                            disabled={sIdx === currentSquads.length - 1}
                                            className="p-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-[10px] disabled:opacity-30"
                                            title="아래로 이동"
                                        >
                                            ▼
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); startEditing(sIdx); }}
                                            className="p-1 bg-gray-700 hover:bg-blue-600 text-white rounded text-[10px]"
                                        >
                                            ✏️
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); deleteSquad(sIdx); }}
                                            className="p-1 bg-gray-700 hover:bg-red-600 text-white rounded text-[10px]"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-5 gap-1.5 w-full">
                                    {(editingSquadIdx === sIdx ? tempSquad! : squad).map((name, idx) => {
                                        const nikke = findNikke(name);
                                        const stars = nikke ? getNikkeStarsForCategory(nikke, '타워') : 0;
                                        const displayTier = stars === 5 ? 'SSS' : stars === 4 ? 'SS' : stars === 3 ? 'S' : stars === 2 ? 'A' : (stars === 1 ? 'B' : 'B');

                                        return (
                                            <div
                                                key={idx}
                                                onClick={() => {
                                                    if (editingSquadIdx === sIdx) {
                                                        handleSlotClick(idx);
                                                    } else if (editingSquadIdx === null && nikke) {
                                                        onSelectNikke?.(nikke);
                                                    }
                                                }}
                                                className={`group/nikke relative h-full ${editingSquadIdx === null ? 'cursor-pointer' : ''}`}
                                            >
                                                <div className={`bg-gray-800/50 border ${editingSquadIdx === sIdx ? 'border-dashed border-blue-500 cursor-pointer' : 'border-gray-700'} rounded-xl p-3 hover:border-nikke-red group transition-all duration-300 h-full flex flex-col justify-between`}>
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div className="flex flex-col min-w-0 flex-1">
                                                            <div className="flex items-baseline gap-1.5 flex-wrap">
                                                                <h3 className="font-bold text-white group-hover/nikke:text-nikke-red text-base truncate">
                                                                    {nikke ? nikke.name : (name.split(' : ')[0] || 'SELECT')}
                                                                </h3>
                                                                {nikke?.name_en && (
                                                                    <span className="text-xs text-blue-400 font-medium truncate">
                                                                        {nikke.name_en}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            {nikke?.extra_info && (
                                                                <span className="text-xs text-orange-400 font-medium mt-0.5 truncate leading-tight">
                                                                    {nikke.extra_info}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <span className={`text-[12px] font-black ml-1 ${displayTier === 'SSS' ? 'text-red-500' :
                                                            displayTier === 'SS' ? 'text-orange-400' :
                                                                displayTier === 'S' ? 'text-yellow-400' :
                                                                    displayTier === 'A' ? 'text-blue-400' :
                                                                        'text-gray-400'
                                                            }`}>{displayTier}</span>
                                                    </div>

                                                    {nikke && (
                                                        <div className="space-y-1 mt-2">
                                                            <div className="flex flex-wrap gap-x-1.5 gap-y-1 text-xs font-bold">
                                                                <span className={companyColors[nikke.company || ''] || 'text-gray-500'}>{nikke.company || '미정'}</span>
                                                                <span className="text-gray-600">|</span>
                                                                <span className="text-gray-400 truncate">{nikke.squad || '미정'}</span>
                                                            </div>
                                                            <div className="flex flex-wrap gap-x-1.5 text-xs font-black items-center mt-1 pt-1 border-t border-gray-700/50">
                                                                <span className={burstColors[nikke.burst] || 'text-gray-400'}>{nikke.burst}버</span>
                                                                <span className="text-gray-600">·</span>
                                                                <span className={codeTextColors[nikke.code || ''] || 'text-gray-400'}>{codeTextColors[nikke.code || ''] ? nikke.code : nikke.code}</span>
                                                                <span className="text-gray-600">·</span>
                                                                <span className={classColors[nikke.class] || 'text-gray-400'}>{classNames[nikke.class] || nikke.class}</span>
                                                                <span className="text-gray-600">·</span>
                                                                <span className={weaponColors[nikke.weapon] || 'text-amber-400'}>{weaponNames[nikke.weapon] || nikke.weapon}</span>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {editingSquadIdx === sIdx && (
                                <div className="mt-2 flex justify-end gap-2">
                                    <button onClick={() => { setEditingSquadIdx(null); setTempSquad(null); }} className="px-3 py-1 bg-gray-800 text-gray-400 rounded text-xs hover:bg-gray-700">취소</button>
                                    <button onClick={handleSave} className="px-4 py-1 bg-blue-600 text-white rounded text-xs font-bold hover:bg-blue-500">조합 저장</button>
                                </div>
                            )}
                        </div>
                    ))}

                    {editingSquadIdx === -1 && tempSquad && (
                        <div className="bg-blue-900/10 border border-dashed border-blue-500/50 rounded-lg p-4">
                            <h4 className="text-xs font-bold text-blue-400 mb-4 flex items-center gap-1">
                                <span>➕</span> 새로운 추천 조합 추가
                            </h4>
                            <div className="grid grid-cols-5 gap-3">
                                {tempSquad.map((name, idx) => {
                                    const nikke = findNikke(name);
                                    const stars = nikke ? getNikkeStarsForCategory(nikke, '타워') : 0;
                                    const displayTier = stars === 5 ? 'SSS' : stars === 4 ? 'SS' : stars === 3 ? 'S' : stars === 2 ? 'A' : (stars === 1 ? 'B' : 'B');

                                    return (
                                        <div key={idx} className="flex flex-col gap-2">
                                            <div
                                                onClick={() => handleSlotClick(idx)}
                                                className="bg-gray-800/50 border border-gray-700 rounded-xl p-3 hover:border-blue-500 cursor-pointer group/slot transition-all duration-300 flex flex-col justify-between h-full"
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className="flex flex-col min-w-0 flex-1">
                                                        <div className="flex items-baseline gap-1 flex-wrap">
                                                            <h3 className="font-bold text-white group-hover/slot:text-blue-400 text-[12px] truncate">
                                                                {nikke ? nikke.name : (name.split(' : ')[0] || 'SELECT')}
                                                            </h3>
                                                            {nikke?.name_en && (
                                                                <span className="text-[9px] text-blue-400/80 font-medium truncate">
                                                                    {nikke.name_en}
                                                                </span>
                                                            )}
                                                        </div>
                                                        {nikke?.extra_info && (
                                                            <span className="text-[10px] text-gray-400 font-medium mt-0.5 truncate">
                                                                {nikke.extra_info}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {nikke && (
                                                        <span className={`text-[12px] font-black ml-1 ${displayTier === 'SSS' ? 'text-red-500' :
                                                            displayTier === 'SS' ? 'text-orange-400' :
                                                                displayTier === 'S' ? 'text-yellow-400' :
                                                                    displayTier === 'A' ? 'text-blue-400' :
                                                                        'text-gray-400'
                                                            }`}>{displayTier}</span>
                                                    )}
                                                </div>

                                                {nikke && (
                                                    <div className="space-y-0.5 mt-2">
                                                        <div className="flex flex-wrap gap-x-1 gap-y-0.5 text-[9px] font-bold">
                                                            <span className={companyColors[nikke.company || ''] || 'text-gray-500'}>{nikke.company || '미정'}</span>
                                                            <span className="text-cyan-500 truncate">{nikke.squad || '미정'}</span>
                                                        </div>
                                                        <div className="flex flex-wrap gap-x-1 text-[10px] font-black items-center">
                                                            <span className={burstColors[nikke.burst] || 'text-gray-400'}>{nikke.burst}버</span>
                                                            <span className="text-gray-600">·</span>
                                                            <span className={codeTextColors[nikke.code || ''] || 'text-gray-400'}>{nikke.code}</span>
                                                            <span className="text-gray-600">·</span>
                                                            <span className={classColors[nikke.class] || 'text-gray-400'}>{classNames[nikke.class] || nikke.class}</span>
                                                            <span className="text-gray-600">·</span>
                                                            <span className={weaponColors[nikke.weapon] || 'text-amber-400'}>{weaponNames[nikke.weapon] || nikke.weapon}</span>
                                                        </div>
                                                    </div>
                                                )}
                                                {!nikke && (
                                                    <div className="text-[12px] text-gray-500 mt-auto">비어 있음</div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="mt-4 flex justify-end gap-2">
                                <button onClick={() => { setEditingSquadIdx(null); setTempSquad(null); }} className="px-3 py-1.5 bg-gray-800 text-gray-400 rounded text-xs hover:bg-gray-700">취소</button>
                                <button onClick={handleSave} className="px-4 py-1.5 bg-blue-600 text-white rounded text-xs font-bold hover:bg-blue-500">저장 및 추가</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* 조합 추가 버튼 */}
            <div className="flex justify-center bg-gray-900/20 rounded-2xl p-4 border border-gray-800/50">
                {editingSquadIdx === null && (
                    <button
                        onClick={() => startEditing(-1)}
                        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-black transition-all flex items-center gap-2 shadow-lg shadow-blue-900/20"
                    >
                        <span>➕</span> {activeTab === 'corporate' ? CORPORATE_TOWER_DATA[subTab].name : '트라이브 타워'} 조합 추가
                    </button>
                )}
                {editingSquadIdx !== null && (
                    <div className="text-blue-400 text-sm font-bold flex items-center gap-2">
                        <span className="animate-spin text-base">🔄</span> 조합 편집 중...
                    </div>
                )}
            </div>

            {/* 추천 니케 티어리스트 (최하단 배치) */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <span>🏆</span> {activeTab === 'corporate' ? CORPORATE_TOWER_DATA[subTab].name : '트라이브 타워'} 티어리스트
                    </h3>
                    <div className="text-xs text-gray-500 italic">
                        * 해당 타워 출전 가능 니케 가이드
                    </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {(() => {
                        const currentTowerName = activeTab === 'corporate' ? CORPORATE_TOWER_DATA[subTab].name : '트라이브 타워';
                        const categoryName = '타워';

                        // 1. 고정 데이터 기반 니케들
                        const staticNikkes = activeTab === 'corporate'
                            ? CORPORATE_TOWER_DATA[subTab].nikkes
                            : ATTRIBUTE_TOWER_DATA.flatMap(t => t.nikkes);

                        // 2. DB에서 해당 기업/속성에 맞는 니케들 중 티어가 있는 니케들 추가
                        const dbNikkes = allNikkes.filter(n => {
                            if (activeTab === 'corporate') {
                                const towerName = currentTowerName.replace(' 타워', '');
                                const companyName = towerName === '필그림/오버스펙' ? '필그림' : towerName;

                                if (companyName === '필그림') {
                                    const overspecNikkes = ['레드 후드', '라피 : 레드 후드', '미하라 : 본딩 체인', '리틀 머메이드'];
                                    return n.company === '필그림' || overspecNikkes.includes(n.name);
                                }
                                return n.company === companyName;
                            }
                            return true;
                        }).filter(n => {
                            const stars = getNikkeStarsForCategory(n, categoryName);
                            return stars >= 3;
                        }).map(n => ({
                            name: n.name,
                            tier: getNikkeStarsForCategory(n, categoryName) === 5 ? '0' : getNikkeStarsForCategory(n, categoryName) === 4 ? '1' : '2',
                            burst: n.burst === 'A' ? 'A' : `B${n.burst}`,
                            role: n.class.split('(')[0],
                            note: (n as any).note || '',
                            alternatives: [],
                            isEligible: true
                        }));

                        // 3. 고정 데이터 니케들의 자격 검증
                        const validatedStaticNikkes = staticNikkes.map(sN => {
                            const nikke = findNikke(sN.name);
                            let isEligible = true;
                            if (nikke) {
                                if (activeTab === 'corporate') {
                                    const towerName = currentTowerName.replace(' 타워', '');
                                    const companyName = towerName === '필그림/오버스펙' ? '필그림' : towerName;

                                    if (companyName === '필그림') {
                                        const overspecNikkes = ['레드 후드', '라피 : 레드 후드', '미하라 : 본딩 체인', '리틀 머메이드'];
                                        isEligible = nikke.company === '필그림' || overspecNikkes.includes(nikke.name);
                                    } else {
                                        isEligible = nikke.company === companyName;
                                    }
                                }
                            }
                            return { ...sN, isEligible };
                        });

                        // 중복 제거 및 합치기
                        const combinedNikkes: any[] = [];
                        validatedStaticNikkes.filter(n => n.isEligible).forEach(n => {
                            if (!combinedNikkes.find(sN => sN.name === n.name)) {
                                combinedNikkes.push(n);
                            }
                        });

                        dbNikkes.forEach(dbN => {
                            if (!combinedNikkes.find(sN => sN.name === dbN.name)) {
                                combinedNikkes.push(dbN);
                            }
                        });

                        return combinedNikkes
                            .sort((a, b) => parseInt(a.tier) - parseInt(b.tier))
                            .map((nikke, idx) => (
                                <NikkeItem key={`tier-${idx}`} {...nikke} />
                            ));
                    })()}
                </div>
            </div>

            {/* 하단 팁 섹션 */}
            <div className="bg-blue-900/10 border border-blue-900/30 p-4 rounded-xl text-[11px] text-blue-300/80 leading-relaxed">
                <p className="font-black text-blue-400 mb-1">📌 {activeTab === 'corporate' ? '기업 타워' : '트라이브 타워'} 공략 팁</p>
                {activeTab === 'corporate' ? (
                    <ul className="list-disc list-inside space-y-1">
                        <li>해당 제조사 니케만 사용 가능합니다.</li>
                        <li>B1(20초 쿨감), B2(탱킹), B3(딜러) 버스트 사이클이 핵심입니다.</li>
                        <li>0티어 니케를 4~5명 보유하면 상위권 진입이 수월합니다.</li>
                    </ul>
                ) : (
                    <ul className="list-disc list-inside space-y-1">
                        <li>속성별 특화 니케를 우선적으로 사용하세요.</li>
                        <li>통합 티어리스트의 0~1티어 조합이면 안정적인 진행이 가능합니다.</li>
                        <li>보스 약점 속성에 따라 덱 구성을 유연하게 변경하는 것이 좋습니다.</li>
                    </ul>
                )}
            </div>
        </div>
    );
}
