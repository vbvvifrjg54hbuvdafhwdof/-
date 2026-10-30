/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { KanbunDocument, KanbunSection, KanbunToken, ValidationResult } from '../types/kanbun';

const PUNCTUATION_REGEX = /[、。，．「」『』()（）！？…―─]/;
const KANA_REGEX = /[\u3040-\u309f\u30a0-\u30ff]/;
const KANJI_REGEX = /[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff]/;

/**
 * Tokenizes a section into structured tokens with character, okurigana, and kaeriten.
 */
export function buildTokensForSection(section: KanbunSection): KanbunToken[] {
  // If tokens are already explicitly provided in the section, sanitize and return them
  if (Array.isArray(section.tokens) && section.tokens.length > 0) {
    return section.tokens.map(t => ({
      char: String(t.char || ''),
      okurigana: t.okurigana ? String(t.okurigana) : '',
      kaeriten: Array.isArray(t.kaeriten) ? t.kaeriten.map(String) : [],
      isPunctuation: PUNCTUATION_REGEX.test(t.char || ''),
    }));
  }

  const tokens: KanbunToken[] = [];
  const kaeritenMap: { text: string; marks: string[] }[] = Array.isArray(section.kaeriten)
    ? [...section.kaeriten]
    : [];

  // Parse okurigana text if present
  const okuriText = (section.okurigana || '').trim();
  const baiwenText = (section.baiwen || '').trim();

  if (okuriText) {
    let i = 0;
    while (i < okuriText.length) {
      const char = okuriText[i];

      // Handle punctuation
      if (PUNCTUATION_REGEX.test(char)) {
        tokens.push({
          char,
          okurigana: '',
          kaeriten: [],
          isPunctuation: true,
        });
        i++;
        continue;
      }

      // Handle whitespace
      if (/\s/.test(char)) {
        i++;
        continue;
      }

      // Collect base character and trailing kana
      let okurigana = '';
      let j = i + 1;
      while (j < okuriText.length && KANA_REGEX.test(okuriText[j])) {
        okurigana += okuriText[j];
        j++;
      }

      // Match kaeriten for this character if available
      let kaeriten: string[] = [];
      const matchIdx = kaeritenMap.findIndex(k => k.text === char);
      if (matchIdx !== -1) {
        kaeriten = [...kaeritenMap[matchIdx].marks];
        kaeritenMap.splice(matchIdx, 1); // Consume the match
      }

      tokens.push({
        char,
        okurigana,
        kaeriten,
        isPunctuation: false,
      });

      i = j;
    }
  } else if (baiwenText) {
    // Fallback: tokenize from baiwen directly
    for (let i = 0; i < baiwenText.length; i++) {
      const char = baiwenText[i];
      if (/\s/.test(char)) continue;

      const isPunct = PUNCTUATION_REGEX.test(char);
      let kaeriten: string[] = [];
      if (!isPunct) {
        const matchIdx = kaeritenMap.findIndex(k => k.text === char);
        if (matchIdx !== -1) {
          kaeriten = [...kaeritenMap[matchIdx].marks];
          kaeritenMap.splice(matchIdx, 1);
        }
      }

      tokens.push({
        char,
        okurigana: '',
        kaeriten,
        isPunctuation: isPunct,
      });
    }
  }

  return tokens;
}

/**
 * Validates and normalizes raw JSON data into a KanbunDocument.
 */
