import { weaponNames, classNames } from '../utils/nikkeConstants';
import { getUsedMasterOptions } from '../utils/nikkeDataManager';

export interface SearchFiltersState {
    tier: string;
    company: string;
    squad: string;
    class: string;
    code: string;
    burst: string;
    weapon: string;
}

export const initialFilters: SearchFiltersState = {
    tier: '',
    company: '',
    squad: '',
    class: '',
    code: '',
    burst: '',
    weapon: ''
};

interface SearchFiltersProps {
    filters: SearchFiltersState;
    onChange: (newFilters: SearchFiltersState) => void;
    isOpen: boolean;
    onToggle: () => void;
}

export default function SearchFilters({ filters, onChange, isOpen, onToggle }: SearchFiltersProps) {
    const options = {
        tiers: getUsedMasterOptions('tiers'),
        companies: getUsedMasterOptions('companies'),
        squads: getUsedMasterOptions('squads'),
        classes: getUsedMasterOptions('classes'),
        codes: getUsedMasterOptions('codes'),
        bursts: getUsedMasterOptions('bursts'),
        weapons: getUsedMasterOptions('weapons'),
    };

    const handleChange = (field: keyof SearchFiltersState, value: string) => {
        onChange({ ...filters, [field]: value });
    };

    const activeCount = Object.values(filters).filter(Boolean).length;

    return (
        <div className="mb-6 max-w-7xl mx-auto">
            <button
                onClick={onToggle}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${isOpen || activeCount > 0
                    ? 'bg-gray-800 text-white border border-gray-600'
                    : 'bg-gray-900/50 text-gray-400 border border-gray-800 hover:bg-gray-800'
                    }`}
            >
                <span>🌪️ 상세 필터</span>
                {activeCount > 0 && (
                    <span className="px-1.5 py-0.5 bg-nikke-red text-white text-xs rounded-full font-bold">
                        {activeCount}
                    </span>
                )}
                <span className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}>▼</span>
            </button>

            {isOpen && (
                <div className="mt-3 p-4 bg-gray-900/80 border border-gray-700 rounded-xl grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 animate-fadeIn backdrop-blur-sm">
                    {/* Tier */}
                    <div>
                        <label className="text-xs text-gray-500 block mb-1">티어</label>
                        <select
                            value={filters.tier}
                            onChange={e => handleChange('tier', e.target.value)}
                            className="w-full bg-gray-800 text-white text-sm border border-gray-700 rounded px-2 py-1"
                        >
                            <option value="">전체</option>
                            {options.tiers.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                    </div>

                    {/* Company */}
                    <div>
                        <label className="text-xs text-gray-500 block mb-1">제조사</label>
                        <select
                            value={filters.company}
                            onChange={e => handleChange('company', e.target.value)}
                            className="w-full bg-gray-800 text-white text-sm border border-gray-700 rounded px-2 py-1"
                        >
                            <option value="">전체</option>
                            {options.companies.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                    </div>

                    {/* Squad */}
                    <div>
                        <label className="text-xs text-gray-500 block mb-1">스쿼드</label>
                        <select
                            value={filters.squad}
                            onChange={e => handleChange('squad', e.target.value)}
                            className="w-full bg-gray-800 text-white text-sm border border-gray-700 rounded px-2 py-1"
                        >
                            <option value="">전체</option>
                            {options.squads.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                    </div>

                    {/* Class */}
                    <div>
                        <label className="text-xs text-gray-500 block mb-1">클래스</label>
                        <select
                            value={filters.class}
                            onChange={e => handleChange('class', e.target.value)}
                            className="w-full bg-gray-800 text-white text-sm border border-gray-700 rounded px-2 py-1"
                        >
                            <option value="">전체</option>
                            {options.classes.map(o => <option key={o} value={o}>{classNames[o] || o}</option>)}
                        </select>
                    </div>

                    {/* Element (Code) */}
                    <div>
                        <label className="text-xs text-gray-500 block mb-1">속성</label>
                        <select
                            value={filters.code}
                            onChange={e => handleChange('code', e.target.value)}
                            className="w-full bg-gray-800 text-white text-sm border border-gray-700 rounded px-2 py-1"
                        >
                            <option value="">전체</option>
                            {options.codes.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                    </div>

                    {/* Burst */}
                    <div>
                        <label className="text-xs text-gray-500 block mb-1">버스트</label>
                        <select
                            value={filters.burst}
                            onChange={e => handleChange('burst', e.target.value)}
                            className="w-full bg-gray-800 text-white text-sm border border-gray-700 rounded px-2 py-1"
                        >
                            <option value="">전체</option>
                            {options.bursts.map(o => <option key={o} value={o}>{o}버스트</option>)}
                        </select>
                    </div>

                    {/* Weapon */}
                    <div>
                        <label className="text-xs text-gray-500 block mb-1">무기</label>
                        <select
                            value={filters.weapon}
                            onChange={e => handleChange('weapon', e.target.value)}
                            className="w-full bg-gray-800 text-white text-sm border border-gray-700 rounded px-2 py-1"
                        >
                            <option value="">전체</option>
                            {options.weapons.map(o => <option key={o} value={o}>{weaponNames[o] || o}</option>)}
                        </select>
                    </div>
                </div>
            )}
        </div>
    );
}
