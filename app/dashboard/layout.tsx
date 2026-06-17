import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import type { Database } from '@/types/index';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createServerComponentClient<Database>({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) redirect('/');

  const { data: subscription } = await supabase
    .from('subscriptions').select('status, plan').eq('user_id', session.user.id).single();

  const isPro = subscription?.status === 'active' && subscription?.plan === 'pro';

  const { data: folders } = await supabase
    .from('folders').select('*').eq('user_id', session.user.id).order('name');

  const { data: promptsWithTags } = await supabase
    .from('prompts').select('tags').eq('user_id', session.user.id);

  const allTags = Array.from(
    new Set((promptsWithTags ?? []).flatMap((p) => p.tags ?? []).filter(Boolean))
  ).sort();

  return (
    <div className="h-full flex bg-gray-50">
      <Sidebar folders={folders ?? []} tags={allTags} isPro={isPro} userEmail={session.user.email ?? ''} />
      <div className="flex-1 min-w-0 overflow-auto">{children}</div>
    </div>
  );
}
