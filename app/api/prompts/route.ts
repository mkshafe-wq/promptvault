import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { Database } from '@/types/index';

export const dynamic = 'force-dynamic';
const FREE_TIER_LIMIT = 10;

export async function GET(request: Request) {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore });
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') ?? '';
  const tag = searchParams.get('tag') ?? '';
  const folderId = searchParams.get('folder_id') ?? '';

  let query = supabase.from('prompts').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false });
  if (folderId) query = query.eq('folder_id', folderId);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  let filtered = data ?? [];
  if (search) { const lower = search.toLowerCase(); filtered = filtered.filter((p) => p.title.toLowerCase().includes(lower) || p.content.toLowerCase().includes(lower)); }
  if (tag) filtered = filtered.filter((p) => (p.tags ?? []).includes(tag));

  return NextResponse.json({ prompts: filtered });
}

export async function POST(request: Request) {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore });
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: subscription } = await supabase.from('subscriptions').select('status, plan').eq('user_id', session.user.id).single();
  const isPro = subscription?.status === 'active' && subscription?.plan === 'pro';

  if (!isPro) {
    const { count } = await supabase.from('prompts').select('*', { count: 'exact', head: true }).eq('user_id', session.user.id);
    if ((count ?? 0) >= FREE_TIER_LIMIT) return NextResponse.json({ error: 'Free tier limit reached. Upgrade to Pro for unlimited prompts.' }, { status: 403 });
  }

  const body = await request.json();
  const { title, content, tags, folder_id } = body;
  if (!title || typeof title !== 'string' || title.trim().length === 0) return NextResponse.json({ error: 'Title is required' }, { status: 400 });
  if (!content || typeof content !== 'string' || content.trim().length === 0) return NextResponse.json({ error: 'Content is required' }, { status: 400 });

  const { data, error } = await supabase.from('prompts').insert({ user_id: session.user.id, title: title.trim(), content: content.trim(), tags: Array.isArray(tags) ? tags : [], folder_id: folder_id ?? null }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ prompt: data }, { status: 201 });
}