export function validateAndParseKanbun(rawInput: string | unknown): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  let parsed: Record<string, unknown>;

  if (typeof rawInput === 'string') {
    try {
      parsed = JSON.parse(rawInput);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      return {
        valid: false,
        errors: [`JSON形式の構文エラー: ${message}`],
        warnings: [],
      };
    }
  } else if (typeof rawInput === 'object' && rawInput !== null) {
    parsed = rawInput as Record<string, unknown>;
  } else {
    return {
      valid: false,
      errors: ['インポートデータがオブジェクト形式ではありません。'],
      warnings: [],
    };
  }

  // Check schema_version
  if (!parsed.schema_version) {
    warnings.push('schema_version が指定されていません（デフォルトで "1.0" とみなします）。');
  } else if (typeof parsed.schema_version !== 'string') {
    errors.push('schema_version は文字列型である必要があります。');
  }

  // Check title
  if (!parsed.title || typeof parsed.title !== 'string' || parsed.title.trim().length === 0) {
    errors.push('title（教材名）が存在しないか、空の文字列です。');
  }

  // Check lead (optional)
  if (parsed.lead !== undefined && typeof parsed.lead !== 'string') {
    errors.push('lead（リード文）は文字列型である必要があります。');
  }

  // Check sections
  if (!Array.isArray(parsed.sections)) {
    errors.push('sections（意味区分の配列）が存在しないか、配列形式ではありません。');
  } else if (parsed.sections.length === 0) {
    errors.push('sections に意味区分が1つも含まれていません。');
  }

  if (errors.length > 0) {
    return {
      valid: false,
      errors,
      warnings,
    };
  }

  // Validate individual sections
  const existingIds = new Set<string>();
  const normalizedSections: KanbunSection[] = [];

  const rawSections = parsed.sections as Array<Record<string, unknown>>;
  rawSections.forEach((sec, idx) => {
    const secNum = idx + 1;
    if (typeof sec !== 'object' || sec === null) {
      errors.push(`区分 #${secNum}: オブジェクト形式ではありません。`);
      return;
    }

    // ID check
    const id = typeof sec.id === 'string' && sec.id.trim() ? sec.id.trim() : `s${String(secNum).padStart(3, '0')}`;
    if (existingIds.has(id)) {
      errors.push(`区分 #${secNum}: ID "${id}" が他の区分と重複しています。`);
    }
    existingIds.add(id);

    // Baiwen / Okurigana check
    const baiwen = typeof sec.baiwen === 'string' ? sec.baiwen : '';
    const okurigana = typeof sec.okurigana === 'string' ? sec.okurigana : '';

    if (!baiwen && !okurigana) {
      warnings.push(`区分 #${secNum} (ID: ${id}): baiwen（白文）と okurigana（送り仮名）の双方が空です。`);
    }

    // Kaeriten check
    const kaeriten = Array.isArray(sec.kaeriten)
      ? sec.kaeriten.map((k: unknown) => {
          if (typeof k === 'object' && k !== null) {
            const item = k as Record<string, unknown>;
            return {
              text: typeof item.text === 'string' ? item.text : '',
              marks: Array.isArray(item.marks) ? item.marks.map(String) : [],
            };
          }
          return { text: '', marks: [] };
        })
      : [];

    const modernTranslation = typeof sec.modern_translation === 'string' ? sec.modern_translation : '';
    const annotation = typeof sec.annotation === 'string' ? sec.annotation : '';

    const currentSection: KanbunSection = {
      id,
      baiwen,
      okurigana,
      kaeriten,
      modern_translation: modernTranslation,
      annotation,
    };

    // Pre-calculate structured tokens
    currentSection.tokens = buildTokensForSection(currentSection);

    normalizedSections.push(currentSection);
  });

  if (errors.length > 0) {
    return {
      valid: false,
      errors,
      warnings,
    };
  }

  const document: KanbunDocument = {
    schema_version: String(parsed.schema_version || '1.0'),
    id: typeof parsed.id === 'string' && parsed.id ? parsed.id : `doc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    title: String(parsed.title).trim(),
    folderId: typeof parsed.folderId === 'string' ? parsed.folderId : null,
    lead: typeof parsed.lead === 'string' ? parsed.lead : '',
    sections: normalizedSections,
    source: typeof parsed.source === 'string' ? parsed.source : undefined,
    createdAt: typeof parsed.createdAt === 'number' ? parsed.createdAt : Date.now(),
    updatedAt: Date.now(),
  };

  return {
    valid: true,
    document,
    errors: [],
    warnings,
  };
}

/**
 * Formats a KanbunDocument back into a pristine JSON string for export.
 */
export function exportDocumentAsJson(doc: KanbunDocument): string {
  const exportPayload = {
    schema_version: doc.schema_version || '1.0',
    title: doc.title,
    lead: doc.lead || '',
    sections: doc.sections.map(sec => ({
      id: sec.id,
      baiwen: sec.baiwen,
      okurigana: sec.okurigana,
      kaeriten: sec.kaeriten,
      modern_translation: sec.modern_translation,
      annotation: sec.annotation,
    })),
  };
  return JSON.stringify(exportPayload, null, 2);
}
