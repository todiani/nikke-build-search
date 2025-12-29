import type { NikkeData, PartOptions, OverloadOption } from '../data/nikkes';

interface NikkeBuildEditorProps {
    data: NikkeData;
    onChange: (field: keyof NikkeData, value: any) => void;
}

export default function NikkeBuildEditor({ data, onChange }: NikkeBuildEditorProps) {
    if (!data.build) return null;

    const build = data.build;

    const handleBuildChange = (path: string, value: any) => {
        const newBuild = { ...build };
        const parts = path.split('.');
        let current: any = newBuild;
        for (let i = 0; i < parts.length - 1; i++) {
            current = current[parts[i]];
        }
        current[parts[parts.length - 1]] = value;
        onChange('build', newBuild);
    };

    const handleOverloadChange = (part: keyof typeof build.overload, optionIdx: 'option1' | 'option2' | 'option3', field: keyof OverloadOption, value: any) => {
        const newBuild = { ...build };
        const option = newBuild.overload[part][optionIdx];
        (option as any)[field] = field === 'stage' ? parseInt(value) || 0 : value;
        onChange('build', newBuild);
    };

    const overloadOptions = [
        "None",
        "공격력 증가",
        "방어력 증가",
        "최대 장탄 수 증가",
        "크리티컬 확률 증가",
        "크리티컬 대미지 증가",
        "명중률 증가",
        "차지 대미지 증가",
        "차지 속도 증가",
        "우월코드 대미지 증가"
    ];

    const renderOverloadPart = (label: string, partKey: keyof typeof build.overload) => (
        <div className="bg-black/20 p-3 rounded border border-gray-800">
            <h5 className="text-xs font-bold text-gray-400 mb-2">{label}</h5>
            <div className="space-y-2">
                {(['option1', 'option2', 'option3'] as const).map((opt) => (
                    <div key={opt} className="grid grid-cols-3 gap-2">
                        <select
                            value={build.overload[partKey][opt].type}
                            onChange={(e) => handleOverloadChange(partKey, opt, 'type', e.target.value)}
                            className="col-span-2 bg-gray-800 border border-gray-700 text-white text-xs px-2 py-1 rounded"
                        >
                            {overloadOptions.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                        <input
                            type="number"
                            min="1"
                            max="15"
                            value={build.overload[partKey][opt].stage}
                            onChange={(e) => handleOverloadChange(partKey, opt, 'stage', e.target.value)}
                            className="bg-gray-800 border border-gray-700 text-white text-xs px-2 py-1 rounded"
                            placeholder="Lv"
                        />
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* 오버로드 장비 옵션 */}
            <div className="bg-black/30 p-4 rounded-lg border border-gray-700">
                <h4 className="text-sm font-bold text-gray-400 mb-3">🛡️ 오버로드 장비 옵션</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {renderOverloadPart("머리 (Helmet)", "helmet")}
                    {renderOverloadPart("상체 (Armor)", "armor")}
                    {renderOverloadPart("장갑 (Gloves)", "gloves")}
                    {renderOverloadPart("신발 (Boots)", "boots")}
                </div>
            </div>
        </div>
    );
}
