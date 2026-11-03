import { NextResponse } from 'next/server';
import { admin, browser, emailFor, validPin, validUser } from '@/lib/supabase';
export async function POST(req: Request) {
  const { mode, username, pin } = await req.json();
  if (!validUser(username ?? '') || !validPin(pin ?? '')) return NextResponse.json({ error: 'Username: 3-24 chars. PIN: 6+ digits.' }, { status: 400 });
  const db = admin(), name = username.toLowerCase();
  if (mode === 'signup') {
    const { data: ex } = await db.from('profiles').select('id').eq('username', name).maybeSingle();
    if (ex) return NextResponse.json({ error: 'Username already taken.' }, { status: 409 });
    const { data, error } = await db.auth.admin.createUser({ email: emailFor(name), password: pin, email_confirm: true });
    if (error || !data.user) return NextResponse.json({ error: 'Could not create account.' }, { status: 400 });
    await db.from('profiles').insert({ id: data.user.id, username: name });
  }
  const { data: a } = await db.from('login_attempts').select('*').eq('username', name).maybeSingle();
  if (a?.locked_until && new Date(a.locked_until) > new Date()) return NextResponse.json({ error: 'Too many attempts. Try again in a few minutes.' }, { status: 429 });
  const { data, error } = await browser().auth.signInWithPassword({ email: emailFor(name), password: pin });
  if (error || !data.session) {
    const f = (a?.failures ?? 0) + 1;
    await db.from('login_attempts').upsert({ username: name, failures: f >= 5 ? 0 : f, locked_until: f >= 5 ? new Date(Date.now() + 5 * 60000).toISOString() : null });
    return NextResponse.json({ error: 'Invalid username or PIN.' }, { status: 401 });
  }
  await db.from('login_attempts').delete().eq('username', name);
  return NextResponse.json({ access_token: data.session.access_token, refresh_token: data.session.refresh_token });
}
