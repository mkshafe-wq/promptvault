'use client';

import { useEffect, useRef, useState } from 'react';
import type { Prompt, Folder } from '@/types/index';

interface PromptModalProps {
  prompt: Prompt | null;
  folders: Folder[];
  isPro: boolean;
  onSave: (data: { title: string; content: string; tags: string[]; folder_id: string | null; }) => Promise<void>;
  onClose: () => void;
}

export default function PromptModal({ prompt, folders, isPro, onSave, onClose }: PromptModalProps) {
  const [title, setTitle] = useState(prompt?.title ?? '');
  const [content, setContent] = useState(prompt?.content ?? '');
  const [tagInput, setTagInput] = useState((prompt?.tags ?? []).join(', '));
  const [folderId, setFolderId] = useState<string>(prompt?.folder_id ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => { titleRef.current?.focus(); }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose(); }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) { setError('Title is required.'); return; }
    if (!content.trim()) { setError('Prompt content is required.'); return; }
    const tags = tagInput.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean);
    setSaving(true); setError('');
    try {
      await onSave({ title: title.trim(), content: content.trim(), tags, folder_id: folderId || null });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save prompt.');
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">{prompt ? 'Edit prompt' : 'New prompt'}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="px-6 py-5 space-y-4 overflow-y-auto flex-1">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Title</label>
              <input ref={titleRef} type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Code review helper" className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Prompt content</label>
              <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Paste or write your prompt here…" rows={8} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-y font-mono leading-relaxed" />
              <p className="mt-1 text-xs text-gray-400 text-right">{content.length.toLocaleString()} chars</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Tags{!isPro && <span className="ml-2 text-xs font-normal text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">Pro</span>}</label>
              <input type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)} placeholder="writing, coding, research (comma-separated)" disabled={!isPro} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed" />
            </div>
            {isPro && folders.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Folder</label>
                <select value={folderId} onChange={(e) => setFolderId(e.target.value)} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white">
                  <option value="">No folder</option>
                  {folders.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
                </select>
              </div>
            )}
            {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
          </div>
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3 bg-gray-50 rounded-b-2xl">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors">Cancel</button>
            <button type="submit" disabled={saving} className="px-5 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-60">{saving ? 'Saving…' : prompt ? 'Save changes' : 'Create prompt'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
