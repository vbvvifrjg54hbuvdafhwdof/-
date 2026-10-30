/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DisplaySettings, KanbunDocument, KanbunFolder } from '../types/kanbun';
import { buildTokensForSection } from './kanbunParser';
import { SAMPLE_DOCUMENTS } from './sampleData';

const STORAGE_KEYS = {
  DOCUMENTS: 'kanbun_app_documents_v1',
  FOLDERS: 'kanbun_app_folders_v1',
  READ_COUNTS: 'kanbun_app_read_counts_v1',
  SETTINGS: 'kanbun_app_display_settings_v2',
  SELECTED_DOC_ID: 'kanbun_app_selected_doc_id_v1',
};

export const DEFAULT_SETTINGS: DisplaySettings = {
  // A. 本文の表示
  showBaiwen: true,
  showOkurigana: false,
  showKaeriten: false,
  kaeritenColor: 'ink',
  whiteTextSize: 22,
  okuriganaTextSize: 11,
  kaeritenTextSize: 10,
  columnGap: 8,
  blockGap: 4,
  contentPadding: 16,
  zoomScale: 100,

  // B. 日本語訳・注釈
  translationMode: 'hidden',
  translationType: 'inline',
  translationTextColor: '#4b5563',
  translationTextSize: 12,
  annotationTextSize: 11,
  leadTextSize: 13,
  noteGap: 3,
  showAnnotation: false,
  showLead: true,

  // C. 音読カウンター
  showCounter: true,
  counterTextSize: 13,
  countButtonWidth: 44,
  countButtonHeight: 26,
  countButtonTextSize: 11,
  counterGap: 6,
  counterPosition: 'top-left',

  // D. 画面レイアウト
  headerHeight: 44,
  headerTitleTextSize: 14,
  marginX: 16,
  marginY: 12,

  // E. 操作設定
  instantApply: true,

  // Backwards compatibility
  showModernTranslation: false,
  fontSize: 'md',
  viewMode: 'traditional',
};

const DEFAULT_FOLDERS: KanbunFolder[] = [
  { id: 'f_common_test', name: '共通テスト対策', createdAt: 1700000000000 },
  { id: 'f_secondary_exam', name: '二次試験頻出', createdAt: 1700000001000 },
];

/**
 * Initialize and load folders from localStorage.
 */
export function getSavedFolders(): KanbunFolder[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.FOLDERS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.FOLDERS, JSON.stringify(DEFAULT_FOLDERS));
      return DEFAULT_FOLDERS;
    }
    return JSON.parse(raw) as KanbunFolder[];
  } catch (e) {
    console.error('Failed to load folders:', e);
    return DEFAULT_FOLDERS;
  }
}

export function saveFolders(folders: KanbunFolder[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.FOLDERS, JSON.stringify(folders));
  } catch (e) {
    console.error('Failed to save folders:', e);
  }
}

