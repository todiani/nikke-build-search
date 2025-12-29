import { useState, useMemo, useEffect } from 'react';
import type { NikkeData } from '../data/nikkes';
import type { MetaTeam } from '../utils/nikkeDataManager';
import { SYNERGIES } from '../data/synergies';
import { matchKorean } from '../utils/hangul';
import { BURST_DB as BURSTDB, type RLStage } from '../data/burst_db';
import TowerTierList from './TowerTierList';
import { loadDB, saveTowerSquads, saveMetaTeams, saveSavedTeams, LATEST_TIERS, normalize } from '../utils/nikkeDataManager';
import SearchBar from './SearchBar';
import SearchFilters, { initialFilters, type SearchFiltersState } from './SearchFilters';
import NikkeDetail from './NikkeDetail';

import { codeTextColors, burstColors, classColors, companyColors, classNames, weaponColors } from '../utils/nikkeConstants';

interface TeamAnalysisProps {
    currentNikke?: NikkeData;
    allNikkes?: NikkeData[];
    onSelectNikke?: (nikke: NikkeData) => void;
    onOpenDataManager?: (nikke: NikkeData) => void;
    onSaveNikke?: (nikke: NikkeData) => Promise<void>;
}

// 니케 카드 디자인 통일 (CategoryNikkeItem)
function CategoryNikkeItem({ nikke, categoryId, onSelect }: { nikke: NikkeData, categoryId: string, onSelect?: (n: NikkeData) => void }) {
    // 티어 정보 가져오기 (LATEST_TIERS 기반)
    const stars = getNikkeStarsForCategory(nikke, categoryId);
    
    // 티어 표시 변환 (별 -> 문자)
    const displayTier = stars === 5 ? 'SSS' : stars === 4 ? 'SS' : stars === 3 ? 'S' : stars === 2 ? 'A' : 'B';

    return (
        <div 
            onClick={() => onSelect?.(nikke)}
            className="cursor-pointer transform hover:-translate-y-1 transition-all duration-300"
        >
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 hover:border-nikke-red group h-full flex flex-col justify-between">
                <div className="flex justify-between items-start mb-2">
                    <div className="flex flex-col">
                        <div className="flex items-baseline gap-1.5 flex-wrap">
                            <h3 className="font-bold text-white group-hover:text-nikke-red text-[13px]">
                                {nikke.name}
                            </h3>
                            {nikke.name_en && (
                                <span className="text-[10px] text-blue-400 font-bold">
                                    {nikke.name_en}
                                </span>
                            )}
                        </div>
                        {nikke.extra_info && (
                            <span className="text-[11px] text-orange-400 font-bold mt-0.5">
                                {nikke.extra_info}
                            </span>
                        )}
                    </div>
                    <span className={`text-[12px] font-black ${
                        displayTier === 'SSS' ? 'text-red-500' :
                        displayTier === 'SS' ? 'text-orange-400' :
                        displayTier === 'S' ? 'text-yellow-400' :
                        displayTier === 'A' ? 'text-blue-400' :
                        'text-gray-400'
                    }`}>{displayTier}</span>
                </div>
                
                <div className="space-y-1 mt-2">
                    <div className="flex flex-wrap gap-x-2 gap-y-1 text-[10px] font-bold">
                        <span className={companyColors[nikke.company || ''] || 'text-gray-500'}>{nikke.company || '제조사 미정'}</span>
                        <span className="text-gray-600">|</span>
                        <span className="text-cyan-400">{nikke.squad || '스쿼드 미정'}</span>
                    </div>
                    <div className="flex flex-wrap gap-x-1.5 text-[11px] font-black items-center mt-1 pt-1 border-t border-gray-700/50">
                    <span className={burstColors[nikke.burst] || 'text-gray-400'}>{nikke.burst}버</span>
                    <span className="text-gray-600">·</span>
                    <span className={codeTextColors[nikke.code || ''] || 'text-gray-400'}>{nikke.code}</span>
                    <span className="text-gray-600">·</span>
                    <span className={classColors[nikke.class] || 'text-gray-400'}>{classNames[nikke.class] || nikke.class}</span>
                    <span className="text-gray-600">·</span>
                    <span className={weaponColors[nikke.weapon] || 'text-amber-400'}>{nikke.weapon}</span>
                </div>
                </div>
            </div>
        </div>
    );
}

// 분야별 티어 정보 가져오기 유틸리티 (LATEST_TIERS 기반)
const getNikkeStarsForCategory = (nikke: NikkeData, categoryId: string) => {
    const mapping: Record<string, string> = {
        'Stage': '스테이지',
        'Anomaly': '이상개체요격전',
        'SoloRaid': '솔로레이드',
        'UnionRaid': '유니온레이드',
        'PVP': 'PVP',
        'Tower': '기업타워'
    };
    const categoryKey = mapping[categoryId] || categoryId;
    const categoryTiers = LATEST_TIERS[categoryKey] || {};
    
    // 이름 매칭 (정확히 일치하거나 normalize해서 일치하는지 확인)
    if (categoryTiers[nikke.name]) return categoryTiers[nikke.name];
    
    const searchName = normalize(nikke.name);
    for (const [name, stars] of Object.entries(categoryTiers)) {
        if (normalize(name) === searchName) return (stars as number);
    }
    
    return 0;
};

// 니케 선택 모달 컴포넌트
function NikkeSelector({ isOpen, onClose, onSelect, allNikkes }: { 
    isOpen: boolean; 
    onClose: () => void; 
    onSelect: (nikke: NikkeData) => void;
    allNikkes: NikkeData[];
}) {
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState<SearchFiltersState>(initialFilters);
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const filteredNikkes = useMemo(() => {
        return allNikkes.filter(nikke => {
            const nameMatch = matchKorean(nikke.name, searchTerm) || matchKorean(nikke.name_en, searchTerm);
            if (!nameMatch) return false;

            if (filters.tier && nikke.tier !== filters.tier) return false;
            if (filters.company && nikke.company !== filters.company) return false;
            if (filters.squad && nikke.squad !== filters.squad) return false;
            if (filters.class && nikke.class !== filters.class) return false;
            if (filters.code && nikke.code !== filters.code) return false;
            if (filters.burst && nikke.burst !== filters.burst) return false;
            if (filters.weapon && nikke.weapon !== filters.weapon) return false;

            return true;
        });
    }, [allNikkes, searchTerm, filters]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <div className="bg-gray-950 border border-gray-800 rounded-3xl w-full max-w-[1600px] max-h-[95vh] flex flex-col shadow-2xl overflow-hidden">
                <div className="p-6 border-b border-gray-800 bg-gray-900/30 space-y-6">
                    <div className="flex justify-between items-center">
                        <h3 className="text-2xl font-black text-white tracking-tight">니케 선택</h3>
                        <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl transition-colors">✕</button>
                    </div>

                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                                <SearchBar 
                                    value={searchTerm} 
                                    onChange={setSearchTerm}
                                    autoFocus={true}
                                />
                            </div>
                            <div className="flex items-start">
                                <SearchFilters 
                                    filters={filters} 
                                    onChange={setFilters}
                                    isOpen={isFilterOpen}
                                    onToggle={() => setIsFilterOpen(!isFilterOpen)}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filteredNikkes.map(nikke => (
                            <CategoryNikkeItem 
                                key={nikke.id} 
                                nikke={nikke} 
                                categoryId="Stage"
                                onSelect={onSelect}
                            />
                        ))}
                    </div>
                </div>

                <div className="p-4 bg-gray-900/50 border-t border-gray-800 text-center">
                    <p className="text-xs text-gray-500 font-bold">검색 결과: {filteredNikkes.length}명의 니케</p>
                </div>
            </div>
        </div>
    );
}

