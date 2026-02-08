import { useMemo } from 'react';
import type { NikkeData } from '../data/nikkes';
import { getMasters, getNikkeStarsForCategory, starsToTierString } from '../utils/nikkeDataManager';

interface TagInfo {
    and: string[];
    or: string[];
    not: string[];
}

interface NikkeCardItemProps {
    nikke: NikkeData;
    categoryId?: string;
    onSelect?: (nikke: NikkeData) => void;
    highlightTags?: TagInfo;
}

export default function NikkeCardItem({
    nikke,
    categoryId = 'Stage',
    onSelect,
    highlightTags = { and: [], or: [], not: [] }
}: NikkeCardItemProps) {
    const masters = getMasters();
    const colors = (masters.colors || {}) as any;

    const hasSelectedTags = highlightTags.and.length > 0 || highlightTags.or.length > 0;

    const isSingleSkillMatch = useMemo(() => {
        if (!hasSelectedTags || !nikke.skills_detail) return false;

        const andTags = highlightTags.and;
        const orTags = highlightTags.or;
        const notTags = highlightTags.not;

        return (['skill1', 'skill2', 'burst'] as const).some(key => {
            const skill = (nikke.skills_detail as any)[key];
            if (!skill) return false;

            const skillTags = (skill.tags || []).map((t: string) => t.toLowerCase());
            const skillText = `${skill.name || ''} ${skill.desc || ''}`.toLowerCase();

            // 1. NOT check
            if (notTags.some(t => {
                const cleanT = t.toLowerCase().replace(/[▲▼]/g, '');
                return skillTags.includes(t.toLowerCase()) || skillText.includes(cleanT);
            })) return false;

            // 2. AND check
            const andHit = andTags.length === 0 || andTags.every(t => {
                const cleanT = t.toLowerCase().replace(/[▲▼]/g, '');
                return skillTags.includes(t.toLowerCase()) || skillText.includes(cleanT);
            });

            // 3. OR check
            const orHit = orTags.length === 0 || orTags.some(t => {
                const cleanT = t.toLowerCase().replace(/[▲▼]/g, '');
                return skillTags.includes(t.toLowerCase()) || skillText.includes(cleanT);
            });

            if (andTags.length > 0 && !andHit) return false;
            if (orTags.length > 0 && !orHit) return false;

            return andTags.length > 0 || orTags.length > 0;
        });
    }, [nikke, highlightTags, hasSelectedTags]);

    // 티어 정보 가져오기 (LATEST_TIERS 기반)
    const stars = getNikkeStarsForCategory(nikke, categoryId);

    // 티어 표시 변환 (별 -> 문자)
    const displayTier = starsToTierString(stars);

    // Fallback for names and other data
    const classNames = masters.class_names || {};
    const weaponNames = masters.weapon_names || {};

    return (
        <div
            onClick={() => onSelect?.(nikke)}
            className={`cursor-pointer transform hover:-translate-y-1 transition-all duration-300 h-full ${isSingleSkillMatch ? 'relative' : ''}`}
        >
            <div className={`border rounded-xl p-3 group h-full flex flex-col shadow-sm transition-all ${isSingleSkillMatch
                    ? 'bg-blue-900/10 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.2)]'
                    : 'bg-gray-800/50 border-gray-700 hover:border-nikke-red'
                }`}>
                <div className="flex justify-between items-start mb-2 h-[52px]">
                    <div className="flex flex-col min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-black border bg-black/40 shrink-0 ${colors.burst?.[nikke.burst] || 'border-gray-700 text-gray-400'}`}>
                                {nikke.burst}
                            </span>
                            <div className="flex items-baseline gap-1.5 min-w-0 flex-1">
                                <h3 className={`font-bold group-hover:text-nikke-red text-[13px] truncate leading-tight ${isSingleSkillMatch ? 'text-blue-300' : 'text-white'}`}>
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
                            <div className="flex items-center gap-2">
                                {nikke.extra_info ? (
                                    <span className="text-[9px] text-orange-400/80 font-bold truncate">
                                        {nikke.extra_info}
                                    </span>
                                ) : (
                                    <span className="text-[9px] text-transparent h-[13px]">placeholder</span>
                                )}
                                {isSingleSkillMatch && (
                                    <span className="text-[8px] px-1 bg-blue-600 text-white font-black rounded animate-pulse">SKILL MATCH</span>
                                )}
                            </div>
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
                        <span className={colors.class?.[nikke.class] || 'text-gray-400'}>{classNames[nikke.class] || nikke.class}</span>
                        <span className="text-gray-600">·</span>
                        <span className={colors.weapon?.[nikke.weapon] || 'text-amber-400'}>{weaponNames[nikke.weapon] || nikke.weapon}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
