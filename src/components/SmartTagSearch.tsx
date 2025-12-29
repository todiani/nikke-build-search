import { useMemo } from 'react';
import type { NikkeData } from '../data/nikkes';
import { TAG_DATA } from '../data/tags';
import { searchNikkesByTags } from '../utils/nikkeDataManager';

interface TagInfo {
    and: string[];
    or: string[];
    not: string[];
}

interface SmartTagSearchProps {
    allNikkes: NikkeData[];
    onSelectNikke: (nikke: NikkeData, tagInfo: TagInfo) => void;
    onEditNikke?: (nikke: NikkeData) => void; // Added for direct editing
    tagData?: typeof TAG_DATA;
    selectedTags: TagInfo;
    onTagsChange: (tags: TagInfo) => void;
}

export default function SmartTagSearch({
    allNikkes,
    onSelectNikke,
    onEditNikke,
    tagData = TAG_DATA,
    selectedTags,
    onTagsChange
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
        onTagsChange({ and: [], or: [], not: [] });
    };

    const results = useMemo(() => {
        const start = performance.now();
        const filtered = searchNikkesByTags(allNikkes, selectedTags);
        const end = performance.now();
        
        if (selectedTags.and.length > 0 || selectedTags.or.length > 0 || selectedTags.not.length > 0) {
            console.log(`[Performance] Tag search took ${(end - start).toFixed(2)}ms for ${filtered.length} results`);
        }

        // Remove duplicates by ID to be safe
        const uniqueMap = new Map<string, NikkeData>();
        filtered.forEach(n => {
            if (!uniqueMap.has(n.id)) {
                uniqueMap.set(n.id, n);
            }
        });
        return Array.from(uniqueMap.values());
    }, [allNikkes, selectedTags]);

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
                <div className="p-4 border-b border-gray-700 bg-gray-800/50">
                    <h2 className="font-bold text-white">
                        검색 결과 <span className="text-nikke-red ml-1">{results.length}</span>
                    </h2>
                </div>
                <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-gray-600">
                    {results.length > 0 ? (
                        <div className="grid grid-cols-1 gap-3">
                            {results.map(nikke => (
                                <div
                                    key={nikke.id}
                                    className="bg-gray-800 border border-gray-700 hover:border-nikke-red p-3 rounded-lg flex justify-between items-center group relative overflow-hidden"
                                >
                                    <button
                                        onClick={() => onSelectNikke(nikke, selectedTags)}
                                        className="flex-1 text-left"
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="text-white font-bold text-sm group-hover:text-nikke-red">{nikke.name}</span>
                                            <span className="text-[9px] text-gray-600 bg-black/30 px-1 rounded font-mono">ID: {nikke.id}</span>
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">{nikke.burst}버 · {nikke.weapon} · {nikke.class}</div>
                                    </button>

                                    <div className="flex items-center gap-2">
                                        {onEditNikke && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onEditNikke(nikke);
                                                }}
                                                className="p-1.5 bg-gray-700 hover:bg-blue-900 text-gray-400 hover:text-white rounded transition-colors"
                                                title="데이터 편집"
                                            >
                                                💾
                                            </button>
                                        )}
                                        <span className="text-gray-600 group-hover:text-gray-300">→</span>
                                    </div>
                                </div>
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
