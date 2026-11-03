import { NextResponse } from 'next/server';
import { asUser } from '@/lib/supabase';
import { fallbackReply } from '@/lib/ai';
export async function POST(req: Request) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '') ?? '';
  const { ticketId, message } = await req.json();
  const db = asUser(token);
  const { data: u } = await db.auth.getUser(token);
  if (!u.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { data: t } = await db.from('tickets').select('*').eq('id', ticketId).single();
  if (!t) return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
  await db.from('ticket_messages').insert({ ticket_id: ticketId, user_id: u.user.id, sender: 'agent', body: message });
  const { data: hist } = await db.from('ticket_messages').select('sender,body').eq('ticket_id', ticketId).neq('sender', 'internal').order('created_at');
  const system = `You play a customer contacting an IT service desk. Persona: ${JSON.stringify(t.persona)}. Issue: ${t.subject} - ${t.description}. Stay in character, keep replies under 60 words. Match the persona's mood and technical level. Never reveal the root cause or fix; only answer what the agent asks. Never write as the agent.`;
  const contents = (hist ?? []).map(m => ({ role: m.sender === 'agent' ? 'user' as const : 'model' as const, parts: [{ text: m.body }] }));
  const reply = (await groq(system, contents)) ?? fallbackReply();
  await new Promise(r => setTimeout(r, 1500 + Math.random() * 2500));
  await db.from('ticket_messages').insert({ ticket_id: ticketId, user_id: u.user.id, sender: 'customer', body: reply });
  await db.from('ticket_activity').insert({ ticket_id: ticketId, user_id: u.user.id, action: 'Agent replied' });
  return NextResponse.json({ reply });
}
