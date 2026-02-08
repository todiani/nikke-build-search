import { useState, useMemo, useEffect, useRef } from 'react';
import type { NikkeData } from '../data/nikkes';
import { BURST_DB as BURSTDB, type RLStage } from '../data/burst_db';
import { matchKorean } from '../utils/hangul';
import TowerTierList from './TowerTierList';
import { loadDB, saveTowerSquads, saveMetaTeams, saveSavedTeams, normalize, getMasters, getNikkeStarsForCategory, starsToTierString } from '../utils/nikkeDataManager';
import type { MetaCategory, MetaTeam } from '../utils/nikkeDataManager';
import SearchBar from './SearchBar';
import SearchFilters, { initialFilters, type SearchFiltersState } from './SearchFilters';

interface SavedTeam {
    id: number;
    name: string;
    category: string;
    members: (string | { id: string; name: string; isGuest?: boolean })[];
    date: string;
}

interface TeamAnalysisProps {
    currentNikke?: NikkeData;
    allNikkes?: NikkeData[];
    onSelectNikke?: (nikke: NikkeData) => void;
    onOpenDataManager?: (nikke: NikkeData) => void;
    onSaveNikke?: (nikke: NikkeData) => Promise<void>;
    burstDB?: any;
    onReloadDB?: () => Promise<void>;
}

