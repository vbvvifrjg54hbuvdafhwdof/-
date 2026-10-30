/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Copy, Check, Sparkles, AlertCircle, FileText } from 'lucide-react';
import { KANBUN_SYSTEM_PROMPT } from '../utils/customPrompt';

interface PromptModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PromptModal: React.FC<PromptModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(KANBUN_SYSTEM_PROMPT);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      console.error('Failed to copy prompt:', e);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="prompt-modal-title"
    >
      <div className="bg-[#fcfaf7] border border-stone-300 rounded-lg max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-stone-200 bg-stone-100/70">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-amber-100 text-amber-800 rounded-md">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 id="prompt-modal-title" className="text-base font-bold text-stone-900 font-serif">
                外部AI用 カスタムプロンプト
              </h2>
              <p className="text-xs text-stone-600 font-sans">
                ChatGPTやGemini等に漢文問題文と併せて渡すことで、本アプリ用JSONを自動生成できます
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="モーダルを閉じる"
            className="text-stone-400 hover:text-stone-700 p-1 rounded-md hover:bg-stone-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Instructions banner */}
        <div className="px-5 py-2.5 bg-amber-50/80 border-b border-amber-200/60 flex items-start gap-2 text-xs text-amber-900">
          <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <strong>使い方:</strong> 「プロンプトをコピー」を押し、外部AI（ChatGPT, Gemini, Claude等）の入力欄に貼り付けた後、末尾に大学入試漢文の原文を貼り付けて送信してください。生成されたJSONをコピーして「JSONインポート」画面に貼り付ければ学習を開始できます。
          </div>
        </div>

        {/* Prompt content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          <div className="relative">
            <pre className="text-xs leading-relaxed text-stone-800 font-mono bg-white p-4 rounded-md border border-stone-300/80 overflow-x-auto whitespace-pre-wrap select-all">
              {KANBUN_SYSTEM_PROMPT}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-stone-200 bg-stone-100/70">
          <div className="text-xs text-stone-500 flex items-center gap-1 font-sans">
            <FileText className="w-3.5 h-3.5" />
            <span>スキーマバージョン: 1.0 準拠</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-stone-600 hover:text-stone-800 hover:bg-stone-200/60 rounded border border-stone-300 transition-colors"
            >
              閉じる
            </button>
            <button
              type="button"
              onClick={handleCopy}
              className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium rounded transition-all shadow-xs ${
                copied
                  ? 'bg-emerald-700 text-white hover:bg-emerald-800'
                  : 'bg-stone-800 text-white hover:bg-stone-900'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>プロンプトをコピーしました！</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>プロンプトをコピー</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
