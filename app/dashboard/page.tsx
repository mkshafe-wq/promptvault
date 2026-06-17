'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import PromptCard from '@/components/PromptCard';
import PromptModal from '@/components/PromptModal';
import UpgradeBanner from '@/components/UpgradeBanner';
import type { Prompt, Folder, Database } from '@/types/index';

const FREE_TIER_LIMIT = 10;

export default function DashboardPage() {
  const supabase = createClientComponentClient<Database>();
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [isPro, setIsPro] = useState(false);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [activeFolder, setActiveFolder] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);
  const [showUpgradeBanner, setShowUpgradeBanner] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const [promptsRes, foldersRes, subRes] = await Promise.all([
      supabase.from('prompts').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false }),
      supabase.from('folders').select('*').eq('user_id', session.user.id).order('name'),
      supabase.from('subscriptions').select('status, plan').eq('user_id', session.user.id).single(),
    ]);
    setPrompts(promptsRes.data ?? []);
    setFolders(foldersRes.data ?? []);
    setIsPro(subRes.data?.status === 'active' && subRes.data?.plan === 'pro');
    setLoading(false);
  }, [supabase]);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const folder = params.get('folder');
    const tag = params.get('tag');
    if (folder) setActiveFolder(folder);
    if (tag) setActiveTag(tag);
  }, []);

  const handleAddPrompt = () => {
    if (!isPro && prompts.length >= FREE_TIER_LIMIT) { setShowUpgradeBanner(true); return; }
    setEditingPrompt(null);
    setShowModal(true);
  };

  const handleEdit = (prompt: Prompt) => { setEditingPrompt(prompt); setShowModal(true); };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this prompt?')) return;
    await supabase.from('prompts').delete().eq('id', id);
    setPrompts((prev) => prev.filter((p) => p.id !== id));
  };

  const handleSave = async (data: { title: string; content: string; tags: string[]; folder_id: string | null; }) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    if (editingPrompt) {
      const { data: updated } = await supabase.from('prompts').update({ ...data, updated_at: new Date().toISOString() }).eq('id', editingPrompt.id).select().single();
      if (updated) setPrompts((prev) => prev.map((p) => (p.id === editingPrompt.id ? updated : p)));
    } else {
      const { data: created } = await supabase.from('prompts').insert({ ...data, user_id: session.user.id }).select().single();
      if (created) setPrompts((prev) => [created, ...prev]);
    }
    setShowModal(false);
    setEditingPrompt(null);
  };

  const filtered = prompts.filter((p) => {
    const searchLower = search.toLowerCase();
    const matchesSearch = !search || p.title.toLowerCase().includes(searchLower) || p.content.toLowerCase().includes(searchLower);
    const matchesTag = !activeTag || (p.tags ?? []).includes(activeTag);
    const matchesFolder = !activeFolder || p.folder_id === activeFolder;
    return matchesSearch && matchesTag && matchesFolder;
  });

  const allTags = Array.from(new Set(prompts.flatMap((p) => p.tags ?? []).filter(Boolean))).sort();
  const atLimit = !isPro && prompts.length >= FREE_TIER_LIMIT;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Prompts</h1>
          <p className="text-sm text-gray-500 mt-0.5">{prompts.length} prompt{prompts.length !== 1 ? 's' : ''}{!isPro && ` · ${FREE_TIER_LIMIT - prompts.length} free slots remaining`}</p>
        </div>
        <button onClick={handleAddPrompt} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Add prompt
        </button>
      </div>

      {(atLimit || showUpgradeBanner) && !isPro && <UpgradeBanner onDismiss={() => setShowUpgradeBanner(false)} />}

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" /></svg>
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search prompts…" className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white" />
        </div>
        {allTags.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={() => setActiveTag(null)} className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${!activeTag ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>All</button>
            {allTags.map((tag) => (<button key={tag} onClick={() => setActiveTag(tag === activeTag ? null : tag)} className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${activeTag === tag ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>#{tag}</button>))}
          </div>
        )}
      </div>

      {activeFolder && (
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm text-gray-500">Folder: <strong>{folders.find((f) => f.id === activeFolder)?.name ?? activeFolder}</strong></span>
          <button onClick={() => setActiveFolder(null)} className="text-xs text-gray-400 hover:text-gray-600">✕ Clear</button>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">{[1,2,3].map((i) => (<div key={i} className="h-28 bg-white rounded-xl border border-gray-100 animate-pulse" />))}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          {prompts.length === 0 ? (<><div className="text-4xl mb-3">✨</div><p className="font-medium text-gray-500">No prompts yet</p><p className="text-sm mt-1">Click "Add prompt" to save your first one.</p></>) : (<><div className="text-4xl mb-3">🔍</div><p className="font-medium text-gray-500">No results found</p><p className="text-sm mt-1">Try a different search or tag.</p></>)}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((prompt) => (<PromptCard key={prompt.id} prompt={prompt} folderName={folders.find((f) => f.id === prompt.folder_id)?.name} onEdit={() => handleEdit(prompt)} onDelete={() => handleDelete(prompt.id)} />))}
        </div>
      )}

      {showModal && <PromptModal prompt={editingPrompt} folders={folders} isPro={isPro} onSave={handleSave} onClose={() => { setShowModal(false); setEditingPrompt(null); }} />}
    </div>
  );
}
