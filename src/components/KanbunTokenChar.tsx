/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { KanbunToken, DisplaySettings } from '../types/kanbun';

interface KanbunTokenCharProps {
  token: KanbunToken;
  settings: DisplaySettings;
}

export const KanbunTokenChar: React.FC<KanbunTokenCharProps> = ({ token, settings }) => {
  const { char, okurigana, kaeriten, isPunctuation } = token;

  const whiteSize = settings.whiteTextSize || 22;
  const okuriSize = settings.okuriganaTextSize || 11;
  const kaeriSize = settings.kaeritenTextSize || 10;

  // Punctuation characters (、, 。, 「, 」, etc.)
  if (isPunctuation) {
    return (
      <span
        className="inline-block text-black font-serif select-text leading-none my-[-0.15em] self-center"
        style={{ fontSize: `${whiteSize}px` }}
      >
        {char}
      </span>
    );
  }

  const hasOkurigana = Boolean(okurigana && okurigana.trim());
  const hasKaeriten = Boolean(kaeriten && kaeriten.length > 0);

  const renderOkuri = settings.showOkurigana && hasOkurigana;
  const renderKaeri = settings.showKaeriten && hasKaeriten;

  const kaeritenColorClass =
    settings.kaeritenColor === 'red'
      ? 'text-red-700 font-bold'
      : 'text-black font-semibold';

  // In pure Hakubun, compact natural line
  if (!renderOkuri && !renderKaeri) {
    return (
      <span
        className="inline-block text-black font-serif font-medium leading-none select-text my-[0.1em]"
        style={{ fontSize: `${whiteSize}px` }}
      >
        {char}
      </span>
    );
  }

  // With Okurigana or Kaeriten annotations
  return (
    <span
      className="relative inline-flex items-center justify-center font-serif select-text"
      style={{
        fontSize: `${whiteSize}px`,
        minHeight: '1.4em',
        minWidth: renderOkuri || renderKaeri ? '1.45em' : '1.1em',
      }}
    >
      {/* Main Kanji Character */}
      <span className="text-black font-medium leading-none z-10">
        {char}
      </span>

      {/* Okurigana (Right side of Kanji) */}
      {renderOkuri && (
        <span
          className="absolute -right-[0.9em] bottom-[-0.05em] leading-tight text-neutral-800 font-normal tracking-tighter select-text"
          style={{
            fontSize: `${okuriSize}px`,
            writingMode: 'vertical-rl',
            whiteSpace: 'nowrap',
          }}
          title={`送り仮名: ${okurigana}`}
        >
          {okurigana}
        </span>
      )}

      {/* Kaeriten (Left side of Kanji) */}
      {renderKaeri && (
        <span
          className={`absolute -left-[0.8em] bottom-[-0.08em] leading-tight ${kaeritenColorClass} tracking-tighter select-text`}
          style={{
            fontSize: `${kaeriSize}px`,
            writingMode: 'vertical-rl',
            whiteSpace: 'nowrap',
          }}
          title={`返り点: ${kaeriten?.join('')}`}
        >
          {kaeriten?.join('')}
        </span>
      )}
    </span>
  );
};
