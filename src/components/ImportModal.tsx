/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { X, Upload, FileCode, AlertTriangle, CheckCircle2, ArrowRight } from 'lucide-react';
import { validateAndParseKanbun } from '../utils/kanbunParser';
import { KanbunDocument } from '../types/kanbun';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (doc: KanbunDocument) => void;
}

export const ImportModal: React.FC<ImportModalProps> = ({
  isOpen,
  onClose,
  onImportSuccess,
}) => {
  const [jsonText, setJsonText] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [previewDoc, setPreviewDoc] = useState<KanbunDocument | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleValidate = (rawContent: string) => {
    setJsonText(rawContent);
    if (!rawContent.trim()) {
      setErrors([]);
      setWarnings([]);
      setPreviewDoc(null);
      return;
    }

    const result = validateAndParseKanbun(rawContent);
    if (result.valid && result.document) {
      setErrors([]);
      setWarnings(result.warnings);
      setPreviewDoc(result.document);
    } else {
      setErrors(result.errors);
      setWarnings(result.warnings);
      setPreviewDoc(null);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const content = event.target?.result as string;
      handleValidate(content);
    };
    reader.readAsText(file);
  };

  const handleConfirmImport = () => {
    if (previewDoc) {
      onImportSuccess(previewDoc);
      // Reset state
      setJsonText('');
      setErrors([]);
      setWarnings([]);
      setPreviewDoc(null);
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="import-modal-title"
    >
      <div className="bg-[#fcfaf7] border border-stone-300 rounded-lg max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-stone-200 bg-stone-100/70">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-100 text-blue-800 rounded-md">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h2 id="import-modal-title" className="text-base font-bold text-stone-900 font-serif">
                漢文教材 JSONインポート
              </h2>
              <p className="text-xs text-stone-600 font-sans">
                外部AIで生成したJSONファイルまたはテキストをインポートします
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* File Upload Button & Drag area */}
          <div className="flex items-center justify-between gap-3 p-3 bg-stone-50 border border-dashed border-stone-300 rounded-md">
            <div className="text-xs text-stone-600">
              <p className="font-medium text-stone-800">JSONファイルを選択</p>
              <p className="text-[11px] text-stone-500">.json 拡張子のファイルに対応</p>
            </div>
            <input
              type="file"
              accept=".json,application/json"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 text-xs font-medium text-stone-700 bg-white border border-stone-300 rounded hover:bg-stone-100 transition-colors shadow-2xs flex items-center gap-1.5"
            >
              <FileCode className="w-3.5 h-3.5 text-stone-500" />
              <span>ファイルを選択</span>
            </button>
          </div>

          {/* Text Area for pasting */}
          <div>
            <label htmlFor="json-paste-input" className="block text-xs font-semibold text-stone-700 mb-1">
              または JSON テキストを直接貼り付け：
            </label>
            <textarea
              id="json-paste-input"
              rows={8}
              value={jsonText}
              onChange={e => handleValidate(e.target.value)}
              placeholder='{\n  "schema_version": "1.0",\n  "title": "教材名",\n  "lead": "リード文",\n  "sections": [...]\n}'
              className="w-full text-xs font-mono p-3 bg-white border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-700/30 focus:border-amber-700 text-stone-800"
            />
          </div>

          {/* Errors display */}
          {errors.length > 0 && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-md text-rose-800 text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>インポート検証エラー（{errors.length}件）</span>
              </div>
              <ul className="list-disc pl-5 space-y-0.5 text-[11px]">
                {errors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Warnings display */}
          {warnings.length > 0 && (
            <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-md text-amber-800 text-xs space-y-0.5">
              <p className="font-semibold text-[11px]">注意情報：</p>
              <ul className="list-disc pl-5 text-[11px]">
                {warnings.map((warn, i) => (
                  <li key={i}>{warn}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Validation success preview */}
          {previewDoc && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-md text-emerald-900 text-xs space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>正常に検証されました！教材プレビュー</span>
              </div>
              <div className="bg-white/80 p-2.5 rounded border border-emerald-100 space-y-1 font-serif text-stone-800">
                <p className="font-bold text-sm text-stone-900">{previewDoc.title}</p>
                {previewDoc.lead && (
                  <p className="text-xs text-stone-600 line-clamp-2">
                    <span className="font-semibold">リード文: </span>
                    {previewDoc.lead}
                  </p>
                )}
                <div className="flex items-center gap-3 text-xs text-stone-600 pt-1 font-sans">
                  <span>意味区分数: <strong>{previewDoc.sections.length}</strong></span>
                  <span>スキーマ: <strong>{previewDoc.schema_version}</strong></span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-stone-200 bg-stone-100/70">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs text-stone-600 hover:text-stone-800 hover:bg-stone-200/60 rounded border border-stone-300 transition-colors"
          >
            キャンセル
          </button>
          <button
            type="button"
            onClick={handleConfirmImport}
            disabled={!previewDoc}
            className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium rounded transition-all shadow-xs ${
              previewDoc
                ? 'bg-amber-800 text-white hover:bg-amber-900 cursor-pointer'
                : 'bg-stone-300 text-stone-500 cursor-not-allowed'
            }`}
          >
            <span>教材を登録して音読を開始</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
