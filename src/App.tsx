import { useState, useEffect } from 'react';
import NikkeDetail from './components/NikkeDetail';
import SearchBar from './components/SearchBar';
import SmartTagSearch from './components/SmartTagSearch';
import SearchFilters, { initialFilters } from './components/SearchFilters';
import DataManager from './components/DataManager';
import NikkeEditor from './components/NikkeEditor';
import TagEditor from './components/TagEditor';
import TeamAnalysis from './components/TeamAnalysis'; // Import added
import MasterDataManager from './components/MasterDataManager';
import type { NikkeData } from './data/nikkes';
import { matchKorean } from './utils/hangul';
import { TAG_DATA } from './data/tags';
import { BURST_DB } from './data/burst_db';
import { loadDB, saveNikkes, saveNikkeData, saveTags, getMasters } from './utils/nikkeDataManager';

function App() {
  const [allNikkes, setAllNikkes] = useState<NikkeData[]>([]);
  const [burstDBState, setBurstDBState] = useState(BURST_DB);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNikke, setSelectedNikke] = useState<NikkeData | null>(null);
  const [filters, setFilters] = useState(initialFilters);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchMode, setSearchMode] = useState<'name' | 'tag' | 'team'>('name');
  const [activeSearchTags, setActiveSearchTags] = useState<{ and: string[]; or: string[]; not: string[] }>({ and: [], or: [], not: [] });
  const [customTagData, setCustomTagData] = useState(TAG_DATA);
  const [isDataManagerOpen, setIsDataManagerOpen] = useState(false);
  const [dataManagerInitialNikke, setDataManagerInitialNikke] = useState<NikkeData | null>(null);
  const [isTagEditorOpen, setIsTagEditorOpen] = useState(false);
  const [isMasterDataManagerOpen, setIsMasterDataManagerOpen] = useState(false);
  const [editingNikke, setEditingNikke] = useState<NikkeData | null>(null);

  const reloadDB = async () => {
    console.log('[DEBUG] Starting data load...');
    const data = await loadDB(true); // Force reload from server
    if (!data) return;

    const { nikkes, squads, tags, burst_db } = data;
    console.log(`[DEBUG] Loaded ${nikkes.length} nikkes and ${squads.length} squads from DB`);

    setAllNikkes(nikkes);
    if (tags) {
      setCustomTagData(tags);
    }
    if (burst_db) {
      setBurstDBState({ ...burst_db });
    }
    setSelectedNikke(prev => {
      if (!prev) return null;
      const updated = nikkes.find(n => n.id === prev.id);
      return updated || null;
    });
    console.log('[DEBUG] State updated with nikkes:', nikkes.slice(0, 3).map(n => n.name));
  };

  // Load Data from API
  useEffect(() => {
    reloadDB();
  }, []);

  // Real-time refresh when DB changes
  useEffect(() => {
    const handler = () => {
      reloadDB();
    };

    window.addEventListener('nikke-db-updated', handler);
    return () => window.removeEventListener('nikke-db-updated', handler);
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

    // Save to DB using individual API
    await saveNikkeData(updated);
  };

  // Tag Data Update
  const handleTagDataSave = async (newTagData: typeof TAG_DATA) => {
    try {
      setCustomTagData(newTagData);
      await saveTags(newTagData);
      alert("태그 데이터가 성공적으로 저장되었습니다!");
    } catch (error) {
      console.error("Failed to save tags:", error);
      alert("태그 저장 중 오류가 발생했습니다.");
    }
  };

  const filteredNikkes = allNikkes.filter(nikke => {
    // 1. Name Match
    const nameMatch =
      matchKorean(nikke.name || '', searchTerm) ||
      matchKorean(nikke.name_en || '', searchTerm);

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

  // Filters and Searching Logic
  // Unused state can be removed if strictly necessary, but keeping for now as they might be part of ongoing features.
  // const [activeTab, setActiveTab] = useState('list');

  console.log('[DEBUG] Filtering:', {
    allNikkes: allNikkes.length,
    filteredNikkes: filteredNikkes.length,
    searchTerm,
    filters,
    searchMode
  });

  const handleOpenDataManagerWithNikke = (nikke: NikkeData) => {
    setDataManagerInitialNikke(nikke);
    setIsDataManagerOpen(true);
  };

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    setSelectedNikke(null);
  };

  const handleSelectNikke = (nikke: NikkeData) => {
    console.log('[DEBUG] handleSelectNikke called with:', { id: nikke.id, name: nikke.name });
    setSelectedNikke(nikke);
  };

  const handleSelectNikkeWithTags = (nikke: NikkeData, tagInfo: { and: string[]; or: string[]; not: string[] }) => {
    setSelectedNikke(nikke);
    setActiveSearchTags(tagInfo);
  };

  const masters = getMasters();
  const colors = (masters.colors || {}) as any;

  return (
    <div className="min-h-screen p-8 pb-20 relative">
      <div className="absolute top-4 right-4 flex gap-2">
        <button
          onClick={() => setIsMasterDataManagerOpen(true)}
          className="bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2"
        >
          <span>🧩</span> 분류 관리
        </button>
        <button
          onClick={() => setIsTagEditorOpen(true)}
          className="bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2"
        >
          <span>🏷️</span> 태그 편집
        </button>
        <button
          onClick={() => setIsDataManagerOpen(true)}
          className="bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 relative"
        >
          <span>💾</span> 데이터 관리
        </button>
      </div>

      {isDataManagerOpen && (
        <DataManager
          isOpen={isDataManagerOpen}
          onClose={() => {
            setIsDataManagerOpen(false);
            setDataManagerInitialNikke(null);
          }}
          data={allNikkes}
          onUpdate={handleDataUpdate}
          onUpdateSingle={handleNikkeSave}
          initialNikke={dataManagerInitialNikke}
        />
      )}

      {isTagEditorOpen && (
        <TagEditor
          isOpen={isTagEditorOpen}
          onClose={() => setIsTagEditorOpen(false)}
          onSave={handleTagDataSave}
          currentTagData={customTagData}
        />
      )}

      {isMasterDataManagerOpen && (
        <MasterDataManager
          isOpen={isMasterDataManagerOpen}
          onClose={() => setIsMasterDataManagerOpen(false)}
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
          2026 메타 · 추천 조합 · 분야별 티어리스트 검색
        </p>
        <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-gray-900/50 border border-gray-700 backdrop-blur-sm mb-6">
          <span className="w-2 h-2 rounded-full bg-blue-500 mr-2 animate-pulse"></span>
          <span className="text-gray-400 text-sm">데이터베이스 등록: <span className="text-white font-bold ml-1">{allNikkes.length}</span>명</span>
        </div>
      </header>

      <div className="max-w-[1600px] mx-auto px-4 mb-12">
        <div className="flex justify-center gap-4 p-1 bg-gray-900/80 border border-gray-700 rounded-xl backdrop-blur-md">
          <button
            onClick={() => setSearchMode('name')}
            className={`flex-1 py-3 px-6 rounded-lg text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 ${searchMode === 'name'
              ? 'bg-nikke-red text-white shadow-lg shadow-nikke-red/20'
              : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800'
              }`}
          >
            <span>🔍</span> 이름 검색
          </button>
          <button
            onClick={() => setSearchMode('tag')}
            className={`flex-1 py-3 px-6 rounded-lg text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 ${searchMode === 'tag'
              ? 'bg-nikke-accent text-white shadow-lg shadow-nikke-accent/20'
              : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800'
              }`}
          >
            <span>🏷️</span> 스마트 태그
          </button>

          <button
            onClick={() => setSearchMode('team')}
            className={`flex-1 py-3 px-6 rounded-lg text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 ${searchMode === 'team'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
              : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800'
              }`}
          >
            <span>📊</span> 조합 분석
          </button>
        </div>
      </div>

      <main className="max-w-[1600px] mx-auto px-4 pb-12 min-h-[600px]">
        {selectedNikke ? (
          <NikkeDetail
            nikke={selectedNikke}
            onBack={() => setSelectedNikke(null)}
            onSaveNikke={handleNikkeSave}
            highlightTags={activeSearchTags}
          />
        ) : (
          <>
            {searchMode === 'name' && (
              <div className="animate-fadeIn">
                <SearchBar
                  value={searchTerm}
                  onChange={handleSearchChange}
                  focusTrigger={searchMode}
                />

                <div className="mb-8">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      <span className="w-1.5 h-6 bg-nikke-red rounded-full"></span>
                      상세 필터
                    </h2>
                    <button
                      onClick={() => setFilters(initialFilters)}
                      className="text-sm text-gray-500 hover:text-nikke-red transition-colors"
                    >
                      필터 초기화
                    </button>
                  </div>
                  <SearchFilters
                    filters={filters}
                    onChange={setFilters}
                    isOpen={isFilterOpen}
                    onToggle={() => setIsFilterOpen(!isFilterOpen)}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 3xl:grid-cols-8 gap-4">
                  {filteredNikkes.length > 0 ? (
                    filteredNikkes.map(nikke => (
                      <div
                        key={nikke.id}
                        onClick={() => handleSelectNikke(nikke)}
                        className="cursor-pointer transform hover:-translate-y-1 transition-all duration-300"
                      >
                        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 hover:border-nikke-red group h-full flex flex-col justify-between">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex flex-col">
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-0.5 rounded text-[13px] font-black border bg-black/40 ${colors.burst?.[nikke.burst] || 'border-gray-700 text-gray-400'}`}>
                                  {nikke.burst}
                                </span>
                                <div className="flex items-baseline gap-1.5 flex-wrap">
                                  <h3 className="font-bold text-white group-hover:text-nikke-red text-[14px]">
                                    {nikke.name}
                                  </h3>
                                  {nikke.name_en && (
                                    <span className="text-[10px] text-blue-400/80 font-medium">
                                      {nikke.name_en}
                                    </span>
                                  )}
                                </div>
                              </div>
                              {nikke.extra_info && (
                                <span className="text-[11px] text-gray-400 font-medium mt-1 ml-1">
                                  {nikke.extra_info}
                                </span>
                              )}
                            </div>
                            <span className={`text-[13px] font-black ${nikke.tier === 'SSS' ? 'text-red-500' :
                              nikke.tier === 'SS' ? 'text-orange-400' :
                                nikke.tier === 'S' ? 'text-yellow-400' :
                                  nikke.tier === 'A' ? 'text-blue-400' :
                                    'text-gray-400'
                              }`}>{nikke.tier}</span>
                          </div>

                          <div className="space-y-1 mt-2">
                            <div className="flex flex-wrap gap-x-2 gap-y-1 text-[10px] font-bold">
                              <span className={colors.company?.[nikke.company || ''] || 'text-gray-500'}>{nikke.company || '제조사 미정'}</span>
                              <span className="text-cyan-500">{nikke.squad || '스쿼드 미정'}</span>
                            </div>
                            <div className="flex flex-wrap gap-x-1.5 text-[11px] font-black items-center mt-1 pt-1 border-t border-gray-700/50">
                              <span className={colors.code_text?.[nikke.code || ''] || 'text-gray-400'}>{nikke.code}</span>
                              <span className="text-gray-600">·</span>
                              <span className={colors.class?.[nikke.class] || 'text-gray-400'}>{masters.class_names?.[nikke.class] || nikke.class}</span>
                              <span className="text-gray-600">·</span>
                              <span className="text-white">{masters.weapon_names?.[nikke.weapon] || nikke.weapon}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full py-20 text-center text-gray-600 border-2 border-dashed border-gray-800 rounded-2xl">
                      <p className="text-2xl mb-2">🔎</p>
                      <p>검색 결과가 없습니다.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {searchMode === 'tag' && (
              <SmartTagSearch
                allNikkes={allNikkes}
                onSelectNikke={handleSelectNikkeWithTags}
                tagData={customTagData}
                selectedTags={activeSearchTags}
                onTagsChange={setActiveSearchTags}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                filters={filters}
                onFiltersChange={setFilters}
                isFilterOpen={isFilterOpen}
                onToggleFilter={() => setIsFilterOpen(!isFilterOpen)}
              />
            )}



            {searchMode === 'team' && (
              <TeamAnalysis
                currentNikke={selectedNikke || undefined}
                allNikkes={allNikkes}
                onSelectNikke={handleSelectNikke}
                onOpenDataManager={handleOpenDataManagerWithNikke}
                onSaveNikke={handleNikkeSave}
                burstDB={burstDBState}
                onReloadDB={reloadDB}
              />
            )}
          </>
        )}
      </main>

      <footer className="text-center mt-20 text-gray-600 text-sm">
        <p>Data based on 2026 Meta (KR Server)</p>
        <p className="mt-1">Unofficial Fan Site</p>
      </footer>
    </div>
  );
}

export default App;
