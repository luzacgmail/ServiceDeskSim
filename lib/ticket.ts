export const STATUSES = ['New', 'In Progress', 'Pending', 'Resolved'];
export const slaState = (due: string, status: string, now = Date.now()) => { if (status === 'Resolved') return 'met'; const ms = new Date(due).getTime() - now; return ms < 0 ? 'breached' : ms < 3600000 ? 'warning' : 'ok'; };
export const countdown = (due: string, now = Date.now()) => { const s = Math.floor((new Date(due).getTime() - now) / 1000), a = Math.abs(s); return `${s < 0 ? '-' : ''}${Math.floor(a / 3600)}h ${Math.floor((a % 3600) / 60)}m`; };
export const interval = (d: string) => (d === 'easy' ? 240000 : d === 'hard' ? 60000 : 120000);
export function score(t: { created_at: string; sla_due: string; category?: string }, msgs: { sender: string; created_at: string }[]) {
  const first = msgs.find(m => m.sender === 'agent');
  const secs = first ? Math.max(0, Math.round((new Date(first.created_at).getTime() - new Date(t.created_at).getTime()) / 1000)) : null;
  const agent = msgs.filter(m => m.sender === 'agent').length, note = msgs.some(m => m.sender === 'internal');
  return { response_secs: secs, category_correct: !!t.category, process_followed: agent > 0 && note, csat: Math.max(1, Math.min(5, 3 + (agent > 1 ? 1 : -1) + (note ? 1 : 0))) };
}
