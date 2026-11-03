'use client';
import { useEffect, useState } from 'react';
import { browser } from '@/lib/supabase';
import { slaState } from '@/lib/ticket';
const db = browser();
export default function Dash() {
  const [t, setT] = useState<any[] | null>(null), [shift] = useState(() => (new Date().getHours() >= 8 && new Date().getHours() < 18 ? 'On shift' : 'Off shift'));
  useEffect(() => { db.from('tickets').select('status,sla_due,priority').then(({ data }) => setT(data ?? [])); }, []);
  if (!t) return <p className="p-4">Loading…</p>;
  const c = (s: string) => t.filter(x => x.status === s).length, br = t.filter(x => slaState(x.sla_due, x.status) === 'breached').length, risk = t.filter(x => slaState(x.sla_due, x.status) === 'warning').length;
  return <div className="p-4 space-y-4"><h1 className="text-lg font-semibold">Dashboard <span className="text-sm text-slate-500">({shift})</span></h1>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">{[['New', c('New')], ['In Progress', c('In Progress')], ['Pending', c('Pending')], ['Resolved', c('Resolved')]].map(([l, n]) => <div key={l as string} className="bg-white border rounded p-3"><div className="text-2xl">{n}</div><div className="text-sm text-slate-500">{l}</div></div>)}</div>
    <div className="bg-white border rounded p-3"><h2 className="font-semibold">Notifications</h2>{br + risk === 0 ? <p className="text-sm text-slate-500">All SLAs are healthy.</p> : <ul className="text-sm"><li className="text-red-600">{br} ticket(s) breached SLA</li><li className="text-orange-600">{risk} ticket(s) due within an hour</li></ul>}</div></div>;
}
