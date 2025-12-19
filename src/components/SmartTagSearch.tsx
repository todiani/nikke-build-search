import { useMemo } from 'react';
import type { NikkeData } from '../data/nikkes';
import { TAG_DATA } from '../data/tags';

interface TagInfo {
    and: string[];
    or: string[];
    not: string[];
}

interface SmartTagSearchProps {
    allNikkes: NikkeData[];
    onSelectNikke: (nikke: NikkeData, tagInfo: TagInfo) => void;
    tagData?: typeof TAG_DATA;
    selectedTags: TagInfo;
    onTagsChange: (tags: TagInfo) => void;
}

export default function SmartTagSearch({ allNikkes, onSelectNikke, tagData = TAG_DATA, selectedTags, onTagsChange }: SmartTagSearchProps) {
    // Use controlled state from parent
    const selectedTagsAnd = selectedTags.and;
    const selectedTagsOr = selectedTags.or;
    const selectedTagsNot = selectedTags.not;

    const handleTagClick = (tag: string, type: 'AND' | 'OR' | 'NOT') => {
        // Remove from all lists first
        const newAnd = selectedTagsAnd.filter(t => t !== tag);
        const newOr = selectedTagsOr.filter(t => t !== tag);
        const newNot = selectedTagsNot.filter(t => t !== tag);

        if (type === 'AND' && !selectedTagsAnd.includes(tag)) {
            newAnd.push(tag);
        } else if (type === 'OR' && !selectedTagsOr.includes(tag)) {
            newOr.push(tag);
        } else if (type === 'NOT' && !selectedTagsNot.includes(tag)) {
            newNot.push(tag);
        }

        onTagsChange({ and: newAnd, or: newOr, not: newNot });
    };

    const clearTags = () => {
        onTagsChange({ and: [], or: [], not: [] });
    };

    const performFilter = (nikke: NikkeData) => {
        // Collect all tags from the Nikke's skills
        const nikkeTags = new Set<string>();
        if (nikke.skills_detail) {
            ['skill1', 'skill2', 'burst'].forEach(s => {
                // @ts-ignore - dynamic access
                const skill = nikke.skills_detail[s];
                if (skill && skill.tags) {
                    skill.tags.forEach((t: string) => nikkeTags.add(t));
                }
            });
        }

        // Also fallback to text search if no detailed tags (for legacy/merged-only items)
        const text = JSON.stringify(nikke).toLowerCase();

        // AND check
        for (const tag of selectedTagsAnd) {
            if (nikkeTags.has(tag)) continue; // Perfect match
            if (!text.includes(tag.toLowerCase())) return false; // Text fallback
        }

        // OR check
        if (selectedTagsOr.length > 0) {
            let hit = false;
            for (const tag of selectedTagsOr) {
                if (nikkeTags.has(tag)) { hit = true; break; }
                if (text.includes(tag.toLowerCase())) { hit = true; break; }
            }
            if (!hit) return false;
        }

        // NOT check
        for (const tag of selectedTagsNot) {
            if (nikkeTags.has(tag)) return false;
            if (text.includes(tag.toLowerCase())) return false;
        }
        return true;
    };

    const results = useMemo(() => {
        if (selectedTagsAnd.length === 0 && selectedTagsOr.length === 0 && selectedTagsNot.length === 0) {
            return [];
        }
        return allNikkes.filter(performFilter);
    }, [allNikkes, selectedTagsAnd, selectedTagsOr, selectedTagsNot]);

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
                {(selectedTagsAnd.length > 0 || selectedTagsOr.length > 0 || selectedTagsNot.length > 0) && (
                    <div className="px-4 py-3 bg-gray-800 border-b border-gray-700 flex flex-wrap gap-2">
                        {selectedTagsAnd.map(t => (
                            <span key={t} onClick={() => handleTagClick(t, 'AND')} className="cursor-pointer px-2 py-1 rounded bg-green-900 border border-green-600 text-green-200 text-xs flex items-center hover:bg-green-800">
                                <span className="mr-1 font-bold">AND</span> {t} <span className="ml-2 opacity-50">✕</span>
                            </span>
                        ))}
                        {selectedTagsOr.map(t => (
                            <span key={t} onClick={() => handleTagClick(t, 'OR')} className="cursor-pointer px-2 py-1 rounded bg-red-900 border border-red-600 text-red-200 text-xs flex items-center hover:bg-red-800">
                                <span className="mr-1 font-bold">OR</span> {t} <span className="ml-2 opacity-50">✕</span>
                            </span>
                        ))}
                        {selectedTagsNot.map(t => (
                            <span key={t} onClick={() => handleTagClick(t, 'NOT')} className="cursor-pointer px-2 py-1 rounded bg-gray-600 border border-gray-500 text-white text-xs flex items-center hover:bg-gray-500">
                                <span className="mr-1 font-bold">NOT</span> {t} <span className="ml-2 opacity-50">✕</span>
                            </span>
                        ))}
                    </div>
                )}

                {/* Help Text */}
                <div className="px-4 py-2 text-xs text-gray-400 bg-black/20 flex gap-4 border-b border-gray-800">
                    <span><span className="text-white font-bold">클릭</span>: AND (초록)</span>
                    <span><span className="text-white font-bold">우클릭</span>: OR (빨강)</span>
                    <span><span className="text-white font-bold">Shift+클릭</span>: NOT (회색)</span>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-gray-600">
                    {Object.entries(tagData.tag_groups).map(([key, group]) => (
                        <div key={key}>
                            <h3 className="text-sm font-bold text-nikke-red mb-2">{group.display_name}</h3>
                            <div className="grid grid-cols-2 gap-2">
                                {group.tags.map(tag => {
                                    let status: 'none' | 'and' | 'or' | 'not' = 'none';
                                    if (selectedTagsAnd.includes(tag)) status = 'and';
                                    else if (selectedTagsOr.includes(tag)) status = 'or';
                                    else if (selectedTagsNot.includes(tag)) status = 'not';

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
                <div className="p-4 border-b border-gray-700 bg-gray-800/50">
                    <h2 className="font-bold text-white">
                        검색 결과 <span className="text-nikke-red ml-1">{results.length}</span>
                    </h2>
                </div>
                <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-gray-600">
                    {results.length > 0 ? (
                        <div className="grid grid-cols-1 gap-3">
                            {results.map(nikke => (
                                <button
                                    key={nikke.id}
                                    onClick={() => onSelectNikke(nikke, { and: selectedTagsAnd, or: selectedTagsOr, not: selectedTagsNot })}
                                    className="bg-gray-800 border border-gray-700 hover:border-nikke-red p-3 rounded-lg text-left flex justify-between items-center group"
                                >
                                    <div>
                                        <span className="text-white font-bold text-sm group-hover:text-nikke-red">{nikke.name}</span>
                                        <div className="text-xs text-gray-500 mt-1">{nikke.burst}버 · {nikke.weapon} · {nikke.class}</div>
                                    </div>
                                    <span className="text-gray-600 group-hover:text-gray-300">→</span>
                                </button>
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
