'use client';
import { useEffect, useState } from 'react';
import { browser } from '@/lib/supabase';
const db = browser();
export default function KB() {
  const [a, setA] = useState<any[]>([]), [q, setQ] = useState(''), [open, setOpen] = useState('');
  useEffect(() => { setQ(new URLSearchParams(location.search).get('q') ?? ''); db.from('knowledge_articles').select('*').then(({ data }) => setA(data ?? [])); }, []);
  const s = a.filter(x => (x.title + x.body).toLowerCase().includes(q.toLowerCase()));
  return <div className="p-4 max-w-2xl space-y-3"><h1 className="text-lg font-semibold">Knowledge base</h1><input className="border w-full p-2 rounded" placeholder="Search articles" value={q} onChange={e => setQ(e.target.value)} />
    {s.length === 0 && <p className="text-slate-500">No articles found. Try a different search.</p>}
    {s.map(x => <div key={x.id} className="bg-white border rounded p-3"><button className="font-medium" onClick={() => setOpen(open === x.id ? '' : x.id)}>{x.title}</button><span className="text-xs text-slate-500 ml-2">{x.category}</span>{open === x.id && <p className="text-sm mt-2">{x.body}</p>}</div>)}</div>;
}
