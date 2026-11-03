'use client';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { browser } from '@/lib/supabase';
const db = browser();
const STEPS = [
  { k: 'nav_queue', sel: '[data-tour=nav-queue]', text: 'Click the Queue menu.' },
  { k: 'ticket_opened', sel: '[data-tour=ticket]', text: 'Open a ticket from the list.' },
  { k: 'status_changed', sel: '[data-tour=status]', text: 'Change the status to In Progress.' },
  { k: 'reply_sent', sel: '[data-tour=reply]', text: 'Write a reply to the customer and send it.' },
];
export default function Tutorial({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [step, setStep] = useState(0), [paused, setPaused] = useState(false), [ctx, setCtx] = useState<any>(null), path = usePathname();
  const save = async (s: number) => { const { data } = await db.auth.getUser(); if (data.user) await db.from('tutorial_progress').upsert({ user_id: data.user.id, step: s, done: s >= STEPS.length }); };
  useEffect(() => { db.auth.getUser().then(async ({ data }) => { if (!data.user) return; const { data: p } = await db.from('tutorial_progress').select('step').eq('user_id', data.user.id).maybeSingle(); if (p) setStep(p.step); }); }, []);
  const advance = (s: number) => { setStep(s); save(s); };
  useEffect(() => { if (open && !paused && step === 0 && path === '/queue') advance(1); }, [open, paused, step, path]);
  useEffect(() => {
    const h = (e: any) => { if (e.detail.ticket) setCtx(e.detail.ticket); if (open && !paused && STEPS[step] && e.detail.type === STEPS[step].k) advance(step + 1); };
    window.addEventListener('sd', h); return () => window.removeEventListener('sd', h);
  }, [open, paused, step]);
  useEffect(() => {
    if (!open || paused || !STEPS[step]) return; const t = setInterval(() => { document.querySelectorAll('.tour-hl').forEach(n => n.classList.remove('tour-hl', 'ring-4', 'ring-amber-400'));
      document.querySelector(STEPS[step].sel)?.classList.add('tour-hl', 'ring-4', 'ring-amber-400'); }, 400);
    return () => { clearInterval(t); document.querySelectorAll('.tour-hl').forEach(n => n.classList.remove('tour-hl', 'ring-4', 'ring-amber-400')); };
  }, [open, paused, step]);
  if (!open) return null;
  const done = step >= STEPS.length;
  return <div className="fixed bottom-4 right-4 w-72 bg-white border shadow-lg rounded p-3 z-50 text-sm" role="dialog" aria-label="Tutorial">
    <div className="font-semibold mb-1">{done ? 'Tutorial complete' : `Step ${step + 1} of ${STEPS.length}`}</div>
    <p>{done ? 'You have covered the basics of the queue.' : STEPS[step].text}</p>
    {ctx && !done && <p className="text-xs text-slate-500 mt-1">Open ticket: {ctx.number} ({ctx.status})</p>}
    <div className="flex gap-2 mt-2">
      {!done && <button className="border px-2 rounded" onClick={() => setPaused(!paused)}>{paused ? 'Resume' : 'Pause'}</button>}
      <button className="border px-2 rounded" onClick={() => { advance(path === '/queue' ? 1 : 0); setPaused(false); }}>Restart</button>
      <button className="border px-2 rounded" onClick={onClose}>{done ? 'Close' : 'Skip'}</button></div></div>;
}
