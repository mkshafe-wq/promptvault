'use client';

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import type { Folder, Database } from '@/types/index';

interface SidebarProps { folders: Folder[]; tags: string[]; isPro: boolean; userEmail: string; }

export default function Sidebar({ folders, tags, isPro, userEmail }: SidebarProps) {
  const supabase = createClientComponentClient<Database>();
  const router = useRouter();
  const [upgrading, setUpgrading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [showFolderInput, setShowFolderInput] = useState(false);
  const [activeFolder, setActiveFolder] = useState<string | null>(null);
  const [activeTag, setActiveTag] = useState<string | null>(null);

  async function handleSignOut() { await supabase.auth.signOut(); router.push('/'); router.refresh(); }

  async function handleUpgrade() {
    setUpgrading(true);
    try {
      const res = await fetch('/api/stripe/checkout', { method: 'POST' });
      const { url, error } = await res.json();
      if (error) throw new Error(error);
      window.location.href = url;
    } catch (err) { console.error('Upgrade error:', err); setUpgrading(false); }
  }

  async function handleExport() {
    setExporting(true);
    try {
      const res = await fetch('/api/export');
      if (!res.ok) { const { error } = await res.json(); alert(error ?? 'Export failed'); return; }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `promptvault-export-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } finally { setExporting(false); }
  }

  async function handleCreateFolder(e: React.FormEvent) {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const { data } = await supabase.from('folders').insert({ name: newFolderName.trim(), user_id: session.user.id }).select().single();
    if (data) { setNewFolderName(''); setShowFolderInput(false); router.refresh(); }
  }

  function filterByFolder(id: string) {
    const next = activeFolder === id ? null : id;
    setActiveFolder(next); setActiveTag(null);
    const url = new URL(window.location.href);
    if (next) { url.searchParams.set('folder', next); url.searchParams.delete('tag'); } else { url.searchParams.delete('folder'); }
    window.history.pushState({}, '', url.toString());
    window.dispatchEvent(new Event('locationchange'));
    router.refresh();
  }

  function filterByTag(tag: string) {
    const next = activeTag === tag ? null : tag;
    setActiveTag(next); setActiveFolder(null);
    const url = new URL(window.location.href);
    if (next) { url.searchParams.set('tag', next); url.searchParams.delete('folder'); } else { url.searchParams.delete('tag'); }
    window.history.pushState({}, '', url.toString());
    window.dispatchEvent(new Event('locationchange'));
    router.refresh();
  }

  return (
    <aside className="w-60 flex-shrink-0 bg-white border-r border-gray-100 flex flex-col h-full">
      <div className="px-5 py-5 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
          </div>
          <span className="font-semibold text-gray-900">PromptVault</span>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5 scrollbar-thin">
        <div>
          <button onClick={() => { setActiveFolder(null); setActiveTag(null); const url = new URL(window.location.href); url.searchParams.delete('folder'); url.searchParams.delete('tag'); window.history.pushState({}, '', url.toString()); router.refresh(); }} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors">
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            All Prompts
          </button>
        </div>
        <div>
          <div className="flex items-center justify-between px-3 mb-1">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Folders</span>
            {isPro && (<button onClick={() => setShowFolderInput(!showFolderInput)} className="p-0.5 text-gray-400 hover:text-gray-600 transition-colors" title="New folder"><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg></button>)}
          </div>
          {isPro && showFolderInput && (<form onSubmit={handleCreateFolder} className="px-3 mb-2"><input type="text" value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)} placeholder="Folder name…" autoFocus className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" onKeyDown={(e) => { if (e.key === 'Escape') setShowFolderInput(false); }} /></form>)}
          {folders.length === 0 && <p className="px-3 text-xs text-gray-400">{isPro ? 'No folders yet.' : 'Upgrade to use folders.'}</p>}
          {folders.map((folder) => (<button key={folder.id} onClick={() => filterByFolder(folder.id)} className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${activeFolder === folder.id ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}><svg className="w-4 h-4 flex-shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" /></svg><span className="truncate">{folder.name}</span></button>))}
        </div>
        {tags.length > 0 && (<div><div className="px-3 mb-1"><span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Tags</span></div>{tags.map((tag) => (<button key={tag} onClick={() => filterByTag(tag)} className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${activeTag === tag ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}><span className="text-gray-400 text-xs">#</span><span className="truncate">{tag}</span></button>))}</div>)}
      </nav>
      <div className="px-3 py-4 border-t border-gray-100 space-y-1">
        {isPro && (<button onClick={handleExport} disabled={exporting} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-60"><svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>{exporting ? 'Exporting…' : 'Export CSV'}</button>)}
        {!isPro && (<button onClick={handleUpgrade} disabled={upgrading} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-indigo-600 hover:bg-indigo-50 transition-colors disabled:opacity-60"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>{upgrading ? 'Redirecting…' : 'Upgrade to Pro'}</button>)}
        <div className="flex items-center gap-2 px-3 py-2">
          <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0"><span className="text-xs font-medium text-indigo-600">{userEmail.charAt(0).toUpperCase()}</span></div>
          <span className="text-xs text-gray-500 truncate flex-1">{userEmail}</span>
          <button onClick={handleSignOut} title="Sign out" className="text-gray-400 hover:text-gray-600 transition-colors"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg></button>
        </div>
      </div>
    </aside>
  );
}
