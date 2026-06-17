import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { Database } from '@/types/index';

export const dynamic = 'force-dynamic';

function escapeCsvField(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export async function GET() {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore });
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: subscription } = await supabase.from('subscriptions').select('status, plan').eq('user_id', session.user.id).single();
  const isPro = subscription?.status === 'active' && subscription?.plan === 'pro';
  if (!isPro) return NextResponse.json({ error: 'CSV export is a Pro feature. Please upgrade to download your prompts.' }, { status: 403 });

  const { data: prompts, error } = await supabase.from('prompts').select('*, folders(name)').eq('user_id', session.user.id).order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const headers = ['ID', 'Title', 'Content', 'Tags', 'Folder', 'Created At', 'Updated At'];
  const rows = (prompts ?? []).map((p) => {
    const folder = (p as { folders?: { name: string } | null }).folders;
    return [escapeCsvField(p.id), escapeCsvField(p.title), escapeCsvField(p.content), escapeCsvField((p.tags ?? []).join('; ')), escapeCsvField(folder?.name ?? ''), escapeCsvField(p.created_at ?? ''), escapeCsvField(p.updated_at ?? '')].join(',');
  });

  const csv = [headers.join(','), ...rows].join('\n');
  const filename = `promptvault-export-${new Date().toISOString().split('T')[0]}.csv`;
  return new NextResponse(csv, { status: 200, headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="${filename}"` } });
}
