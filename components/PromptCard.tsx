'use client';

import { useState } from 'react';
import type { Prompt } from '@/types/index';

interface PromptCardProps {
  prompt: Prompt;
  folderName?: string;
  onEdit: () => void;
  onDelete: () => void;
}

export default function PromptCard({ prompt, folderName, onEdit, onDelete }: PromptCardProps) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const isLong = prompt.content.length > 280;
  const displayContent = !expanded && isLong ? prompt.content.slice(0, 280) + '…' : prompt.content;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(prompt.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = prompt.content;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  }

  const formattedDate = prompt.created_at ? new Date(prompt.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-5 hover:border-gray-200 transition-colors group">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">{prompt.title}</h3>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            {folderName && (<span className="inline-flex items-center gap-1 text-xs text-gray-400"><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" /></svg>{folderName}</span>)}
            {formattedDate && <span className="text-xs text-gray-400">{formattedDate}</span>}
          </div>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <button onClick={handleCopy} title="Copy to clipboard" className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
            {copied ? (<svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>) : (<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>)}
          </button>
          <button onClick={onEdit} title="Edit prompt" className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></button>
          <button onClick={onDelete} title="Delete prompt" className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
        </div>
      </div>
      <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap break-words">{displayContent}</p>
      {isLong && <button onClick={() => setExpanded(!expanded)} className="mt-2 text-xs text-indigo-600 hover:text-indigo-700 font-medium">{expanded ? 'Show less' : 'Show more'}</button>}
      {(prompt.tags ?? []).length > 0 && (<div className="flex flex-wrap gap-1.5 mt-3">{(prompt.tags ?? []).map((tag) => (<span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full">#{tag}</span>))}</div>)}
    </div>
  );
}
