/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { DisplaySettings, KanbunDocument, KanbunSection } from '../types/kanbun';
import { KanbunTokenChar } from './KanbunTokenChar';
import { LeadTextView } from './LeadTextView';

interface ReadingViewProps {
  document: KanbunDocument;
  settings: DisplaySettings;
  readCount: number;
  onIncrementCount: () => void;
  onChangeSettings: (settings: DisplaySettings) => void;
}

/**
 * Strips display label prefixes such as 〔訳〕, 【訳】, 〔現代語訳〕, 【現代語訳】, (訳), （訳）, 現代語訳：
 * purely for display without mutating stored JSON data or meaningful content.
 */
export function cleanTranslationLabel(text?: string | null): string {
  if (!text) return '';
  let cleaned = text.trim();
  const labelRegex = /^[\s\u3000]*(?:[〔【(\uFF08\[](?:現代語訳|口語訳|通釈|訳)[〕】)\uFF09\]]|(?:現代語訳|口語訳|通釈|訳)[:：])[\s\u3000]*/u;
  while (labelRegex.test(cleaned)) {
    cleaned = cleaned.replace(labelRegex, '').trim();
  }
  return cleaned;
}

export const ReadingView: React.FC<ReadingViewProps> = ({
  document: doc,
  settings,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [tappedSectionId, setTappedSectionId] = useState<string | null>(null);

  // Close popup or tap mode translation when switching document
  useEffect(() => {
    setTappedSectionId(null);
  }, [doc.id]);

  // Handle continuous horizontal scrolling via mouse wheel (maps vertical wheel movement to horizontal scroll)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onWheel = (e: WheelEvent) => {
      // Map vertical mouse wheel to horizontal scroll when scrolling across vertical columns
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX) && container.scrollWidth > container.clientWidth) {
        container.scrollBy({ left: e.deltaY, behavior: 'auto' });
      }
    };

    container.addEventListener('wheel', onWheel, { passive: true });
    return () => container.removeEventListener('wheel', onWheel);
  }, []);

  const handleSectionClick = (section: KanbunSection) => {
    if (settings.translationMode === 'tap') {
      if (tappedSectionId === section.id) {
        setTappedSectionId(null);
      } else {
        setTappedSectionId(section.id);
      }
    }
  };

  const activeTappedSection = doc.sections.find(s => s.id === tappedSectionId);

  return (
    <main
      className="relative flex-1 w-full min-h-screen bg-white text-black flex flex-col justify-between select-text"
      style={{
        paddingTop: `${settings.marginY || 12}px`,
        paddingBottom: `${settings.marginY || 12}px`,
        paddingRight: `${settings.marginX || 16}px`,
        paddingLeft: `${Math.max(54, (settings.marginX || 16) + 40)}px`,
      }}
      onClick={() => {
        // If clicking outside any section while in popup tap mode, clear tapped section
        if (settings.translationMode === 'tap' && settings.translationType === 'popup') {
          setTappedSectionId(null);
        }
      }}
    >
      {/* Continuous Exam Paper Board - Horizontal continuous scroll with direction: rtl */}
      <div
        ref={containerRef}
        className="w-full flex-1 flex flex-col justify-start overflow-x-auto overflow-y-hidden select-text kanbun-exam-scroll"
        style={{
          direction: 'rtl',
          padding: `${settings.contentPadding || 16}px`,
        }}
      >
        {/* Continuous Kanbun Text Layout (リード文 ＋ 各意味ブロック) */}
        <div
          className="flex-1 flex flex-row-reverse items-start justify-start min-w-max max-h-[85vh]"
          style={{
            direction: 'ltr',
            transform: `scale(${(settings.zoomScale || 100) / 100})`,
            transformOrigin: 'top right',
          }}
        >
          {/* Title Column (Rightmost in Japanese Vertical flow) */}
          <div
            className="vertical-rl shrink-0 font-serif font-black tracking-widest text-black border-l-2 border-black pl-3 ml-3 select-text"
            style={{
              maxHeight: '100%',
              fontSize: `${settings.headerTitleTextSize || 14}px`,
              lineHeight: 1.8,
            }}
          >
            <span>〔問　題〕</span>
            <span className="font-semibold text-neutral-700 mt-2 text-xs">
              {doc.title}
            </span>
          </div>

          {/* Lead Text (リード文 - 縦書き・本文より小さく・一言一句そのまま) */}
          {doc.lead && (
            <LeadTextView
              lead={doc.lead}
              visible={settings.showLead}
              textSize={settings.leadTextSize}
              gap={settings.columnGap}
            />
          )}

          {/* Kanbun Sections: Continuous Right-to-Left vertical columns */}
          <div
            className="flex flex-row-reverse items-start font-serif tracking-[0.14em] text-black shrink-0"
            style={{ maxHeight: '100%' }}
          >
            {doc.sections.map((section, sIdx) => {
              const tokens = section.tokens || [];
              const isTapped = tappedSectionId === section.id;
              const isTapMode = settings.translationMode === 'tap';
              const hasTranslation = Boolean(section.modern_translation?.trim());

              // Modern translation is displayed immediately to the left of the Kanbun block.
              // In always mode or when tapped in tap mode, it is rendered snugly without wide wasted margins.
              const isTranslationVisible =
                hasTranslation &&
                settings.translationType === 'inline' &&
                (settings.translationMode === 'always' || (isTapMode && isTapped));

              return (
                <div
                  key={section.id}
                  data-section-id={section.id}
                  className="flex flex-col justify-between items-end shrink-0 select-text"
                  style={{
                    maxHeight: '100%',
                    marginLeft: `${settings.blockGap ?? 4}px`,
                  }}
                >
                  {/* Top: Kanbun text block + Modern Translation to its LEFT */}
                  <div
                    className="flex flex-row-reverse items-start flex-1 min-h-0"
                    style={{
                      gap: isTranslationVisible ? `${settings.noteGap ?? 3}px` : undefined,
                    }}
                  >
                    {/* 1. Main Kanbun Text (Right side in flex-row-reverse) */}
                    <div
                      onClick={(e) => {
                        if (isTapMode) {
                          e.stopPropagation();
                          handleSectionClick(section);
                        }
                      }}
                      className={`vertical-rl inline-block select-text transition-colors rounded-xs ${
                        isTapMode ? 'cursor-pointer hover:text-neutral-700' : ''
                      }`}
                      style={{
                        maxHeight: '100%',
                        columnGap: `${settings.columnGap ?? 8}px`,
                        lineHeight: `${Math.round((settings.whiteTextSize || 22) * 1.55)}px`,
                      }}
                      title={isTapMode ? 'タップで日本語訳を表示' : undefined}
                    >
                      {/* Semantic Block Indicator (Subtle number tag at start of section) */}
                      <span
                        className="inline text-[11px] font-sans font-bold text-neutral-400 select-none mr-0.5"
                        style={{
                          fontSize: `${Math.max(9, Math.round((settings.whiteTextSize || 22) * 0.42))}px`,
                        }}
                      >
                        ({sIdx + 1})
                      </span>

                      {/* Character tokens */}
                      {tokens.map((token, tIdx) => (
                        <KanbunTokenChar
                          key={`${section.id}_t_${tIdx}`}
                          token={token}
                          settings={settings}
                        />
                      ))}
                    </div>

                    {/* 2. Modern Translation: Rendered strictly to the LEFT of the Kanbun block.
                        Snug width, configurable text color, no yellow borders/backgrounds/highlights. */}
                    {isTranslationVisible && (
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isTapMode) setTappedSectionId(null);
                        }}
                        className="vertical-rl shrink-0 font-serif select-text cursor-pointer animate-in fade-in duration-100"
                        style={{
                          maxHeight: '100%',
                          maxWidth: '22px',
                          fontSize: `${settings.translationTextSize || 12}px`,
                          color: settings.translationTextColor || '#4b5563',
                          lineHeight: 1.35,
                          letterSpacing: '0.02em',
                          overflowY: 'auto',
                        }}
                        title={isTapMode ? 'タップで訳を閉じる' : undefined}
                      >
                        {cleanTranslationLabel(section.modern_translation)}
                      </div>
                    )}
                  </div>

                  {/* 3. Vertical Annotations: Positioned at the bottom of the section in vertical writing (vertical-rl) */}
                  {settings.showAnnotation && Boolean(section.annotation?.trim()) && (
                    <div
                      className="vertical-rl select-text font-serif text-neutral-600 shrink-0 mt-2 pt-1 border-t border-neutral-300"
                      style={{
                        maxHeight: '130px',
                        fontSize: `${settings.annotationTextSize || 11}px`,
                        lineHeight: 1.4,
                        letterSpacing: '0.02em',
                        columnGap: '4px',
                      }}
                    >
                      <span className="font-sans font-bold text-neutral-500 mr-0.5 select-none text-[10px]">
                        ※({sIdx + 1})
                      </span>
                      <span>{section.annotation}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Popup Translation Tooltip (when translationType === 'popup' in tap mode) */}
      {settings.translationMode === 'tap' &&
        settings.translationType === 'popup' &&
        activeTappedSection &&
        Boolean(activeTappedSection.modern_translation?.trim()) && (
          <div
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 max-w-lg w-[92%] sm:w-auto min-w-[280px] bg-white border border-neutral-300 rounded shadow-md p-3 font-serif animate-in fade-in slide-in-from-bottom-2 duration-150 select-text"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-1.5 border-b border-neutral-200 text-xs text-neutral-500">
              <span className="font-bold text-neutral-800 flex items-center gap-1">
                <span>現代語訳</span>
                <span className="font-normal text-neutral-500 text-[11px]">
                  （区分 {doc.sections.findIndex(s => s.id === activeTappedSection.id) + 1}）
                </span>
              </span>
              <button
                type="button"
                onClick={() => setTappedSectionId(null)}
                className="p-1 text-neutral-400 hover:text-black rounded cursor-pointer"
                title="閉じる"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div
              className="mt-2 leading-relaxed"
              style={{
                fontSize: `${settings.translationTextSize || 13}px`,
                color: settings.translationTextColor || '#4b5563',
              }}
            >
              {cleanTranslationLabel(activeTappedSection.modern_translation)}
            </div>
            {settings.showAnnotation && activeTappedSection.annotation?.trim() && (
              <div
                className="mt-2 pt-1.5 border-t border-neutral-200 text-neutral-600 text-xs"
                style={{ fontSize: `${settings.annotationTextSize || 11}px` }}
              >
                <span className="font-semibold text-neutral-700">注釈：</span>
                {activeTappedSection.annotation}
              </div>
            )}
          </div>
        )}
    </main>
  );
};
