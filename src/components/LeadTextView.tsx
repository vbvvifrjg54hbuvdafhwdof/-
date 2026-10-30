/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface LeadTextViewProps {
  lead?: string;
  visible: boolean;
  textSize?: number;
  gap?: number;
}

export const LeadTextView: React.FC<LeadTextViewProps> = ({
  lead,
  visible,
  textSize = 13,
  gap = 24,
}) => {
  if (!visible || !lead || !lead.trim()) {
    return null;
  }

  return (
    <div
      className="vertical-rl text-neutral-600 font-serif leading-[2.2] border-l border-neutral-300 pl-3 sm:pl-4 select-text shrink-0"
      style={{
        fontSize: `${textSize}px`,
        marginLeft: `${gap}px`,
        maxHeight: '100%',
      }}
    >
      <span className="font-bold text-neutral-800">〔前置き〕</span>
      <span className="whitespace-pre-wrap">{lead}</span>
    </div>
  );
};
