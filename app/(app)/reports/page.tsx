'use client';
import { useEffect, useState } from 'react';
import { browser } from '@/lib/supabase';
const db = browser();
export default function Reports() {
  const [r, setR] = useState<any[] | null>(null);
  useEffect(() => { db.from('feedback_reports').select('*, tickets(number,subject)').order('created_at', { ascending: false }).then(({ data }) => setR(data ?? [])); }, []);
  if (!r) return <p className="p-4">Loading…</p>;
  const avg = (k: string) => (r.length ? (r.reduce((s, x) => s + (x[k] ?? 0), 0) / r.length).toFixed(1) : '–'), pct = (k: string) => (r.length ? Math.round((r.filter(x => x[k]).length / r.length) * 100) + '%' : '–');
  return <div className="p-4 space-y-3"><h1 className="text-lg font-semibold">Reports</h1>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">{[['Avg response (s)', avg('response_secs')], ['Correct category', pct('category_correct')], ['Process followed', pct('process_followed')], ['Satisfaction (of 5)', avg('csat')]].map(([l, v]) => <div key={l} className="bg-white border rounded p-3"><div className="text-2xl">{v}</div><div className="text-sm text-slate-500">{l}</div></div>)}</div>
    {r.length === 0 ? <p className="text-slate-500">No reports yet. Resolve a ticket to get feedback.</p> : r.map(x => <div key={x.id} className="bg-white border rounded p-2 text-sm">{x.tickets?.number}: {x.tickets?.subject} · response {x.response_secs ?? '–'}s · satisfaction {x.csat}/5 · process {x.process_followed ? 'followed' : 'incomplete'}</div>)}</div>;
}
