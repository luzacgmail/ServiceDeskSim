'use client';
import { useEffect, useState, useCallback } from 'react';
import { browser } from '@/lib/supabase';
import { emit } from '@/lib/events';
import { slaState, countdown, interval, score, STATUSES } from '@/lib/ticket';
const db = browser();
const PC: Record<string, string> = { P1: 'bg-red-600', P2: 'bg-orange-500', P3: 'bg-yellow-600', P4: 'bg-slate-400' };
const SC: Record<string, string> = { breached: 'text-red-600 font-semibold', warning: 'text-orange-600', ok: 'text-slate-500', met: 'text-green-600' };
export default function Queue() {
  const [tickets, setT] = useState<any[]>([]), [sel, setSel] = useState<any>(null), [msgs, setM] = useState<any[]>([]), [act, setAct] = useState<any[]>([]), [me, setMe] = useState<string>('');
  const [q, setQ] = useState(''), [status, setS] = useState(''), [prio, setPr] = useState(''), [cat, setCat] = useState(''), [mine, setMine] = useState(false), [sort, setSort] = useState('new');
  const [text, setText] = useState(''), [note, setNote] = useState(''), [typing, setTyping] = useState(false), [loading, setL] = useState(true), [err, setErr] = useState(''), [now, setNow] = useState(Date.now()), [diff, setDiff] = useState('normal');
  const load = useCallback(async () => {
    if (Math.random() < 0.2) await new Promise(r => setTimeout(r, 1500));
    const { data: u } = await db.auth.getUser(); setMe(u.user?.id ?? '');
    const { data, error } = await db.from('tickets').select('*'); if (error) setErr('Could not load tickets. Refresh to retry.'); setT(data ?? []); setL(false);
  }, []);
  const token = async () => (await db.auth.getSession()).data.session!.access_token;
  const arrive = useCallback(async () => {
    const r = await fetch('/api/tickets/generate', { method: 'POST', headers: { authorization: `Bearer ${await token()}` } }); if (!r.ok) return;
    const d = await r.json(), { data: u } = await db.auth.getUser(); await db.from('tickets').insert({ ...d, user_id: u.user!.id }); load();
  }, [load]);
  useEffect(() => { load(); db.auth.getUser().then(async ({ data }) => { const { data: p } = await db.from('profiles').select('difficulty').eq('id', data.user!.id).maybeSingle(); if (p) setDiff(p.difficulty); }); }, [load]);
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 30000); return () => clearInterval(t); }, []);
  useEffect(() => { const t = setInterval(arrive, interval(diff)); return () => clearInterval(t); }, [arrive, diff]);
  async function open(t: any) {
    setSel(t); emit('ticket_opened', { ticket: t });
    const [m, a] = await Promise.all([db.from('ticket_messages').select('*').eq('ticket_id', t.id).order('created_at'), db.from('ticket_activity').select('*').eq('ticket_id', t.id).order('created_at', { ascending: false })]);
    setM(m.data ?? []); setAct(a.data ?? []);
  }
  async function send() {
    if (!text.trim()) return; const body = text; setText(''); setM(m => [...m, { id: Math.random(), sender: 'agent', body }]); setTyping(true);
    await fetch('/api/chat', { method: 'POST', headers: { authorization: `Bearer ${await token()}` }, body: JSON.stringify({ ticketId: sel.id, message: body }) });
    setTyping(false); emit('reply_sent', { ticket: sel }); open(sel);
  }
  async function addNote() { if (!note.trim()) return; await db.from('ticket_messages').insert({ ticket_id: sel.id, user_id: me, sender: 'internal', body: note }); setNote(''); open(sel); }
  async function setStatus(st: string) {
    await db.from('tickets').update({ status: st, assignee: me }).eq('id', sel.id);
    await db.from('ticket_activity').insert({ ticket_id: sel.id, user_id: me, action: `Status changed to ${st}` });
    const n = { ...sel, status: st, assignee: me }; setSel(n); emit('status_changed', { ticket: n });
    if (st === 'Resolved') await db.from('feedback_reports').insert({ user_id: me, ticket_id: sel.id, ...score(sel, msgs) });
    load(); open(n);
  }
  const cats = Array.from(new Set(tickets.map(t => t.category).filter(Boolean)));
  const shown = tickets.filter(t => (!status || t.status === status) && (!prio || t.priority === prio) && (!cat || t.category === cat) && (!mine || t.assignee === me) && (t.subject + t.number).toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => sort === 'sla' ? +new Date(a.sla_due) - +new Date(b.sla_due) : sort === 'prio' ? a.priority.localeCompare(b.priority) : +new Date(b.created_at) - +new Date(a.created_at));
  return <div className="flex h-full">
    <section className="w-full md:w-96 border-r bg-white overflow-auto shrink-0">
      <div className="p-3 space-y-2 border-b"><input className="border w-full p-2 rounded" placeholder="Search tickets" value={q} onChange={e => setQ(e.target.value)} />
        <div className="flex flex-wrap gap-1 text-sm">
          <select className="border rounded p-1" value={status} onChange={e => setS(e.target.value)}><option value="">Status</option>{STATUSES.map(s => <option key={s}>{s}</option>)}</select>
          <select className="border rounded p-1" value={prio} onChange={e => setPr(e.target.value)}><option value="">Priority</option>{['P1', 'P2', 'P3', 'P4'].map(s => <option key={s}>{s}</option>)}</select>
          <select className="border rounded p-1" value={cat} onChange={e => setCat(e.target.value)}><option value="">Category</option>{cats.map(s => <option key={s}>{s}</option>)}</select>
          <select className="border rounded p-1" value={sort} onChange={e => setSort(e.target.value)}><option value="new">Newest</option><option value="sla">SLA due</option><option value="prio">Priority</option></select>
          <label className="flex items-center gap-1"><input type="checkbox" checked={mine} onChange={e => setMine(e.target.checked)} />Assigned to me</label></div></div>
      {err && <p className="p-3 text-red-600" role="alert">{err}</p>}
      {loading ? <p className="p-3">Loading tickets…</p> : shown.length === 0 ? <p className="p-3 text-slate-500">No tickets match. New tickets arrive on their own, or create one from New ticket.</p> :
        shown.map(t => <button key={t.id} data-tour="ticket" onClick={() => open(t)} className={`block w-full text-left p-3 border-b hover:bg-slate-50 ${sel?.id === t.id ? 'bg-blue-50' : ''}`}>
          <div className="flex justify-between text-xs"><span>{t.number}</span><span className={`${PC[t.priority]} text-white px-1.5 rounded`}>{t.priority}</span></div>
          <div className="font-medium">{t.subject}</div>
          <div className={`text-xs ${SC[slaState(t.sla_due, t.status, now)]}`}>{t.status} · SLA {slaState(t.sla_due, t.status, now) === 'breached' ? 'breached ' : ''}{t.status === 'Resolved' ? 'met' : countdown(t.sla_due, now)}</div></button>)}
    </section>
    <main className="flex-1 p-4 overflow-auto">{!sel ? <p className="text-slate-500">Select a ticket to work on it.</p> : <div className="max-w-2xl space-y-3">
      <h2 className="text-lg font-semibold">{sel.number}: {sel.subject}</h2><p>{sel.description}</p>
      <p className="text-sm text-slate-500">Requester: {sel.persona?.name}, {sel.persona?.role}, {sel.persona?.department} · Category: {sel.category ?? 'None'} · Attachment: screenshot.png (simulated)</p>
      <select data-tour="status" className="border p-1 rounded" value={sel.status} onChange={e => setStatus(e.target.value)}>{STATUSES.map(s => <option key={s}>{s}</option>)}</select>
      <div className="space-y-2">{msgs.map(m => <div key={m.id} className={`p-2 rounded max-w-md ${m.sender === 'agent' ? 'bg-blue-100 ml-auto' : m.sender === 'internal' ? 'bg-yellow-50 border border-yellow-300 italic' : 'bg-white border'}`}>{m.sender === 'internal' && 'Internal note: '}{m.body}</div>)}{typing && <p className="text-sm text-slate-500">Customer is typing…</p>}</div>
      <div className="flex gap-2"><input data-tour="reply" className="border flex-1 p-2 rounded" value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} placeholder="Reply to customer" /><button onClick={send} className="bg-blue-700 text-white px-4 rounded">Send</button></div>
      <div className="flex gap-2"><input className="border flex-1 p-2 rounded" value={note} onChange={e => setNote(e.target.value)} placeholder="Add internal note" /><button onClick={addNote} className="border px-4 rounded">Add note</button></div>
      <div><h3 className="font-semibold text-sm">Activity</h3>{act.length === 0 ? <p className="text-xs text-slate-500">No activity yet.</p> : act.map(a => <p key={a.id} className="text-xs text-slate-600">{new Date(a.created_at).toLocaleString()} · {a.action}</p>)}</div></div>}</main></div>;
}
