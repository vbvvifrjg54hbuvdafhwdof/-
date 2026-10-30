/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  X,
  Book,
  Download,
  Trash2,
  Plus,
  Sparkles,
  FileText,
  Check,
  AlertCircle,
  Folder as FolderIcon,
  FolderPlus,
  Edit2,
  MoveRight,
} from 'lucide-react';
import { KanbunDocument, KanbunFolder } from '../types/kanbun';
import { exportDocumentAsJson } from '../utils/kanbunParser';

interface LibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  documents: KanbunDocument[];
  folders: KanbunFolder[];
  currentDocId: string;
  readCounts: Record<string, number>;
  onSelectDoc: (id: string) => void;
  onDeleteDoc: (id: string) => void;
  onRenameDoc: (id: string, newTitle: string) => void;
  onMoveDoc: (id: string, targetFolderId: string | null) => void;
  onCreateFolder: (name: string) => void;
  onRenameFolder: (id: string, newName: string) => void;
  onDeleteFolder: (id: string) => void;
  onOpenImport: () => void;
  onOpenPrompt: () => void;
}

export const LibraryModal: React.FC<LibraryModalProps> = ({
  isOpen,
  onClose,
  documents,
  folders,
  currentDocId,
  readCounts,
  onSelectDoc,
  onDeleteDoc,
  onRenameDoc,
  onMoveDoc,
  onCreateFolder,
  onRenameFolder,
  onDeleteFolder,
  onOpenImport,
  onOpenPrompt,
}) => {
  // Folder filtering state: 'all' | 'unclassified' | folderId
  const [selectedFolderFilter, setSelectedFolderFilter] = useState<string>('all');

  // Folder creation state
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  // Folder editing state
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editingFolderName, setEditingFolderName] = useState('');

  // Folder deletion state
  const [deletingFolderId, setDeletingFolderId] = useState<string | null>(null);

  // Material editing state (rename title)
  const [editingDocId, setEditingDocId] = useState<string | null>(null);
  const [editingDocTitle, setEditingDocTitle] = useState('');

  // Material move target
  const [movingDocId, setMovingDocId] = useState<string | null>(null);

  // Material deletion state
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  // Filter documents by folder
  const filteredDocuments = documents.filter(doc => {
    if (selectedFolderFilter === 'all') return true;
    if (selectedFolderFilter === 'unclassified') return !doc.folderId;
    return doc.folderId === selectedFolderFilter;
  });

  const handleExport = (doc: KanbunDocument) => {
    const jsonStr = exportDocumentAsJson(doc);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${doc.title.replace(/[/\\?%*:|"<>]/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyJson = async (doc: KanbunDocument) => {
    try {
      const jsonStr = exportDocumentAsJson(doc);
      await navigator.clipboard.writeText(jsonStr);
      setCopiedId(doc.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (e) {
      console.error('Failed to copy JSON:', e);
    }
  };

  const handleCreateFolderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newFolderName.trim()) {
      onCreateFolder(newFolderName.trim());
      setNewFolderName('');
      setIsCreatingFolder(false);
    }
  };

  const handleRenameFolderSubmit = (folderId: string) => {
    if (editingFolderName.trim()) {
      onRenameFolder(folderId, editingFolderName.trim());
      setEditingFolderId(null);
      setEditingFolderName('');
    }
  };

  const handleConfirmDeleteFolder = () => {
    if (deletingFolderId) {
      onDeleteFolder(deletingFolderId);
      if (selectedFolderFilter === deletingFolderId) {
        setSelectedFolderFilter('all');
      }
      setDeletingFolderId(null);
    }
  };

  const handleSaveDocTitle = (docId: string) => {
    if (editingDocTitle.trim()) {
      onRenameDoc(docId, editingDocTitle.trim());
      setEditingDocId(null);
      setEditingDocTitle('');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="library-modal-title"
    >
      <div className="bg-[#fcfaf7] border border-stone-300 rounded-lg max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-stone-200 bg-stone-100/70">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-amber-100 text-amber-800 rounded-md">
              <Book className="w-4 h-4" />
            </div>
            <div>
              <h2 id="library-modal-title" className="text-base font-bold text-stone-900 font-serif">
                教材ライブラリ・フォルダ管理
              </h2>
              <p className="text-xs text-stone-600 font-sans">
                登録済み漢文教材のフォルダ分類、名前変更、音読選択
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="閉じる"
            className="text-stone-400 hover:text-stone-700 p-1 rounded-md hover:bg-stone-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action bar */}
        <div className="px-4 sm:px-5 py-2.5 bg-stone-50 border-b border-stone-200 flex flex-wrap items-center justify-between gap-2">
          <div className="text-xs text-stone-600 font-sans">
            全教材: <strong>{documents.length}</strong> 件 / 表示中:{' '}
            <strong>{filteredDocuments.length}</strong> 件
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenPrompt}
              className="px-2.5 py-1 text-xs font-medium text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded transition-colors flex items-center gap-1 shadow-2xs cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-700" />
              <span>AIプロンプト作成支援</span>
            </button>
            <button
              type="button"
              onClick={onOpenImport}
              className="px-2.5 py-1 text-xs font-medium text-white bg-stone-800 hover:bg-stone-900 rounded transition-colors flex items-center gap-1 shadow-2xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>JSON新規インポート</span>
            </button>
          </div>
        </div>

        {/* Main Body: Folders Sidebar + Documents Content */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-[360px]">
          {/* Folders Column / Sidebar */}
          <div className="w-full md:w-56 bg-stone-100/50 border-b md:border-b-0 md:border-r border-stone-200 flex flex-col p-3 gap-2 shrink-0">
            <div className="flex items-center justify-between">
              <span className="text-xs font-serif font-bold text-stone-700 flex items-center gap-1">
                <FolderIcon className="w-3.5 h-3.5 text-amber-700" />
                <span>フォルダ一覧</span>
              </span>
              <button
                type="button"
                onClick={() => setIsCreatingFolder(true)}
                className="p-1 text-xs text-amber-900 hover:bg-amber-100/60 rounded flex items-center gap-0.5 cursor-pointer font-sans"
                title="新しいフォルダを作成"
              >
                <FolderPlus className="w-3.5 h-3.5" />
                <span className="text-[11px]">作成</span>
              </button>
            </div>

            {/* Folder creation input */}
            {isCreatingFolder && (
              <form onSubmit={handleCreateFolderSubmit} className="p-2 bg-white border border-amber-300 rounded shadow-2xs space-y-1.5">
                <input
                  type="text"
                  placeholder="フォルダ名を入力..."
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  autoFocus
                  className="w-full text-xs px-2 py-1 border border-stone-300 rounded focus:outline-none focus:border-amber-700"
                />
                <div className="flex justify-end gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreatingFolder(false);
                      setNewFolderName('');
                    }}
                    className="px-2 py-0.5 text-[11px] text-stone-600 hover:bg-stone-100 rounded"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="px-2 py-0.5 text-[11px] font-bold text-white bg-amber-800 hover:bg-amber-900 rounded"
                  >
                    保存
                  </button>
                </div>
              </form>
            )}

            {/* Folder List Items */}
            <div className="flex-1 overflow-y-auto space-y-1">
              {/* All */}
              <button
                type="button"
                onClick={() => setSelectedFolderFilter('all')}
                className={`w-full text-left px-2.5 py-1.5 text-xs font-medium rounded flex items-center justify-between transition-colors cursor-pointer ${
                  selectedFolderFilter === 'all'
                    ? 'bg-amber-800 text-white font-bold shadow-2xs'
                    : 'text-stone-700 hover:bg-stone-200/60'
                }`}
              >
                <span>すべての教材</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded ${
                  selectedFolderFilter === 'all' ? 'bg-amber-900 text-amber-100' : 'bg-stone-200 text-stone-600'
                }`}>
                  {documents.length}
                </span>
              </button>

              {/* Unclassified */}
              <button
                type="button"
                onClick={() => setSelectedFolderFilter('unclassified')}
                className={`w-full text-left px-2.5 py-1.5 text-xs font-medium rounded flex items-center justify-between transition-colors cursor-pointer ${
                  selectedFolderFilter === 'unclassified'
                    ? 'bg-amber-800 text-white font-bold shadow-2xs'
                    : 'text-stone-700 hover:bg-stone-200/60'
                }`}
              >
                <span>未分類</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded ${
                  selectedFolderFilter === 'unclassified' ? 'bg-amber-900 text-amber-100' : 'bg-stone-200 text-stone-600'
                }`}>
                  {documents.filter(d => !d.folderId).length}
                </span>
              </button>

              {/* User Folders */}
              {folders.map(folder => {
                const count = documents.filter(d => d.folderId === folder.id).length;
                const isSelected = selectedFolderFilter === folder.id;
                const isEditing = editingFolderId === folder.id;

                if (isEditing) {
                  return (
                    <div key={folder.id} className="p-1.5 bg-white border border-amber-300 rounded space-y-1">
                      <input
                        type="text"
                        value={editingFolderName}
                        onChange={(e) => setEditingFolderName(e.target.value)}
                        autoFocus
                        className="w-full text-xs px-1.5 py-0.5 border border-stone-300 rounded"
                      />
                      <div className="flex justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => setEditingFolderId(null)}
                          className="px-1.5 py-0.5 text-[10px] text-stone-600 hover:bg-stone-100 rounded"
                        >
                          取消
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRenameFolderSubmit(folder.id)}
                          className="px-1.5 py-0.5 text-[10px] font-bold text-white bg-amber-800 rounded"
                        >
                          変更
                        </button>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={folder.id}
                    className={`group w-full flex items-center justify-between px-2 py-1.5 text-xs rounded transition-colors ${
                      isSelected
                        ? 'bg-amber-800 text-white font-bold shadow-2xs'
                        : 'text-stone-700 hover:bg-stone-200/60'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedFolderFilter(folder.id)}
                      className="flex-1 text-left truncate flex items-center gap-1.5 cursor-pointer"
                      title={folder.name}
                    >
                      <FolderIcon className={`w-3 h-3 shrink-0 ${isSelected ? 'text-amber-200' : 'text-amber-700'}`} />
                      <span className="truncate">{folder.name}</span>
                    </button>

                    <div className="flex items-center gap-1 shrink-0">
                      <span className={`text-[10px] px-1 py-0.2 rounded ${
                        isSelected ? 'bg-amber-900 text-amber-100' : 'bg-stone-200 text-stone-600'
                      }`}>
                        {count}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingFolderId(folder.id);
                          setEditingFolderName(folder.name);
                        }}
                        className={`p-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer ${
                          isSelected ? 'text-amber-200 hover:bg-amber-900' : 'text-stone-400 hover:text-stone-800 hover:bg-stone-300/60'
                        }`}
                        title="フォルダ名を変更"
                      >
                        <Edit2 className="w-2.5 h-2.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingFolderId(folder.id)}
                        className={`p-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer ${
                          isSelected ? 'text-amber-200 hover:bg-rose-900' : 'text-stone-400 hover:text-rose-600 hover:bg-rose-100'
                        }`}
                        title="フォルダを削除（中の教材は未分類に保護されます）"
                      >
                        <Trash2 className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Documents Content Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {/* Folder delete confirmation alert */}
            {deletingFolderId && (
              <div className="p-3 bg-amber-50 border border-amber-300 rounded text-xs text-amber-950 flex items-center justify-between gap-2 shadow-2xs">
                <div className="flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>このフォルダを削除しますか？（中の教材は削除されず「未分類」に移動します）</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => setDeletingFolderId(null)}
                    className="px-2 py-1 bg-white border border-stone-300 rounded text-stone-700 hover:bg-stone-100"
                  >
                    取消
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmDeleteFolder}
                    className="px-2 py-1 bg-rose-700 text-white rounded hover:bg-rose-800 font-bold"
                  >
                    フォルダ削除
                  </button>
                </div>
              </div>
            )}

            {/* Document delete confirmation alert */}
            {deleteTargetId && (
              <div className="p-3 bg-rose-50 border border-rose-300 rounded text-xs text-rose-950 flex items-center justify-between gap-2 shadow-2xs">
                <div className="flex items-center gap-1.5 font-medium">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>この教材を削除しますか？（音読回数データも削除されます）</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setDeleteTargetId(null)}
                    className="px-2.5 py-1 bg-white border border-stone-300 rounded text-stone-700 hover:bg-stone-100"
                  >
                    キャンセル
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onDeleteDoc(deleteTargetId);
                      setDeleteTargetId(null);
                    }}
                    className="px-2.5 py-1 bg-rose-600 text-white rounded hover:bg-rose-700 font-medium"
                  >
                    削除する
                  </button>
                </div>
              </div>
            )}

            {filteredDocuments.length === 0 ? (
              <div className="py-12 text-center text-stone-500 font-serif">
                このフォルダには教材がありません
              </div>
            ) : (
              filteredDocuments.map(doc => {
                const isSelected = doc.id === currentDocId;
                const count = readCounts[doc.id] || 0;
                const docFolder = folders.find(f => f.id === doc.folderId);
                const isEditingTitle = editingDocId === doc.id;
                const isMoving = movingDocId === doc.id;

                return (
                  <div
                    key={doc.id}
                    className={`p-3.5 rounded-lg border transition-all ${
                      isSelected
                        ? 'border-amber-600/70 bg-amber-50/50 shadow-xs ring-1 ring-amber-600/30'
                        : 'border-stone-200 bg-white hover:border-stone-300 shadow-2xs'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      {/* Left Info & Title Edit */}
                      <div className="space-y-1.5 flex-1">
                        {isEditingTitle ? (
                          <div className="flex items-center gap-1.5">
                            <input
                              type="text"
                              value={editingDocTitle}
                              onChange={(e) => setEditingDocTitle(e.target.value)}
                              autoFocus
                              className="text-sm font-serif font-bold text-stone-900 border border-amber-400 rounded px-2 py-0.5 w-full max-w-md focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => handleSaveDocTitle(doc.id)}
                              className="px-2 py-1 text-xs font-bold text-white bg-amber-800 rounded"
                            >
                              保存
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingDocId(null)}
                              className="px-2 py-1 text-xs text-stone-600 hover:bg-stone-100 rounded border border-stone-300"
                            >
                              取消
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className="font-serif font-bold text-base text-stone-900 cursor-pointer hover:underline"
                              onClick={() => onSelectDoc(doc.id)}
                            >
                              {doc.title}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingDocId(doc.id);
                                setEditingDocTitle(doc.title);
                              }}
                              className="p-1 text-stone-400 hover:text-stone-700 rounded"
                              title="教材名を変更"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>

                            {isSelected && (
                              <span className="text-[10px] font-sans font-semibold bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded">
                                現在選択中
                              </span>
                            )}
                          </div>
                        )}

                        {doc.source && (
                          <p className="text-xs text-stone-500 font-sans">{doc.source}</p>
                        )}

                        {/* Meta tags */}
                        <div className="flex flex-wrap items-center gap-2 text-xs text-stone-600 pt-0.5 font-sans">
                          {/* Folder badge */}
                          <div className="flex items-center gap-1 bg-stone-100 px-2 py-0.5 rounded border border-stone-200 text-[11px]">
                            <FolderIcon className="w-3 h-3 text-amber-700" />
                            <span>{docFolder ? docFolder.name : '未分類'}</span>
                            <button
                              type="button"
                              onClick={() => setMovingDocId(isMoving ? null : doc.id)}
                              className="text-[10px] text-amber-800 underline hover:text-amber-950 ml-1 cursor-pointer"
                            >
                              移動
                            </button>
                          </div>

                          <span className="bg-stone-100 px-2 py-0.5 rounded border border-stone-200/80 text-[11px]">
                            意味区分: <strong>{doc.sections.length}</strong> 段落
                          </span>

                          <span className="bg-amber-100/70 text-amber-900 px-2 py-0.5 rounded border border-amber-200/80 font-medium text-[11px]">
                            音読記録: <strong>{count}</strong> 回
                          </span>
                        </div>

                        {/* Move folder picker dialog */}
                        {isMoving && (
                          <div className="mt-2 p-2 bg-stone-50 border border-stone-300 rounded text-xs space-y-1.5">
                            <span className="font-bold text-stone-700 block">フォルダを変更:</span>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <button
                                type="button"
                                onClick={() => {
                                  onMoveDoc(doc.id, null);
                                  setMovingDocId(null);
                                }}
                                className={`px-2 py-1 rounded text-xs border ${
                                  !doc.folderId ? 'bg-amber-800 text-white border-amber-800' : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-100'
                                }`}
                              >
                                未分類
                              </button>
                              {folders.map(f => (
                                <button
                                  key={f.id}
                                  type="button"
                                  onClick={() => {
                                    onMoveDoc(doc.id, f.id);
                                    setMovingDocId(null);
                                  }}
                                  className={`px-2 py-1 rounded text-xs border ${
                                    doc.folderId === f.id ? 'bg-amber-800 text-white border-amber-800' : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-100'
                                  }`}
                                >
                                  {f.name}
                                </button>
                              ))}
                              <button
                                type="button"
                                onClick={() => setMovingDocId(null)}
                                className="px-2 py-1 text-xs text-stone-500 hover:text-stone-800"
                              >
                                閉じる
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Right Actions */}
                      <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                        <button
                          type="button"
                          onClick={() => onSelectDoc(doc.id)}
                          className={`px-3 py-1.5 text-xs font-medium rounded transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-amber-800 text-white cursor-default'
                              : 'bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300'
                          }`}
                        >
                          {isSelected ? '音読中' : '選択して音読'}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleCopyJson(doc)}
                          title="JSONをクリップボードにコピー"
                          className="p-1.5 text-stone-500 hover:text-stone-800 hover:bg-stone-100 border border-stone-200 rounded transition-colors cursor-pointer"
                        >
                          {copiedId === doc.id ? (
                            <Check className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <FileText className="w-4 h-4" />
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleExport(doc)}
                          title="JSONファイルをダウンロード"
                          className="p-1.5 text-stone-500 hover:text-stone-800 hover:bg-stone-100 border border-stone-200 rounded transition-colors cursor-pointer"
                        >
                          <Download className="w-4 h-4" />
                        </button>

                        {documents.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setDeleteTargetId(doc.id)}
                            title="教材を削除"
                            className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 border border-stone-200 rounded transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-5 py-3 border-t border-stone-200 bg-stone-100/70 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-stone-700 bg-white hover:bg-stone-100 border border-stone-300 rounded transition-colors shadow-2xs cursor-pointer"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};
