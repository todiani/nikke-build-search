import type { NikkeData } from '../data/nikkes';
import { 
    codeTextColors, burstColors, classColors, companyColors, classNames, weaponNames, weaponColors 
} from '../utils/nikkeConstants';

interface NikkeCardProps {
    nikke: NikkeData;
    highlightTags?: string[];
}

export default function NikkeCard({ nikke, highlightTags = [] }: NikkeCardProps) {
    const tierColor = {
        'SSS': 'text-red-500 border-red-500',
        'SS': 'text-orange-400 border-orange-400',
        'S': 'text-yellow-400 border-yellow-400',
        'A': 'text-green-400 border-green-400',
        'PvP': 'text-purple-400 border-purple-400',
        'Unranked': 'text-gray-400 border-gray-400'
    }[nikke.tier] || 'text-gray-400 border-gray-400';

    // Highlight text utility
    const highlightText = (text: string): React.ReactNode => {
        if (!text || highlightTags.length === 0) return text;

        let result: React.ReactNode[] = [text];

        highlightTags.forEach(tag => {
            result = result.flatMap((part, idx) => {
                if (typeof part !== 'string') return part;
                const regex = new RegExp(`(${tag})`, 'gi');
                const parts = part.split(regex);
                return parts.map((p, i) =>
                    regex.test(p)
                        ? <mark key={`${idx}-${i}`} className="bg-yellow-500/40 text-yellow-200 px-0.5 rounded">{p}</mark>
                        : p
                );
            });
        });

        return result;
    };

    const renderSkillCard = (skillKey: 'skill1' | 'skill2' | 'burst', label: string, color: string, bgColor: string) => {
        const skill = nikke.skills_detail?.[skillKey];
        if (!skill?.name && !skill?.desc) return null;

        return (
            <div className={`p-4 rounded-lg border-l-4 ${color} ${bgColor} border border-gray-700`}>
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-white">{label}</span>
                    {skill?.name && <span className="text-xs text-gray-400">{skill.name}</span>}
                </div>
                {skill?.desc && (
                    <p className="text-sm text-gray-300 leading-relaxed mb-3">
                        {highlightText(skill.desc)}
                    </p>
                )}
                {skill?.tags && skill.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                        {skill.tags.map((tag, i) => {
                            const isHighlighted = highlightTags.some(ht => tag.toLowerCase().includes(ht.toLowerCase()));
                            return (
                                <span
                                    key={i}
                                    className={`text-[10px] px-2 py-0.5 rounded ${isHighlighted
                                            ? 'bg-yellow-500/30 text-yellow-200 border border-yellow-500/50'
                                            : 'bg-gray-700 text-gray-300'
                                        }`}
                                >
                                    {tag}
                                </span>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="bg-nikke-card border border-gray-700 rounded-xl overflow-hidden">
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-gray-800 to-gray-900 border-b border-gray-700">
                <div className="flex justify-between items-start">
                    <div className="flex flex-col min-w-0 flex-1">
                        <div className="flex items-baseline gap-2 flex-wrap">
                            <h3 className="text-2xl font-bold text-white truncate">{nikke.name}</h3>
                            {nikke.name_en && (
                                <span className="text-sm text-blue-400 font-bold truncate">
                                    {nikke.name_en}
                                </span>
                            )}
                        </div>
                        {nikke.extra_info && (
                            <span className="text-[13px] text-orange-400 font-bold mt-1">
                                {nikke.extra_info}
                            </span>
                        )}
                    </div>
                    <div className={`px-3 py-1 rounded bg-black/50 border ${tierColor} font-bold ml-2 shrink-0`}>
                        {nikke.tier}
                    </div>
                </div>
                <div className="flex flex-wrap gap-x-2 gap-y-1 mt-3 text-xs font-bold items-center">
                    <span className={companyColors[nikke.company || ''] || 'text-gray-500'}>{nikke.company || '제조사 미정'}</span>
                    <span className="text-gray-600">|</span>
                    <span className="text-gray-400">{nikke.squad || '스쿼드 미정'}</span>
                    <span className="text-gray-600">·</span>
                    <span className={burstColors[nikke.burst] || 'text-gray-400'}>{nikke.burst}버</span>
                    <span className="text-gray-600">·</span>
                    <span className={codeTextColors[nikke.code || ''] || 'text-gray-400'}>{nikke.code}</span>
                    <span className="text-gray-600">·</span>
                    <span className={classColors[nikke.class] || 'text-gray-400'}>{classNames[nikke.class] || nikke.class}</span>
                    <span className="text-gray-600">·</span>
                    <span className={weaponColors[nikke.weapon] || 'text-amber-400'}>{weaponNames[nikke.weapon] || nikke.weapon}</span>
                </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
                {/* Highlight Tags Banner */}
                {highlightTags.length > 0 && (
                    <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-3">
                        <div className="text-xs text-yellow-400 mb-1">🏷️ 하이라이트 태그</div>
                        <div className="flex flex-wrap gap-1">
                            {highlightTags.map((tag, i) => (
                                <span key={i} className="text-xs px-2 py-0.5 bg-yellow-500/30 text-yellow-200 rounded">{tag}</span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Description */}
                {nikke.desc && (
                    <div className="bg-black/30 p-4 rounded-lg border border-gray-700">
                        <h4 className="text-xs font-bold text-gray-400 mb-2">📝 설명</h4>
                        <p className="text-sm text-gray-300">{nikke.desc}</p>
                    </div>
                )}

                {/* Skill Build */}
                {nikke.skills && (nikke.skills.min || nikke.skills.efficient || nikke.skills.max) && (
                    <div className="bg-black/30 p-4 rounded-lg border border-gray-700">
                        <h4 className="text-xs font-bold text-gray-400 mb-3">⚡ 스킬 레벨 (1/2/B)</h4>
                        <div className="grid grid-cols-3 gap-3">
                            <div className="text-center">
                                <div className="text-xs text-gray-500 mb-1">최소</div>
                                <div className="text-lg font-mono text-gray-300">{nikke.skills.min || '-'}</div>
                            </div>
                            <div className="text-center bg-green-900/20 rounded-lg p-2 border border-green-700/50">
                                <div className="text-xs text-green-400 mb-1">추천</div>
                                <div className="text-lg font-mono font-bold text-green-300">{nikke.skills.efficient || '-'}</div>
                            </div>
                            <div className="text-center">
                                <div className="text-xs text-gray-500 mb-1">종결</div>
                                <div className="text-lg font-mono text-gray-300">{nikke.skills.max || '-'}</div>
                            </div>
                        </div>
                        {nikke.skill_priority && (
                            <div className="mt-3 text-xs text-gray-400">
                                <span className="text-gray-500">우선순위:</span> {nikke.skill_priority}
                            </div>
                        )}
                    </div>
                )}

                {/* Skills Detail */}
                {nikke.skills_detail && (
                    <div className="space-y-3">
                        <h4 className="text-xs font-bold text-gray-400">📜 스킬 상세</h4>
                        {renderSkillCard('skill1', '1스킬', 'border-l-green-600', 'bg-green-900/10')}
                        {renderSkillCard('skill2', '2스킬', 'border-l-blue-600', 'bg-blue-900/10')}
                        {renderSkillCard('burst', '버스트', 'border-l-purple-600', 'bg-purple-900/10')}
                    </div>
                )}

                {/* Options */}
                {((nikke.valid_options && nikke.valid_options.length > 0) ||
                    (nikke.invalid_options && nikke.invalid_options.length > 0) ||
                    (nikke.options && nikke.options.length > 0)) && (
                        <div className="bg-black/30 p-4 rounded-lg border border-gray-700">
                            <h4 className="text-xs font-bold text-gray-400 mb-3">🎯 오버로드 옵션</h4>

                            {nikke.valid_options && nikke.valid_options.length > 0 && (
                                <div className="mb-3">
                                    <div className="text-xs text-green-400 mb-1">✓ 추천</div>
                                    <div className="flex flex-wrap gap-1">
                                        {nikke.valid_options.map((opt, i) => (
                                            <span key={i} className="text-xs px-2 py-1 bg-green-900/50 text-green-300 rounded border border-green-700/50">{opt}</span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {nikke.invalid_options && nikke.invalid_options.length > 0 && (
                                <div className="mb-3">
                                    <div className="text-xs text-red-400 mb-1">✗ 비추천</div>
                                    <div className="flex flex-wrap gap-1">
                                        {nikke.invalid_options.map((opt, i) => (
                                            <span key={i} className="text-xs px-2 py-1 bg-red-900/50 text-red-300 rounded border border-red-700/50">{opt}</span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {nikke.options && nikke.options.length > 0 && !nikke.valid_options?.length && (
                                <div>
                                    <div className="text-xs text-gray-400 mb-1">📋 추천 옵션</div>
                                    <div className="flex flex-wrap gap-1">
                                        {nikke.options.map((opt, i) => (
                                            <span key={i} className="text-xs px-2 py-1 bg-blue-900/50 text-blue-300 rounded border border-blue-700/50">{opt}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
            </div>
        </div>
    );
}
