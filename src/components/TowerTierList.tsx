import { useState } from 'react';
import { CORPORATE_TOWER_DATA, ATTRIBUTE_TOWER_DATA } from '../data/tower_data';
import type { NikkeData } from '../data/nikkes';

interface TowerTierListProps {
    allNikkes: NikkeData[];
    onSelectNikke?: (nikke: NikkeData) => void;
}

export default function TowerTierList({ allNikkes, onSelectNikke }: TowerTierListProps) {
    const [activeTab, setActiveTab] = useState<'corporate' | 'attribute'>('corporate');
    const [subTab, setSubTab] = useState<number>(0);

    const findNikke = (name: string) => {
        const cleanName = name.split('(')[0].trim().replace(/\s/g, '');
        return allNikkes.find(n => {
            const dbName = n.name.replace(/\s/g, '');
            return dbName.includes(cleanName) || dbName === cleanName;
        });
    };

    const NikkeItem = ({ name, alternatives, tier, burst, role, note }: any) => {
        const nikke = findNikke(name);
        const isValid = !!nikke;

        return (
            <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-4 hover:border-blue-500/50 transition-all group">
                <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                        <span className={`text-xs font-black px-2 py-0.5 rounded ${tier === '0' ? 'bg-red-600 text-white' :
                            tier === '1' ? 'bg-orange-600 text-white' :
                                'bg-gray-600 text-gray-200'
                            }`}>
                            T{tier}
                        </span>
                        {burst && (
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${burst.includes('B1') ? 'border-pink-500 text-pink-500' :
                                burst.includes('B2') ? 'border-blue-500 text-blue-500' :
                                    'border-red-500 text-red-500'
                                }`}>
                                {burst}
                            </span>
                        )}
                        <span className="text-xs text-gray-400 font-medium">{role}</span>
                    </div>
                    {isValid && onSelectNikke && (
                        <button
                            onClick={() => onSelectNikke(nikke)}
                            className="text-[10px] bg-blue-600/20 text-blue-400 border border-blue-600/30 px-2 py-0.5 rounded hover:bg-blue-600 hover:text-white transition-all"
                        >
                            상세보기
                        </button>
                    )}
                </div>

                <div className="mb-3">
                    <h4 className={`text-xl font-black mb-1 ${isValid ? 'text-white' : 'text-gray-500'}`}>
                        {name}
                        {!isValid && <span className="text-[10px] ml-2 font-normal text-red-500/50">(미검증)</span>}
                    </h4>
                    <p className="text-xs text-blue-400 font-medium">{note}</p>
                </div>

                {alternatives && alternatives.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2 pt-2 border-t border-gray-700/30">
                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Alt:</span>
                        {alternatives.map((alt: string, i: number) => (
                            <span key={i} className="text-[10px] text-gray-400 bg-gray-900/50 px-2 py-0.5 rounded border border-gray-800">
                                {alt}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="flex p-1 bg-gray-900/50 rounded-xl border border-gray-800 max-w-sm">
                <button
                    onClick={() => { setActiveTab('corporate'); setSubTab(0); }}
                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'corporate' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                >
                    🏢 기업 타워
                </button>
                <button
                    onClick={() => { setActiveTab('attribute'); setSubTab(0); }}
                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'attribute' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                >
                    🎨 트라이브 타워
                </button>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                {activeTab === 'corporate' ? (
                    CORPORATE_TOWER_DATA.map((tower, idx) => (
                        <button
                            key={tower.name}
                            onClick={() => setSubTab(idx)}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${subTab === idx ? 'bg-gray-700 text-white' : 'bg-gray-800/50 text-gray-500 hover:bg-gray-800'}`}
                        >
                            {tower.name}
                        </button>
                    ))
                ) : (
                    ATTRIBUTE_TOWER_DATA.map((tower, idx) => (
                        <button
                            key={tower.name}
                            onClick={() => setSubTab(idx)}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${subTab === idx ? 'bg-gray-700 text-white' : 'bg-gray-800/50 text-gray-500 hover:bg-gray-800'}`}
                        >
                            {tower.name}
                        </button>
                    ))
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeTab === 'corporate' ? (
                    CORPORATE_TOWER_DATA[subTab].nikkes.map((n, i) => (
                        <NikkeItem key={i} {...n} />
                    ))
                ) : (
                    ATTRIBUTE_TOWER_DATA[subTab].nikkes.map((n, i) => (
                        <NikkeItem key={i} {...n} />
                    ))
                )}
            </div>

            <div className="bg-blue-900/10 border border-blue-900/30 p-4 rounded-xl text-[11px] text-blue-300/80 leading-relaxed">
                <p className="font-black text-blue-400 mb-1">📌 팁</p>
                {activeTab === 'corporate' ? (
                    <ul className="list-disc list-inside space-y-1">
                        <li>해당 제조사 니케만 사용 가능</li>
                        <li>B1(20초 쿨감), B2(탱킹), B3(딜러) 버스트 사이클이 핵심</li>
                        <li>0티어 4~5명 보유하면 상위권 진입 가능</li>
                    </ul>
                ) : (
                    <ul className="list-disc list-inside space-y-1">
                        <li>속성별 특화 니케를 우선적으로 사용</li>
                        <li>0티어 + 1~2티어 조합이면 중상위권 유지 가능</li>
                        <li>보스 약점 속성에 따라 덱 구성 변경 필수</li>
                    </ul>
                )}
            </div>
        </div>
    );
}
