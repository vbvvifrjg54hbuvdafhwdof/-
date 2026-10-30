/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface KaeritenMark {
  text: string;
  marks: string[];
}

export interface KanbunToken {
  char: string;
  okurigana?: string;
  kaeriten?: string[];
  isPunctuation?: boolean;
}

export interface KanbunSection {
  id: string;
  baiwen: string;
  okurigana: string;
  kaeriten: KaeritenMark[];
  tokens?: KanbunToken[];
  modern_translation: string;
  annotation: string;
}

export interface KanbunFolder {
  id: string;
  name: string;
  createdAt: number;
}

export interface KanbunDocument {
  schema_version: string;
  id: string;
  title: string;
  folderId?: string | null;
  lead?: string;
  sections: KanbunSection[];
  source?: string;
  createdAt?: number;
  updatedAt?: number;
}

export type TranslationDisplayMode = 'hidden' | 'always' | 'tap';
export type TranslationDisplayType = 'inline' | 'popup';

export interface DisplaySettings {
  // A. 本文の表示
  showBaiwen: boolean;
  showOkurigana: boolean;
  showKaeriten: boolean;
  kaeritenColor: 'red' | 'ink';
  whiteTextSize: number;       // px (default 22)
  okuriganaTextSize: number;   // px (default 11)
  kaeritenTextSize: number;    // px (default 10)
  columnGap: number;           // px (default 8)
  blockGap: number;            // px (default 4)
  contentPadding: number;      // px (default 16)
  zoomScale: number;           // % (default 100)

  // B. 日本語訳・注釈
  translationMode: TranslationDisplayMode; // 'hidden' | 'always' | 'tap'
  translationType: TranslationDisplayType; // 'inline' | 'popup'
  translationTextColor: string; // hex color e.g. '#4b5563'
  translationTextSize: number; // px (default 12)
  annotationTextSize: number;  // px (default 11)
  leadTextSize: number;        // px (default 13)
  noteGap: number;             // px (default 3)
  showAnnotation: boolean;
  showLead: boolean;

  // C. 音読カウンター
  showCounter: boolean;
  counterTextSize: number;     // px (default 13)
  countButtonWidth: number;    // px (default 44)
  countButtonHeight: number;   // px (default 26)
  countButtonTextSize: number; // px (default 11)
  counterGap: number;          // px (default 6)
  counterPosition: 'top-left' | 'top-right' | 'top-center';

  // D. 画面レイアウト
  headerHeight: number;        // px (default 44)
  headerTitleTextSize: number; // px (default 14)
  marginX: number;             // px (default 16)
  marginY: number;             // px (default 12)

  // E. 操作設定
  instantApply: boolean;

  // Compatibility flags (kept for existing code references)
  showModernTranslation?: boolean;
  fontSize?: 'sm' | 'md' | 'lg' | 'xl';
  viewMode?: 'traditional' | 'section-by-section';
}

export interface ValidationResult {
  valid: boolean;
  document?: KanbunDocument;
  errors: string[];
  warnings: string[];
}
