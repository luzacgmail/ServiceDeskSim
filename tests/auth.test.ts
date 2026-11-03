import { describe, it, expect } from 'vitest';
import { validPin, validUser, emailFor } from '../lib/supabase';
describe('auth validation', () => {
  it('requires 6+ digit PINs', () => { expect(validPin('12345')).toBe(false); expect(validPin('123456')).toBe(true); expect(validPin('12a456')).toBe(false); });
  it('validates usernames', () => { expect(validUser('ab')).toBe(false); expect(validUser('agent_01')).toBe(true); expect(validUser('a b c')).toBe(false); });
  it('maps username to internal email', () => { expect(emailFor('Agent1')).toBe('agent1@users.simdesk.internal'); });
});