export function createFolder(name: string): KanbunFolder[] {
  const trimmed = name.trim();
  if (!trimmed) return getSavedFolders();
  const current = getSavedFolders();
  const newFolder: KanbunFolder = {
    id: `folder_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    name: trimmed,
    createdAt: Date.now(),
  };
  const updated = [...current, newFolder];
  saveFolders(updated);
  return updated;
}

export function renameFolder(id: string, newName: string): KanbunFolder[] {
  const trimmed = newName.trim();
  if (!trimmed) return getSavedFolders();
  const current = getSavedFolders();
  const updated = current.map(f => (f.id === id ? { ...f, name: trimmed } : f));
  saveFolders(updated);
  return updated;
}

export function deleteFolder(id: string): { folders: KanbunFolder[]; documents: KanbunDocument[] } {
  // 1. Remove folder
  const currentFolders = getSavedFolders();
  const updatedFolders = currentFolders.filter(f => f.id !== id);
  saveFolders(updatedFolders);

  // 2. Protect documents inside this folder by moving them to unclassified (folderId = null)
  const currentDocs = getSavedDocuments();
  const updatedDocs = currentDocs.map(doc => (doc.folderId === id ? { ...doc, folderId: null } : doc));
  saveDocuments(updatedDocs);

  return { folders: updatedFolders, documents: updatedDocs };
}

/**
 * Initialize and load documents from localStorage.
 * If none exist, seeds with the built-in entrance exam samples.
 */
export function getSavedDocuments(): KanbunDocument[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DOCUMENTS);
    if (!raw) {
      // Seed with sample documents, building tokens for each
      const seeded = SAMPLE_DOCUMENTS.map((doc, idx) => ({
        ...doc,
        folderId: idx === 0 ? 'f_secondary_exam' : 'f_common_test',
        sections: doc.sections.map(sec => ({
          ...sec,
          tokens: buildTokensForSection(sec),
        })),
      }));
      localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(seeded));
      return seeded;
    }
    const docs = JSON.parse(raw) as KanbunDocument[];
    // Ensure all sections have prebuilt tokens and folderId exists
    return docs.map(doc => ({
      ...doc,
      folderId: doc.folderId ?? null,
      sections: doc.sections.map(sec => ({
        ...sec,
        tokens: sec.tokens || buildTokensForSection(sec),
      })),
    }));
  } catch (e) {
    console.error('Failed to load documents from localStorage:', e);
    return SAMPLE_DOCUMENTS;
  }
}

export function saveDocuments(docs: KanbunDocument[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(docs));
  } catch (e) {
    console.error('Failed to save documents:', e);
  }
}

export function saveSingleDocument(newDoc: KanbunDocument): KanbunDocument[] {
  const current = getSavedDocuments();
  const index = current.findIndex(d => d.id === newDoc.id);
  let updated: KanbunDocument[];
  if (index >= 0) {
    updated = [...current];
    updated[index] = newDoc;
  } else {
    updated = [newDoc, ...current];
  }
  saveDocuments(updated);
  return updated;
}

export function renameDocument(docId: string, newTitle: string): KanbunDocument[] {
  const trimmed = newTitle.trim();
  if (!trimmed) return getSavedDocuments();
  const current = getSavedDocuments();
  const updated = current.map(d => (d.id === docId ? { ...d, title: trimmed, updatedAt: Date.now() } : d));
  saveDocuments(updated);
  return updated;
}

export function moveDocumentToFolder(docId: string, targetFolderId: string | null): KanbunDocument[] {
  const current = getSavedDocuments();
  const updated = current.map(d => (d.id === docId ? { ...d, folderId: targetFolderId, updatedAt: Date.now() } : d));
  saveDocuments(updated);
  return updated;
}

export function deleteSavedDocument(id: string): KanbunDocument[] {
  const current = getSavedDocuments();
  const updated = current.filter(d => d.id !== id);
  saveDocuments(updated);
  return updated;
}

// Read counts management
export function getReadCounts(): Record<string, number> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.READ_COUNTS);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function getReadCount(docId: string): number {
  const counts = getReadCounts();
  return counts[docId] || 0;
}

export function incrementReadCount(docId: string): number {
  const counts = getReadCounts();
  const newCount = (counts[docId] || 0) + 1;
  counts[docId] = newCount;
  try {
    localStorage.setItem(STORAGE_KEYS.READ_COUNTS, JSON.stringify(counts));
  } catch (e) {
    console.error('Failed to update read count:', e);
  }
  return newCount;
}

export function decrementReadCount(docId: string): number {
  const counts = getReadCounts();
  const current = counts[docId] || 0;
  const newCount = Math.max(0, current - 1);
  counts[docId] = newCount;
  try {
    localStorage.setItem(STORAGE_KEYS.READ_COUNTS, JSON.stringify(counts));
  } catch (e) {
    console.error('Failed to decrement read count:', e);
  }
  return newCount;
}

export function setCustomReadCount(docId: string, count: number): number {
  const counts = getReadCounts();
  const newCount = Math.max(0, Math.floor(count));
  counts[docId] = newCount;
  try {
    localStorage.setItem(STORAGE_KEYS.READ_COUNTS, JSON.stringify(counts));
  } catch (e) {
    console.error('Failed to set read count:', e);
  }
  return newCount;
}

export function resetReadCount(docId: string): void {
  const counts = getReadCounts();
  counts[docId] = 0;
  try {
    localStorage.setItem(STORAGE_KEYS.READ_COUNTS, JSON.stringify(counts));
  } catch (e) {
    console.error('Failed to reset read count:', e);
  }
}

// Settings management with migration
export function getSavedSettings(): DisplaySettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    const settings: DisplaySettings = {
      ...DEFAULT_SETTINGS,
      ...parsed,
      // Map backwards compatibility for translationMode if older showModernTranslation existed
      translationMode:
        parsed.translationMode ||
        (parsed.showModernTranslation ? 'always' : 'hidden'),
    };

    // Migrate older excessively wide gaps down to compact vertical spacing
    if (parsed.columnGap === undefined || parsed.columnGap > 10) {
      settings.columnGap = 8;
    }
    if (parsed.blockGap === undefined || parsed.blockGap > 6) {
      settings.blockGap = 4;
    }
    if (parsed.noteGap === undefined || parsed.noteGap > 4) {
      settings.noteGap = 3;
    }
    if (!settings.translationTextColor) {
      settings.translationTextColor = '#4b5563';
    }

    return settings;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: DisplaySettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings:', e);
  }
}

export function resetToDefaultSettings(): DisplaySettings {
  saveSettings(DEFAULT_SETTINGS);
  return DEFAULT_SETTINGS;
}

// Selected document management
export function getSavedSelectedDocId(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEYS.SELECTED_DOC_ID);
  } catch {
    return null;
  }
}

export function saveSelectedDocId(id: string): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SELECTED_DOC_ID, id);
  } catch (e) {
    console.error('Failed to save selected doc id:', e);
  }
}
