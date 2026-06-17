import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'PromptVault — Save & Organize Your Best AI Prompts',
  description: 'PromptVault helps you save, organize, tag, and search your best AI prompts. Stop losing your best prompts — store them once, find them instantly.',
  openGraph: {
    title: 'PromptVault — Save & Organize Your Best AI Prompts',
    description: 'Stop losing your best prompts. PromptVault gives you a personal library for all your AI prompts with folders, tags, and full-text search.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full bg-gray-50 text-gray-900 antialiased`}>
        {children}
      </body>
    </html>
  );
}
