import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { Database } from '@/types/index';

export const dynamic = 'force-dynamic';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore });
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { title, content, tags, folder_id } = body;
  if (!title || typeof title !== 'string' || title.trim().length === 0) return NextResponse.json({ error: 'Title is required' }, { status: 400 });
  if (!content || typeof content !== 'string' || content.trim().length === 0) return NextResponse.json({ error: 'Content is required' }, { status: 400 });

  const { data, error } = await supabase.from('prompts').update({ title: title.trim(), content: content.trim(), tags: Array.isArray(tags) ? tags : [], folder_id: folder_id ?? null, updated_at: new Date().toISOString() }).eq('id', params.id).eq('user_id', session.user.id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: 'Prompt not found' }, { status: 404 });
  return NextResponse.json({ prompt: data });
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore });
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { error } = await supabase.from('prompts').delete().eq('id', params.id).eq('user_id', session.user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
