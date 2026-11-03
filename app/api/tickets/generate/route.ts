import { NextResponse } from 'next/server';
import { asUser } from '@/lib/supabase';
import { ai } from '@/lib/ai';

const POOL = [{ subject: 'Cannot log in to laptop', description: 'Password rejected since this morning.', category: 'Access', priority: 'P2', persona: { name: 'Dana Whitfield', role: 'Accountant', department: 'Finance', mood: 'stressed', tech: 'low' } }];

export async function POST(req: Request) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '') ?? '';
  const db = asUser(token);
  const { data: u } = await db.auth.getUser(token);
  if (!u.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const txt = await ai(
    'Generate one realistic IT helpdesk ticket as JSON: {subject,description,category,priority(P1-P4),persona:{name,role,department,mood,tech}}. Use fictional names only.',
    [{ role: 'user', parts: [{ text: 'New ticket' }] }],
    true
  );

  let draft = POOL[0];
  try {
    if (txt) draft = JSON.parse(txt);
  } catch {}

  return NextResponse.json(draft);
}