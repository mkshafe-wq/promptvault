'use client';

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function LandingPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const supabase = createClientComponentClient();

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${location.origin}/auth/callback` },
    });
    setLoading(false);
    if (error) { setError(error.message); } else { setSubmitted(true); }
  }

  return (
    <div className="min-h-full flex flex-col">
      <header className="border-b border-gray-100 bg-white">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <span className="font-semibold text-gray-900 text-lg">PromptVault</span>
          </div>
          <a href="#get-started" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">Get started free →</a>
        </div>
      </header>

      <main className="flex-1">
        <section className="max-w-5xl mx-auto px-6 pt-20 pb-16 text-center">
          <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 text-sm font-medium px-3 py-1.5 rounded-full mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
            Free to start — no credit card required
          </div>
          <h1 className="text-5xl font-bold text-gray-900 leading-tight mb-5">Stop losing your<br />best AI prompts</h1>
          <p className="text-xl text-gray-500 max-w-xl mx-auto mb-10">PromptVault is a personal library for your AI prompts. Save, organize with folders and tags, and find any prompt in seconds.</p>
          <div id="get-started" className="max-w-md mx-auto">
            {submitted ? (
              <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                <div className="text-2xl mb-2">📬</div>
                <p className="font-medium text-green-800">Check your inbox</p>
                <p className="text-sm text-green-600 mt-1">We sent a magic link to <strong>{email}</strong>. Click it to sign in — no password needed.</p>
              </div>
            ) : (
              <form onSubmit={handleSignUp} className="flex gap-2">
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="flex-1 px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                <button type="submit" disabled={loading} className="px-5 py-3 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-60 whitespace-nowrap">{loading ? 'Sending…' : 'Get started free'}</button>
              </form>
            )}
            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
            {!submitted && <p className="mt-3 text-xs text-gray-400">We'll email you a magic link. No password ever.</p>}
          </div>
        </section>

        <section className="max-w-5xl mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: '🗂️', title: 'Folders & Tags', desc: 'Organize prompts into folders by project or use case. Add tags for cross-cutting themes. Find anything instantly.' },
              { icon: '🔍', title: 'Full-text Search', desc: 'Search across titles and prompt content simultaneously. Never scroll through a wall of prompts again.' },
              { icon: '📤', title: 'CSV Export', desc: 'Download all your prompts as a CSV any time. Your data is always yours — no lock-in.' },
            ].map((f) => (
              <div key={f.title} className="bg-white rounded-xl border border-gray-100 p-6">
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="max-w-5xl mx-auto px-6 py-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-10">Simple pricing</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <div className="bg-white border border-gray-100 rounded-xl p-7">
              <p className="text-sm font-medium text-gray-500 mb-1">Free</p>
              <p className="text-3xl font-bold text-gray-900 mb-1">$0</p>
              <p className="text-sm text-gray-400 mb-6">Forever</p>
              <ul className="space-y-3 text-sm text-gray-600">
                {['Up to 10 prompts', 'Basic search', 'Magic link auth'].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-indigo-600 rounded-xl p-7 text-white">
              <p className="text-sm font-medium text-indigo-200 mb-1">Pro</p>
              <p className="text-3xl font-bold mb-1">$12<span className="text-lg font-normal text-indigo-200">/mo</span></p>
              <p className="text-sm text-indigo-300 mb-6">Everything in Free, plus:</p>
              <ul className="space-y-3 text-sm text-indigo-100">
                {['Unlimited prompts', 'Folders & tags', 'Full-text search', 'CSV export', 'Priority support'].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-indigo-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-gray-100 bg-white">
        <div className="max-w-5xl mx-auto px-6 py-6 flex items-center justify-between">
          <span className="text-sm text-gray-400">© 2024 PromptVault. All rights reserved.</span>
          <span className="text-sm text-gray-400">Built for AI power users.</span>
        </div>
      </footer>
    </div>
  );
}
