import React from 'react';
import type { NikkeData } from '../data/nikkes';

interface NikkeOptionsEditorProps {
    data: NikkeData;
    onArrayFieldChange: (field: 'options' | 'valid_options' | 'invalid_options', value: string) => void;
}

const NikkeOptionsEditor: React.FC<NikkeOptionsEditorProps> = ({ data, onArrayFieldChange }) => {
    return (
        <div className="space-y-6">
            <h3 className="text-lg font-black text-white flex items-center gap-2">
                <span className="text-xl">🎯</span> 오버로드 옵션 설정
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="glass-panel p-5 rounded-xl border-l-4 border-l-green-500/50 bg-green-500/5">
                    <h4 className="text-sm font-bold text-green-400 mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                        추천 옵션 (Valid)
                    </h4>
                    <textarea
                        value={data?.valid_options?.join(', ') || ''}
                        onChange={e => onArrayFieldChange('valid_options', e.target.value)}
                        placeholder="공격력 증가, 우월코드 대미지 증가, 최대 장탄 수 증가..."
                        className="w-full bg-black/40 border border-white/10 text-white px-3 py-2 rounded-lg text-sm h-32 focus:ring-1 focus:ring-green-500 outline-none transition-all resize-none"
                    />
                    {data?.valid_options && data.valid_options.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3">
                            {data.valid_options.map((opt, i) => (
                                <span key={i} className="text-[10px] px-2 py-0.5 bg-green-500/20 text-green-300 rounded-md border border-green-500/20 font-bold uppercase">{opt}</span>
                            ))}
                        </div>
                    )}
                </div>

                <div className="glass-panel p-5 rounded-xl border-l-4 border-l-red-500/50 bg-red-500/5">
                    <h4 className="text-sm font-bold text-red-400 mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-500"></span>
                        비추천 옵션 (Invalid)
                    </h4>
                    <textarea
                        value={data?.invalid_options?.join(', ') || ''}
                        onChange={e => onArrayFieldChange('invalid_options', e.target.value)}
                        placeholder="방어력 증가, 차지 속도 증가 (MG의 경우)..."
                        className="w-full bg-black/40 border border-white/10 text-white px-3 py-2 rounded-lg text-sm h-32 focus:ring-1 focus:ring-red-500 outline-none transition-all resize-none"
                    />
                    {data?.invalid_options && data.invalid_options.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3">
                            {data.invalid_options.map((opt, i) => (
                                <span key={i} className="text-[10px] px-2 py-0.5 bg-red-500/20 text-red-300 rounded-md border border-red-500/20 font-bold uppercase">{opt}</span>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="glass-panel p-4 rounded-xl opacity-60 hover:opacity-100 transition-opacity">
                <h4 className="text-xs font-bold text-gray-400 mb-2">📋 간략 추천 (레거시/통합)</h4>
                <input
                    type="text"
                    value={data?.options?.join(', ') || ''}
                    onChange={e => onArrayFieldChange('options', e.target.value)}
                    placeholder="공격력, 우월코드, 장탄..."
                    className="w-full bg-black/40 border border-white/10 text-white px-3 py-2 rounded-lg text-sm focus:ring-1 focus:ring-nikke-red outline-none transition-all"
                />
            </div>
        </div>
    );
};

export default NikkeOptionsEditor;
