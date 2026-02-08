import { useEffect, useMemo, useState } from 'react';
import {
  addMasterValue,
  deleteMasterValue,
  getMasterData,
  getMasterOptions,
  renameMasterValue,
  type MasterData,
  addSquad,
  deleteSquad,
  updateSquad,
  getSquadOptions,
} from '../utils/nikkeDataManager';

type TabKey = 'tiers' | 'companies' | 'codes' | 'bursts' | 'weapons' | 'classes' | 'rarities' | 'squads';

interface MasterDataManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MasterDataManager({ isOpen, onClose }: MasterDataManagerProps) {
  const [tab, setTab] = useState<TabKey>('tiers');
  const [data, setData] = useState<MasterData>(() => getMasterData());
  const [newValue, setNewValue] = useState('');
  const [editing, setEditing] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const refresh = () => {
    setData(getMasterData());
  };

  useEffect(() => {
    if (!isOpen) return;
    refresh();

    const handler = () => {
      refresh();
    };

    window.addEventListener('nikke-db-updated', handler);
    return () => window.removeEventListener('nikke-db-updated', handler);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    setNewValue('');
    setEditing(null);
    setEditValue('');
  }, [isOpen, tab]);

  const items = useMemo(() => {
    if (tab === 'squads') return getSquadOptions();
    return getMasterOptions(tab);
  }, [tab, data]);

  if (!isOpen) return null;

  const tabLabel: Record<TabKey, string> = {
    tiers: '티어',
    companies: '제조사',
    codes: '속성',
    bursts: '버스트',
    weapons: '무기',
    classes: '클래스',
    rarities: '희귀도',
    squads: '스쿼드',
  };

  const handleAdd = async () => {
    const v = newValue.trim();
    if (!v) return;

    if (tab === 'squads') {
      await addSquad(v);
    } else {
      await addMasterValue(tab, v);
    }

    setNewValue('');
    // No need to call refresh() here because nikkeDataManager updates cachedMasters synchronously
    // and saveDB will eventually trigger nikke-db-updated event.
    // However, to show immediate feedback:
    refresh();
  };

  const handleStartEdit = (value: string) => {
    setEditing(value);
    setEditValue(value);
  };

  const handleSaveEdit = async () => {
    if (!editing) return;

    const from = editing.trim();
    const to = editValue.trim();
    if (!from || !to) return;

    if (from !== to) {
      if (tab === 'squads') {
        await updateSquad(from, to);
      } else {
        await renameMasterValue(tab, from, to);
      }
    }

    setEditing(null);
    setEditValue('');
    refresh();
  };

  const handleDelete = async (value: string) => {
    const v = value.trim();
    if (!v) return;

    if (!window.confirm(`'${v}' 항목을 삭제하시겠습니까?\n\n삭제 시 해당 값을 사용하는 니케 데이터는 기본값/빈값으로 변경됩니다.`)) {
      return;
    }

    if (tab === 'squads') {
      await deleteSquad(v);
    } else {
      await deleteMasterValue(tab, v);
    }

    refresh();
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-[70] flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
      <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-3xl shadow-2xl flex flex-col max-h-[85vh]">
        <div className="p-4 border-b border-gray-700 bg-gray-800 rounded-t-xl flex justify-between items-center">
          <h3 className="font-bold text-white flex items-center gap-2">
            <span>🧩</span> 분류(마스터) 관리
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white px-2">✕</button>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-8 gap-1 p-2 border-b border-gray-800 bg-gray-800/30">
          {(Object.keys(tabLabel) as TabKey[]).map(k => (
            <button
              key={k}
              onClick={() => setTab(k)}
              className={`py-2 text-xs font-bold rounded transition-all ${tab === k ? 'bg-nikke-red text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700'}`}
            >
              {tabLabel[k]}
            </button>
          ))}
        </div>

        <div className="p-4 border-b border-gray-800 bg-gray-800/20">
          <label className="text-xs text-gray-500 block mb-2">새 {tabLabel[tab]} 추가</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={newValue}
              onChange={e => setNewValue(e.target.value)}
              placeholder={`${tabLabel[tab]} 입력...`}
              className="flex-1 bg-gray-800 border border-gray-600 text-white px-3 py-2 rounded text-sm"
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
            />
            <button
              onClick={handleAdd}
              disabled={!newValue.trim()}
              className="px-4 py-2 bg-green-700 hover:bg-green-600 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded font-bold text-sm"
            >
              추가
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {items.length === 0 ? (
            <div className="text-center py-10 text-gray-500 text-sm">등록된 항목이 없습니다.</div>
          ) : (
            items.map(v => (
              <div
                key={v}
                className="flex items-center justify-between p-3 bg-gray-800/50 border border-gray-700/50 rounded hover:bg-gray-800 transition-colors"
              >
                {editing === v ? (
                  <div className="flex items-center gap-2 flex-1 mr-2">
                    <input
                      type="text"
                      value={editValue}
                      onChange={e => setEditValue(e.target.value)}
                      className="flex-1 bg-gray-900 border border-blue-500 text-white px-2 py-1 rounded text-sm"
                      autoFocus
                      onKeyDown={e => e.key === 'Enter' && handleSaveEdit()}
                    />
                    <button onClick={handleSaveEdit} className="text-xs px-2 py-1 bg-blue-600 text-white rounded">저장</button>
                    <button onClick={() => { setEditing(null); setEditValue(''); }} className="text-xs px-2 py-1 bg-gray-600 text-white rounded">취소</button>
                  </div>
                ) : (
                  <>
                    <span className="text-gray-200 text-sm font-medium pl-1 break-all">{v}</span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleStartEdit(v)}
                        className="p-1 text-gray-400 hover:text-blue-400 hover:bg-blue-900/20 rounded"
                        title="수정"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(v)}
                        className="p-1 text-gray-400 hover:text-red-400 hover:bg-red-900/20 rounded"
                        title="삭제"
                      >
                        🗑️
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>

        <div className="p-3 border-t border-gray-700 bg-gray-800 text-xs text-gray-500 text-center rounded-b-xl">
          수정/삭제는 DB에 저장되며, 저장 즉시 화면 드롭다운에 반영됩니다.
        </div>
      </div>
    </div>
  );
}
