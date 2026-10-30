/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ResetConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  materialTitle: string;
  currentCount: number;
}

export const ResetConfirmModal: React.FC<ResetConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  materialTitle,
  currentCount,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reset-modal-title"
    >
      <div className="bg-[#fcfaf7] border border-stone-300 rounded-lg max-w-sm w-full p-5 shadow-2xl space-y-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-rose-100 text-rose-700 rounded-full shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 id="reset-modal-title" className="text-sm font-bold text-stone-900 font-serif">
              音読回数のリセット確認
            </h3>
            <p className="text-xs text-stone-600 mt-1 leading-relaxed">
              「<strong>{materialTitle}</strong>」の現在の音読記録（
              <span className="text-rose-700 font-bold">{currentCount}回</span>
              ）をゼロにリセットしますか？この操作は取り消せません。
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-200">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-xs text-stone-600 hover:text-stone-800 hover:bg-stone-100 rounded border border-stone-300 transition-colors"
          >
            キャンセル
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-3.5 py-1.5 text-xs font-medium text-white bg-rose-600 hover:bg-rose-700 rounded transition-colors shadow-2xs"
          >
            リセット実行
          </button>
        </div>
      </div>
    </div>
  );
};
