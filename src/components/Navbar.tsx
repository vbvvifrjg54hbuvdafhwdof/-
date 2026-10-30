/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Sliders, Book, Sparkles, Upload, RotateCcw, Plus, Minus } from 'lucide-react';
import { DisplaySettings, KanbunDocument } from '../types/kanbun';

interface NavbarProps {
  currentDoc: KanbunDocument;
  readCount: number;
  onIncrementCount: () => void;
  onDecrementCount: () => void;
  onSetCount?: (count: number) => void;
  onOpenResetConfirm: () => void;
  onOpenLibrary: () => void;
  onOpenSettings: () => void;
  onOpenPrompt: () => void;
  onOpenImport: () => void;
  settings: DisplaySettings;
  onChangeSettings: (settings: DisplaySettings) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  readCount,
  onIncrementCount,
  onDecrementCount,
  onSetCount,
  onOpenResetConfirm,
  onOpenLibrary,
  onOpenSettings,
  onOpenPrompt,
  onOpenImport,
  settings,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(String(readCount));

  useEffect(() => {
    setEditValue(String(readCount));
  }, [readCount]);

  const handleEditSubmit = () => {
    const parsed = parseInt(editValue, 10);
    if (!isNaN(parsed) && parsed >= 0 && onSetCount) {
      onSetCount(parsed);
    } else {
      setEditValue(String(readCount));
    }
    setIsEditing(false);
  };

  const positionClasses = {
    'top-left': 'top-2 left-2',
    'top-right': 'top-2 right-2',
    'top-center': 'top-2 left-1/2 -translate-x-1/2',
  }[settings.counterPosition || 'top-left'];

  const buttonWidth = Math.max(20, Math.floor((settings.countButtonWidth || 44) / 2) - 1);
  const buttonHeight = settings.countButtonHeight || 26;
  const buttonFontSize = settings.countButtonTextSize || 11;

  return (
    <nav
      aria-label="操作メニュー"
      className={`fixed ${positionClasses} z-50 flex flex-col items-center select-none bg-white/95 p-1 rounded border border-neutral-300 shadow-2xs`}
      style={{
        gap: `${settings.counterGap || 6}px`,
      }}
    >
      {/* Vertical Recitation Counter Stamp */}
      {settings.showCounter && (
        <div
          className="flex flex-col items-center justify-center py-1 px-1 border border-neutral-400 rounded-xs bg-neutral-50 text-neutral-800"
          style={{
            minWidth: `${Math.max(44, (settings.countButtonWidth || 44) + 6)}px`,
            gap: `${Math.max(2, Math.floor((settings.counterGap || 6) / 2))}px`,
          }}
        >
          <span
            className="vertical-rl font-serif font-bold tracking-widest leading-none text-neutral-700"
            style={{ fontSize: `${settings.counterTextSize ? Math.max(9, settings.counterTextSize - 3) : 10}px` }}
          >
            音読
          </span>

          {/* Recitation count number - Click to edit directly */}
          {isEditing ? (
            <input
              type="number"
              min={0}
              autoFocus
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={handleEditSubmit}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleEditSubmit();
                if (e.key === 'Escape') {
                  setEditValue(String(readCount));
                  setIsEditing(false);
                }
              }}
              className="w-10 text-center font-serif font-black text-black bg-white border border-neutral-400 rounded-xs p-0 text-xs leading-none"
              style={{ fontSize: `${settings.counterTextSize || 13}px` }}
            />
          ) : (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="font-serif font-black text-black leading-tight hover:underline cursor-pointer"
              style={{ fontSize: `${settings.counterTextSize || 13}px` }}
              title="クリックして音読回数を直接入力"
              aria-label={`現在の音読回数: ${readCount}回。クリックして数値を変更`}
            >
              {readCount}
            </button>
          )}

          <span
            className="vertical-rl font-serif leading-none text-neutral-700"
            style={{ fontSize: `${settings.counterTextSize ? Math.max(9, settings.counterTextSize - 3) : 10}px` }}
          >
            回
          </span>

          {/* Bidirectional Counter: Decrement (-1) and Increment (+1) buttons */}
          <div className="flex items-center gap-1 mt-0.5">
            <button
              type="button"
              onClick={onDecrementCount}
              disabled={readCount <= 0}
              style={{
                width: `${buttonWidth}px`,
                height: `${buttonHeight}px`,
                fontSize: `${buttonFontSize}px`,
              }}
              className="flex items-center justify-center font-bold text-neutral-700 bg-neutral-200 hover:bg-neutral-300 disabled:opacity-30 disabled:hover:bg-neutral-200 active:scale-95 rounded-xs transition-colors cursor-pointer border border-neutral-300"
              title="音読回数を1減らす (-1)"
              aria-label="音読回数を1減らす"
            >
              <Minus className="w-3 h-3 stroke-[2.5]" />
            </button>

            <button
              type="button"
              onClick={onIncrementCount}
              style={{
                width: `${buttonWidth}px`,
                height: `${buttonHeight}px`,
                fontSize: `${buttonFontSize}px`,
              }}
              className="flex items-center justify-center font-bold text-white bg-black hover:bg-neutral-800 active:scale-95 rounded-xs transition-colors cursor-pointer shadow-2xs"
              title="音読回数を1増やす (+1)"
              aria-label="音読回数を1増やす"
            >
              <Plus className="w-3 h-3 stroke-[2.5]" />
            </button>
          </div>

          {/* Reset button */}
          <button
            type="button"
            onClick={onOpenResetConfirm}
            className="p-0.5 mt-0.5 text-neutral-400 hover:text-rose-600 transition-colors"
            title="音読回数をリセット"
            aria-label="音読回数をリセット"
          >
            <RotateCcw className="w-2.5 h-2.5" />
          </button>
        </div>
      )}

      {/* Discrete Tool Buttons */}
      <div className="flex flex-col items-center gap-1 w-full pt-1 border-t border-neutral-200">
        <button
          type="button"
          onClick={onOpenSettings}
          className="p-1.5 text-neutral-700 hover:text-black hover:bg-neutral-100 rounded transition-colors"
          title="詳細設定（文字サイズ・余白・カウンター・レイアウト）"
          aria-label="表示設定"
        >
          <Sliders className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={onOpenLibrary}
          className="p-1.5 text-neutral-700 hover:text-black hover:bg-neutral-100 rounded transition-colors"
          title="教材ライブラリ・フォルダ管理"
          aria-label="教材一覧"
        >
          <Book className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={onOpenPrompt}
          className="p-1.5 text-neutral-700 hover:text-black hover:bg-neutral-100 rounded transition-colors"
          title="AIプロンプト作成支援"
          aria-label="AIプロンプト作成支援"
        >
          <Sparkles className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={onOpenImport}
          className="p-1.5 text-neutral-700 hover:text-black hover:bg-neutral-100 rounded transition-colors"
          title="JSONインポート"
          aria-label="JSONインポート"
        >
          <Upload className="w-4 h-4" />
        </button>
      </div>
    </nav>
  );
};
