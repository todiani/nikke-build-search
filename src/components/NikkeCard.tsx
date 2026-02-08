import { getMasters } from '../utils/nikkeDataManager';
import type { NikkeData } from '../data/nikkes';

interface NikkeCardProps {
    nikke: NikkeData;
    highlightTags?: string[];
}

export default function NikkeCard({ nikke, highlightTags = [] }: NikkeCardProps) {
    const masters = getMasters();
    const colors = (masters.colors || {}) as any;

    const tierColor = colors.tier?.[nikke.tier] || 'text-gray-400 border-gray-400';

    const highlightText = (text: string, tags: string[]) => {
        if (!text) return '';
        if (!tags || tags.length === 0) return text;

        let highlighted = text;
        tags.forEach(tag => {
            if (!tag) return;
            const escapedTag = tag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(`(${escapedTag})`, 'gi');
            highlighted = highlighted.replace(regex, '<span class="highlight-tag">$1</span>');
        });
        return <div dangerouslySetInnerHTML={{ __html: highlighted }} />;
    };

    const renderSkillCard = (skill: any, label: string, color: string) => (
        <div className={`p-3 rounded-lg border border-gray-700/50 bg-black/20 hover:bg-black/40 transition-colors`}>
            <div className="flex justify-between items-center mb-1">
                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded border ${color}`}>{label}</span>
                <span className="text-xs font-bold text-gray-200">{skill.name || '미설정'}</span>
            </div>
            <div className="text-[11px] text-gray-400 leading-relaxed min-h-[3em]">
                {highlightText(skill.desc, highlightTags)}
            </div>
            {skill.tags && skill.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2 pt-2 border-t border-gray-800/50">
                    {skill.tags.map((tag: string, i: number) => {
                        const isHighlighted = highlightTags.some(ht => ht.toLowerCase() === tag.toLowerCase());
                        return (
                            <span key={i} className={`text-[9px] px-1.5 py-0.5 rounded-full ${isHighlighted ? 'bg-nikke-red/20 text-nikke-red border border-nikke-red/30' : 'bg-gray-800 text-gray-500 border border-gray-700'}`}>
                                {tag}
                            </span>
                        );
                    })}
                </div>
            )}
        </div>
    );

    return (
        <div className="premium-card overflow-hidden group">
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-gray-800/80 to-gray-900/80 border-b border-white/5 group-hover:from-gray-800 group-hover:to-gray-900 transition-colors duration-500">
                <div className="flex justify-between items-start">
                    <div className="flex flex-col min-w-0 flex-1">
                        <div className="flex items-baseline gap-2 flex-wrap">
                            <h3 className="text-lg font-black text-white group-hover:text-nikke-red transition-colors">{nikke.name}</h3>
                            {nikke.name_en && <span className="text-[10px] text-gray-500 font-medium tracking-wider">{nikke.name_en}</span>}
                        </div>
                        <div className="flex flex-wrap gap-2 mt-1">
                            {nikke.company && (
                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-sm border ${colors.company?.[nikke.company] || 'text-gray-400 border-gray-700'}`}>
                                    {nikke.company}
                                </span>
                            )}
                            {nikke.squad && (
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-sm border border-gray-700 text-gray-500">
                                    {nikke.squad}
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                        <span className={`text-xs font-black px-2 py-0.5 rounded border bg-black/30 backdrop-blur-sm ${tierColor}`}>
                            {nikke.tier}
                        </span>
                        <div className="flex gap-1">
                            <span className={`text-[12px] px-2 py-0.5 rounded font-black border bg-black/40 ${colors.burst?.[nikke.burst] || 'border-gray-700 text-gray-400'}`}>
                                {nikke.burst}
                            </span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-sm border ${colors.class?.[nikke.class] || 'border-gray-700'}`}>
                                {nikke.class === 'Attacker' ? 'ATK' : nikke.class === 'Supporter' ? 'SUP' : 'DEF'}
                            </span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-sm border ${colors.weapon?.[nikke.weapon] || 'border-gray-700'}`}>
                                {nikke.weapon}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-4 space-y-4">
                {/* Skill Levels Summary */}
                <div className="grid grid-cols-3 gap-2">
                    {['min', 'efficient', 'max'].map((lvl) => (
                        <div key={lvl} className="bg-gray-800/30 p-2 rounded border border-gray-700/30 text-center">
                            <span className="text-[9px] text-gray-500 block uppercase font-bold">{lvl}</span>
                            <span className={`text-xs font-black ${(nikke.skills as any)[lvl] ? 'text-white' : 'text-gray-700'}`}>
                                {(nikke.skills as any)[lvl] || '?-?-?'}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Overload Summary */}
                {((nikke.valid_options && nikke.valid_options.length > 0) || (nikke.options && nikke.options.length > 0)) && (
                    <div className="bg-black/20 p-3 rounded-lg border border-gray-800/50">
                        <h4 className="text-[10px] font-black text-nikke-red mb-2 uppercase tracking-widest">Recommended Options</h4>
                        <div className="flex flex-wrap gap-1">
                            {nikke.valid_options && nikke.valid_options.map((opt, i) => (
                                <span key={i} className="text-[9px] px-2 py-0.5 bg-nikke-red/10 text-nikke-red rounded-full border border-nikke-red/20">
                                    {opt}
                                </span>
                            ))}
                            {!nikke.valid_options && nikke.options && nikke.options.map((opt, i) => (
                                <span key={i} className="text-[9px] px-2 py-0.5 bg-gray-800 text-gray-400 rounded-full border border-gray-700">
                                    {opt}
                                </span>
                            ))}
                        </div>
                        {nikke.invalid_options && nikke.invalid_options.length > 0 && (
                            <div className="mt-2 pt-2 border-t border-gray-800/30">
                                <span className="text-[8px] font-bold text-gray-600 uppercase mb-1 block">Avoid:</span>
                                <div className="flex flex-wrap gap-1">
                                    {nikke.invalid_options.map((opt, i) => (
                                        <span key={i} className="text-[9px] px-2 py-0.5 bg-gray-900 text-gray-600 rounded-full italic">
                                            {opt}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Skills Details */}
                {nikke.skills_detail && (
                    <div className="space-y-2">
                        {nikke.skills_detail.skill1 && renderSkillCard(nikke.skills_detail.skill1, 'Skill 1', 'text-green-500 border-green-900/50')}
                        {nikke.skills_detail.skill2 && renderSkillCard(nikke.skills_detail.skill2, 'Skill 2', 'text-blue-500 border-blue-900/50')}
                        {nikke.skills_detail.burst && renderSkillCard(nikke.skills_detail.burst, 'Burst', 'text-purple-500 border-purple-900/50')}
                    </div>
                )}
            </div>

            <div className="px-4 pb-4">
                <div className="flex items-center gap-2 group/code">
                    <span className={`w-2 h-2 rounded-full ${colors.code?.[nikke.code] || 'bg-gray-700'}`}></span>
                    <span className={`text-[11px] font-bold ${colors.code_text?.[nikke.code] || 'text-gray-500'}`}>{nikke.code} 코드</span>
                </div>
            </div>
        </div>
    );
}
