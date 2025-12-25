import { useState, useEffect } from 'react';
import NikkeDetail from './components/NikkeDetail';
import SearchBar from './components/SearchBar';
import SmartTagSearch from './components/SmartTagSearch';
import SearchFilters, { initialFilters, type SearchFiltersState } from './components/SearchFilters';
import DataManager from './components/DataManager';
import NikkeEditor from './components/NikkeEditor';
import TagEditor from './components/TagEditor';
import TeamAnalysis from './components/TeamAnalysis'; // Import added
import type { NikkeData } from './data/nikkes';
import { matchKorean } from './utils/hangul';
import { TAG_DATA } from './data/tags';
import { initializeNikkeData, loadDB, saveNikkes, setCachedData } from './utils/nikkeDataManager';

function App() {
  const [allNikkes, setAllNikkes] = useState<NikkeData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNikke, setSelectedNikke] = useState<NikkeData | null>(null);
  const [filters, setFilters] = useState(initialFilters);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchMode, setSearchMode] = useState<'name' | 'tag' | 'team'>('name');
  const [activeSearchTags, setActiveSearchTags] = useState<{ and: string[]; or: string[]; not: string[] }>({ and: [], or: [], not: [] });
  const [customTagData, setCustomTagData] = useState(TAG_DATA);
  const [isDataManagerOpen, setIsDataManagerOpen] = useState(false);
  const [isTagEditorOpen, setIsTagEditorOpen] = useState(false);
  const [editingNikke, setEditingNikke] = useState<NikkeData | null>(null);

  // Load Data from API
  useEffect(() => {
    const init = async () => {
      console.log('[DEBUG] Starting data load...');
      const { nikkes, squads } = await loadDB();
      console.log(`[DEBUG] Loaded ${nikkes.length} nikkes and ${squads.length} squads from DB`);
      setAllNikkes(nikkes);
      console.log('[DEBUG] State updated with nikkes:', nikkes.slice(0, 3).map(n => n.name));
      // We don't need to explicitly set squads state here as SquadManager pulls it from DataManager,
      // but we ensure DataManager cache is set.
    };
    init();
  }, []);

  const handleDataUpdate = async (updatedNikkes: NikkeData[]) => {
    setAllNikkes(updatedNikkes);
    await saveNikkes(updatedNikkes);
  };

  // Update single Nikke
  const handleNikkeSave = async (updated: NikkeData) => {
    const newData = allNikkes.map(n => n.id === updated.id ? updated : n);
    setAllNikkes(newData);
    if (selectedNikke?.id === updated.id) {
      setSelectedNikke(updated);
    }
    setEditingNikke(null);

    // Save to DB
    await saveNikkes(newData);
  };

  // Tag Data Update
  const handleTagDataSave = (newTagData: typeof TAG_DATA) => {
    setCustomTagData(newTagData);
    alert("태그 데이터가 업데이트되었습니다. (새로고침 시 초기화)");
  };

  const filteredNikkes = allNikkes.filter(nikke => {
    // 1. Name Match
    const nameMatch = matchKorean(nikke.name, searchTerm) || matchKorean(nikke.name_en, searchTerm);

    // 2. Filter Match (AND Logic)
    if (filters.tier && nikke.tier !== filters.tier) return false;
    if (filters.company && nikke.company !== filters.company) return false;
    if (filters.squad && nikke.squad !== filters.squad) return false;
    if (filters.class && nikke.class !== filters.class) return false;
    if (filters.code && nikke.code !== filters.code) return false;
    if (filters.burst && nikke.burst !== filters.burst) return false;
    if (filters.weapon && nikke.weapon !== filters.weapon) return false;

    return nameMatch;
  });

  console.log('[DEBUG] Filtering:', {
    allNikkes: allNikkes.length,
    filteredNikkes: filteredNikkes.length,
    searchTerm,
    filters,
    searchMode
  });

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    setSelectedNikke(null);
  };

  const handleSelectNikke = (nikke: NikkeData) => {
    setSelectedNikke(nikke);
  };

  const handleSelectNikkeWithTags = (nikke: NikkeData, tagInfo: { and: string[]; or: string[]; not: string[] }) => {
    setSelectedNikke(nikke);
    setActiveSearchTags(tagInfo);
  };

  return (
    <div className="min-h-screen p-8 pb-20 relative">
      <div className="absolute top-4 right-4 flex gap-2">
        <button
          onClick={() => { setSearchMode('team'); setSelectedNikke(null); }}
          className="bg-gray-800 hover:bg-gray-700 text-green-400 hover:text-green-300 px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 border border-green-900/30"
        >
          <span>⚔️</span> 팀 빌더
        </button>
        <button
          onClick={() => setIsTagEditorOpen(true)}
          className="bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2"
        >
          <span>🏷️</span> 태그 편집
        </button>
        <button
          onClick={() => setIsDataManagerOpen(true)}
          className="bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2"
        >
          <span>💾</span> 데이터 관리
        </button>
      </div>

      {isDataManagerOpen && (
        <DataManager
          isOpen={isDataManagerOpen}
          onClose={() => setIsDataManagerOpen(false)}
          data={allNikkes}
          onUpdate={handleDataUpdate}
        />
      )}

      {isTagEditorOpen && (
        <TagEditor
          isOpen={isTagEditorOpen}
          onClose={() => setIsTagEditorOpen(false)}
          onSave={handleTagDataSave}
        />
      )}

      {editingNikke && (
        <NikkeEditor
          nikke={editingNikke}
          onSave={handleNikkeSave}
          onClose={() => setEditingNikke(null)}
        />
      )}

      <header className="text-center mb-8 mt-8">
        <h1 className="text-5xl font-black text-white mb-2 tracking-tight">
          NIKKE <span className="text-nikke-red">BUILD</span> SEARCH
        </h1>
        <p className="text-gray-400 text-lg mb-4">
          한국 서버 기준 티어표 · 스킬작 · 옵션작 검색
        </p>
        <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-gray-900/50 border border-gray-700 backdrop-blur-sm mb-6">
          <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
          <span className="text-gray-400 text-sm">데이터베이스 등록: <span className="text-white font-bold ml-1">{allNikkes.length}</span>명</span>
        </div>

        {/* Search Mode Toggle */}
        <div className="flex justify-center gap-4 mb-4">
          <button
            onClick={() => { setSearchMode('name'); setSearchTerm(''); setSelectedNikke(null); }}
            className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${searchMode === 'name'
              ? 'bg-white text-black'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
          >
            🔍 이름 검색
          </button>
          <button
            onClick={() => { setSearchMode('tag'); setSearchTerm(''); setSelectedNikke(null); }}
            className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${searchMode === 'tag'
              ? 'bg-nikke-red text-white shadow-lg shadow-red-900/30'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
          >
            🏷️ 스마트 태그 검색
          </button>
        </div>
      </header>

      {/* DETAILED FILTERS (Applies to both modes) */}
      {!selectedNikke && (
        <SearchFilters
          filters={filters}
          onChange={setFilters}
          isOpen={isFilterOpen}
          onToggle={() => setIsFilterOpen(!isFilterOpen)}
        />
      )}

      {searchMode === 'name' && (
        <SearchBar value={searchTerm} onChange={handleSearchChange} />
      )}

      <div className="max-w-7xl mx-auto">
        {selectedNikke ? (
          <NikkeDetail
            nikke={selectedNikke}
            onBack={() => { setSelectedNikke(null); }}
            onSaveNikke={handleNikkeSave}
            highlightTags={activeSearchTags}
          />
        ) : (
          <div>
            {searchMode === 'tag' ? (
              <SmartTagSearch
                allNikkes={filteredNikkes} // Pass FILTERED list
                onSelectNikke={handleSelectNikkeWithTags}
                onEditNikke={setEditingNikke} // Correctly bridge to NikkeEditor
                tagData={customTagData}
                selectedTags={activeSearchTags}
                onTagsChange={setActiveSearchTags}
              />
            ) : searchMode === 'team' ? (
              <div className="max-w-5xl mx-auto">
                <TeamAnalysis allNikkes={allNikkes} onSelectNikke={handleSelectNikke} />
              </div>
            ) : (
              <>
                {filteredNikkes.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {filteredNikkes.map(nikke => (
                      <button
                        key={nikke.id}
                        onClick={() => handleSelectNikke(nikke)}
                        className="bg-nikke-card border border-gray-800 hover:border-nikke-red hover:bg-gray-800 p-4 rounded-xl transition-all duration-200 text-left group relative overflow-hidden"
                      >
                        <div className="absolute top-0 right-0 p-2 opacity-50">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${nikke.tier === 'SSS' ? 'text-red-500 border-red-500' :
                            nikke.tier === 'SS' ? 'text-orange-400 border-orange-400' :
                              nikke.tier === 'PvP' ? 'text-purple-400 border-purple-400' :
                                'text-gray-500 border-gray-600'
                            }`}>
                            {nikke.tier}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 pr-8">
                          <h3 className="text-white font-bold text-lg group-hover:text-nikke-red transition-colors">{nikke.name}</h3>
                          {nikke.extra_info && (
                            <span className="text-[10px] px-1.5 py-0.5 bg-purple-900/50 text-purple-300 rounded border border-purple-700/50">
                              {nikke.extra_info}
                            </span>
                          )}
                        </div>
                        <p className="text-gray-500 text-sm mt-0.5">{nikke.name_en}</p>
                        <div className="mt-3 flex gap-1.5 opacity-60">
                          <span className="text-xs bg-black/40 px-1.5 py-0.5 rounded text-gray-400">{nikke.burst}버</span>
                          <span className="text-xs bg-black/40 px-1.5 py-0.5 rounded text-gray-400">{nikke.weapon}</span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {/* Small tags for filters if active */}
                          {nikke.company && <span className="text-[10px] text-gray-500">{nikke.company}</span>}
                          <span className="text-[10px] text-gray-500">·</span>
                          {nikke.code && <span className="text-[10px] text-gray-500">{nikke.code}</span>}
                        </div>
                      </button>
                    ))}
                  </div>
                ) : allNikkes.length === 0 ? (
                  <div className="text-center mt-12 opacity-30">
                    <div className="text-6xl mb-4">⏳</div>
                    <p className="text-gray-400 text-xl font-light">데이터를 불러오는 중...</p>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 mt-12">
                    <p className="text-lg">조건에 맞는 니케가 없습니다.</p>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      <footer className="text-center mt-20 text-gray-600 text-sm">
        <p>Data based on 2025 Meta (KR Server)</p>
        <p className="mt-1">Unofficial Fan Site</p>
      </footer>
    </div>
  );
}

export default App;
