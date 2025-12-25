
import { useState, useEffect, useRef } from 'react';
import { squadOptions as baseSquadOptions } from '../utils/nikkeConstants';
import { getSquadOptions, addSquad, updateSquad, deleteSquad } from '../utils/nikkeDataManager';

interface SquadManagerProps {
    isOpen: boolean;
    onClose: () => void;
    onUpdate: () => void;
    onSquadRename?: (oldName: string, newName: string) => void;
    initialMode?: 'list' | 'add' | 'edit' | 'delete';
    targetSquad?: string;
}

export default function SquadManager({ isOpen, onClose, onUpdate, onSquadRename, initialMode = 'list', targetSquad }: SquadManagerProps) {
    const [customSquads, setCustomSquads] = useState<string[]>([]);
    const [newSquadName, setNewSquadName] = useState('');
    const [editingSquad, setEditingSquad] = useState<string | null>(null);
    const [editName, setEditName] = useState('');

    // Refs for auto-focus
    const addInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            loadSquads();
            // Handle initial modes
            if (initialMode === 'add') {
                setTimeout(() => addInputRef.current?.focus(), 100);
            } else if (initialMode === 'edit' && targetSquad) {
                // Force edit start even if it's base squad (it will be added to view in loadSquads if we logic it right, 
                // but handleEditStart sets state directly so it's fine).
                handleEditStart(targetSquad);
            } else if (initialMode === 'delete' && targetSquad) {
                // Determine if it is a custom squad to avoid deleting base squads
                const all = getSquadOptions();
                if (!baseSquadOptions.includes(targetSquad) && all.includes(targetSquad)) {
                    // Small timeout to allow modal to render first
                    setTimeout(() => handleDelete(targetSquad), 100);
                }
            }
        } else {
            // Reset states on close
            setNewSquadName('');
            setEditingSquad(null);
            setEditName('');
        }
    }, [isOpen, initialMode, targetSquad]);

    const loadSquads = () => {
        const allSquads = getSquadOptions();
        let custom = allSquads.filter(s => !baseSquadOptions.includes(s));

        // If we are editing a base squad, we need to show it in the list so the edit input appears
        if (targetSquad && baseSquadOptions.includes(targetSquad) && initialMode === 'edit') {
            // Prepend it for visibility
            custom = [targetSquad, ...custom];
        }
        setCustomSquads(custom);
    };

    const handleAdd = async () => {
        if (!newSquadName.trim()) return;
        await addSquad(newSquadName.trim());
        setNewSquadName('');
        loadSquads();
        onUpdate();
    };

    const handleEditStart = (squad: string) => {
        setEditingSquad(squad);
        setEditName(squad);
    };

    const handleEditSave = async () => {
        if (!editingSquad || !editName.trim()) return;

        const newName = editName.trim();
        if (editingSquad !== newName) {
            if (baseSquadOptions.includes(editingSquad)) {
                // Editing a base squad -> Create new custom squad
                await addSquad(newName);
            } else {
                // Editing a custom squad -> Rename
                await updateSquad(editingSquad, newName);
            }

            loadSquads();
            onUpdate();
            if (onSquadRename) {
                onSquadRename(editingSquad, newName);
            }
        }
        setEditingSquad(null);
        // If we were editing a base squad and saved, close the modal maybe? Or just stop editing.
        // If we close, it feels like "Done".
        if (initialMode === 'edit') onClose();
    };

    const handleDelete = async (squad: string) => {
        if (window.confirm(`'${squad}' 스쿼드를 삭제하시겠습니까 ?\n이 스쿼드를 사용하는 니케의 정보는 유지되지만 스쿼드 이름은 더 이상 목록에 표시되지 않을 수 있습니다.`)) {
            await deleteSquad(squad);
            loadSquads();
            onUpdate();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
            <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-md shadow-2xl flex flex-col max-h-[80vh]">
                {/* Header */}
                <div className="p-4 border-b border-gray-700 bg-gray-800 rounded-t-xl flex justify-between items-center">
                    <h3 className="font-bold text-white flex items-center gap-2">
                        <span>⚙️</span> 스쿼드 관리
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white px-2">✕</button>
                </div>

                {/* Add New */}
                <div className="p-4 border-b border-gray-800 bg-gray-800/30">
                    <label className="text-xs text-gray-500 block mb-2">새 스쿼드 추가</label>
                    <div className="flex gap-2">
                        <input
                            ref={addInputRef}
                            type="text"
                            value={newSquadName}
                            onChange={e => setNewSquadName(e.target.value)}
                            placeholder="스쿼드 이름 입력..."
                            className="flex-1 bg-gray-800 border border-gray-600 text-white px-3 py-2 rounded text-sm"
                            onKeyDown={e => e.key === 'Enter' && handleAdd()}
                        />
                        <button
                            onClick={handleAdd}
                            disabled={!newSquadName.trim()}
                            className="px-4 py-2 bg-green-700 hover:bg-green-600 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded font-bold text-sm"
                        >
                            추가
                        </button>
                    </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {customSquads.length === 0 ? (
                        <div className="text-center py-8 text-gray-500 text-sm">
                            추가된 커스텀 스쿼드가 없습니다.
                        </div>
                    ) : (
                        customSquads.map(squad => (
                            <div key={squad} className="flex items-center justify-between p-3 bg-gray-800/50 border border-gray-700/50 rounded hover:bg-gray-800 transition-colors">
                                {editingSquad === squad ? (
                                    <div className="flex items-center gap-2 flex-1 mr-2">
                                        <input
                                            type="text"
                                            value={editName}
                                            onChange={e => setEditName(e.target.value)}
                                            className="flex-1 bg-gray-900 border border-blue-500 text-white px-2 py-1 rounded text-sm"
                                            autoFocus
                                        />
                                        <button onClick={handleEditSave} className="text-xs px-2 py-1 bg-blue-600 text-white rounded">저장</button>
                                        <button onClick={() => setEditingSquad(null)} className="text-xs px-2 py-1 bg-gray-600 text-white rounded">취소</button>
                                    </div>
                                ) : (
                                    <>
                                        <span className="text-gray-200 text-sm font-medium pl-1">{squad}</span>
                                        <div className="flex gap-1">
                                            <button
                                                onClick={() => handleEditStart(squad)}
                                                className="p-1 text-gray-400 hover:text-blue-400 hover:bg-blue-900/20 rounded"
                                                title="수정"
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                onClick={() => handleDelete(squad)}
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

                    {/* Divider for Base Squads */}
                    {customSquads.length > 0 && <div className="border-t border-gray-700 my-2 pt-2 text-center text-xs text-gray-500">기본 스쿼드 (수정 불가)</div>}

                    {/* Optional: Show Base Squads just for reference? User might want to search to see if it exists */}
                    {/* Let's show them collapsed or just a few? No, user only needs to manage custom ones. */}
                </div>

                <div className="p-3 border-t border-gray-700 bg-gray-800 text-xs text-gray-500 text-center">
                    커스텀 스쿼드는 브라우저(로컬)에 저장됩니다.
                </div>
            </div>
        </div>
    );
}
