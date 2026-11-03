import { describe, it, expect } from 'vitest';
import { slaState, countdown, score, interval } from '../lib/ticket';
const now = Date.parse('2026-01-01T12:00:00Z');
describe('ticket logic', () => {
  it('detects SLA states', () => {
    expect(slaState('2026-01-01T11:00:00Z', 'New', now)).toBe('breached');
    expect(slaState('2026-01-01T12:30:00Z', 'New', now)).toBe('warning');
    expect(slaState('2026-01-01T20:00:00Z', 'New', now)).toBe('ok');
    expect(slaState('2026-01-01T11:00:00Z', 'Resolved', now)).toBe('met');
  });
  it('formats countdown', () => { expect(countdown('2026-01-01T14:30:00Z', now)).toBe('2h 30m'); });
  it('scores process', () => {
    const s = score({ created_at: '2026-01-01T12:00:00Z', sla_due: '', category: 'Access' }, [{ sender: 'agent', created_at: '2026-01-01T12:01:00Z' }, { sender: 'internal', created_at: '2026-01-01T12:02:00Z' }]);
    expect(s.response_secs).toBe(60); expect(s.process_followed).toBe(true);
  });
  it('scales arrival by difficulty', () => { expect(interval('hard')).toBeLessThan(interval('easy')); });
});
