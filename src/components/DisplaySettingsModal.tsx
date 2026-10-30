/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  X,
  Sliders,
  Type,
  Languages,
  Hash,
  Layout,
  RotateCcw,
  Sparkles,
  Check,
} from 'lucide-react';
import { DisplaySettings } from '../types/kanbun';
import { resetToDefaultSettings } from '../utils/storage';

interface DisplaySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: DisplaySettings;
  onChangeSettings: (newSettings: DisplaySettings) => void;
}

type TabKey = 'body' | 'translation' | 'counter' | 'layout' | 'presets';

export const DisplaySettingsModal: React.FC<DisplaySettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onChangeSettings,
}) => {
  const [activeTab, setActiveTab] = useState<TabKey>('body');
  const [resetFeedback, setResetFeedback] = useState(false);

  if (!isOpen) return null;

  const updateSetting = <K extends keyof DisplaySettings>(key: K, value: DisplaySettings[K]) => {
    onChangeSettings({
      ...settings,
      [key]: value,
    });
  };

  const handleReset = () => {
    const defaults = resetToDefaultSettings();
    onChangeSettings(defaults);
    setResetFeedback(true);
    setTimeout(() => setResetFeedback(false), 2000);
  };

  // Quick Presets
  const applyPreset = (presetName: 'all' | 'kundoku' | 'minimal-kaeri' | 'hakubun' | 'tap-study') => {
    switch (presetName) {
      case 'all':
        onChangeSettings({
          ...settings,
          showBaiwen: true,
          showOkurigana: true,
          showKaeriten: true,
          translationMode: 'always',
          translationType: 'inline',
          showAnnotation: true,
          showLead: true,
        });
        break;
      case 'tap-study':
        onChangeSettings({
          ...settings,
          showBaiwen: true,
          showOkurigana: true,
          showKaeriten: true,
          translationMode: 'tap',
          translationType: 'inline',
          showAnnotation: true,
          showLead: true,
        });
        break;
      case 'kundoku':
        onChangeSettings({
          ...settings,
          showBaiwen: true,
          showOkurigana: true,
          showKaeriten: true,
          translationMode: 'hidden',
          showAnnotation: false,
          showLead: true,
        });
        break;
      case 'minimal-kaeri':
        onChangeSettings({
          ...settings,
          showBaiwen: true,
          showOkurigana: false,
          showKaeriten: true,
          translationMode: 'hidden',
          showAnnotation: false,
          showLead: true,
        });
        break;
      case 'hakubun':
        onChangeSettings({
          ...settings,
          showBaiwen: true,
          showOkurigana: false,
          showKaeriten: false,
          translationMode: 'hidden',
          showAnnotation: false,
          showLead: true,
        });
        break;
    }
  };

  // Helper for Slider + Number Input pair
  const renderSliderNumber = (
    label: string,
    description: string,
    key: keyof DisplaySettings,
    min: number,
    max: number,
    unit = 'px'
  ) => {
    const val = (settings[key] as number) ?? min;
    return (
      <div className="space-y-1.5 p-2.5 bg-white border border-stone-200 rounded-md shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="font-serif font-bold text-xs text-stone-900">{label}</span>
          <div className="flex items-center gap-1">
            <input
              type="number"
              min={min}
              max={max}
              value={val}
              onChange={(e) => {
                const num = parseInt(e.target.value, 10);
                if (!isNaN(num)) {
                  updateSetting(key, Math.min(max, Math.max(min, num)) as never);
                }
              }}
              className="w-14 px-1.5 py-0.5 text-xs text-right font-mono border border-stone-300 rounded focus:border-amber-700 focus:outline-none"
            />
            <span className="text-[11px] text-stone-500 font-sans w-5">{unit}</span>
          </div>
        </div>
        <p className="text-[11px] text-stone-500 font-sans">{description}</p>
        <input
          type="range"
          min={min}
          max={max}
          value={val}
          onChange={(e) => updateSetting(key, parseInt(e.target.value, 10) as never)}
          className="w-full h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-amber-800"
        />
      </div>
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="display-settings-title"
    >
      <div className="bg-[#fcfaf7] border border-stone-300 rounded-lg max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-stone-200 bg-stone-100/70">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-amber-100 text-amber-800 rounded-md">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 id="display-settings-title" className="text-base font-bold text-stone-900 font-serif">
                詳細表示・オプション設定
              </h2>
              <p className="text-xs text-stone-600 font-sans">
                文字サイズ、余白、カウンター、タップ訳など細部を自由に調整
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

        {/* Tab Navigation */}
        <div className="flex border-b border-stone-200 bg-stone-50 px-2 overflow-x-auto select-none">
          <button
            type="button"
            onClick={() => setActiveTab('body')}
            className={`px-3 py-2 text-xs font-serif font-bold flex items-center gap-1.5 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'body'
                ? 'border-amber-800 text-amber-900 bg-white/70'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <Type className="w-3.5 h-3.5" />
            <span>A. 本文・訓点</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('translation')}
            className={`px-3 py-2 text-xs font-serif font-bold flex items-center gap-1.5 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'translation'
                ? 'border-amber-800 text-amber-900 bg-white/70'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <Languages className="w-3.5 h-3.5" />
            <span>B. 訳・注釈</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('counter')}
            className={`px-3 py-2 text-xs font-serif font-bold flex items-center gap-1.5 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'counter'
                ? 'border-amber-800 text-amber-900 bg-white/70'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <Hash className="w-3.5 h-3.5" />
            <span>C. カウンター</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('layout')}
            className={`px-3 py-2 text-xs font-serif font-bold flex items-center gap-1.5 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'layout'
                ? 'border-amber-800 text-amber-900 bg-white/70'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <Layout className="w-3.5 h-3.5" />
            <span>D. レイアウト</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('presets')}
            className={`px-3 py-2 text-xs font-serif font-bold flex items-center gap-1.5 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'presets'
                ? 'border-amber-800 text-amber-900 bg-white/70'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>プリセット・初期化</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* TAB A: 本文・訓点 */}
          {activeTab === 'body' && (
            <div className="space-y-4">
              {/* Element switches */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <label className="flex items-center justify-between p-2.5 bg-white border border-stone-200 rounded-md hover:bg-stone-50 cursor-pointer shadow-2xs">
                  <span className="font-serif font-bold text-xs text-stone-900">白文（漢字原文）</span>
                  <input
                    type="checkbox"
                    checked={settings.showBaiwen}
                    onChange={(e) => updateSetting('showBaiwen', e.target.checked)}
                    className="w-4 h-4 text-amber-700 rounded border-stone-300 focus:ring-amber-700"
                  />
                </label>

                <label className="flex items-center justify-between p-2.5 bg-white border border-stone-200 rounded-md hover:bg-stone-50 cursor-pointer shadow-2xs">
                  <span className="font-serif font-bold text-xs text-stone-900">送り仮名</span>
                  <input
                    type="checkbox"
                    checked={settings.showOkurigana}
                    onChange={(e) => updateSetting('showOkurigana', e.target.checked)}
                    className="w-4 h-4 text-amber-700 rounded border-stone-300 focus:ring-amber-700"
                  />
                </label>

                <label className="flex items-center justify-between p-2.5 bg-white border border-stone-200 rounded-md hover:bg-stone-50 cursor-pointer shadow-2xs">
                  <span className="font-serif font-bold text-xs text-stone-900">返り点</span>
                  <input
                    type="checkbox"
                    checked={settings.showKaeriten}
                    onChange={(e) => updateSetting('showKaeriten', e.target.checked)}
                    className="w-4 h-4 text-amber-700 rounded border-stone-300 focus:ring-amber-700"
                  />
                </label>
              </div>

              {/* Kaeriten color */}
              <div className="p-2.5 bg-white border border-stone-200 rounded-md shadow-2xs space-y-1.5">
                <span className="font-serif font-bold text-xs text-stone-900">返り点の色</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => updateSetting('kaeritenColor', 'red')}
                    className={`py-1.5 text-xs font-medium rounded border flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                      settings.kaeritenColor === 'red'
                        ? 'bg-amber-800 text-white border-amber-800 shadow-2xs'
                        : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-100'
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-red-600 inline-block"></span>
                    <span>伝統朱色（朱点）</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => updateSetting('kaeritenColor', 'ink')}
                    className={`py-1.5 text-xs font-medium rounded border flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                      settings.kaeritenColor === 'ink'
                        ? 'bg-amber-800 text-white border-amber-800 shadow-2xs'
                        : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-100'
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-stone-900 inline-block"></span>
                    <span>墨色（モノクロ）</span>
                  </button>
                </div>
              </div>

              {/* Sliders */}
              <div className="space-y-3">
                {renderSliderNumber('白文字サイズ', '漢文本文の漢字の大きさ', 'whiteTextSize', 14, 48)}
                {renderSliderNumber('送り仮名サイズ', '漢字右上の送り仮名の大きさ', 'okuriganaTextSize', 8, 24)}
                {renderSliderNumber('返り点サイズ', '漢字左下の返り点（一二点・レ点等）の大きさ', 'kaeritenTextSize', 7, 20)}
                {renderSliderNumber('行間（列間隔）', '縦書きの列と列の間隔（狭くして自然に連続）', 'columnGap', 4, 28)}
                {renderSliderNumber('意味ブロック間隔', '意味ブロック同士の間隔', 'blockGap', 2, 20)}
                {renderSliderNumber('表示領域の余白', '本文全体の余白パディング', 'contentPadding', 8, 32)}
                {renderSliderNumber('拡大倍率', '本文全体の拡大縮小表示', 'zoomScale', 50, 200, '%')}
              </div>
            </div>
          )}

          {/* TAB B: 訳・注釈 */}
          {activeTab === 'translation' && (
            <div className="space-y-4">
              {/* 1. タップで訳表示 / 常時 / 非表示 3モード排他 */}
              <div className="p-3 bg-white border border-stone-200 rounded-md shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-serif font-bold text-xs text-stone-900">
                    日本語訳の表示モード
                  </span>
                  <span className="text-[10px] font-sans font-semibold bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded">
                    3モード排他
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => updateSetting('translationMode', 'hidden')}
                    className={`py-2 px-1 text-xs font-medium rounded border flex flex-col items-center justify-center transition-colors cursor-pointer ${
                      settings.translationMode === 'hidden'
                        ? 'bg-amber-800 text-white border-amber-800 shadow-2xs font-bold'
                        : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-100'
                    }`}
                  >
                    <span>非表示</span>
                    <span className="text-[10px] opacity-80 mt-0.5">音読に集中</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => updateSetting('translationMode', 'tap')}
                    className={`py-2 px-1 text-xs font-medium rounded border flex flex-col items-center justify-center transition-colors cursor-pointer ${
                      settings.translationMode === 'tap'
                        ? 'bg-amber-800 text-white border-amber-800 shadow-2xs font-bold ring-2 ring-amber-600/30'
                        : 'bg-amber-50/70 text-amber-900 border-amber-300 hover:bg-amber-100'
                    }`}
                  >
                    <span className="font-bold">タップで訳表示</span>
                    <span className="text-[10px] opacity-80 mt-0.5">文を押すと表示</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => updateSetting('translationMode', 'always')}
                    className={`py-2 px-1 text-xs font-medium rounded border flex flex-col items-center justify-center transition-colors cursor-pointer ${
                      settings.translationMode === 'always'
                        ? 'bg-amber-800 text-white border-amber-800 shadow-2xs font-bold'
                        : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-100'
                    }`}
                  >
                    <span>常時表示</span>
                    <span className="text-[10px] opacity-80 mt-0.5">常にすべて表示</span>
                  </button>
                </div>
              </div>

              {/* 2. 訳の表示形式（インライン vs ポップアップ） */}
              {settings.translationMode !== 'hidden' && (
                <div className="p-3 bg-white border border-stone-200 rounded-md shadow-2xs space-y-2">
                  <span className="font-serif font-bold text-xs text-stone-900">
                    訳の表示形式
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => updateSetting('translationType', 'inline')}
                      className={`py-2 text-xs font-medium rounded border flex flex-col items-center justify-center transition-colors cursor-pointer ${
                        settings.translationType === 'inline'
                          ? 'bg-amber-800 text-white border-amber-800 shadow-2xs'
                          : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-100'
                      }`}
                    >
                      <span className="font-bold">インライン表示（推奨）</span>
                      <span className="text-[10px] opacity-80 mt-0.5">文の隣に縦書きで流れる</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => updateSetting('translationType', 'popup')}
                      className={`py-2 text-xs font-medium rounded border flex flex-col items-center justify-center transition-colors cursor-pointer ${
                        settings.translationType === 'popup'
                          ? 'bg-amber-800 text-white border-amber-800 shadow-2xs'
                          : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-100'
                      }`}
                    >
                      <span className="font-bold">ポップアップ表示</span>
                      <span className="text-[10px] opacity-80 mt-0.5">画面下部に窓で表示</span>
                    </button>
                  </div>
                </div>
              )}

              {/* 3. 現代語訳の文字色設定 */}
              <div className="p-3 bg-white border border-stone-200 rounded-md shadow-2xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-serif font-bold text-xs text-stone-900">
                      現代語訳の文字色
                    </span>
                    <p className="text-[10px] text-stone-500 font-sans">
                      白地・白文本文と自然に調和する訳文専用の文字色を設定
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={settings.translationTextColor || '#4b5563'}
                      onChange={(e) => updateSetting('translationTextColor', e.target.value)}
                      className="w-7 h-7 rounded border border-stone-300 cursor-pointer p-0.5 bg-white"
                      title="カラーピッカーで色を選択"
                    />
                    <span className="text-xs font-mono text-stone-600 uppercase">
                      {settings.translationTextColor || '#4b5563'}
                    </span>
                  </div>
                </div>

                {/* Quick Preset Color Swatches */}
                <div>
                  <span className="text-[10px] text-stone-500 block mb-1">推奨プリセット：</span>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                    {[
                      { name: '濃灰（標準）', color: '#4b5563' },
                      { name: '墨色', color: '#374151' },
                      { name: '純黒', color: '#111827' },
                      { name: '濃藍', color: '#1e3a8a' },
                      { name: '焦茶', color: '#78350f' },
                      { name: '深緑', color: '#14532d' },
                    ].map((preset) => {
                      const isSelected = (settings.translationTextColor || '#4b5563').toLowerCase() === preset.color.toLowerCase();
                      return (
                        <button
                          key={preset.color}
                          type="button"
                          onClick={() => updateSetting('translationTextColor', preset.color)}
                          className={`flex items-center gap-1.5 px-2 py-1 rounded text-[11px] border transition-colors cursor-pointer ${
                            isSelected
                              ? 'border-amber-800 bg-amber-50/80 font-bold text-amber-950 ring-1 ring-amber-700/40'
                              : 'border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100'
                          }`}
                        >
                          <span
                            className="w-3 h-3 rounded-full shrink-0 border border-black/15 shadow-2xs"
                            style={{ backgroundColor: preset.color }}
                          />
                          <span className="truncate">{preset.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Toggles for Note and Lead */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <label className="flex items-center justify-between p-2.5 bg-white border border-stone-200 rounded-md hover:bg-stone-50 cursor-pointer shadow-2xs">
                  <div>
                    <span className="font-serif font-bold text-xs text-stone-900">注釈（語釈）を表示</span>
                    <p className="text-[10px] text-stone-500">語句・故事・官職の解説（縦書き表示）</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.showAnnotation}
                    onChange={(e) => updateSetting('showAnnotation', e.target.checked)}
                    className="w-4 h-4 text-amber-700 rounded border-stone-300 focus:ring-amber-700"
                  />
                </label>

                <label className="flex items-center justify-between p-2.5 bg-white border border-stone-200 rounded-md hover:bg-stone-50 cursor-pointer shadow-2xs">
                  <div>
                    <span className="font-serif font-bold text-xs text-stone-900">リード文を表示</span>
                    <p className="text-[10px] text-stone-500">大学入試問題の導入説明</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.showLead}
                    onChange={(e) => updateSetting('showLead', e.target.checked)}
                    className="w-4 h-4 text-amber-700 rounded border-stone-300 focus:ring-amber-700"
                  />
                </label>
              </div>

              {/* Dimension sliders */}
              <div className="space-y-3">
                {renderSliderNumber('訳の文字サイズ', '日本語訳の文字の大きさ', 'translationTextSize', 10, 24)}
                {renderSliderNumber('注釈の文字サイズ', '語釈・注釈の文字の大きさ', 'annotationTextSize', 9, 20)}
                {renderSliderNumber('リード文の文字サイズ', '導入リード文の文字の大きさ', 'leadTextSize', 10, 20)}
                {renderSliderNumber('注釈・訳との間隔', '本文と訳・注釈の間隔', 'noteGap', 2, 16)}
              </div>
            </div>
          )}

          {/* TAB C: カウンター */}
          {activeTab === 'counter' && (
            <div className="space-y-4">
              <label className="flex items-center justify-between p-2.5 bg-white border border-stone-200 rounded-md hover:bg-stone-50 cursor-pointer shadow-2xs">
                <div>
                  <span className="font-serif font-bold text-xs text-stone-900">音読カウンターを表示</span>
                  <p className="text-[10px] text-stone-500">画面上の音読回数スタンプと加算ボタン</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.showCounter}
                  onChange={(e) => updateSetting('showCounter', e.target.checked)}
                  className="w-4 h-4 text-amber-700 rounded border-stone-300 focus:ring-amber-700"
                />
              </label>

              {/* Counter Position */}
              <div className="p-2.5 bg-white border border-stone-200 rounded-md shadow-2xs space-y-1.5">
                <span className="font-serif font-bold text-xs text-stone-900">カウンターの配置位置</span>
                <div className="grid grid-cols-3 gap-2">
                  {(['top-left', 'top-center', 'top-right'] as const).map(pos => {
                    const labelMap = {
                      'top-left': '左上（標準）',
                      'top-center': '中央上',
                      'top-right': '右上',
                    };
                    const isSelected = (settings.counterPosition || 'top-left') === pos;
                    return (
                      <button
                        key={pos}
                        type="button"
                        onClick={() => updateSetting('counterPosition', pos)}
                        className={`py-1.5 text-xs font-medium rounded border transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-amber-800 text-white border-amber-800 shadow-2xs font-bold'
                            : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-100'
                        }`}
                      >
                        {labelMap[pos]}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Independent Button Width and Height Sliders */}
              <div className="space-y-3">
                {renderSliderNumber('加算ボタンの幅（横幅）', '＋ボタンの横幅サイズ（個別設定可能）', 'countButtonWidth', 20, 100)}
                {renderSliderNumber('加算ボタンの高さ（縦幅）', '＋ボタンの縦幅サイズ（個別設定可能）', 'countButtonHeight', 16, 80)}
                {renderSliderNumber('加算ボタンの文字サイズ', '＋記号のアイコン・文字サイズ', 'countButtonTextSize', 9, 20)}
                {renderSliderNumber('回数数字の文字サイズ', '現在の音読回数の数字サイズ', 'counterTextSize', 10, 24)}
                {renderSliderNumber('カウンター内部間隔', 'スタンプ内の要素間隔', 'counterGap', 2, 20)}
              </div>
            </div>
          )}

          {/* TAB D: レイアウト */}
          {activeTab === 'layout' && (
            <div className="space-y-4">
              <div className="space-y-3">
                {renderSliderNumber('ヘッダー問題題名の文字サイズ', '右端「〔問題〕...」の文字サイズ', 'headerTitleTextSize', 11, 24)}
                {renderSliderNumber('左右外側マージン (X)', '画面全体の左右外側余白', 'marginX', 4, 48)}
                {renderSliderNumber('上下外側マージン (Y)', '画面全体の上下外側余白', 'marginY', 4, 48)}
              </div>
            </div>
          )}

          {/* TAB E: プリセット・初期化 */}
          {activeTab === 'presets' && (
            <div className="space-y-5">
              <div>
                <span className="block text-xs font-serif font-bold text-stone-800 mb-2">
                  学習段階別クイックプリセット
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => applyPreset('tap-study')}
                    className="p-2.5 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded shadow-2xs text-left transition-colors cursor-pointer"
                  >
                    <div className="font-bold text-xs text-amber-950">① タップで訳表示（学習おすすめ）</div>
                    <div className="text-[10px] text-amber-800">訓点表示 ＋ タップ時のみ訳を表示</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => applyPreset('all')}
                    className="p-2.5 bg-white hover:bg-stone-50 border border-stone-300 rounded shadow-2xs text-left transition-colors cursor-pointer"
                  >
                    <div className="font-bold text-xs text-stone-900">② 全表示</div>
                    <div className="text-[10px] text-stone-500">送り仮名・返り点・訳・注釈を常時表示</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => applyPreset('kundoku')}
                    className="p-2.5 bg-white hover:bg-stone-50 border border-stone-300 rounded shadow-2xs text-left transition-colors cursor-pointer"
                  >
                    <div className="font-bold text-xs text-stone-900">③ 訓読練習</div>
                    <div className="text-[10px] text-stone-500">送り仮名と返り点のみ表示</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => applyPreset('minimal-kaeri')}
                    className="p-2.5 bg-white hover:bg-stone-50 border border-stone-300 rounded shadow-2xs text-left transition-colors cursor-pointer"
                  >
                    <div className="font-bold text-xs text-stone-900">④ 返り点のみ</div>
                    <div className="text-[10px] text-stone-500">送り仮名なし・返り点のみで読解</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => applyPreset('hakubun')}
                    className="p-2.5 bg-white hover:bg-stone-50 border border-stone-300 rounded shadow-2xs text-left transition-colors cursor-pointer sm:col-span-2"
                  >
                    <div className="font-bold text-xs text-stone-900">⑤ 完全白文音読</div>
                    <div className="text-[10px] text-stone-500">一切の補助記号なし・漢字原文のみで音読</div>
                  </button>
                </div>
              </div>

              {/* Reset to defaults button */}
              <div className="pt-4 border-t border-stone-200">
                <div className="p-3 bg-stone-100 rounded-lg border border-stone-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="font-bold text-xs text-stone-900 font-serif block">
                      表示設定を初期状態に戻す
                    </span>
                    <span className="text-[11px] text-stone-600 font-sans block mt-0.5">
                      文字サイズや余白などの表示設定のみを標準値にリセットします（教材や音読回数は保持されます）。
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="shrink-0 px-3 py-1.5 text-xs font-bold text-rose-700 bg-white hover:bg-rose-50 border border-rose-300 rounded shadow-2xs flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>初期設定に戻す</span>
                  </button>
                </div>

                {resetFeedback && (
                  <div className="mt-2 p-2 bg-emerald-50 border border-emerald-200 rounded text-emerald-800 text-xs flex items-center gap-1.5 animate-in fade-in duration-100">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>表示設定を初期値にリセットしました</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-5 py-3 border-t border-stone-200 bg-stone-100/70 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-white bg-stone-800 hover:bg-stone-900 rounded transition-colors shadow-2xs cursor-pointer"
          >
            設定を閉じる
          </button>
        </div>
      </div>
    </div>
  );
};