// 니케 카드 디자인 통일 (CategoryNikkeItem)
function CategoryNikkeItem({ nikke, categoryId, onSelect }: { nikke: NikkeData, categoryId: string, onSelect?: (n: NikkeData) => void }) {
    const masters = getMasters();
    const colors = (masters.colors || {}) as any;

    // 티어 정보 가져오기 (LATEST_TIERS 기반)
    const stars = getNikkeStarsForCategory(nikke, categoryId);

    // 티어 표시 변환 (별 -> 문자)
    const displayTier = starsToTierString(stars);

    return (
        <div
            onClick={() => onSelect?.(nikke)}
            className="cursor-pointer transform hover:-translate-y-1 transition-all duration-300 h-full"
        >
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-3 hover:border-nikke-red group h-full flex flex-col shadow-sm transition-all">
                <div className="flex justify-between items-start mb-2 h-[52px]">
                    <div className="flex flex-col min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-black border bg-black/40 shrink-0 ${colors.burst?.[nikke.burst] || 'border-gray-700 text-gray-400'}`}>
                                {nikke.burst}
                            </span>
                            <div className="flex items-baseline gap-1.5 min-w-0 flex-1">
                                <h3 className="font-bold text-white group-hover:text-nikke-red text-[13px] truncate leading-tight">
                                    {nikke.name}
                                </h3>
                            </div>
                        </div>
                        <div className="flex flex-col gap-0.5 mt-1">
                            {nikke.name_en ? (
                                <span className="text-[9px] text-blue-400/80 font-bold truncate">
                                    {nikke.name_en}
                                </span>
                            ) : (
                                <span className="text-[9px] text-transparent h-[13px]">placeholder</span>
                            )}
                            {nikke.extra_info ? (
                                <span className="text-[9px] text-orange-400/80 font-bold truncate">
                                    {nikke.extra_info}
                                </span>
                            ) : (
                                <span className="text-[9px] text-transparent h-[13px]">placeholder</span>
                            )}
                        </div>
                    </div>
                    <span className={`text-[12px] font-black ml-2 shrink-0 ${displayTier === 'SSS' ? 'text-red-500' :
                        displayTier === 'SS' ? 'text-orange-400' :
                            displayTier === 'S' ? 'text-yellow-400' :
                                displayTier === 'A' ? 'text-blue-400' :
                                    'text-gray-400'
                        }`}>{displayTier}</span>
                </div>

                {nikke.thumbnail && (
                    <div className="relative aspect-square mb-2 rounded-lg overflow-hidden border border-gray-700/50">
                        <img src={nikke.thumbnail} alt={nikke.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                )}

                <div className="space-y-1 mt-auto h-[38px] flex flex-col justify-end">
                    <div className="flex flex-wrap gap-x-2 gap-y-0.5 text-[9px] font-bold opacity-80 truncate">
                        <span className={colors.company?.[nikke.company || ''] || 'text-gray-500'}>{nikke.company || '제조사 미정'}</span>
                        <span className="text-gray-600">|</span>
                        <span className="text-cyan-400">{nikke.squad || '스쿼드 미정'}</span>
                    </div>
                    <div className="flex flex-wrap gap-x-1.5 text-[9px] font-black items-center pt-1 border-t border-gray-700/50 opacity-70">
                        <span className={colors.code_text?.[nikke.code || ''] || 'text-gray-400'}>{nikke.code}</span>
                        <span className="text-gray-600">·</span>
                        <span className={colors.class?.[nikke.class] || 'text-gray-400'}>{masters.class_names?.[nikke.class] || nikke.class}</span>
                        <span className="text-gray-600">·</span>
                        <span className={colors.weapon?.[nikke.weapon] || 'text-amber-400'}>{masters.weapon_names?.[nikke.weapon] || nikke.weapon}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

// 니케 선택 모달 컴포넌트
function NikkeSelector({ isOpen, onClose, onSelect, allNikkes, categoryId = 'Stage' }: {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (nikke: NikkeData) => void;
    allNikkes: NikkeData[];
    categoryId?: string;
}) {
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState<SearchFiltersState>(initialFilters);
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const filteredNikkes = useMemo(() => {
        return allNikkes.filter(nikke => {
            const nameMatch = matchKorean(nikke.name, searchTerm) || 
                              matchKorean(nikke.name_en, searchTerm) ||
                              (nikke.aliases && nikke.aliases.some(a => matchKorean(a, searchTerm)));
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
                                categoryId={categoryId}
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

export default function TeamAnalysis({ allNikkes = [], onSelectNikke, burstDB, onReloadDB }: TeamAnalysisProps) {
    const masters = getMasters();
    const colors = (masters.colors || {}) as any;

    // UI 컬러 매핑 변수 정의 (기존 코드에서 참조하는 변수들)
    const companyColors = colors.company || {};
    const burstColors = colors.burst || {};
    const codeTextColors = colors.code_text || {};
    const classColors = colors.class || {};
    const weaponColors = colors.weapon || {};
    const classNames = masters.class_names || {};

    // 검색 및 필터 상태 추가
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState<SearchFiltersState>(initialFilters);
    // 필터링 로직
    const filteredNikkes = useMemo(() => {
        return allNikkes.filter(nikke => {
            // 1. 이름 검색 (한글 초성/영문 대응)
            const nameMatch = matchKorean(nikke.name, searchTerm) || 
                              matchKorean(nikke.name_en, searchTerm) ||
                              (nikke.aliases && nikke.aliases.some(a => matchKorean(a, searchTerm)));
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
    const simRef = useRef<HTMLDivElement>(null);

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
    const [localBurstDB, setLocalBurstDB] = useState(burstDB || BURSTDB);

    // Sync with global BURST_DB when it updates
    useEffect(() => {
        if (burstDB) {
            setLocalBurstDB(burstDB);
        }
    }, [burstDB]);

    // Also sync when editor opens
    useEffect(() => {
        if (showBurstEditor && burstDB) {
            setLocalBurstDB(burstDB);
        }
    }, [showBurstEditor, burstDB]);
    const [editorSearchTerm, setEditorSearchTerm] = useState('');
    const [tierSearchTerm, setTierSearchTerm] = useState('');
    const [tierFilters, setTierFilters] = useState<SearchFiltersState>(initialFilters);
    const [isTierFilterOpen, setIsTierFilterOpen] = useState(false);

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
                if (onReloadDB) {
                    await onReloadDB();
                }
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
            const data = await loadDB();
            if (!data) {
                console.error('[Error] Failed to load DB data in TeamAnalysis');
                return;
            }
            const { meta_teams, tower_squads, saved_teams } = data;
            if (saved_teams) setSavedTeams(saved_teams);
            if (meta_teams) setMetaTeams(meta_teams);
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
                ...found,
                burst: (found.name === '레드 후드' || found.name === '레드후드') ? 'A' : found.burst,
                element: found.code,
                isGuest: false
            };
        }

        // Fallback for Nikkes not yet perfectly matched - provide enough data for NikkeDetail
        return {
            id: `guest-${name}`,
            name: name,
            name_en: undefined,
            extra_info: '미등록 게스트 니케',
            tier: '?',
            company: '?',
            squad: '?',
            code: '?',
            element: '?',
            burst: (name === '레드 후드' || name === '레드후드') ? 'A' : '?',
            weapon: '?',
            class: '?',
            rarity: 'SSR',
            thumbnail: undefined,
            desc: '이 니케는 DB에 등록되어 있지 않은 게스트 니케입니다. DB 동기화 기능을 통해 정식 니케와 연결할 수 있습니다.',
            isGuest: true,
            usage_stats: [],
            skills: { min: '', efficient: '', max: '' },
            skills_detail: {
                normal: { name: '일반 공격', desc: '정보 없음', tags: [] },
                skill1: { name: '스킬 1', desc: '정보 없음', tags: [] },
                skill2: { name: '스킬 2', desc: '정보 없음', tags: [] },
                burst: { name: '버스트 스킬', desc: '정보 없음', tags: [] }
            },
            options: [],
            valid_options: [],
            invalid_options: [],
            burst_details: {},
            weapon_info: { weapon_name: '' }
        } as unknown as NikkeData;
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
        const has20sB1 = teamNames.some(n => ['리타', '도로시', '리틀 머메이드', '동디', '티아', '볼륨', '페퍼', '루주', 'D: 킬러 와이프', '레드 후드', '라피'].some(k => n.includes(k)));
        if (hasB1 && b1Count < 2 && !has20sB1) { messages.push("ℹ️ 1버스트 쿨타임 주의"); score -= 10; }
        else if (hasB1) score += 10;

        // 3. New Advanced Synergy (from DB)
        const masters = getMasters();
        (masters.synergies || []).forEach(syn => {
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

    const [filterCategory, setFilterCategory] = useState<'All' | 'Stage' | 'Anomaly' | 'SoloRaid' | 'UnionRaid' | 'PVP' | 'Tower'>('All');
    const [hideMissingTeams, setHideMissingTeams] = useState(false);
    const [editingMetaIdx, setEditingMetaIdx] = useState<number | null>(null);
    const [tempMetaTeam, setTempMetaTeam] = useState<MetaTeam | null>(null);

    // 편집 모드 시 선택된 팀 동기화
    useEffect(() => {
        if (editingMetaIdx !== null && tempMetaTeam) {
            setTempMetaTeam(prev => {
                if (!prev) return prev;
                // 멤버가 실제로 변경되었을 때만 업데이트
                const newMembers = selectedTeam.map(m => m ? m.name : '');
                if (JSON.stringify(prev.members) === JSON.stringify(newMembers)) return prev;
                return {
                    ...prev,
                    members: newMembers
                };
            });
        }
    }, [selectedTeam, editingMetaIdx]);
    const [linkingGuestName, setLinkingGuestName] = useState<string | null>(null);
    const [isAutoMapConfirmOpen, setIsAutoMapConfirmOpen] = useState(false);
    const [autoMapResults, setAutoMapResults] = useState<{ guest: string; match: NikkeData }[]>([]);
    const [selectedAnomalyBoss, setSelectedAnomalyBoss] = useState<string>('전체');

    const ANOMALY_BOSSES = [
        '전체',
        '크라켄 (풍압)',
        '인디빌리아 (전격)',
        '미러 컨테이너 (수냉)',
        '울트라 (전격)',
        '하베스터 (작열)'
    ];

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
                    const nameMatch = matchKorean(nikke.name, searchTerm) || 
                                      matchKorean(nikke.name_en, searchTerm) ||
                                      (nikke.aliases && nikke.aliases.some(a => matchKorean(a, searchTerm)));
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

        // 4. 이상 개체 요격전 내부 필터링 적용 (최종 카테고리화 이후 진행)
        if (selectedAnomalyBoss !== '전체') {
            const bossKeywords = normalize(selectedAnomalyBoss.split(' (')[0]);
            groups['Anomaly'] = groups['Anomaly'].filter(t =>
                normalize(t.boss).includes(bossKeywords) ||
                (t.description && normalize(t.description).includes(bossKeywords))
            );
        }

        return groups;
    }, [metaTeams, allNikkes, hideMissingTeams, searchTerm, filters, selectedAnomalyBoss]);

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
        
        // 팀 빌더 초기화 및 스크롤
        setSelectedTeam(Array(5).fill(null));
        simRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const handleEditMetaTeam = (index: number) => {
        const team = metaTeams[index];
        if (!team) return;

        // 팀 빌더로 로드
        loadTeam(team.members.map(m => typeof m === 'string' ? m : m.name));

        setEditingMetaIdx(index);
        setTempMetaTeam({
            ...team,
            members: team.members.map(m => typeof m === 'string' ? m : m.name)
        });

        // 팀 빌더 섹션으로 스크롤
        simRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const handleDeleteMetaTeam = async (index: number) => {
        if (!confirm("이 추천 조합을 삭제하시겠습니까?")) return;
        const updated = metaTeams.filter((_, i) => i !== index);
        await updateMetaTeams(updated);
    };

    const handleSaveMeta = async () => {
        if (!tempMetaTeam) return;
        if (!tempMetaTeam.boss.trim()) { alert("보스 또는 조합 명칭을 입력하세요."); return; }
        
        // selectedTeam에서 최신 멤버 정보 가져오기
        const currentMembers = selectedTeam.map(m => m ? m.name : '');
        if (currentMembers.some(m => !m)) { alert("니케 5명을 모두 선택하세요."); return; }

        const finalTeam: MetaTeam = {
            ...tempMetaTeam,
            members: currentMembers
        };

        let updated: MetaTeam[];
        if (editingMetaIdx !== null && editingMetaIdx !== -1) {
            updated = metaTeams.map((t, i) => i === editingMetaIdx ? finalTeam : t);
        } else {
            updated = [...metaTeams, finalTeam];
        }
        await updateMetaTeams(updated);
        setEditingMetaIdx(null);
        setTempMetaTeam(null);
    };

    const handleCancelMetaEdit = () => {
        setEditingMetaIdx(null);
        setTempMetaTeam(null);
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
                    }
                    setSelectorOpen(false);
                    setOnTowerNikkeSelect(null);
                }}
                allNikkes={allNikkes}
                categoryId={
                    onTowerNikkeSelect ? 'Tower' : 
                    (tempMetaTeam?.category || filterCategory || 'Stage')
                }
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
            <div ref={simRef} className={`p-4 rounded-xl border transition-all duration-500 ${editingMetaIdx !== null ? 'bg-blue-900/20 border-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.15)]' : 'bg-gray-800/60 border-gray-700'}`}>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                    <div className="flex flex-col gap-1.5">
                        <h2 className="text-xl font-black flex items-center gap-2">
                            <span>⚔️</span> 팀 빌더 & 시뮬레이터
                            {editingMetaIdx !== null && (
                                <span className={`text-[10px] px-2 py-1 rounded-lg animate-pulse ml-2 ${editingMetaIdx === -1 ? 'bg-green-600/20 text-green-400 border border-green-500/30' : 'bg-blue-600/20 text-blue-400 border border-blue-500/30'} font-black uppercase tracking-tighter`}>
                                    {editingMetaIdx === -1 ? 'ADD NEW META' : 'EDIT META MODE'}
                                </span>
                            )}
                        </h2>
                        {editingMetaIdx !== null && tempMetaTeam && (
                            <div className="flex items-center gap-2 text-sm mt-0.5 animate-fadeIn">
                                <div className="flex items-center gap-1.5 bg-gray-900/60 px-3 py-1.5 rounded-xl border border-gray-700/50">
                                    <span className="text-blue-400 text-lg">
                                        {categories.find(c => c.id === tempMetaTeam.category)?.icon || '📋'}
                                    </span>
                                    <span className="text-blue-400 font-black text-[11px] uppercase tracking-widest">
                                        {categories.find(c => c.id === tempMetaTeam.category)?.label || tempMetaTeam.category}
                                    </span>
                                    <span className="w-1 h-1 bg-gray-600 rounded-full mx-1"></span>
                                    <span className="text-gray-200 font-black text-sm">
                                        {tempMetaTeam.boss || (editingMetaIdx === -1 ? '새로운 조합' : '조합 명칭 없음')}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="flex gap-2 items-center">
                        {editingMetaIdx !== null && (
                            <button
                                onClick={() => {
                                    setEditingMetaIdx(null);
                                    setTempMetaTeam(null);
                                    setSelectedTeam(new Array(5).fill(null));
                                }}
                                className="bg-gray-700/50 hover:bg-gray-700 text-gray-300 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border border-gray-600 transition-all mr-2"
                            >
                                Cancel Edit
                            </button>
                        )}
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
                                className="flex-1 h-full"
                            >
                                {info ? (
                                        <div className="relative group">
                                            {editingMetaIdx !== null && tempMetaTeam && (
                                                <div className="absolute -top-2 -left-2 z-30 bg-blue-600/90 text-white text-[8px] font-black px-1.5 py-0.5 rounded-md shadow-lg border border-blue-400/50 backdrop-blur-sm">
                                                    {categories.find(c => c.id === tempMetaTeam.category)?.label || tempMetaTeam.category}
                                                </div>
                                            )}
                                            <CategoryNikkeItem
                                                nikke={info}
                                                categoryId={tempMetaTeam?.category || 'Stage'}
                                                onSelect={() => {
                                                    setActiveSlot(idx);
                                                    setMetaSlotIdx(null);
                                                    setOnTowerNikkeSelect(null);
                                                    setSelectorOpen(true);
                                                }}
                                            />
                                        <button
                                            onClick={(e) => { 
                                                e.stopPropagation(); 
                                                const n = [...selectedTeam]; 
                                                n[idx] = null; 
                                                setSelectedTeam(n); 
                                            }}
                                            className="absolute -top-1 -right-1 w-6 h-6 bg-gray-900/80 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-20 text-[10px] border border-gray-700 shadow-lg"
                                        >
                                            ✕
                                        </button>
                                        {member.isGuest && (
                                            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-1.5 py-0.5 bg-blue-600 text-[8px] font-black text-white rounded shadow-sm z-10 uppercase tracking-tighter">
                                                Meta
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div
                                        onClick={() => {
                                            setActiveSlot(idx);
                                            setMetaSlotIdx(null);
                                            setOnTowerNikkeSelect(null);
                                            setSelectorOpen(true);
                                        }}
                                        className="group relative h-full min-h-[160px] bg-gray-900/40 border-2 border-dashed border-gray-700/50 hover:border-nikke-red rounded-xl flex flex-col items-center justify-center transition-all duration-300 cursor-pointer overflow-hidden"
                                    >
                                        {editingMetaIdx !== null && tempMetaTeam && (
                                            <div className="absolute -top-2 -left-2 z-30 bg-blue-600/80 text-white text-[8px] font-black px-1.5 py-0.5 rounded-md shadow-lg border border-blue-400/50">
                                                {categories.find(c => c.id === tempMetaTeam.category)?.label || tempMetaTeam.category}
                                            </div>
                                        )}
                                        <div className="flex flex-col items-center gap-1.5 group-hover:scale-110 transition-transform duration-300">
                                            <span className="text-gray-600 text-2xl group-hover:text-nikke-red transition-colors">+</span>
                                            <span className="text-[9px] font-bold text-gray-500 group-hover:text-nikke-red/70 transition-colors uppercase tracking-widest">Select</span>
                                        </div>
                                        <div className="absolute inset-0 bg-nikke-red/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* 메타 조합 편집 시 보스명 및 설명 입력 필드 */}
                {editingMetaIdx !== null && tempMetaTeam && (
                    <div className="mt-6 p-6 bg-black/20 rounded-2xl border border-blue-500/30 space-y-5 animate-fadeIn">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="text-lg">📝</span>
                            <h3 className="text-lg font-bold text-white">추천 조합 정보 설정</h3>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2.5">
                                <label className="text-xs font-black text-blue-400 ml-1 uppercase tracking-widest flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                                    조합 명칭 / 보스 이름
                                </label>
                                <input
                                    type="text"
                                    value={tempMetaTeam.boss}
                                    onChange={e => setTempMetaTeam({ ...tempMetaTeam, boss: e.target.value })}
                                    placeholder="예: 크라켄 풍압 1위 / 캠페인 범용 등"
                                    className="w-full bg-gray-900/80 border border-gray-700 rounded-xl px-4 py-3.5 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 outline-none shadow-inner transition-all text-sm font-medium"
                                />
                            </div>
                            
                            <div className="space-y-2.5">
                                <label className="text-xs font-black text-blue-400 ml-1 uppercase tracking-widest flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                                    카테고리 선택
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {categories.filter(c => c.id !== 'All' && c.id !== 'Tower').map(cat => (
                                        <button
                                            key={cat.id}
                                            onClick={() => setTempMetaTeam({ ...tempMetaTeam, category: cat.id as MetaCategory })}
                                            className={`px-3 py-2 rounded-lg text-[11px] font-black transition-all border ${tempMetaTeam.category === cat.id 
                                                ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/20' 
                                                : 'bg-gray-800 border-gray-700 text-gray-500 hover:bg-gray-700 hover:text-gray-300'}`}
                                        >
                                            {cat.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2.5">
                            <label className="text-xs font-black text-blue-400 ml-1 uppercase tracking-widest flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                                조합 상세 설명
                            </label>
                            <textarea
                                value={tempMetaTeam.description}
                                onChange={e => setTempMetaTeam({ ...tempMetaTeam, description: e.target.value })}
                                placeholder="조합 운용 방법이나 대체 니케 등 상세 정보를 입력하세요..."
                                className="w-full bg-gray-900/80 border border-gray-700 rounded-xl px-4 py-3.5 text-white h-28 resize-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 outline-none shadow-inner transition-all text-sm leading-relaxed"
                            />
                        </div>

                        <div className="flex gap-4 pt-2">
                            <button 
                                onClick={handleCancelMetaEdit} 
                                className="flex-1 py-4 bg-gray-800 text-gray-400 rounded-xl font-black hover:bg-gray-700 hover:text-white transition-all border border-gray-700 flex items-center justify-center gap-2"
                            >
                                <span>✕</span> 취소
                            </button>
                            <button 
                                onClick={handleSaveMeta} 
                                className="flex-1 py-4 bg-blue-600 text-white rounded-xl font-black hover:bg-blue-500 shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2"
                            >
                                <span>💾</span> {editingMetaIdx === -1 ? '새 추천 조합 등록' : '변경사항 저장하기'}
                            </button>
                        </div>
                    </div>
                )}

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
                            <div className={`ml-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${getBurstGrade(burstAnalysis["2RL"].value) === 'S' ? 'bg-red-500/20 text-red-400' :
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
                                    {(st.members as any[]).slice(0, 5).map((m: any, i: number) => (
                                        <div key={i} className={`w-3.5 h-3.5 rounded-full shadow-inner ${m ? 'bg-blue-600 border border-blue-400/30' : 'bg-gray-700 border border-gray-600'}`} />
                                    ))}
                                </div>
                                <button onClick={() => loadTeam((st.members as any[]).map((m: any) => typeof m === 'string' ? m : m.name))} className="w-full text-[12px] font-bold bg-gray-700 hover:bg-gray-600 py-1.5 rounded-md">불러오기</button>
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
                            🏆 2026 메타 & 추천 조합
                        </h3>
                    </div>
                </div>

                {/* Category Navigation */}
                <div className="bg-gray-900/20 rounded-3xl p-6 border border-gray-800/50 space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
                        {categories.filter(c => c.id !== 'All').map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setFilterCategory(cat.id)}
                                className={`px-4 py-4 rounded-2xl text-sm font-black flex flex-col items-center justify-center gap-2 transition-all duration-300 border-2
                                    ${filterCategory === cat.id
                                        ? 'bg-blue-600 text-white border-blue-400 shadow-xl shadow-blue-900/40'
                                        : 'bg-gray-800/30 text-gray-400 border-gray-800/50 hover:bg-gray-800 hover:text-gray-200 hover:border-gray-700'}`}
                            >
                                <span className="text-2xl mb-1">{cat.icon}</span>
                                <span className="text-center leading-tight break-keep">{cat.label}</span>
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={() => setFilterCategory('All')}
                        className={`w-full py-4 rounded-2xl text-base font-black flex items-center justify-center gap-3 transition-all duration-300 border-2
                            ${filterCategory === 'All'
                                ? 'bg-gradient-to-r from-blue-700 to-blue-600 text-white border-blue-500 shadow-xl shadow-blue-900/40'
                                : 'bg-gray-800/20 text-gray-500 border-gray-800/50 hover:bg-gray-800 hover:text-gray-300 hover:border-gray-700'}`}
                    >
                        <span className="text-xl">🌟</span>
                        전체 카테고리 추천 조합 보기
                    </button>

                    {/* Filter Toggle */}
                    <div className="flex justify-end pt-2">
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <div className="relative">
                                <input
                                    type="checkbox"
                                    checked={hideMissingTeams}
                                    onChange={(e) => setHideMissingTeams(e.target.checked)}
                                    className="sr-only p-2"
                                />
                                <div className={`w-10 h-6 rounded-full transition-colors duration-300 ${hideMissingTeams ? 'bg-blue-600' : 'bg-gray-700'}`}>
                                    <div className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${hideMissingTeams ? 'translate-x-4' : 'translate-x-0'}`} />
                                </div>
                            </div>
                            <span className="text-sm font-bold text-gray-400 group-hover:text-blue-400 transition-colors">데이터 미보유 니케 포함 조합 제외</span>
                        </label>
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
                        searchTerm={tierSearchTerm}
                        onSearchChange={setTierSearchTerm}
                        filters={tierFilters}
                        onFiltersChange={setTierFilters}
                        isFilterOpen={isTierFilterOpen}
                        onToggleFilter={() => setIsTierFilterOpen(!isTierFilterOpen)}
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

                                // Internal grouping for Anomaly by Boss
                                const subGroups: Record<string, MetaTeam[]> = {};
                                if (category === 'Anomaly') {
                                    teams.forEach(t => {
                                        // "크라켄 (약점: 풍압) 1위" -> "크라켄"
                                        const bossName = t.boss.split(' (')[0].trim();
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

                                        {/* 1. 보스 선택 및 조합 추가 (통합 섹션) - Anomaly 카테고리인 경우 최상단으로 이동 */}
                                        {category === 'Anomaly' && (
                                            <div className="flex flex-col gap-6 bg-gray-900/30 rounded-3xl p-6 border border-gray-800/50 shadow-2xl mb-8">
                                                <div className="flex flex-col gap-3">
                                                    <span className="text-xs font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Boss Selection</span>
                                                    <div className="flex flex-wrap justify-center gap-2.5">
                                                        {ANOMALY_BOSSES.map(boss => (
                                                            <button
                                                                key={boss}
                                                                onClick={() => setSelectedAnomalyBoss(boss)}
                                                                className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all duration-300 border ${selectedAnomalyBoss === boss
                                                                    ? 'bg-gradient-to-br from-red-600 to-red-800 text-white border-red-500 shadow-[0_0_20px_rgba(220,38,38,0.3)] scale-105'
                                                                    : 'bg-gray-800/50 text-gray-400 border-gray-700 hover:bg-gray-700 hover:text-gray-200 hover:border-gray-600'
                                                                    }`}
                                                            >
                                                                {boss}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="flex justify-center pt-2 border-t border-gray-800/50">
                                                    {editingMetaIdx === null && (
                                                        <button
                                                            onClick={() => handleAddMetaTeam('Anomaly')}
                                                            className="group relative px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-sm font-black transition-all flex items-center gap-3 shadow-[0_0_25px_rgba(37,99,235,0.2)] overflow-hidden"
                                                        >
                                                            <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                                                            <span className="text-lg">➕</span> 이상 개체 요격전 (특특요) 조합 추가
                                                        </button>
                                                    )}
                                                    {editingMetaIdx !== null && (
                                                        <div className="bg-blue-900/20 px-6 py-2.5 rounded-xl border border-blue-800/50 text-blue-400 text-sm font-bold flex items-center gap-2">
                                                            <span className="animate-spin text-base">🔄</span> 조합 편집 진행 중...
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* 2. 공략 조합 섹션 */}
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
                                                        <div className="grid grid-cols-1 gap-4">
                                                            {sortedTeams.map((team, idx) => {
                                                                const originalIdx = metaTeams.findIndex(t =>
                                                                    t.boss === team.boss &&
                                                                    JSON.stringify(t.members) === JSON.stringify(team.members)
                                                                );

                                                                if (editingMetaIdx === originalIdx && tempMetaTeam) {
                                                                    return null; // 팀 빌더 섹션에서 편집하도록 변경
                                                                }

                                                                return (
                                                                    <div key={idx} className="bg-gray-900/40 border border-gray-800 hover:border-blue-500/50 hover:bg-gray-800/60 cursor-pointer group relative flex flex-col gap-4 p-5 rounded-2xl shadow-lg transition-all duration-300"
                                                                        onClick={() => loadTeam(team.members.map(m => typeof m === 'string' ? m : m.name))}>

                                                                        <div className="flex justify-between items-center">
                                                                            <div className="flex items-center gap-4">
                                                                                <div className={`flex items-center justify-center w-8 h-8 rounded-xl shadow-lg shrink-0 ${idx === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' :
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
                                                                                                .replace(/2026/g, '')
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
                                                                                
                                                                                if (!info) {
                                                                                    return (
                                                                                        <div key={mi} className="bg-gray-800/40 border border-dashed border-gray-700 rounded-xl p-2 flex items-center justify-center text-gray-500 text-[10px] h-full min-h-[100px]">
                                                                                            {mName || '미정'}
                                                                                        </div>
                                                                                    );
                                                                                }

                                                                                return (
                                                                                    <div key={mi} className="h-full">
                                                                                        <CategoryNikkeItem
                                                                                            nikke={info}
                                                                                            categoryId={team.category}
                                                                                            onSelect={(n) => {
                                                                                                onSelectNikke?.(n);
                                                                                            }}
                                                                                        />
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


                                        {/* 3. 새로운 조합 추가 레이어 삭제됨 - 팀 빌더에서 처리 */}

                                        {/* 4. 티어리스트 섹션 (최하단) */}
                                        <div className="bg-gray-900/40 rounded-3xl p-8 border border-gray-800 shadow-inner mt-8">
                                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                                                <div className="flex items-center gap-3">
                                                    <h5 className="text-2xl font-black text-white flex items-center gap-3">
                                                        <span>🏆</span> {cat.label} 티어리스트
                                                    </h5>
                                                    <span className="text-xs bg-blue-900/30 px-3 py-1 rounded-full text-blue-400 font-bold border border-blue-800/50">성능 종합</span>
                                                </div>
                                                <div className="flex flex-col md:flex-row items-end md:items-center gap-4 w-full md:w-auto">
                                                    <div className="w-full md:w-64">
                                                        <div className="relative">
                                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">🔍</span>
                                                            <input
                                                                type="text"
                                                                placeholder="니케 이름 검색..."
                                                                value={tierSearchTerm}
                                                                onChange={(e) => setTierSearchTerm(e.target.value)}
                                                                className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:border-blue-500 outline-none transition-all"
                                                            />
                                                        </div>
                                                    </div>
                                                    <SearchFilters
                                                        filters={tierFilters}
                                                        onChange={setTierFilters}
                                                        isOpen={isTierFilterOpen}
                                                        onToggle={() => setIsTierFilterOpen(!isTierFilterOpen)}
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                                                {allNikkes
                                                    ?.filter(n => {
                                                        const stars = getNikkeStarsForCategory(n, cat.id);
                                                        if (stars <= 0) return false;
                                                        
                                                        // 1. 이름 검색
                                                        if (tierSearchTerm) {
                                                            const nameMatch = matchKorean(n.name, tierSearchTerm) || matchKorean(n.name_en, tierSearchTerm);
                                                            if (!nameMatch) return false;
                                                        }

                                                        // 2. 상세 필터
                                                        if (tierFilters.tier && n.tier !== tierFilters.tier) return false;
                                                        if (tierFilters.company && n.company !== tierFilters.company) return false;
                                                        if (tierFilters.squad && n.squad !== tierFilters.squad) return false;
                                                        if (tierFilters.class && n.class !== tierFilters.class) return false;
                                                        if (tierFilters.code && n.code !== tierFilters.code) return false;
                                                        if (tierFilters.burst && n.burst !== tierFilters.burst) return false;
                                                        if (tierFilters.weapon && n.weapon !== tierFilters.weapon) return false;

                                                        return true;
                                                    })
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
                        {filterCategory === 'All' && (
                            <div className="pt-12 border-t border-gray-800">
                                <div className="flex items-center gap-3 mb-8">
                                    <span className="text-3xl">🏢</span>
                                    <h3 className="text-2xl font-black text-white">기업별 / 트라이브 타워 조합 및 가이드</h3>
                                </div>
                                <TowerTierList
                                    allNikkes={allNikkes}
                                    onSelectNikke={onSelectNikke}
                                    towerSquads={towerSquads}
                                    onSaveSquads={handleSaveTowerSquads}
                                    openNikkeSelector={openTowerNikkeSelector}
                                    searchTerm={tierSearchTerm}
                                    onSearchChange={setTierSearchTerm}
                                    filters={tierFilters}
                                    onFiltersChange={setTierFilters}
                                    isFilterOpen={isTierFilterOpen}
                                    onToggleFilter={() => setIsTierFilterOpen(!isTierFilterOpen)}
                                />
                            </div>
                        )}
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
            {
                isAutoMapConfirmOpen && (
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
                )
            }

            {/* Burst DB Editor Modal */}
            {
                showBurstEditor && (
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
                                                    <td className="py-3 px-4 sticky left-0 bg-[#0f1115] z-10">
                                                        <div 
                                                            className="text-xs font-bold text-gray-300 cursor-pointer hover:text-white hover:underline transition-colors"
                                                            onClick={() => {
                                                                const info = getNikkeInfo(name);
                                                                if (info) {
                                                                    onSelectNikke?.(info);
                                                                }
                                                            }}
                                                        >
                                                            {name}
                                                        </div>
                                                    </td>
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
                )
            }
        </div >
    );
}
