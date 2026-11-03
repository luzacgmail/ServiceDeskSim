'use client';
import { useEffect, useState } from 'react';
import { browser } from '@/lib/supabase';
const db = browser();
export default function Settings() {
  const [p, setP] = useState<any>(null), [saved, setSaved] = useState(false);
  useEffect(() => { db.auth.getUser().then(async ({ data }) => { const { data: x } = await db.from('profiles').select('*').eq('id', data.user!.id).maybeSingle(); setP(x); }); }, []);
  if (!p) return <p className="p-4">Loading…</p>;
  return <div className="p-4 max-w-sm space-y-3"><h1 className="text-lg font-semibold">Settings</h1><p>Username: <b>{p.username}</b></p>
    <label className="block text-sm">Simulation difficulty<select className="border rounded p-1 block mt-1" value={p.difficulty} onChange={async e => { setP({ ...p, difficulty: e.target.value }); await db.from('profiles').update({ difficulty: e.target.value }).eq('id', p.id); setSaved(true); }}>{['easy', 'normal', 'hard'].map(d => <option key={d}>{d}</option>)}</select></label>
    {saved && <p className="text-green-600 text-sm">Saved. Harder levels send tickets more often.</p>}</div>;
}
