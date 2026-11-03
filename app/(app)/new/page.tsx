'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { browser } from '@/lib/supabase';
const db = browser();
export default function New() {
  const [f, setF] = useState<any>({ subject: '', description: '', category: 'Access', priority: 'P3', persona: {} }), [busy, setBusy] = useState(false), [err, setErr] = useState(''), r = useRouter();
  const set = (k: string, v: string) => setF({ ...f, [k]: v });
  async function draft() { setBusy(true); const { data } = await db.auth.getSession(); const x = await fetch('/api/tickets/generate', { method: 'POST', headers: { authorization: `Bearer ${data.session!.access_token}` } }); if (x.ok) setF(await x.json()); else setErr('Could not generate a draft.'); setBusy(false); }
  async function save() { if (!f.subject.trim() || !f.description.trim()) return setErr('Subject and description are required.'); const { data: u } = await db.auth.getUser(); const { error } = await db.from('tickets').insert({ ...f, user_id: u.user!.id }); if (error) return setErr('Could not save the ticket.'); r.push('/queue'); }
  return <div className="p-4 max-w-xl space-y-3"><h1 className="text-lg font-semibold">New ticket</h1>
    <button onClick={draft} disabled={busy} className="border px-3 py-1 rounded disabled:opacity-50">{busy ? 'Drafting…' : 'Draft with Gemini'}</button>
    <input className="border w-full p-2 rounded" placeholder="Subject" value={f.subject} onChange={e => set('subject', e.target.value)} />
    <textarea className="border w-full p-2 rounded h-32" placeholder="Description" value={f.description} onChange={e => set('description', e.target.value)} />
    <div className="flex gap-2"><select className="border p-1 rounded" value={f.category} onChange={e => set('category', e.target.value)}>{['Access', 'Network', 'Hardware', 'Email', 'Software'].map(c => <option key={c}>{c}</option>)}</select>
      <select className="border p-1 rounded" value={f.priority} onChange={e => set('priority', e.target.value)}>{['P1', 'P2', 'P3', 'P4'].map(c => <option key={c}>{c}</option>)}</select></div>
    {f.persona?.name && <p className="text-sm text-slate-500">Requester: {f.persona.name}, {f.persona.role}, {f.persona.department}</p>}
    {err && <p className="text-red-600 text-sm" role="alert">{err}</p>}
    <div className="flex gap-2"><button onClick={save} className="bg-blue-700 text-white px-4 py-1 rounded">Accept and create</button><button onClick={() => setF({ subject: '', description: '', category: 'Access', priority: 'P3', persona: {} })} className="border px-4 py-1 rounded">Discard</button></div></div>;
}
