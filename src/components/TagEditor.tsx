import { useState, useEffect } from 'react';
import { TAG_DATA } from '../data/tags';

interface TagEditorProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (newTagData: typeof TAG_DATA) => Promise<void>;
    currentTagData: typeof TAG_DATA;
}

export default function TagEditor({ isOpen, onClose, onSave, currentTagData }: TagEditorProps) {
    const [tagData, setTagData] = useState<typeof TAG_DATA>(currentTagData);
    const [selectedGroup, setSelectedGroup] = useState<string>(Object.keys(currentTagData.tag_groups)[0]);
    const [newTagName, setNewTagName] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setTagData(JSON.parse(JSON.stringify(currentTagData)));
        }
    }, [isOpen, currentTagData]);

    if (!isOpen) return null;

    const currentGroup = tagData.tag_groups[selectedGroup as keyof typeof tagData.tag_groups];

    const handleAddTag = () => {
        if (!newTagName.trim()) return;
        if (currentGroup.tags.includes(newTagName.trim())) {
            alert("이미 존재하는 태그입니다.");
            return;
        }
        
        setTagData(prev => ({
            ...prev,
            tag_groups: {
                ...prev.tag_groups,
                [selectedGroup]: {
                    ...prev.tag_groups[selectedGroup as keyof typeof prev.tag_groups],
                    tags: [...prev.tag_groups[selectedGroup as keyof typeof prev.tag_groups].tags, newTagName.trim()]
                }
            }
        }));
        setNewTagName('');
    };

    const handleRemoveTag = (tagToRemove: string) => {
        setTagData(prev => ({
            ...prev,
            tag_groups: {
                ...prev.tag_groups,
                [selectedGroup]: {
                    ...prev.tag_groups[selectedGroup as keyof typeof prev.tag_groups],
                    tags: prev.tag_groups[selectedGroup as keyof typeof prev.tag_groups].tags.filter(t => t !== tagToRemove)
                }
            }
        }));
    };

    const handleSave = async () => {
        try {
            setIsSaving(true);
            await onSave(tagData);
            onClose();
        } catch (error) {
            console.error("Save failed:", error);
            alert("저장 중 오류가 발생했습니다.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleExport = () => {
        const blob = new Blob([JSON.stringify(tagData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'all_tags_custom.json';
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fadeIn">
            <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-4xl h-[80vh] flex flex-col shadow-2xl">
                <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-gray-800 rounded-t-xl">
                    <h2 className="text-xl font-bold text-white flex items-center">
                        <span className="mr-2">🏷️</span> 태그 편집기
                    </h2>
                    <div className="flex gap-2">
                        <button
                            onClick={handleExport}
                            className="px-3 py-1.5 bg-blue-900 hover:bg-blue-800 text-blue-100 rounded text-sm border border-blue-700"
                        >
                            📥 JSON 내보내기
                        </button>
                        <button onClick={onClose} className="text-gray-400 hover:text-white px-2">✕</button>
                    </div>
                </div>

                <div className="flex flex-1 overflow-hidden">
                    {/* Group List */}
                    <div className="w-1/3 border-r border-gray-700 overflow-y-auto bg-black/30">
                        <div className="p-2">
                            {Object.entries(tagData.tag_groups).map(([key, group]) => (
                                <button
                                    key={key}
                                    onClick={() => setSelectedGroup(key)}
                                    className={`w-full text-left px-3 py-2 rounded mb-1 text-sm transition-colors ${selectedGroup === key

                                            ? 'bg-nikke-red text-white'
                                            : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                        }`}
                                >
                                    {group.display_name}
                                    <span className="text-xs ml-2 opacity-50">({group.tags.length})</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Tag Editor */}
                    <div className="flex-1 flex flex-col overflow-hidden">
                        <div className="p-4 border-b border-gray-700 bg-gray-800/50">
                            <h3 className="text-lg font-bold text-white mb-2">{currentGroup?.display_name}</h3>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newTagName}
                                    onChange={e => setNewTagName(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleAddTag()}
                                    placeholder="새 태그 이름..."
                                    className="flex-1 bg-gray-800 border border-gray-600 text-white px-3 py-2 rounded text-sm"
                                />
                                <button
                                    onClick={handleAddTag}
                                    className="px-4 py-2 bg-green-800 hover:bg-green-700 text-green-100 rounded text-sm font-bold"
                                >
                                    + 추가
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4">
                            <div className="flex flex-wrap gap-2">
                                {currentGroup?.tags.map(tag => (
                                    <div
                                        key={tag}
                                        className="group flex items-center bg-gray-800 border border-gray-700 rounded px-3 py-1.5 text-sm text-gray-300 hover:border-red-700 transition-colors"
                                    >
                                        <span>{tag}</span>
                                        <button
                                            onClick={() => handleRemoveTag(tag)}
                                            className="ml-2 text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t border-gray-700 bg-gray-800 rounded-b-xl flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-400 hover:text-white border border-transparent hover:border-gray-600 rounded"
                    >
                        취소
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className={`px-6 py-2 bg-nikke-red hover:bg-red-700 text-white font-bold rounded shadow-lg shadow-red-900/20 transition-all hover:scale-105 flex items-center gap-2 ${isSaving ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {isSaving ? (
                            <>
                                <span className="animate-spin text-lg">⏳</span>
                                저장 중...
                            </>
                        ) : (
                            '적용하기'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
