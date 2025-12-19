import type { NikkeData } from '../data/nikkes';
import {
    weaponNames, squadOptions, companyOptions, codeOptions,
    tierOptions, burstOptions, weaponOptions
} from '../utils/nikkeConstants';

interface NikkeFieldsEditorProps {
    data: NikkeData;
    onChange: (field: keyof NikkeData, value: any) => void;
    onUsageStatChange: (idx: number, field: 'stars' | 'desc', value: any) => void;
    onBurstDetailChange: (stage: "2RL" | "2_5RL" | "3RL" | "3_5RL" | "4RL", field: 'value' | 'hits' | 'bonus', val: any) => void;
}

export default function NikkeFieldsEditor({ data, onChange, onUsageStatChange, onBurstDetailChange }: NikkeFieldsEditorProps) {

    return (
        <div className="space-y-6">
            {/* 1. 기본 정보 */}
            <div className="bg-black/30 p-4 rounded-lg border border-gray-700">
                <h4 className="text-sm font-bold text-gray-400 mb-3">📛 기본 정보</h4>
                <div className="grid grid-cols-2 gap-3 mb-4">
                    <div>
                        <label className="text-xs text-gray-500 block mb-1">한글 이름</label>
                        <input type="text" value={data.name} onChange={e => onChange('name', e.target.value)}
                            className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded" />
                    </div>
                    <div>
                        <label className="text-xs text-gray-500 block mb-1">영문 이름</label>
                        <input type="text" value={data.name_en} onChange={e => onChange('name_en', e.target.value)}
                            className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded" />
                    </div>
                    <div className="col-span-2">
                        <label className="text-xs text-gray-500 block mb-1">추가 정보 (특별판 등)</label>
                        <input type="text" value={data.extra_info || ''} onChange={e => onChange('extra_info', e.target.value)}
                            placeholder="니어 오토마타, 2주년 등" className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded" />
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                        <label className="text-xs text-gray-500 block mb-1">티어</label>
                        <select value={data.tier} onChange={e => onChange('tier', e.target.value)}
                            className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded">
                            {tierOptions.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs text-gray-500 block mb-1">제조사</label>
                        <select value={data.company || ''} onChange={e => onChange('company', e.target.value)}
                            className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded">
                            <option value="">선택</option>
                            {companyOptions.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs text-gray-500 block mb-1">스쿼드</label>
                        <select value={data.squad || ''} onChange={e => onChange('squad', e.target.value)}
                            className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded">
                            <option value="">선택</option>
                            {squadOptions.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs text-gray-500 block mb-1">속성</label>
                        <select value={data.code || ''} onChange={e => onChange('code', e.target.value)}
                            className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded">
                            <option value="">선택</option>
                            {codeOptions.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs text-gray-500 block mb-1">클래스</label>
                        <select value={data.class} onChange={e => onChange('class', e.target.value)}
                            className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded">
                            <option value="Attacker">화력형</option>
                            <option value="Defender">방어형</option>
                            <option value="Supporter">지원형</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-xs text-gray-500 block mb-1">버스트</label>
                        <select value={data.burst} onChange={e => onChange('burst', e.target.value)}
                            className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded">
                            {burstOptions.map(t => <option key={t} value={t}>버스트 {t}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs text-gray-500 block mb-1">무기</label>
                        <select value={data.weapon} onChange={e => onChange('weapon', e.target.value)}
                            className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded">
                            {weaponOptions.map(t => <option key={t} value={t}>{weaponNames[t]}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs text-gray-500 block mb-1">스킬 우선순위</label>
                        <input type="text" value={data.skill_priority || ''} onChange={e => onChange('skill_priority', e.target.value)}
                            placeholder="예: 7/7/7" className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded" />
                    </div>
                </div>
            </div>

            {/* 2. 주요 사용 콘텐츠 */}
            <div className="bg-black/30 p-4 rounded-lg border border-gray-700">
                <h4 className="text-sm font-bold text-gray-400 mb-3">📍 주요 사용 콘텐츠 및 총평</h4>

                <div className="mb-4">
                    <label className="text-xs text-gray-500 block mb-1">💡 활용 가이드 / 총평 (작열코드 우월 등 상세 설명)</label>
                    <textarea
                        value={data.desc || ''}
                        onChange={e => onChange('desc', e.target.value)}
                        placeholder="예: 작열코드가 우월코드인 보스 콘텐츠에서 사용하며..."
                        className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded h-24 resize-none text-sm leading-relaxed"
                    />
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left text-gray-300">
                        <thead className="bg-gray-800 text-gray-400">
                            <tr>
                                <th className="px-3 py-2 border border-gray-700">콘텐츠명</th>
                                <th className="px-3 py-2 border border-gray-700 text-center w-32">추천도 (별점)</th>
                                <th className="px-3 py-2 border border-gray-700">콘텐츠별 상세 설명</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(data.usage_stats || []).map((stat, idx) => (
                                <tr key={idx} className="border-b border-gray-800">
                                    <td className="px-3 py-2 border border-gray-700 font-bold bg-black/20">{stat.name}</td>
                                    <td className="px-3 py-2 border border-gray-700 text-center">
                                        <div className="flex justify-center gap-0.5">
                                            {[1, 2, 3, 4, 5].map(s => (
                                                <button
                                                    key={s}
                                                    type="button"
                                                    onClick={() => onUsageStatChange(idx, 'stars', stat.stars === s ? 0 : s)}
                                                    className={`text-base transition-colors ${s <= stat.stars ? 'text-yellow-500' : 'text-gray-700 hover:text-gray-500'}`}
                                                >
                                                    ★
                                                </button>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-3 py-2 border border-gray-700 text-gray-400">
                                        <input type="text" value={stat.desc} onChange={e => onUsageStatChange(idx, 'desc', e.target.value)}
                                            placeholder="상세 설명 입력..."
                                            className="w-full bg-gray-800 border border-transparent focus:border-gray-600 rounded px-2 py-0.5 outline-none transition-colors" />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* 3. 버스트 수급량 상세 */}
            <div className="bg-black/30 p-4 rounded-lg border border-gray-700">
                <h4 className="text-sm font-bold text-gray-400 mb-3">⚡ RL 단계별 버스트 수급량 (정밀 데이터)</h4>
                <div className="flex bg-black/40 rounded-lg overflow-hidden border border-gray-800">
                    {(["2RL", "2_5RL", "3RL", "3_5RL", "4RL"] as const).map((stage, idx) => {
                        const stageData = data.burst_details?.[stage] || { value: 0, hits: '', bonus: '' };
                        const colors = {
                            '2RL': 'text-green-400', '2_5RL': 'text-green-500',
                            '3RL': 'text-white', '3_5RL': 'text-orange-400', '4RL': 'text-orange-500'
                        }[stage];

                        return (
                            <div key={stage} className={`flex-1 flex flex-col items-center py-3 px-1 border-gray-800 ${idx !== 4 ? 'border-r' : ''}`}>
                                <div className={`text-[10px] font-black mb-1 ${colors}`}>{stage.replace('_', '.')}</div>
                                <div className="space-y-1.5 w-full px-1">
                                    <div className="flex items-center gap-1">
                                        <input type="number" step="0.1" value={stageData.value}
                                            onChange={e => onBurstDetailChange(stage, 'value', e.target.value)}
                                            className="w-full bg-gray-900 border border-gray-700 text-[10px] text-center rounded px-0.5 text-white" />
                                        <span className="text-[9px] text-gray-600">%</span>
                                    </div>
                                    <input type="text" value={stageData.hits || ''} placeholder="hits"
                                        onChange={e => onBurstDetailChange(stage, 'hits', e.target.value)}
                                        className="w-full bg-gray-900 border border-gray-700 text-[9px] text-center rounded px-0.5 text-gray-400" />
                                    <input type="text" value={stageData.bonus || ''} placeholder="bonus"
                                        onChange={e => onBurstDetailChange(stage, 'bonus', e.target.value)}
                                        className="w-full bg-gray-900 border border-gray-700 text-[9px] text-center rounded px-0.5 text-gray-400" />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

        </div>
    );
}
