/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { validateAndParseKanbun, buildTokensForSection, exportDocumentAsJson } from './kanbunParser';
import { KanbunSection } from '../types/kanbun';

test('validateAndParseKanbun parses valid JSON with lead and sections', () => {
  const jsonStr = JSON.stringify({
    schema_version: '1.0',
    title: '学而篇第一',
    lead: '孔子とその弟子たちの問答を記録した『論語』の冒頭部分である。',
    sections: [
      {
        id: 's001',
        baiwen: '子曰、學而時習之、不亦說乎。',
        okurigana: '子曰ハク、學ビテ時ニ之ヲ習フ、不亦說バシカラズヤ。',
        kaeriten: [
          { text: '習', marks: ['二'] },
          { text: '之', marks: ['一'] },
        ],
        modern_translation: '先生がおっしゃった、「学んでは適当な時期に復習する、いかにも楽しいことではないか。」',
        annotation: '子：孔子の尊称。說：「悦」に通じ、よろこぶの意。',
      },
    ],
  });

  const res = validateAndParseKanbun(jsonStr);
  assert.equal(res.valid, true);
  assert.equal(res.errors.length, 0);
  assert.ok(res.document);
  assert.equal(res.document.title, '学而篇第一');
  assert.equal(res.document.lead, '孔子とその弟子たちの問答を記録した『論語』の冒頭部分である。');
  assert.equal(res.document.sections.length, 1);
  assert.equal(res.document.sections[0].id, 's001');
  assert.ok(res.document.sections[0].tokens && res.document.sections[0].tokens.length > 0);
});

test('validateAndParseKanbun detects malformed JSON syntax', () => {
  const malformed = '{"title": "Test", sections: [}';
  const res = validateAndParseKanbun(malformed);
  assert.equal(res.valid, false);
  assert.ok(res.errors[0].includes('JSON形式の構文エラー'));
});

test('validateAndParseKanbun rejects missing title and missing sections', () => {
  const noTitle = JSON.stringify({ schema_version: '1.0', sections: [] });
  const res1 = validateAndParseKanbun(noTitle);
  assert.equal(res1.valid, false);
  assert.ok(res1.errors.some(e => e.includes('title')));
  assert.ok(res1.errors.some(e => e.includes('sections に意味区分が1つも含まれていません')));
});

test('validateAndParseKanbun detects duplicate section IDs', () => {
  const dup = JSON.stringify({
    schema_version: '1.0',
    title: 'Duplicate Test',
    sections: [
      { id: 's001', baiwen: '文一', okurigana: '文一', modern_translation: '', annotation: '' },
      { id: 's001', baiwen: '文二', okurigana: '文二', modern_translation: '', annotation: '' },
    ],
  });
  const res = validateAndParseKanbun(dup);
  assert.equal(res.valid, false);
  assert.ok(res.errors.some(e => e.includes('重複')));
});

test('buildTokensForSection correctly extracts okurigana and kaeriten', () => {
  const sec: KanbunSection = {
    id: 's01',
    baiwen: '沛公軍霸上',
    okurigana: '沛公軍ス霸上ニ',
    kaeriten: [{ text: '軍', marks: ['レ'] }],
    modern_translation: '沛公は覇上に駐屯した。',
    annotation: '沛公：劉邦のこと。',
  };

  const tokens = buildTokensForSection(sec);
  assert.ok(tokens.length >= 4);

  // '軍' should have okurigana 'ス' and kaeriten ['レ']
  const gunToken = tokens.find(t => t.char === '軍');
  assert.ok(gunToken);
  assert.equal(gunToken.okurigana, 'ス');
  assert.deepEqual(gunToken.kaeriten, ['レ']);
});

test('exportDocumentAsJson produces valid round-trip JSON', () => {
  const parsed = validateAndParseKanbun(JSON.stringify({
    schema_version: '1.0',
    title: 'Export Test',
    lead: 'リード文テスト',
    sections: [
      {
        id: 's001',
        baiwen: '子曰',
        okurigana: '子曰ハク',
        kaeriten: [],
        modern_translation: '先生が言われた',
        annotation: '',
      },
    ],
  }));

  assert.equal(parsed.valid, true);
  if (!parsed.document) throw new Error('Document must exist');

  const exported = exportDocumentAsJson(parsed.document);
  const reimported = validateAndParseKanbun(exported);
  assert.equal(reimported.valid, true);
  assert.equal(reimported.document?.title, 'Export Test');
  assert.equal(reimported.document?.lead, 'リード文テスト');
  assert.equal(reimported.document?.sections.length, 1);
});
