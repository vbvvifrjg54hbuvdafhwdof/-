/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ReadingView } from './components/ReadingView';
import { LibraryModal } from './components/LibraryModal';
import { DisplaySettingsModal } from './components/DisplaySettingsModal';
import { PromptModal } from './components/PromptModal';
import { ImportModal } from './components/ImportModal';
import { ResetConfirmModal } from './components/ResetConfirmModal';
import {
  getSavedDocuments,
  saveSingleDocument,
  deleteSavedDocument,
  renameDocument,
  moveDocumentToFolder,
  getSavedFolders,
  createFolder,
  renameFolder,
  deleteFolder,
  getReadCounts,
  incrementReadCount,
  decrementReadCount,
  setCustomReadCount,
  resetReadCount,
  getSavedSettings,
  saveSettings,
  getSavedSelectedDocId,
  saveSelectedDocId,
} from './utils/storage';
import { DisplaySettings, KanbunDocument, KanbunFolder } from './types/kanbun';

export default function App() {
  const [documents, setDocuments] = useState<KanbunDocument[]>(() => getSavedDocuments());
  const [folders, setFolders] = useState<KanbunFolder[]>(() => getSavedFolders());
  const [selectedDocId, setSelectedDocId] = useState<string>(() => {
    const saved = getSavedSelectedDocId();
    const docs = getSavedDocuments();
    if (saved && docs.some(d => d.id === saved)) {
      return saved;
    }
    return docs[0]?.id || '';
  });

  const [readCounts, setReadCounts] = useState<Record<string, number>>(() => getReadCounts());
  const [settings, setSettings] = useState<DisplaySettings>(() => getSavedSettings());

  // Modals state
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPromptOpen, setIsPromptOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  // Active document
  const currentDoc =
    documents.find(d => d.id === selectedDocId) || documents[0] || null;

  // Persist settings changes
  const handleSettingsChange = (newSettings: DisplaySettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  // Switch active document
  const handleSelectDoc = (id: string) => {
    setSelectedDocId(id);
    saveSelectedDocId(id);
    setIsLibraryOpen(false);
  };

  // Increment recitation count
  const handleIncrementCount = () => {
    if (!currentDoc) return;
    const newCount = incrementReadCount(currentDoc.id);
    setReadCounts(prev => ({ ...prev, [currentDoc.id]: newCount }));
  };

  // Decrement recitation count (lower bound 0)
  const handleDecrementCount = () => {
    if (!currentDoc) return;
    const newCount = decrementReadCount(currentDoc.id);
    setReadCounts(prev => ({ ...prev, [currentDoc.id]: newCount }));
  };

  // Direct set recitation count
  const handleSetCount = (count: number) => {
    if (!currentDoc) return;
    const newCount = setCustomReadCount(currentDoc.id, count);
    setReadCounts(prev => ({ ...prev, [currentDoc.id]: newCount }));
  };

  // Reset recitation count
  const handleConfirmReset = () => {
    if (!currentDoc) return;
    resetReadCount(currentDoc.id);
    setReadCounts(prev => ({ ...prev, [currentDoc.id]: 0 }));
  };

  // Handle successful import
  const handleImportSuccess = (newDoc: KanbunDocument) => {
    const updated = saveSingleDocument(newDoc);
    setDocuments(updated);
    setSelectedDocId(newDoc.id);
    saveSelectedDocId(newDoc.id);
    setIsImportOpen(false);
  };

  // Handle document deletion
  const handleDeleteDoc = (id: string) => {
    const updated = deleteSavedDocument(id);
    setDocuments(updated);
    if (selectedDocId === id && updated.length > 0) {
      setSelectedDocId(updated[0].id);
      saveSelectedDocId(updated[0].id);
    }
  };

  // Rename document
  const handleRenameDoc = (docId: string, newTitle: string) => {
    const updated = renameDocument(docId, newTitle);
    setDocuments(updated);
  };

  // Move document to folder
  const handleMoveDoc = (docId: string, targetFolderId: string | null) => {
    const updated = moveDocumentToFolder(docId, targetFolderId);
    setDocuments(updated);
  };

  // Folder CRUD handlers
  const handleCreateFolder = (name: string) => {
    const updatedFolders = createFolder(name);
    setFolders(updatedFolders);
  };

  const handleRenameFolder = (id: string, newName: string) => {
    const updatedFolders = renameFolder(id, newName);
    setFolders(updatedFolders);
  };

  const handleDeleteFolder = (id: string) => {
    const result = deleteFolder(id);
    setFolders(result.folders);
    setDocuments(result.documents);
  };

  if (!currentDoc) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-white">
        <div className="text-center font-serif">
          <p className="text-lg text-neutral-700">教材を読み込み中...</p>
        </div>
      </div>
    );
  }

  const currentCount = readCounts[currentDoc.id] || 0;

  return (
    <div className="w-full min-h-screen bg-white text-black select-text">
      {/* Top Navbar */}
      <Navbar
        currentDoc={currentDoc}
        readCount={currentCount}
        onIncrementCount={handleIncrementCount}
        onDecrementCount={handleDecrementCount}
        onSetCount={handleSetCount}
        onOpenResetConfirm={() => setIsResetConfirmOpen(true)}
        onOpenLibrary={() => setIsLibraryOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenPrompt={() => setIsPromptOpen(true)}
        onOpenImport={() => setIsImportOpen(true)}
        settings={settings}
        onChangeSettings={handleSettingsChange}
      />

      {/* Main Reading View */}
      <ReadingView
        document={currentDoc}
        settings={settings}
        readCount={currentCount}
        onIncrementCount={handleIncrementCount}
        onChangeSettings={handleSettingsChange}
      />

      {/* Modals */}
      <LibraryModal
        isOpen={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
        documents={documents}
        folders={folders}
        currentDocId={currentDoc.id}
        readCounts={readCounts}
        onSelectDoc={handleSelectDoc}
        onDeleteDoc={handleDeleteDoc}
        onRenameDoc={handleRenameDoc}
        onMoveDoc={handleMoveDoc}
        onCreateFolder={handleCreateFolder}
        onRenameFolder={handleRenameFolder}
        onDeleteFolder={handleDeleteFolder}
        onOpenImport={() => {
          setIsLibraryOpen(false);
          setIsImportOpen(true);
        }}
        onOpenPrompt={() => {
          setIsLibraryOpen(false);
          setIsPromptOpen(true);
        }}
      />

      <DisplaySettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onChangeSettings={handleSettingsChange}
      />

      <PromptModal
        isOpen={isPromptOpen}
        onClose={() => setIsPromptOpen(false)}
      />

      <ImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImportSuccess={handleImportSuccess}
      />

      <ResetConfirmModal
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        onConfirm={handleConfirmReset}
        materialTitle={currentDoc.title}
        currentCount={currentCount}
      />
    </div>
  );
}
