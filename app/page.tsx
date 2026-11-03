'use client';
import { useState } from 'react';
import { browser } from '@/lib/supabase';
export default function Login() {
  const [mode, setMode] = useState('login'), [username, setU] = useState(''), [pin, setP] = useState(''), [err, setErr] = useState(''), [busy, setBusy] = useState(false);
  async function go(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setErr('');
    const r = await fetch('/api/auth', { method: 'POST', body: JSON.stringify({ mode, username, pin }) }); const j = await r.json();
    if (!r.ok) { setErr(j.error); setBusy(false); return; }
    await browser().auth.setSession(j); location.href = '/queue';
  }
  return <main className="min-h-screen grid place-items-center"><form onSubmit={go} className="bg-white w-80 p-6 rounded shadow space-y-3">
    <h1 className="text-xl font-semibold">ServiceHub Desk</h1>
    <input className="border w-full p-2 rounded" placeholder="Username" value={username} onChange={e => setU(e.target.value)} />
    <input className="border w-full p-2 rounded" placeholder="PIN (6+ digits)" type="password" inputMode="numeric" value={pin} onChange={e => setP(e.target.value)} />
    {err && <p className="text-red-600 text-sm" role="alert">{err}</p>}
    <button disabled={busy} className="bg-blue-700 text-white w-full p-2 rounded disabled:opacity-50">{mode === 'login' ? 'Sign in' : 'Create account'}</button>
    <button type="button" className="text-sm text-blue-700" onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}>{mode === 'login' ? 'Create an account' : 'Back to sign in'}</button>
  </form></main>;
}
