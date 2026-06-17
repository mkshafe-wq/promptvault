'use client';

import { useState } from 'react';

interface UpgradeBannerProps { onDismiss?: () => void; }

export default function UpgradeBanner({ onDismiss }: UpgradeBannerProps) {
  const [loading, setLoading] = useState(false);

  async function handleUpgrade() {
    setLoading(true);
    try {
      const res = await fetch('/api/stripe/checkout', { method: 'POST' });
      const { url, error } = await res.json();
      if (error) throw new Error(error);
      window.location.href = url;
    } catch (err) { console.error('Upgrade error:', err); setLoading(false); }
  }

  return (
    <div className="relative mb-6 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-xl p-5">
      {onDismiss && (<button onClick={onDismiss} className="absolute top-3 right-3 p-1 text-gray-400 hover:text-gray-600 transition-colors"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>)}
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
          <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 mb-0.5">You've reached the free tier limit</h3>
          <p className="text-sm text-gray-600 mb-3">You have 10 prompts — the free tier maximum. Upgrade to Pro for <strong>unlimited prompts</strong>, folders, tags, and CSV export.</p>
          <div className="flex items-center gap-3 flex-wrap">
            <button onClick={handleUpgrade} disabled={loading} className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-60">{loading ? 'Redirecting to checkout…' : 'Upgrade to Pro — $12/mo'}</button>
            <ul className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
              {['Unlimited prompts', 'Folders & tags', 'CSV export'].map((item) => (<li key={item} className="flex items-center gap-1"><svg className="w-3 h-3 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>{item}</li>))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
