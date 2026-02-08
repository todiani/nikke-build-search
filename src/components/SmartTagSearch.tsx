import { useMemo } from 'react';
import type { NikkeData } from '../data/nikkes';
import { TAG_DATA } from '../data/tags';
import { searchNikkesByTags } from '../utils/nikkeDataManager';
import SearchBar from './SearchBar';
import SearchFilters, { type SearchFiltersState } from './SearchFilters';
import NikkeCardItem from './NikkeCardItem';
import { matchKorean } from '../utils/hangul';

interface TagInfo {
    and: string[];
    or: string[];
    not: string[];
    onlySkillMatch?: boolean;
}

interface SmartTagSearchProps {
    allNikkes: NikkeData[];
    onSelectNikke: (nikke: NikkeData, tagInfo: TagInfo) => void;
    tagData?: typeof TAG_DATA;
    selectedTags: TagInfo;
    onTagsChange: (tags: TagInfo) => void;
    searchTerm: string;
    onSearchChange: (value: string) => void;
    filters: SearchFiltersState;
    onFiltersChange: (filters: SearchFiltersState) => void;
    isFilterOpen: boolean;
    onToggleFilter: () => void;
}

export default function SmartTagSearch({
    allNikkes,
    onSelectNikke,
    tagData = TAG_DATA,
    selectedTags,
    onTagsChange,
    searchTerm,
    onSearchChange,
    filters,
    onFiltersChange,
    isFilterOpen,
    onToggleFilter
}: SmartTagSearchProps) {
    const handleTagClick = (tag: string, type: 'AND' | 'OR' | 'NOT') => {
        // Remove from all lists first
        const newAnd = selectedTags.and.filter(t => t !== tag);
        const newOr = selectedTags.or.filter(t => t !== tag);
        const newNot = selectedTags.not.filter(t => t !== tag);

        if (type === 'AND' && !selectedTags.and.includes(tag)) {
            newAnd.push(tag);
        } else if (type === 'OR' && !selectedTags.or.includes(tag)) {
            newOr.push(tag);
        } else if (type === 'NOT' && !selectedTags.not.includes(tag)) {
            newNot.push(tag);
        }

        onTagsChange({ and: newAnd, or: newOr, not: newNot });
    };

    const clearTags = () => {
        onTagsChange({ and: [], or: [], not: [], onlySkillMatch: selectedTags.onlySkillMatch });
    };

    const toggleOnlySkillMatch = () => {
        onTagsChange({ ...selectedTags, onlySkillMatch: !selectedTags.onlySkillMatch });
    };

    const isMatchInSingleSkill = (nikke: NikkeData) => {
        if (!nikke.skills_detail) return false;
        const { and, or, not } = selectedTags;

        return (['skill1', 'skill2', 'burst'] as const).some(key => {
            const skill = (nikke.skills_detail as any)[key];
            if (!skill) return false;

            const skillTags = (skill.tags || []).map((t: string) => t.toLowerCase());
            const skillText = `${skill.name || ''} ${skill.desc || ''}`.toLowerCase();

            // 1. NOT check
            if (not.some(t => {
                const cleanT = t.toLowerCase().replace(/[▲▼]/g, '');
                return skillTags.includes(t.toLowerCase()) || skillText.includes(cleanT);
            })) return false;

            // 2. AND check
            const andHit = and.length === 0 || and.every(t => {
                const cleanT = t.toLowerCase().replace(/[▲▼]/g, '');
                return skillTags.includes(t.toLowerCase()) || skillText.includes(cleanT);
            });

            // 3. OR check
            const orHit = or.length === 0 || or.some(t => {
                const cleanT = t.toLowerCase().replace(/[▲▼]/g, '');
                return skillTags.includes(t.toLowerCase()) || skillText.includes(cleanT);
            });

            if (and.length > 0 && !andHit) return false;
            if (or.length > 0 && !orHit) return false;

            return and.length > 0 || or.length > 0;
        });
    };

    const results = useMemo(() => {
        const start = performance.now();
        let filtered = searchNikkesByTags(allNikkes, selectedTags);

        // 추가: 검색어 필터링 (이름/태그)
        if (searchTerm) {
            filtered = filtered.filter(n =>
                matchKorean(n.name, searchTerm) ||
                matchKorean(n.name_en, searchTerm) ||
                (n.extra_info && matchKorean(n.extra_info, searchTerm))
            );
        }

        // 추가: 상세 필터링
        if (filters.tier && filters.tier !== '') filtered = filtered.filter(n => n.tier === filters.tier);
        if (filters.company && filters.company !== '') filtered = filtered.filter(n => n.company === filters.company);
        if (filters.squad && filters.squad !== '') filtered = filtered.filter(n => n.squad === filters.squad);
        if (filters.class && filters.class !== '') filtered = filtered.filter(n => n.class === filters.class);
        if (filters.code && filters.code !== '') filtered = filtered.filter(n => n.code === filters.code);
        if (filters.burst && filters.burst !== '') filtered = filtered.filter(n => n.burst === filters.burst);
        if (filters.weapon && filters.weapon !== '') filtered = filtered.filter(n => n.weapon === filters.weapon);

        // 추가: 스킬 내 일치 필터링
        if (selectedTags.onlySkillMatch && (selectedTags.and.length > 0 || selectedTags.or.length > 0)) {
            filtered = filtered.filter(n => isMatchInSingleSkill(n));
        }

        const end = performance.now();

        if (selectedTags.and.length > 0 || selectedTags.or.length > 0 || selectedTags.not.length > 0 || searchTerm) {
            console.log(`[Performance] Search took ${(end - start).toFixed(2)}ms for ${filtered.length} results`);
        }

        // Remove duplicates by ID to be safe
        const uniqueMap = new Map<string, NikkeData>();
        filtered.forEach(n => {
            if (!uniqueMap.has(n.id)) {
                uniqueMap.set(n.id, n);
            }
        });

        // 정렬: 이름순 (또는 다른 기준)
        return Array.from(uniqueMap.values()).sort((a, b) => a.name.localeCompare(b.name, 'ko'));
    }, [allNikkes, selectedTags, searchTerm, filters]);

    return (
        <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-200px)] animate-fadeIn">
            {/* Left: Tag Cloud */}
            <div className="w-full lg:w-1/2 bg-gray-900/50 border border-gray-700 rounded-xl flex flex-col overflow-hidden">
                <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-gray-800/50">
                    <h2 className="font-bold text-white flex items-center">
                        <span className="mr-2">🏷️</span> 스마트 태그
                    </h2>
                    <button onClick={clearTags} className="text-xs px-2 py-1 bg-gray-700 text-gray-300 rounded hover:bg-gray-600">초기화</button>
                </div>

                {/* Selected Tags Summary */}
                {(selectedTags.and.length > 0 || selectedTags.or.length > 0 || selectedTags.not.length > 0) && (
                    <div className="px-4 py-3 bg-gray-800 border-b border-gray-700 flex flex-wrap gap-2">
                        {selectedTags.and.map(t => (
                            <span key={t} onClick={() => handleTagClick(t, 'AND')} className="cursor-pointer px-2 py-1 rounded bg-green-900 border border-green-600 text-green-200 text-xs flex items-center hover:bg-green-800">
                                <span className="mr-1 font-bold">AND</span> {t} <span className="ml-2 opacity-50">✕</span>
                            </span>
                        ))}
                        {selectedTags.or.map(t => (
                            <span key={t} onClick={() => handleTagClick(t, 'OR')} className="cursor-pointer px-2 py-1 rounded bg-red-900 border border-red-600 text-red-200 text-xs flex items-center hover:bg-red-800">
                                <span className="mr-1 font-bold">OR</span> {t} <span className="ml-2 opacity-50">✕</span>
                            </span>
                        ))}
                        {selectedTags.not.map(t => (
                            <span key={t} onClick={() => handleTagClick(t, 'NOT')} className="cursor-pointer px-2 py-1 rounded bg-gray-600 border border-gray-500 text-white text-xs flex items-center hover:bg-gray-500">
                                <span className="mr-1 font-bold">NOT</span> {t} <span className="ml-2 opacity-50">✕</span>
                            </span>
                        ))}
                    </div>
                )}

                {/* Help Text */}
                <div className="px-4 py-2 text-xs text-gray-400 bg-black/20 flex flex-wrap items-center justify-between border-b border-gray-800 gap-4">
                    <div className="flex gap-4">
                        <span><span className="text-white font-bold">클릭</span>: AND (초록)</span>
                        <span><span className="text-white font-bold">우클릭</span>: OR (노란)</span>
                        <span><span className="text-white font-bold">Shift+클릭</span>: NOT (빨강)</span>
                    </div>

                    <button
                        onClick={toggleOnlySkillMatch}
                        className={`flex items-center gap-2 px-3 py-1 rounded-full border transition-all ${selectedTags.onlySkillMatch
                                ? 'bg-blue-600/20 border-blue-500 text-blue-200 shadow-[0_0_10px_rgba(59,130,246,0.2)]'
                                : 'bg-gray-800 border-gray-700 text-gray-500 hover:text-gray-400'
                            }`}
                    >
                        <div className={`w-8 h-4 rounded-full relative transition-colors ${selectedTags.onlySkillMatch ? 'bg-blue-500' : 'bg-gray-600'}`}>
                            <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${selectedTags.onlySkillMatch ? 'left-[18px]' : 'left-0.5'}`}></div>
                        </div>
                        <span className="font-bold text-[11px]">단일 스킬 매칭만 보기</span>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-gray-600">
                    {Object.entries(tagData.tag_groups).map(([key, group]) => (
                        <div key={key}>
                            <h3 className="text-sm font-bold text-nikke-red mb-2">{group.display_name}</h3>
                            <div className="grid grid-cols-2 gap-2">
                                {group.tags.map(tag => {
                                    let status: 'none' | 'and' | 'or' | 'not' = 'none';
                                    if (selectedTags.and.includes(tag)) status = 'and';
                                    else if (selectedTags.or.includes(tag)) status = 'or';
                                    else if (selectedTags.not.includes(tag)) status = 'not';

                                    let btnClass = "text-xs py-2 px-3 rounded text-left transition-colors border ";
                                    if (status === 'and') btnClass += "bg-green-900/80 border-green-600 text-green-100 font-bold";
                                    else if (status === 'or') btnClass += "bg-red-900/80 border-red-600 text-red-100 font-bold";
                                    else if (status === 'not') btnClass += "bg-gray-700 border-gray-600 text-gray-400";
                                    else btnClass += "bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700 hover:text-gray-200";

                                    return (
                                        <button
                                            key={tag}
                                            className={btnClass}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                if (e.shiftKey) handleTagClick(tag, 'NOT');
                                                else handleTagClick(tag, 'AND');
                                            }}
                                            onContextMenu={(e) => {
                                                e.preventDefault();
                                                handleTagClick(tag, 'OR');
                                            }}
                                        >
                                            {status === 'and' && "✔ "}{status === 'or' && "✚ "}{status === 'not' && "✖ "}{tag}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right: Results */}
            <div className="w-full lg:w-1/2 bg-gray-900/50 border border-gray-700 rounded-xl flex flex-col overflow-hidden">
                <div className="p-4 border-b border-gray-700 bg-gray-800/50 flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                        <h2 className="font-bold text-white">
                            검색 결과 <span className="text-nikke-red ml-1">{results.length}</span>
                        </h2>
                    </div>

                    <div className="flex gap-2">
                        <div className="flex-1">
                            <SearchBar
                                value={searchTerm}
                                onChange={onSearchChange}
                                placeholder="결과 내 이름 검색..."
                            />
                        </div>
                        <SearchFilters
                            filters={filters}
                            onChange={onFiltersChange}
                            isOpen={isFilterOpen}
                            onToggle={onToggleFilter}
                        />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-gray-600">
                    {results.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {results.map(nikke => (
                                <NikkeCardItem
                                    key={nikke.id}
                                    nikke={nikke}
                                    onSelect={(n) => onSelectNikke(n, selectedTags)}
                                    highlightTags={selectedTags}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-gray-500 opacity-50">
                            <div className="text-4xl mb-4">🔍</div>
                            <p>태그를 선택하여 검색하세요</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