export default function TeamAnalysis({ currentNikke, allNikkes = [], onSelectNikke, onOpenDataManager, onSaveNikke }: TeamAnalysisProps) {
    // 검색 및 필터 상태 추가
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState<SearchFiltersState>(initialFilters);
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    // 필터링 로직
    const filteredNikkes = useMemo(() => {
        return allNikkes.filter(nikke => {
            // 1. 이름 검색 (한글 초성/영문 대응)
            const nameMatch = matchKorean(nikke.name, searchTerm) || matchKorean(nikke.name_en, searchTerm);
            if (!nameMatch) return false;

            // 2. 상세 필터 적용
            if (filters.tier && nikke.tier !== filters.tier) return false;
            if (filters.company && nikke.company !== filters.company) return false;
            if (filters.squad && nikke.squad !== filters.squad) return false;
            if (filters.class && nikke.class !== filters.class) return false;
            if (filters.code && nikke.code !== filters.code) return false;
            if (filters.burst && nikke.burst !== filters.burst) return false;
            if (filters.weapon && nikke.weapon !== filters.weapon) return false;

            return true;
        });
    }, [allNikkes, searchTerm, filters]);

    // State for the custom builder
    const [selectedTeam, setSelectedTeam] = useState<({ id: string; name: string; isGuest: boolean; burst?: string } | null)[]>(Array(5).fill(null));

    // Selector State
    const [selectorOpen, setSelectorOpen] = useState(false);
    const [activeSlot, setActiveSlot] = useState<number>(-1);

    // State for Simulation Settings
    const [simSettings, setSimSettings] = useState({
        level: 360, 
        core: 0,
        equipTier: 3
    });

    // State for Saved Teams
    const [savedTeams, setSavedTeams] = useState<SavedTeam[]>([]);
    const [metaTeams, setMetaTeams] = useState<MetaTeam[]>([]);
    const [towerSquads, setTowerSquads] = useState<Record<string, string[][]>>({});

    // Burst DB Editor States
    const [showBurstEditor, setShowBurstEditor] = useState(false);
    const [localBurstDB, setLocalBurstDB] = useState(BURSTDB);

    // Sync with global BURST_DB when it updates
    useEffect(() => {
        if (showBurstEditor) {
            setLocalBurstDB(BURSTDB);
        }
    }, [showBurstEditor]);
    const [editorSearchTerm, setEditorSearchTerm] = useState('');

    // Automatically sync all Nikkes into localBurstDB
    useEffect(() => {
        if (!allNikkes || allNikkes.length === 0) return;

        setLocalBurstDB(prev => {
            const updated = { ...prev };
            let hasChanges = false;

            allNikkes.forEach(nikke => {
                const cleanName = nikke.name.split(' (')[0].trim();
                if (!updated[cleanName] && !updated[nikke.name]) {
                    updated[cleanName] = {
                        "2RL": { value: 0, hits: "0-0", bonus: "0%-0%" },
                        "2_5RL": { value: 0, hits: "0-0", bonus: "0%-0%" },
                        "3RL": { value: 0, hits: "0-0", bonus: "0%-0%" },
                        "3_5RL": { value: 0, hits: "0-0", bonus: "0%-0%" },
                        "4RL": { value: 0, hits: "0-0", bonus: "0%-0%" }
                    };
                    hasChanges = true;
                }
            });

            return hasChanges ? updated : prev;
        });
    }, [allNikkes]);

    const filteredEditorNikkes = useMemo(() => {
        const entries = Object.entries(localBurstDB);
        if (!editorSearchTerm) return entries;
        const search = editorSearchTerm.toLowerCase();
        return entries.filter(([name]) => name.toLowerCase().includes(search));
    }, [localBurstDB, editorSearchTerm]);

    const handleSaveBurstDB = async (newData: any) => {
        try {
            const response = await fetch('http://localhost:3001/api/burst-db', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newData)
            });
            if (response.ok) {
                setLocalBurstDB(newData);
                alert("버스트 DB가 저장되었습니다.");
            } else {
                alert("저장 실패");
            }
        } catch (err) {
            console.error(err);
            alert("서버 연결 실패");
        }
    };

    const [onTowerNikkeSelect, setOnTowerNikkeSelect] = useState<((nikke: NikkeData) => void) | null>(null);

    const openTowerNikkeSelector = (onSelect: (nikke: NikkeData) => void) => {
        setOnTowerNikkeSelect(() => onSelect);
        setActiveSlot(-1);
        setMetaSlotIdx(null);
        setSelectorOpen(true);
    };

    // Load Data from LocalStorage/DB
    useEffect(() => {
        const init = async () => {
            const { meta_teams, tower_squads, saved_teams } = await loadDB();
            if (saved_teams && saved_teams.length > 0) setSavedTeams(saved_teams);
            if (meta_teams && meta_teams.length > 0) setMetaTeams(meta_teams);
            if (tower_squads) setTowerSquads(tower_squads);
        };
        init();
    }, []);

    const handleSaveTowerSquads = async (towerKey: string, squads: string[][]) => {
        const newSquads = { ...towerSquads, [towerKey]: squads };
        setTowerSquads(newSquads);
        await saveTowerSquads(newSquads);
    };

    const updateMetaTeams = async (newTeams: MetaTeam[]) => {
        setMetaTeams(newTeams);
        await saveMetaTeams(newTeams);
    };

    const updateSavedTeams = async (newTeams: SavedTeam[]) => {
        setSavedTeams(newTeams);
        await saveSavedTeams(newTeams);
    };

    const handleSaveSquad = async () => {
        const activeMembers = selectedTeam.filter(Boolean);
        if (activeMembers.length === 0) { alert("저장할 니케가 없습니다."); return; }
        const name = prompt("스쿼드 이름을 입력해주세요:", "나만의 스쿼드");
        if (!name) return;

        const newSquad: SavedTeam = {
            id: Date.now(),
            name,
            category: 'Custom',
            members: selectedTeam as any,
            date: new Date().toLocaleDateString()
        };

        const updated = [newSquad, ...savedTeams];
        await updateSavedTeams(updated);
    };

    const handleDeleteSquad = async (id: number) => {
        if (!confirm("삭제하시겠습니까?")) return;
        const updated = savedTeams.filter(t => t.id !== id);
        await updateSavedTeams(updated);
    };

    const getNikkeInfo = (nameOrObj: string | { id: string; name: string; isGuest?: boolean }) => {
        if (!nameOrObj) return null;

        const name = typeof nameOrObj === 'string' ? nameOrObj : nameOrObj.name;
        const id = typeof nameOrObj === 'string' ? null : nameOrObj.id;
        
        // Robust normalization: Remove spaces, special characters, and content in parentheses
        const robustNormalize = (s: string) => s.split('(')[0].replace(/[^\w가-힣]/g, '').toLowerCase();
        const searchName = robustNormalize(name);

        // 1. Find in allNikkes (User's DB)
        let found = id ? allNikkes.find(n => n.id === id) : null;
        
        if (!found) {
            found = allNikkes.find(n => {
                const dbName = robustNormalize(n.name);
                const dbNameEn = n.name_en ? robustNormalize(n.name_en) : '';
                const dbAliases = n.aliases?.map(a => robustNormalize(a)) || [];
                
                return dbName === searchName || dbNameEn === searchName || dbAliases.includes(searchName);
            });
        }

        if (found) {
            return {
                burst: (found.name.includes('레드후드') || found.name.includes('레드 후드')) ? 'A' : found.burst,
                element: found.code,
                code: found.code,
                weapon: found.weapon,
                class: found.class,
                name: found.name,
                name_en: found.name_en,
                extra_info: found.extra_info,
                thumbnail: found.thumbnail,
                company: found.company,
                squad: found.squad,
                isGuest: false
            };
        }

        // Fallback for Nikkes not yet perfectly matched but treated as in DB
        return { 
            burst: name.includes('레드후드') ? 'A' : '?', 
            element: '?', 
            code: '?',
            weapon: '?', 
            class: '?', 
            name, 
            name_en: undefined,
            extra_info: undefined,
            thumbnail: undefined,
            company: '?',
            squad: '?',
            isGuest: false 
        };
    };

    // Calculate Synergy
    const synergyAnalysis = useMemo(() => {
        const fullTeam = selectedTeam.filter(Boolean).map(m => getNikkeInfo(m!.name));
        if (fullTeam.length === 0) return null;

        let score = 0;
        const messages: string[] = [];
        const teamNames = fullTeam.map(n => n?.name || "");
        const bursts = fullTeam.map(n => n?.burst);

        // Logic (Same as before but on dynamically loaded data)
        const hasA = bursts.some(b => b === 'A'); // Red Hood / Wildcard
        const hasB1 = bursts.some(b => b === 'I') || hasA;
        const hasB2 = bursts.some(b => b === 'II') || hasA;
        const hasB3 = bursts.some(b => b === 'III') || hasA;

        if (hasB1 && hasB2 && hasB3) {
            score += 40;
            messages.push(hasA ? "✅ 풀 버스트 체인 완성 (올라운더 포함)" : "✅ 풀 버스트 체인 완성 (+40)");
        }
        else { messages.push("⚠️ 버스트 체인 끊김"); }

        // 2. Cooldown Check (Heuristic)
        const b1Count = bursts.filter(b => b === 'I').length;
        // Known 20s B1s
        const has20sB1 = teamNames.some(n => ['리타', '도로시', '세이렌', '동디', '티아', '볼륨', '페퍼', '루주', 'D: 킬러 와이프', '레드 후드', '라피'].some(k => n.includes(k)));
        if (hasB1 && b1Count < 2 && !has20sB1) { messages.push("ℹ️ 1버스트 쿨타임 주의"); score -= 10; }
        else if (hasB1) score += 10;

        // 3. New Advanced Synergy (from 100 list)
        SYNERGIES.forEach(syn => {
            // Check if ALL names in syn.names are present in teamNames
            const isMatch = syn.names.every(requiredName => {
                return teamNames.some(tn => tn === requiredName || tn.includes(requiredName));
            });

            if (isMatch) {
                if (!messages.includes(`✅ ${syn.desc}`)) {
                    score += syn.score;
                    messages.push(`✅ ${syn.desc}`);
                }
            }
        });

        score = Math.min(score, 100);

        // CP Calcs
        const baseCPPerUnit = Math.max(10000, 30000 + (simSettings.level - 200) * 350);
        const coreMult = 1 + (simSettings.core * 0.05);
        const equipMult = 1 + (simSettings.equipTier * 0.15);
        const synergyMult = 1 + (score / 200);

        const totalCP = fullTeam.reduce((acc, unit) => {
            let unitCP = baseCPPerUnit;
            if (unit?.isGuest) unitCP *= 1.1;
            return acc + (unitCP * coreMult * equipMult * synergyMult);
        }, 0);

        return { score, messages, totalCP: Math.floor(totalCP) };
    }, [selectedTeam, simSettings, allNikkes]);

    // 4. Burst Calculator Logic (Spec 3.3 + Graphic Expansion)
    const getBurstGrade = (burst2RL: number) => {
        if (burst2RL >= 100) return "S";
        if (burst2RL >= 80) return "A";
        if (burst2RL >= 60) return "B";
        if (burst2RL >= 40) return "C";
        return "D";
    };

    const burstAnalysis = useMemo(() => {
        const stages: RLStage[] = ["2RL", "2_5RL", "3RL", "3_5RL", "4RL"];
        const totals: Record<RLStage, {
            value: number;
            hitsMin: number;
            hitsMax: number;
            bonusMin: number;
            bonusMax: number;
        }> = {
            "2RL": { value: 0, hitsMin: 0, hitsMax: 0, bonusMin: 0, bonusMax: 0 },
            "2_5RL": { value: 0, hitsMin: 0, hitsMax: 0, bonusMin: 0, bonusMax: 0 },
            "3RL": { value: 0, hitsMin: 0, hitsMax: 0, bonusMin: 0, bonusMax: 0 },
            "3_5RL": { value: 0, hitsMin: 0, hitsMax: 0, bonusMin: 0, bonusMax: 0 },
            "4RL": { value: 0, hitsMin: 0, hitsMax: 0, bonusMin: 0, bonusMax: 0 }
        };

        const parseRange = (range?: string): [number, number] => {
            if (!range) return [0, 0];
            const parts = range.replace(/g/, '.').replace(/%/g, '').split('-');
            return [parseFloat(parts[0]) || 0, parseFloat(parts[1]) || (parts[0] ? parseFloat(parts[0]) : 0)];
        };

        selectedTeam.forEach((member) => {
            if (!member) return;
            const cleanName = member.name.split(' (')[0].trim();

            // Priority: Nikke Objects (current data) - BURSTDB
            const nikkeObj = allNikkes.find(n => n.name === member.name);
            const data = nikkeObj?.burst_details || localBurstDB[cleanName] || localBurstDB[member.name];

            if (data) {
                stages.forEach(s => {
                    const stageData = data[s];
                    if (stageData) {
                        totals[s].value += stageData.value || 0;
                        const [hMin, hMax] = parseRange(stageData.hits);
                        totals[s].hitsMin += hMin;
                        totals[s].hitsMax += hMax;
                        const [bMin, bMax] = parseRange(stageData.bonus);
                        totals[s].bonusMin += bMin;
                        totals[s].bonusMax += bMax;
                    }
                });
            }
        });

        return totals;
    }, [selectedTeam, allNikkes, localBurstDB]);

    const loadTeam = (members: string[]) => {
        const newTeam = Array(5).fill(null);
        members.forEach((m, i) => {
            if (i < 5) {
                const isGuest = !allNikkes.some(n => normalize(n.name) === normalize(m));
                newTeam[i] = { id: m, name: m, isGuest };
            }
        });
        setSelectedTeam(newTeam);
    };

    // Unified Filter / View Switching Logic
    const [filterCategory, setFilterCategory] = useState<'All' | 'Stage' | 'Anomaly' | 'SoloRaid' | 'UnionRaid' | 'PVP' | 'Tower'>('All');
    const [hideMissingTeams, setHideMissingTeams] = useState(false);
    const [editingMetaIdx, setEditingMetaIdx] = useState<number | null>(null);
    const [tempMetaTeam, setTempMetaTeam] = useState<MetaTeam | null>(null);
    const [isBulkMetaEditOpen, setIsBulkMetaEditOpen] = useState(false);
    const [bulkMetaJson, setBulkMetaJson] = useState('');
    const [bulkMetaError, setBulkMetaError] = useState<string | null>(null);
    const [linkingGuestName, setLinkingGuestName] = useState<string | null>(null);
    const [isAutoMapConfirmOpen, setIsAutoMapConfirmOpen] = useState(false);
    const [autoMapResults, setAutoMapResults] = useState<{ guest: string; match: NikkeData }[]>([]);
    const [metaSlotIdx, setMetaSlotIdx] = useState<number | null>(null);
    const [selectedAnomalyBoss, setSelectedAnomalyBoss] = useState<string>('전체');

    const ANOMALY_BOSSES = [
        '전체', 
        '크라켄 (풍압)', 
        '인디빌리아 (전격)', 
        '미러 컨테이너 (수냉)', 
        '울트라 (전격)', 
        '하베스터 (작열)'
    ];

    const openBulkMetaEdit = () => {
        setBulkMetaJson(JSON.stringify(metaTeams, null, 2));
        setIsBulkMetaEditOpen(true);
        setBulkMetaError(null);
    };

    const handleSaveBulkMeta = async () => {
        try {
            const parsed = JSON.parse(bulkMetaJson);
            if (!Array.isArray(parsed)) throw new Error("배열 형태여야 합니다.");
            
            parsed.forEach((t: any, i: number) => {
                if (!t.boss || !Array.isArray(t.members)) {
                    throw new Error(`${i+1}번째 조합의 형식이 올바르지 않습니다. (boss, members 필수)`);
                }
            });

            await updateMetaTeams(parsed);
            setIsBulkMetaEditOpen(false);
            setBulkMetaError(null);
        } catch (e: any) {
            setBulkMetaError(e.message);
        }
    };

    const handleLinkAlias = async (guestName: string, nikke: NikkeData) => {
        const updatedTeams = metaTeams.map(team => ({
            ...team,
            members: team.members.map(m => {
                const mName = typeof m === 'string' ? m : m.name;
                if (normalize(mName) === normalize(guestName)) {
                    return { id: nikke.id, name: nikke.name, isGuest: false };
                }
                return m;
            })
        }));
        await updateMetaTeams(updatedTeams);
        setLinkingGuestName(null);
    };

    const handleAutoMapMeta = () => {
        const matches: { guest: string; match: NikkeData }[] = [];
        const seenGuests = new Set<string>();

        metaTeams.forEach(team => {
            team.members.forEach(m => {
                const info = getNikkeInfo(m);
                const mName = typeof m === 'string' ? m : m.name;
                if (info?.isGuest && !seenGuests.has(mName)) {
                    const match = allNikkes.find(n => {
                        const dbName = normalize(n.name);
                        const dbNameEn = n.name_en ? normalize(n.name_en) : '';
                        const search = normalize(mName);
                        return dbName === search || dbNameEn === search || n.aliases?.some(a => normalize(a) === search);
                    });
                    if (match) {
                        matches.push({ guest: mName, match });
                        seenGuests.add(mName);
                    }
                }
            });
        });

        if (matches.length > 0) {
            setAutoMapResults(matches);
            setIsAutoMapConfirmOpen(true);
        } else {
            alert("자동으로 매칭할 수 있는 게스트 니케가 없습니다. (이름이 DB와 정확히 일치하거나 별명으로 등록되어 있어야 합니다)");
        }
    };

    const applyAutoMap = async () => {
        let updatedTeams = [...metaTeams];
        autoMapResults.forEach(res => {
            updatedTeams = updatedTeams.map(team => ({
                ...team,
                members: team.members.map(m => {
                    const mName = typeof m === 'string' ? m : m.name;
                    if (normalize(mName) === normalize(res.guest)) {
                        return { id: res.match.id, name: res.match.name, isGuest: false };
                    }
                    return m;
                })
            }));
        });
        await updateMetaTeams(updatedTeams);
        setIsAutoMapConfirmOpen(false);
        alert(`${autoMapResults.length}명의 게스트 니케가 DB 이름으로 변환되었습니다.`);
    };

    // Categorize and Filter teams
    const categorizedTeams = useMemo(() => {
        console.log('[DEBUG] TeamAnalysis - categorizing teams...', {
            metaTeamsCount: metaTeams.length,
            allNikkesCount: allNikkes.length,
            searchTerm,
            filters
        });

        const groups: Record<string, MetaTeam[]> = {
            'Stage': [],
            'Anomaly': [],
            'SoloRaid': [],
            'UnionRaid': [],
            'PVP': [],
            'Tower': []
        };

        // 검색/필터가 활성화되어 있는지 확인
        const isSearching = searchTerm.length > 0 || Object.values(filters).some(v => v !== '');

        metaTeams.forEach(t => {
            // 1. 게스트 니케 숨기기 필터
            if (hideMissingTeams) {
                const hasMissing = t.members.some(m => m && getNikkeInfo(m)?.isGuest);
                if (hasMissing) return;
            }

            // 2. 검색 및 상세 필터 적용 (조합 내에 필터 조건에 맞는 니케가 하나라도 있는지 확인)
            if (isSearching) {
                const hasMatchingNikke = t.members.some(m => {
                    const mName = typeof m === 'string' ? m : m.name;
                    const nikke = allNikkes.find(n => n.name === mName || n.name_en === mName || n.aliases?.includes(mName));
                    if (!nikke) return false;

                    // 이름 검색
                    const nameMatch = matchKorean(nikke.name, searchTerm) || matchKorean(nikke.name_en, searchTerm);
                    if (!nameMatch) return false;

                    // 상세 필터
                    if (filters.tier && nikke.tier !== filters.tier) return false;
                    if (filters.company && nikke.company !== filters.company) return false;
                    if (filters.squad && nikke.squad !== filters.squad) return false;
                    if (filters.class && nikke.class !== filters.class) return false;
                    if (filters.code && nikke.code !== filters.code) return false;
                    if (filters.burst && nikke.burst !== filters.burst) return false;
                    if (filters.weapon && nikke.weapon !== filters.weapon) return false;

                    return true;
                });
                if (!hasMatchingNikke) return;
            }

            // 3. 카테고리 분류
            if (t.category && groups[t.category]) {
                groups[t.category].push(t);
                return;
            }

            if (t.type === 'PVP') groups['PVP'].push(t);
            else if (t.type === 'SoloRaid') groups['SoloRaid'].push(t);
            else if (t.boss.includes('크라켄') || t.boss.includes('울트라') || t.boss.includes('미러컨테이너') || t.boss.includes('인디빌리아') || t.boss.includes('하베스트')) {
                groups['Anomaly'].push(t);
            } else if (t.boss.includes('유니온')) {
                groups['UnionRaid'].push(t);
            } else {
                groups['Stage'].push(t);
            }
        });

        return groups;
    }, [metaTeams, allNikkes, hideMissingTeams, searchTerm, filters]);

    const tierOrder: Record<string, number> = { 'SSS': 0, 'SS': 1, 'S': 2, 'PvP': 3, 'A': 4, 'B': 5, 'C': 6, 'D': 7, '?': 99 };
    const getNikkeTier = (name: string) => {
        const found = allNikkes.find(n => normalize(n.name) === normalize(name));
        return found?.tier || '?';
    };

    const handleEditSquadName = async (id: number) => {
        const team = savedTeams.find(t => t.id === id);
        if (!team) return;
        const newName = prompt("새로운 조합 이름을 입력하세요:", team.name);
        if (newName && newName.trim()) {
            const updated = savedTeams.map(t => t.id === id ? { ...t, name: newName.trim() } : t);
            await updateSavedTeams(updated);
        }
    };

    const handleAddMetaTeam = (category?: MetaCategory) => {
        setEditingMetaIdx(-1); // -1 means new team
        setTempMetaTeam({
            boss: '',
            type: category === 'PVP' ? 'PVP' : category === 'SoloRaid' ? 'SoloRaid' : 'PVE',
            category: category || (filterCategory !== 'All' && filterCategory !== 'Tower' ? filterCategory : 'Stage'),
            members: Array(5).fill(''),
            description: ''
        });
    };

    const handleEditMetaTeam = (index: number) => {
        const team = metaTeams[index];
        if (!team) return;
        setEditingMetaIdx(index);
        setTempMetaTeam({
            ...team,
            members: [...(team.members || Array(5).fill(''))]
        });
    };

    const handleDeleteMetaTeam = async (index: number) => {
        if (!confirm("이 추천 조합을 삭제하시겠습니까?")) return;
        const updated = metaTeams.filter((_, i) => i !== index);
        await updateMetaTeams(updated);
    };

    const handleSaveMeta = async () => {
        if (!tempMetaTeam) return;
        if (!tempMetaTeam.boss.trim()) { alert("보스 또는 조합 명칭을 입력하세요."); return; }
        if (tempMetaTeam.members.some(m => !m)) { alert("니케 5명을 모두 선택하세요."); return; }

        let updated: MetaTeam[];
        if (editingMetaIdx !== null && editingMetaIdx !== -1) {
            updated = metaTeams.map((t, i) => i === editingMetaIdx ? tempMetaTeam : t);
        } else {
            updated = [...metaTeams, tempMetaTeam];
        }
        await updateMetaTeams(updated);
        setEditingMetaIdx(null);
        setTempMetaTeam(null);
        setMetaSlotIdx(null);
    };

    const handleCancelMetaEdit = () => {
        setEditingMetaIdx(null);
        setTempMetaTeam(null);
        setMetaSlotIdx(null);
    };

    const handleMetaSlotClick = (slotIdx: number) => {
        setMetaSlotIdx(slotIdx);
        setActiveSlot(-1);
        setOnTowerNikkeSelect(null);
        setSelectorOpen(true);
    };

    const handleMetaNikkeSelect = (nikke: NikkeData) => {
        if (!tempMetaTeam || metaSlotIdx === null) return;
        const newMembers = [...tempMetaTeam.members];
        newMembers[metaSlotIdx] = { id: nikke.id, name: nikke.name, isGuest: false };
        setTempMetaTeam({ ...tempMetaTeam, members: newMembers });
        setMetaSlotIdx(null);
    };

    const categories = [
        { id: 'All', label: '전체', icon: '🌟' },
        { id: 'Stage', label: '스테이지 / 캠페인', icon: '🎯' },
        { id: 'Anomaly', label: '이상 개체 요격전 (특특요)', icon: '👹' },
        { id: 'SoloRaid', label: '솔로 레이드', icon: '🏆' },
        { id: 'UnionRaid', label: '유니온 레이드', icon: '🛡️' },
        { id: 'PVP', label: '아레나 / PVP', icon: '🥊' },
        { id: 'Tower', label: '타워', icon: '🏢' }
    ] as const;

    return (
        <div className="space-y-8 text-white">
            <NikkeSelector
                isOpen={selectorOpen}
                onClose={() => {
                    setSelectorOpen(false);
                    setActiveSlot(-1);
                    setMetaSlotIdx(null);
                    setOnTowerNikkeSelect(null);
                }}
                onSelect={(n) => {
                    if (onTowerNikkeSelect) {
                        onTowerNikkeSelect(n);
                    } else if (activeSlot !== -1) {
                        const newTeam = [...selectedTeam];
                        newTeam[activeSlot] = { id: n.id, name: n.name, isGuest: false };
                        setSelectedTeam(newTeam);
                    } else if (metaSlotIdx !== null) {
                        handleMetaNikkeSelect(n);
                    }
                    setSelectorOpen(false);
                    setOnTowerNikkeSelect(null);
                }}
                allNikkes={allNikkes}
            />



            {/* 검색 결과 표시 (검색어 또는 필터가 있을 때) */}
            {(searchTerm || Object.values(filters).some(v => v !== '')) && (
                <div className="bg-gray-900/40 p-6 rounded-2xl border border-gray-800 animate-fadeIn">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-black text-white flex items-center gap-2">
                            <span>🔍</span> 검색 결과
                            <span className="text-sm font-normal text-gray-500 ml-2">총 {filteredNikkes.length}명</span>
                        </h3>
                        <button 
                            onClick={() => { setSearchTerm(''); setFilters(initialFilters); }}
                            className="text-xs text-gray-500 hover:text-white transition-colors"
                        >
                            필터 초기화
                        </button>
                    </div>
                    
                    {filteredNikkes.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 3xl:grid-cols-10 gap-4">
                            {filteredNikkes.map(nikke => (
                                <CategoryNikkeItem 
                                    key={nikke.id} 
                                    nikke={nikke} 
                                    categoryId="Stage" // 검색 결과에서는 기본 티어 표시
                                    onSelect={onSelectNikke}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="py-20 text-center text-gray-500">
                            <div className="text-4xl mb-4">🏜️</div>
                            검색 결과가 없습니다.
                        </div>
                    )}
                </div>
            )}

            {/* Header / Sim Settings */}
            <div className="bg-gray-800/60 p-4 rounded-xl border border-gray-700">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <span>⚔️</span> 팀 빌더 & 시뮬레이터
                    </h2>
                    <div className="flex gap-2">
                        <select
                            value={simSettings.level}
                            onChange={(e) => setSimSettings({ ...simSettings, level: Number(e.target.value) })}
                            className="bg-gray-900 border border-gray-600 rounded px-2 py-1 text-xs"
                        >
                            <option value={200}>Lv.200</option>
                            <option value={360}>Lv.360</option>
                            <option value={400}>Lv.400</option>
                        </select>
                        <select
                            value={simSettings.core}
                            onChange={(e) => setSimSettings({ ...simSettings, core: Number(e.target.value) })}
                            className="bg-gray-900 border border-gray-600 rounded px-2 py-1 text-xs"
                        >
                            <option value={0}>명함</option>
                            <option value={3}>3돌</option>
                            <option value={7}>코강+7</option>
                        </select>
                    </div>
                </div>

                {/* Visual Builder */}
                <div className="flex gap-2 md:gap-4 justify-between bg-black/40 p-4 rounded-lg relative">
                    {selectedTeam.map((member, idx) => {
                        const info = member ? getNikkeInfo(member.name) : null;
                        return (
                            <div
                                key={idx}
                                className="flex-1 aspect-[3/4.5] bg-nikke-card border border-gray-800 hover:border-nikke-red rounded-xl cursor-pointer flex flex-col items-center justify-center relative group transition-all duration-300 overflow-hidden shadow-lg hover:shadow-nikke-red/20"
                                onClick={() => { 
                                    setActiveSlot(idx); 
                                    setMetaSlotIdx(null);
                                    setOnTowerNikkeSelect(null);
                                    setSelectorOpen(true); 
                                }}
                            >
                                {member ? (
                                    <>
                                        <div className="absolute inset-0">
                                            {info?.thumbnail ? (
                                                <img src={info.thumbnail} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                            ) : (
                                                <div className="w-full h-full bg-gray-900" />
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                                        </div>
                                        {info?.burst && (
                                            <div className={`absolute top-1 left-1 px-1.5 py-0.5 rounded text-[9px] font-black z-10 shadow-lg border border-white/10
                                                ${info.burst === 'I' ? 'bg-pink-600' : info.burst === 'II' ? 'bg-blue-600' : info.burst === 'III' ? 'bg-red-600' : 'bg-red-500'}`}>
                                                B{info.burst === 'I' ? '1' : info.burst === 'II' ? '2' : info.burst === 'III' ? '3' : info.burst}
                                            </div>
                                        )}
                                        <div className="absolute bottom-0 left-0 right-0 p-2 z-10 flex flex-col items-center">
                                            <div className="flex flex-col items-center w-full">
                                                <div className="flex items-baseline gap-1 justify-center w-full">
                                                    <span className="text-[12px] font-black text-white truncate drop-shadow-md">
                                                        {info?.name}
                                                    </span>
                                                    {info?.name_en && (
                                                        <span className="text-[9px] text-blue-400 font-bold truncate drop-shadow-md">
                                                            {info.name_en}
                                                        </span>
                                                    )}
                                                </div>
                                                {info?.extra_info && (
                                                    <span className="text-[10px] text-orange-400 font-bold truncate drop-shadow-md mt-0.5 leading-tight">
                                                        {info.extra_info}
                                                    </span>
                                                )}
                                                <div className="space-y-0.5 mt-1 w-full border-t border-gray-700/50 pt-1">
                                                    <div className="flex flex-wrap gap-x-1 justify-center text-[8px] font-bold">
                                                        <span className={companyColors[info?.company || ''] || 'text-gray-500'}>{info?.company}</span>
                                                        <span className="text-gray-600">|</span>
                                                        <span className="text-cyan-400 truncate max-w-[50px]">{info?.squad}</span>
                                                    </div>
                                                    <div className="flex flex-wrap gap-x-0.5 text-[8px] font-black items-center justify-center w-full">
                                                        <span className={burstColors[info?.burst || ''] || 'text-gray-400'}>{info?.burst}버</span>
                                                        <span className="text-gray-500">·</span>
                                                        <span className={codeTextColors[info?.code || ''] || 'text-gray-400'}>{info?.code}</span>
                                                        <span className="text-gray-500">·</span>
                                                        <span className={classColors[info?.class || ''] || 'text-gray-400'}>{classNames[info?.class || ''] || info?.class}</span>
                                                        <span className="text-gray-500">·</span>
                                                        <span className={weaponColors[info?.weapon || ''] || 'text-amber-400'}>{info?.weapon}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            {member.isGuest && <div className="text-[8px] font-bold text-purple-400 mt-0.5">META</div>}
                                        </div>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); const n = [...selectedTeam]; n[idx] = null; setSelectedTeam(n); }}
                                            className="absolute top-1 right-1 w-5 h-5 bg-black/60 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-20 text-[10px]"
                                        >
                                            ✕
                                        </button>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center gap-2">
                                        <span className="text-gray-600 text-2xl group-hover:text-nikke-red transition-colors">+</span>
                                        <span className="text-[9px] font-bold text-gray-500 group-hover:text-nikke-red/70 transition-colors uppercase">Slot {idx + 1}</span>
                                    </div>
                                )}
                                <div className="absolute inset-0 border-2 border-transparent group-hover:border-nikke-red/30 rounded-xl transition-colors pointer-events-none" />
                            </div>
                        );
                    })}
                </div>

                {/* Controls & Result */}
                <div className="flex justify-between items-center mt-4">
                    <div className="flex gap-2">
                        <button onClick={() => setSelectedTeam(Array(5).fill(null))} className="text-sm bg-red-900/30 hover:bg-red-900/60 text-red-200 px-3 py-1.5 rounded border border-red-900/50">초기화</button>
                        <button onClick={handleSaveSquad} className="text-sm bg-blue-600 hover:bg-blue-500 px-3 py-1.5 rounded text-white flex gap-1 items-center">
                            <span>💾</span> 저장
                        </button>
                        <button onClick={() => setShowBurstEditor(true)} className="text-sm bg-amber-600 hover:bg-amber-500 px-3 py-1.5 rounded text-white flex gap-1 items-center">
                            <span>⚡</span> 버스트 DB 편집
                        </button>
                    </div>
                    <div className="text-right">
                        <div className="text-base text-gray-400">예상 전투력</div>
                        <div className="text-xl font-bold text-yellow-500 font-mono">
                            {synergyAnalysis ? synergyAnalysis.totalCP.toLocaleString() : 0}
                        </div>
                    </div>
                </div>
                {/* Synergy Messages */}
                {synergyAnalysis && synergyAnalysis.messages.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2 justify-end">
                        {synergyAnalysis.messages.map((m, i) => (
                            <span key={i} className="text-sm md:text-base font-bold bg-gray-900 px-3 py-1.5 rounded-xl text-green-400 border border-green-900/50 shadow-inner">{m}</span>
                        ))}
                    </div>
                )}

                {/* Burst Calculator View (Graphical Reference Match) */}
                <div className="mt-8 pt-6 border-t border-gray-700/50">
                    <h3 className="text-sm font-bold text-gray-400 mb-6 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="text-orange-500">⚡</span> 버스트 수급량 정밀 시뮬레이션
                            <div className={`ml-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                getBurstGrade(burstAnalysis["2RL"].value) === 'S' ? 'bg-red-500/20 text-red-400' :
                                getBurstGrade(burstAnalysis["2RL"].value) === 'A' ? 'bg-orange-500/20 text-orange-400' :
                                getBurstGrade(burstAnalysis["2RL"].value) === 'B' ? 'bg-yellow-500/20 text-yellow-400' :
                                getBurstGrade(burstAnalysis["2RL"].value) === 'C' ? 'bg-blue-500/20 text-blue-400' :
                                'bg-gray-500/20 text-gray-400'
                            }`}>
                                등급: {getBurstGrade(burstAnalysis["2RL"].value)}
                            </div>
                        </div>
                        <span className="text-[11px] text-gray-500 font-normal">* 이미지 데이터 기반</span>
                    </h3>

                    <div className="flex bg-black/60 rounded-xl overflow-hidden border border-gray-800 shadow-2xl">
                        {(["2RL", "2_5RL", "3RL", "3_5RL", "4RL"] as RLStage[]).map((stage, idx) => {
                            const data = burstAnalysis[stage];
                            const isReady = data.value >= 100;

                            // Style Mapping based on Image
                            const colors = {
                                '2RL': { border: 'border-green-500/50', text: 'text-green-400', bg: 'bg-green-500/5' },
                                '2_5RL': { border: 'border-green-600/50', text: 'text-green-500', bg: 'bg-green-600/5' },
                                '3RL': { border: 'border-white/30', text: 'text-white', bg: 'bg-white/5' },
                                '3_5RL': { border: 'border-orange-500/50', text: 'text-orange-400', bg: 'bg-orange-500/5' },
                                '4RL': { border: 'border-orange-600/50', text: 'text-orange-500', bg: 'bg-red-500/5' }
                            }[stage];

                            return (
                                <div key={stage} className={`flex-1 flex flex-col items-center py-4 relative
                                    ${idx !== 4 ? 'border-r border-gray-800' : ''} 
                                    ${isReady && stage.includes('2') ? 'ring-1 ring-inset ring-green-500/20' : ''}`}>

                                    {/* Header Row */}
                                    <div className={`text-base font-black mb-1 ${colors.text}`}>
                                        {stage.replace('_', '.')}
                                    </div>
                                    <div className="w-12 h-[1px] bg-gray-700 mb-2" />

                                    {/* Main Value Row */}
                                    <div className={`text-xl font-mono font-bold tracking-tighter mb-1 ${isReady ? colors.text : 'text-gray-500'}`}>
                                        {data.value.toFixed(1)}%
                                    </div>
                                    <div className="w-16 h-[1px] bg-gray-800 mb-2" />

                                    {/* Hits Range Row */}
                                    <div className="text-xs font-bold text-gray-400 mb-1 leading-none">
                                        {data.hitsMin}-{data.hitsMax}
                                    </div>

                                    {/* Bonus Range Row */}
                                    <div className={`text-[11px] font-medium leading-none ${isReady ? colors.text : 'text-gray-600'}`}>
                                        {data.bonusMin.toFixed(2)}%-{data.bonusMax.toFixed(2)}%
                                    </div>

                                    {/* Active Highlight (Bottom Border for Ready) */}
                                    {isReady && (
                                        <div className={`absolute bottom-0 left-0 right-0 h-1 ${colors.text.replace('text-', 'bg-')}`} />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* My Squads */}
            {savedTeams.length > 0 && (
                <div>
                    <h3 className="text-xl font-black text-gray-400 mb-3 flex items-center gap-2">
                        💾 나만의 조합
                        <span className="bg-red-900 text-red-200 text-sm px-2 py-0.5 rounded-full font-bold">NEW</span>
                    </h3>
                    <div className="flex gap-3 overflow-x-auto pb-4 custom-scrollbar">
                        {savedTeams.map(st => (
                            <div key={st.id} className="flex-shrink-0 bg-gray-800/60 p-2.5 rounded-lg border border-gray-700 w-44 relative group shadow-md">
                                <div className="text-[15px] font-black mb-0.5 truncate text-white">{st.name}</div>
                                <div className="text-[10px] text-gray-500 mb-2 font-bold">{st.date}</div>
                                <div className="flex gap-1 mb-2.5">
                                    {st.members.slice(0, 5).map((m, i) => (
                                        <div key={i} className={`w-3.5 h-3.5 rounded-full shadow-inner ${m ? 'bg-blue-600 border border-blue-400/30' : 'bg-gray-700 border border-gray-600'}`} />
                                    ))}
                                </div>
                                <button onClick={() => loadTeam(st.members.map(m => m?.name || ''))} className="w-full text-[12px] font-bold bg-gray-700 hover:bg-gray-600 py-1.5 rounded-md">불러오기</button>
                                <div className="absolute top-2 right-2 flex gap-1.5">
                                    <button onClick={() => handleEditSquadName(st.id)} className="text-gray-500 hover:text-blue-400 opacity-0 group-hover:opacity-100">✏️</button>
                                    <button onClick={() => handleDeleteSquad(st.id)} className="text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100">✕</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Merged Recommendation / Meta List */}
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-4">
                    <div className="flex items-center gap-3">
                        <h3 className="text-3xl font-bold text-blue-400">
                            🏆 2025 메타 & 추천 조합
                        </h3>
                        <div className="flex gap-2">
                            {metaTeams.some(t => t.members.some(m => getNikkeInfo(m)?.isGuest)) && (
                                <button 
                                    onClick={handleAutoMapMeta}
                                    className="text-xl bg-red-600 text-white px-6 py-3 rounded-2xl hover:bg-red-500 shadow-lg shadow-red-900/20 flex items-center gap-2 font-black border-2 border-white/20"
                                    title="미등록 니케를 DB 이름으로 일괄 변환"
                                >
                                    <span>🚀</span> 게스트 니케 DB 일괄 전환
                                </button>
                            )}
                        </div>
                    </div>
                    {/* Category Tabs */}
                    <div className="flex gap-1 overflow-x-auto pb-1 no-scrollbar items-center">
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setFilterCategory(cat.id)}
                                className={`px-5 py-2.5 rounded-xl text-base font-black whitespace-nowrap flex items-center gap-2
                                    ${filterCategory === cat.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
                            >
                                <span>{cat.icon}</span>
                                {cat.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 분야별 메타 조합 및 티어리스트 표시 */}
                {filterCategory === 'Tower' ? (
                    <TowerTierList 
                        allNikkes={allNikkes} 
                        onSelectNikke={onSelectNikke} 
                        towerSquads={towerSquads}
                        onSaveSquads={handleSaveTowerSquads}
                        openNikkeSelector={openTowerNikkeSelector}
                    />
                ) : (
                    <div className="space-y-8">
                        {/* 1. 공략 조합 섹션 */}
                        {categories
                            .filter(cat => cat.id !== 'All' && cat.id !== 'Tower')
                            .filter(cat => filterCategory === 'All' || filterCategory === cat.id)
                            .map(cat => {
                                const category = cat.id;
                                let teams = categorizedTeams[category] || [];

                                // Apply Anomaly Boss Filter
                                if (category === 'Anomaly' && selectedAnomalyBoss !== '전체') {
                                    teams = teams.filter(t => t.boss.includes(selectedAnomalyBoss));
                                }

                                // Internal grouping for Anomaly by Boss
                                const subGroups: Record<string, MetaTeam[]> = {};
                                if (category === 'Anomaly') {
                                    teams.forEach(t => {
                                        const bossName = t.boss.split(' (')[0].replace(/ \d위.*/, '');
                                        if (!subGroups[bossName]) subGroups[bossName] = [];
                                        subGroups[bossName].push(t);
                                    });
                                } else if (teams.length > 0) {
                                    subGroups[category] = teams;
                                }

                                return (
                                    <div key={category} className="space-y-6">
                                        <div className="flex justify-between items-center border-b border-gray-800 pb-3">
                                            <h4 className="text-3xl font-black text-gray-200 flex items-center gap-3">
                                                {cat.icon} {cat.label}
                                                <span className="text-2xl bg-gray-800 px-5 py-1.5 rounded-full text-gray-400 font-black border border-gray-700">
                                                    {teams.length}개 조합
                                                </span>
                                            </h4>
                                        </div>

                                        {/* 1. 공략 조합 섹션 (최상단) */}
                                        <div className="space-y-6">
                                            {Object.entries(subGroups).map(([groupName, groupTeams]) => {
                                                // Sort teams by member tiers
                                                const sortedTeams = [...groupTeams].sort((a, b) => {
                                                    const aTiers = a.members.map(m => tierOrder[getNikkeTier(typeof m === 'string' ? m : m.name)] || 99);
                                                    const bTiers = b.members.map(m => tierOrder[getNikkeTier(typeof m === 'string' ? m : m.name)] || 99);
                                                    const aMin = Math.min(...aTiers);
                                                    const bMin = Math.min(...bTiers);
                                                    if (aMin !== bMin) return aMin - bMin;
                                                    const aAvg = aTiers.reduce((sum, t) => sum + t, 0) / aTiers.length;
                                                    const bAvg = bTiers.reduce((sum, t) => sum + t, 0) / bTiers.length;
                                                    return aAvg - bAvg;
                                                });

                                                return (
                                                    <div key={groupName} className="space-y-3">
                                                        {category === 'Anomaly' && (
                                                            <h5 className="text-base font-black text-gray-500 ml-1 flex items-center gap-2">
                                                                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                                                {groupName} 공략 조합
                                                            </h5>
                                                        )}
                                                        <div className="grid grid-cols-1 2xl:grid-cols-2 gap-4">
                                                            {sortedTeams.map((team, idx) => {
                                                                const originalIdx = metaTeams.findIndex(t => 
                                                                    t.boss === team.boss && 
                                                                    JSON.stringify(t.members) === JSON.stringify(team.members)
                                                                );

                                                                if (editingMetaIdx === originalIdx && tempMetaTeam) {
                                                                    return (
                                                                        <div key={idx} className="bg-gray-900 border-2 border-blue-500 rounded-2xl p-6 shadow-xl animate-fadeIn">
                                                                            <div className="flex justify-between items-center mb-4">
                                                                                <span className="text-sm font-bold text-blue-400">✏️ 조합 수정</span>
                                                                                <button onClick={handleCancelMetaEdit} className="text-gray-500 hover:text-white">✕</button>
                                                                            </div>
                                                                            <div className="space-y-4">
                                                                                <input 
                                                                                    type="text"
                                                                                    autoFocus
                                                                                    value={tempMetaTeam.boss}
                                                                                    onChange={e => setTempMetaTeam({...tempMetaTeam, boss: e.target.value})}
                                                                                    placeholder="보스 또는 조합 명칭"
                                                                                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none"
                                                                                />
                                                                                <div className="grid grid-cols-5 gap-3">
                                                                                    {tempMetaTeam.members.map((m, mi) => {
                                                                                        const mName = typeof m === 'string' ? m : m.name;
                                                                                        const info = getNikkeInfo(mName);
                                                                                        return (
                                                                                            <div 
                                                                                                key={mi}
                                                                                                onClick={() => handleMetaSlotClick(mi)}
                                                                                                className="group relative aspect-[3/4.5] bg-nikke-card border border-gray-800 hover:border-nikke-red rounded-xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-nikke-red/20 cursor-pointer"
                                                                                            >
                                                                                                {mName ? (
                                                                                                    <>
                                                                                                        <div className="absolute inset-0">
                                                                                                            <img src={info?.thumbnail} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                                                                                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                                                                                                        </div>
                                                                                                        <div className={`absolute top-1 left-1 px-1.5 py-0.5 rounded text-[9px] font-black z-10 shadow-lg border border-white/10
                                                                                                            ${info?.burst === 'I' ? 'bg-pink-600' : info?.burst === 'II' ? 'bg-blue-600' : info?.burst === 'III' ? 'bg-red-600' : 'bg-red-500'}`}>
                                                                                                            B{info?.burst === 'I' ? '1' : info?.burst === 'II' ? '2' : info?.burst === 'III' ? '3' : info?.burst || '?'}
                                                                                                        </div>
                                                                                                        <div className="absolute bottom-0 left-0 right-0 p-1 z-10 flex flex-col items-center">
                                                                                                            <div className="flex flex-col items-center w-full">
                                                                                                                <div className="flex items-baseline gap-1 justify-center w-full">
                                                                                                                    <span className="text-[11px] font-black text-white truncate drop-shadow-md">
                                                                                                                        {info?.name}
                                                                                                                    </span>
                                                                                                                    {info?.name_en && (
                                                                                                                        <span className="text-[8px] text-blue-400 font-bold truncate drop-shadow-md">
                                                                                                                            {info.name_en}
                                                                                                                        </span>
                                                                                                                    )}
                                                                                                                </div>
                                                                                                                {info?.extra_info && (
                                                                                      <span className="text-[9px] text-orange-400 font-bold truncate drop-shadow-md mt-0.5 leading-tight">
                                                                                          {info.extra_info}
                                                                                      </span>
                                                                                  )}
                                                                                  <div className="space-y-0.5 mt-1 w-full border-t border-gray-700/50 pt-1">
                                                                                      <div className="flex flex-wrap gap-x-1 justify-center text-[7px] font-bold">
                                                                                          <span className={companyColors[info?.company || ''] || 'text-gray-500'}>{info?.company}</span>
                                                                                          <span className="text-gray-600">|</span>
                                                                                          <span className="text-cyan-400 truncate max-w-[40px]">{info?.squad}</span>
                                                                                      </div>
                                                                                      <div className="flex flex-wrap gap-x-0.5 text-[7px] font-black items-center justify-center w-full">
                                                                                          <span className={burstColors[info?.burst || ''] || 'text-gray-400'}>{info?.burst}버</span>
                                                                                          <span className="text-gray-500">·</span>
                                                                                          <span className={codeTextColors[info?.code || ''] || 'text-gray-400'}>{info?.code}</span>
                                                                                          <span className="text-gray-500">·</span>
                                                                                          <span className={classColors[info?.class || ''] || 'text-gray-400'}>{classNames[info?.class || ''] || info?.class}</span>
                                                                  <span className="text-gray-500">·</span>
                                                                  <span className={weaponColors[info?.weapon || ''] || 'text-amber-400'}>{info?.weapon}</span>
                                                              </div>
                                                                                  </div>
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    </>
                                                                                                ) : (
                                                                                                    <div className="flex flex-col items-center gap-2">
                                                                                                        <span className="text-gray-600 text-2xl group-hover:text-nikke-red transition-colors">+</span>
                                                                                                        <span className="text-[9px] font-bold text-gray-500 group-hover:text-nikke-red/70 transition-colors">SELECT</span>
                                                                                                    </div>
                                                                                                )}
                                                                                                <div className="absolute inset-0 border-2 border-transparent group-hover:border-nikke-red/30 rounded-xl transition-colors pointer-events-none" />
                                                                                            </div>
                                                                                        );
                                                                                    })}
                                                                                </div>
                                                                                <textarea 
                                                                                    value={tempMetaTeam.description}
                                                                                    onChange={e => setTempMetaTeam({...tempMetaTeam, description: e.target.value})}
                                                                                    placeholder="설명 (선택 사항)"
                                                                                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white h-24 resize-none focus:border-blue-500 outline-none"
                                                                                />
                                                                                <div className="flex gap-3">
                                                                                    <button onClick={handleCancelMetaEdit} className="flex-1 py-3 bg-gray-800 text-gray-400 rounded-xl font-bold hover:bg-gray-700 transition-all">취소</button>
                                                                                    <button onClick={handleSaveMeta} className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-500 transition-all">저장</button>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                }

                                                                return (
                                                                    <div key={idx} className="bg-gray-900/40 border border-gray-800 hover:border-blue-500/50 hover:bg-gray-800/60 cursor-pointer group relative flex flex-col gap-4 p-5 rounded-2xl shadow-lg transition-all duration-300"
                                                                        onClick={() => loadTeam(team.members.map(m => typeof m === 'string' ? m : m.name))}>
                                                                        
                                                                        <div className="flex justify-between items-center">
                                                                            <div className="flex items-center gap-4">
                                                                                <div className={`flex items-center justify-center w-8 h-8 rounded-xl shadow-lg shrink-0 ${
                                                                                    idx === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' : 
                                                                                    idx === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500' : 
                                                                                    'bg-gradient-to-br from-orange-500 to-orange-800'
                                                                                }`}>
                                                                                    <span className="text-sm font-black text-white italic">{idx + 1}</span>
                                                                                </div>
                                                                                <div className="flex flex-col">
                                                                                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-0.5">Recommended {idx + 1}</span>
                                                                                    <span className="text-xl font-black text-white leading-tight break-keep">
                                                                                        {(() => {
                                                                                            // 보스 이름에서 순위 정보와 연도 정보를 확실하게 제거
                                                                                            const cleanBoss = (team.boss || '')
                                                                                                .replace(/\d+위/g, '')
                                                                                                .replace(/2025/g, '')
                                                                                                .replace(/스테이지/g, '')
                                                                                                .replace(/캠페인/g, '')
                                                                                                .replace(/범용/g, '')
                                                                                                .replace(/\d+$/g, '') // 끝에 남은 숫자 제거
                                                                                                .trim();
                                                                                            return cleanBoss || '추천 조합';
                                                                                        })()}
                                                                                    </span>
                                                                                </div>
                                                                            </div>

                                                                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                                                                <button 
                                                                                    onClick={(e) => { e.stopPropagation(); handleEditMetaTeam(originalIdx); }}
                                                                                    className="p-1.5 bg-gray-700 hover:bg-blue-600 text-white rounded text-[10px]"
                                                                                >
                                                                                    ✏️
                                                                                </button>
                                                                                <button 
                                                                                    onClick={(e) => { e.stopPropagation(); handleDeleteMetaTeam(originalIdx); }}
                                                                                    className="p-1.5 bg-gray-700 hover:bg-red-600 text-white rounded text-[10px]"
                                                                                >
                                                                                    🗑️
                                                                                </button>
                                                                            </div>
                                                                        </div>

                                                                        <div className="grid grid-cols-5 gap-3 w-full">
                                                                            {team.members.map((m, mi) => {
                                                                                const mName = typeof m === 'string' ? m : m.name;
                                                                                const info = getNikkeInfo(mName);
                                                                                const nikkeTier = info ? getNikkeTier(mName) : 'B';

                                                                                return (
                                                                                    <div key={mi} className="group/nikke relative">
                                                                                        <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-2 hover:border-nikke-red group transition-all duration-300 h-full shadow-sm">
                                                                                            <div className="flex justify-between items-start">
                                                                                                <div className="flex flex-col min-w-0 flex-1">
                                                                                                    <div className="flex items-baseline gap-1.5 flex-wrap">
                                                                                                        <h3 className="font-black text-white group-hover/nikke:text-nikke-red text-[10px] truncate">
                                                                                                            {info?.name}
                                                                                                        </h3>
                                                                                                        {info?.name_en && (
                                                                                                            <span className="text-[8px] text-blue-400 font-bold truncate">
                                                                                                                {info.name_en}
                                                                                                            </span>
                                                                                                        )}
                                                                                                    </div>
                                                                                                    {info?.extra_info && (
                                                                                                        <span className="text-[9px] text-orange-400 font-bold truncate leading-tight mt-0.5">
                                                                                                            {info.extra_info}
                                                                                                        </span>
                                                                                                    )}
                                                                                                    {/* 제조사 & 스쿼드 추가 */}
                                                                                                    <div className="flex flex-wrap gap-x-1 text-[7px] font-bold mt-1.5 opacity-80">
                                                                                                        <span className={companyColors[info?.company || ''] || 'text-gray-500'}>{info?.company}</span>
                                                                                                        <span className="text-gray-600">|</span>
                                                                                                        <span className="text-cyan-400 truncate max-w-[40px]">{info?.squad}</span>
                                                                                                    </div>
                                                                                                </div>
                                                                                                <span className={`text-[9px] font-black ml-1 shrink-0 ${
                                                                                                    nikkeTier === 'SSS' ? 'text-red-500' :
                                                                                                    nikkeTier === 'SS' ? 'text-orange-400' :
                                                                                                    nikkeTier === 'S' ? 'text-yellow-400' :
                                                                                                    nikkeTier === 'A' ? 'text-blue-400' :
                                                                                                    'text-gray-400'
                                                                                                }`}>{nikkeTier}</span>
                                                                                            </div>
                                                                                            <div className="flex flex-wrap gap-x-1 text-[8px] font-black items-center mt-1.5 pt-1.5 border-t border-gray-700/50">
                                                                                                <span className={burstColors[info?.burst || ''] || 'text-gray-400'}>{info?.burst}버</span>
                                                                                                <span className="text-gray-500">·</span>
                                                                                                <span className={codeTextColors[info?.code || ''] || 'text-gray-400'}>{info?.code}</span>
                                                                                                <span className="text-gray-500">·</span>
                                                                                                <span className={classColors[info?.class || ''] || 'text-gray-400'}>{classNames[info?.class || ''] || info?.class}</span>
                                                                 <span className="text-gray-500">·</span>
                                                                 <span className={weaponColors[info?.weapon || ''] || 'text-amber-400'}>{info?.weapon}</span>
                                                             </div>
                                                                                        </div>
                                                                                    </div>
                                                                                );
                                                                            })}
                                                                        </div>
                                                                    </div>
                                                                );
                                                             })}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {/* 2. 보스 선택 및 조합 추가 (통합 섹션) */}
                                        <div className="flex flex-col gap-4 bg-gray-900/20 rounded-2xl p-4 border border-gray-800/50">
                                            {category === 'Anomaly' && (
                                                <div className="flex flex-wrap justify-center gap-2">
                                                    {ANOMALY_BOSSES.map(boss => (
                                                        <button
                                                            key={boss}
                                                            onClick={() => setSelectedAnomalyBoss(boss)}
                                                            className={`px-4 py-2 rounded-lg text-xs font-black transition-all border ${
                                                                selectedAnomalyBoss === boss
                                                                    ? 'bg-red-600 text-white border-red-500 shadow-lg shadow-red-900/20'
                                                                    : 'bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-700 hover:text-gray-200'
                                                            }`}
                                                        >
                                                            {boss}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}

                                            <div className="flex justify-center">
                                                {editingMetaIdx === null && (
                                                    <button 
                                                        onClick={() => handleAddMetaTeam(category as MetaCategory)}
                                                        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-black transition-all flex items-center gap-2 shadow-lg shadow-blue-900/20"
                                                    >
                                                        <span>➕</span> {cat.label} 조합 추가
                                                    </button>
                                                )}
                                                {editingMetaIdx !== null && (
                                                    <div className="text-blue-400 text-sm font-bold flex items-center gap-2">
                                                        <span className="animate-spin text-base">🔄</span> 조합 편집 중...
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                            {/* Inline Add Layer */}
                                            {editingMetaIdx === -1 && tempMetaTeam && (tempMetaTeam.category === category) && (
                                                <div className="bg-blue-900/10 border-2 border-dashed border-blue-500/50 rounded-2xl p-6 animate-fadeIn flex flex-col gap-4">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-lg font-bold text-blue-400 flex items-center gap-2">
                                                            <span>➕</span> 새로운 {cat.label} 조합 추가
                                                        </span>
                                                        <button onClick={handleCancelMetaEdit} className="text-gray-500 hover:text-white">✕</button>
                                                    </div>
                                                    <div className="space-y-4">
                                                        <input 
                                                            type="text"
                                                            autoFocus
                                                            value={tempMetaTeam.boss}
                                                            onChange={e => setTempMetaTeam({...tempMetaTeam, boss: e.target.value})}
                                                            placeholder="보스 이름 또는 조합 명칭 (예: 크라켄 풍압 1위)"
                                                            className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none shadow-inner"
                                                        />
                                                        <div className="grid grid-cols-5 gap-3">
                                                            {tempMetaTeam.members.map((m, mi) => {
                                                                const mName = typeof m === 'string' ? m : m.name;
                                                                const info = getNikkeInfo(mName);
                                                                return (
                                                                    <div 
                                                                        key={mi}
                                                                        onClick={() => handleMetaSlotClick(mi)}
                                                                        className="aspect-[3/4.5] rounded-xl border-2 border-dashed border-gray-700 bg-gray-800 flex items-center justify-center cursor-pointer hover:border-blue-500 overflow-hidden relative group/slot"
                                                                    >
                                                                        {mName ? (
                                                                            <>
                                                                                <img src={info?.thumbnail} className="w-full h-full object-cover opacity-80" />
                                                                                <div className={`absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-[10px] font-black z-10 shadow-md
                                                                                    ${info?.burst === 'I' ? 'bg-pink-600' : info?.burst === 'II' ? 'bg-blue-600' : 'bg-red-600'}`}>
                                                                                    B{info?.burst === 'I' ? '1' : info?.burst === 'II' ? '2' : info?.burst === 'III' ? '3' : info?.burst || '?'}
                                                                                </div>
                                                                                {/* 이름 표시 오버레이 추가 */}
                                                                                <div className="absolute bottom-0 left-0 right-0 bg-black/80 py-1 px-1">
                                                    <div className="flex flex-col items-center">
                                                        <div className="flex items-baseline gap-1 justify-center w-full">
                                                            <span className="text-[11px] font-black text-white truncate">
                                                                {info?.name}
                                                            </span>
                                                            {info?.name_en && (
                                                                <span className="text-[8px] text-blue-400 font-bold truncate">
                                                                    {info.name_en}
                                                                </span>
                                                            )}
                                                        </div>
                                                        {info?.extra_info && (
                                                            <span className="text-[9px] text-orange-400 font-bold truncate leading-tight mt-0.5">
                                                                {info.extra_info}
                                                            </span>
                                                        )}
                                                        <div className="space-y-0.5 mt-1 w-full border-t border-gray-700/50 pt-1">
                                                            <div className="flex flex-wrap gap-x-0.5 justify-center text-[6px] font-bold">
                                                                <span className={companyColors[info?.company || ''] || 'text-gray-500'}>{info?.company}</span>
                                                                <span className="text-gray-600">|</span>
                                                                <span className="text-cyan-400 truncate max-w-[30px]">{info?.squad}</span>
                                                            </div>
                                                            <div className="flex flex-wrap gap-x-0.5 text-[6px] font-black items-center justify-center w-full">
                                                                <span className={burstColors[info?.burst || ''] || 'text-gray-400'}>{info?.burst}버</span>
                                                                <span className="text-gray-500">·</span>
                                                                <span className={codeTextColors[info?.code || ''] || 'text-gray-400'}>{info?.code}</span>
                                                                <span className="text-gray-500">·</span>
                                                                <span className={classColors[info?.class || ''] || 'text-gray-400'}>{classNames[info?.class || ''] || info?.class}</span>
                                                                 <span className="text-gray-500">·</span>
                                                                 <span className={weaponColors[info?.weapon || ''] || 'text-amber-400'}>{info?.weapon}</span>
                                                             </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                                            </>
                                                                        ) : (
                                                                            <span className="text-gray-600 text-2xl">+</span>
                                                                        )}
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                        <textarea 
                                                            value={tempMetaTeam.description}
                                                            onChange={e => setTempMetaTeam({...tempMetaTeam, description: e.target.value})}
                                                            placeholder="조합에 대한 간단한 설명을 입력하세요..."
                                                            className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white h-24 resize-none focus:border-blue-500 outline-none shadow-inner"
                                                        />
                                                        <div className="flex gap-3">
                                                            <button onClick={handleCancelMetaEdit} className="flex-1 py-3 bg-gray-800 text-gray-400 rounded-xl font-bold hover:bg-gray-700 transition-all">취소</button>
                                                            <button onClick={handleSaveMeta} className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-500 shadow-lg shadow-blue-900/20 transition-all">조합 저장하기</button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        

                                        {/* 4. 티어리스트 섹션 (최하단) */}
                                        <div className="bg-gray-900/40 rounded-3xl p-8 border border-gray-800 shadow-inner">
                                            <div className="flex justify-between items-center mb-8">
                                                <div className="flex items-center gap-3">
                                                    <h5 className="text-2xl font-black text-white flex items-center gap-3">
                                                        <span>🏆</span> {cat.label} 티어리스트
                                                    </h5>
                                                    <span className="text-xs bg-blue-900/30 px-3 py-1 rounded-full text-blue-400 font-bold border border-blue-800/50">성능 종합</span>
                                                </div>
                                            </div>
                                            
                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                                                {allNikkes
                                                    ?.filter(n => getNikkeStarsForCategory(n, cat.id) > 0)
                                                    .sort((a, b) => {
                                                        const starsA = getNikkeStarsForCategory(a, cat.id);
                                                        const starsB = getNikkeStarsForCategory(b, cat.id);
                                                        if (starsB !== starsA) return starsB - starsA;
                                                        return a.name.localeCompare(b.name, 'ko');
                                                    })
                                                    .map(n => (
                                                        <CategoryNikkeItem 
                                                            key={n.id} 
                                                            nikke={n} 
                                                            categoryId={cat.id} 
                                                            onSelect={onSelectNikke}
                                                        />
                                                    ))
                                                }
                                                {allNikkes?.filter(n => getNikkeStarsForCategory(n, cat.id) > 0).length === 0 && (
                                                    <div className="col-span-full py-12 text-center text-gray-500 bg-black/20 rounded-2xl border border-dashed border-gray-800">
                                                        데이터가 없습니다.
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                    </div>
                )}
            </div>

            {/* Manual Link Modal */}
            <NikkeSelector
                isOpen={!!linkingGuestName}
                onClose={() => setLinkingGuestName(null)}
                onSelect={(n) => {
                    if (linkingGuestName) {
                        handleLinkAlias(linkingGuestName, n);
                    }
                }}
                allNikkes={allNikkes}
            />

            {/* Auto Map Confirm Modal */}
            {isAutoMapConfirmOpen && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
                    <div className="bg-gray-900 border border-blue-600/50 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden">
                        <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-blue-900/10">
                            <div>
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    <span className="text-blue-500">🚀</span> 자동 변환 확인
                                </h3>
                                <p className="text-sm text-gray-400 mt-1">DB에서 일치하는 니케 {autoMapResults.length}명을 찾았습니다.</p>
                            </div>
                            <button onClick={() => setIsAutoMapConfirmOpen(false)} className="text-gray-400 hover:text-white text-xl">✕</button>
                        </div>
                        <div className="p-6 max-h-[50vh] overflow-y-auto custom-scrollbar space-y-3">
                            {autoMapResults.map((res, i) => (
                                <div key={i} className="flex items-center justify-between bg-black/40 p-4 rounded-xl border border-gray-800">
                                    <div className="flex items-center gap-4">
                                        <div className="flex flex-col">
                                            <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">기존 이름</span>
                                            <span className="text-lg text-red-400 font-bold">{res.guest}</span>
                                        </div>
                                        <span className="text-gray-600 text-2xl">→</span>
                                        <div className="flex flex-col">
                                            <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">DB 니케</span>
                                            <span className="text-lg text-blue-400 font-bold">{res.match.name}{res.match.extra_info ? ` (${res.match.extra_info})` : ''}</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className={`text-[10px] px-2 py-0.5 rounded border border-gray-700 text-gray-500`}>
                                            {res.match.id}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="p-6 bg-gray-950/50 flex gap-3">
                            <button 
                                onClick={() => setIsAutoMapConfirmOpen(false)}
                                className="flex-1 px-4 py-3 rounded-xl bg-gray-800 text-gray-300 font-bold hover:bg-gray-700 transition-all"
                            >
                                취소
                            </button>
                            <button 
                                onClick={applyAutoMap}
                                className="flex-[2] px-4 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-500 shadow-lg shadow-blue-900/20 transition-all"
                            >
                                변환 실행하기
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Burst DB Editor Modal */}
            {showBurstEditor && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-4xl h-[80vh] flex flex-col shadow-2xl overflow-hidden">
                        <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-900/50">
                            <div className="flex-1">
                                <h2 className="text-xl font-black text-white flex items-center gap-2">
                                    <span className="text-amber-500">⚡</span> 버스트 수급량 DB 관리
                                </h2>
                                <p className="text-xs text-gray-500 mt-1">니케별 버스트 수급량(value)을 직접 수정하고 DB에 반영합니다.</p>
                            </div>
                            <div className="flex-1 max-w-xs mx-4">
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">🔍</span>
                                    <input 
                                        type="text"
                                        placeholder="니케 이름 검색..."
                                        value={editorSearchTerm}
                                        onChange={(e) => setEditorSearchTerm(e.target.value)}
                                        className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:border-amber-500 outline-none transition-all"
                                    />
                                </div>
                            </div>
                            <button onClick={() => setShowBurstEditor(false)} className="text-gray-400 hover:text-white text-2xl">✕</button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-black/20">
                            <table className="w-full text-left border-collapse">
                                <thead className="sticky top-0 bg-gray-900 z-10">
                                    <tr className="text-[10px] font-black text-gray-500 uppercase tracking-wider border-b border-gray-800">
                                        <th className="py-3 px-4 min-w-[120px]">니케 이름</th>
                                        {(["2RL", "2_5RL", "3RL", "3_5RL", "4RL"] as RLStage[]).map(s => (
                                            <th key={s} className="py-3 px-2 text-center border-l border-gray-800/50">
                                                <div className="text-amber-500 mb-1">{s.replace('_', '.')}</div>
                                                <div className="flex gap-1 justify-center font-normal text-[9px] text-gray-600">
                                                    <span className="w-14">Value</span>
                                                    <span className="w-16">Hits</span>
                                                    <span className="w-16">Bonus</span>
                                                </div>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="text-sm font-medium">
                                    {filteredEditorNikkes.length > 0 ? (
                                        filteredEditorNikkes.map(([name, stages]) => (
                                            <tr key={name} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                                                <td className="py-3 px-4 font-bold text-gray-300 text-xs">{name}</td>
                                                {(["2RL", "2_5RL", "3RL", "3_5RL", "4RL"] as RLStage[]).map(s => (
                                                    <td key={s} className="py-2 px-1 text-center border-l border-gray-800/30">
                                                        <div className="flex flex-col gap-1 items-center">
                                                            <input
                                                                type="number"
                                                                step="0.1"
                                                                value={stages[s].value}
                                                                onChange={(e) => {
                                                                    const newVal = parseFloat(e.target.value) || 0;
                                                                    const nextDB = { ...localBurstDB };
                                                                    nextDB[name] = { ...nextDB[name], [s]: { ...nextDB[name][s], value: newVal } };
                                                                    setLocalBurstDB(nextDB);
                                                                }}
                                                                className="w-14 bg-gray-800 border border-gray-700 rounded px-1 py-0.5 text-center text-[11px] text-amber-400 font-mono focus:border-amber-500 outline-none transition-all"
                                                                placeholder="Val"
                                                                title="Value"
                                                            />
                                                            <input
                                                                type="text"
                                                                value={stages[s].hits || "0-0"}
                                                                onChange={(e) => {
                                                                    const nextDB = { ...localBurstDB };
                                                                    nextDB[name] = { ...nextDB[name], [s]: { ...nextDB[name][s], hits: e.target.value } };
                                                                    setLocalBurstDB(nextDB);
                                                                }}
                                                                className="w-16 bg-gray-800 border border-gray-700 rounded px-1 py-0.5 text-center text-[10px] text-blue-400 font-mono focus:border-blue-500 outline-none transition-all"
                                                                placeholder="Hits"
                                                                title="Hits (e.g. 2-4)"
                                                            />
                                                            <input
                                                                type="text"
                                                                value={stages[s].bonus || "0%-0%"}
                                                                onChange={(e) => {
                                                                    const nextDB = { ...localBurstDB };
                                                                    nextDB[name] = { ...nextDB[name], [s]: { ...nextDB[name][s], bonus: e.target.value } };
                                                                    setLocalBurstDB(nextDB);
                                                                }}
                                                                className="w-16 bg-gray-800 border border-gray-700 rounded px-1 py-0.5 text-center text-[10px] text-green-400 font-mono focus:border-green-500 outline-none transition-all"
                                                                placeholder="Bonus"
                                                                title="Bonus (e.g. 0%-5%)"
                                                            />
                                                        </div>
                                                    </td>
                                                ))}
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={6} className="py-10 text-center text-gray-500 font-bold">
                                                검색 결과가 없습니다.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        
                        <div className="p-4 border-t border-gray-800 flex justify-end gap-3 bg-gray-900/50">
                            <button onClick={() => setShowBurstEditor(false)} className="px-6 py-2 rounded-lg bg-gray-800 text-gray-300 font-bold hover:bg-gray-700 transition-all">취소</button>
                            <button 
                                onClick={() => {
                                    if (confirm("변경사항을 DB에 영구적으로 저장하시겠습니까?")) {
                                        handleSaveBurstDB(localBurstDB);
                                    }
                                }} 
                                className="px-8 py-2 rounded-lg bg-amber-600 text-white font-black hover:bg-amber-500 shadow-lg shadow-amber-900/20 transition-all"
                            >
                                DB 저장 및 적용
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
