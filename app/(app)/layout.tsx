'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { browser } from '@/lib/supabase';
import { emit } from '@/lib/events';
import Tutorial from '@/components/Tutorial';
const db = browser();
const NAV = [['Dashboard', '/dashboard'], ['Queue', '/queue'], ['New ticket', '/new'], ['Knowledge', '/knowledge'], ['Reports', '/reports'], ['Settings', '/settings']];
export default function Shell({ children }: { children: React.ReactNode }) {
  const [help, setHelp] = useState(false), [menu, setMenu] = useState(false), [ok, setOk] = useState(false), [q, setQ] = useState(''), r = useRouter(), path = usePathname();
  useEffect(() => { db.auth.getSession().then(({ data }) => (data.session ? setOk(true) : r.replace('/'))); }, [r]);
  useEffect(() => { if (path === '/queue') emit('nav_queue'); }, [path]);
  if (!ok) return <p className="p-6">Loading…</p>;
  return <div className="flex flex-col h-screen">
    <header className="h-12 bg-white border-b flex items-center gap-3 px-3">
      <form className="flex-1 max-w-md" onSubmit={e => { e.preventDefault(); r.push(`/knowledge?q=${encodeURIComponent(q)}`); }}><input className="border rounded w-full px-2 py-1" placeholder="Search knowledge base" value={q} onChange={e => setQ(e.target.value)} /></form>
      <button className="border rounded px-3 py-1" onClick={() => setHelp(true)}>Help</button>
      <div className="relative"><button className="border rounded px-3 py-1" onClick={() => setMenu(!menu)}>Account</button>
        {menu && <div className="absolute right-0 bg-white border rounded shadow mt-1 w-32"><button className="block w-full text-left p-2" onClick={async () => { await db.auth.signOut(); r.replace('/'); }}>Sign out</button></div>}</div>
    </header>
    <div className="flex flex-1 min-h-0">
      <nav className="w-44 bg-slate-800 text-white p-3 hidden md:block space-y-1">{NAV.map(([n, h]) => <Link key={h} href={h} data-tour={h === '/queue' ? 'nav-queue' : undefined} className={`block px-2 py-1 rounded ${path === h ? 'bg-slate-600' : 'hover:bg-slate-700'}`}>{n}</Link>)}</nav>
      <div className="flex-1 min-w-0 overflow-auto">{children}</div></div>
    <nav className="md:hidden flex bg-slate-800 text-white text-xs">{NAV.map(([n, h]) => <Link key={h} href={h} className="flex-1 p-2 text-center">{n}</Link>)}</nav>
    <Tutorial open={help} onClose={() => setHelp(false)} />
  </div>;
}
