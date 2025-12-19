import { useState, useMemo, useEffect } from 'react';
import type { NikkeData } from '../data/nikkes';
import { FUTURE_META_DATA, GUEST_NIKKES, type MetaTeam } from '../data/future_meta';
import { SYNERGIES } from '../data/synergies';
import { matchKorean } from '../utils/hangul';
import { BURST_DB, type RLStage } from '../data/burst_db';

interface TeamAnalysisProps {
    currentNikke?: NikkeData;
    allNikkes?: NikkeData[];
}

interface SavedTeam {
    id: number;
    name: string;
    category: string;
    members: ({ id: string; name: string; isGuest: boolean } | null)[];
    date: string;
}

// Simple Nikke Selector Modal
function NikkeSelector({ isOpen, onClose, onSelect, allNikkes }: {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (nikke: NikkeData) => void;
    allNikkes: NikkeData[];
}) {
    const [search, setSearch] = useState('');

    if (!isOpen) return null;

    const filtered = allNikkes.filter(n => matchKorean(n.name, search) || matchKorean(n.name_en, search) || n.name.includes(search));

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn">
            <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-lg max-h-[80vh] flex flex-col shadow-2xl">
                <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                    <h3 className="text-white font-bold text-lg">니케 선택</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
                </div>
                <div className="p-4 border-b border-gray-800">
                    <input
                        className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:border-blue-500 outline-none"
                        placeholder="니케 이름 검색..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        autoFocus
                    />
                </div>
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar grid grid-cols-4 sm:grid-cols-5 gap-2">
                    {filtered.map(nikke => {
                        // Special handling for Red Hood display consistency if passed in allNikkes
                        const isRedHood = nikke.name.includes('레드후드');
                        const displayBurst = isRedHood ? 'A' : nikke.burst;

                        return (
                            <button
                                key={nikke.id}
                                onClick={() => { onSelect({ ...nikke, burst: displayBurst as any }); onClose(); }}
                                className="bg-gray-800 hover:bg-gray-700 rounded p-2 flex flex-col items-center justify-center gap-1.5 border border-gray-700 hover:border-blue-500 transition-all min-h-[80px]"
                            >
                                <span className="text-sm font-bold text-gray-200 text-center leading-tight break-keep">{nikke.name}</span>
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm
                                    ${displayBurst === 'I' ? 'bg-pink-600' : displayBurst === 'II' ? 'bg-blue-600' : displayBurst === 'III' ? 'bg-red-600' : 'bg-red-500 border border-white'}`}>
                                    {displayBurst}
                                </div>
                            </button>
                        );
                    })}
                    {Object.entries(GUEST_NIKKES).filter(([name]) => name.includes(search)).map(([name, data]) => (
                        <button
                            key={name}
                            onClick={() => {
                                // Mock a NikkeData for guest
                                onSelect({ id: name, name, name_en: name, burst: data.burst, tier: 'Unranked', class: data.class as any, weapon: data.weapon as any, code: data.element } as NikkeData);
                                onClose();
                            }}
                            className="bg-purple-900/20 hover:bg-purple-900/40 rounded p-2 flex flex-col items-center justify-center gap-1.5 border border-purple-500/30 hover:border-purple-500 transition-all min-h-[80px]"
                        >
                            <span className="text-sm font-bold text-purple-200 text-center leading-tight break-keep">{name}</span>
                            <div className="w-6 h-6 rounded-full bg-purple-800 flex items-center justify-center text-[10px] font-bold text-purple-200">
                                {data.burst}
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default function TeamAnalysis({ currentNikke, allNikkes = [] }: TeamAnalysisProps) {
    // State for the custom builder
    const [selectedTeam, setSelectedTeam] = useState<({ id: string; name: string; isGuest: boolean; burst?: string } | null)[]>(Array(5).fill(null));

    // Selector State
    const [selectorOpen, setSelectorOpen] = useState(false);
    const [activeSlot, setActiveSlot] = useState<number>(-1);

    // State for Simulation Settings
    const [simSettings, setSimSettings] = useState({
        level: 360, // Default higher for realistic sim
        core: 0,
        equipTier: 3
    });

    // State for Saved Teams
    const [savedTeams, setSavedTeams] = useState<SavedTeam[]>([]);

    // 1. Load saved teams
    useEffect(() => {
        const saved = localStorage.getItem('nikke_my_squads');
        if (saved) {
            try { setSavedTeams(JSON.parse(saved)); } catch (e) { console.error(e); }
        }
    }, []);

    // 2. Save handler with Category
    const handleSaveSquad = () => {
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
        setSavedTeams(updated);
        localStorage.setItem('nikke_my_squads', JSON.stringify(updated));
    };

    const handleDeleteSquad = (id: number) => {
        if (!confirm("삭제하시겠습니까?")) return;
        const updated = savedTeams.filter(t => t.id !== id);
        setSavedTeams(updated);
        localStorage.setItem('nikke_my_squads', JSON.stringify(updated));
    };

    // Helper: Get info for ANY name (Guest or Real)
    const getNikkeInfo = (name: string) => {
        if (!name) return null;

        // Special Case: Red Hood
        if (name.includes('레드후드')) {
            // Check guest first, but usually she'd be in real list.
            // We force her to be 'A' regardless of source for consistency in this view.
            const found = allNikkes.find(n => n.name === name);
            if (found) {
                return {
                    burst: 'A', // FORCE A
                    element: found.code,
                    weapon: found.weapon,
                    class: found.class,
                    name: found.name,
                    isGuest: false
                };
            }
            // fallback if not found in list but name matches
            return { burst: 'A', element: 'Fire', weapon: 'SR', class: 'Attacker', name, isGuest: false };
        }

        if (GUEST_NIKKES[name]) return { ...GUEST_NIKKES[name], name, isGuest: true };

        // Find in allNikkes
        const found = allNikkes.find(n => n.name === name);
        if (found) {
            return {
                burst: found.burst,
                element: found.code,
                weapon: found.weapon,
                class: found.class,
                name: found.name,
                isGuest: false
            };
        }
        return { burst: '?', element: '?', weapon: '?', class: '?', name, isGuest: false };
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
    const burstAnalysis = useMemo(() => {
        const stages: RLStage[] = ["2RL", "2_5RL", "3RL", "3_5RL", "4RL"];

        const totals: Record<RLStage, { value: number; hitsMin: number; hitsMax: number; bonusMin: number; bonusMax: number }> = {
            "2RL": { value: 0, hitsMin: 0, hitsMax: 0, bonusMin: 0, bonusMax: 0 },
            "2_5RL": { value: 0, hitsMin: 0, hitsMax: 0, bonusMin: 0, bonusMax: 0 },
            "3RL": { value: 0, hitsMin: 0, hitsMax: 0, bonusMin: 0, bonusMax: 0 },
            "3_5RL": { value: 0, hitsMin: 0, hitsMax: 0, bonusMin: 0, bonusMax: 0 },
            "4RL": { value: 0, hitsMin: 0, hitsMax: 0, bonusMin: 0, bonusMax: 0 }
        };

        const parseRange = (range?: string) => {
            if (!range) return [0, 0];
            const parts = range.replace(/%/g, '').split('-');
            return [parseFloat(parts[0]) || 0, parseFloat(parts[1] || parts[0]) || 0];
        };

        selectedTeam.forEach(member => {
            if (!member) return;
            const cleanName = member.name.split('(')[0].trim();

            // Priority: Nikke Object's current data -> BURST_DB
            const nikkeObj = allNikkes.find(n => n.name === member.name);
            const data = nikkeObj?.burst_details || BURST_DB[cleanName] || BURST_DB[member.name];

            if (data) {
                stages.forEach(s => {
                    const stageData = data[s];
                    if (stageData) {
                        totals[s].value += stageData.value || 0;
                        const h = parseRange(stageData.hits);
                        totals[s].hitsMin += h[0];
                        totals[s].hitsMax += h[1];
                        const b = parseRange(stageData.bonus);
                        totals[s].bonusMin += b[0];
                        totals[s].bonusMax += b[1];
                    }
                });
            }
        });

        return totals;
    }, [selectedTeam]);

    const loadTeam = (members: string[]) => {
        const newTeam = Array(5).fill(null);
        members.forEach((m, i) => {
            if (i < 5) newTeam[i] = { id: m, name: m, isGuest: !!GUEST_NIKKES[m] };
        });
        setSelectedTeam(newTeam);
    };

    // Unified Filter / View Switching Logic
    const [filterCategory, setFilterCategory] = useState<'All' | 'Stage' | 'Anomaly' | 'SoloRaid' | 'UnionRaid' | 'PVP'>('All');

    // Categorize teams accurately
    const categorizedTeams = useMemo(() => {
        const groups: Record<string, MetaTeam[]> = {
            'Stage': [],
            'Anomaly': [],
            'SoloRaid': [],
            'UnionRaid': [],
            'PVP': []
        };

        FUTURE_META_DATA.forEach(t => {
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
    }, []);

    const categories = [
        { id: 'All', label: '전체', icon: '🌟' },
        { id: 'Stage', label: '스테이지', icon: '🎯' },
        { id: 'Anomaly', label: '이상개체요격전', icon: '👹' },
        { id: 'SoloRaid', label: '솔로레이드', icon: '🏆' },
        { id: 'UnionRaid', label: '유니온레이드', icon: '⚔️' },
        { id: 'PVP', label: 'PVP', icon: '🛡️' }
    ] as const;

    return (
        <div className="space-y-8 animate-fadeIn text-white">
            <NikkeSelector
                isOpen={selectorOpen}
                onClose={() => setSelectorOpen(false)}
                onSelect={(n) => {
                    const newTeam = [...selectedTeam];
                    newTeam[activeSlot] = { id: n.id, name: n.name, isGuest: false };
                    setSelectedTeam(newTeam);
                }}
                allNikkes={allNikkes}
            />

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
                                className="flex-1 aspect-[3/4] bg-gray-800 border-2 border-dashed border-gray-600 hover:border-white rounded-lg cursor-pointer flex flex-col items-center justify-center relative group transition-all"
                                onClick={() => { setActiveSlot(idx); setSelectorOpen(true); }}
                            >
                                {member ? (
                                    <>
                                        {info?.burst && (
                                            <div className={`absolute top-1 left-1 w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center text-[10px] font-bold z-10
                                                ${info.burst === 'I' ? 'bg-pink-600' : info.burst === 'II' ? 'bg-blue-600' : info.burst === 'III' ? 'bg-red-600' : 'bg-red-500'}`}>
                                                {info.burst}
                                            </div>
                                        )}
                                        <div className="text-center p-1 w-full">
                                            <div className="text-xs md:text-sm font-bold truncate px-1">{member.name}</div>
                                            {member.isGuest && <div className="text-[9px] text-purple-400">META</div>}
                                        </div>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); const n = [...selectedTeam]; n[idx] = null; setSelectedTeam(n); }}
                                            className="absolute top-1 right-1 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100"
                                        >
                                            ✕
                                        </button>
                                    </>
                                ) : (
                                    <span className="text-gray-600 text-2xl">+</span>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Controls & Result */}
                <div className="flex justify-between items-center mt-4">
                    <div className="flex gap-2">
                        <button onClick={() => setSelectedTeam(Array(5).fill(null))} className="text-xs bg-red-900/30 hover:bg-red-900/60 text-red-200 px-3 py-1.5 rounded border border-red-900/50">초기화</button>
                        <button onClick={handleSaveSquad} className="text-xs bg-blue-600 hover:bg-blue-500 px-3 py-1.5 rounded text-white flex gap-1 items-center">
                            <span>💾</span> 저장
                        </button>
                    </div>
                    <div className="text-right">
                        <div className="text-sm text-gray-400">예상 전투력</div>
                        <div className="text-xl font-bold text-yellow-500 font-mono">
                            {synergyAnalysis ? synergyAnalysis.totalCP.toLocaleString() : 0}
                        </div>
                    </div>
                </div>
                {/* Synergy Messages */}
                {synergyAnalysis && synergyAnalysis.messages.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2 justify-end">
                        {synergyAnalysis.messages.map((m, i) => (
                            <span key={i} className="text-[10px] md:text-xs bg-gray-900 px-2 py-1 rounded text-green-400 border border-green-900/50">{m}</span>
                        ))}
                    </div>
                )}

                {/* Burst Calculator View (Graphical Reference Match) */}
                <div className="mt-8 pt-6 border-t border-gray-700/50">
                    <h3 className="text-xs font-bold text-gray-400 mb-6 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="text-orange-500">⚡</span> 버스트 수급량 정밀 시뮬레이션
                        </div>
                        <span className="text-[10px] text-gray-500 font-normal">* 이미지 데이터 기반</span>
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
                                    <div className="text-[11px] font-bold text-gray-400 mb-1 leading-none">
                                        {data.hitsMin}-{data.hitsMax}
                                    </div>

                                    {/* Bonus Range Row */}
                                    <div className={`text-[10px] font-medium leading-none ${isReady ? colors.text : 'text-gray-600'}`}>
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

                    <div className="mt-6 flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                        {selectedTeam.map((member, i) => {
                            if (!member) return null;
                            const info = getNikkeInfo(member.name);
                            return (
                                <div key={i} className="flex-shrink-0 w-20 flex flex-col items-center">
                                    <div className="w-16 h-16 rounded-lg bg-gray-800 border border-gray-700 overflow-hidden relative group">
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                                        <div className="absolute bottom-1 left-1 right-1 text-[9px] font-black truncate text-center text-white">
                                            {member.name.split('(')[0]}
                                        </div>
                                        <div className={`absolute top-0 right-0 w-6 h-6 flex items-center justify-center text-[10px] font-black rounded-bl-lg text-white shadow-lg
                                            ${info?.burst === 'I' ? 'bg-pink-600' : info?.burst === 'II' ? 'bg-blue-600' : 'bg-red-600'}`}>
                                            {info?.burst}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* My Squads */}
            {savedTeams.length > 0 && (
                <div>
                    <h3 className="text-sm font-bold text-gray-400 mb-2 flex items-center gap-2">
                        💾 나만의 조합
                        <span className="bg-red-900 text-red-200 text-[10px] px-1.5 py-0.5 rounded-full animate-pulse">NEW</span>
                    </h3>
                    <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
                        {savedTeams.map(st => (
                            <div key={st.id} className="flex-shrink-0 bg-gray-800 p-3 rounded border border-gray-700 w-48 relative group">
                                <div className="text-xs font-bold mb-1 truncate">{st.name}</div>
                                <div className="text-[10px] text-gray-500 mb-2">{st.date}</div>
                                <div className="flex gap-1 mb-2">
                                    {st.members.slice(0, 3).map((m, i) => (<div key={i} className={`w-4 h-4 rounded-full ${m ? 'bg-green-600' : 'bg-gray-600'}`} />))}
                                    {st.members.length > 3 && <span className="text-[10px] text-gray-500">...</span>}
                                </div>
                                <button onClick={() => loadTeam(st.members.map(m => m?.name || ''))} className="w-full text-xs bg-gray-700 hover:bg-gray-600 py-1 rounded">불러오기</button>
                                <button onClick={() => handleDeleteSquad(st.id)} className="absolute top-2 right-2 text-gray-600 hover:text-red-400 hidden group-hover:block">✕</button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Merged Recommendation / Meta List */}
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-4">
                    <h3 className="text-lg font-bold text-blue-400">
                        🏆 2025 메타 & 추천 조합
                    </h3>
                    {/* Category Tabs */}
                    <div className="flex gap-1 overflow-x-auto pb-1 no-scrollbar">
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setFilterCategory(cat.id)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5
                                    ${filterCategory === cat.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
                            >
                                <span>{cat.icon}</span>
                                {cat.label}
                            </button>
                        ))}
                    </div>
                </div>

                {Object.entries(categorizedTeams)
                    .filter(([category]) => filterCategory === 'All' || filterCategory === category)
                    .map(([category, teams]) => {
                        if (teams.length === 0) return null;

                        // Internal grouping for Anomaly by Boss
                        const subGroups: Record<string, MetaTeam[]> = {};
                        if (category === 'Anomaly') {
                            teams.forEach(t => {
                                const bossName = t.boss.split(' (')[0].replace(/ \d위.*/, '');
                                if (!subGroups[bossName]) subGroups[bossName] = [];
                                subGroups[bossName].push(t);
                            });
                        } else {
                            subGroups[category] = teams;
                        }

                        return (
                            <div key={category} className="space-y-6">
                                {Object.entries(subGroups).map(([groupName, groupTeams]) => (
                                    <div key={groupName} className="space-y-3">
                                        <h4 className="text-sm font-bold text-gray-300 bg-gray-800/50 px-3 py-1.5 rounded-l border-l-4 border-blue-500 inline-block">
                                            {category === 'PVP' ? '⚔️ Arena / PVP' :
                                                category === 'SoloRaid' ? '👹 Solo Raid' :
                                                    category === 'Anomaly' ? `👹 ${groupName}` : `🎯 ${groupName}`}
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                            {groupTeams.map((team, idx) => (
                                                <div key={idx} className="bg-gray-900 border border-gray-800 rounded-lg p-3 hover:border-blue-500/50 transition-all cursor-pointer group relative overflow-hidden"
                                                    onClick={() => loadTeam(team.members)}>
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div className="flex items-center gap-2">
                                                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm ${idx === 0 ? 'bg-yellow-600 text-white' : idx === 1 ? 'bg-gray-500 text-white' : 'bg-orange-700 text-white'}`}>
                                                                {team.boss.includes('위') ? team.boss.match(/\d위/)![0] : `${idx + 1}위`}
                                                            </span>
                                                            <span className="text-sm font-bold text-gray-200">{team.boss.replace(/ \d위.*/, '')}</span>
                                                        </div>
                                                    </div>
                                                    {team.description && <p className="text-[11px] text-gray-500 mb-2 italic">“{team.description}”</p>}
                                                    <div className="flex flex-wrap gap-1">
                                                        {team.members.map((m, mi) => (
                                                            <span key={mi} className={`text-[10px] px-2 py-0.5 rounded bg-gray-800 border ${currentNikke && m.includes(currentNikke.name) ? 'border-yellow-500 text-yellow-500' : 'border-gray-700 text-gray-400'}`}>
                                                                {m}
                                                            </span>
                                                        ))}
                                                    </div>
                                                    <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity flex justify-center border-t border-gray-800 pt-2">
                                                        <span className="text-[11px] text-blue-400 font-bold flex items-center gap-1">
                                                            <span>⚙️</span> 스쿼드 불러오기
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        );
                    })}
            </div>
        </div>
    );
}
